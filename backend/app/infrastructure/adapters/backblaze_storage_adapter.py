from __future__ import annotations

import asyncio
from typing import TYPE_CHECKING

import boto3
from botocore.exceptions import ClientError

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
        self.client = self._create_boto3_client()

    def _create_boto3_client(self) -> boto3.client:
        """Create boto3 client with settings from config.py."""
        return boto3.client(
            "s3",
            endpoint_url=self.settings.b2_endpoint_url,
            aws_access_key_id=self.settings.b2_application_key_id,
            aws_secret_access_key=self.settings.b2_application_key,
            region_name=self.settings.b2_region,
        )

    async def upload_file(self, key: str, content: bytes, content_type: str) -> str:
        """Upload file to Backblaze B2. Returns stored key."""
        loop = asyncio.get_event_loop()
        try:
            await loop.run_in_executor(
                None,
                lambda: self.client.put_object(
                    Bucket=self.bucket_name,
                    Key=key,
                    Body=content,
                    ContentType=content_type,
                )
            )
            return key
        except Exception as e:
            raise self._map_exception(e, StorageUploadError)

    async def generate_presigned_url(self, key: str, expires_in: int = 3600) -> str:
        """Generate pre-signed URL for temporary access."""
        loop = asyncio.get_event_loop()
        try:
            url = await loop.run_in_executor(
                None,
                lambda: self.client.generate_presigned_url(
                    "get_object",
                    Params={"Bucket": self.bucket_name, "Key": key},
                    ExpiresIn=expires_in,
                )
            )
            return url
        except Exception as e:
            raise self._map_exception(e, StoragePresignError)

    async def download_file(self, key: str) -> bytes:
        """Download file from Backblaze B2. Returns bytes in memory."""
        loop = asyncio.get_event_loop()
        try:
            response = await loop.run_in_executor(
                None,
                lambda: self.client.get_object(
                    Bucket=self.bucket_name,
                    Key=key,
                )
            )
            return await loop.run_in_executor(None, lambda: response["Body"].read())
        except Exception as e:
            raise self._map_exception(e, StorageDownloadError)

    def _map_exception(self, exc: Exception, wrapper_cls: type[StorageError]) -> StorageError:
        """Map boto3 exceptions to custom exceptions."""
        if isinstance(exc, ClientError):
            if exc.response["Error"]["Code"] == "NoSuchKey":
                return wrapper_cls("File not found")
            elif exc.response["Error"]["Code"] == "403":
                return wrapper_cls("Access denied")
        elif isinstance(exc, (ConnectionError, TimeoutError)):
            return wrapper_cls("Storage service unavailable")
        return wrapper_cls("Storage operation failed")
