/** OCR engine interface — injectable so e2e tests can use a fake engine (QA request). */

export type OcrPhase = 'loadingModel' | 'recognizing';

export interface OcrProgress {
  phase: OcrPhase;
  /** 0..1 (only meaningful for 'recognizing'). */
  progress: number;
}

export interface OcrResult {
  text: string;
  /** Engine confidence 0..100. */
  confidence: number;
}

export interface OcrEngine {
  readonly name: 'tesseract' | 'fake';
  /** Recognize one image; must reject with OcrError on failure. */
  recognize(
    image: Blob,
    fileName: string,
    onProgress: (p: OcrProgress) => void,
  ): Promise<OcrResult>;
  /** Abort everything (cancel). The next recognize() call starts a fresh worker. */
  terminate(): Promise<void>;
  /** Whether the language model is already loaded in memory. */
  isReady(): boolean;
}

export type OcrErrorReason = 'corrupt' | 'model' | 'cancelled' | 'unknown';

export class OcrError extends Error {
  constructor(
    public readonly reason: OcrErrorReason,
    message?: string,
  ) {
    super(message ?? reason);
    this.name = 'OcrError';
  }
}
