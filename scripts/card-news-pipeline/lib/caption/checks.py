"""코드 검사 5종(Claude 없이 동작).

① evidence 원문 존재  ② 숫자 원문 존재  ③ 25자 이상 연속 겹침
④ 과장어 사전          ⑤ 길이 제한
결과: {"passed": bool, "violations": [{"rule", "field", "detail"}]}
"""
from __future__ import annotations

import html
import re
import unicodedata
from decimal import Decimal, InvalidOperation
from typing import Any, Iterable, Mapping

RULE_EVIDENCE = "evidence_in_source"
RULE_NUMBERS = "numbers_in_source"
RULE_OVERLAP = "verbatim_overlap"
RULE_HYPE = "hype_word"
RULE_LENGTH = "length"
RULE_SCHEMA = "schema"

_QUOTES = {
    "‘": "'", "’": "'", "‚": "'", "‛": "'", "′": "'", "`": "'",
    "“": '"', "”": '"', "„": '"', "‟": '"', "″": '"',
    "«": '"', "»": '"', "「": '"', "」": '"', "『": '"', "』": '"',
    "–": "-", "—": "-", "−": "-", "·": "·",
}
_QUOTE_RE = re.compile("|".join(map(re.escape, _QUOTES)))

# 숫자: 1,234.5 / 35 / 0.5 — 쉼표는 천 단위 구분으로만 인정
_NUM_RE = re.compile(r"(?<![\d.])(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d+))?")
_KO_UNITS = {"천": 10**3, "만": 10**4, "억": 10**8, "조": 10**12}
_EN_UNITS = {
    "thousand": 10**3, "k": 10**3, "million": 10**6, "mn": 10**6, "m": 10**6,
    "billion": 10**9, "bn": 10**9, "b": 10**9, "trillion": 10**12, "t": 10**12,
}
_KO_UNIT_RE = re.compile(r"^\s?(천|만|억|조)")
_EN_UNIT_RE = re.compile(r"^\s?(thousand|million|billion|trillion|mn|bn|[kmbt])\b", re.IGNORECASE)

# 무조건 금지(원문에 있어도 카드 문구로는 쓰지 않는다)
HYPE_ALWAYS: tuple[str, ...] = (
    "혁명", "충격", "미쳤다", "완전히", "역대급", "게임체인저", "게임 체인저",
    "판도를 바꾸", "판도가 바뀌", "대박", "경악", "끝판왕", "압도적", "엄청난", "놀라운",
    "신의 한 수", "소름",
)
# 원문에 해당 의미가 있을 때만 허용
HYPE_CONDITIONAL: dict[str, tuple[str, ...]] = {
    "최초": ("first", "최초", "처음"),
    "처음으로": ("first", "최초", "처음"),
    "유일": ("only", "unique", "sole", "유일"),
    "최대": ("largest", "biggest", "most", "up to", "maximum", "최대", "가장 큰"),
    "최고": ("best", "highest", "top", "최고"),
    "세계 최초": ("world's first", "world first", "세계 최초"),
}

# 조건부 검사에서 빼는 직함·고유 표현('최고경영자'의 '최고'는 과장이 아님)
HYPE_EXEMPT: tuple[str, ...] = (
    "최고경영자", "최고 경영자", "최고기술책임자", "최고 기술 책임자", "최고재무책임자",
    "최고운영책임자", "최고제품책임자", "최고정보보안책임자", "최대주주",
)


# ── 정규화 ────────────────────────────────────────────────────

def normalize(text: str) -> str:
    """엔티티 해제 → NFKC → 따옴표·대시 통일 → 공백 하나로."""
    text = html.unescape(text or "")
    text = unicodedata.normalize("NFKC", text).replace("​", "")
    text = _QUOTE_RE.sub(lambda m: _QUOTES[m.group(0)], text)
    return re.sub(r"\s+", " ", text).strip()


def _fold(text: str) -> str:
    return normalize(text).casefold()


# ── 숫자 ──────────────────────────────────────────────────────

def _to_decimal(int_part: str, frac: str | None) -> Decimal | None:
    try:
        return Decimal(int_part.replace(",", "") + (f".{frac}" if frac else ""))
    except InvalidOperation:
        return None


def extract_numbers(text: str) -> list[tuple[str, Decimal, Decimal | None]]:
    """(원문 표기, 값, 단위 적용 값) 목록. 단위가 없으면 세 번째는 None."""
    norm = normalize(text)
    out: list[tuple[str, Decimal, Decimal | None]] = []
    for m in _NUM_RE.finditer(norm):
        value = _to_decimal(m.group(1), m.group(2))
        if value is None:
            continue
        rest = norm[m.end():m.end() + 12]
        scaled: Decimal | None = None
        ko = _KO_UNIT_RE.match(rest)
        en = _EN_UNIT_RE.match(rest)
        if ko:
            scaled = value * _KO_UNITS[ko.group(1)]
        elif en:
            scaled = value * _EN_UNITS[en.group(1).lower()]
        out.append((m.group(0), value, scaled))
    return out


