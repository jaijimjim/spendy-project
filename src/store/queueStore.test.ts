import { describe, expect, it } from 'vitest';
import { draftFromParsed, draftToTransaction, isItemValid, type QueueItem } from './queueStore';
import { parseSlip } from '../domain/slip/parseSlip';

const parsed = parseSlip(
  'โอนเงินสำเร็จ\n13 พ.ย. 69 14:35\nไปยัง GrabFood\nจำนวน: 245.00 บาท\nเลขที่รายการ: ABC123456',
  '2026-11-13',
);
const item = (over: Partial<QueueItem> = {}): QueueItem => ({
  id: 'q1',
  name: 'a.png',
  blob: new Blob(),
  url: 'blob:x',
  hash: 'a'.repeat(64),
  origin: 'upload',
  status: 'done',
  progress: 100,
  text: 'x'.repeat(800),
  parsed,
  draft: draftFromParsed(parsed),
  selected: true,
  duplicate: null,
  ...over,
});

describe('queue → transaction mapping (OMX-012a AC8)', () => {
  it('builds a slip transaction with hash, ref, confidence and truncated raw text', () => {
    const t = draftToTransaction(item(), 'id1', '2026-11-13T00:00:00Z');
    expect(t).toMatchObject({
      id: 'id1',
      type: 'expense',
      categoryId: 'food',
      amountSatang: 24500,
      date: '2026-11-13',
      time: '14:35',
      payee: 'GrabFood',
      source: 'slip',
      slip: { imageHash: 'a'.repeat(64), refNo: 'ABC123456', confidence: 'high' },
    });
    expect(t.slip!.rawText).toHaveLength(500);
  });

  it('validates drafts', () => {
    expect(isItemValid(item())).toBe(true);
    expect(isItemValid(item({ draft: { ...draftFromParsed(parsed), amount: '' } }))).toBe(false);
  });
});
