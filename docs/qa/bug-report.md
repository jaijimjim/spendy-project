# Bug Report — Omnitrix Money MVP_0001 (Sprint 1)

> Owner: QA · อัปเดตล่าสุด 2026-11-23 (**Sprint 2 Day 1** — เพิ่ม BUG-011 … BUG-015 และขยาย scope BUG-009/010 จาก OMX-042 สลิปจริง n = 16; B3 ปิดแล้ว) · Build: `main` @ `6ebe779` (deploy run `45208481550`) · Layer C = redacted OCR text ใน `tests/fixtures/real-slips/redacted/` (ไม่มีรูป/ชื่อจริงใน repo)
> *(ก่อนหน้า: 2026-11-23 Sprint 2 Day 0 — BUG-009/010 จาก FB-011, impediment B3, O6 · Build เดิม local `main` + `vite preview` (Chromium 1243) · CI run `43827185503`)*
> Severity ตาม grooming §2.3 — **Critical** data loss/leak/XSS · **High** flow หลักใช้ไม่ได้/ยอดรวมผิด · **Medium** extraction ผิดบางรูปแบบ, UI ผิดบางขนาดจอ, AC ไม่ครบแต่มี workaround · **Low** cosmetic
> Regression: ทุก bug มี automated test — ตัวที่ยัง Open รันเป็น `test.fail()` / `it.fails` (CI เขียว, จะแดงเมื่อแก้แล้ว → ลบ marker)

## Summary

| ID | Severity | Story | Title | Status | Owner |
|---|---|---|---|---|---|
| BUG-001 | Medium | OMX-008 | เดือนไทยที่ OCR อ่านเป็น "พุย." / "พ.ุย." ไม่ถูก parse → วันที่ตกเป็นวันนี้ | **Fixed** (QA, `849a999`) — Verified · Dev review OK | QA |
| BUG-002 | High | OMX-013 | Double-click "บันทึก/Save" สร้างรายการซ้ำ 2 รายการ | **Fixed** (QA, `4391555`) — Verified · Dev review OK | QA |
| BUG-003 | Medium | OMX-025 | Horizontal scroll ที่ 320px บน Transactions และ Add/Edit form | **Closed** (Dev `a1249eb`) — QA re-test Pass 2026-11-13 | Dev |
| BUG-004 | Medium | OMX-023 | CSV คอลัมน์ `category` เป็น id (`food`) แทนชื่อตามภาษา UI | **Fixed** (QA, `f023918`) — Verified · Dev review OK | QA |
| BUG-005 | Medium | OMX-027 | ปุ่ม TH/EN กว้าง 40px (< 44px touch target) | **Fixed** (QA, `202e6ab`) — Verified · Dev review OK | QA |
| BUG-006 | Medium | OMX-010 | OCR noise หน้าคำนำหน้าชื่อ ("แนายข", "นแนายข") → โอนให้บุคคลกลายเป็น "อื่น ๆ" | **Closed** (Dev `3ece298`) — QA re-test Pass 2026-11-13 | Dev |
| BUG-007 | Low | OMX-007 | ยอดเงินเลขไทย (๓๕๒.๕๐) ถูก Tesseract อ่านเพี้ยน → amount ว่าง | **Open → Dev (backlog)** | Dev |
| BUG-008 | Low | OMX-015 / 025 | Placeholder ช่องค้นหา EN ถูกตัดที่ 375px ("…or amour") | **Closed** (Dev `1852bed`) — QA re-test Pass 2026-11-13 | Dev |
| BUG-009 | High | OMX-009 / 010 → **OMX-049** | สลิป KBank / K PLUS: ชื่อผู้รับอยู่ใต้ลูกศร "↓" ไม่มีป้าย "ไปยัง/ถึง" → payee ว่าง (0/3) | **Open → Sprint 2 grooming** (ผู้ใช้เลือกไม่ทำ hotfix) | Dev |
| BUG-010 | High | OMX-010 → **OMX-050a/b** | Category ผิดบนสลิปจริง: "จ่ายบิล" ชนะชื่อร้าน/biller อาหาร (→ Bills) และ "บลูเพย-ลาชาดาเพย" → Other (1/3 ถูก) · *scope update Day 1:* n = 16 → หมวดถูก **0/9** ใบที่หมวดชัดเจน | **Open → Sprint 2 (OMX-050a/b)** | Dev |
| BUG-011 | High | OMX-007 | ยอดเงิน **ผิดแบบไม่ว่าง** (1.00 แทน 1,200.00 / 200.00) เมื่อบรรทัดถัดจาก "จำนวน" เป็นขยะที่มีตัวเลข หรือ "บาท" ถูก OCR เป็น "vn"/แยกบรรทัด (make 2/9) | **Open → PO** (ticket ใหม่หรือรวม) | Dev |
| BUG-012 | Low | OMX-007 | ยอดเงินถูก OCR แตกเป็นหลายบรรทัด ("21" / "3 .00 บาท") → amount ว่าง (1/16) | **Open → PO** | Dev |
| BUG-013 | Medium | OMX-008 | เดือน "พ.ย." ถูก OCR เป็น "w.g." (ละติน) → วันที่ตกเป็นวันนี้ (make 3/9) | **Open → PO** | Dev |
| BUG-014 | Medium | OMX-010 | Category keyword/rule gaps นอก scope 050a/b: Rabbit top-up → Other, โอนให้บุคคล/บัญชีตัวเองไม่ได้ `transfer` เพราะไม่มี payee, memo "ค่า…" ไม่ถูกใช้ | **Open → PO** (บางส่วนพึ่ง BUG-009/015) | Dev |
| BUG-015 | Low | OMX-006 / 009 | Secondary fields บนสลิปจริง: memo ของ make ไม่ถูกอ่าน (ไม่มี label) และ disclaimer "หมายเหตุ:" ถูกอ่านเป็น memo · bank = null บน make 6/9 + Krungthai · type confidence Low 5/16 | **Open → PO** | Dev |

