import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DecryptedText } from "@/components/effects/decrypted-text";
import portraitHero from "../../../public/images/portrait-hero.webp";

interface HomeHeroProps {
	/** 최신 기록 번호 (공개 글 수) */
	entryNumber: string;
	/** 최신 기록 날짜 "2026.09.30" */
	lastEntryDate: string;
}

/**
 * 홈 히어로 — 연구 노트 첫 장.
 * 구조 참고: Tailark OSS Mist "features-5"(2:3 분할 제목/본문)·Veil hero 의 절제된 위계 (MIT).
 * ┌ 메타 스트립(모노): 노트 이름 · 기록 번호 · 마지막 기록 · 장소
 * ├ 좌 7칸: 초대형 디스플레이 제목 → 리드(잉크 여백선 + 주홍 눈금) → CTA
 * └ 우 5칸: FIG.01 인물 도판 — 누끼 사진(4:5, WebP 1000×1250)을 인화지 모눈 위에.
 *    인화지는 두 테마 모두 밝은 종이라 검은 재킷·머리가 다크 바탕에서도 분리된다.
 *    머리 위 여백을 둔 원본 비율 그대로라 어떤 폭에서도 얼굴이 잘리지 않는다.
 * 모바일 순서: 제목 → 도판 → 리드·CTA (사진이 제목 바로 다음).
 */
/** 홈 섹션 색인 — 각 섹션 제목 id 로 이동 */
const CONTENTS = [
	{ no: "01", label: "프로젝트 케이스 스터디", href: "#works-title" },
	{ no: "02", label: "작업 절차", href: "#method-title" },
	{ no: "03", label: "최신 기록", href: "#insights-title" },
	{ no: "04", label: "AI 쇼케이스", href: "#showcase-title" },
	{ no: "05", label: "오늘의 카드뉴스", href: "#cardnews-title" },
] as const;

