# HANDOFF — Omnitrix Money (MVP_0001) · หลัง Sprint 2 Grooming

อัปเดต: 23 พ.ย. 2569 · Repo: github.com/jaijimjim/spendy-project (**public** · เปลี่ยนชื่อจาก omnitrix-project เมื่อ 23 พ.ย. 69) · Live (เป้าหมาย): https://jaijimjim.github.io/spendy-project/ — **ยังตอบ 404 (B3)**

## ทีมและวิธีทำงาน
- ทีม agent 4 บทบาท: **PO/PM, Designer, Dev, QA** ทำงานแบบ Scrum ตาม ceremony ครบ (Grooming → Planning → Daily → Demo → Retro)
- PO รับ feedback จาก user → บันทึกใน `docs/agile/feedback-log.md` → สร้าง backlog → grooming กับทีม แล้ว PO ประสานงานเมื่อต้องแก้หรือเปลี่ยนอะไร
- ภาษาในเอกสาร: ไทย + ศัพท์เทคนิคอังกฤษ · ภาษา UI: TH/EN สลับได้

## สถานะปัจจุบัน
- **Git:** `main` = `03cd465` ขึ้นไป (ต่อจาก `e17c62e` ci fix) · งานเอกสาร grooming Sprint 2 ยังไม่ได้ commit
- **CI:** ทุก job ใน `ci.yml` **เขียวบน GitHub** (run `43827185503`: gitleaks, lint/typecheck/unit, build with/without Google, e2e) → **B1 ปิดแล้ว**
- **Deploy (B3):** `deploy.yml` ล้มที่ `actions/configure-pages@v5` ("Not Found") เพราะ repo เป็น **private** และยังไม่เปิด Pages → URL live 404 (FB-012). ผู้ใช้ได้รับแจ้งแล้ว: ต้องเปลี่ยน repo เป็น public หรือใช้ plan ที่รองรับ Pages กับ private repo แล้วตั้ง Pages Source = GitHub Actions. Dev ยืนยันว่า**ไม่ต้องแก้ workflow**
- **Sprint 1:** Must 77/77 dev เสร็จ, Should 9/10 · PO รับ 92 pts เป็น **Accepted (pending deploy)** · **Done = 0 pts** จนกว่า OMX-028 + OMX-048 จะผ่านบน Pages
- **QA re-run (23 พ.ย., `docs/qa/test-summary-report.md` §7):** 132 TCs → **Pass 120 / Fail 2 / Blocked 9 / Not run 1** · TC-163 (สลิปจริง, n = 3) **Fail** → BUG-009/010 · TC-137 Blocked (B3) · TC-138/149 Pass · Lighthouse **local interim**: LCP median **755 ms**, a11y **100** (ยังต้องวัดบน Pages) · Open defects: BUG-009 High, BUG-010 High, BUG-007 Low · **Recommendation: NOT READY for UAT**
- **OCR:** synthetic 27 ใบ type 100%, amount 96.3%, category 100%, date 100% · **สลิปจริง 3 ใบ (FB-011, KBank/K PLUS):** ยอด/วันที่/เวลา/ประเภท 3/3 แต่หมวดหมู่ 1/3, ผู้รับ 0/3
- **Sprint 2 Grooming: เสร็จแล้ว** (`docs/agile/sprints/sprint-2/00-grooming-agenda.md`, `01-grooming-minutes.md`) · backlog **v5**

## ผล Grooming Sprint 2 (สรุป)
- **BUG-009 → OMX-049 (3 pts):** หาผู้รับจากบรรทัดหลังเลขบัญชีผู้โอนแบบ masked `XXX-X-X####-X` (ใต้ลูกศร ↓) ใช้กับทุกธนาคารที่มี anchor แต่**เฉพาะสลิปรายจ่าย** · รวม D1 (payee empty state)
- **BUG-010 → OMX-050a (3) + OMX-050b (2):** 050a = ชื่อร้าน/biller ชนะคำบอกประเภทธุรกรรม ("จ่ายบิล" เป็น weak tier, เดี่ยว ๆ = Bills Medium) + keyword อาหารไทย + D2 (highlight หมวด Medium + `aria-describedby`) · 050b = fuzzy (confusable-char folding) Lazada/Shopee
- **OMX-051 (2, ใหม่):** enabler วัด payee ใน Layer A/B + benchmark baseline (แยกจาก 049 เพื่อ fixture-first)
- **049 + 050a + 050b = bundle เดียว** (ห้ามตัดแยก): spike ของ Dev พบว่าสลิปไก่ย่างต้องใช้ทั้ง 049 และ 050a
- D3 → parked, D4 = OMX-035 คง Won't · OMX-045 = option A · OMX-039/047 เลื่อนไป Sprint 3
- **Commit ที่เสนอ = 29 pts** (Must 23 + Should 2 + Could 4) + buffer ~10 ≈ velocity ~40 · ลำดับ cut: 046 → 045 → 040 → 029 → 041

