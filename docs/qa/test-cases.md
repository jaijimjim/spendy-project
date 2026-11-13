# Test Cases — Omnitrix Money MVP_0001 (Sprint 1)

> Owner: QA · Version 1.0 · Execution run: **2026-11-13** (Sprint 1 Day 4) บน local `vite preview` + Chromium 1243, TZ Asia/Bangkok
> ครอบคลุม: ทุก **Must** story + **Should** ที่ Dev ทำเสร็จ (002, 009, 011, 015, 019, 020, 022, 023, 029 บางส่วน, 031)
> Test plan: [`test-plan.md`](test-plan.md) · Bugs: [`bug-report.md`](bug-report.md) · Summary: [`test-summary-report.md`](test-summary-report.md)

## Legend

**Type:** unit · component · e2e · manual (manual = รันด้วย Playwright script แบบ exploratory หรือ checklist มือ)
**Priority:** P1 (Must AC / data / money) · P2 (Should หรือ edge) · P3 (cosmetic)
**Result:** Pass · Fail (→ BUG) · Blocked (→ B1 push/Pages, B2 Google Client ID, DEV = ต้องใช้อุปกรณ์จริง) · Not run

**Automated spec (link codes):**
| Code | File |
|---|---|
| A | [`tests/e2e/app.spec.ts`](../../tests/e2e/app.spec.ts) (Dev e2e, mobile 375 + desktop 1280, fake OCR) |
| Q | [`tests/e2e/qa.spec.ts`](../../tests/e2e/qa.spec.ts) (QA e2e edge cases + defect regressions) |
| X | [`tests/e2e/qa-explore.spec.ts`](../../tests/e2e/qa-explore.spec.ts) (QA matrix 375/1280 × TH/EN × light/dark) |
| BM | [`tests/e2e/benchmark.real-ocr.spec.ts`](../../tests/e2e/benchmark.real-ocr.spec.ts) (Layer B real-OCR benchmark, 27 images) |
| RO | [`tests/e2e/real-ocr.spec.ts`](../../tests/e2e/real-ocr.spec.ts) (Dev real-OCR smoke) |
| G | [`src/domain/slip/qaGolden.test.ts`](../../src/domain/slip/qaGolden.test.ts) + [`__fixtures__/qaGolden.ts`](../../src/domain/slip/__fixtures__/qaGolden.ts) (QA Layer A, 32 fixtures) |
| P | `src/domain/slip/{parseSlip,amount,slipDate,typeAndCategory}.test.ts` (Dev parser unit) |
| D | [`src/domain/domain.test.ts`](../../src/domain/domain.test.ts) (money, date, csv, schema, duplicates, file checks) |
| S | `src/services/storage.test.ts`, `src/store/{appStore,queueStore}.test.ts` |
| M | Manual/exploratory Playwright script on `vite preview` (ad-hoc, run 2026-11-13; ไม่ commit) |

---

## E1 — Slip Import