**Totals (2026-11-23, Sprint 2 Day 1):** 15 bugs · Critical 0 · **High 4** · Medium 7 · Low 4 · **Closed 7** · **Open 8: BUG-009, 010, 011 (High) · BUG-013, 014 (Medium) · BUG-007, 012, 015 (Low)** · ⚠️ **3 High open** — ทั้งหมดพบจากสลิปจริง (OMX-042 Layer C, n = 16) ไม่ใช่ regression ของ build: Layer A/B synthetic ยัง 100% · BUG-011 … 015 **ยังไม่มี OMX ticket** — PO ตัดสินว่าจะเพิ่ม OMX ใหม่หรือรวมเข้า 049/050a/050b (ข้อเสนอ QA ดู [`test-summary-report.md` §9.6](test-summary-report.md#96-ข้อเสนอต่อ-po--ticket-และคำถามถึงผู้ใช้))
>
> *Totals เดิม (Day 0):* 10 bugs · Critical 0 · High 3 · Medium 5 · Low 2 · **Closed 7** (QA-fixed: 001, 002, 004, 005 · Dev-fixed: 003, 006, 008 — all re-tested) · **Open 3: BUG-009 (High), BUG-010 (High) → Sprint 2 (OMX-049/050) · BUG-007 (Low, backlog / known limitation)** · ⚠️ **2 High open** (พบจากสลิปจริง ไม่ใช่ regression ของ build — synthetic Layer A/B ยังผ่าน 100%)

> **Impediment (ไม่ใช่ product bug):** **B3** — *ปิดแล้ว 2026-11-23 (repo public, Pages Source = GitHub Actions, run `45208481550` เขียว, live URL `https://jaijimjim.github.io/spendy-project/` HTTP 200)* · บันทึกเดิม: GitHub Pages ยังไม่เปิด (repo private, Pages Source ต้องเป็น GitHub Actions) → `deploy.yml` job "Build for Pages" ล้มที่ `actions/configure-pages@v5` ("Get Pages site failed … Not Found"), Deploy skip, `https://jaijimjim.github.io/omnitrix-project/` ตอบ 404. โค้ดและ CI ไม่มีปัญหา (job ของ `ci.yml` ✓ ทั้งหมด) — repo owner ต้องเปิด Pages เอง (หมายเหตุ: Pages บน repo private ต้องใช้ plan ที่รองรับ ไม่เช่นนั้นต้องเปลี่ยน repo เป็น public) · ติดตามใน FB-012 / OMX-028 / OMX-048 · กระทบ TC-137, 139, 135, 008

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
- **Severity:** Medium (320px = AC1 ขอบล่าง; 360px+ ผ่าน) · **Story:** OMX-025 AC1 (WCAG 1.4.10) · **Status:** Closed (re-test Pass)
- **Steps:** 1) Viewport 320×640, seed sample data 2) Open `#/transactions` 3) Open `#/transactions/new`
- **Expected:** `scrollWidth ≤ clientWidth` (320)
- **Actual:** `#/transactions` scrollWidth = 343 — filter button (`_btn_ _secondary_`) right edge = 343px, search row ไม่ shrink · `#/transactions/new` scrollWidth = 363 — type segmented control / date row กว้างเกิน (ทั้ง TH และ EN)
- **Suggestion:** search input `min-width: 0; flex: 1`, filter button fixed 44px; segmented control `min-width: 0` + label wrap
- **Regression:** `tests/e2e/qa.spec.ts` TC-120 (2 routes × 2 projects)
- **Fix (Dev, Day 4):** grid/flex children get `min-width: 0` (`.field`, `.control`, `.segment`, form/two-column grid items) so inputs can shrink below their intrinsic width; search box `min-width: 0` and a compact fixed filter button. `scrollWidth = 320` on Dashboard, Transactions, Add/Edit form, Add slip and Settings in TH and EN. TC-120 `test.fail` markers removed → normal passing tests

## BUG-004 — CSV category column is the id instead of the localized name
- **Severity:** Medium · **Story:** OMX-023 AC1 · **Status:** Fixed & verified
- **Steps:** Settings → Export → CSV (UI = ไทย) → open file
- **Expected:** `category` = `อาหารและเครื่องดื่ม` · **Actual (before fix):** `food`
- **Fix:** `toCsv(txs, categoryName)` + Settings passes `t('categories.<id>')` · Regression: TC-114

