# Omnitrix Money — Screen Specs v1 (Sprint 1)

> Owner: Designer · 2026-11-13 · Handoff for D2, D4, D5, D6, D8, D9, D10
> Read with: `design-system.md` (components §6, a11y §7), `tokens.css`, `copy-deck.json` (keys in `code`), `mockups.html` / `mockups.png` (visual reference)
> Breakpoints: **mobile 375** (base, also must work at 320) · tablet 768 (drop zone, 2-col form) · **desktop ≥ 1024** (side nav, split review)
> Every screen: `h1` gets focus on route change; `document.title` = `app.titleTemplate`; loading > 150ms → skeleton; app banners (offline / storage / corrupt) render under the header on all screens.

## 0. App shell & routes (OMX-025, 024, 027)

| Route (HashRouter) | Screen | Nav item |
|---|---|---|
| `#/` | Dashboard | Home |
| `#/transactions` | Transactions | Transactions |
| `#/transactions/new` | Add/Edit form (new) | — (full-screen sheet on mobile) |
| `#/transactions/:id` | Add/Edit form (edit) | — |
| `#/add` | Add slip + queue | Add |
| `#/add/review` | Review | Add |
| `#/settings` | Settings | Settings |
| (overlay) | Add sheet | opened by Add nav button — not a route |

**Mobile 375:** header 56 (h1 left, TH|EN right) → optional banner → `<main>` (padding 16, bottom padding = nav height + safe area + 16) → bottom nav 64 + safe area (Home · Transactions · **Add FAB** · Settings).
**Desktop ≥ 1024:** side nav 248 (logo, "+ เพิ่มรายการ" button, nav items, TH|EN + privacy line at bottom) · content column max 960 centered, padding 24–32, h1 in content header row with month selector on the right (Dashboard/Transactions).
**Focused flows:** Review (`#/add/review`) and the Add/Edit form hide the bottom nav on mobile to give room to their sticky footers; back/close returns to the previous screen.
**DOM order:** skip link → header → main → nav (bottom nav visually fixed but after main in DOM). Live region `role="status"` lives in the shell.

---

## 1. Add sheet (OMX-025 AC2, OMX-004 AC1)

**Trigger:** Add FAB (mobile) / "+ เพิ่มรายการ" (desktop). `aria-haspopup="dialog"`, `aria-expanded`.

| | Mobile 375 | Desktop ≥ 1024 |
|---|---|---|
| Container | Bottom sheet (`<dialog>`), radius 24 top, drag handle, title `addSheet.title` + close `X` | Popover menu anchored under the side-nav button (same items) |
| Items (each row h72, icon chip 44 + title 16/600 + hint 14 muted, chevron) | 1. `addSheet.upload` / `addSheet.uploadHint` (`ImageUp`) → `#/add` and opens file picker immediately (same gesture) · 2. `addSheet.googlePhotos` / `addSheet.googlePhotosHint` (`Images`) → `#/add` + starts GP flow · 3. `addSheet.manual` / `addSheet.manualHint` (`PencilLine`) → `#/transactions/new` | same |
| Footer | Trust line `addSlip.trust` with `LockKeyhole` (info color, 14) | — |

**States**
| State | Behaviour |
|---|---|
| Default | 3 rows enabled |
| GP not configured | Row 2 `aria-disabled="true"`, icon muted, hint replaced by visible `googlePhotos.notConfigured` (warning text 14) — still focusable so SR reads the reason |
| GP error (from last attempt) | Inline message under row 2 (`googlePhotos.denied` / `network` / `misconfigured`) + `common.tryAgain` |
| Loading / empty | n/a (static) |

**A11y:** sheet = `role="dialog"` `aria-labelledby` title; initial focus first row; Esc / back / scrim click close; focus returns to Add button. Rows are `<button>`s in a list.

---

## 2. Dashboard `#/` (OMX-017, 018, 019, 020, 026)

**Mobile 375 (top → bottom)**
1. Header: h1 `dashboard.title` · TH|EN.
2. Month selector row (centered): `‹ พฤศจิกายน 2569 ›` + "เดือนนี้" chip when not current.
3. **Balance hero card** (`dashboard.balance`, value fluid 24–36, `dashboard.balanceHint`).
4. Two mini stat tiles side by side: Income (`ArrowDownLeft`, +45,000.00) · Expense (`ArrowUpRight`, −12,480.50).
5. Card "รายจ่ายตามหมวดหมู่" (`dashboard.byCategory`) — horizontal bars, top 6 + `common.viewAll`; hint `dashboard.byCategoryHint`; toggle `common.viewAsTable` *(stretch OMX-019)*.
6. Card "รายรับ–รายจ่าย 6 เดือน" — grouped bars + legend + table toggle *(stretch OMX-020)*.
7. Card "รายการล่าสุด" — last 3 rows + `common.viewAll` → Transactions (helps first-time orientation; reuse row component).

