"""Dashboard endpoints — aggregate statistics for the HR operations panel."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_application_repository, require_role
from app.application.dtos.dashboard_dtos import DashboardStatsResponse
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository

router = APIRouter()


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    _user: dict = Depends(require_role(["hr_staff"])),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> DashboardStatsResponse:
    """Return aggregate recruitment statistics for the HR dashboard.

    Path: /api/v1/dashboard/stats
    """
    return await repo.get_stats()
