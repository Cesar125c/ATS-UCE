import pytest
from uuid import UUID
from unittest.mock import MagicMock, patch

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.domain.entities.application import Application, FlowStatus
from app.domain.value_objects.ai_score import AIScore

@pytest.mark.asyncio
async def test_pdf_extraction_happy_path(mocker):
    # Mock PDF bytes and PyMuPDF
    mock_pdf = b"%PDF-1.4 test content"
    mock_text = "Sample CV text"
    
    mock_storage = mocker.MagicMock()
    mock_storage.download_file.return_value = mock_pdf
    
    mock_extract = mocker.patch(
        "app.application.use_cases.process_ai_score.extract_text_with_pymupdf",
        return_value=mock_text
    )
    
    use_case = ProcessAIScoreUseCase(...)
    await use_case.execute(application_id=UUID(int=1))
    
    mock_extract.assert_called_once_with(mock_pdf)

@pytest.mark.asyncio
async def test_pdf_extraction_empty_text(mocker):
    # Mock PDF bytes with empty text
    mock_pdf = b"%PDF-1.4 empty"
    
    mock_storage = mocker.MagicMock()
    mock_storage.download_file.return_value = mock_pdf
    
    mock_extract = mocker.patch(
        "app.application.use_cases.process_ai_score.extract_text_with_pymupdf",
        return_value=""
    )
    
    mock_reject = mocker.patch.object(use_case, "_reject_application")
    
    use_case = ProcessAIScoreUseCase(...)
    await use_case.execute(application_id=UUID(int=1))
    
    mock_reject.assert_called_once_with(mocker.ANY, "CV_NOT_READABLE")
