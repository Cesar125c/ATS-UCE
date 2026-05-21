"""SQLAlchemy 2.0 async implementation of IApplicantRepository."""
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.applicant import Applicant
from app.domain.repositories.i_applicant_repository import IApplicantRepository
from app.infrastructure.database.models.applicant_model import ApplicantModel


class SQLAApplicantRepository(IApplicantRepository):

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, id: UUID) -> Applicant | None:
        result = await self._session.execute(
            select(ApplicantModel).where(ApplicantModel.id == id)
        )
        model = result.scalars().first()
        return self._to_domain(model) if model else None

    async def find_by_clerk_user_id(self, clerk_user_id: str) -> Applicant | None:
        result = await self._session.execute(
            select(ApplicantModel).where(ApplicantModel.clerk_user_id == clerk_user_id)
        )
        model = result.scalars().first()
        return self._to_domain(model) if model else None

    async def find_by_email(self, email: str) -> Applicant | None:
        result = await self._session.execute(
            select(ApplicantModel).where(ApplicantModel.email == email)
        )
        model = result.scalars().first()
        return self._to_domain(model) if model else None

    async def save(self, applicant: Applicant) -> Applicant:
        model = self._to_model(applicant)
        merged = await self._session.merge(model)
        await self._session.flush()
        await self._session.refresh(merged)
        return self._to_domain(merged)

    @staticmethod
    def _to_domain(model: ApplicantModel) -> Applicant:
        return Applicant(
            id=model.id,
            clerk_user_id=model.clerk_user_id,
            full_name=model.full_name,
            email=model.email,
            created_at=model.created_at,
        )

    @staticmethod
    def _to_model(entity: Applicant) -> ApplicantModel:
        return ApplicantModel(
            id=entity.id,
            clerk_user_id=entity.clerk_user_id,
            full_name=entity.full_name,
            email=entity.email,
            created_at=entity.created_at,
        )