## BUG-005 — Language switch options narrower than 44px
- **Severity:** Medium (a11y AC) · **Story:** OMX-027 AC8 · **Status:** Fixed & verified
- **Actual (before fix):** TH/EN buttons 40×36 (hit area 40×44 via `::after`) · **Fix:** `min-width: 44px` → hit area 44×44 · Regression: TC-132

## BUG-006 — OCR noise before the person prefix → "Transfer to person" becomes "Other"
- **Severity:** Medium (ผู้ใช้แก้หมวดเองได้บน Review) · **Story:** OMX-010 AC5 · **Status:** Closed (re-test Pass)
- **Steps:** Import `b08-received-looks-like-sender.png` or `b12-transfer-th-xss-memo.png` with real OCR → Review
- **Expected:** category = `transfer` (recipient "นาย ทดสอบ ระบบ")
- **Actual:** Tesseract reads the recipient line as `แนายข ทดสอบ ระบบ` / `นแนายข ทดสอบ ระบบ` → `PERSON_PREFIX` (anchored `^`) ไม่ match → category `other`. 2/27 Layer B images (category accuracy 92.6%)
- **Suggestion (Dev):** ใน `parties.ts` ยอม junk ≤ 2 ตัวอักษรไทยก่อนคำนำหน้า (`^[฀-๿]{0,2}(?:นาย|…)`) หรือ cleanup ตัวอักษรเดี่ยวหน้า/หลังคำนำหน้า; ระวัง false positive กับชื่อร้าน — เพิ่ม fixture ทั้งสองทาง
- **Regression:** Layer A `qa-ocr-prefix-noise-nai`, `rec-b08…`, `rec-b12…` (now normal passing cases, `knownBug: []`)
- **Fix (Dev, Day 4):** `looksLikePerson()` in `parties.ts` also accepts a noisy prefix: 1–2 stray Thai glyphs before นาย/นาง/นางสาว/น.ส., and the OCR variant "นาข/นาซ" (ย misread) only after such junk and not before a vowel/tone mark. The strict `PERSON_PREFIX` (used by `normalizePayee`) is unchanged. New golden fixtures both ways: `dev-bug006-junk-before-nangsao` (→ transfer), `dev-bug006-no-false-positive-shop-name` ("นาขวัญ ฟาร์มสุข" → other), `dev-bug006-no-false-positive-nai-inside-word` ("สวนนายเฒ่า" → other), plus unit tests in `typeAndCategory.test.ts`

## BUG-007 — Thai-digit amount misread by OCR → amount empty
- **Severity:** Low (สลิปธนาคารจริงแทบไม่ใช้เลขไทย; Review แสดง "ไม่พบยอดเงิน" ให้กรอกเอง) · **Story:** OMX-007 AC5 · **Status:** Open → Dev (backlog)
- **Steps:** Import `b16-bill-water-thai-digits.png` (`๓๕๒.๕๐ บาท`) with real OCR
- **Expected:** 352.50 · **Actual:** OCR text `๓๕๒.๕6๐ บาท` (Thai/Arabic mix + extra digit) → amount = null, flagged. Parser itself handles clean Thai digits (Layer A `qa-thai-digits-amount` passes)
- **Suggestion:** ไม่ต้องแก้ใน MVP; ถ้าจะแก้ — normalize mixed digits และ prefer 2-decimal candidate; บันทึกเป็น known limitation

## BUG-008 — EN search placeholder truncated at 375px
- **Severity:** Low (cosmetic) · **Story:** OMX-015 / OMX-025 · **Status:** Closed (re-test Pass)
- **Steps:** EN, 375px, `#/transactions` · **Expected:** placeholder อ่านได้ครบ · **Actual:** "Search payee, note or amour" (ตัด) · **Suggestion:** copy สั้นลง เช่น "Search payee, note, amount" หรือ "Search"
- Evidence: `test-results/qa-explore/en-*-375-_transactions.png` (generated by `tests/e2e/qa-explore.spec.ts`)
- **Fix (Dev, Day 4):** EN copy shortened in `design/copy-deck.json` → `transactions.searchPlaceholder` = "Search name, note, amount" (Designer approved); TH unchanged

