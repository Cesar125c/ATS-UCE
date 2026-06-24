"""OpenAI adapter for CV analysis and AI score generation. Implemented in Sprint 2."""


class OpenAIAnalysisAdapter:
    """Adapter for generating 5-axis AI scores from CVs using OpenAI GPT models."""

    async def analyze_cv(self, cv_text: str, vacancy_requirements: str) -> dict:
        SYSTEM_PROMPT = """
You are an expert academic recruiter for Universidad Central del Ecuador (UCE).
Evaluate teaching candidates using the following 5-axis scoring system:

1. Academic Training (20%): Degrees, certifications, and academic rigor
2. Teaching Experience (20%): Years of university-level teaching
3. Research Production (20%): Scopus-indexed papers, R&D projects
4. Profile Match (20%): Alignment with vacancy requirements
5. Languages & Competencies (20%): English proficiency, digital tools

Scoring rules:
- Each axis: 0-100 (integer)
- Total score: average of all axes (0-100)
- evaluation_summary: ≤200 characters
- Be objective and consistent

Respond ONLY with valid JSON matching this schema:
```json
{
  "total_score": 75,
  "score_academic": 80,
  "score_experience": 70,
  "score_production": 75,
  "score_profile_match": 85,
  "score_languages": 65,
  "evaluation_summary": "Strong academic background with 10+ years of teaching experience."
}
```
"""

USER_PROMPT_TEMPLATE = """
Evaluate this candidate for the vacancy:
- Title: {vacancy_title}
- Faculty: {vacancy_faculty}

Candidate CV:
{cv_text}
"""

import json
import asyncio
from typing import TYPE_CHECKING

from tenacity import (
    retry,
    stop_after_attempt,
    wait_exponential,
    retry_if_exception_type,
    RetryError,
)
from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field, validator

if TYPE_CHECKING:
    from app.domain.entities.vacancy import Vacancy
    from app.domain.value_objects.ai_score import AIScore

class AIScoreResponse(BaseModel):
    total_score: int = Field(..., ge=0, le=100)
    score_academic: int = Field(..., ge=0, le=100)
    score_experience: int = Field(..., ge=0, le=100)
    score_production: int = Field(..., ge=0, le=100)
    score_profile_match: int = Field(..., ge=0, le=100)
    score_languages: int = Field(..., ge=0, le=100)
    evaluation_summary: str = Field(..., max_length=200)

    @validator('total_score')
    def validate_total_score(cls, v, values):
        # Calculate expected total score as average of axes
        axes = [
            values.get('score_academic', 0),
            values.get('score_experience', 0),
            values.get('score_production', 0),
            values.get('score_profile_match', 0),
            values.get('score_languages', 0),
        ]
        expected = sum(axes) / len(axes)
        # Allow 1-point rounding difference
        if not (expected - 1 <= v <= expected + 1):
            raise ValueError('total_score must be average of 5 axes')
        return v

retry_decorator = retry(
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=4),  # 1s → 2s → 4s
    retry=retry_if_exception_type((
        OpenAIError,
        ValueError,  # JSON/schema validation errors
    )),
)

class OpenAIAnalysisAdapter:
    """Adapter for generating 5-axis AI scores from CVs using OpenAI GPT models."""

    def __init__(self, api_key: str | None = None):
        self.client = OpenAI(api_key=api_key or get_settings().openai_api_key)

    @retry_decorator
    async def analyze_cv(self, cv_text: str, vacancy: Vacancy) -> AIScore:
        user_prompt = self.USER_PROMPT_TEMPLATE.format(
            vacancy_title=vacancy.title,
            vacancy_faculty=vacancy.faculty,
            cv_text=cv_text,
        )

        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.client.chat.completions.create(
                model=get_settings().openai_model,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
            )
        )

        # Parse and validate JSON response
        json_response = json.loads(response.choices[0].message.content)
        ai_score_response = AIScoreResponse(**json_response)

        # Convert to domain AIScore value object
        return AIScore(
            total=ai_score_response.total_score,
            academic_training=ai_score_response.score_academic,
            experience=ai_score_response.score_experience,
            publications=ai_score_response.score_production,
            profile_match=ai_score_response.score_profile_match,
            languages_competencies=ai_score_response.score_languages,
            evaluation_summary=ai_score_response.evaluation_summary,
        )

    async def analyze_cv_with_fallback(self, cv_text: str, vacancy: 'Vacancy', application: 'Application', application_repo) -> 'AIScore':
        try:
            ai_score = await self.analyze_cv(cv_text, vacancy)
            return ai_score
        except RetryError:
            # Status remains PROCESSING_AI, set error_reason
            application.error_reason = "OPENAI_UNAVAILABLE"
            await application_repo.update(application)
            raise
