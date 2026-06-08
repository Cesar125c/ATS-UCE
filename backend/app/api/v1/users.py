"""User management endpoints — role assignment after Clerk signup."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.application.dtos.user_dtos import SetRoleRequest, SetRoleResponse
from app.domain.entities.applicant import Applicant
from app.infrastructure.adapters.clerk_auth_adapter import ClerkAuthAdapter
from app.infrastructure.database.session import get_db_session
from app.infrastructure.repositories.sqla_applicant_repository import \
    SQLAApplicantRepository
from config import get_settings

router = APIRouter()


@router.post("/set-role", response_model=SetRoleResponse)
async def set_user_role(
    body: SetRoleRequest,
    session: AsyncSession = Depends(get_db_session),
) -> SetRoleResponse:
    """Assign a role to a Clerk user via publicMetadata.

    If the role is 'applicant', also creates a local Applicant record.
    Called by the frontend immediately after Clerk signup.
    No JWT required — this endpoint is public.
    Allowed roles: applicant | hr_staff | authority
    """
    settings = get_settings()
    if not settings.clerk_secret_key:
        raise HTTPException(
            status_code=501,
            detail="Clerk not configured — set CLERK_SECRET_KEY in .env",
        )
    adapter = ClerkAuthAdapter(settings)
    adapter.set_user_role(body.clerk_user_id, body.role)

    applicant = None
    if body.role == "applicant":
        user_info = adapter.get_user(body.clerk_user_id)
        repo = SQLAApplicantRepository(session)
        existing = await repo.find_by_clerk_user_id(body.clerk_user_id)
        if existing:
            applicant = existing
        else:
            full_name = f"{user_info['first_name']} {user_info['last_name']}".strip()
            new_applicant = Applicant(
                clerk_user_id=body.clerk_user_id,
                full_name=full_name or "Unknown",
                email=user_info["email"],
            )
            applicant = await repo.save(new_applicant)

    return SetRoleResponse(
        success=True,
        clerk_user_id=body.clerk_user_id,
        role=body.role,
        applicant_id=str(applicant.id) if applicant else None,
    )
