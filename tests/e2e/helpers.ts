import type { Page } from '@playwright/test';
import { deflateSync } from 'node:zlib';

/** Minimal valid PNG (solid colour) so files pass the signature check; content is irrelevant with fake OCR. */
export function makePng(seed = 0, size = 8): Buffer {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff]! ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const row = Buffer.concat([Buffer.from([0]), Buffer.alloc(size * 3, seed % 256)]);
  const raw = Buffer.concat(Array.from({ length: size }, () => row));
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export interface Hooks {
  now?: string;
  ocr?: 'fake' | 'real';
  storage?: 'memory' | 'broken' | 'unavailable';
  fakeOcr?: Record<string, string>;
}

export async function setup(page: Page, hooks: Hooks = {}, lang: 'th' | 'en' = 'th') {
  await page.addInitScript(
    ([h, l]) => {
      (window as unknown as { __OMX_TEST__: unknown }).__OMX_TEST__ = h;
      Object.defineProperty(navigator, 'languages', {
        get: () => [l === 'th' ? 'th-TH' : 'en-US'],
      });
    },
    [{ now: '2026-11-13T10:00:00+07:00', ocr: 'fake', ...hooks }, lang] as const,
  );
}

export async function seed(page: Page, transactions: unknown[], language: 'th' | 'en' = 'th') {
  await page.addInitScript(
    ([txs, lang]) => {
      if (!localStorage.getItem('omx.v1'))
        localStorage.setItem(
          'omx.v1',
          JSON.stringify({ version: 1, transactions: txs, settings: { language: lang } }),
        );
    },
    [transactions, language] as const,
  );
}

let n = 0;
export function tx(p: Record<string, unknown>) {
  n++;
  return {
    id: `seed-${n}`,
    type: 'expense',
    categoryId: 'food',
    amountSatang: 10000,
    date: '2026-11-13',
    source: 'manual',
    createdAt: `2026-11-13T0${n % 10}:00:00.000Z`,
    updatedAt: '2026-11-13T00:00:00.000Z',
    ...p,
  };
}

export const SAMPLE = [
  tx({
    type: 'income',
    categoryId: 'salary',
    amountSatang: 4620000,
    date: '2026-11-01',
    payee: 'บริษัท ออมนิทริกซ์ จำกัด',
    source: 'slip',
  }),
  tx({
    categoryId: 'housing',
    amountSatang: 850000,
    date: '2026-11-01',
    payee: 'นิติบุคคลอาคารชุด',
    time: '08:00',
  }),
  tx({
    categoryId: 'food',
    amountSatang: 24500,
    date: '2026-11-13',
    time: '14:35',
    payee: 'GrabFood',
    source: 'slip',
  }),
  tx({
    categoryId: 'food',
    amountSatang: 6000,
    date: '2026-11-13',
    time: '12:10',
    payee: 'ร้านข้าวมันไก่ป้าศรี',
  }),
  tx({
    categoryId: 'transport',
    amountSatang: 4700,
    date: '2026-11-13',
    time: '08:15',
    payee: 'BTS สถานีอโศก',
    source: 'slip',
  }),
  tx({
    categoryId: 'bills',
    amountSatang: 138500,
    date: '2026-11-12',
    time: '19:40',
    payee: 'การไฟฟ้านครหลวง',
    source: 'slip',
  }),
  tx({
    categoryId: 'transfer',
    amountSatang: 30000,
    date: '2026-11-12',
    time: '09:12',
    payee: 'น.ส. สมใจ ใจดี',
  }),
  tx({ categoryId: 'food', amountSatang: 400000, date: '2026-11-10', payee: 'MK Restaurants' }),
  tx({ categoryId: 'shopping', amountSatang: 199900, date: '2026-11-09', payee: 'Lazada' }),
  tx({ type: 'income', categoryId: 'salary', amountSatang: 4500000, date: '2026-10-25' }),
  tx({ categoryId: 'food', amountSatang: 1800000, date: '2026-10-20' }),
  tx({ type: 'income', categoryId: 'salary', amountSatang: 4500000, date: '2026-09-25' }),
  tx({ categoryId: 'housing', amountSatang: 2500000, date: '2026-09-02' }),
  tx({ type: 'income', categoryId: 'salary', amountSatang: 4500000, date: '2026-08-25' }),
  tx({ categoryId: 'shopping', amountSatang: 3100000, date: '2026-08-15' }),
  tx({ type: 'income', categoryId: 'salary', amountSatang: 4500000, date: '2026-07-25' }),
  tx({ categoryId: 'bills', amountSatang: 2200000, date: '2026-07-11' }),
  tx({ type: 'income', categoryId: 'salary', amountSatang: 4500000, date: '2026-06-25' }),
  tx({ categoryId: 'food', amountSatang: 2700000, date: '2026-06-11' }),
];
