# Grooming — Sprint 1 · Developer Input

> Author: Dev · Date: 2026-11-13 · Ceremony: Backlog Grooming (Day 0)
> Inputs: `00-team-charter.md`, `01-product-backlog.md` · Scale: Fibonacci 1, 2, 3, 5, 8 (>8 ต้องแตก)
> สถานะ: **ข้อเสนอจาก Dev** — ตัวเลขสุดท้ายตกลงร่วมกันใน grooming (planning poker) แล้ว PO เป็นคนอัปเดต backlog

---

## 0. TL;DR

| Item | Value |
|---|---|
| **Must total** | **77 pts** (21 stories) |
| Should total | 29 pts (10 stories) |
| Must + Should | 106 pts |
| Assumed velocity (Sprint 1) | ~40 pts |
| ข้อสรุป | Must ทั้งหมด ≈ **2 sprints** → Sprint Goal เต็มรูปแบบ **ไม่พอดี** 1 sprint; ต้อง slice (ดู §4) |

**ข้อเสนอสำคัญ**
1. Tesseract worker + core + lang data → **self-host** (copy จาก npm package ที่ pin version ตอน build) ไม่ commit ลง git, ไม่ใช้ CDN
2. Chart → **hand-rolled SVG** (0 KB dependency, a11y ควบคุมเองได้เต็มที่); fallback = Chart.js แบบ lazy-load
3. สลิป "ได้รับเงินโอน" → MVP: keyword rule + ผู้ใช้สลับ type เองใน Review (ตาม default ของ PO); การ match ชื่อเจ้าของ = story ใหม่ระดับ Could หลัง OMX-009
4. แนะนำให้ PO ย้าย OMX-003/004 (Google Photos, 10 pts) ไป Sprint 2 — ความเสี่ยงสูงสุด (OAuth/Picker/Pages origin) และไม่จำเป็นต่อ "อัปโหลดสลิปแล้วบันทึกได้"

---

## 1. Story Point Estimates

> Rationale สั้น ๆ; "unit" = unit test (Vitest), "e2e" = Playwright. ทุก story รวมงาน i18n key TH/EN + a11y พื้นฐานตาม DoD แล้ว

### 1.1 Must (77 pts)

| ID | Title | Pts | Rationale |
|---|---|---|---|
| OMX-001 | Upload slip images | **3** | `<input type=file multiple accept>` + validation (type/size/count) เป็น pure function → unit test ง่าย; thumbnail ใช้ `URL.createObjectURL` (ต้อง revoke) |
| OMX-003 | Google Photos Picker | **8** | GIS token client + Picker API session (create → `pickerUri` → poll `mediaItems`) + download `baseUrl=d` พร้อม Bearer token; ทดสอบยาก (ต้องมี Client ID จริง, mock ใน unit), popup blocking บน iOS Safari. ใกล้เพดาน 8 → พิจารณาแตก (ดู §3) |
| OMX-004 | GP not configured / auth errors | **2** | Feature flag จาก `import.meta.env.VITE_GOOGLE_CLIENT_ID` + error states + README section |
| OMX-005 | In-browser OCR + progress queue | **5** | Tesseract.js worker lifecycle (lazy create, reuse, terminate on cancel), queue state machine, progress logger, image pre-process (downscale/grayscale ผ่าน canvas/OffscreenCanvas), self-host asset config |
| OMX-006 | Detect type income/expense | **3** | Keyword rules + scoring + confidence; ข้อความ OCR ภาษาไทยมี noise (สระ/วรรณยุกต์หลุด, ช่องว่างแทรก) → ต้องมี text normalizer ใช้ร่วมกับ 007/008/010 |
| OMX-007 | Extract amount | **5** | Regex + label proximity ("จำนวนเงิน", "Amount", "เงินได้สุทธิ", "Net Pay"), ตัด fee/ยอดคงเหลือ, OCR confusions (O↔0, l↔1, `,`↔`.`); ต้องจูนกับ fixtures จริง |
| OMX-008 | Extract date/time (TH/BE) | **5** | เดือนย่อ/เต็มไทย, ปี พ.ศ. 2/4 หลัก, หลายรูปแบบ EN, pay-period ของสลิปเงินเดือน, future-date rule; ระวัง timezone (เก็บเป็น local date string `YYYY-MM-DD` ไม่ใช่ `Date` UTC) |
| OMX-010 | Auto-categorize | **5** | Dictionary data file (`categories.rules.ts`), weight ตามตำแหน่ง match (payee > memo > text), person-name heuristic, unit tests ต่อ category |
| OMX-012 | Review & confirm screen | **8** | หน้าที่ซับซ้อนที่สุด: list ของ editable cards, validation, type→category filter, select/save-all/discard, unsaved-changes guard (router blocker + `beforeunload`), image modal, raw text collapsible |
| OMX-013 | Manual entry form | **3** | ใช้ `TransactionForm` component ร่วมกับ 012/016 (ถ้าทำหลัง 012 จริง ๆ เหลือ ~2) |
| OMX-014 | Transaction list | **3** | Group by date, i18n date/number via `Intl`, badges; >100 rows: memoized rows พอ (ไม่ต้อง virtualize ที่ ≤1,000 rows) |
| OMX-016 | Edit & delete + undo | **3** | Reuse form; undo = soft-delete ใน store + toast 5 s (aria-live) |
| OMX-017 | Month selector | **2** | `selectedMonth` ใน global store (`YYYY-MM`), `Intl.DateTimeFormat('th-TH-u-ca-buddhist')` ให้ปี พ.ศ. อัตโนมัติ |
| OMX-018 | Monthly summary | **2** | Pure selector + 3 cards; money math เป็น integer satang |
| OMX-021 | Persist in localStorage | **3** | Versioned envelope `omx.v1`, write-through ด้วย try/catch (QuotaExceeded/SecurityError), corrupt → backup key `omx.v1.corrupt.<ts>`, zod validate on load |
| OMX-024 | TH/EN switch | **3** | i18n setup + typed keys + `<html lang>` + persist + CI check missing keys; จำนวน string ทั้งแอปเป็นงานต่อเนื่องในทุก story |
| OMX-025 | Responsive layout & nav | **3** | App shell, bottom nav/side nav, `HashRouter` (GitHub Pages ไม่มี SPA fallback) |
| OMX-026 | Empty states & errors | **3** | `EmptyState` component, `ErrorBoundary`, `useOnlineStatus`, live region service |
| OMX-027 | Accessibility AA | **3** | ส่วนใหญ่ฝังในทุก story; story นี้ = dialog focus trap (ใช้ native `<dialog>`), reduced-motion, axe ใน Playwright, audit + fix pass |
| OMX-028 | Deploy via GitHub Actions | **3** | Workflow CI + `actions/deploy-pages`, Vite `base`, env injection, Tesseract asset path ทำงานใต้ sub-path |
| OMX-030 | Privacy NFR | **2** | ส่วนใหญ่เป็นผลจาก design (self-host); งาน = Delete-all, Privacy copy, CSP `<meta>`, e2e ตรวจ network ว่าไม่มี request ออกนอก origin |

