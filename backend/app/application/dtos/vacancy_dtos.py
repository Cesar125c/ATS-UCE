"""DTOs for vacancy endpoints."""

from pydantic import BaseModel, Field


class VacancyCreateRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    faculty: str = Field(..., max_length=200)
    department: str = Field("", max_length=200)
    description: str = Field("", max_length=2000)
    requirements: str = Field("", max_length=2000)


class VacancyResponse(BaseModel):
    id: str
    title: str
    faculty: str
    department: str
    is_active: bool

    model_config = {"from_attributes": True}
