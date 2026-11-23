/**
 * Keyword matcher shared by type detection and categorization (R4):
 * - case-insensitive
 * - space-insensitive: "Grab Food" and "GRABFOOD" match the keyword "GrabFood" (OCR often
 *   inserts or drops spaces, especially inside Thai words)
 * - English keywords get word boundaries ("AIS" does not match inside "RAISIN")
 */
const cache = new Map<string, RegExp>();

// Only escape characters that are special outside a class (the 'u' flag rejects needless escapes).
const escape = (c: string) => c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const LATIN_OR_DIGIT = /[A-Za-z0-9]/;

export function keywordRegex(keyword: string): RegExp {
  let re = cache.get(keyword);
  if (re) return re;
  const chars = [...keyword.replace(/\s+/g, '')];
  const body = chars.map(escape).join('\\s*');
  const first = chars[0] ?? '';
  const last = chars[chars.length - 1] ?? '';
  const pre = LATIN_OR_DIGIT.test(first) ? '(?<![A-Za-z0-9])' : '';
  const post = LATIN_OR_DIGIT.test(last) ? '(?![A-Za-z0-9])' : '';
  re = new RegExp(pre + body + post, 'iu');
  cache.set(keyword, re);
  return re;
}

export function containsKeyword(text: string, keyword: string): boolean {
  return keywordRegex(keyword).test(text);
}

export function findKeywords(text: string, keywords: readonly string[]): string[] {
  return keywords.filter((k) => containsKeyword(text, k));
}

/** Length used for "longest keyword wins" — ignores spaces. */
export function keywordLength(keyword: string): number {
  return [...keyword.replace(/\s+/g, '')].length;
}

/**
 * OMX-050b: confusable-character folding for the keyword MATCHER only (never applied to stored
 * payee/memo/rawText — `normalizeText()` is unchanged). Round 1 table (grooming): drop Thai tone
 * marks ่ ้ ๊ ๋, ์, ็, ๆ; ซ→ช, บ→ป, ผ→พ, ฝ→ฟ, ง→จ; Latin 0→o, 1/I/l/|→l, rn→m; lower case.
 * ด↔ต is deliberately NOT folded (round 1).
 */
const FOLD_MAP: Record<string, string> = { ซ: 'ช', บ: 'ป', ผ: 'พ', ฝ: 'ฟ', ง: 'จ' };
export function fold(s: string): string {
  return s
    .normalize('NFC')
    .replace(/[่-๋์็ๆ]/g, '')
    .replace(/[ซบผฝง]/g, (c) => FOLD_MAP[c]!)
    .replace(/[1Il|]/g, 'l')
    .replace(/0/g, 'o')
    .toLowerCase()
    .replace(/rn/g, 'm');
}

/** Fuzzy keywords must fold to at least this many characters (AC3 — bounds false positives). */
export const FUZZY_MIN_LENGTH = 5;

let lastText = '';
let lastFolded = '';
const foldedText = (text: string) => {
  if (text !== lastText) {
    lastText = text;
    lastFolded = fold(text);
  }
  return lastFolded;
};

/** Keyword match after folding both sides; only for keywords that fold to ≥ 5 chars. */
export function containsKeywordFuzzy(text: string, keyword: string): boolean {
  const k = fold(keyword);
  if (keywordLength(k) < FUZZY_MIN_LENGTH) return false;
  return keywordRegex(k).test(foldedText(text));
}
