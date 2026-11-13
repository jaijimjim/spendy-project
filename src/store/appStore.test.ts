import { beforeEach, describe, expect, it } from 'vitest';
import { useAppStore } from './appStore';
import { createMemoryStorage, STORAGE_KEY } from '../services/storage';
import type { Transaction } from '../domain/types';

const tx = (id: string): Transaction => ({
  id,
  type: 'expense',
  categoryId: 'food',
  amountSatang: 100,
  date: '2026-11-13',
  source: 'manual',
  createdAt: 'x',
  updatedAt: 'x',
});

describe('appStore commit/rollback', () => {
  beforeEach(() => {
    useAppStore.setState({
      ready: true,
      transactions: [],
      settings: { language: 'th' },
      storage: createMemoryStorage(),
    });
  });

  it('persists add/update/remove/restore atomically', () => {
    const st = useAppStore.getState();
    expect(st.addMany([tx('a'), tx('b')])).toBe(true);
    expect(useAppStore.getState().transactions).toHaveLength(2);
    expect(useAppStore.getState().update({ ...tx('a'), amountSatang: 999 })).toBe(true);
    const removed = useAppStore.getState().remove('b');
    expect(removed?.id).toBe('b');
    useAppStore.getState().restore(removed!);
    const stored = JSON.parse(useAppStore.getState().storage!.getItem(STORAGE_KEY)!);
    expect(stored.transactions.map((t: Transaction) => t.id).sort()).toEqual(['a', 'b']);
    expect(stored.transactions.find((t: Transaction) => t.id === 'a').amountSatang).toBe(999);
  });

  it('rolls back memory and raises banner when the write fails', () => {
    const mem = createMemoryStorage();
    useAppStore.setState({
      storage: {
        ...mem,
        setItem: () => {
          throw new Error('quota');
        },
      },
    });
    expect(useAppStore.getState().addMany([tx('z')])).toBe(false);
    expect(useAppStore.getState().transactions).toEqual([]);
    expect(useAppStore.getState().banners.storageFull).toBe(true);
  });

  it('merges imports by id', () => {
    useAppStore.getState().addMany([tx('a')]);
    expect(useAppStore.getState().importMerge([tx('a'), tx('c')])).toEqual({ ok: true, added: 1 });
  });
});
