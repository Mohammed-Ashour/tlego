import { createApi, isAbort } from './api.js';
import { createGlobe } from './globe.js';
import { createLayers } from './layers.js';
import {
  annotatePasses, buildUrlState, canonicalId, clamp, cloudAtTime, compassPoint, elementAgeDays, filterSatellites, formatClock, formatCoordinate, formatCountdown, formatDay, formatDuration,
  dataAge, lookAt, MAX_TRACKED, migrateStorage, needsNewWindow, nextColor, parseObserver, parseUrlState, passesOverlap, providerMessage, readStoredObserver, safeStorage, shortCoordinate, sunlitAt, validId, windowFrom, zoneLabel,
} from './logic.js';
import { sampleAt } from '../../../pkg/templates/viewer-state.js';
import { renderSky } from './sky.js';
import { createDossier } from './dossier.js';
import { createSkyBar } from './skybar.js';

const LIST_LIMIT = 200;
const PASS_REFRESH_MS = 10 * 60000;
const DEFAULT_ID = '25544';
const TRACK_RETRY_MS = 60000;
const COUNTDOWN_REFRESH_MS = 15000;
const PLAN_HOURS = 48;
const GROUP_HEAD_START_MS = 1500;
const byId = (id) => document.getElementById(id);
const api = createApi();
const storage = safeStorage(() => window.localStorage);
migrateStorage(storage);

const state = {
  tracked: new Map(),
  selected: null,
  observer: readStoredObserver(storage),
  utc: storage.getItem('khonsu.utc') === '1',
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
  // The cloud check for the current observer: { observer, loading } while it runs, then { observer, feed } or { observer, error }.
  clouds: null,
};

let globe = null;
let lastDomUpdate = 0;
let lastCountdown = 0;
let frameFailed = false;
// Set from the sources list at startup. Features that need live data are hidden while it is off.
let liveDataOn = true;
// The one api.sources() request, shared by the Data dialog, the dossier and the sky bar.
let sourcesRequest = null;
let catalog = null;
let layersCatalog = null;
let dossier = null;
let skyBar = null;
// Bumped on every selection change, so only the newest decides the Sees tab.
let selectionToken = 0;

// Tab order matches the markup. Sees is hidden unless the selected satellite has scenes.
const TABS = ['now', 'passes', 'orbit', 'identity', 'radio', 'sees'];
const DOSSIER_TABS = ['identity', 'radio', 'sees'];

// Rerendering a list replaces its rows, so keyboard focus moves to the row with the
// same data-focus key, or to the fallback if that row is gone.
function keepFocus(container, render, fallback) {
  const active = document.activeElement;
  const key = active && container.contains(active) ? active.dataset.focus : null;
  render();
  if (!key) return;
  const next = [...container.querySelectorAll('[data-focus]')].find((node) => node.dataset.focus === key);
  (next ?? fallback)?.focus({ preventScroll: true });
}

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
  clearTimeout(entry.retryTimer);
  entry.request = (entry.request ?? 0) + 1;
  const request = entry.request;
  renderTracked();
  try {
    const result = await api.track(entry.id, state.window.start, state.observer);
    if (state.tracked.get(entry.id) !== entry) return;
    entry.track = result.data;
    entry.name = result.data.name || entry.name;
    entry.provenance = result.provenance;
    entry.warnings = result.warnings;
    entry.lookStale = false;
    globe?.setTrack(entry.id, result.data, entry.color);
    globe?.select(state.selected);
    if (entry.framePending) {
      entry.framePending = false;
      if (entry.id === state.selected) globe?.home(entry.id);
    }
  } catch (error) {
    if (isAbort(error)) return;
    // Keep any track already shown: a passing failure should not lose the satellite.
    entry.error = providerMessage(error.message);
    entry.retryTimer = setTimeout(() => {
      if (state.tracked.get(entry.id) === entry && entry.error) loadTrack(entry);
    }, TRACK_RETRY_MS);
  } finally {
    if (entry.request === request) entry.loading = false;
    if (state.tracked.get(entry.id) === entry && entry.request === request) {
      renderTracked();
      renderCatalog();
      renderInspector();
      renderStatus();
    }
  }
}

