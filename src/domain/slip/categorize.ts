/** Rule-based categorization (OMX-010). */
import type { CategoryId, Confidence, TxType } from '../types';
import { CATEGORY_RULES, TX_PHRASES } from './categories.rules';
import { containsKeyword, containsKeywordFuzzy, keywordLength } from './keywords';
import { isCompany, looksLikePerson } from './parties';

export type MatchField = 'payee' | 'payeeExtra' | 'memo' | 'text';

export interface CategoryResult {
  category: CategoryId;
  confidence: Confidence;
  field: MatchField | 'person' | 'income' | 'weak' | 'default';
  keyword?: string;
  /** OMX-050b: the keyword matched only after OCR-confusable folding */
  fuzzy?: true;
}

interface Match {
  category: CategoryId;
  keyword: string;
  length: number;
  priority: number;
  fuzzy?: true;
}

/** Best match inside one field: longest keyword, then rule priority (AC2). */
export function bestMatch(fieldText: string | null | undefined): Match | null {
  if (!fieldText) return null;
  let best: Match | null = null;
  for (const rule of CATEGORY_RULES) {
    for (const keyword of rule.keywords) {
      const exact = containsKeyword(fieldText, keyword);
      if (!exact && !(rule.fuzzy?.includes(keyword) && containsKeywordFuzzy(fieldText, keyword)))
        continue;
      const m: Match = {
        category: rule.category,
        keyword,
        length: keywordLength(keyword),
        priority: rule.priority,
        ...(exact ? {} : { fuzzy: true as const }),
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
  /** OMX-050a: second merchant/biller line from the arrow layout (OMX-049 AC3) */
  payeeExtra?: string | null;
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
      ...(payeeMatch.fuzzy ? { fuzzy: true as const } : {}),
    };

  const extraMatch = bestMatch(input.payeeExtra);
  if (extraMatch)
    return {
      category: extraMatch.category,
      confidence: 'high',
      field: 'payeeExtra',
      keyword: extraMatch.keyword,
      ...(extraMatch.fuzzy ? { fuzzy: true as const } : {}),
    };

  const memoMatch = bestMatch(input.memo);
  if (memoMatch)
    return {
      category: memoMatch.category,
      confidence: 'high',
      field: 'memo',
      keyword: memoMatch.keyword,
      ...(memoMatch.fuzzy ? { fuzzy: true as const } : {}),
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
      ...(textMatch.fuzzy ? { fuzzy: true as const } : {}),
    };

  // Weak tier (AC2/AC3): a type phrase only decides when the merchant is unknown.
  if (!input.payee) {
    const weak = TX_PHRASES.find((p) => p.category && containsKeyword(input.text, p.phrase));
    if (weak?.category)
      return { category: weak.category, confidence: 'medium', field: 'weak', keyword: weak.phrase };
  }

  return { category: 'other', confidence: 'low', field: 'default' };
}
