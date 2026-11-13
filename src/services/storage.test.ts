import { describe, expect, it } from 'vitest';
import {
  clearAll,
  corruptKeys,
  createMemoryStorage,
  loadEnvelope,
  makeEnvelope,
  saveEnvelope,
  STORAGE_KEY,
  StorageWriteError,
} from './storage';

describe('storage repository (OMX-021)', () => {
  it('round-trips the versioned envelope', () => {
    const s = createMemoryStorage();
    expect(loadEnvelope(s, 1).status).toBe('empty');
    saveEnvelope(s, makeEnvelope([], { language: 'en' }));
    const r = loadEnvelope(s, 1);
    expect(r).toEqual({
      status: 'ok',
      envelope: { version: 1, transactions: [], settings: { language: 'en' } },
    });
  });

  it('backs up corrupt data and starts fresh (AC4)', () => {
    const s = createMemoryStorage();
    s.setItem(STORAGE_KEY, '{not json');
    const r = loadEnvelope(s, 42);
    expect(r).toEqual({ status: 'corrupt', backupKey: 'omx.v1.corrupt.42' });
    expect(s.getItem('omx.v1.corrupt.42')).toBe('{not json');
    expect(s.getItem(STORAGE_KEY)).toBeNull();
    expect(corruptKeys(s)).toEqual(['omx.v1.corrupt.42']);
    clearAll(s);
    expect(s.keys()).toEqual([]);
  });

  it('wraps write failures and leaves the stored value untouched (AC3)', () => {
    const s = createMemoryStorage();
    s.setItem(STORAGE_KEY, 'before');
    const broken = {
      ...s,
      setItem: () => {
        throw new DOMException('full', 'QuotaExceededError');
      },
    };
    expect(() => saveEnvelope(broken, makeEnvelope([], { language: 'th' }))).toThrow(
      StorageWriteError,
    );
    expect(s.getItem(STORAGE_KEY)).toBe('before');
  });
});
