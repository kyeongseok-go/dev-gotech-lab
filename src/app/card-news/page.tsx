import type { Metadata } from "next";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { getPublishedCardNews, getCardNewsByCategory } from "@/lib/db/card-news";
import CardNewsGallery, { type CardNewsItem } from "@/components/card-news/card-news-gallery";

export const metadata: Metadata = {
  title: "카드뉴스",
  description: "최신 기술 동향과 트렌드를 카드뉴스로 빠르게 만나보세요.",
  alternates: { canonical: "/card-news" },
};

const CATEGORY_FILTERS = [
  { key: "all", label: "전체" },
  { key: "ai", label: "AI" },
  { key: "dev", label: "개발" },
  { key: "trend", label: "트렌드" },
  { key: "news", label: "뉴스" },
];

/* ── 벤토 그리드 스팬 패턴 ── */
const SPAN_PATTERNS = [
  "md:col-span-2 md:row-span-4 sm:col-span-2 sm:row-span-3 col-span-2 row-span-3",   // Large
  "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2 col-span-1 row-span-2",   // Small
  "md:col-span-2 md:row-span-3 sm:col-span-1 sm:row-span-2 col-span-1 row-span-2",   // Medium
  "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2 col-span-1 row-span-2",   // Small
  "md:col-span-1 md:row-span-3 sm:col-span-1 sm:row-span-2 col-span-1 row-span-2",   // Small
  "md:col-span-2 md:row-span-4 sm:col-span-2 sm:row-span-3 col-span-2 row-span-3",   // Large
];

/* ── 데모용 샘플 데이터 (DB가 비어 있을 때 폴백) ── */
const SAMPLE_DATA: CardNewsItem[] = [
  {
    id: 9001,
    slug: "pokemon-go-robot-training",
    title: "포켓몬 GO 플레이어들, 300억 장의 이미지로 배달 로봇 훈련에 기여",
    summary: "포켓몬 GO를 플레이하며 수집된 방대한 거리 이미지가 배달 로봇의 자율주행 학습 데이터로 활용되고 있다. Niantic의 AR 기술과 로보틱스의 접점이 주목받는 중.",
    content: "",
    category: "ai",
    image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600",
    external_link: "https://reddit.com/r/artificial",
    tags: ["로보틱스", "AR", "데이터"],
    created_at: "2026-03-16",
    span: "",
  },
  {
    id: 9002,
    slug: "norway-enshittification",
    title: "노르웨이, 'Enshittification'에 맞서다 — 더 나은 인터넷을 위한 정책",
    summary: "노르웨이 정부가 플랫폼 기업의 사용자 경험 저하('Enshittification') 문제에 대응하는 법안을 추진 중. 유럽 디지털 정책의 새로운 모델로 부상.",
    content: "",
    category: "trend",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600",
    external_link: "https://reddit.com/r/technology",
    tags: ["정책", "플랫폼", "유럽"],
    created_at: "2026-03-16",
    span: "",
  },
  {
    id: 9003,
    slug: "meta-moltbook-acquisition",
    title: "Meta, AI 에이전트가 상호작용하는 소셜 네트워크 Moltbook 인수",
    summary: "Meta가 AI 에이전트 전용 소셜 네트워크 Moltbook을 인수하며 AI 기반 소셜 플랫폼의 미래를 본격 준비. AI 에이전트 간 소통이 핵심 기능.",
    content: "",
    category: "news",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600",
    external_link: "https://reddit.com/r/artificial",
    tags: ["Meta", "AI에이전트", "인수합병"],
    created_at: "2026-03-15",
    span: "",
  },
  {
    id: 9004,
    slug: "bytedance-nvidia-chips",
    title: "ByteDance, 해외 Nvidia AI 칩 대규모 배치로 미국 제재 우회",
    summary: "ByteDance가 제3국을 통해 Nvidia의 고성능 AI 칩을 대규모로 확보한 정황이 포착. 미국의 대중 반도체 제재 실효성에 의문이 제기.",
    content: "",
    category: "news",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600",
    external_link: "https://reddit.com/r/artificial",
    tags: ["반도체", "제재", "ByteDance"],
    created_at: "2026-03-15",
    span: "",
  },
  {
    id: 9005,
    slug: "cognitive-ai-memory",
    title: "인지과학 기반 AI 메모리 시스템 구축 — 벡터 DB 대신 망각 곡선 활용",
    summary: "벡터 데이터베이스 대신 인지과학의 망각 곡선(Ebbinghaus) 이론을 활용한 새로운 AI 메모리 아키텍처가 제안됨. 더 인간적인 기억 체계를 구현.",
    content: "",
    category: "ai",
    image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600",
    external_link: "https://reddit.com/r/artificial",
    tags: ["인지과학", "메모리", "아키텍처"],
    created_at: "2026-03-15",
    span: "",
  },
  {
    id: 9006,
    slug: "anthropic-us-gov-lawsuit",
    title: "Anthropic, 미국 정부 상대로 '공급망 리스크' 지정 철회 소송",
    summary: "Anthropic이 미국 정부의 AI 공급망 리스크 지정에 반발해 소송을 제기. AI 기업과 정부 간 규제 갈등이 심화되는 양상.",
    content: "",
    category: "news",
    image_url: "https://images.unsplash.com/photo-1589254065878-42c014d66949?w=600",
    external_link: "https://reddit.com/r/technology",
    tags: ["Anthropic", "규제", "소송"],
    created_at: "2026-03-15",
    span: "",
  },
];

