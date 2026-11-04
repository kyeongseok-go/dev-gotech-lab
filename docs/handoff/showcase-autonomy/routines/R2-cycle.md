# R2 사이클 시작 (월·목 06:17 KST, opus)

먼저 `routines/_common.md`를 읽고 시작 3단계를 지킨다. 채점은 `docs/handoff/showcase-autonomy/RUBRIC.md` A·B절을 그대로 쓴다.

## 월요일에만: 레이더 디제스트
1. 지난주 `radar:` Issue의 코멘트 전부 → 1쪽 디제스트 `docs/radar/digests/<YYYY-Www>.md`: 항목마다 링 판정 Adopt / Trial / Assess / Hold + 이유 1줄(HANDOFF §9.2).
2. R1이 남긴 `sources.yaml verified 갱신 제안`을 같은 PR에서 반영한다.
3. 열린 `radar` PR이 있으면 그 브랜치에 커밋을 더하고, 없으면 브랜치 `radar/<YYYY-Www>` + PR(라벨 `radar`). 지난주 Issue는 닫고 이번 주 Issue가 없으면 만든다.
4. Trial 판정 항목은 Issue(라벨 `experiment`, RUBRIC A 점수표 포함)로 올린다. 주당 최대 1개.

## 매회: 토픽 제안 (WIP: 열린 proposal 1)
1. `changes-requested` Issue가 있으면 새 제안 대신 **그 Issue 본문을 고쳐** 다시 제안하고 라벨을 `proposal`로 되돌린다(코멘트의 수정 요청에 하나씩 답한다).
2. 열린 `proposal`이 이미 있으면: 7일 넘게 응답이 없을 때만 리마인드 코멘트 1개. 새 제안 금지. 종료.
3. 후보 풀 = `docs/radar/backlog.md` + 최근 2주 레이더 Adopt/Trial. 후보 3개를 RUBRIC A로 채점(필수 A1·A2·A3·A7, 통과 ≥ 12/16). A1 출처 URL은 실제로 열어 확인한 것만.
4. 1순위를 RUBRIC B 형식의 스펙(사용자 스토리·테스트 seam·Out of Scope·새 의존성 명시)으로 쓴다(`mattpocock-skills`의 to-spec 형식이 있으면 따른다).
5. Issue `proposal: <topic>` 생성(라벨 `proposal`). 본문 맨 위에 A·B 점수표, 아래에 스펙, 맨 끝에 "승인: `approved` 라벨 / 수정: `changes-requested` 라벨 + 코멘트".
6. 도구 수가 허브 단계 경계(6·15·30, HANDOFF §6.4)를 넘었으면 허브 전환 제안 Issue를 따로 1개.
7. `docs/marketing/channels.yaml`의 active 채널 `weekly_minutes` 합이 75를 넘으면 채널 정리 제안 Issue 1개(§10.1).
