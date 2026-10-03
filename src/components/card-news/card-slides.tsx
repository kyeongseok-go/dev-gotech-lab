import type { ReactNode } from "react";
import { CATEGORY_LABEL, SOURCE_KIND_LABEL, cleanText, type CardView } from "@/lib/card-news";

/**
 * 카드뉴스 HTML 슬라이드 템플릿 (1:1).
 * 구성 규칙 — ①표지 ②무슨 일인가 ③왜 중요한가(의견, 데이터가 있을 때만) ④핵심 숫자(원문에 있을 때만) ⑤출처.
 * 최소 3장(①②⑤), 최대 5장. 모든 문구는 데이터에 있는 값만 쓰고 지어내지 않는다.
 * 고정 위치: 일련번호 우상단 · 출처 배지 좌하단 · 장 번호 우하단 · 브랜드 노랑은 상단 얇은 띠로만.
 * 슬라이드는 두 테마 모두 차콜 바탕(이미지로 내보낼 카드와 같은 모습).
 */

interface SlideSpec {
  key: string;
  label: string;
  body: ReactNode;
}

function headlineSize(text: string): string {
  // 글자 수에 따라 컨테이너 폭(cqi) 기준으로 줄인다 — 어떤 폭에서도 4줄 안쪽
  const n = text.length;
  if (n <= 24) return "clamp(1.5rem, 11cqi, 3.75rem)";
  if (n <= 48) return "clamp(1.25rem, 9cqi, 3rem)";
  if (n <= 80) return "clamp(1.125rem, 7.4cqi, 2.5rem)";
  return "clamp(1rem, 6.2cqi, 2rem)";
}

function buildSlides(card: CardView): SlideSpec[] {
  const slides: SlideSpec[] = [
    {
      key: "cover",
      label: CATEGORY_LABEL[card.category] ?? card.category,
      body: (
        <h3 className="line-clamp-5 font-light leading-[1.18] tracking-[-0.01em] text-white" style={{ fontSize: headlineSize(card.title) }}>
          {card.title}
        </h3>
      ),
    },
    {
      key: "what",
      label: "무슨 일인가 · 원문 발췌",
      body: (
        <>
          <p className="line-clamp-6 leading-[1.6] text-[#E1E1E8]" style={{ fontSize: "clamp(0.9375rem, 5.2cqi, 1.5rem)" }}>
            “{card.excerpt}”
          </p>
          {card.excerptTruncated && <p className="mt-3 font-code text-[11px] text-[#C4C4CD]">… 이하 원문에서 계속</p>}
        </>
      ),
    },
  ];

  const opinion = cleanText(card.content);
  if (opinion) {
    slides.push({
      key: "why",
      label: "왜 중요한가 · 고텍이 의견",
      body: (
        <p className="line-clamp-6 leading-[1.6] text-[#E1E1E8]" style={{ fontSize: "clamp(0.9375rem, 5.2cqi, 1.5rem)" }}>
          {opinion}
        </p>
      ),
    });
  }

  if (card.numbers.length > 0) {
    slides.push({
      key: "numbers",
      label: "핵심 숫자 · 원문 표기 그대로",
      body: (
        <ul className="space-y-3">
          {card.numbers.map((n) => (
            <li key={n} className="font-code font-bold leading-none tabular text-white" style={{ fontSize: "clamp(1.5rem, 11cqi, 3.75rem)" }}>
              {n}
            </li>
          ))}
        </ul>
      ),
    });
  }

  slides.push({
    key: "source",
    label: "출처",
    body: card.source ? (
      <div className="space-y-3">
        <p className="font-light leading-tight text-white" style={{ fontSize: "clamp(1.25rem, 8cqi, 2.5rem)" }}>
          {card.source.name}
        </p>
        <p className="font-code text-xs text-[#C4C4CD] break-all">{card.source.host}</p>
        <p className="text-sm text-[#E1E1E8]">
          {card.source.isMediaLink
            ? "원문 미디어(이미지·영상 파일) 링크입니다. 기사 본문이 아닙니다."
            : "전체 내용과 맥락은 원문에서 확인하세요. 저작권은 원저작자에게 있습니다."}
        </p>
      </div>
    ) : (
      <p className="text-sm text-[#E1E1E8]">원문 링크가 없는 카드입니다.</p>
    ),
  });

  return slides;
}

export function CardSlide({
  card,
  spec,
  index,
  total,
}: {
  card: CardView;
  spec: SlideSpec;
  index: number;
  total: number;
}) {
  return (
    <div
      className="@container relative flex aspect-square w-full flex-col justify-between overflow-hidden bg-[#2E2E38] p-[7%] text-white"
      style={{ containerType: "inline-size" }}
    >
      {/* 브랜드 띠 */}
      <span aria-hidden className="absolute inset-x-0 top-0 h-1 bg-mark" />
      <div className="flex items-start justify-between gap-3 font-code text-[clamp(0.625rem,2.6cqi,0.8125rem)] uppercase tracking-[0.1em]">
        <span className="font-bold text-white">{spec.label}</span>
        <span className="tabular text-[#C4C4CD]">{card.serial}</span>
      </div>
      <div className="my-[5%] min-h-0">{spec.body}</div>
      <div className="flex items-end justify-between gap-3 font-code text-[clamp(0.625rem,2.6cqi,0.8125rem)]">
        <span className="inline-flex max-w-[75%] items-center gap-1.5 border border-white/40 px-2 py-1 font-bold">
          <span className="truncate">{card.source ? card.source.name : "GoTechy"}</span>
          {card.source && <span className="hidden @[18rem]:inline text-[#C4C4CD] font-normal">· {SOURCE_KIND_LABEL[card.source.kind]}</span>}
        </span>
        <span className="tabular text-[#C4C4CD]">
          {index + 1}/{total}
        </span>
      </div>
    </div>
  );
}

/** 슬라이드 묶음 — 가로 스냅 스크롤(키보드 포커스 가능한 영역) */
export function CardSlides({ card }: { card: CardView }) {
  const slides = buildSlides(card);
  return (
    <section aria-label={`카드 슬라이드 ${slides.length}장`}>
      <div
        tabIndex={0}
        role="region"
        aria-label="카드 슬라이드 — 좌우로 넘겨 보기"
        className="-mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] pb-4 [scrollbar-width:thin] snap-x snap-mandatory"
      >
        <ol className="flex gap-4">
          {slides.map((spec, i) => (
            <li key={spec.key} className="w-[min(82vw,26rem)] flex-none snap-start" aria-label={`${i + 1}/${slides.length} ${spec.label}`}>
              <CardSlide card={card} spec={spec} index={i} total={slides.length} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
