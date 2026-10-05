"""원문 확보 → 생성 → 코드 검사 → 판정 → 승인 대기 산출물(dict).

게시는 하지 않는다. 결과의 status 는 항상 pending_review / skipped / error 중 하나다.
"""
from __future__ import annotations

import datetime
from dataclasses import asdict
from typing import Any, Mapping

from . import prompts
from .checks import run_checks, summarize_rules
from .clients import CallError, CallResult, ClaudeClient
from .source_text import CaptionItem, Fetcher, SourceText, acquire_source, check_skip

STATUS_PENDING = "pending_review"
STATUS_SKIPPED = "skipped"
STATUS_ERROR = "error"

REC_APPROVE = "approve_candidate"   # 검사·판정 모두 통과 — 사람이 훑고 승인하면 됨
REC_EDIT = "needs_edit"             # 위반·확인 불가가 있음 — 고친 뒤 승인
REC_REJECT = "reject"               # 판정에 '틀림' 이 있음 — 쓰지 않음

SCHEMA_VERSION = 1


def _now() -> str:
    return datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")


def _base(item: CaptionItem, cfg: Mapping[str, Any]) -> dict[str, Any]:
    return {
        "schema_version": SCHEMA_VERSION,
        "created_at": _now(),
        "item": asdict(item),
        "model": cfg.get("model"),
        "published": False,
    }


def _call_record(step: str, res: CallResult) -> dict[str, Any]:
    return {
        "step": step,
        "model": res.model,
        "cost_usd": res.cost_usd,
        "cost_source": res.cost_source,
        "duration_s": res.duration_s,
        "input_tokens": res.usage.get("input_tokens"),
        "output_tokens": res.usage.get("output_tokens"),
        "cache_creation_input_tokens": res.usage.get("cache_creation_input_tokens"),
        "cache_read_input_tokens": res.usage.get("cache_read_input_tokens"),
    }


def _source_info(src: SourceText) -> dict[str, Any]:
    return {
        "method": src.method,
        "confidence": src.confidence,
        "fetch_status": src.fetch_status,
        "chars_used": len(src.text),
        "original_chars": src.original_chars,
        "truncated": src.truncated,
        "notes": list(src.notes),
    }


def summarize_judge(card: Mapping[str, Any], raw: Mapping[str, Any]) -> dict[str, Any]:
    """판정 결과를 주장 목록과 맞춰 정리. 판정이 빠진 주장은 '확인 불가' 로 본다."""
    claims = prompts.build_claims(card)
    by_id = {}
    for v in raw.get("verdicts") or []:
        cid = str(v.get("claim_id", ""))
        if cid and cid not in by_id:
            by_id[cid] = v
    rows = []
    for claim in claims:
        v = by_id.get(claim["claim_id"])
        verdict = v.get("verdict") if v else prompts.VERDICT_UNKNOWN
        if verdict not in prompts.VERDICTS:
            verdict = prompts.VERDICT_UNKNOWN
        rows.append({
            "claim_id": claim["claim_id"],
            "kind": claim["kind"],
            "text": claim["text"],
            "verdict": verdict,
            "reason": (v or {}).get("reason", "판정 누락 — 확인 불가로 처리"),
            "source_quote": (v or {}).get("source_quote", ""),
        })
    counts = {k: sum(1 for r in rows if r["verdict"] == k) for k in prompts.VERDICTS}
    return {
        "passed": counts[prompts.VERDICT_WRONG] == 0,
        "counts": counts,
        "verdicts": rows,
        "overall_note": str(raw.get("overall_note", "")),
    }


