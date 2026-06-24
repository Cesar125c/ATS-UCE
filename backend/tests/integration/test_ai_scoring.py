# Integration tests for AI scoring flow

import pytest
from app.infrastructure.adapters.openai_analysis_adapter import OpenAIAnalysisAdapter
from app.domain.entities.vacancy import Vacancy
from app.domain.entities.ai_score import AIScore

@pytest.mark.asyncio
async def test_ai_scoring_end_to_end(settings):
    if not settings.openai_api_key:
        pytest.skip("OpenAI API key not configured")
    
    adapter = OpenAIAnalysisAdapter()
    vacancy = Vacancy(title="Professor of Computer Science", faculty="Engineering")
    
    # Use a sample CV text
    cv_text = """
    Education:
    - PhD in Computer Science, MIT, 2015
    - MSc in Artificial Intelligence, Stanford, 2010
    
    Experience:
    - Professor at UCE, 2016-Present
    - Researcher at INRIA, 2010-2016
    
    Publications:
    - 20 Scopus-indexed papers
    - 5 R&D projects
    """
    
    ai_score = await adapter.analyze_cv(cv_text, vacancy)
    
    assert 0 <= ai_score.total_score <= 100
    assert len(ai_score.evaluation_summary) <= 200
    assert ai_score.total_score == (
        ai_score.academic_training +
        ai_score.experience +
        ai_score.publications +
        ai_score.profile_match +
        ai_score.languages_competencies
    ) // 5
