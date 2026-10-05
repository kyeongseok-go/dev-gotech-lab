/**
 * 카드뉴스 표시 계층 유틸.
 * 원문 데이터(src/app/card-news/page.tsx 의 CARD_NEWS_DATA)는 그대로 두고,
 * 화면에 보일 때만 엔티티 디코드·문장 단위 발췌·출처 분류를 한다.
 */

export interface CardNewsItem {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: "ai" | "dev" | "trend" | "news";
  image_url: string | null;
  external_link: string | null;
  tags: string[];
  created_at: string;
  span: string;
}

export const CATEGORY_LABEL: Record<string, string> = {
  ai: "AI",
  dev: "개발",
  trend: "트렌드",
  news: "뉴스",
};

/* ── 문구 정리 ─────────────────────────────────────────── */

const NAMED_ENTITIES: Record<string, string> = {
  amp: "&",
  quot: '"',
  apos: "'",
  lt: "<",
  gt: ">",
  nbsp: " ",
  hellip: "…",
  mdash: "—",
  ndash: "–",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
};

/** HTML 엔티티 디코드 — `&amp;quot;` 같은 이중 인코딩도 풀릴 때까지 반복(최대 3회) */
export function decodeEntities(input: string): string {
  let out = input;
  for (let i = 0; i < 3; i++) {
    const next = out.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, code: string) => {
      if (code[0] === "#") {
        const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
        return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : m;
      }
      return NAMED_ENTITIES[code.toLowerCase()] ?? m;
    });
    if (next === out) break;
    out = next;
  }
  return out;
}

