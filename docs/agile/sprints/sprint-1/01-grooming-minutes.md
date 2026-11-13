# Sprint 1 — Backlog Grooming Minutes

> Date: 2026-11-13 (Day 0) · Timebox: 60 นาที · Facilitator & note-taker: PO/PM
> Inputs: `docs/agile/grooming/sprint-1-design.md`, `sprint-1-dev.md`, `sprint-1-qa.md`, `01-product-backlog.md` (v1)
> Output: `01-product-backlog.md` v2 (estimates, AC rewrites, splits, new story)

## 1. Attendees

| Role | Present |
|---|---|
| PO/PM (facilitator) | ✔ |
| Designer | ✔ |
| Dev | ✔ |
| QA | ✔ |

## 2. Agenda
1. Estimates (planning poker บน estimate เสนอของ Dev)
2. QA testability review: 7 stories ที่ flag "Rewrite"
3. Designer & QA AC proposals (accept / reject)
4. Story splits และ story ใหม่
5. Open questions OQ1–OQ4 + QA questions Q1–Q12
6. DoR check และ action items

## 3. Decisions

### 3.1 Estimates
- ทีมยอมรับ estimate ของ Dev ทั้งหมด (ไม่มีข้อแตกต่างเกิน 1 ระดับใน planning poker)
- **Must = 77 pts** (23 items หลัง split) · **Should = 29 pts** (10 items) · **Could (OMX-039) = 3 pts**
- Dev แจ้ง velocity ที่คาดไว้ ~40 pts/sprint → ประเด็น capacity ส่งต่อไป Sprint Planning (ดู `02-sprint-planning.md`)

### 3.2 Splits (accepted)
| Original | Split | Pts | Reason |
|---|---|---|---|
| OMX-003 (8) | **OMX-003a** sign-in & open Picker (5) · **OMX-003b** poll, download & queue (3) | 5 + 3 | ลดความเสี่ยง OAuth/Picker ทำเป็นขั้น ทดสอบแยกได้ |
| OMX-012 (8) | **OMX-012a** editable list, validation, save/discard (5) · **OMX-012b** image viewer, raw text, leave-guard, flags (3) | 5 + 3 | หน้าซับซ้อนที่สุด แยกส่วนแกนกลางออกจากส่วนเสริม |

### 3.3 New story
- **OMX-039 — Detect received transfers via owner name/account (Settings)**, Could, 3 pts, depends on OMX-009 (จากข้อเสนอ Dev §6 Q3) — AC เป็น draft, refine ใน grooming ถัดไป

### 3.4 Open questions — resolved
| # | Decision | Owner |
|---|---|---|
| OQ1 Fixtures | **QA owns** synthetic slip fixtures (Layer A golden OCR-text + Layer B synthetic PNG, commit ใน repo); Layer C สลิปจริงปิดข้อมูล = private, ห้าม commit; ทีมบริจาคคนละ ≥ 2 ใบ; PO ขอสลิปเงินเดือนจากลูกค้า | QA (+PO) |
| OQ2 Tesseract data | **Self-host** same origin; copy จาก npm package ที่ pin version ตอน build (`tesseract.js@7.0.0`, `tesseract.js-core@7.0.0`, `@tesseract.js-data/{tha,eng}@1.0.0`); ไม่ commit binary; ไม่ใช้ CDN | Dev |
| OQ3 Received slips | **Keyword rules** ("รับเงิน", "เงินเข้า", "You received", …) → Income/`other_income` Medium + **ผู้ใช้สลับ type บน Review** (toggle อยู่บนสุดของ card, 1 แตะ); owner-name matching = OMX-039 | Dev / Designer |
| OQ4 Charts | **Hand-rolled SVG**; category = **horizontal bar**, trend = grouped bar; ไม่ใช้ Recharts/Chart.js | Dev / Designer |

### 3.5 Domain rules adopted (backlog §3)
- **Money = integer satang** (R1)
- **Dates = `YYYY-MM-DD` (+ `HH:mm`) in Asia/Bangkok**; "today/current month/future" คำนวณใน Asia/Bangkok (R2) — ทำให้ประเด็น timezone ของ QA (008, 017) ปิดได้
- Numeric date = dd/mm/yyyy เสมอ; ปี ≥ 2400 = BE (R3)
- Thai text normalization ก่อน parse (R4)
- Confidence model เดียว High/Medium/Low (R5); badge แสดงเฉพาะ Medium/Low (ข้อเสนอ Designer)
- Rules data file เดียว (R6); image limits: 10 MiB, คิวรวม ≤ 20, ตรวจ MIME + signature, downscale ด้านยาว ≤ 2,000 px (R9)

