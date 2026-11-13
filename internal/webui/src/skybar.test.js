import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createSkyBar } from './skybar.js';
import { launchLabel } from './logic.js';

// Minimal fake DOM: enough for skybar to build nodes, toggle attributes and listen for events.
class FakeNode {
  constructor(tagName, className) {
    this.tagName = tagName;
    this.className = className ?? '';
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.hidden = false;
    this.focused = false;
  }

  get textContent() {
    return this.children.map((child) => (typeof child === 'string' ? child : child.textContent)).join('');
  }

  set textContent(value) {
    this.children = value === null || value === undefined || value === '' ? [] : [String(value)];
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  replaceChildren(...nodes) {
    this.children = [...nodes];
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  getAttribute(name) {
    return this.attributes[name] ?? null;
  }

  addEventListener(type, listener) {
    (this.listeners[type] ??= []).push(listener);
  }

  removeEventListener(type, listener) {
    this.listeners[type] = (this.listeners[type] ?? []).filter((item) => item !== listener);
  }

  contains(node) {
    return node === this || this.children.some((child) => typeof child !== 'string' && child.contains(node));
  }

  focus() {
    this.focused = true;
  }

  fire(type, event = {}) {
    for (const listener of [...(this.listeners[type] ?? [])]) listener(event);
  }
}

const element = (tag, className, text) => {
  const node = new FakeNode(tag, className);
  if (text !== undefined && text !== null) node.textContent = text;
  return node;
};
const feedCredit = (feed) => [element('p', 'data-credit', feed.source.credit)];
const dataFailure = (error) => element('p', 'note is-warning', error.message);
const dataTime = (iso) => `at ${iso}`;
const flush = () => new Promise((resolve) => setImmediate(resolve));

const envelope = (data) => ({ source: { credit: 'Test feed', nature: 'observed' }, fetched_at: '2026-11-09T10:00:00Z', stale: false, warning: null, data });
const T0 = Date.parse('2026-11-09T11:00:00Z');
const WEATHER = {
  kp: [{ time: '2026-11-09T09:00:00Z', kp: 3.3 }, { time: '2026-11-09T10:00:00Z', kp: 5 }],
  flux: [{ flux: 140.4 }],
  scales: null,
  alerts: [{ issued_at: '2026-11-09T09:30:00Z', headline: 'Geomagnetic K-index of 5' }],
};
const HISTORY = [{ date: '2026-11-08', kp_max: 6, f107: 130 }, { date: '2026-10-01', kp_max: 3, f107: 120 }];
const EVENTS = [{ time: '2026-11-08T12:00:00Z', kind: 'Solar flare', detail: 'M1.2' }];
const LAUNCHES = [{ name: 'Falcon 9', net: '2026-11-09T20:00:00Z', status: 'Go' }];

function setup({ live = true, catalog } = {}) {
  const document = new FakeNode('document');
  globalThis.document = document;
  const calls = [];
  const waiting = {};
  const api = {};
  for (const name of ['spaceWeather', 'launches', 'spaceWeatherHistory', 'spaceEvents']) {
    api[name] = () => {
      calls.push(name);
      let resolve;
      let reject;
      const promise = new Promise((a, b) => {
        resolve = a;
        reject = b;
      });
      (waiting[name] ??= []).push({ resolve, reject });
      return promise;
    };
  }
  const take = (name) => {
    const request = waiting[name]?.shift();
    if (!request) throw new Error(`no pending ${name} request`);
    return request;
  };
  const clock = { now: T0 };
  const chips = element('div', 'sky-chips');
  const popover = element('div', 'sky-popover');
  const bar = createSkyBar({
    api,
    element,
    feedCredit,
    dataFailure,
    dataTime,
    catalog: catalog ?? Promise.resolve(live === null ? null : { liveData: live }),
    chips,
    popover,
    now: () => clock.now,
  });
  return {
    bar,
    document,
    chips,
    popover,
    clock,
    calls,
    ok: (name, data) => take(name).resolve(envelope(data)),
    fail: (name, message) => take(name).reject(Object.assign(new Error(message), {})),
    abort: (name) => take(name).reject(Object.assign(new Error('aborted'), { name: 'AbortError' })),
    kpChip: () => chips.children[0],
    launchChip: () => chips.children[1],
  };
}

async function startedWithData(options) {
  const env = setup(options);
  const starting = env.bar.start();
  await flush();
  env.ok('spaceWeather', WEATHER);
  env.ok('launches', LAUNCHES);
  await starting;
  await flush();
  return env;
}

test('startup calls only spaceWeather and launches', async () => {
  const env = setup();
  const starting = env.bar.start();
  await flush();
  assert.deepEqual([...env.calls].sort(), ['launches', 'spaceWeather']);
  env.ok('spaceWeather', WEATHER);
  env.ok('launches', LAUNCHES);
  await starting;
  await flush();
  assert.deepEqual([...env.calls].sort(), ['launches', 'spaceWeather']);
});

test('history and events are requested only when the weather popover opens', async () => {
  const env = await startedWithData();
  assert.equal(env.calls.includes('spaceWeatherHistory'), false);
  assert.equal(env.calls.includes('spaceEvents'), false);
  env.kpChip().fire('click');
  await flush();
  assert.equal(env.calls.filter((name) => name === 'spaceWeatherHistory').length, 1);
  assert.equal(env.calls.filter((name) => name === 'spaceEvents').length, 1);
});

test('chip labels show loading, values, failure, live-off and no future launch', async () => {
  const loading = setup();
  const starting = loading.bar.start();
  await flush();
  assert.equal(loading.kpChip().textContent, 'Kp …');
  assert.equal(loading.launchChip().textContent, 'Launch …');
  loading.ok('spaceWeather', WEATHER);
  loading.ok('launches', LAUNCHES);
  await starting;
  assert.equal(loading.kpChip().textContent, 'Kp 5.0');
  assert.equal(loading.launchChip().textContent, `Launch ${launchLabel(
    { name: 'Falcon 9', net: LAUNCHES[0].net, status: 'Go' },
    T0,
  )}`);
  assert.equal(loading.launchChip().textContent, 'Launch in 9 h');

  const failing = setup();
  const failingStart = failing.bar.start();
  await flush();
  failing.fail('spaceWeather', 'down');
  failing.fail('launches', 'down');
  await failingStart;
  await flush();
  assert.equal(failing.kpChip().textContent, 'Kp unavailable');
  assert.equal(failing.launchChip().textContent, 'Launch unavailable');
  failing.kpChip().fire('click');
  assert.equal(failing.kpChip().getAttribute('aria-expanded'), 'true');

  const off = setup({ live: false });
  await off.bar.start();
  assert.equal(off.kpChip().textContent, 'Kp off');
  assert.equal(off.launchChip().textContent, 'Launch off');
  off.launchChip().fire('click');
  assert.deepEqual(off.calls, []);
  assert.equal(off.popover.textContent, 'Next launchesLive data is off while serving a local file.');

  const none = setup();
  const noneStart = none.bar.start();
  await flush();
  none.ok('spaceWeather', WEATHER);
  none.ok('launches', [{ name: 'Old', net: '2026-11-08T00:00:00Z', status: 'Success' }]);
  await noneStart;
  assert.equal(none.launchChip().textContent, 'Launch none listed');
});

test('a null catalog is treated as live data', async () => {
  const env = setup({ catalog: Promise.resolve(null) });
  const starting = env.bar.start();
  await flush();
  assert.deepEqual([...env.calls].sort(), ['launches', 'spaceWeather']);
  env.ok('spaceWeather', WEATHER);
  env.ok('launches', LAUNCHES);
  await starting;
});

test('only one popover is open at a time and a chip click toggles it', async () => {
  const env = await startedWithData();
  env.kpChip().fire('click');
  assert.equal(env.popover.hidden, false);
  assert.equal(env.popover.children[0].textContent, 'Space weather');
  assert.equal(env.kpChip().getAttribute('aria-expanded'), 'true');

  env.launchChip().fire('click');
  assert.equal(env.popover.children[0].textContent, 'Next launches');
  assert.equal(env.kpChip().getAttribute('aria-expanded'), 'false');
  assert.equal(env.launchChip().getAttribute('aria-expanded'), 'true');

  env.launchChip().fire('click');
  assert.equal(env.popover.hidden, true);
  assert.equal(env.launchChip().getAttribute('aria-expanded'), 'false');
});

test('Escape closes the popover, returns focus to its chip and removes listeners', async () => {
  const env = await startedWithData();
  env.launchChip().fire('click');
  env.document.fire('keydown', { key: 'Escape' });
  assert.equal(env.popover.hidden, true);
  assert.equal(env.launchChip().focused, true);
  assert.equal(env.kpChip().focused, false);
  assert.equal(env.document.listeners.keydown.length, 0);
  assert.equal(env.document.listeners.pointerdown.length, 0);
});

test('a pointerdown outside the popover and chips closes it, inside does not', async () => {
  const env = await startedWithData();
  env.kpChip().fire('click');
  env.document.fire('pointerdown', { target: env.popover.children[0] });
  assert.equal(env.popover.hidden, false);
  env.document.fire('pointerdown', { target: env.kpChip() });
  assert.equal(env.popover.hidden, false);
  env.document.fire('pointerdown', { target: element('p') });
  assert.equal(env.popover.hidden, true);
  assert.equal(env.document.listeners.pointerdown.length, 0);
});

test('failed history retries on the next open and successful history is not refetched', async () => {
  const env = await startedWithData();
  env.kpChip().fire('click');
  await flush();
  env.ok('spaceWeather', WEATHER);
  env.fail('spaceWeatherHistory', 'History is down');
  env.ok('spaceEvents', EVENTS);
  await flush();
  assert.match(env.popover.textContent, /History is down/);
  assert.match(env.popover.textContent, /Solar flare/);

  env.kpChip().fire('click');
  env.kpChip().fire('click');
  await flush();
  assert.equal(env.calls.filter((name) => name === 'spaceWeatherHistory').length, 2);
  assert.equal(env.calls.filter((name) => name === 'spaceEvents').length, 1);
  env.ok('spaceWeather', WEATHER);
  env.ok('spaceWeatherHistory', HISTORY);
  await flush();
  assert.match(env.popover.textContent, /Past year, strongest Kp 6\.0 on 2026-11-08/);
  assert.doesNotMatch(env.popover.textContent, /History is down/);

  env.kpChip().fire('click');
  env.kpChip().fire('click');
  await flush();
  assert.equal(env.calls.filter((name) => name === 'spaceWeatherHistory').length, 2);
  assert.equal(env.calls.filter((name) => name === 'spaceEvents').length, 1);
});

test('a failed weather refresh keeps the held data and adds the failure', async () => {
  const env = await startedWithData();
  env.kpChip().fire('click');
  env.fail('spaceWeather', 'Refresh failed');
  env.fail('spaceWeatherHistory', 'no history');
  env.fail('spaceEvents', 'no events');
  await flush();
  assert.match(env.popover.textContent, /Kp 5\.0 Geomagnetic storm/);
  assert.match(env.popover.textContent, /Refresh failed/);
  assert.match(env.popover.textContent, /no history/);
  assert.match(env.popover.textContent, /no events/);
});

test('a late response after the popover closed does not write into it', async () => {
  const env = await startedWithData();
  env.kpChip().fire('click');
  env.document.fire('keydown', { key: 'Escape' });
  assert.equal(env.popover.children.length, 0);

  env.ok('spaceWeather', WEATHER);
  env.ok('spaceWeatherHistory', HISTORY);
  env.ok('spaceEvents', EVENTS);
  await flush();
  assert.equal(env.popover.hidden, true);
  assert.equal(env.popover.children.length, 0);
});

test('a late response from a previous popover does not write into the one now open', async () => {
  const env = await startedWithData();
  env.kpChip().fire('click');
  env.launchChip().fire('click');
  env.ok('spaceWeather', WEATHER);
  env.ok('spaceWeatherHistory', HISTORY);
  env.ok('spaceEvents', EVENTS);
  await flush();
  assert.equal(env.popover.children[0].textContent, 'Next launches');
  assert.doesNotMatch(env.popover.textContent, /Past year/);
});

test('tick re-labels the launch chip from held data with no network call', async () => {
  const env = await startedWithData();
  assert.equal(env.launchChip().textContent, 'Launch in 9 h');
  const before = env.calls.length;
  env.clock.now = Date.parse('2026-11-09T16:00:00Z');
  env.bar.tick();
  assert.equal(env.launchChip().textContent, 'Launch in 4 h');
  assert.equal(env.calls.length, before);
});

test('an AbortError is ignored and leaves the chip loading', async () => {
  const env = setup();
  const starting = env.bar.start();
  await flush();
  env.ok('spaceWeather', WEATHER);
  env.abort('launches');
  await starting;
  await flush();
  assert.equal(env.launchChip().textContent, 'Launch …');
});
