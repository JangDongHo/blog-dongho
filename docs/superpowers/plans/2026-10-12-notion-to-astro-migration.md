# Notion → Astro 블로그 이전 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Notion DB의 모든 글을 `blog-dongho`(Astro, Netlify, `dongho.me`)의 마크다운으로 이전하고, `dongho-blog.kro.kr`의 모든 기존 링크가 대응하는 새 글로 301 이동하게 한다.

**Architecture:** `blog-dongho`에 일회성 이전 스크립트(`scripts/migrate/`)를 둔다. Notion API로 글 목록과 본문을 읽어 마크다운(+이미지 파일)과 `migration-map.json`을 생성한다. `dongho-blog`는 앱 코드를 걷어내고 `migration-map.json`에서 생성한 `vercel.json` 리디렉션만 남긴 레포로 바꾼다. 순수 로직은 `node:test`로 검증하고, Notion과 네트워크 호출은 주입 가능한 어댑터 뒤에 둔다.

**Tech Stack:** Node 22 (ESM `.mjs`, `node:test`, `--env-file`), `@notionhq/client@^5.6.0`, `notion-to-md@3.1.9`, Astro 7(기존), Vercel `vercel.json` redirects.

**Spec:** `docs/superpowers/specs/2026-10-12-notion-to-astro-migration-design.md`

## Global Constraints

- 두 레포 경로: `/Users/dongho/Desktop/Github/blog-dongho`(새, Astro), `/Users/dongho/Desktop/Github/dongho-blog`(구, Next.js). 이하 `blog-dongho/`, `dongho-blog/`로 표기한다.
- 새 글 URL은 `/posts/<한글 제목 slug>`, 구 글 URL은 `/posts/<Notion 페이지 UUID>`.
- slug: 앞뒤 공백 제거 → 연속 공백은 `-` 하나 → `/ \ ? # % : * " < > |`와 제어 문자 제거 → 한글·영문·숫자·하이픈만 유지. 빈 결과는 `post-<YYYY-MM-DD>`. 중복은 `생성일` 오름차순으로 먼저 온 글이 원본을 갖고 이후 글에 `-2`, `-3`을 붙인다.
- 이전 대상은 Notion DB 전체다. 필터링하지 않는다.
- Notion 요청은 2 req/s로 제한하고 429는 `Retry-After` 기준으로 재시도한다.
- 이미지는 모두 내려받아 `src/content/posts/attachments/<slug>/`에 저장한다. Notion 만료형 URL을 본문에 남기지 않는다.
- 리디렉션 응답은 **301**이다. Vercel의 `permanent: true`는 308이므로 쓰지 않고 `statusCode: 301`을 쓴다. 규칙 수는 2048 이하여야 한다.
- 새 블로그는 Netlify 전용이다. `wrangler.toml`과 Cloudflare 템플릿 파일은 제거한다.
- 댓글(giscus)은 이번 범위에 포함하지 않는다.
- 시크릿(`NOTION_API_KEY`)은 커밋하지 않는다. 스크립트는 `node --env-file=../dongho-blog/.env.local`로 실행한다.
- 테스트는 `node:test`만 쓴다 (새 테스트 프레임워크 추가 금지). 실행: `pnpm test:migrate`.
- 작업은 브랜치에서 한다: `blog-dongho`는 `feat/notion-migration`, `dongho-blog`는 `chore/redirect-only`. `main`에 직접 커밋하지 않는다.
- 전환 순서: 새 블로그 배포 확인 → 구 블로그를 리디렉션 전용으로 배포. 순서를 바꾸지 않는다.

## Review Focus

1. 제목이 이모지나 특수문자뿐이라 slug가 빈 글 → `post-<날짜>`가 되고, 같은 날 둘이면 `-2`가 붙어 서로 덮어쓰지 않는다. (Task 1)
2. 대소문자만 다른 같은 제목(`Redis`/`redis`) → macOS 파일시스템에서 덮어쓰지 않도록 서로 다른 slug가 된다. (Task 1)
3. 제목·설명에 `"`, `:`, `#`, 개행이 있어도 frontmatter가 유효한 YAML이라 Astro 빌드가 깨지지 않는다. (Task 2, 5)
4. 이미지 다운로드가 403/만료/확장자 불명이어도 글은 쓰이고, 리포트에 URL이 남고, 본문은 원본 URL을 유지한다. (Task 5)
5. 이전 스크립트를 두 번 실행하면(제목이 바뀐 글 포함) 이전 실행의 `.md`와 이미지 디렉터리가 남지 않고, 글 수가 중복으로 늘지 않는다. (Task 5)

`생성일`이 비어 있는 글(→ `created_time`으로 대체하고 리포트에 기록)은 Task 4와 Task 5의 테스트가 함께 다룬다.

---

## File Structure

`blog-dongho/` (새 블로그):

| 파일 | 책임 |
|---|---|
| `scripts/migrate/slug.mjs` | 제목→slug 변환, 중복 해소, 인코딩된 slug 생성 (순수) |
| `scripts/migrate/content.mjs` | frontmatter 생성, description 추출, 이미지 URL 탐색·치환, 콜아웃 변환, 미지원 블록 탐지 (순수) |
| `scripts/migrate/notion-fetch.mjs` | 속도 제한 + 429 재시도를 가진 `fetch` 래퍼 |
| `scripts/migrate/notion-source.mjs` | Notion API 어댑터: `listPosts`, `getMarkdown`, `listProperties` |
| `scripts/migrate/migrate-notion.mjs` | 오케스트레이션과 CLI (`--dry-run` 지원) |
| `scripts/migrate/*.test.mjs` | 위 모듈의 `node:test` 테스트 |
| `scripts/migration-map.json` | 생성물. `{ notionId, title, slug, encodedSlug, date }[]` |
| `scripts/migration-report.md` | 생성물. 변환 못 한 블록·이미지 실패·날짜 대체 목록 |
| `scripts/verify-build.mjs` | 빌드 결과 검증 (글 수, 이미지 경로, 잔존 Notion URL) |

`dongho-blog/` (구 블로그, 리디렉션 전용으로 축소):

| 파일 | 책임 |
|---|---|
| `scripts/build-redirects.mjs` | `migration-map.json` → `vercel.json` 생성, `buildRedirects` 순수 함수 |
| `scripts/build-redirects.test.mjs` | 리디렉션 규칙 테스트 |
| `scripts/verify-redirects.mjs` | 배포된 도메인에 대한 301·200 전수 검증 |
| `scripts/migration-map.json` | `blog-dongho`에서 복사한 매핑 |
| `vercel.json` | 생성물 |
| `public/index.html` | 정적 빈 출력(배포 요건 충족용) |

---

### Task 1: 브랜치, 테스트 하네스, slug 모듈

**Files:**
- Create: `blog-dongho/scripts/migrate/slug.mjs`
- Test: `blog-dongho/scripts/migrate/slug.test.mjs`
- Modify: `blog-dongho/package.json` (scripts에 `test:migrate`, `migrate:notion` 추가)

**Interfaces:**
- Produces:
  - `slugify(title: string): string`
  - `assignSlugs(entries: { notionId: string, title: string, date: string }[]): { notionId, title, date, slug: string, encodedSlug: string }[]` — `date` 오름차순(같으면 `notionId` 오름차순)으로 정렬해 반환한다. 입력의 다른 필드는 그대로 유지한다.

- [ ] **Step 1: 브랜치 생성과 문서 커밋**

```bash
cd /Users/dongho/Desktop/Github/blog-dongho
git switch -c feat/notion-migration
git add docs/superpowers
git commit -m "📝 Docs: Notion → Astro 이전 설계와 구현 계획 추가"
```

- [ ] **Step 2: package.json에 스크립트 추가**

`blog-dongho/package.json`의 `scripts`에서 `"test"` 줄 바로 위에 두 줄을 추가한다.

```json
    "test:migrate": "node --test scripts/migrate/*.test.mjs",
    "migrate:notion": "node scripts/migrate/migrate-notion.mjs",
```

- [ ] **Step 3: 실패하는 테스트 작성**

