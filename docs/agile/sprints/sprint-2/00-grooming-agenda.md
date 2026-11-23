# Sprint 2 — Backlog Grooming Agenda

> Prepared: 2026-11-23 · Owner & facilitator: PO/PM · Timebox: 60 นาที (charter §5, Day 0) · Status: **Done — grooming held 2026-11-23, ดูผลใน `01-grooming-minutes.md`** (estimate ในเอกสารนี้เป็นของ PO ก่อน grooming)
> Inputs: `01-product-backlog.md` **v4** (§3, §4, §6, §7 OMX-049/050, §9), `feedback-log.md` (FB-011, FB-012), `sprints/sprint-1/04-sprint-review.md`, `05-retrospective.md` (AI-1 – AI-8), `HANDOFF.md` §4–5, `docs/qa/` (BUG-009/010 — QA กำลังอัปเดต)
> Output ที่คาดหวัง: estimate ยืนยันแล้ว (planning poker), AC ของ OMX-049/050 ผ่าน DoR, ลำดับ candidate สุดท้ายสำหรับ Sprint 2 Planning, รายการ open question พร้อม owner + due

## 1. Attendees

| Role | Expected input before the session |
|---|---|
| PO/PM (facilitator) | Agenda นี้, backlog v4, สถานะ B2/B3, คำตอบจากผู้ใช้ (§7) |
| Designer | คำตอบ §6.1 (Review UI สำหรับ payee/category ที่ confidence ต่ำ, copy) |
| Dev | Technical estimate + approach ของ OMX-049/050 (§6.2), สถานะ deploy |
| QA | Fixture plan (fixture-first, AI-2), redaction checklist, impact ของ BUG-009/010 ต่อ test cases (§6.3) |

## 2. Context (สรุปสถานะ ณ 23 พ.ย. 2569)
- Sprint 1 จบแล้ว: dev-complete Must 77/77, stretch 26/29 · **Accepted (pending deploy) = 92 pts · Done = 0 pts**
- **B1 (push/CI) ปิดแล้ว** — CI ทุก job เขียวบน GitHub · **B3 (ใหม่):** `deploy.yml` ล้มที่ `configure-pages` เพราะ repo เป็น private และยังไม่เปิด Pages → live URL 404 (FB-012). ผู้ใช้ได้รับแจ้งให้เปิด Pages แล้ว → OMX-028/048 ยังไม่ Done
- **B2:** Google OAuth Client ID สร้างแล้ว แต่ยังไม่ยืนยัน repo variable `VITE_GOOGLE_CLIENT_ID`, Photos Picker API และ test users
- **FB-011 (สลิปจริง 3 ใบ):** ยอด/วันที่/เวลา/ประเภท 3/3 · หมวดหมู่ 1/3 · ผู้รับ 0/3 → **BUG-009 → OMX-049**, **BUG-010 → OMX-050** · ผู้ใช้เลือก **เข้า Sprint 2 grooming ไม่ทำ hotfix**

## 3. Proposed Sprint 2 Goal (PO)

> **ทำให้ MVP_0001 ใช้งานได้จริงบน GitHub Pages (ปิด DoD ของงาน 92 pts จาก Sprint 1) และอ่านสลิปจริงของ KBank/K PLUS ได้ถูกต้อง — ผู้รับและหมวดหมู่ถูก 3/3 บนสลิปของผู้ใช้ — พร้อมวัดความแม่นยำบนสลิปจริงและเริ่ม UAT เพื่อปล่อย `v0.1.0`**

Success measures (ร่าง — ยืนยันใน Planning):
1. Live URL เปิดได้, OMX-048 ผ่าน → 92 pts ย้ายเป็น Done, tag `v0.1.0-uat`
2. สลิปจริง FB-011: payee 3/3, category 3/3 (ผู้ใช้ re-test บนเครื่องตัวเอง, รายงานเป็นตัวเลขเท่านั้น)
3. 27 synthetic slips ไม่ถอยหลัง: type 100%, amount ≥ 96.3%, category 100%, date 100%
4. OMX-042 report บนสลิปจริง ≥ 11 ใบ (หรือบันทึกเหตุผลถ้าได้ไม่ครบ)

## 4. Capacity Assumption (retro AI-3)

