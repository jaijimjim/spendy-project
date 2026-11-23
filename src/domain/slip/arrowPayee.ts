/**
 * OMX-049 — payee for the "arrow" layout (make by KBank, K PLUS, Krungthai NEXT): no "ไปยัง/To"
 * label; the slip reads
 *   sender name → (bank) → sender masked account → ↓ (often lost / OCR junk) → payee / merchant
 *   → (second biller line) → payee account / PromptPay / Biller ID.
 * Rule: payee = first name-like line after the FIRST masked-account line, before the next
 * account/ID line, skipping ≤ 3 junk lines. Never the sender (fuzzy guard). When unsure → null.
 * Input = `toColumnLines(raw)` so the right-column OCR noise after a wide gap can be dropped.
 * Expense slips only (caller decides — parseSlip).
 */
import { COLUMN_GAP } from './normalize';
import { PERSON_PREFIX } from './parties';

export interface ArrowPayee {
  payee: string | null;
  /** second merchant/biller line (e.g. "… FOOD") — for the categorizer, not displayed */
  payeeExtra: string | null;
  /** the payee's account/ID line as printed (already masked by the bank) */
  account: string | null;
}

const NONE: ArrowPayee = { payee: null, payeeExtra: null, account: null };

/** Masked account / wallet / PromptPay: mask chars x X × * % (OCR), separators - – — = with spaces. */
const MASK_GROUP = '[xX×*%\\d=]';
const MASKED_ACCOUNT_RE = new RegExp(
  `(?<![A-Za-z])${MASK_GROUP}{2,}(?:\\s?[-–—]\\s?${MASK_GROUP}+){2,}(?![A-Za-z])|(?<![A-Za-z])[xX×*%]{3,}\\d{3,}(?![A-Za-z\\d])`,
);

/** A masked account (needs at least one mask char so plain numbers/dates never anchor). */
export function maskedAccountIn(line: string): string | null {
  const m = MASKED_ACCOUNT_RE.exec(line);
  if (!m || !/[xX×*%]/.test(m[0])) return null;
  return m[0].replace(/\s/g, '');
}

/** Long id / reference / Biller ID: ≥ 8 digits in one token (letters allowed around). */
const ID_LINE = /(?:^|\s)[A-Za-z0-9]*\d{8,}[A-Za-z0-9]*(?:\s|$)/;
const STOP_LABEL =
  /^(?:จำนวน|ค่าธรรมเนียม|เลขที่|รหัส|วันที่|ข้อมูลอ้างอิง|หมายเหตุ|Amount|Fee|Ref|Biller|Service)/i;
const BANK_LINE =
  /^(?:ธ\.|ธนาคาร|กสิกร|ไทยพาณิชย์|กรุงไทย|กรงไทย|กรุงเทพ|กรุงศรี|ทหารไทย|ออมสิน|ttb|tmb|kbank|k\s?plus|scb|ktb|bbl|gsb|krungthai|promptpay|พร้อมเพย์)/i;

const THAI_CONSONANT = /[ก-ฮ]/g;
const LATIN = /[A-Za-z]/g;
const count = (s: string, re: RegExp) => (s.match(re) ?? []).length;

/**
 * A token that is OCR junk (arrow/logo/cartoon), not part of a name: "J", "oy", "dD", "(G)",
 * "09", "619", "(ๆ", "ง/", "«52»", "|", "=", "°°". Keeps person prefixes and short UPPERCASE
 * brands ("MK", "SCB").
 */
function isJunkToken(t: string): boolean {
  if (PERSON_PREFIX.test(`${t} `)) return false;
  const thai = count(t, THAI_CONSONANT);
  const latin = count(t, LATIN);
  if (thai === 0 && latin === 0) return t.length <= 3 || /[^\w\-.]/.test(t);
  if (t.length > 3) return false;
  if (latin === 0) return thai <= 1;
  if (thai === 0) return latin === 1 || (latin === 2 && t !== t.toUpperCase());
  return false;
}

/** Trailing junk is stricter: never drop a Thai letter (it may be a surname initial). */
const isTrailingJunk = (t: string) => count(t, THAI_CONSONANT) === 0 && isJunkToken(t);

/** Left-most meaningful column of a line, without leading/trailing junk tokens. */
function cleanSegment(line: string): string {
  const segments = line.split(COLUMN_GAP);
  for (const seg of segments) {
    const tokens = seg.trim().split(/\s+/).filter(Boolean);
    while (tokens.length && isJunkToken(tokens[0]!)) tokens.shift();
    while (tokens.length && isTrailingJunk(tokens[tokens.length - 1]!)) tokens.pop();
    if (tokens.length) return tokens.join(' ');
  }
  return '';
}

