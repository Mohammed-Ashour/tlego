import { build } from 'esbuild';
import { copyFile, readFile } from 'node:fs/promises';

const license = await readFile('../../pkg/templates/THREE-LICENSE.md', 'utf8');
await build({
  entryPoints: ['src/main.js'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'dist/app.js',
  legalComments: 'inline',
  banner: { js: `/*! Three.js 0.186.1\n${license}\nLand outlines: Natural Earth v5.1.2, public domain. */` },
});
await copyFile('src/index.html', 'dist/index.html');
await copyFile('src/styles.css', 'dist/styles.css');
