"""Defines the valid lifecycle states of an Application and their transitions."""
from enum import StrEnum


class FlowStatus(StrEnum):
    RECEIVED = "RECEIVED"
    PROCESSING_AI = "PROCESSING_AI"
    HR_STAGE = "HR_STAGE"
    DEAN_STAGE = "DEAN_STAGE"
    RECTOR_STAGE = "RECTOR_STAGE"
    FINANCE_STAGE = "FINANCE_STAGE"
    HIRED = "HIRED"
    REJECTED = "REJECTED"

    def next_status(self) -> "FlowStatus":
        _transitions: dict[FlowStatus, FlowStatus] = {
            FlowStatus.RECEIVED: FlowStatus.PROCESSING_AI,
            FlowStatus.PROCESSING_AI: FlowStatus.HR_STAGE,
            FlowStatus.HR_STAGE: FlowStatus.DEAN_STAGE,
            FlowStatus.DEAN_STAGE: FlowStatus.RECTOR_STAGE,
            FlowStatus.RECTOR_STAGE: FlowStatus.FINANCE_STAGE,
            FlowStatus.FINANCE_STAGE: FlowStatus.HIRED,
        }
        if self not in _transitions:
            raise ValueError(f"Cannot advance from terminal status: {self.value}")
        return _transitions[self]

    def required_role(self) -> str:
        _roles: dict[FlowStatus, str] = {
            FlowStatus.HR_STAGE: "hr_staff",
            FlowStatus.DEAN_STAGE: "dean",
            FlowStatus.RECTOR_STAGE: "rector",
            FlowStatus.FINANCE_STAGE: "finance_director",
        }
        return _roles.get(self, "")

    @property
    def is_terminal(self) -> bool:
        return self in (FlowStatus.HIRED, FlowStatus.REJECTED)