def _source_number_values(source: str) -> set[Decimal]:
    values: set[Decimal] = set()
    for _raw, value, scaled in extract_numbers(source):
        values.add(value.normalize())
        if scaled is not None:
            values.add(scaled.normalize())
    return values


def number_in_source(raw: str, value: Decimal, scaled: Decimal | None,
                     source_values: set[Decimal]) -> bool:
    """값이 원문에 그대로 있거나(쉼표·소수점 정규화), 단위 환산 값이 원문 환산 값과 같을 때만 통과.

    한국어 단위(만·억)는 보수적으로: '3억' 은 원문에 3 이 있어서가 아니라 300000000(=300 million) 이
    있어야 통과한다. 단, 원문 표기와 똑같은 숫자(예: 원문 '3억')는 값 비교로 통과한다.
    """
    if scaled is not None:
        return scaled.normalize() in source_values
    return value.normalize() in source_values


# ── 필드 꺼내기 ───────────────────────────────────────────────

def _as_list(value: Any) -> list[Any]:
    if value is None:
        return []
    return list(value) if isinstance(value, (list, tuple)) else [value]


def generated_text_fields(card: Mapping[str, Any]) -> list[tuple[str, str]]:
    """검사 대상 생성문(field, text). evidence·tags·category·source_name 은 제외."""
    fields: list[tuple[str, str]] = [("title_ko", str(card.get("title_ko", "")))]
    for i, line in enumerate(_as_list(card.get("hook"))):
        fields.append((f"hook[{i}]", str(line)))
    for i, fact in enumerate(_as_list(card.get("facts"))):
        text = fact.get("text", "") if isinstance(fact, Mapping) else str(fact)
        fields.append((f"facts[{i}].text", str(text)))
    for i, line in enumerate(_as_list(card.get("why_it_matters"))):
        fields.append((f"why_it_matters[{i}]", str(line)))
    for i, num in enumerate(_as_list(card.get("numbers"))):
        if isinstance(num, Mapping):
            fields.append((f"numbers[{i}].value", str(num.get("value", ""))))
            fields.append((f"numbers[{i}].label", str(num.get("label", ""))))
    return fields


def _evidence_fields(card: Mapping[str, Any]) -> list[tuple[str, str]]:
    out: list[tuple[str, str]] = []
    for key in ("facts", "numbers"):
        for i, obj in enumerate(_as_list(card.get(key))):
            if isinstance(obj, Mapping):
                out.append((f"{key}[{i}].evidence", str(obj.get("evidence", ""))))
    return out


# ── 검사 ──────────────────────────────────────────────────────

def _v(rule: str, field: str, detail: str) -> dict[str, str]:
    return {"rule": rule, "field": field, "detail": detail}


def check_evidence(card: Mapping[str, Any], source: str) -> list[dict[str, str]]:
    src = _fold(source)
    violations = []
    for field, evidence in _evidence_fields(card):
        ev = _fold(evidence)
        if not ev:
            violations.append(_v(RULE_EVIDENCE, field, "근거 구절이 비어 있음"))
        elif ev not in src:
            violations.append(_v(RULE_EVIDENCE, field, f"원문에서 찾을 수 없음: {evidence[:80]}"))
    return violations


def check_numbers(card: Mapping[str, Any], source: str) -> list[dict[str, str]]:
    source_values = _source_number_values(source)
    violations = []
    for field, text in generated_text_fields(card):
        if field.endswith(".label"):
            continue  # 라벨은 숫자 설명이며 숫자 자체는 value 에서 검사
        for raw, value, scaled in extract_numbers(text):
            if not number_in_source(raw, value, scaled, source_values):
                violations.append(_v(RULE_NUMBERS, field, f"원문에 없는 숫자: {raw}"))
    return violations


def longest_overlap(generated: str, source: str, min_len: int) -> str:
    """generated 안에서 source 와 min_len 자 이상 연속으로 같은 가장 긴 구간(없으면 '')."""
    gen, src = normalize(generated), normalize(source)
    best = ""
    i = 0
    while i + min_len <= len(gen):
        if gen[i:i + min_len] in src:
            end = i + min_len
            while end < len(gen) and gen[i:end + 1] in src:
                end += 1
            if end - i > len(best):
                best = gen[i:end]
            i = end
        else:
            i += 1
    return best


