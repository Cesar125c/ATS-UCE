"""Import all models so SQLAlchemy's declarative base discovers them."""

from app.infrastructure.database.models.applicant_model import ApplicantModel
from app.infrastructure.database.models.application_model import ApplicationModel
from app.infrastructure.database.models.evaluation_model import EvaluationModel
from app.infrastructure.database.models.status_history_model import StatusHistoryModel
from app.infrastructure.database.models.user_model import UserModel
from app.infrastructure.database.models.vacancy_model import VacancyModel

__all__ = [
    "ApplicantModel",
    "ApplicationModel",
    "EvaluationModel",
    "StatusHistoryModel",
    "UserModel",
    "VacancyModel",
]