| Item | Pts |
|---|---|
| Measured velocity (planning baseline) | ~40 |
| Buffer: UAT execution, feedback triage, hotfix | ~10 (ไม่ใช่ story) |
| **Commit line ที่เสนอ** | **≈ 30** |
| AI-assisted throughput | ติดตามแยก ไม่ใช้เป็น baseline |

## 5. Items to Groom (เรียงตาม priority ที่ PO เสนอ)

| Rank | ID | Title | Priority | Pts (remaining) | Groom focus | DoR gap |
|---|---|---|---|---|---|---|
| 1 | OMX-028 | Deploy via GitHub Actions *(carry-over)* | Must | ≈1 | ยืนยันว่าเหลือแค่ deploy ครั้งแรก; แผนถ้า repo ต้องเป็น public (gitleaks history, README) | **B3** — DoR #7 |
| 2 | OMX-048 | Post-deploy verification (DoD closure) | Must | 2 | ลำดับ smoke → Lighthouse → HAR; ใครย้าย status 92 pts | ขึ้นกับ 028 |
| 3 | **OMX-049** *(new)* | Recipient under ↓ on KBank/K PLUS (BUG-009) | Must (High) | **3** *(PO est.)* | approach anchor masked account, junk-line skip, ไม่ชน label rule | **Fixtures (UQ1)** — DoR #6 |
| 4 | **OMX-050** *(new)* | Category precedence + fuzzy Lazada/Shopee (BUG-010) | Must (High) | **5** *(PO est.)* | แตก 050a (precedence, 3) / 050b (fuzzy, 2) หรือไม่; วิธี fuzzy; false-positive guard | **Fixtures (UQ1)**; ยืนยัน §4 note v4 |
| 5 | OMX-042 | Real-slip accuracy measurement | Must | 3 | นับ 3 สลิป FB-011 เป็น Layer C ชุดแรก; ขอสลิปเพิ่ม (AI-7) | สลิปจริง ≥ 11 ใบ (A5/A10) |
| 6 | OMX-043 | Real-device & assistive-tech verification | Must | 3 | อุปกรณ์ที่มีจริง, ช่วงเวลาในสปรินต์ | ขึ้นกับ 028 |
| 7 | OMX-003a/003b | Google Photos real OAuth *(carry-over)* | Must | ≈2 | checklist B2; ถ้าไม่ปิดภายใน Day 2 → UAT โหมด "Not configured" (AI-6) | **B2** — DoR #7 |
| 8 | OMX-041 | Google Photos per-item Retry (K1) | Must | 2 | e2e กับ stub wrapper ทำได้ก่อน B2 ปิดหรือไม่ | ขึ้นกับ 003b |
| 9 | OMX-029 | Performance budget *(carry-over AC1, AC3, AC5)* | Should | ≈2 | วัดบน Pages + อุปกรณ์จริง | ขึ้นกับ 028 |
| 10 | OMX-044 | List virtualization | Should | 3 | ทำเฉพาะเมื่อ 029 AC5 fail | — |
| 11 | OMX-040 | Thai-digit amounts (BUG-007) | Could | 2 | — | — |
| 12 | OMX-045 | Salary slip date rule (O2) | Could | 1 | **PO ตัดสิน option A/B** ใน session นี้ | PO decision |
| 13 | OMX-039 | Received transfers via owner name | Could | 3 | refine draft AC; เกี่ยวกับ OMX-049 (payee ถูกต้องก่อน) | — |
| 14 | OMX-046 | Search placeholder at 320px | Could | 1 | Designer เสนอ copy | Copy |
| 15 | OMX-047 | Manual theme switch | Could | 2 | — | — |

**Totals:** ≈ 35 pts (Must ≈ 21 · Should ≈ 5 · Could 9) + buffer ~10
**PO proposal for Planning:** commit ≈ 30 = Must core 21 + OMX-029 (2) + Could ราว 4 (040, 045, 046) · stretch = 039, 047 · 044 conditional. ถ้า B3 ยังไม่ปิดภายใน Day 1 → OMX-028/048/043/029 เลื่อนไม่ได้ทำ ให้ดึง OMX-049/050/040 ขึ้นก่อน

## 6. Questions for the Team (ต้องได้คำตอบใน session)

