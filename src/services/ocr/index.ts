/** Chooses the OCR engine: fake for tests/demos, Tesseract otherwise. Lazy so Tesseract stays out of the initial bundle. */
import { testHooks } from '../testHooks';
import type { OcrEngine } from './types';

let engine: OcrEngine | null = null;

export function wantsFakeOcr(): boolean {
  const hook = testHooks().ocr;
  if (hook) return hook === 'fake';
  try {
    return new URLSearchParams(window.location.search).get('ocr') === 'fake';
  } catch {
    return false;
  }
}

export async function getOcrEngine(): Promise<OcrEngine> {
  if (engine) return engine;
  engine = wantsFakeOcr()
    ? (await import('./fakeEngine')).createFakeEngine()
    : (await import('./tesseractEngine')).createTesseractEngine();
  return engine;
}

/** For unit tests. */
export function setOcrEngine(e: OcrEngine | null): void {
  engine = e;
}
