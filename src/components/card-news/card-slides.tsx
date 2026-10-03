import type { CSSProperties, ReactNode } from "react";
import { CATEGORY_LABEL, SOURCE_KIND_LABEL, cleanText, type CardView } from "@/lib/card-news";
import { SlideRail } from "./slide-rail";

/**
 * 카드뉴스 HTML 슬라이드 템플릿 (1:1) — 연구 노트 "표본 카드".
 * 구성 규칙 — ①표지 ②무슨 일인가(원문 발췌) ③왜 중요한가(의견이 있을 때만) ④핵심 숫자(원문에 있을 때만) ⑤출처.
 * 최소 3장(①②⑤), 최대 5장. 모든 문구는 데이터에 있는 값만 쓰고 지어내지 않는다.
 * 고정 위치: 장 라벨 좌상단 · 일련번호 우상단 · 출처 칩 좌하단 · 장 번호 우하단.
 * 표지·출처는 카본 노트, 본문 장은 미색 모눈 종이. 이미지로 내보낼 카드와 같도록 두 테마에서 같은 색을 쓴다.
 */

type Tone = "carbon" | "paper";

interface SlideSpec {
  key: string;
  /** "§01" 같은 장 번호 (표지는 없음) */
  no?: string;
  label: string;
  tone: Tone;
  body: ReactNode;
}

/** 슬라이드 전용 고정 색 — 화면 테마와 무관 (내보낼 이미지와 동일) */
const TONE: Record<Tone, { bg: string; ink: string; muted: string; rule: string; grid: string; mark: string }> = {
  carbon: {
    bg: "#0F0F0D",
    ink: "#EEECE4",
    muted: "#A3A095",
    rule: "rgba(238,236,228,0.28)",
    grid: "rgba(238,236,228,0.05)",
    mark: "oklch(0.74 0.165 38)",
  },
  paper: {
    bg: "#F4F2EC",
    ink: "#16150F",
    muted: "#5C584E",
    rule: "rgba(22,21,15,0.32)",
    grid: "rgba(44,82,140,0.09)",
    mark: "oklch(0.56 0.18 38)",
  },
};

function headlineSize(text: string): string {
  // 글자 수에 따라 컨테이너 폭(cqi) 기준으로 줄인다 — 어떤 폭에서도 5줄 안쪽
  const n = text.length;
  if (n <= 24) return "clamp(1.5rem, 11.5cqi, 4rem)";
  if (n <= 48) return "clamp(1.25rem, 9.2cqi, 3.125rem)";
  if (n <= 80) return "clamp(1.125rem, 7.6cqi, 2.625rem)";
  return "clamp(1rem, 6.4cqi, 2.125rem)";
}

const BODY_SIZE = "clamp(0.9375rem, 5.2cqi, 1.5rem)";

function buildSlides(card: CardView): SlideSpec[] {
  const slides: SlideSpec[] = [
    {
      key: "cover",
      label: CATEGORY_LABEL[card.category] ?? card.category,
      tone: "carbon",
      body: (
        <h3
          className="line-clamp-5 font-bold leading-[1.12] tracking-[-0.035em]"
          style={{ fontSize: headlineSize(card.title) }}
        >
          {card.title}
        </h3>
      ),
    },
    {
      key: "what",
      label: "무슨 일인가 · 원문 발췌",
      tone: "paper",
      body: (
        <>
          <p
            className="relative line-clamp-6 border-l pl-[5%] leading-[1.62]"
            style={{ fontSize: BODY_SIZE, borderColor: TONE.paper.ink }}
          >
            <span aria-hidden className="absolute -left-[2px] top-0 h-[1em] w-[3px]" style={{ background: TONE.paper.mark }} />
            {card.excerpt}
          </p>
          {card.excerptTruncated && (
            <p className="mt-3 font-code text-[clamp(0.625rem,2.6cqi,0.8125rem)]" style={{ color: TONE.paper.muted }}>
              … 이하 원문에서 계속
            </p>
          )}
        </>
      ),
    },
  ];

  const opinion = cleanText(card.content);
  if (opinion) {
    slides.push({
      key: "why",
      label: "왜 중요한가 · 고텍이 의견",
      tone: "paper",
      body: (
        <p className="line-clamp-6 leading-[1.62]" style={{ fontSize: BODY_SIZE }}>
          {opinion}
        </p>
      ),
    });
  }

  if (card.numbers.length > 0) {
    slides.push({
      key: "numbers",
      label: "핵심 숫자 · 원문 표기 그대로",
      tone: "paper",
      body: (
        <ul className="border-t" style={{ borderColor: TONE.paper.ink }}>
          {card.numbers.map((n, i) => (
            <li
              key={n}
              className="flex items-baseline gap-[4%] border-b py-[3%]"
              style={{ borderColor: TONE.paper.rule }}
            >
              <span className="font-code tabular text-[clamp(0.625rem,2.6cqi,0.8125rem)]" style={{ color: TONE.paper.muted }}>
                N°{i + 1}
              </span>
              <span className="font-code font-semibold leading-none tabular" style={{ fontSize: "clamp(1.375rem, 10cqi, 3.5rem)" }}>
                {n}
              </span>
            </li>
          ))}
        </ul>
      ),
    });
  }

  slides.push({
    key: "source",
    label: "출처 · Reference",
    tone: "carbon",
    body: card.source ? (
      <div className="space-y-[4%]">
        <p className="font-bold leading-[1.15] tracking-[-0.03em]" style={{ fontSize: "clamp(1.25rem, 8.4cqi, 2.75rem)" }}>
          {card.source.name}
        </p>
        <p className="font-code text-[clamp(0.6875rem,2.8cqi,0.875rem)] break-all" style={{ color: TONE.carbon.muted }}>
          {card.source.host} · {SOURCE_KIND_LABEL[card.source.kind]}
        </p>
        <p className="text-[clamp(0.75rem,3.4cqi,1rem)] leading-relaxed">
          {card.source.isMediaLink
            ? "원문 미디어(이미지·영상 파일) 링크입니다. 기사 본문이 아닙니다."
            : "전체 내용과 맥락은 원문에서 확인하세요. 저작권은 원저작자에게 있습니다."}
        </p>
      </div>
    ) : (
      <p className="text-[clamp(0.75rem,3.4cqi,1rem)]">원문 링크가 없는 카드입니다.</p>
    ),
  });

  // 표지를 뺀 장에 §01.. 번호
  return slides.map((s, i) => (i === 0 ? s : { ...s, no: `§${String(i).padStart(2, "0")}` }));
}

