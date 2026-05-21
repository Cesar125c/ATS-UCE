"""Backblaze B2 object storage adapter for CV file uploads. Implemented in Sprint 2."""


class BackblazeStorageAdapter:
    """Adapter for storing and retrieving CV files in Backblaze B2."""

    async def upload_cv(self, file_data: bytes, object_key: str) -> str:
        raise NotImplementedError("BackblazeStorageAdapter.upload_cv — Sprint 2")

    async def generate_presigned_url(self, object_key: str, expires_in: int = 3600) -> str:
        raise NotImplementedError("BackblazeStorageAdapter.generate_presigned_url — Sprint 2")

    async def delete_cv(self, object_key: str) -> None:
        raise NotImplementedError("BackblazeStorageAdapter.delete_cv — Sprint 2")
