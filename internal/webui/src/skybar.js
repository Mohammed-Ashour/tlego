import { describeKp, latestKp, launchLabel, nextLaunch, summarizeHistory } from './logic.js';
import { isAbort } from './api.js';

const LOADING = 'Loading…';
const LIVE_OFF_NOTE = 'Live data is off while serving a local file.';

// Two chips in the top bar, each opening a small popover. Only one popover is open at a time.
// Every request is kept in a store so that chips, popovers and the session cache share one state.
export function createSkyBar({ api, element, feedCredit, dataFailure, dataTime, catalog, chips, popover, now = Date.now }) {
  const weather = newStore();
  const launches = newStore();
  const history = newStore();
  const events = newStore();

  let started = false;
  let liveData = true;
  let openKind = null;
  // Bumped on every open and close, so a response only writes into the popover it was requested for.
  let session = 0;
  let kpChip = null;
  let launchChip = null;
  let kpStrong = null;
  let launchStrong = null;

  function newStore() {
    return { feed: null, error: null, pending: null };
  }

  // Shares an in-flight request, since api.js aborts an earlier request that uses the same key.
  function load(store, fetcher) {
    if (!store.pending) {
      let request;
      try {
        request = Promise.resolve(fetcher());
      } catch (error) {
        request = Promise.reject(error);
      }
      store.pending = request
        .then(
          (feed) => {
            store.feed = feed;
            store.error = null;
          },
          (error) => {
            if (!isAbort(error)) store.error = error;
          },
        )
        .then(() => {
          store.pending = null;
          setChipText();
        });
    }
    return store.pending;
  }

  function kpText() {
    if (!liveData) return 'off';
    if (weather.feed) {
      const kp = latestKp(weather.feed.data);
      return kp === null ? 'unavailable' : kp.toFixed(1);
    }
    return weather.error && !weather.pending ? 'unavailable' : '…';
  }

  function launchText() {
    if (!liveData) return 'off';
    if (launches.feed) {
      const instant = now();
      const next = nextLaunch(launches.feed.data, instant);
      return next ? launchLabel(next, instant) : 'none listed';
    }
    return launches.error && !launches.pending ? 'unavailable' : '…';
  }

  function setChipText() {
    if (!kpStrong) return;
    kpStrong.textContent = kpText();
    launchStrong.textContent = launchText();
  }

  function syncChips() {
    kpChip?.setAttribute('aria-expanded', String(openKind === 'weather'));
    launchChip?.setAttribute('aria-expanded', String(openKind === 'launch'));
  }

  function chipButton(label, strong, kind) {
    const button = element('button', 'sky-chip', null);
    button.setAttribute('type', 'button');
    button.setAttribute('aria-haspopup', 'dialog');
    button.setAttribute('aria-expanded', 'false');
    button.append(label, strong);
    button.addEventListener('click', () => toggle(kind));
    return button;
  }

  function values(entries) {
    const row = element('div', 'data-values');
    for (const [label, value] of entries) {
      const item = element('span', null, `${label} `);
      item.append(element('strong', null, value));
      row.append(item);
    }
    return row;
  }

  // The body of a block for one store: held data first, then a loading note or a failure.
  function storeBody(store, render) {
    if (store.feed) {
      const nodes = render(store.feed);
      if (store.error) nodes.push(dataFailure(store.error));
      return nodes;
    }
    if (store.error && !store.pending) return [dataFailure(store.error)];
    return [element('p', 'note', LOADING)];
  }

  function block(store, render) {
    const node = element('div', 'sky-block');
    node.append(...storeBody(store, render));
    return node;
  }

  function spaceWeatherNodes(feed) {
    const { kp = [], flux = [], scales, alerts = [] } = feed.data;
    const nodes = [];
    const latest = kp.at(-1);
    const entries = latest ? [['Kp', `${latest.kp.toFixed(1)} ${describeKp(latest.kp)}`]] : [];
    if (flux.length) entries.push(['F10.7', String(Math.round(flux.at(-1).flux))]);
    if (scales) entries.push(['Scales', `G${scales.geomagnetic.level} S${scales.solar.level} R${scales.radio.level}`]);
    if (entries.length) nodes.push(values(entries));
    if (alerts.length) {
      const list = element('ul');
      list.append(...alerts.slice(0, 3).map((alert) => element('li', null, `${dataTime(alert.issued_at)}: ${alert.headline}`)));
      nodes.push(list);
    }
    return [...nodes, ...feedCredit(feed)];
  }

  function historyNodes(feed) {
    const summary = summarizeHistory(feed.data);
    if (!summary) return [element('p', 'note', 'No observed days are available.')];
    return [values([['Past year, strongest Kp', `${summary.strongest.kp_max.toFixed(1)} on ${summary.strongest.date}`], ['Average F10.7', String(Math.round(summary.meanFlux))]]), ...feedCredit(feed)];
  }

  function eventNodes(feed) {
    if (!feed.data.length) return [element('p', 'note', 'No events in the past two weeks.'), ...feedCredit(feed)];
    const list = element('ul');
    list.append(...feed.data.slice(0, 4).map((event) => element('li', null, `${dataTime(event.time)}: ${event.kind}${event.detail ? ` (${event.detail})` : ''}`)));
    return [list, ...feedCredit(feed)];
  }

  function launchListNodes(feed) {
    if (!feed.data.length) return [element('p', 'note', 'No upcoming launches are listed.'), ...feedCredit(feed)];
    const list = element('ul');
    list.append(...feed.data.slice(0, 5).map((launch) => {
      const item = element('li', 'sky-launch', launch.name);
      item.append(element('span', 'sky-meta', ` ${dataTime(launch.net)} · ${launch.status}`));
      return item;
    }));
    return [list, ...feedCredit(feed)];
  }

  function weatherNodes() {
    const title = element('h3', 'sky-title', 'Space weather');
    if (!liveData) return [title, element('p', 'note', LIVE_OFF_NOTE)];
    return [title, ...storeBody(weather, spaceWeatherNodes), block(history, historyNodes), block(events, eventNodes)];
  }

  function launchNodes() {
    const title = element('h3', 'sky-title', 'Next launches');
    if (!liveData) return [title, element('p', 'note', LIVE_OFF_NOTE)];
    return [title, ...storeBody(launches, launchListNodes)];
  }

  function renderPopover() {
    if (!openKind) return;
    popover.replaceChildren(...(openKind === 'weather' ? weatherNodes() : launchNodes()));
  }

  // Runs a render only if the popover is still showing the session that asked for the data.
  function whenSettled(promise, id) {
    promise.then(() => {
      if (id === session) renderPopover();
    });
  }

  function openWeather(id) {
    if (!liveData) return;
    whenSettled(load(weather, () => api.spaceWeather()), id);
    // Fetched once per session. A failed store is retried on the next open because it has no feed.
    if (!history.feed) whenSettled(load(history, () => api.spaceWeatherHistory()), id);
    if (!events.feed) whenSettled(load(events, () => api.spaceEvents()), id);
  }

  function openLaunch(id) {
    if (!liveData) return;
    whenSettled(load(launches, () => api.launches()), id);
  }

  function onPointerDown(event) {
    if (popover.contains(event.target) || kpChip.contains(event.target) || launchChip.contains(event.target)) return;
    close();
  }

  function onKeyDown(event) {
    if (event.key !== 'Escape' || !openKind) return;
    const chip = openKind === 'weather' ? kpChip : launchChip;
    close();
    chip.focus();
  }

  function addListeners() {
    globalThis.document.addEventListener('pointerdown', onPointerDown);
    globalThis.document.addEventListener('keydown', onKeyDown);
  }

  function removeListeners() {
    globalThis.document.removeEventListener('pointerdown', onPointerDown);
    globalThis.document.removeEventListener('keydown', onKeyDown);
  }

  function show(kind) {
    if (!openKind) addListeners();
    openKind = kind;
    session += 1;
    const id = session;
    syncChips();
    popover.hidden = false;
    renderPopover();
    if (kind === 'weather') openWeather(id);
    else openLaunch(id);
  }

  function toggle(kind) {
    if (openKind === kind) close();
    else show(kind);
  }

  function close() {
    if (!openKind) return;
    openKind = null;
    session += 1;
    removeListeners();
    syncChips();
    popover.hidden = true;
    popover.replaceChildren();
  }

  async function start() {
    if (started) return;
    started = true;
    kpStrong = element('strong', null, '…');
    launchStrong = element('strong', null, '…');
    kpChip = chipButton('Kp ', kpStrong, 'weather');
    launchChip = chipButton('Launch ', launchStrong, 'launch');
    chips.append(kpChip, launchChip);
    popover.hidden = true;

    const info = await Promise.resolve(catalog).catch(() => null);
    liveData = info?.liveData !== false;
    if (!liveData) {
      setChipText();
      return;
    }
    await Promise.all([load(weather, () => api.spaceWeather()), load(launches, () => api.launches())]);
  }

  // Re-labels the launch chip so the countdown moves on. It uses the held data and makes no request.
  function tick() {
    if (!launchStrong) return;
    launchStrong.textContent = launchText();
  }

  return { start, tick, close };
}
