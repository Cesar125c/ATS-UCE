"""Use case: Trigger OpenAI CV analysis and assign AI score. Implemented in Sprint 2."""


class ProcessAIScoreUseCase:
    """Sends CV text to OpenAI, constructs AIScore, and persists it on the Application."""

    async def execute(self, application_id: str) -> dict:
        raise NotImplementedError("ProcessAIScoreUseCase — Sprint 2")
