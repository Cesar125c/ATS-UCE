"""Use case: Retrieve an applicant's application status with stepper history. Sprint 3."""


class GetApplicationStatusUseCase:
    """Returns all applications for an applicant with full status history for the stepper UI."""

    async def execute(self, clerk_user_id: str) -> list[dict]:
        raise NotImplementedError("GetApplicationStatusUseCase — Sprint 3")
