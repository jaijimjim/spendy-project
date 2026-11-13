import { describe, expect, it } from 'vitest';
import { parseSlip } from './parseSlip';
import { FIXTURE_TODAY, OCR_FIXTURES } from './__fixtures__/ocrText';

describe('parseSlip — Layer A fixtures', () => {
  it.each(OCR_FIXTURES.map((f) => [f.id, f] as const))('%s', (_id, f) => {
    const r = parseSlip(f.text, FIXTURE_TODAY);
    expect(r.type).toBe(f.expected.type);
    expect(r.categoryId).toBe(f.expected.category);
    expect(r.amountSatang).toBe(f.expected.amountSatang);
    if (f.expected.date === null) {
      expect(r.flags.noDate).toBe(true);
      expect(r.date).toBe(FIXTURE_TODAY);
    } else {
      expect(r.date).toBe(f.expected.date);
    }
    if (f.expected.time !== undefined) expect(r.time).toBe(f.expected.time);
    if (f.expected.payee !== undefined) expect(r.payee).toBe(f.expected.payee);
    if (f.expected.bank !== undefined) expect(r.bank).toBe(f.expected.bank);
    if (f.expected.refNo !== undefined) expect(r.refNo).toBe(f.expected.refNo);
  });

  it('meets the accuracy gates (type ≥ 98%, amount/date/category ≥ 95%)', () => {
    let type = 0;
    let amount = 0;
    let date = 0;
    let category = 0;
    for (const f of OCR_FIXTURES) {
      const r = parseSlip(f.text, FIXTURE_TODAY);
      if (r.type === f.expected.type) type++;
      if (r.amountSatang === f.expected.amountSatang) amount++;
      if ((f.expected.date ?? FIXTURE_TODAY) === r.date) date++;
      if (r.categoryId === f.expected.category) category++;
    }
    const n = OCR_FIXTURES.length;
    expect(type / n).toBeGreaterThanOrEqual(0.98);
    expect(amount / n).toBeGreaterThanOrEqual(0.95);
    expect(date / n).toBeGreaterThanOrEqual(0.95);
    expect(category / n).toBeGreaterThanOrEqual(0.95);
  });

  it('truncates raw text to 500 characters', () => {
    expect(parseSlip('x'.repeat(900), FIXTURE_TODAY).rawText).toHaveLength(500);
  });

  it('flags empty text as low confidence with no amount', () => {
    const r = parseSlip('', FIXTURE_TODAY);
    expect(r.confidence).toBe('low');
    expect(r.flags).toMatchObject({ noAmount: true, noDate: true, lowType: true });
  });

  it('gives high confidence to a clean transfer slip', () => {
    const r = parseSlip(OCR_FIXTURES[0]!.text, FIXTURE_TODAY);
    expect(r.confidence).toBe('high');
  });

  it('flags unusual amounts (> 10,000,000.00) as low confidence', () => {
    const r = parseSlip(
      'โอนเงินสำเร็จ\nไปยัง Shopee\nจำนวนเงิน 20,000,000.00\n13/11/2569',
      FIXTURE_TODAY,
    );
    expect(r.flags.amountUnusual).toBe(true);
    expect(r.confidence).toBe('low');
  });

  it('rejects dates more than 5 years back', () => {
    const r = parseSlip('โอนเงินสำเร็จ\n01/01/2560\nจำนวนเงิน 10.00', FIXTURE_TODAY);
    expect(r.flags.noDate).toBe(true);
  });
});
