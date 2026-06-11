"""DTOs for authentication endpoints."""

from pydantic import BaseModel, EmailStr, field_validator, model_validator

VALID_ROLES = {"applicant", "human_resources", "authorities"}
INSTITUTIONAL_DOMAIN = "@uce.edu.ec"
INSTITUTIONAL_ROLES = {"human_resources", "authorities"}


class RegisterRequest(BaseModel):
    clerk_user_id: str
    first_name: str
    last_name: str
    email: EmailStr
    role: str

    @field_validator("role")
    @classmethod
    def role_must_be_valid(cls, v: str) -> str:
        if v not in VALID_ROLES:
            raise ValueError(
                f"Invalid role '{v}'. Must be one of: {sorted(VALID_ROLES)}"
            )
        return v

    @model_validator(mode="after")
    def email_must_match_role(self) -> "RegisterRequest":
        if self.role in INSTITUTIONAL_ROLES:
            if not self.email.lower().endswith(INSTITUTIONAL_DOMAIN):
                raise ValueError(
                    f"Role '{self.role}' requires an institutional email "
                    f"({INSTITUTIONAL_DOMAIN}). Got: {self.email}"
                )
        return self


class RegisterResponse(BaseModel):
    success: bool
    message: str
    user_id: str
    role: str