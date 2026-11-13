/**
 * OCR queue + Review drafts (OMX-001, 005, 011, 012). Lives in memory only — images are never
 * persisted (R8). Exactly one OCR worker processes items sequentially (OMX-005 AC3).
 */
import { create } from 'zustand';
import {
  checkFile,
  MAX_QUEUE,
  summarizeSkips,
  type SkipReason,
  type SkipSummary,
} from '../domain/file';
import { parseSlip, RAW_TEXT_LIMIT, type ParsedSlip } from '../domain/slip/parseSlip';
import { findDuplicate, type DuplicateMatch } from '../domain/duplicate';
import { hasErrors, validateDraft, type Draft } from '../domain/validation';
import { parseMoneyInput, satangToInput } from '../domain/money';
import type { Transaction } from '../domain/types';
import { getOcrEngine } from '../services/ocr';
import { OcrError, type OcrErrorReason } from '../services/ocr/types';
import { sha256Hex } from '../services/hash';
import { nowIso, today } from '../services/clock';
import { useAppStore } from './appStore';

export type QueueStatus =
  'waiting' | 'loadingModel' | 'recognizing' | 'done' | 'failed' | 'cancelled';

export interface QueueItem {
  id: string;
  name: string;
  blob: Blob;
  url: string;
  hash: string;
  origin: 'upload' | 'google';
  status: QueueStatus;
  progress: number;
  failReason?: OcrErrorReason;
  text: string;
  parsed: ParsedSlip | null;
  draft: Draft | null;
  selected: boolean;
  duplicate: DuplicateMatch;
}

export interface EnqueueResult {
  added: number;
  skipped: SkipSummary;
  skippedCount: number;
}

interface QueueState {
  items: QueueItem[];
  running: boolean;
  enqueue(
    files: { blob: Blob; name: string; origin?: QueueItem['origin'] }[],
  ): Promise<EnqueueResult>;
  remove(id: string): void;
  cancel(): Promise<void>;
  retry(id: string): void;
  updateDraft(id: string, patch: Partial<Draft>): void;
  setSelected(id: string, selected: boolean): void;
  selectAll(selected: boolean): void;
  discard(id: string): void;
  saveSelected(): { ok: boolean; saved: number };
  clear(): void;
}

const uid = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;

export function draftFromParsed(p: ParsedSlip): Draft {
  return {
    type: p.type,
    categoryId: p.categoryId,
    amount: p.amountSatang !== null && p.amountSatang > 0 ? satangToInput(p.amountSatang) : '',
    date: p.date,
    time: p.time ?? '',
    payee: p.payee ?? '',
    note: p.note ?? '',
  };
}

export function isItemValid(item: QueueItem): boolean {
  return !!item.draft && !hasErrors(validateDraft(item.draft));
}

/** Convert a reviewed draft into a stored transaction (OMX-012a AC8). */
export function draftToTransaction(item: QueueItem, id = uid(), now = nowIso()): Transaction {
  const d = item.draft!;
  const money = parseMoneyInput(d.amount);
  const tx: Transaction = {
    id,
    type: d.type,
    categoryId: d.categoryId!,
    amountSatang: money.ok ? money.satang : 0,
    date: d.date,
    source: 'slip',
    slip: {
      imageHash: item.hash || undefined,
      confidence: item.parsed?.confidence ?? 'low',
      rawText: item.text.trim().slice(0, RAW_TEXT_LIMIT) || undefined,
      ...(item.parsed?.refNo ? { refNo: item.parsed.refNo } : {}),
      ...(item.parsed?.bank ? { bank: item.parsed.bank } : {}),
    },
    createdAt: now,
    updatedAt: now,
  };
  if (d.time) tx.time = d.time;
  if (d.payee.trim()) tx.payee = d.payee.trim();
  if (d.note.trim()) tx.note = d.note.trim();
  return tx;
}

async function readHead(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.slice(0, 16).arrayBuffer());
}

/** Rejects when cancel() is called — Tesseract's terminate() may leave a job promise pending. */
let cancelHandlers: (() => void)[] = [];
function cancellation(): { promise: Promise<never>; dispose: () => void } {
  let handler: () => void = () => undefined;
  const promise = new Promise<never>((_, reject) => {
    handler = () => reject(new OcrError('cancelled'));
    cancelHandlers.push(handler);
  });
  promise.catch(() => undefined);
  return { promise, dispose: () => (cancelHandlers = cancelHandlers.filter((h) => h !== handler)) };
}

