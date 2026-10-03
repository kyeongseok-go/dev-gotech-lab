/** 구조화 데이터(JSON-LD) 출력. `<` 를 이스케이프해 스크립트 주입을 막는다. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
