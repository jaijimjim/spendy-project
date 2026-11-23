# Feedback Log — Omnitrix Money

> Owner: PO/PM · ทุก feedback/feature request/bug จากผู้ใช้ ลูกค้า และทีม ต้องถูกบันทึกที่นี่ก่อนเข้า Product Backlog

## Process (สรุปจาก Team Charter §7)
1. **Capture** — PO บันทึกเป็นแถวใหม่ (`FB-xxx`) ภายใน 1 วันทำการ พร้อมแหล่งที่มา
2. **Triage** — PO จัด **Type** และตัดสินใจ **PO decision**: `Accept` · `Merge` (รวมกับ story เดิม) · `Defer` · `Reject` (ต้องมีเหตุผล)
3. **Backlog** — ถ้า Accept/Merge ให้สร้าง/อัปเดต story ใน `01-product-backlog.md` แล้วใส่ ID ใน *Linked backlog ID*
4. **Grooming → Planning** — ทีม refine/estimate แล้วดึงเข้า Sprint ตาม priority
5. **Close loop** — เมื่อ story ที่ลิงก์ Done/Release แล้ว หรือ Reject ให้แจ้งผู้ให้ feedback และเปลี่ยน Status เป็น `Closed`
- **Critical bug** (ข้อมูลหาย/ใช้งานไม่ได้/ข้อมูลรั่ว) → แจ้งทีมทันที, hotfix ใน Sprint ปัจจุบัน

**Legend**
- *Source:* Customer · End user · UAT · Sprint Review · GitHub Issue · QA · Team · Other
- *Type:* Bug · Feature request · Improvement · UX · Question
- *Status:* `New` · `Triaged` · `In Backlog` · `In Sprint` · `Done` · `Closed`

## Log

