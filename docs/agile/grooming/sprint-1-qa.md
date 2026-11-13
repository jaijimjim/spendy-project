# Sprint 1 Grooming — QA Input: Omnitrix Money (MVP_0001)

> Author: QA · Ceremony: Backlog Grooming (Day 0) · Date: 2026-11-13 · Status: Draft for team discussion
> Inputs: `docs/agile/00-team-charter.md`, `docs/agile/01-product-backlog.md`
> Scope: ทุก story ระดับ **Must / Should** (OMX-001 – OMX-031). Story ระดับ Won't (OMX-032 – 038) ไม่ได้ review
> **เอกสารนี้ไม่ได้แก้ backlog**: ข้อเสนอแก้ AC ทั้งหมดเป็น *suggestion* ให้ PO ตัดสินใจและอัปเดตเองใน `01-product-backlog.md` (ตาม Change Coordination §8)
> **ยังไม่มี test case**: test case (Given/When/Then แบบละเอียด) จะเขียนหลัง Sprint Planning เมื่อ AC ถูก finalize แล้ว

---

## 0. TL;DR สำหรับทีม

1. **Testability โดยรวมดี**: AC ส่วนใหญ่อยู่ในรูป Given/When/Then และวัดผลได้ แต่มี **7 story ที่ QA ขอให้แก้ AC ก่อนจะถือว่าผ่าน DoR** (ดู §1.1): OMX-006, 007, 008, 010, 011, 014, 029 เพราะยังมีกฎ precedence ที่กำกวม, threshold ที่ไม่ได้นิยาม หรือคำว่า "responsive / mid-range" ที่วัดไม่ได้
2. **Negative/edge case ที่ขาดและมีความเสี่ยงสูงสุด**: สลิปเงินเดือนที่มีคำว่า "โอนเงินสำเร็จ" (type conflict), "Grab" vs "GrabFood" (category conflict), dd/mm vs mm/dd, timezone/เที่ยงคืน, เปิดหลาย tab แล้วเขียน localStorage ทับกัน, CSV formula injection และ floating-point ตอนรวมยอด
3. **Test data**: เสนอให้ QA **สร้างสลิปสังเคราะห์ (synthetic PNG) ด้วยโปรแกรม** พร้อม ground-truth JSON เป็นชุดหลักที่ commit ใน repo ได้ และมี **OCR text fixture** สำหรับ parser unit test ส่วนสลิปจริงใช้เป็นชุด calibration ส่วนตัวขนาดเล็ก ซึ่ง **ห้าม commit เพราะ repo/Pages เป็น public**
4. **Open Question #1 "ใครจัดหาสลิปตัวอย่าง"**: **QA เป็นเจ้าของ (owner)** ชุด fixture ทั้งหมด, ทีมช่วยบริจาคสลิปจริงที่ปิดข้อมูลแล้ว, **PO ขอสลิปเงินเดือนจริงที่ปิดข้อมูลแล้ว** จากลูกค้า (รายละเอียดอยู่ใน §4)
5. **Testability hooks ที่ขอจาก Dev**: OCR service ต้อง inject/mock ได้, inject clock ได้, storage adapter ต้อง inject ได้, Google API ต้องอยู่หลัง wrapper และกำหนด `data-testid` convention (§2.4)

---

## 1. Testability Review (per story)

**Legend:** **OK** = ทดสอบได้ตามที่เขียน · **Minor** = ทดสอบได้ แต่ควรปรับถ้อยคำ/เพิ่ม edge case (ไม่ block DoR) · **Rewrite** = มีความกำกวมที่ทำให้ตัดสิน Pass/Fail ไม่ได้ ควรแก้ก่อนเข้า Sprint

### 1.1 Summary table