/** 표시용 정리: 엔티티 디코드 + 폭 없는 공백 제거 + 공백 정규화 */
export function cleanText(input: string): string {
  return decodeEntities(input)
    .replace(/[​-‍﻿]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SENTENCE_END = /[.!?。！？…]["”’')\]]?$/;

/** 문장 끝으로 보면 안 되는 약어 (Albertsons Cos. is …) */
const ABBREVIATION_END = /\b(?:Cos|Co|Inc|Corp|Ltd|LLC|Jr|Sr|Mr|Mrs|Ms|Dr|Prof|St|vs|etc|approx|e\.g|i\.e|U\.S|U\.K|No|Vol|Fig)\.$/i;

/** 문장 단위로 나눔 (마침표·물음표·느낌표 뒤 공백 기준, 약어·소문자 이어짐은 합친다) */
export function splitSentences(text: string): string[] {
  const parts = text
    .split(/(?<=[.!?。！？…]["”’')\]]?)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const merged: string[] = [];
  for (const part of parts) {
    const prev = merged[merged.length - 1];
    if (prev !== undefined && (ABBREVIATION_END.test(prev) || /^[a-z]/.test(part))) {
      merged[merged.length - 1] = `${prev} ${part}`;
    } else {
      merged.push(part);
    }
  }
  return merged;
}

/**
 * 원문 발췌 — 완결된 문장만 maxChars 안에서 이어 붙인다(첫 문장은 maxChars×1.5 까지 허용).
 * 파이프라인이 원문 240자에서 기계적으로 자른 끝 문장(미완결)은 버리고,
 * 첫 문장부터 너무 길면 단어 경계에서 자르고 "…" 를 붙인다.
 */
export function excerpt(raw: string, maxChars = 140): { text: string; truncated: boolean } {
  const text = cleanText(raw);
  if (!text) return { text: "", truncated: false };
  const sentences = splitSentences(text);
  const complete = sentences.filter((s, i) => i < sentences.length - 1 || SENTENCE_END.test(s));
  // 첫 완결 문장은 hardMax(=maxChars×1.5) 이내면 통째로 둔다 — 문장 중간에서 끊지 않기 위해
  const hardMax = Math.round(maxChars * 1.5);
  let out = complete[0] && complete[0].length <= hardMax ? complete[0] : "";
  for (const s of complete.slice(out ? 1 : 0)) {
    if (!out) break;
    const next = `${out} ${s}`;
    if (next.length > maxChars) break;
    out = next;
  }
  if (out) return { text: out, truncated: out.length < text.length };
  const head = (complete[0] ?? text).slice(0, maxChars);
  const cut = head.lastIndexOf(" ") > maxChars * 0.6 ? head.slice(0, head.lastIndexOf(" ")) : head;
  return { text: `${cut.replace(/[,.;:\s]+$/, "")}…`, truncated: true };
}

/* ── 출처 분류 ─────────────────────────────────────────── */

export type SourceKind = "official" | "community" | "korean" | "media";

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  official: "공식 발표",
  community: "커뮤니티",
  korean: "국내 테크블로그",
  media: "블로그·언론",
};

const KNOWN_SOURCES: Record<string, { name: string; kind: SourceKind }> = {
  "openai.com": { name: "OpenAI", kind: "official" },
  "cdn.openai.com": { name: "OpenAI", kind: "official" },
  "anthropic.com": { name: "Anthropic", kind: "official" },
  "claude.com": { name: "Claude", kind: "official" },
  "platform.claude.com": { name: "Claude Docs", kind: "official" },
  "blog.google": { name: "Google", kind: "official" },
  "github.blog": { name: "GitHub Blog", kind: "official" },
  "huggingface.co": { name: "Hugging Face", kind: "official" },
  "stability.ai": { name: "Stability AI", kind: "official" },
  "nvidianews.nvidia.com": { name: "NVIDIA", kind: "official" },
  "kimi.com": { name: "Kimi", kind: "official" },
  "reactnative.dev": { name: "React Native", kind: "official" },
  "ziglang.org": { name: "Zig", kind: "official" },
  "elixir-lang.org": { name: "Elixir", kind: "official" },
  "opencv.org": { name: "OpenCV", kind: "official" },
  "brew.sh": { name: "Homebrew", kind: "official" },
  "openwrt.org": { name: "OpenWrt", kind: "official" },
  "av2.aomedia.org": { name: "AOMedia", kind: "official" },
  "simonwillison.net": { name: "Simon Willison", kind: "media" },
  "github.com": { name: "GitHub", kind: "media" },
  "news.ycombinator.com": { name: "Hacker News", kind: "community" },
  "x.com": { name: "X", kind: "community" },
  "twitter.com": { name: "X", kind: "community" },
  "d2.naver.com": { name: "NAVER D2", kind: "korean" },
  "tech.kakao.com": { name: "카카오 기술 블로그", kind: "korean" },
  "toss.tech": { name: "토스 기술 블로그", kind: "korean" },
  "techblog.woowahan.com": { name: "우아한형제들 기술 블로그", kind: "korean" },
  "techblog.lycorp.co.jp": { name: "LY Corporation Tech Blog", kind: "korean" },
  "techblog.gccompany.co.kr": { name: "여기어때 기술 블로그", kind: "korean" },
  "techblog.musinsa.com": { name: "무신사 테크 블로그", kind: "korean" },
  "clova.ai": { name: "NAVER CLOVA", kind: "korean" },
};

const REDDIT_MEDIA_HOSTS = new Set(["i.redd.it", "v.redd.it", "preview.redd.it"]);

export interface CardSource {
  name: string;
  kind: SourceKind;
  host: string;
  /** Reddit 이미지·영상 파일 직링크 (기사 원문이 아님) */
  isMediaLink: boolean;
}

export function getSource(link: string | null): CardSource | null {
  if (!link) return null;
  let url: URL;
  try {
    url = new URL(link);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^www\./, "");
  if (REDDIT_MEDIA_HOSTS.has(host)) {
    return { name: "Reddit", kind: "community", host, isMediaLink: true };
  }
  if (host === "reddit.com" || host.endsWith(".reddit.com")) {
    const sub = url.pathname.match(/^\/r\/([^/]+)/)?.[1];
    return { name: sub ? `Reddit r/${sub}` : "Reddit", kind: "community", host, isMediaLink: false };
  }
  const known = KNOWN_SOURCES[host];
  if (known) return { ...known, host, isMediaLink: false };
  return { name: host, kind: "media", host, isMediaLink: false };
}

/* ── 숫자 · 태그 ───────────────────────────────────────── */

/** 원문 표기 그대로의 "단위가 붙은" 숫자만 (버전 번호 같은 맨 숫자는 제외) */
export function extractKeyNumbers(text: string, limit = 3): string[] {
  const re =
    /(?:\$|US\$|₩)?\d[\d,]*(?:\.\d+)?\s?(?:%|GW|MW|TB|GB|ms|x\b|배|억|만|조|명|건|개|년|분|초|시간|billion|million|thousand|tokens?|users?|stars?|params?)/gi;
  const found = cleanText(text).match(re) ?? [];
  return [...new Set(found.map((s) => s.trim()))].slice(0, limit);
}

const TAG_STOPWORDS = new Set(["show", "hn", "introducing", "the", "how", "open", "part", "기술", "트렌드", "english", "a", "new"]);

export function isMeaningfulTag(tag: string): boolean {
  return !TAG_STOPWORDS.has(tag.trim().toLowerCase());
}

/** 갤러리 필터용 대표 태그 (minCount 이상 등장) */
export function getPopularTags(items: CardNewsItem[], minCount = 3, limit = 16): string[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const tag of new Set(item.tags)) {
      if (isMeaningfulTag(tag)) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, n]) => n >= minCount)
    // localeCompare 는 서버(Node ICU)·브라우저 결과가 달라 하이드레이션이 깨진다 → 코드 포인트 비교
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
    .slice(0, limit)
    .map(([t]) => t);
}

/** 카드 표시 모델 — 한 곳에서 계산해 갤러리·상세·슬라이드가 같은 값을 쓰게 한다 */
export function toCardView(item: CardNewsItem) {
  const title = cleanText(item.title);
  const summary = excerpt(item.summary || item.title);
  return {
    ...item,
    title,
    excerpt: summary.text,
    excerptTruncated: summary.truncated,
    source: getSource(item.external_link),
    numbers: extractKeyNumbers(`${item.title} ${item.summary}`),
    tags: [...new Set(item.tags.map((t) => cleanText(t)))].filter(Boolean),
    dateDot: item.created_at.slice(0, 10).replaceAll("-", "."),
    serial: `#${String(item.id).padStart(3, "0")}`,
  };
}

export type CardView = ReturnType<typeof toCardView>;

/**
 * 목록(갤러리) 카드 모델 — 서버(빌드 시점)에서 한 번 계산해 클라이언트로는 화면에 쓰는 필드만 보낸다.
 * 원문 요약·본문 전체와 클라이언트 쪽 재계산(문장 분리·엔티티 디코드)을 페이지 페이로드에서 뺀다.
 */
export function toGalleryCard(item: CardNewsItem) {
  const { id, title, excerpt, category, image_url, tags, dateDot, serial, source } = toCardView(item);
  return { id, title, excerpt, category, image_url, tags, dateDot, serial, source };
}

export type GalleryCard = ReturnType<typeof toGalleryCard>;

/* ── 목록 페이로드 고정 ────────────────────────────────── */

/** 목록 첫 화면: 벤토(최신 1 + 4) */
export const GALLERY_BENTO_COUNT = 5;
/** 아카이브 한 번에 보여줄 개수 */
export const GALLERY_PAGE_SIZE = 24;
/**
 * 목록 HTML/RSC 에는 첫 화면 카드만 싣는다 — 카드 수가 늘어도 /card-news 응답 크기가 그대로이게.
 * 전체 표시 모델은 빌드 때 만든 정적 JSON(아래 주소)으로 분리해 필터·검색·더 보기를 처음 쓸 때 한 번 불러온다.
 */
export const GALLERY_INITIAL_COUNT = GALLERY_BENTO_COUNT + GALLERY_PAGE_SIZE;
export const CARD_INDEX_URL = "/card-news/index.json";

/** 분류별 카드 수 (분류 버튼 숫자용 — 전체 목록을 불러오기 전에도 정확해야 한다) */
export function countByCategory(items: CardNewsItem[]): Record<string, number> {
  const counts: Record<string, number> = { all: items.length };
  for (const item of items) counts[item.category] = (counts[item.category] ?? 0) + 1;
  return counts;
}
