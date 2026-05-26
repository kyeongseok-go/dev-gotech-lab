#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["Pillow>=10.0"]
# ///
"""Image compositor — Pollinations 배경 + 옵션 entity asset 합성.

card-news-generator 가 텍스트 오버레이를 따로 입히기 때문에, 여기서는
배경 + 로고/인물 PNG 후합성까지만 담당한다. 출력은 600x600 PNG.
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont

CANVAS_SIZE = 600

CATEGORY_STYLE: dict[str, dict[str, str]] = {
    "ai":    {"color": "#00BCD4", "label": "AI"},
    "dev":   {"color": "#22C55E", "label": "DEV"},
    "trend": {"color": "#A855F7", "label": "TREND"},
    "news":  {"color": "#EF4444", "label": "NEWS"},
}
CATEGORY_FALLBACK_STYLE = {"color": "#6B7280", "label": "TECH"}

# macOS 시스템 폰트 (우선순위 순, .ttc 는 (path, subfont_index) 튜플).
# 영문: Helvetica Neue Bold (1) → Futura Bold (2) → Avenir Next Heavy (8) → Arial Bold
# 한글: Apple SD Gothic Neo ExtraBold (14) → Bold (6)
FONT_CANDIDATES_EN: list[tuple[str, int]] = [
    ("/System/Library/Fonts/HelveticaNeue.ttc", 1),         # Helvetica Neue Bold
    ("/System/Library/Fonts/Futura.ttc", 2),                # Futura Bold
    ("/System/Library/Fonts/Avenir Next.ttc", 8),           # Avenir Next Heavy
    ("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 0),
]
FONT_CANDIDATES_KO: list[tuple[str, int]] = [
    ("/System/Library/Fonts/AppleSDGothicNeo.ttc", 14),     # Apple SD Gothic Neo ExtraBold
    ("/System/Library/Fonts/AppleSDGothicNeo.ttc", 6),      # Bold (fallback)
]


def _load_font(text: str, size: int) -> ImageFont.FreeTypeFont:
    is_korean = any("가" <= ch <= "힣" for ch in text)
    candidates = FONT_CANDIDATES_KO if is_korean else FONT_CANDIDATES_EN
    for path, idx in candidates + FONT_CANDIDATES_EN:
        try:
            return ImageFont.truetype(path, size=size, index=idx)
        except OSError:
            continue
    return ImageFont.load_default()


def _resize_crop(img: Image.Image, target: int = CANVAS_SIZE) -> Image.Image:
    """비율 유지 리사이즈 + 중앙 크롭."""
    w, h = img.size
    if w == target and h == target:
        return img.copy()
    scale = max(target / w, target / h)
    new_w, new_h = int(w * scale), int(h * scale)
    img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
    left = (new_w - target) // 2
    top = (new_h - target) // 2
    return img.crop((left, top, left + target, top + target))


def _darken(img: Image.Image, opacity: float = 0.35) -> Image.Image:
    """텍스트 가독성용 어두운 오버레이."""
    if opacity <= 0:
        return img
    overlay = Image.new("RGBA", img.size, (0, 0, 0, int(255 * opacity)))
    return Image.alpha_composite(img.convert("RGBA"), overlay)


def _paste_logo(
    bg: Image.Image,
    logo_path: Path,
    position: str = "bottom-right",
    size_ratio: float = 0.22,
    padding: int = 32,
) -> Image.Image:
    """로고 PNG 를 우하단(기본)에 합성. 알파 채널 유지."""
    logo = Image.open(logo_path).convert("RGBA")
    target_w = int(CANVAS_SIZE * size_ratio)
    ratio = target_w / logo.width
    target_h = int(logo.height * ratio)
    logo = logo.resize((target_w, target_h), Image.Resampling.LANCZOS)

    # 위치 계산
    w, h = bg.size
    if position == "bottom-right":
        x, y = w - target_w - padding, h - target_h - padding
    elif position == "bottom-left":
        x, y = padding, h - target_h - padding
    elif position == "top-right":
        x, y = w - target_w - padding, padding
    elif position == "center-right":
        x, y = w - target_w - padding, (h - target_h) // 2
    else:
        x, y = w - target_w - padding, h - target_h - padding

    canvas = bg.convert("RGBA").copy()
    canvas.alpha_composite(logo, dest=(x, y))
    return canvas


def _hex_to_rgb(hex_color: str) -> tuple[int, int, int]:
    h = hex_color.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))  # type: ignore


def paste_brand_accent(
    bg: Image.Image,
    brand_color: str,
    border_width: int = 12,
    corner_band_height: int = 24,
) -> Image.Image:
    """브랜드 색상으로 좌측 두꺼운 보더 + 상단 얇은 띠를 그린다.
    opacity-30 디스플레이 환경에서도 살아남도록 진한 컬러로."""
    canvas = bg.convert("RGBA").copy()
    draw = ImageDraw.Draw(canvas)
    rgb = _hex_to_rgb(brand_color)
    w, h = canvas.size
    # 좌측 세로 보더
    draw.rectangle([(0, 0), (border_width, h)], fill=(*rgb, 255))
    # 상단 가로 띠
    draw.rectangle([(0, 0), (w, corner_band_height)], fill=(*rgb, 230))
    return canvas


def paste_brand_typography(
    bg: Image.Image,
    brand: str,
    color: tuple[int, int, int, int] = (255, 255, 255, 220),
    shadow: bool = True,
) -> Image.Image:
    """기업명 타이포그래피를 배경 좌상단에 크게 박는다.

    - 600x600 캔버스 기준, 글자 크기는 brand 길이에 따라 동적 (120 ~ 200pt)
    - 흰색 + drop shadow (가독성)
    - opacity-30 으로 렌더링되므로 매우 굵게 입혀야 살아남는다
    """
    text = brand.upper() if all(ord(c) < 128 for c in brand) else brand
    canvas = bg.convert("RGBA").copy()
    draw = ImageDraw.Draw(canvas)

    # 글자 길이에 따라 폰트 크기 동적 조절 (이전보다 살짝 작게, 호흡감)
    target_width = int(CANVAS_SIZE * 0.72)
    size = 150
    font = _load_font(text, size)
    bbox = draw.textbbox((0, 0), text, font=font)
    while (bbox[2] - bbox[0]) > target_width and size > 60:
        size -= 6
        font = _load_font(text, size)
        bbox = draw.textbbox((0, 0), text, font=font)

    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]
    x = (CANVAS_SIZE - text_w) // 2
    y = int(CANVAS_SIZE * 0.18)

    if shadow:
        for dx, dy in [(3, 3), (-2, 2), (2, -2)]:
            draw.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0, 180))
    draw.text((x, y), text, font=font, fill=color)
    return canvas


def paste_category_badge(bg: Image.Image, category: str) -> Image.Image:
    """entity 없는 비-브랜드 카드용 카테고리 배지 — 좌상단 작은 칩."""
    style = CATEGORY_STYLE.get(category, CATEGORY_FALLBACK_STYLE)
    label = style["label"]
    color = _hex_to_rgb(style["color"])

    canvas = bg.convert("RGBA").copy()
    draw = ImageDraw.Draw(canvas)

    font = _load_font(label, 32)
    bbox = draw.textbbox((0, 0), label, font=font)
    text_w = bbox[2] - bbox[0]
    text_h = bbox[3] - bbox[1]

    pad_x, pad_y = 18, 10
    badge_x0, badge_y0 = 28, 56   # 상단 밴드 아래 여백
    badge_x1 = badge_x0 + text_w + pad_x * 2
    badge_y1 = badge_y0 + text_h + pad_y * 2
    radius = 10

    draw.rounded_rectangle(
        [(badge_x0, badge_y0), (badge_x1, badge_y1)],
        radius=radius,
        fill=(*color, 230),
    )
    draw.text(
        (badge_x0 + pad_x, badge_y0 + pad_y),
        label,
        font=font,
        fill=(255, 255, 255, 255),
    )
    return canvas


def compose(
    bg_path: Path,
    output: Path,
    primary_asset: Path | None = None,
    secondary_asset: Path | None = None,
    brand_text: str | None = None,
    brand_color: str | None = None,
    category: str | None = None,
    darken_opacity: float = 0.35,
    primary_position: str = "bottom-right",
    primary_size_ratio: float = 0.28,
) -> Path:
    """Pollinations 배경 + 옵션 자산 합성 → 600x600 PNG 저장.

    brand entity 가 있으면 컬러 밴드 + 대형 타이포, 없으면 카테고리 배지로 fallback.
    """
    bg = Image.open(bg_path).convert("RGBA")
    bg = _resize_crop(bg)
    bg = _darken(bg, darken_opacity)

    effective_color = brand_color or (
        CATEGORY_STYLE.get(category or "", CATEGORY_FALLBACK_STYLE)["color"]
        if category else None
    )
    if effective_color:
        bg = paste_brand_accent(bg, effective_color)

    if brand_text:
        bg = paste_brand_typography(bg, brand_text)
    elif category:
        bg = paste_category_badge(bg, category)

    if primary_asset and primary_asset.exists():
        bg = _paste_logo(bg, primary_asset,
                         position=primary_position,
                         size_ratio=primary_size_ratio)

    if secondary_asset and secondary_asset.exists():
        bg = _paste_logo(bg, secondary_asset,
                         position="top-right",
                         size_ratio=0.12)

    output.parent.mkdir(parents=True, exist_ok=True)
    bg.convert("RGB").save(output, "PNG", optimize=True)
    return output


def main() -> int:
    ap = argparse.ArgumentParser(description="Composite background + entity assets.")
    ap.add_argument("--bg", type=Path, required=True)
    ap.add_argument("--output", type=Path, required=True)
    ap.add_argument("--primary", type=Path)
    ap.add_argument("--secondary", type=Path)
    ap.add_argument("--darken", type=float, default=0.35)
    args = ap.parse_args()

    out = compose(args.bg, args.output, args.primary, args.secondary, args.darken)
    print(f"[compositor] saved {out}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
