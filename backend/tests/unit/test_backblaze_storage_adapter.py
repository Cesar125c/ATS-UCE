import pytest
from unittest.mock import MagicMock
from botocore.exceptions import ClientError

from backend.app.infrastructure.adapters.backblaze_storage_adapter import (
    BackblazeStorageAdapter,
    StorageUploadError,
    StoragePresignError,
    StorageDownloadError,
)

@pytest.mark.asyncio
async def test_upload_file_happy_path(mocker):
    mock_client = mocker.MagicMock()
    adapter = BackblazeStorageAdapter()
    adapter.client = mock_client
    
    result = await adapter.upload_file("test.pdf", b"content", "application/pdf")
    assert result == "test.pdf"
    mock_client.put_object.assert_called_once()

@pytest.mark.asyncio
async def test_upload_file_error(mocker):
    mock_client = mocker.MagicMock()
    mock_client.put_object.side_effect = ClientError(
        {"Error": {"Code": "403"}}, "PutObject"
    )
    adapter = BackblazeStorageAdapter()
    adapter.client = mock_client
    
    with pytest.raises(StorageUploadError, match="Access denied"):
        await adapter.upload_file("test.pdf", b"content", "application/pdf")

@pytest.mark.asyncio
async def test_generate_presigned_url_happy_path(mocker):
    mock_client = mocker.MagicMock()
    mock_client.generate_presigned_url.return_value = "https://example.com/presigned"
    adapter = BackblazeStorageAdapter()
    adapter.client = mock_client
    
    result = await adapter.generate_presigned_url("test.pdf")
    assert result == "https://example.com/presigned"
    mock_client.generate_presigned_url.assert_called_once()

@pytest.mark.asyncio
async def test_generate_presigned_url_error(mocker):
    mock_client = mocker.MagicMock()
    mock_client.generate_presigned_url.side_effect = ClientError(
        {"Error": {"Code": "NoSuchKey"}}, "GeneratePresignedUrl"
    )
    adapter = BackblazeStorageAdapter()
    adapter.client = mock_client
    
    with pytest.raises(StoragePresignError, match="File not found"):
        await adapter.generate_presigned_url("nonexistent.pdf")

@pytest.mark.asyncio
async def test_download_file_happy_path(mocker):
    mock_response = MagicMock()
    mock_response["Body"].read.return_value = b"test content"
    mock_client = mocker.MagicMock()
    mock_client.get_object.return_value = mock_response
    adapter = BackblazeStorageAdapter()
    adapter.client = mock_client
    
    result = await adapter.download_file("test.pdf")
    assert result == b"test content"
    mock_client.get_object.assert_called_once()

@pytest.mark.asyncio
async def test_download_file_error(mocker):
    mock_client = mocker.MagicMock()
    mock_client.get_object.side_effect = ClientError(
        {"Error": {"Code": "NoSuchKey"}}, "GetObject"
    )
    adapter = BackblazeStorageAdapter()
    adapter.client = mock_client
    
    with pytest.raises(StorageDownloadError, match="File not found"):
        await adapter.download_file("nonexistent.pdf")
