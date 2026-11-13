/** Pure selectors over transactions: monthly summary, grouping, filtering, charts. */
import type { CategoryId, Transaction, TxType } from './types';
import { monthOf, monthRange } from './date';
import { thaiDigitsToAscii } from './slip/normalize';

export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
  count: number;
}

export function inMonth(txs: readonly Transaction[], ym: string): Transaction[] {
  return txs.filter((t) => monthOf(t.date) === ym);
}

export function summarize(txs: readonly Transaction[]): MonthSummary {
  let income = 0;
  let expense = 0;
  for (const t of txs) {
    if (t.type === 'income') income += t.amountSatang;
    else expense += t.amountSatang;
  }
  return { income, expense, balance: income - expense, count: txs.length };
}

export const signedAmount = (t: Transaction): number =>
  t.type === 'income' ? t.amountSatang : -t.amountSatang;

/** OMX-014 AC1: newest date first; within a date by time desc, then createdAt desc; no-time last. */
export function compareTransactions(a: Transaction, b: Transaction): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  if (a.time && b.time && a.time !== b.time) return a.time < b.time ? 1 : -1;
  if (!!a.time !== !!b.time) return a.time ? -1 : 1;
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
}

export interface DateGroup {
  date: string;
  net: number;
  items: Transaction[];
}

export function groupByDate(txs: readonly Transaction[]): DateGroup[] {
  const sorted = [...txs].sort(compareTransactions);
  const groups: DateGroup[] = [];
  for (const t of sorted) {
    let g = groups[groups.length - 1];
    if (!g || g.date !== t.date) {
      g = { date: t.date, net: 0, items: [] };
      groups.push(g);
    }
    g.items.push(t);
    g.net += signedAmount(t);
  }
  return groups;
}

export interface CategorySlice {
  categoryId: CategoryId;
  amount: number;
  /** Percentage with 1 decimal. */
  percent: number;
}

export function expenseByCategory(txs: readonly Transaction[]): CategorySlice[] {
  const map = new Map<CategoryId, number>();
  let total = 0;
  for (const t of txs) {
    if (t.type !== 'expense') continue;
    map.set(t.categoryId, (map.get(t.categoryId) ?? 0) + t.amountSatang);
    total += t.amountSatang;
  }
  return [...map.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      percent: total ? Math.round((amount / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface TrendPoint {
  month: string;
  income: number;
  expense: number;
}

export function monthlyTrend(txs: readonly Transaction[], endYm: string, count = 6): TrendPoint[] {
  const months = monthRange(endYm, count);
  const map = new Map(months.map((m) => [m, { month: m, income: 0, expense: 0 }]));
  for (const t of txs) {
    const p = map.get(monthOf(t.date));
    if (!p) continue;
    if (t.type === 'income') p.income += t.amountSatang;
    else p.expense += t.amountSatang;
  }
  return months.map((m) => map.get(m)!);
}

export interface Filters {
  type: 'all' | TxType;
  categories: CategoryId[];
  query: string;
}

export const EMPTY_FILTERS: Filters = { type: 'all', categories: [], query: '' };

export function activeFilterCount(f: Filters): number {
  return (f.type !== 'all' ? 1 : 0) + f.categories.length + (f.query.trim() ? 1 : 0);
}

const norm = (s: string) => thaiDigitsToAscii(s.normalize('NFC')).toLocaleLowerCase().trim();

/**
 * OMX-015 AC3: substring search on payee, note or amount (case-insensitive, NFC, trimmed).
 * "1250", "1,250" and "125" all match 1,250.00. No regex is built from user input.
 */
export function matchesQuery(t: Transaction, query: string): boolean {
  const q = norm(query);
  if (!q) return true;
  if (norm(t.payee ?? '').includes(q) || norm(t.note ?? '').includes(q)) return true;
  const qDigits = q.replace(/,/g, '');
  if (!/^\d+(\.\d*)?$/.test(qDigits)) return false;
  const baht = (t.amountSatang / 100).toFixed(2);
  return baht.includes(qDigits) || baht.replace(/\.00$/, '').includes(qDigits);
}

export function applyFilters(txs: readonly Transaction[], f: Filters): Transaction[] {
  return txs.filter(
    (t) =>
      (f.type === 'all' || t.type === f.type) &&
      (f.categories.length === 0 || f.categories.includes(t.categoryId)) &&
      matchesQuery(t, f.query),
  );
}
