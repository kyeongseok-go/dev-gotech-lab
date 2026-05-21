import Image from "next/image";

/**
 * BrandLogo
 * ─────────────────────────────────────────────────────────────
 * • dark 모드: public/images/gotechy-logo.png  (사용자 원본 logo.png)
 * • light 모드: public/images/logo-light.png   (사용자가 직접 제공한 라이트 모드 전용 로고)
 *
 * 두 PNG 모두 사용자가 직접 제공한 파일이며, 컴포넌트에서는 어떤
 * 픽셀 변환·CSS filter 도 적용하지 않는다.
 *
 * 캔버스 콘텐츠가 위쪽으로 치우쳐 있어 박스 비율을 콘텐츠 bbox
 * 비율(약 2.85:1)에 맞추고 `object-cover` + `object-position`
 * 으로 위쪽만 잘라내 시각 중심을 정렬한다.
 */

const DISPLAY_RATIO = 2.85;
const OBJECT_POSITION = "center 22%";

type BrandLogoSize = "sm" | "md" | "lg";

const SIZE_HEIGHT: Record<BrandLogoSize, number> = {
  sm: 44,
  md: 60,
  lg: 80,
};

interface BrandLogoProps {
  size?: BrandLogoSize;
  priority?: boolean;
  className?: string;
}

export function BrandLogo({ size = "md", priority = false, className = "" }: BrandLogoProps) {
  const height = SIZE_HEIGHT[size];
  const width = Math.round(height * DISPLAY_RATIO);

  return (
    <span
      className={`brand-logo-wrap relative inline-block ${className}`}
      style={{ width, height }}
    >
      {/* 라이트 모드 — 사용자 제공 logo_light.png */}
      <Image
        src="/images/logo-light.png"
        alt="GoTechy"
        width={width}
        height={height}
        priority={priority}
        draggable={false}
        sizes={`${width}px`}
        style={{ objectPosition: OBJECT_POSITION }}
        className="brand-logo brand-logo-light absolute inset-0 h-full w-full select-none object-cover"
      />
      {/* 다크 모드 — 원본 logo.png */}
      <Image
        src="/images/gotechy-logo.png"
        alt=""
        aria-hidden
        width={width}
        height={height}
        priority={priority}
        draggable={false}
        sizes={`${width}px`}
        style={{ objectPosition: OBJECT_POSITION }}
        className="brand-logo brand-logo-dark absolute inset-0 h-full w-full select-none object-cover"
      />
    </span>
  );
}
