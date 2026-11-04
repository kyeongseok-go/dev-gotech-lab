# 외부 플러그인·스킬 공급망 기록 (HANDOFF §5 공급망 규칙)

> 설치는 경석님 승인(2026-11-04, §12-4) 후 로컬 세션에서 수행. 버전은 마켓플레이스가 고정한 커밋 SHA로 고정되며, 업데이트는 사람이 `claude plugin update <name>`으로만 한다. 루틴은 플러그인을 설치하지 않는다.

| 이름(설치 ID) | 출처 | 설치 버전 · 고정 커밋 | 설치일 · 범위 | 라이선스 | 추가하는 권한·훅·MCP |
| --- | --- | --- | --- | --- | --- |
| `mattpocock-skills@claude-plugins-official` | https://github.com/mattpocock/skills | 1.3.1 · `49dd158d1076134a641b33efb035946536778336` | 2026-11-04 · user | MIT | 없음(`plugin.json`에 hooks·mcpServers 없음). 스킬 38개 |
| `impeccable@claude-community` | https://github.com/pbakaus/impeccable | 4.0.4 · `2ab054d1f400c5ec085133352232ffc2617f0d54` | 2026-11-04 · user | Apache-2.0 | 없음. 스킬 1개(명령 23개: polish·audit·critique 등) |
| `coreyhaines31@claude-community` (marketing-skills) | https://github.com/coreyhaines31/marketingskills | 2.10.0 · `7868cb9251fad80a73d26e488a5ad5f6c4a9f335` | 2026-11-04 · user | MIT | 없음. 스킬 49개 |

확인 방법: `claude plugin list`, `~/.claude/plugins/cache/<marketplace>/<name>/<version>/.claude-plugin/plugin.json`, 각 마켓플레이스 `marketplace.json`의 `sha`.

## 채택 스킬 (이것만 쓴다 — 나머지는 컨텍스트 낭비)

| 플러그인 | 채택 | 쓰는 단계(HANDOFF §5.1) |
| --- | --- | --- |
| mattpocock-skills | engineering: `to-spec` · `implement` · `tdd` · `code-review` · `diagnosing-bugs` · `retro` · `triage` · `to-tickets` · `research` · `prototype` · `domain-modeling` / productivity: `grill-me`(`grilling`) · `handoff` · `writing-for-agents` | A·B·C·E·F·H·J |
| impeccable | `/impeccable critique` · `audit` · `polish` (AI slop 탐지) | D·F |
| marketing-skills | `free-tools` · `launch` · `content-strategy` · `marketing-loops` · `seo-audit` · `schema` · `social` · `ai-seo` · `directory-submissions` · **`community-marketing` · `video`**(2026-11-04 추가: 채널 확장 §10.1) | I |

`/setup-matt-pocock-skills`(이슈 트래커=GitHub, 라벨 9개 매핑)는 라벨 생성(Phase 0 5단계) 뒤 로컬 세션에서 실행한다.
