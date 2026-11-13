import assert from 'node:assert/strict';
import { test } from 'node:test';
import { GEOMAGNETIC_NORTH, auroraBoundary, auroraRings, smallCircle } from './aurora.js';

// Great-circle distance in degrees, independent of the formula under test.
function haversineDeg(a, b) {
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLon = (b.lon - a.lon) * toRad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toRad) * Math.cos(b.lat * toRad) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(h))) / toRad;
}

test('the auroral boundary follows the rule of thumb and clamps Kp', () => {
  assert.equal(auroraBoundary(0), 66.5);
  assert.equal(auroraBoundary(5), 56.5);
  assert.equal(auroraBoundary(9), 48.5);
  assert.equal(auroraBoundary(-3), 66.5);
  assert.equal(auroraBoundary(12), 48.5);
});

test('every small-circle point lies at the requested distance from the pole', () => {
  for (const radius of [5, 23.5, 41.5]) {
    for (const point of smallCircle(GEOMAGNETIC_NORTH, radius)) {
      assert.ok(Math.abs(haversineDeg(GEOMAGNETIC_NORTH, point) - radius) < 0.01, `point ${JSON.stringify(point)} is off the circle`);
    }
  }
});

test('small-circle longitudes are normalised to -180..180', () => {
  for (const point of smallCircle(GEOMAGNETIC_NORTH, 40)) {
    assert.ok(point.lon >= -180 && point.lon <= 180, `lon ${point.lon} out of range`);
  }
});

test('small circles have steps + 1 points and close exactly', () => {
  const ring = smallCircle({ lat: 10, lon: 20 }, 30, 60);
  assert.equal(ring.length, 61);
  assert.deepEqual(ring[0], ring[60]);
});

test('both aurora rings are closed and the south ring uses the antipodal pole', () => {
  for (const kp of [0, 4, 9]) {
    const [north, south] = auroraRings(kp);
    assert.deepEqual(north[0], north[north.length - 1]);
    assert.deepEqual(south[0], south[south.length - 1]);
    const southPole = { lat: -80.8, lon: 107.2 };
    for (const point of south) {
      assert.ok(Math.abs(haversineDeg(southPole, point) - (90 - auroraBoundary(kp))) < 0.01);
    }
  }
});

test('rings move toward the equator as Kp rises', () => {
  // The lowest latitude on the north ring is the equatorward reach of the oval.
  const reach = (kp) => Math.min(...auroraRings(kp)[0].map((point) => point.lat));
  assert.ok(reach(0) > reach(5));
  assert.ok(reach(5) > reach(9));
});
