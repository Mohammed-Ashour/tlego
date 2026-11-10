import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  annotatePasses, activeTransmitters, buildUrlState, canonicalId, cloudAtTime, compassPoint, elementAgeDays, filterSatellites, formatClock, formatCountdown, formatDay, formatDuration,
  dataAge, describeKp, formatFrequency, groupScenes, latestKp, launchLabel, nextLaunch, sameObjectName, summarizeHistory, lookAt, MAX_TRACKED, migrateStorage, needsNewWindow, nextColor, PALETTE, parseObserver, parseUrlState, passesOverlap, providerMessage, readStoredObserver, safeStorage, shortCoordinate, sunlitAt, trailRange, validId, windowFrom,
} from './logic.js';

test('compass points cover the circle and wrap', () => {
  assert.equal(compassPoint(0), 'N');
  assert.equal(compassPoint(11.2), 'N');
  assert.equal(compassPoint(11.3), 'NNE');
  assert.equal(compassPoint(90), 'E');
  assert.equal(compassPoint(359.9), 'N');
  assert.equal(compassPoint(-90), 'W');
});

test('IDs follow the API rules', () => {
  assert.ok(validId('25544'));
  assert.ok(validId('123456789'));
  assert.ok(!validId('0'));
  assert.ok(!validId('1234567890'));
  assert.ok(!validId('A5544'));
  assert.equal(canonicalId('00123'), '123');
});

test('URL state drops invalid and duplicate IDs and never holds location', () => {
  assert.deepEqual(parseUrlState('?sats=25544,bad,025544,48274&selected=48274&lat=51'), { ids: ['25544', '48274'], selected: '48274' });
  assert.deepEqual(parseUrlState('?sats=25544&selected=999'), { ids: ['25544'], selected: '25544' });
  assert.deepEqual(parseUrlState(''), { ids: [], selected: null });
  const many = Array.from({ length: 20 }, (_, i) => i + 1).join(',');
  assert.equal(parseUrlState(`?sats=${many}`).ids.length, MAX_TRACKED);
});

test('URL state round-trips', () => {
  const url = buildUrlState(['25544', '48274'], '48274');
  assert.equal(url, '?sats=25544,48274&selected=48274');
  assert.deepEqual(parseUrlState(url), { ids: ['25544', '48274'], selected: '48274' });
  assert.equal(buildUrlState(['25544'], '25544'), '?sats=25544');
  assert.equal(buildUrlState([], null), '');
});

test('colors stay unique until the palette runs out', () => {
  assert.equal(nextColor([]), PALETTE[0]);
  assert.equal(nextColor([PALETTE[0]]), PALETTE[1]);
  assert.ok(PALETTE.includes(nextColor([...PALETTE])));
});

test('observer validation names the failing field', () => {
  assert.deepEqual(parseObserver({ lat: '51.48', lon: '0', alt: '' }).observer, { lat: 51.48, lon: 0, alt: 0 });
  assert.match(parseObserver({ lat: '91', lon: '0' }).error, /Latitude/);
  assert.match(parseObserver({ lat: '', lon: '0' }).error, /Latitude/);
  assert.match(parseObserver({ lat: '0', lon: 'x' }).error, /Longitude/);
  assert.match(parseObserver({ lat: '0', lon: '0', alt: '500' }).error, /Altitude/);
});

test('stored observers survive bad data', () => {
  const storage = (value) => ({ getItem: () => value });
  assert.deepEqual(readStoredObserver(storage('{"lat":1,"lon":2,"alt":0}')), { lat: 1, lon: 2, alt: 0 });
  assert.equal(readStoredObserver(storage('nonsense')), null);
  assert.equal(readStoredObserver(storage(null)), null);
  assert.equal(readStoredObserver(storage('{"lat":500,"lon":2}')), null);
  assert.equal(readStoredObserver(storage('{"lat":null,"lon":null}')), null);
  assert.equal(readStoredObserver(storage('{"lat":true,"lon":false}')), null);
});

test('filtering matches names and IDs', () => {
  const items = [{ name: 'ISS (ZARYA)', norad_id: '25544' }, { name: 'CSS (TIANHE)', norad_id: '48274' }];
  assert.equal(filterSatellites(items, ' zarya ').length, 1);
  assert.equal(filterSatellites(items, '482')[0].norad_id, '48274');
  assert.equal(filterSatellites(items, '').length, 2);
});

