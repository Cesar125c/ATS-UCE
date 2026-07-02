"""Integration test fixtures and CI safety guards.

CI SAFETY: Only credentials for internally exercised services receive fake values.
A session-scoped autouse fixture blocks external hosts without explicit credentials.
"""

import os
import socket
from collections.abc import AsyncGenerator
from uuid import UUID, uuid4

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

# ---------------------------------------------------------------------------
# Provide placeholders required by internal tests BEFORE app modules are imported.
# OpenAI and Backblaze are intentionally absent so external tests skip in CI.
# ---------------------------------------------------------------------------
_CI_FAKE_ENV: dict[str, str] = {
    "RESEND_API_KEY": "re_fake_key_for_ci",
    "CLERK_SECRET_KEY": "sk_test_fake_clerk_key",
}
for _k, _v in _CI_FAKE_ENV.items():
    os.environ.setdefault(_k, _v)

# ---------------------------------------------------------------------------
# App imports AFTER env override
# ---------------------------------------------------------------------------
from app.domain.entities.application import Application  # noqa: E402
from app.domain.value_objects.ai_score import AIScore  # noqa: E402
from app.infrastructure.database.models.applicant_model import ApplicantModel  # noqa: E402
from app.infrastructure.database.models.user_model import UserModel  # noqa: E402
from app.infrastructure.database.models.vacancy_model import VacancyModel  # noqa: E402
from app.infrastructure.database.session import Base  # noqa: E402
from app.infrastructure.repositories.sqla_application_repository import (  # noqa: E402
    SQLAApplicationRepository,
)
from config import get_settings  # noqa: E402


@pytest.fixture
def settings():
    """Provide application settings without inventing external-service credentials."""
    return get_settings()


# ---------------------------------------------------------------------------
# Block external hosts unless their credentials were explicitly exported.
# ---------------------------------------------------------------------------
_blocked_hosts = {"api.resend.com"}
if not os.environ.get("OPENAI_API_KEY"):
    _blocked_hosts.add("api.openai.com")
if not all(
    os.environ.get(name)
    for name in ("B2_APPLICATION_KEY_ID", "B2_APPLICATION_KEY", "B2_BUCKET_NAME")
):
    _blocked_hosts.update({"api.backblazeb2.com", "s3.us-west-004.backblazeb2.com"})
_BLOCKED_HOSTS = frozenset(_blocked_hosts)

_original_getaddrinfo = socket.getaddrinfo


def _blocking_getaddrinfo(host, *args, **kwargs):
    if host in _BLOCKED_HOSTS:
        raise RuntimeError(
            f"CI safety: test attempted real network call to '{host}'. Mock the adapter instead."
        )
    return _original_getaddrinfo(host, *args, **kwargs)


@pytest.fixture(scope="session", autouse=True)
def block_external_network():
    """Prevent any test from making real HTTP calls to external services."""
    socket.getaddrinfo = _blocking_getaddrinfo
    yield
    socket.getaddrinfo = _original_getaddrinfo


# ---------------------------------------------------------------------------
# Database fixtures
# ---------------------------------------------------------------------------


@pytest_asyncio.fixture
async def engine():
    settings = get_settings()
    eng = create_async_engine(
        settings.database_url,
        echo=False,
        poolclass=NullPool,
        connect_args={"ssl": False},
    )
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await eng.dispose()


@pytest_asyncio.fixture
async def session(engine) -> AsyncGenerator[AsyncSession, None]:
    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)
    async with SessionLocal() as s:
        try:
            yield s
        finally:
            await s.rollback()


@pytest_asyncio.fixture
async def app_repo(session: AsyncSession) -> SQLAApplicationRepository:
    return SQLAApplicationRepository(session)


@pytest_asyncio.fixture
async def application_refs(session: AsyncSession) -> tuple[UUID, UUID]:
    user_id = uuid4()
    applicant_id = uuid4()
    vacancy_id = uuid4()

    user = UserModel(
        id=user_id,
        clerk_id=f"clerk-{user_id}",
        email=f"{user_id}@example.com",
        first_name="Test",
        last_name="Applicant",
        role="applicant",
    )
    applicant = ApplicantModel(id=applicant_id, user_id=user_id)
    vacancy = VacancyModel(
        id=vacancy_id,
        title="Test Vacancy",
        faculty="Engineering",
        department="Software",
        description="Test vacancy description",
        requirements="Test requirements",
    )

    session.add_all([user, applicant, vacancy])
    await session.flush()

    return applicant_id, vacancy_id


@pytest_asyncio.fixture
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


@pytest_asyncio.fixture
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


@pytest_asyncio.fixture
async def test_client(engine) -> AsyncGenerator[AsyncClient, None]:
    from app.infrastructure.database.session import get_db_session
    from main import create_app

    SessionLocal = async_sessionmaker(engine, expire_on_commit=False)

    async def override_get_db_session() -> AsyncGenerator[AsyncSession, None]:
        async with SessionLocal() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app = create_app()
    app.dependency_overrides[get_db_session] = override_get_db_session
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client
    app.dependency_overrides.clear()
