/**
 * Category keyword rules — the SINGLE data file for the rule engine (R6, OMX-010 AC8).
 * To add a keyword: append it to the right category and add a row to
 * `categorize.test.ts` (table-driven). Nothing else needs to change.
 *
 * Matching (see keywords.ts): case-/space-insensitive; English keywords use word boundaries.
 * Precedence (categorize.ts, OMX-050a): payee > payeeExtra (2nd biller line) > memo > person >
 * whole text (strong keywords) > weak tier `TX_PHRASES` (only when no payee was found) > other;
 * inside one field the longest keyword wins, then `priority`.
 */
import type { ExpenseCategoryId } from '../types';

export interface CategoryRule {
  category: Exclude<ExpenseCategoryId, 'other' | 'transfer'>;
  /** Higher wins remaining ties (AC2 step 3). */
  priority: number;
  keywords: readonly string[];
  /**
   * OMX-050b: keywords (also listed in `keywords`) that may match after OCR-confusable folding
   * (`fold()` in keywords.ts). Each must fold to ≥ 5 characters (AC3, R6).
   */
  fuzzy?: readonly string[];
}

export const CATEGORY_RULES: readonly CategoryRule[] = [
  {
    category: 'food',
    priority: 50,
    keywords: [
      'ร้านอาหาร',
      'อาหาร',
      'ข้าว',
      'ก๋วยเตี๋ยว',
      // OMX-050a AC10b: OCR often drops the tone mark on "เตี๋ยว"
      'ก๋วยเตียว',
      'ลูกชิ้น',
      // OMX-050a AC4 (grooming): shop names are often the dish — not "ครัว" (R5)
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
      'กาแฟ',
      'ชานม',
      'หมูกระทะ',
      'ชาบู',
      'ส้มตำ',
      'ร้านกาแฟ',
      'cafe',
      'café',
      'coffee',
      'Starbucks',
      'Café Amazon',
      'Cafe Amazon',
      'GrabFood',
      'Grab Food',
      'LINE MAN',
      'LINEMAN',
      'foodpanda',
      'Robinhood',
      '7-Eleven',
      '7-11',
      'เซเว่น',
      'KFC',
      "McDonald's",
      'MK',
      'Swensen',
      'Central Food Hall',
      'Food',
      'restaurant',
      'bakery',
    ],
  },
  {
    category: 'transport',
    priority: 40,
    keywords: [
      'BTS',
      'MRT',
      'Grab',
      'Bolt',
      'taxi',
      'แท็กซี่',
      'วินมอเตอร์ไซค์',
      'ทางด่วน',
      'Easy Pass',
      'M-Flow',
      'ปตท',
      'PTT',
      'PTT Station',
      'Shell',
      'Bangchak',
      'บางจาก',
      'Caltex',
      'น้ำมัน',
      'รถไฟ',
      'SRT',
      'Airport Rail Link',
      'ขนส่ง',
      'ที่จอดรถ',
      'parking',
      // OMX-050b AC8 (BUG-014): Rabbit card top-ups (บริษัท บางกอก สมาร์ทการ์ด ซิสเทม จำกัด)
      'Rabbit',
      'แรบบิท',
      'บางกอก สมาร์ทการ์ด',
      'Bangkok Smart Card',
      'สมาร์ทการ์ด ซิสเทม',
      'สมาร์ทการ์ด ซิสแทม',
      'สมาร์ทการ์ด ซัสเทม',
    ],
    fuzzy: ['แรบบิท', 'บางกอก สมาร์ทการ์ด', 'สมาร์ทการ์ด ซิสเทม'],
  },
  {
    category: 'shopping',
    priority: 30,
    keywords: [
      'Shopee',
      'ShopeePay',
      'Shopee Pay',
      'ช้อปปี้',
      'ช้อปปี้เพย์',
      'Lazada',
      'LazPay',
      'ลาซาด้า',
      'ลาซาดา',
      'ลาซาด้าเพย์',
      'บลูเพย์',
      'Central',
      'Big C',
      "Lotus's",
      'Lotus',
      'Tops',
      'Makro',
      'Uniqlo',
      'IKEA',
      'HomePro',
      'Watsons Store',
      'Power Buy',
      'Robinson',
      'The Mall',
      'Siam Paragon',
      'เสื้อผ้า',
      'ห้างสรรพสินค้า',
      'ซูเปอร์มาร์เก็ต',
      'TikTok Shop',
    ],
    // OMX-050b AC1/AC2: OCR garbles the Thai names ("บลูเพย-ลาชาดาเพย", "ชอปปี")
    fuzzy: [
      'Shopee',
      'ShopeePay',
      'ช้อปปี้',
      'ช้อปปี้เพย์',
      'Lazada',
      'LazPay',
      'ลาซาด้า',
      'ลาซาด้าเพย์',
      'บลูเพย์',
    ],
  },
  {
    category: 'bills',
    priority: 60,
    keywords: [
      'การไฟฟ้า',
      'การไฟฟ้านครหลวง',
      'การไฟฟ้าส่วนภูมิภาค',
      'ค่าไฟ',
      'MEA',
      'PEA',
      'การประปา',
      'การประปานครหลวง',
      'ค่าน้ำ',
      'MWA',
      'PWA',
      'AIS',
      'TrueMove',
      'True Move H',
      'TrueOnline',
      'dtac',
      '3BB',
      'internet',
      'อินเทอร์เน็ต',
      'ค่าโทรศัพท์',
      'บัตรเครดิต',
      'credit card',
      'ประกัน',
      'insurance',
    ],
  },
  {
    category: 'housing',
    priority: 55,
    keywords: [
      'ค่าเช่า',
      'ค่าห้อง',
      'หอพัก',
      'คอนโด',
      'ค่าส่วนกลาง',
      'นิติบุคคล',
      'apartment',
      'rent',
      'condo',
      'dormitory',
      'อพาร์ทเมนท์',
    ],
  },
  {
    category: 'health',
    priority: 45,
    keywords: [
      'โรงพยาบาล',
      'รพ.',
      'คลินิก',
      'ร้านยา',
      'เภสัช',
      'pharmacy',
      'Boots',
      'Watsons',
      'dental',
      'ทันตกรรม',
      'fitness',
      'ฟิตเนส',
      'hospital',
      'clinic',
      'Fascino',
    ],
  },
  {
    category: 'entertainment',
    priority: 35,
    keywords: [
      'Netflix',
      'Spotify',
      'YouTube',
      'Disney+',
      'Major',
      'Major Cineplex',
      'SF Cinema',
      'เกม',
      'Steam',
      'PlayStation',
      'คอนเสิร์ต',
      'concert',
      'cinema',
      'ภาพยนตร์',
      'Joox',
      'TrueID',
    ],
  },
  {
    category: 'education',
    priority: 40,
    keywords: [
      'โรงเรียน',
      'มหาวิทยาลัย',
      'ค่าเทอม',
      'คอร์ส',
      'course',
      'tuition',
      'หนังสือ',
      'ร้านหนังสือ',
      'school',
      'university',
      'Udemy',
      'Coursera',
      'SE-ED',
      'กวดวิชา',
    ],
  },
];

export interface TxPhrase {
  phrase: string;
  /** category when nothing stronger is known; null = only a signal, never a category */
  category: 'bills' | null;
}

/**
 * Weak tier (OMX-050a AC2): words that describe the TRANSACTION TYPE, not the merchant. Used only
 * when no strong keyword matched anywhere AND the slip has no payee (a known merchant paid
 * through a bill flow is not a bill) → `bills` with Medium confidence (AC3).
 */
export const TX_PHRASES: readonly TxPhrase[] = [
  { phrase: 'จ่ายบิล', category: 'bills' },
  { phrase: 'ชำระบิล', category: 'bills' },
  { phrase: 'Bill Payment', category: 'bills' },
  { phrase: 'ชำระเงิน', category: null },
  { phrase: 'โอนเงิน', category: null },
  { phrase: 'Payment', category: null },
];
