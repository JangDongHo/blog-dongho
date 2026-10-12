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
    // 사이트(Astro 콘텐츠 컬렉션)는 URL을 소문자로 정규화하고 대소문자 다른 주소는 301로 보낸다.
    // 리디렉션이 한 번에 정규 주소로 가도록 encodedSlug는 소문자 기준으로 만든다.
    return { ...entry, slug, encodedSlug: encodeURIComponent(slug.toLowerCase()) };
  });
}
