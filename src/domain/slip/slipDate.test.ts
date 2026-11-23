import { describe, expect, it } from 'vitest';
import { findDates, findSalaryDate, findTime, resolveYear } from './slipDate';
import { parseSlip } from './parseSlip';

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

// OMX-054 (BUG-013): make by KBank OCR turns "พ.ย." into Latin "w.g.".
describe('Latin look-alike month "w.g." → พ.ย. (OMX-054)', () => {
  it.each([
    ['16 w.g. 2569 17:10', '2026-11-16'],
    ['03 w.g. 2569 23:04', '2026-11-03'],
    ['3 W.G. 2569 19:03', '2026-11-03'],
    ['03 w. g. 69 19:03 น.', '2026-11-03'],
    ['16 w.g 2569 - 17:10', '2026-11-16'],
  ])('AC1/AC2: %s → %s', (text, date) => {
    expect(findDates(text, true).map((c) => c.date)).toEqual([date]);
  });

  it.each([
    ['w.g. in free text', 'ดูรายละเอียดที่ w.g. 2569 ได้'],
    ['no year / time', '16 w.g.'],
    ['no time', '16 w.g. 2569'],
    ['CE year is not a plausible BE year', '16 w.g. 2026 17:10'],
    ['no dot (a word)', '16 wg 2569 17:10'],
    ['other Latin pair', '16 w.q. 2569 17:10'],
  ])('AC2 negative: %s stays unchanged', (_name, text) => {
    expect(findDates(text, true)).toEqual([]);
  });

  it('AC3: BUG-001 variants still pass', () => {
    expect(findDates('14 พุย. 69', true)[0]?.date).toBe('2026-11-14');
    expect(findDates('14 พ.ุย. 2569', true)[0]?.date).toBe('2026-11-14');
  });
});

describe('real make slips with "w.g." (REDACTED text) — OMX-054 AC1', () => {
  const REDACTED = import.meta.glob<string>('/tests/fixtures/real-slips/redacted/*.txt', {
    query: '?raw',
    import: 'default',
    eager: true,
  });
  it.each([
    ['r08', '2026-11-16'],
    ['r14', '2026-11-03'],
    ['r15', '2026-11-03'],
  ])('%s → %s, noDate false', (id, date) => {
    const r = parseSlip(REDACTED[`/tests/fixtures/real-slips/redacted/${id}.txt`]!, '2026-11-23');
    expect(r.flags.noDate).toBe(false);
    expect(r.date).toBe(date);
  });
});