`blog-dongho/scripts/migrate/slug.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { slugify, assignSlugs } from './slug.mjs';

test('공백은 하이픈 하나로, 앞뒤 공백은 제거', () => {
  assert.equal(slugify('  Hello   World '), 'Hello-World');
});

test('금지 문자는 제거하고 한글·영문·숫자는 유지', () => {
  assert.equal(slugify('Redis: Sentinel 구성하기?'), 'Redis-Sentinel-구성하기');
  assert.equal(slugify('100% 성공/실패'), '100-성공실패');
});

test('연속 하이픈은 하나로 합치고 가장자리 하이픈은 제거', () => {
  assert.equal(slugify('React 18 -- 새로운 기능'), 'React-18-새로운-기능');
  assert.equal(slugify('-앞뒤-'), '앞뒤');
});

test('이모지·특수문자뿐이면 빈 문자열', () => {
  assert.equal(slugify('😀'), '');
  assert.equal(slugify('???'), '');
});

test('분리형 한글(NFD)도 완성형(NFC)으로 정규화', () => {
  const nfd = '한글'.normalize('NFD');
  assert.equal(slugify(nfd), '한글');
});

test('assignSlugs: 날짜 오름차순으로 먼저 온 글이 원본 slug를 갖는다', () => {
  const out = assignSlugs([
    { notionId: 'b', title: '같은 제목', date: '2024-02-01' },
    { notionId: 'a', title: '같은 제목', date: '2024-01-01' },
  ]);
  assert.deepEqual(out.map((e) => [e.notionId, e.slug]), [
    ['a', '같은-제목'],
    ['b', '같은-제목-2'],
  ]);
});

test('assignSlugs: 대소문자만 다른 제목도 충돌로 취급', () => {
  const out = assignSlugs([
    { notionId: 'a', title: 'Redis', date: '2024-01-01' },
    { notionId: 'b', title: 'redis', date: '2024-01-02' },
  ]);
  assert.deepEqual(out.map((e) => e.slug), ['Redis', 'redis-2']);
});

test('assignSlugs: 빈 slug는 post-<날짜>, 같은 날이면 -2', () => {
  const out = assignSlugs([
    { notionId: 'a', title: '😀', date: '2024-03-01T10:00:00.000+09:00' },
    { notionId: 'b', title: '!!!', date: '2024-03-01T12:00:00.000+09:00' },
  ]);
  assert.deepEqual(out.map((e) => e.slug), ['post-2024-03-01', 'post-2024-03-01-2']);
});

test('assignSlugs: 리터럴 -2 slug와 충돌해도 덮어쓰지 않는다', () => {
  const out = assignSlugs([
    { notionId: 'a', title: 'foo', date: '2024-01-01' },
    { notionId: 'b', title: 'foo-2', date: '2024-01-02' },
    { notionId: 'c', title: 'foo', date: '2024-01-03' },
  ]);
  assert.deepEqual(out.map((e) => e.slug), ['foo', 'foo-2', 'foo-3']);
});

test('assignSlugs: encodedSlug는 퍼센트 인코딩된 값', () => {
  const [e] = assignSlugs([{ notionId: 'a', title: '한글 글', date: '2024-01-01' }]);
  assert.equal(e.slug, '한글-글');
  assert.equal(e.encodedSlug, encodeURIComponent('한글-글'));
});
```

- [ ] **Step 4: 실패 확인**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && pnpm test:migrate`
Expected: FAIL (`Cannot find module './slug.mjs'`)

- [ ] **Step 5: 구현**

`blog-dongho/scripts/migrate/slug.mjs`:

```js
// 허용: 숫자, 영문, 한글 음절·자모, 하이픈. 그 외(금지 문자, 이모지 등)는 제거한다.
const DISALLOWED = /[^0-9A-Za-z가-힣ᄀ-ᇿ㄰-㆏-]/g;

export function slugify(title) {
  return String(title ?? '')
    .normalize('NFC')
    .trim()
    .replace(/\s+/g, '-')
    .replace(DISALLOWED, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function assignSlugs(entries) {
  const sorted = [...entries].sort(
    (a, b) => a.date.localeCompare(b.date) || a.notionId.localeCompare(b.notionId),
  );
  const used = new Set();
  return sorted.map((entry) => {
    const base = slugify(entry.title) || `post-${entry.date.slice(0, 10)}`;
    let slug = base;
    let n = 2;
    // macOS 파일시스템은 대소문자를 구분하지 않으므로 소문자 기준으로 충돌을 판단한다.
    while (used.has(slug.toLowerCase())) slug = `${base}-${n++}`;
    used.add(slug.toLowerCase());
    return { ...entry, slug, encodedSlug: encodeURIComponent(slug) };
  });
}
```

- [ ] **Step 6: 통과 확인**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && pnpm test:migrate`
Expected: PASS (10 tests)

- [ ] **Step 7: 커밋**

```bash
git add package.json scripts/migrate/slug.mjs scripts/migrate/slug.test.mjs
git commit -m "✨ Feat: 한글 제목 slug 생성 모듈 추가"
```

---

### Task 2: 콘텐츠 변환 순수 함수 모듈

**Files:**
- Create: `blog-dongho/scripts/migrate/content.mjs`
- Test: `blog-dongho/scripts/migrate/content.test.mjs`

**Interfaces:**
- Produces:
  - `toDateOnly(iso: string): string` — 앞 10자(`YYYY-MM-DD`).
  - `buildFrontmatter({ title, description, date }): string` — `---` 블록으로 끝나는 줄바꿈 포함 문자열. 값은 `JSON.stringify`로 인용한다.
  - `extractDescription(markdown: string, fallback?: string, max?: number): string` — 기본 `max`는 160.
  - `findImageUrls(markdown: string): string[]` — 중복 제거, 등장 순서 유지. `http(s)` 이미지만.
  - `replaceImageUrls(markdown: string, urlMap: Map<string, string>): string`
  - `imageKey(url: string): string` — 쿼리를 뗀 `origin + pathname` (서명 URL 중복 제거용).
  - `extensionFor(contentType: string | null, url: string): string | null`
  - `richTextToMarkdown(richText: any[]): string`
  - `calloutToMarkdown(callout: any): string`
  - `findUnsupported(mdBlocks: any[]): { type: string, blockId: string }[]`

- [ ] **Step 1: 실패하는 테스트 작성**

`blog-dongho/scripts/migrate/content.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  toDateOnly,
  buildFrontmatter,
  extractDescription,
  findImageUrls,
  replaceImageUrls,
  imageKey,
  extensionFor,
  richTextToMarkdown,
  calloutToMarkdown,
  findUnsupported,
} from './content.mjs';

test('toDateOnly: 시간·타임존을 제거', () => {
  assert.equal(toDateOnly('2024-01-05T23:30:00.000+09:00'), '2024-01-05');
  assert.equal(toDateOnly('2024-01-05'), '2024-01-05');
});

test('buildFrontmatter: 따옴표·콜론·#·개행이 있어도 JSON 인용으로 안전', () => {
  const fm = buildFrontmatter({
    title: 'Redis: "센티넬" #1',
    description: '첫 줄\n둘째 줄',
    date: '2024-01-05',
  });
  assert.equal(
    fm,
    '---\ntitle: "Redis: \\"센티넬\\" #1"\ndescription: "첫 줄\\n둘째 줄"\ndate: 2024-01-05\n---\n',
  );
});

test('extractDescription: 제목·코드·이미지를 건너뛰고 첫 문단을 평문으로', () => {
  const md = '# 제목\n\n![img](https://x/a.png)\n\n```js\nconst a = 1\n```\n\n첫 문단입니다 [링크](http://x) **굵게**\n\n두번째 문단';
  assert.equal(extractDescription(md), '첫 문단입니다 링크 굵게');
});

test('extractDescription: 160자(코드포인트)로 자르고, 본문이 비면 fallback', () => {
  const long = '가'.repeat(200);
  assert.equal(Array.from(extractDescription(long)).length, 160);
  assert.equal(extractDescription('', '대체 제목'), '대체 제목');
  assert.equal(extractDescription('# 제목만', '대체 제목'), '대체 제목');
});

test('findImageUrls: http 이미지만, 중복 제거, 순서 유지', () => {
  const md = '![a](https://h/1.png?x=1)\n![b](./local.png)\n![c](https://h/2.jpg)\n![d](https://h/1.png?x=1)';
  assert.deepEqual(findImageUrls(md), ['https://h/1.png?x=1', 'https://h/2.jpg']);
});

test('replaceImageUrls: 매핑된 URL만 치환, alt 유지', () => {
  const md = '![설명](https://h/1.png?x=1) ![다른](https://h/2.jpg)';
  const out = replaceImageUrls(md, new Map([['https://h/1.png?x=1', '/posts/attachments/s/img-01.png']]));
  assert.equal(out, '![설명](/posts/attachments/s/img-01.png) ![다른](https://h/2.jpg)');
});

test('imageKey: 서명 쿼리를 제거', () => {
  assert.equal(imageKey('https://s3.x.com/a/b.png?X-Amz-Signature=1'), 'https://s3.x.com/a/b.png');
});

test('extensionFor: content-type 우선, 없으면 URL 확장자, 모르면 null', () => {
  assert.equal(extensionFor('image/jpeg', 'https://h/a'), 'jpg');
  assert.equal(extensionFor('image/svg+xml; charset=utf-8', 'https://h/a'), 'svg');
  assert.equal(extensionFor('application/octet-stream', 'https://h/a.webp?x=1'), 'webp');
  assert.equal(extensionFor(null, 'https://h/a'), null);
});

test('richTextToMarkdown: 굵게·기울임·코드·취소선·링크', () => {
  const rt = [
    { plain_text: '굵게', annotations: { bold: true } },
    { plain_text: ' 일반 ', annotations: {} },
    { plain_text: '링크', annotations: {}, href: 'https://x.com' },
    { plain_text: 'code', annotations: { code: true } },
  ];
  assert.equal(richTextToMarkdown(rt), '**굵게** 일반 [링크](https://x.com)`code`');
});

test('calloutToMarkdown: 이모지 아이콘과 여러 줄', () => {
  const callout = {
    icon: { type: 'emoji', emoji: '💡' },
    rich_text: [{ plain_text: '첫 줄\n둘째 줄', annotations: {} }],
  };
  assert.equal(calloutToMarkdown(callout), '> [!note]\n> 💡 첫 줄\n> 둘째 줄');
});

test('findUnsupported: 출력이 빈 블록과 주의 대상 타입을 보고', () => {
  const blocks = [
    { type: 'paragraph', blockId: '1', parent: '', children: [] },
    { type: 'embed', blockId: '2', parent: '', children: [] },
    { type: 'child_page', blockId: '3', parent: '[title]', children: [] },
    { type: 'toggle', blockId: '4', parent: '', children: [{ type: 'synced_block', blockId: '5', parent: 'x', children: [] }] },
    { type: 'image', blockId: '6', parent: '![a](u)', children: [] },
  ];
  assert.deepEqual(findUnsupported(blocks), [
    { type: 'embed', blockId: '2' },
    { type: 'child_page', blockId: '3' },
    { type: 'synced_block', blockId: '5' },
  ]);
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && pnpm test:migrate`
Expected: FAIL (`Cannot find module './content.mjs'`)

- [ ] **Step 3: 구현**

`blog-dongho/scripts/migrate/content.mjs`:

```js
export function toDateOnly(iso) {
  return String(iso).slice(0, 10);
}

export function buildFrontmatter({ title, description, date }) {
  return [
    '---',
    `title: ${JSON.stringify(title)}`,
    `description: ${JSON.stringify(description)}`,
    `date: ${date}`,
    '---',
    '',
  ].join('\n');
}

function toPlain(block) {
  return block
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}(>|[-*+]|\d+\.)\s+/gm, '')
    .replace(/[*_`~$]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function extractDescription(markdown, fallback = '', max = 160) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '\n\n')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .split(/\n{2,}/)
    .filter((block) => !/^\s*#{1,6}\s/.test(block))
    .map(toPlain)
    .find((p) => p.length > 0);
  if (!text) return fallback;
  return Array.from(text).slice(0, max).join('');
}

