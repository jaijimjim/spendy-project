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

/** Marks a wide horizontal gap (≥ 3 spaces) in a line: OCR puts right-column noise after it. */
export const COLUMN_GAP = '│';

/**
 * Same lines as `toLines(normalizeText(raw))` (1:1, same order) but a wide gap between two
 * non-space characters is kept as `COLUMN_GAP`, so callers can take the left column only
 * (OMX-049: payee under the arrow is followed by cartoon/QR garbage on the right).
 */
export function toColumnLines(raw: string): string[] {
  return toLines(normalizeText(raw.replace(/(\S)[ \t\u00A0\u3000]{3,}(?=\S)/g, `$1${COLUMN_GAP}`)));
}

const HAS_THAI = /[฀-๿]/;
export function hasThai(s: string): boolean {
  return HAS_THAI.test(s);
}
