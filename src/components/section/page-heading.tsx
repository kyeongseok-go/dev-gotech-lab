import type { ReactNode } from "react";

interface PageHeadingProps {
	/** 모노 라벨 (예: "Blog · Insights") */
	eyebrow?: string;
	/** 거대 디스플레이 제목 */
	title: ReactNode;
	/** 본문 (선택) */
	lead?: ReactNode;
	/** 우측 카운트 (예: 17 → "017"). 클라이언트에서 바뀌는 값은 노드로 넘긴다(그대로 표시) */
	count?: string | number | ReactNode;
	/** XL 사이즈 vs 기본 */
	size?: "xl" | "default";
}

/**
 * 랩 노트북 페이지 타이틀.
 * 상단: 잉크 룰 + 모노 메타 행(라벨 · 건수) → 거대 제목 → 본문.
 * 제목은 좌측 9칸, 본문은 우측 하단으로 엇갈려 스케일 대비를 만든다.
 */
export function PageHeading({
	eyebrow,
	title,
	lead,
	count,
	size = "default",
}: PageHeadingProps) {
	const countText =
		typeof count === "string" || typeof count === "number" ? String(count).padStart(3, "0") : (count ?? null);
	return (
		<header className="relative mb-14 md:mb-20">
			<div className="flex items-baseline justify-between gap-6 border-t border-on-surface pt-3 mb-8 md:mb-12">
				{eyebrow && <span className="section-label">{eyebrow}</span>}
				{countText && (
					<span className="font-code text-xs text-on-surface-muted tabular">
						N = <span className="text-on-surface">{countText}</span>
					</span>
				)}
			</div>
			<div className="grid grid-cols-12 gap-x-6 gap-y-8 items-end">
				<h1
					className={`col-span-12 lg:col-span-9 ${
						size === "xl" ? "type-display-xl" : "type-display"
					} rise-in text-on-surface`}
				>
					{title}
				</h1>
				{lead && (
					<p
						className="col-span-12 lg:col-span-3 type-small text-on-surface-variant rise-in lg:pb-3"
						style={{ animationDelay: "120ms" }}
					>
						{lead}
					</p>
				)}
			</div>
		</header>
	);
}
