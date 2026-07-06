"""add_performance_indexes

Revision ID: a1b2c3d4e5f6
Revises: a0e3b37edc40
Create Date: 2026-06-28 03:00:00.000000+00:00

"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "a1b2c3d4e5f6"
down_revision: str | None = "a0e3b37edc40"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_index(
        "idx_applications_status",
        "applications",
        ["status"],
    )
    op.create_index(
        "idx_applications_score_total",
        "applications",
        [sa.text("score_total DESC")],
    )
    op.create_index(
        "idx_applications_status_score",
        "applications",
        ["status", sa.text("score_total DESC")],
    )


def downgrade() -> None:
    op.drop_index("idx_applications_status_score", table_name="applications")
    op.drop_index("idx_applications_score_total", table_name="applications")
    op.drop_index("idx_applications_status", table_name="applications")