### 1.2 Should (29 pts)

| ID | Title | Pts | Rationale |
|---|---|---|---|
| OMX-002 | Drag & drop | **2** | Reuse validation จาก 001; ป้องกัน window drop navigation |
| OMX-009 | Payee/memo/bank/ref | **5** | Layout แต่ละธนาคารต่างกันมาก (block "จาก/ไปยัง"), masking เลขบัญชี, ref no. หลายรูปแบบ; ต้องการ fixtures ครบทุกธนาคาร |
| OMX-011 | Duplicate detection | **3** | SHA-256 ผ่าน `crypto.subtle.digest` (ต้องเป็น secure context — Pages เป็น HTTPS ✓), match rules; ขึ้นกับ 009 (ref no.) สำหรับ AC2 |
| OMX-015 | Filter & search | **3** | Filter state (type, categories, query) + Thai-aware normalize (`toLocaleLowerCase`, NFC) |
| OMX-019 | Category chart | **3** | SVG chart + data table + click → filter (ขึ้นกับ 015) |
| OMX-020 | Trend chart | **3** | SVG grouped bar 6 เดือน + table; reuse chart primitives จาก 019 (ถ้าทำต่อกัน ~2) |
| OMX-022 | JSON export/import | **3** | Blob download, file read, zod schema validate, merge/replace + confirm |
| OMX-023 | CSV export | **2** | RFC 4180 escape + BOM — pure function, unit test ง่าย |
| OMX-029 | Performance budget | **3** | Code-split routes, lazy Tesseract, `size-limit`/bundle check ใน CI, Lighthouse CI (optional) |
| OMX-031 | Security hygiene | **2** | Lint rule ห้าม `dangerouslySetInnerHTML`, gitleaks/secret scan ใน CI, scope ขั้นต่ำ (overlap กับ 003) |

### 1.3 Won't (OMX-032..038)
ไม่ estimate ใน sprint นี้ (Deferred) — หมายเหตุ: OMX-037 (PWA) จะได้ประโยชน์จากการ self-host Tesseract assets (cache ด้วย service worker ได้ทันที)

---

## 2. Technical Risks

| # | Risk | Likelihood / Impact | Mitigation |
|---|---|---|---|
| R1 | **ความแม่นยำ OCR ภาษาไทย** ต่ำกว่า success metric (≥80% amount) — สลิปมีพื้นหลังลาย/โลโก้/watermark, ตัวเลขสีบนพื้นสี | High / High | Pre-process (downscale ≤ 2 MP, grayscale, contrast, optional threshold); อ่าน **ตัวเลข** ได้ดีจาก `eng` อยู่แล้ว — parser ให้ความสำคัญกับ pattern ตัวเลข + label proximity; Review screen เป็น safety net เสมอ; วัดผลด้วย fixture benchmark script ใน CI (รายงาน % ไม่ fail build ช่วงแรก) |
| R2 | **ไม่มี fixtures จริง** ทำให้จูน parser ไม่ได้ (Open Q1) | High / High | Dev ต้องการ fixtures ภายใน Day 1–2; ระหว่างรอ ใช้ **OCR-text fixtures** (ไฟล์ `.txt` ที่ได้จากรันจริง) แทนรูป → unit test parser ได้เร็วและไม่ผูกกับ Tesseract; รูปจริงที่ปิดข้อมูลแล้วเก็บใน `tests/fixtures/slips/` (ห้ามมีชื่อ/เลขบัญชีจริง) |
| R3 | **Google Photos Picker API** — OAuth consent screen ต้องตั้งค่า + verified/test users, authorized origin ต้องตรงกับ `https://jaijimjim.github.io`, popup/new tab บน iOS, polling session, `baseUrl` ต้องใช้ Bearer token (CORS) | Med / High | Spike 0.5 วันก่อนเริ่ม; ต้องมี Client ID (เจ้าของ GCP project?) ก่อน story นี้ Ready; เสนอเลื่อนไป Sprint 2 |
| R4 | **Bundle/first-load size** — core wasm ~3.9 MB + lang data ~3.8 MB (gz) | Med / Med | Lazy-load เฉพาะตอน OCR ครั้งแรก, ใช้ `best_int` model, IndexedDB cache ของ tesseract.js (ข้าม cache header สั้นของ Pages), progress UI (AC2 ของ 005) |
| R5 | **Memory/time บนมือถือ** — รูปสลิป 12 MP, 20 รูป/batch | Med / Med | Downscale ก่อน OCR, worker เดียว ประมวลทีละรูป (concurrency 1), revoke object URLs, ไม่เก็บ full image ใน state หลัง save |
| R6 | **localStorage 5 MB** | Low (MVP) / Med | เก็บ rawText truncate ≤ 500 chars, ไม่มีรูป; ~1,000 tx ≈ < 1 MB; แสดง warning เมื่อใช้ > 80% |
| R7 | **Timezone/BE date bugs** | Med / Med | เก็บวันที่เป็น string `YYYY-MM-DD` + `HH:mm`; ไม่ใช้ `new Date('YYYY-MM-DD')` (UTC parse); unit tests รอบเที่ยงคืน/สิ้นเดือน |
| R8 | **Floating-point money** | Med / Med | เก็บ `amountSatang: number` (integer); format ด้วย `Intl.NumberFormat` |
| R9 | **Tooling version churn** — npm `latest` ตอนนี้: TypeScript 7.0.2 แต่ `typescript-eslint@8.72` รองรับ TS `<6.1`; React latest = 19.3 แต่ charter กำหนด 18 | Med / Low | Pin: React **18.3.1**, TypeScript **~5.9.3**, commit `package-lock.json`, ใช้ `npm ci` ใน CI |
| R10 | **GitHub Pages ไม่มี SPA fallback / custom headers** | Low / Med | `HashRouter`; CSP ผ่าน `<meta http-equiv>`; ไม่พึ่ง `_headers` |
| R11 | Classifier rules บวมและ conflict | Med / Low | Rules เป็น data file เดียว + unit test table-driven ต่อ keyword; precedence ชัดเจน |

