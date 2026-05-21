"""Entity representing a job applicant linked to their external Clerk account."""
from dataclasses import dataclass, field
from datetime import UTC, datetime
from uuid import UUID, uuid4


@dataclass
class Applicant:
    clerk_user_id: str          # Clerk's external user identifier
    full_name: str
    email: str
    id: UUID = field(default_factory=uuid4)
    created_at: datetime = field(default_factory=lambda: datetime.now(UTC))
