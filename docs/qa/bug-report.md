# Bug Report — Omnitrix Money MVP_0001 (Sprint 1)

> Owner: QA · อัปเดตล่าสุด 2026-11-13 (Sprint 1 Day 4) · Build: local `main` + `vite preview` (Chromium 1243)
> Severity ตาม grooming §2.3 — **Critical** data loss/leak/XSS · **High** flow หลักใช้ไม่ได้/ยอดรวมผิด · **Medium** extraction ผิดบางรูปแบบ, UI ผิดบางขนาดจอ, AC ไม่ครบแต่มี workaround · **Low** cosmetic
> Regression: ทุก bug มี automated test — ตัวที่ยัง Open รันเป็น `test.fail()` / `it.fails` (CI เขียว, จะแดงเมื่อแก้แล้ว → ลบ marker)

## Summary

| ID | Severity | Story | Title | Status | Owner |
|---|---|---|---|---|---|
| BUG-001 | Medium | OMX-008 | เดือนไทยที่ OCR อ่านเป็น "พุย." / "พ.ุย." ไม่ถูก parse → วันที่ตกเป็นวันนี้ | **Fixed** (QA, `849a999`) — Verified | QA |
| BUG-002 | High | OMX-013 | Double-click "บันทึก/Save" สร้างรายการซ้ำ 2 รายการ | **Fixed** (QA, see `fix(OMX-013)`) — Verified | QA |
| BUG-003 | Medium | OMX-025 | Horizontal scroll ที่ 320px บน Transactions และ Add/Edit form | **Open → Dev** | Dev |
| BUG-004 | Medium | OMX-023 | CSV คอลัมน์ `category` เป็น id (`food`) แทนชื่อตามภาษา UI | **Fixed** (QA, `f023918`) — Verified | QA |
| BUG-005 | Medium | OMX-027 | ปุ่ม TH/EN กว้าง 40px (< 44px touch target) | **Fixed** (QA, `202e6ab`) — Verified | QA |
| BUG-006 | Medium | OMX-010 | OCR noise หน้าคำนำหน้าชื่อ ("แนายข", "นแนายข") → โอนให้บุคคลกลายเป็น "อื่น ๆ" | **Open → Dev** | Dev |
| BUG-007 | Low | OMX-007 | ยอดเงินเลขไทย (๓๕๒.๕๐) ถูก Tesseract อ่านเพี้ยน → amount ว่าง | **Open → Dev (backlog)** | Dev |
| BUG-008 | Low | OMX-015 / 025 | Placeholder ช่องค้นหา EN ถูกตัดที่ 375px ("…or amour") | **Open → Designer/Dev** | Designer |

**Totals:** 8 bugs · Critical 0 · High 1 (fixed) · Medium 5 (3 fixed, 2 open) · Low 2 (open) · **Open: 4 (0 Critical/High)**

---

## BUG-001 — OCR month "พุย." not recognised → date falls back to today
- **Severity:** Medium · **Story:** OMX-008 AC1/AC8 · **Found by:** Layer B benchmark (run 1: date 60%) · **Status:** Fixed & verified
- **Steps:** 1) Import `tests/fixtures/slips/images/b01-transfer-th-person.png` (slip shows `12 พ.ย. 69 09:12 น.`) with real OCR 2) Open Review
- **Expected:** Date = 2026-11-12
- **Actual (before fix):** Tesseract `tha` returns `12 พุย. 69` (dot read as below-vowel ุ U+0E38) → no date match → today + "No date found" hint. Affected 6/15 Layer B images
- **Fix:** `src/domain/slip/slipDate.ts` — abbreviation separator accepts `[.ุ]{0,2}` · Regression: Layer A `qa-ocr-month-*`, `rec-b01/b02/b05/b07/b08/b12` · Layer B date accuracy 60% → **100%**

## BUG-002 — Double-click Save creates two transactions
- **Severity:** High (ยอดรวมผิด) · **Story:** OMX-013 AC2 · **Status:** Fixed & verified
- **Steps:** 1) `#/transactions/new` 2) Amount 55, Category Food 3) Double-click "Save"
- **Expected:** 1 transaction · **Actual (before fix):** 2 identical transactions (guard `if (saving)` reads stale React state in same tick)
- **Fix:** `TransactionFormPage.tsx` — synchronous `useRef` guard · Regression: `tests/e2e/qa.spec.ts` TC-088

## BUG-003 — Horizontal scroll at 320px (Transactions, Add/Edit form)
- **Severity:** Medium (320px = AC1 ขอบล่าง; 360px+ ผ่าน) · **Story:** OMX-025 AC1 (WCAG 1.4.10) · **Status:** Open → **Dev**
- **Steps:** 1) Viewport 320×640, seed sample data 2) Open `#/transactions` 3) Open `#/transactions/new`
- **Expected:** `scrollWidth ≤ clientWidth` (320)
- **Actual:** `#/transactions` scrollWidth = 343 — filter button (`_btn_ _secondary_`) right edge = 343px, search row ไม่ shrink · `#/transactions/new` scrollWidth = 363 — type segmented control / date row กว้างเกิน (ทั้ง TH และ EN)
- **Suggestion:** search input `min-width: 0; flex: 1`, filter button fixed 44px; segmented control `min-width: 0` + label wrap
- **Regression:** `tests/e2e/qa.spec.ts` TC-120 (`test.fail`, 2 routes × 2 projects)

