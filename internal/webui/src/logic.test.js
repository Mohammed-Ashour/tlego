import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  annotatePasses, buildUrlState, canonicalId, compassPoint, elementAgeDays, filterSatellites, formatClock, formatCountdown, formatDay, formatDuration,
  lookAt, MAX_TRACKED, needsNewWindow, nextColor, PALETTE, parseObserver, parseUrlState, readStoredObserver, sunlitAt, trailRange, validId, windowFrom,
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

test('trail range covers one period around the time', () => {
  const samples = Array.from({ length: 200 }, (_, i) => sample(i * 60, 0, 0));
  const range = trailRange(samples, 100 * 60000, 90);
  assert.equal(range.first, 55);
  assert.equal(range.count, 91);
  assert.deepEqual(trailRange(samples, 1e12, 90), { first: 0, count: 200 });
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
  assert.equal(formatCountdown(1000 + 60000, 1000), 'in 1 min 0 s');
  assert.equal(formatCountdown(1000, 61000), '1 min 0 s ago');
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
