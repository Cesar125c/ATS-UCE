import pytest
from uuid import UUID
from unittest.mock import AsyncMock

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.domain.entities.application import Application
from app.domain.value_objects.flow_status import FlowStatus
from app.domain.value_objects.ai_score import AIScore
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIUnavailableError


def _make_mock_app(status: FlowStatus = FlowStatus.RECEIVED) -> Application:
    return Application(
        id=UUID(int=1),
        applicant_id=UUID(int=1),
        vacancy_id=UUID(int=1),
        cv_storage_key="cvs/user1/app1.pdf",
        status=status,
    )


@pytest.mark.asyncio
async def test_ai_scoring_success(mocker):
    mock_pdf = b"%PDF-1.4 test"
    mock_text = "Sample CV text"

    mock_storage = AsyncMock()
    mock_storage.download_file.return_value = mock_pdf

    mock_ai_score = AIScore(
        total=75.0,
        academic_training=80.0,
        experience=70.0,
        publications=75.0,
        profile_match=85.0,
        languages_competencies=65.0,
        evaluation_summary="Test summary",
    )

    mock_analysis = AsyncMock()
    mock_analysis.analyze_cv_with_fallback.return_value = mock_ai_score

    mock_app_repo = AsyncMock()
    mock_app = _make_mock_app()
    mock_app_repo.find_by_id.return_value = mock_app
    mock_app_repo.save.return_value = mock_app

    mock_vacancy_repo = AsyncMock()
    from app.domain.entities.vacancy import Vacancy
    mock_vacancy_repo.find_by_id.return_value = Vacancy(
        title="Prof. Test", faculty="Eng", department="CS",
        description="desc", requirements="req",
    )

    use_case = ProcessAIScoreUseCase(
        application_repo=mock_app_repo,
        vacancy_repo=mock_vacancy_repo,
        analysis_adapter=mock_analysis,
        storage_adapter=mock_storage,
        email_service=mocker.MagicMock(),
    )

    mocker.patch.object(use_case, "_extract_text_from_pdf", return_value=mock_text)

    await use_case.execute(application_id=UUID(int=1))

    # save called twice: PROCESSING_AI transition + final score update
    assert mock_app_repo.save.call_count == 2
    mock_analysis.analyze_cv_with_fallback.assert_called_once()


@pytest.mark.asyncio
async def test_ai_scoring_rejection(mocker):
    mock_pdf = b"%PDF-1.4 test"
    mock_text = "Sample CV text"

    mock_storage = AsyncMock()
    mock_storage.download_file.return_value = mock_pdf

    # Low score → REJECTED
    mock_ai_score = AIScore(
        total=55.0,
        academic_training=60.0,
        experience=50.0,
        publications=55.0,
        profile_match=60.0,
        languages_competencies=50.0,
        evaluation_summary="Test summary",
    )

    mock_analysis = AsyncMock()
    mock_analysis.analyze_cv_with_fallback.return_value = mock_ai_score

    mock_app_repo = AsyncMock()
    mock_app = _make_mock_app()
    mock_app_repo.find_by_id.return_value = mock_app
    mock_app_repo.save.return_value = mock_app

    mock_vacancy_repo = AsyncMock()
    from app.domain.entities.vacancy import Vacancy
    mock_vacancy_repo.find_by_id.return_value = Vacancy(
        title="Prof. Test", faculty="Eng", department="CS",
        description="desc", requirements="req",
    )

    use_case = ProcessAIScoreUseCase(
        application_repo=mock_app_repo,
        vacancy_repo=mock_vacancy_repo,
        analysis_adapter=mock_analysis,
        storage_adapter=mock_storage,
        email_service=mocker.MagicMock(),
    )

    mocker.patch.object(use_case, "_extract_text_from_pdf", return_value=mock_text)

    await use_case.execute(application_id=UUID(int=1))

    # save called twice: PROCESSING_AI + REJECTED (via assign_ai_score)
    assert mock_app_repo.save.call_count == 2


@pytest.mark.asyncio
async def test_ai_scoring_failure(mocker):
    mock_pdf = b"%PDF-1.4 test"
    mock_text = "Sample CV text"

    mock_storage = AsyncMock()
    mock_storage.download_file.return_value = mock_pdf

    mock_analysis = AsyncMock()
    mock_analysis.analyze_cv_with_fallback.side_effect = OpenAIUnavailableError("OpenAI down")

    mock_app_repo = AsyncMock()
    mock_app = _make_mock_app()
    mock_app_repo.find_by_id.return_value = mock_app
    mock_app_repo.save.return_value = mock_app

    mock_vacancy_repo = AsyncMock()
    from app.domain.entities.vacancy import Vacancy
    mock_vacancy_repo.find_by_id.return_value = Vacancy(
        title="Prof. Test", faculty="Eng", department="CS",
        description="desc", requirements="req",
    )

    use_case = ProcessAIScoreUseCase(
        application_repo=mock_app_repo,
        vacancy_repo=mock_vacancy_repo,
        analysis_adapter=mock_analysis,
        storage_adapter=mock_storage,
        email_service=mocker.MagicMock(),
    )

    mocker.patch.object(use_case, "_extract_text_from_pdf", return_value=mock_text)

    await use_case.execute(application_id=UUID(int=1))

    # save called twice: PROCESSING_AI + error_reason persist
    assert mock_app_repo.save.call_count == 2
    # error_reason must be set on the entity
    assert mock_app.error_reason == "OPENAI_UNAVAILABLE"
    # status must remain PROCESSING_AI
    assert mock_app.status == FlowStatus.PROCESSING_AI