function isNameLike(s: string): boolean {
  if (!s) return false;
  const letters = count(s, THAI_CONSONANT) + count(s, LATIN);
  const digits = count(s, /\d/g);
  return letters >= 3 && digits <= letters / 2;
}

const isStop = (line: string, clean: string) =>
  maskedAccountIn(line) !== null ||
  ID_LINE.test(line.replace(new RegExp(COLUMN_GAP, 'g'), ' ')) ||
  STOP_LABEL.test(clean) ||
  BANK_LINE.test(clean);

/** Is line 2 the continuation of a wrapped name (shown as one payee)? */
function joinContinuation(first: string, second: string): string | null {
  if (/^บริษัท/.test(first) && !/จำกัด/.test(first) && /จำกัด/.test(second))
    return `${first} ${second}`;
  if (/สาขา$/.test(first)) return `${first}${second}`;
  const latinOnly = /^[A-Z0-9_&.'\-() ]+$/;
  if (latinOnly.test(first) && latinOnly.test(second) && !/^\(.*\)$/.test(second))
    return `${first} ${second}`;
  return null;
}

/** Fold for name comparison: no prefix/space/dot/tone marks; OCR ึ ↔ ี. */
function foldName(s: string): string {
  return s
    .normalize('NFC')
    .trim()
    .replace(PERSON_PREFIX, '')
    .replace(/[\s.]+/g, '')
    .replace(/[่-๋์]/g, '')
    .replace(/ึ/g, 'ี')
    .toLowerCase();
}

function editDistance(a: string, b: string): number {
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++)
      cur[j] = Math.min(
        prev[j]! + 1,
        cur[j - 1]! + 1,
        prev[j - 1]! + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    prev = cur;
  }
  return prev[b.length]!;
}

/**
 * Same person despite OCR noise and truncation ("ปรึยานุชส" vs "ปรียานุช สายสุวรรณ"): the shorter
 * folded name is within a small edit distance of the start of the longer one.
 */
export function sameNameFuzzy(a: string, b: string): boolean {
  const [s, l] = [...[foldName(a), foldName(b)]].sort((x, y) => x.length - y.length) as [
    string,
    string,
  ];
  if (s.length < 4) return false;
  const limit = Math.max(1, Math.floor(s.length / 4));
  const d = Math.min(
    editDistance(s, l.slice(0, s.length)),
    editDistance(s, l.slice(0, s.length + 1)),
    editDistance(s, l.slice(0, Math.max(0, s.length - 1))),
  );
  return d <= limit;
}

const MAX_JUNK = 3;
const SENDER_LOOKBACK = 4;

export function extractArrowPayee(lines: readonly string[]): ArrowPayee {
  const anchor = lines.findIndex((l) => maskedAccountIn(l) !== null);
  if (anchor < 0) return NONE;

  // Sender name(s): name-like lines just above the anchor (bank lines excluded).
  const senders: string[] = [];
  for (let i = Math.max(0, anchor - SENDER_LOOKBACK); i < anchor; i++) {
    const c = cleanSegment(lines[i]!);
    if (isNameLike(c) && !BANK_LINE.test(c)) senders.push(c);
  }

  let junk = 0;
  for (let i = anchor + 1; i < lines.length; i++) {
    const line = lines[i]!;
    const clean = cleanSegment(line);
    if (isStop(line, clean)) return NONE;
    if (!isNameLike(clean)) {
      if (++junk > MAX_JUNK) return NONE;
      continue;
    }
    if (senders.some((s) => sameNameFuzzy(s, clean))) return NONE; // AC4: never the sender

    // Optional second line (biller / wrapped name) and the payee's account/ID line.
    let extra: string | null = null;
    let account: string | null = null;
    for (let j = i + 1; j < Math.min(lines.length, i + 4); j++) {
      const l2 = lines[j]!;
      const c2 = cleanSegment(l2);
      const acc = maskedAccountIn(l2);
      if (acc) {
        account = acc;
        break;
      }
      if (BANK_LINE.test(c2)) continue; // payee's bank — skip, keep looking for the account
      if (isStop(l2, c2)) break;
      if (!extra && isNameLike(c2)) extra = c2;
    }
    const joined = extra ? joinContinuation(clean, extra) : null;
    return {
      payee: (joined ?? clean).slice(0, 100),
      payeeExtra: extra,
      account,
    };
  }
  return NONE;
}
