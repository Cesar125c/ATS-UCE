import re

import pytest
from fastapi import FastAPI
from httpx import ASGITransport, AsyncClient

from app.api.middlewares.request_id_middleware import RequestIdMiddleware
from app.infrastructure.logging import request_id_var

GENERATED_REQUEST_ID_PATTERN = re.compile(r"^req_[0-9a-f]{12}$")


@pytest.fixture
async def client() -> AsyncClient:
    app = FastAPI()
    app.add_middleware(RequestIdMiddleware)

    @app.get("/ping")
    async def ping() -> dict[str, str]:
        return {"status": "ok"}

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as test_client:
        yield test_client


async def test_request_without_request_id_gets_generated_header(client: AsyncClient) -> None:
    response = await client.get("/ping")

    request_id = response.headers.get("X-Request-ID")

    assert request_id
    assert GENERATED_REQUEST_ID_PATTERN.fullmatch(request_id)


async def test_request_with_request_id_preserves_header(client: AsyncClient) -> None:
    expected_request_id = "test-request-id-123"

    response = await client.get("/ping", headers={"X-Request-ID": expected_request_id})

    assert response.headers["X-Request-ID"] == expected_request_id


@pytest.mark.parametrize(
    "invalid_request_id",
    [
        "",
        "a" * 65,
        "request id with spaces",
        "request\nid",
        "request\tid",
    ],
)
async def test_invalid_request_id_headers_get_replaced(
    client: AsyncClient,
    invalid_request_id: str,
) -> None:
    response = await client.get("/ping", headers={"X-Request-ID": invalid_request_id})

    request_id = response.headers["X-Request-ID"]
    assert request_id != invalid_request_id
    assert GENERATED_REQUEST_ID_PATTERN.fullmatch(request_id)


async def test_consecutive_requests_without_request_id_get_different_ids(
    client: AsyncClient,
) -> None:
    first_response = await client.get("/ping")
    second_response = await client.get("/ping")

    assert first_response.headers["X-Request-ID"] != second_response.headers["X-Request-ID"]


async def test_request_id_contextvar_is_reset_after_request(client: AsyncClient) -> None:
    response = await client.get("/ping", headers={"X-Request-ID": "context-check-request"})

    assert response.headers["X-Request-ID"] == "context-check-request"
    assert request_id_var.get() == "-"
