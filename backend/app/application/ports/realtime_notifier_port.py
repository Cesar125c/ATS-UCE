"""Realtime notification port — dispatches status-change events to connected clients."""

from abc import ABC, abstractmethod


class RealtimeNotifierPort(ABC):
    """Contract for notifying connected dashboard clients of application status changes.

    Implementations must never propagate exceptions — a failed notification
    must not block the business transaction that triggered it.
    """

    @abstractmethod
    async def notify_status_change(self, role: str, application_id: str, new_status: str) -> None:
        """Notify all clients in *role* room that an application changed status.

        Args:
            role: Room name matching the target role (e.g. ``"human_resources"``).
            application_id: UUID string of the affected application.
            new_status: ``FlowStatus`` value (e.g. ``"HR_STAGE"``).
        """
        ...
