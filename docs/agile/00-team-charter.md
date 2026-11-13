# 00 — Team Charter: Omnitrix Money (MVP_0001)

> Owner: PO/PM · Last updated: 2026-11-13 · Status: Active

## 1. Product & Mission

**Omnitrix Money** คือ web application (static SPA) ที่ช่วยผู้ใช้ "บันทึกรายรับ–รายจ่ายอัตโนมัติจากรูปสลิป" — ดึงรูปจาก Google Photos หรืออัปโหลดเอง → OCR ในเบราว์เซอร์ → แยกประเภท (สลิปเงินเดือน = รายรับ, สลิปโอนเงิน = รายจ่าย) และหมวดหมู่ให้อัตโนมัติ → ผู้ใช้ตรวจ/แก้ไขก่อนบันทึก รองรับการกรอกเองด้วยมือ และสลับภาษา TH/EN

**Sprint Goal ของ MVP_0001:** ผู้ใช้เปิดเว็บจาก GitHub Pages, อัปโหลดสลิปธนาคารไทย/สลิปเงินเดือน, เห็นรายการที่ระบบแยกประเภท–หมวดหมู่ให้, ยืนยันบันทึก และดู dashboard สรุปรายเดือนได้ — ข้อมูลอยู่ในเครื่องผู้ใช้เท่านั้น

### Architecture constraints (ตกลงแล้ว — เปลี่ยนต้องผ่าน Change Coordination §8)
| Area | Decision |
|---|---|
| App | React + TypeScript + Vite, static SPA |
| Hosting | GitHub Pages, deploy ผ่าน GitHub Actions (ไม่มี backend ใน MVP) |
| OCR | Tesseract.js (`tha+eng`) ทำงานใน browser |
| Classification | Rule-based keyword engine บน OCR text (type, category, amount, date, recipient/memo) |
| Storage | `localStorage` + JSON export/import (backup), CSV export |
| Auth | ไม่มี login ใน MVP |
| Google Photos | Google Photos **Picker API** + Google Identity Services OAuth, ตั้งค่า `VITE_GOOGLE_CLIENT_ID`; ถ้าไม่ตั้งค่า → ปุ่มแสดงสถานะ "ยังไม่ได้ตั้งค่า / Not configured" |
| i18n / UI | TH/EN switch, mobile-first responsive, WCAG 2.1 AA |

## 2. Team Roles & Responsibilities

| Role | Responsibilities | Decision rights |
|---|---|---|
| **PO/PM** | Product vision, จัดการ Product Backlog (เขียน story + AC, จัดลำดับ MoSCoW), รับ feedback จากผู้ใช้/ลูกค้า, ประสานงานการเปลี่ยนแปลง (change coordination), facilitate ceremonies (ทำหน้าที่ Scrum Master ร่วม), ยอมรับ/ปฏิเสธงานตอน Review | Priority, scope, การ accept story |
| **Designer** | UX flow, wireframe/UI spec (mobile-first), design tokens, copy TH/EN, empty/error states, a11y (contrast, focus, labels) | UI/UX ภายใต้ AC |
| **Dev** | Architecture & implementation, OCR/classification engine, unit tests, CI/CD (GitHub Actions → Pages), technical estimate, ชี้ technical risk | วิธี implement, tech design ภายใต้ constraints |
| **QA** | Test plan/test cases จาก AC (Given/When/Then), ชุดสลิปตัวอย่าง (test fixtures), exploratory/regression/a11y/cross-browser test, รายงาน bug, ยืนยัน DoD | Pass/Fail ของ story ต่อ AC & DoD |

ทุกคนร่วมกัน estimate (story points, Fibonacci 1,2,3,5,8; >8 ต้องแตก story)

