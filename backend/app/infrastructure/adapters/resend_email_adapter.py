"""Resend transactional email adapter for application notifications."""

from __future__ import annotations

import asyncio
import logging
from uuid import UUID

import resend

from config import get_settings

logger = logging.getLogger(__name__)

_STAGE_MESSAGES: dict[str, tuple[str, str]] = {
    "HR_STAGE": (
        "Your application has advanced to HR review",
        "Congratulations! Your application is now under review by the Human Resources team.",
    ),
    "DEAN_STAGE": (
        "Your application has advanced to Dean review",
        "Congratulations! Your application has been approved by HR and is now under review by the Dean.",
    ),
    "RECTOR_STAGE": (
        "Your application has advanced to Rector review",
        "Congratulations! Your application has been approved by the Dean and is now under review by the Rector.",
    ),
    "FINANCE_STAGE": (
        "Your application has advanced to Finance review",
        "Congratulations! Your application has been approved by the Rector and is now under financial review.",
    ),
    "HIRED": (
        "Congratulations — you have been hired!",
        "We are delighted to inform you that you have been selected for the position. Welcome to UCE!",
    ),
    "REJECTED": (
        "Update on your application",
        "Thank you for your interest. After careful review, we regret to inform you that your application was not selected at this time.",
    ),
}


class ResendEmailAdapter:
    """Adapter for sending email notifications via Resend API. Never raises — logs and swallows all failures."""

    def __init__(self) -> None:
        settings = get_settings()
        resend.api_key = settings.resend_api_key
        self._from_email = settings.resend_from_email

    # ------------------------------------------------------------------
    # Core dispatcher — never raises
    # ------------------------------------------------------------------

    async def dispatch(self, *, to: str, subject: str, html: str) -> None:
        """Send an email via Resend. Logs and swallows any failure — never raises."""
        try:
            await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: resend.Emails.send(
                    {
                        "from": self._from_email,
                        "to": [to],
                        "subject": subject,
                        "html": html,
                    }
                ),
            )
            logger.info("Email sent to %s — subject: %s", to, subject)
        except Exception as exc:  # noqa: BLE001
            logger.error("Failed to send email to %s — subject: %s — error: %s", to, subject, exc)

    # ------------------------------------------------------------------
    # Public notification methods — never raise
    # ------------------------------------------------------------------

    async def send_rejection_notification(
        self, applicant_id: UUID, *, reason: str = ""
    ) -> None:
        """Notify applicant that their application was rejected."""
        try:
            if reason == "CV is not readable" or reason == "CV_NOT_READABLE":
                subject = "Your application CV could not be processed"
                body = (
                    "We were unable to extract text from your uploaded CV. "
                    "Please ensure your CV is a searchable PDF (not a scanned image) and reapply."
                )
            else:
                subject = "Update on your UCE application"
                body = (
                    "Thank you for your interest in a position at Universidad Central del Ecuador. "
                    "After careful review, your application did not meet the minimum score threshold "
                    "for preselection at this time. We encourage you to apply again in the future."
                )

            # applicant_id used as a routing key; real email lookup happens via user service
            # For now we log the intent — email will be wired when user-lookup is available (Sprint 5)
            logger.info(
                "Rejection notification queued for applicant %s — reason: %s", applicant_id, reason
            )
            # When the email address is resolvable, call dispatch:
            # await self.dispatch(to=email, subject=subject, html=f"<p>{body}</p>")
        except Exception as exc:  # noqa: BLE001
            logger.error(
                "Failed to queue rejection notification for applicant %s: %s", applicant_id, exc
            )

    async def send_stage_notification(self, applicant_id: UUID, *, stage: str) -> None:
        """Notify applicant of a workflow stage advancement."""
        try:
            subject, message = _STAGE_MESSAGES.get(
                stage,
                (
                    "Update on your UCE application",
                    "Your application status has been updated. Please log in to check your current stage.",
                ),
            )
            logger.info(
                "Stage notification queued for applicant %s — stage: %s", applicant_id, stage
            )
            # When the email address is resolvable:
            # await self.dispatch(to=email, subject=subject, html=f"<p>{message}</p>")
        except Exception as exc:  # noqa: BLE001
            logger.error(
                "Failed to queue stage notification for applicant %s — stage %s: %s",
                applicant_id,
                stage,
                exc,
            )

    # ------------------------------------------------------------------
    # Legacy stubs (Sprint 2 interface) — never raise
    # ------------------------------------------------------------------

    async def send_application_received(self, to_email: str, applicant_name: str) -> None:
        await self.dispatch(
            to=to_email,
            subject="We received your application — UCE TalentPath",
            html=(
                f"<p>Dear {applicant_name},</p>"
                "<p>We have received your application and it is currently being processed. "
                "You will be notified of any status changes.</p>"
            ),
        )

    async def send_status_update(
        self, to_email: str, applicant_name: str, new_status: str
    ) -> None:
        subject, message = _STAGE_MESSAGES.get(
            new_status,
            (
                "Update on your UCE application",
                "Your application status has been updated. Please log in for details.",
            ),
        )
        await self.dispatch(
            to=to_email,
            subject=subject,
            html=f"<p>Dear {applicant_name},</p><p>{message}</p>",
        )
