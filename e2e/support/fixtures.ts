/**
 * 공통 픽스처 — 모든 테스트에서 콘솔 에러·페이지 예외·실패한 요청을 모은다.
 * 테스트 끝에 `diag.assertClean()` 으로 0건(사전 등록 예외 제외)인지 확인한다.
 */
import { test as base, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

export type Theme = "dark" | "light";

/**
 * 사전 등록 예외 (GATE.md G2).
 * building-with-claude-day0-day1 본문(MDX 콘텐츠)이 참조하는 외부 로고·OG 이미지 중 일부가 원 사이트에서 404.
 * 콘텐츠 본문 수정 금지 범위라 보고만 하고 예외로 둔다 — 같은 출처의 내부 리소스 실패는 예외가 아니다.
 */
const KNOWN_EXTERNAL_FAILURES: Record<string, readonly string[]> = {
  "/blog/building-with-claude-day0-day1": [
    "https://ui.shadcn.com/og.jpg",
    "https://tailwindcss.com/img/social-square.jpg",
    "https://workers.cloudflare.com/resources/logo/logo.svg",
    // 위 주소가 301 로 보내는 곳 — 역시 404
    "https://www.cloudflare.com/resources/logo/logo.svg",
    "https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png",
  ],
};

/** 사전 등록된 외부 리소스 실패인지 */
export function isKnownExternalFailure(pagePath: string, url: string): boolean {
  return (KNOWN_EXTERNAL_FAILURES[pagePath] ?? []).includes(url);
}

interface Issue {
  kind: "console" | "pageerror" | "response" | "requestfailed";
  text: string;
  url?: string;
  pagePath: string;
}

export class Diagnostics {
  readonly issues: Issue[] = [];
  /** 404 페이지처럼 문서 자체의 4xx 가 의도된 경우 */
  allowedStatusUrls = new Set<string>();

  constructor(private readonly page: Page) {
    page.on("console", (msg) => {
      if (msg.type() !== "error") return;
      this.issues.push({ kind: "console", text: msg.text(), url: msg.location().url, pagePath: this.path() });
    });
    page.on("pageerror", (err) => {
      this.issues.push({ kind: "pageerror", text: `${err.name}: ${err.message}`, pagePath: this.path() });
    });
    page.on("response", (res) => {
      if (res.status() >= 400) {
        this.issues.push({ kind: "response", text: `HTTP ${res.status()}`, url: res.url(), pagePath: this.path() });
      }
    });
    page.on("requestfailed", (req) => {
      const failure = req.failure()?.errorText ?? "";
      // 다음 페이지로 넘어가며 취소된 프리페치·이미지는 실패가 아니다
      if (failure.includes("ERR_ABORTED")) return;
      this.issues.push({ kind: "requestfailed", text: failure, url: req.url(), pagePath: this.path() });
    });
  }

  private path(): string {
    try {
      return new URL(this.page.url()).pathname;
    } catch {
      return "";
    }
  }

  /**
   * 외부 출처(CDN 등)의 "응답 자체가 없는" 네트워크 오류(시간 초과·연결 끊김)는 앱 결함이 아니라 망 사정이라
   * 실패 대신 경고로 기록한다. 같은 출처의 실패, 그리고 어느 출처든 HTTP 4xx/5xx 응답은 그대로 실패다.
   */
  private isExternalNetworkBlip(issue: Issue): boolean {
    if (!issue.url) return false;
    let sameOrigin = false;
    try {
      sameOrigin = new URL(issue.url).origin === new URL(this.page.url()).origin;
    } catch {
      return false;
    }
    if (sameOrigin) return false;
    const netError = /net::ERR_(TIMED_OUT|CONNECTION_(RESET|CLOSED|REFUSED|TIMED_OUT)|NETWORK_CHANGED|NAME_NOT_RESOLVED|INTERNET_DISCONNECTED|HTTP2_PROTOCOL_ERROR|QUIC_PROTOCOL_ERROR)/;
    if (issue.kind === "requestfailed") return netError.test(issue.text);
    if (issue.kind === "console") return /Failed to load resource: net::ERR_/.test(issue.text) && netError.test(issue.text);
    return false;
  }

  /** 경고로만 남긴 외부 네트워크 오류 */
  externalWarnings(): Issue[] {
    return this.issues.filter((i) => this.isExternalNetworkBlip(i));
  }

  private isAllowed(issue: Issue): boolean {
    if (this.isExternalNetworkBlip(issue)) return true;
    const known = KNOWN_EXTERNAL_FAILURES[issue.pagePath] ?? [];
    if (issue.url && known.includes(issue.url)) return true;
    if (issue.url && this.allowedStatusUrls.has(issue.url)) return true;
    // 콘솔의 "Failed to load resource" 는 response 이벤트와 같은 사건 — URL 이 허용 목록이면 함께 허용
    if (issue.kind === "console" && /Failed to load resource/.test(issue.text)) {
      if (issue.url && (known.includes(issue.url) || this.allowedStatusUrls.has(issue.url))) return true;
    }
    return false;
  }

  unexpected(): Issue[] {
    return this.issues.filter((i) => !this.isAllowed(i));
  }

  assertClean(context = ""): void {
    const warnings = this.externalWarnings();
    if (warnings.length > 0) {
      base.info().annotations.push({
        type: "외부 네트워크 경고",
        description: warnings.map((w) => `${w.text} ${w.url ?? ""}`).join("\n"),
      });
    }
    const bad = this.unexpected();
    expect(bad, `${context} 콘솔 에러·실패 요청 0건이어야 함:\n${bad.map((b) => `[${b.kind}] ${b.pagePath} ${b.text} ${b.url ?? ""}`).join("\n")}`).toEqual([]);
  }
}

export const test = base.extend<{ diag: Diagnostics }>({
  diag: async ({ page }, provide) => {
    const diag = new Diagnostics(page);
    await provide(diag);
  },
});

export { expect };

/* ── 공통 동작 ─────────────────────────────────────────── */

/** 첫 방문 전에 테마를 정해 둔다 (사이트는 localStorage "theme" 를 읽는다) */
export async function presetTheme(page: Page, theme: Theme): Promise<void> {
  await page.addInitScript((t) => {
    try {
      window.localStorage.setItem("theme", t);
    } catch {
      /* 저장소 차단 환경 무시 */
    }
  }, theme);
}

/** 유한 길이 CSS 애니메이션(진입 모션 등)이 끝날 때까지 — 무한 마키는 제외 */
export async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(async () => {
    // 문서 시간축에서 실제로 재생 중인 유한 애니메이션만 (스크롤 타임라인·일시정지 애니메이션은 끝나지 않는다)
    const finite = document.getAnimations().filter((a) => {
      const timing = a.effect?.getComputedTiming();
      return a.playState === "running" && a.timeline === document.timeline && timing && Number.isFinite(timing.endTime as number);
    });
    await Promise.race([
      Promise.all(finite.map((a) => a.finished.catch(() => undefined))),
      new Promise((r) => setTimeout(r, 4000)),
    ]);
  });
}

