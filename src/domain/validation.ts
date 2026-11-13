/** Shared form validation for the manual form, edit form and Review cards (OMX-012a AC2, OMX-013 AC3). */
import { isCategoryValidFor } from './categories';
import { isValidTime, isValidYmd } from './date';
import { parseMoneyInput, type MoneyInputError } from './money';
import type { CategoryId, TxType } from './types';

export interface Draft {
  type: TxType;
  categoryId: CategoryId | null;
  amount: string;
  date: string;
  time: string;
  payee: string;
  note: string;
}

export type FieldError =
  MoneyInputError | 'dateRequired' | 'dateInvalid' | 'categoryRequired' | 'payeeMax' | 'noteMax';

export type DraftErrors = Partial<
  Record<'amount' | 'date' | 'time' | 'categoryId' | 'payee' | 'note', FieldError>
>;

export function validateDraft(d: Draft): DraftErrors {
  const e: DraftErrors = {};
  const money = parseMoneyInput(d.amount);
  if (!money.ok) e.amount = money.error;
  if (!d.date) e.date = 'dateRequired';
  else if (!isValidYmd(d.date)) e.date = 'dateInvalid';
  if (d.time && !isValidTime(d.time)) e.time = 'dateInvalid';
  if (!isCategoryValidFor(d.type, d.categoryId)) e.categoryId = 'categoryRequired';
  if (d.payee.trim().length > 100) e.payee = 'payeeMax';
  if (d.note.trim().length > 500) e.note = 'noteMax';
  return e;
}

export const hasErrors = (e: DraftErrors): boolean => Object.keys(e).length > 0;

/** Field order used to focus the first invalid field on submit. */
export const FIELD_ORDER = ['amount', 'categoryId', 'date', 'time', 'payee', 'note'] as const;
