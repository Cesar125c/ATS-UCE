"""Clerk authentication adapter for JWT verification and user management."""
from clerk_backend_api import Clerk


class ClerkAuthAdapter:
    """Adapter for verifying Clerk JWTs and managing user metadata."""

    def __init__(self, settings) -> None:
        self._client = Clerk(bearer_auth=settings.clerk_secret_key)

    def verify_token(self, token: str) -> dict:
        raise NotImplementedError("ClerkAuthAdapter.verify_token — Sprint 2")

    async def set_user_role(self, clerk_user_id: str, role: str) -> None:
        """Update the user's publicMetadata.role in Clerk."""
        self._client.users.update_metadata(
            user_id=clerk_user_id,
            public_metadata={"role": role},
        )
