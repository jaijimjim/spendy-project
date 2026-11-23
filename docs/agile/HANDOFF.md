# HANDOFF — Spendy Money (MVP_0001, เดิม Omnitrix Money) · Sprint 2 เริ่มแล้ว (Day 1)

อัปเดต: 23 พ.ย. 2569 · Repo: github.com/jaijimjim/spendy-project (**public** · เปลี่ยนชื่อจาก omnitrix-project เมื่อ 23 พ.ย. 69) · **Live: https://jaijimjim.github.io/spendy-project/ — ใช้งานได้แล้ว** (หน้า "Home · Spendy Money")

> **อัปเดตล่าสุด (23 พ.ย. 69, Sprint 2 Planning):** **B3 ปิดแล้ว** — ผู้ใช้เปลี่ยน repo เป็น public + `spendy-project` และตั้ง Pages Source = GitHub Actions · run **`45208481550`** (commit `6ebe779`) ผ่านทุก job: CI ทั้งหมด + Build for Pages + Deploy · OMX-052 (rename, 1 pt) เสร็จในโค้ดและอยู่บน live · ผู้ใช้สั่งเริ่ม sprint → **Sprint 2 Planning เสร็จ** (`docs/agile/sprints/sprint-2/02-sprint-planning.md`), commit **26 pts**, backlog **v7** · UQ1/UQ3 ยังไม่ตอบ → ใช้สมมติฐาน (ด้านล่าง)

## ทีมและวิธีทำงาน
- ทีม agent 4 บทบาท: **PO/PM, Designer, Dev, QA** ทำงานแบบ Scrum ตาม ceremony ครบ (Grooming → Planning → Daily → Demo → Retro)
- PO รับ feedback จาก user → บันทึกใน `docs/agile/feedback-log.md` → สร้าง backlog → grooming กับทีม แล้ว PO ประสานงานเมื่อต้องแก้หรือเปลี่ยนอะไร
- ภาษาในเอกสาร: ไทย + ศัพท์เทคนิคอังกฤษ · ภาษา UI: TH/EN สลับได้

## สถานะปัจจุบัน
- **Sprint 2: เริ่มแล้ว** (Day 1 = 23 พ.ย., Day 5 = 27 พ.ย. Review/Demo + Retro) · Planning: `docs/agile/sprints/sprint-2/02-sprint-planning.md` · Daily: `03-daily-standup.md`
- **Sprint Goal:** live แล้ว → ยืนยันบน live ให้ 92 pts ของ Sprint 1 เป็น Done + tag `v0.1.0-uat` (Day 2) → แก้ BUG-009/010 (bundle 049/050a/050b) deploy Day 3 → ผู้ใช้ re-test สลิปจริง 3 ใบ Day 4 (payee/category ≥ 2/3, เป้า 3/3) → ตรวจอุปกรณ์จริง, วัด accuracy สลิปจริง, ผ่าน UAT entry
- **Commit 26 pts:** 052 (1), 028 (1), 048 (2), 051 (2), **049 (3) + 050a (3) + 050b (2) = bundle ห้ามแยก**, 043 (3), 042 (3), 029 (2), 040 (2), 045 (1), 046 (1) · **Stretch (B2):** 003a/b (2) + 041 (2) ถ้าผู้ใช้ยืนยัน UQ3 ≤ Day 3 · 044 conditional (ถ้า 029 AC5 fail) · buffer ~10 สำหรับ UAT/hotfix · cut order: 046 → 045 → 040 → 029 → 042
- **ลำดับงาน Dev:** 028 wrap-up (README live URL, Pages-check, CONTRIBUTING) → pair 051 → 049 → 050a → 050b → merge + deploy bundle (Day 3) → 040 → 045 → 046 → (stretch 003a/b/041)
- **สมมติฐาน:** **UQ1 = synthetic OCR text** (QA ทำ fixture เลียนแบบ layout KBank/K PLUS — ห้ามใช้รูปสลิปจริง) · **UQ2 = ปิด** · **UQ3 = ยังไม่ยืนยัน → B2 เปิด** · re-check conditions เมื่อผู้ใช้ตอบ อยู่ใน planning §6.2
- **Git:** `main` = `6ebe779` (deploy สำเร็จ) · เอกสาร Sprint 2 planning/daily + backlog v7 ยังไม่ได้ commit
- **CI/Deploy:** run `45208481550` เขียวทุก job รวม Deploy → **B1, B3 ปิด**
- **Sprint 1:** Accepted (pending deploy) 92 pts · **Done = 0 จนกว่า OMX-048 ผ่านบน live** — งาน Day 1–2 ของ QA + PO (e2e บน live, Lighthouse ×3, HAR → ย้ายเป็น Done, tag `v0.1.0-uat`)
- **QA:** กำลังรัน TC ที่เคยติด B3 บน live (ผลจะบันทึกใน `docs/qa/` และ daily Day 2) · ผลก่อนหน้า (§7 ของ `docs/qa/test-summary-report.md`): Pass 120 / Fail 2 / Blocked 9 / Not run 1 · Open defects: BUG-009 High, BUG-010 High, BUG-007 Low · **NOT READY for UAT** (เหลือ BUG-009/010, B2)
- **OCR:** synthetic 27 ใบ type 100%, amount 96.3%, category 100%, date 100% · สลิปจริง 3 ใบ (FB-011): ยอด/วันที่/เวลา/ประเภท 3/3, หมวดหมู่ 1/3, ผู้รับ 0/3

