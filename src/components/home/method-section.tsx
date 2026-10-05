import { LabHead } from "@/components/section/lab-head";

/** 5년의 본인 개발 사이클(분석·설계·개발·안정화·배포)을 AI 협업 환경에 그대로 옮긴 5단계 */
const PROCESS = [
	{ idx: "01", title: "Analyze", kr: "분석", sub: "외부 스펙과 도메인을 깊이 읽는다. Claude가 코드베이스 단서를 빠르게 좁힌다." },
	{ idx: "02", title: "Design", kr: "설계", sub: "DB부터 클라이언트까지 한 줄로 잇는다. AI 페어가 트레이드오프를 검증한다." },
	{ idx: "03", title: "Build", kr: "개발", sub: "한 사람이 끝까지 짠다. SDD(Spec-Driven Development) 플로우로 AI와 페어 코딩.", active: true },
	{ idx: "04", title: "Stabilize", kr: "테스트 · 안정화", sub: "5년간 350건+ 케이스로 다진 감각으로 끝낸다. AI가 회귀·엣지 케이스를 발굴한다." },
	{ idx: "05", title: "Ship", kr: "배포", sub: "Docker · Vercel · Cloudflare로 끝맺는다. 배포와 동시에 블로그·Wiki로 자산화한다." },
] as const;

const OFFERS = [
	{ title: "Full-stack Web", desc: "Next.js · App Router · TypeScript" },
	{ title: "AI Integration", desc: "Claude API · RAG · SSE Streaming" },
	{ title: "Doc / Format Engine", desc: "OOXML · HWP · HWPX · Parser" },
	{ title: "Edge Deploy", desc: "Vercel · Railway · Cloudflare Workers" },
] as const;

/**
 * 방법론 섹션.
 * 출처: Tailark OSS Veil "content-1"(@tailark-oss/veil-content-1, MIT) — 좌 제목 / 우 정의 목록 2단 구성을
 * 실험 절차표(번호 · 단계 · 설명)로 재구성. 진행 중 단계(Build)만 마커로 표시.
 */
export function MethodSection() {
	return (
		<section aria-labelledby="method-title">
			<LabHead index="02" id="method-title" title="Method · 작업 절차" meta="Analyze → Ship" />
			<div className="grid grid-cols-12 gap-x-6 gap-y-10">
				<div className="col-span-12 lg:col-span-5">
					<p className="type-headline text-on-surface">
						발견에서 <span className="marker">배포</span>까지,
						<br />
						한 사람이 끝낸다.
					</p>
					<p className="mt-6 type-small text-on-surface-variant max-w-md">
						분석·설계·개발·안정화·배포 — 5년 5개월간 다듬은 사이클을 지금은 AI를 페어 파트너로 두고
						동일하게 굴립니다. 한 사이클을 한 사람이 끝까지 책임지는 1인 개발.
					</p>
				</div>
				<ol className="col-span-12 lg:col-span-7 border-b border-hairline">
					{PROCESS.map((p) => {
						const isActive = "active" in p && p.active;
						return (
							<li
								key={p.idx}
								className={`grid grid-cols-[3rem_1fr] md:grid-cols-[3.5rem_11rem_1fr] gap-x-4 gap-y-1 py-5 border-t ${
									isActive ? "border-do-primary" : "border-hairline"
								}`}
							>
								<span className={`font-code text-xs tabular pt-1 ${isActive ? "text-do-primary" : "text-on-surface-muted"}`}>
									{p.idx}
								</span>
								<div className="flex items-baseline gap-2 flex-wrap">
									<span className="type-title text-on-surface">{p.title}</span>
									<span className="font-code text-[11px] uppercase tracking-[0.08em] text-on-surface-muted">{p.kr}</span>
									{isActive && (
										<span className="font-code text-[11px] uppercase tracking-[0.08em] text-do-primary">● now</span>
									)}
								</div>
								<p className="col-start-2 md:col-start-3 type-small text-on-surface-variant">{p.sub}</p>
							</li>
						);
					})}
				</ol>
			</div>

			{/* 역량 4칸 — 헤어라인 표 */}
			<ul className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border border-hairline">
				{OFFERS.map((o, i) => (
					<li key={o.title} className="bg-page p-5 md:p-6">
						<span className="font-code text-[11px] tabular text-do-primary">C-{String(i + 1).padStart(2, "0")}</span>
						<p className="mt-6 type-title text-on-surface">{o.title}</p>
						<p className="mt-1 font-code text-xs text-on-surface-muted">{o.desc}</p>
					</li>
				))}
			</ul>
		</section>
	);
}
