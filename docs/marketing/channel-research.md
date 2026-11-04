# 배포 채널 조사

- 조사일(모든 URL 접근일): 2026-11-04
- 대상 콘텐츠: 1인 개발자가 만든 **무료 브라우저 도구**(가입 없음) + **제작기 블로그 글**
- 원칙: 우리는 자동 게시를 하지 않는다. API 유무는 참고로만 적었다.
- 표기: 공식 문서를 열어 확인한 내용만 사실로 적었다. 못 연 곳, 공식 문구를 못 찾은 곳은 `[확인 필요]`.

## 요약표

| 채널 | 대상 독자 | 자기 프로젝트 홍보 | 자동 게시 API | 적합도 |
|---|---|---|---|---|
| GeekNews (Show GN) | 한국 개발자·기술 리더 | 허용, 단 **Show로만**, 체험 가능한 것만 | [확인 필요] | **상** (도구) / 하 (제작기 글) |
| 디스콰이엇 | 한국 메이커·1인 창업자·개발자·디자이너 | 실제 게시물 다수가 자기 제품 소개. 공식 규칙 문서는 못 찾음 | [확인 필요] | **상** |
| OKKY | 한국 개발자(취준생 포함) | `홍보·광고` 게시판이 따로 있음 | [확인 필요] | 중 |
| 커리어리 | 한국 직장인·개발자 | [확인 필요] | [확인 필요] | 하 (상태 불명확) |
| velog | 한국 개발자 블로거 | 자기 블로그라 제작기 게시는 자연스러움. 규칙 문서 못 찾음 | [확인 필요] | 중 (제작기 글) |
| Hacker News (Show HN) | 글로벌 개발자 | 허용, 체험 가능·비사소한 것만, 블로그 글 불가 | [확인 필요] | 중 (한국어 도구는 하) |
| Reddit r/webdev | 글로벌 웹 개발자 | Showoff Saturday에만(비공식 미러 기준) | 있음 [확인 필요] | 중 |
| Product Hunt | 글로벌 얼리어답터·메이커 | 메이커 본인 게시 권장 | [확인 필요] | 중 (한국어 도구는 하) |
| X | 글로벌·국내 개발자 | 규칙 문서 열지 못함 | 있음(Post 생성 API) | 중 |
| Threads | 국내 일반·개발자 | [확인 필요] | 있음(Threads API) | 중 |
| LinkedIn | 채용 담당자·기술 리더 | 스팸·부자연스러운 참여 유도 금지 | 있음(Posts API) | 중 (채용 시그널은 상) |
| Instagram | 국내 일반 | [확인 필요] | 있음(전문가 계정) | 하~중 (카드뉴스형만) |
| YouTube Shorts | 일반·개발 입문자 | [확인 필요] | [확인 필요] | 하~중 |
| 브런치 | 국내 일반 독자(에세이·자기계발) | [확인 필요] | [확인 필요] | 하 |

---

## 한국 개발자 커뮤니티

