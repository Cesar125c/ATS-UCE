"""Evaluation endpoints — authority decision recording for the multi-stage approval flow."""
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_application_repository, require_role
from app.application.dtos.evaluation_dtos import EvaluationRequest, EvaluationResponse
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
    current_user: dict = Depends(
        require_role(["hr_staff", "dean", "rector", "finance_director"])
    ),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> EvaluationResponse:
    """Record an authority decision (APPROVED/REJECTED) on an application (Sprint 3).

    Path: /api/v1/applications/{application_id}/evaluations
    """
    raise HTTPException(status_code=501, detail="Not implemented — Sprint 3")
