/**
 * OMX-050a — merchant/biller outranks the transaction-type phrase ("จ่ายบิล/ชำระเงิน") + Thai
 * food keywords. Synthetic text (fake shops/names) + REDACTED real slips (fake names).
 */
import { TX_PHRASES, CATEGORY_RULES } from './categories.rules';
import { categorize } from './categorize';
import { parseSlip } from './parseSlip';

const TODAY = '2026-11-23';
const exp = (over: Partial<Parameters<typeof categorize>[0]>) =>
  categorize({ type: 'expense', isSalary: false, payee: null, memo: null, text: '', ...over });

/** K PLUS bill flow paying a grill-chicken shop (FB-011 description, synthetic). */
const BILL_FOOD = [
  'จ่ายบิลสำเร็จ',
  '14 พ.ย. 69 12:00 น.',
  'น.ส. ทดลอง ตัวอย่าง',
  'XXX-X-X1234-X',
  'V',
  'ร้านไก่ย่างทดสอบ',
  'TESTCHICKEN FOOD',
  '1234567890123456789',
  'จำนวน:',
  '89.00 บาท',
].join('\n');

describe('weak tier TX_PHRASES (AC2)', () => {
  it('lives in the rules file and "จ่ายบิล" is no longer a bills keyword', () => {
    expect(TX_PHRASES.map((p) => p.phrase)).toEqual(
      expect.arrayContaining(['จ่ายบิล', 'ชำระบิล', 'ชำระเงิน', 'โอนเงิน', 'Bill Payment', 'Payment']),
    );
    const bills = CATEGORY_RULES.find((r) => r.category === 'bills')!;
    expect(bills.keywords).not.toContain('จ่ายบิล');
  });

  it('a strong keyword anywhere beats the phrase', () => {
    expect(exp({ text: 'จ่ายบิลสำเร็จ\nร้านไก่ย่างทดสอบ' })).toMatchObject({
      category: 'food',
      field: 'text',
    });
  });

  it('payeeExtra (second biller line) is checked right after the payee', () => {
    expect(exp({ payee: 'ร้านทดสอบ', payeeExtra: 'TESTCHICKEN FOOD', text: 'จ่ายบิล' })).toMatchObject(
      { category: 'food', field: 'payeeExtra', confidence: 'high' },
    );
  });
});

describe('AC1: merchant over phrase', () => {
  it('bill flow + ไก่ย่าง + …FOOD → food, with payee from OMX-049', () => {
    const r = parseSlip(BILL_FOOD, TODAY);
    expect(r.payee).toBe('ร้านไก่ย่างทดสอบ');
    expect(r.categoryId).toBe('food');
  });

  it('… and with payee empty (match from text)', () => {
    const noAnchor = BILL_FOOD.replace('XXX-X-X1234-X\n', '');
    const r = parseSlip(noAnchor, TODAY);
    expect(r.payee).toBeNull();
    expect(r.categoryId).toBe('food');
  });
});

describe('AC3: real bills unchanged', () => {
  it.each(['การไฟฟ้านครหลวง', 'MEA', 'PEA', 'การประปานครหลวง', 'AIS', 'TrueMove'])(
    'จ่ายบิล + %s → bills High (payee)',
    (biller) => {
      expect(exp({ payee: biller, text: `จ่ายบิลสำเร็จ\n${biller}` })).toMatchObject({
        category: 'bills',
        confidence: 'high',
      });
    },
  );

  it('"จ่ายบิล" alone (no payee) → bills Medium (expected change, was High-ranked text match)', () => {
    expect(exp({ text: 'จ่ายบิลสำเร็จ\nจำนวน 100.00 บาท' })).toMatchObject({
      category: 'bills',
      confidence: 'medium',
      field: 'weak',
    });
    expect(exp({ text: 'Bill Payment successful' })).toMatchObject({ category: 'bills' });
  });

  it('a known non-biller payee + "จ่ายบิล" → not bills (K PLUS merchant via bill flow)', () => {
    expect(exp({ payee: 'ร้านทดสอบ (ทดลอง)', text: 'จ่ายบิลสำเร็จ\nร้านทดสอบ (ทดลอง)' })).toMatchObject({
      category: 'other',
      confidence: 'low',
    });
  });

  it('"ชำระเงิน" / "โอนเงิน" alone never pick a category', () => {
    expect(exp({ text: 'ชำระเงินสำเร็จ' }).category).toBe('other');
    expect(exp({ text: 'โอนเงินสำเร็จ' }).category).toBe('other');
  });
});

describe('AC4 / AC10b: Thai food keywords', () => {
  it.each([
    'ไก่ย่าง',
    'ไก่ทอด',
    'หมูปิ้ง',
    'ข้าวมันไก่',
    'ข้าวขาหมู',
    'ก๋วยจั๊บ',
    'ราดหน้า',
    'ผัดไทย',
    'ร้านข้าว',
    'ShopeeFood',
    'ก๋วยเตี๋ยว',
    'ก๋วยเตียว',
    'ลูกชิ้น',
  ])('%s → food', (k) => {
    expect(exp({ payee: `ร้าน${k}ทดสอบ`, text: '' }).category).toBe('food');
  });

  it('"ครัว" is not a food keyword (R5)', () => {
    expect(exp({ payee: 'ครัวทดสอบ', text: '' }).category).toBe('other');
  });

  it.each(['นาขวัญ ฟาร์มสุข', 'สวนนายเฒ่า'])('BUG-006 guard: %s stays other', (name) => {
    expect(exp({ payee: name, text: name }).category).toBe('other');
  });
});

const REDACTED = import.meta.glob<string>('/tests/fixtures/real-slips/redacted/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const real = (id: string) =>
  parseSlip(REDACTED[`/tests/fixtures/real-slips/redacted/${id}.txt`]!, TODAY);

describe('AC10: real K PLUS "จ่ายบิล" slips (redacted)', () => {
  it('none of r03, r06, r09, r10 is bills (baseline 4/4)', () => {
    for (const id of ['r03', 'r06', 'r09', 'r10'])
      expect(real(id).categoryId, id).not.toBe('bills');
  });

  it('r03 (ก๋วยเตียวเรือ…) → food; r10 (temple donation) → other', () => {
    expect(real('r03').categoryId).toBe('food');
    expect(real('r10').categoryId).toBe('other');
  });
});
