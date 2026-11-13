#!/usr/bin/env node
/**
 * OMX-024 AC5: TH and EN resources must have identical key sets and no empty values.
 * Also verifies that every `t('literal.key')` used in src/ exists in the copy deck.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const deck = JSON.parse(readFileSync(join(root, 'design', 'copy-deck.json'), 'utf8'));

const flatten = (obj, prefix = '') =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === 'object' ? flatten(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]],
  );

const th = new Map(flatten(deck.th));
const en = new Map(flatten(deck.en));
const errors = [];
for (const [k] of th) if (!en.has(k)) errors.push(`missing in en: ${k}`);
for (const [k] of en) if (!th.has(k)) errors.push(`missing in th: ${k}`);
for (const [lang, map] of [
  ['th', th],
  ['en', en],
])
  for (const [k, v] of map)
    if (typeof v !== 'string' || v.trim() === '') errors.push(`empty value ${lang}: ${k}`);

// Static usage check: t('a.b') / i18nKey="a.b"
const files = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(ts|tsx)$/.test(name) && !/\.test\./.test(name)) files.push(p);
  }
};
walk(join(root, 'src'));
const keyRe = /\bt\(\s*'([a-zA-Z0-9_.]+)'/g;
const pluralSuffix = /_(one|other)$/;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(keyRe)) {
    const key = m[1];
    if (!key.includes('.')) continue;
    const exists = th.has(key) || th.has(`${key}_other`) || (pluralSuffix.test(key) && th.has(key));
    if (!exists) errors.push(`unknown key "${key}" in ${f.replace(root + '/', '')}`);
  }
}

if (errors.length) {
  console.error(`[i18n] ${errors.length} problem(s):\n  ` + errors.join('\n  '));
  process.exit(1);
}
console.log(`[i18n] OK — ${th.size} keys, TH/EN parity, ${files.length} source files scanned`);
