# Web app

The browser app behind `khonsu web`. `dist` is built from `src` and embedded in the binary. Commit it with any change to `src`, or to the orbit viewer files it imports from `pkg/templates`. CI checks that it matches.

```bash
npm ci
npm test
npm run build
```

## Sources and licenses

- [Three.js](https://threejs.org/), MIT. See `pkg/templates/THREE-LICENSE.md`. The notice is kept in the bundle.
- Land outlines from [Natural Earth](https://www.naturalearthdata.com/) v5.1.2, public domain, shared with `pkg/templates/earth-land.json`.
