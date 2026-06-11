"""Entity defining a teaching position opening at UCE."""

from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID, uuid4


@dataclass
class Vacancy:
    title: str
    faculty: str
    department: str
    description: str
    requirements: str
    id: UUID = field(default_factory=uuid4)
    is_active: bool = True
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
