# RUBRIC — 쇼케이스 자율 루프 채점 기준 (v1.1, 2026-11-02)

> 모든 점수는 0·1·2 (0 미충족 · 1 부분 · 2 충족). "필수" 항목은 2점이 아니면 통과 불가. 해당 없음은 **N/A**로 적고 분모에서 뺀다(예: 외부 API 없는 도구의 BYO-key 항목).
> 점수에는 항상 **숫자 근거**(명령 출력, URL, 파일 경로)를 붙인다. 근거 없는 2점은 0점으로 간주한다. 측정 방법은 `HANDOFF.md §6.5`.
> 채점자: 루틴(자체 채점) → 로컬 세션의 독립 서브에이전트(재채점) → 사람(게이트).

---

## A. 토픽 제안 루브릭 (R2가 후보 3개에 적용, 1순위만 Issue로)

| # | 기준 | 2점의 뜻 | 필수 |
| --- | --- | --- | --- |
| A1 | 수요 근거 | 서로 다른 출처 2개 이상(레이더 Issue 코멘트, `docs/radar/backlog.md`의 근거, 커뮤니티 질문, 검색어, 유사 도구 페이지)에 URL이 붙어 있다 | ✔ |
| A2 | 브라우저 전용 가능 | 서버·DB·비밀 키 없이 동작한다. LLM이 필요하면 **브라우저 직접 호출이 공식 문서로 확인된 공급자**(HANDOFF §6.3, D0 결과)의 BYO-key로 해결된다. 프록시가 필요하면 0점 | ✔ |
| A3 | 크기 | 하나의 사이클(3일, PR 1개) 안에 live 가능. 사용자 스토리 ≤ 8개 | ✔ |
| A4 | 차별성 | 같은 기능의 한국어 무료 도구를 2개 찾아 비교했고, 우리가 다르게 하는 점이 한 문장으로 있다 | |
| A5 | 재료 재사용 | 경석님 기존 스킬·코드·글을 재사용하는 비율이 보인다(어떤 파일·스킬인지 명시) | |
| A6 | 콘텐츠 가치 | 릴리스 글 제목 초안 1개와 "만들면서 배울 것" 1개가 있다 | |
| A7 | 법적 리스크 | 참고 사이트가 §7 기준 5개를 통과했고, 복제 요소가 없다 | ✔ |
| A8 | 카테고리 적합 | §6.2의 5개 카테고리 중 하나에 들고, 아이콘·tagline(≤ 40자) 초안이 있다 | |

통과: 필수 4개 모두 2점 + 총점 ≥ 12/16. 미달이면 Issue를 만들지 않고 다음 후보로. 후보 3개 전부 미달이면 R2는 `radar` Issue에 "후보 없음 — 이유" 코멘트만 남기고 종료.

## B. 스펙 루브릭 (제안 Issue 본문, mattpocock `to-spec` 형식)

| # | 기준 | 2점의 뜻 |
| --- | --- | --- |
| B1 | 문제 진술 | 사용자 관점 한 단락, "누가·언제·왜" |
| B2 | 사용자 스토리 | "As a… I want… so that…" 형식, 번호 매김, 빈 상태·에러·모바일 포함 |
| B3 | 테스트 seam | 어느 경계에서 테스트할지(순수 로직 함수 vs 컴포넌트 vs e2e), 기존 유사 테스트 선례 |
| B4 | Out of Scope | 일부러 뺀 것 3개 이상과 이유 |
| B5 | 구현 결정 | 모듈·인터페이스·상태 저장 방식(sessionStorage/localStorage)·BYO-key 여부·**새 npm 의존성 유무**(있으면 이름과 이유 — 머지 전 사람 확인 대상). 파일 경로·코드 스니펫은 넣지 않음 |
| B6 | 디자인 방향 | design-system.md의 어떤 토큰·컴포넌트를 쓰는지, anti-template 10개 중 어느 4개를 충족할지 |
| B7 | 완료 조건 | RUBRIC C의 어느 항목을 어떤 숫자로 통과할지 미리 적음 |

통과: 총점 ≥ 11/14. 사람은 Issue에서 `approved` 또는 `changes-requested`(코멘트에 이유).

