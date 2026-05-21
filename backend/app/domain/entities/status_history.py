"""Immutable record of a single state transition. Per-stage timestamps for the stepper UI."""
from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.domain.value_objects.flow_status import FlowStatus


@dataclass(frozen=True)
class StatusHistory:
    application_id: UUID
    status: FlowStatus
    id: UUID = field(default_factory=uuid4)
    transitioned_at: datetime = field(default_factory=lambda: datetime.now(UTC))
