"""원문 확보: 출처 판정(Reddit 제외) → 본문 가져오기 → 텍스트 추출 → 실패 시 RSS 요약 폴백.

새 의존성 없이 표준 라이브러리(urllib, html.parser)만 쓴다.
"""
from __future__ import annotations

import html
import ipaddress
import json
import re
import urllib.error
import urllib.request
from dataclasses import dataclass, field
from html.parser import HTMLParser
from typing import Any, Callable, Iterable, Mapping
from urllib.parse import urlparse

# Reddit 약관(Data API Terms) 원문을 확인하기 전까지 Reddit 텍스트는 Claude 입력으로 쓰지 않는다.
# 설정으로 끌 수 없도록 코드에 고정한다.
REDDIT_DOMAINS: tuple[str, ...] = (
    "reddit.com",
    "redd.it",
    "redditmedia.com",
    "redditstatic.com",
    "reddituploads.com",
)
SKIP_REDDIT = "reddit_terms_unverified"
SKIP_BLOCKED_DOMAIN = "blocked_domain"
SKIP_NO_URL = "missing_url"

_SKIP_TAGS = {
    "script", "style", "noscript", "nav", "header", "footer", "aside", "form",
    "svg", "iframe", "template", "button", "select", "figure", "figcaption",
}
_BLOCK_TAGS = {
    "p", "div", "section", "article", "main", "li", "ul", "ol", "br", "h1", "h2",
    "h3", "h4", "h5", "h6", "blockquote", "pre", "tr", "table", "dd", "dt",
}
_D2_PATH = re.compile(r"^/(?:helloworld|news)/(\d+)/?$")

Fetcher = Callable[[str, float, int, str], "FetchResponse"]


@dataclass(frozen=True)
class CaptionItem:
    """Claude 문구 생성 대상 1건(수집 후보나 기존 카드 어느 쪽이든)."""

    title: str
    url: str
    summary: str = ""
    source_hint: str = ""
    origin: str = ""          # reddit | rss | page
    item_id: str = ""
    subreddit: str = ""


@dataclass(frozen=True)
class FetchResponse:
    status: int
    content_type: str
    body: bytes


@dataclass(frozen=True)
class SourceText:
    text: str
    method: str                     # html | d2_api | rss_summary
    confidence: str                 # high | low
    fetch_status: str               # ok | http_403 | error:... 등
    truncated: bool = False
    original_chars: int = 0
    notes: tuple[str, ...] = field(default_factory=tuple)


@dataclass(frozen=True)
class SkipDecision:
    reason: str
    detail: str


# ── 입력 정규화 ───────────────────────────────────────────────

def item_from_candidate(picked: Mapping[str, Any]) -> CaptionItem:
    """auto_daily.pick_best 결과(dict)를 CaptionItem 으로."""
    url = picked.get("_url") or picked.get("link") or picked.get("url") or picked.get("permalink") or ""
    summary = picked.get("summary") or picked.get("selftext") or ""
    hint = picked.get("publisher") or picked.get("feed_name") or ""
    return CaptionItem(
        title=str(picked.get("title", "")).strip(),
        url=str(url).strip(),
        summary=str(summary).strip(),
        source_hint=str(hint),
        origin=str(picked.get("source", "")),
        item_id=str(picked.get("_slug", "")),
        subreddit=str(picked.get("subreddit", "") or ""),
    )


def item_from_page_entry(entry: Mapping[str, Any]) -> CaptionItem:
    """page.tsx 카드 엔트리(dict)를 CaptionItem 으로."""
    return CaptionItem(
        title=str(entry.get("title", "")).strip(),
        url=str(entry.get("external_link", "")).strip(),
        summary=str(entry.get("summary", "")).strip(),
        source_hint="",
        origin="page",
        item_id=str(entry.get("id", "")),
    )


# ── 출처 판정 ─────────────────────────────────────────────────

def _host(url: str) -> str:
    try:
        return (urlparse(url).hostname or "").lower().rstrip(".")
    except ValueError:
        return ""


def _domain_matches(host: str, domains: Iterable[str]) -> bool:
    return any(host == d or host.endswith("." + d) for d in domains)


