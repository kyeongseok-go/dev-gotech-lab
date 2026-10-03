# card-news-pipeline (in-repo)

GoTechy 카드뉴스 자동 생성 파이프라인. `~/.claude/skills/tech-news-pipeline` 의 in-repo
복제본. 원격 스케줄 에이전트에서도 동작하도록 절대 경로를 `REPO_ROOT` 환경변수 기반으로
변경한 버전.

## 사용

### 데일리 자동 추가 (1건)
```bash
uv run scripts/card-news-pipeline/auto_daily.py
```
오늘 날짜로 신규 카드 1건을 골라 page.tsx 에 추가한다.

### 수동 백필 (여러 건)
```bash
# 1) 후보 수집
uv run scripts/card-news-pipeline/lib/pipeline.py --mode collect --output /tmp/cands.json

# 2) 후보 보고 직접 entries.json 작성 (한국어 제목/요약 다듬기)

# 3) 이미지 생성
uv run scripts/card-news-pipeline/lib/pipeline.py --mode backfill \
  --input entries.json --output entries_done.json

# 4) 기존 + 신규 머지 → page.tsx 반영
python3 scripts/card-news-pipeline/lib/merge_and_publish.py entries_done.json all.json
uv run scripts/card-news-pipeline/lib/publish.py --entries all.json
```

## Reddit OAuth 설정 (403 해결)

Reddit 은 2023년 API 정책 변경 이후 비인증 공개 `.json` 접근을 403 으로 차단한다.
OAuth 토큰을 발급받아 `oauth.reddit.com` 으로 수집하면 정상 동작한다.

1. https://www.reddit.com/prefs/apps 접속 → 하단 **create another app...**
   - name: `tech-news-pipeline` (자유)
   - 타입: **script** 선택
   - redirect uri: `http://localhost:8080` (사용 안 하지만 필수)
2. 생성 후 표시되는 값 확인
   - **client_id**: 앱 이름 바로 아래 짧은 문자열
   - **secret**: `secret` 항목 값
3. 자격증명 파일 작성 (이 파일은 `.gitignore` 처리되어 커밋되지 않음)
   ```bash
   cd scripts/card-news-pipeline/config
   cp reddit_oauth.env.example reddit_oauth.env
   # reddit_oauth.env 에 client_id / secret 입력
   ```
   - 기본은 **app-only(client_credentials)** 모드라 Reddit 비밀번호 불필요.
   - 환경변수(`REDDIT_CLIENT_ID` 등)로 줘도 되며, 환경변수가 파일보다 우선한다.
4. 확인
   ```bash
   uv run scripts/card-news-pipeline/lib/sources/reddit.py --limit 3
   ```
   자격증명이 없으면 공개 엔드포인트로 폴백(대개 403 → 해당 서브레딧 skip)하며,
   RSS 수집은 영향받지 않는다.

## Claude 문구 파이프라인 (옵트인)

기본 일일 자동화(`auto_daily.py` 기본 동작, `card-news-daily.sh`, `card-news-daily.yml`)는 이 단계를 쓰지 않는다.
켜도 **게시하지 않고** 사람이 검토할 승인 대기 파일만 만든다.

### 카드 5장 구성 규칙 (프론트 템플릿과 공유)
| 장 | 내용 | 필드 | 제한 |
|---|---|---|---|
| ① 표지 | 한국어 헤드라인 | `title_ko`, `hook` | 제목 30자, 표지 2줄·줄당 16자 |
| ② 무슨 일인가 | 사실 3줄 | `facts[3]` (`text` + 원문 근거 `evidence`) | 줄당 60자 |
| ③ 왜 중요한가 | 개발자 관점 의견, **'고텍이 의견' 라벨** — 의견은 여기에만 | `why_it_matters[2~3]` | 줄당 60자 |
| ④ 핵심 숫자 | 원문에 있는 숫자만 | `numbers[0~3]` (`value`, `label`, `evidence`) | — |
| ⑤ 출처 | 원문 링크·매체 | `source_name` + 카드의 `external_link` | — |

길이 숫자는 `config/caption.yaml` 의 `limits` 에서 바꾼다.

### 단계
1. **원문 확보** (`lib/caption/source_text.py`) — 원문 URL 을 urllib 로 받아 `html.parser` 로 본문 추출(article → main → body).
   NAVER D2 는 본문을 JS 로 그려서 공개 콘텐츠 API(`/api/v1/contents/<id>`)의 `postHtml` 을 쓴다.
   실패(403·짧은 본문·네트워크 오류)하면 RSS 요약만 쓰고 `confidence: "low"` 로 기록한다.
2. **생성 — 호출 1** (`prompts.py`) — 구조화 출력(JSON 스키마)으로 `title_ko, hook, facts, why_it_matters, numbers, tags, category, source_name` 을 받는다.
   규칙: 원문에 없는 주장·숫자 금지 / 과장어 금지 / 원문 문장 재사용 금지(다시 쓰기) / 영문 고유명사 원어 유지 / 의견은 `why_it_matters` 에만.
3. **코드 검사** (`checks.py`, Claude 없이 동작) — ① `evidence` 가 원문에 실제로 있는지(따옴표·공백·엔티티 정규화)
   ② 생성문의 모든 숫자가 원문에 있는지(쉼표·소수점·% 정규화, `만·억` 은 원문 값과 환산값이 같을 때만)
   ③ 원문과 25자 이상 연속 일치(evidence 제외) ④ 과장어 사전(‘최초·유일·최대·최고’는 원문에 같은 뜻이 있을 때만)
   ⑤ 길이·개수. 결과는 `{passed, violations:[{rule, field, detail}]}`.
