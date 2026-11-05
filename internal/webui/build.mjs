import { build } from 'esbuild';
import { copyFile, mkdir, readFile, rm } from 'node:fs/promises';

// Everything in dist is embedded, so start empty to leave nothing stale behind.
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
const license = await readFile('../../pkg/templates/THREE-LICENSE.md', 'utf8');
const three = JSON.parse(await readFile('node_modules/three/package.json', 'utf8'));
await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'dist/app.js',
  legalComments: 'inline',
  banner: { js: `/*! Three.js ${three.version}\n${license}\nLand outlines: Natural Earth v5.1.2, public domain. */` },
});
await copyFile('src/index.html', 'dist/index.html');
await copyFile('src/styles.css', 'dist/styles.css');