## C. 릴리스 루브릭 (도구 PR → Ready 전환 조건, 로컬 보강 세션에서 최종 채점)

### C-1 기능·사용성
| # | 기준 | 2점의 뜻 | 필수 |
| --- | --- | --- | --- |
| C1 | 핵심 흐름 | 첫 방문자가 설명 없이 3번 이하 조작으로 결과를 얻는다(Playwright e2e로 재현, 조작 수를 테스트 이름에 기록) | ✔ |
| C2 | 결과 처리 | 복사·다운로드·히스토리(최근 20건, JSON 내보내기, 전체 삭제) 동작 — e2e 4개 | |
| C3 | 상태 | 로딩·빈 상태·에러·오프라인 **4개 상태 각각 e2e 테스트 1개 이상**(총 ≥ 4개 통과) | ✔ |
| C4 | 모바일 | 320/375/768/1024/1440에서 `scrollWidth <= innerWidth` 단언 통과 + 스크린샷 5장 | ✔ |
| C5 | 한국어 | UI 문자열 전부 한국어(영문은 코드 식별자·고유명사만). `grep -E "[A-Za-z]{4,}"`로 추출한 UI 문자열 목록을 PR에 첨부해 예외를 설명 | ✔ |

### C-2 품질 게이트 (숫자 필수)
| # | 기준 | 2점의 뜻 | 필수 |
| --- | --- | --- | --- |
| C6 | 타입·린트 | `pnpm exec tsc --noEmit` 0 error, `pnpm lint` 0 error | ✔ |
| C7 | 단위 테스트 | §6.5 커버리지 설정으로 lines/functions/statements ≥ 80, branches ≥ 70(vitest 출력 첨부). TDD 커밋 순서(테스트 → 구현)가 git log에 보임 | ✔ |
| C8 | E2E | 핵심 흐름 + 에러 경로 e2e 통과, axe 위반 0(`@axe-core/playwright` 출력) | ✔ |
| C9 | 성능 | 첫 화면 JS 전송량이 `scripts/js-budget.json` 기준선 +10% 이내(`pnpm test:gate`의 `[js-budget]` 출력 첨부 — Next 16은 First Load JS를 출력하지 않는다). Lighthouse 3회 중앙값 Performance ≥ 90, Accessibility ≥ 95(JSON 경로) | ✔ |
| C10 | 보안 | 비밀 키 코드 내 0건(`gitleaks` 또는 `grep -E "sk-|api[_-]?key"` 0건), BYO-key 저장 방식이 §6.3대로(sessionStorage 기본·기억 옵션 기본 꺼짐·경고 문구·전체 삭제 버튼 — 해당 없으면 N/A), `innerHTML`·`dangerouslySetInnerHTML` 0건 또는 정당화, **새 npm 의존성 0개 또는 사람 확인 코멘트 존재** | ✔ |
| C11 | 코드 규칙 | 파일 ≤ 400줄(최대 800), 함수 ≤ 50줄, 불변성, 매직 넘버 상수화 — 위반 수를 적음 | |

### C-3 디자인·콘텐츠
| # | 기준 | 2점의 뜻 | 필수 |
| --- | --- | --- | --- |
| C12 | 디자인 시스템 | §6.5 토큰 grep: `globals.css`·design-system.md 밖의 새 색·간격·커스텀 프로퍼티 정의 **0건**(명령과 출력 첨부). `impeccable` critique 또는 gstack `design-review` 결과 첨부 | ✔ |
| C13 | 안티 템플릿 | `~/.claude/rules/web/design-quality.md` 10개 중 **4개 이상의 번호**를 적고 각각 어느 컴포넌트·스크린샷이 그것을 보여주는지 1줄씩 | |
| C14 | 카탈로그 | showcase MDX에 category·icon·tagline·toolPath·tags·releasedAt·version 전부 채움(`requiresKey`는 해당 시), 본문 4절(무엇·어떻게·한계·변경 이력) | ✔ |
| C15 | 법적 | `research/refs/*.md`에 참고 기록(없으면 "참고 사이트 없음" 명시), 복제 요소 0, 외부 라이선스 `docs/licenses.md` 기록, `research/local/`이 커밋되지 않음 | ✔ |
| C16 | 문서 | PR 본문이 `.github/pull_request_template.md`의 5절(변경 요약 / 왜 이 변경이 필요한가 / 확인한 내용 / 스크린샷 또는 참고 링크 / 위험 요소·후속 작업)을 채우고, **"확인한 내용" 절에 C6~C10 숫자**가 있다 | ✔ |

