from uuid import UUID

from app.domain.entities.application import Application
from app.domain.repositories.i_applicant_repository import IApplicantRepository
from app.domain.repositories.i_application_repository import IApplicationRepository
from app.domain.repositories.i_vacancy_repository import IVacancyRepository
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter


class SubmitApplicationUseCase:
    def __init__(
        self,
        application_repo: IApplicationRepository,
        applicant_repo: IApplicantRepository,
        vacancy_repo: IVacancyRepository,
        storage_adapter: BackblazeStorageAdapter,
    ) -> None:
        self._application_repo = application_repo
        self._applicant_repo = applicant_repo
        self._vacancy_repo = vacancy_repo
        self._storage_adapter = storage_adapter

    async def execute(self, applicant_id: UUID, vacancy_id: UUID, cv_file: bytes) -> Application:
        applicant = await self._applicant_repo.find_by_id(applicant_id)
        if applicant is None:
            raise ValueError(f"Applicant {applicant_id} not found")

        vacancy = await self._vacancy_repo.find_by_id(vacancy_id)
        if vacancy is None:
            raise ValueError(f"Vacancy {vacancy_id} not found")
        if not vacancy.is_active:
            raise ValueError(f"Vacancy {vacancy_id} is not active")

        cv_storage_key = f"cvs/{applicant_id}/{vacancy_id}.pdf"
        await self._storage_adapter.upload_cv(cv_file, cv_storage_key)

        application = Application(
            applicant_id=applicant_id,
            vacancy_id=vacancy_id,
            cv_storage_key=cv_storage_key,
        )

        saved = await self._application_repo.save(application)
        return saved
