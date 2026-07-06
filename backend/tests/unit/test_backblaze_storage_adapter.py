import pytest

from app.infrastructure.adapters.backblaze_storage_adapter import (
    BackblazeStorageAdapter,
    StorageDownloadError,
    StoragePresignError,
    StorageUploadError,
)


@pytest.mark.asyncio
async def test_upload_file_happy_path(mocker):
    mock_bucket = mocker.MagicMock()
    adapter = BackblazeStorageAdapter()
    mocker.patch.object(adapter, "_get_bucket", return_value=mock_bucket)

    result = await adapter.upload_file("test.pdf", b"content", "application/pdf")

    assert result == "test.pdf"
    mock_bucket.upload_bytes.assert_called_once_with(
        data_bytes=b"content",
        file_name="test.pdf",
        content_type="application/pdf",
    )


@pytest.mark.asyncio
async def test_upload_file_error(mocker):
    mock_bucket = mocker.MagicMock()
    mock_bucket.upload_bytes.side_effect = PermissionError("Access denied")
    adapter = BackblazeStorageAdapter()
    mocker.patch.object(adapter, "_get_bucket", return_value=mock_bucket)

    with pytest.raises(StorageUploadError, match="Access denied"):
        await adapter.upload_file("test.pdf", b"content", "application/pdf")


@pytest.mark.asyncio
async def test_generate_presigned_url_happy_path(mocker):
    mock_bucket = mocker.MagicMock()
    mock_bucket.get_download_url.return_value = "https://example.com/presigned"
    adapter = BackblazeStorageAdapter()
    mocker.patch.object(adapter, "_get_bucket", return_value=mock_bucket)

    result = await adapter.generate_presigned_url("test.pdf")

    assert result == "https://example.com/presigned"
    mock_bucket.get_download_url.assert_called_once_with("test.pdf")


@pytest.mark.asyncio
async def test_generate_presigned_url_error(mocker):
    mock_bucket = mocker.MagicMock()
    mock_bucket.get_download_url.side_effect = FileNotFoundError("File not found")
    adapter = BackblazeStorageAdapter()
    mocker.patch.object(adapter, "_get_bucket", return_value=mock_bucket)

    with pytest.raises(StoragePresignError, match="File not found"):
        await adapter.generate_presigned_url("nonexistent.pdf")


@pytest.mark.asyncio
async def test_download_file_happy_path(mocker):
    mock_downloaded = mocker.MagicMock()
    mock_downloaded.save.side_effect = lambda buf: buf.write(b"test content")
    mock_bucket = mocker.MagicMock()
    mock_bucket.download_file_by_name.return_value = mock_downloaded
    adapter = BackblazeStorageAdapter()
    mocker.patch.object(adapter, "_get_bucket", return_value=mock_bucket)

    result = await adapter.download_file("test.pdf")

    assert result == b"test content"
    mock_bucket.download_file_by_name.assert_called_once_with("test.pdf")


@pytest.mark.asyncio
async def test_download_file_error(mocker):
    mock_bucket = mocker.MagicMock()
    mock_bucket.download_file_by_name.side_effect = FileNotFoundError("File not found")
    adapter = BackblazeStorageAdapter()
    mocker.patch.object(adapter, "_get_bucket", return_value=mock_bucket)

    with pytest.raises(StorageDownloadError, match="File not found"):
        await adapter.download_file("nonexistent.pdf")