---

## 3. Dependencies & Suggested Build Order

```
OMX-028 (CI/CD, Vite base) ──┐
OMX-025 (shell, HashRouter) ─┼─> ทุก UI story
OMX-024 (i18n infra) ────────┘
OMX-021 (storage + Transaction model) ──> 013, 014, 016, 018, 012(save), 022, 023, 011
OMX-017 (selectedMonth) ──> 014, 018, 019, 020, 023(AC2)

OMX-001 ──> OMX-005 ──> [text normalizer] ──> 006, 007, 008, 009, 010 ──> OMX-012
OMX-002 ──> (needs 001 validation)
OMX-004 ──> OMX-003 ──> OMX-005 queue (same limits as 001)
OMX-006 ──> OMX-010 (category set depends on type; salary set by 006)
OMX-009 ──> OMX-010 (payee match weight) · OMX-011 AC2 (ref no.) · future owner-name income detection
OMX-013 <──> OMX-012 <──> OMX-016  (share TransactionForm + validation)
OMX-015 ──> OMX-019 AC3 (tap category → filtered list)
OMX-026, 027, 030 = cross-cutting (ทำ infra ต้น sprint, audit ท้าย sprint)
```

**Notes**
- OMX-010 ทำได้โดยไม่มี 009 (match บน full text) แต่ AC2 "payee match > memo match" ต้องมี field payee/memo → ใน Sprint 1 ถ้าไม่มี 009 ให้ใช้ heuristic: บรรทัดหลัง label "ไปยัง/To" = payee (เป็นส่วนย่อยของ 009) — ขอ PO ยืนยันว่ายอมรับ AC2 แบบนี้ได้
- OMX-019 AC3 ขึ้นกับ OMX-015 (Should) — ถ้า 015 ไม่เข้า sprint ให้ AC3 กลายเป็น "ไปหน้า Transactions ของเดือนนั้น" หรือเลื่อน AC3
- ข้อเสนอแตก **OMX-003 (8)** ถ้าทีมอยากเข้าใกล้ AC ทีละส่วน: `003a` GIS auth + create session + open Picker (5) · `003b` poll + download + queue + token refresh (3)
- ข้อเสนอแตก **OMX-012 (8)** ถ้าจำเป็นต้องให้พอดี sprint: `012a` editable list + validation + save/discard (5) · `012b` thumbnail modal, raw-text collapsible, leave-guard, dup flags (3)

---

## 4. Capacity vs Scope (input for Sprint Planning)

Must = 77 > velocity 40. ข้อเสนอ 2 ทางให้ PO เลือก:

**Option A (Dev แนะนำ) — "Slip-to-dashboard thin slice" = 40 pts**

| Story | Pts |
|---|---|
| 028 Deploy, 025 Shell, 024 i18n, 021 Storage | 12 |
| 017 Month, 018 Summary, 014 List | 7 |
| 001 Upload, 005 OCR | 8 |
| 006 Type, 007 Amount | 8 |
| 012a Review (editable list + save) | 5 |
| **Total** | **40** |

ผู้ใช้อัปโหลดสลิป → OCR → ได้ type + amount อัตโนมัติ → เลือก category/วันที่เองใน Review → บันทึก → เห็น dashboard ได้จริงบน Pages. Sprint 2: 008, 010, 012b, 013, 016, 026, 027, 030, 003, 004 (= 37) + Should

**Option B — "Manual-first skeleton" = 40 pts**: 028, 025, 024, 021, 013, 014, 016, 017, 018, 026, 027, 030, 001 (+ 005 spike) — app ใช้งานได้ครบแบบกรอกเอง แต่ไม่มีสลิปอัตโนมัติ (ไม่ตรง Sprint Goal)

