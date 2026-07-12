"""Socket.IO event handlers for WebSocket auth and room management."""

from __future__ import annotations

import logging

from sqlalchemy import select

from app.infrastructure.adapters.clerk_auth_adapter import ClerkAuthAdapter
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.session import AsyncSessionLocal
from app.infrastructure.realtime.socketio_server import sio
from config import get_settings

logger = logging.getLogger(__name__)

ALLOWED_ROLES = {"human_resources", "authorities", "applicant"}


async def _resolve_role_from_local_db(user_id: str) -> str:
    if not user_id:
        return ""

    async with AsyncSessionLocal() as session:
        result = await session.execute(select(UserModel.role).where(UserModel.clerk_id == user_id))
        return result.scalar_one_or_none() or ""


@sio.event
async def connect(sid: str, environ: dict, auth: dict | None) -> bool:
    """Validate Clerk JWT from ``auth.token`` and join the role room.

    Returns ``False`` to reject the connection when:
    - No token is provided
    - The token is invalid or expired
    - The user's role is not ``human_resources``, ``authorities``, or ``applicant``
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
    if not role:
        try:
            role = await _resolve_role_from_local_db(claims.get("user_id", ""))
        except Exception:
            logger.warning("WebSocket connect rejected — role fallback failed (sid=%s)", sid)
            return False

    if role not in ALLOWED_ROLES:
        logger.warning("WebSocket connect rejected — role '%s' not allowed (sid=%s)", role, sid)
        return False

    clerk_id = claims.get("user_id", "")
    await sio.enter_room(sid, role)
    if clerk_id:
        await sio.enter_room(sid, f"user:{clerk_id}")
    logger.info("WebSocket client connected — sid=%s role=%s room=user:%s", sid, role, clerk_id)
    return True


@sio.event
async def disconnect(sid: str) -> None:
    logger.info("WebSocket client disconnected — sid=%s", sid)
