"""Application endpoints — submit, list, and inspect job applications."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, UploadFile

from app.api.dependencies import (
    get_applicant_repository,
    get_application_repository,
    get_submit_application_usecase,
    require_role,
)
from app.application.dtos.application_dtos import (
    ApplicationListResponse,
    ApplicationResponse,
    PendingCountResponse,
)
from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository

router = APIRouter()

_PDF_CONTENT_TYPES = {"application/pdf"}
_MAX_CV_SIZE_BYTES = 10_485_760  # 10 MB


# ─── Route order: static paths MUST precede path params ───────────────────────


@router.get("/", response_model=ApplicationListResponse)
async def list_applications(
    page: int = 1,
    page_size: int = 20,
    faculty: str | None = None,
    min_score: float | None = None,
    _user: dict = Depends(require_role(["hr_staff"])),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> ApplicationListResponse:
    """Return paginated list of applications (Sprint 3)."""
    raise HTTPException(status_code=501, detail="Not implemented — Sprint 3")


@router.get("/pending-count", response_model=PendingCountResponse)
async def get_pending_count(
    _user: dict = Depends(require_role(["dean", "rector", "finance_director"])),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> PendingCountResponse:
    """Return the count of applications awaiting a decision (Sprint 3).

    ⚠️ This route MUST be declared before GET /{id} to prevent FastAPI
    from matching the literal string 'pending-count' as a UUID.
    """
    raise HTTPException(status_code=501, detail="Not implemented — Sprint 3")


@router.get("/{id}", response_model=ApplicationResponse)
async def get_application(
    id: UUID,
    _user: dict = Depends(require_role(["hr_staff", "dean", "rector", "finance_director"])),
    repo: SQLAApplicationRepository = Depends(get_application_repository),
) -> ApplicationResponse:
    """Return a single application by UUID (Sprint 3)."""
    raise HTTPException(status_code=501, detail="Not implemented — Sprint 3")


@router.post("/", response_model=ApplicationResponse, status_code=201)
async def submit_application(
    vacancy_id: UUID,
    cv_file: UploadFile,
    current_user: dict = Depends(require_role(["applicant"])),
    use_case: SubmitApplicationUseCase = Depends(get_submit_application_usecase),
    applicant_repo: SQLAApplicantRepository = Depends(get_applicant_repository),
) -> ApplicationResponse:
    """Submit a new application with a CV PDF.

    Accepts multipart/form-data: vacancy_id (UUID) + cv_file (UploadFile).
    """
    if cv_file.content_type not in _PDF_CONTENT_TYPES:
        raise HTTPException(status_code=422, detail="File must be a PDF under 10 MB")

    contents = await cv_file.read()
    if len(contents) > _MAX_CV_SIZE_BYTES:
        raise HTTPException(status_code=422, detail="File must be a PDF under 10 MB")

    applicant = await applicant_repo.find_by_clerk_user_id(current_user["user_id"])
    if applicant is None:
        raise HTTPException(status_code=404, detail="Applicant profile not found")

    application = await use_case.execute(applicant.id, vacancy_id, contents)
    return ApplicationResponse.model_validate(application)
