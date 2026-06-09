"""ORM model for the applicants table."""

from __future__ import annotations

from datetime import UTC, datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.infrastructure.database.session import Base

if TYPE_CHECKING:
    from app.infrastructure.database.models.application_model import ApplicationModel
    from app.infrastructure.database.models.user_model import UserModel


class ApplicantModel(Base):
    __tablename__ = "applicants"

    id: Mapped[UUID] = mapped_column(primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(
        Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
    )

    user: Mapped[UserModel] = relationship(
        "UserModel",
        back_populates="applicant",
    )

    applications: Mapped[list[ApplicationModel]] = relationship(
        "ApplicationModel",
        back_populates="applicant",
    )