| ID | Story | Title | Preconditions | Steps | Expected | Prio | Type | Automated | Result | Run date |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-001 | OMX-001 | Upload หลายรูปผ่าน picker → เข้าคิวและเริ่ม OCR | App เปิดที่ `#/add` | เลือก 2 รูป PNG (`slip-food`, `slip-bill`) | ทั้ง 2 รายการเข้า queue, progress แสดง, ปุ่ม "ตรวจรายการ (2)" | P1 | e2e | A "upload → OCR → review → save" | Pass | 2026-11-13 |
| TC-002 | OMX-001 | ตรวจชนิดไฟล์จาก signature ไม่ใช่นามสกุล | — | อัปโหลดไฟล์ `.png` ที่ข้างในเป็น GIF / text | ถูก skip ว่าไม่ใช่ชนิดที่รองรับ | P1 | e2e | Q TC-002/003/004/006 | Pass | 2026-11-13 |
| TC-003 | OMX-001 | ไฟล์ 0 byte | — | อัปโหลดไฟล์ว่าง | ถูก skip | P2 | e2e | Q TC-002/003/004/006 | Pass | 2026-11-13 |
| TC-004 | OMX-001 | Boundary 10 MiB (= ผ่าน, +1 byte = skip) | — | อัปโหลด PNG ขนาด 10,485,760 และ 10,485,761 bytes | ไฟล์แรกเข้าคิว ไฟล์สองถูก skip | P1 | e2e | Q TC-002/003/004/006 | Pass | 2026-11-13 |
| TC-005 | OMX-001 | Queue limit 20 | — | อัปโหลด 21 รูป | รับ 20, รูปที่ 21 ถูก skip และแจ้ง | P1 | e2e | Q TC-005 | Pass | 2026-11-13 |
| TC-006 | OMX-001 | สรุปไฟล์ที่ข้ามเป็นข้อความเดียว | — | อัปโหลดไฟล์ผิดหลายแบบพร้อมกัน | แสดง summary message เดียว (ไม่ใช่ toast หลายอัน) | P2 | e2e | Q TC-002/003/004/006 | Pass | 2026-11-13 |
| TC-007 | OMX-001, 011 | รูปซ้ำใน batch เดียวกัน | — | อัปโหลดรูปเดียวกัน 2 ครั้งใน batch | รูปที่สองถูก skip + summary | P2 | e2e | A "duplicate image in same batch" | Pass | 2026-11-13 |
| TC-008 | OMX-001 | Native picker/กล้องบนมือถือจริง (AC5) | Android Chrome / iOS Safari | เปิด picker จากมือถือ เลือกจาก gallery/กล้อง | เลือกได้หลายรูป, accept image types | P2 | manual | — | Blocked (DEV, B1) | — |
| TC-010 | OMX-002 | Drag & drop รูปลง dropzone | `#/add` desktop | Drop 1 PNG + 1 .txt | PNG เข้าคิว, .txt ถูก skip | P2 | manual | M (DataTransfer drop) | Pass | 2026-11-13 |
| TC-013 | OMX-004 | Google Photos "not configured" | ไม่มี `VITE_GOOGLE_CLIENT_ID` | เปิด `#/add` | ปุ่ม disabled + ข้อความ "ยังไม่ได้ตั้งค่า Google Photos — ใช้การอัปโหลดแทน" | P1 | e2e | A "Google Photos shows not configured" | Pass | 2026-11-13 |
| TC-014 | OMX-003a/b | Google Photos flow ผ่าน stub wrapper: consent → picker → download → queue | stub wrapper | กดนำเข้า → เลือกรูป | รูปที่เลือกเข้าคิวและ OCR | P1 | e2e | A "Google Photos import via stubbed wrapper" | Pass | 2026-11-13 |
| TC-015 | OMX-003a | Real Google OAuth + Picker (Testing mode) | Client ID + test user | Sign-in → เลือกรูปจริง | Picker เปิด, scope ขั้นต่ำ | P1 | manual | — | Blocked (B2) | — |
| TC-016 | OMX-003b | Download failure ของรูปจาก Google → แจ้งเป็นรายรูป + Retry | Client ID | ทำให้ download ล้ม | แสดง Failed + Retry (K1: ตอนนี้นับรวม) | P2 | manual | — | Blocked (B2) | — |
| TC-017 | OMX-004 | Auth error / user cancel consent | Client ID | Cancel ที่ consent | ข้อความ error ที่เข้าใจได้, กลับสู่สถานะเดิม | P1 | manual | — | Blocked (B2) | — |

## E2 — OCR & Smart Extraction

