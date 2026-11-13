# ADR-0001: Self-host Tesseract.js worker, core and language data

- Status: Accepted (Sprint 1, 2026-11-13) · Stories: OMX-005, OMX-028, OMX-030

## Context
Tesseract.js by default downloads its worker, WASM core and `*.traineddata` from jsDelivr. OMX-030 requires that only our origin (plus Google during Photos import) is contacted, and OMX-028 AC4 requires assets copied from pinned npm packages at build time. GitHub Pages limits: 1 GB site, 100 MB per file, ~100 GB/month soft bandwidth.

## Decision
- Pin `tesseract.js@7.0.0`, `tesseract.js-core@7.0.0`, `@tesseract.js-data/tha@1.0.0`, `@tesseract.js-data/eng@1.0.0` (exact versions).
- `scripts/copy-tesseract-assets.mjs` (run by `predev`/`prebuild`) copies `worker.min.js`, the three `*-lstm.wasm.js` core builds and the `4.0.0_best_int` `tha`/`eng` `.traineddata.gz` into `public/tesseract/` (git-ignored) → `dist/tesseract/`.
- The worker is created with `OEM.LSTM_ONLY`, `workerPath/corePath/langPath` under `import.meta.env.BASE_URL`, `workerBlobURL: false`, `gzip: true`. One worker, reused, terminated on cancel.

## Consequences
- First OCR downloads ≈ 0.9 MB (tha) + 2.9 MB (eng) + ≈ 3.9 MB (one core build) from our origin; language data is cached in IndexedDB by tesseract.js, so later sessions skip it despite Pages' short cache headers.
- No CDN dependency, simple CSP (`script-src 'self' 'wasm-unsafe-eval'`), reproducible versions; ready for a future service worker (OMX-037).
- `dist/` grows by ~15 MB (three core variants) — well within Pages limits.
