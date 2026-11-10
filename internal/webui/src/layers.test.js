import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createLayers } from './layers.js';

// A minimal stand-in for the DOM: enough for the panel's append, replaceChildren, attributes,
// events, form state and textContent.
class FakeNode {
  constructor(tag, className, text) {
    this.tagName = tag;
    this.className = className ?? '';
    this.children = [];
    this.attributes = {};
    this.listeners = {};
    this.checked = false;
    this.value = '';
    this.hidden = false;
    this.text = text ?? '';
  }

  get textContent() {
    return this.text + this.children.map((child) => child.textContent).join('');
  }

  set textContent(value) {
    this.children = [];
    this.text = value == null ? '' : String(value);
  }

  append(...nodes) {
    this.children.push(...nodes);
  }

  replaceChildren(...nodes) {
    this.children = [...nodes];
    this.text = '';
  }

  setAttribute(name, value) {
    this.attributes[name] = String(value);
  }

  addEventListener(type, handler) {
    (this.listeners[type] ??= []).push(handler);
  }
}

const element = (tag, className, text) => new FakeNode(tag, className, text);
const dispatch = (node, type) => {
  for (const handler of node.listeners[type] ?? []) handler({ target: node });
};
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

function find(root, predicate) {
  if (predicate(root)) return root;
  for (const child of root.children) {
    const hit = find(child, predicate);
    if (hit) return hit;
  }
  return null;
}

const radio = (panel, value) => find(panel, (node) => node.attributes.name === 'layer-base' && node.value === value);
const overlay = (panel, value) => find(panel, (node) => node.attributes.name === 'layer-overlay' && node.value === value);
const aurora = (panel) => find(panel, (node) => node.attributes.name === 'layer-aurora');
const slider = (panel) => find(panel, (node) => node.attributes['aria-label'] === 'Try a Kp value');
const button = (panel, text) => find(panel, (node) => node.tagName === 'button' && node.textContent === text);
const paragraph = (panel, text) => find(panel, (node) => node.tagName === 'p' && node.textContent === text);
const warningOf = (panel, id) => {
  const row = find(panel, (node) => node.className === 'layer-row' && node.children.some((child) => child.value === id));
  return row.children.find((child) => child.className === 'note is-warning');
};
const creditLines = (credit) => credit.children.map((child) => child.textContent);
const toggle = (node, checked) => {
  node.checked = checked;
  dispatch(node, 'change');
};

const LAYERS = [
  { id: 'true-color', name: 'True colour', source_id: 'nasa', credit: 'NASA GIBS', description: 'Daily, cloud-free', transparent: false },
  { id: 'goes-east', name: 'GOES East clouds', source_id: 'noaa', credit: 'NOAA', description: 'Near live', transparent: true },
  { id: 'goes-west', name: 'GOES West clouds', source_id: 'noaa', credit: 'NOAA', description: 'Near live', transparent: true },
  { id: 'himawari', name: 'Himawari clouds', source_id: 'jma', credit: 'JMA', description: 'Near live', transparent: true },
];

const okAll = (stack) => Object.fromEntries(stack.map((layer) => [layer.id, 'ok']));

function fakeGlobe(respond = okAll) {
  const calls = { layers: [], stacks: [], aurora: [] };
  return {
    calls,
    setLayers(stack) {
      calls.layers.push(stack.map((layer) => layer.id));
      calls.stacks.push(stack.map((layer) => ({ ...layer })));
      return Promise.resolve(respond(stack));
    },
    setAurora(kp) {
      calls.aurora.push(kp);
    },
  };
}

function memoryStorage(saved) {
  const data = new Map();
  if (saved) data.set('khonsu.layers', JSON.stringify(saved));
  return {
    data,
    getItem: (key) => (data.has(key) ? data.get(key) : null),
    setItem: (key, value) => data.set(key, String(value)),
  };
}

// The Last-Modified style headers for every picture: goes-west is a saved copy.
function fakeHead() {
  const urls = [];
  const head = (url) => {
    urls.push(url);
    const headers = {
      'X-Khonsu-Fetched-At': '2026-11-10T09:00:00Z',
      'X-Khonsu-Stale': url.includes('goes-west') ? 'true' : null,
    };
    return Promise.resolve({ headers: { get: (name) => headers[name] ?? null } });
  };
  head.urls = urls;
  return head;
}

function setup({ catalog = { liveData: true, layers: LAYERS }, saved, storage, globe = undefined, respond } = {}) {
  const panel = element('section');
  const credit = element('p');
  const store = storage ?? memoryStorage(saved);
  const globeFake = globe === undefined ? fakeGlobe(respond) : globe;
  const head = fakeHead();
  const layers = createLayers({
    element,
    panel,
    credit,
    catalog: Promise.resolve(catalog),
    storage: store,
    globe: globeFake,
    fetchHead: head,
    dataAge: () => '3 h ago',
  });
  return { layers, panel, credit, store, globe: globeFake, head };
}