| ID | Date | Source | Description | Type | PO decision | Linked backlog ID | Status |
|---|---|---|---|---|---|---|---|
| FB-001 | 2026-11-13 | Customer | Initial requirement: web app คำนวณรายรับ–รายจ่ายอัตโนมัติจากรูป (Google Photos / upload); สลิปเงินเดือน = รายรับ, สลิปโอนเงิน = รายจ่าย; กรอกเองได้; จัดหมวดหมู่อัตโนมัติ; host บน server เข้าถึงจากภายนอก; UI TH/EN | Feature request | Accept — baseline MVP_0001 | OMX-001 – OMX-031 (003 → 003a/b, 012 → 012a/b) | In Sprint |
| FB-002 | 2026-11-13 | QA (O2) | สลิปเงินเดือนที่ไม่มีวันที่จ่าย และงวดเป็นเดือนปัจจุบัน → วันที่ตกเป็นวันนี้ (วันสิ้นงวดอยู่ในอนาคต) | Improvement | Accept: decide rule at Sprint 2 grooming | OMX-045 | In Backlog |
| FB-003 | 2026-11-13 | QA (O5) | Search placeholder ถูกตัดเล็กน้อยที่ 320px (TH/EN) | UX | Accept (Could) | OMX-046 | In Backlog |
| FB-004 | 2026-11-13 | Team / Dev (K1) | Google Photos download ที่ล้มเหลวแสดงเป็นจำนวนรวม ไม่ใช่แถว Failed + Retry รายรูป (OMX-003b AC5) | Bug (AC gap) | Accept (Must) | OMX-041 | In Backlog |
| FB-005 | 2026-11-13 | Team / Dev (K3) | Desktop Add/Edit form เป็น centred page แทน `<dialog>` | UX | Accept deviation for MVP; OMX-013 AC1 updated | OMX-013 | Closed |
| FB-006 | 2026-11-13 | QA (BUG-007) | ยอดเงินเลขไทยบนรูปถูก OCR อ่านเพี้ยน → amount ว่าง | Bug (Low) | Known limitation for UAT; fix later | OMX-040 | In Backlog |
| FB-007 | 2026-11-13 | QA (R1) / Sprint Review | ความแม่นยำกับสลิปจริงยังไม่ได้วัด (synthetic only) | Improvement | Accept (Must) | OMX-042 | In Backlog |
| FB-008 | 2026-11-13 | QA (C5) / Sprint Review | ยังไม่ได้ทดสอบบนอุปกรณ์จริง (Android/iOS) และ screen readers | Improvement | Accept (Must) | OMX-043 | In Backlog |
| FB-009 | 2026-11-13 | Designer (retro) | Dark mode ตามระบบเท่านั้น ไม่มีปุ่มสลับเอง | Feature request | Accept (Could) | OMX-047 | In Backlog |
| FB-010 | 2026-11-13 | Sprint Review | ~~placeholder: customer feedback from demo~~ — ไม่มี feedback จากลูกค้าระหว่าง demo (demo บน local build เพราะ B1) · feedback จริงหลัง demo บันทึกเป็น FB-011 | — | Closed — superseded by FB-011 (2026-11-23) | — | Closed |
| FB-011 | 2026-11-14 | End user (ผู้ใช้ทดสอบสลิปจริงของตัวเอง 3 ใบ บนเครื่องตัวเอง) | ผลอ่านสลิปจริง 3 ใบ (KBank "make by KBank" / K PLUS): **ยอดเงิน 3/3, วันที่ 3/3, เวลา 3/3, ประเภท 3/3 ถูก · หมวดหมู่ 1/3 · ผู้รับ 0/3** — (1) **BUG-009 (High):** ไม่ดึงชื่อผู้รับ เพราะชื่ออยู่ใต้ลูกศร "↓" โดยไม่มีป้าย "ไปยัง/ถึง" (อยู่บรรทัดถัดจากเลขบัญชีผู้โอนแบบ masked `XXX-X-X####-X`) · (2) **BUG-010 (High):** สลิป "จ่ายบิลสำเร็จ" ของร้านอาหาร (ชื่อร้านมี "ไก่ย่าง", biller "…FOOD") → Bills แทน Food เพราะ "จ่ายบิล" ชนะ; สลิป "ชำระเงินสำเร็จ" "บลูเพย์-ลาซาด้าเพย์" ที่ OCR อ่านเป็น "บลูเพย-ลาชาดาเพย" → Other แทน Shopping · OCR noise ที่พบ: "พ.ย."→"พ.ุย.", "ชำระเงิน"→"ชําระเจิน", ตัวอักษรขยะจากรูปการ์ตูน/QR code · **ห้าม commit รูปสลิปจริง** (มีชื่อ + เลขบัญชี) — ใช้ได้เฉพาะ OCR text ที่ปิดข้อมูลแล้ว | Bug (High ×2) | Accept → Sprint 2 grooming (ผู้ใช้เลือกไม่ทำ hotfix, 2026-11-23) · นับเป็นสลิปจริงชุดแรกของ OMX-042 (Layer C) ด้วย | OMX-049 (BUG-009), OMX-050a + OMX-050b (BUG-010, split at Sprint 2 grooming), OMX-051 (payee measurement enabler) · related OMX-042 | In Backlog |
| FB-012 | 2026-11-23 | Team (PO ตรวจ live URL หลังจบ Sprint 1) | `https://jaijimjim.github.io/omnitrix-project/` ตอบ **404** — CI ทุก job เขียวบน GitHub แล้ว (B1 ส่วน push/CI ปิดได้) แต่ `deploy.yml` ล้มที่ step `configure-pages` เพราะ repo เป็น **private** และยังไม่เปิด Pages (Source = GitHub Actions) · ผู้ใช้ได้รับแจ้งให้เปิด Pages แล้ว | Bug (environment) — **impediment**, ไม่ใช่ product feedback | Merge — ติดตามเป็น impediment **B3** ใน OMX-028/OMX-048 (ไม่สร้าง story ใหม่) · งาน 92 pts คงสถานะ Accepted (pending deploy) จนกว่า OMX-048 ผ่าน | OMX-028, OMX-048 | In Backlog |

## UAT Feedback Capture (Sprint 2)

How feedback from UAT (release plan R6, `sprints/sprint-1/04-sprint-review.md` §7) gets in:

| Step | What | Who |
|---|---|---|
| 1. Channel | UAT participants report through **(a)** the UAT session itself (PO/QA take notes live), **(b)** a GitHub Issue using the label `uat` (once B1 is closed), or **(c)** a message to the PO. Each report states: scenario/persona, device + browser, steps, expected vs actual, screenshot **with personal data cropped out**. Never attach real slip images | Participants |
| 2. Capture | PO logs every report as `FB-xxx` with Source = `UAT` within 1 business day (same day during UAT) | PO |
| 3. Classify | QA reproduces each Bug report on the frozen build (`v0.1.0-uat`) and assigns severity per QA grooming §2.3. Accuracy issues are counted toward OMX-042 (field, bank/format), not as individual bugs, unless the pattern repeats | QA |
| 4. Decide | **Critical/High** → hotfix in Sprint 2, then re-test and re-run the affected UAT scenarios. **Medium/Low/UX/feature** → backlog (Accept/Merge/Defer/Reject) and triage at the next grooming | PO (+ team) |
| 5. Close loop | At UAT exit the PO sends participants a summary (fixed / planned / declined with reason) and records sign-off in the Sprint 2 Review notes | PO |

Privacy rule: UAT participants process their own slips on their own device. Only counts and descriptions come back, never images or OCR text containing personal data (OMX-030, OMX-042 AC4).