interface CardSlideProps {
  card: CardView;
  spec: SlideSpec;
  index: number;
  total: number;
}

export function CardSlide({ card, spec, index, total }: CardSlideProps) {
  const t = TONE[spec.tone];
  const style: CSSProperties = {
    containerType: "inline-size",
    background: t.bg,
    color: t.ink,
    backgroundImage: `linear-gradient(${t.grid} 1px, transparent 1px), linear-gradient(90deg, ${t.grid} 1px, transparent 1px)`,
    backgroundSize: "8.333% 8.333%",
    // 카본 장은 다크 화면 바탕과 섞이지 않도록 분필색 1px 테두리
    boxShadow: spec.tone === "carbon" ? "inset 0 0 0 1px rgba(238,236,228,0.18)" : "inset 0 0 0 1px rgba(22,21,15,0.12)",
  };
  const small = "font-code text-[clamp(0.625rem,2.6cqi,0.8125rem)] uppercase tracking-[0.1em]";
  return (
    <div className="relative flex aspect-square w-full flex-col overflow-hidden p-[7%]" style={style}>
      {/* 머리: 장 라벨 + 일련번호, 아래 잉크 룰 */}
      <div className={`flex items-start justify-between gap-3 border-b pb-[3%] ${small}`} style={{ borderColor: t.rule }}>
        <span className="inline-flex items-center gap-[0.5em]">
          <span aria-hidden className="inline-block size-[0.7em]" style={{ background: t.mark }} />
          {spec.no && <span className="tabular">{spec.no}</span>}
          <span>{spec.label}</span>
        </span>
        <span className="tabular" style={{ color: t.muted }}>
          {card.serial}
        </span>
      </div>

      <div className="my-auto min-h-0 py-[5%]">{spec.body}</div>

      {/* 발: 출처 칩 + 장 번호 */}
      <div className={`flex items-end justify-between gap-3 ${small} normal-case tracking-[0.04em]`}>
        <span className="inline-flex max-w-[75%] items-center gap-1.5 px-[0.6em] py-[0.3em]" style={{ boxShadow: `inset 0 0 0 1px ${t.rule}` }}>
          <span className="truncate">{card.source ? card.source.name : "GoTechy"}</span>
          {card.source && (
            <span className="hidden @[18rem]:inline" style={{ color: t.muted }}>
              · {SOURCE_KIND_LABEL[card.source.kind]}
            </span>
          )}
        </span>
        <span className="tabular" style={{ color: t.muted }}>
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

/** 표지 한 장만 (홈 미리보기 등) */
export function CardCover({ card }: { card: CardView }) {
  const slides = buildSlides(card);
  return <CardSlide card={card} spec={slides[0]} index={0} total={slides.length} />;
}

/** 슬라이드 묶음 — 가로 스냅 레일 + 이전/다음 버튼 */
export function CardSlides({ card }: { card: CardView }) {
  const slides = buildSlides(card);
  return (
    <section aria-labelledby="slides-title">
      <h2 id="slides-title" className="sr-only">
        카드 슬라이드 {slides.length}장
      </h2>
      <SlideRail count={slides.length} label="카드 슬라이드 — 좌우로 넘겨 보기">
        {slides.map((spec, i) => (
          <li
            key={spec.key}
            data-slide
            className="w-[min(82vw,25rem)] flex-none snap-start"
            aria-label={`${i + 1}/${slides.length} ${spec.label}`}
          >
            <CardSlide card={card} spec={spec} index={i} total={slides.length} />
          </li>
        ))}
      </SlideRail>
    </section>
  );
}