> ถ้า PO ต้องการ Sprint Goal ตาม charter ครบ (รวม auto category + date) ต้องใช้ ~50–55 pts ขั้นต่ำ → ควรปรับ Sprint Goal หรือยืด sprint (Change Coordination §8)

---

## 5. Technical Clarification of Acceptance Criteria

| Story / AC | Clarification / ข้อเสนอ |
|---|---|
| 001 AC1/AC4 | "first 20" = ตามลำดับที่ browser ส่งใน `FileList` (ไม่การันตีลำดับที่ผู้ใช้เลือก) — QA อย่า assert ชื่อไฟล์ใดเป็นตัวที่ 21. Limit 20 = ต่อ batch หรือรวมทั้ง queue? **เสนอ: รวมทั้ง queue ≤ 20** |
| 001 AC2 | ตรวจทั้ง MIME (`file.type`) และ magic bytes (JPG `FFD8FF`, PNG `89504E47`, WebP `RIFF....WEBP`) เพราะ `file.type` อาจว่าง/ผิดบน Android |
| 001 AC5 | `accept="image/jpeg,image/png,image/webp"` — iOS อาจแปลง HEIC → JPEG ให้อัตโนมัติเมื่อเลือกจาก gallery (ดี); **ไม่ใส่ `capture`** เพื่อให้เลือกได้ทั้ง gallery และ camera |
| 003 AC1 | Scope = `https://www.googleapis.com/auth/photospicker.mediaitems.readonly` เท่านั้น |
| 003 AC2 | บน desktop เปิด `pickerUri` ใน popup/tab ใหม่ (Picker ไม่รองรับ iframe embed); ต้องเรียก `window.open` ใน user-gesture เดียวกันเพื่อเลี่ยง popup blocker |
| 003 AC3 | ดาวน์โหลดด้วย `${baseUrl}=d` + header `Authorization: Bearer`; เสนอ poll ตาม `pollingConfig.pollInterval` ที่ API ส่งมา, timeout ตาม `timeoutIn` |
| 003 AC5 / 030 AC1 | e2e ตรวจโดย Playwright `page.on('request')` — allowlist: same origin, `accounts.google.com`, `apis.google.com`/`gsi`, `photospicker.googleapis.com`, `*.googleusercontent.com` |
| 003 AC6 | Token อยู่ใน memory เท่านั้น (031 AC4) → reload = ต้อง consent/`prompt: ''` ใหม่ (ยอมรับได้) |
| 005 AC1 | สถานะ "Loading model" เกิดเฉพาะรูปแรก (worker reuse); รูปถัดไปข้ามไป Recognizing |
| 005 AC3 | **Concurrency = 1 worker** (มือถือ RAM จำกัด); OCR อยู่ใน Web Worker ของ tesseract.js อยู่แล้ว; pre-process ใช้ `createImageBitmap` + canvas บน main thread (เร็วพอ) หรือ OffscreenCanvas ถ้ารองรับ |
| 005 AC5 | Cancel = `worker.terminate()` (tesseract.js ไม่มี abort ราย job) → รูปที่กำลังทำอยู่ถือว่า Cancelled ไม่ใช่ Failed; worker ถูกสร้างใหม่รอบถัดไป (lang data มาจาก IndexedDB cache) |
| 006 AC2 | ชื่อธนาคาร (K PLUS/SCB/Krungthai) อย่างเดียว **ไม่ควร** ถือเป็นหลักฐาน Expense แรงเท่า "โอนเงินสำเร็จ" — เสนอ weight ต่ำ (Medium confidence) |
| 006 AC4 | นิยาม confidence: **High** = keyword ประเภทชัด ≥1 + amount พบ; **Medium** = keyword อ่อน (ชื่อธนาคาร/PromptPay) เท่านั้น; **Low** = default |
| 006 AC5 / 007 | Unit test classifier รันบน **OCR-text fixtures** (ไม่ใช่รูป) เพื่อให้ CI เร็ว/deterministic; benchmark จากรูปจริงเป็น script แยก (`npm run bench:ocr`) |
| 007 AC2 | ลำดับ label ที่ใช้: "เงินได้สุทธิ" / "รับสุทธิ" / "Net Pay" / "Net Income" > ไม่พบ → ตัวเลขที่อยู่หลังคำ "สุทธิ" > ไม่พบ → empty (ไม่เดาเอา "รายได้รวม") |
| 007 AC3 | เก็บเป็น integer satang (`125050`); "1250" → 1250.00; เลขที่มี 3 ตำแหน่งหลังจุด/comma ผิดตำแหน่ง → ไม่รับ (ป้องกันอ่าน "1,250" เป็น 1.25) |
| 007 AC4 | ตัดตัวเลขที่อยู่บรรทัดเดียวกับ "ค่าธรรมเนียม/Fee", "ยอดคงเหลือ/Balance", "เลขที่รายการ/Ref", เลขบัญชี (มี `x`/`-` pattern) |
| 008 AC1 | 2-digit year: ถ้า context ไทย (เดือนไทย) → 25xx BE; ถ้า context EN → 20xx CE. "4-digit ≥ 2400" = BE |
| 008 AC4 | "future" = หลังวันนี้ตาม local time ของเครื่อง (เผื่อ +1 วันสำหรับ timezone? **เสนอ: ไม่เผื่อ**) |
| 010 AC2 | ถ้าไม่มี 009 ใน sprint เดียวกัน → payee = heuristic บรรทัดหลัง "ไปยัง/To" (ดู §3) |
| 010 AC6 | ไฟล์เดียว: `src/features/classify/rules/categories.rules.ts` (typed, ไม่ใช้ JSON เพื่อได้ type-check) |
| 012 AC4 | "Save all" ถ้ามีบาง item invalid → บันทึกเฉพาะ valid ที่ selected และ scroll/focus ไป item invalid แรก พร้อมข้อความ "บันทึก N รายการ, เหลือ M รายการที่ต้องแก้" (ขอ Designer ยืนยัน copy) |
| 012 AC6 | Leave-guard ครอบคลุม: เปลี่ยน route ภายในแอป (router blocker) + ปิด/refresh tab (`beforeunload` — browser แสดงข้อความ default เอง แปลไม่ได้) |
| 012 AC7 | rawText truncate ที่ 500 chars; queue (รูป) อยู่ใน memory เท่านั้น — refresh = queue หาย (ควรระบุใน copy) |
| 014 AC4 | "responsive" = scroll/interaction ไม่ jank บน mid-range; ทดสอบด้วย seed 1,000 tx (ไม่ต้อง virtualization ใน MVP) |
| 016 AC3 | Undo ใช้ toast ไม่ปิดเองถ้า focus อยู่บนปุ่ม (WCAG 2.2.1 Timing) |
| 017 AC1 | "current month" ตาม local time; เก็บ `selectedMonth` ใน store (ไม่ persist — เปิดใหม่กลับเดือนปัจจุบัน) |
| 021 AC1 | Keys: `omx.v1.transactions`, `omx.v1.settings` (language) — หรือ envelope เดียว `omx.v1` `{version, transactions, settings}` (**เสนอ envelope เดียว** เขียน atomic) |
| 021 AC3 | "no partial data" = serialize ทั้ง envelope แล้ว `setItem` ครั้งเดียว; ถ้า throw → state ใน memory rollback |
| 024 AC1 | `navigator.languages[0]` เริ่มด้วย `th` → TH |
| 024 AC5 | CI check: script เทียบ key ระหว่าง `th.json` กับ `en.json` + ESLint plugin (`i18next/no-literal-string`) แบบ warn→error |
| 025 AC4 | ใช้ **HashRouter** (`/#/transactions`) — เรียบง่ายสุดบน Pages; ทางเลือก 404.html redirect hack ไม่แนะนำ |
| 027 AC5 | ใช้ `@axe-core/playwright` ใน e2e (critical = fail) + Lighthouse manual ตอน QA |
| 028 AC2 | Vite `base: '/omnitrix-project/'` (ผ่าน env `VITE_BASE` เพื่อ preview/local = `/`); Tesseract paths ใช้ `import.meta.env.BASE_URL` |
| 028 AC3 | ใช้ GitHub **Variables** (`vars.VITE_GOOGLE_CLIENT_ID`) ไม่ใช่ Secrets — Client ID ไม่ใช่ความลับ และจะอยู่ใน bundle อยู่แล้ว |
| 029 AC1 | Initial JS ≤ 300 KB gz: React 18 + router + i18n ≈ 60–70 KB gz → เหลือเยอะ; Tesseract ไม่อยู่ใน initial bundle (dynamic import) |
| 030 AC1 | ตรวจ "OCR text ไม่ถูกส่ง" = ไม่มี request นอก allowlist ระหว่าง e2e ทั้ง flow |
| 031 AC2 | ESLint `react/no-danger` = error |

