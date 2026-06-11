"""SQLAlchemy 2.0 async implementation of IVacancyRepository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.vacancy import Vacancy
from app.domain.repositories.i_vacancy_repository import IVacancyRepository
from app.infrastructure.database.models.vacancy_model import VacancyModel


class SQLAVacancyRepository(IVacancyRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, id: UUID) -> Vacancy | None:
        result = await self._session.execute(select(VacancyModel).where(VacancyModel.id == id))
        model = result.scalars().first()
        return self._to_domain(model) if model else None

    async def find_all_active(self) -> list[Vacancy]:
        result = await self._session.execute(
            select(VacancyModel).where(VacancyModel.is_active.is_(True))
        )
        models = result.scalars().all()
        return [self._to_domain(m) for m in models]

    async def save(self, vacancy: Vacancy) -> Vacancy:
        model = self._to_model(vacancy)
        merged = await self._session.merge(model)
        await self._session.flush()
        await self._session.refresh(merged)
        return self._to_domain(merged)

    @staticmethod
    def _to_domain(model: VacancyModel) -> Vacancy:
        return Vacancy(
            id=model.id,
            title=model.title,
            faculty=model.faculty,
            department=model.department,
            description=model.description,
            requirements=model.requirements,
            is_active=model.is_active,
            created_at=model.created_at,
        )

    @staticmethod
    def _to_model(entity: Vacancy) -> VacancyModel:
        return VacancyModel(
            id=entity.id,
            title=entity.title,
            faculty=entity.faculty,
            department=entity.department,
            description=entity.description,
            requirements=entity.requirements,
            is_active=entity.is_active,
            created_at=entity.created_at,
        )
