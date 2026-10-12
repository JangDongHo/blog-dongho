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

test('assignSlugs: encodedSlug는 사이트가 쓰는 정규 URL(소문자)이고 slug는 파일명 그대로', () => {
  const [e] = assignSlugs([{ notionId: 'a', title: 'NestJS 설치하기', date: '2024-01-01' }]);
  assert.equal(e.slug, 'NestJS-설치하기');
  assert.equal(e.encodedSlug, encodeURIComponent('nestjs-설치하기'));
});
