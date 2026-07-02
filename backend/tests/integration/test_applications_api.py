import pytest


@pytest.mark.skip(reason="Requires external B2 credentials and application fixtures")
@pytest.mark.asyncio
async def test_submit_application_end_to_end(client, auth_headers, test_pdf):
    pytest.skip("Requires external B2 credentials and application fixtures")
