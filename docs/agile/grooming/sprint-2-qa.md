# Sprint 2 Grooming — QA Input: BUG-009 / BUG-010 (OMX-049, OMX-050)

> Author: QA · Ceremony: Backlog Grooming (Sprint 2 Day 0) · Date: 2026-11-23 · Status: Draft for team discussion
> Inputs: [`HANDOFF.md`](../HANDOFF.md) ข้อ 4, FB-011 ใน [`feedback-log.md`](../feedback-log.md), [`bug-report.md`](../../qa/bug-report.md) BUG-009/010, [`test-summary-report.md` §7](../../qa/test-summary-report.md)
> **เอกสารนี้ไม่ได้แก้ backlog** — estimate/AC ที่เสนอเป็น suggestion ให้ PO ตัดสินใน `01-product-backlog.md`

## 0. TL;DR

1. ทั้งสอง bug เป็น **parser bug** (`parties.ts`, `categorize.ts` / `categories.rules.ts`) → ทดสอบหลักที่ **Layer A (OCR text → parser)** ได้เร็วและ deterministic ไม่ต้องใช้รูป
2. **ห้ามใช้ หรือ commit รูปสลิปจริงเด็ดขาด** — fixture = OCR text ที่ผู้ใช้ copy จากหน้า Review (ปุ่มดู OCR text) บนเครื่องตัวเอง แล้ว **ปิดชื่อ/เลขบัญชี/เลขอ้างอิง** ตาม §2 ก่อนส่งให้ทีม
3. Regression risk หลัก: การเปลี่ยน precedence ของ category (BUG-010) อาจทำให้ Bills/Housing บน synthetic set เพี้ยน และ rule ผู้รับแบบไม่มี label (BUG-009) อาจหยิบชื่อผู้โอน/ชื่อธนาคาร → gate: Layer A 100%, Layer B **27/27 ทุก field ไม่ลด**
4. QA effort รวมประมาณ **1.5–2 วัน-คน** (≈ 3 pts ฝั่ง QA ถ้ารวมใน estimate ของ story) — รายละเอียด §5

## 1. Test approach

| Level | BUG-009 (OMX-049) payee ใต้ลูกศร ↓ | BUG-010 (OMX-050) category precedence + fuzzy | เครื่องมือ |
|---|---|---|---|
| **Layer A** golden text (CI gate) | fixture redacted 3 แบบ: KBank "make by KBank", K PLUS, variant ที่ OCR ทำลูกศร "↓" หาย/เป็นขยะ · negative: ห้ามได้ชื่อผู้โอน, ชื่อธนาคาร, บรรทัด masked account | Case A "จ่ายบิลสำเร็จ" + ร้าน "…ไก่ย่าง…" + biller "…FOOD" → `food` · Case B "ชำระเงินสำเร็จ" + "บลูเพย-ลาชาดาเพย" → `shopping` · fuzzy variants: ลาซาด้า/ลาชาดา/Lazada/LazPay, Shopee/ช้อปปี้/ShopeePay | `qaGolden.test.ts` (Vitest) |
| **Unit** (Dev) | rule หา masked account `XXX-X-X####-X` แบบทน noise (`X`↔`x`/`×`, ขีดหาย) | ตาราง precedence: merchant/biller > transaction-type phrase; "จ่ายบิล/ชำระเงิน" = fallback → bills | `typeAndCategory.test.ts`, test ใหม่ของ `parties.ts` |
| **Layer B** synthetic image (benchmark) | เพิ่ม template "arrow layout" (ธนาคารสมมติ, ชื่อสมมติ) 1 base + 1 degraded | เพิ่ม template บิลร้านอาหาร (biller "…FOOD") + ชำระ e-wallet marketplace สมมติ 1–2 ใบ | `generate.mjs` + `benchmark.real-ocr.spec.ts` |
| **Layer C** real (manual, ไม่ใช่ CI gate) | ผู้ใช้ re-test สลิปจริง 3 ใบเดิมบนเครื่องตัวเองด้วย build ใหม่ (Pages หรือ `npm run preview`) แล้วรายงานเฉพาะตัวเลข ถูก/ผิดต่อ field | เหมือนกัน | TC-163 re-run |

