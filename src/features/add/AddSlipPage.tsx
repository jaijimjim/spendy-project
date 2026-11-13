/** Add slip + OCR queue (OMX-001, 002, 005, 030 AC5) — screens.md §5. */
import { useEffect, useRef, useState, type DragEvent } from 'react';
import { Link, useBlocker, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  Ban,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock,
  ImageUp,
  LockKeyhole,
  PencilLine,
  RotateCcw,
  X,
} from 'lucide-react';
import { PageHeader } from '../../app/PageHeader';
import { Button, IconButton } from '../../components/Button';
import { EmptyState, ProgressBar } from '../../components/Feedback';
import { ConfirmDialog } from '../../components/Modal';
import {
  processingCount,
  reviewableItems,
  useQueueStore,
  type QueueItem,
} from '../../store/queueStore';
import { useUiStore } from '../../store/uiStore';
import { useFormat } from '../../i18n/format';
import { ACCEPT_ATTR, filesFromList, useEnqueueFiles } from './useEnqueue';
import { GooglePhotosPanel } from './GooglePhotosPanel';
import { useBeforeUnload } from './useBeforeUnload';
import ui from '../../components/ui.module.css';
import s from './add.module.css';
import { cn } from '../../components/cn';

function statusText(t: TFunction, item: QueueItem): string {
  switch (item.status) {
    case 'waiting':
      return t('queue.status.waiting');
    case 'loadingModel':
      return t('queue.status.loadingModel');
    case 'recognizing':
      return t('queue.status.recognizing', { percent: item.progress });
    case 'done':
      return t('queue.status.done');
    case 'failed':
      return t('queue.status.failed');
    case 'cancelled':
      return t('queue.status.cancelled');
  }
}

