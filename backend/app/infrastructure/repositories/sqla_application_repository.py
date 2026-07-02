"""SQLAlchemy 2.0 async implementation of IApplicationRepository."""

from uuid import UUID

from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domain.entities.application import Application
from app.domain.entities.evaluation import Evaluation
from app.domain.entities.status_history import StatusHistory
from app.domain.repositories.i_application_repository import IApplicationRepository
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.database.mappers.application_mapper import ApplicationMapper
from app.infrastructure.database.mappers.evaluation_mapper import EvaluationMapper
from app.infrastructure.database.models.application_model import ApplicationModel
from app.infrastructure.database.models.status_history_model import StatusHistoryModel


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

    async def find_models_by_applicant_id(self, applicant_id: UUID) -> list[ApplicationModel]:
        """Returns ORM models with status_history eagerly loaded — for read-only DTO mapping."""
        result = await self._session.execute(
            select(ApplicationModel)
            .where(ApplicationModel.applicant_id == applicant_id)
            .options(selectinload(ApplicationModel.status_history))
            .order_by(ApplicationModel.created_at.desc())
        )
        return list(result.unique().scalars().all())

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

    async def find_models_by_status(
        self, status: FlowStatus | None, page: int, page_size: int
    ) -> tuple[list[ApplicationModel], int]:
        """Returns ORM models with eager-loaded relationships for read-only DTO mapping."""
        query = select(ApplicationModel).options(
            selectinload(ApplicationModel.status_history),
            selectinload(ApplicationModel.vacancy),
            selectinload(ApplicationModel.applicant),
        )

        count_query = select(func.count()).select_from(ApplicationModel)

        if status is not None:
            query = query.where(ApplicationModel.status == status.value)
            count_query = count_query.where(ApplicationModel.status == status.value)

        query = query.order_by(ApplicationModel.score_total.desc().nullslast())
        query = query.offset((page - 1) * page_size).limit(page_size)

        items_result = await self._session.execute(query)
        count_result = await self._session.execute(count_query)

        models = list(items_result.unique().scalars().all())
        total = count_result.scalar_one()

        return (models, total)

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

    async def create_status_history(self, entry: StatusHistory) -> None:
        model = StatusHistoryModel(
            id=entry.id,
            application_id=entry.application_id,
            status=entry.status.value,
            transitioned_at=entry.transitioned_at,
        )
        self._session.add(model)
        await self._session.flush()

    async def save_evaluation(self, evaluation: Evaluation) -> None:
        model = EvaluationMapper.to_model(evaluation)
        self._session.add(model)
        await self._session.flush()

    async def find_status_history_by_application_id(
        self, application_id: UUID
    ) -> list[StatusHistory]:
        from app.domain.entities.status_history import StatusHistory as DomainStatusHistory

        result = await self._session.execute(
            select(StatusHistoryModel)
            .where(StatusHistoryModel.application_id == application_id)
            .order_by(StatusHistoryModel.transitioned_at.asc())
        )
        models = result.scalars().all()
        return [
            DomainStatusHistory(
                id=m.id,
                application_id=m.application_id,
                status=FlowStatus(m.status),
                transitioned_at=m.transitioned_at,
            )
            for m in models
        ]

    async def find_models_with_joins(
        self,
        status: str | None = None,
        faculty: str | None = None,
        min_score: float | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> tuple[list[ApplicationModel], int]:
        """Returns ORM models with eager-loaded applicant+user+vacancy for the ranking table."""
        from app.infrastructure.database.models.applicant_model import ApplicantModel
        from app.infrastructure.database.models.vacancy_model import VacancyModel

        query = select(ApplicationModel).options(
            selectinload(ApplicationModel.status_history),
            selectinload(ApplicationModel.vacancy),
            selectinload(ApplicationModel.applicant).joinedload(ApplicantModel.user),
        )

        count_query = select(func.count()).select_from(ApplicationModel)

        if status is not None:
            query = query.where(ApplicationModel.status == status)
            count_query = count_query.where(ApplicationModel.status == status)

        if faculty is not None:
            query = query.join(ApplicationModel.vacancy).where(VacancyModel.faculty == faculty)
            count_query = count_query.join(VacancyModel).where(VacancyModel.faculty == faculty)

        if min_score is not None:
            query = query.where(ApplicationModel.score_total >= min_score)
            count_query = count_query.where(ApplicationModel.score_total >= min_score)

        query = query.order_by(ApplicationModel.score_total.desc().nullslast())
        query = query.offset((page - 1) * page_size).limit(page_size)

        items_result = await self._session.execute(query)
        count_result = await self._session.execute(count_query)

        models = list(items_result.unique().scalars().all())
        total = count_result.scalar_one()

        return (models, total)
