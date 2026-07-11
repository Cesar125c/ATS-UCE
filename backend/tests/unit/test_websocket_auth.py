import pytest


@pytest.mark.asyncio
async def test_connect_rejects_missing_token(mocker):
    from app.api.websocket import connect

    result = await connect(sid="test-sid", environ={}, auth=None)
    assert result is False


@pytest.mark.asyncio
async def test_connect_rejects_empty_auth(mocker):
    from app.api.websocket import connect

    result = await connect(sid="test-sid", environ={}, auth={})
    assert result is False


@pytest.mark.asyncio
async def test_connect_rejects_invalid_token(mocker):
    from app.api.websocket import connect

    mock_adapter_cls = mocker.patch("app.api.websocket.ClerkAuthAdapter")
    mock_adapter = mock_adapter_cls.return_value
    mock_adapter.verify_token = mocker.AsyncMock(side_effect=Exception("Invalid token"))

    result = await connect(sid="test-sid", environ={}, auth={"token": "bad-token"})

    assert result is False
    mock_adapter.verify_token.assert_called_once_with("bad-token")


@pytest.mark.asyncio
async def test_connect_rejects_applicant_role(mocker):
    from app.api.websocket import connect

    mock_adapter_cls = mocker.patch("app.api.websocket.ClerkAuthAdapter")
    mock_adapter = mock_adapter_cls.return_value
    mock_adapter.verify_token = mocker.AsyncMock(
        return_value={
            "user_id": "user_001",
            "role": "applicant",
            "email": "app@test.com",
        }
    )

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is False


@pytest.mark.asyncio
async def test_connect_allows_human_resources(mocker):
    from app.api.websocket import connect

    mock_adapter_cls = mocker.patch("app.api.websocket.ClerkAuthAdapter")
    mock_adapter = mock_adapter_cls.return_value
    mock_adapter.verify_token = mocker.AsyncMock(
        return_value={
            "user_id": "user_001",
            "role": "human_resources",
            "email": "hr@uce.edu.ec",
        }
    )
    mock_enter_room = mocker.patch("app.api.websocket.sio.enter_room")

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is True
    mock_enter_room.assert_called_once_with("test-sid", "human_resources")


@pytest.mark.asyncio
async def test_connect_allows_authorities(mocker):
    from app.api.websocket import connect

    mock_adapter_cls = mocker.patch("app.api.websocket.ClerkAuthAdapter")
    mock_adapter = mock_adapter_cls.return_value
    mock_adapter.verify_token = mocker.AsyncMock(
        return_value={
            "user_id": "user_002",
            "role": "authorities",
            "email": "auth@uce.edu.ec",
        }
    )
    mock_enter_room = mocker.patch("app.api.websocket.sio.enter_room")

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is True
    mock_enter_room.assert_called_once_with("test-sid", "authorities")
