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
