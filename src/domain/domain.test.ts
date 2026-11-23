import { describe, expect, it } from 'vitest';
import { formatCompact, formatSatang, formatSigned, parseMoneyInput, satangToInput } from './money';
import {
  addMonths,
  addYears,
  formatDateShort,
  formatMonthLong,
  formatMonthShort,
  isValidTime,
  isValidYmd,
  monthRange,
  toBangkokDate,
  toBangkokTime,
} from './date';
import { categoriesFor, isCategoryValidFor, resetCategoryForType } from './categories';
import { findDuplicate } from './duplicate';
import {
  activeFilterCount,
  applyFilters,
  EMPTY_FILTERS,
  expenseByCategory,
  groupByDate,
  inMonth,
  matchesQuery,
  monthlyTrend,
  summarize,
} from './transactions';
import { escapeCsvCell, neutralizeFormula, toCsv } from './csv';
import { buildBackup, mergeTransactions, parseBackup, parseEnvelope } from './schema';
import { checkFile, sniffImage, summarizeSkips, targetSize, MAX_FILE_BYTES } from './file';
import type { Transaction } from './types';

let seq = 0;
const tx = (p: Partial<Transaction>): Transaction => ({
  id: `t${++seq}`,
  type: 'expense',
  categoryId: 'food',
  amountSatang: 1000,
  date: '2026-11-13',
  source: 'manual',
  createdAt: `2026-11-13T00:00:${String(seq).padStart(2, '0')}Z`,
  updatedAt: '2026-11-13T00:00:00Z',
  ...p,
});

describe('money', () => {
  it.each([
    ['1,000', 100000],
    ['1250.5', 125050],
    ['฿ 99', 9900],
    ['0.01', 1],
    ['99,999,999.99', 9999999999],
  ])('parses %s', (raw, satang) => expect(parseMoneyInput(raw)).toEqual({ ok: true, satang }));

  it.each([
    ['', 'amountRequired'],
    ['abc', 'amountInvalid'],
    ['0', 'amountPositive'],
    ['-5', 'amountPositive'],
    ['1.234', 'amountDecimals'],
    ['100000000', 'amountMax'],
    ['1,00', 'amountInvalid'],
  ])('rejects %s', (raw, error) => expect(parseMoneyInput(raw)).toEqual({ ok: false, error }));

  it('formats', () => {
    expect(formatSatang(123456789)).toBe('1,234,567.89');
    expect(formatSigned(-125000)).toBe('−1,250.00');
    expect(formatSigned(125000)).toBe('+1,250.00');
    expect(formatSigned(0)).toBe('0.00');
    expect(satangToInput(125050)).toBe('1250.50');
    expect(formatCompact(2000000)).toBe('20k');
    expect(formatCompact(150000000)).toBe('1.5M');
    expect(formatCompact(50000)).toBe('500');
  });
});

describe('date (Asia/Bangkok)', () => {
  it('computes today in Bangkok regardless of device timezone', () => {
    // 2026-10-31 17:30 UTC = 2026-11-01 00:30 in Bangkok
    expect(toBangkokDate(new Date('2026-10-31T17:30:00Z'))).toBe('2026-11-01');
    expect(toBangkokTime(new Date('2026-10-31T17:30:00Z'))).toBe('00:30');
  });
  it('month math crosses years', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
    expect(monthRange('2027-01', 6)).toEqual([
      '2026-08',
      '2026-09',
      '2026-10',
      '2026-11',
      '2026-12',
      '2027-01',
    ]);
    expect(addYears('2024-02-29', -5)).toBe('2019-02-28');
  });
  it('validates', () => {
    expect(isValidYmd('2026-02-29')).toBe(false);
    expect(isValidYmd('2024-02-29')).toBe(true);
    expect(isValidTime('23:59')).toBe(true);
    expect(isValidTime('24:00')).toBe(false);
  });
  it('formats TH (BE) and EN', () => {
    expect(formatDateShort('2026-11-13', 'th')).toBe('13 พ.ย. 2569');
    expect(formatDateShort('2026-11-13', 'en')).toBe('13 Nov 2026');
    expect(formatMonthLong('2026-11', 'th')).toBe('พฤศจิกายน 2569');
    expect(formatMonthLong('2027-01', 'en')).toBe('January 2027');
    expect(formatMonthShort('2026-11', 'th')).toBe('พ.ย.');
  });
});