const IMG_RE = /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

export function findImageUrls(markdown) {
  return [...new Set([...markdown.matchAll(IMG_RE)].map((m) => m[2]))];
}

export function replaceImageUrls(markdown, urlMap) {
  return markdown.replace(IMG_RE, (all, alt, url) =>
    urlMap.has(url) ? `![${alt}](${urlMap.get(url)})` : all,
  );
}

export function imageKey(url) {
  const u = new URL(url);
  return u.origin + u.pathname;
}

const TYPE_TO_EXT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/svg+xml': 'svg',
};

export function extensionFor(contentType, url) {
  const type = (contentType ?? '').split(';')[0].trim().toLowerCase();
  if (TYPE_TO_EXT[type]) return TYPE_TO_EXT[type];
  const m = new URL(url).pathname.match(/\.(png|jpe?g|gif|webp|avif|svg)$/i);
  if (!m) return null;
  const ext = m[1].toLowerCase();
  return ext === 'jpeg' ? 'jpg' : ext;
}

export function richTextToMarkdown(richText) {
  return richText
    .map((t) => {
      let s = t.plain_text;
      const a = t.annotations ?? {};
      if (a.code) s = '`' + s + '`';
      if (a.bold) s = `**${s}**`;
      if (a.italic) s = `*${s}*`;
      if (a.strikethrough) s = `~~${s}~~`;
      if (t.href) s = `[${s}](${t.href})`;
      return s;
    })
    .join('');
}

export function calloutToMarkdown(callout) {
  const icon = callout.icon?.type === 'emoji' ? `${callout.icon.emoji} ` : '';
  const lines = (icon + richTextToMarkdown(callout.rich_text)).split('\n');
  return ['> [!note]', ...lines.map((l) => `> ${l}`)].join('\n');
}

// 출력이 비어 있어도 정상인 블록 타입
const EMPTY_OK = new Set([
  'paragraph', 'divider', 'column_list', 'column', 'toggle',
  'bulleted_list_item', 'numbered_list_item', 'to_do', 'quote',
]);
// 출력이 있어도 수동 확인이 필요한 블록 타입
const ALWAYS_REPORT = new Set(['child_page', 'child_database', 'synced_block', 'link_to_page']);

export function findUnsupported(mdBlocks) {
  const found = [];
  const walk = (blocks) => {
    for (const b of blocks) {
      const empty = !b.parent?.trim() && !(b.children?.length);
      if (ALWAYS_REPORT.has(b.type) || (empty && !EMPTY_OK.has(b.type))) {
        found.push({ type: b.type, blockId: b.blockId });
      }
      if (b.children?.length) walk(b.children);
    }
  };
  walk(mdBlocks);
  return found;
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && pnpm test:migrate`
Expected: PASS (slug 10 + content 11 tests)

- [ ] **Step 5: 커밋**

```bash
git add scripts/migrate/content.mjs scripts/migrate/content.test.mjs
git commit -m "✨ Feat: 이전용 콘텐츠 변환 유틸 추가"
```

---

### Task 3: 속도 제한 + 429 재시도 fetch 래퍼

**Files:**
- Create: `blog-dongho/scripts/migrate/notion-fetch.mjs`
- Test: `blog-dongho/scripts/migrate/notion-fetch.test.mjs`

**Interfaces:**
- Produces: `createThrottledFetch(baseFetch, options?): (input, init?) => Promise<Response>`
  - `options`: `{ requestsPerSecond = 2, maxRetries = 4, sleep = (ms) => Promise, now = Date.now }`
  - 요청 간 간격은 `ceil(1000 / requestsPerSecond)` ms. 응답 `status === 429`면 `Retry-After`(초)를 기다린 뒤 재시도하고, 헤더가 없으면 `5000 * (attempt + 1)` ms를 기다린다. `maxRetries`를 넘기면 마지막 429 응답을 그대로 반환한다.

- [ ] **Step 1: 실패하는 테스트 작성**

`blog-dongho/scripts/migrate/notion-fetch.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createThrottledFetch } from './notion-fetch.mjs';

function harness(statuses, headers = {}) {
  let t = 10_000;
  const slept = [];
  const calls = [];
  const sleep = async (ms) => { slept.push(ms); t += ms; };
  const now = () => t;
  const baseFetch = async (url) => {
    calls.push(url);
    const status = statuses[Math.min(calls.length - 1, statuses.length - 1)];
    return { status, headers: { get: (k) => headers[k.toLowerCase()] ?? null } };
  };
  return { sleep, now, baseFetch, slept, calls };
}

test('연속 요청 사이에 최소 간격(500ms)을 둔다', async () => {
  const h = harness([200]);
  const f = createThrottledFetch(h.baseFetch, { requestsPerSecond: 2, sleep: h.sleep, now: h.now });
  await f('a');
  await f('b');
  assert.deepEqual(h.slept, [500]);
  assert.deepEqual(h.calls, ['a', 'b']);
});

test('429는 Retry-After(초)만큼 기다린 뒤 재시도', async () => {
  const h = harness([429, 429, 200], { 'retry-after': '1' });
  const f = createThrottledFetch(h.baseFetch, { sleep: h.sleep, now: h.now });
  const res = await f('a');
  assert.equal(res.status, 200);
  assert.equal(h.calls.length, 3);
  assert.deepEqual(h.slept.filter((ms) => ms >= 1000), [1000, 1000]);
});

test('Retry-After가 없으면 5초 * (시도 횟수 + 1)', async () => {
  const h = harness([429, 200]);
  const f = createThrottledFetch(h.baseFetch, { sleep: h.sleep, now: h.now });
  await f('a');
  assert.deepEqual(h.slept.filter((ms) => ms >= 1000), [5000]);
});

test('maxRetries를 넘기면 마지막 429 응답을 반환', async () => {
  const h = harness([429]);
  const f = createThrottledFetch(h.baseFetch, { maxRetries: 2, sleep: h.sleep, now: h.now });
  const res = await f('a');
  assert.equal(res.status, 429);
  assert.equal(h.calls.length, 3);
});

