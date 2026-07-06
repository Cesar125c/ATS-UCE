"""Integration test for AI scoring use case — uses mock Groq adapter, real DB."""

from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import pytest

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.domain.entities.application import Application
from app.domain.value_objects.ai_score import AIScore
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository


@pytest.mark.integration
async def test_ai_scoring_with_preselected_score_advances_to_hr(
    app_repo: SQLAApplicationRepository,
    application_refs: tuple[UUID, UUID, str],
) -> None:
    applicant_id, vacancy_id, _ = application_refs

    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((100, 700), "AI scoring test CV content")
    pdf_bytes = doc.tobytes()
    doc.close()

    storage = MagicMock(spec=BackblazeStorageAdapter)
    storage.upload_file = AsyncMock()
    storage.download_file = AsyncMock(return_value=pdf_bytes)

    app = Application(
        applicant_id=applicant_id,
        vacancy_id=vacancy_id,
        cv_storage_key="cvs/test-ai-score.pdf",
    )
    saved = await app_repo.save(app)

    mock_analysis = MagicMock()
    mock_analysis.analyze_cv_with_fallback = AsyncMock(
        return_value=AIScore(
            total=82.0,
            academic_training=85.0,
            experience=80.0,
            publications=75.0,
            profile_match=88.0,
            languages_competencies=82.0,
            evaluation_summary="Excellent candidate.",
        )
    )

    use_case = ProcessAIScoreUseCase(
        application_repo=app_repo,
        vacancy_repo=SQLAVacancyRepository(app_repo._session),
        analysis_adapter=mock_analysis,
        storage_adapter=storage,
        email_service=AsyncMock(),
    )
    await use_case.execute(saved.id)

    updated = await app_repo.find_by_id(saved.id)
    assert updated is not None
    assert updated.status == FlowStatus.HR_STAGE
    assert updated.ai_score is not None
    assert updated.ai_score.total == 82.0


@pytest.mark.integration
async def test_ai_scoring_with_low_score_rejects(
    app_repo: SQLAApplicationRepository,
    application_refs: tuple[UUID, UUID, str],
) -> None:
    applicant_id, vacancy_id, _ = application_refs

    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((100, 700), "Low score test CV content")
    pdf_bytes = doc.tobytes()
    doc.close()

    storage = MagicMock(spec=BackblazeStorageAdapter)
    storage.upload_file = AsyncMock()
    storage.download_file = AsyncMock(return_value=pdf_bytes)

    app = Application(
        applicant_id=applicant_id,
        vacancy_id=vacancy_id,
        cv_storage_key="cvs/test-low-score.pdf",
    )
    saved = await app_repo.save(app)

    mock_analysis = MagicMock()
    mock_analysis.analyze_cv_with_fallback = AsyncMock(
        return_value=AIScore(
            total=45.0,
            academic_training=40.0,
            experience=50.0,
            publications=30.0,
            profile_match=55.0,
            languages_competencies=40.0,
            evaluation_summary="Insufficient qualifications.",
        )
    )

    use_case = ProcessAIScoreUseCase(
        application_repo=app_repo,
        vacancy_repo=SQLAVacancyRepository(app_repo._session),
        analysis_adapter=mock_analysis,
        storage_adapter=storage,
        email_service=AsyncMock(),
    )
    await use_case.execute(saved.id)

    updated = await app_repo.find_by_id(saved.id)
    assert updated is not None
    assert updated.status == FlowStatus.REJECTED
    assert updated.ai_score is not None
    assert updated.ai_score.total == 45.0
