"""Unit tests for FlowStatus value object."""
import pytest

from app.domain.value_objects.flow_status import FlowStatus


def test_next_status_full_sequence() -> None:
    """Verify the complete chain from RECEIVED all the way to HIRED."""
    assert FlowStatus.RECEIVED.next_status() == FlowStatus.PROCESSING_AI
    assert FlowStatus.PROCESSING_AI.next_status() == FlowStatus.HR_STAGE
    assert FlowStatus.HR_STAGE.next_status() == FlowStatus.DEAN_STAGE
    assert FlowStatus.DEAN_STAGE.next_status() == FlowStatus.RECTOR_STAGE
    assert FlowStatus.RECTOR_STAGE.next_status() == FlowStatus.FINANCE_STAGE
    assert FlowStatus.FINANCE_STAGE.next_status() == FlowStatus.HIRED


def test_next_status_from_hired_raises() -> None:
    with pytest.raises(ValueError, match="terminal"):
        FlowStatus.HIRED.next_status()


def test_next_status_from_rejected_raises() -> None:
    with pytest.raises(ValueError, match="terminal"):
        FlowStatus.REJECTED.next_status()


def test_is_terminal_hired() -> None:
    assert FlowStatus.HIRED.is_terminal is True


def test_is_terminal_rejected() -> None:
    assert FlowStatus.REJECTED.is_terminal is True


def test_is_terminal_active() -> None:
    assert FlowStatus.HR_STAGE.is_terminal is False


def test_required_role_mapping() -> None:
    assert FlowStatus.HR_STAGE.required_role() == "hr_staff"
    assert FlowStatus.DEAN_STAGE.required_role() == "dean"
    assert FlowStatus.RECTOR_STAGE.required_role() == "rector"
    assert FlowStatus.FINANCE_STAGE.required_role() == "finance_director"
    assert FlowStatus.RECEIVED.required_role() == ""
