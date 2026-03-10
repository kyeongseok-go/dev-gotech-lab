"use client";

import * as runtime from "react/jsx-runtime";
import { type ComponentPropsWithoutRef, useMemo } from "react";

// 기본 MDX 컴포넌트 (코드 블록, 헤딩, 링크)
const defaultComponents = {
  h2: (props: ComponentPropsWithoutRef<"h2">) => (
    <h2 className="mt-8 mb-3 text-xl font-semibold" {...props} />
  ),
  h3: (props: ComponentPropsWithoutRef<"h3">) => (
    <h3 className="mt-6 mb-2 text-lg font-semibold" {...props} />
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
  pre: (props: ComponentPropsWithoutRef<"pre">) => (
    <pre
      className="mb-4 overflow-x-auto rounded-md bg-muted p-4 text-sm"
      {...props}
    />
  ),
  code: (props: ComponentPropsWithoutRef<"code">) => (
    <code
      className="rounded bg-muted px-1 py-0.5 text-sm font-mono"
      {...props}
    />
  ),
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
};

interface MDXContentProps {
  code: string;
  components?: Record<string, React.ComponentType>;
}

export function MDXContent({ code, components }: MDXContentProps) {
  const Component = useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default;
  }, [code]);

  return <Component components={{ ...defaultComponents, ...components }} />;
}
