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
  fixBookmarkLinks,
  findNotionFileUrls,
  replaceFileUrls,
  fileExtensionFor,
  stripSiteConfigBlock,
  fixDetailsSpacing,
  removeExcludedFileLinks,
} from './content.mjs';

// 이전에서 제외할 첨부 확장자 (19주차 회고의 80MB 화면 녹화)
const EXCLUDED_FILE_EXTENSIONS = ['mov'];

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

async function localizeAssets({ markdown, slug, title, postsDir, fetchImpl, report }) {
  const dir = path.join(postsDir, 'attachments', slug);
  const publicBase = `/posts/attachments/${encodeURIComponent(slug)}`;
  const saved = new Map(); // 서명 쿼리를 뗀 키 -> 공개 URL (같은 파일 중복 다운로드 방지)
  const counters = { img: 0, file: 0 };

  async function save(url, prefix, extOf) {
    const key = imageKey(url);
    if (saved.has(key)) return saved.get(key);
    try {
      const res = await fetchImpl(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const ext = extOf(res.headers.get('content-type'), url);
      if (!ext) throw new Error('알 수 없는 파일 형식');
      const name = `${prefix}-${String(++counters[prefix]).padStart(2, '0')}.${ext}`;
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, name), Buffer.from(await res.arrayBuffer()));
      const publicUrl = `${publicBase}/${name}`;
      saved.set(key, publicUrl);
      return publicUrl;
    } catch (err) {
      report.imageFailures.push({ title, url: key, reason: err.message });
      return null;
    }
  }

  const imageMap = new Map();
  for (const url of findImageUrls(markdown)) {
    const local = await save(url, 'img', extensionFor);
    if (local) imageMap.set(url, local);
  }
  const fileMap = new Map();
  for (const url of findNotionFileUrls(markdown)) {
    const local = await save(url, 'file', fileExtensionFor);
    if (local) fileMap.set(url, local);
  }
  return replaceFileUrls(replaceImageUrls(markdown, imageMap), fileMap);
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
    const { markdown: fetched, unsupported } = await source.getMarkdown(entry.notionId);
    const raw = removeExcludedFileLinks(stripSiteConfigBlock(fetched), EXCLUDED_FILE_EXTENSIONS);
    const date = toDateOnly(entry.date);

    for (const u of unsupported) report.unsupported.push({ title: entry.title, ...u });
    if (entry.dateFallback) report.dateFallbacks.push({ title: entry.title, date });
    if (!raw.trim()) report.emptyBodies.push({ title: entry.title });

    const body = await localizeAssets({
      markdown: raw, slug: entry.slug, title: entry.title, postsDir, fetchImpl, report,
    });
    const frontmatter = buildFrontmatter({
      title: entry.title,
      description: extractDescription(raw, entry.title),
      date,
    });
    await fs.writeFile(path.join(postsDir, `${entry.slug}.md`), `${frontmatter}\n${fixDetailsSpacing(fixBookmarkLinks(body)).trim()}\n`);
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
