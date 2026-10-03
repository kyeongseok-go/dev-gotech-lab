import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PostRowData {
	slug: string;
	title: string;
	description?: string;
	category?: string;
	date: string;
	tags: string[];
}

interface PostRowProps {
	post: PostRowData;
	/** 목차 번호 (예: 17 → "017") */
	number: number;
	/** 표시용 날짜 문자열 */
	dateLabel: string;
	/** 읽기 시간(분) */
	readingMinutes?: number;
	/** 첫 항목 강조 (잡지 목차의 커버 스토리) */
	isLead?: boolean;
	headingLevel?: "h2" | "h3";
	/** 연재 배지 (예: "Karpathy LLM Wiki 연재 2/5") */
	seriesLabel?: string | null;
}

/**
 * 잡지 목차형 글 행.
 * [번호·날짜] [제목·요약] [분류·읽기시간 →] 3단 스위스 그리드, 행 사이 헤어라인.
 * 호버: 바탕 한 톤 + 제목 마커 색 + 화살표 이동(transform).
 */
export function PostRow({
	post,
	number,
	dateLabel,
	readingMinutes,
	isLead = false,
	headingLevel = "h2",
	seriesLabel,
}: PostRowProps) {
	const Heading = headingLevel;
	return (
		<Link
			href={`/blog/${post.slug}`}
			className="group grid grid-cols-12 gap-x-6 gap-y-3 border-t border-hairline py-6 md:py-8 transition-colors duration-300 hover:bg-surface-container-low focus-visible:bg-surface-container-low"
		>
			<div className="col-span-12 md:col-span-2 flex md:flex-col items-baseline md:items-start gap-3 md:gap-1 font-code text-xs tabular text-on-surface-muted md:pl-3">
				<span className="text-do-primary">No.{String(number).padStart(3, "0")}</span>
				<span>{dateLabel}</span>
			</div>
			<div className="col-span-12 md:col-span-8">
				{seriesLabel && (
					<p className="mb-2 inline-flex items-center gap-1.5 font-code text-[11px] font-bold uppercase tracking-[0.08em] text-on-surface-muted">
						<span aria-hidden className="inline-block size-1.5 bg-mark ring-1 ring-mark-edge" />
						연재 · {seriesLabel}
					</p>
				)}
				<Heading
					className={cn(
						"text-on-surface transition-colors duration-300 group-hover:text-do-primary",
						isLead ? "type-headline" : "type-title",
					)}
				>
					{post.title}
				</Heading>
				{post.description && (
					<p
						className={cn(
							"mt-3 text-on-surface-variant max-w-[62ch]",
							isLead ? "type-body line-clamp-3" : "type-small line-clamp-2",
						)}
					>
						{post.description}
					</p>
				)}
			</div>
			<div className="col-span-12 md:col-span-2 flex md:flex-col items-center md:items-end justify-between md:justify-start gap-2 md:pr-3 font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
				<span>{post.category ?? "note"}</span>
				<span className="flex items-center gap-2">
					{readingMinutes != null && <span className="tabular">{readingMinutes} min</span>}
					<ArrowUpRight
						aria-hidden
						size={16}
						className="text-on-surface transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
					/>
				</span>
			</div>
		</Link>
	);
}