| ID | Story | Title | Preconditions | Steps | Expected | Prio | Type | Automated | Result | Run date |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-025 | OMX-005 | Real Tesseract โหลด worker/core/`tha`+`eng` จาก origin ตัวเอง | built app | อัปโหลดสลิปสังเคราะห์ด้วย real OCR | อ่านยอด 245.00 ได้, request ทั้งหมดเป็น same-origin | P1 | e2e | RO | Pass | 2026-11-13 |
| TC-026 | OMX-005 | Progress ต่อรายการ + สถานะ อ่านไม่สำเร็จ | fake OCR | อัปโหลด `corrupt-slip.png` + สลิปปกติ | รายการเสียแสดง "อ่านไม่สำเร็จ" + Retry/Remove, อื่นทำต่อ | P1 | e2e | A, screens capture | Pass | 2026-11-13 |
| TC-027 | OMX-005, 029 | Downscale รูป long edge > 2000px | — | unit: computeDownscale | target 2000px | P2 | unit | D "computes downscale target" | Pass | 2026-11-13 |
| TC-028 | OMX-005 | ประสิทธิภาพ real OCR บน 27 รูป | real OCR, sandbox CPU | BM | ~1.4 s/รูป (sandbox) | P2 | e2e | BM | Pass | 2026-11-13 |
| TC-031 | OMX-006 | Transfer สำเร็จ → Expense | — | parse สลิป "โอนเงินสำเร็จ" | type = expense | P1 | unit | P, G | Pass | 2026-11-13 |
| TC-032 | OMX-006 | "ได้รับเงินโอน" / "Money received" → Income | — | parse b07 / b15 | type = income, category = other_income | P1 | unit + e2e | G `qa-received-income`, BM b07/b15 | Pass | 2026-11-13 |
| TC-033 | OMX-006 | **Keyword conflict:** สลิปเงินเดือนที่มี "โอนเงินสำเร็จ เข้าบัญชี" | — | parse `qa-salary-vs-transfer-conflict` | income / salary (salary strong keyword ชนะ) | P1 | unit | G | Pass | 2026-11-13 |
| TC-034 | OMX-006 | **Keyword conflict:** สลิปโอนที่ memo มีคำว่า "ค่าแรง/เงินเดือน" | — | parse `qa-transfer-memo-mentions-salary` | expense / transfer (memo ไม่ทำให้เป็น salary) | P1 | unit | G | Pass | 2026-11-13 |
| TC-035 | OMX-006 | Salary slip มีคำว่า "โบนัส" | — | BM b13, d24 | income / salary (ไม่ใช่ other_income) | P2 | e2e | BM | Pass | 2026-11-13 |
| TC-036 | OMX-006 | Received slip ที่หน้าตาเหมือนสลิปผู้โอน (K6 / AC8 limitation) | — | BM b08 | type = expense (documented limitation → OMX-039) | P2 | e2e | BM, G `rec-b08` | Pass (as designed) | 2026-11-13 |
| TC-037 | OMX-006 | Type ไม่ชัด → แสดง "ไม่แน่ใจว่าเป็นรายรับหรือรายจ่าย" | fake `slip-noamount` | เปิด Review | Low confidence + hint | P2 | manual | M | Pass | 2026-11-13 |
| TC-040 | OMX-007 | ยอดจาก label "จำนวนเงิน/ยอดชำระ/Amount" | — | P/G/BM | amount ถูกต้อง (integer satang) | P1 | unit + e2e | P, G, BM | Pass | 2026-11-13 |
| TC-041 | OMX-007 | Salary ใช้ net ไม่ใช่ gross | — | b10/b11/b13/b14 | net (46,200.00 / 49,350.75 / 31,069.50 / 38,125.00) | P1 | unit + e2e | G, BM | Pass | 2026-11-13 |
| TC-042 | OMX-007 | ไม่เอา balance / fee / เลขอ้างอิง 10 หลัก | — | `qa-balance-and-fee-excluded`, b02, b05 | amount = ยอดรายการจริง | P1 | unit + e2e | G, BM | Pass | 2026-11-13 |
| TC-043 | OMX-007 | Satang rounding: `1,250.50`, `0.10 + 0.20` | — | parse / dashboard | 125050 satang; total 0.30 (ไม่มี float error) | P1 | unit + e2e | P, Q TC-101 | Pass | 2026-11-13 |
| TC-044 | OMX-007 | เลขไทยใน text สะอาด | — | `qa-thai-digits-amount` | อ่านเป็นเลขอารบิกถูก | P2 | unit | G | Pass | 2026-11-13 |
| TC-045 | OMX-007 | เลขไทยบนรูปจริง (real OCR) | — | BM b16 | 352.50 | P3 | e2e | BM | **Fail → BUG-007 (Low)** | 2026-11-13 |
| TC-046 | OMX-007 | ไม่พบยอด → field ว่าง + "ไม่พบยอดเงินในสลิป" | fake `slip-noamount` | Review | amount ว่าง, ต้องกรอกก่อน save | P1 | manual + e2e | M, A | Pass | 2026-11-13 |
| TC-050 | OMX-008 | วันที่ไทย `13 พ.ย. 69`, `13 พ.ย. 2569`, `13 พฤศจิกายน 2569` | — | P | 2026-11-13 (BE → CE) | P1 | unit | P | Pass | 2026-11-13 |
| TC-051 | OMX-008 | **dd/mm ไม่ใช่ mm/dd**: `01/11/2569`, `06/11/2569` | — | `qa-ddmm-not-mmdd`, BM b06/b17 | 1 พ.ย. / 6 พ.ย. 2026 | P1 | unit + e2e | G, BM | Pass | 2026-11-13 |
| TC-052 | OMX-008 | **BE vs CE**: `02/11/2026` (CE), `11/11/2569` (BE) | — | BM b18, b04 | 2026-11-02 / 2026-11-11 | P1 | unit + e2e | P, BM | Pass | 2026-11-13 |
| TC-053 | OMX-008 | EN date `10 Nov 2026` | — | BM b03 | 2026-11-10 | P1 | e2e | BM | Pass | 2026-11-13 |
| TC-054 | OMX-008 | **Thai OCR quirk**: เดือน "พุย." / "พ.ุย." (จุดถูกอ่านเป็นสระ ุ) | — | `qa-ocr-month-*`, `rec-*` | อ่านเป็น พ.ย. | P1 | unit + e2e | G, BM | Pass (after BUG-001 fix) | 2026-11-13 |
| TC-055 | OMX-008 | Thai OCR quirk: สระ "ำ" แตกเป็น "ํา" (`จํานวนเงิน`, `สําเร็จ`) | — | `rec-*` fixtures | label ยังถูก match, amount/type ถูก | P1 | unit | G `rec-b01..b12` | Pass | 2026-11-13 |
| TC-056 | OMX-008 | วันที่เป็นไปไม่ได้ `31/11/2569`; leap `29 ก.พ. 2567` | — | G | reject / 2024-02-29 | P1 | unit | G `qa-impossible-date-31-11`, `qa-leap-day-2567` | Pass | 2026-11-13 |
| TC-057 | OMX-008 | วันที่อนาคต / เก่ากว่า 5 ปี → fallback วันนี้ + hint | — | G; BM b14 (สิ้นงวด 30 พ.ย. > today) | today (Asia/Bangkok) + highlight | P1 | unit + e2e | G `qa-future-date-falls-back`, `qa-older-than-5y-falls-back`, BM b14 | Pass | 2026-11-13 |
| TC-058 | OMX-008 | Salary: pay-date label ก่อน, ไม่มี → วันสุดท้ายของงวด | — | b10 (25/10/2569), b11 (October 2026) | 2026-10-25 / 2026-10-31 | P1 | unit + e2e | G, BM | Pass | 2026-11-13 |
| TC-059 | OMX-008 | **Month boundary + timezone**: `31/10/2569 23:59` บนเครื่อง TZ America/Los_Angeles | TZ LA | import + save | อยู่เดือนตุลาคม 2026 | P1 | e2e | Q TC-059 | Pass | 2026-11-13 |
| TC-060 | OMX-008 | เวลา `14:35`, ไม่มีเวลา → ว่าง (ไม่ใช่ 00:00) | — | P, BM salary rows | time ถูก / null | P1 | unit + e2e | P, BM | Pass | 2026-11-13 |
| TC-061 | OMX-009 | ดึง payee / bank / ref / memo | fake `slip-transfer` | Review | Payee "น.ส. สมใจ ใจดี", ref, bank แสดง | P2 | unit + manual | P, M | Pass | 2026-11-13 |
| TC-062 | OMX-009 | บริษัทไม่ถูกจัดเป็นบุคคล | — | `qa-company-never-person`, b09 | category ≠ transfer (housing) | P2 | unit + e2e | G, BM | Pass | 2026-11-13 |
| TC-065 | OMX-010 | **Grab vs GrabFood** (longest match wins) | — | `qa-grab-ride-not-food`, `qa-grab-food-spaced`, b02/b03 | Grab = transport, GrabFood / "Grab Food" = food | P1 | unit + e2e | G, BM | Pass | 2026-11-13 |
| TC-066 | OMX-010 | Café Amazon (สาขา PTT) ชนะ PTT | — | `qa-cafe-amazon-beats-ptt`, b04 | food | P1 | unit + e2e | G, BM | Pass | 2026-11-13 |
| TC-067 | OMX-010 | Bills / Housing / Shopping / Entertainment keyword | — | b05, b06, b09, b16, b17, b18 | bills/bills/housing/bills/shopping/entertainment | P1 | e2e | BM | Pass | 2026-11-13 |
| TC-068 | OMX-010 | โอนให้บุคคล (คำนำหน้า นาย/น.ส./MR.) → transfer | — | b01, d15 | transfer | P1 | e2e | BM | Pass | 2026-11-13 |
| TC-069 | OMX-010 | โอนให้บุคคลที่ OCR มี noise หน้าคำนำหน้า ("แนายข") | — | b08, b12, `qa-ocr-prefix-noise-nai` | transfer | P2 | unit + e2e | G (`it.fails`), BM | **Fail → BUG-006 (Medium)** | 2026-11-13 |
| TC-070 | OMX-010 | Category accuracy gates | — | Layer A / Layer B | A: type/amount ≥ 95%; B: category ≥ 60% | P1 | unit + e2e | G, BM | Pass (A 100/100, B 92.6%) | 2026-11-13 |
| TC-073 | OMX-011 | Import slip ที่บันทึกแล้ว → "อาจซ้ำ" + unchecked | saved slip | import รูปเดิม | flagged Duplicate, ไม่ถูกเลือก | P2 | e2e | A "re-importing a saved slip" | Pass | 2026-11-13 |
| TC-074 | OMX-011 | Possible duplicate โดย ref / amount+date+time±1+payee | — | unit | flagged possible | P2 | unit | D duplicates | Pass | 2026-11-13 |