def is_reddit_url(url: str) -> bool:
    return _domain_matches(_host(url), REDDIT_DOMAINS)


def check_skip(item: CaptionItem, extra_blocked: Iterable[str] = ()) -> SkipDecision | None:
    """Claude 입력에서 빼야 할 항목이면 사유를 돌려준다."""
    if item.origin == "reddit" or item.subreddit or is_reddit_url(item.url):
        return SkipDecision(SKIP_REDDIT, "Reddit 약관 원문 미확인 — Reddit 텍스트는 Claude 입력에서 제외")
    if not item.url:
        return SkipDecision(SKIP_NO_URL, "원문 URL 없음")
    blocked = [d.lower().strip() for d in extra_blocked if str(d).strip()]
    if blocked and _domain_matches(_host(item.url), blocked):
        return SkipDecision(SKIP_BLOCKED_DOMAIN, f"설정에서 차단한 도메인: {_host(item.url)}")
    return None


def is_safe_public_url(url: str) -> bool:
    """http(s) 이고 내부망·로컬 주소 리터럴이 아닌지 확인(SSRF 최소 방어)."""
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"}:
        return False
    host = (parsed.hostname or "").lower()
    if not host or host == "localhost" or host.endswith(".localhost") or host.endswith(".local"):
        return False
    try:
        ip = ipaddress.ip_address(host)
    except ValueError:
        return True
    return ip.is_global


# ── HTML → 텍스트 ─────────────────────────────────────────────