### GeekNews (news.hada.io) — Show GN
- 대상 독자: 한국 개발자, 기술 리더. Show 목록 상단에 1인 개발 도구가 많이 올라와 있다(예: "Show GN: overflow-guard", "Show GN: kocer" 등, https://news.hada.io/show).
- 홍보 규칙 (공식 가이드라인 https://news.hada.io/guidelines):
  - "본인 또는 소속 조직이 만든 서비스, 제품, 앱, 오픈소스, 도구를 소개할 때는 뉴스가 아니라 Show로 등록해야 합니다."
  - "직접 사용해 볼 수 있는 작업물만 등록해 주세요."
  - "블로그 글, 뉴스레터, 소개용 페이지처럼 실제로 체험할 수 없는 내용은 Show GN에 올리실 수 없습니다."
  - "YouTube 링크는 Show GN에 등록할 수 없습니다."
  - "같은 프로젝트는 일정 기간 내에 다시 등록할 수 없습니다."
  - 같은 출처(개인 블로그 등)를 반복 등록하거나 "여러 프로젝트나 저장소를 짧은 기간에 반복 등록하는 경우" 배포 채널처럼 쓰는 것으로 보고 등록이 제한될 수 있다.
  - "충분한 검토 없이 대량 생산된 요약형·SEO형 콘텐츠"는 노출 제한·삭제 대상.
- 권장 형식:
  - 제목: 관례상 `Show GN: 이름 - 한 줄 설명`(Show 목록 실제 제목들에서 관찰). 클릭 유도 제목은 모더레이터가 편집할 수 있다.
  - 본문: CommonMark 마크다운, **이미지 미지원**.
  - 링크: 원본 URL만. 단축 URL·리다이렉트·중간 페이지는 삭제.
  - 해시태그: 해당 없음.
- 자동 게시 API: [확인 필요] (공식 문서 못 찾음). 우리는 사용하지 않음.
- 적합도: **도구 링크는 상**(체험 가능, 가입 없음). **제작기 블로그 글을 Show로 올리는 것은 불가**. 제작기는 도구 소개 본문에 요약하고 블로그 링크를 덧붙이는 정도로. 도구를 매주 연달아 올리면 "배포 채널처럼 사용"으로 제한될 수 있으니 간격을 둔다.

### 디스콰이엇 (disquiet.io)
- 대상 독자: 독립 메이커, 1인 창업자, 스타트업, 개발자, 디자이너(첫 화면 게시물 기준 관찰).
- 홍보 규칙: 첫 화면 게시물 상당수가 작성자 본인 제품 소개이고, 상단 메뉴에 Products 섹션이 있다(https://disquiet.io/). 자기 제품 홍보 범위를 정한 **공식 운영정책 문서는 찾지 못했다** [확인 필요]. "메이커로그" 섹션은 현재 첫 화면 메뉴에서 보지 못했다 [확인 필요].
- 권장 형식: 글쓰기는 로그인 필요. 이미지·길이 규정은 [확인 필요].
- 자동 게시 API: [확인 필요].
- 적합도: **상**. "제작기 + 제품 페이지" 조합이 이 커뮤니티의 기본 형식에 가깝다.

### OKKY (okky.kr)
- 대상 독자: 한국 개발자. 커뮤니티 하위에 사는얘기·AI·취준생·피드백·홍보·광고 등 게시판(https://okky.kr/).
- 홍보 규칙: 커뮤니티 아래 **`홍보·광고` 게시판**이 있고 설명은 "개발자 제품과 콘텐츠 홍보"(https://okky.kr/events/promote). 최근 글 다수가 개인 개발자 앱·도구 소개였다. 운영정책 본문은 열지 못했다 [확인 필요].
- 권장 형식: [확인 필요].
- 자동 게시 API: [확인 필요].
- 적합도: **중**. 허용된 자리가 분명하지만 홍보 게시판 안에서만 노출돼 도달이 한정적일 수 있다(추정).

### 커리어리 (careerly.co.kr) — 서비스 상태
- 2026-11-04 접속 결과: 사이트가 열리고 Chatbeta·Jobs·Discover·Community 메뉴와 "AI 시대의 커리어 - 커리어리" 제목이 보였다. 저작권 표기는 "© 2025 Careerly". 종료 공지는 보이지 않았다(https://careerly.co.kr/).
- 웹 검색에서도 종료·개편 공식 공지는 찾지 못했다.
- 커뮤니티 피드가 지금도 활발한지, 외부 링크 홍보 규칙은 무엇인지는 확인하지 못했다 [확인 필요].
- 적합도: **하**(상태와 규칙 불명확. 확인 전에는 우선순위에서 뺀다).

### velog (velog.io)
- 대상 독자: 한국어 개발 블로그 독자(인터페이스 한국어, 트렌딩·추천·최신·피드 탭, https://velog.io/). 독자층 공식 설명은 없음.
- 홍보 규칙: 공개 커뮤니티 가이드라인을 찾지 못했다 [확인 필요]. 자기 블로그에 쓰는 제작기라 형식상 문제는 적다(추론).
- 권장 형식: 마크다운 블로그 글. 트렌딩은 주간 기준으로 보인다("이번 주" 표시).
- 자동 게시 API: 공식 문서 없음 [확인 필요].
- 적합도: **중**(제작기 글 교차 게시용). 원문은 우리 블로그에 두고 canonical 처리 가능 여부는 [확인 필요].

### 브런치 (brunch.co.kr)
- 대상 독자: 일반 독자. 에세이·소설·자기계발 등 카테고리(https://brunch.co.kr/).
- 홍보 규칙: 글을 쓰려면 작가 신청을 거친다. 카카오 공식 소개: "서랍 속 글을 꺼내어 작가 신청을 해 주세요. 출간 경험이 없어도, 등단을 하지 않아도 ..."(https://www.kakaocorp.com/page/detail/598). 운영정책의 홍보 규정은 열지 못했다 [확인 필요].
- 권장 형식: 장문 에세이형.
- 자동 게시 API: [확인 필요].
- 적합도: **하**. 심사 대기가 있고 독자층이 개발 도구와 멀다. "1인 개발 회고" 에세이로만 고려.

---

## 글로벌

### Hacker News — Show HN
- 대상 독자: 글로벌 개발자·창업자.
- 홍보 규칙 (https://news.ycombinator.com/showhn.html):
  - "Show HN is for something you've made that other people can play with."
  - "Off topic: blog posts, sign-up pages, newsletters, lists, and other reading material."
  - "Don't post quickly-generated one-offs; anybody can do that now." / "The project should be non-trivial."
  - "Please make it easy for users to try your thing out, ideally without barriers such as signups or emails."
  - "Please don't ask friends to upvote or comment."
  - 일반 가이드라인(https://news.ycombinator.com/newsguidelines.html): "Please don't use HN primarily for promotion." 대문자·느낌표로 제목 꾸미기 금지.
- 권장 형식: 제목은 "Show HN"으로 시작. 텍스트 본문 + URL. 이미지 없음.
- 자동 게시 API: [확인 필요].
- 적합도: **중**. 가입 없는 브라우저 도구는 규칙에 잘 맞는다. 다만 한국어 전용 도구(번역투 하이라이터)는 독자 대부분이 못 써서 **하**. "하루 만에 만든 소품"은 "quickly-generated one-offs" 금지에 걸릴 수 있으니 기술적 깊이를 설명할 수 있을 때만.

### Reddit — r/webdev 등
- 대상 독자: 글로벌 웹 개발자.
- 홍보 규칙: reddit.com과 redditinc.com은 이번 도구로 접속이 막혀 **공식 규칙을 직접 열지 못했다** [확인 필요]. 검색 요약(비공식 미러 기준)으로는 "자기 프로젝트·포트폴리오 공유는 Showoff Saturday에만, 다른 요일은 삭제, 상업 홍보 금지, 9:1 자기홍보 규칙 참고". 게시 전 https://www.reddit.com/r/webdev/about/rules/ 를 브라우저로 직접 확인해야 한다.
- 권장 형식: [확인 필요].
- 자동 게시 API: Reddit API는 존재하는 것으로 알려져 있으나 이번에 문서를 열지 않았다 [확인 필요].
- 적합도: **중**(토요일 한정). 한국어 도구는 하.

### Product Hunt
- 대상 독자: 글로벌 얼리어답터·메이커·투자자.
- 홍보 규칙 (https://help.producthunt.com/en/articles/479557-how-to-post-a-product): 개인 계정 필요("Company accounts can't post products"), 신규 계정은 게시 권한이 필요, "We recommend posting your own product". 첫 댓글은 "Ask for feedback (NOT upvotes)"(런치 가이드).
- 권장 형식 (런치 가이드 https://www.producthunt.com/launch/preparing-for-launch):
  - 태그라인 최대 60자, 설명 최대 500자
  - 썸네일 정사각 240x240 권장, 3MB 미만(GIF 가능)
  - 갤러리 이미지 2장 이상 필수, 1270x760 권장
  - 12:01am PST에 시작하는 24시간 주기 → 한국 시간 오후 5시 1분 무렵(PST 기준 환산, 서머타임 여부에 따라 1시간 차이 [확인 필요])
- 자동 게시 API: [확인 필요].
- 적합도: **중**. 영어 UI 도구라면 해볼 만하나 한국어 전용 도구는 하. 준비물(갤러리 2장+)이 많아 Phase 0 직후 채널로는 무겁다.

### X
- 대상 독자: 글로벌·국내 개발자, AI 커뮤니티.
- 홍보 규칙: 플랫폼 조작·스팸 정책 페이지(https://help.x.com/en/rules-and-policies/platform-manipulation)는 403으로 열지 못했다 [확인 필요].
- 권장 형식: 글자 수 제한(일반 계정 280자로 알려짐) [확인 필요]. 이미지·동영상 첨부 가능. 영상 길이 상한은 비Premium 20분·8GB, Premium 125분·16GB(Post 생성 API 문서 기준).
- 자동 게시 API: **있음** — Create Post 엔드포인트, OAuth 2.0 사용자 컨텍스트(`tweet.write` 등), 인용 게시는 Enterprise 플랜 필요(https://docs.x.com/x-api/posts/create-post).
- 적합도: **중**. 도구 GIF 한 장 + 링크 형식이 잘 맞지만 팔로워 기반이 없으면 도달이 낮다(추정).

### Threads
- 대상 독자: 국내 일반 사용자와 개발자(관찰 근거 없음, 추정).
- 홍보 규칙: [확인 필요] (Meta 커뮤니티 가이드라인 미열람).
- 권장 형식 (Threads API 개요 https://developers.facebook.com/docs/threads/overview):
  - 텍스트 게시물 500자 제한
  - 이미지 JPEG·PNG, 8MB 이하, 가로 320~1440px, 비율 한도 10:1
  - 동영상 MOV·MP4, 최대 5분, 1GB 이하
  - 링크 개수 제한은 이 페이지에 없음 [확인 필요]
- 자동 게시 API: **있음** — 24시간 이동 창 기준 API 게시 250개 제한.
- 적합도: **중**. 고텍이 블로그 스킬이 이미 쓰레드 5~7포스트 변환 형식을 갖고 있어 제작 비용이 낮다.

### LinkedIn
- 대상 독자: 채용 담당자, 기술 리더(프로젝트 핵심 사용자와 겹침).
- 홍보 규칙 (Professional Community Policies https://www.linkedin.com/legal/professional-community-policies): "Do not spam members or the platform", 무관하거나 원치 않는 상업·홍보성 메시지 금지, 인위적 참여 증가·품앗이 좋아요 금지. "self-promotion"이라는 단어는 없다. 자기 작업 공유 자체를 막는 문구는 없었다.
- 권장 형식: 글 길이·이미지 비율 공식 규정은 이번에 확인 못 함 [확인 필요]. 해시태그는 본문에 `#coding`처럼 쓰면 링크로 변환된다(Posts API 문서).
- 자동 게시 API: **있음** — Posts API, 개인 게시는 `w_member_social` 권한(https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api). 비스폰서 캐러셀은 미지원, MultiImage는 지원.
- 적합도: **중**(조회 도달) / 채용 시그널 관점에서는 **상**. "무엇을 만들었고 무엇을 배웠나" 회고형이 맞다.

### Instagram
- 대상 독자: 국내 일반 사용자.
- 홍보 규칙: [확인 필요] (커뮤니티 가이드라인 미열람).
- 권장 형식 (Content Publishing 문서 https://developers.facebook.com/docs/instagram-platform/content-publishing):
  - 캐러셀 최대 20개, 캐러셀 이미지는 첫 장 기준으로 잘리며 기본 1:1
  - 4:5 세로 비율 지원 여부는 이 페이지에 없음 [확인 필요]
  - 해시태그 개수 규정 없음 [확인 필요]
  - 피드 게시물 본문 링크가 클릭되지 않는 점은 이번에 확인 못 함 [확인 필요]
- 자동 게시 API: **있음**, 전문가(professional) 계정만. 24시간 API 게시 한도는 같은 문서 안에서 100개와 50개 두 값이 함께 나온다 [확인 필요].
- 적합도: **하~중**. 카드뉴스형 도구(card-news-canvas) 결과물을 보여줄 때만 맞다.

### YouTube Shorts
- 대상 독자: 일반·개발 입문자.
- 홍보 규칙: [확인 필요] (스팸 정책 미열람). 참고로 GeekNews Show GN은 YouTube 링크 등록을 금지한다.
- 권장 형식 (https://support.google.com/youtube/answer/10059070): 최대 3분, 세로 영상, 최대 1080p. 정사각 영상 언급은 없음.
- 자동 게시 API: [확인 필요].
- 적합도: **하~중**. 15초 데모 영상(블로그 스킬의 "15초 훅" 형식)을 만들 여력이 있을 때만.

---

## 수요일 커뮤니티 1곳 추천

요일 선택은 운영 일정에 따른 것이다. "수요일이 반응이 좋다"는 데이터는 찾지 않았고 근거도 없다.

### 1순위: GeekNews Show GN
- 공식 규칙이 우리 상황과 정확히 맞는다. "직접 사용해 볼 수 있는 작업물"이고, 가입 없이 브라우저에서 바로 쓰는 도구라 "체험할 수 없는 내용" 금지에 걸리지 않는다.
- 독자가 프로젝트 핵심 사용자(한국 개발자, 기술 리더)와 겹친다.
- 같은 결의 1인 개발 도구가 Show 목록에 실제로 올라와 있다(https://news.hada.io/show).
- 지킬 것: 도구 URL을 원본으로 올린다(블로그 글 URL 금지, 단축 URL 금지). 본문은 이미지 없이 마크다운으로, 만든 이유와 한계를 짧게. 같은 출처를 연달아 올리지 않도록 도구 간격을 둔다(구체 기간은 가이드라인에 없음 [확인 필요]).

### 2순위: 디스콰이엇
- 제작기 글과 제품 소개를 함께 올리는 형식이 기본인 메이커 커뮤니티라, GeekNews에 못 올리는 **제작기 블로그 글**을 담을 자리다.
- 1인 메이커 독자가 많아 피드백 받기에 맞다(첫 화면 관찰 기준).
- 한계: 공식 운영정책을 못 찾아 홍보 허용 범위가 문서로 확인되지 않았다 [확인 필요]. 게시 전에 이용약관을 직접 읽는다.

대안: 디스콰이엇 규칙이 확인되지 않으면 OKKY `홍보·광고` 게시판(자리가 공식적으로 있음)을 2순위로 바꾼다.

## 근거 URL 목록 (모두 2026-11-04 접근)
- https://news.hada.io/guidelines
- https://news.hada.io/show
- https://disquiet.io/
- https://okky.kr/
- https://okky.kr/events/promote
- https://careerly.co.kr/
- https://velog.io/
- https://brunch.co.kr/
- https://www.kakaocorp.com/page/detail/598
- https://news.ycombinator.com/showhn.html
- https://news.ycombinator.com/newsguidelines.html
- https://help.producthunt.com/en/articles/479557-how-to-post-a-product
- https://www.producthunt.com/launch/preparing-for-launch
- https://docs.x.com/x-api/posts/create-post
- https://developers.facebook.com/docs/threads/overview
- https://www.linkedin.com/legal/professional-community-policies
- https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api
- https://developers.facebook.com/docs/instagram-platform/content-publishing
- https://support.google.com/youtube/answer/10059070
- 열지 못함(직접 확인 필요): https://www.reddit.com/r/webdev/about/rules/ , https://help.x.com/en/rules-and-policies/platform-manipulation
