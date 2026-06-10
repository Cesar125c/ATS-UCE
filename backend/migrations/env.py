"""Alembic env.py — async-compatible migration environment for SQLAlchemy 2.0."""

import asyncio
import os
import sys
from logging.config import fileConfig
from pathlib import Path

from alembic import context
from sqlalchemy.ext.asyncio import async_engine_from_config

# Ensure the backend root is on the path so app modules resolve correctly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

# Set the database URL from the environment variable
config = context.config
config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])

if config.config_file_name:
    fileConfig(config.config_file_name)

# Import Base first
# Import ALL 5 ORM models explicitly so Alembic detects them in metadata
from app.infrastructure.database.models.applicant_model import (  # noqa: E402
    ApplicantModel,  # noqa: F401
)
from app.infrastructure.database.models.application_model import (  # noqa: E402
    ApplicationModel,  # noqa: F401
)
from app.infrastructure.database.models.evaluation_model import (  # noqa: E402
    EvaluationModel,  # noqa: F401
)
from app.infrastructure.database.models.status_history_model import (  # noqa: E402
    StatusHistoryModel,  # noqa: F401
)
from app.infrastructure.database.models.vacancy_model import (  # noqa: E402
    VacancyModel,  # noqa: F401
)
from app.infrastructure.database.session import Base  # noqa: E402

target_metadata = Base.metadata


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations():
    connectable = async_engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
    )
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)
    await connectable.dispose()


def run_migrations_online():
    asyncio.run(run_async_migrations())


run_migrations_online()
