"""Unit tests for the Evaluation entity."""

import dataclasses
from uuid import uuid4

import pytest

from app.domain.entities.evaluation import Evaluation
from app.domain.value_objects.evaluation_decision import EvaluationDecision


def _make_evaluation(**overrides) -> Evaluation:
    defaults = {
        "application_id": uuid4(),
        "reviewer_clerk_id": "user_test_001",
        "reviewer_role": "hr_staff",
        "decision": EvaluationDecision.APPROVED,
        "observations": "",
    }
    defaults.update(overrides)
    return Evaluation(**defaults)


def test_approved_with_empty_observations_is_valid() -> None:
    evaluation = _make_evaluation(decision=EvaluationDecision.APPROVED, observations="")
    assert evaluation.decision == EvaluationDecision.APPROVED


def test_rejected_with_non_empty_observations_is_valid() -> None:
    evaluation = _make_evaluation(
        decision=EvaluationDecision.REJECTED,
        observations="Insufficient publications.",
    )
    assert evaluation.decision == EvaluationDecision.REJECTED


def test_rejected_with_empty_observations_raises() -> None:
    with pytest.raises(ValueError, match="observations"):
        _make_evaluation(decision=EvaluationDecision.REJECTED, observations="")


def test_rejected_with_whitespace_only_raises() -> None:
    with pytest.raises(ValueError, match="observations"):
        _make_evaluation(decision=EvaluationDecision.REJECTED, observations="   ")


def test_evaluation_is_immutable() -> None:
    evaluation = _make_evaluation()
    with pytest.raises(dataclasses.FrozenInstanceError):
        evaluation.decision = EvaluationDecision.REJECTED  # type: ignore[misc]