describe('categories', () => {
  it('filters and resets by type', () => {
    expect(categoriesFor('income')).toEqual(['salary', 'other_income']);
    expect(categoriesFor('expense')).toHaveLength(10);
    expect(isCategoryValidFor('income', 'food')).toBe(false);
    expect(resetCategoryForType('income', 'food')).toBe('other_income');
    expect(resetCategoryForType('expense', 'salary')).toBe('other');
    expect(resetCategoryForType('expense', 'food')).toBe('food');
    expect(resetCategoryForType('expense', null)).toBe('other');
  });
});

describe('duplicates (OMX-011)', () => {
  const saved = [
    tx({
      id: 'a',
      amountSatang: 24500,
      time: '14:35',
      payee: 'นาย สมชาย',
      source: 'slip',
      slip: { imageHash: 'h1', refNo: 'R1', confidence: 'high' },
    }),
    tx({ id: 'b', amountSatang: 5000, payee: 'Cash' }),
  ];
  it('exact by hash', () => {
    expect(findDuplicate({ imageHash: 'h1', amountSatang: 1, date: '2026-01-01' }, saved)).toEqual({
      kind: 'exact',
      existingId: 'a',
    });
  });
  it('possible by ref', () => {
    expect(
      findDuplicate({ imageHash: 'zz', refNo: 'R1', amountSatang: 1, date: '2026-01-01' }, saved),
    ).toEqual({ kind: 'possible', existingId: 'a' });
  });
  it('possible by amount+date+time±1+payee, incl. manual', () => {
    expect(
      findDuplicate(
        { amountSatang: 24500, date: '2026-11-13', time: '14:36', payee: 'สมชาย' },
        saved,
      )?.existingId,
    ).toBe('a');
    expect(
      findDuplicate(
        { amountSatang: 24500, date: '2026-11-13', time: '14:38', payee: 'สมชาย' },
        saved,
      ),
    ).toBeNull();
    expect(
      findDuplicate({ amountSatang: 5000, date: '2026-11-13', payee: 'cash' }, saved)?.existingId,
    ).toBe('b');
    expect(
      findDuplicate(
        { amountSatang: 5000, date: '2026-11-13', time: '10:00', payee: 'cash' },
        saved,
      ),
    ).toBeNull();
    expect(findDuplicate({ amountSatang: null, date: '2026-11-13' }, saved)).toBeNull();
  });
});

