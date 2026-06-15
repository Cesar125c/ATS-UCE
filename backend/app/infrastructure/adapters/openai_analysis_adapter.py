"""OpenAI adapter for CV analysis and AI score generation. Implemented in Sprint 2."""


class OpenAIAnalysisAdapter:
    """Adapter for generating 5-axis AI scores from CVs using OpenAI GPT models."""

    async def analyze_cv(self, cv_text: str, vacancy_requirements: str) -> dict:
        raise NotImplementedError("OpenAIAnalysisAdapter.analyze_cv — Sprint 2")
