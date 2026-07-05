"""Integration test for PDF text extraction — verifies PyMuPDF extracts real text."""

from unittest.mock import AsyncMock
from uuid import UUID

import pytest

from app.application.use_cases.process_ai_score import ProcessAIScoreUseCase
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository
from app.infrastructure.repositories.sqla_vacancy_repository import SQLAVacancyRepository


@pytest.mark.integration
async def test_reject_on_unreadable_pdf(
    app_repo: SQLAApplicationRepository,
    application_refs: tuple[UUID, UUID, str],
) -> None:
    from unittest.mock import MagicMock

    from app.domain.entities.application import Application
    from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter

    applicant_id, vacancy_id, _ = application_refs
    app = Application(
        applicant_id=applicant_id,
        vacancy_id=vacancy_id,
        cv_storage_key="cvs/bad.pdf",
    )
    saved = await app_repo.save(app)

    storage = MagicMock(spec=BackblazeStorageAdapter)
    storage.download_file = AsyncMock(return_value=b"not a valid pdf at all")

    use_case = ProcessAIScoreUseCase(
        application_repo=app_repo,
        vacancy_repo=SQLAVacancyRepository(app_repo._session),
        analysis_adapter=MagicMock(),
        storage_adapter=storage,
        email_service=AsyncMock(),
    )
    await use_case.execute(saved.id)

    updated = await app_repo.find_by_id(saved.id)
    assert updated is not None
    assert updated.status == FlowStatus.REJECTED
    assert updated.error_reason == "CV_NOT_READABLE"
