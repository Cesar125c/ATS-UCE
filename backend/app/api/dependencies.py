"""FastAPI dependency injection wiring. Maps interfaces to concrete implementations."""

import logging

import jwt
from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.use_cases.get_application_status import GetApplicationStatusUseCase
from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.application.use_cases.record_authority_decision import RecordAuthorityDecisionUseCase
from app.application.use_cases.review_ranking import ReviewRankingUseCase
from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.domain.services.workflow_approval_service import WorkflowApprovalService
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.adapters.clerk_auth_adapter import ClerkAuthAdapter
from app.infrastructure.adapters.groq_analysis_adapter import GroqAnalysisAdapter
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.session import get_db_session
from app.infrastructure.realtime.socketio_notifier import SocketIONotifier
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository

logger = logging.getLogger("ats_uce")

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """
    Verifies the Clerk JWT and returns the user payload.
    Falls back to local DB lookup if the JWT does not contain a role claim
    (token was issued before set_user_role wrote publicMetadata to Clerk).

    Returns: {"user_id": str, "role": str, "email": str}
    """
    from config import get_settings

    settings = get_settings()
    if settings.app_env == "development" and not settings.clerk_secret_key:
        return {"user_id": "dev_user_001", "role": "human_resources", "email": "dev@uce.edu.ec"}

    adapter = ClerkAuthAdapter(settings)
    try:
        claims = await adapter.verify_token(credentials.credentials)
    except Exception as e:
        logger.error("Clerk token verification failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    # If the JWT doesn't have a role (token was issued before metadata sync),
    # look it up from the local database
    if not claims.get("role"):
        clerk_id = claims.get("user_id", "")
        if clerk_id:
            result = await session.execute(select(UserModel).where(UserModel.clerk_id == clerk_id))
            user = result.scalar_one_or_none()
            if user:
                claims["role"] = user.role
                claims["email"] = claims.get("email") or user.email
                logger.debug("Role resolved from local DB for %s: %s", clerk_id, user.role)
            else:
                # User authenticated with Clerk but doesn't exist in our DB yet.
                # Auto-create with role based on email domain.
                # Wrap in try/except to handle race condition where parallel
                # requests both try to auto-create the same user.
                email = claims.get("email", "") or f"{clerk_id}@unknown.uce.edu.ec"
                role = "human_resources" if email.endswith("@uce.edu.ec") else "applicant"
                try:
                    new_user = UserModel(
                        clerk_id=clerk_id,
                        email=email,
                        first_name="User",
                        last_name="",
                        role=role,
                    )
                    session.add(new_user)
                    await session.flush()
                    claims["role"] = role
                    claims["email"] = new_user.email
                    if role == "applicant":
                        from app.infrastructure.database.models.applicant_model import (
                            ApplicantModel,
                        )

                        applicant = ApplicantModel(user_id=new_user.id)
                        session.add(applicant)
                        await session.flush()
                    logger.info("Auto-created user %s as %s", clerk_id, role)
                except Exception:
                    await session.rollback()
                    result = await session.execute(
                        select(UserModel).where(UserModel.clerk_id == clerk_id)
                    )
                    user = result.scalar_one_or_none()
                    if user:
                        claims["role"] = user.role
                        claims["email"] = user.email
                        logger.debug("User %s already auto-created by concurrent request", clerk_id)
                    else:
                        raise

    # A valid Clerk token may already contain a role even when the local user
    # or applicant row is missing (for example after changing Clerk instances
    # or restoring the database). Ensure the local records exist before any
    # role-protected endpoint uses them.
    clerk_id = claims.get("user_id", "")
    if clerk_id:
        result = await session.execute(select(UserModel).where(UserModel.clerk_id == clerk_id))
        local_user = result.scalar_one_or_none()

        if local_user is None:
            email = claims.get("email", "") or f"{clerk_id}@unknown.uce.edu.ec"
            local_user = UserModel(
                clerk_id=clerk_id,
                email=email,
                first_name="User",
                last_name="",
                role=claims.get("role") or "applicant",
            )
            session.add(local_user)
            await session.flush()
            logger.info("Created missing local user for Clerk account %s", clerk_id)

        if claims.get("role") == "applicant":
            from app.infrastructure.database.models.applicant_model import ApplicantModel

            applicant_result = await session.execute(
                select(ApplicantModel).where(ApplicantModel.user_id == local_user.id)
            )
            if applicant_result.scalar_one_or_none() is None:
                session.add(ApplicantModel(user_id=local_user.id))
                await session.flush()
                logger.info("Created missing applicant profile for Clerk account %s", clerk_id)

    return claims


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


async def get_analysis_adapter() -> GroqAnalysisAdapter:
    return GroqAnalysisAdapter()


async def get_realtime_notifier() -> SocketIONotifier:
    return SocketIONotifier()


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
    analysis: GroqAnalysisAdapter = Depends(get_analysis_adapter),
    realtime_notifier: SocketIONotifier = Depends(get_realtime_notifier),
) -> ProcessAIScoreUseCase:
    return ProcessAIScoreUseCase(
        application_repo,
        vacancy_repo,
        analysis,
        realtime_notifier=realtime_notifier,
    )


async def get_record_authority_decision_usecase(
    application_repo: SQLAApplicationRepository = Depends(get_application_repository),
    realtime_notifier: SocketIONotifier = Depends(get_realtime_notifier),
) -> RecordAuthorityDecisionUseCase:
    workflow_service = WorkflowApprovalService()
    return RecordAuthorityDecisionUseCase(application_repo, workflow_service, realtime_notifier)


async def get_application_status_usecase(
    applicant_repo: SQLAApplicantRepository = Depends(get_applicant_repository),
    application_repo: SQLAApplicationRepository = Depends(get_application_repository),
    vacancy_repo: SQLAVacancyRepository = Depends(get_vacancy_repository),
) -> GetApplicationStatusUseCase:
    return GetApplicationStatusUseCase(applicant_repo, application_repo, vacancy_repo)


async def get_review_ranking_usecase(
    application_repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> ReviewRankingUseCase:
    return ReviewRankingUseCase(application_repo)


def rate_limit_key(request: Request) -> str:
    """Extract the Clerk user_id from the JWT for per-user rate limiting.
    Falls back to client IP if no valid token is present.
    """
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        token = auth_header[len("Bearer ") :]
        try:
            payload = jwt.decode(token, options={"verify_signature": False})
            user_id = payload.get("sub") or payload.get("user_id", "")
            if user_id:
                return f"user:{user_id}"
        except Exception:
            pass
    client_ip = request.client.host if request.client else "unknown"
    return f"ip:{client_ip}"
