"""Unit tests for ResendEmailAdapter notification methods."""

from uuid import UUID

import pytest

from app.infrastructure.adapters.resend_email_adapter import ResendEmailAdapter

APPLICANT_ID = UUID("00000000-0000-0000-0000-000000000001")
TEST_EMAIL = "applicant@test.com"


@pytest.mark.asyncio
async def test_send_rejection_notification_sends_email(mocker):
    mock_resolve = mocker.patch.object(
        ResendEmailAdapter,
        "_resolve_email_by_applicant_id",
        return_value=TEST_EMAIL,
    )
    mock_dispatch = mocker.patch.object(ResendEmailAdapter, "dispatch")

    adapter = ResendEmailAdapter()
    await adapter.send_rejection_notification(APPLICANT_ID, reason="low score")

    mock_resolve.assert_called_once_with(APPLICANT_ID)
    mock_dispatch.assert_called_once()
    _, kwargs = mock_dispatch.call_args
    assert kwargs["to"] == TEST_EMAIL
    assert kwargs["subject"] == "Update on your UCE application"


@pytest.mark.asyncio
async def test_send_rejection_notification_uses_cv_body_for_unreadable(mocker):
    mocker.patch.object(
        ResendEmailAdapter,
        "_resolve_email_by_applicant_id",
        return_value=TEST_EMAIL,
    )
    mock_dispatch = mocker.patch.object(ResendEmailAdapter, "dispatch")

    adapter = ResendEmailAdapter()
    await adapter.send_rejection_notification(APPLICANT_ID, reason="CV_NOT_READABLE")

    _, kwargs = mock_dispatch.call_args
    assert "uploaded CV" in kwargs["html"]


@pytest.mark.asyncio
async def test_send_rejection_skips_when_no_email(mocker):
    mocker.patch.object(
        ResendEmailAdapter,
        "_resolve_email_by_applicant_id",
        return_value=None,
    )
    mock_dispatch = mocker.patch.object(ResendEmailAdapter, "dispatch")

    adapter = ResendEmailAdapter()
    await adapter.send_rejection_notification(APPLICANT_ID, reason="low score")

    mock_dispatch.assert_not_called()


@pytest.mark.asyncio
async def test_send_stage_notification_sends_email(mocker):
    mocker.patch.object(
        ResendEmailAdapter,
        "_resolve_email_by_applicant_id",
        return_value=TEST_EMAIL,
    )
    mock_dispatch = mocker.patch.object(ResendEmailAdapter, "dispatch")

    adapter = ResendEmailAdapter()
    await adapter.send_stage_notification(APPLICANT_ID, stage="HR_STAGE")

    mock_dispatch.assert_called_once()
    _, kwargs = mock_dispatch.call_args
    assert kwargs["to"] == TEST_EMAIL
    assert "HR review" in kwargs["subject"]


@pytest.mark.asyncio
async def test_send_stage_notification_skips_when_no_email(mocker):
    mocker.patch.object(
        ResendEmailAdapter,
        "_resolve_email_by_applicant_id",
        return_value=None,
    )
    mock_dispatch = mocker.patch.object(ResendEmailAdapter, "dispatch")

    adapter = ResendEmailAdapter()
    await adapter.send_stage_notification(APPLICANT_ID, stage="HR_STAGE")

    mock_dispatch.assert_not_called()
