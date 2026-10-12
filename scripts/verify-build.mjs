import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const POSTS = path.join(ROOT, 'src/content/posts');
const failures = [];

// macOS 파일시스템은 대소문자를 구분하지 않아 fs.access만으로는 Linux(Netlify)와 결과가 다르다.
// 경로의 각 구간을 디렉터리 목록과 정확히 비교해 대소문자까지 일치하는지 확인한다.
async function exists(p) {
  const rel = path.relative(ROOT, p).split(path.sep);
  let dir = ROOT;
  for (const seg of rel) {
    let names;
    try {
      names = await fs.readdir(dir);
    } catch {
      return false;
    }
    if (!names.includes(seg)) return false;
    dir = path.join(dir, seg);
  }
  return true;
}

const map = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/migration-map.json'), 'utf8'));

// 1) 글 수: 마크다운 파일 수 = 매핑 수, 모든 글의 페이지가 빌드됨
const mdFiles = (await fs.readdir(POSTS)).filter((f) => f.endsWith('.md'));
if (mdFiles.length !== map.length) {
  failures.push(`글 수 불일치: .md ${mdFiles.length} / 매핑 ${map.length}`);
}
for (const e of map) {
  const page = path.join(DIST, 'posts', decodeURIComponent(e.encodedSlug), 'index.html');
  if (!(await exists(page))) failures.push(`페이지 없음: /posts/${decodeURIComponent(e.encodedSlug)}`);
}

// 2) 본문에 Notion 만료형 파일 URL이 남아 있지 않음
const NOTION_HOSTS = /(secure\.notion-static\.com|prod-files-secure\.s3|notion\.so\/image|amazonaws\.com)/;
for (const f of mdFiles) {
  const text = await fs.readFile(path.join(POSTS, f), 'utf8');
  if (NOTION_HOSTS.test(text)) failures.push(`Notion 파일 URL 잔존: ${f}`);
}

// 3) 빌드된 글의 로컬 <img src>가 모두 dist에 존재
for (const e of map) {
  const page = path.join(DIST, 'posts', decodeURIComponent(e.encodedSlug), 'index.html');
  if (!(await exists(page))) continue;
  const html = await fs.readFile(page, 'utf8');
  for (const m of html.matchAll(/<img[^>]+src="(\/[^"]+)"/g)) {
    const file = path.join(DIST, decodeURIComponent(m[1].split('?')[0]));
    if (!(await exists(file))) failures.push(`이미지 없음: ${e.slug} → ${m[1]}`);
  }
}

// 3b) 글이 참조하는 첨부 파일(이미지·영상·PDF 등 링크 포함)이 git에 추적되고 있어야 한다.
//     디스크에만 있는 파일은 로컬 빌드는 통과시키지만 배포(클린 체크아웃)에서는 404가 된다.
const tracked = new Set(
  execFileSync('git', ['ls-files', '-z', 'src/content/posts/attachments'], { cwd: ROOT, encoding: 'utf8' })
    .split('\0')
    .filter(Boolean),
);
for (const f of mdFiles) {
  const text = await fs.readFile(path.join(POSTS, f), 'utf8');
  for (const m of text.matchAll(/\]\((\/posts\/attachments\/[^)\s]+)\)/g)) {
    const rel = path.posix.join('src/content', decodeURIComponent(m[1]).replace(/^\/posts\//, 'posts/'));
    if (!tracked.has(rel)) failures.push(`git에 추적되지 않은 첨부: ${f} → ${rel}`);
  }
}

// 4) 구 블로그가 제공하던 경로가 새 블로그에도 존재
for (const p of ['feed.xml', 'sitemap.xml', 'sitemap-index.xml', 'robots.txt', 'about/index.html']) {
  if (!(await exists(path.join(DIST, p)))) failures.push(`경로 없음: /${p}`);
}

if (failures.length) {
  console.error(`검증 실패 ${failures.length}건:`);
  for (const f of failures.slice(0, 40)) console.error(`  - ${f}`);
  if (failures.length > 40) console.error(`  ... 외 ${failures.length - 40}건`);
  process.exit(1);
}
console.log(`검증 통과: ${map.length}개 글, 페이지·이미지·경로 모두 확인`);
