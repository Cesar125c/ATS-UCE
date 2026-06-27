"""ORM model for the applications table — the central aggregate root table."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional
from uuid import UUID, uuid4

from sqlalchemy import DateTime, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.database.enums import flow_status_enum
from app.infrastructure.database.session import Base

if TYPE_CHECKING:
    from app.infrastructure.database.models.applicant_model import ApplicantModel
    from app.infrastructure.database.models.evaluation_model import EvaluationModel
    from app.infrastructure.database.models.status_history_model import StatusHistoryModel
    from app.infrastructure.database.models.vacancy_model import VacancyModel


class ApplicationModel(Base):
    __tablename__ = "applications"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    applicant_id: Mapped[UUID] = mapped_column(ForeignKey("applicants.id"), index=True)
    vacancy_id: Mapped[UUID] = mapped_column(ForeignKey("vacancies.id"), index=True)
    cv_storage_key: Mapped[str] = mapped_column(String(512))
    status: Mapped[str] = mapped_column(
        flow_status_enum,
        default=FlowStatus.RECEIVED.value,
        index=True,
    )
    score_total: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_academic: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_experience: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_production: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_profile_match: Mapped[float | None] = mapped_column(Float, nullable=True)
    score_languages: Mapped[float | None] = mapped_column(Float, nullable=True)
    evaluation_summary: Mapped[str | None] = mapped_column(String(200), nullable=True)
    error_reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True, default=None)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )

    applicant: Mapped[ApplicantModel] = relationship(
        "ApplicantModel",
        back_populates="applications",
    )
    vacancy: Mapped[VacancyModel] = relationship(
        "VacancyModel",
        back_populates="applications",
    )
    evaluations: Mapped[list[EvaluationModel]] = relationship(
        "EvaluationModel",
        back_populates="application",
        cascade="all, delete-orphan",
    )
    status_history: Mapped[list[StatusHistoryModel]] = relationship(
        "StatusHistoryModel",
        back_populates="application",
        order_by="StatusHistoryModel.transitioned_at.asc()",
        cascade="all, delete-orphan",
    )
