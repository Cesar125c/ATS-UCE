"""Socket.IO event handlers for WebSocket auth and room management."""

from __future__ import annotations

import logging

from app.infrastructure.adapters.clerk_auth_adapter import ClerkAuthAdapter
from app.infrastructure.realtime.socketio_server import sio
from config import get_settings

logger = logging.getLogger(__name__)

ALLOWED_ROLES = {"human_resources", "authorities"}


@sio.event
async def connect(sid: str, environ: dict, auth: dict | None) -> bool:
    """Validate Clerk JWT from ``auth.token`` and join the role room.

    Returns ``False`` to reject the connection when:
    - No token is provided
    - The token is invalid or expired
    - The user's role is not ``human_resources`` or ``authorities``
    """
    if not auth or not auth.get("token"):
        logger.warning("WebSocket connect rejected — missing auth.token (sid=%s)", sid)
        return False

    token = auth["token"]
    settings = get_settings()

    try:
        adapter = ClerkAuthAdapter(settings)
        claims = await adapter.verify_token(token)
    except Exception as exc:
        logger.warning(
            "WebSocket connect rejected — token verification failed (sid=%s): %s", sid, exc
        )
        return False

    role = claims.get("role", "")
    if role not in ALLOWED_ROLES:
        logger.warning("WebSocket connect rejected — role '%s' not allowed (sid=%s)", role, sid)
        return False

    await sio.enter_room(sid, role)
    logger.info("WebSocket client connected — sid=%s role=%s", sid, role)
    return True


@sio.event
async def disconnect(sid: str) -> None:
    logger.info("WebSocket client disconnected — sid=%s", sid)
