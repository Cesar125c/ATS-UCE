"""Gemini AI Analysis Adapter — drop-in replacement for OpenAI adapter.

Uses Google Gemini (free tier: 1500 requests/day) with structured JSON output
for the same 5-axis CV evaluation as the OpenAI adapter.
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any

from pydantic import BaseModel, Field, field_validator
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.domain.value_objects.ai_score import AIScore
from config import get_settings

logger = logging.getLogger(__name__)


class AIUnavailableError(Exception):
    """Raised when AI analysis is unavailable after retries."""


class AIScoreResponse(BaseModel):
    total_score: int = Field(..., ge=0, le=100)
    score_academic: int = Field(..., ge=0, le=100)
    score_experience: int = Field(..., ge=0, le=100)
    score_production: int = Field(..., ge=0, le=100)
    score_profile_match: int = Field(..., ge=0, le=100)
    score_languages: int = Field(..., ge=0, le=100)
    evaluation_summary: str = Field(..., max_length=200)

    @field_validator("total_score")
    def validate_total_score(cls, v: int, info: Any) -> int:
        return v

    def validate_average_score(self) -> None:
        axes = [
            self.score_academic,
            self.score_experience,
            self.score_production,
            self.score_profile_match,
            self.score_languages,
        ]
        expected = sum(axes) / len(axes)
        if not (expected - 5 <= self.total_score <= expected + 5):
            raise ValueError(
                f"total_score must be average of 5 axes. "
                f"Expected {expected}, got {self.total_score}. Axes: {axes}"
            )


class GeminiAnalysisAdapter:
    """Analyzes CVs using Google Gemini with structured JSON output."""

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
    """

    USER_PROMPT_TEMPLATE = """
    Evaluate this candidate for the vacancy:
    - Title: {vacancy_title}
    - Faculty: {vacancy_faculty}

    Candidate CV:
    {cv_text}
    """

    def __init__(self, api_key: str | None = None) -> None:
        settings = get_settings()
        key = api_key or getattr(settings, "gemini_api_key", None)
        self._use_fallback = True
        try:
            from google import genai as google_genai

            if key:
                self._client = google_genai.Client(api_key=key)
                self._client.models.generate_content(
                    model="gemini-2.0-flash",
                    contents="ping",
                    config={"temperature": 0, "max_output_tokens": 5},
                )
                self._model_name = "gemini-2.0-flash"
                self._use_fallback = False
                logger.info("Gemini adapter initialized with real API")
        except Exception as e:
            logger.warning("Gemini unavailable, using simulated scores: %s", e)

    async def _simulated_analyze(
        self, cv_text: str, vacancy_title: str, vacancy_faculty: str
    ) -> AIScore:
        text_lower = cv_text.lower()
        phd = 15 if "ph.d" in text_lower or "phd" in text_lower or "doctor" in text_lower else 0
        masters = (
            10 if "master" in text_lower or "maestría" in text_lower or "m.sc" in text_lower else 0
        )
        bachelors = (
            5
            if "bachelor" in text_lower or "licenciatura" in text_lower or "ingenier" in text_lower
            else 0
        )
        academic = min(100, 55 + phd + masters + bachelors)
        matches = re.findall(
            r"(\d+)[\s\-]*(?:year|año|yr)s?\s+(?:of\s+)?(?:teaching|docen|universit|academic)",
            text_lower,
        )
        years_exp = min(int(matches[0]), 30) if matches else 0
        experience = min(100, 40 + years_exp * 2)
        pub_count = len(
            re.findall(
                r"(?:paper|article|publication|journal|conference|scopus|ieee|springer|acm|elsevier)",
                text_lower,
            )
        )
        production = min(100, 40 + pub_count * 8)
        title_words = set(vacancy_title.lower().split())
        matching = sum(1 for w in title_words if len(w) > 3 and w in text_lower)
        profile_match = min(100, 50 + matching * 12)
        lang_score = 50
        if "english" in text_lower or "inglés" in text_lower:
            lang_score += 20
        if "spanish" in text_lower or "español" in text_lower:
            lang_score += 5
        if "french" in text_lower or "francés" in text_lower:
            lang_score += 5
        if "german" in text_lower or "alemán" in text_lower:
            lang_score += 5
        if "portuguese" in text_lower or "portugués" in text_lower:
            lang_score += 5
        languages = min(100, lang_score)
        total = round((academic + experience + production + profile_match + languages) / 5)
        summary = (
            f"Academic:{academic}% Exp:{experience}% "
            f"Research:{production}% Match:{profile_match}% Lang:{languages}%"
        )
        return AIScore(
            total=total,
            academic_training=academic,
            experience=experience,
            publications=production,
            profile_match=profile_match,
            languages_competencies=languages,
            evaluation_summary=summary,
        )

    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=4),
        retry=retry_if_exception_type((Exception,)),
    )
    async def analyze_cv(self, cv_text: str, vacancy_title: str, vacancy_faculty: str) -> AIScore:
        if self._use_fallback:
            return await self._simulated_analyze(cv_text, vacancy_title, vacancy_faculty)

        prompt = (
            f"{self.SYSTEM_PROMPT}\n\n"
            + self.USER_PROMPT_TEMPLATE.format(
                vacancy_title=vacancy_title,
                vacancy_faculty=vacancy_faculty,
                cv_text=cv_text[:5000],
            )
        )

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._client.models.generate_content(
                model=self._model_name,
                contents=prompt,
                config={
                    "temperature": 0.1,
                    "max_output_tokens": 300,
                    "response_mime_type": "application/json",
                    "response_schema": AIScoreResponse,
                },
            ),
        )

        raw = response.text
        data = json.loads(raw)
        ai_score_response = AIScoreResponse(**data)
        ai_score_response.validate_average_score()

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
        try:
            return await self.analyze_cv(cv_text, vacancy_title, vacancy_faculty)
        except Exception as e:
            logger.error("Gemini unavailable after retries: %s", e)
            raise AIUnavailableError(f"Gemini API unavailable after 3 attempts: {e}")
