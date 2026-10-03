import { defineConfig, devices } from "@playwright/test";

/**
 * E2E 스위트 — 로컬 프로덕션 빌드(`pnpm build` 후 `next start`)를 대상으로 실행한다.
 * · E2E_BASE_URL 을 주면 이미 떠 있는 서버(예: opennextjs-cloudflare preview)를 그대로 쓴다.
 * · 재시도 0 — 불안정한 테스트는 통과로 치지 않는다.
 */
const PORT = Number(process.env.E2E_PORT ?? 3372);
const BASE_URL = process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: process.env.E2E_WORKERS ? Number(process.env.E2E_WORKERS) : "50%",
  // 한 테스트 안에서 여러 페이지를 차례로 여는 흐름 테스트가 있어 넉넉히 (재시도가 아니라 시간 예산)
  // 한 테스트에서 여러 페이지를 차례로 여는 흐름 테스트가 있어 넉넉히 둔다(재시도가 아니라 시간 예산)
  timeout: 180_000,
  expect: { timeout: 10_000 },
  reporter: [["list"], ["html", { open: "never", outputFolder: "playwright-report" }]],
  use: {
    baseURL: BASE_URL,
    locale: "ko-KR",
    timezoneId: "Asia/Seoul",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm exec next start -p ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
});
