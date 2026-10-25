import test from "node:test";
import assert from "node:assert/strict";
import { commonWindow, gmstAt, sampleAt } from "./viewer-state.js";
const start = "2026-10-24T00:00:00Z", end = "2026-10-24T00:00:10Z";
function point(time, x, lon, gmst) {
  return { time, x, y: 0, z: 0, latitude_deg: 0, longitude_deg: lon, altitude_km: 400, speed_km_s: 7.6, gmst_rad: gmst };
}
test("interpolation follows timestamps and takes the short path across the date line", () => {
  const points = [point(start, 0, 179, 6.25), point(end, 10, -179, 0.03)];
  const middle = sampleAt(points, Date.parse(start) + 5e3);
  assert.equal(middle.x, 5);
  assert.equal(middle.longitude_deg, -180);
  assert.equal(middle.gmst_rad, gmstAt(Date.parse(start) + 5e3));
  assert.equal(sampleAt(points, Date.parse(start) - 1e3).x, 0);
  assert.equal(sampleAt(points, Date.parse(end) + 1e3).x, 10);
});
test("group playback uses only the shared interval", () => {
  const points = [point(start, 0, 0, 0), point(end, 10, 0, 0)];
  const other = [point("2026-10-24T00:00:03Z", 3, 0, 0), point("2026-10-24T00:00:20Z", 20, 0, 0)];
  assert.deepEqual(commonWindow([{ points }, { points: other }]), { start: Date.parse(start) + 3e3, end: Date.parse(end) });
  assert.throws(() => commonWindow([{ points }, { points: other.map((p) => ({ ...p, time: "2027-01-01T00:00:00Z" })) }]), /shared timeline/);
});

test("Earth orientation advances through sparse day-long tracks", () => {
  const start = Date.parse("2000-01-01T12:00:00Z");
  assert.ok(Math.abs(gmstAt(start) - 4.89496121273579) < 1e-10);
  const points = [point(new Date(start).toISOString(), 1, 0, gmstAt(start)),
    point(new Date(start + 86400000).toISOString(), 1, 0, gmstAt(start + 86400000))];
  const middle = sampleAt(points, start + 43200000);
  const turn = (middle.gmst_rad - gmstAt(start) + Math.PI * 2) % (Math.PI * 2);
  assert.ok(Math.abs(turn - 3.1501947) < 1e-6);
});
