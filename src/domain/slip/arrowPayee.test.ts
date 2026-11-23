/**
 * OMX-049 — payee under the arrow (↓ / ⋮) without a "ไปยัง/To" label (make by KBank, K PLUS,
 * Krungthai). Synthetic fixtures use FAKE names/banks/accounts only; real-slip rows read the
 * committed REDACTED OCR text (tests/fixtures/real-slips/redacted, fake names).
 */
import { extractArrowPayee, sameNameFuzzy } from './arrowPayee';
import { normalizeText, toColumnLines, toLines } from './normalize';
import { parseSlip } from './parseSlip';
import { payeeMatches } from './payeeMetrics';

const TODAY = '2026-11-23';
const cols = (raw: string) => toColumnLines(raw);

/** make by KBank / K PLUS style transfer to a person (S1). */
const S1 = [
  'โอนเงินสำเร็จ',
  '14 พ.ย. 69 10:20 น.',
  'น.ส. ทดลอง ตัวอย่าง',
  'ธ.ออมนิทดสอบ',
  'XXX-X-X1234-X',
  '↓',
  'นาย สมมุติ ใจงาม',
  'ธ.ฟ้าใสทดสอบ',
  'XXX-X-X9876-X',
  'จำนวน:',
  '150.00 บาท',
].join('\n');

/** K PLUS bill payment to a restaurant with a second biller line (S2, AC3). */
const S2 = [
  'จ่ายบิลสำเร็จ',
  '14 พ.ย. 69 12:00 น.',
  'น.ส. ทดลอง ตัวอย่าง',
  'ธ.ออมนิทดสอบ',
  'XXX-X-X1234-X',
  'V',
  'ร้านไก่ย่างทดสอบ',
  'TESTCHICKEN FOOD',
  '1234567890123456789',
  'จำนวน:',
  '89.00 บาท',
].join('\n');

describe('toColumnLines (left column split)', () => {
  it('keeps line alignment with toLines(normalizeText()) and marks wide gaps', () => {
    const raw = 'ก\n\n   \nนาย ก ข                 ๑๑\nX  Y';
    const a = toLines(normalizeText(raw));
    const b = cols(raw);
    expect(b).toHaveLength(a.length);
    expect(b[1]).toBe('นาย ก ข│11');
    expect(b[2]).toBe('X Y');
  });
});

