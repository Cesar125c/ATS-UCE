"""Contract for Application persistence. Lives in Domain so Use Cases stay decoupled from SQL."""

from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.entities.application import Application
from app.domain.entities.evaluation import Evaluation
from app.domain.entities.status_history import StatusHistory
from app.domain.value_objects.flow_status import FlowStatus


class IApplicationRepository(ABC):
    @abstractmethod
    async def find_by_id(self, id: UUID) -> Application | None: ...

    @abstractmethod
    async def find_by_applicant_id(self, applicant_id: UUID) -> list[Application]: ...

    @abstractmethod
    async def find_by_status(
        self, status: FlowStatus, page: int, page_size: int
    ) -> tuple[list[Application], int]:
        """Returns (items, total_count)."""
        ...

    @abstractmethod
    async def count_by_status(self, status: FlowStatus) -> int: ...

    @abstractmethod
    async def get_stats(self) -> dict:
        """Must return a dict with these exact keys:
        { "total_applicants": int, "avg_score": float, "in_progress": int, "completed": int }
        in_progress = count of applications NOT in HIRED or REJECTED
        completed = count of applications in HIRED
        """
        ...

    @abstractmethod
    async def save(self, application: Application) -> Application: ...

    @abstractmethod
    async def create_status_history(self, entry: StatusHistory) -> None: ...

    @abstractmethod
    async def save_evaluation(self, evaluation: Evaluation) -> None: ...
