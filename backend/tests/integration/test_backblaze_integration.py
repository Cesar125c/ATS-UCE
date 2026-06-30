from uuid import uuid4

import pytest

from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter


@pytest.mark.asyncio
async def test_integration_roundtrip(settings):
    if not all(
        [
            settings.b2_application_key_id,
            settings.b2_application_key,
            settings.b2_bucket_name,
        ]
    ):
        pytest.skip("Backblaze B2 credentials not configured")

    adapter = BackblazeStorageAdapter(settings)
    key = f"test/{uuid4()}.pdf"

    # Upload
    await adapter.upload_file(key, b"test content", "application/pdf")

    # Download
    content = await adapter.download_file(key)
    assert content == b"test content"

    # Presign
    url = await adapter.generate_presigned_url(key)
    assert "X-Amz-Signature" in url


@pytest.mark.asyncio
async def test_large_file_handling(settings):
    if not all(
        [
            settings.b2_application_key_id,
            settings.b2_application_key,
            settings.b2_bucket_name,
        ]
    ):
        pytest.skip("Backblaze B2 credentials not configured")

    adapter = BackblazeStorageAdapter(settings)
    key = f"test/{uuid4()}_large.pdf"
    large_content = b"x" * 1024 * 1024 * 10  # 10MB

    # Upload
    await adapter.upload_file(key, large_content, "application/pdf")

    # Download
    content = await adapter.download_file(key)
    assert content == large_content