function addSatellite(id, name, { selectIt = true } = {}) {
  const key = canonicalId(id);
  if (state.tracked.has(key)) {
    if (selectIt) select(key);
    return;
  }
  if (state.tracked.size >= MAX_TRACKED) {
    setCatalogStatus(`You can track up to ${MAX_TRACKED} satellites. Remove one to add another.`, 'is-warning');
    return;
  }
  const entry = { id: key, name: name || `NORAD ${key}`, color: nextColor([...state.tracked.values()].map((item) => item.color)), track: null, error: null, loading: true, framePending: true };
  state.tracked.set(key, entry);
  if (selectIt) select(key);
  loadTrack(entry);
}

function removeSatellite(id) {
  clearTimeout(state.tracked.get(id)?.retryTimer);
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
  if (changed) applySelection();
}

// Decides whether Sees is offered before the dossier opens a tab. If Sees is active and
// the satellite has no scenes, the view moves to Now first, so no scene request is made.
function applySelection() {
  const token = ++selectionToken;
  dossier.hasSees().then((hasScenes) => {
    if (token !== selectionToken) return;
    const seesTab = byId('tab-sees');
    const focused = document.activeElement === seesTab;
    seesTab.hidden = !hasScenes;
    if (!hasScenes && state.tab === 'sees') showTab('now', focused);
    dossier.selectionChanged(state.tab);
  });
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
    if (!Array.isArray(state.groups)) throw new Error('The server returned an unexpected response.');
  } catch (error) {
    state.groups = [];
    if (!isAbort(error)) setCatalogStatus(`Could not load satellite groups: ${providerMessage(error.message)}`, 'is-error');
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
    setCatalogStatus(`Could not load ${name}: ${providerMessage(error.message)}`, 'is-error');
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
    state.items = result.satellites ?? [];
    const partial = result.groups_covered < result.groups_total;
    setCatalogStatus(
      partial ? `Searched ${result.groups_covered} of ${result.groups_total} groups, so more matches may exist.` : `${result.satellites.length} matches across all groups.`,
      partial ? 'is-warning' : '',
    );
  } catch (error) {
    if (isAbort(error)) return;
    setCatalogStatus(`Search failed: ${providerMessage(error.message)}`, 'is-error');
  }
  renderCatalog();
}

