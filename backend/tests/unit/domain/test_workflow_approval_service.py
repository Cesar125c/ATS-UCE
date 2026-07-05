import pytest
from uuid import uuid4

from app.domain.entities.application import Application
from app.domain.entities.evaluation import Evaluation
from app.domain.exceptions import DomainError
from app.domain.services.workflow_approval_service import WorkflowApprovalService
from app.domain.value_objects.evaluation_decision import EvaluationDecision
from app.domain.value_objects.flow_status import FlowStatus


def test_validate_role_for_status_invalid_role_raises_domain_error() -> None:
    service = WorkflowApprovalService()
    with pytest.raises(DomainError) as exc_info:
        service.validate_role_for_status("authorities", FlowStatus.HR_STAGE)
    message = str(exc_info.value)
    assert "authorities" in message
    assert "HR_STAGE" in message


@pytest.mark.parametrize(
    "stage",
    [FlowStatus.HR_STAGE, FlowStatus.DEAN_STAGE, FlowStatus.RECTOR_STAGE, FlowStatus.FINANCE_STAGE],
)
def test_reject_at_any_stage_sets_terminal_rejected(stage: FlowStatus) -> None:
    service = WorkflowApprovalService()
    app = Application(applicant_id=uuid4(), vacancy_id=uuid4(), cv_storage_key="cvs/test.pdf")
    while app.status != stage:
        app.advance_flow()
    role = "human_resources" if stage == FlowStatus.HR_STAGE else "authorities"
    evaluation = Evaluation(
        application_id=app.id,
        reviewer_clerk_id="clerk_1",
        reviewer_role=role,
        decision=EvaluationDecision.REJECTED,
        observations="Does not meet requirements",
    )
    service.process_decision(app, evaluation)
    assert app.status == FlowStatus.REJECTED
    assert app.status.is_terminal is True
    with pytest.raises(ValueError):
        app.advance_flow()


def test_full_approval_flow_through_all_stages_to_hired(
    application_in_hr_stage: Application,
) -> None:
    service = WorkflowApprovalService()
    app = application_in_hr_stage

    stages = [
        (FlowStatus.DEAN_STAGE, "human_resources"),
        (FlowStatus.RECTOR_STAGE, "authorities"),
        (FlowStatus.FINANCE_STAGE, "authorities"),
        (FlowStatus.HIRED, "authorities"),
    ]
    for expected_status, role in stages:
        evaluation = Evaluation(
            application_id=app.id,
            reviewer_clerk_id="clerk_1",
            reviewer_role=role,
            decision=EvaluationDecision.APPROVED,
            observations="Approved",
        )
        service.process_decision(app, evaluation)
        assert app.status == expected_status

    assert app.status == FlowStatus.HIRED
    assert app.status.is_terminal is True
