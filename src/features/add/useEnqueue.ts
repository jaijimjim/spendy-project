import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueueStore, type QueueItem } from '../../store/queueStore';
import { useUiStore } from '../../store/uiStore';
import type { SkipSummary } from '../../domain/file';

/** Compose "ข้าม 2 ไฟล์: ชนิดไฟล์ไม่รองรับ 1, เกิน 10 MB 1" (OMX-001 AC5). */
export function useSkipMessage() {
  const { t } = useTranslation();
  return useCallback(
    (s: SkipSummary, count: number) => {
      const parts = [
        s.type && t('addSlip.skippedType', { count: s.type }),
        s.size && t('addSlip.skippedSize', { count: s.size }),
        s.limit && t('addSlip.skippedLimit', { count: s.limit }),
        s.duplicateInBatch && t('addSlip.skippedDuplicateInBatch', { count: s.duplicateInBatch }),
      ].filter(Boolean);
      return t('addSlip.skippedSummary', { count, reasons: parts.join(', ') });
    },
    [t],
  );
}

export function useEnqueueFiles() {
  const enqueue = useQueueStore((s) => s.enqueue);
  const showToast = useUiStore((s) => s.showToast);
  const skipMessage = useSkipMessage();
  return useCallback(
    async (files: { blob: Blob; name: string; origin?: QueueItem['origin'] }[]) => {
      const r = await enqueue(files);
      if (r.skippedCount > 0)
        showToast({ message: skipMessage(r.skipped, r.skippedCount), variant: 'warning' });
      return r;
    },
    [enqueue, showToast, skipMessage],
  );
}

export const ACCEPT_ATTR = 'image/jpeg,image/png,image/webp';

export function filesFromList(list: FileList | null): { blob: Blob; name: string }[] {
  return Array.from(list ?? [], (f) => ({ blob: f, name: f.name }));
}
