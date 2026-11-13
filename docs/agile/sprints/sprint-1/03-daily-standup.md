# Sprint 1 — Daily Stand-up Log

> Timebox: 15 นาที · Facilitator: PO/PM · Format: yesterday / today / blockers
> Sprint Goal: see `02-sprint-planning.md` §1 · Committed: 77 pts (Must) · Stretch: 29 pts (Should)

---

## Day 1 — 2026-11-13

**Attendees:** PO/PM, Designer, Dev, QA

| Role | Yesterday | Today | Blockers |
|---|---|---|---|
| **PO/PM** | Ran Grooming and Sprint Planning; updated backlog to v2 (estimates, AC rewrites, splits 003a/b and 012a/b, OMX-039); wrote grooming minutes and sprint plan | Follow up with the repo owner on push access, Pages source = GitHub Actions, repo variable `VITE_GOOGLE_CLIENT_ID` (A4); start Google Cloud OAuth Client ID + test users (A3); send customer salary-slip request (A5); add charter change-log entry for the capacity decision (A11) | **GitHub repo push access is pending from the repo owner** (see below) |
| **Designer** | Grooming input (UX questions, AC proposals, IA) | D1 design tokens · D2 app shell/nav + Add action sheet · D3 copy deck v1 (Slice 1) · D4 wireframes for Dashboard, Transactions, Transaction form | None |
| **Dev** | Grooming input (estimates, risks, tech stack, open-question proposals) | V1 scaffold locally (Vite + React 18.3.1 + TS, lint, Vitest, Playwright) · V2 draft `ci.yml` / `deploy.yml` · V3 ADRs 0001–0003 + Tesseract self-host spike. Holds UI work until D1/D2 hand-off | Cannot push branches or verify the Pages deploy until push access is granted. Working on local branches for now |
| **QA** | Grooming input (testability review, test approach, data strategy, UAT criteria) | Q1 test plan · Q2 test cases for Slice 1 stories · Q3 Layer A golden OCR-text fixtures (first batch) + redaction guideline | Needs the repo to commit fixtures. Holding them locally until push access is granted |

### Blockers & follow-ups

| # | Blocker | Impact | Owner | Action | Target |
|---|---|---|---|---|---|
| B1 | **GitHub repo push access pending from repo owner (github.com/jaijimjim/omnitrix-project)** | Blocks OMX-028 (CI/CD, Pages deploy), all PR-based work, and committing QA fixtures. Every story's DoD needs a deployed build | **PO** | Contact the repo owner today. Also ask them to set Pages source = GitHub Actions and add the repo variable. Team keeps working on local branches meanwhile | Day 1 end-of-day; escalate at Day 2 stand-up if still open |
| B2 | Google OAuth Client ID not yet created (A3) | Real-Google testing of OMX-003a/003b. Development continues against the stub wrapper | PO | Create GCP project, consent screen (Testing), test users, authorized origins | Day 2 |

### Board snapshot (end of Day 1 stand-up)

| To Do | In Progress | In Review | QA | Done |
|---|---|---|---|---|
| 021, 017, 018, 013, 014, 016, 001, 005, 006, 007, 008, 010, 012a, 012b, 026, 030, 027, 004, 003a, 003b · stretch | OMX-028 (Dev, local; push blocked B1) · OMX-025 (Designer D1/D2) · OMX-024 (Designer D3) | — | — | — |

**Burndown:** 77 pts remaining (Day 1 of 5).

---

## Day 2 — Dev entry

| Role | Yesterday | Today | Blockers |
|---|---|---|---|
| **Dev** | V1 scaffold (Vite 7 + React 18.3.1 + TS 5.9 strict, ESLint 9 flat, Prettier, Vitest 4, Playwright), V3 Tesseract self-host copy script (pinned npm packages → `public/tesseract/`, not committed) | V6 domain model + money (satang) / date (Asia/Bangkok) libs · V8 text normalizer, type / amount / date-time / payee-bank-ref extractors, categorizer + single rules file, table-driven tests on a Dev starter Layer A set (28 synthetic OCR-text fixtures) · V6 storage adapter `omx.v1` + zod, multi-tab reload · OCR engine interface (Tesseract + fake engine for QA, `?ocr=fake` / `window.__OMX_TEST__`), injectable clock & storage · V11 Google Photos wrapper (GIS token client + Picker API) | B1 push access still pending → all work is in local commits on `main` (not pushed). Playwright browser download is blocked by the sandbox proxy → using a pre-installed Chromium (`PW_CHROMIUM_PATH`); CI uses `playwright install` normally |

