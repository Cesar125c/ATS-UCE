"""Immutable value object representing the two possible outcomes of an authority review."""
from enum import StrEnum


class EvaluationDecision(StrEnum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