---

## 6. Proposed Answers to Open Questions

### Q2 — Tesseract language data: self-host vs pinned CDN → **Self-host (same origin)**

ขนาดจริงที่ตรวจจาก npm (pinned):

| Asset | Package | Size |
|---|---|---|
| `tha.traineddata.gz` (4.0.0_best_int) | `@tesseract.js-data/tha@1.0.0` | ~0.9 MB |
| `eng.traineddata.gz` (4.0.0_best_int) | `@tesseract.js-data/eng@1.0.0` | ~2.95 MB |
| `tesseract-core-simd-lstm.wasm.js` (+ fallback `-lstm`) | `tesseract.js-core@7.0.0` | ~3.9 MB ต่อไฟล์ |
| `worker.min.js` | `tesseract.js@7.0.0` | < 0.2 MB |

> หมายเหตุ: ไฟล์ `tha.traineddata` แบบ uncompressed/`best` ใหญ่กว่า (หลาย MB) แต่ tesseract.js โหลด `.gz` แล้ว gunzip เองได้ — ใช้ `best_int` (เร็วกว่า, เล็กกว่า, ความแม่นยำใกล้เคียงสำหรับข้อความพิมพ์)

**เหตุผล**
- **GitHub Pages limits ไม่เป็นปัญหา:** site ≤ 1 GB, ไฟล์เดี่ยว < 100 MB, bandwidth soft limit 100 GB/เดือน — first-load OCR ~ 8 MB/ผู้ใช้ใหม่ ≈ ~12,000 first-time users/เดือน ก่อนแตะ soft limit (และหลังจากนั้นเป็น IndexedDB cache)
- **Privacy (OMX-030):** request ทั้งหมดอยู่ same origin → อธิบายผู้ใช้ง่าย, CSP เข้มได้ (`connect-src 'self' + Google`)
- **Reliability & reproducibility:** ไม่พึ่ง jsDelivr/unpkg uptime; version worker/core/lang ตรงกันเสมอ (worker กับ core ต้อง version ตรงกัน)
- **Cache:** Pages ส่ง `Cache-Control: max-age=600` เท่านั้น แต่ tesseract.js เก็บ lang data ใน IndexedDB (`cacheMethod: 'write'` default) → ครั้งถัดไปไม่โหลดซ้ำ; core wasm อาศัย HTTP cache/ETag (304)
- **พร้อมสำหรับ PWA (OMX-037)**