def apply_exclusions(card: Mapping[str, Any], judge: Mapping[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """'확인 불가' 문장을 뺀 카드(새 객체)와 제외한 claim_id 목록. 제목·표지는 빼지 않고 표시만 한다."""
    unknown = {r["claim_id"] for r in judge.get("verdicts", []) if r["verdict"] == prompts.VERDICT_UNKNOWN}

    def keep(prefix: str, seq: Any) -> list[Any]:
        return [x for i, x in enumerate(seq or []) if f"{prefix}[{i}]" not in unknown]

    final = {
        **dict(card),
        "facts": keep("facts", card.get("facts")),
        "numbers": keep("numbers", card.get("numbers")),
        "why_it_matters": keep("why_it_matters", card.get("why_it_matters")),
    }
    return final, sorted(unknown)


def recommend(checks: Mapping[str, Any], judge: Mapping[str, Any] | None, excluded: list[str]) -> str:
    if judge is not None and not judge["passed"]:
        return REC_REJECT
    if not checks["passed"] or judge is None or excluded:
        return REC_EDIT
    return REC_APPROVE


def proposed_entry_patch(card: Mapping[str, Any]) -> dict[str, Any]:
    """승인 시 page.tsx 엔트리에 덮어쓸 후보 필드(이 단계에서는 쓰지 않음)."""
    facts = [f.get("text", "") for f in card.get("facts") or []]
    return {
        "title": card.get("title_ko", ""),
        "summary": " ".join(t for t in facts if t),
        "tags": list(card.get("tags") or []),
        "category": card.get("category", ""),
    }


def run_caption(item: CaptionItem, cfg: Mapping[str, Any], client: ClaudeClient | None,
                fetcher: Fetcher | None = None, client_reason: str = "") -> tuple[dict[str, Any], str]:
    """한 건 실행. (결과 dict, 모델에 넣은 원문 텍스트 — 건너뛰면 '') 를 돌려준다."""
    result = _base(item, cfg)
    skip = check_skip(item, cfg.get("extra_blocked_domains") or [])
    if skip:
        return {**result, "status": STATUS_SKIPPED, "skip_reason": skip.reason, "skip_detail": skip.detail}, ""
    if client is None:
        return {**result, "status": STATUS_SKIPPED, "skip_reason": "no_claude_client",
                "skip_detail": client_reason or "Claude 호출 경로 없음"}, ""

    result = {**result, "client": client.name, "client_reason": client_reason, "model": client.model}
    source = acquire_source(item, cfg.get("fetch") or {}, fetcher)
    result = {**result, "source": _source_info(source)}
    limits = cfg["limits"]
    calls: list[dict[str, Any]] = []

    try:
        gen = client.complete_json(
            prompts.generation_system_prompt(limits),
            prompts.generation_user_prompt(source.text, item.url, item.source_hint, source.confidence),
            prompts.GENERATION_SCHEMA,
        )
    except CallError as e:
        return {**result, "status": STATUS_ERROR, "error": f"생성 호출 실패: {e}", "calls": calls}, source.text
    calls.append(_call_record("generate", gen))
    card = gen.data
    checks = run_checks(card, source.text, limits)
    checks = {**checks, "rule_counts": summarize_rules(checks["violations"])}

    judge: dict[str, Any] | None = None
    judge_error = ""
    if checks["passed"] or cfg.get("judge_even_if_checks_fail", True):
        claims = prompts.build_claims(card)
        try:
            jr = client.complete_json(prompts.JUDGE_SYSTEM_PROMPT,
                                      prompts.judge_user_prompt(source.text, claims),
                                      prompts.JUDGE_SCHEMA)
            calls.append(_call_record("judge", jr))
            judge = summarize_judge(card, jr.data)
        except CallError as e:
            judge_error = f"판정 호출 실패: {e}"

    final_card, excluded = apply_exclusions(card, judge) if judge else (dict(card), [])
    total = sum(c["cost_usd"] or 0 for c in calls)
    result = {
        **result,
        "status": STATUS_PENDING,
        "generated": card,
        "checks": checks,
        "judge": judge,
        "judge_error": judge_error,
        "excluded_claims": excluded,
        "final_card": final_card,
        "recommendation": recommend(checks, judge, excluded),
        "proposed_entry_patch": proposed_entry_patch(final_card),
        "calls": calls,
        "cost_total_usd": round(total, 6),
    }
    return result, source.text
