"""FastAPI dependency injection wiring. Maps interfaces to concrete implementations."""
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

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
        return {"user_id": "dev_user_001", "role": "hr_staff", "email": "dev@uce.edu.ec"}
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
