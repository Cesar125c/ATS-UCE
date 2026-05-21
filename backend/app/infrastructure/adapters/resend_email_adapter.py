"""Resend transactional email adapter for application notifications. Implemented in Sprint 2."""


class ResendEmailAdapter:
    """Adapter for sending email notifications via Resend API."""

    async def send_application_received(self, to_email: str, applicant_name: str) -> None:
        raise NotImplementedError("ResendEmailAdapter.send_application_received — Sprint 2")

    async def send_status_update(
        self, to_email: str, applicant_name: str, new_status: str
    ) -> None:
        raise NotImplementedError("ResendEmailAdapter.send_status_update — Sprint 2")
