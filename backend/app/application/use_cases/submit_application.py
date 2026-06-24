from uuid import UUID

from app.domain.entities.application import Application
from app.domain.entities.status_history import StatusHistory
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository

class SubmitApplicationUseCase:
    def __init__(
        self,
        application_repo: SQLAApplicationRepository,
        applicant_repo: SQLAApplicantRepository,
        vacancy_repo: SQLAVacancyRepository,
        storage_adapter: BackblazeStorageAdapter,
    ):
        self.application_repo = application_repo
        self.applicant_repo = applicant_repo
        self.vacancy_repo = vacancy_repo
        self.storage_adapter = storage_adapter

    async def execute(
        self,
        applicant_id: UUID,
        vacancy_id: UUID,
        cv_content: bytes,
    ) -> Application:
        # Verify vacancy exists and is active
        vacancy = await self.vacancy_repo.find_by_id(vacancy_id)
        if vacancy is None or not vacancy.is_active:
            raise ValueError("Vacancy not found or not active")
        
        # Generate storage key
        application_id = UUID(int=0)  # Placeholder; will be replaced after creation
        storage_key = f"cvs/{applicant_id}/{application_id}.pdf"
        
        # Upload PDF to B2
        await self.storage_adapter.upload_file(
            key=storage_key,
            content=cv_content,
            content_type="application/pdf",
        )
        
        # Create application record
        application = Application(
            applicant_id=applicant_id,
            vacancy_id=vacancy_id,
            cv_storage_key=storage_key,
            status=FlowStatus.RECEIVED,
        )
        
        # Persist application and status history
        application = await self.application_repo.create(application)
        
        # Update storage key with actual application_id
        storage_key = f"cvs/{applicant_id}/{application.id}.pdf"
        application.cv_storage_key = storage_key
        await self.application_repo.update(application)
        
        # Upload PDF with correct key
        await self.storage_adapter.upload_file(
            key=storage_key,
            content=cv_content,
            content_type="application/pdf",
        )
        
        # Create status history
        status_history = StatusHistory(
            application_id=application.id,
            status=FlowStatus.RECEIVED,
        )
        await self.application_repo.create_status_history(status_history)
        
        return application
