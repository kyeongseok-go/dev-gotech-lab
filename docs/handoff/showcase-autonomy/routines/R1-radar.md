# R1 레이더 수집 (매일 07:17 KST, sonnet)

먼저 `docs/handoff/showcase-autonomy/routines/_common.md`를 읽고 시작 3단계를 지킨다.

1. 이번 ISO 주 `radar: <YYYY-Www>` Issue를 찾는다(`gh issue list --label radar --search "radar: <주>"`). 없으면 만든다(라벨 `radar`, 본문: "R1이 매일 코멘트를 단다. R2가 월요일에 디제스트로 묶는다.").
2. `docs/radar/sources.yaml`의 `enabled: true` 소스만 수집한다. 영상 소스는 **제목·채널·게시일·URL 메타만**(자막·본문 금지, HANDOFF §7).
3. 같은 Issue의 기존 코멘트와 지난주 Issue 코멘트(최근 30일)에 이미 있는 URL은 뺀다.
4. 남은 것 중 우리 스택(Next.js·Cloudflare Workers·Velite·TypeScript·브라우저 전용 도구·Claude Code 스킬)과 가까운 순으로 **최대 5개**. 항목마다 3줄: 무엇 / 왜 중요 / 적용 가능성 0~2(근거 한 줄).
5. 코멘트 1개로 단다. 머리줄 `### YYYY-MM-DD (KST)`. 소스별 성공·실패 수를 마지막 줄에 적는다(예: `소스: 성공 14 · 실패 1(OpenAI 뉴스 403) · 건너뜀 0`).
6. 소스 수집이 처음 성공하거나 실패한 소스가 있으면 코멘트 끝에 `sources.yaml verified 갱신 제안: <id>=true|false`를 적는다(파일은 고치지 않는다 — R2가 디제스트 PR에서 반영).

파일을 쓰지 않는다. 출력은 Issue 코멘트 1개뿐이다.
