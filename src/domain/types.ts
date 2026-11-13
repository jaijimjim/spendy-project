/** Core domain types. Money is integer satang (R1); dates are `YYYY-MM-DD` CE strings in Asia/Bangkok (R2). */

export type TxType = 'income' | 'expense';
export type Source = 'slip' | 'manual';
export type Confidence = 'high' | 'medium' | 'low';
export type Language = 'th' | 'en';

export const EXPENSE_CATEGORIES = [
  'food',
  'transport',
  'shopping',
  'bills',
  'housing',
  'health',
  'entertainment',
  'education',
  'transfer',
  'other',
] as const;
export const INCOME_CATEGORIES = ['salary', 'other_income'] as const;

export type ExpenseCategoryId = (typeof EXPENSE_CATEGORIES)[number];
export type IncomeCategoryId = (typeof INCOME_CATEGORIES)[number];
export type CategoryId = ExpenseCategoryId | IncomeCategoryId;

export type BankId = 'kplus' | 'scb' | 'ktb' | 'bbl' | 'bay' | 'ttb' | 'gsb' | 'promptpay';

export interface SlipMeta {
  /** SHA-256 hex of the original file bytes (OMX-011). */
  imageHash?: string;
  refNo?: string;
  bank?: BankId;
  /** OCR text, truncated to 500 chars (R8). */
  rawText?: string;
  confidence: Confidence;
}

export interface Transaction {
  id: string;
  type: TxType;
  categoryId: CategoryId;
  /** Positive integer satang. */
  amountSatang: number;
  /** `YYYY-MM-DD` (CE, Asia/Bangkok). */
  date: string;
  /** `HH:mm`, optional. */
  time?: string;
  payee?: string;
  note?: string;
  source: Source;
  slip?: SlipMeta;
  createdAt: string;
  updatedAt: string;
}

export interface Settings {
  language: Language;
}

export interface StoreEnvelopeV1 {
  version: 1;
  transactions: Transaction[];
  settings: Settings;
}
