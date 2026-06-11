"""Immutable record of an authority's decision on an application. Never updated after creation."""

from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.domain.value_objects.evaluation_decision import EvaluationDecision


@dataclass(frozen=True)
class Evaluation:
    application_id: UUID
    reviewer_clerk_id: str
    reviewer_role: str
    decision: EvaluationDecision
    observations: str
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))

    def __post_init__(self) -> None:
        # Domain Invariant 5: observations are mandatory when rejecting
        if self.decision == EvaluationDecision.REJECTED and not self.observations.strip():
            raise ValueError("observations cannot be empty when decision is REJECTED")
