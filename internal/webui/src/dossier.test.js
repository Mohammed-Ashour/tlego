import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createDossier } from './dossier.js';

// A minimal DOM stand-in: enough for the text, attribute and click behaviour the dossier uses.
class FakeNode {
  constructor(tag) {
    this.tagName = tag;
    this.className = '';
    this.textContent = '';
    this.children = [];
    this.attributes = {};
    this.dataset = {};
    this.listeners = {};
    this.type = undefined;
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

  click() {
    for (const listener of this.listeners.click ?? []) listener({});
  }
}

const fakeElement = (tag, className, text) => {
  const node = new FakeNode(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
};

function collect(node) {
  return [node.textContent, ...node.children.flatMap(collect)].filter(Boolean);
}

const textOf = (node) => collect(node).join('\n');

const flush = () => new Promise((resolve) => setImmediate(resolve));

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

const SOURCES = ['satelliteDetails', 'catalogRecord', 'spaceTrack', 'transmitters', 'recentScenes'];

const sampleData = {
  satelliteDetails: [{ name: 'ISS', description: 'Space station', types: ['space station'], operators: ['NASA'], countries: ['United States'], launch_date: '1998-11-20' }],
  catalogRecord: { name: 'ISS', kind: 'Payload', bus: 'ISS', mass_kg: 420000, launch_date: '1998-11-20', owner: 'ISS', manufacturer: 'RSC', orbit_class: 'LEO' },
  spaceTrack: [{ name: 'ISS (ZARYA)', object_type: 'PAYLOAD', country: 'ISS' }],
  transmitters: [{ id: 1, description: 'APRS downlink', alive: true, status: 'active', downlink_hz: 145825000, mode: 'AFSK' }],
  recentScenes: [
    { id: 'a', time: '2026-11-09T10:00:10Z', cloud_cover: 20, center_lat: 1.23, center_lon: 2.34 },
    { id: 'b', time: '2026-11-09T10:00:20Z', cloud_cover: 40, center_lat: 1.23, center_lon: 2.34 },
    { id: 'c', time: '2026-11-09T12:00:00Z', cloud_cover: null, center_lat: 5, center_lon: 6 },
  ],
};

const feed = (source, data) => ({
  source: { credit: `${source} credit`, nature: 'test nature' },
  fetched_at: '2026-11-09T09:00:00Z',
  stale: false,
  warning: null,
  data,
});

// Each source answers through the handler, which may return a promise.
function harness({ handler, liveData = true, spaceTrackReady = false, imagingIds = new Set(['25544']), selected = { id: '25544', name: 'ISS' } } = {}) {
  const calls = [];
  const api = {};
  for (const source of SOURCES) {
    api[source] = (id) => {
      calls.push({ source, id });
      return handler ? handler(source, id) : Promise.resolve(feed(source, structuredClone(sampleData[source])));
    };
  }
  const env = {
    selected,
    clears: 0,
    focused: [],
  };
  const panels = { identity: fakeElement('div'), radio: fakeElement('div'), sees: fakeElement('div') };
  const dossier = createDossier({
    api,
    element: fakeElement,
    feedCredit: (value) => [fakeElement('p', 'data-credit', `${value.source.credit} · ${value.source.nature}`)],
    dataFailure: (error) => fakeElement('p', 'note is-warning', `failed: ${error.message}`),
    dataTime: (iso) => `time ${iso}`,
    selectedEntry: () => env.selected,
    catalog: Promise.resolve({ liveData, spaceTrackReady, imagingIds }),
    panels,
    focusScene: (point) => env.focused.push(point),
    clearScene: () => {
      env.clears += 1;
    },
  });
  return { dossier, calls, panels, env };
}

test('makes no request until a tab is opened', async () => {
  const { dossier, calls } = harness();
  await flush();
  assert.equal(calls.length, 0);
  await dossier.open('radio');
  assert.deepEqual(calls, [{ source: 'transmitters', id: '25544' }]);
});

test('reopening a tab uses the cache', async () => {
  const { dossier, calls, panels } = harness();
  await dossier.open('radio');
  await flush();
  await dossier.open('radio');
  await flush();
  assert.equal(calls.length, 1);
  assert.match(textOf(panels.radio), /1 active transmitter/);
});

test('a failed request is not cached, so reopening retries', async () => {
  let attempts = 0;
  const { dossier, calls, panels } = harness({
    handler: (source) => {
      attempts += 1;
      return attempts === 1 ? Promise.reject(new Error('boom')) : Promise.resolve(feed(source, sampleData.transmitters));
    },
  });
  await dossier.open('radio');
  await flush();
  assert.match(textOf(panels.radio), /failed: boom/);
  await dossier.open('radio');
  await flush();
  assert.equal(calls.length, 2);
  assert.match(textOf(panels.radio), /1 active transmitter/);
});

test('an open while the same request is in flight does not request again', async () => {
  const pending = deferred();
  const { dossier, calls, panels } = harness({ handler: () => pending.promise });
  const first = dossier.open('radio');
  const second = dossier.open('radio');
  await flush();
  assert.equal(calls.length, 1);
  assert.match(textOf(panels.radio), /Loading…/);
  pending.resolve(feed('transmitters', sampleData.transmitters));
  await Promise.all([first, second]);
  await flush();
  assert.equal(calls.length, 1);
  assert.match(textOf(panels.radio), /1 active transmitter/);
});

test('a response for a satellite that is no longer selected does not write', async () => {
  const pending = deferred();
  const { dossier, panels, env } = harness({ handler: () => pending.promise });
  const opening = dossier.open('radio');
  await flush();
  env.selected = { id: '99999', name: 'Other' };
  await dossier.selectionChanged('track');
  pending.resolve(feed('transmitters', sampleData.transmitters));
  await opening;
  await flush();
  assert.equal(textOf(panels.radio).includes('active transmitter'), false);
  assert.match(textOf(panels.radio), /Loading…/);
});

test('live data off makes no calls and shows the note', async () => {
  const { dossier, calls, panels } = harness({ liveData: false });
  await dossier.open('identity');
  await dossier.open('radio');
  await dossier.open('sees');
  await flush();
  assert.equal(calls.length, 0);
  for (const tab of ['identity', 'radio', 'sees']) {
    assert.match(textOf(panels[tab]), /Live data is off while serving a local file\./);
  }
});

test('no selection shows the add-a-satellite note without calls', async () => {
  const { dossier, calls, panels } = harness({ selected: null });
  await dossier.open('sees');
  assert.equal(calls.length, 0);
  assert.match(textOf(panels.sees), /Add a satellite to see its details here\./);
});

test('Space-Track makes no call when not ready', async () => {
  const { dossier, calls, panels } = harness({ spaceTrackReady: false });
  await dossier.open('identity');
  await flush();
  assert.equal(calls.some((call) => call.source === 'spaceTrack'), false);
  assert.match(textOf(panels.identity), /Run khonsu setup to connect your own free Space-Track account, then restart Khonsu\./);
});

test('Space-Track is fetched and rendered when ready', async () => {
  const { dossier, calls, panels } = harness({ spaceTrackReady: true });
  await dossier.open('identity');
  await flush();
  assert.equal(calls.some((call) => call.source === 'spaceTrack'), true);
  assert.match(textOf(panels.identity), /Object type: PAYLOAD/);
});

test('identity shows the GCAT name note whichever response arrives first', async () => {
  const wikidataName = 'Alpha Probe';
  const catalogName = 'Beta Object';
  const handler = (wikidata, gcat) => (source) => {
    if (source === 'satelliteDetails') return wikidata.promise;
    if (source === 'catalogRecord') return gcat.promise;
    return Promise.resolve(feed(source, []));
  };
  const note = `GCAT lists this object as ${catalogName}, so these figures describe that entry alone.`;

  for (const order of ['wikidata-first', 'gcat-first']) {
    const wikidata = deferred();
    const gcat = deferred();
    const { dossier, panels } = harness({ handler: handler(wikidata, gcat) });
    const opening = dossier.open('identity');
    await flush();
    const wikidataFeed = feed('satelliteDetails', [{ name: wikidataName, types: [], operators: [], countries: [] }]);
    const gcatFeed = feed('catalogRecord', { name: catalogName, mass_kg: 1234.5 });
    if (order === 'wikidata-first') {
      wikidata.resolve(wikidataFeed);
      await flush();
      gcat.resolve(gcatFeed);
    } else {
      gcat.resolve(gcatFeed);
      await flush();
      assert.equal(textOf(panels.identity).includes(note), false);
      wikidata.resolve(wikidataFeed);
    }
    await opening;
    await flush();
    assert.match(textOf(panels.identity), /Catalog object: Beta Object/, order);
    assert.match(textOf(panels.identity), /Mass: 1,234\.5 kg/, order);
    assert.equal(textOf(panels.identity).includes(note), true, order);
  }
});

test('identity shows no GCAT name note when the names match', async () => {
  const { dossier, panels } = harness();
  await dossier.open('identity');
  await flush();
  assert.equal(textOf(panels.identity).includes('GCAT lists this object as'), false);
  assert.match(textOf(panels.identity), /Catalog object: ISS/);
});

test('identity shows the GCAT loading note while the catalog downloads', async () => {
  const gcat = deferred();
  const { dossier, panels } = harness({
    handler: (source) => (source === 'catalogRecord' ? gcat.promise : Promise.resolve(feed(source, sampleData[source]))),
  });
  const opening = dossier.open('identity');
  await flush();
  assert.match(textOf(panels.identity), /Loading… The first time, Khonsu downloads the whole catalog, which can take a couple of minutes\./);
  gcat.resolve(feed('catalogRecord', null));
  await opening;
  await flush();
  assert.match(textOf(panels.identity), /GCAT has no entry for this satellite\./);
});

test('identity lists other Wikidata matches', async () => {
  const { dossier, panels } = harness({
    handler: (source) => Promise.resolve(feed(source, source === 'satelliteDetails' ? [sampleData.satelliteDetails[0], { name: 'ISS module' }, { name: 'ISS node' }] : sampleData[source])),
  });
  await dossier.open('identity');
  await flush();
  assert.match(textOf(panels.identity), /Also matched: ISS module, ISS node/);
});

test('selectionChanged clears the scene and fetches only for a dossier tab', async () => {
  const { dossier, calls, env } = harness();
  await dossier.selectionChanged('track');
  assert.equal(env.clears, 1);
  assert.equal(calls.length, 0);
  await dossier.selectionChanged('radio');
  assert.equal(env.clears, 2);
  assert.deepEqual(calls, [{ source: 'transmitters', id: '25544' }]);
});

test('radio shows no active transmitters', async () => {
  const { dossier, panels } = harness({ handler: (source) => Promise.resolve(feed(source, [{ id: 2, description: 'Old', alive: false, status: 'inactive' }])) });
  await dossier.open('radio');
  await flush();
  assert.match(textOf(panels.radio), /SatNOGS lists no active transmitters for this satellite\./);
});

test('radio truncates to eight transmitters and reports the rest', async () => {
  const many = Array.from({ length: 10 }, (_, index) => ({ id: index, description: `TX ${index}`, alive: true, status: 'active', downlink_hz: 437000000, mode: 'FM' }));
  const { dossier, panels } = harness({ handler: (source) => Promise.resolve(feed(source, many)) });
  await dossier.open('radio');
  await flush();
  const text = textOf(panels.radio);
  assert.match(text, /10 active transmitters/);
  assert.match(text, /TX 0: /);
  assert.equal(text.includes('TX 8'), false);
  assert.match(text, /\+ 2 more/);
});

test('scenes lists scene groups and focuses the scene when clicked', async () => {
  const { dossier, panels, env } = harness();
  await dossier.open('sees');
  await flush();
  const text = textOf(panels.sees);
  assert.match(text, /acquisition locations, not the pictures themselves\./);
  assert.match(text, /near 5\.0°, 6\.0°/);
  assert.match(text, /near 1\.2°, 2\.3° · 2 tiles · 20–40% cloud/);
  assert.match(text, /time 2026-11-09T12:00:00\.000Z/);

  const rows = panels.sees.children.find((node) => node.className === 'scene-list').children;
  assert.equal(rows.length, 2);
  assert.equal(rows[0].type, 'button');
  assert.equal(rows[0].className, 'scene-row');
  assert.equal(rows[0].dataset.focus, `scene:${Date.parse('2026-11-09T12:00:00Z')}`);

  rows[1].click();
  assert.deepEqual(env.focused, [{ lat: 1.23, lon: 2.34 }]);
  assert.equal(rows[0].getAttribute('aria-pressed'), 'false');
  assert.equal(rows[1].getAttribute('aria-pressed'), 'true');
  rows[0].click();
  assert.deepEqual(env.focused.at(-1), { lat: 5, lon: 6 });
  assert.equal(rows[0].getAttribute('aria-pressed'), 'true');
  assert.equal(rows[1].getAttribute('aria-pressed'), 'false');
});

test('sees shows the Earth Search note when there are no scenes', async () => {
  const { dossier, panels } = harness({ handler: (source) => Promise.resolve(feed(source, [])) });
  await dossier.open('sees');
  await flush();
  assert.match(textOf(panels.sees), /Earth Search lists scenes from Sentinel-2 and Landsat satellites\. This satellite is not one of them\./);
});

test('hasSees is true only for a selected satellite in imagingIds', async () => {
  const yes = harness({ imagingIds: new Set(['25544']) });
  assert.equal(await yes.dossier.hasSees(), true);
  const no = harness({ imagingIds: new Set(['1']) });
  assert.equal(await no.dossier.hasSees(), false);
  const none = harness({ selected: null, imagingIds: new Set(['25544']) });
  assert.equal(await none.dossier.hasSees(), false);
});
