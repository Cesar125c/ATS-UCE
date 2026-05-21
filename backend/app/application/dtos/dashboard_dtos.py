"""DTOs for the HR Dashboard statistics endpoint."""
from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    total_applicants: int
    avg_score: float
    in_progress: int
    completed: int
