/**
 * OMX-050b — fuzzy (confusable-char folded) keywords for Lazada / Shopee + Rabbit / BTS transport
 * (BUG-010b, BUG-014). Synthetic text with fake names; real slips from REDACTED OCR text.
 */
import { CATEGORY_RULES } from './categories.rules';
import { categorize } from './categorize';
import { containsKeywordFuzzy, fold } from './keywords';
import { parseSlip } from './parseSlip';
import { detectType } from './type';
import bench from '../../../tests/fixtures/slips/benchmark-results.json';

const TODAY = '2026-11-23';
const cat = (payee: string | null, text = payee ?? '') =>
  categorize({ type: 'expense', isSalary: false, payee, memo: null, text });

describe('fold() — matcher-only folding table (round 1)', () => {
  it.each([
    ['ลาซาด้า', 'ลาชาดา'],
    ['ช้อปปี้', 'ชอปปี'],
    ['บลูเพย์', 'ปลูเพย'],
    ['ชำระเงิน', 'ชำระเจิน'],
    ['ผัด ฝน', 'พัด ฟน'],
    ['SH0PEE', 'shopee'],
    ['LAZADA', 'lazada'],
    ['I1l|', 'llll'],
    ['rn', 'm'],
    ['ลูกชิ้น', 'ลูกชิน'],
  ])('%s → %s', (a, b) => expect(fold(a)).toBe(b));

  it('does NOT fold ด ↔ ต in round 1', () => {
    expect(fold('ด')).not.toBe(fold('ต'));
  });
});

describe('AC1: fuzzy Lazada → shopping', () => {
  it.each([
    'Lazada',
    'LAZADA',
    'ลาซาด้า',
    'ลาซาดา',
    'ลาชาดา',
    'LazPay',
    'ลาซาด้าเพย์',
    'บลูเพย์-ลาซาด้าเพย์',
    'บลูเพย-ลาชาดาเพย',
    'บลูเพย์',
  ])('%s', (t) => {
    expect(cat(t).category).toBe('shopping');
  });
});

describe('AC2: fuzzy Shopee → shopping; food brands still win', () => {
  it.each(['Shopee', 'SHOPEE', 'ช้อปปี้', 'ShopeePay', 'Shopee Pay', 'ช้อปปี้เพย์', 'ชอปปี', 'SH0PEE'])(
    '%s → shopping',
    (t) => expect(cat(t).category).toBe('shopping'),
  );
  it.each(['ShopeeFood', 'GrabFood', 'LINE MAN'])('%s → food (longest match)', (t) =>
    expect(cat(t).category).toBe('food'),
  );
  it('a folded match is reported as fuzzy', () => {
    expect(cat('ลาชาดา')).toMatchObject({ category: 'shopping', fuzzy: true });
    expect(cat('Lazada').fuzzy).toBeUndefined();
  });
});

describe('AC3: bounded — only flagged keywords, folded length ≥ 5, 0 false positives', () => {
  it('every fuzzy keyword is a keyword of the same rule and folds to ≥ 5 chars', () => {
    for (const r of CATEGORY_RULES)
      for (const k of r.fuzzy ?? []) {
        expect(r.keywords, k).toContain(k);
        expect([...fold(k).replace(/\s/g, '')].length, k).toBeGreaterThanOrEqual(5);
      }
  });

  it('a short keyword never matches fuzzily', () => {
    expect(containsKeywordFuzzy('ปาน', 'บ้าน')).toBe(false);
  });

  const NEGATIVES = [
    // 8 fake person names
    'นาย สมชาย ลาภดี',
    'น.ส. ลัดดา ชาญชัย',
    'นาง ซาร่า ปิยะดา',
    'นาย ช้อป ปิติ',
    'น.ส. ลาวัณย์ ซาดี',
    'MR. SHOPPER TEST',
    'MS. LARA ZADA',
    'นาย บุญลือ เพยาว์',
    // 8 other merchants
    'ร้านลาบซาดี',
    'ซาลาเปาทดสอบ',
    'ช็อปปิ้งพลาซ่าทดสอบ',
    'Lazy Cafe',
    'Shop Easy Test',
    'บลูสกาย ทดสอบ',
    'Shopper Mart Test',
    'สมาร์ทโฟนช็อปทดสอบ',
    // 4 Thai words close to ลาซาดา / ช้อปปี้ after folding
    'ลาชา',
    'ซาดา',
    'ช้อปปิ้ง',
    'ปีเตอร์ชอป',
  ];
  it.each(NEGATIVES)('negative: %s is not shopping/transport', (t) => {
    expect(['shopping', 'transport']).not.toContain(cat(t).category);
  });

  it('27 Layer B OCR texts: no fuzzy match at all', () => {
    for (const row of bench.rows) {
      const r = parseSlip(row.rawText, '2026-11-13');
      expect(r.categoryResult.fuzzy, row.file).toBeUndefined();
    }
  });
});

