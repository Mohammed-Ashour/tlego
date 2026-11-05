import { createApi, isAbort } from './api.js';
import { createGlobe } from './globe.js';
import {
  annotatePasses, buildUrlState, canonicalId, clamp, compassPoint, elementAgeDays, filterSatellites, formatClock, formatCoordinate, formatCountdown, formatDay, formatDuration,
  lookAt, MAX_TRACKED, needsNewWindow, nextColor, parseObserver, parseUrlState, readStoredObserver, sunlitAt, validId, windowFrom, zoneLabel,
} from './logic.js';
import { sampleAt } from '../../../pkg/templates/viewer-state.js';
import { renderSky } from './sky.js';

const LIST_LIMIT = 200;
const PASS_REFRESH_MS = 10 * 60000;
const DEFAULT_ID = '25544';
const byId = (id) => document.getElementById(id);
const api = createApi();

const state = {
  tracked: new Map(),
  selected: null,
  observer: readStoredObserver(localStorage),
  utc: localStorage.getItem('tlego.utc') === '1',
  window: windowFrom(Date.now()),
  time: Date.now(),
  live: true,
  playing: false,
  groups: [],
  items: [],
  isSearchResult: false,
  tab: 'now',
  report: null,
  plan: null,
  planError: null,
  planLoading: false,
  planFor: null,
  planAt: 0,
  activePass: null,
};

let globe = null;
let lastDomUpdate = 0;

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function trackedIds() {
  return [...state.tracked.keys()];
}

function selectedEntry() {
  return state.tracked.get(state.selected) ?? null;
}

function syncUrl() {
  history.replaceState(null, '', buildUrlState(trackedIds(), state.selected) || location.pathname);
}

function dayAndClock(time) {
  return `${formatDay(time, state.utc)} ${formatClock(time, state.utc)}`;
}

// Tracking

async function loadTrack(entry) {
  entry.error = null;
  entry.loading = true;
  renderTracked();
  try {
    const result = await api.track(entry.id, state.window.start, state.observer);
    entry.track = result.data;
    entry.name = result.data.name || entry.name;
    entry.provenance = result.provenance;
    entry.warnings = result.warnings;
    if (state.tracked.get(entry.id) !== entry) return;
    globe?.setTrack(entry.id, result.data, entry.color);
    globe?.select(state.selected);
    if (entry.framePending) {
      entry.framePending = false;
      globe?.home(entry.id);
    }
  } catch (error) {
    if (isAbort(error)) return;
    entry.error = error.message;
    entry.track = null;
    globe?.removeTrack(entry.id);
  } finally {
    entry.loading = false;
    if (state.tracked.get(entry.id) === entry) {
      renderTracked();
      renderCatalog();
      renderInspector();
      renderStatus();
    }
  }
}

function addSatellite(id, name) {
  const key = canonicalId(id);
  if (state.tracked.has(key)) {
    select(key);
    return;
  }
  if (state.tracked.size >= MAX_TRACKED) {
    setCatalogStatus(`You can track up to ${MAX_TRACKED} satellites. Remove one to add another.`, 'is-warning');
    return;
  }
  const entry = { id: key, name: name || `NORAD ${key}`, color: nextColor([...state.tracked.values()].map((item) => item.color)), track: null, error: null, loading: true, framePending: true };
  state.tracked.set(key, entry);
  select(key);
  loadTrack(entry);
}

function removeSatellite(id) {
  state.tracked.delete(id);
  globe?.removeTrack(id);
  if (state.selected === id) select(trackedIds()[0] ?? null);
  else {
    syncUrl();
    renderTracked();
    renderCatalog();
    renderStatus();
  }
}

function select(id) {
  const changed = state.selected !== id;
  state.selected = id;
  globe?.select(id);
  if (changed) {
    state.report = null;
    state.plan = null;
    state.planFor = null;
    state.planError = null;
    state.activePass = null;
    if (id && state.tracked.get(id)?.track) globe?.home(id);
  }
  syncUrl();
  renderTracked();
  renderCatalog();
  renderInspector();
  renderStatus();
  refreshPlan();
  refreshReport();
}

