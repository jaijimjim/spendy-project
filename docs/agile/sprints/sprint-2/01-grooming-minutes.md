# Sprint 2 — Backlog Grooming Minutes

> Date: 2026-11-23 (Day 0) · Timebox: 60 นาที · Facilitator & note-taker: PO/PM
> Inputs: `00-grooming-agenda.md`, `docs/agile/grooming/sprint-2-design.md`, `sprint-2-dev.md`, `sprint-2-qa.md`, `docs/qa/test-summary-report.md` §7, `01-product-backlog.md` (v4), `feedback-log.md` (FB-011, FB-012)
> Output: `01-product-backlog.md` **v5** (estimate สุดท้าย, split OMX-050 → 050a/050b, enabler OMX-051, AC ที่เปลี่ยน, §9) · `HANDOFF.md` อัปเดต · **ยังไม่ใช่ Sprint Planning** — Planning รอคำตอบ UQ1–UQ3 จากผู้ใช้

## 1. Attendees

| Role | Present | Input |
|---|---|---|
| PO/PM (facilitator) | ✔ | agenda, backlog v4, status B2/B3 |
| Designer | ✔ | `grooming/sprint-2-design.md` (D1–D4, §6.1 answers, copy keys, a11y A1–A8) |
| Dev | ✔ | `grooming/sprint-2-dev.md` (root cause, spike S1–S4, approach, estimates) |
| QA | ✔ | `grooming/sprint-2-qa.md` (test approach, redaction guideline, regression gate) + test summary §7 |

## 2. Agenda
1. Context: สถานะ deploy (B3), ผล QA re-run, proposed Sprint Goal + capacity
2. OMX-049 re-estimate (Dev 3 vs QA 5) และ benchmark gap ของ payee
3. OMX-050 split 050a/050b + joint dependency กับ 049
4. Designer proposals D1–D4
5. Candidates อื่นใน §9, คำตอบคำถามจาก Dev/QA/Designer
6. DoR check, risks, action items, open questions ถึงผู้ใช้

## 3. Context (สรุป)
- `main` = `03cd465` (handoff หลัง Sprint 1) ต่อจาก `e17c62e` · **CI ทุก job เขียวบน GitHub** (run `43827185503`: gitleaks, lint/typecheck/unit, build ×2, e2e) → **B1 ปิด**
- **B3:** `deploy.yml` ล้มที่ `actions/configure-pages@v5` ("Get Pages site failed … Not Found") เพราะ repo เป็น **private** และยังไม่เปิด Pages → live URL 404 (FB-012). เป็น config ฝั่ง repo owner ไม่ใช่ product defect
- **QA re-run (2026-11-23):** Pass **120** / Fail **2** (TC-163 Layer C interim n = 3, BUG-007) / Blocked **9** (TC-137 B3, TC-139, TC-135, TC-008, TC-141, TC-118 partial, TC-015/016/017 B2) / Not run 1 · Lighthouse **local interim**: LCP median **755 ms**, a11y **100** (ยังต้องวัดบน Pages) · Defects open: BUG-009 High, BUG-010 High, BUG-007 Low · Observation O6 (zod eval probe vs CSP — ไม่กระทบการทำงาน, ไม่เข้า Sprint 2) · **Recommendation: NOT READY for UAT**
- **ข้อเท็จจริงที่แก้ในเอกสาร:** HANDOFF เดิมเขียนว่า "repo เป็น public" — **ปัจจุบัน repo เป็น private**. กฎ **ห้าม commit รูปสลิปจริง** ยังใช้เสมอ (ไม่ขึ้นกับ visibility และ repo อาจต้องเปลี่ยนเป็น public เพื่อเปิด Pages — UQ2)

## 4. Decisions

### 4.1 OMX-049 — re-estimate (planning poker)

| Round | PO | Designer | Dev | QA | หมายเหตุ |
|---|---|---|---|---|---|
| 1 (scope v4 + payee measurement) | 3 | 3 | **3** | **5** | ต่างกัน 1 ระดับ Fibonacci → อภิปราย |

