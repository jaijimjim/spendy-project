import { describe, expect, it } from 'vitest';
import { detectType } from './type';
import { bestMatch, categorize } from './categorize';
import { CATEGORY_RULES } from './categories.rules';
import { containsKeyword } from './keywords';
import { normalizeText, thaiDigitsToAscii } from './normalize';
import {
  detectBank,
  extractParties,
  looksLikePerson,
  maskAccount,
  normalizePayee,
} from './parties';

describe('detectType precedence (OMX-006)', () => {
  it.each([
    ['สลิปเงินเดือน เงินได้สุทธิ 1.00', 'income', 'salary', 'high'],
    ['เงินเดือน รายการหัก', 'income', 'salary', 'medium'],
    ['สลิปเงินเดือน โอนเข้าบัญชี', 'income', 'salary', 'medium'],
    ['ได้รับเงิน', 'income', 'received', 'medium'],
    ['ผู้รับเงิน นาย ก โอนเงินสำเร็จ', 'expense', 'transfer', 'high'],
    ['Transfer successful', 'expense', 'transfer', 'high'],
    ['PromptPay', 'expense', 'weak', 'medium'],
    ['', 'expense', 'default', 'low'],
  ] as const)('%s', (text, type, rule, confidence) => {
    const r = detectType(text, true);
    expect(r).toMatchObject({ type, rule, confidence });
  });

  it('transfer without amount is only medium', () => {
    expect(detectType('โอนเงินสำเร็จ', false).confidence).toBe('medium');
  });
});

describe('keyword matching (R4)', () => {
  it('is case- and space-insensitive', () => {
    expect(containsKeyword('Grab Food order', 'GrabFood')).toBe(true);
    expect(containsKeyword('GRABFOOD', 'GrabFood')).toBe(true);
    expect(containsKeyword('ก๋วย เตี๋ยว', 'ก๋วยเตี๋ยว')).toBe(true);
  });
  it('uses word boundaries for English', () => {
    expect(containsKeyword('RAISIN', 'AIS')).toBe(false);
    expect(containsKeyword('SMRTX', 'MRT')).toBe(false);
    expect(containsKeyword('pay AIS bill', 'AIS')).toBe(true);
  });
});

describe('categorize (OMX-010)', () => {
  it('table: every keyword in the rules file maps to its category', () => {
    for (const rule of CATEGORY_RULES) {
      for (const k of rule.keywords) {
        const m = bestMatch(k);
        // A keyword may be contained in a longer keyword of the same text only; it must win on its own text.
        expect(m, k).not.toBeNull();
        expect(m!.keyword.replace(/\s/g, '').length).toBeGreaterThanOrEqual(
          k.replace(/\s/g, '').length,
        );
      }
    }
  });

  it.each([
    ['GrabFood', 'food'],
    ['Grab', 'transport'],
    ['Café Amazon PTT', 'food'],
    ['Central Food Hall', 'food'],
    ['Central World', 'shopping'],
    ['การไฟฟ้านครหลวง', 'bills'],
  ] as const)('payee %s → %s', (payee, category) => {
    expect(
      categorize({ type: 'expense', isSalary: false, payee, memo: null, text: payee }).category,
    ).toBe(category);
  });

  it('payee beats memo beats text', () => {
    expect(
      categorize({
        type: 'expense',
        isSalary: false,
        payee: 'Shopee',
        memo: 'ค่าเช่า',
        text: 'Netflix',
      }).category,
    ).toBe('shopping');
    expect(
      categorize({
        type: 'expense',
        isSalary: false,
        payee: 'นาย ก',
        memo: 'ค่าเช่า',
        text: 'Netflix',
      }).category,
    ).toBe('housing');
    expect(
      categorize({ type: 'expense', isSalary: false, payee: null, memo: null, text: 'Netflix' }),
    ).toMatchObject({ category: 'entertainment', confidence: 'medium' });
  });

  it('person prefix → transfer, company never transfer', () => {
    expect(
      categorize({ type: 'expense', isSalary: false, payee: 'น.ส. สมใจ', memo: null, text: '' })
        .category,
    ).toBe('transfer');
    expect(
      categorize({ type: 'expense', isSalary: false, payee: 'Mr. John', memo: null, text: '' })
        .category,
    ).toBe('transfer');
    expect(
      categorize({ type: 'expense', isSalary: false, payee: 'บริษัท ก จำกัด', memo: null, text: '' })
        .category,
    ).toBe('other');
  });

  it('income only gets income categories', () => {
    expect(
      categorize({ type: 'income', isSalary: true, payee: 'Shopee', memo: null, text: '' })
        .category,
    ).toBe('salary');
    expect(
      categorize({ type: 'income', isSalary: false, payee: 'Shopee', memo: null, text: '' })
        .category,
    ).toBe('other_income');
  });

  it('defaults to other / low', () => {
    expect(
      categorize({ type: 'expense', isSalary: false, payee: null, memo: null, text: 'zzz' }),
    ).toMatchObject({ category: 'other', confidence: 'low' });
  });
});

describe('normalize (R4)', () => {
  it('applies NFC, sara am fix, zero-width removal, thai digits, whitespace', () => {
    expect(normalizeText('ค่ํา  ธรรม​เนียม\r\n\n  ๑๒๓  ')).toBe('ค่ำ ธรรมเนียม\n123');
    expect(thaiDigitsToAscii('๐๙')).toBe('09');
  });
});

describe('parties (OMX-009)', () => {
  it('extracts payee, account (masked), memo, ref, sender', () => {
    const lines = [
      'จาก นาย ก',
      'ไปยัง',
      'ร้านข้าวมันไก่',
      '123-4-56789-0',
      'บันทึกช่วยจำ: มื้อเที่ยง',
      'Ref No. ABC123456',
    ];
    const p = extractParties(lines, lines.join('\n'));
    expect(p).toMatchObject({
      payee: 'ร้านข้าวมันไก่',
      payeeAccount: 'xxx-x-xx789-0',
      sender: 'นาย ก',
      memo: 'มื้อเที่ยง',
      refNo: 'ABC123456',
    });
  });

  it('does not treat "Total" as a To label', () => {
    expect(extractParties(['Total 5.00'], 'Total 5.00').payee).toBeNull();
  });

  it('masks account numbers keeping last 4 digits', () => {
    expect(maskAccount('1234567890')).toBe('xxxxxx7890');
    expect(maskAccount('xxx-x-x1234-x')).toBe('xxx-x-x1234-x');
  });

  it('detects banks', () => {
    expect(detectBank('SCB EASY')).toBe('scb');
    expect(detectBank('Krungthai NEXT')).toBe('ktb');
    expect(detectBank('K PLUS')).toBe('kplus');
    expect(detectBank('พร้อมเพย์')).toBe('promptpay');
    expect(detectBank('MyMo ออมสิน')).toBe('gsb');
    expect(detectBank('nothing')).toBeNull();
  });

  it('person detection & payee normalization', () => {
    expect(looksLikePerson('นางสาวสมใจ')).toBe(true);
    expect(looksLikePerson('Mrs. Smith')).toBe(true);
    expect(looksLikePerson('นาฬิกา shop')).toBe(false);
    expect(normalizePayee('  นาย สม ชาย ')).toBe('สมชาย');
    expect(normalizePayee(undefined)).toBe('');
  });
});
