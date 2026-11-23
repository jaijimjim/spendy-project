/** Review card (design-system §6.17, OMX-012a/b, OMX-011): collapsed summary + editable form. */
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  CopyCheck,
  FileText,
  Info,
  Trash2,
  TriangleAlert,
  ZoomIn,
} from 'lucide-react';
import type { QueueItem } from '../../store/queueStore';
import { useQueueStore } from '../../store/queueStore';
import { useUiStore } from '../../store/uiStore';
import { validateDraft, type Draft, type DraftErrors } from '../../domain/validation';
import { parseMoneyInput } from '../../domain/money';
import { resetCategoryForType } from '../../domain/categories';
import type { TxType } from '../../domain/types';
import {
  AmountInput,
  CategoryPicker,
  DateInput,
  Field,
  TypeToggle,
  controlClass,
  describedBy,
} from '../../components/FormControls';
import { CategoryChip } from '../../components/CategoryIcon';
import { Button } from '../../components/Button';
import { useFormat } from '../../i18n/format';
import ui from '../../components/ui.module.css';
import s from './review.module.css';
import { cn } from '../../components/cn';

const BANK_LABEL: Record<string, string> = {
  kplus: 'K PLUS',
  scb: 'SCB EASY',
  ktb: 'Krungthai NEXT',
  bbl: 'Bangkok Bank',
  bay: 'Krungsri',
  ttb: 'ttb',
  gsb: 'MyMo',
  promptpay: 'PromptPay',
};

interface Props {
  item: QueueItem;
  index: number;
  total: number;
  expanded: boolean;
  onToggle: () => void;
  showErrors: boolean;
  onOpenImage: (item: QueueItem) => void;
  onDiscard: (item: QueueItem) => void;
  onViewExisting: (item: QueueItem) => void;
}

