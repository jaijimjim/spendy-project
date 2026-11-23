/**
 * Date & time extraction (OMX-008, R3).
 * - Numeric dates are always day/month/year.
 * - 4-digit year ≥ 2400 is Buddhist Era (−543).
 * - 2-digit year: Thai context ⇒ 25xx BE, English-only text ⇒ 20xx CE.
 * Range checks (not in the future, ≤ 5 years back) are applied by the caller with the clock.
 */
import { daysInMonth, makeYmd } from '../date';

interface MonthDef {
  m: number;
  patterns: string[];
}

/** Thai month names: full + abbreviations (dots/spaces optional, e.g. "พ.ย.", "พย", "พ.ย"). */
const THAI_MONTHS: MonthDef[] = [
  { m: 1, patterns: ['มกราคม', 'ม.ค.'] },
  { m: 2, patterns: ['กุมภาพันธ์', 'ก.พ.'] },
  { m: 3, patterns: ['มีนาคม', 'มี.ค.'] },
  { m: 4, patterns: ['เมษายน', 'เม.ย.'] },
  { m: 5, patterns: ['พฤษภาคม', 'พ.ค.'] },
  { m: 6, patterns: ['มิถุนายน', 'มิ.ย.'] },
  { m: 7, patterns: ['กรกฎาคม', 'ก.ค.'] },
  { m: 8, patterns: ['สิงหาคม', 'ส.ค.'] },
  { m: 9, patterns: ['กันยายน', 'ก.ย.'] },
  { m: 10, patterns: ['ตุลาคม', 'ต.ค.'] },
  { m: 11, patterns: ['พฤศจิกายน', 'พ.ย.'] },
  { m: 12, patterns: ['ธันวาคม', 'ธ.ค.'] },
];

const EN_MONTHS = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];
const EN_MONTH_RE =
  '(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)';

/**
 * "พ.ย." → "พ[.ุ]{0,2}\s?ย[.ุ]{0,2}" so all of "พ.ย.", "พ.ย", "พย", "พ. ย." match. Tesseract often
 * reads the abbreviation dot as the below-vowel "ุ" ("พุย.", "พ.ุย.") — accepted too (BUG-001).
 */
const ABBR_DOT = '[.\\u0E38]{0,2}';
function thaiAbbrToRegex(p: string): string {
  if (!p.includes('.')) return p;
  return (
    p
      .split('.')
      .filter(Boolean)
      .join(ABBR_DOT + '\\s?') + ABBR_DOT
  );
}

const thaiMonthAlternatives = THAI_MONTHS.flatMap((def) =>
  def.patterns.map((p) => ({ m: def.m, re: thaiAbbrToRegex(p), len: p.length })),
).sort((a, b) => b.len - a.len);

const THAI_MONTH_RE = `(${thaiMonthAlternatives.map((a) => a.re).join('|')})`;

function thaiMonthNumber(token: string): number | null {
  for (const a of thaiMonthAlternatives) if (new RegExp(`^${a.re}$`).test(token)) return a.m;
  return null;
}

export function resolveYear(raw: string, thaiContext: boolean): number {
  const n = Number(raw);
  if (raw.length <= 2) return thaiContext ? 2500 + n - 543 : 2000 + n;
  return n >= 2400 ? n - 543 : n;
}

export interface DateCandidate {
  date: string;
  index: number;
}

