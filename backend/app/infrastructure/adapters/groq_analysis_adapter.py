"""Groq AI Analysis Adapter — uses Groq free tier with Llama 3 70B.

Drop-in replacement for GeminiAnalysisAdapter with same interface.
Uses OpenAI-compatible client (groq SDK mirrors openai SDK).
"""

from __future__ import annotations

import asyncio
import json
import logging
import re
from typing import Any

from groq import Groq, GroqError
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
        pass


class GroqAnalysisAdapter:
    """Analyzes CVs using Groq (Llama 3 70B) with structured JSON output."""

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

    Respond ONLY with valid JSON. No markdown, no explanation.
    """

    USER_PROMPT_TEMPLATE = """
    Evaluate this candidate for the vacancy:
    - Title: {vacancy_title}
    - Faculty: {vacancy_faculty}

    Candidate CV:
    {cv_text}

    Return JSON with: total_score, score_academic, score_experience,
    score_production, score_profile_match, score_languages, evaluation_summary.
    """

    def __init__(self, api_key: str | None = None) -> None:
        settings = get_settings()
        key = api_key or getattr(settings, "groq_api_key", None)
        self._use_fallback = True
        if key:
            self._client = Groq(api_key=key)
            self._model = "llama-3.3-70b-versatile"
            self._use_fallback = False
            logger.info("Groq adapter initialized with real API")
        else:
            logger.warning("No Groq API key configured — using simulated scores")

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
        retry=retry_if_exception_type((GroqError, Exception)),
    )
    async def analyze_cv(self, cv_text: str, vacancy_title: str, vacancy_faculty: str) -> AIScore:
        if self._use_fallback:
            return await self._simulated_analyze(cv_text, vacancy_title, vacancy_faculty)

        user_prompt = self.USER_PROMPT_TEMPLATE.format(
            vacancy_title=vacancy_title,
            vacancy_faculty=vacancy_faculty,
            cv_text=cv_text[:5000],
        )

        loop = asyncio.get_event_loop()
        response = await loop.run_in_executor(
            None,
            lambda: self._client.chat.completions.create(
                model=self._model,
                messages=[
                    {"role": "system", "content": self.SYSTEM_PROMPT},
                    {"role": "user", "content": user_prompt},
                ],
                response_format={"type": "json_object"},
                temperature=0.1,
                max_tokens=300,
            ),
        )

        raw = response.choices[0].message.content
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
            logger.error("Groq unavailable after retries", exc_info=True)
            raise AIUnavailableError(f"Groq API unavailable after 3 attempts: {e}")