export function ReviewCard({
  item,
  index,
  total,
  expanded,
  onToggle,
  showErrors,
  onOpenImage,
  onDiscard,
  onViewExisting,
}: Props) {
  const { t } = useTranslation();
  const f = useFormat();
  const updateDraft = useQueueStore((st) => st.updateDraft);
  const setSelected = useQueueStore((st) => st.setSelected);
  const announce = useUiStore((st) => st.announce);
  const [touched, setTouched] = useState<Partial<Record<keyof Draft, boolean>>>({});
  const d = item.draft!;
  const p = item.parsed!;
  const errors: DraftErrors = validateDraft(d);
  const invalid = Object.keys(errors).length > 0;
  const idp = `rv-${item.id}`;
  const err = (k: keyof DraftErrors) =>
    (showErrors || touched[k as keyof Draft]) && errors[k] ? t(`validation.${errors[k]}`) : null;

  const set = (patch: Partial<Draft>) => {
    updateDraft(item.id, patch);
    setTouched((x) => ({ ...x, ...Object.fromEntries(Object.keys(patch).map((k) => [k, true])) }));
  };
  const setType = (type: TxType) => {
    if (type === d.type) return;
    const categoryId = resetCategoryForType(type, d.categoryId);
    if (categoryId !== d.categoryId)
      announce(t(type === 'income' ? 'categories.resetToIncome' : 'categories.resetToExpense'));
    set({ type, categoryId });
  };

  // "Needs review" highlights (design-system §6.3): untouched flagged fields get border + icon + text.
  const amountWarn = touched.amount
    ? null
    : p.flags.noAmount
      ? t('review.noAmount')
      : p.flags.amountUnusual
        ? t('review.amountUnusual')
        : p.flags.amountFallback
          ? t('review.checkField')
          : null;
  const dateWarn = !touched.date && p.flags.noDate ? t('review.noDate') : null;
  const typeWarn = !touched.type && p.flags.lowType ? t('review.lowTypeConfidence') : null;
  const catWarn =
    !touched.categoryId && p.categoryResult.confidence === 'low' ? t('review.checkField') : null;
  // OMX-049 AC6 (D1): info — not a warning — when an expense slip had no payee; gone once typed.
  const payeeInfo =
    d.type === 'expense' && p.flags.noPayee && !touched.payee && !d.payee.trim()
      ? t('review.noPayee')
      : null;
  const payeeErr = err('payee');

  const money = parseMoneyInput(d.amount);
  const income = d.type === 'income';
  const Arrow = income ? ArrowDownLeft : ArrowUpRight;
  const titleId = `${idp}-title`;
  const bank = p.bank ? BANK_LABEL[p.bank] : null;

  return (
    <article
      className={cn(ui.card, s.card, invalid && s.cardInvalid, item.duplicate && s.cardDup)}
      aria-labelledby={titleId}
      data-testid="review-card"
    >
      <h2 id={titleId} className="omx-visually-hidden">
        {t('review.itemLabel', { index, total })}
      </h2>
      <div className={s.summary}>
        <label className={s.check}>
          <input
            type="checkbox"
            checked={item.selected}
            aria-label={t('review.selectItem', { index })}
            onChange={(e) => setSelected(item.id, e.target.checked)}
          />
        </label>
        <button
          type="button"
          className={cn(s.thumbBtn)}
          onClick={() => onOpenImage(item)}
          aria-label={t('review.openImage')}
        >
          <img src={item.url} alt="" />
          <span className={s.zoomBadge} aria-hidden="true">
            <ZoomIn size={12} />
          </span>
        </button>
        <div className={s.meta}>
          <p className={cn(s.amount, 'omx-amount', income ? ui.amountIncome : ui.amountExpense)}>
            <Arrow size={18} aria-hidden="true" />
            {money.ok ? f.txSigned({ type: d.type, amountSatang: money.satang }) : '—'}
            <span className={s.typeWord}>{t(`type.${d.type}`)}</span>
          </p>
          {d.categoryId && (
            <p className={s.metaLine}>
              <CategoryChip id={d.categoryId} size="sm" />
              {t(`categories.${d.categoryId}`)}
            </p>
          )}
          <p className={s.metaLine}>
            {p.flags.noDate && !touched.date && <TriangleAlert size={14} aria-hidden="true" />}
            {d.date ? f.date(d.date) : ''}
            {d.time ? ` · ${d.time}` : ''}
            {bank ? ` · ${bank}` : ''}
          </p>
          <p className={s.metaLine} data-testid="review-payee-line">
            {d.payee.trim() ? (
              <span className={s.payeeName}>{d.payee.trim()}</span>
            ) : (
              <span className={s.payeeEmpty}>{t('transactions.noPayee')}</span>
            )}
          </p>
          <div className={s.badges}>
            {p.confidence !== 'high' && (
              <span className={cn(ui.badge, ui.badgeWarning)}>
                <TriangleAlert size={12} aria-hidden="true" />
                {t(`review.confidence.${p.confidence}`)}
              </span>
            )}
            {item.duplicate && (
              <span className={cn(ui.badge, ui.badgeInfo)}>
                <CopyCheck size={12} aria-hidden="true" />
                {t(
                  item.duplicate.kind === 'exact' ? 'review.duplicate' : 'review.possibleDuplicate',
                )}
              </span>
            )}
            {invalid && (
              <span className={cn(ui.badge, ui.badgeDanger)}>{t('review.incomplete')}</span>
            )}
          </div>
        </div>
        <button
          type="button"
          className={cn(ui.iconBtn, s.expandBtn)}
          aria-expanded={expanded}
          aria-controls={`${idp}-body`}
          aria-label={expanded ? t('common.collapse') : t('common.expand')}
          onClick={onToggle}
        >
          {expanded ? (
            <ChevronUp size={22} aria-hidden="true" />
          ) : (
            <ChevronDown size={22} aria-hidden="true" />
          )}
        </button>
      </div>

      <div
        id={`${idp}-body`}
        className={s.body}
        data-expanded={expanded}
        hidden={!expanded && !isDesktop()}
      >
        <div className={s.split}>
          <button
            type="button"
            className={s.sideImage}
            onClick={() => onOpenImage(item)}
            aria-label={t('review.openImage')}
          >
            <img src={item.url} alt="" />
          </button>
          <div className={s.list}>
            <div className={ui.field}>
              <span className={ui.label}>{t('type.label')}</span>
              <TypeToggle value={d.type} onChange={setType} />
              {typeWarn && (
                <p className={ui.warnText}>
                  <TriangleAlert size={16} aria-hidden="true" />
                  {typeWarn}
                </p>
              )}
            </div>
            <Field
              id={`${idp}-amount`}
              label={t('form.amount')}
              error={err('amount')}
              warning={amountWarn}
            >
              <AmountInput
                id={`${idp}-amount`}
                value={d.amount}
                onChange={(amount) => set({ amount })}
                error={err('amount')}
                warning={amountWarn}
              />
            </Field>
            <Field
              id={`${idp}-cat`}
              label={t('categories.label')}
              error={err('categoryId')}
              warning={catWarn}
            >
              <CategoryPicker
                id={`${idp}-cat`}
                type={d.type}
                value={d.categoryId}
                onChange={(categoryId) => set({ categoryId })}
                error={err('categoryId')}
              />
            </Field>
            <Field id={`${idp}-date`} label={t('form.date')} error={err('date')} warning={dateWarn}>
              <DateInput
                id={`${idp}-date`}
                value={d.date}
                onChange={(date) => set({ date })}
                error={err('date')}
                warning={dateWarn}
              />
            </Field>
            <Field id={`${idp}-time`} label={t('form.time')} optional>
              <div className={controlClass()}>
                <input
                  id={`${idp}-time`}
                  type="time"
                  value={d.time}
                  onChange={(e) => set({ time: e.target.value })}
                />
              </div>
            </Field>
            <Field
              id={`${idp}-payee`}
              label={t('form.payee')}
              optional
              error={payeeErr}
              helper={
                payeeInfo && (
                  <span className={s.payeeInfo}>
                    <Info size={16} aria-hidden="true" />
                    {payeeInfo}
                  </span>
                )
              }
            >
              <div className={controlClass(payeeErr)}>
                <input
                  id={`${idp}-payee`}
                  value={d.payee}
                  maxLength={120}
                  placeholder={t('form.payeePlaceholder')}
                  aria-describedby={describedBy(`${idp}-payee`, !!(payeeErr || payeeInfo))}
                  onChange={(e) => set({ payee: e.target.value })}
                />
              </div>
            </Field>
            <Field id={`${idp}-note`} label={t('form.note')} optional error={err('note')}>
              <div className={controlClass(err('note'))}>
                <textarea
                  id={`${idp}-note`}
                  rows={2}
                  value={d.note}
                  maxLength={520}
                  onChange={(e) => set({ note: e.target.value })}
                />
              </div>
            </Field>
            <details className={s.ocr}>
              <summary>
                <FileText size={18} aria-hidden="true" />
                {t('review.ocrText')}
              </summary>
              {/* Plain text only — never HTML (OMX-031 AC2). */}
              <pre>{item.text.trim() || t('review.ocrEmpty')}</pre>
            </details>
            <div className={s.cardActions}>
              <Button
                variant="dangerGhost"
                size="sm"
                icon={<Trash2 size={18} aria-hidden="true" />}
                onClick={() => onDiscard(item)}
              >
                {t('review.discard')}
              </Button>
              {item.duplicate && (
                <Button variant="ghost" size="sm" onClick={() => onViewExisting(item)}>
                  {t('review.viewExisting')}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function isDesktop(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(min-width: 1024px)').matches;
}
