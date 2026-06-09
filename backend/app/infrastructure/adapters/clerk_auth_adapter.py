"""Clerk authentication adapter for JWT verification and user management."""

import logging

logger = logging.getLogger("ats_uce")


class ClerkAuthAdapter:
    """Adapter for verifying Clerk JWTs and managing user roles via publicMetadata."""

    def __init__(self, settings) -> None:
        self.settings = settings
        self._client = None
        if settings.clerk_secret_key:
            try:
                from clerk_backend_api import Clerk

                self._client = Clerk(bearer_auth=settings.clerk_secret_key)
            except ImportError:
                logger.warning("clerk_backend_api not installed; using dev mock")

    async def verify_token(self, token: str) -> dict:
        if self._client is None:
            return {"user_id": "dev_user_001", "role": "human_resources", "email": "dev@uce.edu.ec"}
        raise NotImplementedError("Real Clerk JWT verify — Sprint 2")

    async def set_user_role(self, clerk_user_id: str, role: str) -> None:
        if self._client is None:
            logger.info("DEV: Would set role '%s' for Clerk user '%s'", role, clerk_user_id)
            return
        from clerk_backend_api.api.users import update_user

        update_user(
            user_id=clerk_user_id,
            public_metadata={"role": role},
        )
        logger.info("Role '%s' set for Clerk user '%s'", role, clerk_user_id)
