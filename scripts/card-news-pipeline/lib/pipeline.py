#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow>=10.0", "PyYAML>=6.0", "requests>=2.31", "feedparser>=6.0", "python-dateutil>=2.9"]
# ///
"""tech-news-pipeline 오케스트레이터.

지원 모드:
  --mode backfill   기간 내 일자별 1개씩 카드뉴스 생성. 일부 테마는 bg 공유.
  --mode generate   단일 entry JSON 입력 → bg 생성 + 합성 + page.tsx 반영
  --mode collect    sources 통합 수집 → JSON 출력 (Claude 큐레이션용)

테마 버킷:
  각 entry 의 `theme` 키가 같으면 같은 bg 를 공유. Pollinations 호출 횟수 절약.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
from pathlib import Path

# lib 모듈 임포트
SKILL_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(SKILL_ROOT / "lib" / "illustrate"))
import asset_resolver   # noqa: E402
import compositor       # noqa: E402
import entity_detector  # noqa: E402
import pollinations     # noqa: E402

import os
_DEFAULT_REPO_ROOT = Path(__file__).resolve().parent.parent.parent.parent
REPO_ROOT = Path(os.environ.get("REPO_ROOT", str(_DEFAULT_REPO_ROOT)))
PUBLIC_DIR = REPO_ROOT / "public" / "card-news"
BG_CACHE = SKILL_ROOT / "assets" / "_pollinations_cache"


THEME_PROMPTS = {
    "anthropic": "futuristic AI research lab with warm orange and beige lighting, holographic interfaces, minimalist clean architecture",
    "openai": "abstract futuristic black and white AI laboratory, dramatic chiaroscuro lighting, geometric forms",
    "google_gemini": "vibrant gradient mesh with blue purple pink, abstract tech atmosphere, ethereal and modern",
    "meta_llama": "deep blue gradient with open source code patterns, neural network visualization, calm professional",
    "nvidia_gpu": "high-tech data center with green accent lighting, rows of GPU servers, dramatic perspective",
    "fintech_kr": "minimalist clean fintech interface, blue and white tones, modern Korean office aesthetic",
    "kakao": "warm yellow gradient with playful chat bubble shapes, friendly platform vibe",
    "korea_tech": "modern Seoul tech office, glass walls, sunset golden hour lighting, sophisticated",
    "security": "dark cybersecurity command center with red alert accents, holographic threat visualizations, intense",
    "video_gen": "cinematic film set with multiple monitors showing generative video, blue lighting, dramatic",
    "frontend": "vibrant cyan and emerald gradient with floating UI components, modern code editor aesthetic",
    "backend_devops": "purple gradient data flow visualization, abstract microservices architecture, professional",
    "mobile": "fresh mint and white gradient with floating mobile devices, clean minimalist product photography",
    "robotics": "advanced humanoid robotics laboratory, neutral white and gray, scientific precision",
    "ai_general": "abstract neural network in deep space, glowing data nodes, vast and contemplative",
    "news": "editorial newspaper composition with subtle technology hints, sophisticated muted tones",
    "agent": "autonomous AI agent workflow visualization, interconnected nodes, futuristic dark theme",
}


def theme_bg_path(theme: str) -> Path:
    """테마별 bg PNG 경로 (캐시)."""
    return BG_CACHE / f"theme_{theme}.png"


def ensure_theme_bg(theme: str, seed_salt: int = 42) -> Path:
    """테마 bg 가 캐시에 없으면 Pollinations 호출하여 생성."""
    target = theme_bg_path(theme)
    if target.exists():
        return target

    prompt_base = THEME_PROMPTS.get(theme, THEME_PROMPTS["ai_general"])
    prompt = pollinations.build_prompt(prompt_base)
    seed = int(hashlib.md5(theme.encode()).hexdigest()[:8], 16) + seed_salt
    return pollinations.generate(prompt, target, seed=seed % 100_000, width=1024, height=1024)


def detect_brand_info(entry: dict) -> tuple[str | None, str | None, Path | None]:
    """entry 제목·요약에서 primary entity 추출 → (brand_text, brand_color, logo_path)."""
    text = f"{entry.get('title', '')} {entry.get('summary', '')}"
    result = entity_detector.detect(text)
    primary = result.get("primary")

    brand_text = entry.get("brand_text")
    if brand_text is None and primary:
        brand_text = primary.canonical_name

    brand_color = entry.get("brand_color")
    if brand_color is None and primary:
        brand_color = primary.brand_color

    logo_path: Path | None = None
    if primary:
        logo_path = asset_resolver.resolve(primary.__dict__)

    return brand_text, brand_color, logo_path


def render_entry_image(entry: dict, force: bool = False) -> Path:
    """엔트리 1개의 최종 600x600 PNG 생성. 테마 bg 공유 + 브랜드 타이포 + 컬러 액센트."""
    theme = entry.get("theme", "ai_general")
    bg = ensure_theme_bg(theme)

    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)
    out = PUBLIC_DIR / f"{entry['slug']}.png"
    if out.exists() and not force:
        return out

    brand_text, brand_color, logo_path = detect_brand_info(entry)
    compositor.compose(
        bg, out,
        darken_opacity=0.25,
        brand_text=brand_text,
        brand_color=brand_color,
        category=entry.get("category"),
        primary_asset=logo_path,
    )
    return out


def run_backfill(
    entries: list[dict],
    delay_sec: int = 8,
    checkpoint_path: Path | None = None,
    force_recompose: bool = False,
) -> list[dict]:
    """엔트리 리스트의 이미지를 직렬 생성 (Pollinations rate-limit 회피).
    중간 실패해도 진행분이 checkpoint_path 에 incremental 저장된다.
    """
    unique_themes = sorted({e.get("theme", "ai_general") for e in entries})
    print(f"[pipeline] {len(unique_themes)} unique themes, sequential gen with {delay_sec}s delay...",
          file=sys.stderr)

    def _checkpoint():
        if checkpoint_path:
            with checkpoint_path.open("w") as f:
                json.dump(entries, f, ensure_ascii=False, indent=2)

    # 1) 테마 bg 직렬 생성 (실패해도 다음 테마로 진행)
    failed_themes: set[str] = set()
    for i, theme in enumerate(unique_themes, 1):
        target = theme_bg_path(theme)
        if target.exists():
            print(f"[pipeline] bg {i}/{len(unique_themes)} {theme} (cached)", file=sys.stderr)
            continue
        print(f"[pipeline] bg {i}/{len(unique_themes)} {theme} generating...", file=sys.stderr)
        try:
            ensure_theme_bg(theme)
        except Exception as e:
            print(f"[pipeline] FAILED {theme}: {e}", file=sys.stderr)
            failed_themes.add(theme)
        if i < len(unique_themes):
            time.sleep(delay_sec)

    print(f"[pipeline] composing {len(entries)} entry images "
          f"({len(failed_themes)} themes failed)...", file=sys.stderr)
    # 2) 엔트리별 합성 + 체크포인트
    for idx, e in enumerate(entries, 1):
        if e.get("image_url") and not force_recompose:  # 이미 처리됨
            continue
        if e.get("theme") in failed_themes:
            e["image_url"] = None  # 다음 실행에서 재시도 가능
            _checkpoint()
            continue
        try:
            path = render_entry_image(e, force=force_recompose)
            e["image_url"] = f"/card-news/{path.name}"
        except Exception as exc:
            print(f"[pipeline] compose failed {e['slug']}: {exc}", file=sys.stderr)
            e["image_url"] = None
        _checkpoint()
        if idx % 5 == 0:
            print(f"[pipeline] entry {idx}/{len(entries)} done", file=sys.stderr)

    return entries


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--mode", choices=["backfill", "generate", "collect"], required=True)
    ap.add_argument("--input", type=Path, help="entries JSON for backfill/generate")
    ap.add_argument("--output", type=Path, help="output JSON")
    ap.add_argument("--parallel", type=int, default=4)
    ap.add_argument("--force-recompose", action="store_true",
                    help="기존 엔트리 이미지 재합성 (브랜드 타이포 적용)")
    args = ap.parse_args()

    if args.mode == "backfill":
        if not args.input:
            print("backfill mode requires --input entries.json", file=sys.stderr)
            return 2
        out_path = args.output or args.input
        # 이전 실행 checkpoint 가 있으면 그걸 우선 로드 (이어가기)
        load_path = out_path if out_path.exists() else args.input
        with load_path.open() as f:
            entries = json.load(f)
        result = run_backfill(entries, checkpoint_path=out_path,
                              force_recompose=args.force_recompose)
        with out_path.open("w") as f:
            json.dump(result, f, ensure_ascii=False, indent=2)
        done = sum(1 for e in result if e.get("image_url"))
        print(f"[pipeline] backfill done {done}/{len(result)} → {out_path}", file=sys.stderr)

    elif args.mode == "generate":
        print("generate mode: not implemented in MVP (use backfill with single entry)",
              file=sys.stderr)
        return 1

    elif args.mode == "collect":
        # sources 통합 수집
        sys.path.insert(0, str(SKILL_ROOT / "lib" / "sources"))
        import reddit, rss_aggregator      # noqa: E402
        reddit_posts = reddit.fetch_all(limit_per_sub=3, min_score=100)
        rss_posts = rss_aggregator.fetch_all()
        pool = [
            {"source": "reddit", **r.__dict__} for r in reddit_posts
        ] + [
            {"source": "rss", **r.__dict__} for r in rss_posts
        ]
        out_path = args.output or Path("/tmp/tnp_pool.json")
        with out_path.open("w") as f:
            json.dump(pool, f, ensure_ascii=False, indent=2, default=str)
        print(f"[pipeline] {len(pool)} candidates → {out_path}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    sys.exit(main())
