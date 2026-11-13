#!/usr/bin/env node
/**
 * Copy Tesseract.js worker, WASM core and language data from PINNED npm packages
 * into public/tesseract/ so they are served from the app's own origin (ADR-0001, OMX-028 AC4,
 * OMX-030 AC1). The output folder is git-ignored: nothing binary is committed and no CDN is used.
 *
 *   public/tesseract/worker.min.js
 *   public/tesseract/core/tesseract-core{,-simd,-relaxedsimd}-lstm.wasm.js
 *   public/tesseract/lang/{tha,eng}.traineddata.gz      (4.0.0_best_int models)
 */
import {
  copyFileSync,
  mkdirSync,
  existsSync,
  statSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'public', 'tesseract');

const pkgDir = (name) => dirname(require.resolve(`${name}/package.json`));
const version = (name) =>
  JSON.parse(readFileSync(join(pkgDir(name), 'package.json'), 'utf8')).version;

/** We create workers with OEM.LSTM_ONLY, so only the *-lstm core builds are ever requested. */
const CORE_FILES = [
  'tesseract-core-lstm.wasm.js',
  'tesseract-core-simd-lstm.wasm.js',
  'tesseract-core-relaxedsimd-lstm.wasm.js',
];
const LANGS = ['tha', 'eng'];

const copies = [
  [join(pkgDir('tesseract.js'), 'dist', 'worker.min.js'), join(out, 'worker.min.js')],
  ...CORE_FILES.map((f) => [join(pkgDir('tesseract.js-core'), f), join(out, 'core', f)]),
  ...LANGS.map((l) => [
    join(pkgDir(`@tesseract.js-data/${l}`), '4.0.0_best_int', `${l}.traineddata.gz`),
    join(out, 'lang', `${l}.traineddata.gz`),
  ]),
];

let total = 0;
for (const [from, to] of copies) {
  if (!existsSync(from)) {
    console.error(`[tesseract-assets] missing ${from} — run "npm ci" first`);
    process.exit(1);
  }
  mkdirSync(dirname(to), { recursive: true });
  copyFileSync(from, to);
  total += statSync(to).size;
}

const manifest = {
  'tesseract.js': version('tesseract.js'),
  'tesseract.js-core': version('tesseract.js-core'),
  '@tesseract.js-data/tha': version('@tesseract.js-data/tha'),
  '@tesseract.js-data/eng': version('@tesseract.js-data/eng'),
  model: '4.0.0_best_int',
};
writeFileSync(join(out, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(
  `[tesseract-assets] copied ${copies.length} files (${(total / 1048576).toFixed(1)} MiB) → public/tesseract`,
);
