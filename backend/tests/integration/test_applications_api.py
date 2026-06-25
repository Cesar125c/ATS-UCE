import pytest
from uuid import UUID
from fastapi.testclient import TestClient

from main import app
from app.infrastructure.adapters.backblaze_storage_adapter import BackblazeStorageAdapter

@pytest.mark.asyncio
async def test_submit_application_end_to_end(client, auth_headers, test_pdf):
    # Create test applicant and vacancy
    ...
    
    # Submit application
    response = await client.post(
        "/api/v1/applications/",
        headers=auth_headers,
        data={"vacancy_id": str(vacancy.id)},
        files={"cv_file": ("test.pdf", test_pdf, "application/pdf")},
    )
    
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "RECEIVED"
    
    # Verify PDF uploaded to B2
    storage = BackblazeStorageAdapter()
    pdf_bytes = await storage.download_file(data["cv_storage_key"])
    assert pdf_bytes == test_pdf
