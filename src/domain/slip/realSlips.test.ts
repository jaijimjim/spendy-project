/**
 * OMX-042 — Layer C real-slip accuracy on REDACTED OCR text (n = 16, captured 2026-11-23).
 *
 * Fixtures: `tests/fixtures/real-slips/redacted/rNN.txt` = Tesseract.js tha+eng output of the user's
 * real slips with every person name / account / reference id replaced by fake values (see the README
 * in that folder). Ground truth: `tests/fixtures/real-slips/expected.json`.
 *
 * This suite REPORTS accuracy per field / per app and is a RATCHET: it only fails when a field gets
 * worse than BASELINE. It does not gate the MVP metrics yet (open bugs BUG-009..BUG-015).
 * Dev: when a fix (OMX-049 / OMX-050a / OMX-050b / BUG-011..) raises a number, raise BASELINE in the
 * same PR so the gain cannot silently regress.
 */
import { parseSlip, type ParsedSlip } from './parseSlip';
import { normalizePayee } from './parties';
import expectedFile from '../../../tests/fixtures/real-slips/expected.json';

interface ExpectedSlip {
  id: string;
  app: 'make' | 'kplus' | 'krungthai';
  type: string;
  amountSatang: number;
  date: string;
  time: string;
  payee: string;
  payeeAlt?: string[];
  category: string;
  categoryStatus: 'clear' | 'pending';
}

const EXPECTED = expectedFile.slips as ExpectedSlip[];
const TODAY = expectedFile.today;