**Implementation**
- **ไม่ commit binary ลง git** — เพิ่ม devDependencies (`@tesseract.js-data/tha`, `@tesseract.js-data/eng`, `tesseract.js-core` pin exact) แล้ว copy ตอน build ด้วย `vite-plugin-static-copy` (หรือ script `scripts/copy-tesseract-assets.mjs` ใน `prebuild`/`predev`) → `dist/tesseract/{worker,core,lang}/`
- `createWorker(['tha','eng'], OEM.LSTM_ONLY, { workerPath, corePath, langPath, gzip: true })` โดย path อิง `import.meta.env.BASE_URL`
- Fallback CDN: **ไม่ทำ** ใน MVP (เพิ่ม attack surface/ข้อยกเว้น privacy)
- Spike ยืนยัน (≤ 2 ชม., ใน OMX-005): Pages เสิร์ฟ `.gz` เป็น `application/gzip` โดยไม่ใส่ `Content-Encoding` (tesseract.js จะ gunzip เอง) และ `.wasm`/`.wasm.js` โหลดได้ใต้ sub-path

### Q4 — Chart library → **Hand-rolled SVG** (fallback: Chart.js lazy-loaded)

| Option | Bundle impact | A11y | Effort | Verdict |
|---|---|---|---|---|
| **Hand-rolled SVG** | ~0 KB (≈ 2–4 KB code ของเราเอง) | ดีที่สุด — DOM จริง, `role="img"` + `<title>/<desc>`, focusable segments, ควบคุม contrast/pattern ได้ | 019: 3, 020: 3 (มี data table อยู่แล้วตาม AC) | ✅ แนะนำ |
| Recharts 3.x | หนัก (dep d3-* + lodash, ~100+ KB gz) | SVG, มี `accessibilityLayer` แต่ปรับละเอียดยาก | ต่ำ | ❌ เกินจำเป็นสำหรับ 2 chart |
| Chart.js 4.6 | ~60–70 KB gz (tree-shaken) | Canvas → screen reader อ่านไม่ได้ ต้องทำ table แยก (ซึ่ง AC บังคับอยู่แล้ว) | ต่ำ | สำรอง ถ้าต้องการ animation/tooltip ซับซ้อน |

เหตุผล: ต้องการแค่ 2 chart แบบง่าย (category breakdown + 6-month grouped bar), AC บังคับ data table อยู่แล้ว, performance budget 300 KB, ต้อง TH/EN label และ "ไม่ใช้สีอย่างเดียว" (SVG ใส่ pattern/label ตรงแท่งได้ง่าย).
**ข้อเสนอถึง Designer:** ใช้ **horizontal bar** แทน donut สำหรับ category (อ่านค่า/label ไทยยาวบนมือถือ 360px ได้ดีกว่า, เปรียบเทียบง่ายกว่า) — AC1 ของ 019 อนุญาต "donut/bar" อยู่แล้ว

### Q3 — ตรวจจับสลิป "ได้รับเงินโอน" → **MVP = keyword rule + ผู้ใช้สลับเองใน Review** (ตาม default ของ PO)

ข้อเท็จจริงทางเทคนิค: สลิปโอนเงินของธนาคารไทยเป็น **สลิปของฝั่งผู้โอน** — เมื่อเรา "ได้รับเงิน" ส่วนใหญ่ได้มาเป็นรูปสลิปที่ผู้โอนส่งมา (LINE ฯลฯ) ซึ่งหน้าตา **เหมือนสลิปจ่ายเงินทุกประการ** ("โอนเงินสำเร็จ") → keyword อย่างเดียวแยกไม่ได้; ข้อมูลที่แยกได้จริงคือ "ผู้รับ = ตัวเราหรือไม่"

ข้อเสนอเป็นชั้น ๆ:
1. **Sprint 1 (ใน OMX-006, ไม่เพิ่ม points):** rule Income สำหรับ keyword ฝั่งรับที่มีจริงในบางแอป/notification ("รับเงิน", "ได้รับเงิน", "เงินเข้า", "รับโอน", "You received", "Money received") → `other_income`, Medium confidence. นอกนั้นเป็น Expense ตาม AC2 และผู้ใช้สลับ type ใน Review (OMX-012 AC3 รองรับแล้ว)
2. **Sprint 2+ (story ใหม่ระดับ Could, ~3 pts, ขึ้นกับ OMX-009):** Settings "ชื่อของฉัน / My names" (TH + EN, หลายชื่อได้) + เลขบัญชี/PromptPay 4 ตัวท้าย (optional) เก็บใน localStorage → ถ้า recipient (หลัง normalize: ตัดคำนำหน้า นาย/นาง/นางสาว/Mr./Ms., ช่องว่าง, fuzzy ≤ 1–2 ตัวอักษรจาก OCR noise) ตรงกับชื่อเรา → Income/`other_income` (High ถ้าเลขบัญชีตรงด้วย, Medium ถ้าชื่ออย่างเดียว). ถ้า sender = เรา → Expense (High)
3. ต่อยอด OMX-035 (learn from corrections) ภายหลัง

> ขอ PO สร้าง story ใหม่ (เช่น `OMX-039 Detect received transfers via owner name`) — Dev ไม่แก้ backlog เอง

### Q1 — Fixtures (ไม่ได้ถูกถามให้ Dev ตอบ แต่ block Dev)
Dev ต้องการขั้นต่ำ **Day 2**: ≥ 3 รูป/ธนาคาร (K PLUS, SCB EASY, Krungthai NEXT, PromptPay QR slip) + สลิปเงินเดือน 2–3 แบบ, ปิดชื่อ/เลขบัญชี (ทาทับแล้วพิมพ์ชื่อปลอมทับดีกว่าเบลอ เพื่อให้ OCR ยังเจอ pattern ชื่อ) + ไฟล์ `expected.json` ต่อรูป (type, category, amount, date, payee). Dev จะ generate OCR-text fixtures จากรูปเหล่านี้ให้ QA review

