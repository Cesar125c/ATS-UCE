"""Use case: Retrieve ranked applications for HR review with filtering and pagination."""

from app.domain.repositories.i_application_repository import IApplicationRepository


class ReviewRankingUseCase:
    """Returns paginated, ranked list of applications with filters for the dashboard view."""

    def __init__(self, application_repo: IApplicationRepository) -> None:
        self._repo = application_repo

    async def execute(
        self,
        status: str = "HR_STAGE",
        faculty: str | None = None,
        min_score: float | None = None,
        page: int = 1,
        page_size: int = 20,
    ) -> dict:
        from math import ceil

        models, total = await self._repo.find_models_with_joins(
            status=status,
            faculty=faculty,
            min_score=min_score,
            page=page,
            page_size=page_size,
        )

        items = []
        for m in models:
            applicant = m.applicant
            user = applicant.user if applicant else None
            vacancy = m.vacancy

            items.append(
                {
                    "id": str(m.id),
                    "applicant_id": str(m.applicant_id),
                    "applicant_name": f"{user.first_name} {user.last_name}" if user else "",
                    "applicant_email": user.email if user else "",
                    "vacancy_title": vacancy.title if vacancy else "",
                    "vacancy_faculty": vacancy.faculty if vacancy else "",
                    "status": m.status,
                    "score_total": m.score_total,
                    "score_academic": m.score_academic,
                    "score_experience": m.score_experience,
                    "score_production": m.score_production,
                    "score_profile_match": m.score_profile_match,
                    "score_languages": m.score_languages,
                    "evaluation_summary": m.evaluation_summary,
                    "cv_storage_key": m.cv_storage_key,
                    "submitted_at": m.created_at.isoformat(),
                }
            )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "pages": ceil(total / page_size) if page_size > 0 else 0,
        }
