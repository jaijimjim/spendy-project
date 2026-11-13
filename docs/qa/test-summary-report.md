# Test Summary Report — Omnitrix Money MVP_0001 (Sprint 1)

> Owner: QA · 2026-11-13 (Sprint 1 Day 4) · Build: local `main` (ไม่ได้ push — B1) served by `vite preview`, Chromium 1243, TZ Asia/Bangkok
> อ้างอิง: [`test-plan.md`](test-plan.md) · [`test-cases.md`](test-cases.md) · [`bug-report.md`](bug-report.md) · UAT criteria: [`grooming/sprint-1-qa.md` §5](../agile/grooming/sprint-1-qa.md)

## 1. Recommendation

### ✅ GO for UAT — **conditional**

Functional quality ของ build พร้อมสำหรับ UAT: ไม่มี Critical/High ค้าง, ทุก Must flow ผ่านบน 375/1280px TH/EN, OCR benchmark ผ่าน gate ทุกตัวด้วย margin กว้าง. แต่ **UAT จะเริ่มได้จริงเมื่อเงื่อนไขต่อไปนี้ครบ** (ส่วนที่ยังไม่ครบเป็น *Blocked* ไม่ใช่ Fail):

| # | Condition (ต้องครบก่อนเริ่ม UAT) | Owner | Ref |
|---|---|---|---|
| C1 | **B1 ปิด** — push `main`, deploy Pages สำเร็จ, CI เขียว, QA รัน post-deploy smoke + e2e บน Pages URL (`E2E_BASE_URL`) + Lighthouse (LCP, a11y ≥ 90) | PO → Dev → QA | Entry #1–3, #7 |
| C2 | **B2** — ตั้ง `VITE_GOOGLE_CLIENT_ID` + test users แล้ว QA รัน TC-015/016/017 **หรือ** PO ตัดสินเป็นลายลักษณ์อักษรว่า UAT รอบนี้ทำในสถานะ "Not configured" | PO | Entry #8 |
| C3 | BUG-003 (320px overflow) และ BUG-006 (OCR noise → category) มี triage decision จาก PO (แก้ก่อน UAT หรืออยู่ใน known-issues list) | PO + Dev | Entry #4 |
| C4 | Freeze build (tag/SHA) + UAT pack (scenario, synthetic slip set จาก `tests/fixtures/slips/images`, known-issues = bug ที่ Open + O1–O3) | PO + QA | Entry #2, #9 |
| C5 | Smoke บน Tier 1 จริง: Android Chrome + iOS Safari (ยังไม่ได้ทดสอบ — sandbox มีแค่ Chromium) | QA | Exit #5 |

**No-Go triggers:** ถ้า Pages deploy ล้ม/เปิดไม่ได้, หรือ smoke บน Pages / Tier 1 เจอ Critical/High → No-Go จนกว่าจะแก้

## 2. Execution results

### 2.1 Test cases ([test-cases.md](test-cases.md))

| Result | Count | % |
|---|---|---|
| Pass | 115 | 87.1% |
| Fail | 4 | 3.0% |
| Blocked | 12 | 9.1% |
| Not run | 1 | 0.8% |
| **Total** | **132** | |

- **Must stories:** ทุก TC ที่รันได้ = Pass; Fail ใน Must มี 2 (TC-069 OMX-010 → BUG-006 Medium, TC-120 OMX-025 → BUG-003 Medium) — ไม่มี Critical/High
- **Blocked** = B1 (Pages/CI/Lighthouse), B2 (Google OAuth จริง), อุปกรณ์จริง/screen reader/Excel, Layer C real slips — ไม่ใช่ข้อบกพร่องของ build

### 2.2 Automated suites (final regression run หลัง fix, 2026-11-13)

