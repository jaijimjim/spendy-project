/** Duplicate slip detection (OMX-011). */
import type { Transaction } from './types';
import { normalizePayee } from './slip/parties';

export interface DuplicateCandidate {
  imageHash?: string | null;
  refNo?: string | null;
  amountSatang: number | null;
  date: string;
  time?: string | null;
  payee?: string | null;
}

export type DuplicateMatch = { kind: 'exact' | 'possible'; existingId: string } | null;

const minutes = (t: string) => {
  const [h, m] = t.split(':').map(Number) as [number, number];
  return h * 60 + m;
};

function timesClose(a?: string | null, b?: string | null): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return Math.abs(minutes(a) - minutes(b)) <= 1;
}

/** AC2(b): same amount, same date, time within ±1 min (or both empty), same normalized payee. */
export function isProbableMatch(
  c: DuplicateCandidate,
  t: Pick<Transaction, 'amountSatang' | 'date' | 'time' | 'payee'>,
): boolean {
  return (
    c.amountSatang !== null &&
    c.amountSatang === t.amountSatang &&
    c.date === t.date &&
    timesClose(c.time, t.time) &&
    normalizePayee(c.payee) === normalizePayee(t.payee)
  );
}

export function findDuplicate(
  c: DuplicateCandidate,
  saved: readonly Transaction[],
): DuplicateMatch {
  if (c.imageHash) {
    const exact = saved.find((t) => t.slip?.imageHash === c.imageHash);
    if (exact) return { kind: 'exact', existingId: exact.id };
  }
  if (c.refNo) {
    const byRef = saved.find((t) => t.slip?.refNo && t.slip.refNo === c.refNo);
    if (byRef) return { kind: 'possible', existingId: byRef.id };
  }
  const probable = saved.find((t) => isProbableMatch(c, t));
  return probable ? { kind: 'possible', existingId: probable.id } : null;
}
