import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CalendarX2, Check, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import { PageHeader } from '../../app/PageHeader';
import { MonthSelector } from '../../components/MonthSelector';
import { EmptyState } from '../../components/Feedback';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { TransactionRow } from '../../components/TransactionRow';
import { CategoryChip } from '../../components/CategoryIcon';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import {
  activeFilterCount,
  applyFilters,
  EMPTY_FILTERS,
  groupByDate,
  inMonth,
  summarize,
  type Filters,
} from '../../domain/transactions';
import { ALL_CATEGORIES } from '../../domain/categories';
import type { CategoryId } from '../../domain/types';
import { useFormat } from '../../i18n/format';
import { FirstUseEmpty } from '../dashboard/DashboardPage';
import ui from '../../components/ui.module.css';
import s from './transactions.module.css';
import { cn } from '../../components/cn';

function FilterSheet({
  open,
  onClose,
  value,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  value: Filters;
  onApply: (f: Filters) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);
  const types = [
    { v: 'all', label: t('transactions.filterAll') },
    { v: 'income', label: t('type.income') },
    { v: 'expense', label: t('type.expense') },
  ] as const;
  const toggle = (c: CategoryId) =>
    setDraft((d) => ({
      ...d,
      categories: d.categories.includes(c)
        ? d.categories.filter((x) => x !== c)
        : [...d.categories, c],
    }));
  return (
    <Modal open={open} onClose={onClose} title={t('transactions.filters')} variant="sheet">
      {open && (
        <FilterBody
          draft={draft}
          setDraft={setDraft}
          types={types}
          toggle={toggle}
          onApply={() => {
            onApply(draft);
            onClose();
          }}
        />
      )}
    </Modal>
  );
}

