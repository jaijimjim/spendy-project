# Sprint 1 — Sprint Planning

> Date: 2026-11-13 · Timebox: 60 นาที · Facilitator: PO/PM · Attendees: PO/PM, Designer, Dev, QA
> Sprint: **Sprint 1** · 1 สัปดาห์ (compressed mode ตาม charter §5), **extended capacity**
> Inputs: `01-product-backlog.md` v2, `01-grooming-minutes.md`

## 1. Sprint Goal

> **ผู้ใช้เปิด Omnitrix Money จาก GitHub Pages ได้จากทุกที่ นำเข้าสลิปด้วยการอัปโหลดหรือจาก Google Photos แล้วระบบอ่านสลิปในเบราว์เซอร์ แยกรายรับ/รายจ่าย ดึงจำนวนเงิน/วันที่ และจัดหมวดหมู่ให้อัตโนมัติ ผู้ใช้ตรวจแก้แล้วบันทึกได้ กรอกรายการเองได้ แก้ไข/ลบได้ และเห็นสรุปรายเดือนบน dashboard — ใช้ได้ทั้ง TH/EN บนมือถือ โดยข้อมูลไม่ออกจากเครื่อง**
>
> *EN:* A user opens Omnitrix Money on GitHub Pages, imports slips by upload or Google Photos, gets type/amount/date/category automatically, reviews and saves, adds manual entries, edits/deletes, and sees a monthly dashboard — TH/EN, mobile-first, data stays on the device.

## 2. Capacity & Commitment Decision

| Item | Value |
|---|---|
| Dev's assumed velocity | ~40 pts |
| Must stories | 77 pts (23 items) |
| Should stories | 29 pts (10 items) |
| Dev's recommendation (grooming) | Option A thin slice 40 pts; move Google Photos (003/004) to Sprint 2 |

**Team decision:** ลูกค้าระบุชัดเจนว่า MVP_0001 ต้องมี **Google Photos import**, **การจัดหมวดหมู่สลิปอัตโนมัติ** และ **การ host ที่เข้าถึงได้จากภายนอก** ทีมจึงตกลง **commit Must ทั้งหมด (77 pts) รวม OMX-003a/003b/004** ใน Sprint 1 ด้วย **extended capacity** และวาง Should เป็น **stretch** ตามลำดับ priority

- Dev's Option A recommendation was considered and **not adopted**, because it leaves out customer-mandated scope; the risk is accepted explicitly and logged in the charter change log (Change Coordination §8).
- **Risk controls:** Google Photos built behind a stubbable wrapper (testable without Client ID); Design-first sequencing to unblock Dev; daily scope check at stand-up; if by Day 3 the burndown shows Must at risk, PO runs change coordination to re-sequence (Must order below = cut-last order) rather than silently dropping scope.

### 2.1 Committed (Must) — 77 pts

| Order | ID | Title | Pts | Owner (lead) |
|---|---|---|---|---|
| 1 | OMX-028 | Deploy to GitHub Pages via GitHub Actions | 3 | Dev |
| 2 | OMX-025 | Mobile-first responsive layout & navigation | 3 | Dev / Designer |
| 3 | OMX-024 | TH / EN language switch | 3 | Dev / Designer |
| 4 | OMX-021 | Persist data in localStorage | 3 | Dev |
| 5 | OMX-017 | Month selector | 2 | Dev |
| 6 | OMX-018 | Monthly summary | 2 | Dev |
| 7 | OMX-013 | Manual income/expense entry form | 3 | Dev |
| 8 | OMX-014 | Transaction list | 3 | Dev |
| 9 | OMX-016 | Edit & delete transaction | 3 | Dev |
| 10 | OMX-001 | Upload slip images | 3 | Dev |
| 11 | OMX-005 | In-browser OCR with progress | 5 | Dev |
| 12 | OMX-006 | Auto-detect type | 3 | Dev |
| 13 | OMX-007 | Extract amount | 5 | Dev |
| 14 | OMX-008 | Extract date & time | 5 | Dev |
| 15 | OMX-010 | Auto-categorize | 5 | Dev |
| 16 | OMX-012a | Review: editable list, validation, save/discard | 5 | Dev |
| 17 | OMX-012b | Review: viewer, raw text, leave-guard, flags | 3 | Dev |
| 18 | OMX-026 | Empty states & error handling | 3 | Dev / Designer |
| 19 | OMX-030 | Privacy NFR | 2 | Dev / QA |
| 20 | OMX-027 | Accessibility AA | 3 | Dev / QA |
| 21 | OMX-004 | Google Photos not configured / errors | 2 | Dev |
| 22 | OMX-003a | Google Photos sign-in & Picker | 5 | Dev |
| 23 | OMX-003b | Google Photos poll, download & queue | 3 | Dev |
| | | **Total committed** | **77** | |

### 2.2 Stretch (Should) — 29 pts, pull in this order

