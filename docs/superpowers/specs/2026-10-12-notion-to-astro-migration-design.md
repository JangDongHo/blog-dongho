# Notion → Astro 블로그 이전 설계

작성일: 2026-10-12

## 목표

- 구 블로그(`dongho-blog`, Notion DB 기반 Next.js, Vercel)의 **모든 글**을 새 블로그(`blog-dongho`, Astro, Netlify, `dongho.me`)로 이전한다.
- 이전 후 Notion 없이 마크다운만으로 운영한다.
- 구 도메인 `dongho-blog.kro.kr`의 모든 기존 링크는 `dongho.me`의 대응 글로 301 리디렉션된다.

## 확정된 결정

| 항목 | 결정 |
|---|---|
| 이전 범위 | Notion DB 전체 (비공개·초안 없음, 필터링 불필요) |
| 새 블로그 배포 | Netlify (`dongho.me`) |
| 새 글 URL | `/posts/<한글 제목 slug>` |
| 구 글 URL | `/posts/<Notion 페이지 UUID>` |
| 이전 방식 | Notion API → 마크다운 변환 일회성 스크립트 (`@notionhq/client` + `notion-to-md`) |
| 리디렉션 | `kro.kr`은 DNS만 제공하므로, 현재 구 도메인을 서빙하는 Vercel 프로젝트를 리디렉션 전용으로 축소 |

## 구성 요소

### 1. 이전 스크립트 `scripts/migrate-notion.mjs` (blog-dongho)

- 입력: 환경변수 `NOTION_API_KEY`, `NOTION_DATABASE_ID` (구 블로그 `.env.local`과 동일 값, 커밋하지 않는다).
- 목록 조회: `databases.retrieve` → `data_sources[0].id` → `dataSources.query`를 커서로 순회한다. 구 블로그의 방식과 동일하다.
- 속성: `이름`(제목), `생성일`(날짜). 그 외 속성(태그 등)이 DB에 있으면 실행 시 목록을 출력하고 frontmatter 반영 여부를 사용자가 정한다.
- 레이트 리미터: 2 req/s, 429는 `Retry-After` 기준으로 재시도 (구 블로그 `src/lib/notion.ts`의 `NotionRateLimiter`·`notionFetch` 로직 재사용).
- 출력:
  - `src/content/posts/<slug>.md` — frontmatter: `title`, `date`, `description`, (있으면) `tags`.
  - `src/content/posts/attachments/<slug>/…` — 본문 이미지.
  - `scripts/migration-map.json` — `{ notionId, title, slug, date }[]`. 리디렉션 생성의 입력이다.
  - `scripts/migration-report.md` — 변환 못 한 블록, 중복 slug, 이미지 다운로드 실패 목록.
- 재실행 가능해야 한다. 같은 입력이면 같은 출력을 만든다 (slug 충돌 처리 순서는 `생성일` 오름차순으로 고정).

### 2. slug 규칙

- 제목 앞뒤 공백 제거 → 연속 공백은 `-` 하나로 → `/ \ ? # % : * " < > |` 와 제어 문자는 제거.
- 한글·영문·숫자·하이픈만 남긴다. 결과가 비면 `post-<생성일>`을 쓴다.
- 중복은 `생성일` 오름차순으로 먼저 온 글이 원본을 가지고 이후 글에 `-2`, `-3`을 붙인다.
- `migration-map.json`에는 원본 slug와 퍼센트 인코딩된 slug를 모두 기록한다. 리디렉션 목적지에는 인코딩된 값을 쓴다.
- 생성된 slug 목록은 커밋 전에 사용자가 검토한다.

### 3. 본문 변환

