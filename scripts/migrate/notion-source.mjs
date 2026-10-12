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
  // 콜아웃은 자식 블록까지 직접 변환한다. notion-to-md는 콜아웃 자식을 콜아웃 변환 안에서만
  // 처리하고 이후 단계에서 건너뛰므로, 커스텀 변환기가 자식을 가져오지 않으면 내용이 사라진다.
  n2m.setCustomTransformer('callout', async (block) => {
    let childMarkdown = '';
    if (block.has_children) {
      const children = [];
      let cursor;
      do {
        const res = await client.blocks.children.list({
          block_id: block.id,
          start_cursor: cursor,
          page_size: 100,
        });
        children.push(...res.results);
        cursor = res.has_more ? res.next_cursor : undefined;
      } while (cursor);
      const childBlocks = await n2m.blocksToMarkdown(children);
      childMarkdown = n2m.toMarkdownString(childBlocks).parent ?? '';
    }
    return calloutToMarkdown(block.callout, childMarkdown);
  });

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