**Desktop ≥ 1024:** header row (h1 left, month selector right). Grid 12 cols: hero spans 6, income 3, expense 3 (one row) · category chart 7 cols + recent 5 cols · trend full width.

**States**
| State | Spec |
|---|---|
| Loading | Skeleton: hero (label + 60% value bar), 2 tiles, chart card with 4 bar rows. `aria-busy` on main. |
| Empty — first use (no data at all) | Replace sections 3–7 with Empty state `empty.firstUse.*` (illustration, 2 CTAs: Upload → `#/add` + picker, Manual → `#/transactions/new`). Month selector hidden. |
| Empty — month | Hero/tiles show `0.00` (OMX-018 AC4); below them Empty state `empty.month.*` with CTA `empty.month.action` (opens Add sheet). Charts: category shows `empty.chart.noExpense` text; trend still renders with zeros if other months exist. |
| Error | Section-level error boundary per card (chart crash doesn't kill totals): `error.boundaryTitle` + `error.boundaryAction`. Storage banners per §0. |
| Success | Returning from save/edit: totals update; no extra toast on dashboard (toast came from origin screen). Negative balance → warning style + `dashboard.balanceNegative`. |

**Interactions:** month arrows/grid update both Dashboard & Transactions (shared state, not persisted); next disabled at current month. Category bar row → `#/transactions?category=food` (filtered if OMX-015 done). Tiles not interactive in S1.
**A11y:** tiles grouped with `aria-label` (`dashboard.srIncomeTile`…); month label `aria-live="polite"`; chart rows are buttons with `dashboard.categoryRowLabel`; trend SVG `role="img"` + `dashboard.trendSummary`, table toggle reveals real `<table>`.

---

## 3. Transactions `#/transactions` (OMX-014, 015, 016, 017, 026)

**Mobile 375**
1. Header h1 `transactions.title` · TH|EN.
2. Month selector (shared).
3. *(stretch OMX-015)* Search input (`transactions.searchLabel`, placeholder) + `Filters (n)` button → filter bottom sheet (type segmented All/Income/Expense, category icon-grid multi-select, `transactions.applyFilters`, `transactions.clearFilters`). Active filters as removable chips under search; when active: filtered total + `aria-live` count `transactions.results_*`.
4. Grouped list: sticky date header ("13 พ.ย. 2569" · day net) → rows (chip, payee/note, category · time · source badge, signed amount).
**Desktop ≥ 1024:** same column at max-width 720 inside content; search + filters inline in a toolbar row; filter panel is a popover; rows show source badge as a column.

**States**
| State | Spec |
|---|---|
| Loading | 2 skeleton date headers + 5 skeleton rows |
| Empty — first use | `empty.firstUse.*` (same as Dashboard) |
| Empty — month | `empty.month.*` (OMX-014 AC7) |
| Empty — no results | `empty.noResults.*` + Clear filters (OMX-026 AC2) |
| Error | Screen error boundary; list keeps last good data if a single row fails to format |
| Success | After add/edit: toast `form.savedToast` / `form.updatedToast` and row briefly highlighted (`primary-subtle` 1.2s, none with reduced motion). After delete: toast `form.deletedToast` + `common.undo` (≥ 6s, pauses on focus) → `form.restoredToast`. Edit moving to another month → row leaves list. |

**Interactions:** tap row → `#/transactions/:id` (form). Pull-to-refresh: none. Long lists: virtualise if > 200 rows (Dev) — headers stay sticky.
**A11y:** list = `<section>` per date with `<h2>` date header; row = `<button>` with accessible name `transactions.openItem` + SR amount (`type.srAmountExpense`); source badge text not icon-only.

---

## 4. Add / Edit form `#/transactions/new`, `#/transactions/:id` (OMX-013, 016)

**Mobile 375:** full-screen sheet. Top bar: `X` close (left, `common.close`) · title `form.addTitle` / `form.editTitle` · (nothing right). Body padding 16, fields stacked:
1. Type toggle (Expense | Income) — `type.label`
2. Amount (autofocus on new; `inputmode="decimal"`, ฿ prefix, 22/600 right-aligned)
3. Category trigger → icon-grid sheet (filtered by type)
4. Date (native) + formatted label "13 พ.ย. 2569"; optional time (edit shows if present)
5. Payee (optional, max 100) · 6. Note (textarea 3 rows, optional, max 500)
7. Edit only: `form.deleteTransaction` danger-ghost, full width, separated by 24px + divider.
Sticky footer: primary `form.save` (full width); new only: ghost `form.saveAndAddAnother` above it.
**Desktop ≥ 1024:** centered `<dialog>` 560 wide, same order; footer right-aligned [Cancel] [Save]; amount + date side by side at ≥ 768.

**States**
| State | Spec |
|---|---|
| Loading (edit, id lookup) | Field skeletons; unknown id → `error.generic` + back to list |
| Empty (new) | Defaults: Expense, amount empty, category none (required), date today (Asia/Bangkok) |
| Error | Inline per field (`validation.*`), on submit focus first invalid field + summary `validation.summary_*` announced; storage failure → banner `error.storageFull`, form stays open with data |
| Warning | Future date → non-blocking `form.warnFutureDate` (warning helper, `TriangleAlert`) |
| Success | Close form → previous screen + toast (`form.savedToast`); "Save and add another" keeps type/date, clears amount/payee/note, refocuses amount, toast still shows |

**Interactions:** type change resets invalid category + polite announcement (`categories.resetToIncome/Expense`). Close with unsaved input → `dialog.discardForm*` (default focus `dialog.keepEditing`). Delete → `dialog.delete*` (default focus Cancel) → back to list + undo toast. Save button disables while saving (double-tap safe).
**A11y:** each input labelled; optional marked in label; errors `aria-describedby`; Back (browser/Android) closes sheet via route; dialog traps focus.

---

## 5. Add slip + queue `#/add` (OMX-001, 002, 003a/b, 004, 005, 030)

**Mobile 375**
1. Header h1 `addSlip.title`.
2. Trust card (info-subtle, `LockKeyhole`): `addSlip.trust` + link `addSlip.trustLink` → Settings#privacy.
3. Upload block: primary button `addSlip.uploadButton` (h56) + `addSlip.fileRules` + `addSlip.tips`.
4. Secondary button `googlePhotos.button` (`Images`) + inline GP state area beneath.
5. Queue card (appears once items exist): header `queue.progress` ("กำลังอ่านสลิป 2/8") + overall bar + `queue.cancel` (secondary sm); first-run line `queue.loadingModel`; list of queue items (thumbnail · name · status · action).
6. Sticky footer (when ≥ 1 Done): primary `queue.review_*` "ตรวจรายการ (3 พร้อม)" → `#/add/review`.
**Desktop ≥ 1024 (and ≥ 768):** two columns: left = Dropzone (dashed, `addSlip.dropzoneLabel` + button) + GP button + trust; right = queue card. Drag-over full dropzone highlight `addSlip.dropHere`.

**States**
| State | Spec |
|---|---|
| Idle / empty | Upload block + GP + `empty.queue.*` hint in place of queue |
| Loading model | Queue header shows `queue.loadingModel` with indeterminate bar; first item status `queue.status.loadingModel` |
| Processing | Per item progress bar + % ; others Waiting with remove `X` |
| Partial done | Review button enabled with count (progressive review, OMX-005 AC7) |
| Item failed | Item shows reason (`queue.failedReason.*`) + `common.retry` + `queue.enterManually` (→ form prefilled with nothing, slip thumbnail not kept) |
| Skipped files | One toast/inline notice `addSlip.skippedSummary` composed from `skippedType/Size/Limit` (OMX-001 AC5) — `role="status"` |
| Cancelled | `queue.cancelled` notice; Done items kept, in-progress → Cancelled |
| GP: pre-consent | Inline panel under GP button: `googlePhotos.preConsent` (bold) + `preConsentDetail` + primary `googlePhotos.continue` (opens GIS in same gesture) |
| GP: waiting | Panel: spinner + `googlePhotos.waiting` + `waitingHint` + `reopen` (secondary) + `common.cancel` (ghost); persists when tab regains focus |
| GP: downloading | `googlePhotos.downloading` "ดาวน์โหลด 3/8" + bar; then items enter queue, toast `googlePhotos.imported_*` |
| GP: errors | Inline (no modal) `notConfigured` (button aria-disabled) / `denied` / `network` / `misconfigured` / `timeout` + `common.tryAgain` |
| Offline | Banner `error.offlineTitle/Body`; Upload still works if model cached; GP + first model load show offline message |
| Success | Navigating to Review; after Review save returns here with empty queue |

**Interactions:** selecting files auto-starts OCR (no Start button). Leaving during OCR → `queue.leave*` dialog; tab close → `beforeunload`. Queue max 20 (existing + new).
**A11y:** dropzone `role="button"` Enter/Space; progress bars `role="progressbar"` with name; status changes announced once via shell live region (`queue.srStatus`); Cancel reachable within 300ms (OMX-005 AC3).

---

## 6. Review `#/add/review` (OMX-012a, 012b, 006–011)

**Mobile 375**
1. Header: back `‹` (to `#/add`) + h1 `review.title` + count "3 รายการ".
2. Intro line `review.intro`; if still processing: `review.stillProcessing_*` with small spinner.
3. Card list (collapsed cards; first card needing attention auto-expanded):
   - Collapsed: checkbox · thumbnail 56×72 (→ image dialog) · signed amount + type word · date · category chip/name · badges (Medium/Low confidence, Duplicate/Possible duplicate, Incomplete) · chevron.
   - Expanded: **Type toggle on top** → Amount → Category → Date/time (with `review.noDate` hint if defaulted) → Payee → Note → `<details>` `review.ocrText` → actions row: `review.discard` (danger-ghost) · `review.viewExisting` (ghost, if dup).
4. Sticky footer: `common.selectAll`/`selectNone` (ghost) · primary `review.saveSelected` "(N)"; disabled reason line above (`review.needsFixing_*` / `review.noneSelected`).
**Desktop ≥ 1024:** each card = split: slip image 280 wide (sticky within card, zoom button) left, form right always expanded; list max-width 960; footer sticky at bottom of content column.

**States**
| State | Spec |
|---|---|
| Loading | Arriving while OCR finishes: cards appear as items complete (skeleton card for in-progress items, labelled `queue.status.recognizing`) |
| Empty — all failed | `empty.reviewAllFailed.*` (primary Enter manually, secondary Upload other images) (OMX-012a AC9) |
| Empty — nothing left | `empty.reviewNothing.*` (after all saved/discarded) |
| Needs review | Field border 2px warning + `TriangleAlert` + helper (`review.checkField`, `review.noAmount`, `review.noDate`, `review.amountUnusual`, `review.lowTypeConfidence`) |
| Invalid | Card left bar danger + `review.incomplete` badge; field errors `validation.*` |
| Duplicate | Unchecked, `surface-2` bg, badge `review.duplicate` / `review.possibleDuplicate` + `review.viewExisting` (preview dialog `review.existingTitle`); ticking = `review.saveAnyway` semantics |
| Error (save) | Storage failure → nothing saved, banner `error.storageFull`, cards remain (OMX-012a AC7) |
| Success | Toast `review.saved_*` + action `review.savedAction` → Transactions; saved cards leave list; if none left → `empty.reviewNothing` |

**Interactions:** Discard → `review.discard*` dialog. Image dialog: pinch/zoom, `review.zoomIn/zoomOut`, Esc/back closes, focus → thumbnail. Leaving with unsaved → `review.leave*` dialog; tab close → beforeunload.
**A11y:** each card = `<article aria-labelledby>` with `review.itemLabel`; checkbox name `review.selectItem`; expand button `aria-expanded`; badges are text; footer reason linked to Save via `aria-describedby`.

---

## 7. Settings `#/settings` (OMX-021, 022, 023, 024, 030)

**Mobile 375 — grouped list cards**
1. h1 `settings.title`.
2. **Language** card: TH | EN segmented (`settings.language`).
3. **Your data** card: `settings.transactionCount_*`, `settings.storageInfo` (info text), rows: `settings.export` (+hint) → Export dialog *(stretch 022/023)* · `settings.import` (+hint) → Import dialog *(stretch 022)*.
4. **Privacy** card (`id="privacy"`, target of trust link): `settings.privacyTitle` + 4 bullet points `privacyBody1–4` with `ShieldCheck`.
5. **About**: app name, `settings.version`.
6. **Danger zone** (bottom, separated): danger-ghost `settings.deleteAll` + `settings.deleteAllHint`.
**Desktop ≥ 1024:** two columns: left (Language, Your data, Danger zone), right (Privacy, About); max-width 960.

**Export dialog:** format radio cards (JSON / CSV with hints) · scope radio (`exportDialog.scopeMonth` / `scopeAll`, shown for CSV; JSON always all) · primary `exportDialog.download` → toast `exportDialog.done`; empty range CSV → `exportDialog.emptyRange`.
**Import dialog:** `importDialog.choose` → preview `importDialog.preview` → radio Merge (default) / Replace → `importDialog.importButton`; Replace → second confirm `importDialog.replaceConfirm*` (default focus Cancel) → toast `importDialog.imported_*`. Errors inline in dialog (`errorNotJson/Schema/Version/Size`) + `importDialog.nothingChanged`.

**States**
| State | Spec |
|---|---|
| Loading | Count shows skeleton chip; rest static |
| Empty | 0 transactions → export rows disabled with reason "ยังไม่มีข้อมูล" (`settings.transactionCount_other` with 0) |
| Error | Storage unavailable → banner `error.storageUnavailable`; corrupt → `error.corruptData` + `corruptDataAction` |
| Success | Language switch → polite `lang.changed`, `<html lang>` updates; delete all → `dialog.deleteAll*` (default focus Cancel) → toast `settings.deletedAll` → Dashboard first-use state |

**A11y:** language options carry own `lang`; danger zone has `<h2>`; dialogs per §6.18.

---

## 8. Story → screen mapping

| Story | Screens / components |
|---|---|
| OMX-001 | Add slip (upload, queue, skipped summary) |
| OMX-002 | Add slip (dropzone ≥ 768) |
| OMX-003a/b | Add slip (GP panel states), Add sheet |
| OMX-004 | Add sheet, Add slip (GP errors) |
| OMX-005 | Add slip (queue items, progress, cancel, leave guard) |
| OMX-006/007/008/010 | Review (badges, highlights, hints) |
| OMX-009 | Review (payee, bank text tag in collapsed card meta) |
| OMX-011 | Review (duplicate badges, preview dialog) |
| OMX-012a/b | Review (cards, footer, image dialog, OCR text, leave guard) |
| OMX-013/016 | Add/Edit form, Transactions (undo toast) |
| OMX-014/015 | Transactions |
| OMX-017 | Dashboard, Transactions (month selector) |
| OMX-018/019/020 | Dashboard |
| OMX-021 | Banners (all), Settings |
| OMX-022/023 | Settings (export/import dialogs) |
| OMX-024 | Header, side nav, Settings |
| OMX-025 | Shell, nav, Add sheet |
| OMX-026 | Empty/error states on every screen (catalogue = `empty.*`, `error.*`) |
| OMX-027 | All (a11y notes per screen + design-system §7) |
| OMX-030 | Add slip trust card, Settings privacy & danger zone |

## 9. Empty / error catalogue (D6) — quick index
| Situation | Icon | Keys | Action |
|---|---|---|---|
| First use | illustration (slip + sparkle) | `empty.firstUse.*` | Upload · Add manually |
| No data this month | `CalendarX2` | `empty.month.*` | Add transaction |
| No search/filter results | `SearchX` | `empty.noResults.*` | Clear filters |
| No expenses (chart) | — | `empty.chart.noExpense` | — |
| Queue empty | `ImageUp` | `empty.queue.*` | Upload |
| All OCR failed | `ScanText` | `empty.reviewAllFailed.*` | Enter manually · Upload other |
| Review finished | `CircleCheck` | `empty.reviewNothing.*` | Go to transactions |
| Screen crashed | `CircleAlert` | `error.boundary*` | Reload |
| Offline | `WifiOff` | `error.offline*`, `error.backOnline` | Retry (per feature) |
| Storage full / blocked | `TriangleAlert` | `error.storageFull*`, `error.storageUnavailable` | Export data |
| Corrupt data | `TriangleAlert` | `error.corruptData*` | Export raw data |
| GP not configured / denied / network / misconfigured / timeout | `Images` / `CircleAlert` | `googlePhotos.*` | Try again / use upload |
| OCR item failed | `CircleAlert` | `queue.failedReason.*` | Retry · Enter manually |
| Import invalid | `FileX2` | `importDialog.error*` | Choose another file |
