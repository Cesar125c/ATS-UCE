"""ORM model for the vacancies table."""
from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Boolean, DateTime, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.session import Base

if TYPE_CHECKING:
    from app.infrastructure.database.models.application_model import ApplicationModel


class VacancyModel(Base):
    __tablename__ = "vacancies"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    title: Mapped[str] = mapped_column(String(255))
    faculty: Mapped[str] = mapped_column(String(255), index=True)
    department: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text)
    requirements: Mapped[str] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, server_default="true")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    applications: Mapped[list[ApplicationModel]] = relationship(
        "ApplicationModel",
        back_populates="vacancy",
    )
