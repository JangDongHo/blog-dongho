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

// 2) 본문에 Notion 만료형 파일 URL이 남아 있지 않음
const NOTION_HOSTS = /(secure\.notion-static\.com|prod-files-secure\.s3|notion\.so\/image|amazonaws\.com)/;
for (const f of mdFiles) {
  const text = await fs.readFile(path.join(POSTS, f), 'utf8');
  if (NOTION_HOSTS.test(text)) failures.push(`Notion 파일 URL 잔존: ${f}`);
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
