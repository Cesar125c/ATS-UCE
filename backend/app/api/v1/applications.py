from fastapi import APIRouter, Depends, HTTPException, UploadFile, BackgroundTasks
from fastapi.security import HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.api.dependencies import get_current_user, require_role, get_submit_application_usecase, get_applicant_repository
from app.application.dtos.application_dtos import ApplicationResponse
from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.application.tasks.ai_scoring import process_ai_score_task

router = APIRouter()

_PDF_CONTENT_TYPES = {"application/pdf"}
_MAX_CV_SIZE_BYTES = 10_485_760  # 10 MB

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