/** All valid calendar dates found in the text, in order of appearance. */
export function findDates(text: string, thaiContext: boolean): DateCandidate[] {
  const found: DateCandidate[] = [];
  const push = (index: number, y: number, m: number, d: number) => {
    const ymd = makeYmd(y, m, d);
    if (ymd) found.push({ date: ymd, index });
  };

  const thaiRe = new RegExp(
    `(?<!\\d)(\\d{1,2})\\s*${THAI_MONTH_RE}\\s*(\\d{4}|\\d{2})(?!\\d)`,
    'g',
  );
  for (const m of text.matchAll(thaiRe)) {
    const month = thaiMonthNumber(m[2]!.replace(/\s/g, ''));
    if (month) push(m.index!, resolveYear(m[3]!, true), month, Number(m[1]));
  }

  // OMX-054 (BUG-013): make by KBank OCR reads "พ.ย." as Latin "w.g." — accepted ONLY in the full
  // slip header "dd w.g. 25xx|xx hh:mm" (round 1: this month only; others need a real fixture).
  const latinLookAlike =
    /(?<![\dA-Za-z])(\d{1,2})\s+[wW]\s?\.\s?[gG]\.?\s+(25\d{2}|\d{2})\s+(?:-\s*)?\d{1,2}:\d{2}(?!\d)/g;
  for (const m of text.matchAll(latinLookAlike))
    push(m.index!, resolveYear(m[2]!, true), 11, Number(m[1]));

  const enDmy = new RegExp(
    `(?<!\\d)(\\d{1,2})\\s+${EN_MONTH_RE}\\.?,?\\s+(\\d{4}|\\d{2})(?!\\d)`,
    'gi',
  );
  for (const m of text.matchAll(enDmy)) {
    push(
      m.index!,
      resolveYear(m[3]!, thaiContext),
      EN_MONTHS.indexOf(m[2]!.slice(0, 3).toLowerCase()) + 1,
      Number(m[1]),
    );
  }
  const enMdy = new RegExp(`${EN_MONTH_RE}\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})(?!\\d)`, 'gi');
  for (const m of text.matchAll(enMdy)) {
    push(
      m.index!,
      resolveYear(m[3]!, thaiContext),
      EN_MONTHS.indexOf(m[1]!.slice(0, 3).toLowerCase()) + 1,
      Number(m[2]),
    );
  }

  for (const m of text.matchAll(/(?<![\d/.-])(\d{4})-(\d{1,2})-(\d{1,2})(?![\d/-])/g)) {
    push(m.index!, resolveYear(m[1]!, thaiContext), Number(m[2]), Number(m[3]));
  }
  for (const m of text.matchAll(
    /(?<![\d/.,-])(\d{1,2})[/.-](\d{1,2})[/.-](\d{4}|\d{2})(?![\d/.-]|\.\d)/g,
  )) {
    push(m.index!, resolveYear(m[3]!, thaiContext), Number(m[2]), Number(m[1]));
  }

  return found.sort((a, b) => a.index - b.index);
}

/** "14:35", "14:35:22", "14.35 น.", "02:35 PM" → "14:35"; null if none. */
export function findTime(text: string): string | null {
  const re =
    /(?<![\d,.:/])(\d{1,2})(?:(:)|\.(?=\d{2}\s*น))(\d{2})(?::\d{2})?(?![\d/])\s*(AM|PM|น\.?)?/gi;
  for (const m of text.matchAll(re)) {
    let h = Number(m[1]);
    const min = Number(m[3]);
    const suffix = (m[4] ?? '').toUpperCase();
    if (suffix === 'PM' && h < 12) h += 12;
    if (suffix === 'AM' && h === 12) h = 0;
    if (h > 23 || min > 59) continue;
    return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
  }
  return null;
}

const PAY_DATE_LABEL = /วันที่จ่าย|วันที่โอน|วันจ่าย|pay\s*date|payment\s*date/i;
const PERIOD_LABEL = new RegExp(
  `(?:งวด(?:เดือน)?|ประจำเดือน|pay\\s*period|period)\\s*[:：]?\\s*(?:${THAI_MONTH_RE}|${EN_MONTH_RE})\\s*(\\d{4})`,
  'i',
);

/** Salary slip: pay-date label, else last day of the pay period, else null (AC5). */
export function findSalaryDate(
  lines: string[],
  thaiContext: boolean,
  accept: (d: string) => boolean,
): string | null {
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (!PAY_DATE_LABEL.test(line)) continue;
    const near = [...findDates(line, thaiContext), ...findDates(lines[i + 1] ?? '', thaiContext)];
    const ok = near.find((c) => accept(c.date));
    if (ok) return ok.date;
  }
  for (const line of lines) {
    const m = PERIOD_LABEL.exec(line);
    if (!m) continue;
    const month = m[1]
      ? thaiMonthNumber(m[1].replace(/\s/g, ''))
      : EN_MONTHS.indexOf(m[2]!.slice(0, 3).toLowerCase()) + 1;
    const y = resolveYear(m[3]!, thaiContext);
    if (month) {
      const d = makeYmd(y, month, daysInMonth(y, month));
      if (d && accept(d)) return d;
    }
  }
  return null;
}
