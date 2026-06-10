"""FastAPI dependency injection wiring. Maps interfaces to concrete implementations."""

import logging
from collections.abc import Mapping

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIAnalysisAdapter
from app.infrastructure.database.session import get_db_session
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository

logger = logging.getLogger("ats_uce")
security = HTTPBearer()


class _Requestish:
    """Minimal duck-typed object that satisfies Clerk's ``Requestish`` protocol."""

    def __init__(self, headers: Mapping[str, str]) -> None:
        self._headers = headers

    @property
    def headers(self) -> Mapping[str, str]:
        return self._headers


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Verify the Clerk JWT and return the authenticated user payload.

    Validates the token **with signature verification** via the Clerk SDK
    (``clerk_backend_api.Clerk.authenticate_request_async``) in **all**
    environments — development, QA and production.  The SDK fetches the JWKS
    from Clerk's Backend API on first call and caches it in-memory.

    Expected keys in the returned dict:
        ``user_id`` (str) — Clerk user ID (``sub`` claim, e.g. ``user_xxx``)
        ``role``    (str) — fallback ``applicant``; the authoritative role is
                            read from the database in ``GET /users/me``
        ``email``   (str) — user's email address

    Raises
        HTTPException 401 — invalid, expired or missing token
        HTTPException 500 — ``CLERK_SECRET_KEY`` not configured
    """
    from config import get_settings

    settings = get_settings()

    if not settings.clerk_secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Clerk secret key is not configured",
        )

    try:
        from clerk_backend_api import Clerk
        from clerk_backend_api.security.types import AuthenticateRequestOptions

        client = Clerk(bearer_auth=settings.clerk_secret_key)
        req = _Requestish(
            {"Authorization": f"Bearer {credentials.credentials}"}
        )
        opts = AuthenticateRequestOptions()
        result = await client.authenticate_request_async(req, opts)

        if not result.is_authenticated:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=result.message or "Authentication failed",
            )

        claims = result.payload or {}
        return {
            "user_id": claims.get("sub", "unknown"),
            "role": claims.get("role", "applicant"),
            "email": claims.get("email", ""),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.error("Clerk JWT verification failed: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )


def require_role(allowed_roles: list[str]):
    """Factory that returns a dependency enforcing role-based access control."""

    async def role_checker(current_user: dict = Depends(get_current_user)) -> dict:
        if current_user["role"] not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Role '{current_user['role']}' is not authorized for this endpoint.",
            )
        return current_user

    return role_checker


async def get_application_repository(
    session: AsyncSession = Depends(get_db_session),
) -> SQLAApplicationRepository:
    return SQLAApplicationRepository(session)


async def get_applicant_repository(
    session: AsyncSession = Depends(get_db_session),
) -> SQLAApplicantRepository:
    return SQLAApplicantRepository(session)


async def get_vacancy_repository(
    session: AsyncSession = Depends(get_db_session),
) -> SQLAVacancyRepository:
    return SQLAVacancyRepository(session)


async def get_storage_adapter() -> BackblazeStorageAdapter:
    return BackblazeStorageAdapter()


async def get_analysis_adapter() -> OpenAIAnalysisAdapter:
    return OpenAIAnalysisAdapter()


async def get_submit_application_usecase(
    application_repo: SQLAApplicationRepository = Depends(get_application_repository),
    applicant_repo: SQLAApplicantRepository = Depends(get_applicant_repository),
    vacancy_repo: SQLAVacancyRepository = Depends(get_vacancy_repository),
    storage: BackblazeStorageAdapter = Depends(get_storage_adapter),
) -> SubmitApplicationUseCase:
    return SubmitApplicationUseCase(application_repo, applicant_repo, vacancy_repo, storage)


async def get_process_ai_score_usecase(
    application_repo: SQLAApplicationRepository = Depends(get_application_repository),
    vacancy_repo: SQLAVacancyRepository = Depends(get_vacancy_repository),
    analysis: OpenAIAnalysisAdapter = Depends(get_analysis_adapter),
) -> ProcessAIScoreUseCase:
    return ProcessAIScoreUseCase(application_repo, vacancy_repo, analysis)
