from uuid import UUID

from uuid import UUID

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.infrastructure.database.session import get_db_session
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIAnalysisAdapter

async def process_ai_score_task(application_id: UUID):
    """Background task for AI scoring of applications."""
    async with get_db_session() as session:  # OWN AsyncSession
        repo = SQLAApplicationRepository(session)
        vacancy_repo = SQLAVacancyRepository(session)
        analysis_adapter = OpenAIAnalysisAdapter()
        use_case = ProcessAIScoreUseCase(repo, vacancy_repo, analysis_adapter)
        try:
            await use_case.execute(application_id)
        except Exception as e:
            # Log error and retry (handled by BackgroundTask framework)
            raise e
