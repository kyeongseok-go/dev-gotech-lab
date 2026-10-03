"""가짜 클라이언트로 생성 → 검사 → 판정 → 승인 대기 산출물 흐름 검증."""
from __future__ import annotations

import json

import pytest

from caption import flow, prompts
from caption.clients import CallError, CallResult
from caption.report import render_markdown, write_outputs
from caption.runner import run_items
from caption.clients import ClientChoice
from caption.source_text import CaptionItem, FetchResponse

URL = "https://acme.dev/blog/widget-2"


@pytest.fixture(autouse=True)
def short_body_ok(cfg):
    cfg["fetch"]["min_body_chars"] = 50  # 테스트 원문이 짧아 본문 확보 기준을 낮춘다


def html_fetcher(source: str):
    body = source.split("\n\n", 1)[1]  # conftest SOURCE 의 본문 부분
    page = f"<html><body><article><p>{body}</p></article></body></html>".encode()

    def fetch(url, timeout, max_bytes, ua):
        return FetchResponse(200, "text/html; charset=utf-8", page)

    return fetch


class FakeClient:
    """첫 호출은 생성, 두 번째는 판정 응답을 돌려준다. 받은 프롬프트를 기록한다."""

    name, model = "fake", "claude-sonnet-5-5"

    def __init__(self, card: dict, verdicts: dict[str, str] | None = None, fail_on: int | None = None):
        self.card = card
        self.verdicts = verdicts or {}
        self.fail_on = fail_on
        self.calls: list[tuple[str, str, dict]] = []

    def complete_json(self, system, user, schema):
        self.calls.append((system, user, schema))
        if self.fail_on == len(self.calls):
            raise CallError("가짜 실패")
        if schema is prompts.GENERATION_SCHEMA:
            data = self.card
        else:
            claims = prompts.build_claims(self.card)
            data = {"verdicts": [{"claim_id": c["claim_id"], "verdict": self.verdicts.get(c["claim_id"], "맞음"),
                                  "reason": "원문과 같음", "source_quote": ""} for c in claims
                                 if self.verdicts.get(c["claim_id"]) != "MISSING"],
                    "overall_note": ""}
        return CallResult(data=data, model=self.model, cost_usd=0.01, cost_source="measured",
                          duration_s=1.0, usage={"input_tokens": 10, "output_tokens": 5})


def item() -> CaptionItem:
    return CaptionItem(title="Acme launches Widget 2", url=URL, summary="요약", item_id="acme")


def test_happy_path_is_pending_review_and_approve_candidate(cfg, card, source):
    client = FakeClient(card)
    result, text = flow.run_caption(item(), cfg, client, html_fetcher(source))
    assert result["status"] == flow.STATUS_PENDING and result["published"] is False
    assert result["source"]["confidence"] == "high"
    assert result["checks"]["passed"] is True
    assert result["judge"]["passed"] is True
    assert result["recommendation"] == flow.REC_APPROVE
    assert result["cost_total_usd"] == 0.02 and len(result["calls"]) == 2
    # 판정 호출은 생성 프롬프트와 다른 시스템 프롬프트, 원문을 함께 받는다
    gen_sys, gen_user, _ = client.calls[0]
    judge_sys, judge_user, judge_schema = client.calls[1]
    assert judge_sys == prompts.JUDGE_SYSTEM_PROMPT != gen_sys
    assert judge_schema is prompts.JUDGE_SCHEMA
    assert "<source>" in gen_user and "35%" in judge_user
    assert "evidence" not in judge_user  # 판정자에게 생성자의 근거를 넘기지 않음
    assert "35%" in text


def test_wrong_verdict_rejects(cfg, card, source):
    result, _ = flow.run_caption(item(), cfg, FakeClient(card, {"facts[1]": "틀림"}), html_fetcher(source))
    assert result["judge"]["passed"] is False
    assert result["recommendation"] == flow.REC_REJECT