class _TextExtractor(HTMLParser):
    """article > main > body 순으로 본문 텍스트를 모은다. 엔티티는 자동 해제."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self._skip_depth = 0
        self._article_depth = 0
        self._main_depth = 0
        self._in_title = False
        self.title = ""
        self.meta_description = ""
        self.parts: dict[str, list[str]] = {"article": [], "main": [], "all": []}

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        if tag == "meta":
            attr = {k.lower(): (v or "") for k, v in attrs}
            name = (attr.get("name") or attr.get("property") or "").lower()
            if name in {"description", "og:description"} and not self.meta_description:
                self.meta_description = attr.get("content", "").strip()
            return
        if tag in _SKIP_TAGS:
            self._skip_depth += 1
            return
        if tag == "title":
            self._in_title = True
        if tag == "article":
            self._article_depth += 1
        if tag == "main":
            self._main_depth += 1
        if tag in _BLOCK_TAGS:
            self._emit("\n")

    def handle_endtag(self, tag: str) -> None:
        if tag in _SKIP_TAGS:
            self._skip_depth = max(0, self._skip_depth - 1)
            return
        if tag == "title":
            self._in_title = False
        if tag == "article":
            self._article_depth = max(0, self._article_depth - 1)
        if tag == "main":
            self._main_depth = max(0, self._main_depth - 1)
        if tag in _BLOCK_TAGS:
            self._emit("\n")

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self.title += data
            return
        if self._skip_depth:
            return
        self._emit(data)

    def _emit(self, text: str) -> None:
        self.parts["all"].append(text)
        if self._article_depth:
            self.parts["article"].append(text)
        if self._main_depth:
            self.parts["main"].append(text)


def clean_text(text: str) -> str:
    """엔티티 해제 + 줄 단위 공백 정리. 빈 줄은 하나로."""
    text = html.unescape(text).replace("​", "").replace("\xa0", " ")
    lines = [re.sub(r"[ \t\r\f\v]+", " ", ln).strip() for ln in text.split("\n")]
    out: list[str] = []
    for ln in lines:
        if ln or (out and out[-1]):
            out.append(ln)
    return "\n".join(out).strip()


def extract_text_from_html(markup: str, min_chars: int = 400) -> tuple[str, str]:
    """(본문 텍스트, 페이지 제목). article → main → 전체 순으로 min_chars 이상인 것을 쓴다."""
    parser = _TextExtractor()
    parser.feed(markup)
    parser.close()
    for key in ("article", "main", "all"):
        text = clean_text("".join(parser.parts[key]))
        if len(text) >= min_chars:
            return text, clean_text(parser.title)
    best = clean_text("".join(parser.parts["all"]))
    if len(best) < min_chars and parser.meta_description:
        best = clean_text(parser.meta_description)
    return best, clean_text(parser.title)


# ── 가져오기 ──────────────────────────────────────────────────

def urllib_fetch(url: str, timeout: float, max_bytes: int, user_agent: str) -> FetchResponse:
    req = urllib.request.Request(url, headers={
        "User-Agent": user_agent,
        "Accept": "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.5",
        "Accept-Language": "ko,en;q=0.8",
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:  # noqa: S310 — 스킴은 is_safe_public_url 로 사전 검사
            body = resp.read(max_bytes + 1)
            return FetchResponse(resp.status, resp.headers.get("content-type", ""), body[:max_bytes])
    except urllib.error.HTTPError as e:
        return FetchResponse(e.code, e.headers.get("content-type", "") if e.headers else "", b"")


def _decode(resp: FetchResponse) -> str:
    match = re.search(r"charset=([\w-]+)", resp.content_type or "", re.IGNORECASE)
    charset = match.group(1) if match else "utf-8"
    try:
        return resp.body.decode(charset, errors="replace")
    except LookupError:
        return resp.body.decode("utf-8", errors="replace")


def _d2_api_url(url: str) -> str | None:
    """NAVER D2 는 본문을 JS 로 그리므로 공개 콘텐츠 API(JSON)의 postHtml 을 쓴다."""
    parsed = urlparse(url)
    if (parsed.hostname or "").lower() != "d2.naver.com":
        return None
    m = _D2_PATH.match(parsed.path)
    return f"https://d2.naver.com/api/v1/contents/{m.group(1)}" if m else None


def _fallback(item: CaptionItem, status: str, notes: tuple[str, ...]) -> SourceText:
    summary = clean_text(item.summary or "")
    text = f"제목: {clean_text(item.title)}\n\n{summary}".strip()
    return SourceText(text=text, method="rss_summary", confidence="low", fetch_status=status,
                      original_chars=len(text), notes=notes + ("본문 확보 실패 — RSS 요약만 사용",))


def acquire_source(item: CaptionItem, fetch_cfg: Mapping[str, Any],
                   fetcher: Fetcher | None = None) -> SourceText:
    """원문 본문을 가져온다. 실패하면 RSS 요약 폴백(confidence: low)."""
    fetch = fetcher or urllib_fetch
    timeout = float(fetch_cfg.get("timeout_seconds", 20))
    max_bytes = int(fetch_cfg.get("max_bytes", 3_000_000))
    ua = str(fetch_cfg.get("user_agent", "Mozilla/5.0"))
    min_chars = int(fetch_cfg.get("min_body_chars", 400))
    max_chars = int(fetch_cfg.get("max_source_chars", 30_000))

    if not is_safe_public_url(item.url):
        return _fallback(item, "unsafe_url", ("공개 http(s) 주소가 아니어서 가져오지 않음",))

    api_url = _d2_api_url(item.url)
    target = api_url or item.url
    try:
        resp = fetch(target, timeout, max_bytes, ua)
    except Exception as e:  # 네트워크 오류는 폴백으로 처리하고 사유를 남긴다
        return _fallback(item, f"error:{type(e).__name__}", (str(e)[:200],))
    if resp.status != 200 or not resp.body:
        return _fallback(item, f"http_{resp.status}", ())

    raw = _decode(resp)
    method = "html"
    if api_url:
        method = "d2_api"
        try:
            raw = str(json.loads(raw).get("postHtml") or "")
        except (ValueError, AttributeError):
            return _fallback(item, "d2_api_parse_error", ())
    body, _page_title = extract_text_from_html(raw, min_chars)
    if len(body) < min_chars:
        return _fallback(item, "ok_but_short", (f"추출 본문 {len(body)}자 < {min_chars}자",))

    text = f"제목: {clean_text(item.title)}\n\n{body}"
    truncated = len(text) > max_chars
    notes: tuple[str, ...] = ()
    if truncated:
        notes = (f"원문 {len(text)}자 중 앞 {max_chars}자만 모델 입력에 사용",)
    return SourceText(text=text[:max_chars], method=method, confidence="high", fetch_status="ok",
                      truncated=truncated, original_chars=len(text), notes=notes)
