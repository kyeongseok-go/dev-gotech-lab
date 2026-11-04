import path from "node:path";
import { defineConfig } from "vitest/config";

/**
 * 단위 테스트(vitest) — 순수 로직·훅·도구 컴포넌트. 화면 흐름은 Playwright(e2e/)가 맡는다.
 * 커버리지 분모는 도구 로직만(HANDOFF §6.5): 화면(tsx)·공용 셸·테스트 파일은 빼고 임계를 건다.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@/.velite": path.resolve(import.meta.dirname, ".velite"),
      "@": path.resolve(import.meta.dirname, "src"),
    },
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["src/features/tools/**/*.ts", "src/lib/tools/**/*.ts"],
      exclude: ["**/*.test.ts", "**/_shared/**", "**/*.tsx"],
      reporter: ["text-summary", "json-summary"],
      thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
    },
  },
});
