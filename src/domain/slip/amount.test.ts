import { describe, expect, it } from 'vitest';
import { extractAmount, isUnusualAmount, parseAmountToken, tokensIn } from './amount';
import { normalizeText, toLines } from './normalize';

const lines = (s: string) => toLines(normalizeText(s));

describe('parseAmountToken', () => {
  it.each([
    ['1,250.00', 125000],
    ['1250', 125000],
    ['1,250.50', 125050],
    ['1 250.00', 125000],
    ['1,25O.OO', 125000],
    ['l,250.00', 125000],
    ['1,250', 125000],
    ['0.01', 1],
    ['999,999.99', 99999999],
    ['1,000,000.00', 100000000],
    ['12.5', 1250],
  ])('%s → %i satang', (raw, satang) => {
    expect(parseAmountToken(raw)).toBe(satang);
  });

  it.each(['1,250.005', '1.250,00', 'OO', '0123456789', '1,25', '1 2 3'])('rejects %s', (raw) => {
    expect(parseAmountToken(raw)).toBeNull();
  });
});

describe('extractAmount formats (AC4)', () => {
  it.each([
    ['จำนวนเงิน ฿1,250.50', 125050],
    ['Amount 1,250.00 THB', 125000],
    ['Amount THB 1,250.00', 125000],
    ['จำนวนเงิน 1,250.00 บาท', 125000],
    ['จำนวนเงิน ๑,๒๕๐.๐๐', 125000],
    ['ยอดชำระ 1250', 125000],
    ['ยอดโอน: 1 250.00', 125000],
  ])('%s', (text, satang) => {
    expect(extractAmount(lines(text), false).satang).toBe(satang);
  });

  it('ignores fee, balance, reference and account numbers (AC3)', () => {
    const r = extractAmount(
      lines(
        'ค่าธรรมเนียม 0.00\nยอดเงินคงเหลือ 9,999.00\nเลขที่รายการ 1234567890\n123-4-56789-0\nจำนวนเงิน\n120.00',
      ),
      false,
    );
    expect(r).toEqual({ satang: 12000, source: 'label' });
  });

  it('falls back to a money-looking token when no label exists', () => {
    expect(extractAmount(lines('SCB\n13/11/2026\n59.00 บาท'), false)).toEqual({
      satang: 5900,
      source: 'fallback',
    });
  });

  it('returns none when nothing looks like money', () => {
    expect(extractAmount(lines('hello world'), false).source).toBe('none');
  });

  it('salary: uses net pay label order and never gross (AC2)', () => {
    const t = lines('รายได้รวม 50,000.00\nรายการหัก 2,000.00\nNet Pay 48,000.00\nเงินได้สุทธิ 48,000.00');
    expect(extractAmount(t, true).satang).toBe(4800000);
    expect(extractAmount(lines('รายได้รวม 50,000.00'), true).satang).toBeNull();
    expect(extractAmount(lines('รายได้รวม 9,000.00\nรวมสุทธิ 7,000.00'), true).satang).toBe(700000);
  });

  it('marks malformed labelled values as rejected (AC5)', () => {
    expect(extractAmount(lines('จำนวนเงิน 1.250,00'), false)).toMatchObject({
      satang: null,
      rejected: true,
    });
  });
});

describe('tokensIn', () => {
  it('skips dates, times and words', () => {
    expect(tokensIn('13/11/2569 14:35 Olivia K1').map((t) => t.raw)).toEqual([]);
  });
});

describe('isUnusualAmount', () => {
  it('flags > 10M and ≤ 0', () => {
    expect(isUnusualAmount(1_000_000_001)).toBe(true);
    expect(isUnusualAmount(0)).toBe(true);
    expect(isUnusualAmount(100)).toBe(false);
  });
});
