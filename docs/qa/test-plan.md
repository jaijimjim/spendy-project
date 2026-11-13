# Test Plan — Omnitrix Money MVP_0001 (Sprint 1)

> Owner: QA · Version 1.0 · 2026-11-13 (Sprint 1 Day 4)
> รายละเอียดเชิงลึก (testability review, test pyramid, data strategy, UAT entry/exit criteria) อยู่ใน [`docs/agile/grooming/sprint-1-qa.md`](../agile/grooming/sprint-1-qa.md) — เอกสารนี้สรุปเฉพาะสิ่งที่ใช้จริงใน Sprint 1

## 1. Scope

**In scope (Sprint 1 build, commit `main` local):**
- Must ทั้งหมด: OMX-001, 003a, 003b, 004, 005, 006, 007, 008, 010, 012a, 012b, 013, 014, 016, 017, 018, 021, 024, 025, 026, 027, 028, 030
- Should ที่ Dev ทำเสร็จ (stretch): OMX-002, 009, 011, 015, 019, 020, 022, 023, 029 (เฉพาะ AC2/AC4), 031
- OCR accuracy: Layer A (golden OCR text → parser) และ Layer B (synthetic slip images → real Tesseract ใน built app)

**Out of scope / Blocked:**
- Deploy บน GitHub Pages, post-deploy smoke, Lighthouse บน Pages URL, gitleaks ใน CI → **Blocked by B1** (push access)
- Google OAuth/Picker จริง (003a/003b real flow, 031 AC4) → **Blocked by B2** (ไม่มี Client ID) — ทดสอบผ่าน stub wrapper แทน
- Reference devices จริง (029 AC1/AC3/AC5), iOS Safari, screen reader จริง → ทำใน UAT prep เมื่อมี Pages URL
- Layer C (สลิปจริง/calibration set) → ยังไม่ได้รับจาก PO/ลูกค้า (A5)
- Won't stories (OMX-032–038), OMX-039 (Could)

## 2. Approach

| Level | Tool | ไฟล์ / ตำแหน่ง | หมายเหตุ |
|---|---|---|---|
| Unit (domain/parser) | Vitest | `src/**/*.test.ts` | Dev starter set + QA Layer A golden (`src/domain/slip/qaGolden.test.ts`) — open defect รันเป็น `it.fails` |
| Component | Vitest + Testing Library | `src/**/*.test.tsx` | |
| E2E (fake OCR, deterministic) | Playwright, projects `mobile` (375px) + `desktop` (1280px) | `tests/e2e/app.spec.ts`, `tests/e2e/qa.spec.ts` | open defect ใช้ `test.fail()` → แดงทันทีเมื่อแก้แล้ว |
| E2E real OCR | Playwright project `real-ocr` | `tests/e2e/real-ocr.spec.ts`, `tests/e2e/benchmark.real-ocr.spec.ts` | benchmark บน 27 synthetic images, gate type ≥ 90 / amount ≥ 80 / category ≥ 60 |
| Visual / screens | Playwright project `screens` | `tests/e2e/screens.spec.ts` | capture หน้าหลัก + dark EN |
| a11y | axe-core/playwright | `app.spec.ts` (6 หน้าหลัก + Review) | 0 critical/serious |
| Manual / exploratory | Playwright script บน `vite preview` | `docs/qa/test-cases.md` (type = manual) | 375/1280px × TH/EN × light/dark |

**Test data**
- Layer A: `src/domain/slip/__fixtures__/qaGolden.ts` — 20 edge cases จาก grooming + 12 recorded Tesseract outputs
- Layer B: `tests/fixtures/slips/` — HTML templates (ธนาคารสมมติ ไม่มีโลโก้/แบรนด์จริง) → `generate.mjs` → 18 base images + 9 degraded variants (JPEG low-res, blur, rotate 2°, dark) + `expected.json`
- ไม่มีข้อมูลส่วนบุคคลจริงใน repo

**Defect severity:** ตาม grooming §2.3 (Critical / High / Medium / Low) · Bug log: [`bug-report.md`](bug-report.md)

## 3. Environments

| Env | URL / Command | ใช้ทำอะไร | สถานะ |
|---|---|---|---|
| Local preview | `npm run build && npm run preview` → `http://localhost:4173/omnitrix-project/` | e2e, benchmark, exploratory | ใช้งาน |
| CI (GitHub Actions) | `ci.yml` | gate ทุก PR | Blocked (B1) |
| Production / UAT | `https://jaijimjim.github.io/omnitrix-project/` | QA sign-off, UAT | Blocked (B1) |

Browser ใน sandbox: Chromium 1243 (`PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`), timezone `Asia/Bangkok` (+ 1 test ใน `America/Los_Angeles`), locale th-TH/en-US. Firefox/WebKit/iOS Safari/Android จริง = ยังไม่ได้ทดสอบ (risk ใน summary)

## 4. Entry / Exit criteria (Sprint QA)

**Entry (เริ่ม test รอบ Sprint 1):** Dev-complete + local CI เขียว (lint, typecheck, unit, build) ✅ · fake OCR + test hooks (`window.__OMX_TEST__`) พร้อม ✅

**Exit (QA sign-off ของ Sprint):**
1. ทุก test case ของ Must = Pass หรือ Blocked (มีเหตุผล) — ไม่มี Fail ที่เป็น Critical/High
2. Layer A ≥ 95% ต่อ field (type/amount) และ Layer B ผ่าน gate (type ≥ 90%, amount ≥ 80%, category ≥ 60%)
3. axe 0 critical/serious, network allowlist test เขียว
4. Bug ระดับ Medium ทุกตัวมี triage decision

**UAT entry/exit:** ใช้ตาม grooming §5.1 / §5.2 (ข้อ 1–3, 8 ยังทำไม่ได้จนกว่า B1/B2 ปิด) — สรุปผลเทียบใน [`test-summary-report.md`](test-summary-report.md)

## 5. Deliverables

- [`test-cases.md`](test-cases.md) — test cases + execution result
- [`bug-report.md`](bug-report.md) — defect log
- [`test-summary-report.md`](test-summary-report.md) — ผลรวม, OCR accuracy, Go/No-Go
- `tests/fixtures/slips/benchmark-results.json` — raw benchmark output