---

## 7. Proposed Tech Stack

> Versions ตรวจจาก `npm view` วันที่ 2026-11-13; pin ใน `package.json` + commit `package-lock.json`. Node **22 LTS** ใน CI (`.nvmrc`)

| Concern | Choice | Version (pin) | Why |
|---|---|---|---|
| UI | React + ReactDOM | **18.3.1** | ตาม charter (latest = 19.x — ไม่อัปใน MVP) |
| Language | TypeScript `strict` | **~5.9.3** | TS 7.x เป็น latest แต่ `typescript-eslint@8.72` รองรับ `<6.1` |
| Build | Vite + `@vitejs/plugin-react` | vite **8.3.x**, plugin **6.3.x** | ถ้าพบปัญหา compat กับ React 18/Vitest → fallback Vite 7 (ตัดสินใน Day 1 setup) |
| Routing | `react-router-dom` (HashRouter) | **7.x** | Pages-friendly; `useBlocker` สำหรับ leave-guard (012 AC6) |
| State | **Zustand** | **5.1.x** | ~1 KB, store เดียว (`transactions`, `settings`, `selectedMonth`) + `persist`-like custom middleware ไป storage adapter ของเรา (ต้องการ versioned envelope + error handling เอง); queue/OCR state แยก store ใน memory |
| Validation / schema | **zod** | **4.x** | Validate localStorage load, JSON import (031 AC3), form validation ใช้ schema เดียวกัน |
| Forms | Controlled components + zod (ไม่ใช้ form library) | — | ฟอร์มเดียว (`TransactionForm`) ไม่คุ้มเพิ่ม dependency |
| i18n | **i18next + react-i18next** | 27.x / 18.x | Pluralization, interpolation, `<html lang>` hook, ESLint plugin; resources bundle ใน JS (2 ภาษา เล็ก ไม่ต้อง lazy-load); typed keys ผ่าน `CustomTypeOptions` |
| Dates / numbers | **`Intl` built-in** (`th-TH-u-ca-buddhist`, `en-GB`) + parser ของเราเอง | — | ไม่ต้องใช้ date-fns/dayjs; ปี พ.ศ. ได้จาก `Intl` อัตโนมัติ |
| OCR | `tesseract.js` + `tesseract.js-core` + `@tesseract.js-data/{tha,eng}` | **7.0.0 / 7.0.0 / 1.0.0** (exact) | Self-host (§6 Q2) |
| Charts | Hand-rolled SVG | — | §6 Q4 |
| Styling | **CSS Modules + CSS custom properties** (design tokens จาก Designer) | — | 0 runtime, ไม่ผูก framework; ทางเลือก Tailwind ถ้า Designer ส่ง token เป็น Tailwind config — ให้ Designer เลือก |
| IDs / hash | `crypto.randomUUID()`, `crypto.subtle.digest('SHA-256')` | — | built-in |
| Lint | ESLint 9/10 flat config + `typescript-eslint` + `eslint-plugin-react-hooks` + `eslint-plugin-jsx-a11y` + `eslint-plugin-i18next` | eslint ~10.x (fallback 9 ถ้า plugin ยังไม่รองรับ) | DoD: lint ใน CI |
| Format | Prettier | 3.x | + `lint-staged` + `simple-git-hooks` (pre-commit) |
| Unit / component | **Vitest + @testing-library/react + @testing-library/user-event + jsdom** | vitest 5.x, RTL 16.x | ใช้ Vite config เดียวกัน; coverage v8 — parser/classifier/storage เป้า ≥ 90% lines |
| E2E | **Playwright** + `@axe-core/playwright` | 1.65.x / 4.x | Projects: Desktop Chrome, Pixel 7, iPhone 14 (WebKit); รันกับ `vite preview` ที่ base path เดียวกับ Pages; OCR e2e 1–2 เคสด้วยรูป fixture จริง (tag `@slow`) |
| Bundle check | `size-limit` หรือ `rollup-plugin-visualizer` | — | OMX-029 |
| Secret scan | `gitleaks/gitleaks-action` | — | OMX-031 |

### 7.1 Data model (draft — ให้ QA/Designer ใช้อ้างอิง)

```ts
type TxType = 'income' | 'expense';
type Source = 'slip' | 'manual';

interface Transaction {
  id: string;                 // crypto.randomUUID()
  type: TxType;
  categoryId: CategoryId;     // from taxonomy v1
  amountSatang: number;       // integer, > 0
  date: string;               // 'YYYY-MM-DD' (CE, local)
  time?: string;              // 'HH:mm'
  payee?: string;
  note?: string;
  source: Source;
  slip?: { imageHash: string; refNo?: string; bank?: BankId; rawText?: string /* ≤500 chars */; confidence: 'high'|'medium'|'low' };
  createdAt: string; updatedAt: string; // ISO
}

interface StoreEnvelopeV1 { version: 1; transactions: Transaction[]; settings: { language: 'th' | 'en' } }
// localStorage key: 'omx.v1'
```

### 7.2 Folder layout (feature-based)

