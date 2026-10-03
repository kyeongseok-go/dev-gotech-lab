"""승인 대기 산출물 쓰기: JSON + 사람이 읽는 Markdown 판정표 (+ 모델에 넣은 원문 텍스트)."""
from __future__ import annotations

import json
import re
from pathlib import Path
from typing import Any, Mapping

REC_LABEL = {
    "approve_candidate": "승인 후보(검사·판정 통과)",
    "needs_edit": "수정 필요",
    "reject": "사용 금지(판정에 '틀림')",
}


def _cell(text: Any) -> str:
    return str(text if text is not None else "").replace("|", "\\|").replace("\n", " ")


def _card_md(card: Mapping[str, Any]) -> list[str]:
    lines = [
        "### 카드 문구 (판정에서 '확인 불가'를 뺀 최종안)",
        "",
        f"**① 표지** — {_cell(card.get('title_ko'))}",
    ]
    lines += [f"> {_cell(h)}" for h in card.get("hook") or []]
    lines += ["", "**② 무슨 일인가**"]
    lines += [f"- {_cell(f.get('text'))}  \n  근거: \"{_cell(f.get('evidence'))}\"" for f in card.get("facts") or []]
    lines += ["", "**③ 왜 중요한가** `고텍이 의견`"]
    lines += [f"- {_cell(w)}" for w in card.get("why_it_matters") or []]
    lines += ["", "**④ 핵심 숫자**"]
    nums = card.get("numbers") or []
    lines += [f"- {_cell(n.get('value'))} — {_cell(n.get('label'))} (근거: \"{_cell(n.get('evidence'))}\")" for n in nums]
    if not nums:
        lines.append("- (원문에 쓸 만한 숫자 없음)")
    lines += ["", f"**⑤ 출처** — {_cell(card.get('source_name'))}",
              "", f"태그: {', '.join(map(str, card.get('tags') or []))} · 카테고리: {card.get('category', '')}", ""]
    return lines


def render_markdown(result: Mapping[str, Any]) -> str:
    item = result.get("item", {})
    out = [
        f"# 카드 문구 승인 대기 — {_cell(item.get('title'))}",
        "",
        f"- 상태: `{result.get('status')}` · 게시 여부: 게시 안 함(사람 승인 필요)",
        f"- 원문: {item.get('url', '')}",
        f"- 생성 시각: {result.get('created_at', '')}",
    ]
    if result.get("status") == "skipped":
        out += [f"- 건너뜀: `{result.get('skip_reason')}` — {result.get('skip_detail', '')}", ""]
        return "\n".join(out)
    out += [
        f"- 호출 경로: `{result.get('client')}` ({result.get('client_reason', '')}) · 모델: `{result.get('model')}`",
    ]
    src = result.get("source") or {}
    if src:
        out.append(f"- 원문 확보: `{src.get('method')}` · confidence `{src.get('confidence')}` · "
                   f"fetch `{src.get('fetch_status')}` · {src.get('chars_used')}자"
                   + (" (잘림)" if src.get("truncated") else ""))
        out += [f"  - {n}" for n in src.get("notes") or []]
    if result.get("status") == "error":
        out += ["", f"**오류:** {result.get('error')}", ""]
        return "\n".join(out)

    out += [f"- 권고: **{REC_LABEL.get(result.get('recommendation', ''), result.get('recommendation'))}**",
            f"- 비용 합계: ${result.get('cost_total_usd', 0):.4f} · 호출 {len(result.get('calls') or [])}회", ""]
    out += _card_md(result.get("final_card") or {})

    checks = result.get("checks") or {}
    out += ["## 코드 검사", "", f"통과: **{'예' if checks.get('passed') else '아니오'}**", ""]
    if checks.get("violations"):
        out += ["| 규칙 | 필드 | 내용 |", "|---|---|---|"]
        out += [f"| {_cell(v['rule'])} | {_cell(v['field'])} | {_cell(v['detail'])} |" for v in checks["violations"]]
        out.append("")

    judge = result.get("judge")
    out += ["## 판정표 (별도 호출)", ""]
    if not judge:
        out += [f"판정 없음. {result.get('judge_error', '')}", ""]
    else:
        c = judge["counts"]
        out += [f"맞음 {c.get('맞음', 0)} · 확인 불가 {c.get('확인 불가', 0)} · 틀림 {c.get('틀림', 0)} — "
                f"{'통과' if judge['passed'] else '실패'}", "",
                "| 항목 | 종류 | 문장 | 판정 | 이유 | 원문 근거 |", "|---|---|---|---|---|---|"]
        out += [f"| {_cell(r['claim_id'])} | {_cell(r['kind'])} | {_cell(r['text'])} | **{_cell(r['verdict'])}** "
                f"| {_cell(r['reason'])} | {_cell(r['source_quote'])[:160]} |" for r in judge["verdicts"]]
        if judge.get("overall_note"):
            out += ["", f"판정 메모: {judge['overall_note']}"]
        out.append("")
    if result.get("excluded_claims"):
        out += [f"제외한 문장(확인 불가): {', '.join(result['excluded_claims'])}", ""]

    out += ["## 호출 기록", "", "| 단계 | 모델 | 비용(USD) | 출처 | 소요(초) | 입력 토큰(캐시 포함) | 출력 토큰 |",
            "|---|---|---|---|---|---|---|"]
    for call in result.get("calls") or []:
        cost = "" if call.get("cost_usd") is None else f"{call['cost_usd']:.4f}"
        tokens_in = sum(int(call.get(k) or 0) for k in
                        ("input_tokens", "cache_creation_input_tokens", "cache_read_input_tokens"))
        out.append(f"| {call['step']} | {call['model']} | {cost} | {call['cost_source']} | {call['duration_s']} "
                   f"| {tokens_in} | {call.get('output_tokens')} |")
    out.append("")
    return "\n".join(out)


def safe_basename(text: str, fallback: str = "item") -> str:
    base = re.sub(r"[^0-9A-Za-z가-힣_-]+", "-", text or "").strip("-")[:60]
    return base or fallback


def write_outputs(result: Mapping[str, Any], source_text: str, out_dir: Path, basename: str) -> dict[str, str]:
    """out_dir 에 <basename>.json / .md / .source.txt 를 쓴다. 저장소 밖 경로 사용을 권장."""
    out_dir.mkdir(parents=True, exist_ok=True)
    name = safe_basename(basename)
    json_path = out_dir / f"{name}.json"
    md_path = out_dir / f"{name}.md"
    json_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
    md_path.write_text(render_markdown(result), encoding="utf-8")
    paths = {"json": str(json_path), "markdown": str(md_path)}
    if source_text:
        src_path = out_dir / f"{name}.source.txt"
        src_path.write_text(source_text, encoding="utf-8")
        paths["source"] = str(src_path)
    return paths
