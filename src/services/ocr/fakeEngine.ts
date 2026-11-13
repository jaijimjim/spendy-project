/**
 * Fake OCR engine for e2e tests and demos (`?ocr=fake` or `window.__OMX_TEST__.ocr = 'fake'`).
 * Returns fixture text chosen by file name, simulating model loading and progress so the
 * queue UI behaves like the real engine. File names containing "corrupt" fail.
 */
import { testHooks } from '../testHooks';
import { OcrError, type OcrEngine } from './types';
import { FAKE_OCR_TEXTS, DEFAULT_FAKE_TEXT } from './fakeTexts';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function createFakeEngine(stepMs = 60): OcrEngine {
  let ready = false;
  let generation = 0;
  return {
    name: 'fake',
    isReady: () => ready,
    async recognize(_image, fileName, onProgress) {
      const gen = generation;
      if (!ready) {
        onProgress({ phase: 'loadingModel', progress: 0 });
        await sleep(stepMs * 2);
        ready = true;
      }
      for (const p of [0, 0.25, 0.5, 0.75, 1]) {
        if (gen !== generation) throw new OcrError('cancelled');
        onProgress({ phase: 'recognizing', progress: p });
        await sleep(stepMs);
      }
      if (gen !== generation) throw new OcrError('cancelled');
      if (/corrupt/i.test(fileName)) throw new OcrError('corrupt');
      const stem = fileName.replace(/\.[^.]+$/, '');
      const custom = testHooks().fakeOcr;
      const text =
        custom?.[fileName] ?? custom?.[stem] ?? FAKE_OCR_TEXTS[stem] ?? DEFAULT_FAKE_TEXT;
      return { text, confidence: 90 };
    },
    async terminate() {
      generation++;
      ready = false;
    },
  };
}
