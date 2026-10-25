import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
const license=await readFile('THREE-LICENSE.md','utf8');
await build({entryPoints:['viewer-entry.js'],bundle:true,minify:true,format:'iife',target:['es2020'],outfile:'viewer.bundle.js',legalComments:'inline',banner:{js:`/*! Three.js 0.186.1\n${license}\nLand outlines: Natural Earth v5.1.2, public domain. */`}});
// Preserve the boundary of the enclosing inline HTML script element.
const path='viewer.bundle.js';
await writeFile(path,(await readFile(path,'utf8')).replace(/<\/script/gi,'<\\/script'));