## E3 — Review & Manual Entry

| ID | Story | Title | Preconditions | Steps | Expected | Prio | Type | Automated | Result | Run date |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-076 | OMX-012a | Review → แก้ → save → ไป dashboard พร้อมยอด | fake OCR | upload → review → save | รายการบันทึก, dashboard อัปเดต | P1 | e2e | A "upload → OCR → review → save" | Pass | 2026-11-13 |
| TC-077 | OMX-012a | Validation: ไม่มี amount/category → save ไม่ได้ + ข้อความ | `slip-noamount` | Save | error ต่อ field, focus field แรก | P1 | e2e + manual | A, M | Pass | 2026-11-13 |
| TC-078 | OMX-012a | Save atomically (storage fail → ไม่มีรายการครึ่ง ๆ) | storage broken | Save | banner, memory ไม่เปลี่ยน | P1 | unit + e2e | S appStore rollback, A "failed storage write" | Pass | 2026-11-13 |
| TC-079 | OMX-012a | เปลี่ยน type → category ที่ไม่ valid ถูก reset | Expense/food | สลับเป็น Income | category = other_income | P1 | e2e | Q TC-079 | Pass | 2026-11-13 |
| TC-080 | OMX-012a | Discard รายการใน Review (confirm) | — | Discard | รายการออกจาก queue | P2 | e2e | A | Pass | 2026-11-13 |
| TC-081 | OMX-012a | queue → transaction mapping (hash, ref, confidence, raw text ตัด) | — | unit | fields ครบ | P1 | unit | S queueStore | Pass | 2026-11-13 |
| TC-083 | OMX-012b | OCR raw text เป็น plain text (XSS) | `slip-xss` | Review → เปิด OCR text | ไม่มี script ทำงาน | P1 | e2e | A "OCR text is rendered as plain text" | Pass | 2026-11-13 |
| TC-084 | OMX-012b | Flags: Low confidence / No date / Incomplete แสดงบน card | `slip-noamount` | Review | badge + hint ต่อ field | P1 | manual | M | Pass | 2026-11-13 |
| TC-085 | OMX-012b | Leave guard เมื่อมีรายการค้าง | 1 item in Review | คลิก Home | dialog "Unsaved items", Keep reviewing คงรายการ | P1 | e2e | Q TC-085 (desktop; mobile ไม่มี nav บน Review by design) | Pass | 2026-11-13 |
| TC-086 | OMX-012b | axe บน Review | — | axe scan | 0 critical/serious | P1 | e2e | A "axe: review screen" | Pass | 2026-11-13 |
| TC-088 | OMX-013 | **Double-click Save** สร้างรายการเดียว | form valid | dblclick Save | 1 transaction | P1 | e2e | Q TC-088 | Pass (after BUG-002 fix) | 2026-11-13 |
| TC-089 | OMX-013 | Amount: ทศนิยม > 2 ตำแหน่ง / เกินค่าสูงสุด / 0 | — | กรอก `1.234`, `100000000`, `0` | error ถูกต้อง | P1 | e2e | Q TC-089/090 | Pass | 2026-11-13 |
| TC-090 | OMX-013 | วันที่อนาคต → อนุญาตแต่เตือน (Q11) | — | เลือกวันพรุ่งนี้ | warning, save ได้ | P2 | e2e | Q TC-089/090 | Pass | 2026-11-13 |
| TC-091 | OMX-013 | Add / edit / delete + undo | — | ตาม flow | ข้อมูลถูกต้อง, undo คืนรายการ | P1 | e2e | A "add, edit and delete with undo" | Pass | 2026-11-13 |
| TC-092 | OMX-013, R2 | **Timezone "today"**: default date ของฟอร์มเมื่อเครื่องอยู่ Honolulu แต่ Bangkok เป็น 13 พ.ย. 01:30 | TZ Pacific/Honolulu | เปิดฟอร์ม | default = 2026-11-13 (Asia/Bangkok) | P1 | unit + manual | D "today in Bangkok regardless of device timezone", M | Pass | 2026-11-13 |

