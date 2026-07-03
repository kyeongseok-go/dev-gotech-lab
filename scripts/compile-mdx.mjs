#!/usr/bin/env node
/**
 * velite 가 내보내는 body(function-body 문자열)를 표준 ESM 모듈로 프리컴파일한다.
 *
 * 배경: velite `s.mdx()` 는 `arguments[0]` 에서 jsx runtime 을 받고
 * `return {default: ...}` 하는 "함수 본문" 문자열을 만든다. 이를 렌더하려면
 * `new Function(code)` 가 필요한데, Cloudflare Workers(workerd) 는 런타임
 * 코드 생성을 차단하므로 상세 페이지가 500(EvalError)이 된다.
 *
 * 해법: 빌드 타임에 각 body 를 진짜 ESM 모듈(.mjs)로 변환해두고, 렌더 측은
 * 정적/동적 import 로 불러온다. 런타임 `new Function` 이 사라진다.
 *
 * 입력:  .velite/{blogs,projects,showcase}.json 의 각 엔트리 body
 * 출력:  src/generated/mdx/{collection}/{slug}.mjs (ESM 모듈)
 *        src/generated/mdx/registry.ts (slug → dynamic import 매핑)
 */
import { readFile, writeFile, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const VELITE_DIR = join(ROOT, ".velite");
const OUT_DIR = join(ROOT, "src", "generated", "mdx");

const COLLECTIONS = ["blogs", "projects", "showcase"];

// velite 는 minify 로 매번 변수명이 달라진다 (n/e/d, e/n/l ...).
// 좌변 구조분해 내용을 그대로 캡처해 import 로 변환한다.
const HEADER_RE = /^const\{([^}]*)\}=arguments\[0\];/;
const FOOTER_RE = /return\{default:(.+)\};\s*$/s;

/** `Fragment:n,jsx:e,jsxs:d` → `Fragment as n,jsx as e,jsxs as d` */
function destructureToImport(inner) {
  return inner
    .split(",")
    .map((pair) => {
      const [key, alias] = pair.split(":").map((s) => s.trim());
      return alias ? `${key} as ${alias}` : key;
    })
    .join(",");
}

/** function-body 문자열 → ESM 모듈 소스 */
function toEsmModule(body) {
  // 1) arguments[0] 구조분해 → react/jsx-runtime import 로 치환 (변수명 보존)
  const hm = body.match(HEADER_RE);
  if (!hm) {
    throw new Error("헤더 패턴 불일치 — velite 출력 형식이 바뀌었을 수 있음");
  }
  const importClause = destructureToImport(hm[1]);
  let src = body.replace(
    HEADER_RE,
    `import{${importClause}}from"react/jsx-runtime";`
  );
  // 2) return {default: FN}; → export default FN;
  const m = src.match(FOOTER_RE);
  if (!m) {
    throw new Error("푸터 패턴 불일치 — velite 출력 형식이 바뀌었을 수 있음");
  }
  src = src.replace(FOOTER_RE, `export default ${m[1]};`);
  return src;
}

async function main() {
  // 기존 산출물 정리 (stale 모듈 방지)
  if (existsSync(OUT_DIR)) {
    await rm(OUT_DIR, { recursive: true, force: true });
  }

  const registryLines = [];
  registryLines.push("// 이 파일은 scripts/compile-mdx.mjs 가 생성합니다. 직접 수정하지 마세요.");
  registryLines.push("import type { ComponentType } from \"react\";");
  registryLines.push("");
  registryLines.push("// MDX 컴포넌트 맵: HTML 태그/커스텀 컴포넌트마다 props 시그니처가 달라");
  registryLines.push("// 개별 타입을 강제하지 않는다 (velite 컴파일 컴포넌트는 임의 맵을 받음).");
  registryLines.push("type MDXComponents = Record<string, unknown>;");
  registryLines.push("type MDXModule = { default: ComponentType<{ components?: MDXComponents }> };");
  registryLines.push("");
  registryLines.push("const registry: Record<string, Record<string, () => Promise<MDXModule>>> = {");

  let total = 0;
  for (const col of COLLECTIONS) {
    const jsonPath = join(VELITE_DIR, `${col}.json`);
    if (!existsSync(jsonPath)) {
      console.warn(`[compile-mdx] skip: ${jsonPath} 없음`);
      continue;
    }
    const entries = JSON.parse(await readFile(jsonPath, "utf8"));
    await mkdir(join(OUT_DIR, col), { recursive: true });

    registryLines.push(`  ${col}: {`);
    for (const entry of entries) {
      if (!entry.slug || typeof entry.body !== "string") continue;
      const esm = toEsmModule(entry.body);
      // 파일명 안전화: slug 는 velite 가 이미 정규화하지만 방어적으로 처리
      const safe = entry.slug.replace(/[^a-zA-Z0-9가-힣_-]/g, "_");
      const rel = `./${col}/${safe}.mjs`;
      await writeFile(join(OUT_DIR, col, `${safe}.mjs`), esm, "utf8");
      registryLines.push(`    ${JSON.stringify(entry.slug)}: () => import(${JSON.stringify(rel)}),`);
      total++;
    }
    registryLines.push("  },");
  }
  registryLines.push("};");
  registryLines.push("");
  registryLines.push("export function getMdxModule(collection: string, slug: string) {");
  registryLines.push("  return registry[collection]?.[slug] ?? null;");
  registryLines.push("}");
  registryLines.push("");

  await writeFile(join(OUT_DIR, "registry.ts"), registryLines.join("\n"), "utf8");
  console.log(`[compile-mdx] ${total}개 MDX 모듈 생성 → src/generated/mdx/`);
}

main().catch((err) => {
  console.error("[compile-mdx] 실패:", err);
  process.exit(1);
});