**Notes for QA:** parser modules are pure (`src/domain/slip/*`) — please drop golden fixtures into `src/domain/slip/__fixtures__/` (same `OcrFixture` shape) and they run in the CI gate test automatically. Fake OCR picks text by file-name stem (`slip-food`, `slip-bill`, `slip-salary`, `slip-transfer`, `slip-noamount`, `slip-xss`; names containing `corrupt` fail) or from `window.__OMX_TEST__.fakeOcr`.

## Day 3 — Dev entry

| Role | Yesterday | Today | Blockers |
|---|---|---|---|
| **Dev** | Domain layer done: 164 unit tests, `src/domain` coverage 98% lines / 91% branches; Layer A gates met (type 100%, amount/date/category 100% on the starter set) | V4/V5 shell + i18n from `design/copy-deck.json` · V7 dashboard, month selector, list, shared form, edit/delete + undo · V9/V10 upload, queue, Review · V11 Google Photos UI states · V12 privacy (CSP meta, delete-all, trust copy) · V13 axe fixes · stretch 002, 015, 019, 020, 022, 023, 011, 009, 031 · V2 `ci.yml` + `deploy.yml` · README (TH/EN) / CONTRIBUTING / ADR 0001–0003. Verified locally: lint, typecheck, unit, build (initial JS 170 KB gz), 42 e2e (mobile + desktop, fake OCR, axe 0 critical/serious), **real Tesseract run in the built app on a generated Thai slip — `tha`/`eng` data, worker and core all loaded from our origin, amount 245.00 read correctly** | B1 (push) and B2 (Google Client ID) still open — Google Photos tested only via stub/not-configured state; Pages deploy + gitleaks not yet run |

### Known issues / follow-ups (Dev → PO/QA)
| # | Item | Story | Proposal |
|---|---|---|---|
| K1 | Real Google OAuth/Picker flow not exercised (no Client ID). Wrapper, polling, download & error mapping implemented; download failures are counted + announced rather than shown as a per-item Failed row with Retry | 003a/003b | Verify with real Client ID once B2 closes; per-item Retry for Google downloads → small follow-up |
| K2 | Category rules file lives at `src/domain/slip/categories.rules.ts` (coordinator asked for parser in `src/domain`), not the path written in R6 | 010 | PO to update R6 path in backlog |
| K3 | Desktop Add/Edit form renders as a centred page column (not a `<dialog>`); desktop Add menu uses the centred sheet instead of a popover | 013, 025 | Designer review — functionally equivalent, Back/Esc behaviour kept |
| K4 | Performance: LCP / device OCR timings (029 AC1, AC3) not measured — only bundle budget (AC2) and downscale (AC4) are automated; no list virtualisation (> 200 rows) | 029, 014 | QA measures on reference devices on Pages |
| K5 | Real-OCR verified on one clean synthetic slip; Layer B benchmark (accuracy %) pending QA's generator | 006–010 | Wire `bench:ocr` once Layer B lands |
| K6 | Received transfers that look like sender slips stay Expense (documented AC8 limitation) | 006 | OMX-039 |

### Sprint board (end of Day 3, Dev view)

| To Do | In Progress | In Review (Dev done, local CI green, awaiting push/PR + QA on Pages) | QA | Done |
|---|---|---|---|---|
| — | OMX-003a, OMX-003b (code done, real-Google verification blocked by B2) · OMX-029 (partial: AC2/AC4 only) | **Must:** 028, 025, 024, 021, 017, 018, 013, 014, 016, 001, 005, 006, 007, 008, 010, 012a, 012b, 026, 030, 027, 004 · **Stretch:** 002, 015, 019, 020, 022, 023, 011, 009, 031 | — | — (DoD needs PR review + QA on deployed Pages build; blocked by B1) |

**Burndown (Dev-complete):** Must 69/77 pts in review, 8 pts (003a/003b) code-complete pending verification · Stretch 26/29 pts in review (029 partial).
