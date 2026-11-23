/** Transaction-type detection (OMX-006) with precedence salary → received → transfer → weak → default. */
import type { Confidence, TxType } from '../types';
import { containsKeyword, containsKeywordFuzzy, findKeywords } from './keywords';

export const SALARY_STRONG = ['สลิปเงินเดือน', 'Payslip', 'Pay slip', 'เงินได้สุทธิ', 'Net Pay'] as const;
export const SALARY_WEAK = ['เงินเดือน', 'รายได้', 'Salary', 'รายการหัก'] as const;
export const RECEIVED = [
  'ได้รับเงิน',
  'รับเงิน',
  'เงินเข้า',
  'รับโอน',
  'You received',
  'Money received',
] as const;
export const TRANSFER_STRONG = [
  'โอนเงินสำเร็จ',
  'ชำระเงินสำเร็จ',
  'จ่ายบิลสำเร็จ',
  'รายการสำเร็จ',
  'Transfer successful',
  'Successful transfer',
  'Payment successful',
  'Bill payment successful',
] as const;
export const EXPENSE_WEAK = [
  'K PLUS',
  'K+',
  'KBank',
  'กสิกรไทย',
  'SCB EASY',
  'ไทยพาณิชย์',
  'Krungthai NEXT',
  'Krungthai',
  'กรุงไทย',
  'พร้อมเพย์',
  'PromptPay',
  'Bangkok Bank',
  'กรุงเทพ',
  'krungsri',
  'กรุงศรี',
  'ttb',
] as const;

export type TypeRule = 'salary' | 'received' | 'transfer' | 'weak' | 'default';

export interface TypeResult {
  type: TxType;
  isSalary: boolean;
  rule: TypeRule;
  confidence: Confidence;
}

/**
 * "รับเงิน" inside "ผู้รับเงิน" (= payee label on a sender's slip) is not evidence of receiving money,
 * so we blank out those labels before matching received keywords.
 */
function stripPayeeLabels(text: string): string {
  return text.replace(/ผู้\s*รับ\s*(เงิน|โอน)?/g, ' ');
}

/**
 * @param amountFound whether an amount was extracted — R5: High needs the related field too.
 */
export function detectType(text: string, amountFound: boolean): TypeResult {
  const strong = findKeywords(text, SALARY_STRONG);
  const weak = findKeywords(text, SALARY_WEAK).filter(
    // "สลิปเงินเดือน" already counted as strong; don't double count its "เงินเดือน" substring
    (w) =>
      !(w === 'เงินเดือน' && strong.includes('สลิปเงินเดือน') && countOccurrences(text, 'เงินเดือน') <= 1),
  );
  const received = findKeywords(stripPayeeLabels(text), RECEIVED);
  // OMX-050b AC4: Thai success headers tolerate OCR confusables ("ชําระเจินสำเร็จ").
  const transfer = TRANSFER_STRONG.filter(
    (k) => containsKeyword(text, k) || (/[ก-๙]/.test(k) && containsKeywordFuzzy(text, k)),
  );
  const transferish = transfer.length > 0 || containsKeyword(text, 'โอนเข้าบัญชี');

  if (strong.length >= 1 || weak.length >= 2) {
    const mixed = transferish || received.length > 0;
    const confidence: Confidence = strong.length && amountFound && !mixed ? 'high' : 'medium';
    return { type: 'income', isSalary: true, rule: 'salary', confidence };
  }
  if (received.length) {
    return { type: 'income', isSalary: false, rule: 'received', confidence: 'medium' };
  }
  if (transfer.length) {
    const mixed = weak.length > 0;
    return {
      type: 'expense',
      isSalary: false,
      rule: 'transfer',
      confidence: amountFound && !mixed ? 'high' : 'medium',
    };
  }
  if (findKeywords(text, EXPENSE_WEAK).length) {
    return { type: 'expense', isSalary: false, rule: 'weak', confidence: 'medium' };
  }
  return { type: 'expense', isSalary: false, rule: 'default', confidence: 'low' };
}

function countOccurrences(text: string, needle: string): number {
  return text.split(needle).length - 1;
}
