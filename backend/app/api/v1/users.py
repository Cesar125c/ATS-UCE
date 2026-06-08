"""User management endpoints — role assignment after Clerk signup."""
from fastapi import APIRouter, HTTPException

from app.application.dtos.user_dtos import SetRoleRequest, SetRoleResponse
from app.infrastructure.adapters.clerk_auth_adapter import ClerkAuthAdapter
from config import get_settings

router = APIRouter()


@router.post("/set-role", response_model=SetRoleResponse)
async def set_user_role(body: SetRoleRequest) -> SetRoleResponse:
    """Assign a role to a Clerk user via publicMetadata.

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
    await adapter.set_user_role(body.clerk_user_id, body.role)
    return SetRoleResponse(
        success=True, clerk_user_id=body.clerk_user_id, role=body.role
    )
