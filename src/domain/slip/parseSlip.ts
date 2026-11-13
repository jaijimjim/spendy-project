/**
 * Slip parser orchestrator: OCR text → structured draft for Review.
 * Pure function; "today" is injected so tests are deterministic (R2).
 */
import type { BankId, CategoryId, Confidence, TxType } from '../types';
import { addYears } from '../date';
import { extractAmount, isUnusualAmount } from './amount';
import { categorize, type CategoryResult } from './categorize';
import { hasThai, normalizeText, toLines } from './normalize';
import { extractParties } from './parties';
import { findDates, findSalaryDate, findTime } from './slipDate';
import { detectType, type TypeResult } from './type';

export const RAW_TEXT_LIMIT = 500;

export interface ParsedSlip {
  type: TxType;
  categoryId: CategoryId;
  amountSatang: number | null;
  /** Always a valid date; falls back to today (flags.noDate). */
  date: string;
  time: string | null;
  payee: string | null;
  note: string | null;
  bank: BankId | null;
  refNo: string | null;
  /** Overall confidence shown as a badge (R5: only Medium/Low are shown). */
  confidence: Confidence;
  typeResult: TypeResult;
  categoryResult: CategoryResult;
  flags: {
    noAmount: boolean;
    amountUnusual: boolean;
    amountFallback: boolean;
    noDate: boolean;
    lowType: boolean;
  };
  rawText: string;
}

const RANK: Record<Confidence, number> = { low: 0, medium: 1, high: 2 };
const minConfidence = (...cs: Confidence[]): Confidence =>
  cs.reduce((a, b) => (RANK[b] < RANK[a] ? b : a), 'high' as Confidence);

export function parseSlip(rawText: string, today: string): ParsedSlip {
  const text = normalizeText(rawText);
  const lines = toLines(text);
  const thai = hasThai(text);

  // Amount depends on salary-ness, and type confidence depends on amount: resolve in two passes.
  const preType = detectType(text, false);
  const amount = extractAmount(lines, preType.isSalary);
  const typeResult = detectType(text, amount.satang !== null);

  const parties = extractParties(lines, text);
  const payee = typeResult.isSalary
    ? (parties.employer ?? parties.sender)
    : (parties.payee ?? null);

  const minDate = addYears(today, -5);
  const accept = (d: string) => d <= today && d >= minDate;
  const date = typeResult.isSalary
    ? findSalaryDate(lines, thai, accept)
    : (findDates(text, thai).find((c) => accept(c.date))?.date ?? null);
  const time = findTime(text);

  const categoryResult = categorize({
    type: typeResult.type,
    isSalary: typeResult.isSalary,
    payee: parties.payee,
    memo: parties.memo,
    text,
  });

  const noAmount = amount.satang === null;
  const amountUnusual = amount.satang !== null && isUnusualAmount(amount.satang);
  const amountFallback = amount.source === 'fallback';
  const noDate = date === null;

  const confidence = minConfidence(
    typeResult.confidence,
    categoryResult.confidence,
    noAmount || amountUnusual ? 'low' : amountFallback ? 'medium' : 'high',
    noDate ? 'medium' : 'high',
  );

  return {
    type: typeResult.type,
    categoryId: categoryResult.category,
    amountSatang: amount.satang,
    date: date ?? today,
    time,
    payee,
    note: parties.memo,
    bank: parties.bank,
    refNo: parties.refNo,
    confidence,
    typeResult,
    categoryResult,
    flags: {
      noAmount,
      amountUnusual,
      amountFallback,
      noDate,
      lowType: typeResult.confidence === 'low',
    },
    rawText: rawText.trim().slice(0, RAW_TEXT_LIMIT),
  };
}
