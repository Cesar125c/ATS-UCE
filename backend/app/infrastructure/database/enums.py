"""Shared SQLAlchemy Enum types. Import in all ORM models — never define SAEnum() inline."""

import sqlalchemy as sa

from app.domain.value_objects.evaluation_decision import EvaluationDecision
from app.domain.value_objects.flow_status import FlowStatus

# Single PostgreSQL enum type for the workflow status — reused across tables
flow_status_enum = sa.Enum(
    FlowStatus,
    name="flow_status_enum",
    create_type=True,
)

# Single PostgreSQL enum type for evaluation decisions
evaluation_decision_enum = sa.Enum(
    EvaluationDecision,
    name="evaluation_decision_enum",
    create_type=True,
)
