import { useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarX2,
  ImageUp,
  PencilLine,
  ScanText,
  TriangleAlert,
} from 'lucide-react';
import { PageHeader } from '../../app/PageHeader';
import { MonthSelector } from '../../components/MonthSelector';
import { EmptyState } from '../../components/Feedback';
import { Button } from '../../components/Button';
import { TransactionRow } from '../../components/TransactionRow';
import { ErrorBoundary } from '../../app/ErrorBoundary';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import {
  compareTransactions,
  expenseByCategory,
  inMonth,
  monthlyTrend,
  summarize,
  EMPTY_FILTERS,
} from '../../domain/transactions';
import { MINUS } from '../../domain/money';
import { useFormat } from '../../i18n/format';
import { ACCEPT_ATTR, filesFromList, useEnqueueFiles } from '../add/useEnqueue';
import { CategoryBars, TrendChart } from './charts';
import ui from '../../components/ui.module.css';
import s from './dashboard.module.css';
import { cn } from '../../components/cn';

/** First-use empty state with Upload (opens picker in the same gesture) + Manual (OMX-026 AC1). */
export function FirstUseEmpty() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const enqueueFiles = useEnqueueFiles();
  return (
    <div className={ui.card}>
      <EmptyState
        icon={<ScanText size={44} />}
        title={t('empty.firstUse.title')}
        body={t('empty.firstUse.body')}
        actions={
          <>
            <Button
              icon={<ImageUp size={20} aria-hidden="true" />}
              onClick={() => fileRef.current?.click()}
            >
              {t('empty.firstUse.upload')}
            </Button>
            <Button
              variant="secondary"
              icon={<PencilLine size={20} aria-hidden="true" />}
              onClick={() => navigate('/transactions/new')}
            >
              {t('empty.firstUse.manual')}
            </Button>
          </>
        }
      />
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT_ATTR}
        multiple
        hidden
        onChange={(e) => {
          const files = filesFromList(e.target.files);
          e.target.value = '';
          if (!files.length) return;
          navigate('/add');
          void enqueueFiles(files);
        }}
      />
    </div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const f = useFormat();
  const navigate = useNavigate();
  const all = useAppStore((st) => st.transactions);
  const ym = useUiStore((st) => st.selectedMonth);
  const setFilters = useUiStore((st) => st.setFilters);
  const setAddOpen = useUiStore((st) => st.setAddSheetOpen);

  const month = useMemo(() => inMonth(all, ym), [all, ym]);
  const sum = useMemo(() => summarize(month), [month]);
  const slices = useMemo(() => expenseByCategory(month), [month]);
  const trend = useMemo(() => monthlyTrend(all, ym, 6), [all, ym]);
  const recent = useMemo(() => [...month].sort(compareTransactions).slice(0, 3), [month]);

  const negative = sum.balance < 0;
  const balanceText = `${negative ? MINUS : ''}${f.money(sum.balance)}`;

  return (
    <>
      <PageHeader title={t('dashboard.title')} />
      {all.length === 0 ? (
        <FirstUseEmpty />
      ) : (
        <>
          <div className={s.monthRow}>
            <MonthSelector />
          </div>
          <div className={s.grid}>
            <section
              className={cn(s.hero, s.heroCell)}
              role="group"
              aria-label={t('dashboard.srBalanceTile', { amount: balanceText })}
            >
              <p className={s.heroLabel}>{t('dashboard.balance')}</p>
              <p className={cn(s.heroValue, negative && s.negative)}>
                <span className={s.heroCurrency} aria-hidden="true">
                  ฿
                </span>
                <span className="omx-amount omx-amount-hero" data-testid="balance">
                  {balanceText}
                </span>
              </p>
              {negative ? (
                <p className={s.negativeNote}>
                  <TriangleAlert size={16} aria-hidden="true" />
                  {t('dashboard.balanceNegative')}
                </p>
              ) : (
                <p className={s.heroHint}>{t('dashboard.balanceHint')}</p>
              )}
            </section>
            <div className={cn(s.tiles, s.tilesCell)}>
              <section
                className={s.tile}
                role="group"
                aria-label={t('dashboard.srIncomeTile', { amount: f.money(sum.income) })}
              >
                <p className={s.tileHead}>
                  <span className={cn(s.tileIcon, s.tileIconIncome)} aria-hidden="true">
                    <ArrowDownLeft size={18} />
                  </span>
                  {t('dashboard.totalIncome')}
                </p>
                <p
                  className={cn(s.tileValue, 'omx-amount', ui.amountIncome)}
                  data-testid="total-income"
                >
                  {f.signed(sum.income)}
                </p>
              </section>
              <section
                className={s.tile}
                role="group"
                aria-label={t('dashboard.srExpenseTile', { amount: f.money(sum.expense) })}
              >
                <p className={s.tileHead}>
                  <span className={cn(s.tileIcon, s.tileIconExpense)} aria-hidden="true">
                    <ArrowUpRight size={18} />
                  </span>
                  {t('dashboard.totalExpense')}
                </p>
                <p
                  className={cn(s.tileValue, 'omx-amount', ui.amountExpense)}
                  data-testid="total-expense"
                >
                  {f.signed(-sum.expense)}
                </p>
              </section>
            </div>

            {month.length === 0 ? (
              <div className={cn(ui.card, s.trendCell)}>
                <EmptyState
                  icon={<CalendarX2 size={44} />}
                  title={t('empty.month.title')}
                  body={t('empty.month.body')}
                  actions={
                    <Button onClick={() => setAddOpen(true)}>{t('empty.month.action')}</Button>
                  }
                />
              </div>
            ) : (
              <>
                <div className={s.catCell}>
                  <ErrorBoundary compact>
                    {slices.length ? (
                      <CategoryBars
                        slices={slices}
                        onSelect={(c) => {
                          setFilters({ ...EMPTY_FILTERS, categories: [c] });
                          navigate('/transactions');
                        }}
                      />
                    ) : (
                      <section className={ui.card}>
                        <h2 className={ui.cardTitle}>{t('dashboard.byCategory')}</h2>
                        <p className={ui.muted}>{t('empty.chart.noExpense')}</p>
                      </section>
                    )}
                  </ErrorBoundary>
                </div>
                <section className={cn(ui.card, s.recentCell)} aria-labelledby="recent-title">
                  <div className={ui.cardHeader}>
                    <h2 id="recent-title" className={ui.cardTitle}>
                      {t('dashboard.recent')}
                    </h2>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/transactions')}>
                      {t('common.viewAll')}
                    </Button>
                  </div>
                  <div className={s.recentList}>
                    {recent.map((tx) => (
                      <TransactionRow
                        key={tx.id}
                        tx={tx}
                        onOpen={() => navigate(`/transactions/${tx.id}`)}
                      />
                    ))}
                  </div>
                </section>
              </>
            )}
            {all.length > 0 && (
              <div className={s.trendCell}>
                <ErrorBoundary compact>
                  <TrendChart points={trend} current={ym} />
                </ErrorBoundary>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
