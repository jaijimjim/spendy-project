/** Injectable clock (R2). Production uses the real time; tests can pin "now". */
import { toBangkokDate, toBangkokTime, monthOf } from '../domain/date';
import { testHooks } from './testHooks';

export interface Clock {
  now(): Date;
}

export const systemClock: Clock = { now: () => new Date() };

let current: Clock | null = null;

export function setClock(c: Clock | null): void {
  current = c;
}

export function getClock(): Clock {
  if (current) return current;
  const pinned = testHooks().now;
  if (pinned) {
    const t = new Date(pinned).getTime();
    return { now: () => new Date(t) };
  }
  return systemClock;
}

export const today = (): string => toBangkokDate(getClock().now());
export const nowTime = (): string => toBangkokTime(getClock().now());
export const currentMonth = (): string => monthOf(today());
export const nowIso = (): string => getClock().now().toISOString();