## E4 — Transaction Management

| ID | Story | Title | Preconditions | Steps | Expected | Prio | Type | Automated | Result | Run date |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-093 | OMX-014 | ยอด 1,000,000.00 ไม่ล้นที่ 360px | seed | `#/transactions` 360px | ไม่มี overflow | P2 | e2e | Q TC-093/103 | Pass | 2026-11-13 |
| TC-094 | OMX-014 | Group ตามวันที่ ใหม่สุดก่อน, ไม่มีเวลาอยู่ท้าย | seed | unit + ดูหน้า | ลำดับถูก, ยอดรวมต่อวัน | P1 | unit | D "groups by date newest first" | Pass | 2026-11-13 |
| TC-095 | OMX-015, 025 | Placeholder ช่องค้นหา EN อ่านได้ที่ 375px | EN, 375px | ดู `#/transactions` | placeholder ไม่ถูกตัด | P3 | manual | X screenshot | **Fail → BUG-008 (Low)** | 2026-11-13 |
| TC-096 | OMX-015 | Filter type/category + search (comma, regex chars) | seed | ค้นหา `1,385` / `(` | ผลถูก, ไม่ crash | P2 | unit + e2e | D, A "filters & search" | Pass | 2026-11-13 |
| TC-097 | OMX-015 | Filter คงอยู่เมื่อเปลี่ยนเดือน | filter active | เปลี่ยนเดือน | filter ยังอยู่ | P2 | e2e | Q TC-097 | Pass | 2026-11-13 |
| TC-098 | OMX-016 | แก้ไขแล้ว list/total อัปเดต | seed | edit amount | ยอดใหม่ | P1 | e2e | A | Pass | 2026-11-13 |
| TC-099 | OMX-016 | แก้วันที่ข้ามเดือน → ย้ายรายการ + ยอดทั้งสองเดือน | seed | edit date → ต.ค. | พ.ย. ลด, ต.ค. เพิ่ม | P1 | e2e | Q TC-099 | Pass | 2026-11-13 |

## E5 — Dashboard & Insights