describe('transactions selectors', () => {
  const list = [
    tx({ type: 'income', categoryId: 'salary', amountSatang: 4500000, date: '2026-11-01' }),
    tx({ amountSatang: 24500, date: '2026-11-13', time: '14:35' }),
    tx({ amountSatang: 6000, date: '2026-11-13', time: '12:10', payee: 'ร้านข้าวมันไก่' }),
    tx({
      amountSatang: 4700,
      date: '2026-11-13',
      categoryId: 'transport',
      payee: 'BTS',
      note: 'ไปทำงาน',
    }),
    tx({ amountSatang: 138500, date: '2026-10-12', categoryId: 'bills' }),
  ];
  it('summarizes a month', () => {
    expect(summarize(inMonth(list, '2026-11'))).toEqual({
      income: 4500000,
      expense: 35200,
      balance: 4464800,
      count: 4,
    });
  });
  it('groups by date newest first, time desc, no-time last', () => {
    const g = groupByDate(inMonth(list, '2026-11'));
    expect(g.map((x) => x.date)).toEqual(['2026-11-13', '2026-11-01']);
    expect(g[0]!.items.map((t) => t.time ?? null)).toEqual(['14:35', '12:10', null]);
    expect(g[0]!.net).toBe(-35200);
  });
  it('breaks down expense by category with percent', () => {
    const s = expenseByCategory(inMonth(list, '2026-11'));
    expect(s[0]).toEqual({ categoryId: 'food', amount: 30500, percent: 86.6 });
  });
  it('trend has zeros for empty months', () => {
    const t = monthlyTrend(list, '2026-11', 3);
    expect(t).toEqual([
      { month: '2026-09', income: 0, expense: 0 },
      { month: '2026-10', income: 0, expense: 138500 },
      { month: '2026-11', income: 4500000, expense: 35200 },
    ]);
  });
  it('filters by type, category and query', () => {
    expect(applyFilters(list, { ...EMPTY_FILTERS, type: 'income' })).toHaveLength(1);
    expect(
      applyFilters(list, { ...EMPTY_FILTERS, categories: ['transport', 'bills'] }),
    ).toHaveLength(2);
    expect(applyFilters(list, { ...EMPTY_FILTERS, query: 'bts' })).toHaveLength(1);
    expect(applyFilters(list, { ...EMPTY_FILTERS, query: 'ทำงาน' })).toHaveLength(1);
    expect(activeFilterCount({ type: 'income', categories: ['food'], query: 'x' })).toBe(3);
  });
  it('query matches amounts with/without comma and regex chars are safe', () => {
    const t = tx({ amountSatang: 125000 });
    expect(matchesQuery(t, '1250')).toBe(true);
    expect(matchesQuery(t, '1,250')).toBe(true);
    expect(matchesQuery(t, '125')).toBe(true);
    expect(matchesQuery(t, '1250.00')).toBe(true);
    expect(matchesQuery(t, '(.*')).toBe(false);
    expect(matchesQuery(t, '  ')).toBe(true);
  });
});

describe('csv (OMX-023)', () => {
  it('escapes RFC 4180 and neutralizes formulas', () => {
    expect(escapeCsvCell('a,b')).toBe('"a,b"');
    expect(escapeCsvCell('say "hi"')).toBe('"say ""hi"""');
    expect(escapeCsvCell('line\nbreak')).toBe('"line\nbreak"');
    expect(neutralizeFormula('=SUM(A1)')).toBe("'=SUM(A1)");
    expect(neutralizeFormula('-5')).toBe("'-5");
    expect(neutralizeFormula('ok')).toBe('ok');
  });
  it('writes BOM, header and rows', () => {
    const csv = toCsv([tx({ amountSatang: 125050, payee: '@evil', note: 'a,"b"', time: '09:00' })]);
    expect(csv.startsWith('﻿date,time,type,category,amount,payee,note,source\r\n')).toBe(true);
    expect(csv).toContain(`2026-11-13,09:00,expense,food,1250.50,'@evil,"a,""b""",manual`);
    expect(toCsv([])).toBe('﻿date,time,type,category,amount,payee,note,source\r\n');
  });
});

