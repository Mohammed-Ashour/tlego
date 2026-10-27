// Own the request lifetime for the active group and satellite selection.
export function createCatalogRequests({ fetch: fetchJSON = globalThis.fetch, onGroups, onSatellites, onPositions, onError, onLoading = () => {}, onSettled = () => {} }) {
    let generation = 0;
    let active;

    async function readJSON(url, signal) {
        const response = await fetchJSON(url, { signal });
        if (!response.ok) {
            throw new Error(`Request failed (${response.status}${response.statusText ? ` ${response.statusText}` : ''}).`);
        }
        return response.json();
    }

    async function run(kind, action) {
        const id = ++generation;
        active?.abort();
        const controller = new AbortController();
        active = controller;
        const request = { signal: controller.signal, current: () => id === generation && !controller.signal.aborted };
        onLoading(kind);
        try {
            await action(request);
        } catch (error) {
            if (request.current() && error.name !== 'AbortError') onError(error);
        } finally {
            if (request.current()) onSettled();
        }
    }

    async function positions(ids, request) {
        const result = [];
        for (const id of ids) {
            if (!request.current()) return;
            const data = await readJSON(`/api/location?norad_id=${encodeURIComponent(id)}`, request.signal);
            result.push({ id, data });
        }
        if (request.current()) onPositions(result);
    }

    async function group(name, request) {
        const result = await readJSON(`/api/satellites?group=${encodeURIComponent(name)}`, request.signal);
        if (!request.current()) return;
        onSatellites(result);
        await positions(result.length ? [result[0].norad_id] : [], request);
    }

    return {
        loadGroups: () => run('groups', async (request) => {
            const groups = await readJSON('/api/satellite-groups', request.signal);
            if (!request.current()) return;
            onGroups(groups);
            if (groups.length) await group(groups[0], request);
            else onPositions([]);
        }),
        selectGroup: (name) => run('group', (request) => group(name, request)),
        selectSatellites: (ids) => run('positions', (request) => positions(ids, request)),
    };
}