function reloadAllTracks() {
  for (const entry of state.tracked.values()) loadTrack(entry);
}

function setWindowAround(time) {
  state.window = windowFrom(time);
  renderSliderLabels();
  reloadAllTracks();
}

// Catalog

function setCatalogStatus(message, className = '') {
  const node = byId('catalog-status');
  node.textContent = message;
  node.className = `note ${className}`;
}

async function loadGroups() {
  try {
    state.groups = await api.groups();
  } catch (error) {
    if (!isAbort(error)) setCatalogStatus(`Could not load satellite groups: ${error.message}`, 'is-error');
    return;
  }
  const select = byId('group-select');
  select.replaceChildren(...state.groups.map((name) => {
    const option = element('option', '', name);
    option.value = name;
    return option;
  }));
  const preferred = state.groups.find((name) => name === 'Space Stations') ?? state.groups[0];
  if (preferred) {
    select.value = preferred;
    await loadGroup(preferred);
  }
}

async function loadGroup(name) {
  state.items = [];
  state.isSearchResult = false;
  renderCatalog();
  setCatalogStatus(`Loading ${name}…`);
  try {
    state.items = await api.satellites(name);
    setCatalogStatus('');
  } catch (error) {
    if (isAbort(error)) return;
    setCatalogStatus(`Could not load ${name}: ${error.message}`, 'is-error');
  }
  renderCatalog();
}

async function searchAllGroups(query) {
  state.items = [];
  state.isSearchResult = true;
  renderCatalog();
  setCatalogStatus('Searching every group. The first search can take up to a minute.');
  try {
    const result = await api.search(query);
    state.items = result.satellites;
    const partial = result.groups_covered < result.groups_total;
    setCatalogStatus(
      partial ? `Searched ${result.groups_covered} of ${result.groups_total} groups, so more matches may exist.` : `${result.satellites.length} matches across all groups.`,
      partial ? 'is-warning' : '',
    );
  } catch (error) {
    if (isAbort(error)) return;
    setCatalogStatus(`Search failed: ${error.message}`, 'is-error');
  }
  renderCatalog();
}

function renderCatalog() {
  const query = byId('filter-input').value;
  const matches = state.isSearchResult ? state.items : filterSatellites(state.items, query);
  const list = byId('catalog-list');
  list.replaceChildren(...matches.slice(0, LIST_LIMIT).map((item) => {
    const id = canonicalId(item.norad_id);
    const isTracked = state.tracked.has(id);
    const row = element('li');
    const button = element('button', 'catalog-row');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(isTracked));
    button.disabled = !isTracked && state.tracked.size >= MAX_TRACKED;
    button.title = isTracked ? `Stop tracking ${item.name}` : `Track ${item.name}`;
    const mark = element('span', 'catalog-mark', isTracked ? '✓' : '+');
    mark.setAttribute('aria-hidden', 'true');
    button.append(mark, element('span', 'catalog-name', item.name), element('span', 'catalog-id', item.norad_id));
    button.addEventListener('click', () => (isTracked ? removeSatellite(id) : addSatellite(id, item.name)));
    row.append(button);
    return row;
  }));
  if (matches.length > LIST_LIMIT) {
    list.append(element('li', 'note', `Showing ${LIST_LIMIT} of ${matches.length}. Filter to narrow the list.`));
  }
  const actions = byId('catalog-actions');
  actions.replaceChildren();
  const trimmed = query.trim();
  if (validId(trimmed) && !state.tracked.has(canonicalId(trimmed))) {
    const direct = element('button', 'text-button', `Track NORAD ${canonicalId(trimmed)}`);
    direct.type = 'button';
    direct.disabled = state.tracked.size >= MAX_TRACKED;
    direct.addEventListener('click', () => addSatellite(trimmed));
    actions.append(direct);
  }
  if (trimmed && !state.isSearchResult) {
    const all = element('button', 'text-button', 'Search all groups');
    all.type = 'button';
    all.addEventListener('click', () => searchAllGroups(trimmed));
    actions.append(all);
  }
}

