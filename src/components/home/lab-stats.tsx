import { NumberTicker } from "@/components/ui/number-ticker";

export interface LabStat {
	value: number;
	unit: string;
	label: string;
}

interface LabStatsProps {
	stats: ReadonlyArray<LabStat>;
}

/**
 * 측정값 스트립.
 * 출처: Tailark OSS Veil "stats-1"(@tailark-oss/veil-stats-1, MIT) 의 border-y 셀 구조를
 * 4열 헤어라인 표로 확장 + Magic UI NumberTicker 로 실제 콘텐츠 수치를 카운트업.
 */
export function LabStats({ stats }: LabStatsProps) {
	return (
		<section aria-label="주요 수치" className="border-y border-hairline">
			<dl className="grid grid-cols-2 lg:grid-cols-4">
				{stats.map((s, i) => (
					<div
						key={s.label}
						className={`flex flex-col justify-between gap-6 py-6 md:py-8 pr-4 ${
							i % 2 === 1 ? "pl-4 border-l border-hairline" : ""
						} ${i >= 2 ? "border-t lg:border-t-0 border-hairline" : ""} ${
							i === 2 ? "lg:pl-4 lg:border-l" : ""
						}`}
					>
						<dt className="font-code text-[11px] uppercase tracking-[0.1em] text-on-surface-muted">
							M-{String(i + 1).padStart(2, "0")} · {s.label}
						</dt>
						<dd className="flex items-baseline gap-2">
							<NumberTicker
								value={s.value}
								padStart={2}
								delay={0.15 * i}
								className="font-code font-medium text-on-surface text-[clamp(2.5rem,1.6rem+3vw,4.25rem)] leading-none tracking-[-0.04em]"
							/>
							<span className="text-sm text-on-surface-variant">{s.unit}</span>
						</dd>
					</div>
				))}
			</dl>
		</section>
	);
}
