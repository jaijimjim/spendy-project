/**
 * Layer A starter set — synthetic OCR-text fixtures (no real personal data).
 * QA owns the golden set (R7); these cover each bank layout, salary slips, received slips,
 * OCR noise and conflict cases so parser tests run in CI. Expected values per OMX-006/007/008/010.
 * "today" for all cases = 2026-11-13 (Asia/Bangkok).
 */
import type { CategoryId, TxType } from '../../types';

export interface OcrFixture {
  id: string;
  text: string;
  expected: {
    type: TxType;
    category: CategoryId;
    amountSatang: number | null;
    date: string | null; // null ⇒ not found (falls back to today)
    time?: string | null;
    payee?: string | null;
    bank?: string | null;
    refNo?: string | null;
  };
}

export const FIXTURE_TODAY = '2026-11-13';

export const OCR_FIXTURES: OcrFixture[] = [
  {
    id: 'kplus-food-grabfood',
    text: `K+ โอนเงินสำเร็จ
13 พ.ย. 69 14:35 น.
นาย สมชาย ใจดี
ธ.กสิกรไทย
xxx-x-x1234-x
ไปยัง
GrabFood
บริษัท แกร็บ ไทย
จำนวน:
245.00 บาท
ค่าธรรมเนียม:
0.00 บาท
เลขที่รายการ:
015317143512ABC07788`,
    expected: {
      type: 'expense',
      category: 'food',
      amountSatang: 24500,
      date: '2026-11-13',
      time: '14:35',
      payee: 'GrabFood',
      bank: 'kplus',
      refNo: '015317143512ABC07788',
    },
  },
  {
    id: 'kplus-person-transfer',
    text: `โอนเงินสำเร็จ
12 พ.ย. 69 09:12 น.
จาก
นาย สมชาย ใจดี
ธ.กสิกรไทย
xxx-x-x1234-x
ไปยัง
นางสาว สมใจ รักดี
ธ.ไทยพาณิชย์
xxx-x-x5678-x
จำนวน: 300.00 บาท
ค่าธรรมเนียม: 0.00 บาท
K PLUS`,
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 30000,
      date: '2026-11-12',
      time: '09:12',
      payee: 'นางสาว สมใจ รักดี',
      bank: 'kplus',
    },
  },
  {
    id: 'scb-bill-mea',
    text: `SCB EASY
จ่ายบิลสำเร็จ
12 พ.ย. 2569 - 19:40
จาก นาย สมชาย ใจดี
xxx-xxx123-4
ไปยัง การไฟฟ้านครหลวง (MEA)
รหัสอ้างอิง 1: 0123456789012
จำนวนเงิน 1,385.00
เลขที่รายการ: 202611121940SCB0001`,
    expected: {
      type: 'expense',
      category: 'bills',
      amountSatang: 138500,
      date: '2026-11-12',
      time: '19:40',
      payee: 'การไฟฟ้านครหลวง (MEA)',
      bank: 'scb',
      refNo: '202611121940SCB0001',
    },
  },
  {
    id: 'ktb-rent',
    text: `Krungthai NEXT
รายการสำเร็จ
วันที่ทำรายการ 01/11/2569 08:00
จาก นาย สมชาย ใจดี
ไปยัง นิติบุคคลอาคารชุด ลุมพินี
บันทึกช่วยจำ ค่าส่วนกลาง พ.ย.
จำนวนเงิน 8,500.00 บาท
ค่าธรรมเนียม 0.00 บาท`,
    expected: {
      type: 'expense',
      category: 'housing',
      amountSatang: 850000,
      date: '2026-11-01',
      time: '08:00',
      bank: 'ktb',
    },
  },
  {
    id: 'promptpay-coffee',
    text: `พร้อมเพย์ PromptPay
ชำระเงินสำเร็จ
10 พ.ย. 69 07:45
ไปยัง Café Amazon สาขา PTT รัชดา
จำนวนเงิน ฿65.00
เลขที่อ้างอิง 2026111007450001`,
    expected: {
      type: 'expense',
      category: 'food',
      amountSatang: 6500,
      date: '2026-11-10',
      time: '07:45',
      bank: 'promptpay',
    },
  },
  {
    id: 'en-transfer-bts',
    text: `Transfer successful
13 Nov 2026 08:15
From Mr. Mike Smith
To BTS Rabbit Card
Amount 47.00 THB
Fee 0.00 THB
Ref No. BTS20261113A1`,
    expected: {
      type: 'expense',
      category: 'transport',
      amountSatang: 4700,
      date: '2026-11-13',
      time: '08:15',
      payee: 'BTS Rabbit Card',
      refNo: 'BTS20261113A1',
    },
  },
  {
    id: 'en-payment-netflix-mdy',
    text: `Payment successful
Nov 5, 2026 21:03
To NETFLIX.COM
Amount THB 419.00`,
    expected: {
      type: 'expense',
      category: 'entertainment',
      amountSatang: 41900,
      date: '2026-11-05',
      time: '21:03',
    },
  },
  {
    id: 'salary-th-net',
    text: `บริษัท ออมนิทริกซ์ จำกัด
สลิปเงินเดือน
งวดเดือน ตุลาคม 2569
วันที่จ่าย 25/10/2569
รายได้
เงินเดือน 42,000.00
ค่าล่วงเวลา 4,200.00
รายได้รวม 46,200.00
รายการหัก
ภาษี 1,800.00
ประกันสังคม 750.00
เงินได้สุทธิ 43,650.00`,
    expected: {
      type: 'income',
      category: 'salary',
      amountSatang: 4365000,
      date: '2026-10-25',
      payee: 'บริษัท ออมนิทริกซ์ จำกัด',
    },
  },
  {
    id: 'salary-en-period-only',
    text: `Omnitrix Co., Ltd.
PAYSLIP
Pay period: October 2026
Gross Income 50,000.00
Deductions 3,250.00
Net Pay 46,750.00`,
    expected: { type: 'income', category: 'salary', amountSatang: 4675000, date: '2026-10-31' },
  },
  {
    id: 'salary-weak-two-keywords',
    text: `ใบแจ้งรายได้ประจำเดือน
เงินเดือน 30,000.00
รายการหัก 1,500.00
รับสุทธิ 28,500.00
งวด กันยายน 2569`,
    expected: { type: 'income', category: 'salary', amountSatang: 2850000, date: '2026-09-30' },
  },
  {
    id: 'salary-with-transfer-word',
    text: `สลิปเงินเดือน Payslip
โอนเข้าบัญชี xxx-x-x9999-x
วันที่โอน 30/09/2569
เงินได้สุทธิ 25,000.00 บาท`,
    expected: { type: 'income', category: 'salary', amountSatang: 2500000, date: '2026-09-30' },
  },
  {
    id: 'received-money',
    text: `ได้รับเงินแล้ว
จาก นาย ก. ตัวอย่าง
เงินเข้า 1,000.00 บาท
จำนวนเงิน 1,000.00
13 พ.ย. 69 10:00`,
    expected: {
      type: 'income',
      category: 'other_income',
      amountSatang: 100000,
      date: '2026-11-13',
      time: '10:00',
    },
  },
  {
    id: 'received-en',
    text: `You received
฿2,500.50
from Ms. Jane Doe
12 Nov 2026 18:22`,
    expected: {
      type: 'income',
      category: 'other_income',
      amountSatang: 250050,
      date: '2026-11-12',
      time: '18:22',
    },
  },
  {
    id: 'received-looks-like-sender-slip',
    text: `โอนเงินสำเร็จ
11 พ.ย. 69 12:00 น.
จาก นาย ผู้โอน ตัวอย่าง
ไปยัง นาย สมชาย ใจดี
จำนวน: 5,000.00 บาท`,
    expected: {
      type: 'expense',
      category: 'transfer',
      amountSatang: 500000,
      date: '2026-11-11',
      time: '12:00',
    },
  },
  {
    id: 'ocr-noise-amount',
    text: `โอนเงินสำเร็จ
13 พย 69 11:05 น.
ไปยัง Shopee
จำนวนเงิน 1,25O.OO บาท`,
    expected: {
      type: 'expense',
      category: 'shopping',
      amountSatang: 125000,
      date: '2026-11-13',
      time: '11:05',
    },
  },
  {
    id: 'ocr-space-in-amount-thai-digits',
    text: `ชำระเงินสำเร็จ
๘ พ.ย. ๒๕๖๙ ๑๓:๓๐
ไปยัง LINE MAN
จำนวนเงิน ๑ ๒๕๐.๐๐ บาท`,
    expected: {
      type: 'expense',
      category: 'food',
      amountSatang: 125000,
      date: '2026-11-08',
      time: '13:30',
    },
  },
  {
    id: 'amount-next-line',
    text: `โอนเงินสำเร็จ
3 พฤศจิกายน 2569
ไปยัง โรงพยาบาลกรุงเทพ
จำนวนเงิน
2,145.00
ยอดเงินคงเหลือ 15,000.00`,
    expected: {
      type: 'expense',
      category: 'health',
      amountSatang: 214500,
      date: '2026-11-03',
      time: null,
    },
  },
  {
    id: 'grab-transport-not-food',
    text: `ชำระเงินสำเร็จ
13/11/2569 22:10
ไปยัง Grab
จำนวน 189.00 บาท`,
    expected: {
      type: 'expense',
      category: 'transport',
      amountSatang: 18900,
      date: '2026-11-13',
      time: '22:10',
    },
  },
  {
    id: 'longest-keyword-cafe-amazon-vs-ptt',
    text: `ชำระเงินสำเร็จ
9 พ.ย. 69
ไปยัง Café Amazon PTT
จำนวนเงิน 55.00`,
    expected: { type: 'expense', category: 'food', amountSatang: 5500, date: '2026-11-09' },
  },
  {
    id: 'memo-category',
    text: `โอนเงินสำเร็จ
2 พ.ย. 69 18:00
ไปยัง นาย เจ้าของ ห้องเช่า
บันทึกช่วยจำ ค่าเช่า พ.ย.
จำนวน: 4,500.00 บาท`,
    expected: {
      type: 'expense',
      category: 'housing',
      amountSatang: 450000,
      date: '2026-11-02',
      time: '18:00',
    },
  },
  {
    id: 'company-never-transfer',
    text: `โอนเงินสำเร็จ
1 พ.ย. 69
ไปยัง บริษัท ตัวอย่าง จำกัด
จำนวน: 999.00 บาท`,
    expected: { type: 'expense', category: 'other', amountSatang: 99900, date: '2026-11-01' },
  },
  {
    id: 'weak-bank-only',
    text: `SCB EASY
13/11/2026
ไปยัง Lazada
1,999.00`,
    expected: { type: 'expense', category: 'shopping', amountSatang: 199900, date: '2026-11-13' },
  },
  {
    id: 'future-date-rejected',
    text: `โอนเงินสำเร็จ
20 ธ.ค. 69 10:00
ไปยัง Starbucks
จำนวนเงิน 150.00`,
    expected: { type: 'expense', category: 'food', amountSatang: 15000, date: null, time: '10:00' },
  },
  {
    id: 'invalid-date-31-nov',
    text: `ชำระเงินสำเร็จ
31/11/2569
ไปยัง Spotify
จำนวนเงิน 129.00`,
    expected: { type: 'expense', category: 'entertainment', amountSatang: 12900, date: null },
  },
  {
    id: 'three-decimals-rejected',
    text: `โอนเงินสำเร็จ
13 พ.ย. 69
ไปยัง AIS
จำนวนเงิน 1,250.005`,
    expected: { type: 'expense', category: 'bills', amountSatang: null, date: '2026-11-13' },
  },
  {
    id: 'empty-text',
    text: ``,
    expected: { type: 'expense', category: 'other', amountSatang: null, date: null },
  },
  {
    id: 'month-boundary',
    text: `โอนเงินสำเร็จ
31/10/2569 23:59
ไปยัง MRT
จำนวน 42.00`,
    expected: {
      type: 'expense',
      category: 'transport',
      amountSatang: 4200,
      date: '2026-10-31',
      time: '23:59',
    },
  },
  {
    id: 'education-course',
    text: `Payment successful
07/11/2026 20:00
To Udemy Course
Amount 399.00 THB`,
    expected: {
      type: 'expense',
      category: 'education',
      amountSatang: 39900,
      date: '2026-11-07',
      time: '20:00',
    },
  },
];
