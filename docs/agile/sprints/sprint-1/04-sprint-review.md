# Sprint 1 — Sprint Review / Demo

> Date: 2026-11-13 (Day 5) · Timebox: 45 นาที · Facilitator: PO/PM
> Attendees: PO/PM, Designer, Dev, QA · Customer/stakeholders: invited. Their feedback goes in §6 and then into `feedback-log.md`
> Demo build: local production build (`vite build` + `vite preview`, base `/omnitrix-project/`), **real Tesseract OCR**. It is not the GitHub Pages URL, because B1 is still open
> Demo video: [`demo/omnitrix-sprint1-demo.mp4`](demo/omnitrix-sprint1-demo.mp4) (1:35, 1280×720). Recording script: `scripts/record-demo.cjs`
> Evidence: [`docs/qa/test-summary-report.md`](../../../qa/test-summary-report.md) · [`docs/qa/bug-report.md`](../../../qa/bug-report.md) · [`03-daily-standup.md`](03-daily-standup.md) · `design/`

## 1. Sprint Goal: outcome

> Sprint Goal (from `02-sprint-planning.md`): open Omnitrix Money on GitHub Pages, import slips by upload or Google Photos, get type/amount/date/category automatically, review and save, add manual entries, edit/delete, and see the monthly dashboard in TH/EN on mobile, with data staying on the device.

| Part of goal | Result |
|---|---|
| Upload slip → OCR → auto type / amount / date / category → review → save → dashboard | ✅ Shown live with real OCR |
| Manual entry, edit/delete, list/search, TH/EN, mobile-first, a11y, privacy | ✅ Shown |
| **Hosted on GitHub Pages (reachable from outside)** | ⛔ **Not met.** Workflows are ready but have never run, because there is no push access (B1) |
| **Google Photos import** | ⚠️ Code complete. Only the "not configured" state could be shown, because there is no OAuth Client ID (B2) |

**Verdict (PO):** the product part of the Sprint Goal is **met functionally**. The **delivery part is not met**: there is no public deploy and Google Photos has not been tested against real Google. Under the charter DoD (QA pass on the deployed Pages build), **no story is formally Done yet**. Stories that pass every other DoD item are recorded as **"Accepted (pending deploy)"** (see the new status in charter §6).

### Key numbers
| Metric | Value |
|---|---|
| Must: dev-complete | **77 / 77 pts** (23 items) |
| Stretch (Should): dev-complete | **9 / 10 items, 26 / 29 pts** (OMX-029 partial) |
| PO-accepted (pending deploy) | **Must 66 pts** (20 items) + **Should 26 pts** (9 items) = **92 pts** |
| Not accepted, carried over | OMX-028 (3), OMX-003a (5), OMX-003b (3), OMX-029 (3, partial) |
| Formally Done per DoD | **0 pts.** Every story is blocked on the deploy (B1) |
| Test cases | 132: **118 Pass**, 1 Fail (BUG-007 Low), 12 Blocked (B1/B2/devices), 1 Not run |
| Automated | Vitest **209/209** · Playwright **93 pass**, 5 skipped by design, 0 fail · lint/typecheck/i18n (345 keys) ✅ · initial JS **170.2 KB gz** (limit 300) |
| OCR (real Tesseract, 27 synthetic slips) | type **100%** · amount **96.3%** · category **100%** · date **100%** (gates: 90 / 80 / 60) |
| Defects | 8 found (0 Critical, 1 High, 5 Medium, 2 Low). **7 closed.** Open: BUG-007 Low |
| QA recommendation | **GO for UAT, with conditions C1–C5** (test summary §1) |

## 2. Demo Agenda (45 min)

| # | Time | Item | Presenter |
|---|---|---|---|
| 1 | 5′ | Sprint Goal, scope committed (77 + 29 stretch), the blockers B1/B2 | PO |
| 2 | 3′ | Design system: tokens, light/dark, copy deck TH/EN, IA (`design/`) | Designer |
| 3 | 10′ | Demo video walkthrough (§3), plus live Q&A on the local build | Dev |
| 4 | 7′ | Quality: test results, OCR benchmark, bugs, UAT conditions | QA |
| 5 | 5′ | Story-by-story acceptance (§4) | PO |
| 6 | 10′ | Stakeholder feedback (§6) | All |
| 7 | 5′ | Updated release / UAT plan (§7) and Sprint 2 candidates | PO |

## 3. What was shown (demo video, 1:35)

