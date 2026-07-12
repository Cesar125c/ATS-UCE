"""Realtime notification port — dispatches status-change events to connected clients."""

from abc import ABC, abstractmethod


class RealtimeNotifierPort(ABC):
    """Contract for notifying connected dashboard clients of application status changes.

    Implementations must never propagate exceptions — a failed notification
    must not block the business transaction that triggered it.
    """

    @abstractmethod
    async def notify_status_change(
        self,
        role: str,
        application_id: str,
        new_status: str,
        *,
        applicant_clerk_id: str | None = None,
    ) -> None:
        """Notify all clients in *role* room that an application changed status.

        When *applicant_clerk_id* is provided, also emit to ``user:<id>`` room
        so the applicant who owns the application receives a real-time notification.

        Args:
            role: Room name matching the target role (e.g. ``"human_resources"``).
            application_id: UUID string of the affected application.
            new_status: ``FlowStatus`` value (e.g. ``"HR_STAGE"``).
            applicant_clerk_id: Optional Clerk user ID of the applicant who owns this application.
        """
        ...
