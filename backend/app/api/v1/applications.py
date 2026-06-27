from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, BackgroundTasks
from uuid import UUID

from app.api.dependencies import get_current_user, require_role, get_submit_application_usecase, get_applicant_repository, get_application_repository
from app.application.dtos.application_dtos import ApplicationResponse, ApplicationListResponse
from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.domain.value_objects.flow_status import FlowStatus
from app.application.tasks.ai_scoring import process_ai_score_task

router = APIRouter()

_PDF_CONTENT_TYPES = {"application/pdf"}
_MAX_CV_SIZE_BYTES = 10_485_760  # 10 MB


def _to_response(model) -> ApplicationResponse:
    """Map an ORM ApplicationModel (with eager-loaded status_history) to ApplicationResponse."""
    score = model.score_total
    return ApplicationResponse(
        id=model.id,
        applicant_id=model.applicant_id,
        vacancy_id=model.vacancy_id,
        status=model.status,
        ai_score={
            "total": score,
            "academic_training": model.score_academic or 0.0,
            "experience": model.score_experience or 0.0,
            "publications": model.score_production or 0.0,
            "profile_match": model.score_profile_match or 0.0,
            "languages_competencies": model.score_languages or 0.0,
            "evaluation_summary": model.evaluation_summary or "",
            "grade": _compute_grade(score),
        } if score is not None else None,
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


@router.get("/", response_model=ApplicationListResponse)
async def list_applications(
    status: FlowStatus | None = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(4, ge=1, le=50),
    _user: dict = Depends(require_role(["hr_staff"])),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> ApplicationListResponse:
    """List applications filtered by optional status, with pagination."""
    models, total = await repo.find_models_by_status(status, page, page_size)
    items = [_to_response(m) for m in models]
    return ApplicationListResponse(items=items, total=total, page=page, page_size=page_size)

@router.post("/", response_model=ApplicationResponse, status_code=201)
async def submit_application(
    vacancy_id: UUID,
    cv_file: UploadFile,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_role(["applicant"])),
    use_case: SubmitApplicationUseCase = Depends(get_submit_application_usecase),
    applicant_repo: SQLAApplicantRepository = Depends(get_applicant_repository),
) -> ApplicationResponse:
    """Submit a new application with a CV PDF."""
    
    # Validation
    if cv_file.content_type not in _PDF_CONTENT_TYPES:
        raise HTTPException(status_code=422, detail="File must be a PDF under 10 MB")
    
    contents = await cv_file.read()
    if len(contents) > _MAX_CV_SIZE_BYTES:
        raise HTTPException(status_code=422, detail="File must be a PDF under 10 MB")
    
    # Verify applicant exists
    applicant = await applicant_repo.find_by_clerk_user_id(current_user["user_id"])
    if applicant is None:
        raise HTTPException(status_code=404, detail="Applicant profile not found")
    
    # Execute use case
    application = await use_case.execute(applicant.id, vacancy_id, contents)
    
    # Trigger background task (fire-and-forget)
    background_tasks.add_task(process_ai_score_task, application.id)
    
    return ApplicationResponse.model_validate(application)