function renderCatalog() {
  const query = byId('filter-input').value;
  const matches = state.isSearchResult ? state.items : filterSatellites(state.items, query);
  const list = byId('catalog-list');
  const full = state.tracked.size >= MAX_TRACKED;
  keepFocus(list, () => {
  list.replaceChildren(...matches.slice(0, LIST_LIMIT).map((item) => {
    const id = canonicalId(item.norad_id);
    const isTracked = state.tracked.has(id);
    const row = element('li');
    const button = element('button', 'catalog-row');
    button.type = 'button';
    button.setAttribute('aria-pressed', String(isTracked));
    button.disabled = !isTracked && full;
    button.dataset.focus = `catalog:${id}`;
    button.title = isTracked ? `Stop tracking ${item.name}` : full ? `You can track up to ${MAX_TRACKED} satellites` : `Track ${item.name}`;
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
  if (full) list.prepend(element('li', 'note', `You can track up to ${MAX_TRACKED} satellites. Remove one to add another.`));
  }, byId('filter-input'));
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
  keepFocus(list, () => list.replaceChildren(...[...state.tracked.values()].map((entry) => {
    const row = element('li', `tracked-row${entry.id === state.selected ? ' is-selected' : ''}`);
    const choose = element('button', 'tracked-select');
    choose.type = 'button';
    choose.setAttribute('aria-current', String(entry.id === state.selected));
    choose.dataset.focus = `tracked:${entry.id}`;
    const dot = element('span', 'dot');
    dot.style.setProperty('--color', entry.color);
    choose.append(dot, element('span', 'tracked-name', entry.loading && !entry.track ? `${entry.name} · loading` : entry.name));
    if (entry.error) choose.append(element('span', 'tracked-error', entry.error));
    choose.addEventListener('click', () => select(entry.id));
    const remove = element('button', 'row-action', '×');
    remove.type = 'button';
    remove.setAttribute('aria-label', `Stop tracking ${entry.name}`);
    remove.dataset.focus = `remove:${entry.id}`;
    remove.title = `Stop tracking ${entry.name}`;
    remove.addEventListener('click', () => removeSatellite(entry.id));
    row.append(choose, remove);
    if (entry.error) {
      const retry = element('button', 'text-button tracked-retry', 'Try again');
      retry.type = 'button';
      retry.dataset.focus = `retry:${entry.id}`;
      retry.setAttribute('aria-label', `Try loading ${entry.name} again`);
      retry.addEventListener('click', () => loadTrack(entry));
      row.append(retry);
    }
    return row;
  })), byId('filter-input'));
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
  const lastSample = Date.parse(samples.at(-1).time);
  if (state.time > lastSample + 60000 && entry.warnings?.some((warning) => warning.code === 'propagation_stopped')) {
    setReadouts(byId('now-readouts'), []);
    note.textContent = `This orbit cannot be predicted past ${dayAndClock(lastSample)}. The satellite may have decayed.`;
    note.className = 'note is-warning';
    return;
  }
  const time = clamp(state.time, Date.parse(samples[0].time), lastSample);
  const point = sampleAt(samples, time);
  const rows = [
    ['Latitude', formatCoordinate(point.latitude_deg, 'N', 'S')],
    ['Longitude', formatCoordinate(point.longitude_deg, 'E', 'W')],
    ['Altitude', `${point.altitude_km.toFixed(1)} km`],
    ['Speed', `${point.speed_km_s.toFixed(3)} km/s`],
    ['Sunlight', sunlitAt(samples, time) ? 'Sunlit' : 'In Earth’s shadow'],
  ];
  const look = entry.lookStale ? null : lookAt(samples, time);
  if (look) {
    rows.push(['Direction', `${compassPoint(look.azimuth)} (${look.azimuth.toFixed(1)}°)`]);
    rows.push(['Elevation', `${look.elevation.toFixed(1)}°`, look.elevation > 0 ? 'is-good' : '']);
  }
  setReadouts(byId('now-readouts'), rows);
  const age = entry.provenance ? elementAgeDays(entry.provenance.element_epoch, time) : 0;
  const messages = [];
  if (!state.observer) messages.push('Set your location to see where to look.');
  if (Math.abs(age) > 3) messages.push(`These elements are ${Math.abs(age).toFixed(0)} days from the displayed time, so positions may be well off.`);
  for (const warning of entry.warnings ?? []) messages.push(warning.message);
  note.textContent = messages.join(' ');
  note.className = `note${Math.abs(age) > 3 || entry.warnings?.length ? ' is-warning' : ''}`;
}

// The line follows the marker, so it updates with the scene rather than the readouts.
function updateSightLine() {
  const entry = selectedEntry();
  const samples = entry?.track?.samples;
  const look = samples?.length && !entry.lookStale && state.time <= Date.parse(samples.at(-1).time) ? lookAt(samples, state.time) : null;
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
  const passes = state.plan?.visible ?? [];
  return passes.find((pass) => Date.parse(pass.end.at) > Date.now()) ?? null;
}

function passSummary() {
  const { tonight } = state.plan;
  const visible = nextVisible();
  const summary = element('div', `pass-summary${visible ? ' is-visible' : ''}`);
  summary.id = 'pass-summary';
  if (visible) {
    const start = Date.parse(visible.start.at);
    summary.append(
      element('strong', '', Date.now() >= start ? 'Visible now' : `Visible ${formatCountdown(start, Date.now())}`),
      element('span', '', `${dayAndClock(start)}, up to ${Math.round(visible.peak.elevation_deg)}° in the ${compassPoint(visible.peak.azimuth_deg)}.`),
    );
  } else if (!tonight.dark_start) {
    summary.append(element('strong', '', 'No dark sky soon'), element('span', '', 'The Sun stays too high for the next 24 hours.'));
  } else {
    summary.append(element('strong', '', `No visible passes in the next ${PLAN_HOURS} hours`), element('span', '', `The next dark sky starts ${dayAndClock(Date.parse(tonight.dark_start))}.`));
  }
  return summary;
}

function renderPasses() {
  const container = byId('passes-content');
  keepFocus(container, () => renderPassesContent(container));
}

function renderPassesContent(container) {
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
  if (state.planError && !state.plan) {
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
  const { visible, passes } = state.plan;
  if (state.planError) container.append(element('p', 'note is-warning', `Could not update this list: ${state.planError}`));
  container.append(passSummary(), element('h2', 'eyebrow section-title', `Next ${PLAN_HOURS} hours · ${zoneLabel(state.utc)} time`));
  if (!passes.length) {
    container.append(element('p', 'note', 'No passes above your horizon in this period.'));
    return;
  }
  const rows = annotatePasses(passes, visible);
  const forecast = state.clouds?.feed?.data ?? null;
  for (const pass of rows.slice(0, 40)) {
    const isActive = Boolean(state.activePass && passesOverlap(state.activePass.pass, pass));
    const button = element('button', 'pass-row');
    button.type = 'button';
    button.dataset.focus = `pass:${pass.maximum_at}`;
    button.setAttribute('aria-pressed', String(isActive));
    const start = Date.parse(pass.start);
    const end = Date.parse(pass.end);
    const cloud = forecast ? cloudAtTime(forecast, Date.parse(pass.maximum_at)) : null;
    const cloudText = cloud === null ? '' : ` · ${Math.round(cloud)}% cloud`;
    button.append(
      element('span', 'pass-time', `${formatDay(start, state.utc)} ${formatClock(start, state.utc).slice(0, 5)}`),
      element('span', 'pass-elevation', `${Math.round(pass.maximum_elevation_deg)}°`),
      element('span', 'pass-detail', `${compassPoint(pass.start_azimuth_deg)} to ${compassPoint(pass.end_azimuth_deg)} · ${formatDuration(end - start)}${cloudText}`),
    );
    if (pass.visible) button.append(element('span', 'badge', 'Visible'));
    button.addEventListener('click', () => choosePass(pass));
    container.append(button);
    if (isActive) container.append(renderActivePass());
  }
  container.append(element('p', 'note', forecast
    ? 'Visible means sunlit, in a dark sky and at least 10° high. Brightness is not considered.'
    : 'Visible means sunlit, in a dark sky and at least 10° high. Weather and brightness are not considered.'));
  if (liveDataOn) container.append(cloudCheck());
}

// Cloud cover is requested only on click, and the result is kept for this observer.
function cloudCheck() {
  const { clouds } = state;
  const box = element('div', 'cloud-check');
  const button = element('button', 'text-button', clouds?.loading ? 'Loading…' : clouds?.feed ? 'Check again' : 'Check clouds near me');
  button.type = 'button';
  button.dataset.focus = 'check-clouds';
  button.addEventListener('click', checkClouds);
  box.append(button, element('p', 'note', 'Sends your location, rounded to about 10 km, to Open-Meteo.'));
  if (clouds?.error) box.append(dataFailure(clouds.error));
  if (clouds?.feed) box.append(...feedCredit(clouds.feed));
  return box;
}

async function checkClouds() {
  const observer = state.observer;
  if (!observer || state.clouds?.loading) return;
  const request = { observer, loading: true };
  state.clouds = request;
  renderPasses();
  try {
    const feed = await api.cloudCover(observer);
    // Saving or clearing the location replaces state.clouds, so an answer for an old location is dropped.
    if (state.clouds !== request) return;
    state.clouds = { observer, feed };
  } catch (error) {
    if (state.clouds !== request) return;
    state.clouds = { observer, error };
  }
  renderPasses();
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
  renderSky(plot, points, selectedEntry()?.color ?? '#ebd193', pass.visible);
  const actions = element('div', 'sky-actions');
  const jump = element('button', 'text-button', 'Show on globe');
  jump.type = 'button';
  jump.dataset.focus = 'show-on-globe';
  jump.addEventListener('click', () => {
    jumpTo(Date.parse(pass.maximum_at));
    document.querySelector('.viewport').scrollIntoView({ block: 'nearest' });
  });
  actions.append(jump);
  box.append(plot, actions);
  return box;
}

async function choosePass(pass) {
  if (state.activePass && passesOverlap(state.activePass.pass, pass)) {
    state.activePass = null;
    renderPasses();
    return;
  }
  state.activePass = { pass, points: null };
  renderPasses();
  const id = state.selected;
  try {
    const result = await api.look(id, state.observer, pass.start, pass.end);
    if (state.activePass?.pass === pass && state.selected === id) {
      state.activePass.points = result.data.points;
      renderPasses();
    }
  } catch (error) {
    if (isAbort(error) || state.activePass?.pass !== pass) return;
    state.activePass.error = providerMessage(error.message);
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
    const passesRequest = api.passes(id, state.observer, Date.now());
    // Awaited below. This stops an early failure above counting as unhandled.
    passesRequest.catch(() => {});
    const tonight = await api.tonight(id, state.observer, Date.now());
    // Each answer covers one dark period, so keep asking until the list's end.
    const visible = [...tonight.data.passes];
    let night = tonight.data;
    const horizon = Date.now() + PLAN_HOURS * 3600000;
    while (night.dark_end && !night.dark_end_clipped && Date.parse(night.dark_end) < horizon) {
      const next = await api.tonight(id, state.observer, night.dark_end);
      if (state.planFor !== key) return;
      visible.push(...next.data.passes);
      night = next.data;
    }
    const passes = await passesRequest;
    if (state.planFor !== key) return;
    state.plan = { tonight: tonight.data, visible, passes: passes.data.passes };
    if (state.activePass && !state.plan.passes.some((pass) => passesOverlap(state.activePass.pass, pass))) state.activePass = null;
  } catch (error) {
    if (isAbort(error) || state.planFor !== key) return;
    // A previous list stays useful, so it remains with a warning.
    state.planError = providerMessage(error.message);
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
    state.report = { error: providerMessage(error.message) };
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
  download.download = `khonsu-${state.selected}.json`;
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
  document.title = entry ? `${entry.name} · Khonsu` : 'Khonsu';
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
  if (entry.loading && !entry.track) {
    headline.append(element('p', 'headline-title', entry.name), element('p', 'headline-main', 'Fetching its orbit…'), element('p', 'headline-sub', 'The first request can take a few seconds. After that it is saved.'));
    return;
  }
  if (!state.observer) {
    headline.append(element('p', 'headline-title', 'See it yourself'), element('p', 'headline-main', 'When can you see it?'));
    const button = element('button', 'text-button', 'Set your location');
    button.type = 'button';
    button.dataset.focus = 'headline-location';
    button.addEventListener('click', openObserverDialog);
    headline.append(button);
    return;
  }
  if (!state.plan) return;
  const visible = nextVisible();
  if (visible) {
    const start = Date.parse(visible.start.at);
    const started = Date.now() >= start;
    headline.append(
      element('p', 'headline-title', `${started ? 'Visible now' : 'Next visible pass'} · ${entry.name}`),
      element('p', 'headline-main', `${dayAndClock(start).slice(0, -3)}${started ? '' : ` · ${formatCountdown(start, Date.now())}`}`),
      element('p', 'headline-sub', `Up to ${Math.round(visible.peak.elevation_deg)}° in the ${compassPoint(visible.peak.azimuth_deg)}, starting in the ${compassPoint(visible.start.azimuth_deg)}.`),
    );
    return;
  }
  headline.append(element('p', 'headline-title', entry.name), element('p', 'headline-main', state.plan.tonight.dark_start ? `No visible passes in the next ${PLAN_HOURS} hours` : 'No dark sky soon'));
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
    node.textContent = entry.warnings?.[0]?.message ?? 'Showing saved elements.';
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
    ? `${shortCoordinate(state.observer.lat, 'N', 'S')}, ${shortCoordinate(state.observer.lon, 'E', 'W')}`
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
  if (time < state.window.start || time > state.window.end) {
    // The camera can only frame the satellite once its new track has arrived.
    const entry = selectedEntry();
    if (entry) entry.framePending = true;
    setWindowAround(time);
  } else {
    globe?.update(state.time);
    globe?.home();
  }
  renderTimeline();
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

// Only text changes here, so focus and scroll position are left alone.
function renderCountdowns() {
  skyBar.tick();
  if (!state.plan) return;
  const headline = byId('headline');
  if (!headline.contains(document.activeElement)) renderHeadline();
  byId('pass-summary')?.replaceWith(passSummary());
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
  // One bad update must not stop the clock and globe for good.
  try {
    if (globe) {
      globe.update(state.time);
      updateSightLine();
      globe.render(delta / 1000);
      renderLabel();
    }
    if (timestamp - lastDomUpdate > 250) {
      lastDomUpdate = timestamp;
      renderTimeline();
      if (state.tab === 'now') renderNow();
    }
    if (timestamp - lastCountdown > COUNTDOWN_REFRESH_MS) {
      lastCountdown = timestamp;
      renderCountdowns();
    }
  } catch (error) {
    if (!frameFailed) console.error(error);
    frameFailed = true;
  }
  requestAnimationFrame((next) => frame(next, timestamp));
}

// Observer

function saveObserver(observer) {
  state.observer = observer;
  if (observer) storage.setItem('khonsu.observer', JSON.stringify(observer));
  else storage.removeItem('khonsu.observer');
  globe?.setObserver(observer);
  // Directions in the current tracks belong to the old location.
  for (const entry of state.tracked.values()) entry.lookStale = true;
  state.plan = null;
  state.planFor = null;
  state.planError = null;
  state.activePass = null;
  // Cloud cover belongs to the old location, and any request still running for it is dropped.
  state.clouds = null;
  renderObserverLabel();
  reloadAllTracks();
  renderInspector();
  refreshPlan(true);
}

function openObserverDialog() {
  setPicking(false);
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

// Data sources

let dataRequest = 0;

function feedCredit(feed) {
  const parts = [feed.source.credit, feed.source.nature, `updated ${dataAge(feed.fetched_at, Date.now())}`];
  if (feed.stale) parts.push('saved copy');
  const credit = element('p', 'data-credit', parts.join(' · '));
  return feed.warning ? [credit, element('p', 'note is-warning', feed.warning)] : [credit];
}

function dataFailure(error) {
  return element('p', 'note is-warning', providerMessage(error.message || '') || 'This source could not be reached.');
}

function dataTime(isoTime) {
  const time = Date.parse(isoTime);
  return `${formatDay(time, state.utc)} ${formatClock(time, state.utc).slice(0, 5)} ${zoneLabel(state.utc)}`;
}

function renderDataCategories(categories) {
  byId('data-categories').replaceChildren(...categories.map((category) => {
    const section = element('section', 'data-category');
    section.append(element('h3', null, category.title), element('p', 'note', category.description));
    if (category.id === 'earth-imagery') section.append(element('p', 'note', 'Choose pictures with the Layers button on the globe.'));
    for (const source of category.sources) {
      const row = element('div', 'data-source');
      const link = element('a', null, source.name);
      link.href = source.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      const live = source.status === 'live';
      row.append(link, element('span', `data-status${live ? ' is-live' : ''}`, live ? 'Live' : 'Needs account'), element('p', 'note', `${source.summary} ${source.refresh}.`));
      section.append(row);
    }
    return section;
  }));
}

// Reuses the startup request while it is pending or after it succeeds. A failed startup is retried once per open.
async function loadSources() {
  try {
    return await sourcesRequest;
  } catch {
    sourcesRequest = api.sources();
    return sourcesRequest;
  }
}

async function openDataDialog() {
  const token = ++dataRequest;
  const statusNote = byId('data-status-note');
  statusNote.textContent = '';
  statusNote.classList.remove('is-warning');
  byId('data-dialog').showModal();
  let sources;
  try {
    sources = await loadSources();
  } catch (error) {
    if (token === dataRequest && error.name !== 'AbortError') {
      statusNote.textContent = error.message;
      statusNote.classList.add('is-warning');
    }
    return;
  }
  if (token !== dataRequest) return;
  renderDataCategories(sources.categories);
  if (!sources.live_data) statusNote.textContent = 'Live data is off while serving a local file, so no provider requests are made.';
}

// The Layers button shows or hides the panel. Escape inside the panel closes it and returns focus to the button.
function wireLayersPanel() {
  const button = byId('layers-open');
  const panel = byId('layers-panel');
  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
  };
  button.addEventListener('click', () => setOpen(panel.hidden));
  panel.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    setOpen(false);
    button.focus();
  });
}

function wireDataDialog() {
  const dialog = byId('data-dialog');
  byId('data-open').addEventListener('click', openDataDialog);
  byId('data-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    dataRequest += 1;
    byId('data-open').focus();
  });
}

function wireObserver() {
  const dialog = byId('observer-dialog');
  byId('observer-open').addEventListener('click', openObserverDialog);
  byId('observer-cancel').addEventListener('click', () => dialog.close());
  // The button that opened the dialog may be replaced while it is open.
  dialog.addEventListener('close', () => {
    if (!document.activeElement || document.activeElement === document.body) byId('observer-open').focus();
  });
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
      event.preventDefault();
      setPicking(false);
      // Opened after this key press, so the same Escape does not close it again.
      setTimeout(openObserverDialog);
    }
  });
}

