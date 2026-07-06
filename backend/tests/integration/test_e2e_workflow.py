"""Integration test for the full approval workflow.

Tests: RECEIVED → AI → HR → DEAN → RECTOR → FINANCE → HIRED.
Mocks external services (Groq, B2, Resend).
"""

from unittest.mock import AsyncMock, MagicMock
from uuid import UUID

import pytest

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.application.use_cases.record_authority_decision import RecordAuthorityDecisionUseCase
from app.application.use_cases.submit_application import SubmitApplicationUseCase
from app.domain.services.workflow_approval_service import WorkflowApprovalService
from app.domain.value_objects.ai_score import AIScore
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter
from app.infrastructure.repositories.sqla_applicant_repository import SQLAApplicantRepository
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository


@pytest.mark.integration
async def test_full_approval_workflow_hr_to_hired(
    app_repo: SQLAApplicationRepository,
    application_refs: tuple[UUID, UUID, str],
) -> None:
    applicant_id, vacancy_id, clerk_id = application_refs

    storage = MagicMock(spec=BackblazeStorageAdapter)
    storage.upload_file = AsyncMock()

    import fitz

    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((100, 700), "CV content for E2E workflow test")
    pdf_bytes = doc.tobytes()
    doc.close()
    storage.download_file = AsyncMock(return_value=pdf_bytes)

    # 1. Submit
    submit_uc = SubmitApplicationUseCase(
        application_repo=app_repo,
        applicant_repo=SQLAApplicantRepository(app_repo._session),
        vacancy_repo=SQLAVacancyRepository(app_repo._session),
        storage_adapter=storage,
    )
    app = await submit_uc.execute(applicant_id, vacancy_id, b"fake pdf")
    assert app.status == FlowStatus.RECEIVED

    # 2. AI scoring → HR_STAGE
    mock_analysis = MagicMock()
    mock_analysis.analyze_cv_with_fallback = AsyncMock(
        return_value=AIScore(
            total=82.0,
            academic_training=85.0,
            experience=80.0,
            publications=75.0,
            profile_match=88.0,
            languages_competencies=82.0,
            evaluation_summary="Excellent.",
        )
    )
    ai_uc = ProcessAIScoreUseCase(
        application_repo=app_repo,
        vacancy_repo=SQLAVacancyRepository(app_repo._session),
        analysis_adapter=mock_analysis,
        storage_adapter=storage,
        email_service=AsyncMock(),
    )
    await ai_uc.execute(app.id)
    app = await app_repo.find_by_id(app.id)
    assert app is not None
    assert app.status == FlowStatus.HR_STAGE

    # 3. HR approves → DEAN_STAGE
    decision_uc = RecordAuthorityDecisionUseCase(app_repo, WorkflowApprovalService())
    await decision_uc.execute(
        application_id=app.id,
        reviewer_clerk_id=f"hr-{clerk_id}",
        reviewer_role="human_resources",
        decision="APPROVED",
        observations="Good candidate for interview.",
    )
    app = await app_repo.find_by_id(app.id)
    assert app is not None
    assert app.status == FlowStatus.DEAN_STAGE

    # 4. Authority approves at DEAN_STAGE → RECTOR_STAGE
    await decision_uc.execute(
        application_id=app.id,
        reviewer_clerk_id=f"auth-{clerk_id}",
        reviewer_role="authorities",
        decision="APPROVED",
        observations="Approved by authorities.",
    )
    app = await app_repo.find_by_id(app.id)
    assert app is not None
    assert app.status == FlowStatus.RECTOR_STAGE

    # 5. Authority approves at RECTOR_STAGE → FINANCE_STAGE
    await decision_uc.execute(
        application_id=app.id,
        reviewer_clerk_id=f"auth-{clerk_id}",
        reviewer_role="authorities",
        decision="APPROVED",
        observations="Approved by authorities.",
    )
    app = await app_repo.find_by_id(app.id)
    assert app is not None
    assert app.status == FlowStatus.FINANCE_STAGE

    # 6. Authority approves at FINANCE_STAGE → HIRED
    await decision_uc.execute(
        application_id=app.id,
        reviewer_clerk_id=f"auth-{clerk_id}",
        reviewer_role="authorities",
        decision="APPROVED",
        observations="Approved by authorities.",
    )
    app = await app_repo.find_by_id(app.id)
    assert app is not None
    assert app.status == FlowStatus.HIRED
    assert app.status.is_terminal is True