function QueueRow({ item }: { item: QueueItem }) {
  const { t } = useTranslation();
  const f = useFormat();
  const navigate = useNavigate();
  const remove = useQueueStore((st) => st.remove);
  const retry = useQueueStore((st) => st.retry);
  const text = statusText(t, item);
  const p = item.parsed;
  return (
    <li className={s.item}>
      <img className={s.thumb} src={item.url} alt="" />
      <div className={s.itemMain}>
        <span className={s.itemName}>{item.name}</span>
        {item.status === 'done' ? (
          <>
            <span className={cn(s.itemStatus, s.statusDone)}>
              <CircleCheck size={18} aria-hidden="true" />
              {text}
            </span>
            {p && (
              <span className={cn(s.itemSummary, 'omx-amount')}>
                {p.amountSatang !== null
                  ? f.txSigned({ type: p.type, amountSatang: p.amountSatang })
                  : '—'}{' '}
                · {t(`categories.${p.categoryId}`)}
              </span>
            )}
          </>
        ) : item.status === 'failed' ? (
          <>
            <span className={cn(s.itemStatus, s.statusFailed)}>
              <CircleAlert size={18} aria-hidden="true" />
              {text}
            </span>
            <span className={ui.muted}>
              {t(`queue.failedReason.${item.failReason ?? 'unknown'}`)}
            </span>
            <span className={s.itemActions}>
              <Button
                variant="ghost"
                size="sm"
                icon={<RotateCcw size={18} aria-hidden="true" />}
                onClick={() => retry(item.id)}
              >
                {t('common.retry')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                icon={<PencilLine size={18} aria-hidden="true" />}
                onClick={() => navigate('/transactions/new')}
              >
                {t('queue.enterManually')}
              </Button>
            </span>
          </>
        ) : item.status === 'recognizing' || item.status === 'loadingModel' ? (
          <>
            <span className={s.itemStatus}>{text}</span>
            <ProgressBar
              value={item.progress}
              indeterminate={item.status === 'loadingModel'}
              label={t('queue.progressLabel', { name: item.name })}
            />
          </>
        ) : (
          <span className={cn(s.itemStatus, s.statusMuted)}>
            {item.status === 'waiting' ? (
              <Clock size={18} aria-hidden="true" />
            ) : (
              <Ban size={18} aria-hidden="true" />
            )}
            {text}
          </span>
        )}
      </div>
      {item.status === 'waiting' && (
        <IconButton label={t('queue.remove', { name: item.name })} onClick={() => remove(item.id)}>
          <X size={20} aria-hidden="true" />
        </IconButton>
      )}
    </li>
  );
}

/** Announce status changes once (not every percent) — OMX-005 AC9. */
function useStatusAnnouncements(items: QueueItem[]) {
  const { t } = useTranslation();
  const announce = useUiStore((st) => st.announce);
  const last = useRef(new Map<string, string>());
  useEffect(() => {
    for (const it of items) {
      const prev = last.current.get(it.id);
      if (prev !== undefined && prev !== it.status && it.status !== 'recognizing') {
        announce(t('queue.srStatus', { name: it.name, status: statusText(t, it) }));
      }
      last.current.set(it.id, it.status);
    }
  }, [items, announce, t]);
}

export function AddSlipPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const startGoogle = !!(location.state as { startGoogle?: boolean } | null)?.startGoogle;
  const items = useQueueStore((st) => st.items);
  const cancel = useQueueStore((st) => st.cancel);
  const enqueueFiles = useEnqueueFiles();
  const showToast = useUiStore((st) => st.showToast);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  useStatusAnnouncements(items);

  const processing = processingCount(items);
  const ready = reviewableItems(items).length;
  const finished = items.filter((i) => i.status === 'done' || i.status === 'failed').length;
  const active = items.filter((i) => i.status !== 'cancelled');
  const firstRun = items.some((i) => i.status === 'loadingModel');

  // Leave guard while OCR runs or results await review (OMX-005 AC8).
  const guard = processing > 0;
  const blocker = useBlocker(
    ({ nextLocation }) => guard && !nextLocation.pathname.startsWith('/add'),
  );
  useBeforeUnload(guard || ready > 0);

  // Prevent the browser from opening images dropped outside the zone (OMX-002 AC3).
  useEffect(() => {
    const prevent = (e: Event) => e.preventDefault();
    window.addEventListener('dragover', prevent);
    window.addEventListener('drop', prevent);
    return () => {
      window.removeEventListener('dragover', prevent);
      window.removeEventListener('drop', prevent);
    };
  }, []);

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = filesFromList(e.dataTransfer.files);
    if (!files.length) {
      showToast({ message: t('addSlip.dropNotImages'), variant: 'warning' });
      return;
    }
    void enqueueFiles(files);
  };

  return (
    <>
      <PageHeader title={t('addSlip.title')} />
      <div className={s.layout}>
        <div className={s.col}>
          <p className={s.trust}>
            <LockKeyhole size={18} aria-hidden="true" />
            <span>
              {t('addSlip.trust')} · <Link to="/settings#privacy">{t('addSlip.trustLink')}</Link>
            </span>
          </p>
          <div
            className={cn(s.drop, dragOver && s.dropActive)}
            onDragEnter={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false);
            }}
            onDrop={onDrop}
            data-testid="dropzone"
          >
            <span className={s.dropHint} aria-hidden="true">
              <ImageUp size={32} />
              {dragOver ? (
                <span className={s.dropActiveLabel}>{t('addSlip.dropHere')}</span>
              ) : (
                t('addSlip.dropzoneLabel')
              )}
            </span>
            <Button
              className={s.uploadBtn}
              icon={<ImageUp size={22} aria-hidden="true" />}
              onClick={() => fileRef.current?.click()}
            >
              {t('addSlip.uploadButton')}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT_ATTR}
              multiple
              hidden
              data-testid="file-input"
              onChange={(e) => {
                const files = filesFromList(e.target.files);
                e.target.value = '';
                if (files.length) void enqueueFiles(files); // cancel ⇒ nothing (AC8)
              }}
            />
            <p className={s.rules}>{t('addSlip.fileRules')}</p>
            <p className={s.rules}>{t('addSlip.tips')}</p>
          </div>
          <GooglePhotosPanel autoStart={startGoogle} />
        </div>

        <div className={s.col}>
          {items.length === 0 ? (
            <div className={ui.card}>
              <EmptyState
                icon={<ImageUp size={40} />}
                title={t('empty.queue.title')}
                body={t('empty.queue.body')}
              />
            </div>
          ) : (
            <section className={ui.card} aria-labelledby="queue-title">
              <div className={s.queueHead}>
                <h2 id="queue-title" className={s.queueTitle}>
                  {t('queue.progress', { done: finished, total: active.length })}
                </h2>
                {processing > 0 && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      void cancel().then(() =>
                        showToast({ message: t('queue.cancelled'), variant: 'info' }),
                      )
                    }
                  >
                    {t('queue.cancel')}
                  </Button>
                )}
              </div>
              <ProgressBar
                value={active.length ? Math.round((finished / active.length) * 100) : 0}
                label={t('queue.title')}
              />
              {firstRun && <p className={s.notice}>{t('queue.loadingModel')}</p>}
              <ul className={s.queueList}>
                {items.map((it) => (
                  <QueueRow key={it.id} item={it} />
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
      {ready > 0 && (
        <>
          <div className={s.spacer} />
          <div className={s.footer}>
            <div>
              <Button block onClick={() => navigate('/add/review')}>
                {t('queue.review', { count: ready })}
                <ChevronRight size={20} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </>
      )}
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        title={t('queue.leaveTitle')}
        body={t('queue.leaveBody')}
        confirmLabel={t('queue.leaveConfirm')}
        cancelLabel={t('queue.stay')}
        destructive
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}
