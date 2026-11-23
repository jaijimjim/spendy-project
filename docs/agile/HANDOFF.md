# HANDOFF — Omnitrix Money (MVP_0001) · หลังจบ Sprint 1

อัปเดต: 23 พ.ย. 2569 · Repo: github.com/jaijimjim/omnitrix-project · Live: https://jaijimjim.github.io/omnitrix-project/

## ทีมและวิธีทำงาน
- ทีม agent 4 บทบาท: **PO/PM, Designer, Dev, QA** ทำงานแบบ Scrum ตาม ceremony ครบ (Grooming → Planning → Daily → Demo → Retro)
- PO รับ feedback จาก user → บันทึกใน `docs/agile/feedback-log.md` → สร้าง backlog → grooming กับทีม แล้ว PO ประสานงานเมื่อต้องแก้หรือเปลี่ยนอะไร
- ภาษาในเอกสาร: ไทย + ศัพท์เทคนิคอังกฤษ · ภาษา UI: TH/EN สลับได้

## สถานะ ณ จบ Sprint 1
- Must 77/77 pts dev เสร็จ · Should 9/10 (OMX-029 ทำได้บางส่วน) · PO รับงาน 92 pts แบบ "รอ deploy" ส่วน Done = 0 pts จนกว่าจะยืนยันว่า deploy แล้ว
- Test: unit 209, e2e 93 ผ่าน · Test cases 132 ข้อ: Pass 118 / Fail 1 / Blocked 12 / Not run 1
- OCR บนสลิปสังเคราะห์ 27 ใบ: ประเภท 100%, ยอดเงิน 96.3%, หมวดหมู่ 100%, วันที่ 100%
- เอกสารหลัก: `docs/agile/01-product-backlog.md` (v3 + Sprint 2 candidates §9), `docs/agile/sprints/sprint-1/` (01–05 + วิดีโอ demo), `docs/qa/` (test plan, test cases, bug report, summary), `design/`, `docs/adr/`

## สิ่งที่ต้องทำต่อ (เรียงตามลำดับ)
1. **ยืนยัน deploy (OMX-028, OMX-048):** ตรวจ GitHub Actions ทั้ง `ci.yml` และ `deploy.yml` ให้เขียว, Pages Source = GitHub Actions และเปิด URL live ได้ แก้ CI ถ้าล้ม (CI ยังไม่เคยรันบน GitHub เลย)
2. **Google Photos ของจริง (OMX-003a/003b):** ผู้ใช้สร้าง OAuth Client ID แบบ Web แล้ว (origins: `https://jaijimjim.github.io`, localhost:5173, localhost:4173) ต้องตรวจว่ามี repo variable `VITE_GOOGLE_CLIENT_ID`, เปิด Photos Picker API แล้ว และมี test users จากนั้นให้ผู้ใช้ทดสอบเลือกรูปจริง · ยังขาด per-item Retry (OMX-041)
3. **QA รัน test case 12 ข้อที่ Blocked บน URL live** (Lighthouse, Pages, ทดสอบบนมือถือจริง) แล้วอัปเดต `docs/qa/test-summary-report.md`
4. **Bug จากสลิปจริงของผู้ใช้ (FB ใหม่ · 14 พ.ย. 69)** ทดสอบสลิปจริง 3 ใบ ได้ผล: ยอด / วันที่ / เวลา / ประเภท ถูก 3/3 แต่หมวดหมู่ถูก 1/3 และผู้รับถูก 0/3
   - **BUG-009 (High):** ดึงผู้รับจากสลิป make by KBank และ K PLUS ไม่ได้ เพราะชื่อผู้รับอยู่ใต้ลูกศร "↓" โดยไม่มีป้าย "ไปยัง/ถึง" (ปกติผู้รับอยู่บรรทัดหลังเลขบัญชีผู้โอน `XXX-X-X####-X`)
   - **BUG-010 (High):** จัดหมวดหมู่ผิด
     - สลิป "จ่ายบิลสำเร็จ" ของร้านอาหาร (ชื่อร้านมีคำว่า "ไก่ย่าง" และ biller "...FOOD") ถูกจัดเป็น Bills เพราะคำว่า "จ่ายบิล" ชนะ → ชื่อร้านหรือ biller ควรมีน้ำหนักกว่าคำบอกประเภทธุรกรรม
     - สลิป "ชำระเงินสำเร็จ" ของ "บลูเพย์-ลาซาด้าเพย์" ซึ่ง OCR อ่านเป็น "บลูเพย-ลาชาดาเพย" ถูกจัดเป็น Other → เพิ่ม fuzzy keyword ของ Lazada/ลาซาด้า/ลาชาดา/LazPay และ Shopee/ShopeePay
   - OCR noise ที่พบ: "พ.ย." → "พ.ุย.", "ชำระเงิน" → "ชําระเจิน", ตัวอักษรขยะจากรูปการ์ตูนและ QR code
   - **ห้าม commit รูปสลิปจริง** (repo เป็น public และในรูปมีชื่อกับเลขบัญชี) ให้ใช้ข้อความ OCR ที่ปิดชื่อและเลขบัญชีแล้วเป็น fixture เท่านั้น
   - รอผู้ใช้ตัดสินใจ: แก้เป็น hotfix หรือเข้า Sprint 2
5. **Sprint 2:** PO ทำ grooming และ planning จาก backlog §9 + BUG-009/010 โดยวางแผนตาม velocity ประมาณ 40 pts หักเผื่อ buffer ประมาณ 10 pts (ตาม action item จาก retro)

## หมายเหตุทางเทคนิค
- React 18.3.1 + TS 5.9 + Vite, HashRouter, base `/omnitrix-project/`, Tesseract.js self-host (copy จาก npm ตอน build)
- รันในเครื่อง: `npm ci && npm run dev` (เติม `?ocr=fake` เพื่อข้าม OCR จริง) · ตรวจทั้งหมด: `npm run ci` · e2e: `npm run build && npm run e2e`
- Test hook: `window.__OMX_TEST__ = { now, ocr: 'fake'|'real', storage }` · storage key `omx.v1`
- วิดีโอ demo อัดใหม่ได้ด้วย `scripts/record-demo.cjs` (ต้องเปิด `vite preview` ที่ port 4173 ก่อน)
