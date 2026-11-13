/**
 * Amount extraction (OMX-007). Returns integer satang or null.
 *
 * Strategy:
 * 1. Salary slips: first matching net-pay label in fixed order; never gross pay.
 * 2. Transfer slips: number on the same line after an amount label, else on the next line.
 * 3. Fallback (no label found — OCR often mangles Thai labels): a money-looking token
 *    (two decimals or followed by บาท/THB/฿) on a non-excluded line. Fallback results are
 *    reported with source 'fallback' so Review highlights the field.
 */
import { containsKeyword } from './keywords';

export const AMOUNT_LABELS = ['จำนวนเงิน', 'ยอดชำระ', 'ยอดโอน', 'จำนวน', 'Amount'] as const;
export const NET_PAY_LABELS = [
  'เงินได้สุทธิ',
  'รับสุทธิ',
  'ยอดสุทธิ',
  'Net Pay',
  'Net Income',
  'Net Salary',
] as const;

/** Lines whose numbers must never be used as the amount (AC3). */
const EXCLUDED_LINE =
  /ค่าธรรมเนียม|คงเหลือ|เลขที่รายการ|เลขที่อ้างอิง|รหัสอ้างอิง|รหัสรายการ|(?<![A-Za-z])(fee|balance|ref|reference|transaction id)(?![A-Za-z])/i;
const GROSS_LINE = /รายได้รวม|รวมรายได้|gross|total income|รายการหัก|รวมรายการหัก|deduction/i;

export function isExcludedLine(line: string): boolean {
  return EXCLUDED_LINE.test(line);
}

const OCR_DIGIT = '[0-9OoIl|]';
/** Candidate numeric tokens incl. OCR look-alikes; validated by parseAmountToken. */
const TOKEN_RE = new RegExp(
  `${OCR_DIGIT}{1,3}(?:[ ,]${OCR_DIGIT}{3})+(?:\\.${OCR_DIGIT}{1,3})?|${OCR_DIGIT}+(?:[.,]${OCR_DIGIT}{1,3})?`,
  'g',
);

/**
 * Parse one numeric token into satang. Handles thousands separators (comma or a single space),
 * OCR confusions O→0 and l/I/|→1. Rejects 3 decimals and European "1.250,00".
 */
export function parseAmountToken(raw: string): number | null {
  let s = raw.trim();
  if (!/[0-9]/.test(s)) return null; // pure letters like "OO" are not numbers
  s = s.replace(/[Oo]/g, '0').replace(/[Il|]/g, '1');
  if (/^\d{1,3}( \d{3})+(\.\d+)?$/.test(s)) s = s.replace(/ /g, '');
  if (/ /.test(s)) return null;
  if (/^\d{1,3}(,\d{3})+(\.\d{1,2})?$/.test(s)) s = s.replace(/,/g, '');
  if (!/^\d+(\.\d{1,2})?$/.test(s)) return null;
  // 10+ digit runs without separators are account/reference numbers, not amounts.
  if (/^\d{10,}$/.test(s)) return null;
  const [i = '0', d = ''] = s.split('.');
  const satang = Number(i) * 100 + Number(d.padEnd(2, '0'));
  return Number.isSafeInteger(satang) ? satang : null;
}

interface Token {
  raw: string;
  value: number | null;
  index: number;
  hasCurrency: boolean;
  hasTwoDecimals: boolean;
}

const CURRENCY_RE = /฿|THB|บาท|บ\./gi;

