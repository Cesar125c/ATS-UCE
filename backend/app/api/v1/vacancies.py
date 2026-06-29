"""Vacancy endpoints — listing, creation, and management for the administration panel."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_vacancy_repository, get_db_session, require_role
from app.application.dtos.vacancy_dtos import VacancyCreateRequest
from app.domain.entities.vacancy import Vacancy
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository
from app.infrastructure.database.models.vacancy_model import VacancyModel
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

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


@router.delete("/{vacancy_id}")
async def delete_vacancy(
    vacancy_id: UUID,
    _user: dict = Depends(require_role(["human_resources"])),
    session: AsyncSession = Depends(get_db_session),
) -> dict:
    """Soft-delete a vacancy by setting is_active=False. Only RRHH can delete."""
    result = await session.execute(
        select(VacancyModel).where(VacancyModel.id == vacancy_id)
    )
    model = result.scalar_one_or_none()
    if model is None:
        raise HTTPException(status_code=404, detail="Vacancy not found")

    model.is_active = False
    await session.flush()
    return {"success": True, "message": "Vacancy deactivated"}
