# Real-slip fixtures (Layer C, OMX-042) — redacted

> Owner: QA · Captured 2026-11-23 (Sprint 2 Day 1) · n = 16 · Test: [`src/domain/slip/realSlips.test.ts`](../../../src/domain/slip/realSlips.test.ts) · Report: [`docs/qa/test-summary-report.md`](../../../docs/qa/test-summary-report.md) section "OMX-042 — Real-slip accuracy, n=16"

## แหล่งที่มา

- สลิปจริง 16 ใบของผู้ใช้ (UQ4 — ผู้ใช้ส่งให้และอนุญาตให้ QA เก็บไว้ทดสอบ) จาก 3 แอป: **make by KBank** 9 ใบ (r01, r04, r05, r07, r08, r11, r12, r14, r15) · **K PLUS** 6 ใบ (r02, r03, r06, r09, r10, r16) · **Krungthai** 1 ใบ (r13) · ทุกใบเป็นรายจ่าย (โอน / จ่ายบิล / ชำระเงิน QR / เติมเงิน), วันที่ 1–22 พ.ย. 2569
- OCR = Tesseract.js `tha+eng` (OEM LSTM, `preserve_interword_spaces=1`) ตัวเดียวกับแอป, preprocess เหมือนแอป: long edge ≤ 2000 px → grayscale → contrast ×1.25
- Ground truth อ่านจากรูปโดย orchestrator และ QA ตรวจทาน (`expected.json`)

## ไฟล์

| ไฟล์ | Commit? | เนื้อหา |
|---|---|---|
| `redacted/rNN.txt` | ✅ | OCR text ดิบที่ **ปิดข้อมูลส่วนบุคคลแล้ว** (คง OCR noise ทุกตัว) |
| `expected.json` | ✅ | ground truth ต่อใบ (ชื่อบุคคลเป็นชื่อสมมติชุดเดียวกับ `redacted/`) · `categoryStatus: "pending"` = หมวดที่ยังรอผู้ใช้ยืนยันผ่าน PO · `payeeAlt` = รูปแบบที่ OCR อ่านได้ซึ่งยอมรับว่าถูก |
| `images/` | ⛔ git-ignored | รูปสลิปจริง `r01.jpg … r16.jpg` — **ห้าม commit, ห้าม `git add -f`** |
| `ocr-raw.local.json` | ⛔ git-ignored | OCR ก่อน redaction (มีชื่อจริง) — key `s01.png … s16.png` = r01 … r16 |
| `expected.local.json` | ⛔ git-ignored | ground truth ที่มีชื่อจริง |

## กฎ privacy (redaction, ตาม `docs/agile/grooming/sprint-2-qa.md` §2)

1. **ชื่อบุคคลทุกคน** (เจ้าของบัญชี/ผู้โอน, ผู้รับที่เป็นบุคคล, ชื่อบุคคลในชื่อร้าน เช่น `TTB(นาง …)`, ชื่อเจ้าของร้านในบรรทัด reference เช่น `MISS…`) → ชื่อสมมติที่คงคำนำหน้า (นาย/น.ส./นาง/MISS) และความยาวใกล้เคียง · รูปแบบ OCR เพี้ยนของชื่อเจ้าของบัญชีถูกแทนด้วยชื่อสมมติที่เพี้ยนแบบเดียวกัน (สระ ิ→ึ, "แน", ตัวย่อนามสกุลติดชื่อ) เพื่อให้ sender-guard ของ OMX-049 ยังทดสอบได้
2. **เลขบัญชี / wallet / PromptPay** → คง mask pattern (`XXX-X-X####-X`, `%%%-%%%%%%%%-####`, `2๐๐-%-%####-%`) เปลี่ยนเฉพาะตัวเลขที่เห็น
3. **เลขที่รายการ / เลขอ้างอิง / รหัสร้านค้า / รหัสธุรกรรม / รหัสลูกค้า / Biller ID / เลขบัตร** → ค่าสมมติแบบ deterministic ที่คง format (ความยาว, ตำแหน่งตัวเลข/ตัวอักษร, prefix ช่องทาง เช่น `0463`, `KB0000`, `KPS004`) · ค่าเดียวกันในหลายใบได้ค่าสมมติเดียวกัน
4. **คงไว้:** ชื่อร้านค้า / biller / บริษัท / หน่วยงาน (ข้อมูลธุรกิจ จำเป็นต่อ category), memo, ยอดเงิน, วันที่, เวลา, OCR noise ทุกตัว
5. ก่อน commit: grep denylist ของชื่อจริงทุกรูปแบบ + token จริงทุกตัว (เก็บนอก repo) ต้องได้ 0 match ใน `redacted/`, `expected.json` และ `git diff --cached`; สงสัยว่าปิดไม่หมด → ไม่ commit
6. Test `realSlips.test.ts` ยืนยันว่า redaction **ไม่เปลี่ยนผล parser** (type, amount, date, time, category, bank, payee found/not found) เมื่อมี `ocr-raw.local.json` อยู่ในเครื่อง (CI จะ skip เคสนี้)

## วิธีรันซ้ำ (เครื่อง QA ที่มีรูป)

สคริปต์อยู่นอก repo (`/home/claude/scripts/`) เพราะทำงานกับข้อมูลจริง:

```bash
# 1) preprocess รูป (≤2000px, grayscale, contrast ×1.25) → PNG
python3 -I /home/claude/scripts/preprocess.py tests/fixtures/real-slips/images /tmp/realslips/pre
# 2) OCR ด้วย Tesseract.js ตัวเดียวกับแอป (ใช้ public/tesseract/lang จาก npm run assets:tesseract)
node /home/claude/scripts/ocr.mjs /tmp/realslips/pre tests/fixtures/real-slips/ocr-raw.local.json
# 3) redaction → redacted/rNN.txt (+ denylist ของ token จริง เก็บนอก repo)
node /home/claude/scripts/redact-real-slips.mjs tests/fixtures/real-slips/ocr-raw.local.json \
  tests/fixtures/real-slips/redacted /tmp/realslips/sensitive.json
# 4) วัดผล (CI ก็รันเคสนี้ทุกครั้งจาก redacted text)
npx vitest run src/domain/slip/realSlips.test.ts
```

ถ้า OCR ใหม่ทำให้ข้อความเปลี่ยน ให้ตรวจ redaction ซ้ำ (ข้อ 5) ก่อน commit ทุกครั้ง

## Ratchet

`realSlips.test.ts` **รายงาน** accuracy ต่อ field / ต่อแอป (`console.table`) และ assert แค่ว่าไม่แย่กว่า `BASELINE` (ไม่ใช่ MVP gate) — Dev ที่แก้ BUG-009 … BUG-015 / OMX-049 / 050a / 050b ต้อง **ยก `BASELINE` ขึ้นใน PR เดียวกัน**
