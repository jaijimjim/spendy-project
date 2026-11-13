#!/usr/bin/env node
/**
 * OMX-029 AC2: JavaScript loaded before first interaction ≤ 300 KB gzipped.
 * We measure the entry chunk plus its statically imported chunks (modulepreload links in
 * dist/index.html). Tesseract and route-level chunks are dynamic imports and excluded.
 */
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIMIT = 300 * 1024;
const dist = join(resolve(dirname(fileURLToPath(import.meta.url)), '..'), 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');
const srcs = [...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map((m) => m[1]);
let total = 0;
for (const s of new Set(srcs)) {
  const rel = s.replace(/^.*?\/assets\//, 'assets/');
  const size = gzipSync(readFileSync(join(dist, rel))).length;
  total += size;
  console.log(`  ${rel}  ${(size / 1024).toFixed(1)} KB gz`);
}
console.log(`[size] initial JS ${(total / 1024).toFixed(1)} KB gz (limit ${LIMIT / 1024} KB)`);
if (total > LIMIT) process.exit(1);
