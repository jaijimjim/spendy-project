/**
 * QA Layer A golden set (OMX-006 AC7, OMX-007 AC8, OMX-008 AC8, OMX-010 AC9).
 * Each fixture asserts type, category, amount and date (null ⇒ no acceptable date ⇒ fallback flag).
 * Fixtures with `knownBug` run as `it.fails` so CI stays green while the defect is open and turns
 * red as soon as it is fixed (then clear `knownBug` in qaGolden.ts).
 */
import { parseSlip } from './parseSlip';
import { payeeMatches } from './payeeMetrics';
import { QA_FIXTURES, type QaFixture } from './__fixtures__/qaGolden';

const TODAY = '2026-11-13';

function check(f: QaFixture) {
  const r = parseSlip(f.text, TODAY);
  expect({
    type: r.type,
    category: r.categoryId,
    amountSatang: r.amountSatang,
    date: r.flags.noDate ? null : r.date,
  }).toEqual({
    type: f.expected.type,
    category: f.expected.category,
    amountSatang: f.expected.amountSatang,
    date: f.expected.date,
  });
  if (f.expected.time !== undefined) expect(r.time).toBe(f.expected.time);
  // OMX-051 AC1: payee only when the fixture states it (normalized compare).
  if (f.expected.payee !== undefined)
    expect(payeeMatches(r.payee, f.expected.payee), `payee "${r.payee}"`).toBe(true);
}

describe('QA golden OCR-text fixtures (Layer A)', () => {
  for (const f of QA_FIXTURES) {
    if (f.knownBug.length) it.fails(`${f.id} [open: ${f.knownBug.join(', ')}]`, () => check(f));
    else it(f.id, () => check(f));
  }

  it('reports field accuracy on the QA set (gates apply to bug-free fixtures)', () => {
    const fields = { type: 0, amount: 0, date: 0, category: 0, payee: 0 };
    let payeeN = 0;
    for (const f of QA_FIXTURES) {
      const r = parseSlip(f.text, TODAY);
      if (r.type === f.expected.type) fields.type++;
      if (r.amountSatang === f.expected.amountSatang) fields.amount++;
      if ((r.flags.noDate ? null : r.date) === f.expected.date) fields.date++;
      if (r.categoryId === f.expected.category) fields.category++;
      if (f.expected.payee !== undefined) {
        payeeN++;
        if (payeeMatches(r.payee, f.expected.payee)) fields.payee++;
      }
    }
    const n = QA_FIXTURES.length;
    console.log(
      `[qa-golden] n=${n} type=${fields.type}/${n} amount=${fields.amount}/${n} date=${fields.date}/${n} category=${fields.category}/${n} payee=${fields.payee}/${payeeN}`,
    );
    // CI gates from OMX-006/007/010 hold on this set even with the open defects
    expect(fields.type / n).toBeGreaterThanOrEqual(0.98);
    expect(fields.amount / n).toBeGreaterThanOrEqual(0.95);
  });
});