function FilterBody({
  draft,
  setDraft,
  types,
  toggle,
  onApply,
}: {
  draft: Filters;
  setDraft: (f: Filters) => void;
  types: readonly { v: Filters['type']; label: string }[];
  toggle: (c: CategoryId) => void;
  onApply: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <fieldset className={s.filterSection} style={{ border: 0, padding: 0, margin: '0 0 16px' }}>
        <legend className={s.filterLabel}>{t('transactions.filterType')}</legend>
        <div className={ui.segmented}>
          {types.map((o) => (
            <button
              key={o.v}
              type="button"
              className={ui.segment}
              aria-pressed={draft.type === o.v}
              onClick={() => setDraft({ ...draft, type: o.v })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </fieldset>
      <fieldset className={s.filterSection} style={{ border: 0, padding: 0 }}>
        <legend className={s.filterLabel}>{t('transactions.filterCategories')}</legend>
        <div className={ui.catGrid}>
          {ALL_CATEGORIES.map((c) => {
            const on = draft.categories.includes(c);
            return (
              <button
                key={c}
                type="button"
                role="checkbox"
                aria-checked={on}
                className={ui.catTile}
                onClick={() => toggle(c)}
              >
                <CategoryChip id={c} />
                {t(`categories.${c}`)}
                {on && (
                  <span className={ui.catCheck} aria-hidden="true">
                    <Check size={14} />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </fieldset>
      <div className={s.filterFooter}>
        <Button variant="secondary" onClick={() => setDraft(EMPTY_FILTERS)}>
          {t('transactions.clearFilters')}
        </Button>
        <Button onClick={onApply}>{t('transactions.applyFilters')}</Button>
      </div>
    </>
  );
}

export function TransactionsPage() {
  const { t } = useTranslation();
  const f = useFormat();
  const navigate = useNavigate();
  const location = useLocation();
  const highlightId = (location.state as { highlight?: string } | null)?.highlight;
  const all = useAppStore((st) => st.transactions);
  const ym = useUiStore((st) => st.selectedMonth);
  const filters = useUiStore((st) => st.filters);
  const setFilters = useUiStore((st) => st.setFilters);
  const [sheetOpen, setSheetOpen] = useState(false);

  const month = useMemo(() => inMonth(all, ym), [all, ym]);
  const filtered = useMemo(() => applyFilters(month, filters), [month, filters]);
  const groups = useMemo(() => groupByDate(filtered), [filtered]);
  const active = activeFilterCount(filters);
  const filteredSum = summarize(filtered);
  const filterOnlyCount = (filters.type !== 'all' ? 1 : 0) + filters.categories.length;

  return (
    <>
      <PageHeader title={t('transactions.title')} />
      {all.length === 0 ? (
        <FirstUseEmpty />
      ) : (
        <div className={s.list}>
          <MonthSelector />
          <div className={s.toolbar} role="search">
            <div className={cn(ui.control, s.search)}>
              <Search size={20} aria-hidden="true" className={ui.muted} />
              <label htmlFor="tx-search" className="omx-visually-hidden">
                {t('transactions.searchLabel')}
              </label>
              <input
                id="tx-search"
                type="search"
                placeholder={t('transactions.searchPlaceholder')}
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
              />
            </div>
            <Button
              variant="secondary"
              icon={<SlidersHorizontal size={20} aria-hidden="true" />}
              aria-haspopup="dialog"
              onClick={() => setSheetOpen(true)}
            >
              {filterOnlyCount ? (
                `(${filterOnlyCount})`
              ) : (
                <span className="omx-visually-hidden">{t('transactions.filters')}</span>
              )}
              {filterOnlyCount ? (
                <span className="omx-visually-hidden">
                  {t('transactions.filtersCount', { count: filterOnlyCount })}
                </span>
              ) : null}
            </Button>
          </div>
          {filterOnlyCount > 0 && (
            <div className={s.chips}>
              {filters.type !== 'all' && (
                <button
                  type="button"
                  className={s.chip}
                  aria-label={t('transactions.removeFilter', { name: t(`type.${filters.type}`) })}
                  onClick={() => setFilters({ ...filters, type: 'all' })}
                >
                  {t(`type.${filters.type}`)} <X size={16} aria-hidden="true" />
                </button>
              )}
              {filters.categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={s.chip}
                  aria-label={t('transactions.removeFilter', { name: t(`categories.${c}`) })}
                  onClick={() =>
                    setFilters({
                      ...filters,
                      categories: filters.categories.filter((x) => x !== c),
                    })
                  }
                >
                  {t(`categories.${c}`)} <X size={16} aria-hidden="true" />
                </button>
              ))}
            </div>
          )}
          {active > 0 && (
            <div className={s.resultBar}>
              <span aria-live="polite">
                {t('transactions.results', { count: filtered.length })}
              </span>
              <span>
                {t('transactions.filteredTotal', { amount: '' })}
                <strong
                  className={cn(
                    'omx-amount',
                    filteredSum.balance < 0 ? ui.amountExpense : ui.amountIncome,
                  )}
                >
                  {f.signed(filteredSum.balance)}
                </strong>
              </span>
            </div>
          )}

          {month.length === 0 ? (
            <div className={ui.card}>
              <EmptyState
                icon={<CalendarX2 size={44} />}
                title={t('empty.month.title')}
                body={t('empty.month.body')}
                actions={
                  <Button onClick={() => useUiStore.getState().setAddSheetOpen(true)}>
                    {t('empty.month.action')}
                  </Button>
                }
              />
            </div>
          ) : filtered.length === 0 ? (
            <div className={ui.card}>
              <EmptyState
                icon={<SearchX size={44} />}
                title={t('empty.noResults.title')}
                body={t('empty.noResults.body')}
                actions={
                  <Button onClick={() => setFilters(EMPTY_FILTERS)}>
                    {t('empty.noResults.action')}
                  </Button>
                }
              />
            </div>
          ) : (
            groups.map((g) => (
              <section key={g.date} className={s.group} aria-labelledby={`d-${g.date}`}>
                <h2 id={`d-${g.date}`} className={s.groupHeader}>
                  <span>{f.date(g.date)}</span>
                  <span className="omx-amount">{f.signed(g.net)}</span>
                </h2>
                <div className={cn(ui.card, s.groupCard)}>
                  {g.items.map((tx) => (
                    <TransactionRow
                      key={tx.id}
                      tx={tx}
                      highlight={tx.id === highlightId}
                      onOpen={() => navigate(`/transactions/${tx.id}`)}
                    />
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      )}
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        value={filters}
        onApply={setFilters}
      />
    </>
  );
}
