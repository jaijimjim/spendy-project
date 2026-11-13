/** Hand-rolled SVG charts (ADR-0002, OMX-019/020): no chart library, single accent, text tables. */
import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { CategorySlice, TrendPoint } from '../../domain/transactions';
import { formatCompact } from '../../domain/money';
import { useFormat } from '../../i18n/format';
import { CategoryChip } from '../../components/CategoryIcon';
import ui from '../../components/ui.module.css';
import s from './dashboard.module.css';
import { cn } from '../../components/cn';
import type { CategoryId } from '../../domain/types';

export function CategoryBars({
  slices,
  onSelect,
}: {
  slices: CategorySlice[];
  onSelect: (c: CategoryId) => void;
}) {
  const { t } = useTranslation();
  const f = useFormat();
  const [showAll, setShowAll] = useState(false);
  const [asTable, setAsTable] = useState(false);
  const visible = showAll ? slices : slices.slice(0, 6);
  const max = Math.max(1, ...slices.map((x) => x.amount));
  const pct = (p: number) => `${p.toFixed(1)}%`;
  return (
    <section className={ui.card} aria-labelledby="cat-title">
      <div className={ui.cardHeader}>
        <div>
          <h2 id="cat-title" className={ui.cardTitle}>
            {t('dashboard.byCategory')}
          </h2>
          <p className={ui.cardHint}>{t('dashboard.byCategoryHint')}</p>
        </div>
        <button
          type="button"
          className={cn(ui.btn, ui.ghost, ui.sm)}
          aria-pressed={asTable}
          onClick={() => setAsTable((v) => !v)}
        >
          {asTable ? t('common.viewAsChart') : t('common.viewAsTable')}
        </button>
      </div>
      {asTable ? (
        <table className={s.table}>
          <thead>
            <tr>
              <th scope="col">{t('dashboard.tableCategory')}</th>
              <th scope="col" className={s.num}>
                {t('dashboard.tableAmount')}
              </th>
              <th scope="col" className={s.num}>
                {t('dashboard.tablePercent')}
              </th>
            </tr>
          </thead>
          <tbody>
            {slices.map((x) => (
              <tr key={x.categoryId}>
                <td>{t(`categories.${x.categoryId}`)}</td>
                <td className={s.num}>{f.money(x.amount)}</td>
                <td className={s.num}>{pct(x.percent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ul className={s.catList}>
          {visible.map((x) => (
            <li key={x.categoryId}>
              <button type="button" className={s.catRow} onClick={() => onSelect(x.categoryId)}>
                <CategoryChip id={x.categoryId} size="sm" />
                <span className={s.catName}>{t(`categories.${x.categoryId}`)}</span>
                <span className={s.catValue}>
                  <span className="omx-amount">{f.money(x.amount)}</span>
                  <span className={s.catPct}>{pct(x.percent)}</span>
                </span>
                <span className={s.bar} aria-hidden="true">
                  <span
                    className={s.barFill}
                    style={{ display: 'block', width: `${(x.amount / max) * 100}%` }}
                  />
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {!asTable && slices.length > 6 && !showAll && (
        <button
          type="button"
          className={cn(ui.btn, ui.ghost, ui.sm)}
          onClick={() => setShowAll(true)}
        >
          {t('common.viewAll')}
        </button>
      )}
    </section>
  );
}

const H = 200;
const PAD_L = 36;
const PAD_B = 26;
const PAD_T = 8;

export function TrendChart({ points, current }: { points: TrendPoint[]; current: string }) {
  const { t } = useTranslation();
  const f = useFormat();
  const [asTable, setAsTable] = useState(false);
  const patternId = useId().replace(/:/g, '');
  // Draw in CSS pixels at the container's width so text never scales (no viewBox stretching).
  const boxRef = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(340);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(
      ([entry]) => entry && setW(Math.max(240, Math.round(entry.contentRect.width))),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, [asTable]);
  const max = Math.max(1, ...points.flatMap((p) => [p.income, p.expense]));
  const plotH = H - PAD_B - PAD_T;
  const groupW = (W - PAD_L) / points.length;
  const barW = Math.min(W > 600 ? 24 : 14, groupW / 3);
  const y = (v: number) => PAD_T + plotH - (v / max) * plotH;
  const ticks = [0, max / 2, max];
  const summary = t('dashboard.trendSummary', {
    from: f.month(points[0]!.month),
    to: f.month(points[points.length - 1]!.month),
  });

  return (
    <section className={ui.card} aria-labelledby="trend-title">
      <div className={ui.cardHeader}>
        <h2 id="trend-title" className={ui.cardTitle}>
          {t('dashboard.trend')}
        </h2>
        <button
          type="button"
          className={cn(ui.btn, ui.ghost, ui.sm)}
          aria-pressed={asTable}
          onClick={() => setAsTable((v) => !v)}
        >
          {asTable ? t('common.viewAsChart') : t('common.viewAsTable')}
        </button>
      </div>
      {asTable ? (
        <table className={s.table}>
          <caption className="omx-visually-hidden">{summary}</caption>
          <thead>
            <tr>
              <th scope="col">{t('dashboard.tableMonth')}</th>
              <th scope="col" className={s.num}>
                {t('type.income')}
              </th>
              <th scope="col" className={s.num}>
                {t('type.expense')}
              </th>
            </tr>
          </thead>
          <tbody>
            {points.map((p) => (
              <tr key={p.month}>
                <th scope="row">{f.month(p.month)}</th>
                <td className={s.num}>{f.money(p.income)}</td>
                <td className={s.num}>{f.money(p.expense)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <>
          <ul className={s.legend} aria-hidden="true">
            <li>
              <svg width="14" height="14">
                <rect width="14" height="14" rx="3" fill="var(--omx-color-chart-income)" />
              </svg>
              {t('type.income')}
            </li>
            <li>
              <svg width="14" height="14">
                <rect
                  width="14"
                  height="14"
                  rx="3"
                  fill={`url(#${patternId})`}
                  stroke="var(--omx-color-chart-expense)"
                />
              </svg>
              {t('type.expense')}
            </li>
          </ul>
          <div ref={boxRef}>
            <svg
              className={s.trendSvg}
              width={W}
              height={H}
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={summary}
            >
              <defs>
                <pattern
                  id={patternId}
                  width="6"
                  height="6"
                  patternUnits="userSpaceOnUse"
                  patternTransform="rotate(45)"
                >
                  <rect width="6" height="6" fill="var(--omx-color-expense-subtle)" />
                  <rect width="3" height="6" fill="var(--omx-color-chart-expense)" />
                </pattern>
              </defs>
              {ticks.map((v, i) => (
                <g key={i}>
                  <line
                    x1={PAD_L}
                    x2={W}
                    y1={y(v)}
                    y2={y(v)}
                    stroke="var(--omx-color-chart-grid)"
                    strokeDasharray={i ? '3 3' : undefined}
                  />
                  <text x={PAD_L - 6} y={y(v) + 4} textAnchor="end">
                    {formatCompact(v)}
                  </text>
                </g>
              ))}
              {points.map((p, i) => {
                const cx = PAD_L + groupW * i + groupW / 2;
                return (
                  <g key={p.month}>
                    <rect
                      className={s.trendBar}
                      x={cx - barW - 2}
                      y={y(p.income)}
                      width={barW}
                      height={Math.max(0, PAD_T + plotH - y(p.income))}
                      rx="3"
                      fill="var(--omx-color-chart-income)"
                    />
                    <rect
                      className={s.trendBar}
                      x={cx + 2}
                      y={y(p.expense)}
                      width={barW}
                      height={Math.max(0, PAD_T + plotH - y(p.expense))}
                      rx="3"
                      fill={`url(#${patternId})`}
                      stroke={p.expense > 0 ? 'var(--omx-color-chart-expense)' : 'none'}
                    />
                    <text
                      x={cx}
                      y={H - 6}
                      textAnchor="middle"
                      className={p.month === current ? s.current : undefined}
                    >
                      {f.monthShort(p.month)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </>
      )}
    </section>
  );
}
