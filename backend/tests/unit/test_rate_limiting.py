from app.api.limiter import limiter


def test_limiter_is_configured() -> None:
    assert limiter is not None
    assert len(limiter._default_limits) == 1


def test_rate_limit_key_falls_back_to_ip() -> None:
    from unittest.mock import MagicMock

    from app.api.dependencies import rate_limit_key

    mock_request = MagicMock()
    mock_request.headers = {}
    mock_request.client = MagicMock()
    mock_request.client.host = "127.0.0.1"

    result = rate_limit_key(mock_request)
    assert result == "ip:127.0.0.1"


def test_rate_limit_key_extracts_user_id_from_token() -> None:
    from unittest.mock import MagicMock

    from app.api.dependencies import rate_limit_key

    token = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyXzEyMyJ9.fake_signature"
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": f"Bearer {token}"}
    mock_request.client = MagicMock()
    mock_request.client.host = "10.0.0.1"

    result = rate_limit_key(mock_request)
    assert result == "user:user_123"


def test_rate_limit_key_no_auth_header() -> None:
    from unittest.mock import MagicMock

    from app.api.dependencies import rate_limit_key

    mock_request = MagicMock()
    mock_request.headers = {}
    mock_request.client = MagicMock()
    mock_request.client.host = "192.168.1.1"

    result = rate_limit_key(mock_request)
    assert result == "ip:192.168.1.1"


def test_rate_limit_key_invalid_token_format() -> None:
    from unittest.mock import MagicMock

    from app.api.dependencies import rate_limit_key

    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Bearer not.a.jwt"}
    mock_request.client = MagicMock()
    mock_request.client.host = "10.0.0.1"

    result = rate_limit_key(mock_request)
    assert result == "ip:10.0.0.1"
