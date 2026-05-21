"""Contract for Vacancy persistence. Lives in Domain so Use Cases stay decoupled from SQL."""
from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.vacancy import Vacancy


class IVacancyRepository(ABC):

    @abstractmethod
    async def find_by_id(self, id: UUID) -> Vacancy | None: ...

    @abstractmethod
    async def find_all_active(self) -> list[Vacancy]: ...

    @abstractmethod
    async def save(self, vacancy: Vacancy) -> Vacancy: ...
