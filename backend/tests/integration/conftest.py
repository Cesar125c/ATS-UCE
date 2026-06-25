"""Integration test fixtures and CI safety guards.

CI SAFETY: All external API keys are overridden with fake values at import time.
A session-scoped autouse fixture also blocks any attempt to reach external hosts.
"""

import os
import socket
from collections.abc import AsyncGenerator, Generator
from uuid import UUID, uuid4

import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

_CI_FAKE_ENV: dict[str, str] = {
    "OPENAI_API_KEY": "sk-test-fake-key-for-ci-do-not-use",
    "B2_APPLICATION_KEY_ID": "fake-b2-key-id",
    "B2_APPLICATION_KEY": "fake-b2-key",
    "B2_BUCKET_NAME": "fake-bucket",
    "RESEND_API_KEY": "re_fake_key_for_ci",
    "CLERK_SECRET_KEY": "sk_test_fake_clerk_key",
}
for _k, _v in _CI_FAKE_ENV.items():
    os.environ.setdefault(_k, _v)

from app.domain.entities.application import Application
from app.domain.value_objects.ai_score import AIScore
from app.infrastructure.database.models.applicant_model import ApplicantModel
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.models.vacancy_model import VacancyModel
from app.infrastructure.database.session import Base
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from config import get_settings

_BLOCKED_HOSTS = frozenset(
    {
        "api.openai.com",
        "s3.us-west-004.backblazeb2.com",
        "api.resend.com",
    }
)

_original_getaddrinfo = socket.getaddrinfo


def _blocking_getaddrinfo(host, *args, **kwargs):
    if host in _BLOCKED_HOSTS:
        raise RuntimeError(
            f"CI safety: test attempted real network call to '{host}'. "
            "Mock the adapter instead."
        )
    return _original_getaddrinfo(host, *args, **kwargs)


@pytest.fixture(scope="session", autouse=True)
def block_external_network():
    socket.getaddrinfo = _blocking_getaddrinfo
    yield
    socket.getaddrinfo = _original_getaddrinfo


@pytest.fixture
async def engine():
    settings = get_settings()
    eng = create_async_engine(settings.database_url, echo=False)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest.fixture
async def session(engine) -> AsyncGenerator[AsyncSession, None]:
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    async with SessionLocal() as s:
        yield s
        await s.rollback()


@pytest.fixture
async def app_repo(session: AsyncSession) -> SQLAApplicationRepository:
    return SQLAApplicationRepository(session)


@pytest.fixture
async def application_refs(session: AsyncSession) -> tuple[UUID, UUID]:
    user_id = uuid4()
    applicant_id = uuid4()
    vacancy_id = uuid4()

    session.add(
        UserModel(
            id=user_id,
            clerk_id=f"clerk-{user_id}",
            email=f"{user_id}@example.com",
            first_name="Test",
            last_name="Applicant",
            role="APPLICANT",
        )
    )
    await session.flush()

    session.add(ApplicantModel(id=applicant_id, user_id=user_id))
    session.add(
        VacancyModel(
            id=vacancy_id,
            title="Software Engineering Professor",
            faculty="Engineering",
            department="Computer Science",
            description="Test vacancy",
            requirements="Test requirements",
        )
    )
    await session.flush()
    return applicant_id, vacancy_id


@pytest.fixture
async def saved_application(
    app_repo: SQLAApplicationRepository, application_refs: tuple[UUID, UUID]
) -> Application:
    applicant_id, vacancy_id = application_refs
    app = Application(
        applicant_id=applicant_id,
        vacancy_id=vacancy_id,
        cv_storage_key="cvs/test-app.pdf",
    )
    return await app_repo.save(app)


@pytest.fixture
async def application_with_score(
    app_repo: SQLAApplicationRepository, application_refs: tuple[UUID, UUID]
) -> Application:
    applicant_id, vacancy_id = application_refs
    app = Application(
        applicant_id=applicant_id,
        vacancy_id=vacancy_id,
        cv_storage_key="cvs/test-score.pdf",
    )
    ai_score = AIScore(
        total=85.0,
        academic_training=90.0,
        experience=80.0,
        publications=75.0,
        profile_match=88.0,
        languages_competencies=82.0,
        evaluation_summary="Excellent candidate with strong research background.",
    )
    app.assign_ai_score(ai_score)
    return await app_repo.save(app)


@pytest.fixture
def test_client(engine) -> Generator[TestClient, None, None]:
    from main import create_app

    with TestClient(create_app()) as client:
        yield client
