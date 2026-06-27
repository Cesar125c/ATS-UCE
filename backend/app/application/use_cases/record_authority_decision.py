"""Use case: Record authority APPROVED/REJECTED decision and advance workflow."""

from datetime import UTC, datetime
from uuid import UUID

from app.domain.entities.evaluation import Evaluation
from app.domain.entities.status_history import StatusHistory
from app.domain.exceptions import DomainError
from app.domain.repositories.i_application_repository import IApplicationRepository
from app.domain.services.workflow_approval_service import WorkflowApprovalService
from app.domain.value_objects.evaluation_decision import EvaluationDecision


class RecordAuthorityDecisionUseCase:
    """Persists an Evaluation and delegates state transition to WorkflowApprovalService."""

    def __init__(
        self,
        application_repo: IApplicationRepository,
        workflow_service: WorkflowApprovalService,
    ) -> None:
        self._application_repo = application_repo
        self._workflow_service = workflow_service

    async def execute(
        self,
        application_id: UUID,
        reviewer_clerk_id: str,
        reviewer_role: str,
        decision: str,
        observations: str,
    ) -> dict:
        application = await self._application_repo.find_by_id(application_id)
        if application is None:
            raise DomainError("Application not found")

        self._workflow_service.validate_role_for_status(reviewer_role, application.status)

        evaluation = Evaluation(
            application_id=application_id,
            reviewer_clerk_id=reviewer_clerk_id,
            reviewer_role=reviewer_role,
            decision=EvaluationDecision(decision),
            observations=observations,
        )

        application = self._workflow_service.process_decision(application, evaluation)
        application.updated_at = datetime.now(UTC)

        await self._application_repo.save(application)

        await self._application_repo.save_evaluation(evaluation)

        status_entry = StatusHistory(
            application_id=application.id,
            status=application.status,
        )
        await self._application_repo.create_status_history(status_entry)

        return {
            "id": str(evaluation.id),
            "application_id": str(application_id),
            "reviewer_role": reviewer_role,
            "decision": decision,
            "observations": observations,
            "created_at": evaluation.created_at.isoformat(),
        }
