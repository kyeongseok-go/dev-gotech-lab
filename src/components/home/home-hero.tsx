import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DecryptedText } from "@/components/effects/decrypted-text";

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
 * ├ 좌 8칸: 초대형 디스플레이 제목 + 리드 + CTA
 * └ 우 4칸: FIG.01 도판(모눈 + 크롭마크) — 인물이 글자와 겹치지 않도록 분리
 */
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

			<div className="grid grid-cols-12 gap-x-6 gap-y-12 pt-10 md:pt-16 pb-14 md:pb-20">
				{/* 제목 + 리드 */}
				<div className="col-span-12 lg:col-span-8 flex flex-col">
					<h1 id="hero-title" className="type-display-xl text-on-surface rise-in">
						<span className="block">Go Build the</span>
						<span className="block">
							<span className="marker">Technology,</span>
						</span>
						<span className="block text-on-surface-muted">more easy.</span>
					</h1>

					<div className="mt-10 md:mt-14 grid grid-cols-12 gap-6 items-end">
						<p
							className="col-span-12 md:col-span-7 type-body text-on-surface-variant rise-in"
							style={{ animationDelay: "120ms" }}
						>
							오피스 SW 엔진을 <span className="text-em">5년 5개월</span> 다룬 풀스택 엔지니어의 연구 노트.
							지금은 <span className="text-em">AI를 페어 파트너</span>로 두고, 만들고 부딪힌 기록을 매일 남깁니다.
						</p>
						<div
							className="col-span-12 md:col-span-5 flex flex-wrap gap-3 md:justify-end rise-in"
							style={{ animationDelay: "200ms" }}
						>
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

				{/* FIG.01 도판 */}
				<figure className="col-span-12 sm:col-span-8 sm:col-start-3 lg:col-span-4 lg:col-start-9 rise-in" style={{ animationDelay: "160ms" }}>
					<div className="crop-frame">
						<span aria-hidden className="crop crop-tl" />
						<span aria-hidden className="crop crop-tr" />
						<span aria-hidden className="crop crop-bl" />
						<span aria-hidden className="crop crop-br" />
						<div className="lab-grid relative aspect-[4/5] overflow-hidden bg-surface-container-low">
							<span className="absolute left-3 top-3 z-10 font-code text-[11px] uppercase tracking-[0.1em] text-on-surface-muted">
								Fig. 01
							</span>
							<span className="absolute right-3 top-3 z-10 font-code text-[11px] tabular text-on-surface-muted">
								1200×1800
							</span>
							<Image
								src="/images/hero-nobg.png"
								alt="고경석 프로필 사진"
								fill
								priority
								sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 30vw"
								className="object-contain object-bottom"
							/>
						</div>
					</div>
					<figcaption className="mt-5 grid grid-cols-[auto_1fr] gap-x-3 text-sm leading-relaxed">
						<span className="font-code text-xs text-do-primary pt-0.5">↳</span>
						<span className="text-on-surface-variant">
							<span className="text-on-surface font-semibold">고경석</span> — 풀스택 엔지니어.
							HWP·OOXML 문서 엔진에서 출발해 Next.js · Claude API 로 서비스를 만든다.
						</span>
					</figcaption>
				</figure>
			</div>
		</section>
	);
}
