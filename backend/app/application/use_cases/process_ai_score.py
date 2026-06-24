from uuid import UUID
import asyncio
import logging
from typing import Optional

from uuid import UUID
from typing import Optional
import asyncio
import logging

from app.domain.entities.application import Application
from app.domain.entities.status_history import StatusHistory
from app.domain.value_objects.flow_status import FlowStatus
from app.domain.value_objects.ai_score import AIScore
from app.domain.repositories.i_application_repository import IApplicationRepository
from app.domain.repositories.i_vacancy_repository import IVacancyRepository
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIAnalysisAdapter
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter, StorageError
from app.infrastructure.adapters.email_service import EmailService

logger = logging.getLogger(__name__)

class ProcessAIScoreUseCase:
    def __init__(
        self,
        application_repo: IApplicationRepository,
        vacancy_repo: IVacancyRepository,
        analysis_adapter: OpenAIAnalysisAdapter,
        storage_adapter: BackblazeStorageAdapter,
        email_service: EmailService,
    ) -> None:
        self._application_repo = application_repo
        self._vacancy_repo = vacancy_repo
        self._analysis_adapter = analysis_adapter
        self._storage_adapter = storage_adapter
        self._email_service = email_service

    async def execute(self, application_id: UUID) -> None:
        # 1. Update status to PROCESSING_AI
        application = await self._update_status_to_processing(application_id)
        
        # 2. Download PDF from B2
        pdf_bytes = await self._download_pdf(application.cv_storage_key)
        if pdf_bytes is None:
            return  # Storage failure handled in _download_pdf
        
        # 3. Extract text from PDF
        text = await self._extract_text_from_pdf(pdf_bytes)
        if text is None:
            await self._reject_application(application, "CV_NOT_READABLE")
            return  # Unreadable PDF handled in _extract_text_from_pdf
        
        # 4. Analyze text with OpenAI
        ai_score = await self._analyze_text_with_openai(text, application.vacancy_id)
        
        # 5. Update application status based on AI score
        await self._update_application_status(application, ai_score)

    async def _update_status_to_processing(self, application_id: UUID) -> Application:
        """Update application status to PROCESSING_AI and create status history."""
        application = await self._application_repo.find_by_id(application_id)
        if not application:
            raise ValueError(f"Application {application_id} not found")
        
        application.status = FlowStatus.PROCESSING_AI
        await self._application_repo.update(application)
        
        status_history = StatusHistory(
            application_id=application_id,
            status=FlowStatus.PROCESSING_AI,
        )
        await self._application_repo.create_status_history(status_history)
        
        return application

    async def _download_pdf(self, cv_storage_key: str) -> Optional[bytes]:
        """Download PDF from Backblaze B2.
        
        Returns:
            bytes: PDF content if successful.
            None: If download fails.
        """
        try:
            return await self._storage_adapter.download_file(cv_storage_key)
        except StorageError as e:
            logger.error(f"Failed to download PDF {cv_storage_key}: {e}")
            return None

    async def _extract_text_from_pdf(self, pdf_bytes: bytes) -> Optional[str]:
        """Extract text from PDF bytes using PyMuPDF.
        
        Returns:
            str: Extracted text if successful.
            None: If PDF is unreadable or extraction fails.
        """
        try:
            # Use asyncio.run_in_executor for CPU-bound PyMuPDF operation
            text = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self._sync_extract_text(pdf_bytes)
            )
            
            # Validate extracted text
            if not text.strip():
                logger.warning(f"Empty text extracted from PDF for application {application.id}")
                return None
                
            return text
            
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {e}")
            return None

    @staticmethod
    def _sync_extract_text(pdf_bytes: bytes) -> str:
        """Synchronous text extraction with PyMuPDF."""
        import fitz  # PyMuPDF
        
        text = ""
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        
        return text

    async def _analyze_text_with_openai(self, text: str, vacancy_id: UUID) -> AIScore:
        """Analyze text with OpenAI and return AIScore."""
        vacancy = await self._vacancy_repo.find_by_id(vacancy_id)
        if not vacancy:
            raise ValueError(f"Vacancy {vacancy_id} not found")
        
        ai_score = await self._analysis_adapter.analyze_cv_with_fallback(
            text, vacancy, application, self._application_repo
        )
        
        return AIScore(
            total=score_data["total"],
            academic_training=score_data["academic_training"],
            experience=score_data["experience"],
            publications=score_data["publications"],
            profile_match=score_data["profile_match"],
            languages_competencies=score_data["languages_competencies"],
            evaluation_summary=score_data["evaluation_summary"][:200],
        )

    async def _update_application_status(self, application: Application, ai_score: AIScore) -> None:
        """Update application status based on AI score."""
        application.assign_ai_score(ai_score)
        await self._application_repo.update(application)

    async def _reject_application(self, application: Application, reason: str) -> None:
        """Reject application and send notification."""
        application.status = FlowStatus.REJECTED
        application.error_reason = reason
        await self._application_repo.update(application)
        
        status_history = StatusHistory(
            application_id=application.id,
            status=FlowStatus.REJECTED,
        )
        await self._application_repo.create_status_history(status_history)
        
        # Trigger email notification
        await self._email_service.send_rejection_notification(
            application.applicant_id,
            reason="CV is not readable",
        )
