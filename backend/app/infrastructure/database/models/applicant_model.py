"""ORM model for the applicants table."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.session import Base

if TYPE_CHECKING:
    from app.infrastructure.database.models.application_model import ApplicationModel


class ApplicantModel(Base):
    __tablename__ = "applicants"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    clerk_user_id: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    full_name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str] = mapped_column(String(255), unique=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    applications: Mapped[list[ApplicationModel]] = relationship(
        "ApplicationModel",
        back_populates="applicant",
    )
