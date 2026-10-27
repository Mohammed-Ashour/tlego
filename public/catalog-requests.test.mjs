import assert from 'node:assert/strict';
import test from 'node:test';
import { createCatalogRequests } from './catalog-requests.mjs';

const flush = () => new Promise(setImmediate);

function harness() {
    const pending = [];
    const updates = { groups: [], satellites: [], positions: [], errors: [], settled: 0 };
    const requests = createCatalogRequests({
        fetch(url, options) {
            return new Promise((resolve, reject) => pending.push({ url, ...options, resolve, reject }));
        },
        onGroups: value => updates.groups.push(value),
        onSatellites: value => updates.satellites.push(value),
        onPositions: value => updates.positions.push(value),
        onError: error => updates.errors.push(error.message),
        onSettled: () => updates.settled++,
    });
    const respond = (index, value) => pending[index].resolve({ ok: true, json: async () => value });
    return { requests, pending, updates, respond };
}

test('group responses completed in reverse order preserve the latest selection', async () => {
    const h = harness();
    const previous = h.requests.selectGroup('old');
    const current = h.requests.selectGroup('new');
    assert.equal(h.pending[0].signal.aborted, true);
    h.respond(1, []);
    await current;
    h.respond(0, [{ norad_id: '25544', name: 'old' }]);
    await previous;
    assert.deepEqual(h.updates.satellites, [[]]);
    assert.deepEqual(h.updates.positions, [[]]);
    assert.equal(h.pending.length, 2);
    assert.equal(h.updates.settled, 1);
});

test('satellite responses completed in reverse order cannot restore the previous scene', async () => {
    const h = harness();
    const previous = h.requests.selectSatellites(['old']);
    const current = h.requests.selectSatellites(['new']);
    h.respond(1, { name: 'new' });
    await current;
    h.respond(0, { name: 'old' });
    await previous;
    assert.deepEqual(h.updates.positions, [[{ id: 'new', data: { name: 'new' } }]]);
    assert.equal(h.pending[0].signal.aborted, true);
});

test('a group change invalidates pending satellite requests', async () => {
    const h = harness();
    const previous = h.requests.selectSatellites(['old']);
    const current = h.requests.selectGroup('new');
    h.respond(1, []);
    await current;
    h.respond(0, { name: 'old' });
    await previous;
    assert.deepEqual(h.updates.positions, [[]]);
});

test('HTTP failures do not parse plain text or replace the last valid scene', async () => {
    const h = harness();
    const current = h.requests.selectSatellites(['first', 'second']);
    h.respond(0, { name: 'first' });
    await flush();
    assert.equal(h.pending.length, 2);
    h.pending[1].resolve({
        ok: false, status: 502, statusText: 'Bad Gateway',
        json() { assert.fail('An HTTP error body must not be parsed as JSON'); },
    });
    await current;
    assert.deepEqual(h.updates.positions, []);
    assert.deepEqual(h.updates.errors, ['Request failed (502 Bad Gateway).']);
    assert.equal(h.updates.settled, 1);
});

test('an obsolete request failure does not replace the current status', async () => {
    const h = harness();
    const previous = h.requests.selectGroup('old');
    const current = h.requests.selectGroup('new');
    h.respond(1, []);
    await current;
    h.pending[0].reject(new Error('old request failed'));
    await previous;
    assert.deepEqual(h.updates.errors, []);
    assert.equal(h.updates.settled, 1);
});

test('a complete selection reaches the scene in one update', async () => {
    const h = harness();
    const current = h.requests.selectSatellites(['25544', '12345']);
    h.respond(0, { name: 'ISS' });
    await flush();
    assert.deepEqual(h.updates.positions, []);
    h.respond(1, { name: 'other' });
    await current;
    assert.deepEqual(h.updates.positions, [[
        { id: '25544', data: { name: 'ISS' } },
        { id: '12345', data: { name: 'other' } },
    ]]);
});

test('initial loading uses the same request lifetime for groups, satellites and positions', async () => {
    const h = harness();
    const current = h.requests.loadGroups();
    h.respond(0, ['Space Stations']);
    await flush();
    assert.equal(h.pending[1].url, '/api/satellites?group=Space%20Stations');
    h.respond(1, [{ name: 'ISS', norad_id: '25544' }]);
    await flush();
    assert.equal(h.pending[2].url, '/api/location?norad_id=25544');
    h.respond(2, { name: 'ISS' });
    await current;
    assert.deepEqual(h.updates.groups, [['Space Stations']]);
    assert.equal(h.pending.every(request => request.signal === h.pending[0].signal), true);
    assert.deepEqual(h.updates.positions, [[{ id: '25544', data: { name: 'ISS' } }]]);
});

test('invalid JSON reports a failure without changing the scene', async () => {
    const h = harness();
    const current = h.requests.selectSatellites(['25544']);
    h.pending[0].resolve({ ok: true, json: async () => { throw new SyntaxError('Invalid JSON'); } });
    await current;
    assert.deepEqual(h.updates.positions, []);
    assert.deepEqual(h.updates.errors, ['Invalid JSON']);
});
