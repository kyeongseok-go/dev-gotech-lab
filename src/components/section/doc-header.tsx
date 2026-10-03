import Link from "next/link";
import type { ReactNode } from "react";

export interface Crumb {
	href: string;
	label: string;
}

interface DocHeaderProps {
	/** 위치 (Home 다음부터) */
	crumbs: Crumb[];
	/** 기록 도장 — 예: { k: "Entry", v: "017" } */
	stamp?: { k: string; v: string };
	/** 모노 메타 줄 항목 (구분점은 CSS 가 넣는다) */
	meta?: ReactNode[];
	/** 제목 위 작은 줄 (연재 표시 등) */
	kicker?: ReactNode;
	title: ReactNode;
	/** 제목 아래 리드 */
	lead?: ReactNode;
	/** 리드 아래 (태그·버튼 등) */
	children?: ReactNode;
	/** 제목 최대 폭 (em) */
	titleWidth?: string;
}

/**
 * 상세 문서 머리 — 블로그·카드뉴스·프로젝트·쇼케이스 상세가 같은 골격을 쓴다.
 * ┌ 잉크 룰 ─ 위치(모노) ············· 기록 도장
 * ├ 메타 줄: 날짜 · 분량 · 분류 …
 * ├ (연재 등 kicker)
 * ├ 제목 (type-article-title)
 * └ 리드(잉크 여백선 + 주홍 눈금) · children
 */
export function DocHeader({ crumbs, stamp, meta, kicker, title, lead, children, titleWidth = "22em" }: DocHeaderProps) {
	return (
		<header className="mb-12 md:mb-16">
			<div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-on-surface pt-3">
				<nav aria-label="위치" className="font-code text-xs uppercase tracking-[0.08em] text-on-surface-muted">
					<ol className="flex flex-wrap items-center gap-1.5">
						<li>
							<Link href="/" className="transition-colors hover:text-on-surface">
								Home
							</Link>
						</li>
						{crumbs.map((c) => (
							<li key={c.href} className="flex items-center gap-1.5">
								<span aria-hidden>/</span>
								<Link href={c.href} className="transition-colors hover:text-on-surface">
									{c.label}
								</Link>
							</li>
						))}
					</ol>
				</nav>
				{stamp && (
					<p className="entry-stamp">
						{stamp.k} <b className="tabular">{stamp.v}</b>
					</p>
				)}
			</div>
			{meta && meta.length > 0 && (
				<p className="meta-line mt-4">
					{meta.map((m, i) => (
						<span key={i}>{m}</span>
					))}
				</p>
			)}
			{kicker && <div className="mt-8">{kicker}</div>}
			<h1 className={`${kicker ? "mt-5" : "mt-8"} type-article-title text-on-surface`} style={{ maxWidth: titleWidth }}>
				{title}
			</h1>
			{lead && <p className="lead-rule mt-7 max-w-[46rem] type-body text-on-surface-variant">{lead}</p>}
			{children}
		</header>
	);
}
