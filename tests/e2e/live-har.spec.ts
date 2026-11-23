/**
 * OMX-048 AC3 (+ OMX-030 AC1, OMX-028 AC2) — HAR of upload → real OCR → save on the deployed site.
 * Runs only in the `live` project (`.github/workflows/post-deploy.yml`, `E2E_BASE_URL` = Pages URL)
 * and uses SYNTHETIC slips from tests/fixtures/slips/images only — never real customer slips.
 *
 * Visit 1: upload b02 → real Tesseract → review → save.
 * Visit 2 (same browser context ⇒ same HTTP cache + IndexedDB): reload, check the saved row,
 *          upload b05 → real Tesseract again.
 * Asserts: every http(s) request stays on our origin (allowlist), Tesseract worker/core/lang load
 * from our origin on visit 1, and on visit 2 no Tesseract asset is downloaded again (served from the
 * browser HTTP cache, revalidated with 304, or — for traineddata — from tesseract.js' IndexedDB cache).
 * The HAR (content omitted) + a JSON summary are written to test-results/live-har/ for QA review.
 */
import { expect, test, type Request } from '@playwright/test';
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { setup } from './helpers';

const OUT = join(process.cwd(), 'test-results/live-har');
const HAR = join(OUT, 'upload-ocr-save.har');
const SLIPS = join(process.cwd(), 'tests/fixtures/slips/images');
const TESSERACT = /\/tesseract\/(worker\.min\.js|core\/[^/?]+|lang\/[^/?]+\.traineddata\.gz)$/;

interface Seen {
  visit: 1 | 2;
  method: string;
  url: string;
  status: number | null;
  /** Served from the browser HTTP cache: no network timing, or 0 bytes over the wire. */
  fromCache: boolean;
  fromServiceWorker: boolean;
  transferBytes: number | null;
}

const slip = (file: string) => ({
  name: file,
  mimeType: 'image/png',
  buffer: readFileSync(join(SLIPS, file)),
});