const REDACTED = import.meta.glob<string>('/tests/fixtures/real-slips/redacted/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});
/** Unredacted OCR — exists only on the QA machine (git-ignored); used to prove redaction is neutral. */
const RAW_LOCAL = import.meta.glob<{ text: string }[] | Record<string, { text: string }>>(
  '/tests/fixtures/real-slips/ocr-raw.local.json',
  { import: 'default', eager: true },
);

/**
 * Baseline on `main` @ 6ebe779 + parser of Sprint 2 Day 1 (correct counts, n = 16).
 * Raise these when a fix lands; never lower them without a PO decision.
 */
const BASELINE = {
  type: 16,
  /** OMX-053: r04, r05 fixed; r14 = BUG-012 (split amount) stays empty */
  amount: 15,
  /** wrong non-null amounts (worse than empty, BUG-011) — OMX-053 AC1: must stay 0 */
  amountWrong: 0,
  /** OMX-054: r08, r14, r15 "w.g." → พ.ย. */
  date: 16,
  time: 16,
  /** OMX-049: 11 exact + r08 empty (own account, AC10) */
  payee: 12,
  /**
   * OMX-049: r01, r02 → transfer (BUG-014); OMX-050a: r03 food, r10 other; OMX-050b: r05, r16
   * transport (+ pending r07/r09/r11). Clear 6/9 = bundle gate (050a AC10c).
   */
  category: 9,
  categoryClear: 6,
} as const;

const textOf = (id: string): string => {
  const t = REDACTED[`/tests/fixtures/real-slips/redacted/${id}.txt`];
  if (t === undefined) throw new Error(`missing redacted fixture ${id}`);
  return t;
};

/**
 * OMX-049 AC10 / planning §9.3 (PO): r08 is a transfer to the owner's own account at another bank
 * (recipient = sender). The sender guard (AC4) must keep payee EMPTY there, and empty counts as
 * correct for this slip only — owner detection is OMX-039 (Sprint 3).
 */
const OWN_ACCOUNT = new Set(['r08']);
/** Fake owner (sender) name used in every redacted slip, incl. its OCR-distorted forms. */
const SENDER_NAME = /ปร[ีึ]ยาแ?นุช/;

const samePayee = (actual: string | null, e: ExpectedSlip): boolean => {
  if (OWN_ACCOUNT.has(e.id)) return !actual;
  if (!actual) return false;
  const n = (s: string) => normalizePayee(s.replace(/ํา/g, 'ำ'));
  return [e.payee, ...(e.payeeAlt ?? [])].some((p) => n(p) === n(actual));
};

interface Row {
  id: string;
  app: string;
  type: boolean;
  amount: boolean;
  amountWrong: boolean;
  date: boolean;
  time: boolean;
  payee: boolean;
  payeeIsSender: boolean;
  category: boolean;
  categoryStatus: string;
  got: string;
}

function score(e: ExpectedSlip, r: ParsedSlip): Row {
  return {
    id: e.id,
    app: e.app,
    type: r.type === e.type,
    amount: r.amountSatang === e.amountSatang,
    amountWrong: r.amountSatang !== null && r.amountSatang !== e.amountSatang,
    date: !r.flags.noDate && r.date === e.date,
    time: r.time === e.time,
    payee: samePayee(r.payee, e),
    payeeIsSender: SENDER_NAME.test(r.payee ?? ''),
    category: r.categoryId === e.category,
    categoryStatus: e.categoryStatus,
    got: `${r.amountSatang ?? '∅'} · ${r.flags.noDate ? 'today' : r.date} · ${r.categoryId} · ${r.payee ?? '∅'}`,
  };
}

const rows = EXPECTED.map((e) => score(e, parseSlip(textOf(e.id), TODAY)));
const count = (list: Row[], k: keyof Row) => list.filter((x) => x[k] === true).length;
const pct = (a: number, n: number) => (n ? `${a}/${n} (${Math.round((a / n) * 1000) / 10}%)` : '—');

describe('OMX-042 real slips (Layer C, redacted OCR text, n = 16)', () => {
  it('has a redacted fixture for every expected slip', () => {
    expect(EXPECTED).toHaveLength(16);
    for (const e of EXPECTED) expect(textOf(e.id).length).toBeGreaterThan(50);
  });

  it('reports accuracy per slip / field / app and holds the ratchet baseline', () => {
    const mark = (b: boolean) => (b ? '✓' : '✗');
    console.table(
      rows.map((x) => ({
        id: x.id,
        app: x.app,
        type: mark(x.type),
        amount: x.amountWrong ? '✗ wrong' : mark(x.amount),
        date: mark(x.date),
        time: mark(x.time),
        payee: mark(x.payee),
        category: `${mark(x.category)}${x.categoryStatus === 'pending' ? ' (pending)' : ''}`,
        got: x.got,
      })),
    );
    const clear = rows.filter((x) => x.categoryStatus === 'clear');
    const fields = {
      type: count(rows, 'type'),
      amount: count(rows, 'amount'),
      amountWrong: count(rows, 'amountWrong'),
      date: count(rows, 'date'),
      time: count(rows, 'time'),
      payee: count(rows, 'payee'),
      category: count(rows, 'category'),
      categoryClear: count(clear, 'category'),
    };
    console.table({
      type: pct(fields.type, 16),
      amount: pct(fields.amount, 16),
      'amount wrong (non-null)': pct(fields.amountWrong, 16),
      date: pct(fields.date, 16),
      time: pct(fields.time, 16),
      payee: pct(fields.payee, 16),
      'category (all, vs proposed)': pct(fields.category, 16),
      'category (clear only)': pct(fields.categoryClear, clear.length),
    });
    const apps = [...new Set(rows.map((x) => x.app))];
    console.table(
      Object.fromEntries(
        apps.map((app) => {
          const g = rows.filter((x) => x.app === app);
          return [
            app,
            {
              n: g.length,
              type: count(g, 'type'),
              amount: count(g, 'amount'),
              date: count(g, 'date'),
              time: count(g, 'time'),
              payee: count(g, 'payee'),
              category: count(g, 'category'),
            },
          ];
        }),
      ),
    );

    // Ratchet: never worse than the recorded baseline.
    expect(fields.type).toBeGreaterThanOrEqual(BASELINE.type);
    expect(fields.amount).toBeGreaterThanOrEqual(BASELINE.amount);
    expect(fields.amountWrong).toBeLessThanOrEqual(BASELINE.amountWrong);
    expect(fields.date).toBeGreaterThanOrEqual(BASELINE.date);
    expect(fields.time).toBeGreaterThanOrEqual(BASELINE.time);
    expect(fields.payee).toBeGreaterThanOrEqual(BASELINE.payee);
    expect(fields.category).toBeGreaterThanOrEqual(BASELINE.category);
    expect(fields.categoryClear).toBeGreaterThanOrEqual(BASELINE.categoryClear);
    // OMX-049 AC10: the sender's name is never returned as payee.
    expect(rows.filter((x) => x.payeeIsSender).map((x) => x.id)).toEqual([]);
  });

  const raw = Object.values(RAW_LOCAL)[0] as Record<string, { text: string }> | undefined;
  it.skipIf(!raw)(
    'redaction is neutral: raw OCR (local only) parses to the same fields except payee',
    () => {
      for (const e of EXPECTED) {
        const src = raw![`s${e.id.slice(1)}.png`];
        expect(src, e.id).toBeDefined();
        const a = parseSlip(src!.text, TODAY);
        const b = parseSlip(textOf(e.id), TODAY);
        const pick = (p: ParsedSlip) => ({
          type: p.type,
          amount: p.amountSatang,
          date: p.date,
          noDate: p.flags.noDate,
          time: p.time,
          category: p.categoryId,
          payeeFound: p.payee !== null,
          bank: p.bank,
        });
        expect(pick(b), e.id).toEqual(pick(a));
      }
    },
  );
});
