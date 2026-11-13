/** Review screen (OMX-012a/b): edit, select, save atomically; image viewer; leave guard. */
import { useMemo, useRef, useState } from 'react';
import { useBlocker, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ChevronLeft,
  CircleAlert,
  CircleCheck,
  ImageUp,
  PencilLine,
  ScanText,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { PageHeader } from '../../app/PageHeader';
import { Button, IconButton } from '../../components/Button';
import { ConfirmDialog, Modal } from '../../components/Modal';
import { EmptyState } from '../../components/Feedback';
import { TransactionRow } from '../../components/TransactionRow';
import {
  isItemValid,
  processingCount,
  reviewableItems,
  useQueueStore,
  type QueueItem,
} from '../../store/queueStore';
import { useAppStore } from '../../store/appStore';
import { useUiStore } from '../../store/uiStore';
import { useBeforeUnload } from '../add/useBeforeUnload';
import { ReviewCard } from './ReviewCard';
import ui from '../../components/ui.module.css';
import s from './review.module.css';

function ImageViewer({ item, onClose }: { item: QueueItem | null; onClose: () => void }) {
  const { t } = useTranslation();
  const [zoom, setZoom] = useState(1);
  return (
    <Modal open={!!item} onClose={onClose} title={t('review.imageDialogTitle')} variant="sheet">
      {item && (
        <div className={s.viewer}>
          <div className={ui.row}>
            <IconButton
              label={t('review.zoomOut')}
              disabled={zoom <= 1}
              onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
            >
              <ZoomOut size={22} aria-hidden="true" />
            </IconButton>
            <IconButton
              label={t('review.zoomIn')}
              disabled={zoom >= 4}
              onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
            >
              <ZoomIn size={22} aria-hidden="true" />
            </IconButton>
          </div>
          <div className={s.viewerFrame}>
            <img src={item.url} alt={item.name} style={{ width: `${zoom * 100}%` }} />
          </div>
        </div>
      )}
    </Modal>
  );
}

export function ReviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const items = useQueueStore((st) => st.items);
  const saveSelected = useQueueStore((st) => st.saveSelected);
  const selectAll = useQueueStore((st) => st.selectAll);
  const discard = useQueueStore((st) => st.discard);
  const transactions = useAppStore((st) => st.transactions);
  const showToast = useUiStore((st) => st.showToast);

  const reviewable = reviewableItems(items);
  const stillProcessing = processingCount(items);
  const [savedAny, setSavedAny] = useState(false);
  const failedAll =
    !savedAny &&
    items.length > 0 &&
    reviewable.length === 0 &&
    stillProcessing === 0 &&
    items.every((i) => i.status === 'failed' || i.status === 'cancelled');
  const selected = reviewable.filter((i) => i.selected);
  const invalidSelected = selected.filter((i) => !isItemValid(i)).length;
  const canSave = selected.length > 0 && invalidSelected === 0;

  // First card needing attention starts expanded.
  const firstAttention = useMemo(
    () =>
      reviewable.find((i) => !isItemValid(i) || i.parsed?.confidence !== 'high')?.id ??
      reviewable[0]?.id,
    // only on first render
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(firstAttention ? [firstAttention] : []),
  );
  const [showErrors, setShowErrors] = useState(false);
  const [viewer, setViewer] = useState<QueueItem | null>(null);
  const [toDiscard, setToDiscard] = useState<QueueItem | null>(null);
  const [existing, setExisting] = useState<QueueItem | null>(null);
  const allowLeave = useRef(false);

  const unsaved = reviewable.length > 0;
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      unsaved &&
      !allowLeave.current &&
      currentLocation.pathname !== nextLocation.pathname &&
      nextLocation.pathname !== '/add',
  );
  useBeforeUnload(unsaved);

  const save = () => {
    setShowErrors(true);
    if (!canSave) return;
    const r = saveSelected();
    if (!r.ok) return; // storage banner (OMX-012a AC7)
    setSavedAny(true);
    showToast({
      message: t('review.saved', { count: r.saved }),
      variant: 'success',
      action: {
        label: t('review.savedAction'),
        onAction: () => {
          allowLeave.current = true;
          navigate('/transactions');
        },
      },
    });
    if (useQueueStore.getState().items.filter((i) => i.status === 'done').length === 0) {
      allowLeave.current = true;
    }
  };

  const existingTx =
    existing?.duplicate && !existing.duplicate.existingId.startsWith('queue:')
      ? transactions.find((tx) => tx.id === existing.duplicate!.existingId)
      : undefined;
  const reasonId = 'review-save-reason';

  return (
    <>
      <PageHeader
        title={t('review.title')}
        showLang={false}
        lead={
          <IconButton label={t('common.back')} onClick={() => navigate('/add')}>
            <ChevronLeft size={24} aria-hidden="true" />
          </IconButton>
        }
        trailing={
          reviewable.length > 0 ? (
            <span className={ui.muted}>
              {t('transactions.results', { count: reviewable.length })}
            </span>
          ) : undefined
        }
      />
      {failedAll ? (
        <div className={ui.card}>
          <EmptyState
            icon={<ScanText size={40} />}
            title={t('empty.reviewAllFailed.title')}
            body={t('empty.reviewAllFailed.body')}
            actions={
              <>
                <Button
                  icon={<PencilLine size={20} aria-hidden="true" />}
                  onClick={() => navigate('/transactions/new')}
                >
                  {t('empty.reviewAllFailed.action')}
                </Button>
                <Button
                  variant="secondary"
                  icon={<ImageUp size={20} aria-hidden="true" />}
                  onClick={() => navigate('/add')}
                >
                  {t('empty.reviewAllFailed.secondary')}
                </Button>
              </>
            }
          />
        </div>
      ) : reviewable.length === 0 && stillProcessing === 0 ? (
        <div className={ui.card}>
          <EmptyState
            icon={<CircleCheck size={40} />}
            title={t('empty.reviewNothing.title')}
            body={t('empty.reviewNothing.body')}
            actions={
              <Button onClick={() => navigate('/transactions')}>
                {t('empty.reviewNothing.action')}
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <p className={s.intro}>{t('review.intro')}</p>
          {stillProcessing > 0 && (
            <p className={s.processing} aria-live="polite">
              <span className={ui.spinner} aria-hidden="true" />
              {t('review.stillProcessing', { count: stillProcessing })}
            </p>
          )}
          <div className={s.list}>
            {reviewable.map((item, i) => (
              <ReviewCard
                key={item.id}
                item={item}
                index={i + 1}
                total={reviewable.length}
                expanded={expanded.has(item.id)}
                showErrors={showErrors}
                onToggle={() =>
                  setExpanded((prev) => {
                    const next = new Set(prev);
                    if (next.has(item.id)) next.delete(item.id);
                    else next.add(item.id);
                    return next;
                  })
                }
                onOpenImage={setViewer}
                onDiscard={setToDiscard}
                onViewExisting={setExisting}
              />
            ))}
          </div>
          <div className={s.footer}>
            <div className={s.footerInner}>
              {!canSave && (
                <p id={reasonId} className={s.reason}>
                  <CircleAlert size={16} aria-hidden="true" />
                  {selected.length === 0
                    ? t('review.noneSelected')
                    : t('review.needsFixing', { count: invalidSelected })}
                </p>
              )}
              <div className={s.footerRow}>
                <Button
                  variant="ghost"
                  onClick={() => selectAll(selected.length !== reviewable.length)}
                >
                  {selected.length === reviewable.length
                    ? t('common.selectNone')
                    : t('common.selectAll')}
                </Button>
                <Button
                  disabled={!canSave}
                  aria-describedby={!canSave ? reasonId : undefined}
                  onClick={save}
                >
                  {t('review.saveSelected', { count: selected.length })}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      <ImageViewer item={viewer} onClose={() => setViewer(null)} />
      <Modal open={!!existing} onClose={() => setExisting(null)} title={t('review.existingTitle')}>
        {existingTx ? (
          <TransactionRow tx={existingTx} />
        ) : (
          <p className={ui.muted}>{t('review.possibleDuplicate')}</p>
        )}
        <div className={ui.dialogActions}>
          <Button variant="secondary" onClick={() => setExisting(null)}>
            {t('common.close')}
          </Button>
        </div>
      </Modal>
      <ConfirmDialog
        open={!!toDiscard}
        destructive
        title={t('review.discardTitle')}
        body={t('review.discardBody')}
        confirmLabel={t('review.discardConfirm')}
        cancelLabel={t('common.cancel')}
        onConfirm={() => {
          if (toDiscard) discard(toDiscard.id);
          setToDiscard(null);
        }}
        onCancel={() => setToDiscard(null)}
      />
      <ConfirmDialog
        open={blocker.state === 'blocked'}
        destructive
        title={t('review.leaveTitle')}
        body={t('review.leaveBody')}
        confirmLabel={t('review.leaveConfirm')}
        cancelLabel={t('review.stay')}
        onConfirm={() => blocker.proceed?.()}
        onCancel={() => blocker.reset?.()}
      />
    </>
  );
}
