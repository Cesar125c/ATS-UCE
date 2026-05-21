"""Use case: Record authority APPROVED/REJECTED decision and advance workflow. Sprint 3."""


class RecordAuthorityDecisionUseCase:
    """Persists an Evaluation and delegates state transition to WorkflowApprovalService."""

    async def execute(
        self, application_id: str, reviewer_clerk_id: str, reviewer_role: str,
        decision: str, observations: str
    ) -> dict:
        raise NotImplementedError("RecordAuthorityDecisionUseCase — Sprint 3")
