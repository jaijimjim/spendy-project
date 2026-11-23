import { categoryNeedsCheck } from './needsReview';
import type { CategoryResult } from './categorize';

const p = (c: CategoryResult) => ({ categoryResult: c });

describe('categoryNeedsCheck (OMX-050a AC6 / D2)', () => {
  it.each([
    [{ category: 'other', confidence: 'low', field: 'default' }, true],
    [{ category: 'food', confidence: 'medium', field: 'text' }, true],
    [{ category: 'bills', confidence: 'medium', field: 'weak' }, true],
    [{ category: 'food', confidence: 'high', field: 'payee' }, false],
    [{ category: 'other_income', confidence: 'medium', field: 'income' }, false],
    [{ category: 'transfer', confidence: 'high', field: 'person' }, false],
  ] as [CategoryResult, boolean][])('%j → %s', (c, want) => {
    expect(categoryNeedsCheck(p(c))).toBe(want);
  });
});