ข้อเสนอเพิ่มเพื่อให้วัด payee ได้จริง (ตอนนี้ยังไม่มี): ขยาย `QaFixture.expected` ด้วย `payee?: string` (เทียบหลัง `normalizePayee`) และให้ benchmark รายงาน payee exact-match % ตาม OMX-009 AC6 — **report only, ไม่ gate** ใน Sprint 2

## 2. Fixture แบบปิดชื่อ/เลขบัญชี (redaction guideline)

**กฎเหล็ก:** รูปสลิปจริงไม่เข้า repo, ไม่เข้า sandbox/agent, ไม่แนบใน issue/PR/chat — ใช้เฉพาะ *ข้อความ OCR* ที่ปิดข้อมูลแล้ว

| ข้อมูลในข้อความ OCR | แทนด้วย | หมายเหตุ |
|---|---|---|
| ชื่อ–นามสกุลผู้โอน/ผู้รับ | ชื่อสมมติที่ **จำนวนพยางค์/ความยาวใกล้เคียง** และคงคำนำหน้า เช่น `นาย ทดสอบ ระบบ`, `น.ส. สมมติ ใจดี` | คง OCR noise รอบชื่อไว้ (เช่น "แนายข") เพราะเป็นสิ่งที่ parser ต้องทน |
| เลขบัญชี | คงรูปแบบ masked เดิม แต่เปลี่ยนตัวเลขที่เห็น: `XXX-X-X1234-X` → `XXX-X-X0000-X` | **ต้องคง pattern** เพราะ BUG-009 ใช้เป็น anchor |
| เลขอ้างอิง / รหัสรายการ / QR payload | `REF0000000000` ความยาวเท่าเดิม | |
| ชื่อร้าน / biller | คง **คำที่เป็นตัวตัดสิน category** ("ไก่ย่าง", "FOOD", "ลาชาดาเพย") แต่เปลี่ยนส่วนที่ระบุตัวร้านได้ เช่น `ร้านไก่ย่างสมมติ`, `TEST…FOOD` | |
| ยอดเงิน / วันที่ / เวลา | ปรับเล็กน้อยได้ (เช่น ±1 วัน, ยอดปัดใหม่) แต่ต้องอัปเดต `expected` ให้ตรง | ลดโอกาส re-identify |
| ตัวอักษรขยะจากรูปการ์ตูน/QR | **คงไว้** | เป็น noise จริงที่ต้องทน |

Workflow: ผู้ใช้ copy OCR text → ปิดข้อมูลตามตาราง → ส่งข้อความให้ PO → QA ตรวจซ้ำ (ไม่มีชื่อจริง/เลขบัญชีเต็ม/เบอร์โทร/เลขอ้างอิงจริง) ก่อนเพิ่มเป็น fixture id `real-redacted-*` + comment ที่มา (`FB-011, redacted 2026-11-xx`) · ถ้าสงสัยว่าปิดไม่หมด → ไม่ commit

## 3. Regression risk ต่อ OCR accuracy เดิม (27 สลิปสังเคราะห์ + Layer A 35 fixtures)

| Risk | ผลกระทบที่อาจเกิด | Guard / fixture ที่ต้องยังผ่าน |
|---|---|---|
| R-A merchant > phrase precedence (BUG-010) | บิลจริงที่ biller มีคำกำกวมถูกย้ายออกจาก Bills | Layer B b05, b06, b16 (bills), b09 (housing), b17 (shopping), b18 (entertainment) · Layer A Grab/GrabFood, Café Amazon > PTT |
| R-B fuzzy keyword (ลาชาดา/ช้อปปี้) | false positive กับชื่อคน/ร้านที่มีพยางค์คล้าย | negative fixture ใหม่ อย่างน้อย 2 ตัว (ชื่อบุคคล/ร้านที่มี "ลา…", "ช้อป…") · BUG-006 guards ("นาขวัญ ฟาร์มสุข", "สวนนายเฒ่า") |
| R-C payee rule ไม่มี label (BUG-009) | หยิบชื่อผู้โอนหรือชื่อธนาคาร → category transfer ผิด/ถูกโดยบังเอิญ | Layer B b01, b08, b12, d15 (transfer) ยังเป็น `transfer`; b08 (received, K6) ไม่เปลี่ยน type · negative: ผู้โอนเป็นบุคคล ผู้รับเป็นร้าน → ต้องไม่เป็น `transfer` |
| R-D OCR text normalization เพิ่ม (เช่น "ชําระเจิน") | กระทบ amount/date label matching | Layer A `rec-b01..b12`, `qa-ocr-month-*` |
| R-E performance | regex fuzzy หนักขึ้นใน parse | parse 27 รูปยัง ~1.4–1.7 s/รูป (OCR เป็นตัวหลัก) — ไม่ต้องวัดแยก |