function renderTracked() {
  const list = byId('tracked-list');
  if (!state.tracked.size) {
    list.replaceChildren(element('li', 'note', 'Nothing yet. Pick a satellite below.'));
    return;
  }
  list.replaceChildren(...[...state.tracked.values()].map((entry) => {
    const row = element('li', `tracked-row${entry.id === state.selected ? ' is-selected' : ''}`);
    const choose = element('button', 'tracked-select');
    choose.type = 'button';
    choose.setAttribute('aria-current', String(entry.id === state.selected));
    const dot = element('span', 'dot');
    dot.style.setProperty('--color', entry.color);
    choose.append(dot, element('span', 'tracked-name', entry.loading && !entry.track ? `${entry.name} · loading` : entry.name));
    if (entry.error) choose.append(element('span', 'tracked-error', entry.error));
    choose.addEventListener('click', () => select(entry.id));
    const remove = element('button', 'row-action', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Stop tracking ${entry.name}`);
    remove.title = `Stop tracking ${entry.name}`;
    remove.addEventListener('click', () => removeSatellite(entry.id));
    row.append(choose, remove);
    return row;
  }));
}

// Inspector

function setReadouts(container, rows) {
  // Reuse nodes, because this runs several times a second and screen readers
  // should not treat each update as new content.
  while (container.children.length > rows.length) container.lastElementChild.remove();
  rows.forEach(([label, value, tone], index) => {
    let row = container.children[index];
    if (!row) {
      row = element('div');
      row.append(element('dt'), element('dd'));
      container.append(row);
    }
    row.children[0].textContent = label;
    row.children[1].textContent = value;
    row.children[1].className = tone || '';
  });
}

function renderNow() {
  const entry = selectedEntry();
  const note = byId('now-note');
  const samples = entry?.track?.samples;
  if (!samples?.length) {
    setReadouts(byId('now-readouts'), []);
    note.textContent = entry?.error ?? (entry ? 'Loading…' : 'Add a satellite to see its position.');
    note.className = `note${entry?.error ? ' is-error' : ''}`;
    return;
  }
  const time = clamp(state.time, Date.parse(samples[0].time), Date.parse(samples.at(-1).time));
  const point = sampleAt(samples, time);
  const rows = [
    ['Latitude', formatCoordinate(point.latitude_deg, 'N', 'S')],
    ['Longitude', formatCoordinate(point.longitude_deg, 'E', 'W')],
    ['Altitude', `${point.altitude_km.toFixed(1)} km`],
    ['Speed', `${point.speed_km_s.toFixed(3)} km/s`],
    ['Sunlight', sunlitAt(samples, time) ? 'Sunlit' : 'In Earth’s shadow'],
  ];
  const look = lookAt(samples, time);
  if (look) {
    rows.push(['Direction', `${compassPoint(look.azimuth)} (${look.azimuth.toFixed(1)}°)`]);
    rows.push(['Elevation', `${look.elevation.toFixed(1)}°`, look.elevation > 0 ? 'is-good' : '']);
  }
  setReadouts(byId('now-readouts'), rows);
  const age = elementAgeDays(entry.provenance.element_epoch, time);
  const messages = [];
  if (!look) messages.push('Set your location to see where to look.');
  if (Math.abs(age) > 3) messages.push(`These elements are ${Math.abs(age).toFixed(0)} days from the displayed time, so positions may be well off.`);
  for (const warning of entry.warnings ?? []) messages.push(warning.message);
  note.textContent = messages.join(' ');
  note.className = `note${Math.abs(age) > 3 || entry.warnings?.length ? ' is-warning' : ''}`;
  globe?.setSightLine(Boolean(look && look.elevation > 0));
}

function locationPrompt(container) {
  const box = element('div', 'pass-summary');
  box.append(element('strong', '', 'Where are you?'), element('span', '', 'Set your location to see when this satellite passes overhead.'));
  container.append(box);
  const button = element('button', 'text-button', 'Set location');
  button.type = 'button';
  button.style.marginTop = '10px';
  button.addEventListener('click', openObserverDialog);
  container.append(button);
}

function nextVisible() {
  const passes = state.plan?.tonight?.passes ?? [];
  return passes.find((pass) => Date.parse(pass.end.at) > Date.now()) ?? null;
}

function renderPasses() {
  const container = byId('passes-content');
  container.replaceChildren();
  const entry = selectedEntry();
  if (!entry) {
    container.append(element('p', 'note', 'Add a satellite to see its passes.'));
    return;
  }
  if (!state.observer) {
    locationPrompt(container);
    return;
  }
  if (state.planError) {
    container.append(element('p', 'note is-error', state.planError));
    const retry = element('button', 'text-button', 'Try again');
    retry.type = 'button';
    retry.addEventListener('click', () => refreshPlan(true));
    container.append(retry);
    return;
  }
  if (!state.plan) {
    container.append(element('p', 'note', 'Calculating passes…'));
    return;
  }
  const { tonight, passes } = state.plan;
  const visible = nextVisible();
  const summary = element('div', `pass-summary${visible ? ' is-visible' : ''}`);
  if (visible) {
    const start = Date.parse(visible.start.at);
    summary.append(
      element('strong', '', `Visible ${formatCountdown(start, Date.now())}`),
      element('span', '', `${dayAndClock(start)}, up to ${Math.round(visible.peak.elevation_deg)}° in the ${compassPoint(visible.peak.azimuth_deg)}.`),
    );
  } else if (!tonight.dark_start) {
    summary.append(element('strong', '', 'No dark sky soon'), element('span', '', 'The Sun stays too high for the next 24 hours.'));
  } else {
    summary.append(
      element('strong', '', 'No visible passes tonight'),
      element('span', '', `Checked ${dayAndClock(Date.parse(tonight.dark_start))} to ${dayAndClock(Date.parse(tonight.dark_end))}.`),
    );
  }
  container.append(summary, element('h2', 'eyebrow section-title', `Next 48 hours · ${zoneLabel(state.utc)} time`));
  if (!passes.length) {
    container.append(element('p', 'note', 'No passes above your horizon in this period.'));
    return;
  }
  const rows = annotatePasses(passes, tonight.passes);
  for (const pass of rows.slice(0, 40)) {
    const isActive = state.activePass?.pass.start === pass.start;
    const button = element('button', 'pass-row');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(isActive));
    const start = Date.parse(pass.start);
    const end = Date.parse(pass.end);
    button.append(
      element('span', 'pass-time', `${formatDay(start, state.utc)} ${formatClock(start, state.utc).slice(0, 5)}`),
      element('span', 'pass-elevation', `${Math.round(pass.maximum_elevation_deg)}°`),
      element('span', 'pass-detail', `${compassPoint(pass.start_azimuth_deg)} to ${compassPoint(pass.end_azimuth_deg)} · ${formatDuration(end - start)}`),
    );
    if (pass.visible) button.append(element('span', 'badge', 'Visible'));
    button.addEventListener('click', () => choosePass(pass));
    container.append(button);
    if (isActive) container.append(renderActivePass());
  }
  container.append(element('p', 'note', 'Visible means sunlit, in a dark sky and at least 10° high. Weather and brightness are not considered.'));
}

function renderActivePass() {
  const box = element('div', 'sky');
  const { pass, points, error } = state.activePass;
  if (error) {
    box.append(element('p', 'note is-error', error));
    return box;
  }
  if (!points) {
    box.append(element('p', 'note', 'Loading sky path…'));
    return box;
  }
  const plot = element('div');
  renderSky(plot, points, selectedEntry()?.color ?? '#b7e4d0', pass.visible);
  const actions = element('div', 'sky-actions');
  const jump = element('button', 'text-button', 'Show on globe');
  jump.type = 'button';
  jump.addEventListener('click', () => {
    jumpTo(Date.parse(pass.maximum_at));
  });
  actions.append(jump);
  box.append(plot, actions);
  return box;
}

async function choosePass(pass) {
  if (state.activePass?.pass.start === pass.start) {
    state.activePass = null;
    renderPasses();
    return;
  }
  state.activePass = { pass, points: null };
  renderPasses();
  const id = state.selected;
  try {
    const result = await api.look(id, state.observer, pass.start, pass.end);
    if (state.activePass?.pass.start === pass.start && state.selected === id) {
      state.activePass.points = result.data.points;
      renderPasses();
    }
  } catch (error) {
    if (isAbort(error) || state.activePass?.pass.start !== pass.start) return;
    state.activePass.error = error.message;
    renderPasses();
  }
}

async function refreshPlan(force = false) {
  const id = state.selected;
  if (!id || !state.observer) {
    renderHeadline();
    return;
  }
  const key = `${id}|${state.observer.lat}|${state.observer.lon}|${state.observer.alt}`;
  if (!force && state.planFor === key && Date.now() - state.planAt < PASS_REFRESH_MS) return;
  state.planFor = key;
  state.planAt = Date.now();
  state.planError = null;
  try {
    const [tonight, passes] = await Promise.all([api.tonight(id, state.observer), api.passes(id, state.observer)]);
    if (state.planFor !== key) return;
    state.plan = { tonight: tonight.data, passes: passes.data.passes };
  } catch (error) {
    if (isAbort(error) || state.planFor !== key) return;
    state.plan = null;
    state.planError = error.message;
  }
  renderPasses();
  renderHeadline();
}

async function refreshReport() {
  const id = state.selected;
  if (!id) {
    renderOrbit();
    return;
  }
  try {
    const result = await api.report(id);
    if (state.selected !== id) return;
    state.report = result;
  } catch (error) {
    if (isAbort(error) || state.selected !== id) return;
    state.report = { error: error.message };
  }
  renderOrbit();
}

function renderOrbit() {
  const readouts = byId('orbit-readouts');
  const note = byId('orbit-note');
  const links = byId('orbit-links');
  links.replaceChildren();
  note.textContent = '';
  note.className = 'note';
  if (!state.selected) {
    setReadouts(readouts, []);
    note.textContent = 'Add a satellite to see its orbit.';
    return;
  }
  if (state.report?.error) {
    setReadouts(readouts, []);
    note.textContent = state.report.error;
    note.className = 'note is-error';
    return;
  }
  if (!state.report) {
    setReadouts(readouts, []);
    note.textContent = 'Loading…';
    return;
  }
  const { data, provenance } = state.report;
  const orbit = data.orbit;
  setReadouts(readouts, [
    ['Class (estimate)', orbit.orbit_class_estimate],
    ['Period', `${orbit.period_minutes.toFixed(1)} min`],
    ['Inclination', `${orbit.inclination_deg.toFixed(2)}°`],
    ['Apogee', `${orbit.apogee_km.toFixed(0)} km`],
    ['Perigee', `${orbit.perigee_km.toFixed(0)} km`],
    ['Eccentricity', orbit.eccentricity.toFixed(5)],
    ['Element epoch', dayAndClock(Date.parse(provenance.element_epoch))],
    ['Data source', `${provenance.source} (${provenance.cache_status})`],
  ]);
  note.textContent = 'Apogee and perigee are two-body estimates.';
  const download = element('a', '', 'Download JSON report');
  download.href = `/api/v1/report?norad_id=${encodeURIComponent(state.selected)}`;
  download.download = `tlego-${state.selected}.json`;
  links.append(download);
  if (data.map_url) {
    const map = element('a', '', 'Current position on a map');
    map.href = data.map_url;
    map.target = '_blank';
    map.rel = 'noopener noreferrer';
    links.append(map);
  }
}

function renderInspector() {
  const entry = selectedEntry();
  byId('selected-name').textContent = entry?.name ?? 'No satellite';
  byId('selected-id').textContent = entry ? `NORAD ${entry.id}` : '';
  byId('selected-swatch').style.setProperty('--color', entry?.color ?? 'transparent');
  document.title = entry ? `${entry.name} · TLEGO` : 'TLEGO';
  renderNow();
  renderPasses();
  renderOrbit();
  renderHeadline();
}

function renderHeadline() {
  const headline = byId('headline');
  headline.replaceChildren();
  const entry = selectedEntry();
  if (!entry) return;
  if (!state.observer) {
    headline.append(element('p', 'headline-title', 'See it yourself'), element('p', 'headline-main', 'When can you see it?'));
    const button = element('button', 'text-button', 'Set your location');
    button.type = 'button';
    button.addEventListener('click', openObserverDialog);
    headline.append(button);
    return;
  }
  if (!state.plan) return;
  const visible = nextVisible();
  if (visible) {
    const start = Date.parse(visible.start.at);
    headline.append(
      element('p', 'headline-title', `Next visible pass · ${entry.name}`),
      element('p', 'headline-main', `${dayAndClock(start).slice(0, -3)} · ${formatCountdown(start, Date.now())}`),
      element('p', 'headline-sub', `Up to ${Math.round(visible.peak.elevation_deg)}° in the ${compassPoint(visible.peak.azimuth_deg)}, starting in the ${compassPoint(visible.start.azimuth_deg)}.`),
    );
    return;
  }
  headline.append(element('p', 'headline-title', entry.name), element('p', 'headline-main', 'No visible passes tonight'));
}

function renderStatus() {
  const node = byId('data-status');
  const entry = selectedEntry();
  node.classList.remove('is-warning');
  if (!entry?.provenance) {
    node.textContent = '';
    return;
  }
  const { provenance } = entry;
  if (provenance.cache_status === 'stale') {
    node.textContent = 'Using saved data because the latest refresh failed.';
    node.classList.add('is-warning');
    return;
  }
  node.textContent = provenance.source === 'file'
    ? 'Using elements from a local file. No provider requests are made.'
    : `Satellite data from CelesTrak, epoch ${dayAndClock(Date.parse(provenance.element_epoch))}.`;
}

function renderObserverLabel() {
  const button = byId('observer-open');
  button.classList.toggle('is-set', Boolean(state.observer));
  byId('observer-label').textContent = state.observer
    ? `${formatCoordinate(state.observer.lat, 'N', 'S').replace(/(\.\d)\d+/, '$1')}, ${formatCoordinate(state.observer.lon, 'E', 'W').replace(/(\.\d)\d+/, '$1')}`
    : 'Set location';
}

// Timeline

function renderSliderLabels() {
  const slider = byId('time-slider');
  slider.max = String(Math.round((state.window.end - state.window.start) / 1000));
  byId('time-start').textContent = `${formatDay(state.window.start, state.utc)} ${formatClock(state.window.start, state.utc).slice(0, 5)}`;
  byId('time-end').textContent = `${formatDay(state.window.end, state.utc)} ${formatClock(state.window.end, state.utc).slice(0, 5)}`;
}

function setLive(value) {
  state.live = value;
  const button = byId('live-button');
  button.classList.toggle('is-live', value);
  button.setAttribute('aria-pressed', String(value));
  if (value) {
    setPlaying(false);
    if (needsNewWindow(state.window, Date.now())) setWindowAround(Date.now());
  }
}

function setPlaying(value) {
  state.playing = value;
  const button = byId('play-button');
  button.textContent = value ? '❚❚' : '▶';
  const label = value ? 'Pause timeline' : 'Play timeline';
  button.setAttribute('aria-label', label);
  button.title = label;
}

function jumpTo(time) {
  setLive(false);
  setPlaying(false);
  state.time = time;
  if (time < state.window.start || time > state.window.end) setWindowAround(time);
  renderTimeline();
  globe?.update(state.time);
  globe?.home();
}

function renderTimeline() {
  const slider = byId('time-slider');
  const offset = Math.round((state.time - state.window.start) / 1000);
  if (document.activeElement !== slider || state.live || state.playing) slider.value = String(offset);
  const text = `${dayAndClock(state.time)} ${state.utc ? 'UTC' : ''}`.trim();
  slider.setAttribute('aria-valuetext', text);
  byId('time-current').textContent = text;
}

function renderLabel() {
  const label = byId('sat-label');
  const position = globe?.selectedScreenPosition();
  const entry = selectedEntry();
  if (!position || !entry?.track) {
    label.hidden = true;
    return;
  }
  label.hidden = false;
  label.textContent = entry.name;
  label.style.left = `${position.x}px`;
  label.style.top = `${position.y}px`;
}

function frame(timestamp, previous) {
  const delta = previous ? Math.min(timestamp - previous, 1000) : 0;
  if (state.live) {
    state.time = Date.now();
    if (needsNewWindow(state.window, state.time)) setWindowAround(state.time);
  } else if (state.playing) {
    state.time += delta * Number(byId('speed-select').value);
    if (state.time >= state.window.end) {
      state.time = state.window.end;
      setPlaying(false);
    }
  }
  if (globe) {
    globe.update(state.time);
    globe.render(delta / 1000);
    renderLabel();
  }
  if (timestamp - lastDomUpdate > 250) {
    lastDomUpdate = timestamp;
    renderTimeline();
    if (state.tab === 'now') renderNow();
  }
  requestAnimationFrame((next) => frame(next, timestamp));
}

// Observer

function saveObserver(observer) {
  state.observer = observer;
  if (observer) localStorage.setItem('tlego.observer', JSON.stringify(observer));
  else localStorage.removeItem('tlego.observer');
  globe?.setObserver(observer);
  state.plan = null;
  state.planFor = null;
  state.planError = null;
  state.activePass = null;
  renderObserverLabel();
  reloadAllTracks();
  renderInspector();
  refreshPlan(true);
}

function openObserverDialog() {
  byId('observer-lat').value = state.observer?.lat ?? '';
  byId('observer-lon').value = state.observer?.lon ?? '';
  byId('observer-alt').value = state.observer?.alt || '';
  byId('observer-error').textContent = '';
  byId('observer-dialog').showModal();
}

function setPicking(value) {
  byId('pick-hint').hidden = !value;
  globe?.setPicking(value);
}

function wireObserver() {
  const dialog = byId('observer-dialog');
  byId('observer-open').addEventListener('click', openObserverDialog);
  byId('observer-cancel').addEventListener('click', () => dialog.close());
  byId('observer-clear').addEventListener('click', () => {
    saveObserver(null);
    dialog.close();
  });
  byId('observer-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const parsed = parseObserver({ lat: byId('observer-lat').value, lon: byId('observer-lon').value, alt: byId('observer-alt').value });
    if (parsed.error) {
      byId('observer-error').textContent = parsed.error;
      return;
    }
    saveObserver(parsed.observer);
    dialog.close();
  });
  byId('observer-locate').addEventListener('click', () => {
    const errorNode = byId('observer-error');
    if (!navigator.geolocation) {
      errorNode.textContent = 'This browser cannot share a location. Enter it instead.';
      return;
    }
    errorNode.textContent = '';
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        byId('observer-lat').value = coords.latitude.toFixed(4);
        byId('observer-lon').value = coords.longitude.toFixed(4);
      },
      () => {
        errorNode.textContent = 'The browser did not share a location. Enter it instead.';
      },
      { timeout: 10000 },
    );
  });
  const pick = byId('observer-pick');
  pick.addEventListener('click', () => {
    dialog.close();
    setPicking(true);
  });
  if (!globe) pick.disabled = true;
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !byId('pick-hint').hidden) {
      setPicking(false);
      openObserverDialog();
    }
  });
}

function wireTabs() {
  const tabs = ['now', 'passes', 'orbit'];
  const show = (name, focus = false) => {
    state.tab = name;
    for (const tab of tabs) {
      const button = byId(`tab-${tab}`);
      const active = tab === name;
      button.setAttribute('aria-selected', String(active));
      button.tabIndex = active ? 0 : -1;
      byId(`panel-${tab}`).hidden = !active;
      if (active && focus) button.focus();
    }
    if (name === 'passes') refreshPlan();
  };
  tabs.forEach((name, index) => {
    const button = byId(`tab-${name}`);
    button.addEventListener('click', () => show(name));
    button.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') show(tabs[(index + 1) % tabs.length], true);
      if (event.key === 'ArrowLeft') show(tabs[(index + tabs.length - 1) % tabs.length], true);
    });
  });
}

function wireControls() {
  byId('live-button').addEventListener('click', () => setLive(true));
  byId('play-button').addEventListener('click', () => {
    if (state.playing) {
      setPlaying(false);
      return;
    }
    if (state.live) setLive(false);
    if (state.time >= state.window.end) state.time = state.window.start;
    setPlaying(true);
  });
  byId('time-slider').addEventListener('input', (event) => {
    setLive(false);
    setPlaying(false);
    state.time = state.window.start + Number(event.target.value) * 1000;
    renderTimeline();
    renderNow();
  });
  const zone = byId('zone-toggle');
  const renderZone = () => {
    zone.textContent = state.utc ? 'UTC' : 'Local time';
    zone.setAttribute('aria-pressed', String(state.utc));
  };
  renderZone();
  zone.addEventListener('click', () => {
    state.utc = !state.utc;
    localStorage.setItem('tlego.utc', state.utc ? '1' : '0');
    renderZone();
    renderSliderLabels();
    renderTimeline();
    renderInspector();
    renderStatus();
  });
  byId('group-select').addEventListener('change', (event) => {
    byId('filter-input').value = '';
    loadGroup(event.target.value);
  });
  byId('filter-input').addEventListener('input', () => {
    if (state.isSearchResult) {
      loadGroup(byId('group-select').value);
      return;
    }
    renderCatalog();
  });
  byId('camera-home').addEventListener('click', () => globe?.home());
  byId('zoom-in').addEventListener('click', () => globe?.zoom(0.8));
  byId('zoom-out').addEventListener('click', () => globe?.zoom(1.25));
  const follow = byId('camera-follow');
  follow.addEventListener('click', () => {
    const next = follow.getAttribute('aria-pressed') !== 'true';
    follow.setAttribute('aria-pressed', String(next));
    globe?.setFollowing(next);
  });
}

function sceneFailure(message) {
  const box = byId('scene-error');
  box.hidden = false;
  box.textContent = message;
}

async function start() {
  try {
    globe = createGlobe(byId('scene'), {
      onPick(point) {
        setPicking(false);
        openObserverDialog();
        byId('observer-lat').value = point.lat.toFixed(4);
        byId('observer-lon').value = point.lon.toFixed(4);
      },
      onSelect: (id) => select(id),
    });
    globe.setObserver(state.observer);
    globe.onContextChange(
      () => sceneFailure('The graphics context was lost. The globe will return if the browser restores it. Reload if it does not. The readouts still work.'),
      () => {
        byId('scene-error').hidden = true;
      },
    );
  } catch (error) {
    globe = null;
    console.error(error);
    sceneFailure('3D rendering is unavailable, so the globe is hidden. Enable WebGL in your browser and reload. Satellite details and passes still work.');
    for (const id of ['camera-follow', 'camera-home', 'zoom-in', 'zoom-out']) byId(id).disabled = true;
  }
  wireTabs();
  wireControls();
  wireObserver();
  renderObserverLabel();
  renderSliderLabels();
  renderTracked();
  renderInspector();
  renderTimeline();
  requestAnimationFrame((timestamp) => frame(timestamp, 0));

  const initial = parseUrlState(location.search);
  for (const id of initial.ids) addSatellite(id);
  if (initial.selected) select(initial.selected);
  await loadGroups();
  if (!initial.ids.length && !state.tracked.size) {
    const first = state.items.find((item) => canonicalId(item.norad_id) === DEFAULT_ID) ?? state.items[0];
    if (first) addSatellite(first.norad_id, first.name);
  }
  setInterval(() => refreshPlan(), 60000);
}

start();
