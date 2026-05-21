"""Shared pytest fixtures for all test suites."""
import os
from uuid import uuid4

import pytest

# Provide required Settings fields before any app module is imported
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://test:test@localhost:5432/test_db")
os.environ.setdefault("CLERK_SECRET_KEY", "sk_test_placeholder_for_unit_tests")

from app.domain.entities.application import Application  # noqa: E402
from app.domain.value_objects.ai_score import AIScore  # noqa: E402


@pytest.fixture
def valid_ai_score() -> AIScore:
    return AIScore(
        total=78.0,
        academic_training=80.0,
        experience=75.0,
        publications=70.0,
        profile_match=85.0,
        languages_competencies=80.0,
        evaluation_summary="Strong academic background with relevant teaching experience.",
    )


@pytest.fixture
def application_in_received() -> Application:
    return Application(
        applicant_id=uuid4(),
        vacancy_id=uuid4(),
        cv_storage_key="cvs/test-cv.pdf",
    )


@pytest.fixture
def application_in_hr_stage(valid_ai_score: AIScore) -> Application:
    app = Application(applicant_id=uuid4(), vacancy_id=uuid4(), cv_storage_key="cvs/test.pdf")
    app.assign_ai_score(valid_ai_score)
    return app
