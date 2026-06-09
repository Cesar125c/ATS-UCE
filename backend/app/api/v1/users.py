"""User management endpoints."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.application.dtos.user_dtos import UserResponse
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.session import get_db_session
from config import get_settings

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Returns the authenticated user's profile from the database.
    In dev mode, returns mock data if user not found in DB.
    """
    result = await session.execute(
        select(UserModel).where(UserModel.clerk_id == current_user["user_id"])
    )
    user = result.scalar_one_or_none()
    if user is None:
        settings = get_settings()
        if settings.app_env == "development":
            import uuid
            return UserResponse(
                id=uuid.uuid4(),
                email=current_user.get("email", "dev@uce.edu.ec"),
                first_name="Dev",
                last_name="User",
                role=current_user.get("role", "unknown"),
                is_active=True,
            )
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse.model_validate(user)