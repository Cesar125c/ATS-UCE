from uuid import UUID, uuid4

import pytest

from app.domain.entities.application import Application
from app.domain.value_objects.ai_score import AIScore
from app.domain.value_objects.flow_status import FlowStatus
from app.infrastructure.repositories.sqla_application_repository import SQLAApplicationRepository


@pytest.mark.integration
async def test_save_persists_new_application(
    app_repo: SQLAApplicationRepository, application_refs: tuple[UUID, UUID]
) -> None:
    applicant_id, vacancy_id = application_refs
    app = Application(
        applicant_id=applicant_id,
        vacancy_id=vacancy_id,
        cv_storage_key="cvs/new-app.pdf",
    )
    saved = await app_repo.save(app)
    assert saved.id is not None
    assert saved.status == FlowStatus.RECEIVED
    assert saved.cv_storage_key == "cvs/new-app.pdf"
    assert saved.applicant_id == app.applicant_id
    assert saved.vacancy_id == app.vacancy_id


@pytest.mark.integration
async def test_find_by_id_returns_none_when_missing(app_repo: SQLAApplicationRepository) -> None:
    result = await app_repo.find_by_id(uuid4())
    assert result is None


@pytest.mark.integration
async def test_find_by_id_returns_application(
    app_repo: SQLAApplicationRepository, saved_application: Application
) -> None:
    found = await app_repo.find_by_id(saved_application.id)
    assert found is not None
    assert found.id == saved_application.id
    assert found.applicant_id == saved_application.applicant_id
    assert found.status == FlowStatus.RECEIVED


@pytest.mark.integration
async def test_save_updates_existing_with_ai_score(
    app_repo: SQLAApplicationRepository, saved_application: Application
) -> None:
    saved_application.assign_ai_score(
        AIScore(
            total=72.0,
            academic_training=70.0,
            experience=65.0,
            publications=60.0,
            profile_match=80.0,
            languages_competencies=75.0,
            evaluation_summary="Good candidate with solid experience.",
        )
    )
    updated = await app_repo.save(saved_application)
    assert updated.status == FlowStatus.HR_STAGE
    assert updated.ai_score is not None
    assert updated.ai_score.total == 72.0
    assert updated.ai_score.grade == "GOOD"


@pytest.mark.integration
async def test_find_by_status_returns_filtered_results(
    app_repo: SQLAApplicationRepository, saved_application: Application
) -> None:
    items, total = await app_repo.find_by_status(FlowStatus.RECEIVED, page=1, page_size=20)
    ids = {a.id for a in items}
    assert saved_application.id in ids
    assert total >= 1


@pytest.mark.integration
async def test_count_by_status(app_repo: SQLAApplicationRepository) -> None:
    count = await app_repo.count_by_status(FlowStatus.RECEIVED)
    assert isinstance(count, int)


@pytest.mark.integration
async def test_get_stats_returns_expected_shape(
    app_repo: SQLAApplicationRepository, application_with_score: Application
) -> None:
    stats = await app_repo.get_stats()
    assert set(stats.keys()) == {"total_applicants", "avg_score", "in_progress", "completed"}
    assert stats["total_applicants"] >= 1
    assert stats["avg_score"] > 0
    assert isinstance(stats["avg_score"], float)