describe('AC4: fuzzy TRANSFER_STRONG restores High confidence', () => {
  it('"ชําระเจินสำเร็จ" → expense, rule transfer, High', () => {
    expect(detectType('ชําระเจินสำเร็จ\nจำนวน 50.00 บาท'.replace(/ํา/g, 'ำ'), true)).toMatchObject({
      type: 'expense',
      rule: 'transfer',
      confidence: 'high',
    });
  });
});

describe('AC5: OCR noise invariance', () => {
  const clean = [
    'ชำระเงินสำเร็จ',
    '14 พ.ย. 69 12:00 น.',
    'น.ส. ทดลอง ตัวอย่าง',
    'XXX-X-X1234-X',
    'บลูเพย์-ลาซาด้าเพย์',
    '0000123456789012345',
    'จำนวน:',
    '259.00 บาท',
  ].join('\n');
  const noisy = [
    '๐      —       ๐',
    'ชําระเจินสําเร็จ                      nae',
    '14 พ.ุย. 69 12:00 น.                     วแปสฟะ',
    'น.ส. ทดลอง ตัวอย่าง',
    'XXX-X-X1234-X',
    'J',
    'บลูเพย-ลาชาดาเพย          ซ% °°',
    '0000123456789012345     [=] ว [=]',
    'จำนวน:',
    '259.00 บาท        ig yer an',
  ].join('\n');
  it('type / amount / date / category equal the clean version', () => {
    const pick = (t: string) => {
      const r = parseSlip(t, TODAY);
      return { type: r.type, amount: r.amountSatang, date: r.date, category: r.categoryId };
    };
    expect(pick(noisy)).toEqual(pick(clean));
    expect(pick(clean)).toMatchObject({ category: 'shopping', amount: 25900, date: '2026-11-14' });
  });
});

describe('AC8: transport — Rabbit / บางกอก สมาร์ทการ์ด / BTS / MRT (BUG-014)', () => {
  it.each([
    'Rabbit',
    'แรบบิท',
    'บริษัท บางกอก สมาร์ทการ์ด ซิสเทม จำกัด',
    'บริษัท บางกอก สมาร์ทการ์ด ซิสแทม จำกัด',
    'บางกอก สมาร์ทการ์ด ซัส เทม',
    'Bangkok Smart Card System',
    'BTS',
    'MRT',
  ])('%s → transport', (t) => expect(cat(t).category).toBe('transport'));

  it.each([
    ['สมาร์ทช็อป ทดสอบ', 'other'],
    ['ร้านอาหาร แรบบิท', 'food'],
    ['Rabbit Hole Restaurant', 'food'],
    ['สมาร์ทการ์ดเกมทดสอบ', 'entertainment'],
    ['บางกอกทดสอบการค้า', 'other'],
  ])('negative: %s → %s', (t, want) => expect(cat(t).category).toBe(want));

  const REDACTED = import.meta.glob<string>('/tests/fixtures/real-slips/redacted/*.txt', {
    query: '?raw',
    import: 'default',
    eager: true,
  });
  it.each(['r05', 'r16'])('real slip %s (Rabbit top-up) → transport', (id) => {
    const r = parseSlip(REDACTED[`/tests/fixtures/real-slips/redacted/${id}.txt`]!, TODAY);
    expect(r.categoryId).toBe('transport');
  });
});
