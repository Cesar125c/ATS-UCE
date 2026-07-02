"""DTOs for vacancy endpoints."""

from pydantic import BaseModel


class VacancyCreateRequest(BaseModel):
    title: str
    faculty: str
    department: str = ""
    description: str = ""
    requirements: str = ""


class VacancyResponse(BaseModel):
    id: str
    title: str
    faculty: str
    department: str
    is_active: bool

    model_config = {"from_attributes": True}
