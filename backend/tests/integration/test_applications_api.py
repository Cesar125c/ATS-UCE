"""Integration tests for application submission + AI scoring flow.

Tests the core use cases with real DB, mocked external services.
"""

from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import pytest

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.domain.value_objects.ai_score import AIScore
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.adapters.groq_analysis_adapter import GroqAnalysisAdapter
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository


@pytest.mark.integration
async def test_submit_then_ai_score_produces_hr_or_rejected(
    app_repo: SQLAApplicationRepository,
    application_refs: tuple[UUID, UUID, str],
) -> None:
    """Submit + AI scoring with mocked Groq produces HR_STAGE or REJECTED."""
    applicant_id, vacancy_id, _ = application_refs

    # Mock B2 storage
    storage = MagicMock(spec=BackblazeStorageAdapter)
    storage.upload_file = AsyncMock()

    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((100, 700), "Hello World from test")
    pdf_bytes = doc.tobytes()
    doc.close()
    storage.download_file = AsyncMock(return_value=pdf_bytes)

    # Submit
    submit_uc = SubmitApplicationUseCase(
        application_repo=app_repo,
        applicant_repo=SQLAApplicantRepository(app_repo._session),
        vacancy_repo=SQLAVacancyRepository(app_repo._session),
        storage_adapter=storage,
    )
    app = await submit_uc.execute(applicant_id, vacancy_id, b"fake pdf content")
    assert app.id is not None
    assert app.status == FlowStatus.RECEIVED
    assert app.cv_storage_key.startswith("cvs/")
    storage.upload_file.assert_called_once()

    # Mock AI analysis — produces a passing score
    mock_analysis = MagicMock(spec=GroqAnalysisAdapter)
    mock_analysis.analyze_cv_with_fallback = AsyncMock(
        return_value=AIScore(
            total=78.0,
            academic_training=80.0,
            experience=75.0,
            publications=70.0,
            profile_match=85.0,
            languages_competencies=80.0,
            evaluation_summary="Strong candidate.",
        )
    )

    ai_uc = ProcessAIScoreUseCase(
        application_repo=app_repo,
        vacancy_repo=SQLAVacancyRepository(app_repo._session),
        analysis_adapter=mock_analysis,
        storage_adapter=storage,
        email_service=AsyncMock(),
    )
    await ai_uc.execute(app.id)

    updated = await app_repo.find_by_id(app.id)
    assert updated is not None
    assert updated.status == FlowStatus.HR_STAGE
    assert updated.ai_score is not None
    assert updated.ai_score.total == 78.0
