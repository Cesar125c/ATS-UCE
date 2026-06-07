import asyncio
from collections.abc import AsyncGenerator
from uuid import uuid4

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.domain.entities.application import Application
from app.domain.value_objects.ai_score import AIScore
from app.infrastructure.database.session import Base
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from config import get_settings


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
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
async def saved_application(app_repo: SQLAApplicationRepository) -> Application:
    app = Application(
        applicant_id=uuid4(),
        vacancy_id=uuid4(),
        cv_storage_key="cvs/test-app.pdf",
    )
    return await app_repo.save(app)


@pytest.fixture
async def application_with_score(app_repo: SQLAApplicationRepository) -> Application:
    app = Application(
        applicant_id=uuid4(),
        vacancy_id=uuid4(),
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
def test_client(engine) -> AsyncClient:
    from main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    return AsyncClient(transport=transport, base_url="http://test")
