from uuid import UUID

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIAnalysisAdapter
from app.infrastructure.adapters.resend_email_adapter import ResendEmailAdapter
from app.infrastructure.database.session import AsyncSessionLocal
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository


async def process_ai_score_task(application_id: UUID):
    """Background task for AI scoring of applications."""
    async with AsyncSessionLocal() as session:
        repo = SQLAApplicationRepository(session)
        vacancy_repo = SQLAVacancyRepository(session)
        analysis_adapter = OpenAIAnalysisAdapter()
        storage_adapter = BackblazeStorageAdapter()
        email_service = ResendEmailAdapter()
        use_case = ProcessAIScoreUseCase(
            repo, vacancy_repo, analysis_adapter, storage_adapter, email_service
        )
        try:
            await use_case.execute(application_id)
        except Exception as e:
            raise e
