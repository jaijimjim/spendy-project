# Contributing to Omnitrix Money

> ภาษา: เอกสารใช้ไทยปนศัพท์เทคนิคอังกฤษได้ · โค้ดและคอมเมนต์เป็นภาษาอังกฤษ (Working Agreement, team charter §6)

## Workflow
1. Pick a story that is **Ready** (Definition of Ready, charter §3). One person ≤ 2 stories In Progress.
2. Branch from `main`: `feat/OMX-xxx-short-name`, `fix/OMX-xxx-short-name`, `chore/…`, `docs/…`. Never push to `main`.
3. Commit with **Conventional Commits** referencing the story: `feat(OMX-007): reject 3-decimal amounts`.
4. Open a PR (template: what / why / screenshots / test evidence / AC checklist). At least **one reviewer**; CI must be green.
5. QA verifies on the deployed Pages build; PO accepts in Sprint Review (Definition of Done, charter §4).

## Code standards
- **TypeScript strict**, no `any` unless justified in a comment; prefer small modules (< ~250 lines) and pure functions.
- **Domain logic lives in `src/domain/`**: no React, no DOM, no `Date.now()` — inject `today`/clock. Every rule gets a table-driven unit test; coverage on `src/domain` must stay ≥ 80% (CI gate).
- **Money** = integer satang. **Dates** = `YYYY-MM-DD` strings, Asia/Bangkok. Never `new Date('YYYY-MM-DD')`.
- **Category keywords** only in `src/domain/slip/categories.rules.ts` (+ a test row).
- **UI strings** only from `design/copy-deck.json` via `t('key')` — no hard-coded text. `npm run i18n:check` must pass. New keys go to both `th` and `en` (coordinate with the Designer).
- **Styling**: CSS Modules + design tokens (`var(--omx-*)`) only — no raw hex values in components.
- **Accessibility**: labels for every input, errors via `aria-describedby`, native `<dialog>` for modals, never colour-only meaning, touch targets ≥ 44px, `prefers-reduced-motion` respected. axe must report 0 critical/serious.
- **Security/privacy**: no `dangerouslySetInnerHTML` (ESLint error), validate external data with zod, never log financial data, never send images/OCR text off-device, never commit secrets.
- **Comments** explain *why* (and link the AC/rule), not *what*.

## Before pushing
```bash
npm run typecheck && npm run lint && npm run format:check && npm run i18n:check && npm test
npm run build && npm run e2e   # for UI changes
```

## Tests
- Unit/component: `*.test.ts(x)` next to the code (Vitest + Testing Library).
- E2E: `tests/e2e/*.spec.ts` (Playwright) against the production build with the fake OCR engine; use the `__OMX_TEST__` hooks for clock/storage/Google stubs.
- Parser fixtures (Layer A) are synthetic or fully redacted — **never commit real slips** (repo and Pages are public).

## Architecture changes
Changing an architecture constraint (charter §1) needs team agreement and an ADR in `docs/adr/` (`NNNN-title.md`: context, decision, consequences).
