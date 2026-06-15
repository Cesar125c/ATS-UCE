"""Aggregate Root of the ATS-UCE domain. Enforces all workflow invariants."""

from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.domain.value_objects.ai_score import AIScore
from app.domain.value_objects.flow_status import FlowStatus


@dataclass
class Application:
    applicant_id: UUID
    vacancy_id: UUID
    cv_storage_key: str  # Object key in Backblaze B2
    id: UUID = field(default_factory=uuid4)
    status: FlowStatus = FlowStatus.RECEIVED
    ai_score: AIScore | None = None
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
    updated_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def assign_ai_score(self, score: AIScore) -> None:
        """Domain Invariant 4: score must exist before entering HR_STAGE."""
        self.ai_score = score
        self.status = FlowStatus.HR_STAGE if score.is_preselected else FlowStatus.REJECTED
        self.updated_at = datetime.now(UTC)

    def advance_flow(self) -> None:
        """Domain Invariant 1: strict linear progression."""
        if self.status.is_terminal:
            raise ValueError(
                f"Cannot advance a finalized application. Current status: {self.status.value}"
            )
        self.status = self.status.next_status()
        self.updated_at = datetime.now(UTC)

    def reject(self) -> None:
        """Domain Invariant 2: short-circuit to REJECTED from any non-terminal state."""
        self.status = FlowStatus.REJECTED
        self.updated_at = datetime.now(UTC)
