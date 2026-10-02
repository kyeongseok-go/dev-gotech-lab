import { Marquee } from "@/components/ui/marquee";

const STACK = [
	"TypeScript",
	"Next.js",
	"React",
	"Tailwind CSS",
	"Node.js",
	"C++",
	"Java",
	"Docker",
	"PostgreSQL",
	"pgvector",
	"Claude API",
	"Cloudflare",
	"HWPX Parser",
	"OOXML",
	"SSE Streaming",
	"Tibero ODBC",
] as const;

/**
 * 스택 티커 테이프 — Magic UI Marquee(@magicui/marquee, MIT).
 * 모노 대문자 · 슬래시 구분 · hover 정지. reduced-motion 이면 정지 상태로 표시.
 */
export function StackTicker() {
	return (
		<section aria-label="사용 기술" className="border-b border-hairline">
			<p className="sr-only">{STACK.join(", ")}</p>
			<Marquee
				aria-hidden
				pauseOnHover
				repeat={3}
				className="py-3 [--duration:48s] [--gap:0rem] [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]"
			>
				{STACK.map((s) => (
					<span
						key={s}
						className="flex items-center font-code text-xs uppercase tracking-[0.12em] text-on-surface-variant"
					>
						<span className="px-5">{s}</span>
						<span aria-hidden className="text-do-primary">/</span>
					</span>
				))}
			</Marquee>
		</section>
	);
}