test('the default makes no image request', async () => {
  const { layers, panel, credit, globe, head } = setup();
  await layers.start();
  await flush();
  assert.deepEqual(globe.calls.layers, []);
  assert.deepEqual(globe.calls.aurora, []);
  assert.deepEqual(head.urls, []);
  assert.equal(credit.hidden, true);
  assert.equal(panel.children[0].textContent, 'Layers');
  assert.deepEqual(layers.selection(), { base: '', overlays: [], aurora: false });
});

test('a saved selection drops unknown ids and restores the stack', async () => {
  const saved = { base: 'nope', overlays: ['goes-east', 'bogus', 'himawari', 'goes-east'], aurora: true };
  const { layers, globe } = setup({ saved });
  await layers.start();
  await flush();
  assert.deepEqual(layers.selection(), { base: '', overlays: ['goes-east', 'himawari'], aurora: true });
  assert.deepEqual(globe.calls.layers, [['goes-east', 'himawari']]);
  assert.deepEqual(globe.calls.stacks[0][0], { id: 'goes-east', url: '/api/v1/imagery?layer=goes-east', transparent: true });
  assert.deepEqual(globe.calls.aurora, [null]);
});

test('presets set the expected stacks and save them', async () => {
  const { layers, panel, store, globe } = setup();
  await layers.start();
  await flush();

  dispatch(button(panel, 'Clouds now'), 'click');
  await flush();
  assert.deepEqual(layers.selection(), { base: 'true-color', overlays: ['goes-east', 'goes-west', 'himawari'], aurora: false });
  assert.deepEqual(globe.calls.layers.at(-1), ['true-color', 'goes-east', 'goes-west', 'himawari']);
  assert.equal(radio(panel, 'true-color').checked, true);
  assert.equal(overlay(panel, 'goes-west').checked, true);
  assert.deepEqual(JSON.parse(store.data.get('khonsu.layers')), { base: 'true-color', overlays: ['goes-east', 'goes-west', 'himawari'], aurora: false });

  dispatch(button(panel, "Yesterday's Earth"), 'click');
  await flush();
  assert.deepEqual(layers.selection(), { base: 'true-color', overlays: [], aurora: false });
  assert.deepEqual(globe.calls.layers.at(-1), ['true-color']);
  assert.equal(overlay(panel, 'goes-east').checked, false);

  dispatch(button(panel, 'Plain'), 'click');
  await flush();
  assert.deepEqual(layers.selection(), { base: '', overlays: [], aurora: false });
  assert.deepEqual(globe.calls.layers.at(-1), []);
  assert.equal(radio(panel, '').checked, true);
});

test('overlays follow the catalog order, not the click order', async () => {
  const { layers, panel, globe } = setup();
  await layers.start();
  await flush();
  toggle(overlay(panel, 'himawari'), true);
  await flush();
  toggle(overlay(panel, 'goes-east'), true);
  await flush();
  assert.deepEqual(layers.selection().overlays, ['goes-east', 'himawari']);
  assert.deepEqual(globe.calls.layers.at(-1), ['goes-east', 'himawari']);
});

test('a stale setLayers result is ignored', async () => {
  const pending = [];
  const { layers, panel, credit } = setup({
    respond: (stack) => new Promise((resolve) => pending.push({ resolve, ids: stack.map((layer) => layer.id) })),
  });
  await layers.start();
  await flush();
  toggle(overlay(panel, 'goes-east'), true);
  toggle(overlay(panel, 'himawari'), true);
  assert.equal(pending.length, 2);
  assert.equal(credit.hidden, false);
  assert.deepEqual(creditLines(credit), ['Loading…']);

  pending[1].resolve({ 'goes-east': 'ok', himawari: 'ok' });
  await flush();
  pending[0].resolve({ 'goes-east': new Error('late'), himawari: new Error('late') });
  await flush();

  assert.deepEqual(creditLines(credit), ['GOES East clouds · NOAA · updated 3 h ago', 'Himawari clouds · JMA · updated 3 h ago']);
  assert.equal(warningOf(panel, 'goes-east').hidden, true);
  assert.equal(warningOf(panel, 'himawari').hidden, true);
});

test('a failed layer is marked, and the mark clears after it loads', async () => {
  let fail = true;
  const { layers, panel, credit } = setup({
    respond: (stack) => Object.fromEntries(stack.map((layer) => [layer.id, fail && layer.id === 'goes-east' ? new Error('down') : 'ok'])),
  });
  await layers.start();
  await flush();
  toggle(overlay(panel, 'goes-east'), true);
  await flush();

  const warning = warningOf(panel, 'goes-east');
  assert.equal(warning.hidden, false);
  assert.equal(warning.textContent, 'Could not load this picture.');
  assert.equal(warning.className, 'note is-warning');
  assert.equal(overlay(panel, 'goes-east').checked, true);
  assert.equal(credit.hidden, true);

  fail = false;
  toggle(overlay(panel, 'goes-east'), false);
  await flush();
  assert.equal(warningOf(panel, 'goes-east').hidden, true);
  toggle(overlay(panel, 'goes-east'), true);
  await flush();
  assert.equal(warningOf(panel, 'goes-east').hidden, true);
  assert.equal(warningOf(panel, 'goes-east').textContent, '');
  assert.deepEqual(creditLines(credit), ['GOES East clouds · NOAA · updated 3 h ago']);
});

