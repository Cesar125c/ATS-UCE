import logging

import pytest
from fastapi import FastAPI, Response
from httpx import ASGITransport, AsyncClient

from app.api.middlewares.http_logging_middleware import HttpLoggingMiddleware
from app.api.middlewares.request_id_middleware import RequestIdMiddleware

LOGGER_NAME = "app.api.middlewares.http_logging_middleware"


@pytest.fixture
async def client() -> AsyncClient:
    app = FastAPI()
    app.add_middleware(HttpLoggingMiddleware)
    app.add_middleware(RequestIdMiddleware)

    @app.get("/ok")
    async def ok() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/missing")
    async def missing() -> Response:
        return Response(status_code=404)

    @app.get("/server-error")
    async def server_error() -> Response:
        return Response(status_code=500)

    @app.get("/boom")
    async def boom() -> None:
        raise RuntimeError("boom")

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as test_client:
        yield test_client


def _http_log_records(caplog: pytest.LogCaptureFixture) -> list[logging.LogRecord]:
    return [record for record in caplog.records if record.name == LOGGER_NAME]


async def test_http_200_logs_info_with_request_details(
    client: AsyncClient,
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.INFO, logger=LOGGER_NAME)

    response = await client.get("/ok", headers={"X-Request-ID": "req-test-200"})

    records = _http_log_records(caplog)
    assert response.status_code == 200
    assert len(records) == 1
    record = records[0]
    assert record.levelno == logging.INFO
    assert record.evento == "http_request_completed"
    assert record.method == "GET"
    assert record.path == "/ok"
    assert record.endpoint == "GET /ok"
    assert record.status_code == 200
    assert isinstance(record.duracion_ms, float)


async def test_http_404_logs_warning(
    client: AsyncClient,
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.INFO, logger=LOGGER_NAME)

    response = await client.get("/missing")

    records = _http_log_records(caplog)
    assert response.status_code == 404
    assert len(records) == 1
    assert records[0].levelno == logging.WARNING
    assert records[0].status_code == 404


async def test_http_exception_logs_error_and_reraises(
    client: AsyncClient,
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.INFO, logger=LOGGER_NAME)

    with pytest.raises(RuntimeError, match="boom"):
        await client.get("/boom")

    records = _http_log_records(caplog)
    assert len(records) == 1
    record = records[0]
    assert record.levelno == logging.ERROR
    assert record.evento == "http_request_failed"
    assert record.method == "GET"
    assert record.path == "/boom"
    assert isinstance(record.duracion_ms, float)
    assert record.exc_info is not None


async def test_http_500_response_logs_error_without_exception_info(
    client: AsyncClient,
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.INFO, logger=LOGGER_NAME)

    response = await client.get("/server-error")

    records = _http_log_records(caplog)
    assert response.status_code == 500
    assert len(records) == 1
    record = records[0]
    assert record.levelno == logging.ERROR
    assert record.evento == "http_request_completed"
    assert record.method == "GET"
    assert record.endpoint == "GET /server-error"
    assert record.status_code == 500
    assert isinstance(record.duracion_ms, float)
    assert record.exc_info is None


async def test_http_log_contains_sent_request_id(
    client: AsyncClient,
    caplog: pytest.LogCaptureFixture,
) -> None:
    caplog.set_level(logging.INFO, logger=LOGGER_NAME)

    response = await client.get("/ok", headers={"X-Request-ID": "trace-123"})

    records = _http_log_records(caplog)
    assert response.headers["X-Request-ID"] == "trace-123"
    assert len(records) == 1
    assert records[0].request_id == "trace-123"