### 3.6 QA questions Q1–Q12
| Q | Decision |
|---|---|
| Q1 Test data plan | Accepted |
| Q2 Salary precedence | Accepted (OMX-006 AC1) |
| Q3 dd/mm/yyyy, ≥ 2400 = BE | Accepted (R3) |
| Q4 Longest match wins | Accepted (OMX-010 AC2) |
| Q5 Duplicate tolerance ±1 min + normalized payee | Accepted (OMX-011 AC2) |
| Q6 Multi-tab | Sync via `storage` event before next write (OMX-021 AC6) |
| Q7 Integer satang | Accepted (R1) |
| Q8 CSV formula injection | Accepted (OMX-023 AC4) |
| Q9 Mid-range device | Reference devices: 1 mid-range Android 2023–24 + 1 iPhone 2–3 gens old; exact models in QA test plan |
| Q10 Staging path | **Not in Sprint 1** — CI preview build (`vite preview` with Pages base) is the pre-merge gate; parked idea |
| Q11 Future date in manual entry | Allowed with non-blocking warning (OMX-013 AC4) |
| Q12 Tesseract host | Self-host (OQ2) |

## 4. AC Changes

### 4.1 Rewrites of QA-flagged stories (now meet DoR)
| Story | What changed |
|---|---|
| OMX-006 | Strong/weak salary keywords + salary precedence; received-money rule; weak bank-name evidence = Medium; confidence per R5; accuracy split golden ≥ 98% (CI gate) / synthetic ≥ 90% (benchmark); received-slip limitation documented |
| OMX-007 | Label lists for transfer & salary; explicit exclusions (fee, balance, ref, account patterns); format table with satang results; OCR-noise correction & rejection rules; range check; accuracy golden ≥ 95% / synthetic ≥ 80% |
| OMX-008 | Thai/EN/numeric format list; dd/mm always; validity (leap day, 31/11); time formats, empty time ≠ 00:00; salary pay-date precedence; fallback evaluated in Asia/Bangkok with 5-year window; month-boundary test across 2 timezones; golden ≥ 95% |
| OMX-010 | Precedence: payee > memo > text, then longest keyword, then explicit priority; payee heuristic ("ไปยัง/To") while OMX-009 not done; word boundary; person vs company rule; income/expense category integrity; accuracy golden ≥ 95% / synthetic ≥ 60% |
| OMX-011 | Exact (hash) vs probable (ref, or amount+date+time ±1 min+normalized payee); preview dialog; same-batch, deleted-item and manual-item cases |
| OMX-014 | Deterministic tie-break; sticky day header with net; non-color income/expense encoding; 360px overflow; measurable performance (500 tx, ≤ 1 s, no long task > 200 ms); month-empty state |
| OMX-029 | Lighthouse mobile preset median of 3; bundle check in CI; reference devices; OCR ≤ 15 s median on 5 synthetic 1080×2400 slips; downscale 2,000 px; 1,000-tx render ≤ 1 s |

### 4.2 Designer proposals
| Proposal | Decision | Applied in |
|---|---|---|
| X1 State matrix (loading/empty/error/success) | Accepted → Designer DoR checklist | Charter practice, OMX-026 AC6 |
| X3 Income/expense not color-only | Accepted | 014 AC3, 018 AC2 |
| X4 Typography (16px, line-height 1.6, tabular-nums, self-hosted Thai font) | Accepted | 025 AC5 |
| X6/X7 Date & amount inputs | Accepted | 013 AC1 |
| Auto-start OCR after selection; one skip summary; remove before processing | Accepted | 001 AC1, AC5, AC6 |
| Drop zone = same component, ≥ 768px only | Accepted | 002 AC1, AC5 |
| GP: "we only read photos you pick", persist waiting state, download progress | Accepted | 003a AC1, AC3; 003b AC2 |
| GP errors inline, `aria-disabled` + visible hint | Accepted | 004 AC1–AC3 |
| Progressive review, status-only announcements, leave confirm during OCR | Accepted | 005 AC7–AC9 |
| Badge only for Medium/Low | Accepted | R5 |
| Amount alternative chips | **Deferred** (parked idea) — not needed for Sprint Goal | — |
| "No date found — using today" hint | Accepted | 008 AC6 |
| Bank as text tag, no logos | Accepted | 009 AC3 |
| Category picker = icon grid (bottom sheet / popover) | Accepted | 013 AC1 (shared form) |
| Duplicate preview dialog | Accepted | 011 AC3 |
| Review mobile cards / desktop split view, sticky "Save selected", disabled with reason | Accepted | 012a AC1, AC4, AC5 |
| "Save & add another" | **Deferred** (parked idea) | — |
| Delete in edit form, no swipe; keep confirm + Undo | Accepted | 016 AC3 |
| Next month disabled at current month; "This month" shortcut | Accepted | 017 AC2 |
| Balance hero card | Accepted | 018 AC1 |
| Horizontal bar for categories | Accepted | 019 AC1 |
| Grouped bar + "View as table" | Accepted | 020 AC3 |
| Backup nudge after 20 new tx | **Deferred** (parked idea) | — |
| Import preview + Merge default / Replace double confirm | Accepted | 022 AC2 |
| Single "Export data" dialog for JSON/CSV | Accepted | 022 AC1, 023 AC1 |
| IA: 4-item bottom nav with Add action sheet; side nav ≥ 1024px | Accepted | 025 AC2 |
| Focus to heading after route change; skip link; touch target consolidated in 027 | Accepted | 027 AC1, AC2, AC8 |
| Trust message on Add; danger zone in Settings | Accepted | 030 AC4, AC5 |
| Filters persist across month change | Accepted (PO decision) | 015 AC5 |
| Usability check of Review wireframe with 1–2 people (P1/P3) | Accepted as action item | A7 |

