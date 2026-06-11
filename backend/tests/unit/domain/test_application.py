"""Unit tests for the Application aggregate root."""

import time
from uuid import uuid4

import pytest

from app.domain.entities.application import Application
from app.domain.value_objects.ai_score import AIScore
from app.domain.value_objects.flow_status import FlowStatus


def _low_score() -> AIScore:
    return AIScore(
        total=45.0,
        academic_training=40.0,
        experience=50.0,
        publications=40.0,
        profile_match=45.0,
        languages_competencies=50.0,
        evaluation_summary="Insufficient qualifications.",
    )


def test_initial_status_is_received() -> None:
    app = Application(applicant_id=uuid4(), vacancy_id=uuid4(), cv_storage_key="cvs/cv.pdf")
    assert app.status == FlowStatus.RECEIVED


def test_assign_preselected_score_advances_to_hr(
    application_in_received: Application,
    valid_ai_score: AIScore,
) -> None:
    application_in_received.assign_ai_score(valid_ai_score)
    assert application_in_received.status == FlowStatus.HR_STAGE
    assert application_in_received.ai_score is not None


def test_assign_low_score_rejects(application_in_received: Application) -> None:
    application_in_received.assign_ai_score(_low_score())
    assert application_in_received.status == FlowStatus.REJECTED


def test_advance_flow_hr_to_dean(application_in_hr_stage: Application) -> None:
    application_in_hr_stage.advance_flow()
    assert application_in_hr_stage.status == FlowStatus.DEAN_STAGE


def test_advance_flow_full_chain(application_in_hr_stage: Application) -> None:
    """Advance from HR_STAGE all the way to HIRED (4 more steps)."""
    application_in_hr_stage.advance_flow()  # → DEAN_STAGE
    application_in_hr_stage.advance_flow()  # → RECTOR_STAGE
    application_in_hr_stage.advance_flow()  # → FINANCE_STAGE
    application_in_hr_stage.advance_flow()  # → HIRED
    assert application_in_hr_stage.status == FlowStatus.HIRED


def test_advance_from_hired_raises(application_in_hr_stage: Application) -> None:
    application_in_hr_stage.advance_flow()  # DEAN
    application_in_hr_stage.advance_flow()  # RECTOR
    application_in_hr_stage.advance_flow()  # FINANCE
    application_in_hr_stage.advance_flow()  # HIRED
    with pytest.raises(ValueError, match="finalized"):
        application_in_hr_stage.advance_flow()


def test_advance_from_rejected_raises(application_in_received: Application) -> None:
    application_in_received.assign_ai_score(_low_score())  # → REJECTED
    with pytest.raises(ValueError, match="finalized"):
        application_in_received.advance_flow()


def test_reject_from_hr_stage(application_in_hr_stage: Application) -> None:
    application_in_hr_stage.reject()
    assert application_in_hr_stage.status == FlowStatus.REJECTED


def test_updated_at_changes_after_advance(application_in_hr_stage: Application) -> None:
    before = application_in_hr_stage.updated_at
    time.sleep(0.001)
    application_in_hr_stage.advance_flow()
    assert application_in_hr_stage.updated_at > before
