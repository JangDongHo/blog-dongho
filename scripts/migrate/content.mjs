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
    .trim()
    .replace(/^\[![A-Za-z]+\]\s*/, ''); // 콜아웃 태그 `[!note]`
}

export function extractDescription(markdown, fallback = '', max = 160) {
  const text = markdown
    .replace(/```[\s\S]*?```/g, '\n\n')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .split(/\n{2,}/)
    .filter((block) => !/^\s*#{1,6}\s/.test(block))
    .filter((block) => !/^\s*([-*_])(\s*\1){2,}\s*$/.test(block)) // 구분선
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

// childMarkdown: 콜아웃의 자식 블록을 변환한 마크다운. Notion 콜아웃은 제목 한 줄만 rich_text에 두고
// 본문을 자식 블록으로 갖는 경우가 많다. 제목과 자식 사이에 빈 줄을 둬서, 자식이 `---`(구분선)로
// 시작해도 제목이 setext 제목행으로 해석되지 않게 한다.
export function calloutToMarkdown(callout, childMarkdown = '') {
  const icon = callout.icon?.type === 'emoji' ? `${callout.icon.emoji} ` : '';
  const title = icon + richTextToMarkdown(callout.rich_text);
  const children = childMarkdown.trim();
  // 제목도 이모지도 자식도 없으면 빈 박스가 되므로 출력하지 않는다.
  if (!title.trim() && !children) return '';
  const lines = [];
  if (title.trim()) lines.push(...title.split('\n'));
  if (children) {
    if (lines.length) lines.push('');
    lines.push(...children.split('\n'));
    // 테마(remark-callouts)는 콜아웃이 여러 블록이면 `[!note]`가 든 첫 문단을 선언 줄로 보고 통째로
    // 버린다. 제목이 `[!note]` 줄에 붙어 있으면 함께 사라지므로 빈 줄로 문단을 분리한다.
    lines.unshift('');
  }
  return ['> [!note]', ...lines.map((l) => (l.trim() ? `> ${l}` : '>'))].join('\n');
}

// 출력이 비어 있어도 정상인 블록 타입
const EMPTY_OK = new Set([
  'paragraph', 'divider', 'column_list', 'column', 'toggle',
  'bulleted_list_item', 'numbered_list_item', 'to_do', 'quote',
  // 표는 table 블록이 한 번에 렌더링하고, 목차는 테마가 자체 TOC를 제공한다.
  'table_row', 'table_of_contents',
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

// notion-to-md는 캡션 없는 북마크류를 `[bookmark](url)`로 내보낸다. URL을 링크 텍스트로 쓴다.
export function fixBookmarkLinks(markdown) {
  return markdown.replace(
    /\[(?:bookmark|embed|link_preview)\]\((https?:\/\/[^)\s]+)\)/g,
    (_, url) => `[${url}](${url})`,
  );
}

// 이미지가 아닌 첨부(파일·영상·PDF 등)는 `[이름](Notion S3 URL)`로 나온다. 만료되므로 내려받는다.
const NOTION_FILE_HOST = String.raw`(?:prod-files-secure\.s3[^)\s/]*|secure\.notion-static\.com|s3[.-][^)\s/]*amazonaws\.com)`;
const FILE_RE = new RegExp(
  String.raw`(?<!!)\[([^\]]*)\]\((https?:\/\/${NOTION_FILE_HOST}[^)\s]*)\)`,
  'g',
);

export function findNotionFileUrls(markdown) {
  return [...new Set([...markdown.matchAll(FILE_RE)].map((m) => m[2]))];
}

export function replaceFileUrls(markdown, urlMap) {
  return markdown.replace(FILE_RE, (all, text, url) =>
    urlMap.has(url) ? `[${text}](${urlMap.get(url)})` : all,
  );
}

export function fileExtensionFor(contentType, url) {
  const m = new URL(url).pathname.match(/\.([A-Za-z0-9]{1,5})$/);
  if (m) return m[1].toLowerCase();
  return extensionFor(contentType, url);
}

// 이전 호스팅 도구용 설정(`cleanUrl: …` 등)이 본문 맨 앞 yaml 코드 블록으로 남은 글이 있다.
// 콘텐츠가 아니므로 맨 앞의 해당 블록만 제거한다.
export function stripSiteConfigBlock(markdown) {
  const m = markdown.match(/^\s*```ya?ml\n([\s\S]*?)\n```[ \t]*\n*/);
  if (!m) return markdown;
  const lines = m[1].split('\n');
  const isConfig =
    lines.every((l) => /^[A-Za-z][\w-]*:\s*\S.*$/.test(l)) &&
    lines.some((l) => l.startsWith('cleanUrl:'));
  return isConfig ? markdown.slice(m[0].length) : markdown;
}

// HTML 블록(<details>)은 빈 줄 전까지 마크다운으로 해석되지 않으므로 </summary> 뒤에 빈 줄을 넣는다.
export function fixDetailsSpacing(markdown) {
  return markdown.replace(/<\/summary>\n(?!\n)/g, '</summary>\n\n');
}

// 용량이 큰 첨부(화면 녹화 등)는 이전에서 제외한다. 단독 줄의 Notion 첨부 링크만 지운다.
export function removeExcludedFileLinks(markdown, extensions) {
  const excluded = new Set(extensions.map((e) => e.toLowerCase()));
  return markdown
    .split('\n')
    .filter((line) => {
      const urls = findNotionFileUrls(line);
      if (urls.length !== 1) return true;
      const onlyLink = line.trim().startsWith('[') && line.trim().endsWith(`](${urls[0]})`);
      return !(onlyLink && excluded.has(fileExtensionFor(null, urls[0]) ?? ''));
    })
    .join('\n');
}
