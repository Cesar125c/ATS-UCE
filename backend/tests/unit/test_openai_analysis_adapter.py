# Unit tests for OpenAIAnalysisAdapter

import pytest
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIAnalysisAdapter, AIScoreResponse
from app.domain.entities.vacancy import Vacancy
from openai import OpenAIError
from pydantic import ValidationError

@pytest.mark.asyncio
async def test_prompt_injection():
    adapter = OpenAIAnalysisAdapter(api_key="test")
    cv_text = "Sample CV text"
    vacancy = Vacancy(title="Professor of Computer Science", faculty="Engineering")
    
    prompt = adapter._build_user_prompt(cv_text, vacancy)
    assert "Professor of Computer Science" in prompt
    assert "Engineering" in prompt
    assert "Sample CV text" in prompt

@pytest.mark.asyncio
async def test_retry_strategy(mocker):
    mock_openai = mocker.patch.object(OpenAI, 'chat')
    mock_openai.completions.create.side_effect = [OpenAIError, OpenAIError, {"choices": [{"message": {"content": '{"total_score": 75}'}}]}]
    
    adapter = OpenAIAnalysisAdapter(api_key="test")
    result = await adapter.analyze_cv("test", Vacancy(title="Test", faculty="Test"))
    
    assert mock_openai.completions.create.call_count == 3
    assert result.total_score == 75

@pytest.mark.asyncio
async def test_schema_validation():
    adapter = OpenAIAnalysisAdapter(api_key="test")
    
    # Test valid response
    valid_json = {
        "total_score": 75,
        "score_academic": 80,
        "score_experience": 70,
        "score_production": 75,
        "score_profile_match": 85,
        "score_languages": 65,
        "evaluation_summary": "Test summary"
    }
    result = adapter._validate_response(valid_json)
    assert result.total_score == 75
    
    # Test invalid response (total_score not average)
    invalid_json = valid_json.copy()
    invalid_json["total_score"] = 50  # Should be ~75
    with pytest.raises(ValidationError):
        adapter._validate_response(invalid_json)
