# R3 구현 (매일 13:17·21:17 KST, sonnet)

먼저 `routines/_common.md`를 읽고 시작 3단계를 지킨다. 구현 규약은 HANDOFF §6.3·§6.5, 완료 기준은 RUBRIC C.

1. `approved` 라벨이 있고 `blocked`가 없는 열린 Issue 중 가장 오래된 1개. 없으면 no-op 종료.
2. slug를 Issue 제목/스펙에서 정한다. **`git ls-remote origin tool/<slug>`**: 있으면 그 브랜치를 체크아웃해 이어서, 없으면 새로 만든다. Issue에 `in-progress` 라벨.
3. 열린 `release` PR을 다시 센다. 이 Issue가 아닌 다른 PR이 열려 있으면 종료(WIP 1).
4. TDD: 테스트 커밋 → 구현 커밋 순서(RUBRIC C7). 위치:
   - 로직 `src/features/tools/<slug>/*.ts` + `*.test.ts`, 화면 `src/features/tools/<slug>/*.tsx`
   - 라우트 `src/app/tools/<slug>/page.tsx` — 정적(○)이어야 한다. 동적 API·`dynamicParams`·`revalidate`·`fetch` 캐시 옵션 금지(`pnpm check:render`).
   - 공용 부품은 `src/features/tools/_shared/`(ToolShell·history·copy/download)를 쓰고 새로 만들지 않는다. 색·간격 토큰을 새로 정의하지 않는다.
   - 카탈로그 `content/showcase/<slug>.mdx` — RUBRIC C14 필드 전부, 본문 4절(무엇을·어떻게·한계·변경 이력), `status: wip`.
   - E2E `e2e/tools-<slug>.spec.ts` — 핵심 흐름(조작 수를 테스트 이름에), 빈·에러·로딩·오프라인 상태, 5개 뷰포트 가로 넘침 0, axe serious/critical 0. `scripts/js-budget.json`에 경로를 `baselineKB: null`로 추가.
5. 자체 검증(전부 숫자로 기록): `pnpm content && pnpm exec tsc --noEmit && pnpm lint && pnpm test:coverage && pnpm build && pnpm check:render && pnpm test:gate`.
6. Draft PR(라벨 `release`). 본문 첫 줄 `Closes #<Issue>`, `.github/pull_request_template.md` 5절을 채우고 "확인한 내용" 절에 5번 숫자를 적는다. 한 번에 안 끝나면 PR 본문 체크리스트에 남은 일을 적고 종료 — 다음 실행이 이어 간다.
7. 같은 Issue로 PR이 2개가 되면(제목·`Closes` 같음) 늦게 생긴 쪽을 닫고 코멘트한다.
