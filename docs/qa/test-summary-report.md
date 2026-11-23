# Test Summary Report — Omnitrix Money MVP_0001 (Sprint 1)

> Owner: QA · 2026-11-13 (Sprint 1 Day 4) · **Final — re-test after Dev fixes `a1249eb..8c779d0`** · Build: local `main` (ไม่ได้ push — B1) served by `vite preview`, Chromium 1243, TZ Asia/Bangkok
> อ้างอิง: [`test-plan.md`](test-plan.md) · [`test-cases.md`](test-cases.md) · [`bug-report.md`](bug-report.md) · UAT criteria: [`grooming/sprint-1-qa.md` §5](../agile/grooming/sprint-1-qa.md)

> **อัปเดต 2026-11-23 (Sprint 2 Day 0):** re-run 12 TC ที่ Blocked → ดู [§7](#7-sprint-2-day-0--blocked-re-run-2026-11-23) — ตัวเลขล่าสุด **Pass 120 / Fail 2 / Blocked 9 / Not run 1**; recommendation เปลี่ยนเป็น **NOT READY for UAT** (BUG-009/010 High + B3). §1–§6 ด้านล่างคงไว้เป็นผล Sprint 1 (2026-11-13)

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
