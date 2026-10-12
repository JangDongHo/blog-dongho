const defaultSleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createThrottledFetch(baseFetch, options = {}) {
  const {
    requestsPerSecond = 2,
    maxRetries = 4,
    sleep = defaultSleep,
    now = Date.now,
  } = options;
  const interval = Math.ceil(1000 / requestsPerSecond);
  let nextSlot = 0;

  async function waitTurn() {
    const slot = Math.max(now(), nextSlot);
    nextSlot = slot + interval;
    const wait = slot - now();
    if (wait > 0) await sleep(wait);
  }

  return async function throttledFetch(input, init) {
    for (let attempt = 0; ; attempt++) {
      await waitTurn();
      const res = await baseFetch(input, init);
      if (res.status !== 429 || attempt >= maxRetries) return res;
      const retryAfter = Number(res.headers.get('retry-after'));
      const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
        ? retryAfter * 1000
        : 5000 * (attempt + 1);
      console.warn(`Notion 429: ${waitMs}ms 후 재시도 (${attempt + 1}/${maxRetries})`);
      await sleep(waitMs);
    }
  };
}
