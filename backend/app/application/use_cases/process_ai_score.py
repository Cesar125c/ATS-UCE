import asyncio
import logging
from datetime import UTC, datetime
from uuid import UUID, uuid4

from app.domain.entities.application import Application
from app.domain.entities.status_history import StatusHistory
from app.domain.repositories.i_application_repository import IApplicationRepository
from app.domain.repositories.i_vacancy_repository import IVacancyRepository
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.adapters.backblaze_storage_adapter import (
    BackblazeStorageAdapter,
    StorageError,
)
from app.infrastructure.adapters.groq_analysis_adapter import AIUnavailableError
from app.infrastructure.adapters.resend_email_adapter import ResendEmailAdapter as EmailService

logger = logging.getLogger(__name__)


class ProcessAIScoreUseCase:
    def __init__(
        self,
        application_repo: IApplicationRepository,
        vacancy_repo: IVacancyRepository,
        analysis_adapter,  # GeminiAnalysisAdapter or OpenAIAnalysisAdapter
        storage_adapter: BackblazeStorageAdapter = None,
        email_service: EmailService = None,
        realtime_notifier=None,
        extracted_text: str | None = None,
    ) -> None:
        self._application_repo = application_repo
        self._vacancy_repo = vacancy_repo
        self._analysis_adapter = analysis_adapter
        self._storage_adapter = storage_adapter
        self._email_service = email_service
        self._realtime_notifier = realtime_notifier
        self._pre_extracted_text = extracted_text

    async def execute(self, application_id: UUID) -> None:
        # 1. Update status to PROCESSING_AI
        application = await self._update_status_to_processing(application_id)

        # 2. Download PDF from B2
        pdf_bytes = await self._download_pdf(application.cv_storage_key)
        if pdf_bytes is None:
            return  # Storage failure already logged

        # 3. Extract text from PDF (use Wasm pre-extracted text if available)
        if self._pre_extracted_text:
            text = self._pre_extracted_text
            logger.info("Using pre-extracted text (Wasm) for application %s", application.id)
        else:
            text = await self._extract_text_from_pdf(pdf_bytes, application.id)
            if text is None or not text.strip():
                await self._reject_application(application, "CV_NOT_READABLE")
                return

        # 4. Fetch vacancy for prompt context
        vacancy = await self._vacancy_repo.find_by_id(application.vacancy_id)
        if not vacancy:
            raise ValueError(f"Vacancy {application.vacancy_id} not found")

        # 5. Analyze with OpenAI — retries are inside analyze_cv_with_fallback
        try:
            ai_score = await self._analysis_adapter.analyze_cv_with_fallback(
                cv_text=text,
                vacancy_title=vacancy.title,
                vacancy_faculty=vacancy.faculty,
            )
            application.assign_ai_score(ai_score)
            await self._application_repo.save(application)

            if application.status == FlowStatus.HR_STAGE and self._realtime_notifier is not None:
                await self._realtime_notifier.notify_status_change(
                    role=application.status.required_role(),
                    application_id=str(application.id),
                    new_status=FlowStatus.HR_STAGE.value,
                )
        except AIUnavailableError as exc:
            # After all retries exhausted: persist error_reason, keep status PROCESSING_AI
            application.error_reason = "OPENAI_UNAVAILABLE"
            history_entry = StatusHistory(
                id=uuid4(),
                application_id=application.id,
                status=application.status,
                transitioned_at=datetime.now(UTC),
            )
            await self._application_repo.save(application)
            await self._application_repo.create_status_history(history_entry)
            logger.error("OpenAI unavailable for application %s: %s", application.id, exc)
            return  # no re-raise

    # ---------------------------------------------------------------------------
    # Private helpers
    # ---------------------------------------------------------------------------

    async def _update_status_to_processing(self, application_id: UUID) -> Application:
        application = await self._application_repo.find_by_id(application_id)
        if not application:
            raise ValueError(f"Application {application_id} not found")
        application.status = FlowStatus.PROCESSING_AI
        await self._application_repo.save(application)
        status_history = StatusHistory(
            application_id=application_id,
            status=FlowStatus.PROCESSING_AI,
        )
        await self._application_repo.create_status_history(status_history)
        return application

    async def _download_pdf(self, cv_storage_key: str) -> bytes | None:
        try:
            return await self._storage_adapter.download_file(cv_storage_key)
        except StorageError as exc:
            logger.error("Failed to download PDF from storage: %s", type(exc).__name__)
            return None

    async def _extract_text_from_pdf(self, pdf_bytes: bytes, application_id: UUID) -> str | None:
        try:
            text = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: self._sync_extract_text(pdf_bytes),
            )
            if not text.strip():
                logger.warning("Empty text extracted from PDF for application %s", application_id)
                return None
            return text
        except Exception:
            logger.exception("Failed to extract text from PDF for application %s", application_id)
            return None

    @staticmethod
    def _sync_extract_text(pdf_bytes: bytes) -> str:
        import fitz  # PyMuPDF

        text = ""
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
            for page in doc:
                text += page.get_text()
        return text

    async def _reject_application(self, application: Application, reason: str) -> None:
        application.status = FlowStatus.REJECTED
        application.error_reason = reason
        await self._application_repo.save(application)
        status_history = StatusHistory(
            application_id=application.id,
            status=FlowStatus.REJECTED,
        )
        await self._application_repo.create_status_history(status_history)
        await self._email_service.send_rejection_notification(
            application.applicant_id,
            reason="CV is not readable",
        )
