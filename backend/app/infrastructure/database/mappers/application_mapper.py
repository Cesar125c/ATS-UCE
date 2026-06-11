"""Bidirectional mapper between ApplicationModel (ORM) and Application (Domain Entity)."""

from app.domain.entities.application import Application
from app.domain.value_objects.ai_score import AIScore
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.database.models.application_model import ApplicationModel


class ApplicationMapper:
    @staticmethod
    def to_domain(model: ApplicationModel) -> Application:
        """Convert an ORM model instance to a domain entity."""
        ai_score = None
        if model.score_total is not None:
            ai_score = AIScore(
                total=model.score_total,
                academic_training=model.score_academic or 0.0,
                experience=model.score_experience or 0.0,
                publications=model.score_production or 0.0,
                profile_match=model.score_profile_match or 0.0,
                languages_competencies=model.score_languages or 0.0,
                evaluation_summary=model.evaluation_summary or "",
            )
        return Application(
            id=model.id,
            applicant_id=model.applicant_id,
            vacancy_id=model.vacancy_id,
            cv_storage_key=model.cv_storage_key,
            status=FlowStatus(model.status),
            ai_score=ai_score,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    @staticmethod
    def to_model(entity: Application) -> ApplicationModel:
        """Convert a domain entity to an ORM model instance."""
        return ApplicationModel(
            id=entity.id,
            applicant_id=entity.applicant_id,
            vacancy_id=entity.vacancy_id,
            cv_storage_key=entity.cv_storage_key,
            status=entity.status.value,
            score_total=entity.ai_score.total if entity.ai_score else None,
            score_academic=entity.ai_score.academic_training if entity.ai_score else None,
            score_experience=entity.ai_score.experience if entity.ai_score else None,
            score_production=entity.ai_score.publications if entity.ai_score else None,
            score_profile_match=entity.ai_score.profile_match if entity.ai_score else None,
            score_languages=entity.ai_score.languages_competencies if entity.ai_score else None,
            evaluation_summary=entity.ai_score.evaluation_summary if entity.ai_score else None,
            created_at=entity.created_at,
            updated_at=entity.updated_at,
        )
