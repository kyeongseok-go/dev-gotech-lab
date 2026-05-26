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

## 의존성
모든 스크립트는 PEP 723 inline 메타데이터로 의존성을 선언. `uv` 가 자동 격리 환경 구성.

## 디렉터리
```
scripts/card-news-pipeline/
├── auto_daily.py            # 원클릭 데일리 추가
├── lib/
│   ├── pipeline.py          # collect / backfill / generate 오케스트레이터
│   ├── publish.py           # entries JSON → page.tsx 마커 블록 갱신
│   ├── merge_and_publish.py # 기존 page.tsx 의 엔트리와 신규 엔트리 머지
│   ├── sources/             # reddit / rss 수집
│   └── illustrate/          # entity_detector / pollinations / compositor
├── config/                  # rss_feeds.yaml / entity_assets.yaml
└── assets/                  # 로고 PNG + 테마 bg 캐시
```
