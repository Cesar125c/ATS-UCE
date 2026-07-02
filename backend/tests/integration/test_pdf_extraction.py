import os

import pytest

_HAS_B2_CREDENTIALS = all(
    os.environ.get(name)
    for name in ("B2_APPLICATION_KEY_ID", "B2_APPLICATION_KEY", "B2_BUCKET_NAME")
)


@pytest.mark.skipif(
    not _HAS_B2_CREDENTIALS,
    reason="Requires Backblaze B2 credentials exported in the test environment",
)
@pytest.mark.asyncio
async def test_pdf_extraction_end_to_end(settings):
    if not settings.b2_application_key_id:
        pytest.skip("Backblaze B2 credentials not configured")
    pytest.skip("Requires external B2 credentials and application fixtures")
