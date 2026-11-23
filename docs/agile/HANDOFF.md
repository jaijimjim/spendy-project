# HANDOFF — Spendy Money (MVP_0001, เดิม Omnitrix Money) · Sprint 2 Day 1 (scope change หลังสลิปจริง 16 ใบ)

อัปเดต: 23 พ.ย. 2569 · Repo: github.com/jaijimjim/spendy-project (**public** · เปลี่ยนชื่อจาก omnitrix-project เมื่อ 23 พ.ย. 69) · **Live: https://jaijimjim.github.io/spendy-project/ — ใช้งานได้แล้ว** (หน้า "Home · Spendy Money")

> **อัปเดตล่าสุด (23 พ.ย. 69, Day 1 บ่าย — scope change):** ผู้ใช้ส่ง**สลิปจริง 16 ใบ** (UQ4 ปิด) → QA วัด **OMX-042** (type 16/16, amount 13/16 ผิดแบบเงียบ 2, date 13/16, time 16/16, **payee 0/16**, category 2/16 ใบชัด 0/9) → **PO accept 042 (Done)** · bug ใหม่ BUG-011…015 → ticket **OMX-053** (amount, High, 2) + **OMX-054** (date `w.g.`, 1) เข้า sprint, 055/056/057 → S3 · 049 3→5, 050b 2→3, 048 2→3 · เลื่อน 040/045/046 → S3 · **commit 26 → 29** (≤ ~30, buffer ~10) · 028 AC1 = failing-gate proof · 048 = `post-deploy.yml` บน GitHub Actions · backlog **v8** · รายละเอียด `sprints/sprint-2/02-sprint-planning.md` §9
>
> *(ก่อนหน้า — Sprint 2 Planning)* **B3 ปิดแล้ว** — ผู้ใช้เปลี่ยน repo เป็น public + `spendy-project` และตั้ง Pages Source = GitHub Actions · run **`45208481550`** (commit `6ebe779`) ผ่านทุก job: CI ทั้งหมด + Build for Pages + Deploy · OMX-052 (rename, 1 pt) เสร็จในโค้ดและอยู่บน live · ผู้ใช้สั่งเริ่ม sprint → **Sprint 2 Planning เสร็จ** (`docs/agile/sprints/sprint-2/02-sprint-planning.md`), commit **26 pts**, backlog **v7** · UQ1/UQ3 ยังไม่ตอบ → ใช้สมมติฐาน (ด้านล่าง)

## ทีมและวิธีทำงาน
- ทีม agent 4 บทบาท: **PO/PM, Designer, Dev, QA** ทำงานแบบ Scrum ตาม ceremony ครบ (Grooming → Planning → Daily → Demo → Retro)
- PO รับ feedback จาก user → บันทึกใน `docs/agile/feedback-log.md` → สร้าง backlog → grooming กับทีม แล้ว PO ประสานงานเมื่อต้องแก้หรือเปลี่ยนอะไร
- ภาษาในเอกสาร: ไทย + ศัพท์เทคนิคอังกฤษ · ภาษา UI: TH/EN สลับได้

