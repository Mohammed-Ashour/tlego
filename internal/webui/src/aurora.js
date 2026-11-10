// Auroral oval geometry. Pure functions, so they can be tested without a browser.

// Approximate IGRF dipole pole (geomagnetic north), in geographic degrees.
export const GEOMAGNETIC_NORTH = { lat: 80.8, lon: -72.8 };

const SOUTH_POLE = { lat: -80.8, lon: 107.2 };

// Equatorward edge of the auroral oval in geomagnetic latitude.
// Rough rule of thumb only: the edge moves about 2 degrees equatorward per Kp unit.
// Kp is clamped to 0 to 9.
export function auroraBoundary(kp) {
  const clamped = Math.min(9, Math.max(0, kp));
  return 66.5 - 2 * clamped;
}

// Points at angular distance radiusDeg from pole, along a small circle.
// The last point repeats the first exactly, so the ring closes without a gap.
export function smallCircle(pole, radiusDeg, steps = 120) {
  const toRad = Math.PI / 180;
  const lat1 = pole.lat * toRad;
  const lon1 = pole.lon * toRad;
  const delta = radiusDeg * toRad;
  const points = [];
  for (let i = 0; i < steps; i += 1) {
    const bearing = (2 * Math.PI * i) / steps;
    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(delta) + Math.cos(lat1) * Math.sin(delta) * Math.cos(bearing));
    const lon2 = lon1 + Math.atan2(Math.sin(bearing) * Math.sin(delta) * Math.cos(lat1), Math.cos(delta) - Math.sin(lat1) * Math.sin(lat2));
    points.push({ lat: lat2 / toRad, lon: ((lon2 / toRad + 180) % 360 + 360) % 360 - 180 });
  }
  points.push({ ...points[0] });
  return points;
}

// The two oval rings, north first. Each is a geomagnetic latitude circle at the boundary.
export function auroraRings(kp) {
  const radius = 90 - auroraBoundary(kp);
  return [smallCircle(GEOMAGNETIC_NORTH, radius), smallCircle(SOUTH_POLE, radius)];
}
