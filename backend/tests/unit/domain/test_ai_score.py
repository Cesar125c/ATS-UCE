"""Unit tests for AIScore value object."""

import dataclasses

import pytest

from app.domain.value_objects.ai_score import AIScore


def _make_score(**overrides) -> AIScore:
    defaults = {
        "total": 75.0,
        "academic_training": 75.0,
        "experience": 75.0,
        "publications": 75.0,
        "profile_match": 75.0,
        "languages_competencies": 75.0,
        "evaluation_summary": "Valid summary.",
    }
    defaults.update(overrides)
    return AIScore(**defaults)


def test_valid_score_five_axes() -> None:
    score = _make_score()
    assert score.total == 75.0


def test_total_above_100_raises() -> None:
    with pytest.raises(ValueError, match="total"):
        _make_score(total=100.1)


def test_total_below_0_raises() -> None:
    with pytest.raises(ValueError, match="total"):
        _make_score(total=-0.1)


def test_axis_above_100_raises() -> None:
    with pytest.raises(ValueError, match="languages_competencies"):
        _make_score(languages_competencies=100.1)


def test_is_preselected_exactly_60() -> None:
    assert _make_score(total=60.0).is_preselected is True


def test_is_preselected_below_60() -> None:
    assert _make_score(total=59.9).is_preselected is False


def test_grade_excellent() -> None:
    assert _make_score(total=85.0).grade == "EXCELLENT"


def test_grade_good() -> None:
    assert _make_score(total=70.0).grade == "GOOD"


def test_grade_acceptable() -> None:
    assert _make_score(total=60.0).grade == "ACCEPTABLE"


def test_grade_insufficient() -> None:
    assert _make_score(total=59.9).grade == "INSUFFICIENT"


def test_summary_exactly_200_chars() -> None:
    summary = "x" * 200
    score = _make_score(evaluation_summary=summary)
    assert len(score.evaluation_summary) == 200


def test_summary_201_chars_raises() -> None:
    with pytest.raises(ValueError, match="evaluation_summary"):
        _make_score(evaluation_summary="x" * 201)


def test_frozen_immutability() -> None:
    score = _make_score()
    with pytest.raises(dataclasses.FrozenInstanceError):
        score.total = 90.0  # type: ignore[misc]
