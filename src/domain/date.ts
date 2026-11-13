/**
 * Date helpers (R2): all "today / current month / future" decisions are made in Asia/Bangkok,
 * independent of the device timezone. Dates are plain `YYYY-MM-DD` strings; we never call
 * `new Date('YYYY-MM-DD')` (which parses as UTC).
 */

export const TZ = 'Asia/Bangkok';

const ymdFormatter = new Intl.DateTimeFormat('en-CA', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});
const hmFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: TZ,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** `YYYY-MM-DD` for the given instant in Asia/Bangkok. */
export function toBangkokDate(now: Date): string {
  return ymdFormatter.format(now);
}

export function toBangkokTime(now: Date): string {
  return hmFormatter.format(now);
}

/** `YYYY-MM` */
export function monthOf(ymd: string): string {
  return ymd.slice(0, 7);
}

export function isLeapYear(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

export function daysInMonth(y: number, m: number): number {
  return [31, isLeapYear(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] ?? 0;
}

const pad = (n: number, w = 2) => String(n).padStart(w, '0');

export function makeYmd(y: number, m: number, d: number): string | null {
  if (!Number.isInteger(y) || !Number.isInteger(m) || !Number.isInteger(d)) return null;
  if (y < 1900 || y > 2200 || m < 1 || m > 12 || d < 1 || d > daysInMonth(y, m)) return null;
  return `${pad(y, 4)}-${pad(m)}-${pad(d)}`;
}

export function isValidYmd(s: string): boolean {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  return !!m && makeYmd(+m[1]!, +m[2]!, +m[3]!) === s;
}

export function isValidTime(s: string): boolean {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
}

/** Add n months to `YYYY-MM`. */
export function addMonths(ym: string, n: number): string {
  const [y, m] = ym.split('-').map(Number) as [number, number];
  const idx = y * 12 + (m - 1) + n;
  return `${pad(Math.floor(idx / 12), 4)}-${pad((idx % 12) + 1)}`;
}

/** Last `count` months ending at `ym` (inclusive), oldest first. */
export function monthRange(endYm: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => addMonths(endYm, i - (count - 1)));
}

/** Shift a `YYYY-MM-DD` by whole years (used for the 5-year look-back window). */
export function addYears(ymd: string, n: number): string {
  const [y, m, d] = ymd.split('-').map(Number) as [number, number, number];
  const ny = y + n;
  return makeYmd(ny, m, Math.min(d, daysInMonth(ny, m)))!;
}

function utcDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d, 12));
}

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(locale: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = locale + JSON.stringify(opts);
  let f = fmtCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, { ...opts, timeZone: 'UTC' });
    fmtCache.set(key, f);
  }
  return f;
}

/** Thai uses the Buddhist calendar for display (13 พ.ย. 2569); English uses 13 Nov 2026. */
export function localeFor(lang: 'th' | 'en'): string {
  return lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-GB';
}

export function formatDateShort(ymd: string, lang: 'th' | 'en'): string {
  return fmt(localeFor(lang), { day: 'numeric', month: 'short', year: 'numeric' }).format(
    utcDate(ymd),
  );
}

export function formatMonthLong(ym: string, lang: 'th' | 'en'): string {
  return fmt(lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-US', {
    month: 'long',
    year: 'numeric',
  }).format(utcDate(`${ym}-15`));
}

export function formatMonthShort(ym: string, lang: 'th' | 'en'): string {
  return fmt(lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-US', { month: 'short' }).format(
    utcDate(`${ym}-15`),
  );
}

export function formatMonthOnly(m: number, lang: 'th' | 'en'): string {
  return fmt(lang === 'th' ? 'th-TH-u-ca-buddhist' : 'en-US', { month: 'short' }).format(
    utcDate(`2026-${pad(m)}-15`),
  );
}

/** Display year: BE for Thai, CE for English. */
export function displayYear(y: number, lang: 'th' | 'en'): number {
  return lang === 'th' ? y + 543 : y;
}