### 6.1 Designer
1. **Payee ที่ได้จาก layout ลูกศร (OMX-049)** ควรแสดง confidence badge (Medium) บน Review หรือไม่ ถ้าใช้ anchor แทน label? ต้องมี copy TH/EN เพิ่มไหม
2. **Category ที่เปลี่ยนเพราะ precedence ใหม่ (OMX-050)** — ควรมี hint บน Review เช่น "จัดหมวดจากชื่อร้าน / Categorised by merchant" หรือไม่ (เพิ่ม key ใน `design/copy-deck.json`)?
3. ชื่อร้านที่ OCR อ่านเพี้ยน ("บลูเพย-ลาชาดาเพย") ควรแสดงตามที่อ่านได้ หรือแสดงชื่อแบรนด์ที่ normalize แล้ว (เช่น "Lazada")? ผลกระทบต่อการค้นหา (OMX-015)
4. Per-story design QA (AI-5): item ไหนใน Sprint 2 ต้องผ่าน design QA และใช้เวลาเท่าไร
5. OMX-046 copy ที่ 320px และสถานะ K3 / theme switch (OMX-047) — ยังต้องการใน Sprint 2 ไหม

### 6.2 Dev
1. **Estimate OMX-049 (PO 3) และ OMX-050 (PO 5)** — เห็นด้วยไหม; OMX-050 ควรแตกเป็น 050a/050b หรือไม่
2. OMX-049: ใช้ masked account `XXX-X-X####-X` เป็น anchor อย่างไรให้ทน `x/X/×` และช่องว่าง; นิยาม "name-like line" และ "next account/ID line"; ป้องกันการเอาชื่อผู้โอนมาเป็นผู้รับ; label rule เดิมยังชนะเสมอ (`src/domain/slip/parties.ts`)
3. OMX-050: เปลี่ยน "จ่ายบิล/ชำระเงิน/โอนเงิน" เป็น weak tier ใน `categories.rules.ts` แล้วกระทบ OMX-010 AC2 / OMX-006 อย่างไร? "จ่ายบิล" ยังมีผลต่อ type detection หรือไม่
4. Fuzzy matching: confusable-char normalization (ซ↔ช, ป↔บ, ตัด ์/วรรณยุกต์) vs bounded edit distance — แบบไหนเสี่ยง false positive น้อยกว่าและยังคง word boundary (R4)? กระทบ performance ไหม
5. OCR noise "พ.ุย." / "ชําระเจิน" ควรแก้ที่ normalize layer (R4) สำหรับทุก parser หรือเฉพาะ keyword matcher? กระทบ date parser (OMX-008) ไหม
6. Deploy: นอกจากเปิด Pages ยังมีอะไรใน `deploy.yml` ที่ต้องแก้หลัง `configure-pages` ผ่าน? ถ้า repo ต้องเป็น public มีอะไรใน git history ที่ต้องตรวจ (gitleaks full history)?
7. AI-8: CONTRIBUTING (Playwright Chromium path, proxy) เสร็จหรือยัง

### 6.3 QA
1. **Fixture-first (AI-2):** fixture ของ OMX-049/050 พร้อมก่อน Dev เริ่มได้เมื่อไร — ทั้ง option A (OCR text จริงที่ redact) และ option B (synthetic text + Layer B image เลียนแบบ layout KBank/K PLUS ลูกศร ↓)
2. Redaction checklist สำหรับ OCR text จริง: ชื่อ, เลขบัญชี, Ref, Biller ID, ชื่อร้าน (คง keyword + คง noise) — ใครตรวจก่อน merge
3. Negative fixtures สำหรับ fuzzy Lazada/Shopee (OMX-050 AC6) — ต้องมีกี่รายการถึงพอ
4. BUG-009/010 ใน `docs/qa/bug-report.md` — severity High ยืนยันไหม และ test case ใหม่/ที่ต้อง re-run มีอะไรบ้าง (TC ที่เกี่ยวกับ OMX-009/010)
5. Benchmark baseline payee exact-match % / CER จาก Sprint 1 คือเท่าไร (ใช้ใน OMX-049 AC7)
6. 12 Blocked TCs: แผนรันบน Pages ทันทีที่ B3 ปิด (OMX-048/043) และ incremental result (AI-4)
7. UAT entry criteria: BUG-009/010 ต้องปิดก่อน UAT start หรือ UAT เริ่มได้โดยระบุเป็น known issue

