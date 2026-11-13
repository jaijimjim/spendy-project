/**
 * Layer A — QA golden OCR-text fixtures (R7, QA-owned). Extends Dev's starter set (ocrText.ts).
 *  - "qa-*": hand-crafted edge cases from the QA grooming review (precedence, dd/mm, BE/CE,
 *    exclusions, OCR noise observed in real Tesseract output).
 *  - "rec-*": RECORDED raw Tesseract output from the built app on the Layer B synthetic slips
 *    (tests/fixtures/slips), captured by tests/e2e/benchmark.real-ocr.spec.ts on 2026-11-13.
 *    Re-record when Tesseract version / preprocessing changes.
 * `knownBug` lists open defects that make the case fail today (asserted with it.fails).
 * No real personal data. today = 2026-11-13 (Asia/Bangkok).
 */
import type { CategoryId, TxType } from '../../types';

export interface QaFixture {
  id: string;
  text: string;
  expected: {
    type: TxType;
    category: CategoryId;
    amountSatang: number | null;
    /** null ⇒ no acceptable date on the slip (parser falls back to today + flags.noDate) */
    date: string | null;
    time?: string | null;
  };
  knownBug: string[];
}

export const QA_FIXTURES: QaFixture[] = [
  {
    id: 'qa-salary-vs-transfer-conflict',
    text: 'สลิปเงินเดือน\nบริษัท ทดสอบ จำกัด\nเงินเดือน 30,000.00\nรายได้รวม 31,000.00\nรายการหัก 1,000.00\nเงินได้สุทธิ 30,000.00\nวันที่จ่าย 25/10/2569\nโอนเงินสำเร็จ เข้าบัญชี xxx-x-x5678-x',
    expected: {
      type: 'income',
      category: 'salary',
      amountSatang: 3000000,
      date: '2026-10-25',
    },
    knownBug: [],
  },
  {
    id: 'qa-transfer-memo-mentions-salary',
    text: 'โอนเงินสำเร็จ\n10 พ.ย. 69 10:00 น.\nไปยัง\nนาง มาลี ดีใจ\nจำนวนเงิน 9,000.00 บาท\nบันทึกช่วยจำ ค่าแรงแม่บ้าน',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 900000,
      date: '2026-11-10',
    },
    knownBug: [],
  },
  {
    id: 'qa-grab-ride-not-food',
    text: 'Transfer successful\n10 Nov 2026 08:15\nTo\nGRAB\nAmount 1,250.50 THB\nFee 0.00 THB',
    expected: {
      type: 'expense',
      category: 'transport',
      amountSatang: 125050,
      date: '2026-11-10',
    },
    knownBug: [],
  },
  {
    id: 'qa-grab-food-spaced',
    text: 'โอนเงินสำเร็จ\n13 พ.ย. 69 12:00 น.\nไปยัง\nGrab Food\nจำนวนเงิน 189.00 บาท',
    expected: {
      type: 'expense',
      category: 'food',
      amountSatang: 18900,
      date: '2026-11-13',
    },
    knownBug: [],
  },
  {
    id: 'qa-cafe-amazon-beats-ptt',
    text: 'ชำระเงินสำเร็จ\n11/11/2569 07:45\nไปยัง\nCafe Amazon สาขา PTT วิภาวดี\nยอดชำระ 65.00 บาท',
    expected: {
      type: 'expense',
      category: 'food',
      amountSatang: 6500,
      date: '2026-11-11',
    },
    knownBug: [],
  },
  {
    id: 'qa-ddmm-not-mmdd',
    text: 'ชำระเงินสำเร็จ\n01/11/2569 10:05\nไปยัง\nAIS Fibre\nจำนวนเงิน 599.00 บาท',
    expected: {
      type: 'expense',
      category: 'bills',
      amountSatang: 59900,
      date: '2026-11-01',
    },
    knownBug: [],
  },
  {
    id: 'qa-company-never-person',
    text: 'โอนเงินสำเร็จ\n05/11/2569 09:00\nไปยัง\nบริษัท สมมติ จำกัด\nจำนวนเงิน 1,000.00 บาท',
    expected: {
      type: 'expense',
      category: 'other',
      amountSatang: 100000,
      date: '2026-11-05',
    },
    knownBug: [],
  },
  {
    id: 'qa-balance-and-fee-excluded',
    text: 'โอนเงินสำเร็จ\n12 พ.ย. 69 09:00 น.\nไปยัง\nน.ส. สมใจ ใจดี\nค่าธรรมเนียม 25.00 บาท\nยอดเงินคงเหลือ 12,345.67 บาท\nจำนวนเงิน 300.00 บาท',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 30000,
      date: '2026-11-12',
    },
    knownBug: [],
  },
  {
    id: 'qa-thai-digits-amount',
    text: 'โอนเงินสำเร็จ\n๑๒ พ.ย. ๖๙ ๐๙:๑๒ น.\nไปยัง\nนาย ก ข\nจำนวนเงิน ๑,๒๕๐.๐๐ บาท',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 125000,
      date: '2026-11-12',
    },
    knownBug: [],
  },
  {
    id: 'qa-future-date-falls-back',
    text: 'โอนเงินสำเร็จ\n14/11/2569 10:00\nไปยัง\nนาย ก ข\nจำนวนเงิน 100.00 บาท',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 10000,
      date: null,
    },
    knownBug: [],
  },
  {
    id: 'qa-older-than-5y-falls-back',
    text: 'โอนเงินสำเร็จ\n12/11/2564 10:00\nไปยัง\nนาย ก ข\nจำนวนเงิน 100.00 บาท',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 10000,
      date: null,
    },
    knownBug: [],
  },
  {
    id: 'qa-leap-day-2567',
    text: 'โอนเงินสำเร็จ\n29 ก.พ. 2567 10:00\nไปยัง\nนาย ก ข\nจำนวนเงิน 100.00 บาท',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 10000,
      date: '2024-02-29',
    },
    knownBug: [],
  },
  {
    id: 'qa-impossible-date-31-11',
    text: 'โอนเงินสำเร็จ\n31/11/2569 10:00\nไปยัง\nนาย ก ข\nจำนวนเงิน 100.00 บาท',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 10000,
      date: null,
    },
    knownBug: [],
  },
  {
    id: 'qa-received-income',
    text: 'ได้รับเงินโอน\n8 พ.ย. 69 18:20 น.\nจาก\nนาย ประหยัด มีสุข\nจำนวนเงิน 3,000.00 บาท',
    expected: {
      type: 'income',
      category: 'other_income',
      amountSatang: 300000,
      date: '2026-11-08',
    },
    knownBug: [],
  },
  {
    id: 'qa-month-end-2359',
    text: 'โอนเงินสำเร็จ\n31/10/2569 23:59\nไปยัง\nบริษัท สุขสบาย แมนชั่น จำกัด\nจำนวนเงิน 8,500.00 บาท\nบันทึกช่วยจำ ค่าเช่าห้อง',
    expected: {
      time: '23:59',
      type: 'expense',
      category: 'housing',
      amountSatang: 850000,
      date: '2026-10-31',
    },
    knownBug: [],
  },
  {
    id: 'qa-salary-en-period-only',
    text: 'PAYSLIP\nOmni Test Co., Ltd.\nPay period: October 2026\nGross Pay 52,000.00\nNet Pay 49,350.75',
    expected: {
      type: 'income',
      category: 'salary',
      amountSatang: 4935075,
      date: '2026-10-31',
    },
    knownBug: [],
  },
  {
    id: 'qa-ocr-month-pui-2digit',
    text: 'โอนเงินสำเร็จ\n12 พุย. 69 09:12 น.\nไปยัง\nน.ส. สมใจ ใจดี\nจำนวนเงิน 1,500.00 บาท',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 150000,
      date: '2026-11-12',
    },
    knownBug: ['BUG-001'],
  },
  {
    id: 'qa-ocr-month-pui-4digit',
    text: 'โอนเงินสำเร็จ\n13 พุย. 2569 14:35 u.\nไปยัง\nGrabFood\nจำนวนเงิน 245.00 บาท',
    expected: {
      type: 'expense',
      category: 'food',
      amountSatang: 24500,
      date: '2026-11-13',
    },
    knownBug: ['BUG-001'],
  },
  {
    id: 'qa-ocr-month-pdotui',
    text: 'โอนเงินสำเร็จ\n7 พ.ุย. 69 12:00 u.\nไปยัง\nน.ส. สมใจ ใจดี\nจำนวนเงิน 2,000.00 บาท',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 200000,
      date: '2026-11-07',
    },
    knownBug: ['BUG-001'],
  },
  {
    id: 'qa-ocr-prefix-noise-nai',
    text: 'โอนเงินสำเร็จ\n9 พ.ย. 69 21:10 น.\nไปยัง\nแนายข ทดสอบ ระบบ\nจำนวนเงิน 10.00 บาท',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 1000,
      date: '2026-11-09',
    },
    knownBug: ['BUG-006'],
  },
  {
    id: 'rec-b01-transfer-th-person',
    text: 'BB  ธนาคารออมนิทดสอบ\n—    ๐    เซ\nโอแนเงินสําเร็จ\n12 พุย. 69 09:12 น.\nจาก\nแนายข ทดสอบ ระบบ\nธนาคารออมนแทดสอบ\n2๐๐-%-%1234-%\nไปยัง\nน.ส. สมใจ ใจดี\nXXX-X-X9876-X\nจํานวนเงิน               1,500.00 บาท\nค่าธรรมเนียม                                0.00 บาท\nเลขที่รายการ           016312091233ABC1001\nสลิปทดสอบสังเคราะห์ (synthetic test slip) - ไม่ใช่เอกสารจริง',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 150000,
      date: '2026-11-12',
      time: '09:12',
    },
    knownBug: ['BUG-001'],
  },
  {
    id: 'rec-b02-transfer-th-grabfood-balance',
    text: '| )  ธนาคารฟ้าใสทดสอบ\n—    ๐   เซ\nโอแนเงินสําเร็จ\n13 พุย. 2569 14:35 u.\nจาก\nนแนายข ทดสอบ ระบบ\nธนาคารฟ้าใสทดสอบ\n2๐๐-%-%1234-%\nไปยัง\nGrabFood\nบริษัท แกร็บ ทดสอบ\nจํานวนเงิน                   245.00 บาท\nค่าธรรมเนียม                                0.00 บาท\nยอดเงินคงเหลือ                     12,345.67 บาท\nเลขที่รายการ           016317143512ABC0778\nสลิปทดสอบสังเคราะห์ (synthetic test slip) - ไม่ใช่เอกสารจริง',
    expected: {
      type: 'expense',
      category: 'food',
      amountSatang: 24500,
      date: '2026-11-13',
      time: '14:35',
    },
    knownBug: ['BUG-001'],
  },
  {
    id: 'rec-b03-transfer-en-grab-ride',
    text: 'รศสัพพฆ้ัโ้ัั้น้ัััโโ้ั็โโ๊์-์--------\n๑ Omni Test Bank\nTransfer successful\n10 Nov 2026 08:15\nFrom\nMR. TEST SYSTEM\nXXX-X-X1234-x\nTo\nGRAB\nRide payment\nAmount                      1,250.50 THB\nFee                                          0.00 THB\nRef no.                       2026111008150001\nSynthetic test slip — not a real document',
    expected: {
      type: 'expense',
      category: 'transport',
      amountSatang: 125050,
      date: '2026-11-10',
      time: '08:15',
    },
    knownBug: [],
  },
  {
    id: 'rec-b04-qr-cafe-amazon',
    text: '| |  ธนาคารออมนิทดสอบ\n๐       —    ๐    เซ่\nชาระเงแสาเรจ\n11/11/2569 07:45\nไปยัง\nCafé Amazon สาขา PTT วิภาวดี\nร้านค้า 08\nยอดชําระ                      65.00 บาท\nเลขที่รายการ                  QR20261111074500\nสลิปทดสอบสังเคราะห์ (synthetic test slip)',
    expected: {
      type: 'expense',
      category: 'food',
      amountSatang: 6500,
      date: '2026-11-11',
      time: '07:45',
    },
    knownBug: [],
  },
  {
    id: 'rec-b05-bill-electricity',
    text: 'BB  ธนาคารฟ้าใสทดสอบ\n\nจ่ายบิลสําเร็จ\n\n12 พุย. 69 19:40 u.\n\nผู้ให้บริการ\n\nการไฟฟ้าแครหลวง\n\nค่าไฟฟ้า\n\nรหัสลูกคํา                                 0123456789\nจํานวนเงิน               1,385.00 บาท\nค่าธรรมเนียม                                0.00 บาท\nเลขที่รายการ              BP2026111219400012\nสลิปทดสอบสังเคราะห์ (synthetic test slip)',
    expected: {
      type: 'expense',
      category: 'bills',
      amountSatang: 138500,
      date: '2026-11-12',
      time: '19:40',
    },
    knownBug: ['BUG-001'],
  },
  {
    id: 'rec-b06-bill-internet-ddmm',
    text: '| )  ธนาคารออมนิทดสอบ\n\nชําระเงินสําเร็จ\n\n01/11/2569 10:05\n\nผู้ให้บริการ\n\nAIS Fibre\n\nค่าอินเทอร์เน็ตรายเดือน\n\nรหัสลูกคํา                               8800123456\nจํานวนเงิน                   599.00 บาท\nค่าธรรมเนียม                                0.00 บาท\nเลขที่รายการ             BP2026110110050044\nสลิปทดสอบสังเคราะห์ (synthetic test slip)',
    expected: {
      type: 'expense',
      category: 'bills',
      amountSatang: 59900,
      date: '2026-11-01',
      time: '10:05',
    },
    knownBug: [],
  },
  {
    id: 'rec-b07-received-th',
    text: 'BB  ธนาคารออมนิทดสอบ\nเซ   —\nได้รับเงินโอน\n8 พุย. 69 18:20 u.\nจาก\nนาย ประหยัด มีสุข\nธนาคารฟ้าใสทดสอบ\nXXX-X-X4455-x\nไปยัง\nแนายข ทดสอบ ระบบ\n2๐๐-%-%1234-%\nจํานวนเงิน               3,000.00 บาท\nค่าธรรมเนียม                                0.00 บาท\nเลขที่รายการ           016308182033ABC2002\nสลิปทดสอบสังเคราะห์ (synthetic test slip) - ไม่ใช่เอกสารจริง',
    expected: {
      type: 'income',
      category: 'other_income',
      amountSatang: 300000,
      date: '2026-11-08',
      time: '18:20',
    },
    knownBug: ['BUG-001'],
  },
  {
    id: 'rec-b08-received-looks-like-sender',
    text: '| )  ธนาคารฟ้าใสทดสอบ\n—    ๐    เซ\nโอแนเงินสําเร็จ\n7 พ.ุย. 69 12:00 u.\nจาก\nนาง มานีรักเรียน\nธนาคารฟ้าใสทดสอบ\n2๐๐๐>%-%7777-%\nไปยัง\nนแนายข ทดสอบ ระบบ\n2๐๐-%-%1234-%\nจํานวนเงิน               2,000.00 บาท\nค่าธรรมเนียม                                0.00 บาท\nเลขที่รายการ           016307120011ABC3003\nสลิปทดสอบสังเคราะห์ (synthetic test slip) - ไม่ใช่เอกสารจริง',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 200000,
      date: '2026-11-07',
      time: '12:00',
    },
    knownBug: ['BUG-001', 'BUG-006'],
  },
  {
    id: 'rec-b09-transfer-company-rent-month-end',
    text: '| )  ธนาคารออมนิทดสอบ\n—    ๐    [~]\nโอแนเงินสําเร็จ\n31/10/2569 23:59\nจาก\nแนายข ทดสอบ ระบบ\nธนาคารออมนแทดสอบ\nXXX-X-x1234-X\nไปยัง\nบริษัท สุขสบาย แมนชั้น จํากัด\nXXX-X-x2020-x\nจํานวนเงิน               8,500.00 บาท\nค่าธรรมเนียม                                0.00 บาท\nบันทึกช่วยจํา                          ค่าเช่าห้อง พ.ย.\nเลขที่รายการ           016231235911ABC4004\nสลิปทดสอบสังเคราะห์ (synthetic test slip) - ไม่ใช่เอกสารจริง',
    expected: {
      type: 'expense',
      category: 'housing',
      amountSatang: 850000,
      date: '2026-10-31',
      time: '23:59',
    },
    knownBug: [],
  },
  {
    id: 'rec-b10-salary-th-table',
    text: 'สลิปเงินเดือน\n\nบริษัท ทดสอบซอฟต์แวร์ จํากัด\n\nชื่อพนักงาน: นาย ทดสอบ ระบบ - รหัส E-0042\n\nงวดเดือน ตุลาคม 2569\n\nรายได้                                     จําแนวน (บาท)\nเงินเดือน                                        45,000.00\nค่าล่วงเวลา                                       3,500.00\nรายได้รวม                                      48,500.00\nรายการหัก\n\nประกันสังคม                                        750.00\nภาษีหัก ณ ที่จ่าย                                1,550.00\nรวมรายการหัก                                  2,300.00\nเงินได้สุทธิ                             46,200.00\nวันที่จ่าย                                   25/10/2569\nโอนเข้าบัญชี                           XXX-X-X1234-x',
    expected: {
      type: 'income',
      category: 'salary',
      amountSatang: 4620000,
      date: '2026-10-25',
      time: null,
    },
    knownBug: [],
  },
  {
    id: 'rec-b11-salary-en-two-column',
    text: 'PAYSLIP\n\nOmni Test Co., Ltd.\n\nEmployee: Test System (E-0042)\n\nPay period: October 2026\n\nEarnings            THe Deductions         THB\nSocial\n\nBasic Salary 50,000.00    Security          750.00\n\nOvertime       2,000.00 Withholding . ๑2๐ 25\nTax               ’\n\nGross Pay 52,000.00 าเลแ           2 649.25\n\nNet Pay                           49,350.75',
    expected: {
      type: 'income',
      category: 'salary',
      amountSatang: 4935075,
      date: '2026-10-31',
      time: null,
    },
    knownBug: [],
  },
  {
    id: 'rec-b12-transfer-th-xss-memo',
    text: 'BB  ธนาคารออมนิทดสอบ\n—    ๐    เซ\nโอแนเงินสําเร็จ\n9 พุย. 69 21:10 u.\nจาก\nแนายข ทดสอบ ระบบ\nธนาคารออมนแทดสอบ\n2๐๐-%-%1234-%\nไปยัง\nแนาขกถก ทดสอบ\n2๐«๐>%- 1111-%\nจํานวนเงิน                     10.00 บาท\nค่าธรรมเนียม                                0.00 บาท\nบันทึกช่วยจํา      <img รห๐=% onerror=alert(1)>\nเลขที่รายการ           016309211044ABC5005\nสลิปทดสอบสังเคราะห์ (synthetic test slip) - ไม่ใช่เอกสารจริง',
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 1000,
      date: '2026-11-09',
      time: '21:10',
    },
    knownBug: ['BUG-001', 'BUG-006'],
  },
];
