/** Money helpers — integer satang everywhere (R1). */

export const MAX_SATANG = 9_999_999_999; // 99,999,999.99 THB (form limit)
export const MINUS = '−'; // U+2212 minus sign used in the UI

export type MoneyInputError =
  'amountRequired' | 'amountInvalid' | 'amountPositive' | 'amountDecimals' | 'amountMax';

/**
 * Parse a user-typed amount ("1,000", "1250.5", "฿ 99.00") into satang.
 * Commas are accepted only as thousands separators.
 */
export function parseMoneyInput(
  raw: string,
): { ok: true; satang: number } | { ok: false; error: MoneyInputError } {
  const s = raw.replace(/[฿\s]/g, '').replace(/บาท|THB/gi, '');
  if (s === '') return { ok: false, error: 'amountRequired' };
  if (s.startsWith('-')) return { ok: false, error: 'amountPositive' };
  if (!/^(\d{1,3}(,\d{3})+|\d+)?(\.\d*)?$/.test(s) || s === '.')
    return { ok: false, error: 'amountInvalid' };
  const [intPart = '', decPart = ''] = s.replace(/,/g, '').split('.');
  if (decPart.length > 2) return { ok: false, error: 'amountDecimals' };
  const satang = Number(intPart || '0') * 100 + Number(decPart.padEnd(2, '0') || '0');
  if (!Number.isSafeInteger(satang)) return { ok: false, error: 'amountMax' };
  if (satang <= 0) return { ok: false, error: 'amountPositive' };
  if (satang > MAX_SATANG) return { ok: false, error: 'amountMax' };
  return { ok: true, satang };
}

const formatters = new Map<string, Intl.NumberFormat>();
function nf(locale: string): Intl.NumberFormat {
  let f = formatters.get(locale);
  if (!f) {
    f = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    formatters.set(locale, f);
  }
  return f;
}

/** 125050 → "1,250.50" (no sign; absolute value). Never prints "-0.00". */
export function formatSatang(satang: number, locale = 'th-TH'): string {
  return nf(locale).format(Math.abs(satang) / 100);
}

/** Signed display: "+1,250.00" / "−1,250.00" / "0.00". */
export function formatSigned(satang: number, locale = 'th-TH'): string {
  if (satang === 0) return formatSatang(0, locale);
  return `${satang > 0 ? '+' : MINUS}${formatSatang(satang, locale)}`;
}

/** Plain value for inputs: 125050 → "1250.50". */
export function satangToInput(satang: number): string {
  return (satang / 100).toFixed(2);
}

/** Compact axis label: 20000_00 → "20k". */
export function formatCompact(satang: number): string {
  const baht = Math.abs(satang) / 100;
  if (baht >= 1_000_000) return `${+(baht / 1_000_000).toFixed(1)}M`;
  if (baht >= 1_000) return `${+(baht / 1_000).toFixed(1)}k`;
  return `${Math.round(baht)}`;
}