## BUG-009 — KBank / K PLUS: recipient under the "↓" arrow is not extracted
- **Severity:** High (ผู้ใช้ต้องพิมพ์ชื่อผู้รับเองทุกใบบนสลิปของธนาคารเป้าหมายหลัก; กระทบ category "โอนให้บุคคล" ด้วย) · **Story:** OMX-009 (payee), OMX-010 AC5 · Backlog: **OMX-049** · **Found by:** ผู้ใช้ทดสอบสลิปจริงของตัวเอง 3 ใบ (FB-011, 2026-11-14) — TC-163 · **Status:** Open → Sprint 2
- **Steps:** 1) Import สลิปโอนเงิน "make by KBank" หรือ K PLUS (real OCR, บนเครื่องผู้ใช้) 2) เปิด Review
- **Expected:** Payee = ชื่อผู้รับ (บรรทัดใต้ลูกศร "↓" / บรรทัดหลังเลขบัญชีผู้โอนแบบ masked `XXX-X-X####-X`)
- **Actual:** payee ว่าง **0/3** — layout ของ KBank ไม่มีป้าย "ไปยัง/ถึง/To" ที่ parser ใช้ anchor; ชื่อผู้รับอยู่ใต้ลูกศร "↓" ต่อจากบล็อกผู้โอน
- **Suggestion (Dev):** ใน `parties.ts` เพิ่ม layout rule: เมื่อไม่มี label ให้หา masked account pattern ตัวแรก (`[X\d]{3}-[X\d]-[X\d]{5}-[X\d]` แบบทน OCR noise) แล้วเอาบรรทัดชื่อถัดไปเป็นผู้รับ; ลูกศร "↓" อาจหายหรือถูก OCR อ่านเป็นตัวอื่น จึงห้ามพึ่งลูกศรอย่างเดียว · ระวังไม่หยิบชื่อผู้โอน/ชื่อธนาคาร
- **Test data:** ใช้ได้เฉพาะ OCR text ที่ **ปิดชื่อและเลขบัญชีแล้ว** เป็น fixture — **ห้าม commit รูปสลิปจริง** (ดู [`grooming/sprint-2-qa.md`](../agile/grooming/sprint-2-qa.md))
- **Regression (plan):** Layer A fixtures `real-kbank-arrow-*` + negative (ไม่หยิบชื่อผู้โอน) · Layer B template ใหม่แบบ "↓ layout" (ธนาคารสมมติ)

- **Scope update (2026-11-23, Sprint 2 Day 1 — OMX-042, n = 16):** payee **0/16** บน **ทุกแอปที่มี** — make by KBank 0/9 · K PLUS 0/6 · Krungthai 0/1 — และไม่ใช่แค่โอนให้บุคคล: ใบ "ชำระเงิน / จ่ายบิล / เติมเงิน" ที่ผู้รับเป็นร้าน/biller/บริษัท ก็ว่างเหมือนกัน (13/16 เป็นร้าน/หน่วยงาน). Layout เดียวกันทุกแอป = ชื่อผู้รับคือ *บรรทัดชื่อแรกหลังบรรทัดเลขบัญชี masked ของผู้โอน* → rule ของ OMX-049 ครอบคลุมได้ถ้า (1) ใช้กับ make/Krungthai ด้วย (2) ทน mask ที่ OCR เพี้ยน `2๐๐-%-%4417-%`, `2๐๐๐%-%4417-%`, `XXX=-X-XXXXXX8804-x`, `9๐๐๐%-๐๐๐๐๐%9183-%` (3) ข้ามบรรทัดชื่อธนาคาร "ธ.กสิกรไทย" / "กรงไทย" และ junk ลูกศร (`J`, `ง`, `ง/`, `WV`, `๐9`, `(ๆ`, `oy`, `dD`, `1โโธ(`) (4) ชื่อร้านสองบรรทัด (r05/r16 "บริษัท บางกอก สมาร์ทการ์ด" + "ซิสเทม จำกัด", r11 "KSHER_SIAM PARAGON" + "ONLINE", r15 "… สาขา" + "ประชาอุทิศ") · Severity คง **High** · ตัวเลขวัดซ้ำได้ด้วย `src/domain/slip/realSlips.test.ts` (ratchet `BASELINE.payee = 0`)
- **Evidence (redacted, r01 make — โอน PromptPay ให้บุคคล):**
  ```
  O) ปรึยานุชส
  XXX-X-X4417-X
  นายชัยพร ดําเนิน                     ๑๑
  X=XXXX-XXXX0-61-8                        wn
  ```
  **(redacted, r13 Krungthai — ลูกศรจุดถูก OCR เป็น "WV"):** `น.ส.ปรียานุช ส* **` → `“2” กรงไทย` → `XXX-X-XX382-6` → `WV` → `(G)    เติมเงิน G-Wallet` → `(G-WALLET)`