## 3. Definition of Ready (DoR)
Story จะถูกดึงเข้า Sprint Planning ได้เมื่อ:
1. เขียนในรูป "As a … I want … so that …" และมี ID (`OMX-xxx`)
2. มี Acceptance Criteria แบบ Given/When/Then ที่ QA ทดสอบได้ ครอบคลุม happy path + error/edge case หลัก
3. ระบุ priority (MoSCoW) และ dependency แล้ว
4. Designer มี UI spec/wireframe (ถ้ามี UI) และ copy TH/EN
5. ผ่าน Grooming และ estimate แล้ว ขนาด ≤ 8 points (ทำเสร็จได้ใน 1 sprint)
6. ไม่มีคำถามค้าง (open question) ที่ block การเริ่มงาน; test data (เช่น ตัวอย่างสลิป) พร้อมหรือมีแผนแล้ว — สำหรับ story ด้าน parser/extraction ต้องมี golden fixtures ก่อนเริ่ม (fixture-first)
7. **Environment access verified** — repo push access, deploy target (GitHub Pages) และ external credentials ที่ story ต้องใช้ (เช่น Google OAuth Client ID) พร้อมแล้ว หรือมี owner + วันที่ชัดเจน และมี stub ให้พัฒนาต่อได้ *(added after Sprint 1 Retro)*

## 4. Definition of Done (DoD)
Story ถือว่า Done เมื่อ:
1. Code merge เข้า `main` ผ่าน Pull Request ที่มีคน review อย่างน้อย 1 คน
2. ผ่าน TypeScript type check, lint และ unit tests ใน CI (GitHub Actions) — logic สำคัญ (parser/classifier/storage) มี unit test
3. QA ทดสอบผ่านทุก AC บน build ที่ deploy แล้ว (GitHub Pages) บน Chrome desktop + mobile viewport (และ Safari iOS/Android Chrome ตามความเหมาะสม)
4. UI มีข้อความครบทั้ง TH และ EN (ไม่มี hard-coded string)
5. ผ่าน a11y check พื้นฐาน: keyboard navigation, focus visible, label/aria, contrast AA (axe/Lighthouse ไม่มี critical issue)
6. ไม่มี bug ระดับ Critical/High ค้าง
7. ไม่ส่งรูป/ข้อมูลผู้ใช้ออกนอก browser (ยกเว้นเรียก Google API ตาม OMX ที่เกี่ยวข้อง)
8. เอกสารที่เกี่ยวข้อง (README / setup env / CHANGELOG) อัปเดตแล้ว
9. PO accept ใน Sprint Review

## 5. Ceremony Calendar (Sprint = 1 สัปดาห์แบบ compressed)

| Day | Ceremony | Timebox | Participants | Output |
|---|---|---|---|---|
| Day 0 (ก่อน Sprint) | **Backlog Grooming / Refinement** | 60 นาที | ทั้งทีม | Story ผ่าน DoR, estimate, แตก story ใหญ่ |
| Day 1 (จันทร์) เช้า | **Sprint Planning** | 60 นาที | ทั้งทีม | Sprint Goal, Sprint Backlog, task breakdown |
| Day 1–5 ทุกวัน | **Daily Stand-up** | 15 นาที | ทั้งทีม | ทำอะไรเมื่อวาน / วันนี้ / อุปสรรค |
| Day 3 (พุธ) | **Mid-sprint Grooming** | 30 นาที | ทั้งทีม | เตรียม backlog sprint ถัดไป + feedback ใหม่ |
| Day 5 (ศุกร์) บ่าย | **Sprint Review / Demo** | 45 นาที | ทีม + ลูกค้า/ผู้ใช้ | Demo บน GitHub Pages, รับ feedback → Feedback Log |
| Day 5 (ศุกร์) ท้ายวัน | **Retrospective** | 30 นาที | ทั้งทีม | Keep / Problem / Try, action items ≤ 3 ข้อ (มีเจ้าของ) |

> ในโหมด compressed (เช่น ทำงานภายในวันเดียว) ให้คงลำดับเดิม: Grooming → Planning → (Daily checkpoints) → Demo/Review → Retro

