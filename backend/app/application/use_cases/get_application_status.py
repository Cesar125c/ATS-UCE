"""Use case: Retrieve an applicant's application status with stepper history."""

from app.domain.repositories.i_applicant_repository import IApplicantRepository
from app.domain.repositories.i_application_repository import IApplicationRepository
from app.domain.repositories.i_vacancy_repository import IVacancyRepository


class GetApplicationStatusUseCase:
    """Returns all applications for an applicant with full status history and vacancy details."""

    def __init__(
        self,
        applicant_repo: IApplicantRepository,
        application_repo: IApplicationRepository,
        vacancy_repo: IVacancyRepository,
    ) -> None:
        self._applicant_repo = applicant_repo
        self._application_repo = application_repo
        self._vacancy_repo = vacancy_repo

    async def execute(self, clerk_user_id: str) -> list[dict]:
        applicant = await self._applicant_repo.find_by_clerk_user_id(clerk_user_id)
        if applicant is None:
            return []

        applications = await self._application_repo.find_by_applicant_id(applicant.id)
        result: list[dict] = []

        for app in applications:
            vacancy = await self._vacancy_repo.find_by_id(app.vacancy_id)
            score = app.ai_score
            status_history_entries = (
                await self._application_repo.find_status_history_by_application_id(app.id)
            )

            result.append(
                {
                    "id": str(app.id),
                    "vacancy_id": str(app.vacancy_id),
                    "vacancy_title": vacancy.title if vacancy else "",
                    "vacancy_faculty": vacancy.faculty if vacancy else "",
                    "status": app.status.value,
                    "ai_score": (
                        {
                            "total": score.total,
                            "score_academic": score.academic_training,
                            "score_experience": score.experience,
                            "score_production": score.production,
                            "score_profile_match": score.profile_match,
                            "score_languages": score.languages_competencies,
                            "evaluation_summary": score.evaluation_summary,
                            "is_preselected": score.is_preselected,
                            "grade": score.grade,
                        }
                        if score
                        else None
                    ),
                    "error_reason": app.error_reason,
                    "status_history": [
                        {
                            "status": h.status.value,
                            "transitioned_at": h.transitioned_at.isoformat(),
                        }
                        for h in sorted(status_history_entries, key=lambda e: e.transitioned_at)
                    ],
                    "submitted_at": app.created_at.isoformat(),
                }
            )

        return result