| # | ID | Title | Pts |
|---|---|---|---|
| 1 | OMX-002 | Drag & drop upload | 2 |
| 2 | OMX-015 | Filter & search | 3 |
| 3 | OMX-019 | Category breakdown chart (horizontal bar) | 3 |
| 4 | OMX-020 | Monthly trend chart | 3 |
| 5 | OMX-022 | JSON backup export/import | 3 |
| 6 | OMX-023 | CSV export | 2 |
| 7 | OMX-011 | Duplicate slip detection | 3 |
| 8 | OMX-009 | Payee/memo/bank/ref extraction | 5 |
| 9 | OMX-029 | Performance budget | 3 |
| 10 | OMX-031 | Security hygiene | 2 |

Not in sprint: OMX-039 (Could), OMX-032–038 (Won't).

## 3. Sequencing — Design first, Dev follows, QA in parallel

```
Day 1 ─ Designer: tokens · app shell/nav · copy deck v1 · wireframes (Dashboard, Transactions, Manual form)
        Dev:      scaffold (Vite/TS/lint/test/CI), ADRs, Tesseract self-host spike — no UI until tokens+shell land
        QA:       test plan, test cases for Slice 1 stories, Layer A golden OCR-text fixtures
Day 2 ─ Designer: Add slip + queue + Review wireframes, empty/error catalogue, Review usability check
        Dev:      Slice 1 (028, 025, 024, 021, 017, 018, 013, 014, 016) → parsers 006/007/008/010 against Layer A
        QA:       test cases for slip core, synthetic slip generator + Layer B v1, test Slice 1 as it lands
Day 3 ─ Designer: Google Photos states, charts, Settings/export; mid-sprint grooming
        Dev:      001, 005, 012a/b, 026 → 004, 003a/b (stub first, real Client ID when A3 done)
        QA:       e2e journeys (mock OCR), OCR benchmark, exploratory
Day 4 ─ Dev: 030, 027 audit/fix, stretch in order · QA: regression, a11y, Tier-1 devices, privacy allowlist
Day 5 ─ Hardening, UAT entry check, Sprint Review/Demo on Pages, Retro
```

Rule: a UI story moves to **In Progress** only after Designer hands off its wireframe + copy keys (DoR #4). Logic-only work (parsers, storage, CI) may start immediately.

## 4. Task Breakdown per Role

### 4.1 Designer
| Task | Stories | Day |
|---|---|---|
| D1 Design tokens (color incl. income/expense pair ≥ 4.5:1, spacing, radius, type scale, Thai font self-host) | 025, 027 | 1 |
| D2 App shell: bottom nav + Add action sheet, side nav ≥ 1024px, header with TH\|EN, safe-area | 025, 024 | 1 |
| D3 Copy deck v1 (key-based TH/EN) for Slice 1 screens | 024 | 1 |
| D4 Wireframes: Dashboard (balance hero, cards, month selector), Transactions list, Transaction form + category icon grid | 017, 018, 014, 013, 016 | 1 |
| D5 Wireframes: Add slip (upload/drop zone, trust message, queue states), Review (mobile cards / desktop split), image dialog | 001, 002, 005, 012a/b, 030 | 2 |
| D6 Empty/error catalogue (TH/EN + icon + action) | 026, 004 | 2 |
| D7 Usability check of Review wireframe (1–2 people) | 012a | 2 |
| D8 Google Photos states (pre-consent copy, waiting, downloading, errors) | 003a/b, 004 | 3 |
| D9 Charts (horizontal bar, grouped bar, table view), Settings/export/import, danger zone | 019, 020, 022, 023, 030 | 3 |
| D10 a11y annotations on all wireframes; design review of built screens | 027 | 1–5 |

### 4.2 Dev
| Task | Stories | Day |
|---|---|---|
| V1 Scaffold: Vite + React 18.3.1 + TS ~5.9.3, ESLint/Prettier, Vitest, Playwright + axe, `.nvmrc` | 028 | 1 |
| V2 CI (`ci.yml`) + deploy (`deploy.yml`), Vite `base`, env injection, both Client-ID build variants | 028 | 1 |
| V3 ADRs 0001–0003; Tesseract self-host copy script + Pages sub-path spike | 028, 005 | 1 |
| V4 App shell, HashRouter, focus-on-route, skip link, ErrorBoundary, live region | 025, 027, 026 | 2 |
| V5 i18n setup, typed keys, key-parity check, `<html lang>` | 024 | 2 |
| V6 Domain model, money (satang) & date (Asia/Bangkok) libs, storage adapter `omx.v1` + zod, multi-tab sync | 021 | 2 |
| V7 Month selector, summary cards, transaction list, shared `TransactionForm`, edit/delete + undo | 017, 018, 013, 014, 016 | 2 |
| V8 Text normalizer; type, amount, date/time extractors; categorizer + rules file (table-driven tests on Layer A) | 006, 007, 008, 010 | 2–3 |
| V9 File validation (MIME + signature), queue store, Tesseract worker lifecycle, preprocessing/downscale, progress | 001, 005 | 3 |
| V10 Review screen (cards, validation, type toggle, save selected, discard) + viewer/raw text/leave-guard | 012a, 012b | 3 |
| V11 Google wrapper (GIS + Picker), config detection & error states, session polling, download to queue | 004, 003a, 003b | 3–4 |
| V12 Privacy: CSP meta, delete-all, trust copy, network allowlist e2e | 030 | 4 |
| V13 a11y audit & fixes (axe 0 critical/serious) | 027 | 4 |
| V14 Stretch stories in order (002 → 015 → 019 → 020 → 022 → 023 → 011 → 009 → 029 → 031) | Should | 4–5 |
| V15 Wire OCR benchmark script to app Tesseract config | 006–010 | 2 |

### 4.3 QA
| Task | Stories | Day |
|---|---|---|
| Q1 Test plan (levels, environments, browser/device matrix, reference devices, severity) | all | 1 |
| Q2 Test cases (G/W/T) for Slice 1 stories | 028, 025, 024, 021, 017, 018, 013, 014, 016 | 1 |
| Q3 Layer A golden OCR-text fixtures (first ~40 cases, incl. conflict cases) + redaction guideline | 006, 007, 008, 010 | 1 |
| Q4 Test cases for slip core & Google Photos | 001, 005, 006–010, 012a/b, 003a/b, 004 | 2 |
| Q5 Synthetic slip generator (HTML → PNG) + Layer B v1 + negative files + state fixtures | 001, 005–011, 021, 029 | 2–3 |
| Q6 Test Slice 1 stories on deployed build as they reach QA | Slice 1 | 2–3 |
| Q7 E2E journeys 1–7 (mock OCR), axe per screen, network allowlist | 030, 027, all | 3–4 |
| Q8 OCR benchmark report vs metrics | 006, 007, 008, 010 | 3–4 |
| Q9 Manual: native picker iOS/Android, real Google OAuth/Picker, screen readers, Tier-1 devices | 001, 003a/b, 027 | 4 |
| Q10 Regression + UAT entry checklist | all | 5 |

### 4.4 PO/PM
| Task | Day |
|---|---|
| P1 Follow up repo owner: push access, Pages source = Actions, repo variable (A4) | 1 |
| P2 Google Cloud OAuth Client ID + test users (A3) | 1–2 |
| P3 Customer salary-slip request + consent (A5) | 0–2 |
| P4 Charter change-log entry for capacity decision (A11) | 1 |
| P5 Accept stories as they reach Done; daily scope/burndown check; mid-sprint grooming (Day 3) | 1–5 |
| P6 Prepare Sprint Review/Demo + UAT pack with QA | 5 |

## 5. Definition of Done
Every story must satisfy the **Definition of Done in `docs/agile/00-team-charter.md` §4** (PR review, CI green incl. typecheck/lint/unit, QA pass on the deployed GitHub Pages build, TH+EN strings, a11y basics, no Critical/High bugs, no data leaving the browser, docs updated, PO acceptance). Additional Sprint 1 checks:
- [ ] Parser stories (006/007/008/010): golden-fixture CI gate met; benchmark result attached to PR
- [ ] UI stories: matches Designer wireframe + copy deck keys; state matrix (loading/empty/error/success) covered
- [ ] Money in satang, dates per R2 (reviewed in PR)

## 6. Sprint Board (at end of Planning)

| To Do | In Progress | In Review | QA | Done |
|---|---|---|---|---|
| OMX-028 Deploy (3) | | | | |
| OMX-025 Layout & nav (3) | | | | |
| OMX-024 TH/EN (3) | | | | |
| OMX-021 Persistence (3) | | | | |
| OMX-017 Month selector (2) | | | | |
| OMX-018 Monthly summary (2) | | | | |
| OMX-013 Manual entry (3) | | | | |
| OMX-014 Transaction list (3) | | | | |
| OMX-016 Edit & delete (3) | | | | |
| OMX-001 Upload (3) | | | | |
| OMX-005 OCR + progress (5) | | | | |
| OMX-006 Type detection (3) | | | | |
| OMX-007 Amount (5) | | | | |
| OMX-008 Date & time (5) | | | | |
| OMX-010 Categorize (5) | | | | |
| OMX-012a Review core (5) | | | | |
| OMX-012b Review extras (3) | | | | |
| OMX-026 Empty/error (3) | | | | |
| OMX-030 Privacy (2) | | | | |
| OMX-027 Accessibility (3) | | | | |
| OMX-004 GP states (2) | | | | |
| OMX-003a GP sign-in & Picker (5) | | | | |
| OMX-003b GP download & queue (3) | | | | |
| *Stretch:* 002, 015, 019, 020, 022, 023, 011, 009, 029, 031 | | | | |
| **77 pts committed** | **0** | **0** | **0** | **0** |

> Live board updates are recorded in `03-daily-standup.md`.
