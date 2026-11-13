/**
 * Text normalization applied before every parse (R4):
 * NFC, "ํา" → "ำ", remove zero-width chars, Thai digits → ASCII, collapse repeated spaces,
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
      .replace(/[​-‍⁠﻿]/g, '')
      // SARA AM written as NIKHAHIT + SARA AA (common OCR/IME output)
      .replace(/ํา/g, 'ำ')
      .replace(/\r\n?/g, '\n')
      .replace(/[\t 　]/g, ' '),
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
