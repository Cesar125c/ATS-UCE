"""Applicant-facing endpoints — allows applicants to check their own application status."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_application_status_usecase, require_role
from app.application.use_cases.get_application_status import GetApplicationStatusUseCase

router = APIRouter()


@router.get("/me/status")
async def get_my_application_status(
    current_user: dict = Depends(require_role(["applicant"])),
    use_case: GetApplicationStatusUseCase = Depends(get_application_status_usecase),
):
    """Return all applications belonging to the authenticated applicant.

    Includes status_history for the stepper UI and vacancy details.
    Endpoint path: /api/v1/applicants/me/status
    """
    applications = await use_case.execute(clerk_user_id=current_user["user_id"])
    return {"applications": applications}