/** Extract numeric tokens from a line, skipping date/time/account fragments. */
export function tokensIn(line: string): Token[] {
  const cleaned = line.replace(CURRENCY_RE, (m) => ' '.repeat(m.length));
  const out: Token[] = [];
  for (const m of cleaned.matchAll(TOKEN_RE)) {
    const raw = m[0];
    if (!/[0-9]/.test(raw)) continue; // letters only (e.g. a lone "I") are not numbers
    const index = m.index ?? 0;
    const before = cleaned[index - 1] ?? ' ';
    const after = cleaned[index + raw.length] ?? ' ';
    // Part of a word (e.g. "Olivia", "K1") or of dates/times/account numbers.
    if (/[A-Za-z]/.test(before) || /[A-Za-z]/.test(after)) continue;
    if (/[:/\-xX*]/.test(before) || /[:/\-xX*]/.test(after)) continue;
    const trimmed = raw.replace(/[ ,]$/, '');
    const rest = line.slice(index + raw.length, index + raw.length + 6);
    const prev = line.slice(Math.max(0, index - 5), index);
    out.push({
      raw: trimmed,
      value: parseAmountToken(trimmed),
      index,
      hasCurrency: /^\s*(฿|THB|บาท|บ\.)/i.test(rest) || /(฿|THB)\s*$/i.test(prev),
      hasTwoDecimals: /[.]\S{2}$/.test(trimmed),
    });
  }
  return out;
}

export interface AmountResult {
  satang: number | null;
  source: 'label' | 'fallback' | 'none';
  /** A labelled value existed but was malformed (e.g. 3 decimals) — AC5: leave empty. */
  rejected?: boolean;
}

function firstLabelIndex(
  line: string,
  labels: readonly string[],
): { label: string; end: number } | null {
  for (const label of labels) {
    const m = new RegExp(
      [...label.replace(/\s+/g, '')]
        .map((c) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .join('\\s*'),
      'i',
    ).exec(line);
    if (m && containsKeyword(line, label)) return { label, end: m.index + m[0].length };
  }
  return null;
}

/** Look for a value after `labelEnd` on line i, else on line i+1. */
function valueNear(lines: string[], i: number, labelEnd: number): AmountResult | null {
  const sameLine = tokensIn((lines[i] ?? '').slice(labelEnd));
  const candidates = sameLine.length
    ? sameLine
    : (() => {
        const next = lines[i + 1];
        if (next === undefined || isExcludedLine(next)) return [];
        return tokensIn(next);
      })();
  const first = candidates[0];
  if (!first) return null;
  if (first.value === null) return { satang: null, source: 'none', rejected: true };
  return { satang: first.value, source: 'label' };
}

export function extractAmount(lines: string[], isSalary: boolean): AmountResult {
  if (isSalary) {
    for (const label of NET_PAY_LABELS) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i]!;
        const hit = firstLabelIndex(line, [label]);
        if (!hit) continue;
        const r = valueNear(lines, i, hit.end);
        if (r) return r;
      }
    }
    for (let i = 0; i < lines.length; i++) {
      const idx = lines[i]!.indexOf('สุทธิ');
      if (idx >= 0) {
        const r = valueNear(lines, i, idx + 'สุทธิ'.length);
        if (r) return r;
      }
    }
    return { satang: null, source: 'none' };
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (isExcludedLine(line)) continue;
    const hit = firstLabelIndex(line, AMOUNT_LABELS);
    if (!hit) continue;
    const r = valueNear(lines, i, hit.end);
    if (r) return r;
  }

  // Fallback: money-looking tokens on non-excluded lines.
  const pool: Token[] = [];
  for (const line of lines) {
    if (isExcludedLine(line) || GROSS_LINE.test(line)) continue;
    for (const t of tokensIn(line))
      if (t.value !== null && t.value > 0 && (t.hasCurrency || t.hasTwoDecimals)) pool.push(t);
  }
  const withCurrency = pool.find((t) => t.hasCurrency);
  const pick = withCurrency ?? pool.sort((a, b) => (b.value ?? 0) - (a.value ?? 0))[0];
  return pick ? { satang: pick.value, source: 'fallback' } : { satang: null, source: 'none' };
}

/** AC6: outside (0, 10,000,000.00] ⇒ unusual. */
export function isUnusualAmount(satang: number): boolean {
  return satang <= 0 || satang > 1_000_000_000;
}
