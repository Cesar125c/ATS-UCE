# AI Prompt Design & Retry Strategy — ATS-UCE

## 1. Canonical Prompt

### System Prompt
```text
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
```

### User Prompt Template
```text
Evaluate this candidate for the vacancy:
- Title: {vacancy_title}
- Faculty: {vacancy_faculty}

Candidate CV:
{cv_text}
```

## 2. JSON Schema

**Required Response Format:**
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

**Validation Rules:**
- All scores: integers between 0-100
- `total_score`: average of 5 axes (±1 rounding)
- `evaluation_summary`: string ≤ 200 chars
- No additional properties allowed

## 3. Retry Strategy

| Attempt | Delay | Trigger |
|---------|-------|---------|
| 1 | 1s | OpenAI errors, schema validation failures |
| 2 | 2s | OpenAI errors, schema validation failures |
| 3 | 4s | OpenAI errors, schema validation failures |

**Fallback Behavior:**
- After 3 failures:
  - Status remains `PROCESSING_AI`
  - `error_reason = "OPENAI_UNAVAILABLE"`
  - Log error for manual review

## 4. Preselection Rule

| Total Score | Status | Next Step |
|-------------|--------|-----------|
| ≥ 60 | `HR_STAGE` | HR review |
| < 60 | `REJECTED` | Notify candidate |

## 5. Implementation

- **Prompt**: `SYSTEM_PROMPT` constant in `OpenAIAnalysisAdapter`
- **Retry**: Tenacity decorator with exponential backoff
- **Validation**: Pydantic model for schema validation
- **Fallback**: Status update with `error_reason`

## 6. Error Scenarios

| Scenario | Handling |
|----------|----------|
| Invalid JSON | Retry (OpenAI sometimes returns text before JSON) |
| Schema violation | Retry (scores out of range, missing fields) |
| Empty CV text | Return `total_score = 0`, summary = "CV contains no readable text" |
| OpenAI unavailable | Set `error_reason = "OPENAI_UNAVAILABLE"` after 3 retries |
