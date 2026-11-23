# Test Summary Report — Omnitrix Money MVP_0001 (Sprint 1)

> Owner: QA · 2026-11-13 (Sprint 1 Day 4) · **Final — re-test after Dev fixes `a1249eb..8c779d0`** · Build: local `main` (ไม่ได้ push — B1) served by `vite preview`, Chromium 1243, TZ Asia/Bangkok
> อ้างอิง: [`test-plan.md`](test-plan.md) · [`test-cases.md`](test-cases.md) · [`bug-report.md`](bug-report.md) · UAT criteria: [`grooming/sprint-1-qa.md` §5](../agile/grooming/sprint-1-qa.md)

> **อัปเดต 2026-11-23 (Sprint 2 Day 0):** re-run 12 TC ที่ Blocked → ดู [§7](#7-sprint-2-day-0--blocked-re-run-2026-11-23) — ตัวเลขล่าสุด **Pass 120 / Fail 2 / Blocked 9 / Not run 1**; recommendation เปลี่ยนเป็น **NOT READY for UAT** (BUG-009/010 High + B3). §1–§6 ด้านล่างคงไว้เป็นผล Sprint 1 (2026-11-13)

> **อัปเดต 2026-11-23 (Sprint 2 Day 1):** live verification บน Pages → [§8](#8-sprint-2-day-1--live-verification-2026-11-23) (**Pass 121 / Fail 2 / Blocked 8 / Not run 1**; OMX-028 ผ่าน AC2–AC5, AC1 รอหลักฐาน failing PR · OMX-048 **ยังไม่ผ่าน** AC1–AC3) · OMX-042 สลิปจริง n = 16 → [§9](#9-omx-042--real-slip-accuracy-n16) (category 0/9 ใบที่หมวดชัดเจน, payee 0/16, BUG-011 … 015) · recommendation ยัง **NOT READY for UAT**

## 1. Recommendation

### ✅ GO for UAT — **conditional**

Functional quality ของ build พร้อมสำหรับ UAT: bug ที่พบ 8 ตัว ปิดแล้ว 7 (เหลือ BUG-007 Low = known limitation), ไม่มี Critical/High/Medium ค้าง, ทุก Must TC ที่รันได้ผ่าน 100% บน 320/375/1280px TH/EN light/dark, OCR benchmark ผ่าน gate ทุกตัวด้วย margin กว้าง. แต่ **UAT จะเริ่มได้จริงเมื่อเงื่อนไขต่อไปนี้ครบ** (ส่วนที่ยังไม่ครบเป็น *Blocked* ไม่ใช่ Fail):

| # | Condition (ต้องครบก่อนเริ่ม UAT) | Owner | Ref |
|---|---|---|---|
| C1 | **B1 ปิด** — push `main`, deploy Pages สำเร็จ, CI เขียว, QA รัน post-deploy smoke + e2e บน Pages URL (`E2E_BASE_URL`) + Lighthouse (LCP, a11y ≥ 90) | PO → Dev → QA | Entry #1–3, #7 |
| C2 | **B2** — ตั้ง `VITE_GOOGLE_CLIENT_ID` + test users แล้ว QA รัน TC-015/016/017 **หรือ** PO ตัดสินเป็นลายลักษณ์อักษรว่า UAT รอบนี้ทำในสถานะ "Not configured" | PO | Entry #8 |
| C3 | PO ยอมรับ BUG-007 (Low) + O1–O3, O5 เข้า known-issues list ของ UAT pack | PO | Entry #4 |
| C4 | Freeze build (tag/SHA) + UAT pack (scenario, synthetic slip set จาก `tests/fixtures/slips/images`, known-issues = bug ที่ Open + O1–O3) | PO + QA | Entry #2, #9 |
| C5 | Smoke บน Tier 1 จริง: Android Chrome + iOS Safari (ยังไม่ได้ทดสอบ — sandbox มีแค่ Chromium) | QA | Exit #5 |

**No-Go triggers:** ถ้า Pages deploy ล้ม/เปิดไม่ได้, หรือ smoke บน Pages / Tier 1 เจอ Critical/High → No-Go จนกว่าจะแก้

## 2. Execution results

### 2.1 Test cases ([test-cases.md](test-cases.md))

| Result | Count | % |
|---|---|---|
| Pass | 118 | 89.4% |
| Fail | 1 | 0.8% |
| Blocked | 12 | 9.1% |
| Not run | 1 | 0.8% |
| **Total** | **132** | |

- **Must stories:** ทุก TC ที่รันได้ = **Pass 100%** (TC-069, TC-120 ผ่านหลัง Dev fix BUG-006/003); Fail เดียวคือ TC-045 (OMX-007 เลขไทยบนรูป → BUG-007 Low)
- **Blocked** = B1 (Pages/CI/Lighthouse), B2 (Google OAuth จริง), อุปกรณ์จริง/screen reader/Excel, Layer C real slips — ไม่ใช่ข้อบกพร่องของ build

### 2.2 Automated suites (final regression run หลัง Dev fix BUG-003/006/008, 2026-11-13)

| Command | Result |
|---|---|
| `npm run lint` | ✅ 0 errors / 0 warnings |
| `npm run typecheck` | ✅ |
| `npm run format:check` · `npm run i18n:check` | ✅ · ✅ 345 keys TH/EN parity |
| `npm test` (Vitest) | ✅ **209 / 209** (10 files; QA Layer A 35 fixtures, ไม่มี `it.fails` เหลือ) |
| `npm run build` · `size:check` | ✅ initial JS **170.2 KB gz** (limit 300) |
| `npm run e2e` (mobile 375 + desktop 1280 + screens + real-ocr) | ✅ **93 passed, 5 skipped, 0 failed** (skip = TC-085 บน mobile by design + explore matrix รันครั้งเดียวใน desktop; ไม่มี `test.fail` เหลือ) |
| Exploratory matrix 375/1280 × TH/EN × light/dark (`qa-explore.spec.ts`) | ✅ 4/4 — no overflow, no raw keys, no Thai in EN UI chrome, no console errors |

Environment note: Playwright ใช้ `PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome` (browser download ถูก proxy block)

## 3. OCR accuracy

### 3.1 Layer B — synthetic slip images, real Tesseract in the built app ([`benchmark-results.json`](../../tests/fixtures/slips/benchmark-results.json))

27 images = 18 base (โอน TH/EN, QR, บิล, received TH/EN, salary TH ×2 / EN ×2, เลขไทย, dd/mm, CE/BE) + 9 degraded (JPEG q35/q55 low-res, blur, rotate 2°, dark theme). ธนาคารสมมติทั้งหมด ไม่มีโลโก้จริง

| Field | Accuracy | UAT threshold (synthetic) | Status |
|---|---|---|---|
| Type | **100%** (27/27) | ≥ 90% | ✅ |
| Amount | **96.3%** (26/27) | ≥ 80% | ✅ (miss: b16 เลขไทย → BUG-007) |
| Category | **100%** (27/27) | ≥ 60% | ✅ (เดิม 92.6% ก่อนแก้ BUG-006) |
| Date | **100%** (27/27) | — (report only) | ✅ (เดิม 60% ก่อนแก้ BUG-001) |
| Time | 100% | — | ✅ |

- Degraded variants 9/9 ถูกทุก field → robust ต่อ JPEG/blur/rotate/dark ในระดับ synthetic
- OCR speed (sandbox CPU, model cached): **~1.4–1.7 s/รูป** — device timing จริง (029 AC3) ยังไม่ได้วัด
- App values ตรงกับการ re-parse raw OCR text ด้วย pure parser 100% (`appMatchesReparse: true`)

### 3.2 Layer A — golden OCR text → parser (35 QA/Dev golden fixtures + Dev starter set)

| Field | QA set | Gate | Status |
|---|---|---|---|
| Type | 100% (35/35) | ≥ 95% | ✅ |
| Amount | 100% (35/35) | ≥ 95% | ✅ |
| Date | 100% (35/35) | ≥ 95% | ✅ |
| Category | 100% (35/35) | — | ✅ (รวม Dev false-positive guards ของ BUG-006) |

Edge cases จาก QA grooming ที่ครอบคลุมแล้ว: salary+transfer keyword conflict, memo มี "เงินเดือน", Grab vs GrabFood / "Grab Food", Café Amazon vs PTT, dd/mm vs mm/dd, BE vs CE, 2-digit BE, วันที่อนาคต/เก่ากว่า 5 ปี, 31/11, 29 ก.พ. 2567, timezone "today" (Honolulu/LA), month-end 23:59, multi-tab, satang rounding, CSV formula injection, XSS memo, Thai OCR quirks (ำ → ํา, "พุย.", prefix noise)

### 3.3 Not measured
- **Real-world (Layer C) accuracy** — ยังไม่ได้สลิปจริง/สลิปเงินเดือนลูกค้า (A5) → UAT exit #3 ต้องวัดระหว่าง UAT; ความเสี่ยง "synthetic ≠ real" สูงสุดของ release นี้

## 4. Defects ([bug-report.md](bug-report.md))

| | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Found | 0 | 1 | 5 | 2 | 8 |
| Fixed by QA (Dev review OK) | 0 | 1 | 3 | 0 | 4 |
| Fixed by Dev (QA re-test Pass) | 0 | 0 | 2 | 1 | 3 |
| **Open** | **0** | **0** | **0** | **1** | **1** |

**Open:** BUG-007 Low — เลขไทยบนรูปถูก OCR อ่านเพี้ยน → amount ว่าง (user กรอกเองได้) → Dev backlog / known limitation

**Closed:** BUG-001, 002, 004, 005 (QA fix, Dev code review OK) · BUG-003, 006, 008 (Dev fix, QA re-test Pass 2026-11-13: 320px scan 5 routes × TH/EN = no overflow, Layer B category 100%, EN placeholder fits at 375px)

## 5. UAT entry criteria check (grooming §5.1)

| # | Criterion | Status |
|---|---|---|
| 1 | Must stories Done ตาม DoD (QA pass บน deployed build) | ⛔ Blocked (B1) — QA pass บน local preview แล้ว |
| 2 | Build freeze (tag/SHA) | ⏳ ทำหลัง C1 |
| 3 | CI เขียว + e2e smoke บน Pages | ⛔ Blocked (B1) — local เทียบเท่า CI เขียวทั้งหมด |
| 4 | ไม่มี Critical/High ค้าง; Medium มี triage | ✅ ไม่มี Medium ค้าง (Open เหลือ BUG-007 Low) |
| 5 | Layer B ≥ 80/90/60; Layer A ≥ 95% | ✅ amount 96.3 / type 100 / category 100 ; A 100% |
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

---

## 7. Sprint 2 Day 0 — Blocked re-run (2026-11-23)

> Owner: QA · หลักฐาน: GitHub Actions run **`43827185503`** (commit `e17c62e`, workflow "Deploy to GitHub Pages" → `workflow_call` `ci.yml`) · URL live `https://jaijimjim.github.io/omnitrix-project/` (ตรวจ 2026-11-23) · Lighthouse **local interim** · ผลสลิปจริง 3 ใบของผู้ใช้ (FB-011, 2026-11-14)

### 7.1 Evidence

| Source | ผล |
|---|---|
| CI `ci.yml` บน GitHub (run `43827185503`) | ✅ Secret scan (gitleaks) · ✅ Lint·typecheck·unit · ✅ Build without-google · ✅ Build with-google · ✅ E2E (Playwright) → **B1 ปิด** (push + CI บน GitHub ทำงานแล้ว) |
| `deploy.yml` job "Build for Pages" | ❌ `actions/configure-pages@v5`: "Get Pages site failed … Not Found" → job Deploy ถูก skip |
| URL live | ❌ HTTP 404 "There isn't a GitHub Pages site here" |
| สาเหตุ | repo เป็น **private** และยังไม่เปิด Pages (Source = GitHub Actions) — config ฝั่ง repo owner, **ไม่ใช่ bug ในโค้ด** → บันทึกเป็น impediment **B3** (FB-012) แจ้งผู้ใช้แล้ว |
| Lighthouse local interim | `npx vite preview --port 4173` → `http://localhost:4173/omnitrix-project/` (production build ปัจจุบัน) · Lighthouse 13.6.0, HeadlessChrome 153, form factor mobile (412px), simulated throttling (RTT 150 ms, 1.6 Mbps, CPU ×4) · raw JSON เก็บนอก repo (`/tmp/lh-run{1,2,3}.json`) |
| สลิปจริง (Layer C) | ผู้ใช้รันบนเครื่องตัวเอง 3 ใบ (KBank "make by KBank" / K PLUS) — รูปไม่ได้เข้า repo/sandbox |

### 7.2 Lighthouse — local interim (ไม่ใช่ผลบน Pages จริง)

| Run | Performance | **LCP** | FCP | TBT | CLS | **Accessibility** | Best Practices | SEO |
|---|---|---|---|---|---|---|---|---|
| 1 | 93 | 752 ms | 752 ms | 309 ms | 0.001 | 100 | 96 | 100 |
| 2 | 99 | 774 ms | 774 ms | 110 ms | 0.001 | 100 | 96 | 100 |
| 3 | 99 | 755 ms | 755 ms | 108 ms | 0.001 | 100 | 96 | 100 |
| **Median** | **99** | **755 ms** (gate ≤ 2.5 s ✅) | 755 ms | 110 ms | 0.001 | **100** (gate ≥ 90 ✅) | 96 | 100 |

- ข้อจำกัด: localhost ไม่มี DNS/TLS/CDN latency ของ GitHub Pages และ Lighthouse simulate จาก trace ที่ได้บนเครื่อง → ตัวเลขนี้เป็น **upper bound เชิงบวก** ใช้ยืนยันว่า bundle/render ไม่ใช่คอขวด แต่ **ไม่ปิด TC-139/135** — ต้องวัดซ้ำบน Pages URL หลัง B3
- Best Practices 96: audit `inspector-issues` = CSP บล็อก `eval` จาก zod v4 JIT probe (`new Function("")` ใน try/catch, fallback อัตโนมัติ) → ไม่กระทบการทำงาน บันทึกเป็น **O6** (ไม่ใช่ bug) ใน [`bug-report.md`](bug-report.md)
- TBT run 1 = 309 ms (cold run) แล้วลดเหลือ ~110 ms — ไม่มีผลต่อ gate

### 7.3 ผลใหม่ของ 12 TC ที่เคย Blocked

| TC | เดิม | ใหม่ (2026-11-23) | เหตุผล / blocker ปัจจุบัน |
|---|---|---|---|
| TC-138 CI เขียว | Blocked (B1) | **Pass** (on push) | ทุก job ของ `ci.yml` ✓ ใน run `43827185503`; trigger เป็น push `main` (ผ่าน `workflow_call`) ไม่ใช่ PR — `ci.yml` มี `on: pull_request` และ job เดียวกัน จึงยอมรับ; ยืนยัน trigger PR ใน PR แรกของ Sprint 2 |
| TC-149 gitleaks + storage | Partial (gitleaks B1) | **Pass** | job "Secret scan (gitleaks)" ✓ + storage Pass (2026-11-13) |
| TC-163 Real-world (Layer C) | Blocked (A5) | **Fail (interim, n = 3)** → BUG-010 / BUG-009 | ดู §7.4 — category 33% < 60% (MVP metric) |
| TC-137 Deploy Pages | Blocked (B1) | **Blocked (B3)** | build ผ่าน แต่ `configure-pages` ล้มเพราะ Pages ยังไม่เปิด (config ไม่ใช่ product defect — convention: Fail ใช้กับ product defect ที่ต้องเปิด BUG เท่านั้น) |
| TC-139 LCP | Blocked (B1) | **Blocked (B3)** + local interim median **755 ms** | ต้องวัดบน Pages URL |
| TC-135 SR / Lighthouse a11y / 200% zoom | Blocked (DEV, B1) | **Blocked (DEV, B3)** + local interim a11y **100** | screen reader จริง + zoom บนอุปกรณ์ + Lighthouse บน Pages ยังไม่ทำ |
| TC-118 CSV ใน Excel | Blocked (DEV) | **Partial** (นับ Blocked): BOM **Pass** | `src/domain/csv.ts` prepend U+FEFF, Blob `text/csv;charset=utf-8`; unit `writes BOM…` + e2e อ่านไฟล์ download จริงได้ byte แรก 0xFEFF (ผ่านใน CI) → Excel ควรแสดงไทยถูก แต่ยังไม่ได้เปิดใน Excel/Sheets จริง |
| TC-008 native picker มือถือ | Blocked (DEV, B1) | **Blocked (DEV + B3)** | ต้องมี Android Chrome / iOS Safari จริง + URL Pages |
| TC-141 OCR ≤ 15 s บนอุปกรณ์ | Blocked (DEV) | **Blocked (DEV)** | ยังไม่มี reference device / ผลจากผู้ใช้ |
| TC-015 / 016 / 017 Google จริง | Blocked (B2) | **Blocked (B2)** | OAuth Client สร้างแล้วแต่ยังไม่ยืนยัน repo variable `VITE_GOOGLE_CLIENT_ID`, Photos Picker API, test users · ทดสอบบน `localhost:4173` (origin ที่อนุญาตแล้ว) ได้ทันทีเมื่อได้ Client ID ไม่ต้องรอ B3 · TC-016 คาดว่าจะ Fail จนกว่า OMX-041 (per-item Retry) เสร็จ |

### 7.4 Layer C — สลิปจริง (interim, n = 3)

| Field | ผล | MVP metric | Status |
|---|---|---|---|
| Type | 3/3 (100%) | ≥ 90% | ✅ |
| Amount | 3/3 (100%) | ≥ 80% | ✅ |
| Date / Time | 3/3 / 3/3 | report only | ✅ |
| Category | **1/3 (33%)** | ≥ 60% | ❌ → BUG-010 (High) |
| Payee | **0/3 (0%)** | report only (OMX-009 AC6) | ❌ → BUG-009 (High) |

⚠️ **Sample เล็กมาก (3 ใบ, ธนาคารเดียว = KBank/K PLUS)** — 1 ใบ = 33 percentage points จึงไม่มีนัยทางสถิติ ใช้เป็น *signal* ว่า synthetic set (Layer B 100%) ยังไม่สะท้อน layout จริง (ลูกศร ↓, biller name, OCR variant ของชื่อแบรนด์) — ยืนยันความเสี่ยง R1. OMX-042 ยังต้องการ ≥ 11 สลิป (≥ 2 ต่อธนาคาร + salary 3 แบบ). ตาม grooming §5.2 #3 ค่าที่ต่ำกว่าเป้าไม่ block อัตโนมัติ แต่ bug ที่พบเป็น **High** จึงกระทบ UAT entry #4

### 7.5 Execution totals (132 TC)

| Result | 2026-11-13 | **2026-11-23** | Δ |
|---|---|---|---|
| Pass | 118 (89.4%) | **120 (90.9%)** | +2 (TC-138, 149) |
| Fail | 1 (0.8%) | **2 (1.5%)** | +1 (TC-163) |
| Blocked | 12 (9.1%) | **9 (6.8%)** | −3 |
| Not run | 1 (0.8%) | **1 (0.8%)** | 0 |
| **Total** | 132 | **132** | |

Defects: 10 (Critical 0 · High 3 · Medium 5 · Low 2) · **Open 3** — BUG-009 High, BUG-010 High (→ OMX-049/050), BUG-007 Low · ไม่มี bug ใหม่จาก build (BUG-011 ยังไม่ใช้) · Impediment: **B3** (Pages) · Observation ใหม่: **O6** (zod eval probe vs CSP)

### 7.6 UAT entry check (อัปเดตเฉพาะข้อที่เปลี่ยน)

| # | Criterion | 2026-11-23 |
|---|---|---|
| 1 | Must Done (QA pass บน deployed build) | ⛔ Blocked (**B3**) |
| 3 | CI เขียว + e2e smoke บน Pages | ◐ CI เขียวบน GitHub ✅ · smoke บน Pages ⛔ B3 |
| 4 | ไม่มี Critical/High ค้าง | ❌ **BUG-009, BUG-010 (High) Open** |
| 7 | axe + Lighthouse a11y ≥ 90 | ◐ axe ✅ · Lighthouse a11y 100 (local interim) — บน Pages ⛔ B3 |
| 8 | Google Photos configured / PO decision | ⛔ Blocked (B2) |

### 7.7 Recommendation (Sprint 2 Day 0)

### ⛔ NOT READY for UAT — เปลี่ยนจาก "conditional GO" (2026-11-13)

เหตุผล: (1) **BUG-009/010 High** จากสลิปจริงขัด UAT entry #4 และแสดงว่า real-world category/payee ต่ำกว่าเป้าบน layout ของธนาคารเป้าหมายหลัก (2) **B3** ยังไม่มี deployed build ให้ทดสอบ. คุณภาพ build บน synthetic/automated ยังดี (CI เขียวครบบน GitHub, Layer A/B 100%, LCP/a11y local interim ผ่าน gate ด้วย margin กว้าง)

| # | Action | Owner | ปลด |
|---|---|---|---|
| 1 | เปิด Pages (Source = GitHub Actions) — ถ้า plan ไม่รองรับ Pages บน private repo ต้องเปลี่ยน repo เป็น public (ตรวจว่าไม่มีข้อมูลจริงใน history ก่อน) แล้ว re-run `deploy.yml` | Repo owner → PO | B3 → TC-137 |
| 2 | ทันทีหลัง deploy: post-deploy smoke + e2e ด้วย `E2E_BASE_URL` + Lighthouse mobile ×3 บน Pages | QA | TC-137, 139, 135 (บางส่วน), OMX-048 |
| 3 | ยืนยัน `VITE_GOOGLE_CLIENT_ID` + Picker API + test users แล้ว QA รันบน `localhost:4173` ได้ก่อน B3 | PO / ผู้ใช้ | TC-015, 017 (016 รอ OMX-041) |
| 4 | Sprint 2: แก้ OMX-049 (BUG-009) + OMX-050 (BUG-010) ด้วย redacted fixtures ตาม [`grooming/sprint-2-qa.md`](../agile/grooming/sprint-2-qa.md); regression gate Layer A 100% / Layer B 27/27 ไม่ลด | Dev + QA | BUG-009/010, TC-163 re-run |
| 5 | ขยาย Layer C ให้ถึง ≥ 11 สลิป (OMX-042) โดยผู้ใช้/ทีมรันบนเครื่องตัวเองและส่งเฉพาะผลตัวเลข + OCR text ที่ปิดข้อมูล | PO | TC-163 (final) |
| 6 | Smoke บนมือถือจริง Android Chrome + iOS Safari (picker, OCR time, SR) | QA + ผู้ใช้ | TC-008, 141, 135 |

UAT readiness จะประเมินใหม่เมื่อ #1, #2, #4 เสร็จ (และ #3 หรือ PO decision "Not configured")

## 8. Sprint 2 Day 1 — live verification (2026-11-23)

> Owner: QA · URL: `https://jaijimjim.github.io/spendy-project/` · Build: commit `6ebe779` (OMX-052 rename) · หลักฐาน: GitHub Actions run **`45208481550`** + การตรวจบนเบราว์เซอร์จริงโดย orchestrator (sandbox ของ QA เข้า `github.io` ไม่ได้เพราะ proxy — QA ไม่ได้เปิด URL เอง จึงบันทึกเป็นหลักฐานบุคคลที่สาม)

### 8.1 Evidence

| Check | ผล |
|---|---|
| GitHub Actions run `45208481550` (push `main`, commit `6ebe779`) | ✅ Secret scan (gitleaks) · ✅ Lint·typecheck·unit · ✅ Build without-google · ✅ Build with-google · ✅ E2E (Playwright, mobile + desktop + real-ocr) · ✅ Build for Pages · ✅ Deploy → **B3 ปิด** |
| หน้าแรก | HTTP 200 · `<title>` = "Home · Spendy Money" (OMX-052 AC1 บางส่วน) |
| Deep link (HashRouter) | `#/transactions`, `#/transactions/new`, `#/settings` โหลดได้ title ถูก · route ไม่รู้จัก `#/dashboard` → redirect Home |
| Assets / privacy | JS, CSS, ฟอนต์ IBM Plex Sans Thai, Tesseract worker + core + lang `tha` (896,631 B) / `eng` (2,952,873 B) มาจาก **origin เดียว** · **ไม่มี third-party request** · CSP `<meta>` อยู่ · localStorage ว่างก่อนใช้งาน |
| LCP | **2,208 ms** (FCP 2,208 ms) — `PerformanceObserver` บนเบราว์เซอร์จริง, **desktop, ไม่ throttle, 1 ครั้ง** (ไม่ใช่ Lighthouse mobile lab) |
| Console | ไม่มี error ของแอป — 404 ที่พบมาจาก HEAD probe ที่ผู้ตรวจยิงผิด path เอง |
| **ยังไม่ได้ทำ** | e2e suite ด้วย `E2E_BASE_URL` บน Pages · Lighthouse mobile ×3 (perf + a11y) · HAR ของ upload → OCR → save + cache รอบสอง · OCR จริงบน live (ทดสอบ Tesseract.js ตัวเดียวกันใน Node แล้วใน §9 แต่ไม่ใช่ใน browser บน Pages) |

### 8.2 TC ที่เปลี่ยน

| TC | เดิม (Day 0) | ใหม่ (Day 1) | เหตุผล |
|---|---|---|---|
| TC-137 Deploy + post-deploy smoke | Blocked (B3) | **Pass** | deploy เขียว + URL 200 + deep link + asset same-origin |
| TC-126 Deep link | Pass (local; Pages Blocked) | **Pass (local + Pages)** | 3 route + redirect route ไม่รู้จัก |
| TC-139 LCP Lighthouse mobile บน Pages | Blocked (B3) | **Partial** (นับ Blocked) | ได้ค่าจริงบน Pages 2,208 ms แต่เป็น desktop ไม่ throttle 1 ครั้ง ≠ วิธีใน AC · ซื่อตรง: ไม่นับ Pass |
| TC-149 gitleaks + storage | Pass | **Pass** (หลักฐานใหม่) | gitleaks ✓ ใน run `45208481550` (repo public แล้ว) + localStorage ว่างบน live |
| TC-008, TC-135 | Blocked (DEV + B3) | Blocked (DEV) | B3 ปิด เหลือเฉพาะอุปกรณ์จริง / Lighthouse บน Pages (→ OMX-043 / OMX-048) |
| TC-163 Layer C | Fail (n = 3) | **Fail (n = 16)** | ดู §9 |

⚠️ **ความเสี่ยง LCP:** local Lighthouse mobile (Slow 4G + CPU ×4) = 755 ms แต่ Pages จริงบน desktop **ไม่ throttle** = 2,208 ms (LCP = FCP → ติดที่ network/โหลด asset ไม่ใช่ render) → latency จริงของ Pages/CDN เป็นตัวหลัก · มีโอกาสสูงที่ Lighthouse mobile บน Pages จะ **เกิน 2.5 s** → ต้องวัดตาม AC ก่อนสรุป OMX-029 AC1 / OMX-048 AC2; ถ้าเกิน Dev ควรดู preload ฟอนต์ไทย/critical CSS และขนาด initial JS

### 8.3 OMX-028 — Deploy to GitHub Pages: QA verdict

| AC | ผล | หลักฐาน |
|---|---|---|
| AC1 pipeline + failed step blocks deploy | ◐ **Partial** | run `45208481550` รัน npm ci → typecheck → lint → format → i18n check → unit (coverage) → build ×2 → e2e → deploy ✓ · `deploy.yml`: `build` `needs: ci`, `deploy` `needs: build` (โครงสร้างบล็อกจริง) · **ยังไม่มี "intentionally failing PR"** ตามที่ AC กำหนด |
| AC2 live URL, base path, assets, hash routes, Tesseract files | ✅ Pass | §8.1 |
| AC3 build ทั้งมี/ไม่มี `VITE_GOOGLE_CLIENT_ID` | ✅ Pass | job Build ×2 ✓ |
| AC4 Tesseract จาก npm, ไม่ commit, ไม่มี CDN | ✅ Pass | CI step "Tesseract assets are bundled from npm (no CDN)" ✓ · `public/tesseract/` git-ignored · live: worker/core/lang จาก origin เดียว |
| AC5 README live URL + dev + deploy notes | ✅ Pass | `README.md` บรรทัด "**Live:** https://jaijimjim.github.io/spendy-project/" + ส่วน local dev / deploy / Google config |

**Verdict: ยังไม่ส่ง `qa`** — 4/5 AC ผ่าน, AC1 ขาดหลักฐาน failing PR (ขั้นตอนที่ AC เขียนไว้ชัด). ทางเลือกให้ PO: (a) Dev เปิด draft PR ที่ test พังโดยตั้งใจ 1 ครั้ง (≈ 15 นาที, ยืนยัน TC-138 แบบ PR trigger ไปด้วย) แล้ว QA ส่ง `qa` ทันที หรือ (b) PO ยอมรับหลักฐานเชิงโครงสร้าง (`needs:` chain) เป็นลายลักษณ์อักษร · Board: คง `progress` + note

### 8.4 OMX-048 — Post-deploy verification: QA verdict

| AC | ผล | หมายเหตุ |
|---|---|---|
| AC1 e2e suite บน Pages (`E2E_BASE_URL`) | ⛔ Not run | sandbox เข้า github.io ไม่ได้; CI e2e เขียวบน build เดียวกัน (local preview) ≠ บน Pages |
| AC2 Lighthouse mobile median ×3 (a11y ≥ 90, LCP บันทึก) | ⛔ Not run | มีแค่ LCP desktop ไม่ throttle 2,208 ms (§8.2) |
| AC3 HAR upload → OCR → save, allowlist, Tesseract cache รอบสอง | ◐ Partial | page-load: ไม่มี third-party, Tesseract จาก origin เดียว ✅ · flow upload → OCR → save และ cache รอบสอง **ยังไม่ได้ทำ** |
| AC4 PO ย้าย Accepted (pending deploy) → Done + tag `v0.1.0-uat` | — | รอ AC1–AC3 |

**Verdict: ไม่ผ่าน AC (ยังไม่ครบ) — ไม่ส่ง `qa`** · live smoke ผ่าน ไม่พบ defect บน Pages · สิ่งที่ต้องทำต่อ (ต้องใช้เครื่องที่เข้า github.io ได้ เช่นเครื่องของ orchestrator/ผู้ใช้ หรือ GitHub Actions job ที่รัน e2e/Lighthouse กับ URL live): `E2E_BASE_URL=https://jaijimjim.github.io/spendy-project/ npx playwright test --project=mobile --project=desktop` · `npx lighthouse <url> --preset=perf --form-factor=mobile` ×3 (+ a11y) · HAR ของ upload สลิปสังเคราะห์ → OCR → save แล้ว reload ดู cache · ข้อเสนอ: Dev เพิ่ม workflow `post-deploy.yml` (`workflow_run` หลัง Deploy) ให้รันทั้งสามอย่างบน runner ของ GitHub — ปิดข้อจำกัด proxy ถาวร

## 9. OMX-042 — Real-slip accuracy, n=16

> Owner: QA · 2026-11-23 · สลิปจริง 16 ใบของผู้ใช้ (UQ4 — ยินยอมให้ QA เก็บไว้ทดสอบ) · OCR = Tesseract.js `tha+eng` ตัวเดียวกับแอป + preprocess เหมือน `src/services/ocr/preprocess.ts` (≤ 2000 px, grayscale, contrast ×1.25 รอบ 128) รันใน Node · Parser = `parseSlip(text, '2026-11-23')` บน `main` @ `6ebe779` · fixture ที่ commit = **OCR text ที่ redact แล้ว** [`tests/fixtures/real-slips/redacted/`](../../tests/fixtures/real-slips/README.md) + `expected.json` (ชื่อสมมติ) · รูปจริง / OCR ดิบ / ground truth ชื่อจริง = git-ignored เท่านั้น · วัดซ้ำได้ด้วย `npx vitest run src/domain/slip/realSlips.test.ts` · ยืนยันแล้วว่า redaction **ไม่เปลี่ยนผล parser** (type/amount/date/time/category/bank/payee-found เท่ากันทั้ง 16 ใบ)

### 9.1 Per field vs MVP metrics

| Field | ผล (n = 16) | MVP metric | Status |
|---|---|---|---|
| Type | **16/16 (100%)** | ≥ 90% | ✅ (แต่ confidence Low 5/16 → BUG-015) |
| Amount | **13/16 (81.3%)** | ≥ 80% | ✅ **margin 1 ใบ** · ผิดแบบไม่ว่าง **2/16** (r04, r05 → BUG-011 High) · ว่าง 1/16 (r14 → BUG-012) |
| Date | 13/16 (81.3%) | report only | ❌ 3 ใบตกเป็นวันนี้ ("w.g." → BUG-013) |
| Time | 16/16 (100%) | report only | ✅ |
| Category (ทุกใบ เทียบหมวดที่เสนอ) | **2/16 (12.5%)** | ≥ 60% | ❌ |
| Category (เฉพาะใบที่หมวดชัดเจน) | **0/9 (0%)** | ≥ 60% | ❌ → BUG-010 / BUG-014 |
| Category (ใบที่รอผู้ใช้ยืนยัน) | 2/7 | — | รอคำตอบ §9.6 |
| Payee | **0/16 (0%)** | report only (OMX-009 AC6) | ❌ → BUG-009 (scope ขยาย) |

### 9.2 Per app

| App | n | Type | Amount | Date | Time | Payee | Category (all) | Category (clear) |
|---|---|---|---|---|---|---|---|---|
| make by KBank | 9 | 9 | **6** | **6** | 9 | 0 | 2 | 0/5 |
| K PLUS | 6 | 6 | 6 | 6 | 6 | 0 | 0 | 0/4 |
| Krungthai | 1 | 1 | 1 | 1 | 1 | 0 | 0 | — (pending) |

ข้อสังเกต: ปัญหา amount/date ทั้งหมดอยู่บน **make** (พื้นหลังการ์ตูนสีอ่อน → OCR junk + "พ.ย." เป็นละติน) · K PLUS อ่านยอด/วันที่ได้ครบ แต่ "จ่ายบิล" 4/4 กลายเป็น `bills`

### 9.3 Per slip

| Slip | App | หัวสลิป | Amount (ถูก → ได้) | Date | Time | Payee | Category (คาด → ได้) |
|---|---|---|---|---|---|---|---|
| r01 | make | โอนเงิน (PromptPay → บุคคล) | 184.00 ✅ | ✅ | ✅ | ❌ | transfer → other ❌ |
| r02 | K PLUS | โอนเงิน → บุคคล | 17.00 ✅ | ✅ | ✅ | ❌ | transfer → other ❌ |
| r03 | K PLUS | จ่ายบิล ร้านก๋วยเตี๋ยว | 60.00 ✅ | ✅ | ✅ | ❌ | food → bills ❌ |
| r04 | make | ชำระเงิน (ล้างแอร์) | 1,200.00 → **1.00** ❌ | ✅ | ✅ | ❌ | housing *(pending)* → other ❌ |
| r05 | make | เติมเงิน Rabbit | 200.00 → **1.00** ❌ | ✅ | ✅ | ❌ | transport → other ❌ |
| r06 | K PLUS | จ่ายบิล TrueMoney Shop | 50.00 ✅ | ✅ | ✅ | ❌ | food *(pending)* → bills ❌ |
| r07 | make | ชำระเงิน QR ร้านชื่อบุคคล | 140.00 ✅ | ✅ | ✅ | ❌ | other *(pending)* → other ✅ |
| r08 | make | โอนเงิน → บัญชีตัวเอง | 1,500.00 ✅ | ❌ today | ✅ | ❌ | transfer → other ❌ |
| r09 | K PLUS | จ่ายบิล SCB มณี SHOP | 225.00 ✅ | ✅ | ✅ | ❌ | other *(pending)* → bills ❌ |
| r10 | K PLUS | จ่ายบิล บริจาควัด | 30.00 ✅ | ✅ | ✅ | ❌ | other → bills ❌ |
| r11 | make | ชำระเงิน Siam Paragon online | 30.00 ✅ | ✅ | ✅ | ❌ | shopping *(pending)* → shopping ✅ |
| r12 | make | ชำระเงิน ร้านเสื้อผ้า (memo ค่ากางเกง) | 300.00 ✅ | ✅ | ✅ | ❌ | shopping → other ❌ |
| r13 | Krungthai | เติมเงิน G-Wallet | 100.00 ✅ | ✅ | ✅ | ❌ | transfer *(pending)* → other ❌ |
| r14 | make | โอนเงิน → วิสาหกิจชุมชน | 321.00 → ∅ ❌ | ❌ today | ✅ | ❌ | entertainment *(pending)* → other ❌ |
| r15 | make | ชำระเงิน ร้านลูกชิ้นปลา | 85.00 ✅ | ❌ today | ✅ | ❌ | food → other ❌ |
| r16 | K PLUS | เติมเงิน Rabbit | 200.00 ✅ | ✅ | ✅ | ❌ | transport → other ❌ |

### 9.4 OMX-042 AC status

| AC | ผล | หมายเหตุ |
|---|---|---|
| AC1 ≥ 11 redacted real slips, เก็บแบบ private, report ต่อธนาคาร/รูปแบบไม่มีข้อมูลส่วนตัว | ◐ **Partial** | n = 16 ✅ · รูป/OCR ดิบไม่เข้า git ✅ · report ไม่มีชื่อจริง ✅ · **bank mix ไม่ครบ**: ไม่มี SCB EASY, PromptPay app อื่น, สลิปเงินเดือน 3 แบบ, รายรับ; Krungthai มี 1 ใบ (AC ขอ ≥ 2) → ต้องขอสลิปเพิ่มหรือ PO ยอมรับ scope |
| AC2 เทียบ MVP metrics + log gap พร้อมข้อเสนอ rule/fixture | ◐ | gap ทั้งหมด log เป็น BUG-011 … 015 + scope update BUG-009/010 พร้อม suggestion (§9.5) · การเปิด FB item / ticket = PO (§9.6) |
| AC3 OCR text ของทุกใบที่ fail (redacted) เป็น Layer A fixture | ✅ | `tests/fixtures/real-slips/redacted/r01–r16.txt` + `realSlips.test.ts` (report + ratchet) รันใน CI ทุกครั้ง · เมื่อ Dev แก้แต่ละ bug ให้ย้ายใบนั้นเข้า `qaGolden.ts` เป็น `real-redacted-rNN` |
| AC4 UAT correction rate (นับบนเครื่องผู้เข้าร่วม) | ⛔ Not started | UAT ยังไม่เริ่ม (NOT READY) |

**Ratchet baseline** (`realSlips.test.ts` → `BASELINE`): type 16 · amount 13 · amountWrong ≤ 2 · date 13 · time 16 · payee 0 · category 2 · categoryClear 0 — CI แดงเฉพาะเมื่อแย่ลง · **Dev ต้องยก `BASELINE` ใน PR ที่แก้** (OMX-049 → payee; 050a/b → category; BUG-011/013 → amount/date)

### 9.5 Gap analysis → bugs

| Gap | Slips | Bug (severity) | แก้ใน |
|---|---|---|---|
| Payee ว่างทุกใบ ทุกแอป รวมร้านค้า/biller | 16/16 | BUG-009 scope ขยาย (High) | OMX-049 (ต้องขยายให้ครอบคลุม make + Krungthai + merchant สองบรรทัด) |
| "จ่ายบิล" ชนะชื่อร้าน; คำอาหารไทย (ก๋วยเตี๋ยว, ลูกชิ้นปลา) | r03, r10, r15 (+r06, r09 pending) | BUG-010 (High) | OMX-050a |
| ยอดผิดแบบไม่ว่าง (junk หลัง label, "บาท"→`vn`/แยกบรรทัด) | r04, r05 | **BUG-011 (High)** | ticket ใหม่ (เสนอ) |
| ยอดแตกหลายบรรทัด → ว่าง | r14 | BUG-012 (Low) | known limitation / spike |
| "พ.ย." → `w.g.` → วันนี้ | r08, r14, r15 | **BUG-013 (Medium)** | ticket ใหม่ หรือรวมกับ BUG-011 เป็น "make OCR robustness" |
| Rabbit → transport, โอนบุคคล/บัญชีตัวเอง, memo เสื้อผ้า | r05, r16, r01, r02, r08, r12 | BUG-014 (Medium) | r01/r02/r08 หายเมื่อ 049 เสร็จ · Rabbit/memo = ticket ใหม่หรือเพิ่ม AC ใน 050a/050b |
| memo make, disclaimer เป็น memo, bank null, type confidence Low | r04, r08, r10, r12, r13, r14 … | BUG-015 (Low) | backlog |

**Projection (QA estimate, ไม่ใช่ผลวัด):** ถ้า OMX-049 + 050a ทำได้ตาม AC → category ใบชัดเจนคาดว่าได้ ~5/9 (r01, r02, r03, r10, r15) = **56% ยังต่ำกว่า 60%** · ต้องมี Rabbit keyword (BUG-014) เพิ่มอีก 2 ใบ → ~7/9 (78%) · amount จะเหลือ margin ติดลบถ้าเจอสลิป make แบบ r04/r05 เพิ่ม → BUG-011 ควรอยู่ใน Sprint 2

### 9.6 ข้อเสนอต่อ PO — ticket และคำถามถึงผู้ใช้

**Ticket (PO ตัดสิน — QA ไม่ได้ `add` บน board):**
1. **BUG-011 (High)** → เสนอ OMX ใหม่ "Amount robustness on make slips" (≈ 2 pts) ใน Sprint 2 — ยอดผิดแบบเงียบกระทบความเชื่อถือมากที่สุด · รวม BUG-013 (date `w.g.`) ได้ถ้าต้องการ ticket เดียว (≈ 3 pts)
2. **BUG-009 scope** → เพิ่ม AC ใน OMX-049: ครอบคลุม make + Krungthai + merchant/biller สองบรรทัด, AC8 วัดบน `realSlips.test.ts` (16 ใบ) แทน/นอกเหนือจาก 3 ใบ FB-011 · ⚠️ Dev re-estimate trigger (planning §6.2): layout หลายแอป → 049 อาจเป็น 5
3. **BUG-014** → Rabbit/BTS keyword เพิ่มเป็น AC ใน OMX-050b (fuzzy keyword) หรือ ticket Could ใหม่ · memo "ค่า…" รอ BUG-015
4. **BUG-012, BUG-015** → backlog (Low)
5. OMX-042 AC1 bank mix: ขอผู้ใช้/ทีมเพิ่ม SCB EASY ≥ 2, Krungthai +1, สลิปเงินเดือน, สลิปรับเงิน — หรือ PO ยอมรับ scope "3 แอปที่ผู้ใช้ใช้จริง"

**คำถามยืนยันหมวดถึงผู้ใช้ (ผ่าน PO)** — ใบที่ QA ไม่เดา:
| Slip | รายการ | หมวดที่เสนอ | คำถาม |
|---|---|---|---|
| r04 | ฮิปโป เซอร์วิส เซ็นเตอร์ · memo "ล้างแอร์" · 1,200 | `housing` | ค่าล้างแอร์ให้นับเป็น "ที่อยู่อาศัย" ใช่ไหม |
| r06 | TrueMoney Shop (นัวสะเด็ด) · 50 | `food` | "นัวสะเด็ด" เป็นร้านอาหารใช่ไหม |
| r07 | TTB(ร้านชื่อบุคคล) QR · 140 | `other` | ซื้ออะไร (อาหาร/ของใช้/อื่น ๆ) |
| r09 | SCB มณี SHOP (โจนมุมตึก) · 225 | `other` | ร้านประเภทไหน |
| r11 | KSHER_SIAM PARAGON ONLINE · 30 | `shopping` | ใช่การช้อปปิ้งไหม (หรือค่าที่จอดรถ/อาหาร) |
| r13 | เติมเงิน G-Wallet (เป๋าตัง) · 100 | `transfer` | เติมเป๋าตังให้นับเป็น "โอน" หรือหมวดอื่น |
| r14 | วิสาหกิจชุมชนท่องเที่ยว · memo "โกรกอีดก" · 321 | `entertainment` | เป็นค่าเที่ยว/กิจกรรมใช่ไหม |
| r10 | บริจาควัด (ถุงเงิน เติมบุญ) · 30 | `other` | โอเคกับ "อื่น ๆ" หรืออยากได้หมวด "บริจาค" (ลดหย่อนภาษี) — ถ้าอยากได้ = story ใหม่ |

## 10. OMX-051 — Payee baseline (Layer A / Layer B) ก่อน OMX-049

> Dev (pair กับ QA) · 2026-11-23 · `main` @ `f822880` (ก่อนแก้ parser ใด ๆ ของ Sprint 2) · test-infra เท่านั้น

| ชุด | วิธีวัด | Payee baseline | หมายเหตุ |
|---|---|---|---|
| Layer A (`qaGolden.ts`) | `expected.payee?` (ใหม่) เทียบหลัง `normalizePayee()` ใน `qaGolden.test.ts` — fixture ที่ไม่ระบุ payee ไม่ถูกวัด | **10/10** fixture ที่ระบุ payee | ใส่ payee เฉพาะ fixture ที่ ground truth ชัด (rec-b01–b04, b10, b11, qa-transfer-memo, qa-grab-ride, qa-company, qa-month-end) · type/amount/date/category คงเดิม 35/35 |
| Layer B 27 ใบ (`tests/fixtures/slips/expected.json`) | `expected.payee` ครบ 27 ใบ (expense = ชื่อผู้รับ, income รับโอน = ผู้โอน, เงินเดือน = นายจ้าง; ชื่อสมมติ) · re-parse OCR text ที่บันทึกใน `benchmark-results.json` → `src/domain/slip/layerBRecorded.test.ts` (CI ทุก PR) · benchmark real-OCR รายงาน `summary.payee` (exact % + mean CER) **report only** | **17/27 (63.0%) · mean CER 0.322** | ✗: bill 3 + 1 degraded (b05, b06, b16, d22 — payee ว่าง), received 3 + 1 (b07, b15, d23 ได้ชื่อเจ้าของบัญชี; b08 OCR prefix "นแนายข"), b09 OCR "แมนชั้น", b12 OCR "แนาขกถก" |

**ใช้ใน OMX-049 AC7:** `BASELINE_PAYEE = 17` ใน `layerBRecorded.test.ts` (ratchet) — 049 ต้องไม่ต่ำกว่านี้ · `layerBRecorded.test.ts` ยัง gate type/category/date 100% + amount ≥ 26/27 บน OCR text ที่บันทึกไว้ (regression guard ที่รันใน CI โดยไม่ต้องใช้ browser) · AC4: ผล type/amount/date/category ของ Layer A/B ไม่เปลี่ยน
