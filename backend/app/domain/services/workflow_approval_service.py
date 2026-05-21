"""Pure domain service orchestrating authority decisions. No framework dependencies."""
from app.domain.entities.application import Application
from app.domain.entities.evaluation import Evaluation
from app.domain.value_objects.evaluation_decision import EvaluationDecision
from app.domain.value_objects.flow_status import FlowStatus


class WorkflowApprovalService:

    def process_decision(self, application: Application, evaluation: Evaluation) -> Application:
        if evaluation.decision == EvaluationDecision.APPROVED:
            application.advance_flow()
        else:
            application.reject()
        return application

    def get_required_role(self, status: FlowStatus) -> str:
        return status.required_role()

    def validate_role_for_status(self, role: str, status: FlowStatus) -> bool:
        return role == status.required_role()
