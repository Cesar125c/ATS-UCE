"""Socket.IO adapter implementing the RealtimeNotifierPort."""

from __future__ import annotations

import logging
from datetime import UTC, datetime

import socketio

from app.application.ports.realtime_notifier_port import RealtimeNotifierPort
from app.infrastructure.realtime.socketio_server import sio

logger = logging.getLogger(__name__)


class SocketIONotifier(RealtimeNotifierPort):
    """Notifies connected dashboard clients via Socket.IO rooms keyed by role.

    Failures are logged and swallowed — a dropped real-time event must never
    break the underlying business transaction.
    """

    def __init__(self, sio_server: socketio.AsyncServer | None = None) -> None:
        self._sio = sio_server or sio

    async def notify_status_change(
        self,
        role: str,
        application_id: str,
        new_status: str,
        *,
        applicant_clerk_id: str | None = None,
    ) -> None:
        payload = {
            "application_id": application_id,
            "new_status": new_status,
            "timestamp": datetime.now(UTC).isoformat(),
        }
        try:
            await self._sio.emit("status_change", payload, room=role)
            if applicant_clerk_id:
                await self._sio.emit("status_change", payload, room=f"user:{applicant_clerk_id}")
            logger.info(
                "Realtime notification sent — room=%s user_room=%s application_id=%s new_status=%s",
                role,
                f"user:{applicant_clerk_id}" if applicant_clerk_id else None,
                application_id,
                new_status,
            )
        except Exception as exc:
            logger.error(
                "Failed to send realtime notification — room=%s application_id=%s: %s",
                role,
                application_id,
                exc,
            )