| ID | Story | Title | Preconditions | Steps | Expected | Prio | Type | Automated | Result | Run date |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-100 | OMX-017 | Month selector: next disabled ที่เดือนปัจจุบัน, ม.ค. 2570 → ธ.ค. 2569, "เดือนนี้" | — | คลิก prev/next | ตามที่คาด | P1 | e2e | Q TC-100 | Pass | 2026-11-13 |
| TC-101 | OMX-018 | **Satang**: 0.10 + 0.20 = 0.30; balance 0 → 0.00 | seed | dashboard | ยอดถูกต้อง | P1 | e2e | Q TC-101 | Pass | 2026-11-13 |
| TC-102 | OMX-018 | Summary income/expense/balance ของเดือน | seed | dashboard | 46,200.00 / 16,536.00 / 29,664.00 | P1 | unit + manual | D "summarizes a month", X | Pass | 2026-11-13 |
| TC-103 | OMX-018 | Totals 99,999,999.99 ไม่ล้นที่ 360px | seed | dashboard 360px | ไม่มี overflow | P2 | e2e | Q TC-093/103 | Pass | 2026-11-13 |
| TC-104 | OMX-019 | Category breakdown % + เรียงมากไปน้อย | seed | dashboard | Housing 51.4%, Food 26.0%, … | P2 | unit + manual | D, M | Pass | 2026-11-13 |
| TC-105 | OMX-019 | แตะหมวด → Transactions กรองตามหมวด | seed | คลิก "Food & Drink" | `#/transactions` filter Food, 3 results, −4,305.00 | P2 | manual | M | Pass | 2026-11-13 |
| TC-106 | OMX-019/020 | "ดูเป็นตาราง" สำหรับกราฟ (a11y alternative) | seed | กด View as table | แสดง `<table>` | P2 | manual | M | Pass | 2026-11-13 |
| TC-107 | OMX-020 | Trend 6 เดือน, เดือนว่าง = 0 | seed | unit + ดูกราฟ | 6 แท่งคู่, label เดือน | P2 | unit + manual | D "trend has zeros", X | Pass | 2026-11-13 |

## E6 — Data & Persistence

| ID | Story | Title | Preconditions | Steps | Expected | Prio | Type | Automated | Result | Run date |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-108 | OMX-021 | Persist across reload + deep link | data saved | reload `#/transactions` | ข้อมูลยังอยู่ | P1 | e2e | A "data persists across reload" | Pass | 2026-11-13 |
| TC-109 | OMX-021 | localStorage ใช้ไม่ได้ → memory mode + banner | storage unavailable | เปิด app | render ได้ + banner | P1 | e2e | Q TC-109 | Pass | 2026-11-13 |
| TC-110 | OMX-021 | **Multi-tab**: save ใน tab A ไม่ถูก tab B เขียนทับ | 2 tabs | save A แล้ว save B | มีทั้งสองรายการ | P1 | e2e | Q TC-110 | Pass | 2026-11-13 |
| TC-115 | OMX-021 | Corrupt storage → recovery banner + backup `omx.v1.corrupt.*` | corrupt JSON | เปิด app | banner, backup key | P1 | unit + e2e | S, A "corrupt storage" | Pass | 2026-11-13 |
| TC-111 | OMX-022 | JSON export ชื่อไฟล์ใช้วันที่ Bangkok | — | Export JSON | `omnitrix-money-backup-YYYYMMDD.json` (Bangkok) | P2 | e2e | Q TC-111 | Pass | 2026-11-13 |
| TC-112 | OMX-022 | Import backup ซ้ำ (Merge) → "นำเข้า 0" | backup | import 2 ครั้ง | ครั้งที่ 2 = 0 | P2 | e2e | Q TC-112/113 | Pass | 2026-11-13 |
| TC-113 | OMX-022, 031 | Import non-JSON / schema ผิด → reject (zod) | — | import ไฟล์ผิด | error ชัดเจน, ข้อมูลเดิมไม่เปลี่ยน | P1 | unit + e2e | D schema, Q TC-112/113 | Pass | 2026-11-13 |
| TC-114 | OMX-023 | CSV: category เป็นชื่อตามภาษา UI | TH UI | Export CSV | `อาหารและเครื่องดื่ม` | P2 | e2e | Q TC-114 | Pass (after BUG-004 fix) | 2026-11-13 |
| TC-116 | OMX-023 | CSV: BOM, header, RFC 4180 escape | — | Export | BOM + `date,time,type,category,amount,payee,note,source` | P2 | unit + e2e | D csv, A "CSV export" | Pass | 2026-11-13 |
| TC-117 | OMX-023 | **CSV formula injection** (`=`, `+`, `-`, `@`) | payee `@evil`, `=1+1` | Export | prefixed `'` | P1 | unit + e2e | D, A "CSV export escapes formulas" | Pass | 2026-11-13 |
| TC-118 | OMX-023 | เปิด CSV ใน Excel / Google Sheets ภาษาไทยถูก (AC5) | — | เปิดไฟล์ | ไทยไม่เพี้ยน | P3 | manual | — | Blocked (DEV — ไม่มี Excel ใน sandbox) | — |

## E7 — Platform, i18n & UX Quality

