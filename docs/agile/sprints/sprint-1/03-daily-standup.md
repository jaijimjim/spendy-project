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
