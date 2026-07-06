import pytest
from pydantic import ValidationError

from app.api.v1.users import SetRoleRequest
from app.application.dtos.auth_dtos import RegisterRequest
from app.application.dtos.evaluation_dtos import EvaluationRequest
from app.application.dtos.vacancy_dtos import VacancyCreateRequest
from app.domain.value_objects.evaluation_decision import EvaluationDecision


class TestEvaluationRequest:
    def test_observations_max_length_exceeded_raises(self) -> None:
        long_obs = "x" * 2001
        with pytest.raises(ValidationError) as exc_info:
            EvaluationRequest(decision=EvaluationDecision.APPROVED, observations=long_obs)
        assert "observations" in str(exc_info.value)

    def test_observations_max_length_exact_passes(self) -> None:
        exact = "x" * 2000
        req = EvaluationRequest(decision=EvaluationDecision.APPROVED, observations=exact)
        assert len(req.observations) == 2000

    def test_observations_stripped_before_validation(self) -> None:
        req = EvaluationRequest(decision=EvaluationDecision.APPROVED, observations="  ok  ")
        assert req.observations == "ok"

    def test_rejected_without_observations_raises(self) -> None:
        with pytest.raises(ValidationError) as exc_info:
            EvaluationRequest(decision=EvaluationDecision.REJECTED, observations="")
        assert "observations are required" in str(exc_info.value)

    def test_rejected_with_whitespace_only_raises(self) -> None:
        with pytest.raises(ValidationError) as exc_info:
            EvaluationRequest(decision=EvaluationDecision.REJECTED, observations="   ")
        assert "observations are required" in str(exc_info.value)


class TestRegisterRequest:
    def test_first_name_max_length_exceeded_raises(self) -> None:
        long_name = "a" * 101
        with pytest.raises(ValidationError) as exc_info:
            RegisterRequest(
                clerk_user_id="user_1",
                first_name=long_name,
                last_name="Doe",
                email="test@example.com",
                role="applicant",
            )
        assert "first_name" in str(exc_info.value)

    def test_last_name_max_length_exceeded_raises(self) -> None:
        long_name = "b" * 101
        with pytest.raises(ValidationError) as exc_info:
            RegisterRequest(
                clerk_user_id="user_1",
                first_name="John",
                last_name=long_name,
                email="test@example.com",
                role="applicant",
            )
        assert "last_name" in str(exc_info.value)

    def test_first_name_max_length_exact_passes(self) -> None:
        exact = "a" * 100
        req = RegisterRequest(
            clerk_user_id="user_1",
            first_name=exact,
            last_name="Doe",
            email="test@example.com",
            role="applicant",
        )
        assert len(req.first_name) == 100


class TestSetRoleRequest:
    def test_invalid_role_raises(self) -> None:
        with pytest.raises(ValidationError) as exc_info:
            SetRoleRequest(clerkUserId="user_1", role="admin")
        assert "Invalid role" in str(exc_info.value)

    def test_valid_role_passes(self) -> None:
        req = SetRoleRequest(clerkUserId="user_1", role="applicant")
        assert req.role == "applicant"

    def test_first_name_max_length_exceeded_raises(self) -> None:
        with pytest.raises(ValidationError) as exc_info:
            SetRoleRequest(clerkUserId="user_1", role="applicant", firstName="a" * 101)
        assert "firstName" in str(exc_info.value)

    def test_last_name_max_length_exceeded_raises(self) -> None:
        with pytest.raises(ValidationError) as exc_info:
            SetRoleRequest(clerkUserId="user_1", role="applicant", lastName="b" * 101)
        assert "lastName" in str(exc_info.value)


class TestVacancyCreateRequest:
    def test_title_min_length_raises(self) -> None:
        with pytest.raises(ValidationError) as exc_info:
            VacancyCreateRequest(title="ab", faculty="Engineering")
        assert "title" in str(exc_info.value)

    def test_title_max_length_exceeded_raises(self) -> None:
        with pytest.raises(ValidationError) as exc_info:
            VacancyCreateRequest(title="a" * 201, faculty="Engineering")
        assert "title" in str(exc_info.value)

    def test_description_max_length_exceeded_raises(self) -> None:
        with pytest.raises(ValidationError) as exc_info:
            VacancyCreateRequest(title="Professor", faculty="Engineering", description="x" * 2001)
        assert "description" in str(exc_info.value)

    def test_valid_vacancy_passes(self) -> None:
        req = VacancyCreateRequest(title="Professor", faculty="Engineering")
        assert req.title == "Professor"
        assert req.faculty == "Engineering"
