"""Bidirectional mapper between EvaluationModel (ORM) and Evaluation (Domain Entity)."""

from app.domain.entities.evaluation import Evaluation
from app.domain.value_objects.evaluation_decision import EvaluationDecision
from app.infrastructure.database.models.evaluation_model import EvaluationModel


class EvaluationMapper:
    @staticmethod
    def to_domain(model: EvaluationModel) -> Evaluation:
        """Convert an ORM model instance to a domain entity."""
        return Evaluation(
            id=model.id,
            application_id=model.application_id,
            reviewer_clerk_id=model.reviewer_clerk_id,
            reviewer_role=model.reviewer_role,
            decision=EvaluationDecision(model.decision),
            observations=model.observations,
            created_at=model.created_at,
        )

    @staticmethod
    def to_model(entity: Evaluation) -> EvaluationModel:
        """Convert a domain entity to an ORM model instance."""
        return EvaluationModel(
            id=entity.id,
            application_id=entity.application_id,
            reviewer_clerk_id=entity.reviewer_clerk_id,
            reviewer_role=entity.reviewer_role,
            decision=entity.decision.value,
            observations=entity.observations,
            created_at=entity.created_at,
        )
