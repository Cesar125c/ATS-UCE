from __future__ import annotations

import asyncio
import json
import logging

from openai import OpenAI, OpenAIError
from pydantic import BaseModel, Field, field_validator
from tenacity import (
    RetryError,
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.domain.value_objects.ai_score import AIScore
from config import get_settings

logger = logging.getLogger(__name__)


class OpenAIUnavailableError(Exception):
    """Raised when OpenAI API is unavailable after retries."""


class AIScoreResponse(BaseModel):
    total_score: int = Field(..., ge=0, le=100)
    score_academic: int = Field(..., ge=0, le=100)
    score_experience: int = Field(..., ge=0, le=100)
    score_production: int = Field(..., ge=0, le=100)
    score_profile_match: int = Field(..., ge=0, le=100)
    score_languages: int = Field(..., ge=0, le=100)
    evaluation_summary: str = Field(..., max_length=200)

    @field_validator("total_score")
    def validate_total_score(cls, v, info):
        # In Pydantic v2, we validate the range but not the average calculation here
        # The average validation is done in a separate method
        return v

    def validate_average_score(self):
        """Validate that total_score is the average of the 5 axes."""
        axes = [
            self.score_academic,
            self.score_experience,
            self.score_production,
            self.score_profile_match,
            self.score_languages,
        ]
        expected = sum(axes) / len(axes)
        # Allow 1-point rounding difference
        if not (expected - 1 <= self.total_score <= expected + 1):
            raise ValueError(
                "total_score must be average of 5 axes. "
                f"Expected {expected}, got {self.total_score}. Axes: {axes}"
            )


class OpenAIAnalysisAdapter:
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

    def __init__(self, api_key: str | None = None):
        self.client = OpenAI(api_key=api_key or get_settings().openai_api_key)
        self.model = get_settings().openai_model

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4),  # 1s → 2s → 4s
        retry=retry_if_exception_type((OpenAIError, json.JSONDecodeError)),
    )
    async def analyze_cv(self, cv_text: str, vacancy_title: str, vacancy_faculty: str) -> AIScore:
        """Analyze CV text with OpenAI and return AIScore."""
        user_prompt = self.USER_PROMPT_TEMPLATE.format(
            vacancy_title=vacancy_title,
            vacancy_faculty=vacancy_faculty,
            cv_text=cv_text[:5000],  # Limit to 5000 chars to control costs
        )

        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
            ),
        )

        # Parse and validate JSON response
        json_response = json.loads(response.choices[0].message.content)
        ai_score_response = AIScoreResponse(**json_response)
        ai_score_response.validate_average_score()

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

    async def analyze_cv_with_fallback(
        self, cv_text: str, vacancy_title: str, vacancy_faculty: str
    ) -> AIScore:
        """Analyze CV with fallback for OpenAI failures."""
        try:
            return await self.analyze_cv(cv_text, vacancy_title, vacancy_faculty)
        except RetryError as e:
            logger.error(f"OpenAI unavailable after 3 attempts: {e}")
            raise OpenAIUnavailableError("OpenAI API unavailable after 3 attempts")