export const useQueueStore = create<QueueState>((set, get) => {
  const patch = (id: string, p: Partial<QueueItem>) =>
    set((s) => ({ items: s.items.map((it) => (it.id === id ? { ...it, ...p } : it)) }));

  async function pump(): Promise<void> {
    if (get().running) return;
    set({ running: true });
    try {
      for (;;) {
        const next = get().items.find((i) => i.status === 'waiting');
        if (!next) break;
        await processOne(next);
      }
    } finally {
      set({ running: false });
    }
  }

  async function processOne(item: QueueItem): Promise<void> {
    const engine = await getOcrEngine();
    patch(item.id, { status: engine.isReady() ? 'recognizing' : 'loadingModel', progress: 0 });
    try {
      const recognition = engine.recognize(item.blob, item.name, (p) => {
        const cur = get().items.find((i) => i.id === item.id);
        if (!cur || cur.status === 'cancelled') return;
        if (p.phase === 'loadingModel') {
          if (cur.status !== 'loadingModel') patch(item.id, { status: 'loadingModel' });
        } else {
          const progress = Math.round(p.progress * 100);
          if (cur.status !== 'recognizing' || progress !== cur.progress)
            patch(item.id, { status: 'recognizing', progress });
        }
      });
      recognition.catch(() => undefined);
      const cancel = cancellation();
      const result = await Promise.race([recognition, cancel.promise]).finally(cancel.dispose);
      const cur = get().items.find((i) => i.id === item.id);
      if (!cur || cur.status === 'cancelled') return; // result discarded (AC5)
      const parsed = parseSlip(result.text, today());
      const saved = useAppStore.getState().transactions;
      let duplicate = findDuplicate(
        {
          imageHash: item.hash,
          refNo: parsed.refNo,
          amountSatang: parsed.amountSatang,
          date: parsed.date,
          time: parsed.time,
          payee: parsed.payee,
        },
        saved,
      );
      // Same refNo earlier in this batch ⇒ possible duplicate (OMX-011 AC5).
      if (!duplicate && parsed.refNo) {
        const twin = get().items.find((i) => i.id !== item.id && i.parsed?.refNo === parsed.refNo);
        if (twin) duplicate = { kind: 'possible', existingId: `queue:${twin.id}` };
      }
      patch(item.id, {
        status: 'done',
        progress: 100,
        text: result.text,
        parsed,
        draft: draftFromParsed(parsed),
        duplicate,
        selected: !duplicate,
      });
    } catch (e) {
      const cur = get().items.find((i) => i.id === item.id);
      if (!cur || cur.status === 'cancelled') return;
      const reason: OcrErrorReason = e instanceof OcrError ? e.reason : 'unknown';
      if (reason === 'cancelled') patch(item.id, { status: 'cancelled' });
      else patch(item.id, { status: 'failed', failReason: reason });
    }
  }

  return {
    items: [],
    running: false,

    async enqueue(files) {
      const reasons: SkipReason[] = [];
      const accepted: QueueItem[] = [];
      const existing = get().items.filter((i) => i.status !== 'cancelled');
      const hashes = new Set(existing.map((i) => i.hash));
      for (const f of files) {
        const head = await readHead(f.blob);
        const reason = checkFile({ name: f.name, size: f.blob.size, mime: f.blob.type, head });
        if (reason) {
          reasons.push(reason);
          continue;
        }
        if (existing.length + accepted.length >= MAX_QUEUE) {
          reasons.push('limit');
          continue;
        }
        const hash = await sha256Hex(await f.blob.arrayBuffer()).catch(() => '');
        if (hash && hashes.has(hash)) {
          reasons.push('duplicateInBatch');
          continue;
        }
        if (hash) hashes.add(hash);
        accepted.push({
          id: uid(),
          name: f.name,
          blob: f.blob,
          url: URL.createObjectURL(f.blob),
          hash,
          origin: f.origin ?? 'upload',
          status: 'waiting',
          progress: 0,
          text: '',
          parsed: null,
          draft: null,
          selected: false,
          duplicate: null,
        });
      }
      if (accepted.length) {
        set((s) => ({ items: [...s.items, ...accepted] }));
        void pump();
      }
      return {
        added: accepted.length,
        skipped: summarizeSkips(reasons),
        skippedCount: reasons.length,
      };
    },

    remove(id) {
      const it = get().items.find((i) => i.id === id);
      if (!it || it.status !== 'waiting') return;
      URL.revokeObjectURL(it.url);
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    },

    async cancel() {
      set((s) => ({
        items: s.items.map((i) =>
          i.status === 'waiting' || i.status === 'loadingModel' || i.status === 'recognizing'
            ? { ...i, status: 'cancelled' as const }
            : i,
        ),
      }));
      const handlers = cancelHandlers;
      cancelHandlers = [];
      handlers.forEach((h) => h());
      const engine = await getOcrEngine();
      await engine.terminate();
    },

    retry(id) {
      patch(id, { status: 'waiting', progress: 0, failReason: undefined });
      void pump();
    },

    updateDraft(id, p) {
      set((s) => ({
        items: s.items.map((i) =>
          i.id === id && i.draft ? { ...i, draft: { ...i.draft, ...p } } : i,
        ),
      }));
    },

    setSelected(id, selected) {
      patch(id, { selected });
    },

    selectAll(selected) {
      set((s) => ({ items: s.items.map((i) => (i.status === 'done' ? { ...i, selected } : i)) }));
    },

    discard(id) {
      const it = get().items.find((i) => i.id === id);
      if (it) URL.revokeObjectURL(it.url);
      set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
    },

    saveSelected() {
      const chosen = get().items.filter((i) => i.status === 'done' && i.selected);
      if (!chosen.length || chosen.some((i) => !isItemValid(i))) return { ok: false, saved: 0 };
      const now = nowIso();
      const txs = chosen.map((i) => draftToTransaction(i, uid(), now));
      // One atomic write for the whole batch (OMX-012a AC4/AC7).
      if (!useAppStore.getState().addMany(txs)) return { ok: false, saved: 0 };
      const ids = new Set(chosen.map((i) => i.id));
      for (const i of chosen) URL.revokeObjectURL(i.url);
      set((s) => ({ items: s.items.filter((i) => !ids.has(i.id)) }));
      return { ok: true, saved: txs.length };
    },

    clear() {
      void get().cancel();
      for (const i of get().items) URL.revokeObjectURL(i.url);
      set({ items: [] });
    },
  };
});

export const reviewableItems = (items: QueueItem[]) => items.filter((i) => i.status === 'done');
export const processingCount = (items: QueueItem[]) =>
  items.filter(
    (i) => i.status === 'waiting' || i.status === 'loadingModel' || i.status === 'recognizing',
  ).length;
