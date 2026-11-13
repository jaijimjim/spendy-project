/**
 * Test hooks — lets e2e tests (Playwright `addInitScript`) inject a fixed clock, fake OCR,
 * a Google Photos stub or in-memory storage without touching production code paths.
 * Nothing here is read unless the hook object exists; it is never set by the app itself.
 */
import type { GooglePhotosApi } from './google/types';

export interface OmxTestHooks {
  /** ISO instant used as "now" (e.g. "2026-11-13T10:00:00+07:00"). */
  now?: string;
  /** 'fake' forces the fake OCR engine (also available as `?ocr=fake`). */
  ocr?: 'fake' | 'real';
  /** Fake OCR text by file name (overrides built-in fixtures). */
  fakeOcr?: Record<string, string>;
  /** Replace the Google Photos wrapper (OMX-003a AC6). */
  googlePhotos?: GooglePhotosApi;
  /** 'memory' forces the in-memory storage adapter; 'broken' throws on every write. */
  storage?: 'memory' | 'broken' | 'unavailable';
}

declare global {
  interface Window {
    __OMX_TEST__?: OmxTestHooks;
  }
}

export function testHooks(): OmxTestHooks {
  return (typeof window !== 'undefined' && window.__OMX_TEST__) || {};
}
