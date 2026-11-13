# Sprint 1 — Retrospective

> Date: 2026-11-13 (Day 5, after Review) · Timebox: 30 นาที · Facilitator: PO/PM · Attendees: PO/PM, Designer, Dev, QA
> Format: **4Ls** (Liked · Learned · Lacked · Longed for), then **Start / Stop / Continue**, then action items (no more than 3 priority items, each with an owner). This is a blameless retro (charter §6)

## 1. Sprint in Numbers (context)
- Committed **77 pts Must** against a planned velocity of **~40**. Dev-complete: 77/77 Must + 26/29 stretch. Formally Done: **0** (no deploy, B1)
- 132 TCs (118 Pass) · 209 unit · 93 e2e · OCR on 27 synthetic slips: type 100%, amount 96.3%, category 100%, date 100%
- 8 bugs (1 High), 7 closed. 4 were fixed by QA and code-reviewed by Dev; 3 were fixed by Dev and re-tested by QA
- Blockers for the whole sprint: **B1** no GitHub push access (the session was never bound to the repo, so the user was given a git bundle instead), and **B2** no Google OAuth Client ID

## 2. 4Ls by Role

### PO/PM
| Liked | Learned | Lacked | Longed for |
|---|---|---|---|
| Grooming input from all 3 roles was thorough. QA's testability review turned 7 vague stories into measurable AC before any code | Committing 77 pts against ~40 velocity **only worked because the team ran with AI agents**. It is not a repeatable baseline, and it hid real schedule risk | I never got repo push access or the Google Client ID resolved. Both external dependencies stayed open from Day 1 to Day 5 | A "Sprint 0" checklist confirming repo, deploy target and credentials **before** Planning |
| Customer-mandated scope was protected (Google Photos, auto-category) | "Dev-complete" and "Done" diverged completely because the DoD depends on deploy. We need a clear interim status | Customer real slips (A5) never arrived, so real-world accuracy is still unknown | Faster customer touchpoints during the sprint, not only at Review |

### Designer
| Liked | Learned | Lacked | Longed for |
|---|---|---|---|
| **The copy deck (`design/copy-deck.json`) was used directly as the i18n source.** No re-typing, 345 keys at TH/EN parity, and copy fixes (BUG-008) were one-line changes | Designing light and dark tokens up front with contrast tables made the a11y work almost free (axe 0 critical/serious) | No usability check with real users (A7 was done only as an internal review). No real devices to check safe-area and font rendering | A theme switch and a desktop dialog pattern. Both slipped (K3), and nobody raised the slip until the end |
| Design-first sequencing (tokens → shell → wireframes) meant Dev never waited on UI decisions | Writing AC-ready UX proposals in grooming saved a lot of back-and-forth later | Design review of built screens happened late (K3 deviation found on Day 3) | A short "design QA" pass per story before it goes to QA |

### Dev
| Liked | Learned | Lacked | Longed for |
|---|---|---|---|
| Pure domain layer (`src/domain/slip/*`) with **contract-style table-driven tests**: 98–99% coverage, and QA could drop fixtures in without touching code | Self-hosting Tesseract assets worked first time with real OCR on the built app. ADRs made decisions easy to explain | Push access, so CI/deploy and gitleaks never ran on GitHub. "CI green" means local only | Golden fixtures from QA on Day 1, as planned. The first real-OCR benchmark came late |
| Injectable OCR engine / clock / storage hooks (asked for by QA in grooming) made e2e deterministic | The Playwright browser download was blocked by the sandbox proxy, so we used a pre-installed Chromium. Environment quirks belong in CONTRIBUTING | Real Google credentials, so the 003a/b error mapping is untested against real responses | Smaller, earlier PR-sized increments that someone could review |

