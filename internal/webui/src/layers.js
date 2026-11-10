// The Layers panel: one base picture, any number of near-live cloud layers and an aurora estimate.
// Choices are saved in storage and sent to the globe; the credit line names what is showing.

const STORAGE_KEY = 'khonsu.layers';
const TRUE_COLOR = 'true-color';
const LOADING = 'Loading…';
const GLOBE_OFF = 'The globe is unavailable, so layers are turned off.';
const LIVE_OFF = 'Live data is off while serving a local file, so pictures and the aurora are unavailable.';
const LIST_FAILED = 'Could not load the list of pictures.';
const WARNING = 'Could not load this picture.';
const AURORA_NOTE = "A rough boundary from NOAA's Kp index, not a forecast.";
const AURORA_CREDIT = 'Aurora estimated from NOAA SWPC Kp';

export function createLayers({ element, panel, credit, catalog, storage, globe, fetchHead = (url) => fetch(url, { method: 'HEAD' }), dataAge, now = Date.now }) {
  // The saved choices. `live` is NOAA's Kp; `tried` is a slider value kept in memory only.
  const state = { base: '', overlays: [], aurora: false, live: null, tried: null };
  const freshness = new Map();
  const warnings = new Map();
  const baseInputs = new Map();
  const overlayInputs = new Map();
  const ui = {};
  let layers = [];
  let byId = new Map();
  let active = false;
  // Bumped on every setLayers call, so a result for an older stack is dropped.
  let calls = 0;

  const imageryUrl = (id) => '/api/v1/imagery?layer=' + encodeURIComponent(id);
  const cloudIds = () => layers.filter((layer) => layer.transparent === true).map((layer) => layer.id);
  const isBaseId = (id) => byId.has(id) && byId.get(id).transparent !== true;
  const trueColor = () => (isBaseId(TRUE_COLOR) ? TRUE_COLOR : '');
  const auroraKp = () => state.tried ?? state.live;

  // Stack order: the base picture first, then overlays in catalog order.
  function stackLayers() {
    const ids = [...(state.base ? [state.base] : []), ...state.overlays];
    return ids
      .filter((id) => byId.has(id))
      .map((id) => ({ id, url: imageryUrl(id), transparent: byId.get(id).transparent === true }));
  }

  function persist() {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({ base: state.base, overlays: state.overlays, aurora: state.aurora }));
    } catch {
      // A blocked or full store must not stop the layers from working.
    }
  }

  function restore() {
    let saved = null;
    try {
      saved = JSON.parse(storage.getItem(STORAGE_KEY));
    } catch {
      saved = null;
    }
    if (!saved || typeof saved !== 'object') return;
    state.base = typeof saved.base === 'string' && (saved.base === '' || isBaseId(saved.base)) ? saved.base : '';
    const wanted = new Set(Array.isArray(saved.overlays) ? saved.overlays : []);
    state.overlays = cloudIds().filter((id) => wanted.has(id));
    state.aurora = saved.aurora === true;
  }

  function setOverlay(id, on) {
    const chosen = new Set(state.overlays);
    if (on) chosen.add(id);
    else chosen.delete(id);
    state.overlays = cloudIds().filter((cloud) => chosen.has(cloud));
  }

  function showCredit(lines) {
    credit.replaceChildren(...lines.map((line) => element('span', 'credit-line', line)));
    credit.hidden = lines.length === 0;
  }

  function renderCredit(shown) {
    const lines = shown.map((layer) => [layer.name, layer.credit, freshness.get(layer.id)].filter(Boolean).join(' · '));
    if (state.aurora) lines.push(AURORA_CREDIT);
    showCredit(lines);
  }

  // A HEAD request only reads headers; any failure just leaves the freshness out.
  async function freshnessOf(id) {
    try {
      const response = await fetchHead(imageryUrl(id));
      const headers = response.headers;
      const parts = [];
      const fetchedAt = headers.get('X-Khonsu-Fetched-At');
      if (fetchedAt && !Number.isNaN(Date.parse(fetchedAt))) parts.push(`updated ${dataAge(fetchedAt, now())}`);
      if (headers.get('X-Khonsu-Stale') === 'true') parts.push('saved copy');
      return parts.join(' · ');
    } catch {
      return '';
    }
  }

  function setWarning(id, failed) {
    const node = warnings.get(id);
    if (!node) return;
    node.hidden = !failed;
    node.textContent = failed ? WARNING : '';
  }

  function settle(token, stack, results) {
    if (token !== calls) return;
    for (const layer of stack) setWarning(layer.id, results[layer.id] !== 'ok');
    const shown = stack.filter((layer) => results[layer.id] === 'ok').map((layer) => byId.get(layer.id));
    renderCredit(shown);
    Promise.all(shown.map(async (layer) => {
      const line = await freshnessOf(layer.id);
      if (token === calls) freshness.set(layer.id, line);
    })).then(() => {
      if (token === calls) renderCredit(shown);
    });
  }

  // Sends the whole stack to the globe. Every change goes through here, including an empty stack.
  function apply() {
    const stack = stackLayers();
    const token = ++calls;
    const ids = new Set(stack.map((layer) => layer.id));
    for (const id of warnings.keys()) {
      if (!ids.has(id)) setWarning(id, false);
    }
    for (const id of ids) freshness.delete(id);
    showCredit([LOADING]);
    globe.setAurora(state.aurora ? auroraKp() : null);
    let request;
    try {
      request = Promise.resolve(globe.setLayers(stack));
    } catch (error) {
      request = Promise.reject(error);
    }
    request.then(
      (results) => settle(token, stack, results ?? {}),
      () => settle(token, stack, {}),
    );
  }

  function commit() {
    persist();
    sync();
    apply();
  }

  function auroraNote() {
    if (state.tried !== null) return `Kp ${state.tried.toFixed(1)}, trying a value`;
    if (state.live !== null) return `Kp ${state.live.toFixed(1)}, now`;
    return 'Kp is not available yet';
  }

  // Makes the controls show the state. Only runs once the panel is rendered.
  function sync() {
    if (!active) return;
    for (const [id, input] of baseInputs) input.checked = id === state.base;
    for (const [id, input] of overlayInputs) input.checked = state.overlays.includes(id);
    ui.aurora.checked = state.aurora;
    ui.controls.hidden = !state.aurora;
    ui.slider.value = String(auroraKp() ?? 0);
    ui.kpNote.textContent = auroraNote();
    ui.back.hidden = state.tried === null;
  }

  function choiceRow({ type, name, value, title, note = null, warn = false }) {
    const input = element('input', null, null);
    input.setAttribute('type', type);
    input.setAttribute('name', name);
    input.value = value;
    const label = element('label', 'layer-row', null);
    label.append(input, element('span', null, title));
    if (note) label.append(element('span', 'note', note));
    let warning = null;
    if (warn) {
      warning = element('span', 'note is-warning', null);
      warning.hidden = true;
      label.append(warning);
    }
    return { label, input, warning };
  }

  const PRESETS = [
    ['Clouds now', () => {
      state.base = trueColor();
      state.overlays = cloudIds();
    }],
    ["Yesterday's Earth", () => {
      state.base = trueColor();
      state.overlays = [];
    }],
    ['Plain', () => {
      state.base = '';
      state.overlays = [];
      state.aurora = false;
      state.tried = null;
    }],
  ];

  function render() {
    baseInputs.clear();
    overlayInputs.clear();
    warnings.clear();

    const baseGroup = element('fieldset', 'layer-group', null);
    baseGroup.append(element('legend', null, 'Base picture'));
    const plain = choiceRow({ type: 'radio', name: 'layer-base', value: '', title: 'Plain globe' });
    plain.input.addEventListener('change', () => {
      if (!plain.input.checked) return;
      state.base = '';
      commit();
    });
    baseInputs.set('', plain.input);
    baseGroup.append(plain.label);
    for (const layer of layers.filter((item) => item.transparent !== true)) {
      const row = choiceRow({ type: 'radio', name: 'layer-base', value: layer.id, title: layer.name, note: layer.description, warn: true });
      row.input.addEventListener('change', () => {
        if (!row.input.checked) return;
        state.base = layer.id;
        commit();
      });
      baseInputs.set(layer.id, row.input);
      warnings.set(layer.id, row.warning);
      baseGroup.append(row.label);
    }

    const cloudGroup = element('fieldset', 'layer-group', null);
    cloudGroup.append(element('legend', null, 'Near-live clouds'));
    for (const layer of layers.filter((item) => item.transparent === true)) {
      const row = choiceRow({ type: 'checkbox', name: 'layer-overlay', value: layer.id, title: layer.name, note: layer.description, warn: true });
      row.input.addEventListener('change', () => {
        setOverlay(layer.id, row.input.checked);
        commit();
      });
      overlayInputs.set(layer.id, row.input);
      warnings.set(layer.id, row.warning);
      cloudGroup.append(row.label);
    }

    const overlayGroup = element('fieldset', 'layer-group', null);
    overlayGroup.append(element('legend', null, 'Overlays'));
    const aurora = choiceRow({ type: 'checkbox', name: 'layer-aurora', value: 'aurora', title: 'Aurora, estimated from Kp' });
    aurora.input.addEventListener('change', () => {
      state.aurora = aurora.input.checked;
      if (!state.aurora) state.tried = null;
      commit();
    });
    overlayGroup.append(aurora.label, element('p', 'note', AURORA_NOTE));

    const slider = element('input', null, null);
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', '0');
    slider.setAttribute('max', '9');
    slider.setAttribute('step', '0.33');
    slider.setAttribute('aria-label', 'Try a Kp value');
    const kpNote = element('p', 'note', null);
    const back = element('button', null, 'Back to now');
    back.setAttribute('type', 'button');
    back.hidden = true;
    const controls = element('div', 'aurora-controls', null);
    controls.append(slider, kpNote, back);
    controls.hidden = true;
    overlayGroup.append(controls);

    // Moving the slider only changes the aurora; it is not saved.
    slider.addEventListener('input', () => {
      const value = Number(slider.value);
      if (!Number.isFinite(value)) return;
      state.tried = value;
      sync();
      globe.setAurora(auroraKp());
    });
    back.addEventListener('click', () => {
      state.tried = null;
      sync();
      globe.setAurora(auroraKp());
    });

    const presets = element('div', 'layer-presets', null);
    presets.append(...PRESETS.map(([title, change]) => {
      const button = element('button', null, title);
      button.setAttribute('type', 'button');
      button.addEventListener('click', () => {
        change();
        commit();
      });
      return button;
    }));

    ui.aurora = aurora.input;
    ui.slider = slider;
    ui.kpNote = kpNote;
    ui.back = back;
    ui.controls = controls;

    panel.replaceChildren(element('h2', 'eyebrow', 'Layers'), baseGroup, cloudGroup, overlayGroup, presets);
  }

  async function start() {
    if (!globe) {
      panel.replaceChildren(element('p', 'note', GLOBE_OFF));
      credit.hidden = true;
      return;
    }
    let data = null;
    try {
      data = await catalog;
    } catch {
      data = null;
    }
    const heading = element('h2', 'eyebrow', 'Layers');
    if (!data) {
      panel.replaceChildren(heading, element('p', 'note', LIST_FAILED));
      credit.hidden = true;
      return;
    }
    if (!data.liveData) {
      panel.replaceChildren(heading, element('p', 'note', LIVE_OFF));
      credit.hidden = true;
      return;
    }
    layers = Array.isArray(data.layers) ? data.layers : [];
    byId = new Map(layers.map((layer) => [layer.id, layer]));
    restore();
    render();
    active = true;
    sync();
    if (state.base || state.overlays.length || state.aurora) apply();
    else showCredit([]);
  }

  // The live Kp from NOAA. A tried value is kept, so new readings do not override it.
  function setKp(kp) {
    state.live = Number.isFinite(kp) ? kp : null;
    if (!active) return;
    if (state.aurora && state.tried === null) globe.setAurora(state.live);
    sync();
  }

  function selection() {
    return { base: state.base, overlays: [...state.overlays], aurora: state.aurora };
  }

  return { start, setKp, selection };
}
