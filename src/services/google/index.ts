import { testHooks } from '../testHooks';
import { createGooglePhotos } from './photosPicker';
import type { GooglePhotosApi } from './types';

let api: GooglePhotosApi | null = null;

/** The single Google wrapper used by the UI; e2e tests may replace it via window.__OMX_TEST__.googlePhotos. */
export function googlePhotos(): GooglePhotosApi {
  const stub = testHooks().googlePhotos;
  if (stub) return stub;
  if (!api) api = createGooglePhotos(import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined);
  return api;
}

export * from './types';
