"""원문 확보: Reddit 제외, HTML 추출·엔티티, 폴백, D2 어댑터."""
from __future__ import annotations

import json

import pytest

from caption import source_text as st
from caption.flow import STATUS_SKIPPED, run_caption

FETCH_CFG = {"timeout_seconds": 5, "max_bytes": 100_000, "max_source_chars": 30_000,
             "min_body_chars": 40, "user_agent": "test"}


class RecordingFetcher:
    def __init__(self, responses: dict[str, st.FetchResponse] | None = None) -> None:
        self.responses = responses or {}
        self.calls: list[str] = []

    def __call__(self, url, timeout, max_bytes, ua):
        self.calls.append(url)
        return self.responses.get(url, st.FetchResponse(404, "", b""))


# ── Reddit 제외 ───────────────────────────────────────────────

@pytest.mark.parametrize("url", [
    "https://www.reddit.com/r/artificial/comments/abc/x/",
    "https://reddit.com/r/x",
    "https://old.reddit.com/r/x",
    "https://i.redd.it/abc.png",
    "https://v.redd.it/abc",
    "https://redd.it/abc",
    "https://preview.redd.it/abc.jpg",
])
def test_reddit_urls_are_skipped(url):
    decision = st.check_skip(st.CaptionItem(title="t", url=url))
    assert decision is not None and decision.reason == st.SKIP_REDDIT == "reddit_terms_unverified"


def test_reddit_origin_is_skipped_even_with_external_link():
    item = st.item_from_candidate({"source": "reddit", "subreddit": "OpenAI", "title": "t",
                                   "_url": "https://github.com/acme/widget", "selftext": "본문"})
    assert st.check_skip(item).reason == st.SKIP_REDDIT


@pytest.mark.parametrize("url", ["https://notreddit.com/a", "https://openai.com/index/x", "https://d2.naver.com/helloworld/1"])
def test_non_reddit_urls_are_not_skipped(url):
    assert st.check_skip(st.CaptionItem(title="t", url=url)) is None


def test_extra_blocked_domain_and_missing_url():
    assert st.check_skip(st.CaptionItem(title="t", url="https://x.example.com/a"), ["example.com"]).reason == st.SKIP_BLOCKED_DOMAIN
    assert st.check_skip(st.CaptionItem(title="t", url="")).reason == st.SKIP_NO_URL


def test_reddit_item_never_fetched_nor_sent_to_claude(cfg):
    class ExplodingClient:
        name, model = "fake", "m"

        def complete_json(self, *a, **k):
            raise AssertionError("Reddit 항목이 Claude 로 전달됨")

    fetcher = RecordingFetcher()
    item = st.CaptionItem(title="t", url="https://v.redd.it/abc", summary="reddit selftext")
    result, text = run_caption(item, cfg, ExplodingClient(), fetcher)
    assert result["status"] == STATUS_SKIPPED
    assert result["skip_reason"] == "reddit_terms_unverified"
    assert fetcher.calls == [] and text == ""


# ── HTML 추출 ─────────────────────────────────────────────────

def test_extract_prefers_article_and_drops_scripts_nav():
    html_doc = """<html><head><title>T &amp; Co</title><script>var x = "secret";</script>
    <style>.a{}</style></head><body><nav>메뉴 메뉴</nav>
    <article><h1>제목</h1><p>본문 &quot;인용&quot; &amp; 그리고 &#39;작은따옴표&#39; 이 이어지는 문장입니다.</p>
    <p>두 번째 문단이 여기에 있습니다.</p></article><footer>저작권</footer></body></html>"""
    text, title = st.extract_text_from_html(html_doc, min_chars=20)
    assert title == "T & Co"
    assert '"인용" & 그리고 \'작은따옴표\'' in text
    assert "secret" not in text and "메뉴" not in text and "저작권" not in text
    assert "두 번째 문단" in text


def test_extract_falls_back_to_body_then_meta():
    text, _ = st.extract_text_from_html("<body><div>짧음</div></body>", min_chars=50)
    assert text == "짧음"
    text, _ = st.extract_text_from_html('<meta name="description" content="메타 설명 &amp; 요약"><body></body>', 10)
    assert text == "메타 설명 & 요약"


