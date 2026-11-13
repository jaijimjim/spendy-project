/** Rule-based categorization (OMX-010). */
import type { CategoryId, Confidence, TxType } from '../types';
import { CATEGORY_RULES } from './categories.rules';
import { containsKeyword, keywordLength } from './keywords';
import { isCompany, looksLikePerson } from './parties';

export type MatchField = 'payee' | 'memo' | 'text';

export interface CategoryResult {
  category: CategoryId;
  confidence: Confidence;
  field: MatchField | 'person' | 'income' | 'default';
  keyword?: string;
}

interface Match {
  category: CategoryId;
  keyword: string;
  length: number;
  priority: number;
}

/** Best match inside one field: longest keyword, then rule priority (AC2). */
export function bestMatch(fieldText: string | null | undefined): Match | null {
  if (!fieldText) return null;
  let best: Match | null = null;
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      if (!containsKeyword(fieldText, keyword)) continue;
      const m: Match = {
        category: rule.category,
        keyword,
        length: keywordLength(keyword),
        priority: rule.priority,
      };
      if (
        !best ||
        m.length > best.length ||
        (m.length === best.length && m.priority > best.priority)
      )
        best = m;
    }
  }
  return best;
}

export interface CategorizeInput {
  type: TxType;
  isSalary: boolean;
  payee: string | null;
  memo: string | null;
  text: string;
}

export function categorize(input: CategorizeInput): CategoryResult {
  if (input.type === 'income') {
    return input.isSalary
      ? { category: 'salary', confidence: 'high', field: 'income' }
      : { category: 'other_income', confidence: 'medium', field: 'income' };
  }

  const payeeMatch = bestMatch(input.payee);
  if (payeeMatch)
    return {
      category: payeeMatch.category,
      confidence: 'high',
      field: 'payee',
      keyword: payeeMatch.keyword,
    };

  const memoMatch = bestMatch(input.memo);
  if (memoMatch)
    return {
      category: memoMatch.category,
      confidence: 'high',
      field: 'memo',
      keyword: memoMatch.keyword,
    };

  // Person-to-person transfer: personal prefix and no merchant/bill keyword (AC5). Never for companies.
  if (input.payee && looksLikePerson(input.payee) && !isCompany(input.payee)) {
    return { category: 'transfer', confidence: 'high', field: 'person' };
  }

  // Whole text minus the payee/memo lines already checked.
  const textMatch = bestMatch(input.text);
  if (textMatch)
    return {
      category: textMatch.category,
      confidence: 'medium',
      field: 'text',
      keyword: textMatch.keyword,
    };

  return { category: 'other', confidence: 'low', field: 'default' };
}