**ประเด็นที่อภิปราย:** Dev พบว่า Layer B `tests/fixtures/slips/expected.json` และ `QaFixture.expected` **ยังไม่มี field payee** → OMX-049 AC7 ("payee ไม่แย่กว่า baseline") วัดไม่ได้ Dev นับงานนี้ ~0.5 pt ใน 049 ส่วน QA นับเป็นงาน schema + benchmark + baseline ที่ยังไม่เคยมี (เหตุผลหลักของเลข 5)

**Decision — แยกเป็น enabler item `OMX-051` (2 pts, QA owner, Dev pairs)** แทนที่จะเป็น task ใน 049 เพราะ:
1. **Fixture-first (retro AI-2, DoR #6):** baseline payee ต้องมี **ก่อน** Dev เริ่มแก้ parser — แยก item ทำให้เริ่ม Day 1 ได้ทันทีโดยไม่ต้องรอ UQ1
2. **ใช้ซ้ำ:** OMX-009 AC6, OMX-042 (Layer C report), OMX-039 ต่างใช้ payee metric เดียวกัน
3. **Traceability:** ถ้า 049 ล่าช้าเพราะ fixture จริง (UQ1) งานวัดผลยังปิดและนับ velocity ได้
4. ขนาดรวม (049 + 051 = 5) สอดคล้องกับมุมมอง QA เรื่อง effort ทั้งหมด

| Round | PO | Designer | Dev | QA | Scope |
|---|---|---|---|---|---|
| 2 — OMX-049 | 3 | 3 | 3 | 3 | parser fallback + D1 (§4.3) + Layer B arrow template 2 ใบ; ไม่รวม payee measurement |
| 2 — OMX-051 | 2 | 2 | 2 | 2 | `QaFixture.payee` + `expected.json` 27 ใบ + benchmark report + baseline |

**Final: OMX-049 = 3 · OMX-051 = 2** · Dev ระบุ trigger ให้ re-estimate เป็น 5: ถ้า fixture จริง (UQ1-A) แสดงว่า layout "make by KBank" กับ K PLUS ต่างกันมาก หรือ OCR ตัดชื่อเป็นหลายบรรทัด → แจ้ง PO ทันที (ไม่ขยายเงียบ)

**Scope ของ fallback:** ใช้กับทุกธนาคารที่มี masked-account anchor แต่ **เฉพาะ type = expense** (Dev R2 — สลิปรับเงิน ชื่อใต้ลูกศรคือเรา) · label rule เดิมรันก่อนเสมอ · ถ้า Layer A ธนาคารอื่นพัง → จำกัดเฉพาะ KBank/K PLUS

### 4.2 OMX-050 — split + dependency

- **Accepted split ตามข้อเสนอ Dev:**
  - **OMX-050a (3)** — precedence: merchant/biller > transaction-type phrase (weak tier `TX_PHRASES`, ลบ "จ่ายบิล" ออกจาก `bills.keywords`) + keyword อาหารไทย + D2 (§4.3)
  - **OMX-050b (2)** — fuzzy matcher (confusable-char folding) สำหรับ Lazada/Shopee + fuzzy `TRANSFER_STRONG` ("ชําระเจิน")
  - Planning poker: 050a = 3/3/3/3, 050b = 2/2/2/2 (เอกฉันท์) · รวม 5 เท่าเดิม
- **Joint dependency (spike Dev S2/S4):** แก้ 049 อย่างเดียวสลิปไก่ย่างยังเป็น `bills` และ "ไก่ย่าง" ไม่มีใน rules → **049 + 050a ต้องทำคู่กัน** · PO decision: 049, 050a, 050b เป็น **bundle เดียว** — commit พร้อมกัน, ห้ามตัดตัวใดตัวหนึ่งตอน scope cut, real-slip acceptance (Layer C) วัดรวมกัน · Layer A AC ของ 050a ยังต้องผ่านแม้ payee ว่าง (test แยกได้)
- **ลำดับทำ:** 051 → 049 → 050a → 050b (051 ขนานได้ตั้งแต่ Day 1; 050a เริ่มขนานได้ถ้ามีคนที่สอง)
- **§4 rule ยืนยันแล้ว (Dev Q2 ถึง PO):** transaction-type phrase = weak tier; "จ่ายบิล" เดี่ยว = `bills` **Medium**; precedence payee → payeeExtra → memo → person → text (strong) → weak → `other`. Test เดิมที่ assert High จาก "จ่ายบิล" อย่างเดียว เปลี่ยนเป็น Medium = **expected change** (QA ยอมรับ)
- **Fuzzy approach:** folding (Dev option A) เฉพาะใน keyword matcher, **ไม่ใส่ใน `normalizeText()`** (กัน payee/rawText เพี้ยนและกระทบ duplicate detection) · ตาราง fold รอบแรก **ไม่รวม `ด↔ต`** · edit distance ไม่ทำใน Sprint 2 · fuzzy เฉพาะ keyword flag `fuzzy: true` ยาว ≥ 5 หลัง fold
- **Keyword อาหารไทยที่ PO/QA ยอมรับ:** `ไก่ย่าง`, `ไก่ทอด`, `หมูปิ้ง`, `ข้าวมันไก่`, `ข้าวขาหมู`, `ก๋วยจั๊บ`, `ราดหน้า`, `ผัดไทย`, `ร้านข้าว`, `ShopeeFood` · **ไม่เพิ่ม "ครัว"** (Dev R5 — ชนชื่อบริษัท/ที่อยู่ ไม่มี fixture รองรับ)
- **Negative fixtures สำหรับ fuzzy:** ≥ 20 (ชื่อคนสมมติ 8, merchant อื่น 8, คำไทยที่ fold แล้วใกล้ "ลาซาดา/ช้อปปี้" 4) + text ของ 27 Layer B → 0 false positive (050b AC3)

### 4.3 Designer proposals

| # | Proposal | Decision | Applied in |
|---|---|---|---|
| **D1** | Payee empty state: helper `review.noPayee` (info, ไม่ใช่ warning) + placeholder `form.payeePlaceholder` + collapsed card แสดงบรรทัด payee / "ไม่ระบุผู้รับ" (`transactions.noPayee`) | **Accepted → AC ของ OMX-049** (AC6) — เป็น UI ของ 049 AC4 (payee ว่าง ไม่เดา) · payee ยัง **optional** ไม่ block Save · **ไม่ลด** overall confidence badge · ใช้กับ expense เท่านั้น (ไม่ใช่ salary/income) | OMX-049 AC6 |
| **D2** | Category Medium (`field === 'text'`) = highlight ที่ field + นับเป็น "ต้องตรวจ" สำหรับ auto-expand + `CategoryPicker` รับ `warning` และผูก **`aria-describedby`** | **Accepted → AC ของ OMX-050a** (AC6) · a11y fix (WCAG 1.3.1/3.3.1) อยู่ใน AC นี้ **ไม่เปิด BUG แยก** (ทำพร้อม D2 ใน PR เดียว) · ไม่มี copy ใหม่ (`review.checkField`) | OMX-050a AC6 |
| D3 | Quick chip หมวดอันดับ 2 | **Deferred** → parked idea · ต้องเปลี่ยน `categorize()` ให้คืน alternative (~2 pts) และคุณค่าลดลงถ้า 050a/b ถูก → ประเมินใหม่หลังผล OMX-042 (ทำคู่กับ amount alternative chips) | Backlog parked ideas |
| D4 | จดจำ merchant → category | **Deferred** — = OMX-035 (Won't) ต้องมี storage schema + Settings + privacy copy และขึ้นกับ 049 → คง Won't ใน Sprint 2, พิจารณา revive เป็น Sprint 3 candidate หลังผล 049/042 | OMX-035 note |
| Q1 | Badge Medium สำหรับ payee จาก arrow | **ไม่ต้อง** (ตาม Designer) — payee แสดงเป็นค่าปกติ, `payeeSource` เก็บไว้ใน draft สำหรับวิเคราะห์เท่านั้น | — |
| Q2 | Hint "จัดหมวดจากชื่อร้าน" | **ไม่ใน Sprint 2** → parked (ทำคู่ OMX-035 ถ้า revive) | Parked ideas |
| Q3 | ชื่อ OCR เพี้ยน แสดงอย่างไร | **แสดงตามที่อ่านได้** ไม่ normalize; normalize ใช้ภายใน categorizer เท่านั้น · search ชื่อหมวด = parked | OMX-049 AC3 |
| — | แก้ spec ขัดกันใน `design/screens.md` (payee ใน collapsed card) | **Accepted** — Designer อัปเดตพร้อม spec D1 | Action G4 |

### 4.4 Other items in §9

| ID | Decision | Final pts |
|---|---|---|
| OMX-028 | Remaining ≈ 1 · Dev: **ไม่ต้องแก้ workflow** รอ B3 เท่านั้น · task ใน 028 (ไม่เพิ่ม pts): step ตรวจ Pages พร้อม error อ่านง่าย · ถ้าต้อง public: gitleaks full history + ยืนยันไม่มีรูปสลิปจริงใน history ก่อนเปลี่ยน · Node 20 → 24 actions = **tech debt (parked)**, PR แยกหลัง deploy แรกเขียว | 1 |
| OMX-048 | ลำดับ smoke → real-OCR บน Pages → Lighthouse → HAR · `E2E_BASE_URL` รองรับแล้ว | 2 |
| OMX-042 | 3 สลิป FB-011 นับเป็น Layer C ชุดแรก · Dev ช่วย script local-only (ผลเป็นตัวเลขเท่านั้น) | 3 |
| OMX-043 | QA, Designer ร่วม review screen reader ของ Review card (payee ว่าง + category Medium) | 3 |
| OMX-003a/b | Remaining ≈ 2 · ทดสอบบน `localhost:4173` ได้ทันทีเมื่อได้ Client ID ไม่ต้องรอ B3 | 2 |
| OMX-041 | Dev ทำกับ stub wrapper (mode "fail N ครั้งแล้วสำเร็จ") ก่อน B2 ปิดได้ · Designer ส่ง state table + copy (`queue.status.downloadFailed`, `queue.failedReason.network/auth`, `googlePhotos.reauthorizing`, `downloadFailedCount_*`, `review.retryItem`) Day 1 · ไม่ต้อง mockup ใหม่ | 2 |
| OMX-029 | Remaining ≈ 2 (AC1, AC3, AC5) · local LCP 755 ms เป็น interim เท่านั้น | 2 |
| OMX-044 | Conditional — ทำเฉพาะเมื่อ 029 AC5 fail · ไม่นับใน commit | 3 |
| OMX-040 | Keep | 2 |
| OMX-045 | **PO decision: option A** (date = today ถ้าวันนี้อยู่ใน pay period; ไม่ยกเว้น R3) — ตามคำแนะนำ Dev · status → Ready | 1 |
| OMX-046 | Copy พร้อม: < 360px ใช้ `transactions.searchPlaceholderShort` ("ค้นหา…"/"Search…") + hint เต็มแบบ visually-hidden | 1 |
| OMX-039 | **Deferred → Sprint 3** — Designer spec (M) ยังไม่มี, ต้องการ 049 + `fold()` จาก 050b ก่อน | 3 |
| OMX-047 | **Deferred → Sprint 3** — auto theme ใช้ได้แล้ว ไม่ช่วย Sprint Goal (Designer Q5) | 2 |
| AI-8 | CONTRIBUTING (Playwright Chromium path, proxy) ยังไม่เสร็จ → Dev Day 1 (non-story) | — |

### 4.5 Answers to role questions (สรุป)
- **Dev → PO:** Q1 split ✔ · Q2 §4 rule ✔ · Q3 fallback ทุกธนาคาร (expense + anchor) ✔ · Q4 hardening = task ใน 028 / Node 24 = tech debt · Q5 OMX-045 option A ✔
- **QA → team:** Layer C threshold **target 3/3, ขั้นต่ำ 2/3** ต่อ field; ต่ำกว่านั้น PO ตัดสินตาม UAT exit #3 ไม่ block merge อัตโนมัติ · regression gate: Layer A 100%, 27 Layer B ทุก field ไม่ลด (amount 26/27, b16 = BUG-007), e2e เขียว · Layer B template ใหม่: arrow layout 2 ใบ (049), restaurant bill 1 ใบ (050a), marketplace e-wallet 1 ใบ (050b) — ชื่อ/ธนาคารสมมติ · ใครเพิ่ม payee ใน `expected.json` → **QA ใน OMX-051**
- **Designer → PO:** D1/D2 รวมใน 049/050a ✔ · D3/D4 ไม่อยู่ใน Sprint 2 ✔ · payee optional ✔ · OMX-047 ไม่เข้า ✔ · screens.md แก้หลัง grooming ✔
- **UAT entry:** BUG-009/010 (High) **ต้องปิดก่อน UAT start** (UAT entry #4) — ไม่ยอมรับเป็น known issue เพราะกระทบคุณค่าหลัก (dashboard หมวดหมู่) บนธนาคารที่ persona P1 ใช้

## 5. AC Changes (backlog v5)

| Story | What changed |
|---|---|
| OMX-049 | Final 3 pts · scope expense-only + anchor · AC3 payee แสดงตาม OCR + `payeeExtra` · AC5 อ้าง Layer B b01/b08/b12/d15 · **AC6 ใหม่ = D1** · AC7 อิง baseline จาก OMX-051 + Layer B arrow template 2 ใบ · AC8 Layer C target 3/3 / ขั้นต่ำ 2/3 · AC9 privacy (`git diff --stat` ไม่มีรูป) |
| OMX-050 → **050a** | precedence + weak tier `TX_PHRASES` + keyword อาหารไทย · AC3 expected change ของ confidence · AC5 type ไม่เปลี่ยน · **AC6 ใหม่ = D2 + `aria-describedby`** · AC7 regression รายสลิป (b05, b06, b09, b16, b17, b18) |
| OMX-050 → **050b** | folding approach, ตาราง fold รอบแรก, ≥ 20 negatives = 0 FP, fuzzy `TRANSFER_STRONG` คืน High confidence |
| **OMX-051** (ใหม่) | enabler payee measurement — Layer A schema, Layer B expected, benchmark report-only, baseline |
| §4 Category note | v4 proposed → **v5 confirmed** + fuzzy rule |
| OMX-028 | note v5: remaining ≈ 1, hardening task, public-repo checklist |
| OMX-045 | option A decided → Ready |
| OMX-039 / OMX-047 | deferred → S3 candidate |
| OMX-035 | note: = D4, คง Won't |
| Parked ideas | + D3, hint "จัดหมวดจาก…", search ชื่อหมวด, Node 24 actions tech debt |

## 6. Final Estimates & Proposed Commit (input สำหรับ Planning)

| Rank | ID | Priority | Final pts (remaining) |
|---|---|---|---|
| 1 | OMX-028 | Must | 1 |
| 2 | OMX-048 | Must | 2 |
| 3 | OMX-051 | Must (enabler) | 2 |
| 4 | OMX-049 | Must (High) | 3 |
| 5 | OMX-050a | Must (High) | 3 |
| 6 | OMX-050b | Must (High) | 2 |
| 7 | OMX-042 | Must | 3 |
| 8 | OMX-043 | Must | 3 |
| 9 | OMX-003a/b | Must | 2 |
| 10 | OMX-041 | Must | 2 |
| 11 | OMX-029 | Should | 2 |
| 12 | OMX-040 | Could | 2 |
| 13 | OMX-045 | Could | 1 |
| 14 | OMX-046 | Could | 1 |
| — | OMX-044 | Should (conditional) | 3 — ไม่นับ |
| — | Buffer: UAT, triage, hotfix | — | ~10 |

**Proposed commit = 29 pts** (Must 23 + Should 2 + Could 4) + buffer ~10 ≈ 39 ≤ velocity ~40 (retro AI-3) · AI-assisted throughput ติดตามแยก
**Cut order:** 046 → 045 → 040 → 029 → 041 · ห้ามตัด 049/050a/050b แยกกัน
**ถ้า B3 ไม่ปิดภายใน Day 2:** 028/048/043/029 (8 pts) ทำไม่ได้ → ทำ bundle parser + 041 + 040 ก่อน และ PO ทบทวน Sprint Goal กับทีม (charter §8)

## 7. DoR Check

| ID | #1 Story | #2 AC G/W/T | #3 Priority + deps | #4 UI/copy | #5 Estimated ≤ 8 | #6 No blocking OQ / fixtures | #7 Env access | **Ready?** |
|---|---|---|---|---|---|---|---|---|
| OMX-051 | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✓ (synthetic เท่านั้น) | ✓ | **✓ Ready** |
| OMX-049 | ✓ | ✓ | ✓ | ✗ → spec D1 Day 1 (G1) | ✓ (3) | ✗ fixtures (UQ1; fallback B Day 2) | ✓ | **✗** |
| OMX-050a | ✓ | ✓ | ✓ | ✓ (ไม่มี copy ใหม่) | ✓ (3) | ✗ fixtures (UQ1) | ✓ | **✗** |
| OMX-050b | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✗ variant + negative list (QA Day 1) | ✓ | **✗** |
| OMX-028 | ✓ | ✓ | ✓ | n/a | ✓ (1) | ✓ | ✗ **B3** | **✗** |
| OMX-048 | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✓ | ✗ (028/B3) | **✗** |
| OMX-042 | ✓ | ✓ | ✓ | n/a | ✓ (3) | ✗ slips ≥ 11 (UQ4) | ✓ | **✗** |
| OMX-043 | ✓ | ✓ | ✓ | n/a | ✓ (3) | ✓ | ✗ (B3 + devices) | **✗** |
| OMX-003a/b | ✓ | ✓ | ✓ | ✓ | ✓ (2) | ✓ | ✗ **B2** | **✗** |
| OMX-041 | ✓ | ✓ | ✓ | ✗ → state table Day 1 (G2) | ✓ (2) | ✓ (stub) | ✓ (stub) | **✗ (Day 1)** |
| OMX-029 | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✓ | ✗ B3 | **✗** |
| OMX-040 | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✓ | ✓ | **✓ Ready** |
| OMX-045 | ✓ | ✓ (option A) | ✓ | ✓ (hint 1 key) | ✓ (1) | ✓ | ✓ | **✓ Ready** |
| OMX-046 | ✓ | ✓ | ✓ | ✓ (copy พร้อม) | ✓ (1) | ✓ | ✓ | **✓ Ready** |

สรุป: Ready ตอนนี้ 4 items (051, 040, 045, 046 = 6 pts) · ที่เหลือมี owner + วันที่ชัดเจน (DoR #7 อนุญาตเมื่อมี owner + date + stub) — Planning ดึงเข้าได้แบบ conditional

## 8. Risks

| # | Risk | L / I | Mitigation | Owner |
|---|---|---|---|---|
| K1 | **B3 ไม่ปิด** (ผู้ใช้ไม่เปลี่ยน repo เป็น public/ไม่อัปเกรด plan) → 92 pts ไม่เป็น Done, UAT เริ่มไม่ได้ | M / H | UQ2 Day 1; escalate ถ้าเกิน 1 วัน (retro "Stop letting blockers age"); fallback order §6 | PO |
| K2 | ไม่ได้ OCR text จริงแบบ redact (UQ1) → fixture synthetic ไม่ตรง layout จริง, Layer C อาจยังไม่ผ่าน | M / M | QA fallback B Day 2 จาก seed S1–S4; Layer C re-test โดยผู้ใช้เป็นตัวยืนยันสุดท้าย | QA / PO |
| K3 | Arrow fallback หยิบชื่อผู้โอน/ธนาคาร/ขยะ QR บนธนาคารอื่น | M / H | expense-only + anchor + sender guard + junk filter; negative fixtures; จำกัด KBank ถ้าพัง | Dev / QA |
| K4 | Fuzzy folding ทำ false positive | M / M | flag + ≥ 5 ตัว + ไม่ fold `ด↔ต`; ≥ 20 negatives = 0 FP | Dev / QA |
| K5 | ข้อมูลส่วนตัวหลุดเข้า repo ตอนทำ fixture จากสลิปจริง (สำคัญขึ้นถ้า repo เปลี่ยนเป็น public) | L / H | redaction checklist QA §2, `git diff --stat` check, gitleaks, ไม่ส่งรูปเข้า sandbox/agent/chat | QA / ทุกคน |
| K6 | B2 ไม่ปิดภายใน Day 2 → 003a/b ไม่ Done, TC-015/016/017 Blocked | M / M | ทดสอบบน localhost:4173 ได้เลยเมื่อได้ Client ID; ไม่ได้ → PO บันทึกการตัดสินใจ UAT แบบ "Not configured" (AI-6) | PO |
| K7 | Layer C n = 3 เล็กเกินจะสรุป accuracy | H / M | OMX-042 ขอ ≥ 11 สลิป (UQ4); ใช้ 3 ใบเป็น signal/regression เท่านั้น | PO / QA |
| K8 | Estimate 049 โตเป็น 5 ถ้า layout สองแบบต่างกันมาก | L / M | trigger re-estimate ชัดเจน (§4.1); buffer รองรับ | Dev → PO |

## 9. Action Items

| # | Action | Owner | Due |
|---|---|---|---|
| G1 | Spec D1 (payee states empty/filled/touched + collapsed line) + เพิ่ม `review.noPayee` ใน `design/copy-deck.json` | Designer | Day 1 |
| G2 | OMX-041 state table + copy keys | Designer | Day 1 |
| G3 | OMX-046 copy key `transactions.searchPlaceholderShort` ใน copy deck | Designer | Day 1 |
| G4 | แก้ spec ขัดกันใน `design/screens.md` (payee ใน collapsed card) | Designer | Day 1 |
| G5 | OMX-051: `QaFixture.payee` + payee ใน `expected.json` + benchmark report + baseline | QA (Dev pairs) | Day 1–2 |
| G6 | Variant list Lazada/Shopee + ≥ 20 negative fixtures (050b) และ fixture "จ่ายบิล" utility/เดี่ยว (050a) | QA | Day 1 |
| G7 | Fixture redacted จาก UQ1 (option A) หรือ synthetic fallback (option B) สำหรับ 049/050a | QA | Day 2 |
| G8 | CONTRIBUTING: Playwright Chromium path + proxy (AI-8) · Pages-check step ใน `deploy.yml` (task ของ 028) | Dev | Day 1 |
| G9 | ส่ง UQ1–UQ3 (และ UQ4–UQ6) ถึงผู้ใช้; escalate B3 ถ้าไม่มีคำตอบภายใน 1 วัน | PO | Day 0 ✔ ส่ง / Day 1 ติดตาม |
| G10 | Backlog v5, HANDOFF, feedback-log link (FB-011 → 049/050a/050b/051) | PO | Day 0 ✔ |
| G11 | Sprint 2 Planning หลังได้คำตอบ UQ1–UQ3 (หรือ Day 1 ตามกำหนดพร้อม conditional items) | PO + team | Day 1 |

## 10. Open Questions to the User (ส่งแล้ว — รอคำตอบก่อน Planning)

| # | Question | Blocks | Needed by |
|---|---|---|---|
| **UQ1** | ส่ง **OCR text ดิบของสลิปจริง 3 ใบ** (คัดลอกจากหน้า Review → ข้อความ OCR) ที่ **ปิดชื่อ/เลขบัญชี/เลขอ้างอิงแล้ว** ตาม guideline ได้ไหม? (ห้ามส่งรูป) ถ้าไม่สะดวก ทีมจะใช้ synthetic ที่เลียนแบบ layout แทนภายใน Day 2 | OMX-049, 050a (DoR #6) | Day 1–2 |
| **UQ2** | **GitHub Pages:** repo ปัจจุบันเป็น **private** — บน GitHub Free เปิด Pages ให้ private repo ไม่ได้. เลือก (a) เปลี่ยนเป็น **public** (ทีมจะรัน gitleaks full history + ยืนยันว่าไม่มีรูปสลิปจริงก่อน) หรือ (b) ใช้ plan ที่รองรับ Pages สำหรับ private repo? แล้วตั้ง Settings → Pages → Source = GitHub Actions | B3 → 028, 048, 043, 029, UAT | Day 1 |
| **UQ3** | **Google Client ID:** ตั้ง repo variable `VITE_GOOGLE_CLIENT_ID`, เปิด Photos Picker API และเพิ่ม test users แล้วหรือยัง? ถ้าไม่ทัน Day 2 ยอมรับ UAT แบบ "Not configured" ได้ไหม | B2 → 003a/b, 041 acceptance | Day 2 |
| UQ4 | ยินยอมใช้ 3 สลิป FB-011 (เฉพาะตัวเลขผล) เป็น Layer C และช่วยหาสลิปจริงเพิ่มให้ครบ ≥ 11 ใบ (รวมสลิปเงินเดือน)? | OMX-042 | Day 2 |
| UQ5 | สะดวก re-test สลิปจริง 3 ใบบนเครื่องตัวเองหลัง bundle 049/050a/050b deploy (รายงานแค่ถูก/ผิดต่อ field)? | Acceptance 049/050a/050b | ปลาย Sprint 2 |
| UQ6 | ช่วงเวลา UAT ที่สะดวก | UAT plan | Planning |
