import { type ComponentPropsWithoutRef, type ComponentType, type ReactNode } from "react";
import { notFound } from "next/navigation";
import { Callout } from "./callout";
import { getMdxModule } from "@/generated/mdx/registry";

/** children에서 텍스트만 추출하여 id용 slug 생성 */
function toId(children: ReactNode): string {
  const text = typeof children === "string"
    ? children
    : Array.isArray(children)
      ? children.map((c) => (typeof c === "string" ? c : "")).join("")
      : "";
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w가-힣-]/g, "");
}

// 기본 MDX 컴포넌트 (코드 블록, 헤딩, 링크)
const defaultComponents = {
  h2: ({ children, ...props }: ComponentPropsWithoutRef<"h2">) => (
    <h2
      id={toId(children)}
      className="mt-16 mb-5 scroll-mt-28 border-t border-on-surface pt-4 text-[1.625rem] md:text-[2rem] font-bold leading-[1.18] tracking-[-0.03em] text-on-surface"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 id={toId(children)} className="mt-10 mb-3 scroll-mt-28 text-xl font-semibold leading-snug tracking-[-0.015em] text-on-surface" {...props}>
      {children}
    </h3>
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-5 leading-[1.85] text-on-surface-variant" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="prose-link"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-5 ml-6 list-disc space-y-1.5 text-on-surface-variant marker:text-on-surface-muted" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-5 ml-6 list-decimal space-y-1.5 text-on-surface-variant marker:font-code marker:text-on-surface-muted" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-[1.8]" {...props} />
  ),
  // pre/code: rehype-pretty-code가 Shiki 인라인 스타일을 주입하므로 커스텀 제거.
  // 인라인 코드(코드 블록 바깥)만 스타일링.
  code: ({ children, ...props }: ComponentPropsWithoutRef<"code">) => {
    // data-language 속성이 있으면 코드 블록 내부 → Shiki가 처리하므로 그대로 통과
    if ("data-language" in props) {
      return <code {...props}>{children}</code>;
    }
    return (
      <code className="bg-surface-container px-1.5 py-0.5 font-code text-[0.875em] text-on-surface" {...props}>
        {children}
      </code>
    );
  },
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="quote-specimen my-7 !text-base text-on-surface-variant [&>p]:mb-0 [&>p+p]:mt-3"
      {...props}
    />
  ),
  hr: () => <hr className="my-12 border-hairline" />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-bold text-on-surface" {...props} />
  ),
  // 테이블: 기본 가독성 스타일
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-6 overflow-x-auto border border-hairline">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b border-on-surface bg-surface-container-low" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="px-3 py-2 text-left font-code text-xs font-bold uppercase tracking-[0.06em] text-on-surface" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-hairline px-3 py-2 text-on-surface-variant" {...props} />
  ),
  // 이미지(도판): MDX 는 이미지를 <p> 안에 넣으므로 <figure> 대신 span 블록으로 감싼다(잘못된 중첩 → 하이드레이션 오류 방지).
  // 캡션은 alt 와 같은 글이므로 스크린리더에는 alt 한 번만 읽히게 aria-hidden.
  img: ({ alt, ...props }: ComponentPropsWithoutRef<"img">) => (
    <span className="lab-fig my-8 block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="block border border-hairline" alt={alt ?? ""} loading="lazy" decoding="async" {...props} />
      {alt && (
        <span aria-hidden className="lab-fig-cap mt-3 block border-t border-hairline pt-2 text-sm text-on-surface-muted">
          {alt}
        </span>
      )}
    </span>
  ),
  // Callout: <Callout type="info|warning|tip">
  Callout,
};

interface MDXContentProps {
  /** velite 컬렉션 이름: blogs | projects | showcase */
  collection: string;
  /** 렌더할 문서 slug */
  slug: string;
  components?: Record<string, ComponentType>;
}

/**
 * 빌드 타임에 프리컴파일된 MDX 모듈(src/generated/mdx)을 로드해 렌더한다.
 *
 * 과거에는 velite body(function-body 문자열)를 `new Function` 으로 실행했으나,
 * Cloudflare Workers 는 런타임 코드 생성을 차단하여 상세 페이지가 500 이 됐다.
 * 이제 registry 의 dynamic import 로 표준 ESM 모듈을 불러오므로 eval 이 없다.
 */
export async function MDXContent({ collection, slug, components }: MDXContentProps) {
  const loader = getMdxModule(collection, slug);
  if (!loader) {
    notFound();
  }
  const mod = await loader();
  const Component = mod.default;

  // lab-prose: h2 앞 "§01" 자동 번호와 이미지 "FIG. 01" 번호를 CSS 카운터로 붙인다
  return (
    <div className="lab-prose">
      <Component components={{ ...defaultComponents, ...components }} />
    </div>
  );
}
