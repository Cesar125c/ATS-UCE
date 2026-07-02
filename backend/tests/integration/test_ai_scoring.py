import os
from unittest.mock import MagicMock
from uuid import UUID

import pytest

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIAnalysisAdapter
from app.infrastructure.database.session import get_db_session
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository

_HAS_OPENAI_CREDENTIALS = bool(os.environ.get("OPENAI_API_KEY"))


@pytest.mark.skipif(
    not _HAS_OPENAI_CREDENTIALS,
    reason="Requires OPENAI_API_KEY exported in the test environment",
)
@pytest.mark.asyncio
async def test_ai_scoring_end_to_end(settings):
    if not settings.openai_api_key:
        pytest.skip("OpenAI API key not configured")

    # Create test application
    async with get_db_session() as session:
        repo = SQLAApplicationRepository(session)
        application = await create_test_application(repo)

    # Upload test PDF
    storage = BackblazeStorageAdapter()
    test_pdf = b"%PDF-1.4 test content"
    await storage.upload_file(
        key=application.cv_storage_key,
        content=test_pdf,
        content_type="application/pdf",
    )

    # Execute use case
    use_case = ProcessAIScoreUseCase(
        application_repo=SQLAApplicationRepository(get_db_session()),
        vacancy_repo=SQLAVacancyRepository(get_db_session()),
        analysis_adapter=OpenAIAnalysisAdapter(),
        storage_adapter=storage,
        email_service=MagicMock(),
    )

    await use_case.execute(application.id)

    # Verify result
    async with get_db_session() as session:
        repo = SQLAApplicationRepository(session)
        updated_app = await repo.find_by_id(application.id)

        assert updated_app.status in [FlowStatus.HR_STAGE, FlowStatus.REJECTED]
        assert updated_app.ai_score is not None
        assert len(updated_app.ai_score.evaluation_summary) <= 200


async def create_test_application(repo):
    """Helper function to create a test application."""
    from app.domain.entities.application import Application
    from app.domain.entities.vacancy import Vacancy

    # Create a test vacancy
    vacancy = Vacancy(
        title="Test Vacancy",
        faculty="Test Faculty",
        department="Test Department",
        description="Test Description",
        requirements="Test Requirements",
    )
    await repo._session.merge(vacancy)
    await repo._session.flush()

    # Create a test application
    application = Application(
        applicant_id=UUID(int=1),
        vacancy_id=vacancy.id,
        cv_storage_key=f"cvs/user1/{UUID(int=1)}.pdf",
        status=FlowStatus.RECEIVED,
    )
    await repo.create(application)
    return application
