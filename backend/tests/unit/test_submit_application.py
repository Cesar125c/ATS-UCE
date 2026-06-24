import pytest
from uuid import UUID
from unittest.mock import MagicMock

from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.domain.entities.application import Application
from app.domain.entities.applicant import Applicant
from app.domain.entities.vacancy import Vacancy
from app.domain.value_objects.flow_status import FlowStatus

@pytest.mark.asyncio
async def test_submit_application_happy_path(mocker):
    mock_applicant = Applicant(clerk_user_id="user123", id=UUID(int=1))
    mock_vacancy = Vacancy(id=UUID(int=2), is_active=True)
    mock_application = Application(id=UUID(int=3), status=FlowStatus.RECEIVED)
    
    mock_applicant_repo = mocker.MagicMock()
    mock_applicant_repo.find_by_clerk_user_id.return_value = mock_applicant
    
    mock_vacancy_repo = mocker.MagicMock()
    mock_vacancy_repo.find_by_id.return_value = mock_vacancy
    
    mock_app_repo = mocker.MagicMock()
    mock_app_repo.create.return_value = mock_application
    
    mock_storage = mocker.MagicMock()
    
    use_case = SubmitApplicationUseCase(
        mock_app_repo, mock_applicant_repo, mock_vacancy_repo, mock_storage
    )
    
    result = await use_case.execute(mock_applicant.id, mock_vacancy.id, b"pdf_content")
    
    assert result.status == FlowStatus.RECEIVED
    mock_storage.upload_file.assert_called_once()

@pytest.mark.asyncio
async def test_submit_application_invalid_pdf():
    mock_file = MagicMock()
    mock_file.content_type = "image/png"
    
    with pytest.raises(HTTPException) as exc_info:
        await submit_application(vacancy_id=UUID(int=1), cv_file=mock_file)
    
    assert exc_info.value.status_code == 422