def test_unknown_verdict_excludes_sentence(cfg, card, source):
    result, _ = flow.run_caption(item(), cfg, FakeClient(card, {"facts[1]": "확인 불가", "why_it_matters[0]": "확인 불가"}),
                                 html_fetcher(source))
    assert result["excluded_claims"] == ["facts[1]", "why_it_matters[0]"]
    assert [f["text"] for f in result["final_card"]["facts"]] == [card["facts"][0]["text"], card["facts"][2]["text"]]
    assert len(result["final_card"]["why_it_matters"]) == 1
    assert len(result["generated"]["facts"]) == 3  # 원본 생성 결과는 그대로 보존
    assert result["recommendation"] == flow.REC_EDIT


def test_missing_verdict_is_treated_as_unknown(cfg, card, source):
    result, _ = flow.run_caption(item(), cfg, FakeClient(card, {"facts[0]": "MISSING"}), html_fetcher(source))
    row = next(r for r in result["judge"]["verdicts"] if r["claim_id"] == "facts[0]")
    assert row["verdict"] == "확인 불가"
    assert "facts[0]" in result["excluded_claims"]


def test_check_failure_still_judged_and_needs_edit(cfg, card, source):
    card["facts"][1]["text"] = "빌드 시간이 50% 줄었다."
    client = FakeClient(card)
    result, _ = flow.run_caption(item(), cfg, client, html_fetcher(source))
    assert result["checks"]["passed"] is False
    assert result["checks"]["rule_counts"] == {"numbers_in_source": 1}
    assert len(client.calls) == 2 and result["recommendation"] == flow.REC_EDIT


def test_check_failure_skips_judge_when_configured(cfg, card, source):
    card["hook"][0] = "충격적인 발표"
    client = FakeClient(card)
    result, _ = flow.run_caption(item(), {**cfg, "judge_even_if_checks_fail": False}, client, html_fetcher(source))
    assert len(client.calls) == 1 and result["judge"] is None
    assert result["recommendation"] == flow.REC_EDIT


def test_generation_error_and_judge_error(cfg, card, source):
    result, _ = flow.run_caption(item(), cfg, FakeClient(card, fail_on=1), html_fetcher(source))
    assert result["status"] == flow.STATUS_ERROR and "생성 호출 실패" in result["error"]
    result, _ = flow.run_caption(item(), cfg, FakeClient(card, fail_on=2), html_fetcher(source))
    assert result["status"] == flow.STATUS_PENDING and result["judge"] is None
    assert "판정 호출 실패" in result["judge_error"] and result["recommendation"] == flow.REC_EDIT


def test_no_client_is_skipped(cfg):
    result, _ = flow.run_caption(item(), cfg, None, client_reason="no_claude_client: 없음")
    assert result["status"] == flow.STATUS_SKIPPED and result["skip_reason"] == "no_claude_client"


def test_outputs_written_and_markdown_has_verdict_table(tmp_path, cfg, card, source):
    result, text = flow.run_caption(item(), cfg, FakeClient(card, {"facts[2]": "확인 불가"}), html_fetcher(source))
    paths = write_outputs(result, text, tmp_path, "acme")
    saved = json.loads((tmp_path / "acme.json").read_text(encoding="utf-8"))
    assert saved["status"] == "pending_review"
    md = (tmp_path / "acme.md").read_text(encoding="utf-8")
    assert "## 판정표" in md and "| facts[2] |" in md and "확인 불가" in md
    assert "고텍이 의견" in md
    assert set(paths) == {"json", "markdown", "source"}


def test_markdown_for_skipped_result():
    md = render_markdown({"status": "skipped", "item": {"title": "t", "url": "u"},
                          "skip_reason": "reddit_terms_unverified", "skip_detail": "d"})
    assert "reddit_terms_unverified" in md


def test_run_items_summary(tmp_path, cfg, card, source):
    choice = ClientChoice(FakeClient(card), "fake", "테스트")
    items = [item(), CaptionItem(title="r", url="https://i.redd.it/x.png", item_id="r1")]
    summaries = run_items(items, cfg, tmp_path, choice=choice, fetcher=html_fetcher(source))
    assert [s["status"] for s in summaries] == ["pending_review", "skipped"]
    assert summaries[1]["skip_reason"] == "reddit_terms_unverified"
    assert (tmp_path / "r1.md").exists()