describe('extractArrowPayee — synthetic (fake data)', () => {
  it('S1: first name-like line after the sender masked account; arrow skipped (AC1)', () => {
    const r = extractArrowPayee(cols(S1));
    expect(r.payee).toBe('นาย สมมุติ ใจงาม');
    expect(r.payeeExtra).toBeNull();
    expect(r.account).toBe('XXX-X-X9876-X');
  });

  it('S2: merchant line is payee as OCR’d; biller line → payeeExtra; Biller ID never payee (AC3)', () => {
    const r = extractArrowPayee(cols(S2));
    expect(r.payee).toBe('ร้านไก่ย่างทดสอบ');
    expect(r.payeeExtra).toBe('TESTCHICKEN FOOD');
  });

  it.each([
    ['×××-×-×1234-×'],
    ['xxx - x - x1234 - x'],
    ['XXX–X–X1234–X'],
    ['XXX—X—X1234—X'],
    ['***-*-*1234-*'],
    ['2๐๐-%-%1234-%'],
    ['2๐๐๐%-%1234-%'],
    ['XXX=-X-XXXXXX1234-x'],
    ['J   XXX-X-X1234-X            ว ค'],
  ])('AC2: anchor tolerates OCR mask variant %s', (mask) => {
    const raw = ['ชำระเงินสำเร็จ', 'น.ส. ทดลอง ตัวอย่าง', mask, 'ร้านทดสอบดี', 'XXX-X-X9999-X'].join(
      '\n',
    );
    expect(extractArrowPayee(cols(raw)).payee).toBe('ร้านทดสอบดี');
  });

  it.each([[['↓']], [['J', '|']], [['+', 'oy', '(ๆ']], [['[=] ว [=]']]])(
    'AC2: skips up to 3 junk lines %j',
    (junk) => {
      const raw = ['ชำระเงินสำเร็จ', 'XXX-X-X1234-X', ...junk, 'ร้านทดสอบดี'].join('\n');
      expect(extractArrowPayee(cols(raw)).payee).toBe('ร้านทดสอบดี');
    },
  );

  it('AC2: more than 3 junk lines → no guess', () => {
    const raw = ['ชำระเงินสำเร็จ', 'XXX-X-X1234-X', '|', '+', 'V', 'J', 'ร้านทดสอบดี'].join('\n');
    expect(extractArrowPayee(cols(raw)).payee).toBeNull();
  });

  it('strips leading junk tokens / logo and the right-column noise', () => {
    const raw = [
      'เติมเงินสำเร็จ',
      'XXX-X-X1234-X',
      '๐9 ถุงเงิน (ร้านทดสอบ) |',
      '0000123456789012345',
    ].join('\n');
    expect(extractArrowPayee(cols(raw)).payee).toBe('ถุงเงิน (ร้านทดสอบ)');
    const raw2 = ['XXX-X-X1234-X', 'oy   ร้านทดสอบดี            ซ% °°', 'XXX-X-X9999-X'].join('\n');
    expect(extractArrowPayee(cols(raw2)).payee).toBe('ร้านทดสอบดี');
    const raw3 = ['XXX-X-X1234-X', '(G)    เติมเงิน Test-Wallet', '(TEST-WALLET)'].join('\n');
    const r3 = extractArrowPayee(cols(raw3));
    expect(r3.payee).toBe('เติมเงิน Test-Wallet');
    expect(r3.payeeExtra).toBe('(TEST-WALLET)');
  });

  it('keeps a short UPPERCASE brand as the first word (not junk)', () => {
    const raw = ['XXX-X-X1234-X', 'MK ทดสอบสาขา', 'XXX-X-X9999-X'].join('\n');
    expect(extractArrowPayee(cols(raw)).payee).toBe('MK ทดสอบสาขา');
  });

  it('joins a wrapped company name / Latin merchant / "สาขา" continuation', () => {
    const company = ['XXX-X-X1234-X', 'บริษัท ทดสอบ การ์ด', '«๕2» ซิสเต็ม จำกัด', '0000123456789012345'];
    expect(extractArrowPayee(cols(company.join('\n'))).payee).toBe('บริษัท ทดสอบ การ์ด ซิสเต็ม จำกัด');
    const latin = [
      'XXX-X-X1234-X',
      'TESTPAY_MALL PLAZA      ๑',
      'ONLINE          พจ',
      'XXX-X-X9999-X',
    ];
    expect(extractArrowPayee(cols(latin.join('\n'))).payee).toBe('TESTPAY_MALL PLAZA ONLINE');
    const branch = ['XXX-X-X1234-X', 'ร้านทดสอบ สาขา “       oe', 'บางทดสอบ', 'XXX-X-X9999-X'];
    expect(extractArrowPayee(cols(branch.join('\n'))).payee).toBe('ร้านทดสอบ สาขาบางทดสอบ');
  });

  it('a bank line after the payee is not payeeExtra; a bank line is never the payee', () => {
    const r = extractArrowPayee(cols(S1));
    expect(r.payeeExtra).toBeNull();
    const raw = ['XXX-X-X1234-X', 'ธ.ฟ้าใสทดสอบ', 'XXX-X-X9999-X'].join('\n');
    expect(extractArrowPayee(cols(raw)).payee).toBeNull();
  });

  it('AC4: sender name is never returned (OCR-distorted owner name)', () => {
    const raw = [
      'โอนเงินสำเร็จ',
      'O) ทดลึองชัย ต',
      '2๐๐๐%-%1234-%',
      'dD ทดลองชัย ตัวอย่างดี          Se °°',
      'XXX-X-X7742-x',
    ].join('\n');
    expect(extractArrowPayee(cols(raw)).payee).toBeNull();
  });

  it('AC4: no anchor → no guess', () => {
    const raw = ['ชำระเงินสำเร็จ', '14 พ.ย. 69', 'ร้านทดสอบดี', 'จำนวน 50.00 บาท'].join('\n');
    expect(extractArrowPayee(cols(raw)).payee).toBeNull();
  });

  it('stops at the amount label / reference id', () => {
    const raw = ['XXX-X-X1234-X', 'จำนวน:', '50.00 บาท'].join('\n');
    expect(extractArrowPayee(cols(raw)).payee).toBeNull();
    const raw2 = ['XXX-X-X1234-X', 'MOO0B7631641799915731', 'ร้านทดสอบดี'].join('\n');
    expect(extractArrowPayee(cols(raw2)).payee).toBeNull();
  });

  it('sameNameFuzzy tolerates OCR vowel/extra-glyph noise but not different names', () => {
    expect(sameNameFuzzy('ทดลึองชัยต', 'ทดลองชัย ตัวอย่างดี')).toBe(true);
    expect(sameNameFuzzy('น.ส. ทดลองชัย ต', 'ทดลองแชัยต')).toBe(true);
    expect(sameNameFuzzy('ทดลองชัย', 'สมมุติ ใจงาม')).toBe(false);
    expect(sameNameFuzzy('ก', 'ก')).toBe(false); // too short to judge
  });
});

