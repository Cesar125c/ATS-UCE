from fastapi import APIRouter, Depends, Form, File, HTTPException, Query, UploadFile
import asyncio as _asyncio
from uuid import UUID

from app.api.dependencies import (
    require_role,
    get_submit_application_usecase,
    get_applicant_repository,
    get_review_ranking_usecase,
)
from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.application.use_cases.review_ranking import ReviewRankingUseCase
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.application.tasks.ai_scoring import process_ai_score_task

router = APIRouter()

_PDF_CONTENT_TYPES = {"application/pdf"}
_MAX_CV_SIZE_BYTES = 10_485_760  # 10 MB


@router.get("/")
async def list_applications(
    status: str = Query("HR_STAGE"),
    faculty: str | None = Query(None),
    min_score: float | None = Query(None, ge=0, le=100),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    _user: dict = Depends(require_role(["human_resources"])),
    use_case: ReviewRankingUseCase = Depends(get_review_ranking_usecase),
):
    """List applications filtered by status, faculty, score, with pagination."""
    result = await use_case.execute(
        status=status,
        faculty=faculty,
        min_score=min_score,
        page=page,
        page_size=page_size,
    )
    items = []
    for r in result["items"]:
        items.append({
            "id": r["id"],
            "applicant_id": r["applicant_id"],
            "applicant_name": r["applicant_name"],
            "applicant_email": r["applicant_email"],
            "vacancy_title": r["vacancy_title"],
            "vacancy_faculty": r["vacancy_faculty"],
            "status": r["status"],
            "score_total": r["score_total"],
            "score_academic": r["score_academic"],
            "score_experience": r["score_experience"],
            "score_production": r["score_production"],
            "score_profile_match": r["score_profile_match"],
            "score_languages": r["score_languages"],
            "evaluation_summary": r["evaluation_summary"],
            "cv_storage_key": r["cv_storage_key"],
            "submitted_at": r["submitted_at"],
        })
    return {
        "items": items,
        "total": result["total"],
        "page": result["page"],
        "page_size": result["page_size"],
        "pages": result["pages"],
    }


@router.get("/cv-presigned/{storage_key:path}")
async def get_cv_presigned_url(
    storage_key: str,
    _user: dict = Depends(require_role(["human_resources", "authorities"])),
) -> dict:
    """Generate a presigned URL for downloading a CV."""
    from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
    adapter = BackblazeStorageAdapter()
    url = await adapter.generate_presigned_url(storage_key)
    return {"url": url}


@router.post("/", status_code=201)
async def submit_application(
    vacancy_id: UUID = Form(...),
    cv_file: UploadFile = File(...),
    current_user: dict = Depends(require_role(["applicant"])),
    use_case: SubmitApplicationUseCase = Depends(get_submit_application_usecase),
    applicant_repo: SQLAApplicantRepository = Depends(get_applicant_repository),
):
    """Submit a new application with a CV PDF."""

    if cv_file.content_type not in _PDF_CONTENT_TYPES:
        raise HTTPException(status_code=422, detail="File must be a PDF under 10 MB")

    contents = await cv_file.read()
    if len(contents) > _MAX_CV_SIZE_BYTES:
        raise HTTPException(status_code=422, detail="File must be a PDF under 10 MB")

    applicant = await applicant_repo.find_by_clerk_user_id(current_user["user_id"])
    if applicant is None:
        raise HTTPException(status_code=404, detail="Applicant profile not found")

    application = await use_case.execute(applicant.id, vacancy_id, contents)

    # Fire-and-forget AI scoring in a truly independent task
    _asyncio.create_task(process_ai_score_task(application.id))

    return {
        "id": str(application.id),
        "applicant_id": str(application.applicant_id),
        "vacancy_id": str(application.vacancy_id),
        "status": application.status.value,
        "ai_score": None,
        "status_history": [],
        "created_at": application.created_at.isoformat(),
        "updated_at": application.updated_at.isoformat(),
    }