통과: 필수 13개 모두 2점(N/A 제외) + 총점 ≥ 28/32(N/A는 분모에서 뺀 뒤 같은 비율 87.5% 적용). 통과 시 Draft → Ready. 미달 항목은 PR 코멘트에 번호로 남긴다.

## D. Phase 0 완료 루브릭 (Opus 1차 산출물 — 이 handoff를 수행한 결과)

전부 필수. 하나라도 미달이면 사이클 1을 시작하지 않는다. **D0이 ②에서 실패하면 D5~D8은 "보류(사람 결정 대기)"로 적고 나머지를 완료한다.**

| # | 산출물 | 통과 조건(검증 명령) |
| --- | --- | --- |
| D0 | 사전 점검 | ① `gh auth status` 성공, ② run_once 테스트 루틴이 브랜치 푸시 + Draft PR + Issue 코멘트에 성공(PR·Issue URL, 예약 시각 vs 실제 시작 시각), ③ `wrangler deployments list` 출력 + `wrangler rollback` 가능 여부 기록, ④ Anthropic·OpenAI 브라우저 직접 호출 정책의 공식 문서 URL과 결론 |
| D1 | 테스트 인프라 | `pnpm test:coverage` 성공(테스트 ≥ 1개, 커버리지 리포트), `pnpm test:gate` 성공(`e2e/js-budget.spec.ts` + `e2e/tools-*`), `ci.yml` validate에 단계 추가, deploy 잡 diff 0줄(`git diff origin/main -- .github/workflows/ci.yml`로 확인), `scripts/js-budget.json`에 허브(`/showcase`) 기준선(KB, 압축 전송량 `encodedBodySize`) 기록 |
| D2 | 스키마·허브 | `pnpm content` 성공, 기존 showcase MDX 6개 빌드 유지, 새 필드 **9개** 반영(`velite.config.ts` diff), `/showcase`에 아이콘·tagline·requiresKey 표시(스크린샷 경로) |
| D3 | 도구 규약 + 샘플 | `src/features/tools/_shared/ToolShell`(또는 §12-8 거부 시 대체 경로) 존재, `/tools/<sample>` 라우트 1개가 **RUBRIC C 전체** 통과(N/A 항목 명시), `scripts/js-budget.json`에 샘플 도구 기준선 추가 |
| D4 | 루프 파일 | `routines/R1~R4.md` 4개 + `routines/_common.md`(시작 3단계 = PAUSE·WIP·재확인 규약), `docs/radar/sources.yaml`, `docs/radar/backlog.md`(후보 ≥ 5, 각 URL ≥ 2), GitHub 라벨 **9개**(`gh label list` 출력), `canary.yml` 머지, `.gitignore`에 `research/local/`, `plugins.md` |
| D5 | 루틴 등록 | `/schedule` list에 4개, cron UTC 변환이 §8.1 KST와 일치(표 첨부), firecrawl 커넥터만, R1 수동 run 1회 성공 로그(`get_run_log`), 각 run의 실행 시간 기록 |
| D6 | 소스 검증 | R1 첫 실행에서 유튜브 채널 메타·HN API·Anthropic/OpenAI URL 각각 "성공/실패/대안"이 `sources.yaml` `verified`에 기록 |
| D7 | 문서 | `docs/plan.md` Phase 2 섹션, `docs/techspec.md` 채움, README 갱신, `SITE_URL` 정정, `docs/claude/project.md` Next.js 16 정정 — PR 번호 |
| D8 | 첫 제안 | R2 수동 run → `proposal` Issue 1개가 A·B 점수표(A ≥ 12/16, 필수 4개 2점; B ≥ 11/14)를 포함 — Issue 번호 |
| D9 | 상태 | `STATE.md`에 D0~D8 전부 숫자와 함께 체크, §12 선결정 5개의 답, 후결정 3개의 "답 또는 결정 예정일" |
| D10 | 정직성 | 못 한 것·막힌 것이 STATE.md에 있다(0건이면 그 이유) |

