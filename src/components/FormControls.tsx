import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleAlert,
  TriangleAlert,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CategoryId, TxType } from '../domain/types';
import { categoriesFor } from '../domain/categories';
import { formatDateShort } from '../domain/date';
import { useLang } from '../i18n/format';
import s from './ui.module.css';
import { cn } from './cn';
import { CategoryChip } from './CategoryIcon';
import { Modal } from './Modal';

/** Arrow-key navigation inside a radiogroup. */
function radioKeys(
  e: KeyboardEvent<HTMLElement>,
  count: number,
  index: number,
  select: (i: number) => void,
  cols = 1,
) {
  const map: Record<string, number> = {
    ArrowRight: 1,
    ArrowDown: cols,
    ArrowLeft: -1,
    ArrowUp: -cols,
  };
  const delta = map[e.key];
  if (delta === undefined) return;
  e.preventDefault();
  const next = (index + delta + count) % count;
  select(next);
  const group = e.currentTarget.parentElement;
  group?.querySelectorAll<HTMLElement>('[role="radio"]')[next]?.focus();
}

export function TypeToggle({
  value,
  onChange,
  idPrefix,
}: {
  value: TxType;
  onChange: (t: TxType) => void;
  idPrefix?: string;
}) {
  const { t } = useTranslation();
  const options: { v: TxType; label: string; Icon: typeof ArrowUpRight; cls: string }[] = [
    { v: 'expense', label: t('type.expense'), Icon: ArrowUpRight, cls: s.segExpense ?? '' },
    { v: 'income', label: t('type.income'), Icon: ArrowDownLeft, cls: s.segIncome ?? '' },
  ];
  return (
    <div
      className={s.segmented}
      role="radiogroup"
      aria-label={t('type.label')}
      id={idPrefix ? `${idPrefix}-type` : undefined}
    >
      {options.map((o, i) => {
        const checked = value === o.v;
        return (
          <button
            key={o.v}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            className={cn(s.segment, o.cls)}
            onClick={() => onChange(o.v)}
            onKeyDown={(e) => radioKeys(e, options.length, i, (n) => onChange(options[n]!.v))}
          >
            <o.Icon size={18} aria-hidden="true" />
            {o.label}
            {checked && <Check size={16} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  optional?: boolean;
  error?: string | null;
  warning?: string | null;
  helper?: ReactNode;
  children: ReactNode;
}

/** Label above, helper/error below linked via aria-describedby (§6.3). */
export function Field({ id, label, optional, error, warning, helper, children }: FieldProps) {
  const { t } = useTranslation();
  return (
    <div className={s.field}>
      <label className={s.label} htmlFor={id}>
        {label} {optional && <span className={s.optional}>({t('app.optional')})</span>}
      </label>
      {children}
      {error ? (
        <p className={s.error} id={`${id}-msg`}>
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      ) : warning ? (
        <p className={s.warnText} id={`${id}-msg`}>
          <TriangleAlert size={16} aria-hidden="true" />
          {warning}
        </p>
      ) : helper ? (
        <p className={s.helper} id={`${id}-msg`}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}

export const describedBy = (id: string, has: boolean) => (has ? `${id}-msg` : undefined);

export function controlClass(error?: string | null, warning?: string | null, extra?: string) {
  return cn(s.control, error ? s.controlInvalid : warning ? s.controlWarn : undefined, extra);
}

export function AmountInput({
  id,
  value,
  onChange,
  error,
  warning,
  inputRef,
  autoFocus,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  warning?: string | null;
  inputRef?: React.Ref<HTMLInputElement>;
  autoFocus?: boolean;
}) {
  return (
    <div className={controlClass(error, warning, s.amountControl)}>
      {warning && !error && <TriangleAlert size={18} className={s.warnText} aria-hidden="true" />}
      <span className={s.prefix} aria-hidden="true">
        ฿
      </span>
      <input
        ref={inputRef}
        id={id}
        name="amount"
        inputMode="decimal"
        autoComplete="off"
        placeholder="0.00"
        value={value}
        autoFocus={autoFocus}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, !!(error || warning))}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => {
          // format with thousands separators on blur (§6.3) — only for clean numbers
          const raw = e.target.value.replace(/,/g, '').trim();
          if (/^\d+(\.\d{1,2})?$/.test(raw)) {
            const [i = '0', d = ''] = raw.split('.');
            onChange(`${Number(i).toLocaleString('en-US')}.${d.padEnd(2, '0')}`);
          }
        }}
      />
    </div>
  );
}

export function DateInput({
  id,
  value,
  onChange,
  error,
  warning,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  warning?: string | null;
}) {
  const lang = useLang();
  let formatted = '';
  try {
    formatted = value ? formatDateShort(value, lang) : '';
  } catch {
    formatted = '';
  }
  return (
    <div className={controlClass(error, warning)}>
      {warning && !error && <TriangleAlert size={18} className={s.warnText} aria-hidden="true" />}
      <input
        id={id}
        type="date"
        value={value}
        aria-invalid={!!error || undefined}
        aria-describedby={describedBy(id, !!(error || warning))}
        onChange={(e) => onChange(e.target.value)}
      />
      {formatted && (
        <span className={s.dateBadge} aria-hidden="true">
          {formatted}
        </span>
      )}
    </div>
  );
}

export function CategoryPicker({
  id,
  type,
  value,
  onChange,
  error,
}: {
  id: string;
  type: TxType;
  value: CategoryId | null;
  onChange: (c: CategoryId) => void;
  error?: string | null;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const options = categoriesFor(type);
  const selectedRef = useRef<HTMLButtonElement>(null);
  const firstRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const isDesktop =
    typeof window !== 'undefined' && window.matchMedia?.('(min-width: 1024px)').matches;
  const cols = isDesktop ? 4 : 3;
  const selectedIndex = Math.max(
    0,
    options.findIndex((c) => c === value),
  );
  return (
    <>
      <button
        id={id}
        type="button"
        className={cn(s.catTrigger, error && s.controlInvalid)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-describedby={describedBy(id, !!error)}
        onClick={() => setOpen(true)}
      >
        {value ? <CategoryChip id={value} size="sm" /> : <span />}
        <span>
          {value ? (
            t(`categories.${value}`)
          ) : (
            <span className={s.muted}>{t('categories.choose')}</span>
          )}
        </span>
        <ChevronDown size={20} aria-hidden="true" />
      </button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('categories.pickerTitle')}
        variant="sheet"
        initialFocusRef={value ? selectedRef : firstRef}
      >
        <div className={s.catGrid} role="radiogroup" aria-labelledby={titleId}>
          <span id={titleId} className="omx-visually-hidden">
            {t('categories.label')}
          </span>
          {options.map((c, i) => {
            const checked = c === value;
            return (
              <button
                key={c}
                ref={checked ? selectedRef : i === 0 ? firstRef : undefined}
                type="button"
                role="radio"
                aria-checked={checked}
                tabIndex={i === selectedIndex ? 0 : -1}
                className={s.catTile}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') return;
                  radioKeys(e, options.length, i, () => undefined, cols);
                }}
              >
                <CategoryChip id={c} />
                {t(`categories.${c}`)}
                {checked && (
                  <span className={s.catCheck} aria-hidden="true">
                    <Check size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </Modal>
    </>
  );
}
