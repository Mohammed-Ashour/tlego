# Embedded orbit viewer

The Go exporter embeds the HTML shell, CSS and compiled JavaScript. Opening an exported page needs no asset requests or npm runtime. WebGL 2 is required for the globe; metadata remains usable when it is unavailable.

## Rebuild after JavaScript changes

From this directory, with Node.js 22 or newer:

```bash
npm ci --no-audit --no-fund
npm test
npm run build
```

Commit viewer.bundle.js alongside source changes. CI rebuilds it and rejects a stale bundle. Go builds use the committed bundle and do not install Node dependencies.

## Sources and licenses

- Three.js 0.186.1, bundled with OrbitControls. [MIT license](THREE-LICENSE.md). The license is also included in every exported HTML file.
- Natural Earth v5.1.2 [110m land polygons](https://github.com/nvkelso/natural-earth-vector/blob/v5.1.2/geojson/ne_110m_land.geojson), kept as earth-land.json. [Public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/).
- esbuild 0.25.11 is a build-only dependency pinned in package-lock.json.

The coastline file is included in the bundle. It is not fetched by the generated viewer. Application data uses JSON serialization and DOM textContent; never build markup from a satellite name.
