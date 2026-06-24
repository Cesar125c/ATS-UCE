import pytest
from uuid import UUID

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.domain.entities.application import Application, FlowStatus
from app.infrastructure.adapters.storage_adapter import BackblazeStorageAdapter

@pytest.mark.asyncio
async def test_pdf_extraction_end_to_end(settings):
    if not settings.b2_application_key_id:
        pytest.skip("Backblaze B2 credentials not configured")
    
    # Create test application
    application = await create_test_application()
    
    # Upload test PDF to B2
    storage = BackblazeStorageAdapter()
    test_pdf = b"%PDF-1.4 test content"
    await storage.upload_file(
        key=application.cv_storage_key,
        content=test_pdf,
        content_type="application/pdf",
    )
    
    # Execute use case
    use_case = ProcessAIScoreUseCase(...)
    await use_case.execute(application.id)
    
    # Verify status update
    updated_app = await get_application(application.id)
    assert updated_app.status in [FlowStatus.HR_STAGE, FlowStatus.REJECTED]