## สถานะปัจจุบัน
- **Sprint 2: เริ่มแล้ว** (Day 1 = 23 พ.ย., Day 5 = 27 พ.ย. Review/Demo + Retro) · Planning: `docs/agile/sprints/sprint-2/02-sprint-planning.md` · Daily: `03-daily-standup.md`
- **Sprint Goal:** live แล้ว → ยืนยันบน live ให้ 92 pts ของ Sprint 1 เป็น Done + tag `v0.1.0-uat` (Day 2) → แก้ BUG-009/010 (bundle 049/050a/050b) deploy Day 3 → ผู้ใช้ re-test สลิปจริง 3 ใบ Day 4 (payee/category ≥ 2/3, เป้า 3/3) → ตรวจอุปกรณ์จริง, วัด accuracy สลิปจริง, ผ่าน UAT entry
- **Commit 29 pts (v8):** 052 (1, Done), 028 (1), 048 (3), 051 (2), **049 (5) + 050a (3) + 050b (3) = bundle ห้ามแยก**, **053 (2, High)**, 054 (1), 043 (3), 042 (3, **Done**), 029 (2) · Done 4 / remaining 25 · **Stretch (B2):** 003a/b (2) + 041 (2) — ดึงได้เฉพาะเมื่อมี pts Done เกินแผน (ผู้ใช้ไม่ต้องการ commit เกิน velocity) · 044 conditional · buffer ~10 · cut order: **054 → 029 → 043 AC3** · ห้ามตัด bundle และ 053 · เลื่อนไป S3: 040, 045, 046
- **Gate สลิปจริง (n = 16, `realSlips.test.ts` ใน CI):** payee ≥ 12/16 (≥ 1 ต่อแอป, 0 ชื่อผู้โอน) · category ใบชัด ≥ 6/9 (≥ 60%) · amount ≥ 15/16 + ยอดผิด 0 · date 16/16 · ทุก PR ยก `BASELINE`
- **ลำดับงาน Dev (v8):** 028 AC1 failing-gate proof (draft PR ล้มโดยตั้งใจ + `workflow_dispatch` deploy.yml บน branch → build/deploy skipped; ห้าม merge) → 048 `post-deploy.yml` (Playwright `E2E_BASE_URL` + Lighthouse CI mobile ×3 + HAR synthetic) → pair 051 → **049** → **053** → 050a → 050b → 054 → merge + deploy bundle Day 3 EOD → buffer: ตรวจ append/replace เมื่อเลือกไฟล์ซ้ำ (FB-016)
- **สมมติฐาน/คำถาม:** ~~UQ1 = synthetic~~ → **มี redacted OCR text จริง 16 ใบแล้ว** (`tests/fixtures/real-slips`) · UQ2 ปิด · **UQ3 ยังไม่ยืนยัน → B2 เปิด** · **UQ4 ปิด** · เปิดใหม่: **UQ7** ยืนยันหมวด 7 ใบ (r04, r06, r07, r09, r11, r13, r14) · **UQ8** หมวด "บริจาค" (r10) · **UQ9** เครื่อง/เบราว์เซอร์ของ FB-016 (อัปโหลดหลายรูป — Need info) · UQ10 สลิปเพิ่ม SCB/เงินเดือน (S3) — planning §6.2a
- **Git:** `main` = `6ebe779` (deploy สำเร็จ) · เอกสาร Sprint 2 (planning §9, daily, backlog v8, feedback-log, charter, board `data.json` + `board.mjs edit`) ยังไม่ได้ commit
- **CI/Deploy:** run `45208481550` เขียวทุก job รวม Deploy → **B1, B3 ปิด**
- **Sprint 1:** Accepted (pending deploy) 92 pts · **Done = 0 จนกว่า OMX-048 ผ่านบน live** — งาน Day 1–2 ของ QA + PO (e2e บน live, Lighthouse ×3, HAR → ย้ายเป็น Done, tag `v0.1.0-uat`)
- **QA (Day 1):** live verification §8 (TC-137 Pass; 028 AC2–5 ✓; 048 AC1–3 ยังไม่รัน เพราะ sandbox เข้า github.io ไม่ได้) + OMX-042 §9 · Open: BUG-009/010/011 High, BUG-013/014 Medium, BUG-007/012/015 Low · ~~กำลังรัน TC ที่เคยติด B3 บน live~~ (ผลจะบันทึกใน `docs/qa/` และ daily Day 2) · ผลก่อนหน้า (§7 ของ `docs/qa/test-summary-report.md`): Pass 120 / Fail 2 / Blocked 9 / Not run 1 · Open defects: BUG-009 High, BUG-010 High, BUG-007 Low · **NOT READY for UAT** (เหลือ BUG-009/010, B2)
- **OCR:** synthetic 27 ใบ type 100%, amount 96.3%, category 100%, date 100% · **สลิปจริง 16 ใบ (OMX-042):** type 16/16, amount 13/16 (ผิด 2), date 13/16, time 16/16, payee 0/16, category 2/16 (ใบชัด 0/9)

