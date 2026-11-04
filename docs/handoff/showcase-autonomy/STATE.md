# STATE — 쇼케이스 자율 루프 진행 상태 (로컬 세션 전용)

> **이 파일은 로컬 세션(사람 + Opus)만 읽고 쓴다. 클라우드 루틴은 이 파일을 읽지도 쓰지도 않는다.**
> 루틴 간 상태(제안·승인·구현중·릴리스·재시도·레이더 inbox)의 원본은 GitHub Issue 라벨·브랜치·PR·코멘트다(`HANDOFF.md §8.0`). 이 파일은 그 스냅샷 + 사람 결정 + 게이트 증빙 + 회고다.
> 세션 시작 시 먼저 읽고, 끝날 때 갱신하고 커밋한다(사람 동석 세션이므로 main 직접 커밋 허용).
> 체크는 검증 명령이 통과했을 때만, 숫자와 함께 켠다. 통과하지 않은 체크박스를 켜지 않는다.
> 설계·결정은 `HANDOFF.md`(읽기 전용), 채점은 `RUBRIC.md`.

## 현재 위치

- Phase: **0 — 기반** (2026-11-04 진행 중: 사람 부재 세션에서 할 수 있는 단계까지 PR로 준비)
- 활성 사이클: 없음
- GitHub 스냅샷(2026-11-04): 제안 Issue 0 / in-progress 0 / 도구 PR 0 / 콘텐츠 PR 0 / 레이더 PR 0 / blocked 0. 라벨 9개 생성 완료
- PAUSE: 없음(`docs/handoff/showcase-autonomy/PAUSE` 파일 없음)
- 작업 트리: 로컬 `main`(`072dedc`, origin보다 뒤처짐)에 `globals.css`·`page.tsx` 미커밋 수정 → **경석님 결정 대기**. 2026-11-04 작업은 전부 `../worktrees/showcase-p0*` 워크트리(origin/main 기준)에서 했다

## Phase 0 게이트 (RUBRIC D — 전부 필수)

- [ ] D0 사전 점검 — ① `gh auth status`: ✅ Kyeongeok, scope repo / ② 테스트 루틴: **보류**(비용 0원 원칙 — 추가 결제 꺼짐 확인 전 루틴 생성 안 함) / ③ `wrangler rollback [version-id]` 명령 존재 확인(4.71), `deployments list`는 비대화형 토큰 없음으로 실패 → 사람 로그인 필요 / ④ ✅ Anthropic(헤더 필수)·OpenAI·Gemini 직접 호출 가능 — `research/cors-providers.md`
- [ ] D1 테스트 인프라 — PR `phase0/3-test-infra`(머지 대기): vitest 5.0.5 + coverage-v8, `test:gate`(js-budget + tools E2E), ci.yml deploy diff 0줄 / `/showcase` 기준선 **129.9KB**(encodedBodySize, next start gzip)
- [ ] D2 스키마·허브 — PR `phase0/4-schema-hub`: 필드 9개 추가, 기존 6개 + 신규 1개 `pnpm content` 통과, 허브 카드에 아이콘·tagline·"바로 써 보기"
- [ ] D3 도구 규약 + 샘플 — slug: `blog-meta-linter`(백로그 1순위 `ko-ai-tell-highlighter`는 라이선스 미확인으로 사이클 1 후보로 보류) / 단위 45개·커버리지 lines 99.3 / RUBRIC C 채점: 로컬 보강 세션에서 / 샘플 기준선: E2E 결과 대기
- [ ] D4 루프 파일 — routines `_common`+R1~R4 ✅ / sources.yaml(13개 curl 200, openai 403→firecrawl) ✅ / backlog.md 후보 7·각 URL ≥2 ✅ / 라벨 9개 ✅ / canary.yml PR `phase0/5-canary`(머지 대기) / plugins.md ✅
- [ ] D5 루틴 4개 등록 + R1 수동 실행 — 루틴 URL 4개: / UTC 변환표: / 실행 시간:
- [ ] D6 레이더 소스 검증 — `sources.yaml` verified(성공/실패/대안 수):
- [ ] D7 문서 — PR 번호(plan.md Phase 2 · techspec · README · SITE_URL · project.md Next 16):
- [ ] D8 첫 제안 Issue — 번호: / A 점수: / B 점수:
- [ ] D9 이 파일의 "사람이 결정해야 할 것" 답 반영(선결정 5 전부, 후결정 3은 답 또는 예정일)
- [ ] D10 못 한 것·막힌 것 기록

## 사람이 결정해야 할 것 (HANDOFF §12)

**선결정 — Phase 0 시작 때**

| # | 질문 | 답 | 날짜 |
| --- | --- | --- | --- |
| 1 | 커스텀 도메인 / `SITE_URL` 기본값 | 계획 있음, 지금은 아님 → workers.dev 유지(이미 정정됨) | 2026-11-04 |
| 2 | Cloudflare Web Analytics 비컨 추가 | 넣는다 → 코드 준비(PR `phase0/7-security-headers`), 토큰 발급은 사람 | 2026-11-04 |
| 4 | 플러그인 설치 승인(mattpocock-skills · impeccable · marketingskills) | 승인 → 설치 완료(`plugins.md`) | 2026-11-04 |
| 7 | CSP 등 보안 헤더 도입(BYO-key 첫 릴리스 전까지) | 도입 → PR `phase0/7-security-headers` | 2026-11-04 |
| 8 | `src/features/` 디렉터리 신설 | 승인 | 2026-11-04 |