## 7. Open Questions to the User (PO ส่งก่อน grooming)

| # | Question | Why | Needed by | Blocks |
|---|---|---|---|---|
| **UQ1** | ส่ง **OCR text ดิบของสลิปจริง 3 ใบ** (คัดลอกจากหน้า Review → raw text) แบบ **ปิดชื่อ/เลขบัญชีแล้ว** ได้ไหม? ถ้าไม่สะดวก ทีมจะสร้าง synthetic ที่เลียนแบบ layout แทน (แม่นยำน้อยกว่า) | Fixture-first (DoR #6) สำหรับ OMX-049/050 · **ห้ามส่ง/commit รูปสลิป** | ก่อน Planning (Day 1) | OMX-049, OMX-050 |
| **UQ2** | **GitHub Pages:** repo เป็น private — บน GitHub Free เปิด Pages ให้ private repo ไม่ได้. ต้องการ (a) เปลี่ยน repo เป็น **public** หรือ (b) ใช้ plan ที่รองรับ Pages สำหรับ private repo? ถ้า public ทีมจะตรวจ secret ใน history ก่อน (ไม่มีรูปสลิปจริงใน repo) | ปิด B3 → OMX-028/048 → 92 pts เป็น Done | Day 1 | 028, 048, 043, 029, UAT |
| **UQ3** | **Google Client ID:** ตั้ง repo variable `VITE_GOOGLE_CLIENT_ID` แล้วหรือยัง, เปิด Photos Picker API และเพิ่ม test users แล้วหรือยัง? ถ้าไม่ทันภายใน Day 2 ยอมรับ UAT แบบ "Not configured" ได้ไหม | ปิด B2 (AI-6) | Day 2 | 003a/003b, 041 |
| UQ4 | ยินยอมให้ใช้ 3 สลิปของ FB-011 (นับผลเป็นตัวเลขเท่านั้น) เป็นส่วนหนึ่งของ Layer C (OMX-042) และส่ง/ช่วยหาสลิปจริงเพิ่ม (รวมสลิปเงินเดือน A5) ให้ครบ ≥ 11 ใบ ได้ไหม | AI-7, UAT exit #3 | Day 2 | 042 |
| UQ5 | สะดวก **re-test สลิปจริง 3 ใบ** บนเครื่องตัวเองหลัง OMX-049/050 merge และ deploy แล้ว (รายงานแค่ถูก/ผิดต่อ field) ได้ไหม | AC6/AC8 ของ OMX-049/050 | ปลาย Sprint 2 | Acceptance ของ 049/050 |
| UQ6 | ช่วงเวลา UAT ที่สะดวก (Sprint 2 Day 3–4 ตาม release plan R6) | วางแผน buffer | Planning | UAT |

## 8. Session Flow (60 นาที)

| # | Time | Topic | Lead |
|---|---|---|---|
| 1 | 5′ | Context + proposed goal + capacity (§2–§4) | PO |
| 2 | 10′ | Impediments B3/B2: status, owner, fallback (OMX-028/048/003) | PO + Dev |
| 3 | 20′ | **OMX-049 / OMX-050**: walkthrough AC, Q&A §6, fixture plan, planning poker | PO → ทั้งทีม |
| 4 | 15′ | Candidates rank 5–15: re-estimate remaining, OMX-045 decision, OMX-044 condition | PO |
| 5 | 5′ | DoR check ทุก item ที่จะเข้า Planning (โดยเฉพาะ #6 fixtures, #7 environment) | QA + PO |
| 6 | 5′ | Action items + คำตอบที่ยังรอจากผู้ใช้ (§7) | PO |

## 9. DoR Pre-check (PO)

| ID | Story | AC G/W/T | Priority + deps | UI/copy | Estimated | No blocking OQ / fixtures | Env access |
|---|---|---|---|---|---|---|---|
| OMX-049 | ✔ | ✔ | ✔ | ? (§6.1 Q1) | PO only | ✖ UQ1 | ✔ |
| OMX-050 | ✔ | ✔ | ✔ | ? (§6.1 Q2–3) | PO only | ✖ UQ1 | ✔ |
| OMX-028 | ✔ | ✔ | ✔ | n/a | ✔ | ✔ | ✖ B3 |
| OMX-003a/b | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✖ B2 |
