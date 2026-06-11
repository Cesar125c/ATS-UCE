"""Clerk authentication adapter for JWT verification and user management."""

import json
import logging
from urllib.parse import quote

import httpx

logger = logging.getLogger("ats_uce")


class ClerkAuthAdapter:
    """Adapter for verifying Clerk JWTs and managing user roles via publicMetadata."""

    def __init__(self, settings) -> None:
        self.settings = settings
        self._client = None
        if settings.clerk_secret_key:
            from clerk_backend_api import Clerk

            self._client = Clerk(bearer_auth=settings.clerk_secret_key)

    async def verify_token(self, token: str) -> dict:
        if self._client is None:
            raise RuntimeError("Clerk client not initialized — CLERK_SECRET_KEY is missing")
        try:
            session = await self._client.sessions.verify_session(
                session_id="",
                client_id="",
                token=token,
            )
            claims = json.loads(session.claims.raw if hasattr(session.claims, 'raw') else '{}')
            return {
                "user_id": session.user_id or claims.get("sub", ""),
                "email": claims.get("email", ""),
                "role": claims.get("role", ""),
            }
        except Exception as e:
            logger.error("Clerk token verification failed: %s", e)
            raise

    async def set_user_role(self, clerk_user_id: str, role: str) -> None:
        if self._client is None:
            logger.info("DEV: Would set role '%s' for Clerk user '%s'", role, clerk_user_id)
            return
        self._client.users.update(
            user_id=clerk_user_id,
            public_metadata={"role": role},
        )
        logger.info("Role '%s' set for Clerk user '%s'", role, clerk_user_id)
