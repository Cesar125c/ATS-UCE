"""DTOs for authority decision use cases."""

from datetime import datetime

from pydantic import UUID4, BaseModel, model_validator

from app.domain.value_objects.evaluation_decision import EvaluationDecision


class EvaluationRequest(BaseModel):
    decision: EvaluationDecision
    observations: str = ""

    # ⚠️ IMPORTANT: Use model_validator(mode='after'), NOT field_validator.
    # With field_validator on 'observations', Pydantic v2 runs the validator
    # before 'decision' is available in info.data, so the check silently never fires.
    @model_validator(mode="after")
    def observations_required_on_rejection(self) -> "EvaluationRequest":
        if self.decision == EvaluationDecision.REJECTED and not self.observations.strip():
            raise ValueError("observations are required when decision is REJECTED")
        return self


class EvaluationResponse(BaseModel):
    id: UUID4
    application_id: UUID4
    reviewer_role: str
    decision: EvaluationDecision
    observations: str
    created_at: datetime
    model_config = {"from_attributes": True}