function showTab(name, focus = false) {
  state.tab = name;
  for (const tab of TABS) {
    const button = byId(`tab-${tab}`);
    const active = tab === name;
    button.setAttribute('aria-selected', String(active));
    button.tabIndex = active ? 0 : -1;
    byId(`panel-${tab}`).hidden = !active;
    if (active && focus) button.focus();
  }
  if (name === 'passes') refreshPlan();
  if (name === 'orbit') refreshReport();
  if (DOSSIER_TABS.includes(name)) dossier.open(name);
}

function wireTabs() {
  for (const name of TABS) {
    const button = byId(`tab-${name}`);
    button.addEventListener('click', () => showTab(name));
    button.addEventListener('keydown', (event) => {
      // Hidden tabs are skipped, so the arrow keys never reach Sees for a satellite without scenes.
      const shown = TABS.filter((tab) => !byId(`tab-${tab}`).hidden);
      const position = shown.indexOf(name);
      if (event.key === 'ArrowRight') showTab(shown[(position + 1) % shown.length], true);
      if (event.key === 'ArrowLeft') showTab(shown[(position + shown.length - 1) % shown.length], true);
    });
  }
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
    storage.setItem('khonsu.utc', state.utc ? '1' : '0');
    renderZone();
    renderSliderLabels();
    renderTimeline();
    renderInspector();
    renderStatus();
    // Scene times are the only dossier text that depends on the zone. This reuses the saved response.
    if (state.tab === 'sees') dossier.open('sees');
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
  follow.addEventListener('click', () => setFollow(follow.getAttribute('aria-pressed') !== 'true'));
}