export function HomeHero({ entryNumber, lastEntryDate }: HomeHeroProps) {
	const meta = [
		{ k: "Vol.", v: "2026" },
		{ k: "Entry", v: entryNumber },
		{ k: "Last", v: lastEntryDate },
		{ k: "Loc.", v: "Seoul, KR" },
	];

	return (
		<section aria-labelledby="hero-title" className="relative">
			{/* 메타 스트립 */}
			<div className="grid grid-cols-2 md:grid-cols-[1.4fr_repeat(4,1fr)] border-y border-on-surface font-code text-[11px] md:text-xs uppercase tracking-[0.1em]">
				<div className="col-span-2 md:col-span-1 flex items-center gap-2 py-2.5 border-b md:border-b-0 border-hairline">
					<span aria-hidden className="inline-block size-2 bg-do-primary" />
					<DecryptedText
						text="GoTechy Lab Notebook"
						className="text-on-surface"
						encryptedClassName="text-do-primary"
					/>
				</div>
				{meta.map(({ k, v }, i) => (
					<div
						key={k}
						className={`flex items-baseline gap-2 py-2.5 md:pl-4 md:border-l border-hairline ${
							i % 2 === 1 ? "pl-4 border-l" : ""
						} ${i < 2 ? "border-b md:border-b-0" : ""}`}
					>
						<span className="text-on-surface-muted">{k}</span>
						<span className="text-on-surface tabular">{v}</span>
					</div>
				))}
			</div>

			<div className="grid grid-cols-12 gap-x-6 lg:gap-x-12 gap-y-10 lg:gap-y-8 pt-8 md:pt-12 pb-14 md:pb-20">
				{/* 이 페이지 목차(데스크톱) + 제목 */}
				<div className="col-span-12 lg:col-span-7 lg:row-start-1 flex flex-col justify-between gap-8">
					<nav aria-label="이 페이지 목차" className="hidden lg:block max-w-[26rem]">
						<p className="font-code text-[11px] uppercase tracking-[0.12em] text-on-surface-muted">Contents · 이 노트에서</p>
						<ol className="mt-3 border-t border-hairline">
							{CONTENTS.map((c) => (
								<li key={c.href} className="border-b border-hairline">
									<a
										href={c.href}
										className="group grid grid-cols-[2.25rem_1fr_auto] items-baseline gap-2 py-1 text-[13px] text-on-surface-variant transition-colors hover:text-on-surface"
									>
										<span className="font-code text-[11px] tabular text-do-primary">§{c.no}</span>
										<span>{c.label}</span>
										<span aria-hidden className="font-code text-[11px] text-on-surface-faint transition-transform group-hover:translate-x-0.5">→</span>
									</a>
								</li>
							))}
						</ol>
					</nav>
					<h1
						id="hero-title"
						className="type-display-xl text-on-surface rise-in lg:!text-[length:clamp(4.5rem,0.9rem+5.6vw,7.5rem)]"
					>
						<span className="block">Go Build the</span>
						<span className="block">
							<span className="marker">Technology,</span>
						</span>
						<span className="block text-on-surface-muted">more easy.</span>
					</h1>
				</div>

				{/* FIG.01 도판 */}
				<figure
					className="col-span-12 sm:col-span-10 sm:col-start-2 md:col-span-8 md:col-start-3 lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2"
				>
					{/* LCP 요소라 진입 모션(투명도 0 구간)을 주지 않는다 */}
					<div className="crop-frame">
						<span aria-hidden className="crop crop-tl" />
						<span aria-hidden className="crop crop-tr" />
						<span aria-hidden className="crop crop-bl" />
						<span aria-hidden className="crop crop-br" />
						<div className="plate aspect-[4/5]">
							<span className="plate-label left-3 top-3">Fig. 01</span>
							<span className="plate-label right-3 top-3 tabular opacity-80">Plate · 4:5</span>
							<span aria-hidden className="plate-floor" />
							<Image
								src={portraitHero}
								alt="고경석 — 검은 재킷 차림으로 의자에 앉아 정면을 보며 옅게 웃는 사진"
								priority
								fetchPriority="high"
								placeholder="empty"
								sizes="(min-width: 1344px) 520px, (min-width: 1024px) 38vw, (min-width: 768px) 64vw, (min-width: 640px) 80vw, 92vw"
								className="relative z-[1] block h-full w-full object-cover object-top"
							/>
							<span aria-hidden className="plate-scale left-3 top-8 w-[18%]" />
							<span aria-hidden className="plate-reg right-4 top-9" />
						</div>
					</div>
					<figcaption className="fig-cap mt-6">
						<span className="fig-no">Fig. 01</span>
						<span>
							<span className="font-semibold text-on-surface">고경석</span> — 풀스택 엔지니어. HWP·OOXML 문서 엔진에서
							출발해 Next.js · Claude API 로 서비스를 만든다.
						</span>
					</figcaption>
				</figure>

				{/* 리드 + CTA */}
				<div className="col-span-12 lg:col-span-7 lg:row-start-2 flex flex-col gap-7">
					<p
						className="lead-rule max-w-[40rem] type-body text-on-surface-variant rise-in"
						style={{ animationDelay: "160ms" }}
					>
						오피스 SW 엔진을 <span className="text-em">5년 5개월</span> 다룬 풀스택 엔지니어의 연구 노트.
						지금은 <span className="text-em">AI를 페어 파트너</span>로 두고, 만들고 부딪힌 기록을 매일 남깁니다.
					</p>
					<div className="flex flex-wrap gap-3 rise-in" style={{ animationDelay: "200ms" }}>
						<Link href="/projects" className="btn-primary inline-flex h-12 px-6 text-[15px]">
							프로젝트 보기
							<ArrowUpRight aria-hidden size={16} className="btn-arrow" />
						</Link>
						<Link href="/blog" className="btn-outline inline-flex h-12 px-6 text-[15px]">
							기록 읽기
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
