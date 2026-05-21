"""Contract for Applicant persistence. Lives in Domain so Use Cases stay decoupled from SQL."""
from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.applicant import Applicant


class IApplicantRepository(ABC):

    @abstractmethod
    async def find_by_id(self, id: UUID) -> Applicant | None: ...

    @abstractmethod
    async def find_by_clerk_user_id(self, clerk_user_id: str) -> Applicant | None: ...

    @abstractmethod
    async def find_by_email(self, email: str) -> Applicant | None: ...

    @abstractmethod
    async def save(self, applicant: Applicant) -> Applicant: ...