| ID | Story | Title | Preconditions | Steps | Expected | Prio | Type | Automated | Result | Run date |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-119 | OMX-024 | สลับภาษาทันที + persist + `<html lang>` | — | สลับ TH↔EN, reload | ข้อความเปลี่ยน, lang attr ถูก | P1 | e2e | A "language switch" | Pass | 2026-11-13 |
| TC-121 | OMX-024 | TH/EN key parity, ไม่มี raw key | — | `npm run i18n:check` + X | 345 keys parity; ไม่มี raw key ทุกหน้า | P1 | unit + e2e | `scripts/check-i18n-keys.mjs`, X | Pass | 2026-11-13 |
| TC-122 | OMX-024 | EN UI ไม่มีข้อความไทยหลงเหลือ (ยกเว้น "ไทย" ในปุ่มภาษา) | EN | X ทุกหน้า | ไม่มี | P2 | e2e | X | Pass | 2026-11-13 |
| TC-120 | OMX-025 | ไม่มี horizontal scroll ที่ **320px** | 320×640 | `#/transactions`, `#/transactions/new` | scrollWidth ≤ 320 | P2 | e2e | Q TC-120 (`test.fail`) | **Fail → BUG-003 (Medium)** | 2026-11-13 |
| TC-124 | OMX-025 | ไม่มี horizontal scroll ที่ 375 / 1280 ทุกหน้า (TH/EN, light/dark) | — | X matrix | ผ่านทุกหน้า | P1 | e2e | X | Pass | 2026-11-13 |
| TC-125 | OMX-025 | Bottom nav (mobile) / side nav (≥1024) + Add action sheet | — | ดู 375 / 1280 | ลำดับ Home·Transactions·Add·Settings, sheet 3 ตัวเลือก | P1 | e2e + manual | screens, X, M | Pass | 2026-11-13 |
| TC-126 | OMX-025 | HashRouter deep link ทุกหน้า | — | เปิด URL ตรง | โหลดได้ ไม่ 404 | P1 | e2e | A, X | Pass (local; Pages = Blocked B1) | 2026-11-13 |
| TC-127 | OMX-025 | Font self-hosted, ไม่มี request Google Fonts | — | network allowlist | same-origin only | P1 | e2e | A "network allowlist" | Pass | 2026-11-13 |
| TC-128 | OMX-026 | Empty state first-use (Dashboard, Transactions) | no data | เปิดหน้า | "เริ่มจากสลิปแรก" + Upload / Add manually | P1 | manual | M | Pass | 2026-11-13 |
| TC-129 | OMX-026 | ErrorBoundary แสดงหน้า error แทนจอขาว | — | component test | fallback UI | P1 | component | `src/app/ErrorBoundary.test.tsx` | Pass | 2026-11-13 |
| TC-130 | OMX-026 | Dark mode (`prefers-color-scheme: dark`) ทุกหน้า | dark | X matrix | พื้นหลังเข้ม, อ่านได้ | P2 | e2e | X, screens "dark EN" | Pass | 2026-11-13 |
| TC-131 | OMX-027 | axe 0 critical/serious บน 6 หน้าหลัก | — | axe | 0 | P1 | e2e | A accessibility | Pass | 2026-11-13 |
| TC-132 | OMX-027 | Touch target ปุ่ม TH/EN ≥ 44×44 | — | วัด box + hit area | ≥ 44 | P2 | e2e | Q TC-132 | Pass (after BUG-005 fix) | 2026-11-13 |
| TC-133 | OMX-027 | Skip link + focus ไป heading เมื่อเปลี่ยน route; Esc ปิด sheet แล้ว focus กลับ | — | keyboard | ตามที่คาด | P1 | e2e + manual | A "skip link and focus", M | Pass | 2026-11-13 |
| TC-134 | OMX-027 | `prefers-reduced-motion` ปิด animation | reduce | ดู transition | 0s | P2 | manual | M | Pass | 2026-11-13 |
| TC-135 | OMX-027 | Screen reader (NVDA/VoiceOver/TalkBack), Lighthouse a11y ≥ 90, 200% zoom | อุปกรณ์จริง / Pages | ตาม AC3/AC5/AC6 | ใช้งานได้ | P1 | manual | — | Blocked (DEV, B1) | — |
| TC-136 | OMX-028 | Production build + bundle budget | — | `npm run build && npm run size:check` | สำเร็จ; initial JS 170 KB gz ≤ 300 | P1 | e2e (CI step) | `scripts/check-bundle-size.mjs` | Pass | 2026-11-13 |
| TC-137 | OMX-028 | Deploy GitHub Pages ผ่าน Actions + post-deploy smoke | push access | push `main` | URL ใช้งานได้ | P1 | manual | `.github/workflows/deploy.yml` | Blocked (B1) | — |
| TC-138 | OMX-028 | CI (`ci.yml`) เขียวบน PR | push access | เปิด PR | ทุก job ผ่าน | P1 | manual | `.github/workflows/ci.yml` | Blocked (B1) — local `npm run ci` steps ผ่าน | 2026-11-13 |

## E8 — Non-functional

