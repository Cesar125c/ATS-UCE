import asyncio
import logging
from uuid import UUID

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.adapters.groq_analysis_adapter import GroqAnalysisAdapter
from app.infrastructure.adapters.resend_email_adapter import ResendEmailAdapter
from app.infrastructure.database.session import AsyncSessionLocal
from app.infrastructure.realtime.socketio_notifier import SocketIONotifier
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository

logger = logging.getLogger("ats_uce")


async def process_ai_score_task(
    application_id: UUID,
    extracted_text: str | None = None,
):
    """Background task for AI scoring of applications.
    Retries up to 3 times with increasing delay to handle the race condition
    where the submit transaction hasn't committed yet.
    """
    for attempt in range(3):
        await asyncio.sleep(0.5 * (attempt + 1))
        async with AsyncSessionLocal() as session:
            repo = SQLAApplicationRepository(session)
            vacancy_repo = SQLAVacancyRepository(session)
            analysis_adapter = GroqAnalysisAdapter()
            storage_adapter = BackblazeStorageAdapter()
            email_service = ResendEmailAdapter()
            realtime_notifier = SocketIONotifier()
            use_case = ProcessAIScoreUseCase(
                repo,
                vacancy_repo,
                analysis_adapter,
                storage_adapter,
                email_service,
                realtime_notifier,
                extracted_text=extracted_text,
            )
            try:
                await use_case.execute(application_id)
                await session.commit()
                return
            except ValueError as e:
                await session.rollback()
                if "not found" in str(e) and attempt < 2:
                    logger.debug(
                        "Application %s not visible yet, retry %d/3", application_id, attempt + 1
                    )
                    continue
                raise
            except Exception:
                await session.rollback()
                raise