4. **판정 — 호출 2** — 생성 프롬프트와 분리된 시스템 프롬프트로, 원문과 주장 목록만 주고 주장마다 `맞음 / 확인 불가 / 틀림` 을 받는다.
   `틀림` 이 하나라도 있으면 `reject`, `확인 불가` 문장은 최종안에서 뺀다(생성 원본은 그대로 보존).
5. **승인 게이트** — 결과는 `status: "pending_review"` JSON + Markdown 판정표 + 모델에 넣은 원문 텍스트로만 남는다.
   `recommendation` 은 `approve_candidate`(검사·판정 통과) / `needs_edit` / `reject`. page.tsx 에는 쓰지 않는다.

### Reddit 제외 이유
Reddit Data API 약관 원문을 아직 확인하지 못했다(상업 이용·신규 API 승인·삭제 콘텐츠 보존 조건이 2차 출처로만 확인됨).
그래서 `reddit.com`, `redd.it`(i./v./preview. 포함) 등 Reddit 도메인이거나 Reddit 에서 수집된 항목은
**코드에서 항상** Claude 입력에서 빼고 `skip_reason: "reddit_terms_unverified"` 로 남긴다(설정으로 끌 수 없음).
다른 RSS 출처도 이용약관은 미확인이므로, 필요하면 `extra_blocked_domains` 로 더 막는다.

### 실행
```bash
# 호출 경로만 확인(호출 없음)
uv run scripts/card-news-pipeline/caption_review.py --show-client

# 기존 카드에 대해 수동 실행(page.tsx 는 읽기만) — 결과는 --out-dir 에만 쓴다
uv run scripts/card-news-pipeline/caption_review.py --page-ids 184 183 --out-dir /tmp/card-caption

# 데일리 흐름에 섀도 모드로 붙이기: 게시는 기존 방식 그대로, 승인 대기 파일만 /tmp/card_caption_<날짜>/ 에 추가
uv run scripts/card-news-pipeline/auto_daily.py --claude-caption [--caption-out-dir DIR]
```
`--claude-caption` 단계가 실패해도 로그만 남기고 데일리 게시는 계속된다. 플래그가 없으면 이 모듈을 import 하지도 않는다.

### Claude 호출 경로와 설정
- `ANTHROPIC_API_KEY` 가 있으면 API: anthropic SDK 가 설치돼 있으면 SDK, 없으면 urllib 로 `POST /v1/messages`.
  거절(refusal) 대비로 서버 측 폴백(`fallbacks: "default"`, beta `server-side-fallback-2026-07-01`)을 켠다(`api_refusal_fallback`).
- 키가 없고 `claude` CLI 가 있으면 `claude -p --output-format json --json-schema ...` (도구·MCP·스킬·설정 파일 끔, 빈 임시 디렉터리에서 실행,
  `--max-budget-usd` 로 호출당 상한). 비용은 CLI 의 `total_cost_usd` 실측값을 기록한다.
- 둘 다 없으면 `skip_reason: "no_claude_client"`.
- 키 값은 출력·로그·파일에 남기지 않는다(존재 여부만 판단).
- 모델: 환경변수 `CARD_NEWS_CAPTION_MODEL` > `config/caption.yaml` 의 `model` > 기본값 `claude-sonnet-5-5`.
  그 밖에 `effort`, `max_tokens`, `timeout_seconds`(기본 180초), `fetch.*`, `limits.*`, `judge_even_if_checks_fail` 을 같은 파일에서 바꾼다.

### 테스트
```bash
uv run --python 3.12 --with pytest --with pyyaml pytest scripts/card-news-pipeline/tests -q
```
코드 검사 5종, Reddit 제외, HTML 엔티티·본문 추출·폴백, 가짜 클라이언트로 생성→검사→판정 흐름,
클라이언트 선택(키 있음 / CLI 만 / 둘 다 없음), `auto_daily.py` 플래그 기본값과 `build_entry` 불변을 검증한다. 실제 API 는 호출하지 않는다.

### 알려진 한계
- 승인된 파일을 page.tsx 에 반영하는 단계는 아직 없다(사람이 `proposed_entry_patch` 를 보고 반영).
- 25자 겹침 검사는 고유명사 나열(예: 브랜드 이름 목록)도 위반으로 잡는다 — 사람이 보고 판단한다.
- `만·억` 외의 단위 환산, 날짜 표기 변환(예: "10월 1일" ↔ "October 1")은 숫자 값만 비교한다.
- 수정 후 재생성 루프, 한글 문체(번역투) 검수, 최근 카드와의 의미 중복 판정은 아직 없다.

## 의존성
모든 스크립트는 PEP 723 inline 메타데이터로 의존성을 선언. `uv` 가 자동 격리 환경 구성.

## 디렉터리
```
scripts/card-news-pipeline/
├── auto_daily.py            # 원클릭 데일리 추가 (--claude-caption 옵트인)
├── caption_review.py        # Claude 문구 생성·검수 수동 실행(승인 대기 파일만)
├── lib/
│   ├── pipeline.py          # collect / backfill / generate 오케스트레이터
│   ├── publish.py           # entries JSON → page.tsx 마커 블록 갱신
│   ├── merge_and_publish.py # 기존 page.tsx 의 엔트리와 신규 엔트리 머지
│   ├── caption/             # Claude 문구 파이프라인(원문 확보·생성·검사·판정·보고)
│   ├── sources/             # reddit / rss 수집
│   └── illustrate/          # entity_detector / pollinations / compositor
├── config/                  # rss_feeds.yaml / entity_assets.yaml / caption.yaml
├── tests/                   # pytest (caption 파이프라인 + auto_daily 플래그)
└── assets/                  # 로고 PNG + 테마 bg 캐시
```
