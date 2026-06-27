import pytest
import json
from unittest.mock import MagicMock, AsyncMock
from openai import OpenAIError
from tenacity import RetryError

from app.infrastructure.adapters.openai_analysis_adapter import (
    OpenAIAnalysisAdapter,
    OpenAIUnavailableError,
    AIScoreResponse,
)

@pytest.mark.asyncio
async def test_analyze_cv_happy_path(mocker):
    mock_openai = mocker.MagicMock()
    mock_response = MagicMock()
    mock_response.choices[0].message.content = json.dumps({
            "total_score": 75,  # Average of [80, 70, 75, 85, 65] = 75
            "score_academic": 80,
            "score_experience": 70,
            "score_production": 75,
            "score_profile_match": 85,
            "score_languages": 65,
            "evaluation_summary": "Test summary"
        })
    mock_openai.chat.completions.create.return_value = mock_response
    
    adapter = OpenAIAnalysisAdapter(api_key="test")
    adapter.client = mock_openai
    
    ai_score = await adapter.analyze_cv("test cv", "Professor", "Engineering")
    
    assert ai_score.total == 75
    assert ai_score.is_preselected is True
    assert len(ai_score.evaluation_summary) <= 200

@pytest.mark.asyncio
async def test_analyze_cv_retry(mocker):
    mock_openai = mocker.MagicMock()
    mock_openai.chat.completions.create.side_effect = [
        OpenAIError("Service unavailable"),
        OpenAIError("Service unavailable"),
            MagicMock(choices=[MagicMock(message=MagicMock(content=json.dumps({
                "total_score": 75,  # Average of [80, 70, 75, 85, 65] = 75
                "score_academic": 80,
                "score_experience": 70,
                "score_production": 75,
                "score_profile_match": 85,
                "score_languages": 65,
                "evaluation_summary": "Test summary"
            })))])
    ]
    
    adapter = OpenAIAnalysisAdapter(api_key="test")
    adapter.client = mock_openai
    
    ai_score = await adapter.analyze_cv("test cv", "Professor", "Engineering")
    
    assert mock_openai.chat.completions.create.call_count == 3
    assert ai_score.total == 75

@pytest.mark.asyncio
async def test_analyze_cv_failure(mocker):
    mock_openai = mocker.MagicMock()
    mock_openai.chat.completions.create.side_effect = OpenAIError("Service unavailable")
    
    adapter = OpenAIAnalysisAdapter(api_key="test")
    adapter.client = mock_openai
    
    with pytest.raises(OpenAIUnavailableError):
        await adapter.analyze_cv_with_fallback("test cv", "Professor", "Engineering")

@pytest.mark.asyncio
async def test_analyze_cv_schema_validation(mocker):
    mock_openai = mocker.MagicMock()
    mock_response = MagicMock()
    mock_response.choices[0].message.content = json.dumps({
        "total_score": 150,  # Invalid: > 100
        "score_academic": 80,
        "score_experience": 70,
        "score_production": 75,
        "score_profile_match": 85,
        "score_languages": 65,
        "evaluation_summary": "Test summary"
    })
    mock_openai.chat.completions.create.return_value = mock_response
    
    adapter = OpenAIAnalysisAdapter(api_key="test")
    adapter.client = mock_openai
    
    with pytest.raises(ValueError):
        await adapter.analyze_cv("test cv", "Professor", "Engineering")

@pytest.mark.asyncio
async def test_analyze_cv_total_score_validation(mocker):
    mock_openai = mocker.MagicMock()
    mock_response = MagicMock()
    mock_response.choices[0].message.content = json.dumps({
        "total_score": 50,  # Invalid: not average of axes
        "score_academic": 80,
        "score_experience": 70,
        "score_production": 75,
        "score_profile_match": 85,
        "score_languages": 65,
        "evaluation_summary": "Test summary"
    })
    mock_openai.chat.completions.create.return_value = mock_response
    
    adapter = OpenAIAnalysisAdapter(api_key="test")
    adapter.client = mock_openai
    
    with pytest.raises(ValueError):
        await adapter.analyze_cv("test cv", "Professor", "Engineering")