### QA
| Liked | Learned | Lacked | Longed for |
|---|---|---|---|
| The fixture layers (A text / B synthetic images) caught real OCR issues the starter fixtures missed. BUG-001 dropped date accuracy to 60%, and it was fixed to 100% | **Golden fixtures arrived late (Day 3–4), so bugs were found late.** BUG-001 and BUG-006 only showed up once real-OCR images existed | A stable environment. **A container restart interrupted QA execution** mid-run, and work had to be re-run or re-created | Fixtures ready before parser development starts, with a CI-runnable benchmark |
| QA fixing trivial bugs with a regression test plus Dev code review was fast, and quality held | `test.fail` / `it.fails` markers for known bugs kept CI green and flipped red automatically once fixed | Real devices, screen readers, Excel, and real slips. That left 12 TCs Blocked | Deploy URL for testing the deployed build, as the DoD requires |

## 3. Start / Stop / Continue (team consolidated)

| Start | Stop | Continue |
|---|---|---|
| Confirm **environment access** (repo push, Pages, external credentials) as a DoR / Sprint-0 gate before Planning | Committing far above measured velocity without an explicit buffer. Sprint 2 plans at a realistic velocity, and "AI-assisted capacity" is tracked separately | Copy deck as the single i18n source |
| **Fixture-first:** QA golden fixtures + a minimal Layer B set before parser stories start, with the benchmark wired into CI (report) | Letting blockers age silently. Any blocker older than 1 day is escalated to the customer/repo owner by the PO, with a written decision | Pure domain + table-driven/contract tests + injectable test hooks |
| **Checkpoint work often** (commit/push or bundle at least every half-day). Long QA runs write results incrementally so a container restart doesn't lose them | Calling stories "done" before deploy. Use the status **Accepted (pending deploy)** instead | QA-fixes-trivial-bugs with regression test + Dev review |
| Per-story design QA before handing to QA | Leaving UX deviations (K3) undiscussed until Review | `test.fail`/`it.fails` markers for known bugs |
| Real-device and real-slip testing slots in the sprint plan | | ADRs for architecture decisions |

## 4. Action Items for Sprint 2

| # | Action | Owner | Due | Success measure |
|---|---|---|---|---|
| **AI-1** ⭐ | **Close B1 and add an "environment access verified" item to DoR.** Get the git bundle applied or push access granted, Pages source = Actions, repo variable set. Charter DoR #7 is updated | **PO** | Sprint 2 Day 1 | `main` on GitHub, first deploy green, DoR updated |
| **AI-2** ⭐ | **Fixture-first.** QA delivers golden + synthetic fixtures for any parser/extraction story before Dev starts it, and the benchmark runs in CI as a report | **QA** (Dev wires CI) | Before each parser story | No extraction bug found after Dev-complete in Sprint 2 |
| **AI-3** ⭐ | **Realistic capacity.** Plan Sprint 2 at measured velocity, with an explicit buffer for UAT and hotfixes. Track AI-assisted throughput separately | **PO** with team | Sprint 2 Planning | Commitment ≤ velocity + agreed buffer, Day-3 burndown on track |
| AI-4 | Checkpoint discipline: commit at least every half-day. QA runners write results incrementally (resume after a restart) | **QA + Dev** | Ongoing | No lost work after an environment restart |
| AI-5 | Per-story design QA pass. Review the K3 deviation and the theme switch with the PO | **Designer** | Each UI story | Deviations raised before In QA |
| AI-6 | Close B2 (OAuth Client ID + test users), or get a written UAT "Not configured" decision | **PO** | Sprint 2 Day 2 | TC-015/016/017 executed or decision recorded |
| AI-7 | Get real slips from the customer (A5) and the team (A10) for the Layer C calibration set | **PO** (+ all) | Sprint 2 Day 2 | ≥ 11 redacted real slips available privately |
| AI-8 | Document environment quirks (Playwright Chromium path, proxy) in CONTRIBUTING | **Dev** | Sprint 2 Day 1 | New contributor can run e2e first try |

⭐ = top 3 priority actions, reviewed at every Sprint 2 stand-up.

## 5. Retro of the Retro
- Format: 4Ls worked well for an AI-assisted team. Keep it, rotate to Sailboat in Sprint 3.
- Previous action items: none (first sprint).
