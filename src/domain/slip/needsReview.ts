/** Review highlights derived from the parse (design-system §6.3). */
import type { ParsedSlip } from './parseSlip';

/**
 * OMX-050a AC6 (D2): highlight the category when it is a guess — Low, or Medium decided only from
 * the whole slip text / the weak "จ่ายบิล" tier (not from the payee, memo or a person name).
 */
export function categoryNeedsCheck(p: Pick<ParsedSlip, 'categoryResult'>): boolean {
  const c = p.categoryResult;
  return (
    c.confidence === 'low' ||
    (c.confidence === 'medium' && (c.field === 'text' || c.field === 'weak'))
  );
}