## BUG-010 — Category wrong on real slips (transaction-type phrase beats merchant; Lazada not matched)
- **Severity:** High (real-world category 1/3 = 33% < MVP metric 60%; ยอดรวมรายหมวดบน Dashboard ผิด) · **Story:** OMX-010 · Backlog: **OMX-050** · **Found by:** FB-011 — TC-163 · **Status:** Open → Sprint 2
- **Case A — Steps:** Import สลิป "จ่ายบิลสำเร็จ" ที่ชื่อร้านมีคำว่า "ไก่ย่าง" และ biller ลงท้าย "…FOOD" → **Expected:** Food & Drink · **Actual:** Bills — keyword ประเภทธุรกรรม "จ่ายบิล" ได้น้ำหนักมากกว่าชื่อร้าน/biller
- **Case B — Steps:** Import สลิป "ชำระเงินสำเร็จ" ของ "บลูเพย์-ลาซาด้าเพย์" ซึ่ง OCR อ่านเป็น "บลูเพย-ลาชาดาเพย" → **Expected:** Shopping · **Actual:** Other — ไม่มี keyword Lazada และไม่ทน OCR variant (ซ↔ช, ไม้หันอากาศ/การันต์หาย)
- **OCR noise ที่พบร่วม:** "พ.ย." → "พ.ุย." (BUG-001 รองรับแล้ว), "ชำระเงิน" → "ชําระเจิน", ตัวอักษรขยะจากรูปการ์ตูน/QR code
- **Suggestion (Dev):** ลำดับ precedence: merchant/biller keyword > transaction-type phrase ("จ่ายบิล/ชำระเงิน" ใช้เป็น fallback → Bills เฉพาะเมื่อไม่มี merchant match) · เพิ่ม fuzzy keyword: Lazada/ลาซาด้า/ลาชาดา/LazPay, Shopee/ช้อปปี้/ShopeePay · ระวัง false positive: บิลค่าน้ำ/ไฟ/โทรศัพท์ที่ biller มีคำว่า FOOD ไม่ควรเกิด, "ไก่" ในชื่อบริษัทที่ไม่ใช่ร้านอาหาร
- **Regression (plan):** Layer A fixtures (redacted) Case A/B + guard ไม่ให้ b05/b06/b16 (Bills) เปลี่ยนเป็นหมวดอื่น · Layer B ต้องยังได้ category 100% (27/27)

- **Scope update (2026-11-23, Sprint 2 Day 1 — OMX-042, n = 16):** category ตรงกับหมวดที่เสนอ **2/16 (12.5%)** · เฉพาะใบที่หมวดชัดเจน **0/9 (0%)** ≪ MVP 60% · ใบที่รอผู้ใช้ยืนยัน 2/7. ส่วนที่เป็น BUG-010 โดยตรง (precedence "จ่ายบิล" → `bills`, keyword `จ่ายบิล` confidence Medium): **r03** ถุงเงิน (ก๋วยเตี๋ยวเรือ…) → `bills` (ควร `food`) · **r10** ถุงเงิน เติมบุญ (วัด…) บริจาค → `bills` (ควร `other`) · **r06** TrueMoney Shop (นัวสะเด็ด) → `bills` (เสนอ `food`, รอยืนยัน) · **r09** SCB มณี SHOP (…) → `bills` (เสนอ `other`, รอยืนยัน) = K PLUS "จ่ายบิล" **4/4 ใบเป็น `bills` ทั้งหมด**. คำอาหารไทยที่ขาด (อยู่ใน scope OMX-050a): "ก๋วยเตี๋ยว/ก๋วยเตียว" (r03, OCR หาย ๋ บน เตี๋ยว), "ลูกชิ้นปลา" (r15 OCR "ลูกช์แปลา" → ต้อง fuzzy), "นัว/ร้าน…" (r06) · ส่วนที่ **ไม่ใช่** precedence/fuzzy → แยกเป็น BUG-014
- **Evidence (redacted, r03 K PLUS):**
  ```
  @๑  จ่ายบิลสําเร็จ                     1<
  ...
  ๐9 ถุงเงิน (ก๋วยเตียวเรือธิดาสมุทร) |
  1441495817509208685            ว     น
  MISSPRANEEWANSUKDEE    ด  ล ใน
  ```
  → `category = bills`, `categoryResult = { field: 'text', keyword: 'จ่ายบิล', confidence: 'medium' }`

## BUG-011 — Wrong (non-empty) amount when junk follows the amount label or "บาท" is misread / on its own line
- **Severity:** **High** — ยอดเงินผิดแต่ field **ไม่ว่าง** ผู้ใช้อาจไม่สังเกตแล้วกด Save → ยอดรวม Dashboard ผิด (แย่กว่า null ที่บังคับให้กรอก; grooming §2.3 "ยอดรวมผิด" = High) · r04 ได้ `source: 'label'` → **ไม่มี highlight `amountFallback`** (มีแค่ badge Low จาก type) · **Story:** OMX-007 AC1/AC3 · **Found by:** OMX-042 Layer C (n = 16) — TC-163 · **Status:** Open → PO (ticket)
- **Steps:** `parseSlip(text, '2026-11-23')` กับ `tests/fixtures/real-slips/redacted/r04.txt` และ `r05.txt` (หรือ `npx vitest run src/domain/slip/realSlips.test.ts`)
- **Expected:** r04 = 1,200.00 (`120000`) · r05 = 200.00 (`20000`)
- **Actual:** r04 = **1.00** (`100`) · r05 = **1.00** (`100`) — 2/9 ใบของ make (12.5% ของทั้งหมด)
- **Root cause (QA analysis):**
  - **r04:** label `จำนวน` อยู่บรรทัดเดียว → `valueNear()` ใช้บรรทัดถัดไป = ขยะจากรูปการ์ตูน `[ต1ขะ5ต]` → token แรก `1` (ข้างหน้าเป็นอักษรไทยจึงไม่ถูกตัด) = 1.00 · ยอดจริงอยู่บรรทัดถัดไปอีก `1,200.00 vn` โดย "บาท" ถูก OCR เป็น `vn`
  - **r05:** บรรทัดถัดจาก label ไม่มีตัวเลข → ไป fallback; ยอดจริง `200.00` อยู่บรรทัดหนึ่ง และ `บาท` ตกไปบรรทัดถัดไปพร้อม junk `๑` (→ `1` หลัง normalize เลขไทย) → fallback ชอบ token ที่ตามด้วย "บาท" (`1 บาท`) มากกว่า token 2 ตำแหน่งทศนิยม (`200.00`) · r11/r15 มี pattern `๑ บาท` เหมือนกันแต่รอดเพราะยอดอยู่บรรทัดถัดจาก label พอดี