/** DB 결과를 갤러리용 CardNewsItem으로 변환 */
function toGalleryItems(
  dbItems: Awaited<ReturnType<typeof getPublishedCardNews>>,
): CardNewsItem[] {
  return dbItems.map((item, i) => {
    let tags: string[] = [];
    try {
      tags = JSON.parse(item.tags);
    } catch {
      /* ignore */
    }
    return {
      id: item.id,
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      content: item.content,
      category: item.category,
      image_url: item.image_url,
      external_link: item.external_link,
      tags,
      created_at: item.created_at,
      span: SPAN_PATTERNS[i % SPAN_PATTERNS.length],
    };
  });
}

/** 샘플 데이터에 span 할당 + 카테고리 필터 */
function getSampleItems(category: string): CardNewsItem[] {
  const filtered =
    category === "all"
      ? SAMPLE_DATA
      : SAMPLE_DATA.filter((d) => d.category === category);
  return filtered.map((item, i) => ({
    ...item,
    span: SPAN_PATTERNS[i % SPAN_PATTERNS.length],
  }));
}

interface Props {
  searchParams: Promise<{ category?: string }>;
}

export default async function CardNewsPage({ searchParams }: Props) {
  const { category } = await searchParams;
  const activeCategory = category || "all";

  const dbItems =
    activeCategory === "all"
      ? await getPublishedCardNews()
      : await getCardNewsByCategory(activeCategory);

  // DB에 데이터가 있으면 사용, 없으면 샘플 데이터 폴백
  const galleryItems =
    dbItems.length > 0
      ? toGalleryItems(dbItems)
      : getSampleItems(activeCategory);

  return (
    <PageContainer>
      {/* 페이지 헤더 */}
      <div className="mb-10">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          매일 업데이트
        </div>
        <h1 className="text-3xl font-bold tracking-tight">
          기술 트렌드 카드뉴스
        </h1>
        <p className="mt-2 text-muted-foreground">
          최신 기술 동향과 트렌드를 한눈에 파악하세요.
        </p>
      </div>

      {/* 카테고리 필터 */}
      <div className="mb-8 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map(({ key, label }) => (
          <Link
            key={key}
            href={key === "all" ? "/card-news" : `/card-news?category=${key}`}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
              activeCategory === key
                ? "bg-primary text-primary-foreground shadow-[0_0_12px_rgba(0,229,255,0.2)]"
                : "border border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* 벤토 갤러리 */}
      <CardNewsGallery items={galleryItems} />

      {/* 구독 유도 */}
      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <div className="pointer-events-none mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
            <polyline points="22,6 12,13 2,6" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-foreground">
          카드뉴스 구독하기
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          매일 새로운 기술 트렌드를 이메일로 받아보세요.
        </p>
        <div className="mt-4">
          <Link
            href="/subscribe"
            className="btn-glow inline-block rounded-xl px-6 py-2.5 text-sm"
          >
            구독 신청 &rarr;
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
