"""Applicant-facing endpoints — allows applicants to check their own application status."""
from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_application_repository, require_role
from app.application.dtos.application_dtos import ApplicationResponse
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository

router = APIRouter()


@router.get("/me/status", response_model=list[ApplicationResponse])
async def get_my_application_status(
    current_user: dict = Depends(require_role(["applicant"])),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> list[ApplicationResponse]:
    """Return all applications belonging to the authenticated applicant (Sprint 3).

    Includes status_history for the stepper UI.
    Endpoint path: /api/v1/applicants/me/status
    """
    raise HTTPException(status_code=501, detail="Not implemented — Sprint 3")
