function commonWindow(satellites) {
  if (!satellites.length) throw new Error("No satellite data is available.");
  const start = Math.max(...satellites.map((s) => Date.parse(s.points[0].time)));
  const end = Math.min(...satellites.map((s) => Date.parse(s.points.at(-1).time)));
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) throw new Error("No shared timeline is available.");
  return { start, end };
}
function wrap(value, period) {
  return (value % period + period) % period;
}
function angular(a, b, t, period) {
  return a + (wrap(b - a + period / 2, period) - period / 2) * t;
}
// Match the pinned Go propagator's UTC-based GMST approximation. Computing
// from time preserves full Earth rotations even between sparse GEO samples.
function gmstAt(time) {
  const centuries = (time / 86400000 + 2440587.5 - 2451545) / 36525;
  const seconds = -6.2e-6 * centuries ** 3 + 0.093104 * centuries ** 2
    + (876600 * 3600 + 8640184.812866) * centuries + 67310.54841;
  return wrap(seconds * Math.PI / 180 / 240, Math.PI * 2);
}
function sampleAt(points, time) {
  let low = 0, high = points.length - 1;
  while (high - low > 1) {
    const mid = low + high >> 1;
    if (Date.parse(points[mid].time) <= time) low = mid;
    else high = mid;
  }
  const a = points[low], b = points[high];
  const start = Date.parse(a.time), end = Date.parse(b.time);
  const fraction = Math.max(0, Math.min(1, (time - start) / (end - start)));
  const out = {};
  for (const key of ["x", "y", "z", "latitude_deg", "altitude_km", "speed_km_s"]) out[key] = a[key] + (b[key] - a[key]) * fraction;
  out.longitude_deg = wrap(angular(a.longitude_deg, b.longitude_deg, fraction, 360) + 180, 360) - 180;
  out.gmst_rad = gmstAt(start + (end - start) * fraction);
  return out;
}
export {
  commonWindow,
  gmstAt,
  sampleAt,
  wrap
};
