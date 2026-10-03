import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LabHeadProps {
	/** 섹션 번호 (예: "01") — "§01" 로 표기 */
	index: string;
	/** 섹션 제목 */
	title: ReactNode;
	/** 우측 메타 (건수·링크 등) */
	meta?: ReactNode;
	/** 제목 아래 한 줄 설명 */
	lead?: ReactNode;
	id?: string;
	className?: string;
}

/**
 * 랩 노트북 섹션 머리.
 * 잉크색 1px 상단 룰 위에 "§번호 · 제목 · 메타" 를 스위스 그리드로 정렬한다.
 */
export function LabHead({ index, title, meta, lead, id, className }: LabHeadProps) {
	return (
		<header className={cn("mb-10 md:mb-14", className)}>
			<div className="lab-head">
				<span className="lab-index">§{index}</span>
				<h2 id={id} className="type-label text-on-surface !tracking-[0.14em]">
					{title}
				</h2>
				{meta ? (
					<div className="font-code text-xs text-on-surface-muted tabular">{meta}</div>
				) : (
					<span />
				)}
			</div>
			{lead && (
				<p className="mt-6 max-w-2xl type-headline text-on-surface">{lead}</p>
			)}
		</header>
	);
}
