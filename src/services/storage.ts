/**
 * Storage adapter + repository for the single versioned envelope `omx.v1` (R8, OMX-021).
 * - Writes are atomic: the whole envelope is serialized and written with one setItem call.
 * - Corrupt / unknown-version values are copied to `omx.v1.corrupt.<timestamp>` and the app
 *   starts fresh (AC4). If localStorage is unavailable we fall back to memory (AC5).
 */
import { parseEnvelope } from '../domain/schema';
import type { Settings, StoreEnvelopeV1 } from '../domain/types';
import { testHooks } from './testHooks';

export const STORAGE_KEY = 'omx.v1';
export const CORRUPT_PREFIX = 'omx.v1.corrupt.';

export interface KeyValueStorage {
  readonly kind: 'local' | 'memory';
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
}

export class StorageWriteError extends Error {
  constructor(cause: unknown) {
    super('storage write failed');
    this.name = 'StorageWriteError';
    this.cause = cause;
  }
}

export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    kind: 'memory',
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
    keys: () => [...map.keys()],
  };
}

/** Wraps window.localStorage; returns null when it is blocked (private mode, SecurityError). */
export function createLocalStorage(): KeyValueStorage | null {
  try {
    const ls = window.localStorage;
    const probe = '__omx_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    return {
      kind: 'local',
      getItem: (k) => ls.getItem(k),
      setItem: (k, v) => ls.setItem(k, v),
      removeItem: (k) => ls.removeItem(k),
      keys: () =>
        Array.from({ length: ls.length }, (_, i) => ls.key(i)).filter(
          (k): k is string => k !== null,
        ),
    };
  } catch {
    return null;
  }
}

/** Storage chosen at startup (honours test hooks). */
export function resolveStorage(): { storage: KeyValueStorage; unavailable: boolean } {
  const hook = testHooks().storage;
  if (hook === 'memory') return { storage: createMemoryStorage(), unavailable: false };
  if (hook === 'unavailable') return { storage: createMemoryStorage(), unavailable: true };
  if (hook === 'broken') {
    const mem = createMemoryStorage();
    return {
      storage: {
        ...mem,
        setItem: () => {
          throw new DOMException('quota', 'QuotaExceededError');
        },
      },
      unavailable: false,
    };
  }
  const ls = createLocalStorage();
  return ls
    ? { storage: ls, unavailable: false }
    : { storage: createMemoryStorage(), unavailable: true };
}

export type LoadResult =
  | { status: 'ok'; envelope: StoreEnvelopeV1 }
  | { status: 'empty' }
  | { status: 'corrupt'; backupKey: string };

export function loadEnvelope(storage: KeyValueStorage, nowMs: number): LoadResult {
  let raw: string | null;
  try {
    raw = storage.getItem(STORAGE_KEY);
  } catch {
    return { status: 'empty' };
  }
  if (raw === null) return { status: 'empty' };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    parsed = undefined;
  }
  const env = parseEnvelope(parsed);
  if (env) return { status: 'ok', envelope: env };
  const backupKey = `${CORRUPT_PREFIX}${nowMs}`;
  try {
    storage.setItem(backupKey, raw);
    storage.removeItem(STORAGE_KEY);
  } catch {
    /* if we cannot back up, leave the raw value untouched */
  }
  return { status: 'corrupt', backupKey };
}

export function saveEnvelope(storage: KeyValueStorage, envelope: StoreEnvelopeV1): void {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch (e) {
    throw new StorageWriteError(e);
  }
}

export function corruptKeys(storage: KeyValueStorage): string[] {
  try {
    return storage.keys().filter((k) => k.startsWith(CORRUPT_PREFIX));
  } catch {
    return [];
  }
}

/** OMX-030 AC4: remove the envelope and every corrupt backup. */
export function clearAll(storage: KeyValueStorage): void {
  for (const k of [STORAGE_KEY, ...corruptKeys(storage)]) {
    try {
      storage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
}

export function makeEnvelope(
  transactions: StoreEnvelopeV1['transactions'],
  settings: Settings,
): StoreEnvelopeV1 {
  return { version: 1, transactions, settings };
}
