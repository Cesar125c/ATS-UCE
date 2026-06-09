"""User management endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.application.dtos.user_dtos import UserResponse
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.session import get_db_session

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    session: AsyncSession = Depends(get_db_session),
):
    """Returns the authenticated user's profile from the database.
    Looks up by clerk_user_id from the JWT payload.
    Returns 404 if user exists in Clerk but not yet in our DB.
    """
    result = await session.execute(
        select(UserModel).where(UserModel.clerk_id == current_user["user_id"])
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found.")
    return UserResponse.model_validate(user)