describe('schema / backup (OMX-021, 022, 031)', () => {
  const t = tx({ id: 'x1' });
  it('validates envelope', () => {
    expect(
      parseEnvelope({ version: 1, transactions: [t], settings: { language: 'th' } }),
    ).not.toBeNull();
    expect(
      parseEnvelope({ version: 2, transactions: [], settings: { language: 'th' } }),
    ).toBeNull();
    expect(
      parseEnvelope({
        version: 1,
        transactions: [{ ...t, categoryId: 'salary' }],
        settings: { language: 'th' },
      }),
    ).toBeNull();
  });
  it('parses backups with clear errors', () => {
    const good = JSON.stringify(buildBackup([t], '2026-11-13T00:00:00Z'));
    expect(parseBackup(good, good.length)).toEqual({ ok: true, transactions: [t] });
    expect(parseBackup('nope', 4)).toEqual({ ok: false, error: 'errorNotJson' });
    expect(parseBackup('{"a":1}', 7)).toEqual({ ok: false, error: 'errorSchema' });
    expect(buildBackup([t], 'x').app).toBe('spendy-money');
    const legacy = JSON.stringify({ ...buildBackup([t], 'x'), app: 'omnitrix-money' });
    expect(parseBackup(legacy, legacy.length)).toEqual({ ok: true, transactions: [t] });
    const foreign = JSON.stringify({ ...buildBackup([t], 'x'), app: 'other-app' });
    expect(parseBackup(foreign, foreign.length)).toEqual({ ok: false, error: 'errorSchema' });
    expect(parseBackup('{"app":"spendy-money","schemaVersion":9}', 40)).toEqual({
      ok: false,
      error: 'errorVersion',
    });
    expect(parseBackup(good, 6 * 1024 * 1024)).toEqual({ ok: false, error: 'errorSize' });
    const bad = JSON.stringify({
      ...buildBackup([t], 'x'),
      transactions: [{ ...t, amountSatang: -1 }],
    });
    expect(parseBackup(bad, bad.length)).toEqual({ ok: false, error: 'errorSchema' });
  });
  it('merges by id', () => {
    const r = mergeTransactions([t], [t, tx({ id: 'x2' })]);
    expect(r.added).toBe(1);
    expect(r.duplicates).toBe(1);
    expect(r.merged).toHaveLength(2);
  });
});

describe('file checks (OMX-001, 029)', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
  const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]);
  const gif = new Uint8Array([0x47, 0x49, 0x46, 0x38]);
  it('sniffs signatures', () => {
    expect(sniffImage(png)).toBe('png');
    expect(sniffImage(jpg)).toBe('jpeg');
    expect(sniffImage(webp)).toBe('webp');
    expect(sniffImage(gif)).toBeNull();
  });
  it('checks type and size boundaries', () => {
    expect(
      checkFile({ name: 'a.PNG', size: MAX_FILE_BYTES, mime: 'image/png', head: png }),
    ).toBeNull();
    expect(
      checkFile({ name: 'a.png', size: MAX_FILE_BYTES + 1, mime: 'image/png', head: png }),
    ).toBe('size');
    expect(checkFile({ name: 'a.jpg', size: 10, mime: 'image/jpeg', head: gif })).toBe('type');
    expect(checkFile({ name: 'a.gif', size: 10, mime: 'image/gif', head: png })).toBe('type');
    expect(checkFile({ name: 'noext', size: 10, mime: '', head: jpg })).toBeNull();
  });
  it('computes downscale target', () => {
    expect(targetSize(1080, 2400)).toEqual({ width: 900, height: 2000, scale: 2000 / 2400 });
    expect(targetSize(800, 600)).toEqual({ width: 800, height: 600, scale: 1 });
  });
  it('summarizes skips', () => {
    expect(summarizeSkips(['type', 'type', 'size'])).toEqual({
      type: 2,
      size: 1,
      limit: 0,
      duplicateInBatch: 0,
    });
  });
});

import { validateDraft, hasErrors } from './validation';
describe('validateDraft', () => {
  const base = {
    type: 'expense' as const,
    categoryId: 'food' as const,
    amount: '120',
    date: '2026-11-13',
    time: '',
    payee: '',
    note: '',
  };
  it('accepts a valid draft', () => expect(hasErrors(validateDraft(base))).toBe(false));
  it('reports each problem', () => {
    expect(validateDraft({ ...base, amount: '', date: '', categoryId: null })).toEqual({
      amount: 'amountRequired',
      date: 'dateRequired',
      categoryId: 'categoryRequired',
    });
    expect(validateDraft({ ...base, type: 'income' }).categoryId).toBe('categoryRequired');
    expect(validateDraft({ ...base, date: '2026-02-30', time: '25:00' })).toMatchObject({
      date: 'dateInvalid',
      time: 'dateInvalid',
    });
    expect(validateDraft({ ...base, payee: 'x'.repeat(101), note: 'y'.repeat(501) })).toMatchObject(
      { payee: 'payeeMax', note: 'noteMax' },
    );
  });
});
