"""Applicant-facing endpoints — allows applicants to check their own application status."""

from fastapi import APIRouter, Depends, HTTPException

from app.api.dependencies import get_applicant_repository, get_application_repository, require_role
from app.application.dtos.application_dtos import ApplicationResponse
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository

router = APIRouter()


def _to_response(model) -> ApplicationResponse:
    """Map an ORM ApplicationModel (with eager-loaded status_history) to ApplicationResponse."""
    return ApplicationResponse(
        id=model.id,
        applicant_id=model.applicant_id,
        vacancy_id=model.vacancy_id,
        status=model.status,
        ai_score={
            "total": model.score_total,
            "academic_training": model.score_academic or 0.0,
            "experience": model.score_experience or 0.0,
            "publications": model.score_production or 0.0,
            "profile_match": model.score_profile_match or 0.0,
            "languages_competencies": model.score_languages or 0.0,
            "evaluation_summary": model.evaluation_summary or "",
            "grade": _compute_grade(model.score_total),
        } if model.score_total is not None else None,
        status_history=[
            {"status": sh.status, "transitioned_at": sh.transitioned_at}
            for sh in (model.status_history or [])
        ],
        created_at=model.created_at,
        updated_at=model.updated_at,
    )


def _compute_grade(total: float | None) -> str:
    if total is None:
        return "INSUFFICIENT"
    if total >= 85:
        return "EXCELLENT"
    if total >= 70:
        return "GOOD"
    if total >= 60:
        return "ACCEPTABLE"
    return "INSUFFICIENT"


@router.get("/me/status", response_model=list[ApplicationResponse])
async def get_my_application_status(
    current_user: dict = Depends(require_role(["applicant"])),
    applicant_repo: SQLAApplicantRepository = Depends(get_applicant_repository),
    app_repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> list[ApplicationResponse]:
    """Return all applications belonging to the authenticated applicant.

    Includes status_history for the stepper UI.
    Endpoint path: /api/v1/applicants/me/status
    """
    applicant = await applicant_repo.find_by_clerk_user_id(current_user["user_id"])
    if applicant is None:
        return []

    models = await app_repo.find_models_by_applicant_id(applicant.id)
    return [_to_response(m) for m in models]
