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
    markdown: '# 개요\n\n본문 첫 문단\n\n![a](https://img.test/a.png?sig=1)\n![b](https://img.test/bad.png)\n\n[녹화.mov](https://prod-files-secure.s3.us-west-2.amazonaws.com/x/rec.mov?X-Amz=1)\n\n[bookmark](https://example.com/p)',
  },
  { notionId: ID(2), title: 'Redis: 센티넬 "구성"', date: '2024-02-01', dateFallback: false, markdown: '```yaml\ncleanUrl: /x\nfloatFirstTOC: right\n```\n\n두 번째 글\n\n<details>\n<summary>토글</summary>\n- 항목\n\n</details>' },
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
  assert.ok(first.includes(`[녹화.mov](/posts/attachments/${enc}/file-01.mov)`));
  assert.ok(first.includes('[https://example.com/p](https://example.com/p)'));
  await fs.access(path.join(t.postsDir, 'attachments', 'Redis-센티넬-구성', 'file-01.mov'));
  const img = await fs.readFile(path.join(t.postsDir, 'attachments', 'Redis-센티넬-구성', 'img-01.png'));
  assert.equal(img.length, 4);

  const second = await fs.readFile(path.join(t.postsDir, 'Redis-센티넬-구성-2.md'), 'utf8');
  assert.ok(!second.includes('cleanUrl'));
  assert.ok(second.includes('</summary>\n\n- 항목'));
  assert.match(second, /description: "두 번째 글"/);

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
