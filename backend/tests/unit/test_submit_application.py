from unittest.mock import AsyncMock
from uuid import UUID

import pytest

from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.domain.entities.application import Application
from app.domain.entities.vacancy import Vacancy
from app.domain.value_objects.flow_status import FlowStatus


def _make_vacancy(active: bool = True) -> Vacancy:
    return Vacancy(
        id=UUID(int=2),
        title="Prof. Test",
        faculty="Engineering",
        department="CS",
        description="desc",
        requirements="req",
        is_active=active,
    )


def _make_application() -> Application:
    return Application(
        id=UUID(int=3),
        applicant_id=UUID(int=1),
        vacancy_id=UUID(int=2),
        cv_storage_key="cvs/1/3.pdf",
        status=FlowStatus.RECEIVED,
    )


@pytest.mark.asyncio
async def test_submit_application_happy_path():
    mock_vacancy = _make_vacancy()
    mock_application = _make_application()

    mock_vacancy_repo = AsyncMock()
    mock_vacancy_repo.find_by_id.return_value = mock_vacancy

    mock_app_repo = AsyncMock()
    mock_app_repo.save.return_value = mock_application

    mock_storage = AsyncMock()
    mock_applicant_repo = AsyncMock()

    use_case = SubmitApplicationUseCase(
        application_repo=mock_app_repo,
        applicant_repo=mock_applicant_repo,
        vacancy_repo=mock_vacancy_repo,
        storage_adapter=mock_storage,
    )

    result = await use_case.execute(UUID(int=1), UUID(int=2), b"pdf_content")

    assert result.status == FlowStatus.RECEIVED
    # upload_file called exactly once (the B2 upload)
    mock_storage.upload_file.assert_called_once()
    # The key must contain the real application ID
    call_kwargs = mock_storage.upload_file.call_args
    assert str(mock_application.id) in call_kwargs.kwargs.get("key", "")


@pytest.mark.asyncio
async def test_submit_application_inactive_vacancy_raises():
    mock_vacancy = _make_vacancy(active=False)

    mock_vacancy_repo = AsyncMock()
    mock_vacancy_repo.find_by_id.return_value = mock_vacancy

    use_case = SubmitApplicationUseCase(
        application_repo=AsyncMock(),
        applicant_repo=AsyncMock(),
        vacancy_repo=mock_vacancy_repo,
        storage_adapter=AsyncMock(),
    )

    with pytest.raises(ValueError, match="not active"):
        await use_case.execute(UUID(int=1), UUID(int=2), b"pdf")


@pytest.mark.asyncio
async def test_submit_application_missing_vacancy_raises():
    mock_vacancy_repo = AsyncMock()
    mock_vacancy_repo.find_by_id.return_value = None

    use_case = SubmitApplicationUseCase(
        application_repo=AsyncMock(),
        applicant_repo=AsyncMock(),
        vacancy_repo=mock_vacancy_repo,
        storage_adapter=AsyncMock(),
    )

    with pytest.raises(ValueError, match="not found"):
        await use_case.execute(UUID(int=1), UUID(int=2), b"pdf")