const sample = (seconds, azimuth, elevation, sunlit = true) => ({ time: new Date(seconds * 1000).toISOString(), azimuth_deg: azimuth, elevation_deg: elevation, sunlit });

test('look interpolation crosses north without sweeping the long way', () => {
  const look = lookAt([sample(0, 350, 0), sample(10, 10, 20)], 5000);
  assert.ok(Math.abs(look.azimuth) < 1e-9 || Math.abs(look.azimuth - 360) < 1e-9);
  assert.equal(look.elevation, 10);
  assert.equal(lookAt([{ time: new Date(0).toISOString() }], 0), null);
  assert.equal(lookAt([], 0), null);
});

test('look interpolation stays inside the samples', () => {
  const samples = [sample(0, 10, 1), sample(10, 20, 2)];
  assert.equal(lookAt(samples, -5000).elevation, 1);
  assert.equal(lookAt(samples, 50000).elevation, 2);
});

test('sunlight follows the latest sample', () => {
  const samples = [sample(0, 0, 0, true), sample(10, 0, 0, false)];
  assert.equal(sunlitAt(samples, 5000), true);
  assert.equal(sunlitAt(samples, 10000), false);
  assert.equal(sunlitAt([], 0), true);
});

test('trail range covers one period around the time, with a sample of overlap', () => {
  const samples = Array.from({ length: 200 }, (_, i) => sample(i * 60, 0, 0));
  const range = trailRange(samples, 100 * 60000, 90);
  assert.equal(range.first, 54);
  assert.equal(range.count, 93);
  // Past the end of the samples, it shows the last whole orbit.
  assert.deepEqual(trailRange(samples, 1e12, 90), { first: 108, count: 92 });
});

test('trail range keeps a whole orbit near the start of the samples', () => {
  // A 12-hour orbit, 1 hour after the samples start: GPS satellites hit this.
  const samples = Array.from({ length: 25 * 60 + 1 }, (_, i) => sample(i * 60, 0, 0));
  assert.deepEqual(trailRange(samples, 60 * 60000, 720), { first: 0, count: 722 });
  // Near the end, it slides back so the orbit stays complete.
  assert.deepEqual(trailRange(samples, 24.5 * 3600000, 720), { first: 779, count: 722 });
  // An orbit longer than the samples shows everything.
  assert.deepEqual(trailRange(samples, 60 * 60000, 2000), { first: 0, count: 1501 });
  assert.deepEqual(trailRange([], 0, 90), { first: 0, count: 0 });
});

