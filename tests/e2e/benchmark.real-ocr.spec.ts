/**
 * Layer B OCR accuracy benchmark (QA — OMX-006 AC7, OMX-007 AC8, OMX-008 AC8, OMX-010 AC9, K5).
 * Uploads every synthetic slip in tests/fixtures/slips/images to the BUILT app with the real
 * Tesseract engine, waits for OCR, then reads on each Review card:
 *   - what the app filled in (type radio, amount input, date input, category label), and
 *   - the raw OCR text (re-parsed with the same pure parser to double-check the app's values).
 * Writes tests/fixtures/slips/benchmark-results.json and fails only if a gate is missed:
 *   type ≥ 90%, amount ≥ 80%, category ≥ 60% (date: reported, no gate).
 * Runs in the `real-ocr` project:  npx playwright test --project=real-ocr benchmark
 */
import { expect, test } from '@playwright/test';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseSlip } from '../../src/domain/slip/parseSlip';
import { setup } from './helpers';

const DIR = join(process.cwd(), 'tests/fixtures/slips');
const expectedFile = JSON.parse(readFileSync(join(DIR, 'expected.json'), 'utf8')) as {
  today: string;
  images: Record<
    string,
    {
      case: string;
      expected: {
        type: string;
        category: string;
        amountSatang: number | null;
        date: string | null;
        time?: string | null;
      };
      note?: string;
    }
  >;
};
const copy = JSON.parse(readFileSync(join(process.cwd(), 'design/copy-deck.json'), 'utf8')) as {
  en: { categories: Record<string, string> };
};
const CATEGORY_BY_EN_NAME = Object.fromEntries(
  Object.entries(copy.en.categories).map(([id, name]) => [name, id]),
);

test('Layer B real-OCR accuracy benchmark', async ({ page }) => {
  test.setTimeout(20 * 60_000);
  const files = readdirSync(join(DIR, 'images'))
    .filter((f) => /\.(png|jpe?g)$/.test(f))
    .sort();
  expect(files.length).toBeGreaterThan(0);

  await setup(page, { ocr: 'real', now: `${expectedFile.today}T10:00:00+07:00` }, 'en');
  await page.goto('./#/add');
  const started = Date.now();
  await page.getByTestId('file-input').setInputFiles(
    files.map((f) => ({
      name: f,
      mimeType: f.endsWith('.png') ? 'image/png' : 'image/jpeg',
      buffer: readFileSync(join(DIR, 'images', f)),
    })),
  );
  await expect(page.getByRole('button', { name: `Review (${files.length} ready)` })).toBeVisible({
    timeout: 18 * 60_000,
  });
  const totalMs = Date.now() - started;
  await page.getByRole('button', { name: /Review \(/ }).click();

  const cards = page.getByTestId('review-card');
  await expect(cards).toHaveCount(files.length);

  const rows: {
    file: string;
    expected: (typeof expectedFile.images)[string]['expected'];
    app: {
      type: string;
      category: string;
      amountSatang: number | null;
      date: string;
      time: string | null;
    };
    reparsed: { type: string; category: string; amountSatang: number | null; date: string | null };
    ok: Record<'type' | 'amount' | 'category' | 'date' | 'time', boolean>;
    rawText: string;
  }[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i]!;
    const exp = expectedFile.images[file]!.expected;
    const card = cards.nth(i);
    const rawText = (await card.locator('details pre').textContent()) ?? '';
    const appType = (
      await card.getByRole('radio', { checked: true }).first().textContent()
    )?.includes('Income')
      ? 'income'
      : 'expense';
    const appAmount = await card.getByLabel('Amount (THB)').inputValue();
    const appDate = await card.locator('input[type="date"]').first().inputValue();
    const appTime = await card.locator('input[type="time"]').first().inputValue();
    const catText = (await card.locator('p').nth(1).textContent())?.trim() ?? '';
    const appCategory = CATEGORY_BY_EN_NAME[catText] ?? `?${catText}`;
    const parsed = parseSlip(rawText, expectedFile.today);
    const appSatang = appAmount ? Math.round(Number(appAmount.replace(/,/g, '')) * 100) : null;
    rows.push({
      file,
      expected: exp,
      app: {
        type: appType,
        category: appCategory,
        amountSatang: appSatang,
        date: appDate,
        time: appTime || null,
      },
      reparsed: {
        type: parsed.type,
        category: parsed.categoryId,
        amountSatang: parsed.amountSatang,
        date: parsed.flags.noDate ? null : parsed.date,
      },
      ok: {
        type: appType === exp.type,
        amount: appSatang === exp.amountSatang,
        category: appCategory === exp.category,
        date: appDate === exp.date,
        time: (appTime || null) === (exp.time ?? null),
      },
      rawText,
    });
  }

  const n = rows.length;
  const pct = (k: 'type' | 'amount' | 'category' | 'date' | 'time') =>
    Math.round((rows.filter((r) => r.ok[k]).length / n) * 1000) / 10;
  const summary = {
    runAt: new Date().toISOString(),
    images: n,
    ocrTotalSeconds: Math.round(totalMs / 100) / 10,
    ocrSecondsPerImage: Math.round(totalMs / n / 100) / 10,
    accuracy: {
      type: pct('type'),
      amount: pct('amount'),
      category: pct('category'),
      date: pct('date'),
      time: pct('time'),
    },
    targets: { type: 90, amount: 80, category: 60, date: null },
    appMatchesReparse: rows.every(
      (r) => r.app.amountSatang === r.reparsed.amountSatang && r.app.type === r.reparsed.type,
    ),
  };
  writeFileSync(
    join(DIR, 'benchmark-results.json'),
    JSON.stringify({ summary, rows }, null, 2) + '\n',
  );
  console.log('[benchmark] ' + JSON.stringify(summary));
  for (const r of rows)
    console.log(
      `[benchmark] ${r.file}: ` +
        (['type', 'amount', 'category', 'date', 'time'] as const)
          .map((k) => `${k}=${r.ok[k] ? 'ok' : 'MISS'}`)
          .join(' ') +
        ` | app=${JSON.stringify(r.app)}`,
    );

  expect(summary.accuracy.type).toBeGreaterThanOrEqual(90);
  expect(summary.accuracy.amount).toBeGreaterThanOrEqual(80);
  expect(summary.accuracy.category).toBeGreaterThanOrEqual(60);
});
