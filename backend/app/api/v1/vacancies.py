"""Public vacancy listing endpoint — no authentication required."""

from uuid import UUID

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.dependencies import get_vacancy_repository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository

router = APIRouter()


class VacancyResponse(BaseModel):
    id: UUID
    title: str
    faculty: str
    department: str
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("/", response_model=list[VacancyResponse])
async def list_vacancies(
    repo: SQLAVacancyRepository = Depends(get_vacancy_repository),
) -> list[VacancyResponse]:
    """Return all active vacancies for the applicant dropdown."""
    vacancies = await repo.find_all_active()
    return [VacancyResponse.model_validate(v) for v in vacancies]