| ID | Pri | Verdict | Key testability concern (สรุป) |
|---|---|---|---|
| OMX-001 | M | Minor | 10 MB boundary (MB vs MiB), ตรวจ type จาก MIME/magic bytes หรือ extension, limit 20 นับก่อนหรือหลังกรอง |
| OMX-002 | S | Minor | "visually highlighted" ยังไม่ระบุเกณฑ์, drop folder/URL |
| OMX-003 | M | Minor | ต้องระบุ scope string, timeout ของ session, กรณีเลือก HEIC/วิดีโอใน Picker; ส่วนใหญ่ต้องทดสอบแบบ manual |
| OMX-004 | M | OK | ข้อความ network error ของ AC3 ยังไม่มี copy |
| OMX-005 | M | Minor | "without freezing UI" วัดไม่ได้, Cancel ระหว่าง item กำลังทำงานยังไม่นิยาม |
| OMX-006 | M | **Rewrite** | precedence เมื่อเจอทั้ง keyword salary และ transfer, นิยาม confidence High/Med/Low, นิยาม "fixture set" ใน AC5 |
| OMX-007 | M | **Rewrite** | สลิปที่มีหลายตัวเลข (ยอดคงเหลือ, ค่าธรรมเนียม, ยอดรวมก่อนหัก), กติกา precision/rounding, ช่วงค่าที่ยอมรับได้ |
| OMX-008 | M | **Rewrite** | dd/mm vs mm/dd, timezone ของ "future", ช่วงปีที่เป็นไปได้, keyword ของ pay date |
| OMX-009 | S | Minor | เกณฑ์ "ถูกต้อง" ของชื่อภาษาไทยที่ OCR อ่านผิดบางตัวอักษร |
| OMX-010 | M | **Rewrite** | "highest weight/most specific" ไม่มีตาราง weight, conflict Grab/GrabFood และ 7-Eleven, ยังไม่มี accuracy target ≥60% ใน AC |
| OMX-011 | S | **Rewrite** | "same amount + date/time + payee" ยังไม่มี tolerance/normalization, ไฟล์เดียวกันจาก Google Photos กับ local มี hash ต่างกัน |
| OMX-012 | M | Minor | หลัง Save item ที่ไม่ถูกเลือกหรือไม่ valid ไปไหน, ความยาว truncate, Save บางส่วนตอน storage เต็ม |
| OMX-013 | M | Minor | ค่าสูงสุดของ amount, ทศนิยมเกิน 2 ตำแหน่ง, double-submit |
| OMX-014 | M | **Rewrite** | AC4 "remains responsive" วัดไม่ได้, tie-break เมื่อวันเวลาเท่ากัน |
| OMX-015 | S | Minor | search amount แบบ "1250" ต้อง match "1,250.00" หรือไม่, partial match |
| OMX-016 | M | Minor | Undo เมื่อเปลี่ยนหน้า/reload ระหว่าง 5 s, แก้วันที่ไปเดือนอื่น |
| OMX-017 | M | Minor | "current month" อิง timezone ไหน, ข้ามปี Dec→Jan (BE เปลี่ยน), เลือกเดือนในอนาคตได้หรือไม่ |
| OMX-018 | M | Minor | floating-point rounding, แสดง "−0.00", ตัวเลขหลักล้าน |
| OMX-019 | S | Minor | % รวมไม่เท่ากับ 100 เพราะปัดเศษ, "contrast guidelines" ต้องระบุ ≥3:1 |
| OMX-020 | S | OK | ช่วง 6 เดือนข้ามปี (เพิ่มเป็น edge case) |
| OMX-021 | M | Minor | key/ตำแหน่งของ backup copy ตาม AC4, หลาย tab เขียนพร้อมกัน, Safari eviction |
| OMX-022 | S | Minor | merge ซ้ำ 2 ครั้ง, schema เวอร์ชันใหม่กว่า, ไฟล์ใหญ่/ไม่ใช่ JSON |
| OMX-023 | S | Minor | ยังไม่มี format ของ date/amount ใน CSV, **CSV/formula injection** |
| OMX-024 | M | Minor | AC5 "QA scans" ต้องเปลี่ยนเป็นการตรวจอัตโนมัติ (key parity), `th-TH` → TH |
| OMX-025 | M | OK | เสนอให้เพิ่ม 320px (WCAG reflow) |
| OMX-026 | M | Minor | AC3 ต้องมีวิธี trigger error ใน test |
| OMX-027 | M | Minor | ระบุชุด screen reader/browser, axe "critical" → "critical + serious" |
| OMX-028 | M | OK | ทดสอบได้จาก Actions log และ URL |
| OMX-029 | S | **Rewrite** | "4G profile", "mid-range phone", "large images" ยังไม่นิยามเป็นค่าที่วัดได้ |
| OMX-030 | M | OK | ทดสอบได้ด้วย network allowlist อัตโนมัติ (ขึ้นกับ Open Q#2) |
| OMX-031 | S | OK | ต้องมี XSS payload fixture |

> นับรวม: OK 6 · Minor 18 · Rewrite 7 (OMX-006, 007, 008, 010, 011, 014, 029). ใน 7 story นี้มี **5 story ระดับ Must** (006, 007, 008, 010 อยู่ใน Slice 2 slip core และ 014 อยู่ใน Slice 1), ดังนั้นควรแก้ก่อน Sprint Planning

---

### 1.2 Detail per story: issues · suggested rewrites · missing negative/edge cases

#### E1 — Slip Import

**OMX-001 Upload slip images**: *Minor*
- Issues
  - AC2: ตรวจ type จาก extension, MIME (`file.type`) หรือ magic bytes? ถ้าไฟล์ PDF ถูก rename เป็น `.jpg` จะ pass AC2 แต่ไปพังตอน OCR
  - AC3: "10 MB" คือ 10,000,000 bytes หรือ 10,485,760 bytes (MiB)? ต้องรู้เพื่อทำ boundary test
  - AC4: limit 20 นับ **ก่อน** หรือ **หลัง** กรองไฟล์ invalid ออก? และนับ **ต่อ selection** หรือ **รวมกับคิวที่มีอยู่แล้ว**?
  - AC5: ทำ automation ไม่ได้ (native picker) จึงต้องเป็น manual บน iOS/Android จริง
- Suggested rewrite
  - AC2 → "…a file whose content is not JPG/PNG/WebP (checked by MIME type **and** file signature; extensions `.jpg/.jpeg/.png/.webp` case-insensitive)…"
  - AC3 → "Given a file larger than 10 MiB (10,485,760 bytes)… a file of exactly 10,485,760 bytes is accepted."
  - AC4 → "Given the queue would exceed 20 **valid** items (existing queue + new selection), Then only the first items up to a total of 20 are queued in selection order and a message states how many were skipped."
- Missing negative / edge cases: 0-byte file; ไฟล์รูปเสีย (header ถูกแต่ข้อมูลขาด); ภาพ dimension ใหญ่มาก (เช่น 8000×8000 แต่ไฟล์ < 10 MB); ชื่อไฟล์ภาษาไทย/อีโมจิ/ยาวมาก; เลือกไฟล์ชื่อเดียวกันซ้ำ; กดยกเลิก picker (ต้องไม่มี error); upper-case `.PNG`; animated WebP; เลือกเพิ่มระหว่างที่ OCR กำลังทำงาน

**OMX-002 Drag & drop**: *Minor*
- Issues: AC1 "visually highlighted" ควรระบุว่าเปลี่ยน border/background และ **ไม่ใช้สีเพียงอย่างเดียว** (มีข้อความตามที่ระบุแล้ว ถือว่าใช้ได้). เพิ่มข้อกำหนดว่า highlight ต้องหายเมื่อ drag ออกนอกพื้นที่
- Missing: drop **folder**; drop link/ข้อความ/รูปจาก tab อื่น (ได้ URL ไม่ใช่ File); drop ซ้ำหลายครั้งต่อกัน (นับ limit รวม); `dragleave` flicker เมื่อลากผ่าน child element; drop บน mobile (ไม่รองรับ จึงต้องไม่แสดง zone ที่ทำให้สับสน)

**OMX-003 Google Photos Picker**: *Minor* (ความเสี่ยงสูง ทดสอบยาก)
- Issues
  - AC1: ให้ระบุ scope ตรงตัว: `https://www.googleapis.com/auth/photospicker.mediaitems.readonly` จะได้ตรวจได้จาก URL ของ consent
  - AC2/AC4: "times out" ใช้เวลาเท่าไร? (Picker session มี `expireTime` และต้องกำหนด polling interval/timeout ฝั่ง app เช่น poll ทุก 3 s, หยุดเมื่อครบ session expiry หรือ 10 นาที)
  - AC3: ถ้าผู้ใช้เลือก **HEIC** (iPhone) หรือ **วิดีโอ** ใน Picker app ต้องปฏิเสธตามกฎ OMX-001 หรือไม่? ถ้าเลือก > 20 รูปจะทำอย่างไร?
  - AC6: "silently **or** via consent" ถือว่ายอมรับได้ทั้งสองแบบ ก็ทดสอบได้ แต่ควรระบุว่า **ต้องไม่ทำงานผิดเงียบ ๆ** (ต้องไม่ fail แบบเงียบ)
  - Automation: OAuth และ Picker UI ของ Google ทำ e2e จริงไม่ได้ (bot detection, 2FA) จึงทดสอบ e2e แบบ **stub GIS/Picker wrapper** และทำ **manual** บน account ทดสอบจริง
- Suggested addition: AC7 "Given the Picker returns media that are not supported images (video/HEIC/GIF), Then those items are skipped with the same message as OMX-001 AC2."
- Missing: popup ถูก block (Safari iOS เปิด tab ใหม่แล้วกลับมา); ผู้ใช้สลับ tab ระหว่าง polling; network หลุดระหว่าง download; token หมดอายุ **ระหว่าง** download; account ที่ไม่ได้อยู่ในรายชื่อ OAuth test users (consent screen อยู่ในโหมด Testing จะได้ error 403 `access_denied`); กด Import ซ้ำระหว่างที่ session เดิมยังเปิดอยู่

**OMX-004 Not configured & auth errors**: *OK*
- เพิ่ม copy ภาษา TH/EN สำหรับ AC3 (เช่น "เชื่อมต่อ Google ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต / Couldn't reach Google. Check your connection.")
- Missing: ad-blocker หรือ privacy extension block `accounts.google.com`; client ID ผิดหรือ origin ไม่ได้ authorize (`redirect_uri_mismatch` / `origin_mismatch`) ต้องแสดงข้อความ error ที่เข้าใจได้ ไม่ใช่ค้างอยู่หน้าเดิม

#### E2 — OCR & Smart Extraction

**OMX-005 In-browser OCR with progress**: *Minor*
- Issues
  - AC3 "without freezing the UI" → ให้วัดได้ เช่น "While OCR runs, the Cancel button and navigation respond within 300 ms; OCR runs in a Web Worker (no main-thread long task > 200 ms attributable to OCR)." และระบุ concurrency เป็นตัวเลข (เช่น 1)
  - AC5: item ที่ **กำลัง** recognize ตอนกด Cancel ต้อง abort (ทิ้งผล) หรือรอให้เสร็จ? ต้องระบุอย่างใดอย่างหนึ่ง
  - AC1: OCR "Done" แต่ได้ text ว่างหรือ text ขยะ (เช่น รูปแมว) ถือเป็น Done หรือ Failed? เสนอว่า **Done + Low confidence** แล้วให้ field ว่างไปใช้กติกาของ OMX-007/008
- Missing: โหลด language data ไม่สำเร็จ (offline หรือ CDN ล่ม) ต้องได้ Failed พร้อม Retry ไม่ใช่ spinner ค้างไม่หยุด (เชื่อมกับ OMX-026 AC4); reload หรือปิด tab ระหว่าง OCR (คิวหาย ยอมรับได้ไหม? ควรเตือนด้วย `beforeunload`); tab อยู่ background (iOS อาจ suspend worker); คิว 20 รูปบนมือถือ RAM น้อย (memory crash); รูปเอียง/หมุน 90° (EXIF orientation); รูป dark-mode slip (ตัวอักษรขาวบนพื้นดำ)

**OMX-006 Auto-detect type**: *Rewrite*
- Issues
  - **Precedence ไม่ชัด**: สลิปเงินเดือนบางแบบมีข้อความ "โอนเข้าบัญชี…SCB" หรือ "Transfer"; สลิปโอนเงินอาจมี memo "ค่าเงินเดือนแม่บ้าน" ซึ่งมีคำว่า "เงินเดือน". ถ้าตามที่เขียนไว้ตอนนี้ AC1 กับ AC2 จะ match พร้อมกันทั้งคู่
  - คำว่า "รายได้" กว้างเกินไป (อาจอยู่ใน memo หรือชื่อร้าน)
  - AC4: ยังไม่นิยามว่า High/Medium/Low คำนวณอย่างไร จึงทดสอบไม่ได้
  - AC5: ยังไม่นิยามว่า "QA's fixture set" คืออะไร (จำนวน, องค์ประกอบ) และวัดที่ระดับไหน (text fixture หรือรูป end-to-end)
- Suggested rewrite
  - AC1 → "Given OCR text contains ≥ 1 **strong** salary keyword ("สลิปเงินเดือน", "Payslip", "เงินได้สุทธิ", "Net Pay") **or** ≥ 2 weak salary keywords ("เงินเดือน", "รายได้", "Salary", "รายการหัก"), When classified, Then type = Income, category = `salary`. **Salary rules take precedence over transfer rules.**"
  - AC2 → เพิ่ม: "…and the salary rule in AC1 does not match."
  - AC4 → "Confidence: **High** = strong keyword of one type and none of the other; **Medium** = only weak keywords or keywords of both types; **Low** = default (no match)." (ตัวเลขจริงให้ Dev เสนอ แต่ต้องเขียนลงใน AC หรือเอกสาร rule)
  - AC5 → "Given the **golden OCR-text fixtures** (§4 Layer A), ≥ 98% correct type (parser unit test, CI gate). Given the **synthetic slip image set** (§4 Layer B), ≥ 90% correct type end-to-end (OCR benchmark, reported per build)."
- Missing: สลิป "ได้รับเงินโอน" (เราเป็นผู้รับ) ตาม Open Q#3 ค่าเริ่มต้นคือ Expense ต้องมี test ที่ยืนยันพฤติกรรมนี้ไว้, และ **ควรได้ confidence Medium/Low** เพื่อให้ผู้ใช้สังเกตเห็น; สลิปจ่ายบิล/เติมเงิน; สลิปถอนเงินไม่ใช้บัตร; OCR text ว่าง; text เป็นภาษาอังกฤษล้วน (SCB EASY EN mode); keyword ถูก OCR ตัดคำผิด ("โอน เงิน สำเร็จ" มีช่องว่างแทรก, "สําเร็จ" สระอำแบบแยกตัว `ํ+า` แทน `ำ`). **Thai Unicode normalization ต้องมีอยู่ใน AC หรือ tech note**

**OMX-007 Extract amount**: *Rewrite*
- Issues
  - สลิปโอนบางธนาคารแสดง **ยอดเงินคงเหลือ** หรือ **ยอดก่อน/หลังส่วนลด** ด้วย ต้องกำหนดว่าใช้ตัวเลขที่อยู่ใกล้ label "จำนวนเงิน/Amount/ยอดชำระ" เป็นหลัก
  - AC2: สลิปเงินเดือนบางแบบไม่มีคำว่า "Net Pay" ตรงตัว (ใช้ "รับสุทธิ", "เงินโอนเข้าบัญชี", "ยอดสุทธิ", "Net Income") ต้องมี label list
  - Precision: ต้องเก็บเป็นทศนิยม 2 ตำแหน่งแบบไม่มี floating error (เสนอให้เก็บเป็น **satang integer** ภายใน) และทดสอบว่า `0.1 + 0.2` ไม่ทำให้ยอดเพี้ยน (เกี่ยวกับ OMX-018)
  - ช่วงค่าที่ยอมรับ: amount = 0.00 หรือ > 10,000,000 ควรถือว่า "สงสัย" แล้ว highlight ไว้ก่อน
- Suggested rewrite
  - AC1 → "Given a transfer slip, When extracted, Then amount = the number adjacent to an amount label (จำนวนเงิน, Amount, ยอดชำระ, ยอดโอน); balance (ยอดเงินคงเหลือ/Balance) and fee (ค่าธรรมเนียม/Fee) values are never used."
  - AC2 → ระบุ label list: "เงินได้สุทธิ, รับสุทธิ, ยอดสุทธิ, Net Pay, Net Income, Net Salary"
  - AC6 (new) → "Given an extracted amount ≤ 0 or > 10,000,000, Then it is shown but highlighted with Low confidence."
- Missing (fixture strings): `"1,250.00"`, `"1250"`, `"฿1,250.50"`, `"1,250.00 THB"`, `"THB 1,250.00"`, `"1,250.00 บาท"`, `"1 250.00"` (OCR แทรกช่องว่าง), `"1,25O.OO"` (O แทน 0), `"l,250.00"` (l แทน 1), `"1,250"` (ไม่มีทศนิยม), `"0.01"`, `"999,999.99"`, `"1,000,000.00"`, ตัวเลขไทย `"๑,๒๕๐.๐๐"`, ทศนิยม 3 ตำแหน่งจาก OCR noise `"1,250.005"`, จำนวนเงินกับหน่วยอยู่คนละบรรทัด, เลขบัญชีหรือเลข Ref ที่หน้าตาเหมือนจำนวนเงิน (`"123-4-56789-0"`, `"0123456789"`) ต้องไม่ถูกเลือกเป็น amount

**OMX-008 Extract date & time**: *Rewrite*
- Issues
  - AC2 `"13/11/2026"` ถ้าเจอ `"01/02/2026"` จะเป็น 1 Feb หรือ 2 Jan? ต้องระบุว่า **slash format = dd/mm/yyyy เสมอ** (ธนาคารไทยใช้แบบนี้)
  - ปีเป็น BE หรือ CE: กติกา "ปี ≥ 2400 = BE" ต้องเขียนไว้ใน AC (`13/11/2569` → 2026-11-13; `13/11/69` → 2-digit = BE)
  - AC4 "future": future เทียบกับเวลาเครื่องใน timezone ไหน? เสนอให้ใช้ **local device time** และอนุญาต tolerance เช่น +1 วัน (เพราะ timezone ต่างกันได้) หรือใช้ Asia/Bangkok
  - ช่วงปีที่เป็นไปได้: ถ้า parse ได้ปี 2500 CE หรือย้อนหลัง 30 ปี ควรถือว่า invalid (เสนอช่วง: ไม่เกินย้อนหลัง 5 ปี)
  - AC3: ต้องมี keyword ของ pay date ("วันที่จ่าย", "วันที่โอน", "Pay date", "Payment date")
- Suggested rewrite
  - AC2 → "…numeric dates are always interpreted as day/month/year; a 4-digit year ≥ 2400 is BE; a 2-digit year is BE (25xx)."
  - AC4 → "Given no valid date, or a date later than today + 1 day (device local time), or earlier than 5 years ago, Then date defaults to today and is highlighted."
  - AC5 (new) → "Given a time in formats `14:35`, `14:35:22`, `14.35 น.`, `02:35 PM`, Then time = 14:35; if no time, time is empty (not 00:00)."
- Missing: ชื่อเดือนเต็ม "พฤศจิกายน"; ชื่อเดือนย่อแบบไม่มีจุด "พย" หรือ OCR อ่านจุดหาย "พ.ย 69"; `"Nov 13, 2026"`; leap day `29 ก.พ. 2567` (valid) กับ `29 ก.พ. 2569` (invalid); วันที่ 31 ในเดือนที่มี 30 วัน; สลิปตอนเที่ยงคืน `00:00`/`23:59` ในวันสิ้นเดือน (ต้องลงเดือนที่ถูก); สลิปเงินเดือนที่มีหลายวันที่ (งวด, วันจ่าย, วันพิมพ์); timezone ของเครื่องไม่ใช่ Asia/Bangkok (persona Mike)

**OMX-009 Extract recipient / memo / bank**: *Minor*
- Issues: ชื่อภาษาไทยมักถูก OCR อ่านผิด 1–2 ตัวอักษร จึงควรกำหนดเกณฑ์ว่าแบบไหนถือว่า "ถูก" เช่น "exact match หลัง normalize whitespace/Unicode" แล้วรายงานผลเป็น **character accuracy (CER)** แทน pass/fail อย่างเดียว. AC3 bank detection ควรมี target (เช่น ≥ 90% ของ synthetic set)
- Missing: masked account หลายแบบ (`xxx-x-x1234-x`, `XXX-X-XX123-4`, PromptPay `xxx-xxx-1234`, เลขบัตรประชาชน masked); ชื่อผู้รับยาวจนถูกตัดเป็น 2 บรรทัด; memo ว่าง; memo มี emoji/HTML (เชื่อม OMX-031); ชื่อร้านใน PromptPay QR (merchant name) แทนชื่อบุคคล

**OMX-010 Auto-categorize**: *Rewrite*
- Issues
  - AC2 "highest weight/most specific" ยังไม่มีตาราง weight จึงตัดสิน Pass/Fail ไม่ได้ เสนอให้ AC อ้างอิง data file ที่มี priority ระบุชัด และกำหนดกติกา "**longest keyword match wins** within the same field; payee > memo > full text"
  - Conflict ใน taxonomy v1 ที่ต้องตัดสินก่อน: `Grab` (transport) vs `GrabFood` (food); `7-Eleven` (food) แต่บางคนซื้อของใช้; `บัตรเครดิต` (bills) vs การโอนจ่ายบัตร; `Central` (shopping) vs `Central Food Hall`; `ปตท`/`PTT` (transport) vs PTT Café Amazon (food, `Amazon Cafe`)
  - ยังไม่มี accuracy target ใน AC (metric ≥ 60% อยู่ใน Vision แต่ไม่อยู่ใน AC)
- Suggested rewrite
  - AC2 → "When several keywords match, the match in the highest-priority field wins (payee > memo > other text); within the same field the **longest** keyword wins; ties resolve by the explicit `priority` value in the dictionary file."
  - AC7 (new) → "Given golden OCR-text fixtures, ≥ 95% correct category; given the synthetic image set, ≥ 60% correct category end-to-end."
- Missing: matching ต้องไม่สนตัวพิมพ์เล็ก/ใหญ่และช่องว่าง ("Grab Food", "GRABFOOD", "grabfood"); keyword เป็นส่วนหนึ่งของคำอื่น (เช่น `MRT` อยู่ในชื่อคน หรือ `AIS` อยู่ใน "RAISIN") ต้องมี word boundary สำหรับคำภาษาอังกฤษ; ชื่อบุคคลแต่มีคำร้านค้าปน ("นาย สมชาย ร้านข้าวมันไก่"); คำนำหน้าแบบย่อ "น.ส.", "ด.ช.", "MISS", "MR"; ผู้รับเป็นบริษัท ("บริษัท … จำกัด") ต้องไม่ถูกจัดเป็น Transfer to person; หมวดหมู่ที่เป็น income แต่ type เป็น expense (ต้องไม่เกิดขึ้น)

**OMX-011 Duplicate detection**: *Rewrite*
- Issues
  - AC1: SHA-256 ของ file bytes: รูปเดียวกันที่มาจาก Google Photos (re-encoded) กับที่ upload จากเครื่องจะมี hash **ต่างกัน**. ไม่ผิด แต่ควรเขียนไว้ใน AC ว่ากรณีนั้นจะถูกจับโดย AC2 แทน
  - AC2: "same amount + date/time + payee" ต้องมี tolerance: time ต่างกันไม่เกิน ±1 นาที? payee normalize อย่างไร (whitespace/ตัวพิมพ์)? ถ้าไม่มี time ล่ะ?
  - "link to the existing transaction" ต้องพาไปที่ไหน (เปิด edit form หรือ highlight ใน list)?
- Suggested rewrite (AC2): "Given a different image but (a) same reference number, or (b) same amount **and** same date **and** time within ±1 minute (or both times empty) **and** normalized payee equal, When reviewed, Then 'Possible duplicate' is shown…"
- Missing: duplicate ระหว่าง item ใน batch เดียวกันที่ hash ต่างกันแต่ ref เดียวกัน (AC4 ครอบคลุมแค่ hash); รายการที่ถูกลบไปแล้วแล้ว import ใหม่ (ต้อง**ไม่**ซ้ำ); duplicate กับรายการ manual (ไม่มี hash/ref, ใช้แค่กฎ (b)); โอนจริง 2 ครั้งยอดเท่ากันในนาทีเดียวกันให้คนเดียวกัน (false positive ยอมรับได้เพราะมี "Save anyway")

#### E3 — Review & Manual Entry

**OMX-012 Review & confirm**: *Minor*
- Issues
  - AC4 "the queue clears": item ที่**ไม่ได้เลือก**หรือ**ไม่ valid** ยังค้างอยู่ใช่ไหม? เสนอ: "saved items are removed from the queue; unselected/invalid items remain."
  - AC7 "raw text (truncated)": truncate กี่ตัวอักษร? (เสนอ ≤ 2,000 chars) จะได้ทดสอบ boundary ได้
  - AC6: ครอบคลุมแค่ in-app navigation หรือรวม refresh/close tab (`beforeunload`) ด้วย?
- Missing: Save all ตอน localStorage เต็มกลาง batch (ต้อง **all-or-nothing** หรือ save ได้บางส่วนพร้อมแจ้งผลชัดเจน; เชื่อม OMX-021 AC3); แก้ type ที่ทำให้ category เดิมไม่ valid (category ต้อง reset ไม่ใช่ค้างค่าเดิม); Save all ตอนไม่มี item ถูกเลือก (ปุ่มต้อง disabled); เปลี่ยนภาษาระหว่างที่มี error แสดงอยู่ (error ต้องแปลตาม); กดขยาย thumbnail บนมือถือแล้วปิดด้วย Esc/back

**OMX-013 Manual entry form**: *Minor*
- Suggested: AC3 เพิ่ม "…or has more than 2 decimal places, or exceeds 99,999,999.99." และระบุว่า `"1,000"` (มี comma) ยอมรับ
- Missing: double-tap Save (ต้องไม่สร้าง 2 รายการ); วันที่ในอนาคตยอมให้ไหม (manual อาจบันทึกล่วงหน้า, PO ตัดสิน); payee/note ยาวมาก (ต้องมี maxLength, เสนอ 100/500); leading/trailing whitespace; numeric keypad บน iOS (`inputmode="decimal"`) แสดง `,` แทน `.` ในบาง locale

#### E4 — Transaction Management

**OMX-014 Transaction list**: *Rewrite* (เฉพาะ AC4)
- AC4 → "Given 500 transactions in the month (seeded), When the list opens, Then first render ≤ 1 s and scrolling has no visible jank (manual check on mid-range Android device; Chrome Performance: no long task > 200 ms)." ให้สอดคล้องกับ OMX-029 AC4
- AC1 เพิ่ม tie-break: "same date → by time desc → by created time desc; items without time come after timed items of that date."
- Missing: รายการที่ amount ยาว (1,000,000.00) ต้องไม่ล้นแถวที่ 360px; payee ยาวต้อง ellipsis; ภาษา TH ใช้ปี BE ทั้งใน header ของกลุ่มวันที่และใน detail

**OMX-015 Filter & search**: *Minor*
- AC3: ระบุว่า search amount ใช้ทั้ง `"1250"` และ `"1,250"` match กับ 1,250.00 (normalize comma), partial match ("125" match 1,250.00 ได้ไหม? เสนอว่าได้แบบ substring)
- Missing: search ภาษาไทยที่มีสระ/วรรณยุกต์ (Unicode normalization NFC); ช่องว่างหน้าหลัง; อักขระพิเศษ regex (`(`, `*`, `\`) ต้องไม่ทำให้ crash; filter ยังค้างไหมเมื่อเปลี่ยนเดือน (PO ตัดสิน, QA เสนอให้คงไว้)

**OMX-016 Edit & delete**: *Minor*
- Missing: แก้วันที่ไปอีกเดือน (รายการต้องหายจาก list เดือนปัจจุบันและไปโผล่ที่เดือนใหม่ ยอดรวมทั้งสองเดือนถูก); Undo แล้วรายการต้องกลับมาที่เดิม (ID เดิม) ; เปลี่ยนหน้า/reload ระหว่าง undo window (ลบถาวร ยอมรับได้แต่ต้องระบุ); ลบ 2 รายการติดกันเร็ว ๆ (undo ใช้ได้กับรายการไหน); แก้ type แล้ว category ต้อง revalidate; Esc ปิด dialog = Cancel

#### E5 — Dashboard & Insights

**OMX-017 Month selector**: *Minor*
- Missing: Dec 2569 → Jan 2570 (BE เปลี่ยน, CE 2026 → 2027); เปิด app ตอน 23:59 วันสิ้นเดือนแล้วข้ามเที่ยงคืน (ยังคงเดือนเดิมจนกว่าจะ reload ยอมรับได้); เลือกเดือนในอนาคตได้ไหม (เสนอ: ปุ่ม next disabled ที่เดือนปัจจุบัน); timezone ไม่ใช่ Bangkok

**OMX-018 Monthly summary**: *Minor*
- Missing: ผลรวมที่เสี่ยงเกิด floating error (เช่น 0.10 + 0.20 ต้องได้ 0.30 ไม่ใช่ 0.30000000000000004); balance = 0 ต้องแสดง `0.00` ไม่ใช่ `−0.00`; ยอดหลักสิบล้านต้องไม่ล้น card ที่ 360px; transaction ที่วันที่อยู่ขอบเดือน (1st 00:00, last day 23:59)

**OMX-019 Category breakdown**: *Minor*
- AC1: ระบุว่าแสดง % ทศนิยม 1 ตำแหน่ง และ **ยอมให้ผลรวมคลาด ±0.1% จากการปัดเศษ** (ไม่อย่างนั้นจะมี bug report ปลอม)
- AC2 "contrast guidelines" → "each slice/bar ≥ 3:1 against background (WCAG 1.4.11) and categories distinguishable without color (labels/patterns/legend order)."
- Missing: มีหมวดเดียว (100%); 12 หมวดพร้อมกัน; หมวดที่ยอดเล็กมาก (< 1%) label ซ้อนกัน

**OMX-020 Monthly trend**: *OK*. Edge case: 6 เดือนข้ามปี (ส.ค. 2569 – ม.ค. 2570), เดือนที่ income อย่างเดียว/expense อย่างเดียว, ค่าที่ต่างกันมาก (scale)

#### E6 — Data & Persistence

**OMX-021 localStorage**: *Minor*
- AC3 → "…the stored value is byte-for-byte identical to the value before the failed save" (วัดได้)
- AC4 → ระบุ key ของ backup เช่น `omx.v1.corrupt-backup` และข้อความ recovery ที่มีปุ่ม export raw
- Missing: **เปิด 2 tab แล้วแก้ข้อมูลพร้อมกัน** (last-write-wins ทำให้ข้อมูลของอีก tab หาย, ถือเป็น data loss ระดับ Critical ตามนิยามของ charter) เสนอให้ฟัง `storage` event หรือ re-read ก่อนเขียน; schema version เก่าหรือใหม่กว่าที่ app รู้จัก; localStorage ถูกปิดทั้งหมด (`SecurityError` ตอนเข้าถึง) เช่น Safari private ของเก่า หรือ cookie ถูก block ต้องไม่ crash ตั้งแต่โหลดครั้งแรก; Safari ITP ลบ storage หลังไม่ได้ใช้งาน 7 วัน (เป็นความเสี่ยงที่ควรเขียนไว้ใน About page ด้วย); ข้อมูลใกล้ 5 MB

**OMX-022 JSON backup**: *Minor*
- Missing: import ไฟล์เดิมซ้ำแบบ Merge (ต้องได้ "Imported 0"); ไฟล์ไม่ใช่ JSON / JSON ที่ถูกต้องแต่ผิด schema / schema version ใหม่กว่า; ไฟล์ใหญ่มาก (เช่น 20 MB); JSON ที่มี payload XSS ใน payee (เชื่อม OMX-031); ชื่อไฟล์ใช้วันที่ local หรือ UTC (เสนอ local); Replace แล้วกด Cancel ที่ confirm ต้องไม่เปลี่ยนอะไร; import บน iOS Safari (file picker เลือกไฟล์จาก Files app)

**OMX-023 CSV export**: *Minor*
- ระบุ format: date = `YYYY-MM-DD` (CE, ไม่ขึ้นกับภาษา UI), amount = เลขบวก 2 ทศนิยมไม่มี comma, type = `income|expense`, category = ID หรือชื่อตามภาษา? (PO/Designer ตัดสิน)
- **Missing (security)**: CSV/formula injection: payee/note ที่ขึ้นต้นด้วย `=`, `+`, `-`, `@`, Tab, CR (มาจาก OCR ของรูปที่ถูกทำขึ้นมาโจมตีได้) ต้องใส่ prefix `'` ตาม OWASP เพิ่มเป็น AC4
- Missing: เดือนที่ไม่มีข้อมูล (ได้ไฟล์ที่มีแค่ header หรือแจ้งว่าไม่มีข้อมูล); เปิดใน Excel Windows/Mac และ Google Sheets แล้วภาษาไทยไม่เพี้ยน

#### E7 — Platform, i18n & UX Quality

**OMX-024 TH/EN switch**: *Minor*
- AC1: ระบุว่า `navigator.languages` ที่ขึ้นต้นด้วย `th` (เช่น `th-TH`) ให้เป็น TH
- AC5 → "Given the i18n resource files, When CI runs, Then a unit test verifies TH and EN have identical key sets with no empty values, and e2e smoke on each screen finds no raw keys (e.g. `dashboard.title`) and no console 'missing key' warnings." (ตรวจอัตโนมัติได้แทนการให้ "QA scans")
- Missing: สลับภาษาระหว่างที่มี dialog/error/toast เปิดอยู่; ข้อความ EN ยาวกว่า TH จนล้นปุ่มที่ 360px; ฟอนต์ไทยแสดงสระบน/ล่างไม่ถูกตัด (line-height)

**OMX-025 Responsive**: *OK*. เสนอให้เพิ่ม 320px ใน AC1 (WCAG 1.4.10 Reflow) และ landscape บนมือถือ; deep-link + refresh บน Pages (AC4) อยู่ใน e2e smoke ทุก deploy

**OMX-026 Empty & error states**: *Minor*
- AC3 ต้องมีวิธี trigger error: เสนอให้ทดสอบ error boundary ด้วย **component test** (render child ที่ throw) แทนการใส่ debug hook ใน production build
- Missing: OCR model โหลดไม่สำเร็จครึ่งทาง; offline → online กลับมาแล้ว retry ได้; error message ไม่เปิดเผย stack trace/ข้อมูลการเงินบนหน้าจอ

**OMX-027 Accessibility**: *Minor*
- AC5 → "Lighthouse a11y ≥ 90 **and** axe-core: 0 critical, 0 serious violations on Dashboard, Transactions, Add slip, Review, Manual form, Settings."
- AC2: ระบุ assistive tech ที่ใช้ verify: **NVDA + Chrome (Windows)**, **VoiceOver + Safari (iOS)**, TalkBack + Chrome (Android, smoke)
- Missing: progress ของ OCR ต้องประกาศผ่าน `aria-live` แบบไม่ถี่เกินไป (ไม่ประกาศทุก 1%); chart ต้องมี alternative (OMX-019/020); toast ของ Undo ต้องเข้าถึงด้วย keyboard ก่อนจะหายไป (WCAG 2.2.1 Timing) **เสี่ยงขัดกับ "≥5 s"** จึงเสนอให้ toast ไม่หายตอนที่มี focus อยู่

**OMX-028 Deploy**: *OK*. วิธีทดสอบ AC1: เปิด PR ทดลองที่ทำให้ test fail แล้วยืนยันว่า job deploy ไม่รัน; AC3: build 2 แบบ (มีและไม่มี `VITE_GOOGLE_CLIENT_ID`) ใน CI

#### E8 — Non-functional

**OMX-029 Performance**: *Rewrite*
- AC1 → "Lighthouse **mobile preset** (simulated Slow 4G, 4× CPU throttle), median of 3 runs on the deployed URL: LCP ≤ 2.5 s; initial JS (all scripts loaded before first interaction) ≤ 300 KB gzipped."
- AC2 → นิยาม "mid-range phone" เป็น **อุปกรณ์จริงที่ระบุรุ่น** (เสนอ Android ราคากลางรุ่นปี 2023–2024 ที่ทีมมี เช่น Samsung Galaxy A-series) + iPhone รุ่น 2–3 ปีก่อน; "typical slip" = synthetic slip 1080×2400 PNG; วัด median ของ 5 รูปหลัง model cached
- AC3 → "Images with long edge > 2,000 px are downscaled to 2,000 px before OCR." (ตัวเลขให้ Dev ยืนยัน)
- AC4: seed 1,000 transactions ผ่าน JSON fixture แล้ววัดจาก performance mark ใน app

**OMX-030 Privacy**: *OK*. ทดสอบอัตโนมัติด้วย Playwright **network allowlist**: ทุก request ระหว่าง flow upload→OCR→save ต้องไปที่ origin ของ Pages (หรือ CDN ที่ pin ไว้ตาม Open Q#2) เท่านั้น, POST/PUT ไป origin อื่นต้องเป็น 0. AC4 เพิ่ม: Delete all ต้องล้างคิว OCR ใน memory และ backup key ของ OMX-021 ด้วย

**OMX-031 Security**: *OK*. ต้องมี fixture: รูปสลิปสังเคราะห์ที่ memo = `<img src=x onerror=alert(1)>` และ JSON backup ที่มี payload เดียวกัน; secret scan (เช่น gitleaks) ใน CI; ตรวจว่าไม่มี token ใน localStorage/sessionStorage หลัง Google import (AC4)

---

### 1.3 Cross-cutting gaps (ใช้กับหลาย story)

| Gap | กระทบ | ข้อเสนอ |
|---|---|---|
| **Thai Unicode normalization** (`ำ` vs `ํ+า`, สระลอย, zero-width space จาก OCR) | 006, 007, 009, 010, 015 | normalize OCR text เป็น NFC + แทน `ํา` → `ำ` ก่อน parse, และมี unit test เฉพาะ |
| **Money representation** (float vs integer satang) | 007, 012, 013, 018, 019, 022, 023 | เก็บ/คำนวณเป็น integer satang, แสดงผลด้วย `Intl.NumberFormat` |
| **Clock & timezone** ("today", "current month", "future") | 008, 013, 017, 018, 022 | ใช้ local device time, inject clock เพื่อทดสอบ, test ใน TZ Asia/Bangkok + 1 TZ อื่น |
| **Multi-tab consistency** | 012, 013, 016, 021, 022 | ตัดสินพฤติกรรม (sync ผ่าน `storage` event หรือเตือน) แล้วเขียนเป็น AC |
| **Confidence model** | 006, 007, 008, 010, 012 | นิยาม High/Med/Low ที่เดียว (เอกสาร rule) แล้วให้ทุก story อ้างอิง |
| **Accuracy targets ระดับไหน** | 006, 007, 010, Vision metrics | แยก **parser-level** (golden text, CI gate) กับ **end-to-end** (synthetic images, report) กับ **real-world** (calibration set, UAT) |

---

## 2. Test Approach

### 2.1 Test levels (test pyramid)

| Level | Tool (proposal) | Scope | When it runs | Owner |
|---|---|---|---|---|
| **Unit** | Vitest | Parser (amount/date/time/payee/bank/ref), classifier (type/category/confidence), Thai normalization, money math, BE↔CE, i18n key parity, storage serializer/migration, CSV escaping, JSON schema validation, duplicate matching | ทุก PR (CI gate) | Dev เขียน, QA ให้ fixture + review coverage ของ edge case |
| **Component** | Vitest + React Testing Library + `vitest-axe` | Forms & validation (012, 013, 016), queue item states (005), filters (015), empty/error states (026), error boundary, language switch re-render (024), confidence/duplicate badges | ทุก PR | Dev + QA |
| **E2E (automated)** | Playwright (Chromium, WebKit, Firefox + mobile emulation) + `@axe-core/playwright` | Critical user journeys บน production build (`vite build && vite preview --base /omnitrix-project/`) โดย **mock OCR** (คืน fixture text) เพื่อให้เร็วและ deterministic; network allowlist (030); routing/refresh (025); persistence/reload (021); export/import (022/023) | ทุก PR (smoke subset) + หลัง deploy (smoke บน Pages URL จริง) | QA |
| **OCR benchmark** | Node script + Tesseract.js (`tha+eng`, same version/config as app) บน synthetic PNG set | End-to-end accuracy ต่อ field และต่อธนาคาร → JSON/Markdown report | Nightly / on-demand / เมื่อแก้ parser หรือ dictionary (ไม่ใส่ใน PR gate เพราะช้า) | QA (Dev ช่วย setup) |
| **Performance** | Lighthouse CI (mobile preset), manual บนอุปกรณ์จริง | 029 | ก่อน Review + UAT entry | QA |
| **Manual exploratory** | Session-based (60 นาที/charter), จดบันทึกใน test notes | ดูรายการ charter ด้านล่าง | ระหว่าง sprint เมื่อ story อยู่ในสถานะ In QA + ก่อน UAT | QA (เชิญ Designer/PO ร่วมบาง session) |
| **Manual scripted (เฉพาะส่วนที่ automate ไม่ได้)** | Checklist | Google OAuth/Picker จริง (003/004), native file picker + camera บนมือถือ (001 AC5), screen readers (027), Excel/Sheets เปิด CSV (023) | ต่อ story ตอน In QA + regression ก่อน UAT | QA |

**Critical user journeys (e2e smoke, ไม่ใช่ test case)**
1. First visit → language default → empty state → manual add → เห็นใน list + dashboard → reload แล้วยังอยู่
2. Upload slips (mock OCR) → progress → review/edit → Save all → dashboard totals ถูก
3. Duplicate slip → warning → Save anyway / skip
4. Edit → Delete → Undo
5. Export JSON → Delete all → Import → data กลับมาครบ
6. Google Photos "Not configured" build
7. Deep link + refresh บน Pages base path

**Exploratory charters (proposal)**
- *Explore* OCR import ด้วยรูปที่ "ไม่ใช่สลิป"/คุณภาพต่ำ/หมุน/ครอปเพื่อค้นหาว่า parser เลือกตัวเลข/วันที่ผิดอย่างไร
- *Explore* การใช้งานเป็น persona P2 Mike (UI EN, สลิป TH, timezone ต่างประเทศ)
- *Explore* การใช้งานเป็น persona P3 ป้าแดง (มือถือจอเล็ก, ตัวอักษรใหญ่ 200%, กรอก manual ต่อเนื่อง 10 รายการ)
- *Explore* ความคงทนของข้อมูล: หลาย tab, private mode, storage เต็ม, import ไฟล์แปลก ๆ
- *Explore* Google Photos บน iOS Safari / Android Chrome (popup, tab switching, token expiry)
- *Explore* a11y ด้วย keyboard-only + screen reader ตลอด flow หลัก

### 2.2 Story → test level mapping

| Story | Unit | Component | E2E auto | OCR bench | Manual |
|---|---|---|---|---|---|
| 001 | type/size validators | queue thumbnails, errors | upload (setInputFiles) | – | native picker/camera iOS/Android |
| 002 | – | drop zone states | drag-drop (dispatch) | – | real drag on desktop browsers |
| 003 | session polling logic (mock) | waiting/cancel UI | stubbed GIS/Picker | – | **real OAuth + Picker** |
| 004 | config detection | disabled button | build w/o client ID; block google domains | – | origin mismatch, ad-blocker |
| 005 | queue state machine | item statuses | mock-OCR flow, cancel | real OCR timing | slow device, background tab |
| 006–010 | **primary** (golden text) | confidence/highlight | – (mocked) | **primary** | exploratory with odd images |
| 011 | hash + matching rules | badges | re-import same file | – | Google vs local same photo |
| 012–013 | validators | **primary** | journeys 1–2 | – | mobile keyboard |
| 014–016 | sort/filter/search | **primary** | journey 4 | – | long lists on device |
| 017–020 | aggregation, month math | charts/table alt | dashboard after changes | – | visual check, SR on charts |
| 021–023 | serializer, schema, CSV | error messages | journey 5, quota stub | – | Excel/Sheets, iOS Files |
| 024 | key parity | re-render | switch + reload | – | copy review with Designer |
| 025 | – | – | 360/768/1280 + refresh | – | real devices, landscape |
| 026 | – | error boundary | offline mode | – | – |
| 027 | – | vitest-axe | axe per screen | – | NVDA, VoiceOver, TalkBack, zoom |
| 028 | – | – | post-deploy smoke | – | Actions log review |
| 029 | – | – | Lighthouse CI | OCR timing | real mid-range device |
| 030 | – | – | **network allowlist** | – | DevTools HAR review |
| 031 | sanitization, schema | text rendering | XSS fixture import | XSS slip image | secret scan review |

### 2.3 Defect severity (proposal ให้ตรงกับ DoD "ไม่มี Critical/High")
- **Critical**: ข้อมูลหาย/เสีย, ข้อมูลหรือรูปถูกส่งออกนอก browser, app เปิดไม่ได้บน Pages, XSS ที่ทำงานได้
- **High**: flow หลัก (upload→review→save, manual add, dashboard) ใช้ไม่ได้บนเบราว์เซอร์ Tier 1, ยอดรวมผิด, a11y blocker (ทำ action หลักด้วย keyboard ไม่ได้)
- **Medium**: extraction ผิดในบางรูปแบบสลิป (ผู้ใช้ยังแก้เองได้), UI ผิดเพี้ยนบน Tier 2, ข้อความไม่ได้แปล
- **Low**: cosmetic, copy เล็กน้อย

### 2.4 Testability hooks requested from Dev (ไม่เปลี่ยน AC; เป็น tech design)
1. **OCR service interface** (`recognize(image) → {text, confidence}`) inject ได้ เพื่อให้ e2e ใช้ fake OCR ที่คืน fixture text ตาม filename
2. **Clock injection** (`now()`) สำหรับ "today", "current month", future-date rule
3. **Storage adapter** inject ได้ (จำลอง `QuotaExceededError`, `SecurityError`, corrupted JSON)
4. **Google APIs wrapper** (GIS + Picker) mock ได้ใน e2e
5. `data-testid` convention: `omx-<screen>-<element>` (ใช้ role/label เป็นหลัก ส่วน testid ใช้เฉพาะที่จำเป็น)
6. Parser แยกเป็น pure functions (`extractAmount(text)`, `extractDate(text)`, …) และ dictionary เป็น data file (OMX-010 AC6) จะได้ table-driven test
7. Tesseract.js version และ config (PSM, preprocessing) ต้องตรงกันระหว่าง app กับ benchmark script (export จาก module เดียวกัน)

---

## 3. Test Environments & Browsers

### 3.1 Environments

| Env | URL / How | Purpose | Google client ID |
|---|---|---|---|
| **Local dev** | `npm run dev` → `http://localhost:5173` | dev + QA debugging | ตั้งได้ (localhost อยู่ใน authorized origins) |
| **CI (GitHub Actions)** | `vite build` + `vite preview` โดยใช้ base `/omnitrix-project/` | unit, component, e2e (mock OCR), 2 build variants (มีและไม่มี client ID), Lighthouse CI | stub / ไม่ตั้ง |
| **Production / UAT** | `https://jaijimjim.github.io/omnitrix-project/` | QA sign-off ตาม DoD #3, post-deploy smoke, UAT | ตั้งค่าจริง (OAuth consent screen ในโหมด **Testing** ต้องเพิ่ม test users สำหรับ QA + ผู้ร่วม UAT) |

> หมายเหตุ: GitHub Pages ไม่มี PR preview ในตัว จึงทำให้ **production = env เดียวที่ QA ทดสอบ "deployed build"** ได้. ความเสี่ยงคือ bug จะไปถึง URL ที่ลูกค้าเห็นก่อน QA ทดสอบ. ข้อเสนอ: ใช้ CI preview build เป็น gate ก่อน merge และถ้าทำได้ให้ deploy ไป path staging แยก (เช่น `/omnitrix-project/staging/` หรือ repo staging) ซึ่งเป็นการตัดสินใจของ Dev/PO

### 3.2 Browser / device matrix

| Tier | Browser / Device | Coverage |
|---|---|---|
| **Tier 1 (full regression)** | Chrome desktop latest (Windows/macOS) | automated + manual |
| | Chrome Android latest บน **อุปกรณ์จริงระดับกลาง** (360–412 px) | manual + Playwright Pixel emulation |
| | Safari iOS latest และ latest-1 บน **iPhone จริง** (390 px) | manual + Playwright WebKit iPhone emulation |
| **Tier 2 (smoke: journeys 1–2, 5, 7)** | Edge desktop, Firefox desktop, Safari macOS, Samsung Internet | Playwright Firefox/WebKit + manual spot-check |
| **Out of scope** | IE, browser เก่ากว่า 2 ปี, in-app browsers (LINE/Facebook) | best effort: บันทึก known issues (Google OAuth มักถูก block ใน in-app browser) |

- **Viewports (OMX-025):** 320*, 360, 390, 412, 768, 1280, 1920 + landscape 1 ขนาด (*ถ้า PO รับ 320)
- **Assistive tech (OMX-027):** NVDA + Chrome (Win), VoiceOver + Safari (iOS), TalkBack + Chrome (Android, smoke), keyboard-only, zoom 200%, `prefers-reduced-motion`
- **Locale / clock:** browser language `th-TH` และ `en-US`; timezone `Asia/Bangkok` และ 1 TZ อื่น (เช่น `America/Los_Angeles`) ตั้งผ่าน Playwright `timezoneId`/`locale`
- **Network:** online, Slow 4G throttle, offline (Playwright `context.setOffline`), block `*.google.com` (004 AC3)
- **Storage modes:** normal, private/incognito (Safari private), storage quota เกือบเต็ม, data ที่ seed ไว้ 1,000 รายการ
- ข้อจำกัด: Playwright WebKit ≠ Safari iOS จริง (file picker, popup, memory limit, worker suspension) ดังนั้น **Safari iOS ต้อง manual เสมอ**

---

## 4. Test Data Strategy for Slips (+ answer to Open Question #1)

### 4.1 Principles
- **Repeatable & deterministic**: data ต้องสร้างซ้ำได้จาก seed เดิมและผลต้องเหมือนเดิมทุกครั้ง
- **Ground truth by construction**: ทุกรูปมี `expected.json` ที่ได้จาก input data ชุดเดียวกับที่ใช้วาดรูป จึงไม่ต้อง label ด้วยมือ
- **No real personal data in the repo**: repo และ GitHub Pages เป็น **public** ห้าม commit สลิปจริงแม้จะปิดข้อมูลแล้ว (ตาม Privacy by default ใน charter §6)
- **No trademark copying**: template **เลียน layout และข้อความ** (ชื่อธนาคารเป็น text, label, ลำดับ field) แต่**ไม่ใช้โลโก้หรือ asset ของธนาคาร**
- **Synthetic accuracy is optimistic**: ผลบน synthetic set จะสูงกว่าโลกจริง จึงต้องมี real calibration set ขนาดเล็กไว้ตรวจสอบ

### 4.2 Three data layers

**Layer A: OCR text fixtures (parser unit tests)**
- ที่เก็บ (proposal): `src/features/extraction/__fixtures__/ocr-text/<case-id>.txt` + `<case-id>.expected.json` (`{type, category, amount, date, time, payee, memo, bank, ref, confidence?}`)
- แหล่งที่มา 3 แบบ:
  1. **Clean text** ที่เขียนตาม layout ของแต่ละธนาคารหรือสลิปเงินเดือน
  2. **Recorded OCR output**: รัน Tesseract.js จริงกับรูปใน Layer B หนึ่งครั้ง แล้ว commit text ที่ได้ ("record & replay") ทำให้ได้ noise ที่สมจริงแต่ unit test ยัง deterministic และเร็ว. Re-record เมื่ออัปเกรด Tesseract/เปลี่ยน preprocessing
  3. **Hand-crafted noise variants**: O↔0, l/I↔1, `,`↔`.`, ช่องว่างแทรกกลางคำไทย, `ำ` แยกเป็น `ํา`, zero-width space, บรรทัดสลับลำดับ, label กับค่าอยู่คนละบรรทัด, ตัวเลขไทย
- ขนาดเป้าหมาย Sprint 1: **~80 cases** (ต่อ field: amount ~25, date/time ~25, type/category ~30 รวม conflict case จาก §1.2)
- ใช้กับ: OMX-006/007/008/009/010/011 unit tests (CI gate) และ e2e แบบ mock OCR (fake OCR คืน text ตาม fixture)

**Layer B: Synthetic slip PNG images (OCR benchmark + e2e upload + manual)**
- **Generator** (proposal): HTML/CSS templates → render เป็น PNG ด้วย **Playwright screenshot** (headless Chromium) เพราะ shaping ภาษาไทย (สระบน/ล่าง, วรรณยุกต์) ถูกต้องแน่นอน และ template แก้ง่าย (Designer ช่วยได้). ทางเลือกคือ `@napi-rs/canvas` (เร็วกว่า แต่ Thai shaping เสี่ยงกว่า)
  - ฟอนต์: ฟอนต์ไทย license OFL (เช่น Sarabun, Noto Sans Thai, IBM Plex Sans Thai, Prompt) **commit ไว้ใน repo** เพื่อไม่ให้ผลขึ้นกับฟอนต์ของเครื่อง
  - Seeded PRNG (`--seed`) สร้าง data: ชื่อปลอม ("นาย ทดสอบ ระบบ", "Ms. Test Account"), เลขบัญชี masked, Ref no., amount, วันที่, merchant ตามหมวดหมู่ใน §3 taxonomy
  - Output: `tests/fixtures/slips/<set>/<case-id>.png` + `<case-id>.expected.json` + `manifest.json` (template, seed, degradation, generator version)
  - Degradation pipeline (หลัง render): downscale (720/1080/1440 width), JPEG q=60/85, WebP, rotate ±2–5°, Gaussian blur σ≤1, noise, low contrast, dark theme, crop ขอบ, เพิ่ม phone status bar (เหมือน screenshot), (later: perspective เหมือนถ่ายจากจอ)
- **Templates (Sprint 1)**

| Template | Type | Variants |
|---|---|---|
| K PLUS-style transfer | Expense | to person, to merchant, bill payment |
| SCB EASY-style transfer | Expense | TH UI, **EN UI** |
| Krungthai NEXT-style transfer | Expense | to person, PromptPay |
| Generic PromptPay / QR payment | Expense | merchant name, mobile number masked |
| Bill payment (การไฟฟ้า, AIS, …) | Expense | ทดสอบ category `bills` |
| Received transfer (เราเป็นผู้รับ) | (Expense by default, Open Q#3) | ใช้ยืนยันพฤติกรรม default |
| Salary slip A: Thai table (รายได้/รายการหัก/เงินได้สุทธิ) | Income | งวดเดือน + วันที่จ่าย |
| Salary slip B: bilingual HR system (Earnings/Deductions/Net Pay) | Income | ไม่มี pay date (ใช้วันสุดท้ายของงวด) |
| Salary slip C: English-only payslip | Income | Net Income label |

- **Data matrix** (ทุก template ไม่ต้องครบทุกค่า ให้ใช้ pairwise): amount ∈ {0.01, 35.00, 1,250.00, 1,250.50, 99,999.99, 1,000,000.00}; date ∈ {BE 4-digit, BE 2-digit, เดือนเต็ม, CE EN, วันสิ้นเดือน 23:59, 1st 00:00, 29 ก.พ. 2567, ปี BE ข้าม 2569→2570, วันที่อนาคต}; fee ∈ {none, 0.00, 10.00}; memo ∈ {empty, ภาษาไทย, EN, merchant keyword, XSS payload}; payee ∈ {person TH/EN prefixes, บริษัท … จำกัด, merchant per category, conflict cases Grab/GrabFood}
- **ขนาดเป้าหมาย**: base **≥ 5 slips ต่อธนาคาร/รูปแบบ × 4 + bill 5 + received 3 + salary 3 formats × 3 = ~40 base** × degradation subset ≈ **~120 PNG** (เป้าหมายรวม < 25 MB)
- **Commit หรือ generate?** → **commit golden set** (PNG + expected) ไว้ เพราะการ render อาจต่างกันเล็กน้อยระหว่างเครื่อง/เวอร์ชัน Chromium ซึ่งจะทำให้ benchmark ไม่ stable. Regenerate เฉพาะตอนแก้ template (PR ที่มีทั้ง generator change + regenerated files). ใน CI ให้รัน generator เป็น smoke เพื่อยืนยันว่ายังทำงานได้
- **Negative / robustness files** (`tests/fixtures/files/`): non-slip photo (generated pattern/landscape), blank white, QR-only image, 0-byte `.png`, truncated/corrupt PNG, PDF renamed `.jpg`, GIF, small HEIC sample, ไฟล์ 10,485,760 bytes และ 10,485,761 bytes (padding metadata), 8000×8000 PNG, ชื่อไฟล์ภาษาไทยหรืออีโมจิ, 21 valid files สำหรับ limit test
- **Accuracy report** (benchmark output): per field (type, category, amount, date, time, payee CER, bank, ref) × per template × per degradation พร้อมแสดงเทียบกับ MVP metrics (amount ≥ 80%, type ≥ 90%, category ≥ 60%). Report จะแนบไว้ใน PR ที่แก้ parser/dictionary และใช้เป็น input สำหรับ UAT entry

**Layer C: Real-slip calibration set (private, manual only)**
- สลิปจริง **ปิดข้อมูลแล้ว** (ชื่อ, เลขบัญชี, ref, QR code ต้องปิดด้วยแถบทึบ; ห้ามใช้แค่ blur) เป้าหมาย **≥ 2 ต่อธนาคาร (K PLUS, SCB EASY, Krungthai NEXT, PromptPay) + salary 3 รูปแบบ ≈ 11+ รูป**
- เก็บใน shared drive ส่วนตัวของทีม (ไม่ใช่ repo), เข้าถึงเฉพาะทีม, มี consent จากเจ้าของสลิป และลบเมื่อจบ MVP
- ใช้เพื่อ: (1) ปรับ template ใน Layer B ให้สมจริง (2) วัด real-world accuracy ก่อน UAT (3) exploratory testing. **ไม่ใช้เป็น CI gate**
- Text ที่ OCR ได้จากสลิปจริงจะเข้าไปอยู่ใน Layer A **ได้หลังจากแทนข้อมูลส่วนตัวด้วยค่าปลอมแล้ว** เท่านั้น

**Storage / app-state fixtures** (`tests/fixtures/state/`): empty, 1 month mixed, 6-month trend (ข้ามปี), 1,000 transactions, corrupted JSON, older/newer schema version, near-quota (~4.9 MB), backup JSON valid/invalid/XSS

### 4.3 Answer: Open Question #1 "ใครจัดหาสลิปตัวอย่าง (Who supplies sample slips)?"

> **QA เป็นเจ้าของ (owner) ชุด test fixtures ทั้งหมด** ตาม charter §2 ("ชุดสลิปตัวอย่าง (test fixtures)") โดยแบ่งความรับผิดชอบดังนี้

| Who | Supplies | Due (proposal) |
|---|---|---|
| **QA** | Layer A text fixtures (ชุดแรก ~40 cases), generator + Layer B synthetic PNG set + negative files, accuracy report script, redaction guideline สำหรับ Layer C | Text fixtures: **Sprint Day 1** (ก่อน Dev เริ่ม OMX-006/007/008); synthetic PNG v1: **Day 2**; full set: Day 3 |
| **Dev** | ช่วย wire benchmark script กับ Tesseract config ตัวเดียวกับ app; record OCR output → Layer A | Day 2 |
| **Designer** | Review ความสมจริงของ HTML template (layout, ขนาดฟอนต์, spacing) เทียบกับสลิปจริงใน Layer C | Day 2 (30 นาที) |
| **ทุกคนในทีม (PO, Designer, Dev, QA)** | บริจาคสลิปโอนเงินจริงของตัวเอง (ปิดข้อมูลตาม guideline) ≥ 2 ใบ/คน ให้ครอบคลุมธนาคารเป้าหมาย → Layer C | Day 1 |
| **PO** | ขอจาก **ลูกค้า (FB-001)**: สลิปเงินเดือนจริงที่ปิดข้อมูลแล้ว 1–3 รูปแบบ (layout สลิปเงินเดือนต่างกันตาม HR system ของแต่ละบริษัท ทีมจึงสร้างเองให้สมจริงได้ยาก) พร้อม consent เป็นลายลักษณ์อักษร | ขอใน Day 0, ได้รับภายใน Day 2 |

- **ข้อเสนอปรับ requirement ของ Open Q#1** (ให้ PO ตัดสิน): เปลี่ยนจาก "สลิปจริง ≥ 5 ใบต่อธนาคาร" เป็น "**synthetic ≥ 5 ต่อธนาคาร (CI) + real ≥ 2 ต่อธนาคาร (calibration, private)**" เพราะทำได้จริงในเวลา 1 sprint และไม่มีความเสี่ยงด้าน privacy
- **Fallback**: ถ้าไม่ได้สลิปเงินเดือนจากลูกค้า ให้ใช้ salary template A/B/C แบบ synthetic อย่างเดียว แล้วบันทึกเป็น known risk ใน UAT ("real-world salary slip accuracy not validated")
- ผลต่อ DoR #6: ถือว่า "test data มีแผนแล้ว" สำหรับ OMX-005 – 011 เมื่อ PO ยอมรับข้อเสนอนี้

---

## 5. UAT Entry / Exit Criteria

UAT = ลูกค้า (FB-001) + PO ทดลองใช้บน GitHub Pages URL ตาม scenario ของ persona P1/P2/P3 (ใน Sprint Review/Demo หรือ session แยก)

### 5.1 Entry criteria (ทุกข้อต้องผ่านก่อนเริ่ม UAT)
1. ทุก story ระดับ **Must** ที่อยู่ใน sprint มีสถานะ **Done** ตาม DoD (รวม QA pass บน deployed build)
2. Build ที่จะใช้ UAT ถูก **freeze** (ระบุ commit SHA/tag ใน release notes) และไม่มี deploy ใหม่ระหว่าง UAT ยกเว้น hotfix ที่ PO อนุมัติ
3. CI เขียวทั้งหมด: type check, lint, unit, component, e2e smoke บน Pages URL
4. **ไม่มี Critical/High ค้าง**; Medium ทุกตัวมี triage decision และอยู่ใน known-issues list
5. **OCR benchmark บน synthetic set (Layer B)** ผ่าน: amount ≥ 80%, type ≥ 90%, category ≥ 60%; parser บน golden text (Layer A) ≥ 95% ต่อ field
6. Privacy check ผ่าน: network allowlist test (OMX-030) เขียว + ตรวจ HAR ด้วยมือ 1 รอบ
7. a11y: axe ไม่มี critical/serious บน 6 หน้าหลัก, Lighthouse a11y ≥ 90
8. Google Photos: ตั้งค่า `VITE_GOOGLE_CLIENT_ID` บน Pages แล้ว และ email ของผู้ร่วม UAT ถูกเพิ่มเป็น OAuth test users **หรือ** PO ตัดสินใจเป็นลายลักษณ์อักษรว่า UAT รอบนี้ทำในสถานะ "Not configured"
9. UAT pack พร้อม: scenario list (ตาม journey ใน §2.1 + persona), ชุดสลิปสำหรับ UAT (synthetic + ผู้ร่วม UAT นำสลิปจริงของตัวเองมาเอง แล้วประมวลผลในเครื่องของเขาเอง), วิธีแจ้ง feedback (→ `feedback-log.md`), known-issues list
10. README อัปเดต (URL, วิธีใช้, ข้อจำกัด เช่น ไม่รองรับ HEIC, ข้อมูลอยู่ใน browser เท่านั้น)

### 5.2 Exit criteria (UAT ถือว่าผ่านเมื่อ)
1. รัน UAT scenario ครบ 100%; scenario ของ **Must** ผ่าน 100%; scenario ของ Should ที่รวมอยู่ใน build ผ่าน ≥ 90% หรือ PO ยอมรับ deviation เป็นลายลักษณ์อักษร
2. ไม่มี Critical/High ใหม่ที่ยังไม่ได้แก้ (bug ที่พบระหว่าง UAT: Critical/High → hotfix + re-test; Medium/Low → backlog ผ่าน feedback-log)
3. **Real-world check** บนสลิปจริง (Layer C + สลิปของผู้ร่วม UAT): วัดและรายงาน amount/type/category accuracy เทียบกับ MVP metrics. ถ้าต่ำกว่าเป้า **ไม่ block โดยอัตโนมัติ** แต่ PO ต้องตัดสินว่าจะ release หรือไม่ และสร้าง story ปรับปรุง
4. **Time-to-first-transaction**: ≥ 80% ของผู้ร่วม UAT ที่เป็นผู้ใช้ใหม่บันทึกรายการแรกจากสลิปได้ภายใน **2 นาที** (สังเกตและจับเวลาจริง; ไม่นับเวลาโหลด model ครั้งแรกถ้าเกิน 2 นาทีแต่แสดง progress ถูกต้อง โดย PO ยืนยันข้อยกเว้นนี้)
5. ใช้งานได้บน Tier 1 ทั้ง 3 platform ระหว่าง UAT (Chrome desktop, Android Chrome, iOS Safari)
6. Feedback ทั้งหมดถูกบันทึกเป็น FB-xxx และ triage แล้ว
7. **PO sign-off** บันทึกใน Sprint Review notes (และ customer acknowledgement ถ้ามี)

### 5.3 Suspension / resumption
- **Suspend UAT** เมื่อ: Pages เปิดไม่ได้หรือ deploy เสีย, พบ data loss, พบข้อมูลรั่วออกนอก browser, หรือ flow หลักใช้ไม่ได้บน Tier 1 ใด ๆ
- **Resume** เมื่อ: hotfix ผ่าน CI + QA re-test บน Pages + PO อนุมัติ (และรัน scenario ที่ได้รับผลกระทบซ้ำ)

---

## 6. Questions / Decisions needed from PO & team (สำหรับ Grooming)

| # | Question | To | QA recommendation |
|---|---|---|---|
| Q1 | ยอมรับแผน test data และการปรับ Open Q#1 (synthetic ≥5/ธนาคาร + real ≥2/ธนาคาร private) ไหม? | PO | Yes |
| Q2 | Salary keywords มี precedence เหนือ transfer keywords (OMX-006) ใช่ไหม? | PO + Dev | Yes |
| Q3 | Numeric date = dd/mm/yyyy เสมอ; ปี ≥ 2400 = BE (OMX-008) ใช่ไหม? | PO | Yes |
| Q4 | Conflict Grab vs GrabFood, PTT vs Café Amazon: ใช้ "longest match wins" ไหม? | PO + Dev | Yes |
| Q5 | Duplicate tolerance: time ±1 นาที, normalized payee (OMX-011)? | PO | Yes |
| Q6 | พฤติกรรมเมื่อเปิดหลาย tab (OMX-021) | PO + Dev | Sync ผ่าน `storage` event หรืออย่างน้อยเตือนผู้ใช้ |
| Q7 | Money เป็น integer satang ภายในระบบ | Dev | Yes |
| Q8 | เพิ่ม AC กัน CSV formula injection (OMX-023) | PO | Yes (Should → ต้องมีถ้า story อยู่ใน sprint) |
| Q9 | นิยาม "mid-range phone" และอุปกรณ์จริงที่ทีมมี (OMX-029) | Dev + QA | ระบุรุ่นจริง 1 Android + 1 iPhone |
| Q10 | มี staging path แยกจาก production ไหม? | Dev + PO | ควรมี ถ้าค่าใช้จ่ายต่ำ |
| Q11 | Manual entry อนุญาตวันที่ในอนาคตไหม (OMX-013)? | PO | อนุญาต แต่เตือน |
| Q12 | Open Q#2 (Tesseract data: self-host vs pinned CDN) มีผลต่อ allowlist ของ OMX-030 และเวลาโหลดครั้งแรก | Dev + PO | Self-host ใน `public/` (privacy, deterministic) ถ้าขนาดรับได้ |

---

*Next step (หลัง Sprint Planning): QA เขียน test cases จาก AC ที่ finalize แล้ว, ส่ง Layer A fixtures ชุดแรก, และเริ่ม generator ของ Layer B*
