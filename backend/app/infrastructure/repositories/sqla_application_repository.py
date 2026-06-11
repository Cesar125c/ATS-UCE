"""SQLAlchemy 2.0 async implementation of IApplicationRepository."""

from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domain.entities.application import Application
from app.domain.repositories.i_application_repository import IApplicationRepository
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.database.mappers.application_mapper import ApplicationMapper
from app.infrastructure.database.models.application_model import ApplicationModel


class SQLAApplicationRepository(IApplicationRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def find_by_id(self, id: UUID) -> Application | None:
        result = await self._session.execute(
            select(ApplicationModel).where(ApplicationModel.id == id)
        )
        model = result.scalars().first()
        return ApplicationMapper.to_domain(model) if model else None

    async def find_by_applicant_id(self, applicant_id: UUID) -> list[Application]:
        result = await self._session.execute(
            select(ApplicationModel).where(ApplicationModel.applicant_id == applicant_id)
        )
        models = result.scalars().all()
        return [ApplicationMapper.to_domain(m) for m in models]

    async def find_by_status(
        self, status: FlowStatus, page: int, page_size: int
    ) -> tuple[list[Application], int]:
        items_query = (
            select(ApplicationModel)
            .where(ApplicationModel.status == status.value)
            .order_by(ApplicationModel.score_total.desc().nullslast())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )
        count_query = (
            select(func.count())
            .select_from(ApplicationModel)
            .where(ApplicationModel.status == status.value)
        )

        items_result = await self._session.execute(items_query)
        count_result = await self._session.execute(count_query)

        models = items_result.scalars().all()
        total = count_result.scalar_one()

        return ([ApplicationMapper.to_domain(m) for m in models], total)

    async def count_by_status(self, status: FlowStatus) -> int:
        result = await self._session.execute(
            select(func.count())
            .select_from(ApplicationModel)
            .where(ApplicationModel.status == status.value)
        )
        return result.scalar_one()

    async def get_stats(self) -> dict:
        in_progress_statuses = [
            FlowStatus.PROCESSING_AI.value,
            FlowStatus.HR_STAGE.value,
            FlowStatus.DEAN_STAGE.value,
            FlowStatus.RECTOR_STAGE.value,
            FlowStatus.FINANCE_STAGE.value,
        ]

        result = await self._session.execute(
            select(
                func.count().label("total_applicants"),
                func.avg(ApplicationModel.score_total).label("avg_score"),
                func.sum(
                    case(
                        (ApplicationModel.status.in_(in_progress_statuses), 1),
                        else_=0,
                    )
                ).label("in_progress"),
                func.sum(
                    case(
                        (ApplicationModel.status == FlowStatus.HIRED.value, 1),
                        else_=0,
                    )
                ).label("completed"),
            ).select_from(ApplicationModel)
        )
        row = result.one()

        avg_score_raw = row.avg_score
        avg_score = round(float(avg_score_raw), 1) if avg_score_raw is not None else 0.0

        return {
            "total_applicants": row.total_applicants or 0,
            "avg_score": avg_score,
            "in_progress": row.in_progress or 0,
            "completed": row.completed or 0,
        }

    async def save(self, application: Application) -> Application:
        model = ApplicationMapper.to_model(application)
        merged = await self._session.merge(model)
        await self._session.flush()
        await self._session.refresh(merged)
        return ApplicationMapper.to_domain(merged)
