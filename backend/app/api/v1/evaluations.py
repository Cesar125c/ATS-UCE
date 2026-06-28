"""Evaluation endpoints — authority decision recording for the multi-stage approval flow."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_application_repository, get_record_authority_decision_usecase, require_role
from app.application.dtos.evaluation_dtos import EvaluationRequest, EvaluationResponse
from app.application.use_cases.record_authority_decision import RecordAuthorityDecisionUseCase
from app.domain.exceptions import DomainError
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository

router = APIRouter()


@router.post(
    "/applications/{application_id}/evaluations",
    response_model=EvaluationResponse,
    status_code=201,
)
async def create_evaluation(
    application_id: UUID,
    body: EvaluationRequest,
    current_user: dict = Depends(require_role(["human_resources", "authorities"])),
    use_case: RecordAuthorityDecisionUseCase = Depends(get_record_authority_decision_usecase),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> EvaluationResponse:
    """Record an authority decision (APPROVED/REJECTED) on an application.

    Path: /api/v1/applications/{application_id}/evaluations
    """
    try:
        result = await use_case.execute(
            application_id=application_id,
            reviewer_clerk_id=current_user["user_id"],
            reviewer_role=current_user["role"],
            decision=body.decision.value,
            observations=body.observations,
        )
        return EvaluationResponse(**result)
    except DomainError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