| ID | Story | Title | Preconditions | Steps | Expected | Prio | Type | Automated | Result | Run date |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-139 | OMX-029 | LCP ≤ 2.5 s (Lighthouse mobile, Pages) | Pages URL | Lighthouse × 3 | median ≤ 2.5 s | P2 | manual | — | Blocked (B1) | — |
| TC-141 | OMX-029 | OCR ≤ 15 s/รูปบน reference devices | อุปกรณ์จริง | 5 รูป 1080×2400 | median ≤ 15 s | P2 | manual | — | Blocked (DEV) | — |
| TC-142 | OMX-029 | 1,000 รายการ render ≤ 1 s | อุปกรณ์จริง | seed 1,000 | ≤ 1 s | P2 | manual | — | Not run (K4: ไม่มี virtualization) | — |
| TC-140 | OMX-030 | Delete all data ลบ `omx.v1` + `omx.v1.corrupt.*` + queue | data + backups | Settings → Delete all (default focus Cancel) | storage ว่าง | P1 | e2e | A "delete all data", Q TC-140 | Pass | 2026-11-13 |
| TC-143 | OMX-030 | Network allowlist: same-origin เท่านั้นระหว่าง slip flow | — | upload → OCR → save | 0 request ไป origin อื่น | P1 | e2e | A "network allowlist", RO | Pass | 2026-11-13 |
| TC-144 | OMX-030 | CSP meta จำกัด `connect-src` self + Google domains | — | ตรวจ `dist/index.html` | `connect-src 'self' blob: data: accounts.google.com, oauth2.googleapis.com, photospicker.googleapis.com, *.googleusercontent.com` | P1 | manual | M | Pass | 2026-11-13 |
| TC-145 | OMX-030 | ไม่เก็บรูปเต็ม (เฉพาะ derived fields + hash) | saved slip | ตรวจ localStorage | ไม่มี image data | P1 | unit + manual | S queueStore, M | Pass | 2026-11-13 |
| TC-146 | OMX-030 | Trust message + ลิงก์ Privacy บนหน้า Add (TH/EN) | — | เปิด `#/add` | "รูปของคุณไม่ถูกส่งออกจากเครื่อง" + ลิงก์ | P1 | manual | M, X screenshot | Pass | 2026-11-13 |
| TC-147 | OMX-031 | XSS ใน OCR text / payee / backup JSON ไม่ทำงาน | `slip-xss`, b12 | import + render | text only | P1 | e2e | A, BM b12 | Pass | 2026-11-13 |
| TC-148 | OMX-031 | ESLint `react/no-danger` = error; lint ผ่าน | — | `npm run lint` | 0 warnings | P2 | unit | eslint | Pass | 2026-11-13 |
| TC-149 | OMX-031 | gitleaks ใน CI; ไม่มี token ใน storage | — | CI / ตรวจ storage | 0 secret; storage keys = `omx.v1` เท่านั้น | P2 | manual | M (storage) | Partial: storage Pass, gitleaks Blocked (B1) | 2026-11-13 |

## Exploratory matrix & OCR benchmark

| ID | Story | Title | Preconditions | Steps | Expected | Prio | Type | Automated | Result | Run date |
|---|---|---|---|---|---|---|---|---|---|---|
| TC-150 | 024–027 | Matrix TH light (375 + 1280, 5 routes) | seed | X | no overflow, no raw key, lang=th, no console error | P1 | e2e | X | Pass | 2026-11-13 |
| TC-151 | 024–027 | Matrix TH dark | seed | X | + dark bg | P2 | e2e | X | Pass | 2026-11-13 |
| TC-152 | 024–027 | Matrix EN light | seed | X | + ไม่มีไทยใน UI chrome | P1 | e2e | X | Pass | 2026-11-13 |
| TC-153 | 024–027 | Matrix EN dark | seed | X | ตามข้างต้น | P2 | e2e | X | Pass | 2026-11-13 |
| TC-160 | 006–010 | Layer A golden OCR-text (32 fixtures) | — | `npm test` | type/amount ≥ 95% | P1 | unit | G | Pass (type 100%, amount 100%, date 100%, category 90.6% — 3 = BUG-006) | 2026-11-13 |
| TC-161 | 006–010 | Layer B real-OCR benchmark (27 images: 18 base + 9 degraded) | built app | BM | type ≥ 90, amount ≥ 80, category ≥ 60 | P1 | e2e | BM | Pass (100 / 96.3 / 92.6; date 100) | 2026-11-13 |
| TC-162 | 006–010 | Robustness: JPEG q35–55 low-res, blur, rotate 2°, dark theme | — | BM d13–d24 | ผลเท่ากับ base | P2 | e2e | BM | Pass (9/9 all fields) | 2026-11-13 |
| TC-163 | 006–010 | Real-world accuracy (Layer C / customer slips) | สลิปจริง | วัด accuracy | ตาม MVP metrics | P1 | manual | — | Blocked (ยังไม่ได้รับสลิป A5; UAT exit #3) | — |

---

## Execution totals (2026-11-13)

| Result | Count |
|---|---|
| Pass | 115 (รวม 4 เคสที่ Pass หลัง QA แก้ BUG-001/002/004/005 และ re-test) |
| Fail | 4 — TC-069 (BUG-006 Medium), TC-120 (BUG-003 Medium), TC-045 (BUG-007 Low), TC-095 (BUG-008 Low) |
| Blocked | 12 — B1 (push/Pages): TC-137, 138, 139 · B2 (Google Client ID): TC-015, 016, 017 · อุปกรณ์จริง/เครื่องมือ: TC-008, 118, 135, 141 · data (Layer C): TC-163 · partial: TC-149 (gitleaks) |
| Not run | 1 — TC-142 (1,000 rows perf, ต้องอุปกรณ์อ้างอิง) |
| **Total** | **132** |

> นับตามแถวในตาราง (TC ที่ "Pass (after fix)" = Pass หลัง re-test). Automated run counts: Vitest 197/197 · Playwright mobile+desktop+screens 87 passed / 1 skipped (by design) · qa-explore 4/4 · real-ocr 2/2
