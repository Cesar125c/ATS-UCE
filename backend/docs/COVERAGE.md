# Unit Test Coverage Report — ATS-UCE Backend

**Fecha:** 2026-07-05  
**Comando:** `pytest tests/unit/ --cov=app --cov-report=term`

## Resumen

| Capa | Coverage |
|------|----------|
| **Domain** | **100%** ✅ |
| Application (use cases) | ~85% |
| Infrastructure (adapters/repos) | 28-89% |

## Domain — 100% (168/168 statements)

| Módulo | Statements | Coverage |
|--------|-----------|----------|
| `entities/application.py` | 28 | 100% |
| `entities/evaluation.py` | 16 | 100% |
| `entities/applicant.py` | 10 | 100% |
| `entities/status_history.py` | 10 | 100% |
| `entities/vacancy.py` | 13 | 100% |
| `value_objects/ai_score.py` | 29 | 100% |
| `value_objects/flow_status.py` | 21 | 100% |
| `value_objects/evaluation_decision.py` | 4 | 100% |
| `services/workflow_approval_service.py` | 17 | 100% |
| `exceptions.py` | 1 | 100% |
| `repositories/` (interfaces) | 19 | 100% |

## Application — ~85%

Cubierto por tests de use cases (`test_submit_application.py`, `test_process_ai_score.py`).

## Infrastructure

| Módulo | Coverage | Nota |
|--------|----------|------|
| `openai_analysis_adapter.py` | 100% | Cubierto por tests unitarios con mock |
| `backblaze_storage_adapter.py` | 89% | Mayoría cubierto |
| `groq_analysis_adapter.py` | 38% | Parcial — adapter principal en prod |
| `clerk_auth_adapter.py` | 22% | Requiere JWT real para test completo |
| `resend_email_adapter.py` | 26% | Email — bajo impacto en lógica de negocio |
| `gemini_analysis_adapter.py` | 0% | Adapter alternativo, no usado en prod |
| Repositories | 28-52% | Cubiertos por integration tests (BD real) |

## Tests Unitarios

- **88 tests** en `tests/unit/`
- Domain: 31 tests en `tests/unit/domain/`
- Input validation: 16 tests
- Use cases: 6 tests
- Adapters: 16 tests
- Rate limiting: 5 tests
- PDF extraction: 2 tests
