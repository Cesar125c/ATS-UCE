"""Use case: Submit a new application with CV upload. Implemented in Sprint 2."""


class SubmitApplicationUseCase:
    """Handles the submission of a new job application, including CV upload to Backblaze B2."""

    async def execute(self, applicant_id: str, vacancy_id: str, cv_file: bytes) -> dict:
        raise NotImplementedError("SubmitApplicationUseCase — Sprint 2")
