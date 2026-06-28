"""SQLAlchemy 2.0 async implementation of IApplicantRepository."""

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.domain.entities.applicant import Applicant
from app.domain.repositories.i_applicant_repository import IApplicantRepository
from app.infrastructure.database.models.applicant_model import ApplicantModel
from app.infrastructure.database.models.user_model import UserModel


class SQLAApplicantRepository(IApplicantRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, id: UUID) -> Applicant | None:
        result = await self._session.execute(
            select(ApplicantModel)
            .options(joinedload(ApplicantModel.user))
            .where(ApplicantModel.id == id)
        )
        model = result.unique().scalars().first()
        return self._to_domain(model) if model else None

    async def find_by_clerk_user_id(self, clerk_user_id: str) -> Applicant | None:
        result = await self._session.execute(
            select(ApplicantModel)
            .join(UserModel, ApplicantModel.user_id == UserModel.id)
            .options(joinedload(ApplicantModel.user))
            .where(UserModel.clerk_id == clerk_user_id)
        )
        model = result.unique().scalars().first()
        return self._to_domain(model) if model else None

    async def find_by_email(self, email: str) -> Applicant | None:
        result = await self._session.execute(
            select(ApplicantModel)
            .join(UserModel, ApplicantModel.user_id == UserModel.id)
            .options(joinedload(ApplicantModel.user))
            .where(UserModel.email == email)
        )
        model = result.unique().scalars().first()
        return self._to_domain(model) if model else None

    async def save(self, applicant: Applicant) -> Applicant:
        model = await self._to_model(applicant)
        merged = await self._session.merge(model)
        await self._session.flush()
        await self._session.refresh(merged)
        return self._to_domain(merged)

    @staticmethod
    def _to_domain(model: ApplicantModel | None) -> Applicant | None:
        if model is None:
            return None
        user = model.user
        full_name = f"{user.first_name} {user.last_name}" if user else ""
        return Applicant(
            id=model.id,
            clerk_user_id=user.clerk_id if user else "",
            full_name=full_name,
            email=user.email if user else "",
            created_at=model.created_at,
        )

    async def _to_model(self, entity: Applicant) -> ApplicantModel:
        # Resolve user_id from clerk_user_id
        result = await self._session.execute(
            select(UserModel).where(UserModel.clerk_id == entity.clerk_user_id)
        )
        user = result.scalars().first()
        if user is None:
            raise ValueError(f"User with clerk_id {entity.clerk_user_id} not found")
        return ApplicantModel(
            id=entity.id,
            user_id=user.id,
            created_at=entity.created_at,
        )
