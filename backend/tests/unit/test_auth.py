"""Unit tests for authentication DTOs and role validation logic."""

import pytest
from pydantic import ValidationError

from app.application.dtos.auth_dtos import RegisterRequest


class TestRegisterRequest:
    """Tests for the RegisterRequest DTO validation."""

    def test_valid_applicant_any_email(self):
        """Applicant role accepts any valid email."""
        req = RegisterRequest(
            clerk_user_id="test",
            first_name="A",
            last_name="B",
            email="user@gmail.com",
            role="applicant",
        )
        assert req.role == "applicant"
        assert req.email == "user@gmail.com"

    def test_valid_hr_institutional_email(self):
        """HR role accepts @uce.edu.ec emails."""
        req = RegisterRequest(
            clerk_user_id="test",
            first_name="A",
            last_name="B",
            email="rrhh@uce.edu.ec",
            role="human_resources",
        )
        assert req.role == "human_resources"

    def test_invalid_hr_gmail(self):
        """HR role rejects non-institutional emails."""
        with pytest.raises(ValidationError, match="institutional email"):
            RegisterRequest(
                clerk_user_id="test",
                first_name="A",
                last_name="B",
                email="rrhh@gmail.com",
                role="human_resources",
            )

    def test_valid_authorities_institutional_email(self):
        """Authorities role accepts @uce.edu.ec emails."""
        req = RegisterRequest(
            clerk_user_id="test",
            first_name="A",
            last_name="B",
            email="decano@uce.edu.ec",
            role="authorities",
        )
        assert req.role == "authorities"

    def test_invalid_authorities_gmail(self):
        """Authorities role rejects non-institutional emails."""
        with pytest.raises(ValidationError, match="institutional email"):
            RegisterRequest(
                clerk_user_id="test",
                first_name="A",
                last_name="B",
                email="decano@gmail.com",
                role="authorities",
            )

    def test_invalid_role_rejected(self):
        """administrator is not a valid role."""
        with pytest.raises(ValidationError, match="Invalid role"):
            RegisterRequest(
                clerk_user_id="test",
                first_name="A",
                last_name="B",
                email="admin@uce.edu.ec",
                role="administrator",
            )

    def test_invalid_role_typo(self):
        """hr_staff (old role string) is rejected."""
        with pytest.raises(ValidationError, match="Invalid role"):
            RegisterRequest(
                clerk_user_id="test",
                first_name="A",
                last_name="B",
                email="staff@uce.edu.ec",
                role="hr_staff",
            )
