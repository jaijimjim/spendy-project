/**
 * App data store (Zustand): transactions + settings persisted in the `omx.v1` envelope.
 * Every mutation computes the next state, writes it atomically, and only then commits to memory;
 * on a failed write the in-memory state is unchanged (rollback) and a banner is shown (OMX-021 AC3).
 */
import { create } from 'zustand';
import type { Language, Settings, Transaction } from '../domain/types';
import { mergeTransactions } from '../domain/schema';
import {
  clearAll,
  corruptKeys,
  loadEnvelope,
  makeEnvelope,
  resolveStorage,
  saveEnvelope,
  STORAGE_KEY,
  type KeyValueStorage,
} from '../services/storage';
import { getClock } from '../services/clock';

export interface Banners {
  storageUnavailable: boolean;
  storageFull: boolean;
  corruptKey: string | null;
  otherTab: boolean;
}

interface AppState {
  ready: boolean;
  transactions: Transaction[];
  settings: Settings;
  banners: Banners;
  storage: KeyValueStorage | null;
  init(defaultLanguage: Language): void;
  addMany(txs: Transaction[]): boolean;
  update(tx: Transaction): boolean;
  remove(id: string): Transaction | null;
  restore(tx: Transaction): boolean;
  importMerge(txs: Transaction[]): { ok: boolean; added: number };
  importReplace(txs: Transaction[]): boolean;
  deleteAll(): boolean;
  setLanguage(lang: Language): void;
  reloadFromStorage(): void;
  dismissBanner(key: keyof Banners): void;
  rawCorruptValue(): string | null;
}

const NO_BANNERS: Banners = {
  storageUnavailable: false,
  storageFull: false,
  corruptKey: null,
  otherTab: false,
};

export const useAppStore = create<AppState>((set, get) => {
  /** Persist next state; returns false (and leaves memory untouched) on failure. */
  function commit(transactions: Transaction[], settings: Settings = get().settings): boolean {
    const storage = get().storage;
    if (storage) {
      try {
        saveEnvelope(storage, makeEnvelope(transactions, settings));
      } catch {
        set((s) => ({ banners: { ...s.banners, storageFull: true } }));
        return false;
      }
    }
    set((s) => ({ transactions, settings, banners: { ...s.banners, storageFull: false } }));
    return true;
  }

  return {
    ready: false,
    transactions: [],
    settings: { language: 'th' },
    banners: NO_BANNERS,
    storage: null,

    init(defaultLanguage) {
      if (get().ready) return;
      const { storage, unavailable } = resolveStorage();
      const loaded = loadEnvelope(storage, getClock().now().getTime());
      const banners: Banners = { ...NO_BANNERS, storageUnavailable: unavailable };
      if (loaded.status === 'ok') {
        set({
          ready: true,
          storage,
          transactions: loaded.envelope.transactions,
          settings: loaded.envelope.settings,
          banners,
        });
      } else {
        if (loaded.status === 'corrupt') banners.corruptKey = loaded.backupKey;
        set({
          ready: true,
          storage,
          transactions: [],
          settings: { language: defaultLanguage },
          banners,
        });
      }
    },

    addMany(txs) {
      return commit([...get().transactions, ...txs]);
    },

    update(tx) {
      return commit(get().transactions.map((t) => (t.id === tx.id ? tx : t)));
    },

    remove(id) {
      const existing = get().transactions.find((t) => t.id === id) ?? null;
      if (!existing) return null;
      return commit(get().transactions.filter((t) => t.id !== id)) ? existing : null;
    },

    restore(tx) {
      if (get().transactions.some((t) => t.id === tx.id)) return true;
      return commit([...get().transactions, tx]);
    },

    importMerge(txs) {
      const r = mergeTransactions(get().transactions, txs);
      return { ok: commit(r.merged), added: r.added };
    },

    importReplace(txs) {
      return commit([...txs]);
    },

    deleteAll() {
      const storage = get().storage;
      if (storage) clearAll(storage);
      set((s) => ({
        transactions: [],
        banners: { ...s.banners, corruptKey: null, storageFull: false },
      }));
      // Keep the language preference in memory but don't write it back (data fully deleted).
      return true;
    },

    setLanguage(language) {
      const settings = { ...get().settings, language };
      if (!commit(get().transactions, settings)) set({ settings });
    },

    reloadFromStorage() {
      const storage = get().storage;
      if (!storage) return;
      const loaded = loadEnvelope(storage, getClock().now().getTime());
      if (loaded.status === 'ok') {
        set((s) => ({
          transactions: loaded.envelope.transactions,
          settings: loaded.envelope.settings,
          banners: { ...s.banners, otherTab: true },
        }));
      } else if (loaded.status === 'empty') {
        set((s) => ({ transactions: [], banners: { ...s.banners, otherTab: true } }));
      }
    },

    dismissBanner(key) {
      set((s) => ({ banners: { ...s.banners, [key]: key === 'corruptKey' ? null : false } }));
    },

    rawCorruptValue() {
      const { storage, banners } = get();
      if (!storage) return null;
      const key = banners.corruptKey ?? corruptKeys(storage)[0];
      return key ? storage.getItem(key) : null;
    },
  };
});

/** OMX-021 AC6: another tab saved — reload before our next write. */
export function listenForOtherTabs(): () => void {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === null) useAppStore.getState().reloadFromStorage();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}
