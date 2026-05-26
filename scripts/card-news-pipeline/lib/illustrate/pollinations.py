#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["requests>=2.31"]
# ///
"""Pollinations.ai 이미지 생성 래퍼.

URL-only 호출. 인증 키 없이 동작 (1/시간/IP rate-limit).
"""
from __future__ import annotations

import argparse
import sys
import time
from pathlib import Path
from urllib.parse import quote

import requests

DEFAULT_MODEL = "flux"
DEFAULT_WIDTH = 1024
DEFAULT_HEIGHT = 1024
BASE_URL = "https://image.pollinations.ai/prompt"


def generate(
    prompt: str,
    output: Path,
    model: str = DEFAULT_MODEL,
    width: int = DEFAULT_WIDTH,
    height: int = DEFAULT_HEIGHT,
    seed: int | None = None,
    nologo: bool = True,
    enhance: bool = False,
    max_retries: int = 2,
    timeout: int = 90,
) -> Path:
    """프롬프트로 이미지 생성 후 파일 저장. 실패 시 RuntimeError."""
    params = [f"width={width}", f"height={height}", f"model={model}"]
    if seed is not None:
        params.append(f"seed={seed}")
    if nologo:
        params.append("nologo=true")
    if enhance:
        params.append("enhance=true")

    url = f"{BASE_URL}/{quote(prompt)}?" + "&".join(params)

    last_err: Exception | None = None
    for attempt in range(1, max_retries + 2):
        try:
            resp = requests.get(url, timeout=timeout)
            resp.raise_for_status()
            content_type = resp.headers.get("Content-Type", "")
            if not content_type.startswith("image/"):
                raise RuntimeError(f"unexpected content-type: {content_type}")
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_bytes(resp.content)
            return output
        except Exception as e:
            last_err = e
            if attempt <= max_retries:
                wait = 2 ** attempt
                print(f"[pollinations] attempt {attempt} failed: {e}; retry in {wait}s",
                      file=sys.stderr)
                time.sleep(wait)
                continue
    raise RuntimeError(f"pollinations generate failed after {max_retries + 1} attempts: {last_err}")


def build_prompt(
    base_scene: str,
    entity_hint: str | None = None,
    style: str = "editorial photography, dramatic lighting, magazine cover quality",
) -> str:
    """엔티티 힌트 + 스타일을 합쳐서 일관된 톤의 프롬프트 빌드."""
    parts = [base_scene]
    if entity_hint:
        parts.append(entity_hint)
    parts.append(style)
    parts.append("no text, no logos, no watermarks")
    return ", ".join(parts)


def main() -> int:
    ap = argparse.ArgumentParser(description="Generate image via Pollinations FLUX.")
    ap.add_argument("--prompt", required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--model", default=DEFAULT_MODEL)
    ap.add_argument("--width", type=int, default=DEFAULT_WIDTH)
    ap.add_argument("--height", type=int, default=DEFAULT_HEIGHT)
    ap.add_argument("--seed", type=int, default=None)
    args = ap.parse_args()

    out = generate(args.prompt, args.output, args.model, args.width, args.height, args.seed)
    print(f"[pollinations] saved {out} ({out.stat().st_size:,} bytes)", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
