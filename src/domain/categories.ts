import {
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  type CategoryId,
  type ExpenseCategoryId,
  type IncomeCategoryId,
  type TxType,
} from './types';

export const ALL_CATEGORIES: readonly CategoryId[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export function categoriesFor(type: TxType): readonly CategoryId[] {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function isIncomeCategory(id: string): id is IncomeCategoryId {
  return (INCOME_CATEGORIES as readonly string[]).includes(id);
}

export function isExpenseCategory(id: string): id is ExpenseCategoryId {
  return (EXPENSE_CATEGORIES as readonly string[]).includes(id);
}

export function isCategoryValidFor(type: TxType, id: CategoryId | null | undefined): boolean {
  if (!id) return false;
  return type === 'income' ? isIncomeCategory(id) : isExpenseCategory(id);
}

/**
 * When the type flips, keep the category if still valid, otherwise reset it
 * (Expense→Income ⇒ other_income, Income→Expense ⇒ other) — OMX-012a AC3.
 */
export function resetCategoryForType(
  type: TxType,
  current: CategoryId | null | undefined,
): CategoryId {
  if (current && isCategoryValidFor(type, current)) return current;
  return type === 'income' ? 'other_income' : 'other';
}