test('429가 아닌 오류 응답은 재시도하지 않는다', async () => {
  const h = harness([500]);
  const f = createThrottledFetch(h.baseFetch, { sleep: h.sleep, now: h.now });
  const res = await f('a');
  assert.equal(res.status, 500);
  assert.equal(h.calls.length, 1);
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && node --test scripts/migrate/notion-fetch.test.mjs`
Expected: FAIL (`Cannot find module './notion-fetch.mjs'`)

- [ ] **Step 3: 구현**

`blog-dongho/scripts/migrate/notion-fetch.mjs`:

```js
const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createThrottledFetch(baseFetch, options = {}) {
  const {
    requestsPerSecond = 2,
    maxRetries = 4,
    sleep = defaultSleep,
    now = Date.now,
  } = options;
  const interval = Math.ceil(1000 / requestsPerSecond);
  let nextSlot = 0;

  async function waitTurn() {
    const slot = Math.max(now(), nextSlot);
    nextSlot = slot + interval;
    const wait = slot - now();
    if (wait > 0) await sleep(wait);
  }

  return async function throttledFetch(input, init) {
    for (let attempt = 0; ; attempt++) {
      await waitTurn();
      const res = await baseFetch(input, init);
      if (res.status !== 429 || attempt >= maxRetries) return res;
      const retryAfter = Number(res.headers.get('retry-after'));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 5000 * (attempt + 1);
      console.warn(`Notion 429: ${waitMs}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
      await sleep(waitMs);
    }
  };
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && pnpm test:migrate`
Expected: PASS (전체)

- [ ] **Step 5: 커밋**

```bash
git add scripts/migrate/notion-fetch.mjs scripts/migrate/notion-fetch.test.mjs
git commit -m "✨ Feat: Notion 요청 속도 제한 및 429 재시도 fetch 래퍼 추가"
```

---

### Task 4: Notion 소스 어댑터

**Files:**
- Create: `blog-dongho/scripts/migrate/notion-source.mjs`
- Modify: `blog-dongho/package.json`, `blog-dongho/pnpm-lock.yaml` (의존성 추가)

**Interfaces:**
- Consumes: `createThrottledFetch` (Task 3), `calloutToMarkdown`, `findUnsupported` (Task 2).
- Produces: `createNotionSource({ apiKey: string, databaseId: string }): Source`, where
  - `Source.listPosts(): Promise<{ notionId: string, title: string, date: string, dateFallback: boolean }[]>` — `date`는 `생성일`의 `start`, 없으면 페이지 `created_time`이고 이때 `dateFallback: true`.
  - `Source.getMarkdown(notionId: string): Promise<{ markdown: string, unsupported: { type: string, blockId: string }[] }>`
  - `Source.listProperties(): Promise<{ name: string, type: string }[]>`

이 모듈은 외부 API 어댑터라 단위 테스트 대신 Task 6의 `--dry-run` 실행으로 검증한다.

- [ ] **Step 1: 의존성 설치와 API 확인**

```bash
cd /Users/dongho/Desktop/Github/blog-dongho
pnpm add -D @notionhq/client@^5.6.0 notion-to-md@3.1.9
grep -n "fetch" node_modules/@notionhq/client/build/src/Client.d.ts | head
ls node_modules/@notionhq/client/build/src/api-endpoints.d.ts && grep -n "dataSources\|data_source" node_modules/@notionhq/client/build/src/Client.d.ts | head
```

Expected: `ClientOptions`에 `fetch` 옵션이 보이고 `dataSources.query`/`dataSources.retrieve`가 존재한다. 없다면 설치된 버전의 타입 정의에 맞춰 Step 2의 호출을 조정한다 (구 블로그 `dongho-blog/src/lib/notion.ts`가 같은 `@notionhq/client@^5.6.0`에서 `databases.retrieve` + `dataSources.query`를 쓰고 있다).

- [ ] **Step 2: 구현**

`blog-dongho/scripts/migrate/notion-source.mjs`:

```js
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';
import { createThrottledFetch } from './notion-fetch.mjs';
import { calloutToMarkdown, findUnsupported } from './content.mjs';

export function createNotionSource({ apiKey, databaseId }) {
  if (!apiKey) throw new Error('NOTION_API_KEY가 설정되지 않았습니다.');
  if (!databaseId) throw new Error('NOTION_DATABASE_ID가 설정되지 않았습니다.');

  const client = new Client({
    auth: apiKey,
    fetch: createThrottledFetch(globalThis.fetch.bind(globalThis)),
  });
  const n2m = new NotionToMarkdown({
    notionClient: client,
    config: { parseChildPages: false },
  });
  n2m.setCustomTransformer('callout', async (block) => calloutToMarkdown(block.callout));

  let dataSourceId;
  async function getDataSourceId() {
    if (dataSourceId) return dataSourceId;
    const db = await client.databases.retrieve({ database_id: databaseId });
    if (!db.data_sources?.length) throw new Error('데이터베이스에 data source가 없습니다.');
    dataSourceId = db.data_sources[0].id;
    return dataSourceId;
  }

  return {
    async listPosts() {
      const id = await getDataSourceId();
      const posts = [];
      let cursor;
      do {
        const res = await client.dataSources.query({
          data_source_id: id,
          start_cursor: cursor,
          page_size: 100,
        });
        for (const page of res.results) {
          const props = page.properties;
          const title = (props['이름']?.title ?? []).map((t) => t.plain_text).join('') || '제목 없음';
          const raw = props['생성일'];
          const start = raw?.date?.start ?? raw?.created_time;
          posts.push({
            notionId: page.id,
            title,
            date: start ?? page.created_time,
            dateFallback: !start,
          });
        }
        cursor = res.has_more ? res.next_cursor : undefined;
      } while (cursor);
      return posts;
    },

    async getMarkdown(notionId) {
      const mdBlocks = await n2m.pageToMarkdown(notionId);
      const markdown = n2m.toMarkdownString(mdBlocks).parent ?? '';
      return { markdown, unsupported: findUnsupported(mdBlocks) };
    },

    async listProperties() {
      const id = await getDataSourceId();
      const ds = await client.dataSources.retrieve({ data_source_id: id });
      return Object.entries(ds.properties).map(([name, p]) => ({ name, type: p.type }));
    },
  };
}
```

- [ ] **Step 3: 로드 확인 (네트워크 호출 없음)**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && node -e "import('./scripts/migrate/notion-source.mjs').then(m => console.log(typeof m.createNotionSource))"`
Expected: `function`

- [ ] **Step 4: 커밋**

```bash
git add package.json pnpm-lock.yaml scripts/migrate/notion-source.mjs
git commit -m "✨ Feat: Notion 소스 어댑터 추가"
```

---

### Task 5: 이전 오케스트레이터와 CLI

**Files:**
- Create: `blog-dongho/scripts/migrate/migrate-notion.mjs`
- Test: `blog-dongho/scripts/migrate/migrate-notion.test.mjs`

**Interfaces:**
- Consumes: `assignSlugs` (Task 1); `buildFrontmatter`, `extractDescription`, `findImageUrls`, `replaceImageUrls`, `imageKey`, `extensionFor`, `toDateOnly` (Task 2); `createNotionSource` (Task 4, CLI 경로에서만).
- Produces:
  - `migrate({ source, postsDir, mapPath, reportPath, fetchImpl?, log? }): Promise<{ entries, report }>`
  - `renderReport(report: Report, total: number): string`
  - 파일 규칙: `<postsDir>/<slug>.md`, 이미지는 `<postsDir>/attachments/<slug>/img-NN.<ext>`, 본문 이미지 URL은 `/posts/attachments/<encodeURIComponent(slug)>/img-NN.<ext>`.
  - `Report`: `{ unsupported: {title,type,blockId}[], imageFailures: {title,url,reason}[], dateFallbacks: {title,date}[], emptyBodies: {title}[] }`
  - 이전 실행의 `mapPath`가 있으면 그 항목의 `<slug>.md`와 `attachments/<slug>/`를 먼저 삭제한다 (재실행 멱등성).

- [ ] **Step 1: 실패하는 테스트 작성**

`blog-dongho/scripts/migrate/migrate-notion.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { migrate } from './migrate-notion.mjs';

const ID = (n) => `aaaaaaaa-0000-0000-0000-00000000000${n}`;

function fakeFetch(url) {
  if (String(url).includes('bad.png')) {
    return Promise.resolve({ ok: false, status: 403, headers: { get: () => null }, arrayBuffer: async () => new ArrayBuffer(0) });
  }
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: { get: (h) => (h.toLowerCase() === 'content-type' ? 'image/png' : null) },
    arrayBuffer: async () => new Uint8Array([137, 80, 78, 71]).buffer,
  });
}

function makeSource(posts) {
  return {
    async listPosts() {
      return posts.map(({ markdown, unsupported, ...rest }) => rest);
    },
    async getMarkdown(id) {
      const p = posts.find((x) => x.notionId === id);
      return { markdown: p.markdown, unsupported: p.unsupported ?? [] };
    },
  };
}

async function setup() {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'migrate-'));
  const postsDir = path.join(dir, 'posts');
  await fs.mkdir(postsDir, { recursive: true });
  return {
    dir,
    postsDir,
    mapPath: path.join(dir, 'migration-map.json'),
    reportPath: path.join(dir, 'migration-report.md'),
  };
}

const POSTS = [
  {
    notionId: ID(1), title: 'Redis: 센티넬 "구성"', date: '2024-01-05', dateFallback: false,
    markdown: '# 개요\n\n본문 첫 문단\n\n![a](https://img.test/a.png?sig=1)\n![b](https://img.test/bad.png)',
  },
  { notionId: ID(2), title: 'Redis: 센티넬 "구성"', date: '2024-02-01', dateFallback: false, markdown: '두 번째 글' },
  {
    notionId: ID(3), title: '😀', date: '2024-03-01T10:00:00.000+09:00', dateFallback: true,
    markdown: '', unsupported: [{ type: 'embed', blockId: 'blk-1' }],
  },
];

test('migrate: 파일·이미지·매핑·리포트를 생성한다', async () => {
  const t = await setup();
  const { entries } = await migrate({
    source: makeSource(POSTS), postsDir: t.postsDir, mapPath: t.mapPath, reportPath: t.reportPath,
    fetchImpl: fakeFetch, log: () => {},
  });

  assert.deepEqual(entries.map((e) => e.slug), ['Redis-센티넬-구성', 'Redis-센티넬-구성-2', 'post-2024-03-01']);

  const first = await fs.readFile(path.join(t.postsDir, 'Redis-센티넬-구성.md'), 'utf8');
  assert.match(first, /^---\ntitle: "Redis: 센티넬 \\"구성\\""\n/);
  assert.match(first, /description: "본문 첫 문단"\ndate: 2024-01-05\n---\n/);
  const enc = encodeURIComponent('Redis-센티넬-구성');
  assert.ok(first.includes(`![a](/posts/attachments/${enc}/img-01.png)`));
  assert.ok(first.includes('![b](https://img.test/bad.png)'));
  const img = await fs.readFile(path.join(t.postsDir, 'attachments', 'Redis-센티넬-구성', 'img-01.png'));
  assert.equal(img.length, 4);

  const third = await fs.readFile(path.join(t.postsDir, 'post-2024-03-01.md'), 'utf8');
  assert.match(third, /title: "😀"\ndescription: "😀"\ndate: 2024-03-01\n/);

  const map = JSON.parse(await fs.readFile(t.mapPath, 'utf8'));
  assert.equal(map.length, 3);
  assert.deepEqual(Object.keys(map[0]).sort(), ['date', 'encodedSlug', 'notionId', 'slug', 'title']);
  assert.equal(map[0].encodedSlug, enc);

  const report = await fs.readFile(t.reportPath, 'utf8');
  assert.match(report, /bad\.png/);
  assert.match(report, /HTTP 403/);
  assert.match(report, /embed/);
  assert.match(report, /생성일 없음|created_time/);
});

test('migrate: 재실행하면 이전 실행의 파일이 남지 않는다', async () => {
  const t = await setup();
  const args = {
    postsDir: t.postsDir, mapPath: t.mapPath, reportPath: t.reportPath,
    fetchImpl: fakeFetch, log: () => {},
  };
  await migrate({ ...args, source: makeSource(POSTS) });

  const renamed = POSTS.map((p, i) => (i === 0 ? { ...p, title: '제목이 바뀐 글' } : p));
  await migrate({ ...args, source: makeSource(renamed) });

  const files = (await fs.readdir(t.postsDir)).filter((f) => f.endsWith('.md')).sort();
  // 제목이 바뀐 글(날짜가 가장 이른 글)은 새 slug를 갖고, 같은 제목이던 두 번째 글은 원본 slug를 이어받는다.
  assert.deepEqual(files, ['Redis-센티넬-구성.md', 'post-2024-03-01.md', '제목이-바뀐-글.md']);
  const attachments = await fs.readdir(path.join(t.postsDir, 'attachments'));
  assert.deepEqual(attachments, ['제목이-바뀐-글']);
});
```

- [ ] **Step 2: 실패 확인**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && node --test scripts/migrate/migrate-notion.test.mjs`
Expected: FAIL (`Cannot find module './migrate-notion.mjs'`)

- [ ] **Step 3: 구현**

`blog-dongho/scripts/migrate/migrate-notion.mjs`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { assignSlugs } from './slug.mjs';
import {
  buildFrontmatter,
  extractDescription,
  findImageUrls,
  replaceImageUrls,
  imageKey,
  extensionFor,
  toDateOnly,
} from './content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

async function readJsonIfExists(file) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return null;
  }
}

