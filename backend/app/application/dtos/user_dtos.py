"""DTOs for user endpoints."""

from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class UserResponse(BaseModel):
    id: UUID
    email: str
    first_name: str = Field(..., max_length=100)
    last_name: str = Field(..., max_length=100)
    role: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)
