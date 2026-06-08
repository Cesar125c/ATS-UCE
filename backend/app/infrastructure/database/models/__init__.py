"""Import all ORM models so SQLAlchemy's registry discovers them before mapper configuration."""
from app.infrastructure.database.models.applicant_model import ApplicantModel
from app.infrastructure.database.models.application_model import ApplicationModel
from app.infrastructure.database.models.evaluation_model import EvaluationModel
from app.infrastructure.database.models.status_history_model import StatusHistoryModel
from app.infrastructure.database.models.vacancy_model import VacancyModel

__all__ = [
    "ApplicantModel",
    "ApplicationModel",
    "EvaluationModel",
    "StatusHistoryModel",
    "VacancyModel",
]