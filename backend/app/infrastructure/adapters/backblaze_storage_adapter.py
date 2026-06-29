"""Backblaze B2 storage adapter using Native B2 API via b2sdk."""

from __future__ import annotations

import asyncio
import io
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from config import Settings

def get_settings():
    from config import get_settings
    return get_settings()

class StorageError(Exception):
    """Base class for storage-related errors."""

class StorageUploadError(StorageError):
    """Failed to upload file to Backblaze B2."""

class StoragePresignError(StorageError):
    """Failed to generate pre-signed URL."""

class StorageDownloadError(StorageError):
    """Failed to download file from Backblaze B2."""


class BackblazeStorageAdapter:
    def __init__(self, settings: Settings | None = None):
        self.settings = settings or get_settings()
        self.bucket_name = self.settings.b2_bucket_name

    def _get_bucket(self):
        from b2sdk.v2 import InMemoryAccountInfo, B2Api

        info = InMemoryAccountInfo()
        b2_api = B2Api(info)
        b2_api.authorize_account(
            "production",
            self.settings.b2_application_key_id,
            self.settings.b2_application_key,
        )
        return b2_api.get_bucket_by_name(self.bucket_name)

    async def upload_file(self, key: str, content: bytes, content_type: str) -> str:
        """Upload file to Backblaze B2 using Native API."""
        loop = asyncio.get_event_loop()
        try:
            bucket = await loop.run_in_executor(None, self._get_bucket)
            await loop.run_in_executor(
                None,
                lambda: bucket.upload_bytes(
                    data_bytes=content,
                    file_name=key,
                    content_type=content_type,
                ),
            )
            return key
        except Exception as e:
            raise StorageUploadError(f"Failed to upload {key}: {e}")

    async def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate download URL using Native B2 API."""
        loop = asyncio.get_event_loop()
        try:
            bucket = await loop.run_in_executor(None, self._get_bucket)
            url = await loop.run_in_executor(
                None,
                lambda: bucket.get_download_url(key),
            )
            return url
        except Exception as e:
            raise StoragePresignError(f"Failed to presign {key}: {e}")

    async def download_file(self, key: str) -> bytes:
        """Download file from Backblaze B2 using Native API."""
        loop = asyncio.get_event_loop()
        try:
            bucket = await loop.run_in_executor(None, self._get_bucket)
            downloaded = await loop.run_in_executor(
                None,
                lambda: bucket.download_file_by_name(key),
            )
            buf = io.BytesIO()
            await loop.run_in_executor(None, lambda: downloaded.save(buf))
            return buf.getvalue()
        except Exception as e:
            raise StorageDownloadError(f"Failed to download {key}: {e}")