test('the credit line lists only shown layers, then the aurora credit', async () => {
  const { layers, panel, credit } = setup({
    respond: (stack) => Object.fromEntries(stack.map((layer) => [layer.id, layer.id === 'goes-east' ? new Error('down') : 'ok'])),
  });
  await layers.start();
  await flush();
  assert.equal(credit.hidden, true);

  toggle(radio(panel, 'true-color'), true);
  toggle(overlay(panel, 'goes-east'), true);
  toggle(overlay(panel, 'goes-west'), true);
  toggle(aurora(panel), true);
  await flush();

  assert.equal(credit.hidden, false);
  assert.deepEqual(creditLines(credit), [
    'True colour · NASA GIBS · updated 3 h ago',
    'GOES West clouds · NOAA · updated 3 h ago · saved copy',
    'Aurora estimated from NOAA SWPC Kp',
  ]);
});

test('the aurora slider sets the aurora and Back to now resets to live', async () => {
  const { layers, panel, globe } = setup();
  await layers.start();
  await flush();
  layers.setKp(2.7);
  toggle(aurora(panel), true);
  await flush();
  assert.equal(globe.calls.aurora.at(-1), 2.7);
  assert.ok(paragraph(panel, 'Kp 2.7, now'));
  assert.ok(slider(panel));
  assert.equal(button(panel, 'Back to now').hidden, true);

  slider(panel).value = '6';
  dispatch(slider(panel), 'input');
  assert.equal(globe.calls.aurora.at(-1), 6);
  assert.ok(paragraph(panel, 'Kp 6.0, trying a value'));
  assert.equal(button(panel, 'Back to now').hidden, false);
  assert.equal(layers.selection().aurora, true);

  dispatch(button(panel, 'Back to now'), 'click');
  assert.equal(globe.calls.aurora.at(-1), 2.7);
  assert.ok(paragraph(panel, 'Kp 2.7, now'));
  assert.equal(button(panel, 'Back to now').hidden, true);
});

test('an aurora with no Kp says so and sends null', async () => {
  const { layers, panel, globe } = setup();
  await layers.start();
  await flush();
  toggle(aurora(panel), true);
  await flush();
  assert.equal(globe.calls.aurora.at(-1), null);
  assert.ok(paragraph(panel, 'Kp is not available yet'));
});

test('setKp updates the live value without overriding a tried value', async () => {
  const { layers, panel, globe } = setup({ saved: { base: '', overlays: [], aurora: true } });
  layers.setKp(2.7);
  await layers.start();
  await flush();
  assert.deepEqual(globe.calls.aurora, [2.7]);

  slider(panel).value = '6';
  dispatch(slider(panel), 'input');
  const sent = globe.calls.aurora.length;
  layers.setKp(3.3);
  assert.equal(globe.calls.aurora.length, sent);
  assert.ok(paragraph(panel, 'Kp 6.0, trying a value'));

  dispatch(button(panel, 'Back to now'), 'click');
  assert.equal(globe.calls.aurora.at(-1), 3.3);
  assert.ok(paragraph(panel, 'Kp 3.3, now'));
});

test('live data off makes no globe calls', async () => {
  const { layers, panel, credit, globe } = setup({ catalog: { liveData: false, layers: LAYERS } });
  await layers.start();
  layers.setKp(2);
  await flush();
  assert.deepEqual(globe.calls.layers, []);
  assert.deepEqual(globe.calls.aurora, []);
  assert.equal(credit.hidden, true);
  assert.ok(find(panel, (node) => node.textContent === 'Live data is off while serving a local file, so pictures and the aurora are unavailable.'));
});

test('a failed catalog says so and makes no globe calls', async () => {
  const { layers, panel, globe } = setup({ catalog: null });
  await layers.start();
  assert.ok(find(panel, (node) => node.textContent === 'Could not load the list of pictures.'));
  assert.deepEqual(globe.calls.layers, []);
});

test('no globe shows only the note', async () => {
  const { layers, panel, credit } = setup({ globe: null });
  await layers.start();
  assert.equal(panel.children.length, 1);
  assert.equal(panel.children[0].textContent, 'The globe is unavailable, so layers are turned off.');
  assert.equal(credit.hidden, true);
  layers.setKp(3);
  assert.deepEqual(layers.selection(), { base: '', overlays: [], aurora: false });
});

test('storage that throws does not break the panel', async () => {
  const throwing = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
  };
  const { layers, panel, globe } = setup({ storage: throwing });
  await layers.start();
  await flush();
  toggle(overlay(panel, 'goes-east'), true);
  await flush();
  assert.deepEqual(globe.calls.layers.at(-1), ['goes-east']);
  assert.deepEqual(layers.selection(), { base: '', overlays: ['goes-east'], aurora: false });
});
