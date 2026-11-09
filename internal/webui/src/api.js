// Thin client for the JSON API. Each keyed request replaces the previous one with
// that key, so a slow old response cannot overwrite newer state.
export function createApi(fetchJSON = globalThis.fetch?.bind(globalThis)) {
  const active = new Map();

  async function get(path, params = {}, key = null) {
    const query = new URLSearchParams();
    for (const [name, value] of Object.entries(params)) {
      if (value !== undefined && value !== null) query.set(name, value);
    }
    const url = query.size ? `${path}?${query}` : path;
    const controller = new AbortController();
    if (key) {
      active.get(key)?.abort();
      active.set(key, controller);
    }
    try {
      const response = await fetchJSON(url, { signal: controller.signal });
      const text = await response.text();
      let body = null;
      try {
        body = JSON.parse(text);
      } catch {
        // Legacy routes report failures as plain text.
      }
      if (!response.ok) {
        // A proxy's HTML error page is not a message.
        const plain = text.trim();
        const usable = plain.length < 200 && !plain.startsWith('<') ? plain : '';
        throw new ApiError(body?.error?.message || usable || `Request failed (${response.status}).`, response.status);
      }
      if (body === null) throw new ApiError('The server returned an unreadable response.', response.status);
      return body;
    } finally {
      if (key && active.get(key) === controller) active.delete(key);
    }
  }

  const wholeSeconds = (time) => new Date(time).toISOString().replace(/\.\d+Z$/, 'Z');
  const observerParams = (observer) => (observer ? { lat: observer.lat, lon: observer.lon, alt: observer.alt } : {});

  return {
    groups: () => get('/api/satellite-groups'),
    satellites: (group) => get('/api/satellites', { group }, 'satellites'),
    search: (q) => get('/api/v1/search', { q }, 'satellites'),
    track: (id, start, observer) => get('/api/v1/track', { norad_id: id, start: wholeSeconds(start), duration: '25h', step: '60s', ...observerParams(observer) }, `track:${id}`),
    report: (id) => get('/api/v1/report', { norad_id: id }, 'report'),
    passes: (id, observer, start) => get('/api/v1/passes', { norad_id: id, start: wholeSeconds(start), duration: '48h', step: '30s', ...observerParams(observer) }, 'passes'),
    tonight: (id, observer, time) => get('/api/v1/tonight', { norad_id: id, time: typeof time === 'number' ? wholeSeconds(time) : time, ...observerParams(observer) }, 'tonight'),
    sources: () => get('/api/v1/sources', {}, 'sources'),
    spaceWeather: () => get('/api/v1/space-weather', {}, 'space-weather'),
    launches: () => get('/api/v1/launches', {}, 'launches'),
    satelliteDetails: (id) => get('/api/v1/satellite-details', { norad_id: id }, 'satellite-details'),
    transmitters: (id) => get('/api/v1/transmitters', { norad_id: id }, 'transmitters'),
    look: (id, observer, start, end) => get('/api/v1/look', { norad_id: id, start, end, samples: 64, ...observerParams(observer) }, 'look'),
  };
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const isAbort = (error) => error?.name === 'AbortError';
