"""코드 검사 5종 단위 테스트."""
from __future__ import annotations

from caption import checks
from caption.config import DEFAULTS

LIMITS = DEFAULTS["limits"]


def rules(violations: list[dict]) -> list[str]:
    return [v["rule"] for v in violations]


def test_valid_card_passes_all_checks(card, source):
    result = checks.run_checks(card, source, LIMITS)
    assert result == {"passed": True, "violations": []}


# ① evidence

def test_evidence_matches_after_quote_and_space_normalization(card):
    src = "He said “Widget  2 is   ready” today."
    card["facts"][0]["evidence"] = 'He said "Widget 2 is ready"'
    card["facts"] = card["facts"][:1]
    card["numbers"] = []
    assert checks.check_evidence(card, src) == []


def test_evidence_matches_html_entities(card):
    src = "&quot;이거 에이전트인가요?&quot; 라는 질문"
    card["facts"] = [{"text": "x", "evidence": '"이거 에이전트인가요?"'}]
    card["numbers"] = []
    assert checks.check_evidence(card, src) == []


def test_missing_or_fabricated_evidence_is_violation(card, source):
    card["facts"][1]["evidence"] = "build times dropped by half"
    card["facts"][2]["evidence"] = ""
    v = checks.check_evidence(card, source)
    assert rules(v) == [checks.RULE_EVIDENCE, checks.RULE_EVIDENCE]
    assert {x["field"] for x in v} == {"facts[1].evidence", "facts[2].evidence"}


# ② numbers

def test_numbers_with_comma_and_percent_pass(card, source):
    assert checks.check_numbers(card, source) == []


def test_invented_number_is_violation(card, source):
    card["facts"][1]["text"] = "빌드 시간이 50% 줄었다."
    v = checks.check_numbers(card, source)
    assert v and v[0]["field"] == "facts[1].text" and "50" in v[0]["detail"]


def test_number_in_opinion_is_also_checked(card, source):
    card["why_it_matters"][0] = "도입 팀이 3배 늘 것이다."
    assert rules(checks.check_numbers(card, source)) == [checks.RULE_NUMBERS]


def test_korean_unit_converted_conservatively(card, source):
    card["facts"][2]["text"] = "첫 주에 개발자 10만 명이 가입했다."  # 원문 100,000
    assert checks.check_numbers(card, source) == []
    card["facts"][2]["text"] = "투자금은 3억 달러다."  # 원문 $300 million = 3억
    assert checks.check_numbers(card, source) == []
    card["facts"][2]["text"] = "투자금은 30억 달러다."  # 원문과 다른 규모
    assert rules(checks.check_numbers(card, source)) == [checks.RULE_NUMBERS]


def test_korean_unit_does_not_pass_on_bare_digit():
    card = {"facts": [{"text": "사용자가 10만 명이다", "evidence": ""}]}
    assert rules(checks.check_numbers(card, "We have 10 users.")) == [checks.RULE_NUMBERS]


def test_extract_numbers_handles_decimal_and_units():
    found = checks.extract_numbers("GPT 5.5 costs 1,234.50 and 70B params")
    values = [str(v) for _raw, v, _s in found]
    assert values == ["5.5", "1234.50", "70"]
    assert found[2][2] == 70 * 10**9


# ③ overlap

def test_verbatim_copy_of_25_chars_is_violation(card, source):
    card["facts"][0]["text"] = "Acme today announced Widget 2, a developer toolkit"
    v = checks.check_overlap(card, source, 25)
    assert v and v[0]["field"] == "facts[0].text"


def test_overlap_below_threshold_passes(card, source):
    card["facts"][0]["text"] = "Widget 2 is available 출시"  # 22자 겹침
    assert checks.check_overlap(card, source, 25) == []


def test_overlap_ignores_evidence_and_normalizes_spaces(card, source):
    card["why_it_matters"][0] = "More than   1,200 teams joined   the beta 라고 한다"
    v = checks.check_overlap(card, source, 25)
    assert [x["field"] for x in v] == ["why_it_matters[0]"]


def test_longest_overlap_returns_full_span():
    assert checks.longest_overlap("xx abcdefghij yy", "--abcdefghij--", 5) == "abcdefghij"


# ④ hype words

def test_hype_word_always_banned(card, source):
    card["hook"][0] = "개발 도구의 혁명"
    assert rules(checks.check_hype(card, source)) == [checks.RULE_HYPE]


def test_conditional_word_needs_source_support(card, source):
    card["facts"][0]["text"] = "Acme가 유일한 에이전트 도구를 냈다."
    assert rules(checks.check_hype(card, source)) == [checks.RULE_HYPE]
    assert checks.check_hype(card, source + " It is the only toolkit of its kind.") == []


def test_job_titles_and_common_verbs_are_not_hype(card, source):
    card["facts"][0]["text"] = "최고경영자는 이 변화가 팀에 영향을 미친다고 했다."
    assert checks.check_hype(card, source) == []


# ⑤ lengths

def test_length_limits(card):
    card["title_ko"] = "가" * 31
    card["hook"] = ["한 줄", "두 줄", "세 줄"]
    card["facts"] = card["facts"][:2]
    card["facts"][0]["text"] = "나" * 61
    card["why_it_matters"] = ["의견 하나"]
    card["tags"] = ["a", "b"]
    fields = {v["field"] for v in checks.check_lengths(card, LIMITS)}
    assert {"title_ko", "hook", "facts", "facts[0].text", "why_it_matters", "tags"} <= fields


def test_hook_line_length(card):
    card["hook"] = ["가" * 17]
    assert [v["field"] for v in checks.check_lengths(card, LIMITS)] == ["hook[0]"]


def test_schema_violation_short_circuits():
    result = checks.run_checks({"title_ko": "x"}, "src", LIMITS)
    assert not result["passed"]
    assert all(v["rule"] == checks.RULE_SCHEMA for v in result["violations"])
    assert checks.run_checks(["not", "dict"], "src", LIMITS)["violations"][0]["field"] == "$"


def test_summarize_rules_counts():
    vs = [{"rule": "a"}, {"rule": "b"}, {"rule": "a"}]
    assert checks.summarize_rules(vs) == {"a": 2, "b": 1}
