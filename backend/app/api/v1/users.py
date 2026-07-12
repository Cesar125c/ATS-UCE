"""User management endpoints - profile retrieval and role assignment."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.application.dtos.user_dtos import UserResponse
from app.infrastructure.adapters.clerk_auth_adapter import ClerkAuthAdapter
from app.infrastructure.database.models.applicant_model import ApplicantModel
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.session import get_db_session
from config import get_settings

logger = logging.getLogger(__name__)
router = APIRouter()

VALID_ROLES = {"applicant", "human_resources", "authorities"}


class SetRoleRequest(BaseModel):
    clerkUserId: str
    role: str
    email: str = ""
    firstName: str = Field("", max_length=100)
    lastName: str = Field("", max_length=100)

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(f"Invalid role '{v}'. Must be one of: {sorted(VALID_ROLES)}")
        return v


class SyncRoleRequest(BaseModel):
    clerkUserId: str


async def _set_clerk_role_or_fail(clerk_user_id: str, role: str) -> None:
    settings = get_settings()
    adapter = ClerkAuthAdapter(settings)
    try:
        await adapter.set_user_role(clerk_user_id, role)
    except Exception as exc:
        logger.warning("Failed to set Clerk publicMetadata role: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="Failed to set role in Clerk metadata.",
        ) from exc


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Returns the authenticated user's profile from the database."""
    result = await session.execute(
        select(UserModel).where(UserModel.clerk_id == current_user["user_id"])
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse.model_validate(user)


@router.post("/set-role")
async def set_user_role(
    request: SetRoleRequest,
    session: AsyncSession = Depends(get_db_session),
):
    """Assign or repair a user's role in Clerk public metadata and local DB."""
    existing = await session.execute(
        select(UserModel).where(UserModel.clerk_id == request.clerkUserId)
    )
    existing_user = existing.scalar_one_or_none()
    if existing_user is not None:
        await _set_clerk_role_or_fail(request.clerkUserId, existing_user.role)
        return {
            "success": True,
            "message": "User already registered; Clerk role metadata repaired",
            "user_id": str(existing_user.id),
            "role": existing_user.role,
        }

    if request.email:
        existing_email = await session.execute(
            select(UserModel).where(UserModel.email == request.email)
        )
        existing_email_user = existing_email.scalar_one_or_none()
        if existing_email_user is not None:
            await _set_clerk_role_or_fail(existing_email_user.clerk_id, existing_email_user.role)
            return {
                "success": True,
                "message": "Email already registered; Clerk role metadata repaired",
                "user_id": str(existing_email_user.id),
                "role": existing_email_user.role,
            }

    await _set_clerk_role_or_fail(request.clerkUserId, request.role)

    user = UserModel(
        clerk_id=request.clerkUserId,
        email=request.email or "unknown@email.com",
        first_name=request.firstName or "Unknown",
        last_name=request.lastName or "Unknown",
        role=request.role,
    )
    session.add(user)
    await session.flush()

    if request.role == "applicant":
        applicant = ApplicantModel(user_id=user.id)
        session.add(applicant)
        await session.flush()

    logger.info("User registered: %s (role=%s)", user.id, request.role)

    return {
        "success": True,
        "message": "User registered successfully",
        "user_id": str(user.id),
        "role": request.role,
    }


@router.post("/sync-role")
async def sync_user_role(
    request: SyncRoleRequest,
    session: AsyncSession = Depends(get_db_session),
):
    """Sync the user's local DB role to Clerk public metadata."""
    logger.info("sync-role: looking up user by Clerk id")

    result = await session.execute(
        select(UserModel).where(UserModel.clerk_id == request.clerkUserId)
    )
    user = result.scalar_one_or_none()
    if user is None:
        logger.warning("sync-role: user NOT found for Clerk id")
        raise HTTPException(status_code=404, detail="User not found in local database.")

    logger.info("sync-role: found user id=%s role=%s", user.id, user.role)
    await _set_clerk_role_or_fail(request.clerkUserId, user.role)

    logger.info("Role synced for user %s: %s", user.id, user.role)

    return {
        "success": True,
        "role": user.role,
    }