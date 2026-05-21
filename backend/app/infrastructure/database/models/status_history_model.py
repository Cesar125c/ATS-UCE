"""ORM model for the status_history table."""
from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.enums import flow_status_enum
from app.infrastructure.database.session import Base

if TYPE_CHECKING:
    from app.infrastructure.database.models.application_model import ApplicationModel


class StatusHistoryModel(Base):
    __tablename__ = "status_history"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    application_id: Mapped[UUID] = mapped_column(
        ForeignKey("applications.id"), index=True
    )
    status: Mapped[str] = mapped_column(flow_status_enum)
    transitioned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    application: Mapped[ApplicationModel] = relationship(
        "ApplicationModel",
        back_populates="status_history",
    )