test('HAR: upload → real OCR → save stays on our origin and reuses cached Tesseract assets', async ({
  browser,
  baseURL,
}) => {
  test.setTimeout(300_000);
  mkdirSync(OUT, { recursive: true });
  const origin = new URL(baseURL!).origin;
  const context = await browser.newContext({
    baseURL,
    locale: 'th-TH',
    timezoneId: 'Asia/Bangkok',
    recordHar: { path: HAR, content: 'omit', mode: 'full' },
  });
  const page = await context.newPage();
  let visit: 1 | 2 = 1;
  const pending: Promise<Seen>[] = [];
  const track = (req: Request) => {
    const v = visit;
    pending.push(
      (async (): Promise<Seen> => {
        const res = await req.response().catch(() => null);
        const timing = req.timing();
        const sizes = res ? await req.sizes().catch(() => null) : null;
        const transferBytes = sizes ? sizes.responseHeadersSize + sizes.responseBodySize : null;
        return {
          visit: v,
          method: req.method(),
          url: req.url(),
          status: res?.status() ?? null,
          fromCache: !!res && (timing.responseStart < 0 || transferBytes === 0),
          fromServiceWorker: res?.fromServiceWorker() ?? false,
          transferBytes,
        };
      })(),
    );
  };
  context.on('request', track);

  // ── Visit 1: upload → real OCR → review → save ────────────────────────────────────────────
  await setup(page, { ocr: 'real' });
  await page.goto('./#/add');
  await page
    .getByTestId('file-input')
    .setInputFiles([slip('b02-transfer-th-grabfood-balance.png')]);
  await expect(page.getByRole('button', { name: /ตรวจรายการ \(1/ })).toBeVisible({
    timeout: 200_000,
  });
  await page.getByRole('button', { name: /ตรวจรายการ/ }).click();
  await expect(page.getByTestId('review-card').getByLabel('จำนวนเงิน (บาท)')).toHaveValue('245.00');
  await page.getByRole('button', { name: /บันทึกที่เลือก \(1\)/ }).click();
  await expect(page.getByTestId('toast')).toContainText('บันทึกแล้ว 1 รายการ');

  // ── Visit 2: reload (same cache/IndexedDB), saved row persists, OCR again ────────────────
  visit = 2;
  await page.goto('./#/transactions');
  await page.reload();
  await expect(page.getByText('GrabFood')).toBeVisible();
  await page.goto('./#/add');
  await page.getByTestId('file-input').setInputFiles([slip('b05-bill-electricity.png')]);
  await expect(page.getByRole('button', { name: /ตรวจรายการ \(1/ })).toBeVisible({
    timeout: 200_000,
  });
  await page.getByRole('button', { name: /ตรวจรายการ/ }).click();
  await expect(page.getByTestId('review-card').getByLabel('จำนวนเงิน (บาท)')).toHaveValue('1385.00');

  const seen = await Promise.all(pending);
  await context.close(); // flushes the HAR

  const web = seen.filter((s) => /^https?:/.test(s.url));
  const foreign = web.filter((s) => new URL(s.url).origin !== origin);
  const tess = web.filter((s) => TESSERACT.test(new URL(s.url).pathname));
  const v1 = tess.filter((s) => s.visit === 1);
  const v2 = tess.filter((s) => s.visit === 2);
  const downloadedAgain = v2.filter(
    (s) => !(s.fromCache || s.fromServiceWorker || s.status === 304),
  );
  const harEntries = (
    JSON.parse(readFileSync(HAR, 'utf8')) as { log: { entries: { request: { url: string } }[] } }
  ).log.entries.map((e) => e.request.url);
  const harForeign = harEntries.filter((u) => /^https?:/.test(u) && new URL(u).origin !== origin);
  const summary = {
    baseURL,
    origin,
    requests: web.length,
    harEntries: harEntries.length,
    foreign: [...foreign.map((s) => `${s.method} ${s.url}`), ...harForeign],
    tesseractVisit1: v1,
    tesseractVisit2: v2,
    downloadedAgainOnVisit2: downloadedAgain,
  };
  writeFileSync(join(OUT, 'summary.json'), JSON.stringify(summary, null, 2));
  console.log('[live-har] summary:\n' + JSON.stringify(summary, null, 2));
  if (process.env.GITHUB_STEP_SUMMARY) {
    const row = (s: Seen) =>
      `| ${s.visit} | ${new URL(s.url).pathname} | ${s.status ?? '—'} | ${
        s.fromCache || s.fromServiceWorker || s.status === 304 ? 'cache' : 'network'
      } | ${s.transferBytes ?? '—'} |`;
    const lang2 = v2.filter((s) => s.url.endsWith('.traineddata.gz')).length;
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      [
        '## HAR — upload → real OCR → save (synthetic slips b02, b05)',
        '',
        `- Requests: ${web.length} (HAR entries ${harEntries.length}) · outside ${origin}: **${summary.foreign.length}**`,
        `- Visit 2: Tesseract assets downloaded again: **${downloadedAgain.length}** · traineddata requests: ${lang2} (0 ⇒ served from tesseract.js IndexedDB cache)`,
        '',
        '| Visit | Tesseract asset | Status | From | Bytes over wire |',
        '|---|---|---|---|---|',
        ...tess.map(row),
        '',
      ].join('\n'),
    );
  }

  // OMX-030 AC1 / 048 AC3: nothing leaves the allowlist (our origin only; blob:/data: are local).
  expect(summary.foreign).toEqual([]);
  // OMX-028 AC2 / 048 AC3: self-hosted Tesseract worker, core and tha+eng data from our origin.
  const v1Paths = v1.filter((s) => s.status === 200).map((s) => new URL(s.url).pathname);
  expect(v1Paths.some((p) => p.endsWith('/tesseract/worker.min.js'))).toBe(true);
  expect(v1Paths.some((p) => /\/tesseract\/core\/tesseract-core.*\.wasm\.js$/.test(p))).toBe(true);
  expect(v1Paths.some((p) => p.endsWith('/tesseract/lang/tha.traineddata.gz'))).toBe(true);
  expect(v1Paths.some((p) => p.endsWith('/tesseract/lang/eng.traineddata.gz'))).toBe(true);
  // 048 AC3: second visit reuses cached assets — nothing is downloaded again.
  expect(downloadedAgain).toEqual([]);
});
