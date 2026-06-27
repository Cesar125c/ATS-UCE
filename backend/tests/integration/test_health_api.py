import pytest
from httpx import AsyncClient


@pytest.mark.integration
async def test_health_returns_200(test_client: AsyncClient) -> None:
    response = await test_client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "database" in body


@pytest.mark.integration
async def test_health_returns_expected_keys(test_client: AsyncClient) -> None:
    response = await test_client.get("/api/v1/health")
    body = response.json()
    assert set(body.keys()) == {"status", "version", "database"}
    assert isinstance(body["version"], str)


@pytest.mark.integration
async def test_docs_swagger_ui_loads(test_client: AsyncClient) -> None:
    response = await test_client.get("/docs")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
