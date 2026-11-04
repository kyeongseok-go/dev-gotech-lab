import { TOOL_PATH_PATTERN } from "./categories";

/** 정합성 검사에 필요한 showcase 필드만 (Velite 타입에 묶이지 않게) */
export interface CatalogEntry {
  slug: string;
  status: string;
  draft: boolean;
  requiresKey: boolean;
  toolPath?: string;
  icon?: string;
  releasedAt?: string;
}

/** 허브 형태 단계(HANDOFF §6.4) — 도구 수가 경계를 넘으면 루틴이 전환 제안 Issue 를 올린다 */
export type HubStage = "T0" | "T1" | "T2" | "T3";

const HUB_STAGE_LIMITS: ReadonlyArray<readonly [number, HubStage]> = [
  [6, "T0"],
  [15, "T1"],
  [30, "T2"],
];

export function getHubStage(toolCount: number): HubStage {
  return HUB_STAGE_LIMITS.find(([max]) => toolCount <= max)?.[1] ?? "T3";
}

export function toolSlugFromPath(toolPath: string): string | null {
  return TOOL_PATH_PATTERN.test(toolPath) ? toolPath.slice("/tools/".length) : null;
}

/**
 * 카탈로그(showcase MDX)와 도구 라우트(src/app/tools/<slug>/)가 1:1 인지 검사한다.
 * 반환값이 빈 배열이어야 CI 를 통과한다(catalog.contract.test.ts).
 */
export function findCatalogProblems(
  entries: readonly CatalogEntry[],
  routeSlugs: readonly string[],
  isKnownIcon: (name: string) => boolean,
): string[] {
  const problems: string[] = [];
  const owners = new Map<string, string>();

  for (const item of entries.filter((e) => !e.draft)) {
    if (item.icon && !isKnownIcon(item.icon)) {
      problems.push(`${item.slug}: icon ${item.icon} 이 src/lib/tools/icons.ts 허용 목록에 없다`);
    }
    if (!item.toolPath) continue;

    const slug = toolSlugFromPath(item.toolPath);
    if (!slug) {
      problems.push(`${item.slug}: toolPath ${item.toolPath} 가 /tools/<kebab-slug> 형식이 아니다`);
      continue;
    }
    const owner = owners.get(slug);
    if (owner) {
      problems.push(`${item.slug}: toolPath ${item.toolPath} 가 ${owner} 와 겹친다`);
    } else {
      owners.set(slug, item.slug);
      if (!routeSlugs.includes(slug)) {
        problems.push(`${item.slug}: toolPath ${item.toolPath} 에 해당하는 src/app/tools/${slug}/page.tsx 가 없다`);
      }
    }
    if (item.status === "live" && !item.releasedAt) {
      problems.push(`${item.slug}: live 도구인데 releasedAt 이 없다`);
    }
  }

  for (const slug of routeSlugs.filter((s) => !owners.has(s))) {
    problems.push(`src/app/tools/${slug}/ 에 해당하는 showcase 항목(toolPath /tools/${slug})이 없다`);
  }
  return problems;
}