- **Evidence (redacted):**
  ```
  r04:                          r05:
  จํานวน                         จํานวน
  [ต1ขะ5ต]                       [w]e [ต]
  1,200.00 vn                    200.00                                 = i
  STE                            ๑        บาท
  ```
- **Suggestion (Dev):** (1) ใน `valueNear()` ให้ค้นหาได้ ≤ 2–3 บรรทัดหลัง label และ **ข้ามบรรทัดที่ไม่มี token แบบเงิน** (ไม่มีทศนิยม 2 ตำแหน่ง/ไม่มี currency) แทนที่จะรับ token แรก · (2) ให้ token ที่มีทศนิยม 2 ตำแหน่ง ชนะเลขจำนวนเต็มหลักเดียวที่ติดขยะ · (3) ยอมรับ OCR variant ของ "บาท": `vn`, `um`, `vm`, `unm` เป็น currency · (4) junk เลขหลักเดียวก่อน "บาท" ที่อยู่ต้นบรรทัด (`๑ บาท`) ไม่ควรเป็น candidate ถ้าบรรทัดก่อนหน้ามี token 2 ตำแหน่ง · ถ้ามีหลาย candidate ขัดกัน → ตั้ง `amountFallback` ให้ Review highlight (ไม่เดาเงียบ)
- **Regression:** `realSlips.test.ts` (ratchet `BASELINE.amount = 13`, `amountWrong = 2` → Dev ยกเป็น 15 / 0) · ควรเพิ่ม Layer A fixture `real-redacted-r04/r05` ใน `qaGolden.ts` เมื่อแก้ · guard: Layer A `qa-balance-and-fee-excluded`, Layer B 27/27

## BUG-012 — Amount split across lines by OCR → amount empty
- **Severity:** Low (field ว่าง + "ไม่พบยอดเงินในสลิป" บังคับกรอกเอง เหมือน BUG-007) · **Story:** OMX-007 · **Found by:** OMX-042 (r14, make) · **Status:** Open → PO
- **Expected:** 321.00 · **Actual:** `amountSatang = null` (`noAmount`) — OCR อ่านตัวเลขใหญ่ "321.00" เป็น 2 บรรทัด `21` / `3     .00 บาท` (เลข 3 หลุดไปบรรทัดล่าง, ช่องว่างก่อนจุด)
- **Evidence (redacted):**
  ```
  จํานวน                                                    .
  [=]? rid [=]
  21                                               Hd,
  3     .00 บาท                         oh Pity
  ```
- **Suggestion:** ไม่ต้องเดา (การต่อ "21"+"3" เสี่ยงยอดผิด → ขัด BUG-011) · ทางเลือกที่ปลอดภัยกว่า: OCR ซ้ำเฉพาะ crop บริเวณ label "จำนวน" ด้วย PSM 7 (single line) หรือขยายภาพ ×2 — เป็นงาน Dev spike · ระหว่างนี้ = known limitation

## BUG-013 — OCR month "พ.ย." read as Latin "w.g." → date falls back to today
- **Severity:** Medium (มี hint "ไม่พบวันที่" + highlight ให้แก้ได้; แต่ถ้าสลิปข้ามเดือน รายการจะเข้าเดือนผิดถ้าผู้ใช้ไม่แก้ — แบบเดียวกับ BUG-001) · **Story:** OMX-008 AC1/AC8 · **Found by:** OMX-042 — **3/16** (r08, r14, r15 — make ทั้งหมด = 3/9 ของ make) · **Status:** Open → PO
- **Steps:** parse `redacted/r08.txt` (`16 w.g. 2569 17:10`), `r14.txt` (`03 w.g. 2569 23:04`), `r15.txt` (`03 w.g. 2569 19:03`)
- **Expected:** 2026-11-16 / 2026-11-03 / 2026-11-03 · **Actual:** `flags.noDate = true` → date = today (2026-11-23) · เวลายังอ่านได้ถูก (16/16)
- **Root cause:** Tesseract `tha+eng` เลือก model อังกฤษให้คำย่อเดือนบนพื้นหลังสีอ่อนของ make → "พ.ย." กลายเป็น `w.g.` (พ→w, ย→g) · `slipDate.ts` รองรับเฉพาะ variant ไทย (`พุย.`, `พ.ุย.` จาก BUG-001)
- **Suggestion (Dev):** เพิ่ม Latin look-alike map ของเดือนย่อ **เฉพาะเมื่อ pattern ครบ** `dd <month> (25xx|xx) hh:mm` (ตอนนี้พบจริงเฉพาะ `w.g.` → พ.ย.; เก็บ variant ของเดือนอื่นเพิ่มเมื่อมี fixture จริง ไม่เดา) และ year เป็น พ.ศ. ที่สมเหตุสมผล เพื่อกัน false positive · Layer A fixture จาก `redacted/r08.txt`

