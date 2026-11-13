/**
 * Text normalization applied before every parse (R4):
      .replace(/\u0E4D\u0E32/g, '\u0E33')
 * trim each line and drop empty lines.
 */
const THAI_DIGITS = '๐๑๒๓๔๕๖๗๘๙';

export function thaiDigitsToAscii(s: string): string {
  return s.replace(/[๐-๙]/g, (d) => String(THAI_DIGITS.indexOf(d)));
}

export function normalizeText(input: string): string {
  return thaiDigitsToAscii(
    input
      .normalize('NFC')
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, '')
      // SARA AM written as NIKHAHIT + SARA AA (common OCR/IME output)
      .replace(/\u0E4D\u0E32/g, '\u0E33')
      .replace(/\r\n?/g, '\n')
      .replace(/[\t\u00A0\u3000]/g, ' '),
  )
    .split('\n')
    .map((l) => l.replace(/ {2,}/g, ' ').trim())
    .filter((l) => l.length > 0)
    .join('\n');
}

export function toLines(normalized: string): string[] {
  return normalized.length ? normalized.split('\n') : [];
}

const HAS_THAI = /[฀-๿]/;
export function hasThai(s: string): boolean {
  return HAS_THAI.test(s);
}
