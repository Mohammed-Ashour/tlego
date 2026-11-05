import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ApiError, createApi, isAbort } from './api.js';

const reply = (status, body) => ({ ok: status < 400, status, text: async () => (typeof body === 'string' ? body : JSON.stringify(body)) });

test('builds requests with the observer and whole-second times', async () => {
  const urls = [];
  const api = createApi(async (url) => { urls.push(url); return reply(200, {}); });
  await api.track('25544', Date.UTC(2026, 0, 2, 3, 4, 5, 678), { lat: 51.5, lon: -0.1, alt: 0 });
  assert.match(urls[0], /^\/api\/v1\/track\?/);
  const params = new URL(urls[0], 'http://x').searchParams;
  assert.equal(params.get('norad_id'), '25544');
  assert.equal(params.get('start'), '2026-01-02T03:04:05Z');
  assert.equal(params.get('lat'), '51.5');
  await api.track('25544', 0, null);
  assert.equal(new URL(urls[1], 'http://x').searchParams.has('lat'), false);
});

test('surfaces JSON and plain text failures', async () => {
  await assert.rejects(createApi(async () => reply(400, { error: { message: 'bad id' } })).report('x'), (error) => error instanceof ApiError && error.message === 'bad id' && error.status === 400);
  await assert.rejects(createApi(async () => reply(502, 'Unable to fetch\n')).groups(), /Unable to fetch/);
  await assert.rejects(createApi(async () => reply(500, '')).groups(), /Request failed \(500\)/);
  await assert.rejects(createApi(async () => reply(200, '<html>')).groups(), /unreadable/);
});

test('a newer keyed request cancels the older one', async () => {
  const signals = [];
  const api = createApi((_, { signal }) => {
    signals.push(signal);
    return new Promise((resolve, reject) => {
      signal.addEventListener('abort', () => reject(Object.assign(new Error('aborted'), { name: 'AbortError' })));
      if (signals.length === 2) resolve(reply(200, ['new']));
    });
  });
  const first = api.satellites('A');
  const second = api.satellites('B');
  await assert.rejects(first, isAbort);
  assert.deepEqual(await second, ['new']);
  assert.equal(signals[0].aborted, true);
  assert.equal(signals[1].aborted, false);
});

test('tracks of different satellites do not cancel each other', async () => {
  const signals = [];
  const api = createApi(async (_, { signal }) => { signals.push(signal); return reply(200, {}); });
  await Promise.all([api.track('1', 0, null), api.track('2', 0, null)]);
  assert.ok(signals.every((signal) => !signal.aborted));
});
