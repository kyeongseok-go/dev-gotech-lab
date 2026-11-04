# LLM 공급자 브라우저 직접 호출(CORS) 조사

- 조사일: 2026-11-04
- 목적: GoTechy 쇼케이스의 BYO-key(사용자 본인 키) 도구가 서버 없이 브라우저에서 공급자 API를 직접 부를 수 있는지 판단한다.
- 방법: (1) 공식 문서·공식 SDK 문서 확인, (2) 키 없이 또는 무효 키(`invalid`)로 실제 엔드포인트에 프리플라이트(OPTIONS)와 POST를 보내 응답 헤더를 확인했다. 실제 키 발급·가입은 하지 않았다.

## 한눈에 보기

| 공급자 | 브라우저 직접 호출 | 근거 강도 | BYO-key 도구 허용 권고 |
|---|---|---|---|
| Anthropic (Claude) | **가능** (`anthropic-dangerous-direct-browser-access: true` 헤더 필수) | 공식 문서에 명시 + 실측 | 조건부 허용 |
| OpenAI | **가능** (별도 헤더 불필요, SDK는 `dangerouslyAllowBrowser: true` 필요) | SDK 공식 README + 실측. API 문서의 CORS 명시는 못 찾음 | 조건부 허용 |
| Google Gemini | **가능** (실측). 공식 문서는 "클라이언트 코드에 키 넣지 말라"고 권고 | 실측 + 공식 경고 문구. CORS 허용을 명시한 공식 문장은 못 찾음 | 조건부 허용 |

