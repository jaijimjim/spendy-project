/**
 * Payee / sender / memo / bank / reference extraction (OMX-009, and OMX-010 AC3 payee source).
 * Layouts differ per bank; we rely on labels ("ไปยัง/To", "จาก/From", "บันทึกช่วยจำ/Memo", "เลขที่รายการ/Ref").
 */
import type { BankId } from '../types';
import { containsKeyword } from './keywords';

const PAYEE_LABEL =
  /^(?:ไปยัง|ไปที่|ถึง|โอนไป|ผู้รับเงิน|ผู้รับโอน|ผู้รับ|To|Receiver|Recipient|Payee)(?![A-Za-z])\s*[:：]?\s*(.*)$/i;
const SENDER_LABEL = /^(?:จาก|ผู้โอน|ผู้ส่ง|From|Sender)(?![A-Za-z])\s*[:：]?\s*(.*)$/i;
const MEMO_LABEL =
  /(?:บันทึกช่วยจำ|บันทึก|หมายเหตุ|(?<![A-Za-z])(?:Memo|Note)(?![A-Za-z]))\s*[:：]?\s*(.*)$/i;
const REF_LABEL =
  /(?:เลขที่รายการ|เลขที่อ้างอิง|รหัสอ้างอิง|รหัสรายการ|(?<![A-Za-z])Ref(?:erence)?\.?\s*(?:No\.?|ID|Code)?|Transaction\s*(?:ID|No\.?))\s*[:：]?\s*([A-Za-z0-9]{6,})?/i;
/** Account / PromptPay number patterns, possibly already masked by the bank. */
const ACCOUNT_RE =
  /(?:[xX*\d]{3}-[xX*\d]-[xX*\d]{5}-[xX*\d]|[xX*\d]{3}-[xX*\d]{3}-[xX*\d]{4}|[xX*]{3,}[\d]{3,4}|\d{10,13})/;
const COMPANY_RE = /บริษัท.+จำกัด|บจก\.?|ห้างหุ้นส่วน|Co\.,?\s*Ltd\.?|Company|Limited|Corporation|Inc\./i;
const BANK_NOISE =
  /^(?:ธ\.|ธนาคาร|bank|kbank|scb|ktb|bbl|กสิกรไทย|ไทยพาณิชย์|กรุงไทย|กรุงเทพ|กรุงศรี|พร้อมเพย์|promptpay)\b/i;

export interface Parties {
  payee: string | null;
  payeeAccount: string | null;
  sender: string | null;
  memo: string | null;
  refNo: string | null;
  bank: BankId | null;
  employer: string | null;
}

/** Mask all but the last 4 digits: 123-4-56789-0 → xxx-x-xx789-0 style (digits → x). */
export function maskAccount(acc: string): string {
  const digits = acc.replace(/\D/g, '');
  if (digits.length <= 4) return acc;
  let keep = 4;
  const chars = [...acc].reverse().map((c) => {
    if (/\d/.test(c)) {
      if (keep > 0) {
        keep--;
        return c;
      }
      return 'x';
    }
    return c;
  });
  return chars.reverse().join('');
}

function cleanName(s: string): string | null {
  const v = s
    .replace(ACCOUNT_RE, '')
    .replace(/\s{2,}/g, ' ')
    .replace(/^[\s:：\-–]+|[\s:：\-–]+$/g, '')
    .trim();
  if (!v || v.length < 2 || /^\d+$/.test(v)) return null;
  return v.slice(0, 100);
}

/** The value of a labelled block: rest of the label line, else the next non-bank line. */
function labelledValue(
  lines: string[],
  re: RegExp,
): { value: string | null; account: string | null } {
  for (let i = 0; i < lines.length; i++) {
    const m = re.exec(lines[i]!);
    if (!m) continue;
    const parts = [m[1] ?? '', lines[i + 1] ?? '', lines[i + 2] ?? ''];
    let value: string | null = null;
    let account: string | null = null;
    for (const p of parts) {
      const acc = ACCOUNT_RE.exec(p);
      if (acc && !account) account = maskAccount(acc[0]);
      if (!value && !BANK_NOISE.test(p)) value = cleanName(p);
      if (value && account) break;
    }
    return { value, account };
  }
  return { value: null, account: null };
}

