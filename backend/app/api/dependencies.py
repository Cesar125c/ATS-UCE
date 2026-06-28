"""FastAPI dependency injection wiring. Maps interfaces to concrete implementations."""

import logging

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.infrastructure.adapters.clerk_auth_adapter import ClerkAuthAdapter

logger = logging.getLogger("ats_uce")

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.application.use_cases.record_authority_decision import RecordAuthorityDecisionUseCase
from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.domain.services.workflow_approval_service import WorkflowApprovalService
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIAnalysisAdapter
from app.infrastructure.database.session import get_db_session
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """
    Verifies the Clerk JWT and returns the user payload.
    In development (app_env == 'development'), returns a mock user if CLERK keys are not set.
    In production, validates the token against Clerk's JWKS endpoint.

    Returns: {"user_id": str, "role": str, "email": str}
    """
    from config import get_settings

    settings = get_settings()
    if settings.app_env == "development" and not settings.clerk_secret_key:
        # TODO: Remove before Sprint 2 — mock only for Week 1 Swagger testing
        return {"user_id": "dev_user_001", "role": "human_resources", "email": "dev@uce.edu.ec"}

    adapter = ClerkAuthAdapter(settings)
    try:
        return await adapter.verify_token(credentials.credentials)
    except Exception as e:
        logger.error("Clerk token verification failed: %s", e)
        raise HTTPException(status_code=401, detail="Invalid or expired token")


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


async def get_record_authority_decision_usecase(
    application_repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> RecordAuthorityDecisionUseCase:
    workflow_service = WorkflowApprovalService()
    return RecordAuthorityDecisionUseCase(application_repo, workflow_service)