def check_overlap(card: Mapping[str, Any], source: str, min_len: int = 25) -> list[dict[str, str]]:
    violations = []
    for field, text in generated_text_fields(card):
        hit = longest_overlap(text, source, min_len)
        if hit:
            violations.append(_v(RULE_OVERLAP, field, f"원문과 {len(hit)}자 연속 일치: {hit[:60]}"))
    return violations


def check_hype(card: Mapping[str, Any], source: str) -> list[dict[str, str]]:
    src = _fold(source)
    violations = []
    for field, text in generated_text_fields(card):
        norm = normalize(text)
        for word in HYPE_ALWAYS:
            if word in norm:
                violations.append(_v(RULE_HYPE, field, f"금지어 '{word}'"))
        stripped = norm
        for exempt in HYPE_EXEMPT:
            stripped = stripped.replace(exempt, "")
        for word, cues in HYPE_CONDITIONAL.items():
            if word in stripped and not any(c.casefold() in src for c in cues):
                violations.append(_v(RULE_HYPE, field, f"'{word}' — 원문에 같은 의미 표현이 없음"))
    return violations


def _len_check(field: str, text: str, limit: int) -> list[dict[str, str]]:
    n = len(normalize(text))
    return [_v(RULE_LENGTH, field, f"{n}자 > {limit}자")] if n > limit else []


def _count_check(field: str, items: list[Any], lo: int, hi: int) -> list[dict[str, str]]:
    if lo <= len(items) <= hi:
        return []
    want = f"{lo}개" if lo == hi else f"{lo}~{hi}개"
    return [_v(RULE_LENGTH, field, f"{len(items)}개 (기대 {want})")]


def check_lengths(card: Mapping[str, Any], limits: Mapping[str, int]) -> list[dict[str, str]]:
    lim = dict(limits)
    out: list[dict[str, str]] = []
    out += _len_check("title_ko", str(card.get("title_ko", "")), lim["title_max"])
    if not normalize(str(card.get("title_ko", ""))):
        out.append(_v(RULE_LENGTH, "title_ko", "비어 있음"))

    hook = _as_list(card.get("hook"))
    out += _count_check("hook", hook, 1, lim["hook_lines_max"])
    for i, line in enumerate(hook):
        out += _len_check(f"hook[{i}]", str(line), lim["hook_line_max"])

    facts = _as_list(card.get("facts"))
    out += _count_check("facts", facts, lim["fact_count"], lim["fact_count"])
    for i, fact in enumerate(facts):
        text = fact.get("text", "") if isinstance(fact, Mapping) else str(fact)
        out += _len_check(f"facts[{i}].text", str(text), lim["fact_max"])

    why = _as_list(card.get("why_it_matters"))
    out += _count_check("why_it_matters", why, lim["why_lines_min"], lim["why_lines_max"])
    for i, line in enumerate(why):
        out += _len_check(f"why_it_matters[{i}]", str(line), lim["why_line_max"])

    numbers = _as_list(card.get("numbers"))
    out += _count_check("numbers", numbers, 0, lim["numbers_max"])
    for i, num in enumerate(numbers):
        if isinstance(num, Mapping):
            out += _len_check(f"numbers[{i}].value", str(num.get("value", "")), lim["number_value_max"])
            out += _len_check(f"numbers[{i}].label", str(num.get("label", "")), lim["number_label_max"])

    tags = _as_list(card.get("tags"))
    out += _count_check("tags", tags, lim["tag_count"], lim["tag_count"])
    for i, tag in enumerate(tags):
        out += _len_check(f"tags[{i}]", str(tag), lim["tag_max"])
    out += _len_check("source_name", str(card.get("source_name", "")), lim["source_name_max"])
    return out


REQUIRED_KEYS = ("title_ko", "hook", "facts", "why_it_matters", "numbers", "tags", "category", "source_name")


def check_schema(card: Any) -> list[dict[str, str]]:
    if not isinstance(card, Mapping):
        return [_v(RULE_SCHEMA, "$", "생성 결과가 JSON 객체가 아님")]
    return [_v(RULE_SCHEMA, k, "필수 필드 누락") for k in REQUIRED_KEYS if k not in card]


def run_checks(card: Mapping[str, Any], source: str, limits: Mapping[str, int]) -> dict[str, Any]:
    schema = check_schema(card)
    if schema:
        return {"passed": False, "violations": schema}
    violations: list[dict[str, str]] = []
    violations += check_evidence(card, source)
    violations += check_numbers(card, source)
    violations += check_overlap(card, source, int(limits.get("overlap_chars", 25)))
    violations += check_hype(card, source)
    violations += check_lengths(card, limits)
    return {"passed": not violations, "violations": violations}


def summarize_rules(violations: Iterable[Mapping[str, str]]) -> dict[str, int]:
    counts: dict[str, int] = {}
    for v in violations:
        counts[v["rule"]] = counts.get(v["rule"], 0) + 1
    return counts
