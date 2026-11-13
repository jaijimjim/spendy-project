/**
 * Tesseract.js engine (OMX-005). Exactly one worker, lazily created and reused.
 * All assets (worker, WASM core, tha+eng traineddata) are served from our own origin
 * under `${BASE_URL}tesseract/` — copied from pinned npm packages at build time (ADR-0001).
 */
import type { Worker } from 'tesseract.js';
import { preprocessImage } from './preprocess';
import { OcrError, type OcrEngine, type OcrProgress } from './types';

const LANGS = 'tha+eng';

function assetUrl(path: string): string {
  return new URL(`${import.meta.env.BASE_URL}tesseract/${path}`, window.location.href).href;
}

export function createTesseractEngine(): OcrEngine {
  let worker: Worker | null = null;
  let workerPromise: Promise<Worker> | null = null;
  let listener: ((p: OcrProgress) => void) | null = null;
  let ready = false;

  async function getWorker(): Promise<Worker> {
    if (worker) return worker;
    if (!workerPromise) {
      workerPromise = (async () => {
        const { createWorker, OEM } = await import('tesseract.js');
        const w = await createWorker(LANGS, OEM.LSTM_ONLY, {
          workerPath: assetUrl('worker.min.js'),
          corePath: assetUrl('core'),
          langPath: assetUrl('lang'),
          gzip: true,
          // Load the worker script directly (same origin) instead of via a blob: URL.
          workerBlobURL: false,
          logger: (m: { status: string; progress: number }) => {
            if (!listener) return;
            if (m.status === 'recognizing text')
              listener({ phase: 'recognizing', progress: m.progress });
            else listener({ phase: 'loadingModel', progress: m.progress });
          },
        });
        // Slips are mostly sparse blocks of text.
        await w.setParameters({ preserve_interword_spaces: '1' });
        worker = w;
        ready = true;
        return w;
      })().catch((e: unknown) => {
        workerPromise = null;
        throw new OcrError('model', String(e));
      });
    }
    return workerPromise;
  }

  return {
    name: 'tesseract',
    isReady: () => ready,
    async recognize(image, _fileName, onProgress) {
      listener = onProgress;
      const prepared = await preprocessImage(image);
      if (!ready) onProgress({ phase: 'loadingModel', progress: 0 });
      const w = await getWorker();
      onProgress({ phase: 'recognizing', progress: 0 });
      try {
        const { data } = await w.recognize(prepared);
        onProgress({ phase: 'recognizing', progress: 1 });
        return { text: data.text ?? '', confidence: data.confidence ?? 0 };
      } catch (e) {
        throw new OcrError('corrupt', String(e));
      } finally {
        listener = null;
      }
    },
    async terminate() {
      const w = worker;
      worker = null;
      workerPromise = null;
      ready = false;
      listener = null;
      if (w) await w.terminate();
    },
  };
}