- 이미지: Notion의 만료형 S3 URL을 남기지 않는다. 모두 내려받아 `attachments/<slug>/`에 저장하고 본문은 상대 경로로 치환한다. 다운로드 실패는 리포트에 남기고 이전을 중단하지 않는다.
- 블록 매핑: 콜아웃은 테마의 콜아웃 문법, 수식은 `$…$`/`$$…$$`(KaTeX), 코드 블록은 언어 태그 유지, 토글은 `<details>`.
- 변환이 안 되는 블록(임베드, 하위 페이지, DB 뷰 등)은 자리표시자로 남기고 리포트에 페이지·블록 타입을 기록해 수동으로 고친다.
- `description`은 본문 첫 문단에서 160자 이내로 추출한다.

### 4. 새 블로그 정리

- 삭제: 테마 샘플 글(`formatting-reference`, `getting-started`, `obsidian-embeds-demo`, `vault-cms-guide`, `sample-folder-based-post`), `docs`·`projects` 샘플 콘텐츠.
- 설정: `src/config.ts`의 `site`를 `https://dongho.me`로, 사이트 제목·설명·프로필을 개인 정보로 교체. `astro.config.mjs`의 샘플 리디렉션과 `netlify.toml`의 샘플 리디렉션 블록 삭제.
- 배포 설정: Netlify 전용이므로 `wrangler.toml`, `.assetsignore.template` 제거.
- 이전: 구 블로그의 `/about` 내용을 `src/content/pages/about.md`로 옮긴다. 댓글은 이전 대상이 아니다.
- 호환: `/feed.xml`(RSS), sitemap, robots가 새 블로그에서 같은 경로로 제공되는지 확인한다.

### 5. 리디렉션 (구 블로그 레포 `dongho-blog`)

- 앱 코드(Next.js, Notion 연동, 환경변수)를 제거하고 `vercel.json`만 남긴다.
- `scripts/migration-map.json`에서 생성하는 규칙:
  1. `/posts/<uuid>` → `https://dongho.me/posts/<인코딩된 slug>` (301, 글마다 한 줄. UUID는 하이픈 있는 형태와 없는 형태를 모두 등록)
  2. `/posts/:path*` 중 매핑 없는 경로 → `https://dongho.me/` (301)
  3. `/about`, `/feed.xml`, `/sitemap.xml` → 동일 경로로 `https://dongho.me` (301)
  4. 그 외 `/:path*` → `https://dongho.me/:path*` (301)
- 규칙 수가 Vercel `redirects` 한도(2048) 안에 들어오는지 생성 시 검증한다. 넘으면 `middleware`/`bulk redirects`로 전환한다.

## 전환 순서

순서를 바꾸면 안 된다. 새 블로그가 먼저 떠 있어야 리디렉션이 404로 가지 않는다.

1. `blog-dongho`: 이전 스크립트 실행, 로컬 빌드, 샘플 검수 (글 수가 Notion DB와 일치, 이미지·수식·코드 블록 확인).
2. `blog-dongho`: Netlify에 배포하고 `https://dongho.me`에서 모든 글이 200인지 확인.
3. `dongho-blog`: 리디렉션 전용으로 교체하고 Vercel에 배포.
4. 검증: `migration-map.json`의 모든 구 URL에 `curl -I`를 보내 301이고 `Location` 대상이 200인지 전수 확인.
5. Google Search Console에 `dongho.me`를 등록하고 sitemap을 제출한다. 구 도메인에는 주소 변경 도구를 사용한다.

## 성공 기준

- `src/content/posts`의 글 수 = Notion DB의 글 수.
- 마이그레이션 리포트에 해결되지 않은 블록·이미지 실패가 0건이다 (또는 모두 수동 처리 완료).
- 구 URL 전수 검사에서 301 + 목적지 200이 100%다.
- `dongho-blog.kro.kr`의 임의 경로가 404 없이 `dongho.me`로 이동한다.

## 범위 밖

- 새 테마의 디자인 변경.
- Notion DB의 삭제나 아카이브 (이전 안정화 후 별도 판단).
- 댓글(giscus) 설정 및 기존 댓글 데이터 이전. 이번 마이그레이션 계획에 포함하지 않는다.
