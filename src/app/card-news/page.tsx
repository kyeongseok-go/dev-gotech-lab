import type { Metadata } from "next";
import CardNewsGallery, { type CardNewsItem } from "@/components/card-news/card-news-gallery";
import { PageHeading } from "@/components/section/page-heading";

export const metadata: Metadata = {
  title: "카드뉴스 | GoTechy",
  description: "Reddit r/artificial, r/technology에서 엄선한 AI & 기술 트렌드를 카드뉴스로 빠르게 만나보세요.",
  alternates: { canonical: "/card-news" },
};

/* Reddit AI/Tech 트렌드 기반 샘플 데이터 */
const CARD_NEWS_DATA: CardNewsItem[] = [
  {
    id: 1,
    slug: "claude-sonnet-4-agent-memory",
    title: "Claude Sonnet 4 — 에이전트 메모리 시스템 공개, 장기 대화 기억 가능",
    summary:
      "Anthropic이 Claude Sonnet 4에서 에이전트용 지속 메모리 시스템을 공개했다. 대화 세션 간 맥락을 유지하며, 복잡한 멀티스텝 작업에서 성능이 크게 향상됐다. 개발자들 사이에서 '게임체인저'라는 평가가 쏟아지는 중.",
    content: "",
    category: "ai",
    image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    external_link: "https://www.reddit.com/r/artificial/",
    tags: ["Claude", "Anthropic", "에이전트"],
    created_at: "2026-04-09",
    span: "",
  },
  {
    id: 2,
    slug: "openai-gpt5-leaked-benchmarks",
    title: "GPT-5 벤치마크 유출 — 수학·코딩에서 인간 전문가 수준 돌파",
    summary:
      "GPT-5로 추정되는 모델의 내부 벤치마크가 유출됐다. MATH, HumanEval, MMLU 등 주요 지표에서 인간 전문가를 넘어섰다는 수치가 포함돼 있다. OpenAI는 공식 확인을 거부했지만 커뮤니티 반응은 폭발적.",
    content: "",
    category: "ai",
    image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80",
    external_link: "https://www.reddit.com/r/artificial/",
    tags: ["GPT-5", "OpenAI", "벤치마크"],
    created_at: "2026-04-09",
    span: "",
  },
  {
    id: 3,
    slug: "google-veo3-video-generation",
    title: "Google Veo 3, 120초 4K 영상 실시간 생성 — Sora를 압도?",
    summary:
      "Google DeepMind의 Veo 3가 최대 120초 길이의 4K 영상을 생성할 수 있다는 데모가 공개됐다. 물리 법칙 준수, 일관된 캐릭터, 영화급 카메라 워크를 지원한다. Reddit에서는 '소라(Sora)의 시대가 끝났다'는 반응이 주류.",
    content: "",
    category: "ai",
    image_url: "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=800&q=80",
    external_link: "https://www.reddit.com/r/artificial/",
    tags: ["Veo3", "Google", "영상생성"],
    created_at: "2026-04-08",
    span: "",
  },
  {
    id: 4,
    slug: "eu-ai-act-enforcement-wave",
    title: "EU AI Act 1차 집행 시작 — 고위험 AI 시스템 48개 기업 조사",
    summary:
      "EU 집행위원회가 AI Act에 근거해 '고위험 AI 시스템'을 운영하는 48개 기업에 대한 1차 조사에 착수했다. 채용 AI, 신용 평가 AI, 의료 진단 AI가 주요 타깃이다. 컴플라이언스 업계에 비상이 걸렸다.",
    content: "",
    category: "news",
    image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80",
    external_link: "https://www.reddit.com/r/technology/",
    tags: ["EU", "AI규제", "컴플라이언스"],
    created_at: "2026-04-08",
    span: "",
  },
  {
    id: 5,
    slug: "next-js-16-partial-prerendering",
    title: "Next.js 16 RC — Partial Prerendering 정식 출시, 성능 3배 향상",
    summary:
      "Vercel이 Next.js 16 RC를 공개하며 Partial Prerendering(PPR)이 정식 기능으로 포함됐다. 정적 셸과 동적 콘텐츠를 분리해 LCP를 평균 3배 개선했다는 실측 데이터가 공개됐다. App Router 사용자라면 지금 바로 마이그레이션 가이드를 확인해볼 것.",
    content: "",
    category: "dev",
    image_url: "https://images.unsplash.com/photo-1555066931-4365d14431b9?w=800&q=80",
    external_link: "https://www.reddit.com/r/reactjs/",
    tags: ["Next.js", "PPR", "성능"],
    created_at: "2026-04-07",
    span: "",
  },
  {
    id: 6,
    slug: "nvidia-blackwell-ultra-announcement",
    title: "NVIDIA Blackwell Ultra — H200을 2배 앞서는 AI 칩 발표",
    summary:
      "NVIDIA가 Blackwell Ultra 아키텍처를 공식 발표했다. HBM4 메모리를 탑재해 AI 추론 성능이 H200 대비 2배, H100 대비 4배 향상됐다. 공급 부족이 다시 심화될 것이라는 전망이 나오고 있다.",
    content: "",
    category: "news",
    image_url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    external_link: "https://www.reddit.com/r/artificial/",
    tags: ["NVIDIA", "GPU", "반도체"],
    created_at: "2026-04-07",
    span: "",
  },
  {
    id: 7,
    slug: "ai-agent-security-vulnerabilities",
    title: "AI 에이전트 보안 취약점 — Prompt Injection으로 은행 계좌 접근 시연",
    summary:
      "보안 연구팀이 주요 AI 에이전트 프레임워크에서 Prompt Injection을 통해 사용자의 금융 계좌에 접근하는 시나리오를 시연했다. 에이전트에게 민감 시스템 권한을 부여할 때 샌드박싱이 필수라는 경고가 제기됐다.",
    content: "",
    category: "trend",
    image_url: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    external_link: "https://www.reddit.com/r/artificial/",
    tags: ["보안", "에이전트", "PromptInjection"],
    created_at: "2026-04-06",
    span: "",
  },
  {
    id: 8,
    slug: "open-source-llm-coding-benchmark",
    title: "오픈소스 LLM, 코딩 벤치마크에서 GPT-4o 추월 — Qwen3 72B",
    summary:
      "Alibaba의 Qwen3 72B 모델이 HumanEval, SWE-bench 등 코딩 벤치마크에서 GPT-4o를 처음으로 넘어섰다. 오픈소스 모델이 프론티어 상용 모델을 추월한 것은 이번이 처음이다. 로컬 실행 가능하다는 점에서 개발자 커뮤니티의 관심이 뜨겁다.",
    content: "",
    category: "ai",
    image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80",
    external_link: "https://www.reddit.com/r/LocalLLaMA/",
    tags: ["Qwen3", "오픈소스", "코딩"],
    created_at: "2026-04-06",
    span: "",
  },
];

export default function CardNewsPage() {
  return (
    <main className="pt-28 pb-24 px-6 md:px-10 max-w-6xl mx-auto">
      <PageHeading
        eyebrow="Card News · Reddit AI · Tech"
        count={CARD_NEWS_DATA.length}
        size="xl"
        title={
          <>
            What&apos;s<br />
            <span className="display-accent display-accent-coral">hot</span> today.
          </>
        }
        lead={
          <>
            Reddit <span className="text-em">r/artificial</span>,
            <span className="text-em"> r/technology</span>에서 엄선한 AI &amp; 기술 트렌드.
            클릭해서 요약과 원문 링크를 확인하세요.
          </>
        }
      />

      <CardNewsGallery items={CARD_NEWS_DATA} />
    </main>
  );
}
