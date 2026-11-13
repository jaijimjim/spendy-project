import { ArrowDownLeft, ArrowUpRight, PencilLine, ScanText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Transaction } from '../domain/types';
import { useFormat } from '../i18n/format';
import { CategoryChip } from './CategoryIcon';
import ui from './ui.module.css';
import s from './blocks.module.css';
import { cn } from './cn';

/** Row = button opening the edit form; sign + arrow + SR label, never colour alone (OMX-014 AC3). */
export function TransactionRow({
  tx,
  onOpen,
  highlight,
}: {
  tx: Transaction;
  onOpen?: () => void;
  highlight?: boolean;
}) {
  const { t } = useTranslation();
  const f = useFormat();
  const income = tx.type === 'income';
  const title = tx.payee || tx.note || t(`categories.${tx.categoryId}`);
  const Arrow = income ? ArrowDownLeft : ArrowUpRight;
  return (
    <button
      type="button"
      className={cn(s.row, highlight && s.highlight)}
      onClick={onOpen}
      data-testid="tx-row"
    >
      {onOpen && <span className="omx-visually-hidden">{t('common.edit')}: </span>}
      <CategoryChip id={tx.categoryId} />
      <span className={s.rowMain}>
        <span className={s.rowTitle}>{title}</span>
        <span className={s.rowMeta}>
          {t(`categories.${tx.categoryId}`)}
          {tx.time ? ` · ${tx.time}` : ''}
        </span>
      </span>
      <span className={s.rowSide}>
        <span
          className={cn(s.rowAmount, 'omx-amount', income ? ui.amountIncome : ui.amountExpense)}
        >
          <Arrow size={16} aria-hidden="true" />
          <span className="omx-visually-hidden">{t(income ? 'type.income' : 'type.expense')} </span>
          {f.txSigned(tx)}
        </span>
        <span className={cn(ui.badge, ui.badgeNeutral)}>
          {tx.source === 'slip' ? (
            <ScanText size={12} aria-hidden="true" />
          ) : (
            <PencilLine size={12} aria-hidden="true" />
          )}
          {t(`source.${tx.source}`)}
        </span>
      </span>
    </button>
  );
}