| Command | Result |
|---|---|
| `npm run lint` | ✅ 0 errors / 0 warnings |
| `npm run typecheck` | ✅ |
| `npm run format:check` · `npm run i18n:check` | ✅ · ✅ 345 keys TH/EN parity |
| `npm test` (Vitest) | ✅ **197 / 197** (10 files; QA Layer A 33 tests, BUG-006 cases เป็น `it.fails`) |
| `npm run build` · `size:check` | ✅ initial JS **170 KB gz** (limit 300) |
| `npm run e2e` (mobile 375 + desktop 1280 + screens + real-ocr) | ✅ **93 passed, 5 skipped, 0 failed** (skip = TC-085 บน mobile by design + explore matrix รันครั้งเดียวใน desktop; 4 ใน 93 คือ `test.fail` ของ BUG-003 ที่ยัง open) |
| Exploratory matrix 375/1280 × TH/EN × light/dark (`qa-explore.spec.ts`) | ✅ 4/4 — no overflow, no raw keys, no Thai in EN UI chrome, no console errors |

Environment note: Playwright ใช้ `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (browser download ถูก proxy block)

## 3. OCR accuracy

### 3.1 Layer B — synthetic slip images, real Tesseract in the built app ([`benchmark-results.json`](../../tests/fixtures/slips/benchmark-results.json))

27 images = 18 base (โอน TH/EN, QR, บิล, received TH/EN, salary TH ×2 / EN ×2, เลขไทย, dd/mm, CE/BE) + 9 degraded (JPEG q35/q55 low-res, blur, rotate 2°, dark theme). ธนาคารสมมติทั้งหมด ไม่มีโลโก้จริง

| Field | Accuracy | UAT threshold (synthetic) | Status |
|---|---|---|---|
| Type | **100%** (27/27) | ≥ 90% | ✅ |
| Amount | **96.3%** (26/27) | ≥ 80% | ✅ (miss: b16 เลขไทย → BUG-007) |
| Category | **92.6%** (25/27) | ≥ 60% | ✅ (miss: b08, b12 → BUG-006) |
| Date | **100%** (27/27) | — (report only) | ✅ (เดิม 60% ก่อนแก้ BUG-001) |
| Time | 100% | — | ✅ |

- Degraded variants 9/9 ถูกทุก field → robust ต่อ JPEG/blur/rotate/dark ในระดับ synthetic
- OCR speed (sandbox CPU, model cached): **~1.4 s/รูป** (27 รูป 37.9 s) — device timing จริง (029 AC3) ยังไม่ได้วัด
- App values ตรงกับการ re-parse raw OCR text ด้วย pure parser 100% (`appMatchesReparse: true`)

### 3.2 Layer A — golden OCR text → parser (32 QA fixtures + Dev starter set)

| Field | QA set | Gate | Status |
|---|---|---|---|
| Type | 100% (32/32) | ≥ 95% | ✅ |
| Amount | 100% (32/32) | ≥ 95% | ✅ |
| Date | 100% (32/32) | ≥ 95% | ✅ |
| Category | 90.6% (29/32) | — | 3 misses = BUG-006 (tracked `it.fails`) |

Edge cases จาก QA grooming ที่ครอบคลุมแล้ว: salary+transfer keyword conflict, memo มี "เงินเดือน", Grab vs GrabFood / "Grab Food", Café Amazon vs PTT, dd/mm vs mm/dd, BE vs CE, 2-digit BE, วันที่อนาคต/เก่ากว่า 5 ปี, 31/11, 29 ก.พ. 2567, timezone "today" (Honolulu/LA), month-end 23:59, multi-tab, satang rounding, CSV formula injection, XSS memo, Thai OCR quirks (ำ → ํา, "พุย.", prefix noise)

### 3.3 Not measured
- **Real-world (Layer C) accuracy** — ยังไม่ได้สลิปจริง/สลิปเงินเดือนลูกค้า (A5) → UAT exit #3 ต้องวัดระหว่าง UAT; ความเสี่ยง "synthetic ≠ real" สูงสุดของ release นี้

## 4. Defects ([bug-report.md](bug-report.md))

| | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Found | 0 | 1 | 5 | 2 | 8 |
| Fixed & verified (by QA, trivial) | 0 | 1 | 3 | 0 | 4 |
| **Open** | **0** | **0** | **2** | **2** | **4** |

**Open (need Dev / Designer):**
- **BUG-003** Medium — horizontal scroll ที่ 320px บน Transactions (filter button) และ Add/Edit form → **Dev**
- **BUG-006** Medium — OCR noise หน้าคำนำหน้าชื่อ ("แนายข") ทำให้ "โอนให้บุคคล" กลายเป็น "อื่น ๆ" → **Dev** (parser `parties.ts`)
- **BUG-007** Low — เลขไทยบนรูปถูก OCR อ่านเพี้ยน → amount ว่าง (user กรอกเองได้) → Dev backlog / known limitation
- **BUG-008** Low — placeholder ค้นหา EN ถูกตัดที่ 375px → Designer (copy)

**Fixed by QA this sprint:** BUG-001 (OCR month "พุย."), BUG-002 (double-click Save ซ้ำ — High), BUG-004 (CSV category name), BUG-005 (TH/EN touch target) — ทุกตัวมี regression test และ Dev ควร review commit `fix(...)` ใน PR เดียวกับงาน Sprint

## 5. UAT entry criteria check (grooming §5.1)

| # | Criterion | Status |
|---|---|---|
| 1 | Must stories Done ตาม DoD (QA pass บน deployed build) | ⛔ Blocked (B1) — QA pass บน local preview แล้ว |
| 2 | Build freeze (tag/SHA) | ⏳ ทำหลัง C1 |
| 3 | CI เขียว + e2e smoke บน Pages | ⛔ Blocked (B1) — local เทียบเท่า CI เขียวทั้งหมด |
| 4 | ไม่มี Critical/High ค้าง; Medium มี triage | ✅ / ⏳ (BUG-003, BUG-006 รอ PO triage) |
| 5 | Layer B ≥ 80/90/60; Layer A ≥ 95% | ✅ 96.3 / 100 / 92.6 ; A 100% |
| 6 | Privacy: allowlist test เขียว + HAR manual | ✅ allowlist + CSP; HAR บน Pages ⛔ B1 |
| 7 | axe 0 critical/serious; Lighthouse a11y ≥ 90 | ✅ axe; Lighthouse ⛔ B1 |
| 8 | Google Photos configured หรือ PO decision | ⛔ Blocked (B2) |
| 9 | UAT pack | ⏳ synthetic set พร้อมแล้ว; scenario list QA เตรียมต่อ |
| 10 | README อัปเดต | ✅ (URL จริงหลัง deploy) |

## 6. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| R1 Real-world slip accuracy ไม่ทราบ (synthetic อย่างเดียว) | สูง | วัดใน UAT (exit #3); PO เร่งขอสลิปตัวอย่าง (A5); ใช้ Review เป็น safety net |
| R2 ยังไม่เคย deploy/รันบน Pages (base path, CSP, caching Tesseract assets) | สูง | C1: post-deploy smoke + rerun e2e ด้วย `E2E_BASE_URL` ทันทีหลัง B1 ปิด |
| R3 Google OAuth/Picker จริงไม่เคยทดสอบ (K1) | กลาง | C2 หรือ PO ตัด scope UAT เป็น "Not configured" |
| R4 ไม่ได้ทดสอบ iOS Safari / Android / Firefox | กลาง | C5 smoke บนอุปกรณ์จริงก่อน UAT |
| R5 Performance บนมือถือระดับกลาง (LCP, OCR time, 1,000 rows — K4) | กลาง | วัดบน Pages + reference devices; virtualization เป็น follow-up |
| R6 Received slip ที่ไม่มี keyword ยังเป็น Expense (K6) | ต่ำ | Known limitation → OMX-039; user สลับ type บน Review |