## E. 루프 건강 루브릭 (2주마다, 회고 세션)

| 지표 | 목표 | 측정 |
| --- | --- | --- |
| 사이클 완수율 | 시작한 사이클 중 live 도달 ≥ 75% | STATE.md 사이클 로그 |
| 승인 대기 시간 | 제안 → approved 중앙값 ≤ 24h, PR Ready → 머지 ≤ 48h | GitHub 타임스탬프(`gh issue view --json`) |
| 사람 시간 | 주당 승인 ≤ 20분 + 보강 세션 ≤ 60분 + 마케팅 ≤ 75분 | 사람 자가 기록(STATE.md 금요일 줄) |
| 재시도 | 게이트당 평균 재시도 ≤ 1, `blocked` ≤ 1건/2주 | Issue/PR의 attempt 코멘트 수, `gh issue list --label blocked` |
| 중복 | 같은 slug의 중복 PR·중복 제안 0건 | `gh pr list` |
| 배포 안전 | 캐너리가 못 잡은 장애(사람이 먼저 발견) 0건 · 캐너리 실패 → 복구 중앙값(시간) 기록 | `canary.yml` 실행 기록, `bug` Issue 타임스탬프 |
| 루틴 효율 | no-op 실행 ≤ 2분, 작업 실행 시간 기록, 예약 대 실제 시작 지연 중앙값 기록 | `list_runs`·`get_run_log` |
| 컨텍스트 | 로컬 세션 compact ≤ 1회/세션 | 세션에 표시된 압축 알림 횟수(STATE 한 줄 로그에 기록) |
| 콘텐츠 | 릴리스마다 글 1 + 카드 1 + SNS 3 초안 100% | `content` PR |
| 레이더 | 주간 디제스트 PR 100%(머지 여부 별도), 분기 Trial ≥ 1 | `radar` PR·Issue |
| 비용 | 주당 루틴 실행 시간 합계가 HANDOFF §8.5 추정(4.5시간/주)의 ±30% 안 | `get_run_log` 합산, STATE.md |

2개 이상 미달이면 HANDOFF 개정 제안(사람 승인) 없이는 리듬을 바꾸지 않는다.

## F. 이 handoff 자체의 품질 기준 (작성자 자체 점검, v1.1 2026-11-02)

- [x] 리포 안 사실은 파일 경로·명령으로, 리포 밖 사실은 §13.1 증빙 원장으로 출처가 있다. 확인 못 한 것은 `[확인 필요]` 5건(impeccable 설치법 · wrangler rollback · HN API 형식 · CORS 정책 · Next 번들 단위), 추정은 `[추정]` 1건(비용)으로 표시했다.
- [x] 사람이 정한 결정 9개가 §2에 있고, 재논의 금지로 표시했다.
- [x] 사람이 아직 정하지 않은 것 8개(선결정 5·후결정 3)가 §12에 있고, "결정 요청"으로 남겼다.
- [x] 루틴 간 상태가 파일이 아니라 GitHub에 있어, 어떤 루틴도 다른 루틴의 브랜치를 전제하지 않는다(§8.0).
- [x] 첫 제안이 구조적으로 가능하다(백로그 시드 §9.3 → A1 충족 경로).
- [x] 교착·중복·PAUSE 지연·롤백 한계를 명시했고, 해결 못 한 것은 "한계"로 적었다(§8.2, §8.5, §8.6).
- [x] 각 단계의 스킬 선택에 스타 수·설치 여부·채택 범위·공급망 규칙이 있다.
- [x] 도구 확장 단계(T0~T3)와 운영 규칙이 수치 트리거로 정의돼 있다.
- [x] RUBRIC C의 모든 숫자에 측정 방법(§6.5)이 있다.
- [x] 마케팅이 하루 10~15분 단위 요일 표로 있고, 승인·머지 작업도 요일 표 안에 들어 있다.
- [x] 법적 경계가 허용/금지 목록으로 있고, robots≠허가, 산출물 보존 기간, 법률 자문이 아님을 밝혔다.
- [x] 독립 리뷰 2건(Claude·Codex)의 치명·중요 항목을 전부 반영했거나 미반영 이유를 §14에 적었다.
