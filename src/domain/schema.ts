/** zod schemas for stored data and JSON backups (OMX-021 AC2, OMX-022, OMX-031 AC3). */
import { z } from 'zod';
import { ALL_CATEGORIES } from './categories';
import { isValidTime, isValidYmd } from './date';
import type { StoreEnvelopeV1, Transaction } from './types';

export const SCHEMA_VERSION = 1;

const categoryEnum = z.enum(ALL_CATEGORIES as unknown as [string, ...string[]]);

export const transactionSchema = z
  .object({
    id: z.string().min(1).max(100),
    type: z.enum(['income', 'expense']),
    categoryId: categoryEnum,
    amountSatang: z.number().int().positive().max(9_999_999_999),
    date: z.string().refine(isValidYmd, 'invalid date'),
    time: z.string().refine(isValidTime, 'invalid time').optional(),
    payee: z.string().max(100).optional(),
    note: z.string().max(500).optional(),
    source: z.enum(['slip', 'manual']),
    slip: z
      .object({
        imageHash: z
          .string()
          .regex(/^[0-9a-f]{64}$/)
          .optional(),
        refNo: z.string().max(64).optional(),
        bank: z.enum(['kplus', 'scb', 'ktb', 'bbl', 'bay', 'ttb', 'gsb', 'promptpay']).optional(),
        rawText: z.string().max(500).optional(),
        confidence: z.enum(['high', 'medium', 'low']),
      })
      .optional(),
    createdAt: z.string().min(1),
    updatedAt: z.string().min(1),
  })
  .refine(
    (t) => (t.type === 'income') === ['salary', 'other_income'].includes(t.categoryId),
    'category does not match type',
  );

export const envelopeSchema = z.object({
  version: z.literal(SCHEMA_VERSION),
  transactions: z.array(transactionSchema),
  settings: z.object({ language: z.enum(['th', 'en']) }),
});

/** Current backup id. Files written before the Spendy Money rename (Sprint 2) carry the legacy id. */
export const BACKUP_APP_ID = 'spendy-money';
export const LEGACY_BACKUP_APP_IDS = ['omnitrix-money'] as const;
const backupAppId = z.enum([BACKUP_APP_ID, ...LEGACY_BACKUP_APP_IDS]);

export const backupSchema = z.object({
  app: backupAppId,
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string(),
  transactions: z.array(transactionSchema),
});

export type BackupFile = z.infer<typeof backupSchema>;

export function parseEnvelope(value: unknown): StoreEnvelopeV1 | null {
  const r = envelopeSchema.safeParse(value);
  return r.success ? (r.data as StoreEnvelopeV1) : null;
}

export type BackupParseError = 'errorNotJson' | 'errorSchema' | 'errorVersion' | 'errorSize';
export const BACKUP_MAX_BYTES = 5 * 1024 * 1024;

export function parseBackup(
  text: string,
  byteSize: number,
): { ok: true; transactions: Transaction[] } | { ok: false; error: BackupParseError } {
  if (byteSize > BACKUP_MAX_BYTES) return { ok: false, error: 'errorSize' };
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'errorNotJson' };
  }
  const head = z.object({ app: backupAppId, schemaVersion: z.number() }).safeParse(json);
  if (!head.success) return { ok: false, error: 'errorSchema' };
  if (head.data.schemaVersion > SCHEMA_VERSION) return { ok: false, error: 'errorVersion' };
  const full = backupSchema.safeParse(json);
  if (!full.success) return { ok: false, error: 'errorSchema' };
  return { ok: true, transactions: full.data.transactions as Transaction[] };
}

export function buildBackup(transactions: readonly Transaction[], exportedAt: string): BackupFile {
  return {
    app: BACKUP_APP_ID,
    schemaVersion: SCHEMA_VERSION,
    exportedAt,
    transactions: [...transactions],
  };
}

/** Merge by transaction id: existing wins, new ids are appended (OMX-022 AC2). */
export function mergeTransactions(
  current: readonly Transaction[],
  incoming: readonly Transaction[],
): { merged: Transaction[]; added: number; duplicates: number } {
  const ids = new Set(current.map((t) => t.id));
  const fresh = incoming.filter((t) => !ids.has(t.id));
  return {
    merged: [...current, ...fresh],
    added: fresh.length,
    duplicates: incoming.length - fresh.length,
  };
}
