import pytest

from app.infrastructure.realtime.socketio_notifier import SocketIONotifier


@pytest.mark.asyncio
async def test_notify_status_change_emits_to_role_room(mocker):
    mock_sio = mocker.AsyncMock()
    notifier = SocketIONotifier(sio_server=mock_sio)

    await notifier.notify_status_change(
        role="human_resources",
        application_id="550e8400-e29b-41d4-a716-446655440000",
        new_status="HR_STAGE",
    )

    mock_sio.emit.assert_called_once()
    args, kwargs = mock_sio.emit.call_args
    assert args[0] == "status_change"
    assert kwargs["room"] == "human_resources"
    payload = args[1]
    assert payload["application_id"] == "550e8400-e29b-41d4-a716-446655440000"
    assert payload["new_status"] == "HR_STAGE"
    assert "timestamp" in payload


@pytest.mark.asyncio
async def test_notify_status_change_swallows_emit_failure(mocker):
    mock_sio = mocker.AsyncMock()
    mock_sio.emit.side_effect = Exception("Socket.IO server unreachable")
    notifier = SocketIONotifier(sio_server=mock_sio)

    # Must not raise
    await notifier.notify_status_change(
        role="authorities",
        application_id="550e8400-e29b-41d4-a716-446655440001",
        new_status="DEAN_STAGE",
    )

    mock_sio.emit.assert_called_once()


@pytest.mark.asyncio
async def test_notify_status_change_for_authorities_room(mocker):
    mock_sio = mocker.AsyncMock()
    notifier = SocketIONotifier(sio_server=mock_sio)

    await notifier.notify_status_change(
        role="authorities",
        application_id="550e8400-e29b-41d4-a716-446655440002",
        new_status="RECTOR_STAGE",
    )

    mock_sio.emit.assert_called_once()
    _, kwargs = mock_sio.emit.call_args
    assert kwargs["room"] == "authorities"