| # | Scene | What the audience saw | Stories |
|---|---|---|---|
| 1 | Dashboard | Balance hero, Income/Expense cards for พ.ย. 2569, using 5 months of seeded sample data | 017, 018, 021 |
| 2 | Charts | Horizontal-bar category breakdown and the 6-month trend (hand-rolled SVG, accessible table) | 019, 020 |
| 3 | Add slip | Upload or Google Photos entry points, trust message "รูปของคุณไม่ถูกส่งออกจากเครื่อง" | 001, 002, 025, 030 |
| 4 | Upload 3 slips | Salary slip · GrabFood transfer · electricity bill | 001 |
| 5 | OCR | Tesseract.js `tha+eng` running in the browser, per-item progress, assets self-hosted | 005, 030 |
| 6 | Review | Type detected automatically (salary = income, transfer = expense), amount, date, payee and category filled in; user can edit; "บันทึกที่เลือก" | 006, 007, 008, 009, 010, 012a, 012b |
| 7 | Dashboard updated | Food + electricity added to this month's categories. The October salary was saved as **+46,200 income in October** (date taken from the slip, not today) | 008, 018, 019 |
| 8 | Transactions | List grouped by date, search, edit/delete with undo | 014, 015, 016 |
| 9 | Manual entry | Cash motorcycle-taxi expense entered by hand | 013 |
| 10 | Language | TH ⇄ EN on every screen | 024 |
| 11 | Dark mode | Follows the device setting, contrast at WCAG AA | 025, 027 |
| 12 | Google Photos | "Not configured" state with a clear hint to use upload | 004 (003a/b code not exercised) |
| 13 | Result card | Summary of the sprint outcome | — |

Not in the video but evidenced by tests: JSON export/import (022), CSV export with formula-injection guard (023), duplicate detection (011), empty/error states (026), axe 0 critical/serious (027), network allowlist + CSP (030), XSS fixtures (031).

## 4. Story Acceptance (PO)

Legend: **Accepted (pending deploy)** = every AC verified by QA on the local production build, PR-equivalent review done, and the only open DoD items are #1 (merge via PR on GitHub), #3 (QA on the Pages build) and #9 (final acceptance on Pages). The item becomes **Done** after the post-deploy smoke passes. **Not accepted** = an AC or a dependency is not yet met.

### 4.1 Must (committed 77 pts)
| ID | Title | Pts | PO decision | Notes |
|---|---|---|---|---|
| OMX-001 | Upload slip images | 3 | Accepted (pending deploy) | AC7 (native picker on iOS/Android) still needs real-device testing (OMX-043) |
| OMX-004 | GP not configured / errors | 2 | Accepted (pending deploy) | Shown in demo |
| OMX-005 | In-browser OCR + progress | 5 | Accepted (pending deploy) | Self-hosted assets confirmed. Caching on Pages to be checked post-deploy |
| OMX-006 | Type detection | 3 | Accepted (pending deploy) | 100% Layer A/B. Received-slip limitation K6 (→ OMX-039) |
| OMX-007 | Extract amount | 5 | Accepted (pending deploy) | BUG-007 (Thai digits on image, Low) accepted as a known limitation (→ OMX-040) |
| OMX-008 | Extract date & time | 5 | Accepted (pending deploy) | BUG-001 fixed (date 60% → 100%). O2 salary rule (→ OMX-045) |
| OMX-010 | Auto-categorize | 5 | Accepted (pending deploy) | BUG-006 fixed. The rules file path is updated in backlog R6 (K2) |
| OMX-012a | Review core | 5 | Accepted (pending deploy) | |
| OMX-012b | Review extras | 3 | Accepted (pending deploy) | |
| OMX-013 | Manual entry | 3 | Accepted (pending deploy) | BUG-002 (High, double save) fixed. **K3 deviation accepted:** desktop form is a centred page instead of a `<dialog>`, with Back/Esc kept. AC1 is updated |
| OMX-014 | Transaction list | 3 | Accepted (pending deploy) | AC6 (500 tx ≤ 1 s on reference devices) to be measured with OMX-029 / OMX-044 |
| OMX-016 | Edit & delete | 3 | Accepted (pending deploy) | |
| OMX-017 | Month selector | 2 | Accepted (pending deploy) | |
| OMX-018 | Monthly summary | 2 | Accepted (pending deploy) | |
| OMX-021 | Persistence | 3 | Accepted (pending deploy) | Multi-tab sync covered |
| OMX-024 | TH/EN | 3 | Accepted (pending deploy) | Copy deck used directly as i18n source (345 keys, parity check) |
| OMX-025 | Layout & nav | 3 | Accepted (pending deploy) | BUG-003 (320px) fixed. O5 cosmetic (→ OMX-046) |
| OMX-026 | Empty/error states | 3 | Accepted (pending deploy) | |
| OMX-027 | Accessibility | 3 | Accepted (pending deploy) | BUG-005 fixed. Lighthouse and screen readers (NVDA/VoiceOver/TalkBack) still pending (B1, OMX-043) |
| OMX-030 | Privacy | 2 | Accepted (pending deploy) | Allowlist e2e + CSP ✅. HAR review on Pages pending |
| OMX-028 | Deploy via GitHub Actions | 3 | **Not accepted** | `ci.yml`/`deploy.yml` written but never run (B1). Carried over |
| OMX-003a | GP sign-in & Picker | 5 | **Not accepted** | Code complete against the stub. Real OAuth not tested (B2). Carried over |
| OMX-003b | GP poll, download & queue | 3 | **Not accepted** | Same as 003a. AC5 per-item Failed + Retry is not implemented (K1) → OMX-041 |

**Must accepted (pending deploy): 66 / 77 pts.**

