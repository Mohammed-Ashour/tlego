// Pure helpers for the web app, kept free of the DOM so they can be tested in Node.
import { wrap } from '../../../pkg/templates/viewer-state.js';

export const MAX_TRACKED = 8;
export const PALETTE = ['#66ccff', '#ff8066', '#9be564', '#d69cff', '#ffd166', '#72e0c1', '#f28cb1', '#b8c0ff'];
const COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];

export function compassPoint(azimuth) {
  return COMPASS[Math.floor(wrap(azimuth, 360) / 22.5 + 0.5) % COMPASS.length];
}

// CelesTrak answers 403 when a data set was downloaded too recently.
export function providerMessage(message) {
  return /\b403\b/.test(message) ? 'CelesTrak is limiting downloads of this data for now. Try again later.' : message;
}

export function validId(value) {
  return /^\d{1,9}$/.test(value) && Number(value) >= 1;
}

export function canonicalId(value) {
  return String(value).replace(/^0+(?=\d)/, '');
}

// Reads the shareable part of the state. Location is left out, so a shared link
// never reveals where the sender is.
export function parseUrlState(search) {
  const params = new URLSearchParams(search);
  const seen = new Set();
  const ids = [];
  for (const raw of (params.get('sats') || '').split(',')) {
    const id = canonicalId(raw.trim());
    if (validId(id) && !seen.has(id) && ids.length < MAX_TRACKED) {
      seen.add(id);
      ids.push(id);
    }
  }
  const selected = canonicalId(params.get('selected') || '');
  return { ids, selected: seen.has(selected) ? selected : ids[0] ?? null };
}

export function buildUrlState(ids, selected) {
  if (!ids.length) return '';
  const params = new URLSearchParams();
  params.set('sats', ids.join(','));
  if (selected && selected !== ids[0]) params.set('selected', selected);
  return `?${params.toString().replaceAll('%2C', ',')}`;
}

export function nextColor(used) {
  return PALETTE.find((color) => !used.includes(color)) ?? PALETTE[used.length % PALETTE.length];
}

// Returns an observer with numeric fields, or a message describing the first problem.
export function parseObserver({ lat, lon, alt }) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  const altitude = alt === '' || alt === undefined || alt === null ? 0 : Number(alt);
  if (String(lat).trim() === '' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) return { error: 'Latitude must be between -90 and 90 degrees.' };
  if (String(lon).trim() === '' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) return { error: 'Longitude must be between -180 and 180 degrees.' };
  if (!Number.isFinite(altitude) || altitude < -1 || altitude > 100) return { error: 'Altitude must be between -1 and 100 km.' };
  return { observer: { lat: latitude, lon: longitude, alt: altitude } };
}

export function readStoredObserver(storage) {
  try {
    const parsed = parseObserver(JSON.parse(storage.getItem('tlego.observer')) ?? {});
    return parsed.observer ?? null;
  } catch {
    return null;
  }
}

export function filterSatellites(items, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) => item.name.toLowerCase().includes(needle) || item.norad_id.includes(needle));
}

// Interpolates the optional observer direction, which viewer-state's sampleAt omits.
export function lookAt(samples, time) {
  if (!samples.length || samples[0].elevation_deg === undefined) return null;
  let low = 0;
  let high = samples.length - 1;
  while (high - low > 1) {
    const middle = (low + high) >> 1;
    if (Date.parse(samples[middle].time) <= time) low = middle;
    else high = middle;
  }
  const a = samples[low];
  const b = samples[high];
  const span = Date.parse(b.time) - Date.parse(a.time);
  const fraction = span > 0 ? Math.max(0, Math.min(1, (time - Date.parse(a.time)) / span)) : 0;
  const azimuth = wrap(a.azimuth_deg + (wrap(b.azimuth_deg - a.azimuth_deg + 180, 360) - 180) * fraction, 360);
  return { azimuth, elevation: a.elevation_deg + (b.elevation_deg - a.elevation_deg) * fraction };
}

export function sunlitAt(samples, time) {
  let result = samples[0]?.sunlit ?? true;
  for (const sample of samples) {
    if (Date.parse(sample.time) > time) break;
    result = sample.sunlit;
  }
  return result;
}

// Indexes of the samples within half a period of a time, for drawing one orbit.
export function trailRange(samples, time, periodMinutes) {
  const half = periodMinutes * 30000;
  let first = samples.length;
  let last = -1;
  samples.forEach((sample, index) => {
    const at = Date.parse(sample.time);
    if (at >= time - half && at <= time + half) {
      first = Math.min(first, index);
      last = index;
    }
  });
  if (last < first) return { first: 0, count: samples.length };
  return { first, count: last - first + 1 };
}

export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

// Marks each pass that overlaps a visible stretch, and carries that stretch along.
export function annotatePasses(passes, visible) {
  return passes.map((pass) => ({
    ...pass,
    visible: visible.find((item) => Date.parse(item.start.at) <= Date.parse(pass.end) && Date.parse(item.end.at) >= Date.parse(pass.start)) ?? null,
  }));
}

export function formatDuration(milliseconds) {
  const total = Math.max(0, Math.round(milliseconds / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  if (hours >= 48) return `${Math.round(hours / 24)} days`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  if (minutes > 0) return `${minutes} min ${total % 60} s`;
  return `${total} s`;
}

export function formatCountdown(target, now) {
  const difference = target - now;
  return difference >= 0 ? `in ${formatDuration(difference)}` : `${formatDuration(-difference)} ago`;
}

export function formatClock(time, utc) {
  return new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false, timeZone: utc ? 'UTC' : undefined }).format(time);
}

export function formatDay(time, utc) {
  return new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: utc ? 'UTC' : undefined }).format(time);
}

export function zoneLabel(utc) {
  return utc ? 'UTC' : 'local';
}

export function elementAgeDays(epoch, now) {
  return (now - Date.parse(epoch)) / 86400000;
}

export function formatCoordinate(value, positive, negative) {
  return `${Math.abs(value).toFixed(3)}° ${value >= 0 ? positive : negative}`;
}

// The timeline starts shortly before the requested time and covers the next day.
export const WINDOW_LEAD_MS = 3600000;
export const WINDOW_SPAN_MS = 25 * 3600000;

export function windowFrom(time) {
  const start = Math.floor((time - WINDOW_LEAD_MS) / 1000) * 1000;
  return { start, end: start + WINDOW_SPAN_MS };
}

// Tracks are refetched two hours before the live clock would run off their end.
export function needsNewWindow(window, time) {
  return time < window.start || time > window.end - 2 * 3600000;
}