test('passes are marked when a visible stretch overlaps them', () => {
  const pass = (start, end) => ({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
  const visible = [{ start: { at: new Date(150).toISOString() }, end: { at: new Date(180).toISOString() } }];
  const [hit, miss] = annotatePasses([pass(100, 200), pass(300, 400)], visible);
  assert.equal(hit.visible, visible[0]);
  assert.equal(miss.visible, null);
});

test('durations and countdowns read naturally', () => {
  assert.equal(formatDuration(42000), '42 s');
  assert.equal(formatDuration(125000), '2 min 5 s');
  assert.equal(formatDuration(3 * 3600000 + 60000), '3 h 1 min');
  assert.equal(formatDuration(72 * 3600000), '3 days');
  assert.equal(formatCountdown(61000, 1000), 'in 1 min');
  assert.equal(formatCountdown(31000, 1000), 'in under a minute');
  assert.equal(formatCountdown(1000 + 3 * 3600000 + 300000, 1000), 'in 3 h 5 min');
  assert.equal(formatCountdown(1000, 61000), 'now');
});

test('times format in UTC on request', () => {
  const time = Date.UTC(2026, 9, 24, 5, 1, 11);
  assert.equal(formatClock(time, true), '05:01:11');
  assert.match(formatDay(time, true), /^Sat,? 24 Oct$/);
});

test('element age is signed', () => {
  assert.equal(elementAgeDays('1970-01-02T00:00:00Z', 2 * 86400000), 1);
  assert.equal(elementAgeDays('1970-01-03T00:00:00Z', 86400000), -1);
});

test('windows lead the clock and refresh before running out', () => {
  const window = windowFrom(10 * 3600000 + 500);
  assert.equal(window.start, 9 * 3600000);
  assert.equal(window.end, 34 * 3600000);
  assert.equal(needsNewWindow(window, 20 * 3600000), false);
  assert.equal(needsNewWindow(window, 33 * 3600000), true);
  assert.equal(needsNewWindow(window, 8 * 3600000), true);
});

test('rate limits get a helpful message and other errors pass through', () => {
  assert.match(providerMessage('unexpected status: 403 Forbidden'), /limiting downloads/);
  assert.equal(providerMessage('NORAD ID 99999 is not in the local file'), 'NORAD ID 99999 is not in the local file');
});

test('storage failures are contained', () => {
  const blocked = safeStorage(() => { throw new Error('SecurityError'); });
  assert.equal(blocked.getItem('x'), null);
  assert.doesNotThrow(() => blocked.setItem('x', '1'));
  assert.doesNotThrow(() => blocked.removeItem('x'));
  const full = safeStorage(() => ({ setItem() { throw new Error('quota'); } }));
  assert.doesNotThrow(() => full.setItem('x', '1'));
  const values = new Map();
  const working = safeStorage(() => ({ getItem: (k) => values.get(k), setItem: (k, v) => values.set(k, v) }));
  working.setItem('x', '1');
  assert.equal(working.getItem('x'), '1');
});

test('connection failures get a clear message', () => {
  assert.match(providerMessage('Failed to fetch'), /could not be reached/);
});

test('short coordinates round and never show a negative zero', () => {
  assert.equal(shortCoordinate(49.96, 'N', 'S'), '50.0° N');
  assert.equal(shortCoordinate(-0.0004, 'E', 'W'), '0.0° E');
  assert.equal(shortCoordinate(-12.34, 'E', 'W'), '12.3° W');
});

test('passes match across a changed clipped start', () => {
  const pass = (start, end) => ({ start: new Date(start).toISOString(), end: new Date(end).toISOString() });
  assert.ok(passesOverlap(pass(100, 500), pass(200, 500)));
  assert.ok(!passesOverlap(pass(100, 200), pass(300, 400)));
});

test('legacy preferences move to the new keys without replacing newer ones', () => {
  const memory = (entries) => {
    const map = new Map(Object.entries(entries));
    return { map, getItem: (key) => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), removeItem: (key) => map.delete(key) };
  };
  const old = memory({ 'tlego.observer': '{"lat":1,"lon":2,"alt":0}', 'tlego.utc': '1' });
  migrateStorage(old);
  assert.deepEqual(Object.fromEntries(old.map), { 'khonsu.observer': '{"lat":1,"lon":2,"alt":0}', 'khonsu.utc': '1' });
  const both = memory({ 'tlego.utc': '1', 'khonsu.utc': '0' });
  migrateStorage(both);
  assert.deepEqual(Object.fromEntries(both.map), { 'khonsu.utc': '0' });
});

test('Kp descriptions follow the NOAA storm threshold', () => {
  assert.equal(describeKp(3.67), 'Quiet');
  assert.equal(describeKp(4), 'Active');
  assert.equal(describeKp(5), 'Geomagnetic storm');
});

test('frequencies use a readable unit and reject missing values', () => {
  assert.equal(formatFrequency(145825000), '145.825 MHz');
  assert.equal(formatFrequency(2401600000), '2.402 GHz');
  assert.equal(formatFrequency(null), null);
});

test('data age is short and never negative', () => {
  const now = Date.parse('2026-11-09T12:00:00Z');
  assert.equal(dataAge('2026-11-09T12:00:30Z', now), 'just now');
  assert.equal(dataAge('2026-11-09T11:45:00Z', now), '15 min ago');
  assert.equal(dataAge('2026-11-09T09:00:00Z', now), '3 h ago');
  assert.equal(dataAge('2026-11-01T12:00:00Z', now), '8 days ago');
});

test('history summary finds the strongest day and the average flux', () => {
  const summary = summarizeHistory([{ date: 'a', kp_max: 2, f107: 100 }, { date: 'b', kp_max: 7.3, f107: 140 }]);
  assert.equal(summary.strongest.date, 'b');
  assert.equal(summary.meanFlux, 120);
  assert.equal(summarizeHistory([]), null);
});

test('latest Kp is the last sample, or null when there is none', () => {
  assert.equal(latestKp({ kp: [{ time: '2026-11-09T00:00:00Z', kp: 2 }, { time: '2026-11-09T03:00:00Z', kp: 4.33 }] }), 4.33);
  assert.equal(latestKp({ kp: [] }), null);
  assert.equal(latestKp({}), null);
  assert.equal(latestKp(undefined), null);
});

test('only alive, active transmitters are kept in order', () => {
  const list = [
    { id: 1, alive: true, status: 'active' },
    { id: 2, alive: false, status: 'active' },
    { id: 3, alive: true, status: 'inactive' },
    { id: 4, alive: true, status: 'active' },
    { id: 5, alive: 'true', status: 'active' },
  ];
  assert.deepEqual(activeTransmitters(list).map((item) => item.id), [1, 4]);
  assert.deepEqual(activeTransmitters(null), []);
  assert.deepEqual(activeTransmitters(undefined), []);
});

test('object names match across punctuation and spacing', () => {
  assert.equal(sameObjectName('Sentinel-2A', 'SENTINEL 2A'), true);
  assert.equal(sameObjectName('International Space Station', 'Zarya'), false);
  assert.equal(sameObjectName('', 'x'), false);
  assert.equal(sameObjectName(null, 'x'), false);
  assert.equal(sameObjectName('ISS', 'ISS (ZARYA)'), true);
  assert.equal(sameObjectName('---', '!!!'), false);
});

test('scenes seconds apart form one group, newest first', () => {
  const groups = groupScenes([
    { id: 'early', time: '2026-11-09T10:00:10Z', cloud_cover: 20, center_lat: 1, center_lon: 2 },
    { id: 'late', time: '2026-11-09T10:00:25Z', cloud_cover: 40, center_lat: 3, center_lon: 4 },
  ]);
  assert.equal(groups.length, 1);
  assert.equal(groups[0].time, Date.parse('2026-11-09T10:00:25Z'));
  assert.deepEqual(groups[0].scenes.map((scene) => scene.id), ['late', 'early']);
  assert.equal(groups[0].lat, 3);
  assert.equal(groups[0].lon, 4);
  assert.equal(groups[0].minCloud, 20);
  assert.equal(groups[0].maxCloud, 40);
});

test('a scene an hour later starts its own group', () => {
  const groups = groupScenes([
    { id: 'a', time: '2026-11-09T10:00:00Z', cloud_cover: 10, center_lat: 0, center_lon: 0 },
    { id: 'b', time: '2026-11-09T11:00:00Z', cloud_cover: 60, center_lat: 5, center_lon: 6 },
  ]);
  assert.equal(groups.length, 2);
  assert.equal(groups[0].scenes[0].id, 'b');
  assert.equal(groups[0].lat, 5);
  assert.equal(groups[1].scenes[0].id, 'a');
  assert.equal(groups[1].minCloud, 10);
});

test('groups chain across gaps and respect the gap limit', () => {
  const at = (minutes) => ({ id: String(minutes), time: new Date(Date.parse('2026-11-09T10:00:00Z') + minutes * 60000).toISOString(), cloud_cover: null, center_lat: 0, center_lon: 0 });
  // Each neighbour is 4 minutes apart, so the chain stays one group even though it spans 8 minutes.
  assert.equal(groupScenes([at(0), at(4), at(8)]).length, 1);
  // Exactly the gap joins; one millisecond more starts a new group.
  assert.equal(groupScenes([at(0), at(5)]).length, 1);
  assert.equal(groupScenes([at(0), { ...at(5), time: new Date(Date.parse('2026-11-09T10:05:00Z') + 1).toISOString() }]).length, 2);
  assert.equal(groupScenes([at(0), at(2)], 60000).length, 2);
});

test('group cloud range ignores nulls and is null when all are unknown', () => {
  const scene = (id, cloud) => ({ id, time: '2026-11-09T10:00:00Z', cloud_cover: cloud, center_lat: 0, center_lon: 0 });
  const mixed = groupScenes([scene('a', null), scene('b', 10), scene('c', 30)]);
  assert.equal(mixed[0].minCloud, 10);
  assert.equal(mixed[0].maxCloud, 30);
  const unknown = groupScenes([scene('a', null), scene('b', null)]);
  assert.equal(unknown[0].minCloud, null);
  assert.equal(unknown[0].maxCloud, null);
  assert.deepEqual(groupScenes([]), []);
  assert.deepEqual(groupScenes(undefined), []);
});

const hoursFrom = () => [
  { time: '2026-11-09T12:00:00Z', percent: 40 },
  { time: '2026-11-09T13:00:00Z', percent: 80 },
];

test('cloud cover is read at the nearest hour within an hour', () => {
  const hours = hoursFrom();
  const at = (iso) => Date.parse(iso);
  assert.equal(cloudAtTime(hours, at('2026-11-09T13:00:00Z')), 80);
  assert.equal(cloudAtTime(hours, at('2026-11-09T12:30:00Z')), 40);
  assert.equal(cloudAtTime(hours, at('2026-11-09T14:00:00Z')), 80);
  assert.equal(cloudAtTime(hours, at('2026-11-09T14:01:00Z')), null);
  assert.equal(cloudAtTime([], 0), null);
  assert.equal(cloudAtTime(undefined, 0), null);
});

test('next launch is the earliest future launch, whatever the order', () => {
  const now = Date.parse('2026-11-09T12:00:00Z');
  const launches = [
    { name: 'late', net: '2026-11-10T08:00:00Z', status: 'Go', precision: 'Second' },
    { name: 'past', net: '2026-11-09T11:00:00Z', status: 'Go', precision: 'Second' },
    { name: 'broken', net: 'not a date', status: 'Go', precision: 'Second' },
    { name: 'soon', net: '2026-11-09T14:00:00Z', status: 'Go', precision: 'Second' },
  ];
  assert.equal(nextLaunch(launches, now).name, 'soon');
  assert.equal(nextLaunch([launches[0]], now).name, 'late');
  assert.equal(nextLaunch([{ name: 'now', net: '2026-11-09T12:00:00Z' }], now).name, 'now');
  assert.equal(nextLaunch([launches[1], launches[2]], now), null);
  assert.equal(nextLaunch([], now), null);
  assert.equal(nextLaunch(undefined, now), null);
});

test('launch labels use minutes, hours and days', () => {
  const now = Date.parse('2026-11-09T12:00:00Z');
  const launch = (ms, precision = 'Second') => ({ name: 'x', net: new Date(now + ms).toISOString(), status: 'Go', precision });
  const label = (ms, precision) => launchLabel(launch(ms, precision), now);
  const minute = 60000;
  const hour = 3600000;
  // Minutes: rounded, and never below one.
  assert.equal(label(25 * minute), 'in 25 min');
  assert.equal(label(10000), 'in 1 min');
  // Hours: the first hour-based form starts at 60 minutes and stops before 36 hours.
  assert.equal(label(hour), 'in 1 h');
  assert.equal(label(75 * minute), 'in 1 h');
  assert.equal(label(5.4 * hour), 'in 5 h');
  assert.equal(label(35 * hour), 'in 35 h');
  // Days: rounded from 36 hours onwards.
  assert.equal(label(70 * hour), 'in 3 days');
  assert.equal(label(48 * hour), 'in 2 days');
});

test('approximate precision adds "about" and never shows zero hours', () => {
  const now = Date.parse('2026-11-09T12:00:00Z');
  const launch = (ms, precision) => ({ name: 'x', net: new Date(now + ms).toISOString(), status: 'Go', precision });
  const label = (ms, precision) => launchLabel(launch(ms, precision), now);
  const minute = 60000;
  const hour = 3600000;
  // Minutes form: approximate launches read as hours, with at least one.
  assert.equal(label(10 * minute, 'Day'), 'in about 1 h');
  assert.equal(label(50 * minute, 'Day'), 'in about 1 h');
  // Hours and days forms.
  assert.equal(label(5 * hour, 'Day'), 'in about 5 h');
  assert.equal(label(3 * 24 * hour, 'Day'), 'in about 3 days');
});

test('exact precision is case-insensitive and missing precision counts as exact', () => {
  const now = Date.parse('2026-11-09T12:00:00Z');
  const label = (precision) => launchLabel({ name: 'x', net: new Date(now + 5 * 3600000).toISOString(), status: 'Go', precision }, now);
  assert.equal(label('HOUR'), 'in 5 h');
  assert.equal(label('minute'), 'in 5 h');
  assert.equal(label('Second'), 'in 5 h');
  assert.equal(label(undefined), 'in 5 h');
  assert.equal(label(''), 'in 5 h');
  assert.equal(label('day'), 'in about 5 h');
});
