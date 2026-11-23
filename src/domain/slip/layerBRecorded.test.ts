/**
 * Layer B — recorded real-OCR text of the 27 synthetic slips (OMX-051 AC2–AC4, OMX-049 AC7).
 *
 * `tests/fixtures/slips/benchmark-results.json` keeps the raw Tesseract text that the real-OCR
 * benchmark (`tests/e2e/benchmark.real-ocr.spec.ts`) read from each image. Re-parsing it here lets
 * every CI run check the parser against Layer B without a browser:
 *  - type / category / date must stay 100% and amount ≥ 26/27 (b16 = BUG-007) — regression gate
 *  - payee exact-match % and CER are REPORTED; the ratchet only blocks a drop below BASELINE
 * Expected values come from `tests/fixtures/slips/expected.json` (fake names only).
 */
import { parseSlip } from './parseSlip';
import { payeeCer, payeeMatches, payeeReport } from './payeeMetrics';
import bench from '../../../tests/fixtures/slips/benchmark-results.json';
import expectedFile from '../../../tests/fixtures/slips/expected.json';

interface Expected {
  type: string;
  category: string;
  amountSatang: number | null;
  date: string | null;
  payee: string | null;
}

const IMAGES = expectedFile.images as Record<string, { expected: Expected }>;
const TODAY = expectedFile.today;

/** Payee baseline on `main` before OMX-049 (OMX-051 AC3). Raise when payee improves. */
const BASELINE_PAYEE = 17;

const rows = bench.rows.map((row) => {
  const e = IMAGES[row.file]!.expected;
  const r = parseSlip(row.rawText, TODAY);
  return { file: row.file, e, r };
});

describe('Layer B recorded OCR text (27 synthetic slips)', () => {
  it('has an expected payee for every image', () => {
    expect(rows).toHaveLength(27);
    for (const { e } of rows) expect(e.payee, 'payee').toBeDefined();
  });

  it('keeps type / category / date at 100% and amount ≥ 26/27', () => {
    const miss = (k: 'type' | 'category' | 'date' | 'amount') =>
      rows
        .filter(({ e, r }) =>
          k === 'type'
            ? r.type !== e.type
            : k === 'category'
              ? r.categoryId !== e.category
              : k === 'date'
                ? r.date !== e.date // as the benchmark: the date input (today fallback counts)
                : r.amountSatang !== e.amountSatang,
        )
        .map((x) => x.file);
    expect(miss('type')).toEqual([]);
    expect(miss('category')).toEqual([]);
    expect(miss('date')).toEqual([]);
    expect(miss('amount').length).toBeLessThanOrEqual(1);
  });

  it('reports payee exact-match / CER and holds the payee ratchet', () => {
    const report = payeeReport(rows.map(({ e, r }) => ({ actual: r.payee, expected: e.payee })));
    console.table(
      rows.map(({ file, e, r }) => ({
        file,
        payee: payeeMatches(r.payee, e.payee) ? '✓' : '✗',
        cer: e.payee === null ? '—' : Math.round(payeeCer(r.payee, e.payee) * 100) / 100,
        got: r.payee ?? '∅',
      })),
    );
    console.log(`[layer-b payee] ${JSON.stringify(report)}`);
    expect(report.exact).toBeGreaterThanOrEqual(BASELINE_PAYEE);
  });
});