/** 페이지를 끝까지 천천히 내려 지연 로딩 이미지를 모두 불러온 뒤 맨 위로 */
export async function scrollThrough(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const step = Math.max(200, Math.floor(window.innerHeight * 0.8));
    // rAF 는 CPU 경합·백그라운드 스로틀 때 멈출 수 있어 타이머로만 기다린다(무한 대기 방지용 상한 400걸음)
    for (let y = 0, n = 0; y < document.documentElement.scrollHeight && n < 400; y += step, n++) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 40));
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
    await new Promise((r) => setTimeout(r, 50));
  });
  await page.waitForLoadState("networkidle");
  await page.evaluate(() => window.scrollTo(0, 0));
}

/** 로드 실패한 <img> (complete 인데 naturalWidth 0) */
export async function brokenImages(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const imgs = Array.from(document.images);
    await Promise.all(
      imgs.map((img) =>
        img.complete
          ? undefined
          : new Promise<void>((resolve) => {
              img.addEventListener("load", () => resolve(), { once: true });
              img.addEventListener("error", () => resolve(), { once: true });
              setTimeout(resolve, 5000);
            }),
      ),
    );
    return imgs.filter((img) => img.complete && img.naturalWidth === 0).map((img) => img.currentSrc || img.src);
  });
}

/** 가로 넘침 — 문서 폭이 뷰포트보다 넓으면 원인 요소를 함께 돌려준다 */
export async function horizontalOverflow(page: Page): Promise<{ overflow: number; culprits: string[] }> {
  return page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - doc.clientWidth;
    const culprits: string[] = [];
    if (overflow > 0) {
      const vw = doc.clientWidth;
      for (const el of Array.from(document.body.querySelectorAll<HTMLElement>("*"))) {
        const r = el.getBoundingClientRect();
        if (r.right > vw + 1 && r.width > 0) {
          // 가로 스크롤 컨테이너 안의 자식은 넘쳐도 정상
          let p = el.parentElement;
          let clipped = false;
          while (p && p !== document.body) {
            const ox = getComputedStyle(p).overflowX;
            if (ox === "auto" || ox === "scroll" || ox === "hidden" || ox === "clip") {
              clipped = true;
              break;
            }
            p = p.parentElement;
          }
          if (!clipped) culprits.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} right=${Math.round(r.right)}`);
        }
        if (culprits.length >= 5) break;
      }
    }
    return { overflow, culprits };
  });
}

/** axe 위반 중 serious·critical 만 */
export async function seriousA11yViolations(page: Page): Promise<string[]> {
  const result = await new AxeBuilder({ page }).analyze();
  return result.violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}) ×${v.nodes.length}: ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

/** 고정 헤더 높이 (스크롤 이동 후 제목이 헤더에 가리지 않는지 볼 때) */
export async function headerBottom(page: Page): Promise<number> {
  return page.locator("header.glass-nav").evaluate((el) => el.getBoundingClientRect().bottom);
}

/**
 * 하이드레이션 완료 대기 — 테마 토글 버튼은 마운트 뒤에만 렌더된다(그 전엔 빈 자리표시자).
 * 정적 HTML 위에서 JS 가 붙기 전에 클릭·입력하면 이벤트가 유실될 수 있으므로 상호작용 전에 기다린다.
 */
export async function waitForHydration(page: Page): Promise<void> {
  await expect(page.getByRole("button", { name: /모드로 전환$/ })).toBeVisible({ timeout: 30_000 });
}

/** 이동 후 하이드레이션까지 기다린다 */
export async function gotoReady(page: Page, url: string): Promise<void> {
  await page.goto(url);
  await waitForHydration(page);
}

/** 새로고침 후 하이드레이션까지 기다린다 */
export async function reloadReady(page: Page): Promise<void> {
  await page.reload();
  await waitForHydration(page);
}