## 6. Working Agreement
- **Single source of truth:** Product Backlog = `docs/agile/01-product-backlog.md`; feedback = `docs/agile/feedback-log.md`
- **Git flow:** branch ชื่อ `feat/OMX-xxx-short-name`, `fix/OMX-xxx-…`; commit message อ้างอิง story ID; ห้าม push ตรงเข้า `main`
- **WIP limit:** คนละไม่เกิน 2 story ที่ In Progress พร้อมกัน
- **Status flow:** `New → Ready → In Progress → In Review → In QA → Accepted (pending deploy) → Done` (หรือ `Blocked`). `Accepted (pending deploy)` = PO accepted with every AC verified on a local production build, while DoD #1/#3/#9 still wait on deploy. It does **not** count as Done or as velocity
- **Checkpoint:** commit at least every half-day; long-running test runs write results incrementally *(Sprint 1 Retro)*
- **Communication:** ติดขัดเกิน 2 ชั่วโมง แจ้งทันที ไม่ต้องรอ Daily; การตัดสินใจสำคัญบันทึกเป็นลายลักษณ์อักษร (ใน PR/issue หรือ doc)
- **Quality first:** ไม่ข้าม test เพื่อให้ทัน; ถ้าไม่ทัน → ลด scope ร่วมกับ PO
- **Privacy by default:** รูปสลิปประมวลผลใน browser เท่านั้น; ห้าม log ข้อมูลการเงินผู้ใช้ออกนอกเครื่อง; ห้าม commit secret (Client ID ใช้ผ่าน env/GitHub Actions variables)
- **Language:** เอกสารภาษาไทยใช้ศัพท์เทคนิคภาษาอังกฤษได้; code/comment ภาษาอังกฤษ
- **Respect & blameless:** Retro เน้นที่ระบบ/กระบวนการ ไม่โทษตัวบุคคล

## 7. Feedback Intake Process
ช่องทาง: Sprint Review/Demo, GitHub Issues, ข้อความจากลูกค้า/ผู้ใช้, ผลการทดสอบของ QA, ข้อเสนอจากทีม

```
Feedback เข้ามา
   │ 1. Capture   — PO บันทึกลง feedback-log.md (FB-xxx) ภายใน 1 วันทำการ
   ▼
   │ 2. Triage    — PO จัดประเภท: Bug / Feature request / Improvement / Question / UX
   │                 และตัดสินใจ: Accept / Merge กับ story เดิม / Defer / Reject (พร้อมเหตุผล)
   ▼
   │ 3. Backlog   — ถ้า Accept: PO สร้าง/อัปเดต story (OMX-xxx) + AC + MoSCoW
   │                 แล้วลิงก์กลับใน feedback-log
   ▼
   │ 4. Grooming  — ทีมทบทวน, Designer/Dev/QA ให้ข้อมูล, estimate, ตรวจ DoR
   ▼
   │ 5. Planning  — ถ้า priority สูงพอ ดึงเข้า Sprint ถัดไป
   ▼
   │ 6. Close loop — แจ้งผู้ให้ feedback ถึงผลการตัดสินใจ / release ที่แก้แล้ว
```
- **Bug Critical** (เช่น ข้อมูลหาย, app ใช้งานไม่ได้, ข้อมูลรั่ว) → ข้ามคิว: PO แจ้งทีมทันที, Dev hotfix ใน sprint ปัจจุบัน, QA verify
- คำขอระหว่าง Sprint ที่ไม่ใช่ Critical → เข้า backlog ไว้สำหรับ Sprint ถัดไป (ไม่เปลี่ยน Sprint Backlog กลางคัน)

## 8. Change-Coordination Process
ใช้เมื่อต้องเปลี่ยน scope, AC, architecture constraint, design หรือ priority ระหว่างทาง

