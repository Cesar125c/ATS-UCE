"""Dashboard endpoints — aggregate statistics for the HR operations panel."""

from fastapi import APIRouter, Depends, Query

from app.api.dependencies import get_application_repository, require_role
from app.application.dtos.dashboard_dtos import DashboardStatsResponse, MonthlyTrendDTO
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository

router = APIRouter()


@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    _user: dict = Depends(require_role(["human_resources"])),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> DashboardStatsResponse:
    """Return aggregate recruitment statistics for the HR dashboard.

    Path: /api/v1/dashboard/stats
    """
    return await repo.get_stats()


@router.get("/applications-trend", response_model=list[MonthlyTrendDTO])
async def get_applications_trend(
    months: int = Query(6, ge=1, le=24),
    _user: dict = Depends(require_role(["human_resources", "authorities"])),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> list[MonthlyTrendDTO]:
    """Return monthly application submission counts for the last N months.

    Path: /api/v1/dashboard/applications-trend
    """
    return await repo.get_monthly_trend(months)
