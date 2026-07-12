import pytest


class _RoleResult:
    def __init__(self, role):
        self.role = role

    def scalar_one_or_none(self):
        return self.role


class _FallbackSession:
    def __init__(self, role=None, error=None):
        self.role = role
        self.error = error

    async def __aenter__(self):
        return self

    async def __aexit__(self, exc_type, exc, tb):
        return False

    async def execute(self, _statement):
        if self.error:
            raise self.error
        return _RoleResult(self.role)


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
async def test_connect_rejects_jwt_applicant_without_db_fallback(mocker):
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
    mock_session_factory = mocker.patch("app.api.websocket.AsyncSessionLocal")

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is False
    mock_session_factory.assert_not_called()


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
    mock_session_factory = mocker.patch("app.api.websocket.AsyncSessionLocal")
    mock_enter_room = mocker.patch("app.api.websocket.sio.enter_room")

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is True
    mock_enter_room.assert_called_once_with("test-sid", "human_resources")
    mock_session_factory.assert_not_called()


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


@pytest.mark.asyncio
async def test_connect_allows_human_resources_from_db_fallback(mocker):
    from app.api.websocket import connect

    mock_adapter_cls = mocker.patch("app.api.websocket.ClerkAuthAdapter")
    mock_adapter = mock_adapter_cls.return_value
    mock_adapter.verify_token = mocker.AsyncMock(
        return_value={
            "user_id": "user_001",
            "role": "",
            "email": "hr@uce.edu.ec",
        }
    )
    mocker.patch(
        "app.api.websocket.AsyncSessionLocal",
        return_value=_FallbackSession(role="human_resources"),
    )
    mock_enter_room = mocker.patch("app.api.websocket.sio.enter_room")

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is True
    mock_enter_room.assert_called_once_with("test-sid", "human_resources")


@pytest.mark.asyncio
async def test_connect_allows_authorities_from_db_fallback(mocker):
    from app.api.websocket import connect

    mock_adapter_cls = mocker.patch("app.api.websocket.ClerkAuthAdapter")
    mock_adapter = mock_adapter_cls.return_value
    mock_adapter.verify_token = mocker.AsyncMock(
        return_value={
            "user_id": "user_002",
            "role": "",
            "email": "auth@uce.edu.ec",
        }
    )
    mocker.patch(
        "app.api.websocket.AsyncSessionLocal",
        return_value=_FallbackSession(role="authorities"),
    )
    mock_enter_room = mocker.patch("app.api.websocket.sio.enter_room")

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is True
    mock_enter_room.assert_called_once_with("test-sid", "authorities")


@pytest.mark.asyncio
async def test_connect_rejects_missing_db_user_when_jwt_has_no_role(mocker):
    from app.api.websocket import connect

    mock_adapter_cls = mocker.patch("app.api.websocket.ClerkAuthAdapter")
    mock_adapter = mock_adapter_cls.return_value
    mock_adapter.verify_token = mocker.AsyncMock(
        return_value={
            "user_id": "user_missing",
            "role": "",
            "email": "unknown@uce.edu.ec",
        }
    )
    mocker.patch("app.api.websocket.AsyncSessionLocal", return_value=_FallbackSession(role=None))
    mock_enter_room = mocker.patch("app.api.websocket.sio.enter_room")

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is False
    mock_enter_room.assert_not_called()


@pytest.mark.asyncio
async def test_connect_rejects_db_applicant_role_when_jwt_has_no_role(mocker):
    from app.api.websocket import connect

    mock_adapter_cls = mocker.patch("app.api.websocket.ClerkAuthAdapter")
    mock_adapter = mock_adapter_cls.return_value
    mock_adapter.verify_token = mocker.AsyncMock(
        return_value={
            "user_id": "user_003",
            "role": "",
            "email": "app@test.com",
        }
    )
    mocker.patch(
        "app.api.websocket.AsyncSessionLocal",
        return_value=_FallbackSession(role="applicant"),
    )
    mock_enter_room = mocker.patch("app.api.websocket.sio.enter_room")

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is False
    mock_enter_room.assert_not_called()


@pytest.mark.asyncio
async def test_connect_rejects_db_error_during_role_fallback(mocker, caplog):
    from app.api.websocket import connect

    mock_adapter_cls = mocker.patch("app.api.websocket.ClerkAuthAdapter")
    mock_adapter = mock_adapter_cls.return_value
    mock_adapter.verify_token = mocker.AsyncMock(
        return_value={
            "user_id": "user_004",
            "role": "",
            "email": "hr@uce.edu.ec",
        }
    )
    mocker.patch(
        "app.api.websocket.AsyncSessionLocal",
        return_value=_FallbackSession(error=RuntimeError("database unavailable")),
    )
    mock_enter_room = mocker.patch("app.api.websocket.sio.enter_room")

    result = await connect(sid="test-sid", environ={}, auth={"token": "valid-token"})

    assert result is False
    mock_enter_room.assert_not_called()
    assert "database unavailable" not in caplog.text