1. **Raise** — ใครก็ได้แจ้ง change request ต่อ PO (ระบุ: อะไร, ทำไม, ผลกระทบที่คาด)
2. **Impact analysis** (PO ประสาน ≤ 1 วัน) — Dev: effort/technical risk; Designer: UX/flow; QA: test & regression impact
3. **Decide** — PO ตัดสินใจเรื่อง scope/priority; การเปลี่ยน architecture constraint ต้องเห็นชอบทั้งทีม (PO + Dev เป็นหลัก) และบันทึกเป็น ADR สั้น ๆ (`docs/adr/`)
4. **Trade-off** — ถ้าเพิ่มงานเข้า Sprint ปัจจุบัน ต้องเอา story ขนาดเท่ากันออก (Sprint Goal ต้องไม่เสีย); ถ้ากระทบ Sprint Goal → PO อาจยกเลิก/ปรับ Sprint Goal ร่วมกับทีม
5. **Communicate** — PO อัปเดต backlog (AC/status/priority), แจ้งทีมใน Daily/ช่องทางทีม และแจ้งลูกค้าถ้ากระทบสิ่งที่สัญญาไว้
6. **Track** — บันทึก change ใน Change Log ด้านล่าง

### Change Log
| Date | Change | Reason | Impact | Decided by |
|---|---|---|---|---|
| 2026-11-13 | Baseline charter & architecture constraints | Sprint 0 kickoff | — | PO + Team |
| 2026-11-13 | Grooming decisions: Tesseract assets self-hosted from pinned npm at build; hand-rolled SVG charts; money = integer satang; dates = `YYYY-MM-DD` Asia/Bangkok; QA owns synthetic slip fixtures | Sprint 1 Grooming (OQ1–OQ4) | Backlog v2 AC; ADRs 0001–0003 | PO + Team |
| 2026-11-13 | Sprint 1 commits all Must stories (77 pts, incl. Google Photos 003a/003b/004) with extended capacity vs ~40 pts velocity; Should = stretch | Customer explicitly requires Google Photos, auto-categorisation and external hosting in MVP_0001 | Schedule risk accepted; Day-3 checkpoint; Must cut-last order in sprint plan | PO + Team |
| 2026-11-13 | New status `Accepted (pending deploy)`; DoR #7 "Environment access verified"; DoR #6 fixture-first for parser stories; half-day checkpoint rule | Sprint 1 Review/Retro: deploy blocked all sprint (B1), late fixtures, container restart | Sprint 1 stories recorded as Accepted (pending deploy), 0 pts Done until Pages verification (OMX-048) | PO + Team |
| 2026-11-13 | Sprint 2 planned at measured velocity (~40) minus UAT/hotfix buffer; AI-assisted throughput tracked separately | Retro AI-3: the 77 pts overcommit worked only thanks to AI agents | Sprint 2 candidate list in backlog §9 | PO + Team |

## 9. Risks & Assumptions (initial)
| Risk | Mitigation |
|---|---|
| OCR ภาษาไทยของ Tesseract.js แม่นยำไม่สูง (font/ความละเอียด) | Image pre-processing (grayscale/scale), parser ทนต่อ noise, หน้าตรวจ/แก้ไขก่อนบันทึกเสมอ |
| Language data `tha` ขนาดใหญ่ → โหลดช้า | Lazy-load worker ครั้งแรกที่ใช้, แสดง progress, cache โดย browser |
| Google Photos Picker API ต้องมี OAuth Client ID + authorized origin | สถานะ "Not configured" ที่ชัดเจน; README อธิบายการตั้งค่า |
| localStorage จำกัด ~5MB และหายได้ถ้าล้าง browser | ไม่เก็บรูปเต็ม (เก็บแค่ข้อมูล + hash), เตือนให้ export backup |
| รูปแบบสลิปแต่ละธนาคารต่างกัน | Keyword dictionary แยกต่อธนาคาร, ชุด test fixtures จาก QA |
