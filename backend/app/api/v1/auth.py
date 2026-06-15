"""Authentication endpoints — registration flow."""

import logging

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.auth_dtos import RegisterRequest, RegisterResponse
from app.infrastructure.adapters.clerk_auth_adapter import ClerkAuthAdapter
from app.infrastructure.database.models.applicant_model import ApplicantModel
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.session import get_db_session
from config import get_settings

logger = logging.getLogger("ats_uce")
router = APIRouter()


@router.post("/register", response_model=RegisterResponse, status_code=201)
async def register(
    body: RegisterRequest,
    session: AsyncSession = Depends(get_db_session),
):
    """Complete registration flow:
    1. Validate role and email domain (Pydantic DTO handles this automatically)
    2. Check that clerk_user_id is not already registered (return 409 if duplicate)
    3. Call ClerkAuthAdapter.set_user_role() to write publicMetadata
    4. Save User to users table
    5. If role == "applicant": also save Applicant to applicants table
    6. Return RegisterResponse

    This endpoint has NO JWT auth — called right after Clerk signup
    before the user has a verified token.
    """
    # Check duplicate clerk_id
    existing = await session.execute(
        select(UserModel).where(UserModel.clerk_id == body.clerk_user_id)
    )
    if existing.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="User already registered.")

    # Check duplicate email
    existing_email = await session.execute(
        select(UserModel).where(UserModel.email == body.email)
    )
    if existing_email.scalar_one_or_none() is not None:
        raise HTTPException(status_code=409, detail="Email already registered.")

    # Write role to Clerk publicMetadata
    settings = get_settings()
    adapter = ClerkAuthAdapter(settings)
    try:
        await adapter.set_user_role(body.clerk_user_id, body.role)
    except Exception as e:
        logger.warning("Failed to set Clerk publicMetadata role: %s", e)

    # Save user to database
    user = UserModel(
        clerk_id=body.clerk_user_id,
        email=body.email,
        first_name=body.first_name,
        last_name=body.last_name,
        role=body.role,
    )
    session.add(user)
    await session.flush()

    # If applicant, create applicants row
    if body.role == "applicant":
        applicant = ApplicantModel(user_id=user.id)
        session.add(applicant)
        await session.flush()

    logger.info("User registered: %s (role=%s)", user.id, body.role)

    return RegisterResponse(
        success=True,
        message="User registered successfully",
        user_id=str(user.id),
        role=body.role,
    )