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
- *Source:* Customer · End user · Sprint Review · GitHub Issue · QA · Team · Other
- *Type:* Bug · Feature request · Improvement · UX · Question
- *Status:* `New` · `Triaged` · `In Backlog` · `In Sprint` · `Done` · `Closed`

## Log

| ID | Date | Source | Description | Type | PO decision | Linked backlog ID | Status |
|---|---|---|---|---|---|---|---|
| FB-001 | 2026-11-13 | Customer | Initial requirement: web app คำนวณรายรับ–รายจ่ายอัตโนมัติจากรูป (Google Photos / upload); สลิปเงินเดือน = รายรับ, สลิปโอนเงิน = รายจ่าย; กรอกเองได้; จัดหมวดหมู่อัตโนมัติ; host บน server เข้าถึงจากภายนอก; UI TH/EN | Feature request | Accept — baseline MVP_0001 | OMX-001 – OMX-031 (003 → 003a/b, 012 → 012a/b) | In Sprint |
| FB-002 | | | | | | | New |
| FB-003 | | | | | | | New |
