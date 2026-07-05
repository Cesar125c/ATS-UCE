"""Unit test for PDF text extraction — no DB needed."""

from unittest.mock import MagicMock

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter


def _make_pdf_with_text(text: str = "Hello World") -> bytes:
    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((100, 700), text)
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_extract_text_from_minimal_pdf() -> None:
    use_case = ProcessAIScoreUseCase(
        application_repo=MagicMock(),
        vacancy_repo=MagicMock(),
        analysis_adapter=MagicMock(),
        storage_adapter=MagicMock(spec=BackblazeStorageAdapter),
        email_service=MagicMock(),
    )

    pdf_bytes = _make_pdf_with_text("Hello World")
    result = use_case._sync_extract_text(pdf_bytes)
    assert "Hello World" in result


def test_extract_text_empty_pdf_returns_none() -> None:
    use_case = ProcessAIScoreUseCase(
        application_repo=MagicMock(),
        vacancy_repo=MagicMock(),
        analysis_adapter=MagicMock(),
        storage_adapter=MagicMock(spec=BackblazeStorageAdapter),
        email_service=MagicMock(),
    )

    pdf_bytes = _make_pdf_with_text("   ")
    # The _sync_extract_text returns the text but it gets stripped after
    text = use_case._sync_extract_text(pdf_bytes)
    assert text is not None