async function removePrevious(postsDir, previousMap) {
  for (const { slug } of previousMap ?? []) {
    await fs.rm(path.join(postsDir, `${slug}.md`), { force: true });
    await fs.rm(path.join(postsDir, 'attachments', slug), { recursive: true, force: true });
  }
}

async function localizeImages({ markdown, slug, title, postsDir, fetchImpl, report }) {
  const urlMap = new Map();
  const byKey = new Map();
  let n = 0;
  for (const url of findImageUrls(markdown)) {
    const key = imageKey(url);
    if (byKey.has(key)) {
      urlMap.set(url, byKey.get(key));
      continue;
    }
    try {
      const res = await fetchImpl(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ext = extensionFor(res.headers.get('content-type'), url);
      if (!ext) throw new Error('알 수 없는 이미지 형식');
      const name = `img-${String(++n).padStart(2, '0')}.${ext}`;
      const dir = path.join(postsDir, 'attachments', slug);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, name), Buffer.from(await res.arrayBuffer()));
      const publicUrl = `/posts/attachments/${encodeURIComponent(slug)}/${name}`;
      byKey.set(key, publicUrl);
      urlMap.set(url, publicUrl);
    } catch (err) {
      report.imageFailures.push({ title, url: key, reason: err.message });
    }
  }
  return replaceImageUrls(markdown, urlMap);
}

export function renderReport(report, total) {
  const section = (heading, rows, fmt) =>
    [`## ${heading} (${rows.length})`, '', ...(rows.length ? rows.map(fmt) : ['없음']), ''].join('\n');
  return [
    '# 마이그레이션 리포트',
    '',
    `총 ${total}개 글`,
    '',
    section('수동 확인이 필요한 블록', report.unsupported, (r) => `- ${r.title} — \`${r.type}\` (block ${r.blockId})`),
    section('이미지 다운로드 실패', report.imageFailures, (r) => `- ${r.title} — ${r.url} (${r.reason})`),
    section('생성일 없음 → created_time으로 대체', report.dateFallbacks, (r) => `- ${r.title} → ${r.date}`),
    section('본문이 비어 있는 글', report.emptyBodies, (r) => `- ${r.title}`),
  ].join('\n');
}

export async function migrate({
  source, postsDir, mapPath, reportPath, fetchImpl = globalThis.fetch, log = console.log,
}) {
  const listed = await source.listPosts();
  const entries = assignSlugs(listed);
  const report = { unsupported: [], imageFailures: [], dateFallbacks: [], emptyBodies: [] };

  await removePrevious(postsDir, await readJsonIfExists(mapPath));
  await fs.mkdir(postsDir, { recursive: true });

  for (const [i, entry] of entries.entries()) {
    log(`[${i + 1}/${entries.length}] ${entry.title}`);
    const { markdown: raw, unsupported } = await source.getMarkdown(entry.notionId);
    const date = toDateOnly(entry.date);

    for (const u of unsupported) report.unsupported.push({ title: entry.title, ...u });
    if (entry.dateFallback) report.dateFallbacks.push({ title: entry.title, date });
    if (!raw.trim()) report.emptyBodies.push({ title: entry.title });

    const body = await localizeImages({
      markdown: raw, slug: entry.slug, title: entry.title, postsDir, fetchImpl, report,
    });
    const frontmatter = buildFrontmatter({
      title: entry.title,
      description: extractDescription(raw, entry.title),
      date,
    });
    await fs.writeFile(path.join(postsDir, `${entry.slug}.md`), `${frontmatter}\n${body.trim()}\n`);
  }

  const map = entries.map(({ notionId, title, slug, encodedSlug, date }) => ({
    notionId, title, slug, encodedSlug, date: toDateOnly(date),
  }));
  await fs.writeFile(mapPath, `${JSON.stringify(map, null, 2)}\n`);
  await fs.writeFile(reportPath, renderReport(report, entries.length));
  return { entries, report };
}