const BANK_RULES: { bank: BankId; keywords: string[] }[] = [
  { bank: 'kplus', keywords: ['K PLUS', 'K+', 'KBank', 'กสิกรไทย', 'กสิกร', 'MAKE by KBank'] },
  { bank: 'scb', keywords: ['SCB EASY', 'SCB', 'ไทยพาณิชย์'] },
  { bank: 'ktb', keywords: ['Krungthai NEXT', 'Krungthai', 'กรุงไทย', 'KTB'] },
  { bank: 'bbl', keywords: ['Bangkok Bank', 'Bualuang', 'กรุงเทพ', 'BBL'] },
  { bank: 'bay', keywords: ['Krungsri', 'กรุงศรี', 'KMA'] },
  { bank: 'ttb', keywords: ['ttb', 'ทหารไทยธนชาต'] },
  { bank: 'gsb', keywords: ['MyMo', 'ออมสิน', 'GSB'] },
];

/** Bank/app of the slip. The bank named first in the text is usually the app that produced it. */
export function detectBank(text: string): BankId | null {
  let best: { bank: BankId; index: number } | null = null;
  for (const rule of BANK_RULES) {
    for (const k of rule.keywords) {
      if (!containsKeyword(text, k)) continue;
      const idx = text.toLowerCase().indexOf(k.toLowerCase().split(' ')[0]!);
      const index = idx < 0 ? Number.MAX_SAFE_INTEGER : idx;
      if (!best || index < best.index) best = { bank: rule.bank, index };
    }
  }
  if (best) return best.bank;
  if (containsKeyword(text, 'พร้อมเพย์') || containsKeyword(text, 'PromptPay')) return 'promptpay';
  return null;
}

export function extractParties(lines: string[], text: string): Parties {
  const payee = labelledValue(lines, PAYEE_LABEL);
  const sender = labelledValue(lines, SENDER_LABEL);

  let memo: string | null = null;
  for (const line of lines) {
    const m = MEMO_LABEL.exec(line);
    if (m && m[1]?.trim()) {
      memo = m[1].trim().slice(0, 500);
      break;
    }
  }

  let refNo: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const m = REF_LABEL.exec(lines[i]!);
    if (!m) continue;
    const v = m[1] ?? /^([A-Za-z0-9]{6,})$/.exec((lines[i + 1] ?? '').replace(/\s/g, ''))?.[1];
    if (v && /\d/.test(v)) {
      refNo = v;
      break;
    }
  }

  const employerLine = lines.find((l) => COMPANY_RE.test(l));

  return {
    payee: payee.value,
    payeeAccount: payee.account,
    sender: sender.value,
    memo,
    refNo,
    bank: detectBank(text),
    employer: employerLine ? employerLine.slice(0, 100) : null,
  };
}

export const PERSON_PREFIX =
  /^(?:นาย|นางสาว|นาง|น\.ส\.?|ด\.ช\.|ด\.ญ\.|Mr\.?|Mrs\.?|Ms\.?|Miss)(?:\s|(?=[฀-๿]))/i;

/**
 * OCR-tolerant personal prefix (BUG-006): Tesseract often adds 1–2 stray Thai glyphs before the
 * prefix ("แนายข", "นแนายข") and may read "ย" as "ข". The "นาข" variant is only accepted after
 * such junk (so real words like "นาขวัญ" don't count), and never before a vowel/tone mark.
 */
const NOISY_PERSON_PREFIX = /^[ก-๏]{1,2}?(?:นาย|นางสาว|นาง|น\.ส\.?|นา[ขซ](?![ัิ-ฺ็-๎]))(?:\s|(?=[ก-ฮ]))/;

export function looksLikePerson(name: string): boolean {
  const n = name.trim();
  if (COMPANY_RE.test(n)) return false;
  return PERSON_PREFIX.test(n) || NOISY_PERSON_PREFIX.test(n);
}

export function isCompany(name: string): boolean {
  return COMPANY_RE.test(name);
}

/** Normalized payee for duplicate comparison: no prefixes, no spaces, lower case. */
export function normalizePayee(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .normalize('NFC')
    .trim()
    .replace(PERSON_PREFIX, '')
    .replace(/[\s.]+/g, '')
    .toLowerCase();
}