## BUG-014 — Category rule/keyword gaps on real merchants (outside OMX-050a/b scope)
- **Severity:** Medium (ผู้ใช้แก้หมวดเองบน Review ได้; ผลรวมของ category accuracy < 60% ติดตามที่ BUG-010 High) · **Story:** OMX-010 · **Found by:** OMX-042 · **Status:** Open → PO
- **Cases (ใบที่หมวดชัดเจน, ไม่รวม BUG-010 precedence):**
  | Slip | Expected | Actual | สาเหตุ |
  |---|---|---|---|
  | r05, r16 (make / K PLUS) เติมเงิน Rabbit — "บริษัท บางกอก สมาร์ทการ์ด ซิสเทม จำกัด" | `transport` | `other` | ไม่มี keyword Rabbit / บางกอก สมาร์ทการ์ด (OCR "ซิสแทม", "ซัส / เทม") |
  | r01 (make, PromptPay → นาย…), r02 (K PLUS → น.ส. …) | `transfer` | `other` | rule "โอนให้บุคคล" ดูแค่ `payee` ซึ่งว่าง (BUG-009) แม้ข้อความมีคำนำหน้า นาย/น.ส. → **แก้ได้เมื่อ OMX-049 เสร็จ** (ไม่ต้องทำ rule แยก) |
  | r08 (make) โอนเข้าบัญชีตัวเองอีกธนาคาร — ชื่อผู้รับไม่มีคำนำหน้า และ = ชื่อผู้โอน | `transfer` | `other` | ไม่มี rule "ผู้รับ = ผู้โอน / โอนเงินสำเร็จไปบุคคลไม่มีคำนำหน้า" → ต้องมี payee (BUG-009) + guard sender-equality (OMX-049 AC4 ห้ามคืนชื่อผู้โอนเป็น payee → ต้องตัดสินว่าจะ map เป็น `transfer` อย่างไร) |
  | r12 (make) AMELIA HOME, memo "ค่ากางเกง" | `shopping` | `other` | memo ไม่ถูกอ่าน (BUG-015) + ไม่มี keyword เสื้อผ้า ("กางเกง", "เสื้อ") ใน memo tier |
  | r15 (make) จิตรลูกชิ้นปลาเยาวราช | `food` | `other` | คำอาหาร (อยู่ใน 050a — นับที่ BUG-010) |
- **Pending (รอผู้ใช้ยืนยันก่อนจะนับเป็น bug):** r04 ล้างแอร์ → `housing`? (ได้ `other`) · r13 เติมเงิน G-Wallet → `transfer`? (ได้ `other`) · r14 วิสาหกิจชุมชนท่องเที่ยว → `entertainment`? (ได้ `other`)
- **Suggestion:** เพิ่ม keyword `transport`: "Rabbit", "บางกอก สมาร์ทการ์ด", "BTS", "MRT" (fuzzy ตามแนว 050b) · memo tier รองรับ "ค่า<สินค้า>" สำหรับเสื้อผ้า · rule transfer สำหรับ "โอนเงินสำเร็จ" + payee เป็นบุคคล/ชื่อเจ้าของบัญชี หลัง OMX-049 · ระวัง false positive ตาม risk R-B (`grooming/sprint-2-qa.md` §3)

## BUG-015 — Secondary fields on real slips: memo, bank, type confidence
- **Severity:** Low (ไม่กระทบยอด/วันที่; กระทบ category ทางอ้อม และทำให้ badge "ไม่แน่ใจ" ขึ้นบ่อย) · **Story:** OMX-009 (memo/bank), OMX-006 AC (confidence) · **Found by:** OMX-042 · **Status:** Open → PO
- **(a) memo บน make ไม่ถูกอ่าน:** make แสดง memo ในกล่องท้ายสลิป **ไม่มี label** → r04 "ล้างแอร์", r08 "เดือนตุลา", r12 "ค่ากางเกง", r14 "โกรกอีดก" → `note = null` (0/4)
- **(b) disclaimer ถูกอ่านเป็น memo:** r10 (K PLUS บริจาค) `note = "ธนาคารได้รับข้อมูลการบริจาคของคุณ เพื่อการใช้สิทธิลด"` จากบรรทัด `หมายเหตุ: …` ที่เป็นข้อความของธนาคาร (ไม่ใช่ memo ผู้ใช้)
- **(c) bank:** make = `null` 6/9 (ได้ `kplus` เฉพาะใบที่ OCR อ่าน "by KBank" ได้) · Krungthai r13 = `null` (OCR "กรงไทย")
- **(d) type confidence Low 5/16** (r04, r05, r12, r13, r15) → `flags.lowType` = แสดง "ไม่แน่ใจว่าเป็นรายรับหรือรายจ่าย" ทั้งที่ type ถูก 16/16 — สาเหตุ: "ชําระเจิน" (known noise), "เติมเงินสําเร็จ"/"เติมเงินสําเร็อ" ไม่อยู่ใน rule แบบ strong
- **Evidence (redacted, r12 make):** `ค่าธรรมเนียม … 0.00 บาท` → `เลขที่รายการ: 046379353jbldpx88JfE` → `รหัสร้านคํา: KB000026372581` → `ณ๑` → `ค่ากางเกง                                            ก  A`
- **Suggestion:** memo make = บรรทัดสุดท้ายหลัง "รหัสธุรกรรม/เลขที่รายการ" ที่เป็นข้อความไทยล้วน (ตัด junk โลโก้ `ก  A`) · ตัด `หมายเหตุ: ธนาคาร…` ออกจาก memo · bank: "make" / "by KBank" → `kplus`, "กรงไทย" → `ktb` · "เติมเงินสำเร็จ" → expense rule strong

