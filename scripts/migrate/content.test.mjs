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
  fixBookmarkLinks,
  findNotionFileUrls,
  replaceFileUrls,
  fileExtensionFor,
  stripSiteConfigBlock,
  fixDetailsSpacing,
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

test('findUnsupported: table_row와 table_of_contents는 빈 출력이 정상', () => {
  const blocks = [
    { type: 'table', blockId: '1', parent: '| a |', children: [{ type: 'table_row', blockId: '2', parent: '', children: [] }] },
    { type: 'table_of_contents', blockId: '3', parent: '', children: [] },
  ];
  assert.deepEqual(findUnsupported(blocks), []);
});

test('fixBookmarkLinks: 캡션 없는 bookmark·embed·link_preview는 URL을 링크 텍스트로', () => {
  const md = '[bookmark](https://a.com/x)\n[embed](https://b.com)\n[link_preview](https://c.com)\n[캡션](https://d.com)';
  assert.equal(
    fixBookmarkLinks(md),
    '[https://a.com/x](https://a.com/x)\n[https://b.com](https://b.com)\n[https://c.com](https://c.com)\n[캡션](https://d.com)',
  );
});

const S3 = 'https://prod-files-secure.s3.us-west-2.amazonaws.com';

test('findNotionFileUrls: 이미지가 아닌 Notion S3 링크만', () => {
  const md = `![img](${S3}/a/b.png?x=1)\n[녹화.mov](${S3}/a/%EB%85%B9.mov?x=1)\n[외부](https://example.com/a.mov)`;
  assert.deepEqual(findNotionFileUrls(md), [`${S3}/a/%EB%85%B9.mov?x=1`]);
});

test('replaceFileUrls: 매핑된 링크만 치환하고 텍스트는 유지', () => {
  const url = `${S3}/a/rec.mov?x=1`;
  const md = `[녹화](${url}) ![img](${S3}/a/b.png?x=1)`;
  assert.equal(
    replaceFileUrls(md, new Map([[url, '/posts/attachments/s/file-01.mov']])),
    `[녹화](/posts/attachments/s/file-01.mov) ![img](${S3}/a/b.png?x=1)`,
  );
});

test('fileExtensionFor: URL 경로 확장자 우선, 없으면 이미지 content-type, 모르면 null', () => {
  assert.equal(fileExtensionFor(null, `${S3}/a/%EB%85%B9.MOV?x=1`), 'mov');
  assert.equal(fileExtensionFor('image/png', `${S3}/a/noext`), 'png');
  assert.equal(fileExtensionFor(null, `${S3}/a/noext`), null);
});

test('stripSiteConfigBlock: 본문 맨 앞의 cleanUrl yaml 블록만 제거', () => {
  const md = '```yaml\ncleanUrl: /x\nfloatFirstTOC: right\n```\n\n본문\n\n```yaml\ncleanUrl: /y\n```\n';
  assert.equal(stripSiteConfigBlock(md), '본문\n\n```yaml\ncleanUrl: /y\n```\n');
});

test('stripSiteConfigBlock: cleanUrl이 없는 일반 yaml 코드 블록은 유지', () => {
  const md = '```yaml\nname: app\nimage: node\n```\n\n본문';
  assert.equal(stripSiteConfigBlock(md), md);
});

test('calloutToMarkdown: 텍스트와 이모지가 모두 없는 콜아웃은 빈 문자열', () => {
  const callout = { icon: { type: 'external', external: { url: 'https://x/i.png' } }, rich_text: [] };
  assert.equal(calloutToMarkdown(callout), '');
});

test('fixDetailsSpacing: </summary> 뒤에 빈 줄이 없으면 추가하고, 있으면 유지', () => {
  const md = '<details>\n<summary>a</summary>\n- x\n\n</details>\n\n<details>\n<summary>b</summary>\n\n```sh\nls\n```\n</details>';
  assert.equal(
    fixDetailsSpacing(md),
    '<details>\n<summary>a</summary>\n\n- x\n\n</details>\n\n<details>\n<summary>b</summary>\n\n```sh\nls\n```\n</details>',
  );
});

test('extractDescription: 첫 문단이 콜아웃이면 [!note] 태그를 제외한 본문을 쓴다', () => {
  const md = '> [!note]\n> 💡 본 포스팅은 안내입니다\n\n다음 문단';
  assert.equal(extractDescription(md), '💡 본 포스팅은 안내입니다');
});