### 4.3 QA "Minor" proposals
All accepted and applied to AC unless noted: 001 (MiB boundary, MIME+signature, total-queue limit), 002 (folder/link drop), 003b (unsupported media, timeout), 004 (copy for AC3, misconfiguration), 005 (300 ms responsiveness, concurrency 1, Cancelled state, empty text), 009 (CER report, bank ≥ 90%), 012a (unselected items remain, all-or-nothing save, category reset), 013 (max amount, decimals, double-submit, trimming), 015 (amount substring), 016 (cross-month edit, undo semantics), 017 (Dec→Jan BE), 018 (satang sums, −0.00), 019 (±0.1% rounding, ≥ 3:1), 020 (cross-year), 021 (byte-identical rollback, corrupt backup key, unavailable storage, multi-tab), 022 (repeat merge, invalid files), 023 (CSV formats, formula injection), 024 (automated key parity), 025 (320px), 026 (component-test error boundary), 027 (AT list, critical+serious), 030 (delete-all clears backups + queue), 031 (XSS fixtures).
- **Not accepted:** rawText truncate at 2,000 chars → kept **500 chars** (storage budget, Dev R6); future-date tolerance +1 day → not needed because all date logic uses Asia/Bangkok (R2).

### 4.4 Dev technical clarifications adopted
Queue limit counts total queue; MIME + magic bytes; no `capture` attribute; GIS scope string; `window.open` in user gesture; poll per `pollingConfig`; token in memory; single OCR worker; Cancel = `worker.terminate()` → Cancelled; HashRouter; Vite `base` via env; Client ID as Actions **variable**; envelope `omx.v1`; payee heuristic for 010 while 009 not done; 019 AC3 fallback without 015.
Tech stack (React 18.3.1, TS ~5.9.3, Vite, Zustand, zod, i18next, Vitest, Playwright + axe) accepted as proposed; Dev records ADRs.

## 5. DoR Check
- All 33 Must/Should items: **Ready** (story format, G/W/T AC, priority, estimate ≤ 8, test data plan accepted).
- Conditional: **OMX-003a/003b** need Google OAuth Client ID + test users for real-Google testing (A3); **OMX-028** needs push access + Pages source = GitHub Actions (A4). Dev may start both against stubs/local.
- UI spec/copy (DoR #4): Designer commits to deliver tokens, shell, copy deck v1 and wireframes Day 1–2 before Dev picks up UI stories (see Sprint Planning).

## 6. Action Items

| # | Action | Owner | Due |
|---|---|---|---|
| A1 | Update `01-product-backlog.md` to v2 (estimates, AC, splits, OMX-039, resolved questions) | PO | Day 0 ✔ |
| A2 | Layer A golden OCR-text fixtures (~40 cases first batch), redaction guideline | QA | Day 1 |
| A3 | Google Cloud project, OAuth Client ID, consent screen test users (team + UAT), authorized origins | PO (with repo owner) | Day 2 |
| A4 | Repo push access for team, Pages source = GitHub Actions, repo variable `VITE_GOOGLE_CLIENT_ID` | PO → repo owner | Day 1 |
| A5 | Request redacted salary slips (1–3 formats) + written consent from customer | PO | Request Day 0, receive Day 2 |
| A6 | Design tokens, app shell/nav, copy deck v1, wireframes (Dashboard, Transactions, Manual form, Add, Review) + empty/error catalogue | Designer | Day 1–2 |
| A7 | Quick usability check of Review wireframe with 1–2 people (P1/P3) | Designer | Day 2 |
| A8 | ADRs: `docs/adr/0001-self-host-tesseract-assets.md`, `0002-svg-charts.md`, `0003-money-and-dates.md` | Dev | Day 1 |
| A9 | Synthetic slip generator + Layer B PNG v1 + negative files | QA (Dev helps wire benchmark) | Day 2 (full Day 3) |
| A10 | Each team member donates ≥ 2 redacted real slips → private calibration set | All | Day 1 |
| A11 | Record charter change-log entry for Sprint 1 capacity decision | PO | Sprint Planning |