## กฎ Spendy board (บังคับ — charter §6.1)
- ทุก role ที่เริ่ม/ส่งต่อ/ปิด ticket ต้องอัปเดตบอร์ดทันทีในงานชิ้นเดียวกัน: `node docs/agile/board/board.mjs set <OMX-id> <backlog|blocked|todo|progress|qa|done> [--note "..."]`
- ticket ใหม่: `board.mjs add <id> <epic> "<title>" <Must|Should|Could> <pts> <col> [--high] [--sprint S2|S3] [--owner Dev|QA|Designer]` · re-estimate/ย้าย sprint: `board.mjs edit <id> --pts N --sprint S2|S3|- [--note ...]` (ยอดรวม Sprint บนบอร์ดนับจาก field sprint)
- Dev → `progress` · ส่ง QA → `qa` · QA ผ่าน + PO รับ → `done` · ติด → `blocked` + note · orchestrator รัน `board.mjs build` แล้ว publish `dist/index.html` ไป artifact "Spendy Sprint 2 Board"

## ผล Grooming Sprint 2 (สรุป — input ของ Planning)
- **BUG-009 → OMX-049 (3 pts):** หาผู้รับจากบรรทัดหลังเลขบัญชีผู้โอนแบบ masked `XXX-X-X####-X` (ใต้ลูกศร ↓) ใช้กับทุกธนาคารที่มี anchor แต่**เฉพาะสลิปรายจ่าย** · รวม D1 (payee empty state)
- **BUG-010 → OMX-050a (3) + OMX-050b (2):** 050a = ชื่อร้าน/biller ชนะคำบอกประเภทธุรกรรม ("จ่ายบิล" เป็น weak tier, เดี่ยว ๆ = Bills Medium) + keyword อาหารไทย + D2 (highlight หมวด Medium + `aria-describedby`) · 050b = fuzzy (confusable-char folding) Lazada/Shopee
- **OMX-051 (2):** enabler วัด payee ใน Layer A/B + benchmark baseline (fixture-first) · **049 + 050a + 050b = bundle เดียว**
- D3 → parked, D4 = OMX-035 คง Won't · OMX-045 = option A · OMX-039/047 เลื่อนไป Sprint 3
- Grooming เสนอ commit 29 pts → Planning ปรับเป็น **26** (ย้าย 003a/b + 041 = 4 pts ไป stretch เพราะ B2, เพิ่ม 052 = 1)

## กฎความเป็นส่วนตัว (ใช้เสมอ)
- **ห้าม commit รูปสลิปจริง** — **repo เป็น public แล้ว** สิ่งที่หลุดเข้า history ถือว่าเปิดเผยถาวร (ในรูปมีชื่อกับเลขบัญชี) · ห้ามส่งรูปเข้า sandbox/agent/chat
- Fixture จากสลิปจริง = **ข้อความ OCR ที่ปิดชื่อ/เลขบัญชี/เลขอ้างอิงแล้วเท่านั้น** ตาม redaction guideline ใน `docs/agile/grooming/sprint-2-qa.md` §2 (คง masked pattern และ OCR noise ไว้)
- **Real-slip fixtures (OMX-042, `tests/fixtures/real-slips/`):** commit ได้เฉพาะ `redacted/rNN.txt` (OCR text ที่ปิดข้อมูลแล้ว) + `expected.json` (ชื่อสมมติ) · **`images/` (รูปจริง r01–r16) และ `*.local.json` (OCR ดิบ/ground truth ชื่อจริง) = git-ignored, local-only บนเครื่อง QA — ห้าม `git add -f`, ห้ามใช้ใน workflow/CI** (CI ใช้ redacted text) · สคริปต์ที่แตะข้อมูลจริงอยู่นอก repo (`/home/claude/scripts/`) · OCR ใหม่ → ตรวจ redaction (denylist grep = 0) ก่อน commit
- ตรวจก่อนเปิด public แล้ว (gitleaks full history = 1 false positive, ไม่มีรูปสลิปจริงใน `git log --all`) · ทุก PR ต่อจากนี้: `git diff --stat` ไม่มีรูปสลิปจริง + gitleaks ผ่าน · fixture parser = synthetic หรือ redacted text เท่านั้น · `post-deploy.yml` ใช้สลิปสังเคราะห์เท่านั้น

