"""Pydantic v2 DTOs for Application use cases. These are the API contracts — not domain entities."""
from datetime import datetime

from pydantic import UUID4, BaseModel

from app.domain.value_objects.flow_status import FlowStatus


class AIScoreDTO(BaseModel):
    total: float
    academic_training: float
    experience: float
    publications: float
    profile_match: float
    languages_competencies: float
    evaluation_summary: str
    grade: str


class StatusHistoryDTO(BaseModel):
    status: FlowStatus
    transitioned_at: datetime


class ApplicationResponse(BaseModel):
    id: UUID4
    applicant_id: UUID4
    vacancy_id: UUID4
    status: FlowStatus
    ai_score: AIScoreDTO | None = None
    status_history: list[StatusHistoryDTO] = []
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class ApplicationListResponse(BaseModel):
    items: list[ApplicationResponse]
    total: int
    page: int
    page_size: int


class PendingCountResponse(BaseModel):
    count: int
