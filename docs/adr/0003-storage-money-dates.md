# ADR-0003: Storage envelope, money as satang, Bangkok dates

- Status: Accepted (Sprint 1) · Stories: OMX-007, OMX-008, OMX-017, OMX-018, OMX-021 · Rules R1, R2, R8

## Decision
- **Storage:** one key `localStorage['omx.v1'] = { version: 1, transactions, settings }`, validated with zod on load. Every mutation serialises the whole envelope and writes it with a single `setItem`; on failure the in-memory state is not changed (rollback) and a banner offers JSON export. Corrupt/unknown values are copied to `omx.v1.corrupt.<ts>`; if localStorage is blocked the app runs in memory with a banner. A `storage` event listener reloads state written by another tab.
- **Money:** `amountSatang: number` (positive integer); totals are integer sums; formatting via `Intl.NumberFormat` with U+2212 for negatives.
- **Dates:** `date: 'YYYY-MM-DD'` (CE) + optional `time: 'HH:mm'`; "today"/"current month"/"future" are computed with `Intl.DateTimeFormat({ timeZone: 'Asia/Bangkok' })` through an injectable clock. Display uses `th-TH-u-ca-buddhist` (BE) or `en-GB`.

## Consequences
Deterministic tests (pinned clock), no float drift, month boundaries independent of device timezone; ~1,000 transactions ≈ < 1 MB of storage.