**후결정 — "미정 / 결정 예정일"도 유효**

| # | 질문 | 답 또는 예정일 | 날짜 |
| --- | --- | --- | --- |
| 3 | 클라우드 루틴 과금 확인(첫 2주 실측 후) | "돈이 안 들게, 필요하면 실측" → 비용 0원 원칙(HANDOFF §8.5). 추가 결제 꺼짐 확인 전 루틴 미등록 | 2026-11-04 |
| 5 | 수요일 커뮤니티 공유 채널 1곳(첫 릴리스 전) | 추천 요청 → 1순위 GeekNews Show GN, 2순위 디스콰이엇(규칙 확인 후) — 확정은 경석님 | 2026-11-04 |
| 6 | 사이클 1 시작일(RUBRIC D 전부 통과 후) | RUBRIC D 전부 통과 + 최종 승인 후 | 2026-11-04 |

## 확인 필요 항목 (HANDOFF에서 `[확인 필요]`로 표시한 것)

| 항목 | 확인 방법 | 결과 |
| --- | --- | --- |
| Anthropic/OpenAI 브라우저 직접 호출(CORS) 가능 여부 | 공급자 공식 문서(D0-④) | ✅ 가능(Anthropic 헤더 필수) — `research/cors-providers.md` |
| `wrangler rollback` 지원 여부·절차 | `wrangler deployments list`, Cloudflare Workers 문서(D0-③) | 명령 존재 ✅ / 실행은 사람 `! npx wrangler login` 후 |
| HN Algolia API 응답 형식 | R1 첫 실행(D6) | ✅ 2026-11-04 curl — `hits[].title·url·points·num_comments·created_at·objectID` |
| 유튜브 채널 메타 수집(firecrawl `youtube-com`) 동작 여부 | R1 첫 실행(D6) | |
| impeccable 설치 방법 | README(2단계) | ✅ `claude plugin install impeccable@claude-community` |
| Next `pnpm build` 출력 First Load JS의 단위(gz/비압축) | D1에서 측정·문서 대조 | ✅ Next 16은 열 자체가 없음 → Playwright 전송량으로 측정 |

## 실측 기록 (루틴)

| 날짜 | 루틴 | 예약(UTC) | 실제 시작(UTC) | 실행 시간 | no-op? | 비고 |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

주당 합계는 회고 때 HANDOFF §8.5 추정(4.5시간/주)과 비교.

## 사이클 로그 (한 사이클 = 한 블록, 최신이 위)

_(아직 없음)_

형식:
```
### 사이클 N — <토픽 slug> (YYYY-MM-DD ~ YYYY-MM-DD)
- 제안 Issue #, approved 시각, PR #, 머지 시각, deploy run, canary 결과, 배포 URL
- RUBRIC C 총점 / 필수 통과 여부 / N/A 목록
- 재시도 수 / blocked 여부 / 중복 PR 여부
- 잘된 것 1줄 / 막힌 것 1줄 / 다음에 바꿀 것 1줄
```

## 막힌 것 (사람이 풀어야 다음 단계로 간다)

1. **루틴 비용 확인**(D0-②·D5·D6·D8의 선행): claude.ai 설정에서 추가 사용량 결제가 꺼져 있는지 확인 → 확인되면 run_once 테스트 루틴부터.
2. **wrangler 로그인**(D0-③): `! npx wrangler login` → `npx wrangler deployments list`로 버전 ID가 보이는지만 확인(롤백 실행은 하지 않음).
3. **Web Analytics 토큰**(§12-2): Cloudflare 대시보드에서 사이트 추가 → 토큰을 `NEXT_PUBLIC_CF_WEB_ANALYTICS_TOKEN` 또는 `src/lib/constants.ts`에.
4. **로컬 main 미커밋 변경**(`globals.css`·`page.tsx`) 처리 + 로컬 main을 origin으로 갱신.
5. **PR 리뷰·머지**: phase0/1 → 3 → 4 → 5 → 7 순서.

## 한 줄 로그 (최신이 위, `YYYY-MM-DD HH:MM KST · 주체 · 한 줄`)

- 2026-11-04 KST · Opus 세션(사람 부재) · §12 답변 반영, HANDOFF v1.2, 플러그인 3종 설치, 라벨 9개, Phase 0 PR 준비(1 문서·3 테스트·4 스키마+샘플·5 캐너리·7 보안 헤더). 루틴 등록은 비용 확인 대기.
- 2026-11-02 11:40 KST · Fable 세션 · 교차검증(Claude 리뷰어 + Codex gpt-5.6-sol) 반영해 HANDOFF·RUBRIC·STATE·KICKOFF v1.1. Codex `astra`는 ChatGPT 계정 미지원으로 `gpt-5.6-sol` 사용. Phase 0 시작 전.
- 2026-10-31 12:30 KST · Fable 세션 · HANDOFF·RUBRIC·STATE·OPUS-KICKOFF 초안 작성.
