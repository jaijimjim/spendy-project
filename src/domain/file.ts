/** File validation & image sizing (OMX-001 AC2–AC4, R9, OMX-029 AC4). */

export const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MiB, inclusive
export const MAX_QUEUE = 20;
export const MAX_LONG_EDGE = 2000;
export const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp'] as const;
export type ImageKind = 'jpeg' | 'png' | 'webp';

/** Detect image type by magic bytes (first 12 bytes). */
export function sniffImage(bytes: Uint8Array): ImageKind | null {
  const b = bytes;
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (
    b.length >= 8 &&
    b[0] === 0x89 &&
    b[1] === 0x50 &&
    b[2] === 0x4e &&
    b[3] === 0x47 &&
    b[4] === 0x0d &&
    b[5] === 0x0a &&
    b[6] === 0x1a &&
    b[7] === 0x0a
  )
    return 'png';
  if (
    b.length >= 12 &&
    b[0] === 0x52 &&
    b[1] === 0x49 &&
    b[2] === 0x46 &&
    b[3] === 0x46 &&
    b[8] === 0x57 &&
    b[9] === 0x45 &&
    b[10] === 0x42 &&
    b[11] === 0x50
  )
    return 'webp';
  return null;
}

export type SkipReason = 'type' | 'size' | 'limit' | 'duplicateInBatch';

export interface FileCheckInput {
  name: string;
  size: number;
  mime: string;
  head: Uint8Array;
}

/** MIME (if present) and signature must both say JPG/PNG/WebP. Extension is ignored. */
export function checkFile(f: FileCheckInput): SkipReason | null {
  if (f.size > MAX_FILE_BYTES) return 'size';
  const kind = sniffImage(f.head);
  if (!kind) return 'type';
  if (f.mime && !(ACCEPTED_MIME as readonly string[]).includes(f.mime.toLowerCase())) return 'type';
  return null;
}

/** Downscale so the long edge ≤ 2,000 px, preserving aspect ratio; never upscale. */
export function targetSize(
  width: number,
  height: number,
  maxEdge = MAX_LONG_EDGE,
): { width: number; height: number; scale: number } {
  const long = Math.max(width, height);
  if (long <= maxEdge || long === 0) return { width, height, scale: 1 };
  const scale = maxEdge / long;
  return { width: Math.round(width * scale), height: Math.round(height * scale), scale };
}

export interface SkipSummary {
  type: number;
  size: number;
  limit: number;
  duplicateInBatch: number;
}

export function summarizeSkips(reasons: readonly SkipReason[]): SkipSummary {
  const s: SkipSummary = { type: 0, size: 0, limit: 0, duplicateInBatch: 0 };
  for (const r of reasons) s[r]++;
  return s;
}
