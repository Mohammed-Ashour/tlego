import { activeTransmitters, formatFrequency, groupScenes, sameObjectName } from './logic.js';

// The Identity, Radio and Scenes tabs. Each source is requested only when its tab is first
// opened for a satellite, so a provider hears about a satellite only when the user asks.
const TABS = ['identity', 'radio', 'sees'];
const MAX_TRANSMITTERS = 8;
const NO_SELECTION = 'Add a satellite to see its details here.';
const LIVE_OFF = 'Live data is off while serving a local file.';
const LOADING = 'Loading…';
const GCAT_LOADING = 'Loading… The first time, Khonsu downloads the whole catalog, which can take a couple of minutes.';
const SPACE_TRACK_SETUP = 'Run khonsu setup to connect your own free Space-Track account, then restart Khonsu.';

export function createDossier({ api, element, feedCredit, dataFailure, dataTime, selectedEntry, catalog, panels, focusScene, clearScene }) {
  // Successful feeds are cached for the session; failures are not, so reopening retries.
  const cache = new Map();
  const inflight = new Map();
  // Bumped on every open and selection change, so an answer for old state is dropped.
  const tokens = { identity: 0, radio: 0, sees: 0 };

  const settings = Promise.resolve(catalog).then(
    (value) => ({
      liveData: value?.liveData ?? true,
      spaceTrackReady: value?.spaceTrackReady ?? false,
      imagingIds: value?.imagingIds ?? new Set(),
    }),
    () => ({ liveData: true, spaceTrackReady: false, imagingIds: new Set() }),
  );

  const requests = {
    satelliteDetails: (id) => api.satelliteDetails(id),
    catalogRecord: (id) => api.catalogRecord(id),
    spaceTrack: (id) => api.spaceTrack(id),
    transmitters: (id) => api.transmitters(id),
    recentScenes: (id) => api.recentScenes(id),
  };

  function load(source, id) {
    const key = `${source}:${id}`;
    if (cache.has(key)) return Promise.resolve(cache.get(key));
    if (inflight.has(key)) return inflight.get(key);
    const pending = new Promise((resolve) => resolve(requests[source](id)))
      .then((feed) => {
        cache.set(key, feed);
        return feed;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, pending);
    return pending;
  }

  // Hands a settled request to the panel only while it is still current.
  function watch(promise, current, onFeed, onError) {
    return promise.then(
      (feed) => {
        if (current()) onFeed(feed);
      },
      (error) => {
        if (current() && error?.name !== 'AbortError') onError(error);
      },
    );
  }

  const note = (text) => element('p', 'note', text);

  function detailList(rows) {
    const list = element('ul');
    list.append(...rows.filter(([, value]) => value).map(([label, value]) => element('li', null, `${label}: ${value}`)));
    return list;
  }

  function renderWikidata(feed) {
    const [entry, ...others] = feed.data;
    if (!entry) return [note('Wikidata has no entry for this satellite.'), ...feedCredit(feed)];
    const nodes = [detailList([
      ['Name', entry.name],
      ['Description', entry.description],
      ['Types', (entry.types ?? []).join(', ')],
      ['Operators', (entry.operators ?? []).join(', ')],
      ['Countries', (entry.countries ?? []).join(', ')],
      ['Launch date', entry.launch_date],
    ])];
    if (others.length) nodes.push(note(`Also matched: ${others.map((other) => other.name).join(', ')}`));
    return [...nodes, ...feedCredit(feed)];
  }

  function renderCatalog(feed, primary) {
    const record = feed.data;
    if (!record) return [note('GCAT has no entry for this satellite.'), ...feedCredit(feed)];
    const nodes = [element('h3', 'dossier-heading', `Catalog object: ${record.name}`)];
    if (primary && !sameObjectName(primary.name, record.name)) {
      nodes.push(note(`GCAT lists this object as ${record.name}, so these figures describe that entry alone.`));
    }
    nodes.push(detailList([
      ['Kind', record.kind],
      ['Bus', record.bus],
      ['Mass', record.mass_kg ? `${record.mass_kg.toLocaleString('en-GB')} kg` : null],
      ['Launched', record.launch_date],
      ['Owner code', record.owner],
      ['Manufacturer code', record.manufacturer],
      ['Orbit class', record.orbit_class],
    ]));
    return [...nodes, ...feedCredit(feed)];
  }

  function renderSpaceTrack(feed) {
    const [record] = feed.data;
    if (!record) return [note('Space-Track has no record for this satellite.'), ...feedCredit(feed)];
    return [element('h3', 'dossier-heading', 'Space-Track record'), detailList([
      ['Name', record.name],
      ['Object type', record.object_type],
      ['Radar size', record.rcs_size],
      ['Country code', record.country],
      ['Launched', record.launch_date],
      ['Decayed', record.decay_date],
      ['Element epoch', record.epoch],
    ]), ...feedCredit(feed)];
  }

  function renderRadio(feed) {
    const active = activeTransmitters(feed.data);
    if (!active.length) return [note('SatNOGS lists no active transmitters for this satellite.'), ...feedCredit(feed)];
    const list = element('ul');
    list.append(...active.slice(0, MAX_TRANSMITTERS).map((item) => {
      const details = [formatFrequency(item.downlink_hz), item.mode].filter(Boolean).join(' · ');
      return element('li', null, details ? `${item.description}: ${details}` : item.description);
    }));
    const count = active.length;
    const nodes = [note(`${count} active transmitter${count === 1 ? '' : 's'}`), list];
    if (count > MAX_TRANSMITTERS) nodes.push(note(`+ ${count - MAX_TRANSMITTERS} more`));
    return [...nodes, ...feedCredit(feed)];
  }

  function cloudText(group) {
    const values = [group.minCloud, group.maxCloud]
      .filter((value) => value !== null && value !== undefined)
      .map((value) => Math.round(value));
    if (!values.length) return null;
    const low = Math.min(...values);
    const high = Math.max(...values);
    return low === high ? `${low}% cloud` : `${low}–${high}% cloud`;
  }

  function sceneDetails(group) {
    const parts = [`near ${group.lat.toFixed(1)}°, ${group.lon.toFixed(1)}°`];
    if (group.scenes.length > 1) parts.push(`${group.scenes.length} tiles`);
    const cloud = cloudText(group);
    if (cloud) parts.push(cloud);
    return parts.join(' · ');
  }

  function renderSees(feed) {
    const groups = groupScenes(feed.data);
    if (!groups.length) return [note('Earth Search lists scenes from Sentinel-2 and Landsat satellites. This satellite is not one of them.')];
    const rows = groups.map((group) => {
      const row = element('button', 'scene-row');
      row.type = 'button';
      row.dataset.focus = `scene:${group.time}`;
      row.setAttribute('aria-pressed', 'false');
      row.append(element('strong', null, dataTime(new Date(group.time).toISOString())), element('span', null, sceneDetails(group)));
      row.addEventListener('click', () => {
        for (const other of rows) other.setAttribute('aria-pressed', String(other === row));
        focusScene({ lat: group.lat, lon: group.lon });
      });
      return row;
    });
    const list = element('div', 'scene-list');
    list.append(...rows);
    return [note('Recent scenes and where their centres are. Choose one to mark it on the globe. These are acquisition locations, not the pictures themselves.'), list, ...feedCredit(feed)];
  }

  function openIdentity(entry, current, cat) {
    const wikidataBlock = element('div', 'dossier-block');
    const gcatBlock = element('div', 'dossier-block');
    const trackBlock = element('div', 'dossier-block');
    wikidataBlock.append(note(LOADING));
    gcatBlock.append(note(GCAT_LOADING));
    trackBlock.append(note(cat.spaceTrackReady ? LOADING : SPACE_TRACK_SETUP));
    panels.identity.replaceChildren(wikidataBlock, gcatBlock, trackBlock);

    // The GCAT name check needs both Wikidata and GCAT, so the block is repainted as each arrives.
    let wikidata = null;
    let gcat = null;
    const paintGcat = () => {
      if (!current()) return;
      if (!gcat) gcatBlock.replaceChildren(note(GCAT_LOADING));
      else if (gcat.error) gcatBlock.replaceChildren(dataFailure(gcat.error));
      else gcatBlock.replaceChildren(...renderCatalog(gcat.feed, wikidata?.feed?.data?.[0]));
    };

    const wikidataDone = watch(
      load('satelliteDetails', entry.id), current,
      (feed) => {
        wikidata = { feed };
        wikidataBlock.replaceChildren(...renderWikidata(feed));
        paintGcat();
      },
      (error) => {
        wikidata = { error };
        wikidataBlock.replaceChildren(dataFailure(error));
        paintGcat();
      },
    );
    const gcatDone = watch(
      load('catalogRecord', entry.id), current,
      (feed) => {
        gcat = { feed };
        paintGcat();
      },
      (error) => {
        gcat = { error };
        paintGcat();
      },
    );
    const trackDone = cat.spaceTrackReady
      ? watch(
        load('spaceTrack', entry.id), current,
        (feed) => trackBlock.replaceChildren(...renderSpaceTrack(feed)),
        (error) => trackBlock.replaceChildren(dataFailure(error)),
      )
      : null;
    return Promise.all([wikidataDone, gcatDone, trackDone]);
  }

  function showFeed(panel, current, source, entry, render) {
    panel.replaceChildren(note(LOADING));
    return watch(
      load(source, entry.id), current,
      (feed) => panel.replaceChildren(...render(feed)),
      (error) => panel.replaceChildren(dataFailure(error)),
    );
  }

  async function open(tab) {
    if (!TABS.includes(tab)) return;
    const panel = panels[tab];
    const token = ++tokens[tab];
    const entry = selectedEntry();
    if (!entry) {
      panel.replaceChildren(note(NO_SELECTION));
      return;
    }
    const cat = await settings;
    const current = () => tokens[tab] === token && selectedEntry()?.id === entry.id;
    if (!current()) return;
    if (!cat.liveData) {
      panel.replaceChildren(note(LIVE_OFF));
      return;
    }
    if (tab === 'identity') return openIdentity(entry, current, cat);
    if (tab === 'radio') return showFeed(panel, current, 'transmitters', entry, renderRadio);
    return showFeed(panel, current, 'recentScenes', entry, renderSees);
  }

  function selectionChanged(activeTab) {
    for (const tab of TABS) tokens[tab] += 1;
    clearScene();
    if (TABS.includes(activeTab)) return open(activeTab);
    return undefined;
  }

  async function hasSees() {
    const entry = selectedEntry();
    if (!entry) return false;
    const cat = await settings;
    return cat.imagingIds.has(entry.id);
  }

  return { open, selectionChanged, hasSees };
}