## ผล Grooming Sprint 2 (สรุป — input ของ Planning)
- **BUG-009 → OMX-049 (3 pts):** หาผู้รับจากบรรทัดหลังเลขบัญชีผู้โอนแบบ masked `XXX-X-X####-X` (ใต้ลูกศร ↓) ใช้กับทุกธนาคารที่มี anchor แต่**เฉพาะสลิปรายจ่าย** · รวม D1 (payee empty state)
- **BUG-010 → OMX-050a (3) + OMX-050b (2):** 050a = ชื่อร้าน/biller ชนะคำบอกประเภทธุรกรรม ("จ่ายบิล" เป็น weak tier, เดี่ยว ๆ = Bills Medium) + keyword อาหารไทย + D2 (highlight หมวด Medium + `aria-describedby`) · 050b = fuzzy (confusable-char folding) Lazada/Shopee
- **OMX-051 (2):** enabler วัด payee ใน Layer A/B + benchmark baseline (fixture-first) · **049 + 050a + 050b = bundle เดียว**
- D3 → parked, D4 = OMX-035 คง Won't · OMX-045 = option A · OMX-039/047 เลื่อนไป Sprint 3
- Grooming เสนอ commit 29 pts → Planning ปรับเป็น **26** (ย้าย 003a/b + 041 = 4 pts ไป stretch เพราะ B2, เพิ่ม 052 = 1)

## กฎความเป็นส่วนตัว (ใช้เสมอ)
- **ห้าม commit รูปสลิปจริง** — **repo เป็น public แล้ว** สิ่งที่หลุดเข้า history ถือว่าเปิดเผยถาวร (ในรูปมีชื่อกับเลขบัญชี) · ห้ามส่งรูปเข้า sandbox/agent/chat
- Fixture จากสลิปจริง = **ข้อความ OCR ที่ปิดชื่อ/เลขบัญชี/เลขอ้างอิงแล้วเท่านั้น** ตาม redaction guideline ใน `docs/agile/grooming/sprint-2-qa.md` §2 (คง masked pattern และ OCR noise ไว้)
- ตรวจก่อนเปิด public แล้ว (gitleaks full history = 1 false positive, ไม่มีรูปสลิปจริงใน `git log --all`) · ทุก PR ต่อจากนี้: `git diff --stat` ไม่มีรูปสลิปจริง + gitleaks ผ่าน · Sprint 2 ใช้ **synthetic OCR text** เท่านั้นจนกว่าผู้ใช้จะส่ง redacted text (UQ1)

## สิ่งที่ต้องทำต่อ (เรียงตามลำดับ)
1. **Day 1–2 (QA + PO):** ผล TC บน live → OMX-048 (e2e `E2E_BASE_URL=https://jaijimjim.github.io/spendy-project/`, Lighthouse median-of-3, HAR) + ยืนยัน AC ของ 052 → ย้าย 92 pts + 028 + 052 เป็น **Done**, tag `v0.1.0-uat` · ถ้า TC บน live fail → hotfix จาก buffer ก่อน
2. **Day 1–3 (Dev + QA):** 051 baseline payee → 049 → 050a → 050b (fixture synthetic จาก QA G6/G7) → regression gate → merge + deploy bundle Day 3 EOD
3. **Designer Day 1:** G1 spec D1 + `review.noPayee`, G2 state table 041, G3 copy 046, G4 แก้ `design/screens.md` · design QA 049/050a/046
4. **PO ติดตามผู้ใช้:** UQ1 (ถ้าส่ง redacted OCR text → QA ตรวจ redaction → เพิ่ม fixture, ดู Dev re-estimate trigger 049 → 5), **UQ3** (ยืนยัน ≤ Day 3 → ดึง stretch 003a/b + 041 และ re-deploy; หรือยอมรับ "Not configured" → บันทึกการตัดสินใจ AI-6), UQ4 (สลิปจริง ≥ 11), UQ5 (re-test 3 ใบ Day 4), UQ6 (ช่วง UAT) · close loop FB-012/FB-013
5. **Day 4:** ผู้ใช้ re-test → Layer C · 042 report · 043 รอบ Review card · BUG-009/010 → Closed · UAT entry checklist
6. **Day 5:** Sprint Review/Demo บน live, Retro · UAT ใช้ buffer

## เอกสารหลัก
- `docs/agile/01-product-backlog.md` (v7: §6 status/sprint `S2`, §7 OMX-049/050a/050b/051/052, §9 ผล planning)
- `docs/agile/sprints/sprint-2/` (00 agenda, 01 grooming minutes, **02 sprint planning, 03 daily stand-up**) · `docs/agile/grooming/sprint-2-{design,dev,qa}.md`
- `docs/agile/sprints/sprint-1/` (01–05 + วิดีโอ demo) · `docs/agile/feedback-log.md` (FB-011 สลิปจริง, FB-012 Pages 404)
- `docs/qa/` (test plan, test cases, bug report, summary §7) · `design/` · `docs/adr/`

## หมายเหตุทางเทคนิค
- React 18.3.1 + TS 5.9 + Vite, HashRouter, base `/spendy-project/` (deploy ใช้ `/<repo-name>/` อัตโนมัติ), Tesseract.js self-host (copy จาก npm ตอน build)
- รันในเครื่อง: `npm ci && npm run dev` (เติม `?ocr=fake` เพื่อข้าม OCR จริง) · ตรวจทั้งหมด: `npm run ci` · e2e: `npm run build && npm run e2e` · e2e บน Pages: `E2E_BASE_URL=https://jaijimjim.github.io/spendy-project/`
- Test hook: `window.__OMX_TEST__ = { now, ocr: 'fake'|'real', storage }` · storage key `omx.v1`
- Parser อยู่ที่ `src/domain/slip/*` (`parties.ts` = payee, `categorize.ts` + `categories.rules.ts` = หมวดหมู่, `keywords.ts` = matcher)
- วิดีโอ demo อัดใหม่ได้ด้วย `scripts/record-demo.cjs` (ต้องเปิด `vite preview` ที่ port 4173 ก่อน)