## BUG-004 — CSV category column is the id instead of the localized name
- **Severity:** Medium · **Story:** OMX-023 AC1 · **Status:** Fixed & verified
- **Steps:** Settings → Export → CSV (UI = ไทย) → open file
- **Expected:** `category` = `อาหารและเครื่องดื่ม` · **Actual (before fix):** `food`
- **Fix:** `toCsv(txs, categoryName)` + Settings passes `t('categories.<id>')` · Regression: TC-114

## BUG-005 — Language switch options narrower than 44px
- **Severity:** Medium (a11y AC) · **Story:** OMX-027 AC8 · **Status:** Fixed & verified
- **Actual (before fix):** TH/EN buttons 40×36 (hit area 40×44 via `::after`) · **Fix:** `min-width: 44px` → hit area 44×44 · Regression: TC-132

## BUG-006 — OCR noise before the person prefix → "Transfer to person" becomes "Other"
- **Severity:** Medium (ผู้ใช้แก้หมวดเองได้บน Review) · **Story:** OMX-010 AC5 · **Status:** Open → **Dev**
- **Steps:** Import `b08-received-looks-like-sender.png` or `b12-transfer-th-xss-memo.png` with real OCR → Review
- **Expected:** category = `transfer` (recipient "นาย ทดสอบ ระบบ")
- **Actual:** Tesseract reads the recipient line as `แนายข ทดสอบ ระบบ` / `นแนายข ทดสอบ ระบบ` → `PERSON_PREFIX` (anchored `^`) ไม่ match → category `other`. 2/27 Layer B images (category accuracy 92.6%)
- **Suggestion (Dev):** ใน `parties.ts` ยอม junk ≤ 2 ตัวอักษรไทยก่อนคำนำหน้า (`^[฀-๿]{0,2}(?:นาย|…)`) หรือ cleanup ตัวอักษรเดี่ยวหน้า/หลังคำนำหน้า; ระวัง false positive กับชื่อร้าน — เพิ่ม fixture ทั้งสองทาง
- **Regression:** Layer A `qa-ocr-prefix-noise-nai`, `rec-b08…`, `rec-b12…` (`it.fails`)

## BUG-007 — Thai-digit amount misread by OCR → amount empty
- **Severity:** Low (สลิปธนาคารจริงแทบไม่ใช้เลขไทย; Review แสดง "ไม่พบยอดเงิน" ให้กรอกเอง) · **Story:** OMX-007 AC5 · **Status:** Open → Dev (backlog)
- **Steps:** Import `b16-bill-water-thai-digits.png` (`๓๕๒.๕๐ บาท`) with real OCR
- **Expected:** 352.50 · **Actual:** OCR text `๓๕๒.๕6๐ บาท` (Thai/Arabic mix + extra digit) → amount = null, flagged. Parser itself handles clean Thai digits (Layer A `qa-thai-digits-amount` passes)
- **Suggestion:** ไม่ต้องแก้ใน MVP; ถ้าจะแก้ — normalize mixed digits และ prefer 2-decimal candidate; บันทึกเป็น known limitation

## BUG-008 — EN search placeholder truncated at 375px
- **Severity:** Low (cosmetic) · **Story:** OMX-015 / OMX-025 · **Status:** Open → Designer (copy) / Dev
- **Steps:** EN, 375px, `#/transactions` · **Expected:** placeholder อ่านได้ครบ · **Actual:** "Search payee, note or amour" (ตัด) · **Suggestion:** copy สั้นลง เช่น "Search payee, note, amount" หรือ "Search"
- Evidence: `test-results/qa-explore/en-*-375-_transactions.png` (generated by `tests/e2e/qa-explore.spec.ts`)

---

## Observations (ไม่ใช่ bug — ส่ง PO/Designer พิจารณา)
- **O1** — `<input type="date">` แสดงตาม locale ของ browser (en-US = `11/13/2026` mm/dd) แต่มี chip "13 Nov 2026" ข้าง ๆ ช่วยลดความสับสน dd/mm vs mm/dd → OK สำหรับ MVP
- **O2** — Salary slip ที่ไม่มี pay date และงวดคือเดือนปัจจุบัน → วันสิ้นงวด (30 พ.ย.) อยู่ในอนาคต → fallback เป็นวันนี้ตาม AC6 (b14) — ถูกตาม AC แต่ PO อาจอยากให้ใช้วันสิ้นงวดสำหรับ salary
- **O3** — K6 (received slip ที่หน้าตาเหมือนสลิปผู้โอน ยังเป็น Expense) ยืนยันจาก b08 — ตาม AC8 limitation → OMX-039
- **O4** — ชื่อธนาคาร/แอปจริงปรากฏเฉพาะเป็น *ข้อความ* ใน Dev fixtures/fake OCR (จำเป็นสำหรับ bank detection OMX-009) — ไม่มีโลโก้/branding; QA Layer B ใช้ธนาคารสมมติทั้งหมด → OK
