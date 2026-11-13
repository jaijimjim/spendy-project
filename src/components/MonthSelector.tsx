import { useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { addMonths, displayYear, formatMonthOnly } from '../domain/date';
import { currentMonth } from '../services/clock';
import { useFormat } from '../i18n/format';
import { useUiStore } from '../store/uiStore';
import { IconButton } from './Button';
import { Modal } from './Modal';
import s from './blocks.module.css';

/** ‹ พฤศจิกายน 2569 › — shared by Dashboard and Transactions; next disabled at current month (OMX-017). */
export function MonthSelector() {
  const { t } = useTranslation();
  const f = useFormat();
  const ym = useUiStore((st) => st.selectedMonth);
  const setMonth = useUiStore((st) => st.setMonth);
  const [open, setOpen] = useState(false);
  const now = currentMonth();
  const atCurrent = ym >= now;
  const [pickerYear, setPickerYear] = useState(Number(ym.slice(0, 4)));
  const nowYear = Number(now.slice(0, 4));

  return (
    <div className={s.month}>
      <IconButton label={t('month.previous')} onClick={() => setMonth(addMonths(ym, -1))}>
        <ChevronLeft size={22} aria-hidden="true" />
      </IconButton>
      <button
        type="button"
        className={s.monthLabel}
        aria-haspopup="dialog"
        onClick={() => {
          setPickerYear(Number(ym.slice(0, 4)));
          setOpen(true);
        }}
      >
        <span aria-live="polite">{f.month(ym)}</span>
        <ChevronDown size={18} aria-hidden="true" />
      </button>
      <IconButton
        label={t('month.next')}
        disabled={atCurrent}
        title={atCurrent ? t('month.futureDisabled') : undefined}
        onClick={() => setMonth(addMonths(ym, 1))}
      >
        <ChevronRight size={22} aria-hidden="true" />
      </IconButton>
      {ym !== now && (
        <button type="button" className={s.thisMonth} onClick={() => setMonth(now)}>
          {t('month.thisMonth')}
        </button>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('month.pickerTitle')}
        variant="sheet"
      >
        <div className={s.yearRow}>
          <IconButton label={t('month.previousYear')} onClick={() => setPickerYear((y) => y - 1)}>
            <ChevronLeft size={22} aria-hidden="true" />
          </IconButton>
          <span aria-live="polite">{displayYear(pickerYear, f.lang)}</span>
          <IconButton
            label={t('month.nextYear')}
            disabled={pickerYear >= nowYear}
            onClick={() => setPickerYear((y) => y + 1)}
          >
            <ChevronRight size={22} aria-hidden="true" />
          </IconButton>
        </div>
        <div className={s.monthGrid}>
          {Array.from({ length: 12 }, (_, i) => {
            const value = `${pickerYear}-${String(i + 1).padStart(2, '0')}`;
            const future = value > now;
            return (
              <button
                key={value}
                type="button"
                className={s.monthTile}
                aria-current={value === ym || undefined}
                aria-disabled={future || undefined}
                aria-label={
                  future ? `${f.month(value)} — ${t('month.futureDisabled')}` : f.month(value)
                }
                onClick={() => {
                  if (future) return;
                  setMonth(value);
                  setOpen(false);
                }}
              >
                {formatMonthOnly(i + 1, f.lang)}
              </button>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