async function main() {
  const { createNotionSource } = await import('./notion-source.mjs');
  const source = createNotionSource({
    apiKey: process.env.NOTION_API_KEY,
    databaseId: process.env.NOTION_DATABASE_ID,
  });

  if (process.argv.includes('--dry-run')) {
    console.log('DB 속성:');
    for (const p of await source.listProperties()) console.log(`  - ${p.name} (${p.type})`);
    const entries = assignSlugs(await source.listPosts());
    console.log(`\n총 ${entries.length}개 글. 날짜 | slug | 제목`);
    for (const e of entries) {
      console.log(`${e.date.slice(0, 10)} | ${e.slug} | ${e.title}${e.dateFallback ? '  (생성일 없음)' : ''}`);
    }
    return;
  }

  const { entries, report } = await migrate({
    source,
    postsDir: path.join(ROOT, 'src/content/posts'),
    mapPath: path.join(ROOT, 'scripts/migration-map.json'),
    reportPath: path.join(ROOT, 'scripts/migration-report.md'),
  });
  console.log(
    `\n완료: ${entries.length}개 글, 미지원 블록 ${report.unsupported.length}, 이미지 실패 ${report.imageFailures.length}`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 4: 통과 확인**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && pnpm test:migrate`
Expected: PASS (전체)

테스트의 재실행 시나리오에서 첫 실행의 `Redis-센티넬-구성-2.md`가 두 번째 실행에서 `Redis-센티넬-구성.md`가 되는 점을 확인한다. 이는 정상 동작이며, 리디렉션은 항상 최신 `migration-map.json` 기준으로 생성하므로 문제가 없다.

- [ ] **Step 5: 커밋**

```bash
git add scripts/migrate/migrate-notion.mjs scripts/migrate/migrate-notion.test.mjs
git commit -m "✨ Feat: Notion 이전 오케스트레이터와 CLI 추가"
```

---

### Task 6: 실제 이전 실행과 slug 검토

**Files:**
- Create (생성물): `blog-dongho/src/content/posts/*.md`, `blog-dongho/src/content/posts/attachments/<slug>/*`, `blog-dongho/scripts/migration-map.json`, `blog-dongho/scripts/migration-report.md`

**Interfaces:**
- Consumes: `migrate-notion.mjs` CLI (Task 5). `../dongho-blog/.env.local`의 `NOTION_API_KEY`, `NOTION_DATABASE_ID`.
- Produces: Task 7~10이 쓰는 `scripts/migration-map.json`과 이전된 글.

- [ ] **Step 1: dry-run으로 DB 속성과 slug 목록 확인**

```bash
cd /Users/dongho/Desktop/Github/blog-dongho
node --env-file=../dongho-blog/.env.local scripts/migrate/migrate-notion.mjs --dry-run | tee /tmp/migration-dryrun.txt
```

Expected: `DB 속성:` 아래 속성 목록(`이름`, `생성일`, …)과 `총 N개 글` 및 `날짜 | slug | 제목` 표.

실패 시: `NOTION_API_KEY가 설정되지 않았습니다` → env 파일 경로 확인. `data source가 없습니다` → 통합(integration)이 DB에 연결되어 있는지 확인.

- [ ] **Step 2: 사용자 검토 요청**

dry-run 결과를 사용자에게 보여주고 다음을 확인받는다. 확인 전에는 Step 3으로 가지 않는다.
  1. slug 목록이 괜찮은지 (바꾸고 싶은 글이 있는지).
  2. `이름`·`생성일` 외에 `태그` 등 frontmatter에 반영할 속성이 있는지.
  3. `생성일 없음`으로 표시된 글이 있는지.

slug를 바꾸고 싶다면 Notion의 제목을 고치는 것이 아니라, `scripts/migrate/slug-overrides.json`(`{ "<notionId>": "원하는-slug" }`)을 도입하는 별도 변경이 필요하다. 요청이 있을 때만 `assignSlugs`에 `overrides` 인자를 추가한다. 이 경우 Task 1의 테스트부터 이어서 작성한다.
태그 반영 요청이 있으면 `notion-source.mjs`의 `listPosts`에 `tags` 필드를, `buildFrontmatter`에 `tags` 출력을 추가한다.

- [ ] **Step 3: 이전 실행**

```bash
node --env-file=../dongho-blog/.env.local scripts/migrate/migrate-notion.mjs
```

Expected: `[i/N] 제목`이 순서대로 출력되고 마지막에 `완료: N개 글, 미지원 블록 X, 이미지 실패 Y`.

- [ ] **Step 4: 리포트 검토**

`scripts/migration-report.md`를 열어 미지원 블록과 이미지 실패 목록을 확인한다. 항목이 있으면 해당 글의 `.md`를 수정한다 (이미지는 Notion에서 직접 내려받아 `attachments/<slug>/`에 넣고 URL을 고친다). 수정한 내용은 이후 재실행하면 덮어써지므로, 수동 수정은 마지막 실행 이후에만 한다.

- [ ] **Step 5: 샘플 육안 검수**

글 5개 이상을 골라 원본 Notion 페이지와 대조한다 (코드 블록 언어, 수식, 목록 중첩, 표, 콜아웃, 이미지 위치). 형식이 깨지는 패턴이 반복되면 `notion-source.mjs`의 `setCustomTransformer`로 해당 블록 타입을 고치고 Step 3을 다시 실행한다.

- [ ] **Step 6: 글 수 확인**

```bash
ls src/content/posts/*.md | wc -l
node -e "console.log(require('./scripts/migration-map.json').length)"
```

Expected: 두 수가 같고 Notion DB의 글 수와 일치한다. 현재 샘플 글 5개가 남아 있으면 `.md` 수가 5 더 많다. 이는 Task 7에서 지운다.

- [ ] **Step 7: 커밋**

```bash
git add src/content/posts scripts/migration-map.json scripts/migration-report.md
git commit -m "📦 Content: Notion 글 이전 결과 추가"
```

---

### Task 7: 새 블로그 정리와 설정

**Files:**
- Delete: `src/content/posts/{formatting-reference.md,getting-started.md,obsidian-embeds-demo.md,vault-cms-guide.md}`, `src/content/posts/sample-folder-based-post/`, `src/content/posts/attachments/` 안의 샘플 이미지·PDF, `src/content/docs/*`, `src/content/projects/*`의 샘플 콘텐츠, `wrangler.toml`, `.assetsignore.template`
- Modify: `src/config.ts`, `astro.config.mjs`(샘플 `redirects`), `netlify.toml`(샘플 `[[redirects]]` 블록), `src/content/pages/about.md`, `src/content/special/home.md`
- Create: 없음

**Interfaces:**
- Consumes: Task 6의 이전 결과(`migration-map.json`의 `slug` 목록).
- Produces: 샘플 데이터가 없는 새 블로그 빌드.

- [ ] **Step 1: 삭제 대상 확인**

삭제 전에 이전된 글과 겹치지 않는지 확인한다.

```bash
cd /Users/dongho/Desktop/Github/blog-dongho
node -e "
const slugs = new Set(require('./scripts/migration-map.json').map(e => e.slug));
const samples = ['formatting-reference','getting-started','obsidian-embeds-demo','vault-cms-guide','sample-folder-based-post'];
console.log(samples.filter(s => slugs.has(s)));
"
ls src/content/posts/attachments | head -40
ls src/content/docs src/content/projects
```

Expected: 첫 줄이 `[]`. 샘플 이미지 파일명이 `<slug>/` 디렉터리와 섞여 있으므로 **디렉터리가 아닌 파일**(`*.jpg`, `*.png`, `*.pdf`)만 삭제 대상이다.

- [ ] **Step 2: 샘플 삭제**

```bash
git rm -r src/content/posts/formatting-reference.md src/content/posts/getting-started.md \
  src/content/posts/obsidian-embeds-demo.md src/content/posts/vault-cms-guide.md \
  src/content/posts/sample-folder-based-post
find src/content/posts/attachments -maxdepth 1 -type f -exec git rm -f {} +
git rm -r src/content/docs src/content/projects wrangler.toml .assetsignore.template
mkdir -p src/content/docs src/content/projects
```

`src/content/docs`와 `src/content/projects`는 `content.config.ts`의 `glob` 로더 대상이므로 빈 디렉터리를 남겨 둔다. 빈 디렉터리는 git에 추적되지 않으므로, 빌드 경고가 나면 각각 `.gitkeep`을 추가한다.

- [ ] **Step 3: 사이트 설정 변경**

`src/config.ts`의 아래 항목을 변경한다 (정확한 줄은 `grep -n "site:\|title:\|description:\|author:\|language:" src/config.ts | head`로 확인).

```ts
  site: "https://dongho.me",
  title: "Dongho",                       // 실제 블로그 이름으로 사용자가 확정
  description: "개발 기록 블로그",         // 사용자가 확정
  author: "장동호",
  language: "ko",
```

사이트 제목·설명·프로필 이미지(`public/profile.jpg`)는 사용자에게 확인받고 반영한다. 확인 전에는 `site`와 `language`만 변경한다.

- [ ] **Step 4: 샘플 리디렉션 제거**

`astro.config.mjs`의 `redirects:` 항목은 다음으로 교체한다.

```js
  redirects: {},
```

`netlify.toml`에서 `# Generated redirects from content aliases` 아래의 `[[redirects]]` 블록 중 `from = "/*"`(`/404` 처리) 마지막 블록을 **제외한** 모든 블록을 삭제한다. `scripts/process-aliases.js`가 빌드 때 다시 생성하므로, 이 파일은 `pnpm build` 후 `git diff netlify.toml`로 샘플 규칙이 되살아나지 않았는지 확인한다.

- [ ] **Step 5: about 페이지와 홈 문구 이전**

구 블로그의 소개글을 새 페이지로 옮긴다.

```bash
cat ../dongho-blog/src/app/about/page.tsx
```

출력된 JSX의 본문 텍스트를 `src/content/pages/about.md`로 옮긴다. frontmatter는 아래 형태로 교체하고, 기존 테마 소개 본문은 모두 지운다.

```markdown
---
title: About
description: 장동호 소개
noIndex: false
hideTOC: true
draft: false
---
```

`src/content/special/home.md`의 테마 소개 문구도 개인 블로그용 짧은 소개로 교체한다. 문구는 사용자에게 확인받는다.

- [ ] **Step 6: 빌드 확인**

Run: `cd /Users/dongho/Desktop/Github/blog-dongho && pnpm build 2>&1 | tail -30`
Expected: 오류 없이 종료하고 `dist/`가 생성된다. 콘텐츠 스키마 오류(`title`/`date` 파싱)가 나오면 해당 글의 frontmatter를 확인한다.

- [ ] **Step 7: 커밋**

```bash
git add -A src/content astro.config.mjs netlify.toml src/config.ts
git commit -m "🔧 Chore: 테마 샘플 제거 및 사이트 설정을 dongho.me로 변경"
```

---

### Task 8: 빌드 결과 검증 스크립트

**Files:**
- Create: `blog-dongho/scripts/verify-build.mjs`

**Interfaces:**
- Consumes: `scripts/migration-map.json`, `dist/`, `src/content/posts/*.md`.
- Produces: 종료 코드 0(성공)/1(실패)과 실패 항목 목록. `pnpm build` 이후 실행한다.

- [ ] **Step 1: 스크립트 작성**

`blog-dongho/scripts/verify-build.mjs`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const POSTS = path.join(ROOT, 'src/content/posts');
const failures = [];

const exists = (p) => fs.access(p).then(() => true, () => false);

const map = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/migration-map.json'), 'utf8'));

// 1) 글 수: 마크다운 파일 수 = 매핑 수, 모든 글의 페이지가 빌드됨
const mdFiles = (await fs.readdir(POSTS)).filter((f) => f.endsWith('.md'));
if (mdFiles.length !== map.length) {
  failures.push(`글 수 불일치: .md ${mdFiles.length} / 매핑 ${map.length}`);
}
for (const e of map) {
  const page = path.join(DIST, 'posts', e.slug, 'index.html');
  if (!(await exists(page))) failures.push(`페이지 없음: /posts/${e.slug}`);
}

// 2) 본문에 Notion 만료형 이미지 URL이 남아 있지 않음
const NOTION_HOSTS = /(secure\.notion-static\.com|prod-files-secure\.s3|notion\.so\/image|amazonaws\.com)/;
for (const f of mdFiles) {
  const text = await fs.readFile(path.join(POSTS, f), 'utf8');
  if (NOTION_HOSTS.test(text)) failures.push(`Notion 이미지 URL 잔존: ${f}`);
}

// 3) 빌드된 글의 로컬 <img src>가 모두 dist에 존재
for (const e of map) {
  const page = path.join(DIST, 'posts', e.slug, 'index.html');
  if (!(await exists(page))) continue;
  const html = await fs.readFile(page, 'utf8');
  for (const m of html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)) {
    const file = path.join(DIST, decodeURIComponent(m[1].split('?')[0]));
    if (!(await exists(file))) failures.push(`이미지 없음: ${e.slug} → ${m[1]}`);
  }
}

// 4) 구 블로그가 제공하던 경로가 새 블로그에도 존재
for (const p of ['feed.xml', 'sitemap-index.xml', 'robots.txt', 'about/index.html']) {
  if (!(await exists(path.join(DIST, p)))) failures.push(`경로 없음: /${p}`);
}

if (failures.length) {
  console.error(`검증 실패 ${failures.length}건:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`검증 통과: ${map.length}개 글, 페이지·이미지·경로 모두 확인`);
```

- [ ] **Step 2: 빌드 후 실행**

```bash
cd /Users/dongho/Desktop/Github/blog-dongho
pnpm build && node scripts/verify-build.mjs
```

Expected: `검증 통과: N개 글, ...`

실패 시 처리:
- `이미지 없음`이 반복되면 `scripts/sync-images.js`가 `attachments/<slug>/` 하위 디렉터리를 `public/posts/attachments/<slug>/`로 복사하는지, 한글 디렉터리명이 `dist`에서 NFC로 남는지 확인한다. 필요하면 Task 5의 `publicUrl` 형식을 조정하고 Task 6 Step 3을 다시 실행한다.
- `sitemap-index.xml`이 없다면 `dist` 안의 실제 sitemap 파일명(`ls dist | grep sitemap`)에 맞춰 목록을 고치고, `src/pages/sitemap.xml.ts`가 만드는 `/sitemap.xml` 경로도 확인한다. 구 블로그는 `/sitemap.xml`을 제공했으므로 새 블로그에도 같은 경로가 있어야 한다.

- [ ] **Step 3: 커밋**

```bash
git add scripts/verify-build.mjs
git commit -m "✅ Test: 빌드 결과 검증 스크립트 추가"
```

---

### Task 9: 새 블로그 배포 확인 (Netlify, `dongho.me`)

**Files:** 없음 (배포 및 확인 작업)

**Interfaces:**
- Consumes: `feat/notion-migration` 브랜치의 빌드 결과.
- Produces: `https://dongho.me`에서 모든 글이 200으로 응답한다. Task 11(구 블로그 리디렉션 배포)의 선행 조건이다.

- [ ] **Step 1: 푸시와 PR**

```bash
cd /Users/dongho/Desktop/Github/blog-dongho
git push -u origin feat/notion-migration
```

Netlify의 Deploy Preview에서 먼저 확인한다. 푸시와 PR 생성은 사용자 확인을 받고 진행한다.

- [ ] **Step 2: Deploy Preview 확인**

Deploy Preview URL에서 확인한다: 홈, `/posts`, 글 3개 이상(이미지·코드·수식 포함 글 포함), `/about`, `/feed.xml`, `/sitemap.xml`.

- [ ] **Step 3: main에 병합하고 프로덕션 확인**

사용자 확인 후 PR을 병합한다. Netlify 프로덕션 배포가 끝나면 모든 글의 응답 코드를 확인한다.

```bash
node -e "
const map = require('./scripts/migration-map.json');
(async () => {
  let bad = 0;
  for (const e of map) {
    const res = await fetch('https://dongho.me/posts/' + e.encodedSlug);
    if (res.status !== 200) { bad++; console.log(res.status, e.slug); }
  }
  console.log(bad ? bad + '건 실패' : '전체 ' + map.length + '개 200 OK');
})();
"
```

Expected: `전체 N개 200 OK`

- [ ] **Step 4: 전환 가능 여부 판단**

모든 글이 200이어야 다음 Task로 진행한다. 실패 항목이 있으면 원인(slug 인코딩, 빌드 누락)을 고치고 Step 3을 반복한다.

---

### Task 10: 구 블로그를 리디렉션 전용으로 축소

**Files:**
- Create: `dongho-blog/scripts/build-redirects.mjs`, `dongho-blog/scripts/build-redirects.test.mjs`, `dongho-blog/scripts/migration-map.json`(복사), `dongho-blog/vercel.json`(생성), `dongho-blog/public/index.html`
- Delete: `dongho-blog/src/`, `next.config.ts`, `next-env.d.ts`, `postcss.config.mjs`, `tailwind.config.ts`, `tsconfig.json`, `.eslintrc.json`, `index.html`, `pnpm-lock.yaml`, `public/images/`
- Modify: `dongho-blog/package.json`, `dongho-blog/README.md`

**Interfaces:**
- Consumes: `blog-dongho/scripts/migration-map.json` (Task 6).
- Produces:
  - `buildRedirects(map: { notionId: string, encodedSlug: string }[], origin?: string): { source: string, destination: string, statusCode: 301 }[]`
  - `MAX_REDIRECTS = 2048`
  - `vercel.json`: `{ framework: null, buildCommand: null, installCommand: null, outputDirectory: "public", redirects: [...] }`

규칙 순서(Vercel은 위에서부터 첫 일치를 적용):
1. 글마다 `/posts/<uuid(하이픈 포함)>`와 `/posts/<uuid(하이픈 제거)>` → `https://dongho.me/posts/<encodedSlug>`
2. `/posts` → `https://dongho.me/posts`
3. `/posts/:path*` → `https://dongho.me/` (매핑되지 않은 글)
4. `/:path*` → `https://dongho.me/:path*` (`/`, `/about`, `/feed.xml`, `/sitemap.xml`, 그 외 모두)

- [ ] **Step 1: 브랜치와 매핑 복사**

```bash
cd /Users/dongho/Desktop/Github/dongho-blog
git switch -c chore/redirect-only
mkdir -p scripts
cp ../blog-dongho/scripts/migration-map.json scripts/migration-map.json
```

- [ ] **Step 2: 실패하는 테스트 작성**

`dongho-blog/scripts/build-redirects.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildRedirects, MAX_REDIRECTS } from './build-redirects.mjs';

const map = [
  { notionId: '1595ca9b-265e-80ab-8497-d0b44d347777', encodedSlug: encodeURIComponent('레디스-센티넬') },
];

test('글마다 하이픈 있는/없는 UUID 두 규칙을 301로 생성', () => {
  const rules = buildRedirects(map);
  const dest = `https://dongho.me/posts/${encodeURIComponent('레디스-센티넬')}`;
  assert.deepEqual(rules.slice(0, 2), [
    { source: '/posts/1595ca9b-265e-80ab-8497-d0b44d347777', destination: dest, statusCode: 301 },
    { source: '/posts/1595ca9b265e80ab8497d0b44d347777', destination: dest, statusCode: 301 },
  ]);
});

test('UUID는 소문자로 정규화', () => {
  const rules = buildRedirects([{ notionId: 'ABCDEF12-0000-0000-0000-000000000000', encodedSlug: 'x' }]);
  assert.equal(rules[0].source, '/posts/abcdef12-0000-0000-0000-000000000000');
});

test('개별 글 규칙 뒤에 /posts, /posts/:path*, 전체 catch-all 순서', () => {
  const rules = buildRedirects(map);
  assert.deepEqual(rules.slice(2), [
    { source: '/posts', destination: 'https://dongho.me/posts', statusCode: 301 },
    { source: '/posts/:path*', destination: 'https://dongho.me/', statusCode: 301 },
    { source: '/:path*', destination: 'https://dongho.me/:path*', statusCode: 301 },
  ]);
});

test('모든 규칙은 statusCode 301이고 permanent를 쓰지 않는다', () => {
  for (const r of buildRedirects(map)) {
    assert.equal(r.statusCode, 301);
    assert.equal('permanent' in r, false);
  }
});

test('규칙 수가 한도를 넘으면 오류', () => {
  const big = Array.from({ length: MAX_REDIRECTS }, (_, i) => ({
    notionId: `00000000-0000-0000-0000-${String(i).padStart(12, '0')}`,
    encodedSlug: `s${i}`,
  }));
  assert.throws(() => buildRedirects(big), /2048/);
});
```

- [ ] **Step 3: 실패 확인**

Run: `cd /Users/dongho/Desktop/Github/dongho-blog && node --test scripts/build-redirects.test.mjs`
Expected: FAIL (`Cannot find module './build-redirects.mjs'`)

- [ ] **Step 4: 구현**

`dongho-blog/scripts/build-redirects.mjs`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const NEW_ORIGIN = 'https://dongho.me';
export const MAX_REDIRECTS = 2048;

export function buildRedirects(map, origin = NEW_ORIGIN) {
  const rules = [];
  for (const entry of map) {
    const dashed = entry.notionId.toLowerCase();
    const bare = dashed.replace(/-/g, '');
    for (const id of new Set([dashed, bare])) {
      rules.push({
        source: `/posts/${id}`,
        destination: `${origin}/posts/${entry.encodedSlug}`,
        statusCode: 301,
      });
    }
  }
  rules.push({ source: '/posts', destination: `${origin}/posts`, statusCode: 301 });
  rules.push({ source: '/posts/:path*', destination: `${origin}/`, statusCode: 301 });
  rules.push({ source: '/:path*', destination: `${origin}/:path*`, statusCode: 301 });

  if (rules.length > MAX_REDIRECTS) {
    throw new Error(`리디렉션 규칙 ${rules.length}개가 Vercel 한도 ${MAX_REDIRECTS}를 넘습니다.`);
  }
  return rules;
}

async function main() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const map = JSON.parse(await fs.readFile(path.join(root, 'scripts/migration-map.json'), 'utf8'));
  const config = {
    framework: null,
    buildCommand: null,
    installCommand: null,
    outputDirectory: 'public',
    redirects: buildRedirects(map),
  };
  await fs.writeFile(path.join(root, 'vercel.json'), `${JSON.stringify(config, null, 2)}\n`);
  console.log(`vercel.json 생성: 리디렉션 규칙 ${config.redirects.length}개`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 5: 통과 확인**

Run: `cd /Users/dongho/Desktop/Github/dongho-blog && node --test scripts/build-redirects.test.mjs`
Expected: PASS (5 tests)

- [ ] **Step 6: 앱 코드 제거와 정적 출력 구성**

```bash
cd /Users/dongho/Desktop/Github/dongho-blog
git rm -r src next.config.ts next-env.d.ts postcss.config.mjs tailwind.config.ts tsconfig.json .eslintrc.json index.html pnpm-lock.yaml public/images
mkdir -p public
cat > public/index.html <<'EOF'
<!doctype html>
<html lang="ko">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=https://dongho.me">
  <link rel="canonical" href="https://dongho.me">
  <title>dongho.me로 이동합니다</title>
</head>
<body><a href="https://dongho.me">dongho.me</a>로 이동합니다.</body>
</html>
EOF
cat > package.json <<'EOF'
{
  "name": "dongho-blog",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "dongho-blog.kro.kr → dongho.me 리디렉션 전용",
  "scripts": {
    "build-redirects": "node scripts/build-redirects.mjs",
    "test": "node --test scripts/*.test.mjs",
    "verify-redirects": "node scripts/verify-redirects.mjs"
  }
}
EOF
cat > README.md <<'EOF'
# dongho-blog

구 Notion 블로그(`dongho-blog.kro.kr`)의 리디렉션 전용 저장소입니다. 모든 요청은 `https://dongho.me`로 301 이동합니다.
새 블로그: `blog-dongho` (Astro).

- `scripts/migration-map.json`: Notion 페이지 UUID → 새 글 slug 매핑
- `pnpm build-redirects`: 매핑에서 `vercel.json` 생성
EOF
```

`.env.local`은 커밋 대상이 아니므로 그대로 둔다 (`.gitignore`에 포함되어 있는지 `git check-ignore .env.local`로 확인).

- [ ] **Step 7: vercel.json 생성과 확인**

```bash
pnpm build-redirects
node -e "
const c = require('./vercel.json');
console.log(c.redirects.length, c.redirects[0], c.redirects.at(-1));
"
```

Expected: 규칙 수 = (글 수 × 2) + 3, 첫 규칙은 `/posts/<uuid>`, 마지막 규칙은 `/:path*`.

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "♻️ Refactor: 구 블로그를 dongho.me 리디렉션 전용으로 축소"
```

---

### Task 11: 리디렉션 배포와 전수 검증

**Files:**
- Create: `dongho-blog/scripts/verify-redirects.mjs`

**Interfaces:**
- Consumes: `dongho-blog/scripts/migration-map.json`, 배포된 리디렉션 도메인(인자 또는 기본 `https://dongho-blog.kro.kr`).
- Produces: 종료 코드 0/1과 실패 목록. 사용: `node scripts/verify-redirects.mjs [baseUrl]`.

- [ ] **Step 1: 검증 스크립트 작성**

`dongho-blog/scripts/verify-redirects.mjs`:

```js
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.argv[2] ?? 'https://dongho-blog.kro.kr').replace(/\/$/, '');
const map = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/migration-map.json'), 'utf8'));
const failures = [];

async function expectRedirect(pathname, expectedLocation, checkDestination = true) {
  const res = await fetch(base + pathname, { redirect: 'manual' });
  const location = res.headers.get('location');
  if (res.status !== 301) failures.push(`${pathname}: 상태 ${res.status} (301 기대)`);
  else if (location !== expectedLocation) failures.push(`${pathname}: Location ${location} (기대 ${expectedLocation})`);
  if (location && checkDestination) {
    const dest = await fetch(location);
    if (dest.status !== 200) failures.push(`${pathname} → ${location}: 목적지 상태 ${dest.status}`);
  }
}

for (const e of map) {
  const dashed = e.notionId.toLowerCase();
  const expected = `https://dongho.me/posts/${e.encodedSlug}`;
  await expectRedirect(`/posts/${dashed}`, expected);
  await expectRedirect(`/posts/${dashed.replace(/-/g, '')}`, expected);
}

await expectRedirect('/', 'https://dongho.me/');
await expectRedirect('/about', 'https://dongho.me/about');
await expectRedirect('/feed.xml', 'https://dongho.me/feed.xml');
await expectRedirect('/sitemap.xml', 'https://dongho.me/sitemap.xml');
await expectRedirect('/posts/00000000000000000000000000000000', 'https://dongho.me/');
// 임의 경로의 목적지는 새 블로그의 404 페이지이므로 목적지 200 검사에서 제외한다.
await expectRedirect('/no/such/path', 'https://dongho.me/no/such/path', false);

if (failures.length) {
  console.error(`검증 실패 ${failures.length}건:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`검증 통과: ${map.length * 2 + 6}개 URL 모두 301 → 200`);
```

- [ ] **Step 2: 커밋**

```bash
cd /Users/dongho/Desktop/Github/dongho-blog
git add scripts/verify-redirects.mjs
git commit -m "✅ Test: 리디렉션 전수 검증 스크립트 추가"
```

- [ ] **Step 3: Vercel Preview에서 사전 검증**

브랜치를 푸시하면 Vercel이 만드는 Preview URL로 먼저 검증한다 (푸시는 사용자 확인 후).

```bash
git push -u origin chore/redirect-only
node scripts/verify-redirects.mjs https://<preview-url>.vercel.app
```

Expected: `검증 통과: N개 URL 모두 301 → 200`

Preview 배포가 실패하면 Vercel 프로젝트 설정(Framework Preset이 Next.js, Build Command 등)이 `vercel.json`의 `framework: null` 등을 덮어쓰지 못하는지 확인하고 프로젝트 설정에서 Framework Preset을 `Other`로 바꾼다.

- [ ] **Step 4: 프로덕션 배포**

Task 9의 완료(모든 글 200)를 다시 확인한 뒤 사용자 확인을 받아 PR을 병합한다. Vercel 프로덕션 배포 후 아래를 실행한다.

```bash
node scripts/verify-redirects.mjs
```

Expected: `검증 통과: N개 URL 모두 301 → 200`

- [ ] **Step 5: 마무리 작업 (수동, 사용자가 수행)**

- [ ] Vercel 프로젝트의 환경변수 `NOTION_API_KEY`, `NOTION_DATABASE_ID`를 삭제한다.
- [ ] Google Search Console에 `dongho.me` 속성을 등록하고 `https://dongho.me/sitemap.xml`을 제출한다.
- [ ] 구 도메인 속성이 등록되어 있다면 주소 변경 도구로 `dongho.me`로의 이전을 알린다.
- [ ] Notion 통합(integration) 토큰을 폐기할 수 있는지 확인한다 (이전 안정화 후).