```
omnitrix-project/
├─ .github/workflows/
│  ├─ ci.yml               # PR: typecheck, lint, unit, build, e2e (preview)
│  └─ deploy.yml           # main: ci jobs → upload-pages-artifact → deploy-pages
├─ docs/ (agile/, adr/)
├─ public/                 # favicon ฯลฯ (tesseract assets ถูก copy ตอน build, gitignored)
├─ scripts/
│  ├─ copy-tesseract-assets.mjs
│  ├─ check-i18n-keys.mjs
│  └─ bench-ocr.mjs        # รัน OCR บน fixtures → รายงานความแม่นยำ
├─ src/
│  ├─ app/                 # App.tsx, router.tsx, providers, ErrorBoundary, AppShell (nav)
│  ├─ features/
│  │  ├─ import/           # 001, 002, 003, 004 — FilePicker, DropZone, googlePhotos/ (gis.ts, picker.ts)
│  │  ├─ ocr/              # 005 — tesseractWorker.ts, preprocess.ts, queueStore.ts
│  │  ├─ extract/          # 006–011 — normalize.ts, amount.ts, date.ts, parties.ts, type.ts, duplicate.ts
│  │  │  └─ __tests__/     # table-driven tests + fixtures text
│  │  ├─ classify/         # 010 — categorize.ts, rules/categories.rules.ts
│  │  ├─ review/           # 012 — ReviewScreen, ReviewItemCard
│  │  ├─ transactions/     # 013–016 — TransactionForm, TransactionList, filters
│  │  ├─ dashboard/        # 017–020 — MonthSelector, SummaryCards, charts/ (BarChart.tsx, TrendChart.tsx)
│  │  └─ settings/         # 021–023, 030 — backup (json/csv), delete-all, privacy, language
│  ├─ shared/
│  │  ├─ ui/               # Button, Dialog(<dialog>), Toast, EmptyState, Field, Badge, LiveRegion
│  │  ├─ lib/              # money.ts (satang/format), date.ts (BE/CE, Intl), file.ts (magic bytes, hash), csv.ts
│  │  └─ hooks/            # useOnlineStatus, useLocale ...
│  ├─ domain/              # types.ts (Transaction, Category), categories.ts (taxonomy v1)
│  ├─ store/               # appStore.ts (zustand), storage.ts (versioned adapter + migrations), schema.ts (zod)
│  ├─ i18n/                # index.ts, locales/th.json, locales/en.json
│  ├─ styles/              # tokens.css, global.css
│  └─ main.tsx
├─ tests/
│  ├─ e2e/                 # *.spec.ts (Playwright)
│  └─ fixtures/
│     ├─ slips/            # redacted images + expected.json (จาก QA)
│     └─ ocr-text/         # *.txt OCR output สำหรับ unit tests
├─ index.html              # CSP meta
├─ vite.config.ts · vitest.config.ts (หรือรวม) · playwright.config.ts
├─ eslint.config.js · .prettierrc · tsconfig*.json · .nvmrc · .env.example
└─ README.md · CHANGELOG.md
```

**Rules:** features ไม่ import ข้าม feature ตรง ๆ ยกเว้นผ่าน `domain/`, `shared/`, `store/`; logic (extract/classify/storage/csv) เป็น **pure functions ไม่มี React** → unit test ได้ใน Node

### 7.3 CI/CD (GitHub Actions)

**`ci.yml`** (on: pull_request, push to non-main)
1. `actions/checkout` → `actions/setup-node` (Node 22, cache npm) → `npm ci`
2. `npm run typecheck` (`tsc -b --noEmit`) · `npm run lint` · `npm run format:check` · `npm run i18n:check`
3. `npm run test -- --coverage` (Vitest)
4. `npm run build` (with `VITE_BASE=/omnitrix-project/`)
5. `npx playwright install --with-deps chromium webkit` → `npm run e2e` (against `vite preview`) → upload report artifact on failure
6. gitleaks

**`deploy.yml`** (on: push to `main`, workflow_dispatch)
- `permissions: { contents: read, pages: write, id-token: write }`, `concurrency: pages`
- job `build`: steps 1–4 (+ e2e smoke) with `env: VITE_GOOGLE_CLIENT_ID: ${{ vars.VITE_GOOGLE_CLIENT_ID }}` → `actions/upload-pages-artifact` (`dist/`)
- job `deploy`: `needs: build` → `actions/deploy-pages` (environment `github-pages`)
- Repo setting: Pages source = **GitHub Actions** (ต้องเปิดโดย repo owner — action item)
- Failed step ใด ๆ → ไม่ deploy (OMX-028 AC1)

### 7.4 npm scripts (draft)
`dev`, `build`, `preview`, `typecheck`, `lint`, `format`, `format:check`, `test`, `test:watch`, `e2e`, `i18n:check`, `bench:ocr`, `prebuild`/`predev` → copy tesseract assets

---

## 8. Asks / Action Items from Dev

| # | Ask | Owner | Needed by |
|---|---|---|---|
| A1 | ตัดสิน scope Sprint 1 (Option A vs B, §4) และย้าย 003/004 ไป Sprint 2? | PO | Sprint Planning |
| A2 | Slip fixtures + `expected.json` (§6 Q1) | QA (+PO จัดหา) | Day 2 |
| A3 | Google Cloud project + OAuth Client ID + consent screen test users + authorized origins | PO / repo owner | ก่อน 003 Ready |
| A4 | เปิด GitHub Pages source = GitHub Actions, ตั้ง repo variable | Repo owner | Day 1 |
| A5 | Design tokens + ยืนยัน horizontal bar chart + copy สำหรับ partial save (012 AC4) | Designer | Day 1–2 |
| A6 | สร้าง story ใหม่ "detect received transfer via owner name" (Could) | PO | Next grooming |
| A7 | บันทึก ADR สั้น: `docs/adr/0001-self-host-tesseract-assets.md`, `0002-svg-charts.md` (หลังทีมเห็นชอบ) | Dev | Day 1 |
