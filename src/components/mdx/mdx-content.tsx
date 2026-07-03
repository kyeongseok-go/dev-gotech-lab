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
    <h2 id={toId(children)} className="mt-8 mb-3 text-xl font-semibold" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: ComponentPropsWithoutRef<"h3">) => (
    <h3 id={toId(children)} className="mt-6 mb-2 text-lg font-semibold" {...props}>
      {children}
    </h3>
  ),
  p: (props: ComponentPropsWithoutRef<"p">) => (
    <p className="mb-4 leading-7" {...props} />
  ),
  a: (props: ComponentPropsWithoutRef<"a">) => (
    <a
      className="text-primary underline underline-offset-4 hover:text-primary/80"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noopener noreferrer" : undefined}
      {...props}
    />
  ),
  ul: (props: ComponentPropsWithoutRef<"ul">) => (
    <ul className="mb-4 ml-6 list-disc space-y-1" {...props} />
  ),
  ol: (props: ComponentPropsWithoutRef<"ol">) => (
    <ol className="mb-4 ml-6 list-decimal space-y-1" {...props} />
  ),
  li: (props: ComponentPropsWithoutRef<"li">) => (
    <li className="leading-7" {...props} />
  ),
  // pre/code: rehype-pretty-code가 Shiki 인라인 스타일을 주입하므로 커스텀 제거.
  // 인라인 코드(코드 블록 바깥)만 스타일링.
  code: ({ children, ...props }: ComponentPropsWithoutRef<"code">) => {
    // data-language 속성이 있으면 코드 블록 내부 → Shiki가 처리하므로 그대로 통과
    if ("data-language" in props) {
      return <code {...props}>{children}</code>;
    }
    return (
      <code className="rounded bg-muted px-1 py-0.5 text-sm font-mono" {...props}>
        {children}
      </code>
    );
  },
  blockquote: (props: ComponentPropsWithoutRef<"blockquote">) => (
    <blockquote
      className="mb-4 border-l-4 border-border pl-4 text-muted-foreground italic"
      {...props}
    />
  ),
  hr: () => <hr className="my-8 border-border" />,
  strong: (props: ComponentPropsWithoutRef<"strong">) => (
    <strong className="font-semibold" {...props} />
  ),
  // 테이블: 기본 가독성 스타일
  table: (props: ComponentPropsWithoutRef<"table">) => (
    <div className="my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  ),
  thead: (props: ComponentPropsWithoutRef<"thead">) => (
    <thead className="border-b border-border bg-muted/50" {...props} />
  ),
  th: (props: ComponentPropsWithoutRef<"th">) => (
    <th className="px-3 py-2 text-left font-semibold" {...props} />
  ),
  td: (props: ComponentPropsWithoutRef<"td">) => (
    <td className="border-b border-border px-3 py-2" {...props} />
  ),
  // 이미지: figure + figcaption 래퍼
  img: ({ alt, ...props }: ComponentPropsWithoutRef<"img">) => (
    <figure className="my-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="rounded-lg" alt={alt ?? ""} {...props} />
      {alt && (
        <figcaption className="mt-2 text-center text-sm text-muted-foreground">
          {alt}
        </figcaption>
      )}
    </figure>
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

  return <Component components={{ ...defaultComponents, ...components }} />;
}
