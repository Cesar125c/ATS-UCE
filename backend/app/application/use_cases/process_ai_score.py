from uuid import UUID

from app.domain.entities.application import Application
from app.domain.repositories.i_application_repository import IApplicationRepository
from app.domain.repositories.i_vacancy_repository import IVacancyRepository
from app.domain.value_objects.ai_score import AIScore
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIAnalysisAdapter


class ProcessAIScoreUseCase:
    def __init__(
        self,
        application_repo: IApplicationRepository,
        vacancy_repo: IVacancyRepository,
        analysis_adapter: OpenAIAnalysisAdapter,
    ) -> None:
        self._application_repo = application_repo
        self._vacancy_repo = vacancy_repo
        self._analysis_adapter = analysis_adapter

    async def execute(self, application_id: UUID, cv_text: str) -> Application:
        application = await self._application_repo.find_by_id(application_id)
        if application is None:
            raise ValueError(f"Application {application_id} not found")

        vacancy = await self._vacancy_repo.find_by_id(application.vacancy_id)
        if vacancy is None:
            raise ValueError(
                f"Vacancy {application.vacancy_id} not found for application {application_id}"
            )

        score_data = await self._analysis_adapter.analyze_cv(cv_text, vacancy.requirements)

        ai_score = AIScore(
            total=score_data["total"],
            academic_training=score_data["academic_training"],
            experience=score_data["experience"],
            publications=score_data["publications"],
            profile_match=score_data["profile_match"],
            languages_competencies=score_data["languages_competencies"],
            evaluation_summary=score_data["evaluation_summary"][:200],
        )

        application.assign_ai_score(ai_score)

        saved = await self._application_repo.save(application)
        return saved
