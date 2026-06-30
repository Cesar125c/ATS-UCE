import pytest


@pytest.mark.asyncio
async def test_pdf_extraction_end_to_end(settings):
    if not settings.b2_application_key_id:
        pytest.skip("Backblaze B2 credentials not configured")
    pytest.skip("Requires external B2 credentials and application fixtures")