## กฎความเป็นส่วนตัว (ใช้เสมอ)
- **ห้าม commit รูปสลิปจริง** ไม่ว่า repo จะ private (ปัจจุบัน) หรือเปลี่ยนเป็น public ภายหลัง (ในรูปมีชื่อกับเลขบัญชี) · ห้ามส่งรูปเข้า sandbox/agent/chat
- Fixture จากสลิปจริง = **ข้อความ OCR ที่ปิดชื่อ/เลขบัญชี/เลขอ้างอิงแล้วเท่านั้น** ตาม redaction guideline ใน `docs/agile/grooming/sprint-2-qa.md` §2 (คง masked pattern และ OCR noise ไว้)
- ถ้าจะเปลี่ยน repo เป็น public: รัน gitleaks full history และตรวจว่าไม่มีรูปสลิปจริงใน `git log --all` ก่อน

## สิ่งที่ต้องทำต่อ (เรียงตามลำดับ)
1. **รอคำตอบจากผู้ใช้ (ส่งแล้ว):**
   - **UQ1** ส่ง OCR text ของสลิปจริง 3 ใบแบบปิดข้อมูลแล้วได้ไหม (ถ้าไม่ได้ภายใน Day 2 QA จะทำ synthetic แทน)
   - **UQ2** เปิด Pages: เปลี่ยนเป็น public หรืออัปเกรด plan + Source = GitHub Actions (ปิด B3)
   - **UQ3** ตั้ง `VITE_GOOGLE_CLIENT_ID`, เปิด Photos Picker API และเพิ่ม test users แล้วหรือยัง (ปิด B2) หรือยอมรับ UAT แบบ "Not configured"
   - UQ4–UQ6 (สลิปจริงเพิ่ม ≥ 11 ใบ, re-test 3 ใบ, ช่วง UAT) ดู minutes §10
2. **Sprint 2 Planning** (ยังไม่ได้ทำ): ใช้ minutes §6 (commit 29 pts) + DoR §7 · ถ้า B3 ยังไม่ปิดภายใน Day 2 ให้ทำ bundle parser (051 → 049 → 050a → 050b) + 041 + 040 ก่อน และทบทวน Sprint Goal
3. Action items จาก grooming Day 1: Designer G1–G4 (spec D1, OMX-041 states, copy keys, แก้ `design/screens.md`), QA G5–G7 (OMX-051, fixture lists, fixture redacted/synthetic), Dev G8 (CONTRIBUTING + Pages-check step)
4. เมื่อ B3 ปิด: deploy ครั้งแรก → OMX-048 (smoke/real-OCR/Lighthouse/HAR บน Pages) → ย้าย 92 pts เป็น Done, tag `v0.1.0-uat` → QA รัน TC ที่ Blocked บน URL live
5. UAT เริ่มได้เมื่อ BUG-009/010 ปิดแล้ว (UAT entry #4) และ B3 ปิด

## เอกสารหลัก
- `docs/agile/01-product-backlog.md` (v5: §4 rule ใหม่, §7 OMX-049/050a/050b/051, §9 candidate list)
- `docs/agile/sprints/sprint-2/` (00 agenda, 01 grooming minutes) · `docs/agile/grooming/sprint-2-{design,dev,qa}.md`
- `docs/agile/sprints/sprint-1/` (01–05 + วิดีโอ demo) · `docs/agile/feedback-log.md` (FB-011 สลิปจริง, FB-012 Pages 404)
- `docs/qa/` (test plan, test cases, bug report, summary §7) · `design/` · `docs/adr/`

## หมายเหตุทางเทคนิค
- React 18.3.1 + TS 5.9 + Vite, HashRouter, base `/spendy-project/` (deploy ใช้ `/<repo-name>/` อัตโนมัติ), Tesseract.js self-host (copy จาก npm ตอน build)
- รันในเครื่อง: `npm ci && npm run dev` (เติม `?ocr=fake` เพื่อข้าม OCR จริง) · ตรวจทั้งหมด: `npm run ci` · e2e: `npm run build && npm run e2e` · e2e บน Pages: `E2E_BASE_URL=https://jaijimjim.github.io/spendy-project/`
- Test hook: `window.__OMX_TEST__ = { now, ocr: 'fake'|'real', storage }` · storage key `omx.v1`
- Parser อยู่ที่ `src/domain/slip/*` (`parties.ts` = payee, `categorize.ts` + `categories.rules.ts` = หมวดหมู่, `keywords.ts` = matcher)
- วิดีโอ demo อัดใหม่ได้ด้วย `scripts/record-demo.cjs` (ต้องเปิด `vite preview` ที่ port 4173 ก่อน)
