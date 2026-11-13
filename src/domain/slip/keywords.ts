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