**Regression gate (ต้องเขียวก่อน merge):** Layer A type/amount/date/category **100%** (35 + fixture ใหม่) · Layer B **27/27** type/amount(26/27 — b16 = BUG-007)/category/date ไม่ลดจาก `benchmark-results.json` ปัจจุบัน · e2e ทั้งหมดเขียวใน CI

## 4. DoD ด้าน test (สำหรับ OMX-049 / OMX-050)

- [ ] Fixture redacted ของสลิปจริงที่ทำให้เกิด bug อยู่ใน Layer A และ **ผ่าน** (ไม่มี `knownBug`) + negative fixture ≥ 2 ต่อ story
- [ ] QA review fixture แล้วว่าไม่มีข้อมูลส่วนบุคคล (checklist §2) — **ไม่มีไฟล์รูปสลิปจริงใน diff** (`git diff --stat` ไม่มี `.png/.jpg/.heic` นอก `tests/fixtures/slips/images` ที่ generate จาก template)
- [ ] Layer B template ใหม่ (ธนาคาร/ชื่อสมมติ) เพิ่มใน `generate.mjs` + `expected.json` และ benchmark ผ่าน gate; `benchmark-results.json` อัปเดต
- [ ] Regression gate §3 เขียว + CI บน GitHub เขียว (PR — ใช้ยืนยัน TC-138 แบบ PR trigger ไปด้วย)
- [ ] TC ใหม่ใน `docs/qa/test-cases.md` (TC-070 series / payee) + BUG-009/010 ใน `bug-report.md` เปลี่ยนเป็น Closed หลัง QA re-test
- [ ] **Layer C re-test** โดยผู้ใช้บนสลิปจริง 3 ใบเดิม (บนเครื่องตัวเอง): payee ≥ 2/3, category ≥ 2/3 (= ≥ 60% บน n = 3) — ถ้าไม่ถึงให้ PO ตัดสินตาม UAT exit #3 ไม่ block merge อัตโนมัติ
- [ ] (BUG-009) benchmark รายงาน payee exact-match % (report only)

## 5. Test effort estimate (QA)

| งาน | BUG-009 | BUG-010 | หมายเหตุ |
|---|---|---|---|
| รับ/ตรวจ redaction OCR text + เขียน Layer A fixture (+negative) | 0.25 วัน | 0.25 วัน | ขึ้นกับผู้ใช้ส่ง OCR text ให้เร็ว (dependency) |
| ขยาย `QaFixture` + test รายงาน payee | 0.25 วัน | — | ร่วมกับ Dev |
| Layer B template ใหม่ + regenerate + benchmark | 0.25 วัน | 0.25 วัน | |
| Regression run + อัปเดต test-cases / bug-report / summary | 0.25 วัน | 0.25 วัน | ทำรอบเดียวถ้า merge พร้อมกันได้ |
| Layer C re-test ประสานกับผู้ใช้ | 0.1 วัน | 0.1 วัน | |
| **รวม** | **~1.1 วัน** | **~0.85 วัน** | **≈ 1.5–2 วัน-คน** (ถ้าทำคู่กันลด overhead ได้) |

ข้อเสนอต่อ estimate ของ PO (OMX-049 = 3, OMX-050 = 5): QA เห็นว่า **OMX-049 ควรเป็น 5** เพราะต้องขยาย fixture schema + benchmark ให้วัด payee ได้ก่อน (ยังไม่เคยวัดมาก่อน) · OMX-050 = 5 เหมาะสม (มี regression surface กว้างสุด)

**Dependency / risk ต่อ sprint:** ถ้าไม่ได้ OCR text ที่ปิดข้อมูลจากผู้ใช้ภายใน Day 2 → QA จะสร้าง fixture จากคำบรรยายใน FB-011 (layout ↓, "ไก่ย่าง"/"FOOD", "บลูเพย-ลาชาดาเพย") แทน แต่ความมั่นใจต่ำกว่า และ Layer C re-test ยังต้องใช้ผู้ใช้
