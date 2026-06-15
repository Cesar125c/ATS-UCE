"""User management endpoints — profile retrieval and role assignment."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.application.dtos.user_dtos import UserResponse
from app.infrastructure.adapters.clerk_auth_adapter import ClerkAuthAdapter
from app.infrastructure.database.models.applicant_model import ApplicantModel
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.session import get_db_session
from config import get_settings

logger = logging.getLogger("ats_uce")
router = APIRouter()


class SetRoleRequest(BaseModel):
    clerkUserId: str
    role: str
    email: str = ""
    firstName: str = ""
    lastName: str = ""


class SyncRoleRequest(BaseModel):
    clerkUserId: str


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
    """Assign a role to a user during OAuth or email/password registration.
    Validates the role, sets Clerk publicMetadata, and persists to the database.
    Returns 409 if the user is already registered.
    """
    allowed_roles = ["applicant", "human_resources", "authorities"]
    if request.role not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role. Must be one of: {', '.join(allowed_roles)}",
        )

    existing = await session.execute(
        select(UserModel).where(UserModel.clerk_id == request.clerkUserId)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="User already registered.")

    if request.email:
        existing_email = await session.execute(
            select(UserModel).where(UserModel.email == request.email)
        )
        if existing_email.scalar_one_or_none() is not None:
            raise HTTPException(status_code=409, detail="Email already registered.")

    settings = get_settings()
    adapter = ClerkAuthAdapter(settings)
    try:
        await adapter.set_user_role(request.clerkUserId, request.role)
    except Exception as e:
        logger.warning("Failed to set Clerk publicMetadata role: %s", e)

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
    """Sync the user's role from the local database to Clerk publicMetadata.

    Called when the frontend detects that publicMetadata.role is missing
    after sign-in. Looks up the user in the local DB and writes the role
    to Clerk, healing the mismatch.
    """
    logger.info("sync-role: looking up clerkUserId=%s", request.clerkUserId)

    result = await session.execute(
        select(UserModel).where(UserModel.clerk_id == request.clerkUserId)
    )
    user = result.scalar_one_or_none()
    if user is None:
        logger.warning("sync-role: user NOT found for clerkUserId=%s", request.clerkUserId)
        raise HTTPException(status_code=404, detail="User not found in local database.")

    logger.info(
        "sync-role: found user id=%s role=%s clerk_id=%s", user.id, user.role, user.clerk_id
    )

    settings = get_settings()
    adapter = ClerkAuthAdapter(settings)
    try:
        await adapter.set_user_role(request.clerkUserId, user.role)
    except Exception as e:
        logger.warning("Failed to sync Clerk publicMetadata role: %s", e)
        raise HTTPException(status_code=502, detail="Failed to sync role with Clerk.")

    logger.info("Role synced for user %s: %s", user.id, user.role)

    return {
        "success": True,
        "role": user.role,
    }
