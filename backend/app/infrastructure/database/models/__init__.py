# Import order matters: EvaluationModel must come before ApplicationModel
# because ApplicationModel has a relationship() referencing EvaluationModel.
from app.infrastructure.database.models.user_model import UserModel  # noqa: F401
from app.infrastructure.database.models.vacancy_model import VacancyModel  # noqa: F401
from app.infrastructure.database.models.evaluation_model import EvaluationModel  # noqa: F401
from app.infrastructure.database.models.application_model import ApplicationModel  # noqa: F401
from app.infrastructure.database.models.applicant_model import ApplicantModel  # noqa: F401
from app.infrastructure.database.models.status_history_model import StatusHistoryModel  # noqa: F401