function setFollow(value) {
  byId('camera-follow').setAttribute('aria-pressed', String(value));
  globe?.setFollowing(value);
}

// Sees rows call these. Both are safe without WebGL, when there is no globe.
function focusScene(point) {
  if (!globe) return;
  globe.showPoint(point.lat, point.lon);
  setFollow(false);
}

function clearScene() {
  globe?.clearPoint();
}

function sceneFailure(message) {
  const box = byId('scene-error');
  box.hidden = false;
  box.textContent = message;
}

function sourceInfo(sources) {
  const sourceList = sources.categories.flatMap((category) => category.sources);
  return {
    liveData: sources.live_data,
    spaceTrackReady: sourceList.some((source) => source.id === 'space-track' && source.status === 'live'),
    imagingIds: new Set(sources.imaging_satellites ?? []),
  };
}

async function start() {
  // One request serves every consumer. A failure leaves catalog null, and the dossier and sky bar use their defaults.
  sourcesRequest = api.sources();
  catalog = sourcesRequest.then(sourceInfo).catch(() => null);
  layersCatalog = sourcesRequest.then((sources) => ({ liveData: sources.live_data, layers: sources.imagery_layers })).catch(() => null);
  catalog.then((info) => {
    liveDataOn = info?.liveData !== false;
    renderPasses();
  });
  dossier = createDossier({
    api,
    element,
    feedCredit,
    dataFailure,
    dataTime,
    selectedEntry,
    catalog,
    panels: { identity: byId('panel-identity'), radio: byId('panel-radio'), sees: byId('panel-sees') },
    focusScene,
    clearScene,
  });
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
  // Created after the globe, which may be null. With no globe the panel says the layers are off.
  const layers = createLayers({
    element,
    panel: byId('layers-panel'),
    credit: byId('imagery-credit'),
    catalog: layersCatalog,
    storage,
    globe,
    dataAge,
  });
  layers.start();
  skyBar = createSkyBar({
    api,
    element,
    feedCredit,
    dataFailure,
    dataTime,
    catalog,
    chips: byId('sky-chips'),
    popover: byId('sky-popover'),
    onKp: (kp) => layers.setKp(kp),
  });
  skyBar.start();
  wireTabs();
  wireControls();
  wireObserver();
  wireDataDialog();
  wireLayersPanel();
  renderObserverLabel();
  renderSliderLabels();
  renderTracked();
  renderInspector();
  renderTimeline();
  requestAnimationFrame((timestamp) => frame(timestamp, 0));
  setInterval(() => refreshPlan(), 60000);

  const initial = parseUrlState(location.search);
  // A group's response provides all of its satellites, so give it a moment to
  // arrive before asking the server for each one separately.
  const groupsLoaded = loadGroups();
  if (initial.ids.length) {
    await Promise.race([groupsLoaded, new Promise((resolve) => setTimeout(resolve, GROUP_HEAD_START_MS))]);
    for (const id of initial.ids) addSatellite(id, undefined, { selectIt: false });
    select(initial.selected);
  }
  await groupsLoaded;
  if (!initial.ids.length && !state.tracked.size) {
    const first = state.items.find((item) => canonicalId(item.norad_id) === DEFAULT_ID) ?? state.items[0];
    if (first) addSatellite(first.norad_id, first.name);
  }
}

start();
