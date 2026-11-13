import { describe, expect, it } from 'vitest';
import { findDates, findSalaryDate, findTime, resolveYear } from './slipDate';

const first = (s: string, thai = true) => findDates(s, thai)[0]?.date ?? null;

describe('findDates', () => {
  it.each([
    '13 พ.ย. 69 14:35 น.',
    '13 พ.ย. 2569',
    '13 พย 69',
    '13 พ.ย 69',
    '13 พฤศจิกายน 2569',
    '13/11/2026',
    '13/11/2569',
    '13-11-69',
    '2026-11-13',
    '13 Nov 2026',
    'Nov 13, 2026',
    '13 November 2026',
  ])('%s → 2026-11-13', (s) => {
    expect(first(s)).toBe('2026-11-13');
  });

  it('numeric dates are day/month/year', () => {
    expect(first('01/02/2026')).toBe('2026-02-01');
  });

  it('rejects impossible dates and accepts leap days', () => {
    expect(first('31/11/2569')).toBeNull();
    expect(first('29 ก.พ. 2569')).toBeNull();
    expect(first('29 ก.พ. 2567')).toBe('2024-02-29');
  });

  it('2-digit year in English-only context is CE', () => {
    expect(first('13 Nov 26', false)).toBe('2026-11-13');
    expect(first('13-11-69', false)).toBe('2069-11-13');
  });

  it('handles every Thai month abbreviation', () => {
    const abbr = [
      'ม.ค.',
      'ก.พ.',
      'มี.ค.',
      'เม.ย.',
      'พ.ค.',
      'มิ.ย.',
      'ก.ค.',
      'ส.ค.',
      'ก.ย.',
      'ต.ค.',
      'พ.ย.',
      'ธ.ค.',
    ];
    abbr.forEach((a, i) =>
      expect(first(`1 ${a} 2569`)).toBe(`2026-${String(i + 1).padStart(2, '0')}-01`),
    );
  });
});

describe('resolveYear', () => {
  it('converts BE and 2-digit years', () => {
    expect(resolveYear('2569', true)).toBe(2026);
    expect(resolveYear('2026', true)).toBe(2026);
    expect(resolveYear('69', true)).toBe(2026);
    expect(resolveYear('26', false)).toBe(2026);
  });
});

describe('findTime', () => {
  it.each([
    ['14:35', '14:35'],
    ['14:35:22', '14:35'],
    ['14.35 น.', '14:35'],
    ['02:35 PM', '14:35'],
    ['12:05 AM', '00:05'],
  ])('%s → %s', (s, t) => expect(findTime(s)).toBe(t));

  it('returns null when absent and ignores amounts', () => {
    expect(findTime('จำนวน 12.50 บาท')).toBeNull();
    expect(findTime('1,250.00')).toBeNull();
    expect(findTime('25:99')).toBeNull();
  });
});

describe('findSalaryDate', () => {
  const accept = () => true;
  it('uses pay date label, then pay period end', () => {
    expect(findSalaryDate(['Pay date: 28/11/2026'], false, accept)).toBe('2026-11-28');
    expect(findSalaryDate(['วันที่จ่าย', '25 ต.ค. 2569'], true, accept)).toBe('2026-10-25');
    expect(findSalaryDate(['งวดเดือน พฤศจิกายน 2569'], true, accept)).toBe('2026-11-30');
    expect(findSalaryDate(['ประจำเดือน ก.พ. 2567'], true, accept)).toBe('2024-02-29');
    expect(findSalaryDate(['nothing here'], true, accept)).toBeNull();
  });
});
