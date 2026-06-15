from collections.abc import AsyncGenerator
from uuid import UUID, uuid4

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import NullPool

from app.domain.entities.application import Application
from app.domain.value_objects.ai_score import AIScore
from app.infrastructure.database.models.applicant_model import ApplicantModel
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.models.vacancy_model import VacancyModel
from app.infrastructure.database.session import Base
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from config import get_settings


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
