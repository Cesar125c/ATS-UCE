"""ORM model for the evaluations table."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.enums import evaluation_decision_enum
from app.infrastructure.database.session import Base

if TYPE_CHECKING:
    from app.infrastructure.database.models.application_model import ApplicationModel


class EvaluationModel(Base):
    __tablename__ = "evaluations"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    application_id: Mapped[UUID] = mapped_column(ForeignKey("applications.id"), index=True)
    reviewer_clerk_id: Mapped[str] = mapped_column(String(255))
    reviewer_role: Mapped[str] = mapped_column(String(50))
    decision: Mapped[str] = mapped_column(evaluation_decision_enum)
    observations: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    application: Mapped[ApplicationModel] = relationship(
        "ApplicationModel",
        back_populates="evaluations",
    )
