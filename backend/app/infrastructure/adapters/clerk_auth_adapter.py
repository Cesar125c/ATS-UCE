"""Clerk authentication adapter for JWT verification and user management. Sprint 2."""


class ClerkAuthAdapter:
    """Adapter for verifying Clerk JWTs and fetching user metadata."""

    async def verify_token(self, token: str) -> dict:
        raise NotImplementedError("ClerkAuthAdapter.verify_token — Sprint 2")

    async def get_user(self, clerk_user_id: str) -> dict:
        raise NotImplementedError("ClerkAuthAdapter.get_user — Sprint 2")
