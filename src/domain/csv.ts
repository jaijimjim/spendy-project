/** CSV export (OMX-023): UTF-8 with BOM, RFC 4180 escaping, formula-injection protection. */
import type { Transaction } from './types';
import { compareTransactions } from './transactions';

export const CSV_COLUMNS = [
  'date',
  'time',
  'type',
  'category',
  'amount',
  'payee',
  'note',
  'source',
] as const;
const BOM = '﻿';

/** OWASP: cells beginning with = + - @ TAB CR are prefixed with ' so spreadsheets don't execute them. */
export function neutralizeFormula(v: string): string {
  return /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
}

export function escapeCsvCell(v: string): string {
  return /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

/** `categoryName` maps a category id to its name in the current UI language (OMX-023 AC1). */
export function toCsv(
  txs: readonly Transaction[],
  categoryName: (id: Transaction['categoryId']) => string = (id) => id,
): string {
  const rows = [...txs]
    .sort(compareTransactions)
    .reverse()
    .map((t) =>
      [
        t.date,
        t.time ?? '',
        t.type,
        categoryName(t.categoryId),
        (t.amountSatang / 100).toFixed(2),
        neutralizeFormula(t.payee ?? ''),
        neutralizeFormula(t.note ?? ''),
        t.source,
      ]
        .map(escapeCsvCell)
        .join(','),
    );
  return BOM + [CSV_COLUMNS.join(','), ...rows].join('\r\n') + '\r\n';
}
