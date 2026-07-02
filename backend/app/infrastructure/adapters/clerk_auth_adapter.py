"""Clerk authentication adapter for JWT verification and user management.

Uses clerk-backend-api >=6.0 which has:
  - users.update_metadata(user_id, public_metadata, ...) — sync
  - users.update_metadata_async(user_id, public_metadata, ...) — async
  - sessions.create_token(...) and JWT verify via jwks_verify
"""

import logging

import jwt

logger = logging.getLogger("ats_uce")


class ClerkAuthAdapter:
    """Adapter for verifying Clerk JWTs and managing user roles via publicMetadata."""

    def __init__(self, settings) -> None:
        self.settings = settings
        self._client = None
        self._jwks_client = None
        if settings.clerk_secret_key:
            from clerk_backend_api import Clerk

            self._client = Clerk(bearer_auth=settings.clerk_secret_key)

    async def _get_jwks_client(self):
        if self._jwks_client is not None:
            return self._jwks_client
        self._jwks_client = jwt.PyJWKClient(
            self.settings.clerk_jwks_url,
            cache_keys=True,
        )
        return self._jwks_client

    async def verify_token(self, token: str) -> dict:
        """Verify a Clerk session JWT and return the user payload.

        Uses PyJWT + PyJWKClient to validate the token against Clerk's JWKS endpoint,
        then extracts claims from the JWT payload.
        """
        if not self.settings.clerk_jwks_url:
            raise RuntimeError("CLERK_JWKS_URL is not configured")

        try:
            jwks_client = await self._get_jwks_client()
            signing_key = jwks_client.get_signing_key_from_jwt(token)

            claims = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                options={"verify_exp": True},
            )
            role = claims.get("public_metadata", {}).get("role", "") or claims.get("role", "")
            return {
                "user_id": claims.get("sub", ""),
                "email": claims.get("email", ""),
                "role": role,
            }
        except jwt.ExpiredSignatureError:
            raise RuntimeError("Token has expired")
        except jwt.InvalidTokenError as e:
            logger.error("Clerk token verification failed: %s", e)
            raise RuntimeError("Invalid or expired token") from e

    async def set_user_role(self, clerk_user_id: str, role: str) -> None:
        """Write role to Clerk user's publicMetadata via the Backend API."""
        if self._client is None:
            logger.info("DEV: Would set role '%s' for Clerk user '%s'", role, clerk_user_id)
            return

        await self._client.users.update_metadata_async(
            user_id=clerk_user_id,
            public_metadata={"role": role},
        )
        logger.info("Role '%s' set for Clerk user '%s'", role, clerk_user_id)