def test_clean_text_unescapes_entities_and_collapses_blank_lines():
    assert st.clean_text("a&quot;b&quot;​\n\n\n  c  \xa0 d") == 'a"b"\n\nc d'


# ── 가져오기·폴백 ─────────────────────────────────────────────

def test_403_falls_back_to_rss_summary_with_low_confidence():
    item = st.CaptionItem(title="Albertsons", url="https://openai.com/index/x",
                          summary="Uses &quot;ChatGPT Enterprise&quot; daily.")
    fetcher = RecordingFetcher({"https://openai.com/index/x": st.FetchResponse(403, "text/html", b"")})
    src = st.acquire_source(item, FETCH_CFG, fetcher)
    assert (src.method, src.confidence, src.fetch_status) == ("rss_summary", "low", "http_403")
    assert 'Uses "ChatGPT Enterprise" daily.' in src.text


def test_network_error_falls_back():
    def boom(*_a):
        raise OSError("network down")

    src = st.acquire_source(st.CaptionItem(title="t", url="https://a.com/x", summary="s"), FETCH_CFG, boom)
    assert src.confidence == "low" and src.fetch_status == "error:OSError"


def test_html_200_gives_high_confidence_and_truncation_flag():
    body = ("<article>" + "<p>" + "가나다라마바사 " * 30 + "</p></article>").encode("utf-8")
    fetcher = RecordingFetcher({"https://a.com/x": st.FetchResponse(200, "text/html; charset=utf-8", body)})
    src = st.acquire_source(st.CaptionItem(title="제목", url="https://a.com/x"), {**FETCH_CFG, "max_source_chars": 100}, fetcher)
    assert (src.method, src.confidence, src.fetch_status) == ("html", "high", "ok")
    assert src.text.startswith("제목: 제목") and len(src.text) == 100 and src.truncated
    assert src.original_chars > 100


def test_short_body_falls_back():
    fetcher = RecordingFetcher({"https://a.com/x": st.FetchResponse(200, "text/html", b"<p>tiny</p>")})
    src = st.acquire_source(st.CaptionItem(title="t", url="https://a.com/x", summary="요약"), FETCH_CFG, fetcher)
    assert src.fetch_status == "ok_but_short" and src.confidence == "low"


def test_d2_uses_content_api():
    post_html = "<div><p>" + "에이전트 하네스 설명 문장. " * 10 + "</p></div>"
    api = "https://d2.naver.com/api/v1/contents/8118359"
    fetcher = RecordingFetcher({api: st.FetchResponse(200, "application/json", json.dumps({"postHtml": post_html}).encode())})
    src = st.acquire_source(st.CaptionItem(title="D2", url="https://d2.naver.com/helloworld/8118359"), FETCH_CFG, fetcher)
    assert fetcher.calls == [api]
    assert src.method == "d2_api" and src.confidence == "high" and "하네스" in src.text


@pytest.mark.parametrize("url", ["file:///etc/passwd", "http://127.0.0.1/x", "http://localhost:8080", "http://10.0.0.5/a", "ftp://a.com/x"])
def test_unsafe_urls_are_not_fetched(url):
    fetcher = RecordingFetcher()
    src = st.acquire_source(st.CaptionItem(title="t", url=url, summary="s"), FETCH_CFG, fetcher)
    assert fetcher.calls == [] and src.fetch_status == "unsafe_url"


def test_item_from_page_entry_and_candidate():
    page = st.item_from_page_entry({"id": 184, "title": " T ", "external_link": "https://a.com", "summary": "s"})
    assert (page.item_id, page.title, page.url, page.origin) == ("184", "T", "https://a.com", "page")
    cand = st.item_from_candidate({"source": "rss", "title": "T", "link": "https://b.com", "summary": "x",
                                   "publisher": "토스", "_slug": "t"})
    assert (cand.url, cand.source_hint, cand.origin, cand.item_id) == ("https://b.com", "토스", "rss", "t")