## สิ่งที่ต้องทำต่อ (เรียงตามลำดับ)
1. **Day 1–2 (Dev):** 028 AC1 failing-gate proof → QA ส่ง `qa` → PO accept · `post-deploy.yml` → QA review artifact (e2e/Lighthouse ×3/HAR) → 048 → PO ย้าย 92 pts + 028 → **Done**, tag `v0.1.0-uat` · fallback: รันคำสั่งเดียวกันจากเครื่องที่เข้า github.io ได้
2. **Daily Day 2:** Dev ยืนยัน estimate 049 (5), 050b (3), 053 (2), 054 (1), 048 (+1) — ถ้า 049 > 5 → PO ตัด 054 + 029 · checkpoint Day 2 บ่าย
3. **Day 1–3 (Dev + QA):** 051 → 049 → 053 → 050a → 050b → 054 → regression gate (Layer A 100%, Layer B 27/27, gate สลิปจริง §9.3, ยก `BASELINE`) → merge + deploy bundle Day 3 EOD
4. **PO ติดตามผู้ใช้:** **UQ7/UQ8** (หมวดสลิปจริง → QA อัปเดต `expected.json`, gate category ขยาย) · **UQ9** (FB-016 เครื่อง/เบราว์เซอร์) · UQ3 (B2 — ถ้ายืนยัน ดึง stretch ได้เฉพาะเมื่อมี pts Done เกินแผน) · UQ5 (re-test 3 ใบ Day 4 = signal) · UQ6 (ช่วง UAT) · UQ10 (สลิป SCB/เงินเดือน → OMX-057, S3)
5. **Day 4:** QA re-test BUG-009/010/011/013 → Closed · 043 รอบ Review card · UAT entry checklist (BUG-011 High ต้องปิด)
6. **Day 5:** Sprint Review/Demo บน live, Retro · UAT ใช้ buffer · Sprint 3 candidates: 040, 045, 046, 039 (+AC5), 055, 056, 057, 047, หมวดบริจาค (ถ้า UQ8 = ใช่)

## เอกสารหลัก
- `docs/agile/01-product-backlog.md` (**v8**: §6, §7 OMX-049/050a/050b + ใหม่ 053–057, OMX-042 Done, §9) · board: `docs/agile/board/` (`data.json`, `board.mjs`)
- `docs/agile/sprints/sprint-2/` (00 agenda, 01 grooming minutes, **02 sprint planning (§9 scope change Day 1), 03 daily stand-up**) · `docs/agile/grooming/sprint-2-{design,dev,qa}.md`
- `docs/agile/sprints/sprint-1/` (01–05 + วิดีโอ demo) · `docs/agile/feedback-log.md` (FB-011 สลิปจริง 3 ใบ, **FB-014** สลิปจริง 16 ใบ, **FB-015** คำถามหมวด, **FB-016** อัปโหลดหลายรูป — Need info)
- `docs/qa/` (test plan, test cases, bug report BUG-001…015, summary §7–§9) · `tests/fixtures/real-slips/README.md` · `design/` · `docs/adr/`

## หมายเหตุทางเทคนิค
- React 18.3.1 + TS 5.9 + Vite, HashRouter, base `/spendy-project/` (deploy ใช้ `/<repo-name>/` อัตโนมัติ), Tesseract.js self-host (copy จาก npm ตอน build)
- รันในเครื่อง: `npm ci && npm run dev` (เติม `?ocr=fake` เพื่อข้าม OCR จริง) · ตรวจทั้งหมด: `npm run ci` · e2e: `npm run build && npm run e2e` · e2e บน Pages: `E2E_BASE_URL=https://jaijimjim.github.io/spendy-project/`
- Test hook: `window.__OMX_TEST__ = { now, ocr: 'fake'|'real', storage }` · storage key `omx.v1`
- Parser อยู่ที่ `src/domain/slip/*` (`parties.ts` = payee, `categorize.ts` + `categories.rules.ts` = หมวดหมู่, `keywords.ts` = matcher)
- วิดีโอ demo อัดใหม่ได้ด้วย `scripts/record-demo.cjs` (ต้องเปิด `vite preview` ที่ port 4173 ก่อน)