describe('parseSlip with the arrow layout', () => {
  it('S1: payee + payeeSource arrow + transfer to a person (BUG-014 r01/r02 pattern)', () => {
    const r = parseSlip(S1, TODAY);
    expect(r.payee).toBe('นาย สมมุติ ใจงาม');
    expect(r.payeeSource).toBe('arrow');
    expect(r.categoryId).toBe('transfer');
  });

  it('S2: payeeExtra exposed for the categorizer; displayed payee not appended', () => {
    const r = parseSlip(S2, TODAY);
    expect(r.payee).toBe('ร้านไก่ย่างทดสอบ');
    expect(r.payeeExtra).toBe('TESTCHICKEN FOOD');
  });

  it('AC5: the label rule runs first and wins', () => {
    const raw = [
      'โอนเงินสำเร็จ',
      'XXX-X-X1234-X',
      'ร้านผิด',
      'ไปยัง',
      'น.ส. ถูก ต้อง',
      'XXX-X-X9999-X',
    ].join('\n');
    const r = parseSlip(raw, TODAY);
    expect(r.payee).toBe('น.ส. ถูก ต้อง');
    expect(r.payeeSource).toBe('label');
  });

  it('AC4: received / salary slips never use the arrow fallback', () => {
    const received = [
      'รับเงินสำเร็จ',
      'นาย ผู้ส่ง ทดสอบ',
      'XXX-X-X5555-X',
      'นาย ทดสอบ ระบบ',
      'XXX-X-X1234-X',
    ];
    const r = parseSlip(received.join('\n'), TODAY);
    expect(r.type).toBe('income');
    expect(r.payeeSource).not.toBe('arrow');
    expect(r.payee).toBeNull();
  });

  it('no payee found → payee null, payeeSource null, flags.noPayee true for expenses only', () => {
    const r = parseSlip('ชำระเงินสำเร็จ\nจำนวน 50.00 บาท', TODAY);
    expect(r.payee).toBeNull();
    expect(r.payeeSource).toBeNull();
    expect(r.flags.noPayee).toBe(true);
    const salary = parseSlip('สลิปเงินเดือน\nเงินได้สุทธิ 1,000.00', TODAY);
    expect(salary.flags.noPayee).toBe(false);
  });
});

// ---- Real slips (redacted OCR text, fake names) — OMX-049 AC10 per-slip expectations ----
const REDACTED = import.meta.glob<string>('/tests/fixtures/real-slips/redacted/*.txt', {
  query: '?raw',
  import: 'default',
  eager: true,
});
const real = (id: string) => REDACTED[`/tests/fixtures/real-slips/redacted/${id}.txt`]!;

describe('real slips (redacted) — payee', () => {
  it.each([
    ['r01', 'นายชัยพร ดำเนิน'],
    ['r02', 'น.ส. วิมลรัตน์ บุญมีศรีสุข'],
    ['r03', 'ถุงเงิน (ก๋วยเตียวเรือธิดาสมุทร)'],
    ['r04', 'ฮิปโป เซอร์วิส เซ็นเตอร์'],
    ['r06', 'TrueMoney Shop (นัวสะเด็ด)'],
    ['r07', '1โโธ(นาง วันวิสา sampong)'],
    ['r10', 'ถุงเงิน เติมบุญ (วัดกลางเกร็ด)'],
    ['r11', 'KSHER_SIAM PARAGON ONLINE'],
    ['r12', 'AMELIA HOME'],
    ['r13', 'เติมเงิน G-Wallet'],
    ['r14', 'วิสาหกิจชุมชนท่องเที่ยว'],
  ])('%s → %s', (id, payee) => {
    const r = parseSlip(real(id), TODAY);
    expect(payeeMatches(r.payee, payee), `got "${r.payee}"`).toBe(true);
    expect(r.payeeSource).toBe('arrow');
  });

  it('r08 (own account at another bank): sender guard keeps payee empty (AC4/AC10)', () => {
    expect(parseSlip(real('r08'), TODAY).payee).toBeNull();
  });

  it('never returns the account owner (sender) as payee on any real slip', () => {
    for (const id of Object.keys(REDACTED)) {
      const p = parseSlip(REDACTED[id]!, TODAY).payee ?? '';
      expect(/ปร[ีึ]ยาแ?นุช/.test(p), `${id}: ${p}`).toBe(false);
    }
  });

  it('r01/r02 (transfer to a person) → category transfer once payee is found (BUG-014)', () => {
    expect(parseSlip(real('r01'), TODAY).categoryId).toBe('transfer');
    expect(parseSlip(real('r02'), TODAY).categoryId).toBe('transfer');
  });
});