## Dev code review of QA fixes (Day 4)
| Bug | Commit | Review |
|---|---|---|
| BUG-001 | `849a999` | **OK** — `ABBR_DOT = [.\u0E38]{0,2}` is scoped to Thai month abbreviations only (anchored between a day number and a year), so no new false matches; fixtures updated |
| BUG-002 | `4391555` | **OK** — synchronous `useRef` guard set before validation passes to save and reset on storage failure / "save and add another"; `saving` state still drives the spinner |
| BUG-004 | `f023918` | **OK** — `toCsv(txs, categoryName)` keeps the domain pure (name lookup injected, default = id for tests/back-compat); Settings passes `t('categories.<id>')` |
| BUG-005 | `202e6ab` | **OK** — `min-width: 44px` on `.langOption`; combined with the `::after` hit-area gives 44×44 |

## QA re-test of Dev fixes (2026-11-13, build after `8c779d0`)
| Bug | Re-test | Result |
|---|---|---|
| BUG-003 | TC-120 (no `test.fail`) mobile + desktop ✅ · ad-hoc scan 320px × TH/EN × 5 routes (Dashboard, Transactions, Add/Edit form, Add slip, Settings): `scrollWidth = 320` ทุกหน้า · 375/1280 explore matrix ยังผ่าน | **Pass → Closed** |
| BUG-006 | Layer A `qa-ocr-prefix-noise-nai`, `rec-b08`, `rec-b12` + Dev false-positive guards ผ่าน (35/35 category) · Layer B real OCR b08/b12 = `transfer` → category **100%** (27/27) | **Pass → Closed** |
| BUG-008 | EN 375px: placeholder "Search name, note, amount" กว้าง 197px ≤ พื้นที่ 233px (ไม่ถูกตัด) · TH ไม่เปลี่ยน | **Pass → Closed** |

Regression หลัง fix: lint/typecheck/format/i18n ✅ · Vitest 209/209 · build ✅ (170.2 KB gz) · Playwright 93 passed / 5 skipped (by design) / 0 failed — ไม่มี `test.fail` / `it.fails` เหลือ

---

## Observations (ไม่ใช่ bug — ส่ง PO/Designer พิจารณา)
- **O1** — `<input type="date">` แสดงตาม locale ของ browser (en-US = `11/13/2026` mm/dd) แต่มี chip "13 Nov 2026" ข้าง ๆ ช่วยลดความสับสน dd/mm vs mm/dd → OK สำหรับ MVP
- **O2** — Salary slip ที่ไม่มี pay date และงวดคือเดือนปัจจุบัน → วันสิ้นงวด (30 พ.ย.) อยู่ในอนาคต → fallback เป็นวันนี้ตาม AC6 (b14) — ถูกตาม AC แต่ PO อาจอยากให้ใช้วันสิ้นงวดสำหรับ salary
- **O3** — K6 (received slip ที่หน้าตาเหมือนสลิปผู้โอน ยังเป็น Expense) ยืนยันจาก b08 — ตาม AC8 limitation → OMX-039
- **O4** — ชื่อธนาคาร/แอปจริงปรากฏเฉพาะเป็น *ข้อความ* ใน Dev fixtures/fake OCR (จำเป็นสำหรับ bank detection OMX-009) — ไม่มีโลโก้/branding; QA Layer B ใช้ธนาคารสมมติทั้งหมด → OK
- **O5** — ที่ 320px placeholder ค้นหา (TH และ EN, 197px) ยาวกว่าพื้นที่ (178px) จึงถูกตัดเล็กน้อย — ต่ำกว่า scope ของ BUG-008 (375px), cosmetic → Designer พิจารณา backlog ได้
- **O6** *(2026-11-23)* — Lighthouse Best Practices = 96 เพราะ audit `inspector-issues`: CSP บล็อก `eval` (script-src, `kEvalViolation`) จาก bundle `assets/index-*.js` — มาจาก **zod v4** ที่ probe ความสามารถ JIT ด้วย `new Function("")` ใน `try/catch` แล้ว fallback เอง → ไม่มีผลต่อการทำงาน, ไม่มี console error (`errors-in-console` ว่าง), CSP ยังทำงานถูกต้อง · ถ้าอยากให้ BP = 100 และไม่มี issue ใน DevTools: Dev ตั้ง `z.config({ jitless: true })` ตอน bootstrap → backlog Low ไม่ต้องเปิด bug
