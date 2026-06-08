"""Clerk authentication adapter for JWT verification and user management."""
from clerk_backend_api import Clerk


class ClerkAuthAdapter:
    """Adapter for verifying Clerk JWTs and managing user metadata."""

    def __init__(self, settings) -> None:
        self._client = Clerk(bearer_auth=settings.clerk_secret_key)

    def verify_token(self, token: str) -> dict:
        raise NotImplementedError("ClerkAuthAdapter.verify_token — Sprint 2")

    def set_user_role(self, clerk_user_id: str, role: str) -> None:
        """Update the user's publicMetadata.role in Clerk."""
        self._client.users.update_metadata(
            user_id=clerk_user_id,
            public_metadata={"role": role},
        )

    def get_user(self, clerk_user_id: str) -> dict:
        """Fetch user profile details from Clerk.

        Returns: {"first_name": str, "last_name": str, "email": str}
        """
        user = self._client.users.get(user_id=clerk_user_id)
        first_name = getattr(user, "first_name") or ""
        last_name = getattr(user, "last_name") or ""
        emails = getattr(user, "email_addresses") or []
        email = emails[0].email_address if emails else ""
        return {
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
        }
