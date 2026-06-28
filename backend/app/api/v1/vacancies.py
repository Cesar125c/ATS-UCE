"""Vacancy endpoints — listing and creation for the administration panel."""

from fastapi import APIRouter, Depends

from app.api.dependencies import get_vacancy_repository, require_role
from app.application.dtos.vacancy_dtos import VacancyCreateRequest, VacancyResponse
from app.domain.entities.vacancy import Vacancy
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository

router = APIRouter()


def _to_response(v: Vacancy) -> dict:
    return {
        "id": str(v.id),
        "title": v.title,
        "faculty": v.faculty,
        "department": v.department,
        "is_active": v.is_active,
    }


@router.get("/")
async def list_vacancies(
    repo: SQLAVacancyRepository = Depends(get_vacancy_repository),
) -> list[dict]:
    """Return all active vacancies for the applicant dropdown."""
    vacancies = await repo.find_all_active()
    return [_to_response(v) for v in vacancies]


@router.post("/", status_code=201)
async def create_vacancy(
    body: VacancyCreateRequest,
    _user: dict = Depends(require_role(["human_resources", "authorities"])),
    repo: SQLAVacancyRepository = Depends(get_vacancy_repository),
) -> dict:
    """Create a new vacancy. Accessible by RRHH and Authorities."""
    vacancy = Vacancy(
        title=body.title,
        faculty=body.faculty,
        department=body.department,
        description=body.description,
        requirements=body.requirements,
    )
    saved = await repo.save(vacancy)
    return _to_response(saved)
