"""FastAPI dependency injection wiring. Maps interfaces to concrete implementations."""

import base64
import json
import logging

from fastapi import Depends, HTTPException
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


def _decode_jwt_payload(token: str) -> dict:
    """Decode (without verifying) a JWT payload to extract claims for dev mode."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return {}
        payload = parts[1]
        payload += "=" * (4 - len(payload) % 4)
        return json.loads(base64.urlsafe_b64decode(payload))
    except Exception:
        logger.debug("Failed to decode JWT payload", exc_info=True)
        return {}


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verifies the Clerk JWT and returns the user payload.
    In development (app_env == 'development'), decodes the JWT to extract the real
    Clerk user_id (without signature verification) so that DB lookups match.
    Falls back to a mock user when no real JWT is present.

    Returns: {"user_id": str, "role": str, "email": str}
    """
    from config import get_settings

    settings = get_settings()
    if settings.app_env == "development":
        claims = _decode_jwt_payload(credentials.credentials)
        user_id = claims.get("sub", "dev_user_001")
        email = claims.get("email", "dev@uce.edu.ec")
        return {"user_id": user_id, "role": "applicant", "email": email}
    # Sprint 2: implement real Clerk JWT verification here
    raise HTTPException(status_code=501, detail="Clerk JWT verification — Sprint 2")


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
