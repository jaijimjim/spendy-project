#!/usr/bin/env node
/**
 * Layer B synthetic slip generator (QA, R7).
 *   HTML templates (templates/*.html) + cases.json → images/<id>.png|jpg + expected.json
 * Deterministic: committed OFL fonts, fixed viewport/scale, no randomness. Re-run only when a
 * template or case changes, and commit the regenerated images together with the change.
 *
 *   node tests/fixtures/slips/generate.mjs
 *   PW_CHROMIUM_PATH=/path/to/chrome node tests/fixtures/slips/generate.mjs   (offline sandboxes)
 */
/* global process, document, console */
import { chromium } from 'playwright';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const tplDir = join(here, 'templates');
const outDir = join(here, 'images');
const spec = JSON.parse(readFileSync(join(here, 'cases.json'), 'utf8'));

const esc = (s) =>
  String(s ?? '').replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );

function rowsHtml(rows, kind) {
  if (!Array.isArray(rows)) return '';
  return rows
    .map(([k, v]) =>
      kind === 'table'
        ? `<tr><td>${esc(k)}</td><td class="num">${esc(v)}</td></tr>`
        : `<div class="row"><span class="k">${esc(k)}</span><span class="v">${esc(v)}</span></div>`,
    )
    .join('\n');
}

function render(template, data, bodyClass = '') {
  const html = readFileSync(join(tplDir, `${template}.html`), 'utf8');
  const view = {
    ...data,
    bodyClass,
    extraRows: rowsHtml(data.extraRows, 'rows'),
    earningRows: rowsHtml(data.earningRows, 'table'),
    deductionRows: rowsHtml(data.deductionRows, 'table'),
  };
  return html
    .replace(/\{\{\{(\w+)\}\}\}/g, (_, k) => view[k] ?? '')
    .replace(/\{\{(\w+)\}\}/g, (_, k) => esc(view[k]));
}

const executablePath = process.env.PW_CHROMIUM_PATH || undefined;
const browser = await chromium.launch(executablePath ? { executablePath } : {});
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const byId = Object.fromEntries(spec.cases.map((c) => [c.id, c]));
const jobs = [
  ...spec.cases.map((c) => ({ id: c.id, c, bodyClass: '', scale: 1.5, format: 'png' })),
  ...spec.variants.map((v) => ({
    id: v.id,
    c: byId[v.base],
    bodyClass: v.bodyClass ?? '',
    scale: 1.5 * (v.scale ?? 1),
    format: v.format ?? 'png',
    quality: v.quality,
    variant: v,
  })),
];

const expected = {
  generatedBy: 'tests/fixtures/slips/generate.mjs',
  today: spec.today,
  images: {},
};
for (const j of jobs) {
  // Write the rendered HTML next to the templates so relative font/css URLs resolve via file://.
  const tmp = join(tplDir, `.render-${j.id}.html`);
  writeFileSync(tmp, render(j.c.template, j.c.data, j.bodyClass));
  const page = await browser.newPage({
    viewport: { width: 820, height: 1200 },
    deviceScaleFactor: j.scale,
  });
  await page.goto(pathToFileURL(tmp).href);
  await page.evaluate(() => document.fonts.ready);
  const file = `${j.id}.${j.format === 'jpeg' ? 'jpg' : 'png'}`;
  const target = j.bodyClass.includes('rotate') ? page.locator('body') : page.locator('.slip');
  await target.screenshot({
    path: join(outDir, file),
    type: j.format,
    ...(j.format === 'jpeg' ? { quality: j.quality ?? 70 } : {}),
  });
  await page.close();
  rmSync(tmp);
  expected.images[file] = {
    case: j.c.id,
    template: j.c.template,
    variant: j.variant
      ? {
          bodyClass: j.bodyClass || undefined,
          scale: j.variant.scale,
          format: j.format,
          quality: j.quality,
        }
      : undefined,
    expected: j.c.expected,
    covers: [...(j.c.covers ?? []), ...(j.variant?.covers ?? [])],
    note: j.c.note,
  };
  console.log(`[slips] ${file}`);
}
await browser.close();
writeFileSync(join(here, 'expected.json'), JSON.stringify(expected, null, 2) + '\n');
console.log(`[slips] ${jobs.length} images + expected.json written to ${outDir}`);
