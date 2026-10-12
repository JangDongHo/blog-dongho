import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createThrottledFetch } from './notion-fetch.mjs';

function harness(statuses, headers = {}) {
  let t = 10_000;
  const slept = [];
  const calls = [];
  const sleep = async (ms) => { slept.push(ms); t += ms; };
  const now = () => t;
  const baseFetch = async (url) => {
    calls.push(url);
    const status = statuses[Math.min(calls.length - 1, statuses.length - 1)];
    return { status, headers: { get: (k) => headers[k.toLowerCase()] ?? null } };
  };
  return { sleep, now, baseFetch, slept, calls };
}

test('연속 요청 사이에 최소 간격(500ms)을 둔다', async () => {
  const h = harness([200]);
  const f = createThrottledFetch(h.baseFetch, { requestsPerSecond: 2, sleep: h.sleep, now: h.now });
  await f('a');
  await f('b');
  assert.deepEqual(h.slept, [500]);
  assert.deepEqual(h.calls, ['a', 'b']);
});

test('429는 Retry-After(초)만큼 기다린 뒤 재시도', async () => {
  const h = harness([429, 429, 200], { 'retry-after': '1' });
  const f = createThrottledFetch(h.baseFetch, { sleep: h.sleep, now: h.now });
  const res = await f('a');
  assert.equal(res.status, 200);
  assert.equal(h.calls.length, 3);
  assert.deepEqual(h.slept.filter((ms) => ms >= 1000), [1000, 1000]);
});

test('Retry-After가 없으면 5초 * (시도 횟수 + 1)', async () => {
  const h = harness([429, 200]);
  const f = createThrottledFetch(h.baseFetch, { sleep: h.sleep, now: h.now });
  await f('a');
  assert.deepEqual(h.slept.filter((ms) => ms >= 1000), [5000]);
});

test('maxRetries를 넘기면 마지막 429 응답을 반환', async () => {
  const h = harness([429]);
  const f = createThrottledFetch(h.baseFetch, { maxRetries: 2, sleep: h.sleep, now: h.now });
  const res = await f('a');
  assert.equal(res.status, 429);
  assert.equal(h.calls.length, 3);
});

test('429가 아닌 오류 응답은 재시도하지 않는다', async () => {
  const h = harness([500]);
  const f = createThrottledFetch(h.baseFetch, { sleep: h.sleep, now: h.now });
  const res = await f('a');
  assert.equal(res.status, 500);
  assert.equal(h.calls.length, 1);
});
