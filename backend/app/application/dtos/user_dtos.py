"""DTOs for the user role assignment endpoint."""
from pydantic import BaseModel, field_validator

ALLOWED_ROLES = {"applicant", "hr_staff", "authority"}


class SetRoleRequest(BaseModel):
    clerk_user_id: str
    role: str

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        if v not in ALLOWED_ROLES:
            raise ValueError(f"Invalid role '{v}'. Must be one of: {ALLOWED_ROLES}")
        return v


class SetRoleResponse(BaseModel):
    success: bool
    clerk_user_id: str
    role: str
    applicant_id: str | None = None