"조건부"의 조건은 맨 아래 [권고안](#byo-key-도구-권고안)에 정리했다.

---

## 1. Anthropic (Claude API)

### 판정: 가능 (헤더 opt-in 방식)

### 공식 근거
- **Authentication 문서 "Browser-based applications" 절** — https://platform.claude.com/docs/en/manage-claude/authentication (접근일 2026-11-04)
  - 원문 요지: 브라우저에서 보내는 요청은 cross-origin(CORS) 요청이고, API는 `anthropic-dangerous-direct-browser-access: true` 헤더가 있을 때만 받아들인다. TypeScript SDK는 `dangerouslyAllowBrowser`를 `true`로 두면 이 헤더를 보낸다.
  - 같은 절: 기본 권고는 "사용자 브라우저가 아니라 자기 백엔드에서 호출하라"이다.
  - **예외 조직**: ZDR(zero data retention)이나 Compliance API가 켜진 조직은 헤더가 있어도 브라우저 호출이 막힌다. 이 경우 키가 유효해도 401 `authentication_error`가 나고, 메시지는 `CORS requests are not allowed for this Organization`으로 시작한다. Claude Enterprise 상위 조직에 연결된 Console 조직은 Compliance API 설정을 물려받는다.
  - 제한은 `Origin` 헤더가 있는 요청에만 적용된다. 백엔드가 브라우저 요청을 그대로 넘기면 `Origin`이 따라가서 똑같이 막힌다.
- **TypeScript SDK 문서** — https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript (접근일 2026-11-04)
  - "Web browsers: disabled by default to avoid exposing your secret API credentials ... Enable browser support by explicitly setting `dangerouslyAllowBrowser` to `true`."
  - "Browser usage" 아코디언: 덜 위험한 경우로 "신뢰하는 내부 도구", "짧은 수명 키로 하는 개발·디버깅"을 든다.
- **SDK GitHub README** — https://github.com/anthropics/anthropic-sdk-typescript (접근일 2026-11-04). 같은 문구.
- **브라우저 지원 도입 PR** — https://github.com/anthropics/anthropic-sdk-typescript/pull/504 (2024-08 병합, 접근일 2026-11-04)
- 참고(2차): Simon Willison, 2024-08-23 — https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/ (BYO-key 패턴을 정당한 사용처로 언급)

### 실측 (2026-11-04, `Origin: https://example.com`)
- `OPTIONS /v1/messages` → `200`, `access-control-allow-origin: *`, `access-control-allow-headers`에 `anthropic-dangerous-direct-browser-access` 포함.
- 무효 키로 `POST /v1/messages`, **헤더 없이** → `401`, 응답에 `access-control-allow-origin` **없음** (브라우저는 응답을 읽지 못함).
- 무효 키로 `POST /v1/messages`, **헤더 포함** → `401 invalid x-api-key`, `access-control-allow-origin: *` **있음** (브라우저가 오류 본문을 읽을 수 있음).
- 결론: 헤더를 붙이면 CORS가 열린다는 공식 문서 설명과 실측이 일치한다.

### 주의점
- 키가 페이지 메모리·네트워크 탭·확장 프로그램에 노출된다. 헤더 이름에 "dangerous"가 들어간 이유다.
- ZDR·Compliance API 조직 사용자는 우리 도구에서 401을 본다. 오류 문구를 그대로 보여주고 "조직 설정 때문"이라고 안내해야 한다.
- 공식 문서 예시의 `anthropic-version` 값이 `2026-10-21`로 바뀌었다(구 예시는 `2023-06-01`). 구현 시점에 최신 값을 다시 확인한다. [확인 필요: 구 버전 값 계속 허용 여부]
- 인증 헤더는 `Authorization: Bearer` 권장, `x-api-key`는 legacy 지원. 프리플라이트 허용 헤더 목록은 요청한 헤더를 그대로 돌려주는 형태라 `authorization`도 통과할 것으로 보이나 직접 확인하지 않았다. [확인 필요]

---

## 2. OpenAI

### 판정: 가능 (API 측은 CORS 허용, SDK 측은 opt-in 플래그)

### 공식 근거
- **openai-node README** — https://github.com/openai/openai-node (접근일 2026-11-04)
  - 브라우저 지원은 "disabled by default to avoid exposing your secret API credentials"이고, `dangerouslyAllowBrowser`를 `true`로 명시해야 켜진다.
  - 켜면 "exposes your secret API credentials in the client-side code"라고 경고한다.
- **OpenAI Help Center "Best practices for API key safety"** — https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety (exa 경유로 열람, 접근일 2026-11-04)
  - 3번 항목: "Never deploy your key in client-side environments like browsers or mobile apps." 요청은 항상 자기 백엔드를 거치라고 권고.
  - 키 공유는 이용약관 위반이라고 명시("The sharing of API keys is against the Terms of Use"). BYO-key는 사용자 본인 키를 본인이 쓰는 것이라 공유와는 다르지만, **우리가 키를 받아 저장·중계하면 안 된다**는 근거로 읽는다.
- `api.openai.com`의 CORS 허용을 명시한 공식 API 문서 문장은 찾지 못했다. [확인 필요]

### 실측 (2026-11-04, `Origin: https://example.com`)
- `OPTIONS /v1/chat/completions` → `200`, `access-control-allow-origin: https://example.com`, `access-control-allow-headers: authorization,content-type`.
- `OPTIONS /v1/responses` → `200`, `access-control-allow-origin: *`.
- 무효 키 `POST /v1/responses` → `401 Incorrect API key provided`, `access-control-allow-origin: *`.
- 결론: Anthropic과 달리 **특별한 헤더 없이도** 브라우저 호출이 열려 있다. SDK의 `dangerouslyAllowBrowser`는 SDK 자체의 안전장치일 뿐 서버 쪽 요구가 아니다. 단 이 동작은 문서화된 보장이 아니라 관찰 결과라, 예고 없이 바뀔 수 있다.

### 주의점
- 공식 도움말이 브라우저 배포를 명시적으로 금지하는 어조다. 도구 화면에 "OpenAI는 브라우저 사용을 권장하지 않음"을 그대로 고지한다.
- Realtime API의 브라우저용 단기 토큰(ephemeral key) 문서는 이번에 열지 못했다(404). [확인 필요]

---

## 3. Google Gemini API (Generative Language API)

### 판정: 가능 (실측). 공식 문서는 클라이언트 키 사용을 말리고, 서버 프록시를 권고

### 공식 근거
- **API 키 문서** — https://aistudio.google.com/docs/api-key (구 주소 https://ai.google.dev/gemini-api/docs/api-key 에서 301 이동, 접근일 2026-11-04)
  - "Do not hardcode API keys directly in web or mobile apps."
  - "Keys compiled in client-side code can be extracted by users."
  - "To secure client-side apps, run a backend proxy server to make the actual API calls."
  - "Treat your Gemini API key like a password."
  - 키 제한(origin restrictions)으로 IP·웹사이트·앱을 묶을 수 있다고 안내.
- **Google Gen AI JS SDK README** — https://github.com/googleapis/js-genai (접근일 2026-11-04)
  - "In the browser the initialization code is identical" — 브라우저 초기화를 공식 지원 경로로 문서화.
  - 동시에 "Avoid exposing API keys in client-side code. Use server-side implementations in production environments." 경고를 두 번 둔다.
- **Ephemeral tokens 문서** — https://aistudio.google.com/docs/live-api/ephemeral-tokens (접근일 2026-11-04)
  - "At this time, ephemeral tokens are only compatible with Live API" — 일반 `generateContent`에는 단기 토큰이 없다.
- `generativelanguage.googleapis.com`의 CORS 허용을 명시한 공식 문장은 찾지 못했다. [확인 필요]

### 실측 (2026-11-04, `Origin: https://example.com`)
- `OPTIONS /v1beta/models/gemini-2.0-flash:generateContent` → `200`, `access-control-allow-origin: https://example.com`, 허용 헤더에 `x-goog-api-key`.
- 무효 키 `POST` → `400 API key not valid`, `access-control-allow-origin: https://example.com`.

### 주의점
- Gemini 키는 Google Cloud 프로젝트 키다. 사용자가 다른 Google API까지 열린 키를 넣으면 노출 범위가 Gemini보다 넓어질 수 있다. 사용자에게 "Gemini 전용으로 제한한 키를 쓰라"고 안내한다.
- 공개 노출이 확인된 키를 Google이 자동 차단한다는 설명은 2차 자료에서만 봤다. [확인 필요]

---

## BYO-key 도구 권고안

**결론: 세 공급자 모두 "사용자 본인 키, 브라우저 메모리에서만, 우리 서버를 거치지 않음" 조건에서 허용한다.** 서버에 우리 키를 두고 대신 호출하는 방식은 Phase 0 범위(외부 API·서버 없음) 밖이고 비용·약관 부담이 커서 하지 않는다.

허용 조건 (도구 구현 시 체크리스트):
1. **기본은 LLM 없이 동작.** LLM 기능은 선택 단계로만 둔다(규칙 기반 결과를 먼저 보여준다).
2. **키 저장 기본값은 메모리만.** 탭을 닫으면 사라진다. `localStorage` 저장은 사용자가 체크박스로 직접 고를 때만, 경고 문구와 함께. 쿠키·서버 전송·분석 도구 전송 금지.
3. **우리 도메인을 거치지 않는다.** `fetch`는 공급자 엔드포인트로 직접. Cloudflare Worker 프록시를 두지 않는다(Anthropic 문서상 Origin을 그대로 넘기면 어차피 막힌다).
4. **CSP `connect-src`를 세 공급자 도메인으로 좁힌다**: `https://api.anthropic.com https://api.openai.com https://generativelanguage.googleapis.com`. 서드파티 스크립트(광고·분석)는 키 입력 페이지에 싣지 않는다. 키를 읽을 수 있는 스크립트를 줄이는 것이 핵심이다.
5. **화면 고지 3줄**: "키는 브라우저 밖으로 나가지 않습니다 / 지출 한도와 짧은 만료일을 건 키를 쓰세요 / 공용 PC에서는 쓰지 마세요". Anthropic은 키 생성 시 3시간~30일 만료를 고를 수 있다(Authentication 문서 "Key expiration").
6. **공급자별 오류 안내**: Anthropic의 `CORS requests are not allowed for this Organization`(ZDR·Compliance 조직), OpenAI 401, Gemini 400 `API key not valid`를 각각 쉬운 문장으로 바꿔 보여준다.
7. **헤더 정확히**: Anthropic만 `anthropic-dangerous-direct-browser-access: true`와 `anthropic-version` 필수. 공식 SDK를 번들에 넣지 않고 `fetch` 직접 호출로 번들 크기를 줄이는 쪽을 권장(2차 자료에 SDK 번들 문제 보고가 있으나 직접 확인 안 함 [확인 필요]).

공급자별 허용 수준:

| 공급자 | 권고 | 이유 |
|---|---|---|
| Anthropic | 허용 | 공식 문서가 헤더 방식을 명시하고 예외 조건까지 설명해 동작 예측이 가장 쉽다 |
| OpenAI | 허용(고지 강화) | 동작은 되지만 공식 도움말이 브라우저 배포를 금지하는 어조라 고지를 더 크게 둔다. CORS 허용이 문서 보장이 아니다 |
| Gemini | 허용(키 제한 안내) | SDK가 브라우저를 지원하지만 프로젝트 키라 노출 범위가 넓을 수 있다. API 제한 키 사용을 안내한다 |

## 근거 URL 목록 (모두 2026-11-04 접근)
- https://platform.claude.com/docs/en/manage-claude/authentication
- https://platform.claude.com/docs/en/cli-sdks-libraries/sdks/typescript
- https://github.com/anthropics/anthropic-sdk-typescript
- https://github.com/anthropics/anthropic-sdk-typescript/pull/504
- https://support.claude.com/en/articles/9767949-api-key-best-practices-keeping-your-keys-safe-and-secure
- https://simonwillison.net/2024/Aug/23/anthropic-dangerous-direct-browser-access/ (2차)
- https://github.com/openai/openai-node
- https://help.openai.com/en/articles/5112595-best-practices-for-api-key-safety
- https://aistudio.google.com/docs/api-key
- https://github.com/googleapis/js-genai
- https://aistudio.google.com/docs/live-api/ephemeral-tokens
- 실측 명령: `curl -X OPTIONS <endpoint> -H "Origin: https://example.com" -H "Access-Control-Request-Method: POST" -H "Access-Control-Request-Headers: ..."` 및 무효 키 POST