### 4.2 Stretch (Should)
| ID | Title | Pts | PO decision |
|---|---|---|---|
| OMX-002 | Drag & drop | 2 | Accepted (pending deploy) |
| OMX-015 | Filter & search | 3 | Accepted (pending deploy). BUG-008 fixed |
| OMX-019 | Category chart | 3 | Accepted (pending deploy) |
| OMX-020 | Trend chart | 3 | Accepted (pending deploy) |
| OMX-022 | JSON backup | 3 | Accepted (pending deploy) |
| OMX-023 | CSV export | 2 | Accepted (pending deploy). BUG-004 fixed. AC5 (Excel/Sheets manual) pending |
| OMX-011 | Duplicate detection | 3 | Accepted (pending deploy) |
| OMX-009 | Payee/memo/bank/ref | 5 | Accepted (pending deploy) |
| OMX-031 | Security hygiene | 2 | Accepted (pending deploy). gitleaks runs in CI on the first push |
| OMX-029 | Performance budget | 3 | **Not accepted (partial).** AC2 (bundle 170 KB) and AC4 (downscale) are met. AC1 (LCP), AC3 (device OCR time) and AC5 (1,000-row render) are not measured. Carried over |

## 5. Known Issues for the UAT Pack (PO accepts: QA condition C3)
| # | Issue | Severity | Disposition |
|---|---|---|---|
| BUG-007 | Thai-digit amounts on images are misread, so the amount is empty and the user types it in | Low | Known limitation → OMX-040 |
| O1 | `<input type="date">` uses the browser's display format (mm/dd on en-US). A formatted chip sits next to it | Info | Accepted for MVP |
| O2 | A salary slip with no pay date and the current month as its period falls back to today | Info | Decision in Sprint 2 grooming → OMX-045 |
| O3/K6 | A received slip that looks like a sender slip is recorded as Expense | Known limitation | User flips the type on Review. OMX-039 |
| O5 | Search placeholder slightly truncated at 320px | Cosmetic | OMX-046 |
| K1 | Google download failures are announced instead of shown as a per-item Retry | Medium (AC gap) | OMX-041 |

## 6. Stakeholder Feedback (placeholders: fill in during or after the demo, then log as FB-xxx)

| # | From | Feedback | Type | PO initial response | Logged as |
|---|---|---|---|---|---|
| 1 | Customer | _(pending)_ | | | FB-0xx |
| 2 | Customer | _(pending)_ | | | FB-0xx |
| 3 | Team | Desktop form as a page instead of a dialog (K3) | UX | Accepted for MVP | FB-005 |
| 4 | QA | Salary slip date rule when the period end is in the future (O2) | Improvement | Grooming decision | FB-002 |

Questions for the customer:
1. Can you provide 1–3 redacted real salary slips (A5, still open)? They are needed to measure real-world accuracy.
2. Who owns the GitHub repo and the Google Cloud project? We need push access, Pages source = GitHub Actions, and an OAuth Client ID.
3. Is UAT acceptable in Google Photos "Not configured" mode if B2 cannot be closed in time (QA condition C2)?

## 7. Updated Release / UAT Plan

| Step | What | Owner | Entry → Exit | Target |
|---|---|---|---|---|
| R0 | **Close B1.** Repo owner applies the git bundle (or grants push access), enables Pages source = GitHub Actions, sets the repo variable | PO → repo owner | Bundle handed over → `main` on GitHub | Sprint 2 Day 1 |
| R1 | First CI + deploy run. Fix any base-path/CSP/asset issues | Dev | CI green → app loads at `https://jaijimjim.github.io/omnitrix-project/` | Sprint 2 Day 1 |
| R2 | Post-deploy verification: smoke + e2e with `E2E_BASE_URL`, Lighthouse (LCP, a11y ≥ 90), HAR privacy review, gitleaks | QA | R1 done → all Accepted (pending deploy) stories move to **Done** | Sprint 2 Day 1–2 |
| R3 | **Close B2** (OAuth Client ID + test users), then run TC-015/016/017. Otherwise PO records in writing a decision to run UAT in "Not configured" mode | PO → Dev/QA | Client ID set → 003a/003b Done | Sprint 2 Day 2 |
| R4 | Tier-1 real-device smoke (Android Chrome, iOS Safari) and screen readers | QA | → C5 met | Sprint 2 Day 2 |
| R5 | Build freeze: tag `v0.1.0-uat` + release notes + UAT pack (scenarios, synthetic slips, known issues §5) | PO + QA | C1–C5 met → UAT start | Sprint 2 Day 2 |
| R6 | **UAT** with the customer on the Pages URL (persona scenarios P1/P2/P3, real slips processed on the customer's own device), time-to-first-transaction measured | PO + QA + customer | Entry criteria → exit criteria (QA grooming §5.2) | Sprint 2 Day 3–4 |
| R7 | Triage UAT feedback (feedback-log), hotfix Critical/High, PO sign-off → release `v0.1.0` | PO | Exit criteria met | Sprint 2 Day 5 (Review) |

Sprint 2 candidates: see `01-product-backlog.md` §9.
