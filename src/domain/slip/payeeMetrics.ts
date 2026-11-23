/**
 * Payee measurement helpers (OMX-051): exact match after `normalizePayee()` and character error
 * rate (CER) for benchmark reports. Report-only metrics — no gate (OMX-009 AC6).
 */
import { normalizePayee } from './parties';

/** SARA AM written as NIKHAHIT + SARA AA is the same text (R4). */
const canon = (s: string | null | undefined): string =>
  normalizePayee((s ?? '').replace(/ํา/g, 'ำ'));

/** Exact payee match after normalization; `expected === null` means "payee must stay empty". */
export function payeeMatches(
  actual: string | null | undefined,
  expected: string | null,
  alternatives: readonly string[] = [],
): boolean {
  if (expected === null) return !actual;
  if (!actual) return false;
  const a = canon(actual);
  return [expected, ...alternatives].some((e) => canon(e) === a);
}

function levenshtein(a: string[], b: string[]): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
    prev = cur;
  }
  return prev[b.length]!;
}

/**
 * Character error rate of `actual` against `expected` (both normalized): edits / expected length.
 * Empty actual = 1 (every char missing). Not capped, so wrong long guesses can exceed 1.
 */
export function payeeCer(actual: string | null | undefined, expected: string): number {
  const e = [...canon(expected)];
  if (!e.length) return actual ? 1 : 0;
  return levenshtein([...canon(actual)], e) / e.length;
}

export interface PayeeReport {
  n: number;
  exact: number;
  exactPct: number;
  /** mean CER over slips with an expected payee */
  meanCer: number;
}

export function payeeReport(
  rows: readonly { actual: string | null | undefined; expected: string | null }[],
): PayeeReport {
  const n = rows.length;
  const exact = rows.filter((r) => payeeMatches(r.actual, r.expected)).length;
  const withPayee = rows.filter((r) => r.expected !== null);
  const meanCer = withPayee.length
    ? withPayee.reduce((s, r) => s + payeeCer(r.actual, r.expected!), 0) / withPayee.length
    : 0;
  return {
    n,
    exact,
    exactPct: n ? Math.round((exact / n) * 1000) / 10 : 0,
    meanCer: Math.round(meanCer * 1000) / 1000,
  };
}
