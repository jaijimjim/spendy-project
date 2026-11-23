# 01 — Product Backlog: Spendy Money (MVP_0001) — เดิมชื่อ Omnitrix Money

> Owner: PO/PM · Last updated: 2026-11-23 (หลัง Sprint 2 Grooming) · Version: v5
> **v6 (2026-11-23):** FB-013 → **OMX-052** rename เป็น Spendy Money + repo `spendy-project` (public) · 1 pt · Done ในโค้ด รอ deploy · ปลด B3 ได้เมื่อผู้ใช้ตั้ง Pages Source = GitHub Actions
> v5 (2026-11-23, Sprint 2 Grooming): estimate สุดท้าย (planning poker) · OMX-050 แตกเป็น **OMX-050a** (precedence + คำอาหารไทย, 3) / **OMX-050b** (fuzzy Lazada/Shopee, 2) · item ใหม่ **OMX-051** payee measurement enabler (2) แยกจาก OMX-049 (3) · Designer D1 → OMX-049 AC6, D2 + `aria-describedby` → OMX-050a AC6 · D3 → parked, D4 = OMX-035 คง Won't · §4 weak-tier rule ยืนยันแล้ว · OMX-045 = option A · OMX-039/047 เลื่อนไป Sprint 3 · §9 อัปเดตตาม grooming · ดู `sprints/sprint-2/01-grooming-minutes.md`
> v4 (2026-11-23): เพิ่ม **OMX-049** (BUG-009 recipient ใต้ลูกศร ↓ บนสลิป KBank/K PLUS) และ **OMX-050** (BUG-010 category precedence + fuzzy keyword Lazada/Shopee) จาก FB-011 (สลิปจริง 3 ใบ) · OMX-028 เปลี่ยน blocker จาก B1 → **B3** (Pages ยังไม่เปิด, repo private — FB-012) · อัปเดต §6 overview และ §9 candidate list · estimate ของ item ใหม่เป็นของ PO รอทีมยืนยันใน grooming (`sprints/sprint-2/00-grooming-agenda.md`)
> v3 (2026-11-13): หลัง Sprint 1 Review + Retrospective — OMX-040 – OMX-048, status `Accepted (pending deploy)`
> Story points: Fibonacci 1, 2, 3, 5, 8 (ตกลงร่วมกันใน grooming ตาม estimate ของ Dev) · ดู `sprints/sprint-1/01-grooming-minutes.md`, `04-sprint-review.md`, `05-retrospective.md`
> Status values: `New` · `Ready` · `In Progress` · `In Review` · `In QA` · `Accepted (pending deploy)` · `Done` · `Blocked` · `Deferred`
> `Accepted (pending deploy)` = PO accepted at Sprint Review, all AC verified on the local production build. The only open DoD items are merge on GitHub, QA on the Pages build and final PO acceptance there. The item moves to `Done` after the post-deploy smoke passes (charter §6)
> Priority: **M**ust / **S**hould / **C**ould / **W**on't (this release)
> Sprint: `S1` = committed in Sprint 1 · `S1-stretch` = stretch (ลำดับตาม Sprint Planning) · `—` = ยังไม่วางแผน

---

## 1. Product Vision

> **สำหรับ** คนทำงานในประเทศไทยที่รับเงินเดือนและโอนจ่ายผ่าน mobile banking เป็นประจำ
> **ที่** ไม่มีเวลาจดรายรับ–รายจ่ายเองทุกครั้ง แต่มีรูปสลิปสะสมอยู่ในมือถือ/Google Photos
> **Omnitrix Money** คือ web app สองภาษา (TH/EN) ที่ **อ่านรูปสลิปแล้วบันทึกรายรับ–รายจ่ายให้อัตโนมัติ** พร้อมจัดหมวดหมู่และสรุปเป็นรายเดือน
> **ต่างจาก** แอปบัญชีทั่วไปที่ต้องกรอกเอง หรือแอปที่ต้องส่งข้อมูลการเงินขึ้น server
> **ผลิตภัณฑ์ของเรา** ทำ OCR ในเบราว์เซอร์ทั้งหมด ข้อมูลอยู่ในเครื่องผู้ใช้ เปิดใช้ได้ทันทีจากลิงก์ ไม่ต้องสมัครสมาชิก

**MVP success metrics** (วัด 3 ระดับ: parser บน golden OCR-text = CI gate · end-to-end บน synthetic slip images = benchmark report · real-world บน calibration set = UAT)
- **Amount** ถูกต้องโดยไม่ต้องแก้: ≥ 80% (synthetic), ≥ 95% (golden text)
- **Type** (รายรับ/รายจ่าย) ถูกต้อง: ≥ 90% (synthetic), ≥ 98% (golden text)
- **Category** ถูกต้อง: ≥ 60% (synthetic), ≥ 95% (golden text)
- ผู้ใช้ใหม่บันทึกรายการแรกจากสลิปได้ภายใน 2 นาที (≥ 80% ของผู้ร่วม UAT)
- Web app เข้าถึงได้จากภายนอกผ่าน `https://jaijimjim.github.io/omnitrix-project/`

## 2. Personas

| Persona | Profile | Goals | Pain points |
|---|---|---|---|
| **P1 — "ฝน" พนักงานออฟฟิศ** (28, กรุงเทพฯ) | รับเงินเดือนผ่านธนาคาร ได้สลิปเงินเดือนเป็นรูป/ไฟล์, โอนจ่ายค่าอาหาร ค่าเช่า ผ่าน K PLUS ทุกวัน | รู้ว่าเดือนนี้ใช้เงินไปกับอะไร เหลือเท่าไร | ขี้เกียจจดเอง, สลิปกระจัดกระจายใน Google Photos |
| **P2 — "Mike" expat / ใช้ภาษาอังกฤษ** (35) | ทำงานในไทย ใช้ SCB EASY อ่านภาษาไทยได้จำกัด | ใช้งาน UI ภาษาอังกฤษ แต่สลิปเป็นภาษาไทย | แอปไทยส่วนใหญ่ไม่มี EN, ไม่เข้าใจสลิป |
| **P3 — "ป้าแดง" ฟรีแลนซ์/ค้าขาย** (45) | รายรับไม่สม่ำเสมอ บางส่วนเป็นเงินสด ใช้มือถือเป็นหลัก | กรอกรายการเงินสดเองได้ง่าย ดูภาพรวมรายเดือน | ตัวหนังสือเล็ก, ขั้นตอนเยอะ, กลัวข้อมูลหลุด |

## 3. Domain Rules (ใช้ร่วมกันทุก story — ตกลงใน Grooming)

| # | Rule |
|---|---|
| R1 | **Money** เก็บและคำนวณเป็น **integer satang** (`amountSatang`, เช่น 1,250.50 บาท = `125050`); แสดงผลด้วย `Intl.NumberFormat` 2 ทศนิยม; ห้ามใช้ float ในการรวมยอด |
| R2 | **Date** เก็บเป็น string `YYYY-MM-DD` (ค.ศ.) และ `time` เป็น `HH:mm` (optional) ตามเวลา **Asia/Bangkok**; "วันนี้", "เดือนปัจจุบัน", "วันที่ในอนาคต" คำนวณใน timezone `Asia/Bangkok` เสมอ (ไม่ขึ้นกับ timezone เครื่อง); ห้าม parse ด้วย `new Date('YYYY-MM-DD')` |
| R3 | **Thai date parsing**: วันที่ตัวเลขเป็น **dd/mm/yyyy เสมอ**; ปี 4 หลัก ≥ 2400 = พ.ศ. (ลบ 543); ปี 2 หลักในบริบทไทย = 25xx พ.ศ., ในบริบทอังกฤษล้วน = 20xx ค.ศ.; ช่วงที่ยอมรับ = ไม่เกินวันนี้ และไม่ย้อนหลังเกิน 5 ปี |
| R4 | **Text normalization** ก่อน parse ทุกครั้ง: Unicode NFC, `ํา` → `ำ`, ลบ zero-width chars, ยุบช่องว่างซ้ำ, ตัวเลขไทย `๐–๙` → `0–9`; matching keyword ไม่สนตัวพิมพ์ และใช้ word boundary สำหรับคำภาษาอังกฤษ |
| R5 | **Confidence model** (นิยามเดียว ใช้ใน 006/007/008/010/012): **High** = strong keyword ของประเภทเดียวและ field ที่เกี่ยวข้องถูกดึงได้ · **Medium** = มีแต่ weak keyword หรือเจอ keyword ของทั้งสองประเภท · **Low** = ไม่ match (ใช้ค่า default). UI แสดง badge เฉพาะ Medium/Low |
| R6 | **Rules data**: keyword/weight/priority ทั้งหมดอยู่ใน data file เดียว `src/domain/slip/categories.rules.ts` (typed) พร้อม table-driven unit tests *(path updated v3, K2)* |
| R7 | **Test data**: QA เป็นเจ้าของ fixtures — Layer A golden OCR-text (CI gate), Layer B synthetic slip PNG (benchmark, commit ใน repo), Layer C real slips ปิดข้อมูล (private, ห้าม commit) |
| R8 | **Storage**: envelope เดียว `localStorage['omx.v1'] = {version, transactions, settings}` เขียนแบบ atomic; ไม่เก็บรูปเต็ม; `rawText` ตัดที่ 500 ตัวอักษร |
| R9 | **Image limits**: JPG/PNG/WebP (ตรวจทั้ง MIME และ file signature), ≤ 10 MiB (10,485,760 bytes) ต่อไฟล์, คิวรวมไม่เกิน 20 รายการ; ก่อน OCR ย่อให้ด้านยาว ≤ 2,000 px |

## 4. Category List (Category taxonomy v1)

| ID | TH | EN | Type | ตัวอย่าง keyword (data file R6) |
|---|---|---|---|---|
| `food` | อาหารและเครื่องดื่ม | Food & Drink | Expense | ร้านอาหาร, ข้าว, ก๋วยเตี๋ยว, cafe, coffee, Starbucks, Café Amazon, GrabFood, LINE MAN, foodpanda, 7-Eleven |
| `transport` | การเดินทาง | Transport | Expense | BTS, MRT, Grab (ไม่ใช่ GrabFood), Bolt, taxi, ทางด่วน, Easy Pass, ปตท/PTT, Shell, Bangchak, น้ำมัน |
| `shopping` | ช้อปปิ้ง | Shopping | Expense | Shopee, Lazada, Central, Big C, Lotus's, Makro, Uniqlo, เสื้อผ้า |
| `bills` | ค่าบิลและสาธารณูปโภค | Bills & Utilities | Expense | การไฟฟ้า, MEA, PEA, การประปา, MWA, PWA, AIS, TrueMove, dtac, 3BB, internet, บัตรเครดิต |
| `housing` | ที่อยู่อาศัย/ค่าเช่า | Housing/Rent | Expense | ค่าเช่า, หอพัก, คอนโด, ค่าส่วนกลาง, นิติบุคคล, apartment, rent |
| `health` | สุขภาพ | Health | Expense | โรงพยาบาล, คลินิก, ร้านยา, pharmacy, Boots, Watsons, dental, fitness |
| `entertainment` | บันเทิง | Entertainment | Expense | Netflix, Spotify, YouTube, Major, SF Cinema, เกม, Steam, คอนเสิร์ต |
| `education` | การศึกษา | Education | Expense | โรงเรียน, มหาวิทยาลัย, ค่าเทอม, คอร์ส, course, tuition, หนังสือ |
| `transfer` | โอนให้บุคคล | Transfer to person | Expense | ผู้รับมีคำนำหน้าบุคคล (นาย/นาง/นางสาว/น.ส./Mr./Mrs./Ms./Miss) และไม่ match ร้านค้า/บิล/บริษัท |
| `salary` | เงินเดือน | Salary | Income | สลิปเงินเดือน, Payslip, เงินได้สุทธิ, Net Pay (strong) · เงินเดือน, รายได้, Salary, รายการหัก (weak) |
| `other_income` | รายรับอื่น ๆ | Other income | Income | รับเงิน, ได้รับเงิน, เงินเข้า, รับโอน, You received, Money received, โบนัส, คืนเงิน |
| `other` | อื่น ๆ | Other | Expense | default เมื่อไม่ match หมวดใด |

> Conflict resolution (ตกลงแล้ว): "longest keyword match wins" ภายใน field เดียวกัน → `GrabFood` ชนะ `Grab`, `Café Amazon` ชนะ `PTT`, `Central Food Hall` ชนะ `Central`
>
> *(v5 — **confirmed** ใน Sprint 2 grooming, implement ใน OMX-050a)* **คำบอกประเภทธุรกรรม** (transaction-type phrase) เช่น "จ่ายบิล", "ชำระบิล", "ชำระเงิน", "โอนเงิน", "Bill Payment" อยู่ใน **weak tier** แยก — ใช้ได้ก็ต่อเมื่อไม่มี keyword ร้านค้า/biller/แบรนด์ match ที่ใดเลย · ชื่อร้าน/biller มีน้ำหนักกว่าเสมอ ("จ่ายบิล" + "ไก่ย่าง" → `food`) · "จ่ายบิล" เดี่ยว ๆ = `bills` confidence **Medium** · precedence: payee → payeeExtra → memo → person → text (strong) → weak tier → `other`
> *(v5)* **Fuzzy keyword** (OMX-050b): เฉพาะ keyword ที่ flag `fuzzy: true` และยาว ≥ 5 ตัวหลัง fold; folding ทำใน matcher เท่านั้น ไม่เปลี่ยนข้อความที่เก็บ

## 5. Epics

| Epic | Name | Goal |
|---|---|---|
| **E1** | Slip Import | นำรูปสลิปเข้าแอปจากเครื่องหรือ Google Photos |
| **E2** | OCR & Smart Extraction | อ่านสลิป ดึงข้อมูล แยกประเภท/หมวดหมู่อัตโนมัติ |
| **E3** | Review & Manual Entry | ผู้ใช้ตรวจ/แก้ไขก่อนบันทึก และกรอกรายการเอง |
| **E4** | Transaction Management | ดู ค้นหา กรอง แก้ไข ลบ รายการ |
| **E5** | Dashboard & Insights | สรุปรายเดือน หมวดหมู่ และแนวโน้ม |
| **E6** | Data & Persistence | เก็บข้อมูลในเครื่อง สำรอง/กู้คืน/ส่งออก |
| **E7** | Platform, i18n & UX Quality | TH/EN, responsive, a11y, empty/error states, deploy |
| **E8** | Non-functional Requirements | Performance, privacy, security |
| **E9** | Future | ฟีเจอร์ถัดไปหลัง Sprint 1 |

## 6. Backlog Overview

| ID | Epic | Title | Priority | Pts | Status | Sprint |
|---|---|---|---|---|---|---|
| OMX-001 | E1 | Upload slip images (multi-file picker) | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-002 | E1 | Drag & drop upload | Should | 2 | Accepted (pending deploy) | S1-stretch #1 |
| OMX-003a | E1 | Google Photos: sign-in & open Picker | Must | 5 | Blocked (B2) — carry-over | S1 → S2 |
| OMX-003b | E1 | Google Photos: poll, download & queue | Must | 3 | Blocked (B2) — carry-over | S1 → S2 |
| OMX-004 | E1 | Google Photos "not configured" & auth error states | Must | 2 | Accepted (pending deploy) | S1 |
| OMX-005 | E2 | In-browser OCR with progress (queue) | Must | 5 | Accepted (pending deploy) | S1 |
| OMX-006 | E2 | Auto-detect transaction type (income / expense) | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-007 | E2 | Extract amount | Must | 5 | Accepted (pending deploy) | S1 |
| OMX-008 | E2 | Extract date & time (Thai/BE formats) | Must | 5 | Accepted (pending deploy) | S1 |
| OMX-009 | E2 | Extract recipient / sender / memo / bank | Should | 5 | Accepted (pending deploy) | S1-stretch #8 |
| OMX-010 | E2 | Auto-categorize slip (rule-based) | Must | 5 | Accepted (pending deploy) | S1 |
| OMX-011 | E2 | Duplicate slip detection | Should | 3 | Accepted (pending deploy) | S1-stretch #7 |
| OMX-012a | E3 | Review: editable list, validation, save/discard | Must | 5 | Accepted (pending deploy) | S1 |
| OMX-012b | E3 | Review: image viewer, raw text, leave-guard, flags | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-013 | E3 | Manual income/expense entry form | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-014 | E4 | Transaction list | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-015 | E4 | Filter & search transactions | Should | 3 | Accepted (pending deploy) | S1-stretch #2 |
| OMX-016 | E4 | Edit & delete transaction | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-017 | E5 | Month selector | Must | 2 | Accepted (pending deploy) | S1 |
| OMX-018 | E5 | Monthly summary (income / expense / balance) | Must | 2 | Accepted (pending deploy) | S1 |
| OMX-019 | E5 | Category breakdown chart (horizontal bar) | Should | 3 | Accepted (pending deploy) | S1-stretch #3 |
| OMX-020 | E5 | Monthly trend chart | Should | 3 | Accepted (pending deploy) | S1-stretch #4 |
| OMX-021 | E6 | Persist data in localStorage | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-022 | E6 | JSON backup export / import | Should | 3 | Accepted (pending deploy) | S1-stretch #5 |
| OMX-023 | E6 | CSV export | Should | 2 | Accepted (pending deploy) | S1-stretch #6 |
| OMX-024 | E7 | TH / EN language switch | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-025 | E7 | Mobile-first responsive layout & navigation | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-026 | E7 | Empty states & error handling | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-027 | E7 | Accessibility (WCAG 2.1 AA) | Must | 3 | Accepted (pending deploy) | S1 |
| OMX-028 | E7 | Deploy to GitHub Pages via GitHub Actions | Must | 3 | Blocked (B3: Pages ยังไม่เปิด / repo private) — carry-over | S1 → S2 |
| OMX-029 | E8 | NFR — Performance budget | Should | 3 | In Progress (partial) — carry-over | S1 → S2 |
| OMX-030 | E8 | NFR — Privacy: images stay in the browser | Must | 2 | Accepted (pending deploy) | S1 |
| OMX-031 | E8 | NFR — Security & configuration hygiene | Should | 2 | Accepted (pending deploy) | S1-stretch #10 |
| OMX-032 | E9 | Cloud sync & login | Won't | — | Deferred | — |
| OMX-033 | E9 | Budgets & overspend alerts | Won't | — | Deferred | — |
| OMX-034 | E9 | PDF payslip import | Won't | — | Deferred | — |
| OMX-035 | E9 | Learn custom category rules from user corrections | Won't | — | Deferred | — |
| OMX-036 | E9 | Recurring transactions | Won't | — | Deferred | — |
| OMX-037 | E9 | Installable PWA / offline mode | Won't | — | Deferred | — |
| OMX-038 | E9 | HEIC/HEIF image support | Won't | — | Deferred | — |
| OMX-039 | E2 | Detect received transfers via owner name/account (Settings) | Could | 3 | New — deferred (needs Designer spec M + 049/050b) | S3 candidate |
| OMX-040 | E2 | Robust Thai-digit amount extraction (BUG-007) | Could | 2 | New | S2 candidate |
| OMX-041 | E1 | Google Photos per-item Failed row + Retry (K1) | Must | 2 | New | S2 candidate |
| OMX-042 | E2 | Real-slip accuracy measurement (Layer C + UAT) | Must | 3 | New | S2 candidate |
| OMX-043 | E8 | Real-device & assistive-tech verification (Tier 1) | Must | 3 | New | S2 candidate |
| OMX-044 | E4 | Transaction list virtualization (large months) | Should | 3 | New | S2 candidate |
| OMX-045 | E2 | Salary slip date rule when pay-period end is in the future (O2) | Could | 1 | Ready — PO decided option A | S2 candidate |
| OMX-046 | E7 | Search placeholder fits at 320px (O5) | Could | 1 | New | S2 candidate |
| OMX-047 | E7 | Manual light/dark theme switch | Could | 2 | New — deferred (not needed for Sprint 2 Goal) | S3 candidate |
| OMX-048 | E7 | Post-deploy verification on GitHub Pages (DoD closure) | Must | 2 | New — blocked by 028 (B3) | S2 candidate |
| OMX-049 | E2 | Recipient extraction for KBank/K PLUS arrow (↓) layout (BUG-009) + payee empty state (D1) | Must (High) | 3 | New — groomed, DoR ✗ fixtures (UQ1) | S2 candidate |
| ~~OMX-050~~ | E2 | *Split in v5 → OMX-050a + OMX-050b* | — | ~~5~~ | Split | — |
| OMX-050a | E2 | Category precedence: merchant/biller > transaction-type phrase + Thai food keywords + Medium highlight (D2) (BUG-010a) | Must (High) | 3 | New — groomed, DoR ✗ fixtures (UQ1) | S2 candidate |
| OMX-050b | E2 | Fuzzy keywords Lazada/Shopee tolerant to OCR noise (BUG-010b) | Must (High) | 2 | New — groomed, DoR ✗ variant/negative list (QA Day 1) | S2 candidate |
| OMX-051 | E2 | Payee measurement in Layer A/B fixtures & benchmark (enabler) | Must | 2 | Ready | S2 candidate |
| OMX-052 | E7 | Rename app to Spendy Money / repo spendy-project (FB-013) | Must | 1 | Accepted (pending deploy) | S2 |

¹ ต้องมี Google OAuth Client ID + consent screen test users (action A3, owner PO) ก่อนทดสอบกับ Google จริง; dev ทำงานกับ wrapper ที่ mock ได้ระหว่างรอ
² ต้องได้ push access + เปิด Pages source = GitHub Actions จาก repo owner (action A4) · *(v4)* push/CI ผ่านแล้ว (CI เขียวบน GitHub) เหลือ **B3** = เปิด Pages ซึ่ง repo private บน GitHub Free ทำไม่ได้ → ต้องเปลี่ยน repo เป็น public หรือใช้ plan ที่รองรับ Pages สำหรับ private repo (FB-012)

**Totals (Sprint 1 scope):** Must = **77 pts** (23 items, committed S1) · Should = **29 pts** (10 items, stretch) · Could = 3 pts · Won't = not estimated
**Sprint 1 outcome:** dev-complete Must 77/77 · stretch 26/29 · Accepted (pending deploy) = 66 Must + 26 Should = 92 pts · formally Done = 0 (B1) · carry-over: 028, 003a, 003b, 029
**New in v3 (from Sprint 1 Review/Retro):** OMX-040 – OMX-048 = 19 pts
**New in v4 (from FB-011, real slips):** OMX-049 – OMX-050 = 8 pts (PO estimate)
**v5 (Sprint 2 Grooming):** OMX-049 (3) + OMX-050a (3) + OMX-050b (2) + OMX-051 (2) = **10 pts** (planning poker)

---

## 7. User Stories & Acceptance Criteria

> AC ที่เปลี่ยนใน v2 ระบุด้วย *(v2)* · Story ที่ QA flag ว่า Rewrite (006, 007, 008, 010, 011, 014, 029) ถูกเขียนใหม่ทั้งชุดแล้ว

### E1 — Slip Import

#### OMX-001 — Upload slip images (multi-file picker)
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want to select one or more slip images from my device so that the app can read them and record transactions for me.

**Acceptance Criteria**
- **AC1** — Given I am on the "Add slip" screen, When I tap "อัปโหลดรูป / Upload images" and select valid JPG, PNG or WebP files, Then they appear as thumbnails in the processing queue **and OCR starts automatically** (no extra "start" tap). *(v2)*
- **AC2** — Given I select a file whose content is not JPG/PNG/WebP (checked by MIME type **and** file signature; extensions case-insensitive), When the selection is processed, Then that file is skipped and valid files continue. *(v2)*
- **AC3** — Given a file larger than 10 MiB (10,485,760 bytes), When I select it, Then it is skipped; a file of exactly 10,485,760 bytes is accepted. *(v2)*
- **AC4** — Given the queue would exceed 20 valid items (existing queue + new selection), When the selection is processed, Then only items up to a total of 20 are queued in the order provided by the browser. *(v2)*
- **AC5** — Given files were skipped for any reason (AC2–AC4), When processing ends, Then **one summary message** lists how many were skipped and why (e.g. "ข้าม 2 ไฟล์: ชนิดไฟล์ไม่รองรับ 1, เกิน 10 MB 1 / Skipped 2 files: …"). *(v2)*
- **AC6** — Given an item is still Waiting in the queue, When I press its remove (×) button, Then it is removed before processing. *(v2)*
- **AC7** — Given I am on a mobile device, When I tap "Upload images", Then the native picker allows choosing from gallery and camera (no `capture` attribute) — *manual test on iOS/Android*.
- **AC8** — Given I open the picker and cancel, When the picker closes, Then nothing changes and no error is shown. *(v2)*

#### OMX-002 — Drag & drop upload
**Priority:** Should · **Pts:** 2 · **Status:** Accepted (pending deploy) · **Sprint:** S1-stretch #1
**Story:** As a desktop user, I want to drag slip images onto the page so that I can import many slips quickly.

**Acceptance Criteria**
- **AC1** — Given viewport ≥ 768px, When I drag files over the drop zone (same component as the Upload button), Then it shows a thick dashed border, an icon and the text "วางไฟล์ที่นี่ / Drop files here" (not color-only); the highlight disappears when I drag out. *(v2)*
- **AC2** — Given I drop valid images, When the drop completes, Then they are queued exactly as in OMX-001 (same type/size/count rules and summary message).
- **AC3** — Given I drop files anywhere outside the drop zone, When the drop occurs, Then the browser does not navigate away/open the image.
- **AC4** — Given I drop a folder, a link or text, When the drop occurs, Then nothing is queued and a short message explains only image files are accepted. *(v2)*
- **AC5** — Given viewport < 768px, When the screen renders, Then the "drag files" hint is hidden. *(v2)*

#### OMX-003a — Google Photos: sign-in & open Picker *(split from OMX-003 in v2)*
**Priority:** Must · **Pts:** 5 · **Status:** Blocked (B2) — carry-over · **Sprint:** S1 → S2
**Story:** As a user who keeps slips in Google Photos, I want to sign in with Google and open the Google Photos Picker so that I can choose slip photos without downloading them first.

**Acceptance Criteria**
- **AC1** — Given `VITE_GOOGLE_CLIENT_ID` is configured, When I tap "นำเข้าจาก Google Photos / Import from Google Photos", Then a short explanation "เราอ่านเฉพาะรูปที่คุณเลือก / We only read photos you pick" is shown and Google Identity Services consent requests **only** scope `https://www.googleapis.com/auth/photospicker.mediaitems.readonly`.
- **AC2** — Given consent is granted, When the app creates a Picker session, Then the `pickerUri` opens in a new window/tab within the same user gesture (no popup-blocker failure on Chrome desktop/Android or iOS Safari).
- **AC3** — Given the Picker is open in another tab, When I come back to the app tab, Then the state "กำลังรอการเลือกรูป… / Waiting for your selection…" is still shown with "เปิด Google Photos อีกครั้ง / Reopen Google Photos" and "ยกเลิก / Cancel".
- **AC4** — Given I deny consent or the account is not an OAuth test user (`access_denied`), When the flow returns, Then the error state of OMX-004 AC2 is shown (no silent failure).
- **AC5** — Given the access token, When stored, Then it is kept in memory only (not in localStorage/sessionStorage); after reload the user must authorize again.
- **AC6** — Given Google APIs, When called, Then they are accessed through a single wrapper module that can be stubbed in e2e tests.

#### OMX-003b — Google Photos: poll, download & queue *(split from OMX-003 in v2)*
**Priority:** Must · **Pts:** 3 · **Status:** Blocked (B2) — carry-over · **Sprint:** S1 → S2
**Story:** As a user, I want the photos I picked in Google Photos to be added to the processing queue automatically so that they are read like uploaded slips.

**Acceptance Criteria**
- **AC1** — Given a Picker session is open, When the app polls using the API's `pollingConfig.pollInterval`, Then polling stops when `mediaItemsSet = true`, when I cancel, or when the session's `timeoutIn` elapses (then shows "หมดเวลา ลองใหม่ / Session timed out, try again").
- **AC2** — Given I picked N photos, When the session completes, Then each image is downloaded via `baseUrl=d` with a Bearer token into memory, progress "ดาวน์โหลด 3/8 / Downloading 3/8" is shown, and images are queued under OMX-001 rules (type/size/limit 20 + summary message).
- **AC3** — Given the picked media include video, HEIC or GIF, When processed, Then those items are skipped and included in the OMX-001 AC5 summary.
- **AC4** — Given I close the Picker without selecting, When the session ends, Then the app returns to idle without error and nothing is queued.
- **AC5** — Given the network drops or the token expires during download, When an item fails, Then that item shows Failed with Retry, other items continue; a new token is requested on Retry if needed.
- **AC6** — Given the import flow, When network traffic is checked, Then image data only flows between the browser and Google domains on the OMX-030 allowlist.

#### OMX-004 — Google Photos "not configured" & auth error states
**Priority:** Must · **Pts:** 2 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want a clear message when Google Photos is unavailable so that I know to use file upload instead.

**Acceptance Criteria**
- **AC1** — Given `VITE_GOOGLE_CLIENT_ID` is not set at build time, When I view the Add screen/action sheet, Then the Google Photos button uses `aria-disabled="true"` with visible text "ยังไม่ได้ตั้งค่า Google Photos — ใช้การอัปโหลดแทน / Google Photos not configured — use upload instead" (not tooltip-only). *(v2)*
- **AC2** — Given I deny OAuth consent, When the auth flow returns, Then an inline message under the button reads "ไม่ได้รับอนุญาตให้เข้าถึง Google Photos / Access to Google Photos was not granted" with "ลองอีกครั้ง / Try again" (no modal). *(v2)*
- **AC3** — Given the Google script fails to load (offline, ad-blocker, blocked domain), When I tap the button, Then an inline message reads "เชื่อมต่อ Google ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต / Couldn't reach Google. Check your connection." and the rest of the app keeps working. *(v2)*
- **AC4** — Given an origin/client misconfiguration error (`origin_mismatch`, invalid client), When it occurs, Then a readable message "การตั้งค่า Google ไม่ถูกต้อง / Google sign-in is misconfigured" is shown instead of hanging. *(v2)*
- **AC5** — Given the README, When a developer reads the setup section, Then it explains creating the OAuth Client ID, authorized JavaScript origins (`https://jaijimjim.github.io` + `http://localhost:5173`), adding test users, and setting the GitHub Actions **variable** `VITE_GOOGLE_CLIENT_ID`.

### E2 — OCR & Smart Extraction

#### OMX-005 — In-browser OCR with progress (queue)
**Priority:** Must · **Pts:** 5 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want to see the progress while my slips are being read so that I know the app is working and how long to wait.

**Acceptance Criteria**
- **AC1** — Given images are queued, When processing starts, Then Tesseract.js (`tha+eng`, assets **self-hosted on the same origin**) runs in a Web Worker and each item shows: Waiting → Loading model (first item only) → Recognizing (0–100%, `role="progressbar"`) → Done / Failed / Cancelled; an overall "2/8" counter is shown. *(v2)*
- **AC2** — Given it is the first OCR in the browser, When language data downloads, Then the message "กำลังโหลดโมเดลภาษา ~8 MB (ครั้งแรกเท่านั้น) / Loading language model ~8 MB (first time only)" is shown; later visits load from cache. *(v2)*
- **AC3** — Given multiple images, When processing, Then exactly **1 worker** processes items sequentially, and the Cancel button and navigation respond within 300 ms during OCR. *(v2)*
- **AC4** — Given OCR fails for an image (corrupt file, language data failed to load), When the error occurs, Then that item is Failed with "ลองใหม่ / Retry" and "กรอกเอง / Enter manually"; other items continue; no spinner runs indefinitely. *(v2)*
- **AC5** — Given processing is running, When I press "ยกเลิก / Cancel", Then the worker is terminated, the in-progress item becomes **Cancelled** (result discarded), waiting items stop, and Done items are kept for review. *(v2)*
- **AC6** — Given OCR returns empty or meaningless text, When finished, Then the item is Done with Low confidence and empty fields follow OMX-007/008 rules. *(v2)*
- **AC7** — Given at least one item is Done, When others are still processing, Then the button "ตรวจรายการ (3 พร้อม) / Review (3 ready)" is enabled (progressive review). *(v2)*
- **AC8** — Given OCR is running, When I try to leave the Add screen or close the tab, Then I am asked to confirm (queue lives in memory only). *(v2)*
- **AC9** — Given screen-reader users, When item status changes, Then the change is announced via `aria-live="polite"` (status changes only, not every percent). *(v2)*

#### OMX-006 — Auto-detect transaction type (income / expense) *(rewritten v2)*
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want the app to decide whether a slip is income or expense so that I don't have to classify every slip myself.

**Acceptance Criteria**
- **AC1 (salary first)** — Given normalized OCR text (R4) contains ≥ 1 **strong** salary keyword ("สลิปเงินเดือน", "Payslip", "เงินได้สุทธิ", "Net Pay") **or** ≥ 2 **weak** salary keywords ("เงินเดือน", "รายได้", "Salary", "รายการหัก"), When classified, Then type = **Income** and category = `salary`. Salary rules take precedence over all other rules.
- **AC2 (received)** — Given AC1 does not match and the text contains a received-money keyword ("รับเงิน", "ได้รับเงิน", "เงินเข้า", "รับโอน", "You received", "Money received"), When classified, Then type = **Income**, category = `other_income`, confidence = Medium.
- **AC3 (transfer/payment)** — Given AC1 and AC2 do not match and the text contains a strong transfer keyword ("โอนเงินสำเร็จ", "ชำระเงินสำเร็จ", "จ่ายบิลสำเร็จ", "รายการสำเร็จ", "Transfer successful", "Payment successful"), When classified, Then type = **Expense** with High confidence (if an amount was extracted).
- **AC4 (weak expense)** — Given only weak evidence (bank/app name such as K PLUS, SCB EASY, Krungthai NEXT, or "พร้อมเพย์/PromptPay"), When classified, Then type = Expense with **Medium** confidence.
- **AC5 (default)** — Given no rule matches (including empty text), When classified, Then type = Expense with **Low** confidence and the type field is highlighted on Review.
- **AC6 (confidence)** — Given any classification, When shown on Review, Then confidence follows R5; a slip matching keywords of both types (e.g. salary slip containing "โอนเข้าบัญชี") is classified by precedence and gets Medium.
- **AC7 (accuracy)** — Given the golden OCR-text fixtures (Layer A), When unit tests run in CI, Then ≥ 98% have the correct type (CI gate); Given the synthetic slip image set (Layer B), When the OCR benchmark runs, Then ≥ 90% have the correct type (reported per run).
- **AC8 (received default)** — Given a synthetic "received transfer" slip that looks like a sender slip ("โอนเงินสำเร็จ" without received keywords), When classified, Then type = Expense (documented limitation; user flips it on Review — OMX-012a AC3; owner-name detection = OMX-039).

#### OMX-007 — Extract amount *(rewritten v2)*
**Priority:** Must · **Pts:** 5 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want the amount on the slip to be read automatically so that my records are accurate without typing.

**Acceptance Criteria**
- **AC1 (transfer label)** — Given a transfer slip, When extracted, Then amount = the number adjacent (same line or next line) to an amount label: "จำนวนเงิน", "จำนวน", "Amount", "ยอดชำระ", "ยอดโอน".
- **AC2 (salary label)** — Given a salary slip, When extracted, Then amount = the number adjacent to the first matching label in this order: "เงินได้สุทธิ", "รับสุทธิ", "ยอดสุทธิ", "Net Pay", "Net Income", "Net Salary"; if none, the number after a word containing "สุทธิ"; otherwise empty (never "รายได้รวม"/gross).
- **AC3 (exclusions)** — Given numbers on lines containing "ค่าธรรมเนียม/Fee", "ยอดเงินคงเหลือ/คงเหลือ/Balance", "เลขที่รายการ/Ref", or account-number patterns (e.g. `123-4-56789-0`, `xxx-x-x1234-x`, 10+ digit runs), When extracted, Then they are never used as the amount.
- **AC4 (formats)** — Given strings `1,250.00`, `1250`, `฿1,250.50`, `1,250.00 THB`, `THB 1,250.00`, `1,250.00 บาท`, `1 250.00`, `๑,๒๕๐.๐๐`, When parsed, Then they yield 125000, 125000, 125050, 125000, 125000, 125000, 125000, 125000 satang respectively (R1).
- **AC5 (OCR noise)** — Given common OCR confusions in a number adjacent to an amount label (`O`→`0`, `l`/`I`→`1`), When parsed, Then they are corrected (e.g. `1,25O.OO` → 125000); a value with 3 decimals or a misplaced separator (e.g. `1,250.005`, `1.250,00`) is rejected (field left empty).
- **AC6 (range)** — Given an extracted amount ≤ 0 or > 10,000,000.00, When shown on Review, Then it is shown but highlighted with Low confidence.
- **AC7 (not found)** — Given no amount can be found, When Review opens, Then the amount field is empty, required and highlighted.
- **AC8 (accuracy)** — Given Layer A golden fixtures, Then ≥ 95% correct amount (CI gate); Given Layer B synthetic images, Then ≥ 80% correct amount (benchmark report).

#### OMX-008 — Extract date & time (Thai/BE formats) *(rewritten v2)*
**Priority:** Must · **Pts:** 5 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want the transaction date read from the slip so that it lands in the correct month.

**Acceptance Criteria**
- **AC1 (Thai)** — Given `13 พ.ย. 69 14:35 น.`, `13 พ.ย. 2569`, `13 พย 69`, `13 พ.ย 69`, `13 พฤศจิกายน 2569`, When extracted, Then date = `2026-11-13` (R3: 2-digit year in Thai context = 25xx BE).
- **AC2 (numeric & EN)** — Given `13/11/2026`, `13/11/2569`, `13-11-69`, `2026-11-13`, `13 Nov 2026`, `Nov 13, 2026`, When extracted, Then date = `2026-11-13`; numeric dates are **always day/month/year** (`01/02/2026` = 1 Feb 2026); a 4-digit year ≥ 2400 is BE.
- **AC3 (validity)** — Given impossible dates (`31/11/2569`, `29 ก.พ. 2569`), When extracted, Then they are rejected; `29 ก.พ. 2567` is accepted as `2024-02-29`.
- **AC4 (time)** — Given `14:35`, `14:35:22`, `14.35 น.`, `02:35 PM`, When extracted, Then time = `14:35`; if no time is found, time is empty (not `00:00`).
- **AC5 (salary)** — Given a salary slip, When extracted, Then the date next to a pay-date label ("วันที่จ่าย", "วันที่โอน", "Pay date", "Payment date") is used; otherwise the last day of the pay period ("งวดเดือน พฤศจิกายน 2569" → `2026-11-30`); otherwise not found.
- **AC6 (fallback)** — Given no valid date, a date after today, or a date more than 5 years before today (all evaluated in **Asia/Bangkok**, R2), When Review opens, Then date defaults to today (Asia/Bangkok), is highlighted, and shows the hint "ไม่พบวันที่ในสลิป — ใช้วันนี้ / No date found on slip — using today".
- **AC7 (month boundary)** — Given a slip dated `31/10/2569 23:59`, When saved, Then it belongs to October 2026 regardless of the device timezone (tested with `Asia/Bangkok` and `America/Los_Angeles`).
- **AC8 (accuracy)** — Given Layer A golden fixtures, Then ≥ 95% correct date (CI gate); Layer B synthetic accuracy is reported by the benchmark.

#### OMX-009 — Extract recipient / sender / memo / bank
**Priority:** Should · **Pts:** 5 · **Status:** Accepted (pending deploy) · **Sprint:** S1-stretch #8
**Story:** As a user, I want to see who I paid and the memo so that I can recognise each transaction later.

**Acceptance Criteria**
- **AC1** — Given a transfer slip with sender and recipient blocks (จาก/ไปยัง, From/To), When extracted, Then the recipient name (and masked account/PromptPay number if present, always shown masked) fills "ผู้รับ / Payee".
- **AC2** — Given "บันทึกช่วยจำ / Memo / Note" on the slip, When extracted, Then it fills "Note" (rendered as plain text — OMX-031).
- **AC3** — Given a slip from K PLUS, SCB EASY, Krungthai NEXT or a PromptPay slip, When extracted, Then the bank/app is shown as a **text tag** (no logos); ≥ 90% correct on Layer B. *(v2)*
- **AC4** — Given a reference number (เลขที่รายการ / Ref no.), When extracted, Then it is stored in `slip.refNo` for OMX-011.
- **AC5** — Given a salary slip, When extracted, Then the employer/company name (if found) fills Payee/Source.
- **AC6** — Given payee accuracy, When the benchmark runs, Then payee is reported as exact-match % after normalization **and** character error rate (CER) — report only, no gate. *(v2)*

#### OMX-010 — Auto-categorize slip (rule-based) *(rewritten v2)*
**Priority:** Must · **Pts:** 5 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want the app to choose the spending category automatically so that my dashboard is meaningful without manual sorting.

**Acceptance Criteria**
- **AC1 (match)** — Given an expense slip whose normalized payee, memo or text contains a keyword from the rules file (R6, §4), When categorised, Then that category is assigned (e.g. "GrabFood" → `food`, "การไฟฟ้านครหลวง" → `bills`), matching case-/space-insensitively ("Grab Food", "GRABFOOD").
- **AC2 (precedence)** — Given several keywords match, When categorised, Then: (1) the match in the highest-priority field wins — **payee > memo > other text**; (2) within the same field the **longest keyword** wins (`GrabFood` > `Grab`, `Café Amazon` > `PTT`); (3) remaining ties resolve by the explicit `priority` number in the rules file.
- **AC3 (payee source in S1)** — Given OMX-009 is not yet done, When determining the payee field, Then the line(s) following a "ไปยัง / To" label are used as payee; otherwise the whole text is treated as "other text".
- **AC4 (word boundary)** — Given English keywords, When matching, Then word boundaries apply (`AIS` does not match "RAISIN", `MRT` does not match inside a longer word).
- **AC5 (person)** — Given the payee starts with a personal prefix (นาย, นาง, นางสาว, น.ส., Mr., Mrs., Ms., Miss) and no merchant/bill keyword matches, When categorised, Then category = `transfer`; a payee containing "บริษัท … จำกัด"/"Co., Ltd." is **never** `transfer`.
- **AC6 (income)** — Given type = Income, When categorised, Then category ∈ {`salary`, `other_income`} only (salary per OMX-006 AC1, otherwise `other_income`); an expense never receives an income category and vice versa.
- **AC7 (default)** — Given nothing matches, When categorised, Then category = `other` with Low confidence.
- **AC8 (data file)** — Given the rules file, When a developer adds a keyword, Then only `categories.rules.ts` changes and a table-driven unit test covers each keyword and each conflict case above.
- **AC9 (accuracy)** — Given Layer A golden fixtures, Then ≥ 95% correct category (CI gate); Given Layer B synthetic images, Then ≥ 60% correct category (benchmark report).

#### OMX-011 — Duplicate slip detection *(rewritten v2)*
**Priority:** Should · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1-stretch #7
**Story:** As a user, I want to be warned when I import the same slip twice so that my totals are not inflated.

**Acceptance Criteria**
- **AC1 (exact)** — Given a queued image whose SHA-256 of file bytes equals `slip.imageHash` of a saved transaction, When it reaches Review, Then it is labelled "ซ้ำ / Duplicate", its checkbox is unchecked by default, and it is visually de-emphasised with a text label (not opacity-only).
- **AC2 (probable)** — Given a different image hash, When either (a) `refNo` equals a saved transaction's `refNo`, or (b) amount (satang) equal **and** date equal **and** time within ±1 minute (or both times empty) **and** normalized payee equal (R4, case-insensitive, prefixes removed), Then the item shows "อาจซ้ำ / Possible duplicate". Note: the same photo from Google Photos and local upload has different hashes and is caught by this rule.
- **AC3 (preview)** — Given a duplicate/possible-duplicate label, When I tap "ดูรายการเดิม / View existing", Then the existing transaction opens in a preview dialog without leaving Review.
- **AC4 (override)** — Given a flagged item, When I tick it and save ("บันทึกต่อ / Save anyway"), Then it is saved.
- **AC5 (same batch)** — Given two items in one batch with the same hash, When queued, Then only one is processed; Given two items with different hashes but the same `refNo`, Then the second is flagged Possible duplicate.
- **AC6 (deleted)** — Given a transaction was deleted (after the undo window), When its slip is imported again, Then it is **not** flagged.
- **AC7 (manual)** — Given a saved manual transaction (no hash/ref), When a slip matches it by rule AC2(b), Then it is flagged Possible duplicate.

### E3 — Review & Manual Entry

#### OMX-012a — Review: editable list, validation, save/discard *(split from OMX-012 in v2)*
**Priority:** Must · **Pts:** 5 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want to review and correct what the app read before saving so that I can trust my records.

**Acceptance Criteria**
- **AC1** — Given OCR results, When I open Review, Then each item is a card (mobile: compact card that expands to edit; desktop ≥ 1024px: image left / form right) showing type, amount, date/time, category, payee, note and Medium/Low confidence badges; highlighted fields use border + icon + text.
- **AC2** — Given any field, When I edit it, Then it is validated (amount > 0 and ≤ 99,999,999.99 with ≤ 2 decimals, valid date, type and category required) with inline errors in the current language; changing language re-translates visible errors.
- **AC3** — Given the **type toggle at the top of each card**, When I flip it in one tap, Then the category list shows only categories valid for that type; if the current category becomes invalid it resets (Expense→Income resets to `other_income`, Income→Expense resets to `other`).
- **AC4** — Given items are selected, When I press "บันทึกที่เลือก (N) / Save selected (N)" in the sticky footer, Then all selected valid items are saved in one atomic storage write, saved items leave the queue, unselected/invalid items remain, and a toast "บันทึกแล้ว N รายการ · ดูรายการ / Saved N transactions · View" appears.
- **AC5** — Given some selected items are invalid, When the footer renders, Then Save is disabled with the reason ("2 รายการยังไม่ครบ / 2 items need fixing") until fixed or unselected; Select all / none is available.
- **AC6** — Given I press "ทิ้ง / Discard" on an item and confirm, When done, Then it is removed without saving.
- **AC7** — Given storage write fails (quota/unavailable), When saving, Then nothing is saved (all-or-nothing), items stay in Review, and the OMX-021 AC3 error is shown.
- **AC8** — Given a saved slip transaction, When stored, Then `source = "slip"`, `slip.imageHash`, `slip.confidence`, `slip.rawText` (≤ 500 chars) are stored, but not the image (R8).
- **AC9** — Given every item Failed, When Review opens, Then an empty state offers "กรอกเอง / Enter manually".

#### OMX-012b — Review: image viewer, raw text, leave-guard, flags *(split from OMX-012 in v2)*
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want to see the original slip and OCR text while reviewing, and not lose my work by accident, so that I can correct results confidently.

**Acceptance Criteria**
- **AC1** — Given a card thumbnail, When I tap it, Then the image opens in a `<dialog>` that supports zoom/pinch and closes with Esc, back button or close button, returning focus to the thumbnail.
- **AC2** — Given a card, When I expand "ข้อความจาก OCR / OCR text" (`<details>`, closed by default), Then the raw text is shown as plain text.
- **AC3** — Given unsaved items in Review, When I navigate within the app, Then a confirm dialog appears; When I refresh/close the tab, Then the browser's `beforeunload` prompt appears (copy explains the queue is kept in memory only).
- **AC4** — Given OMX-011 is done, When an item is flagged, Then the duplicate badges and "View existing" from OMX-011 render on the card (placeholder slot otherwise).

#### OMX-013 — Manual income/expense entry form
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want to add income or expenses manually so that cash and non-slip transactions are also tracked.

**Acceptance Criteria**
- **AC1** — Given I choose "กรอกเอง / Add manually", When the form opens (mobile full-screen sheet with its own route so Back closes it; desktop: centred page column or dialog, with Back/Esc closing it — *v3: K3 deviation accepted at Sprint 1 Review*), Then fields appear in order: Type segmented control (`role="radiogroup"`, default Expense) → **Amount (autofocus, `inputmode="decimal"`, ฿ prefix)** → Category (icon grid picker filtered by type) → Date (default today Asia/Bangkok, with formatted label e.g. "13 พ.ย. 2569") → Payee (optional, max 100) → Note (optional, max 500). *(v2)*
- **AC2** — Given valid input, When I press Save, Then the transaction is stored with `source = "manual"` and appears in list and dashboard immediately; double-tapping Save creates only one transaction. *(v2)*
- **AC3** — Given amount empty, ≤ 0, non-numeric, > 2 decimals or > 99,999,999.99, When I press Save, Then an inline error is shown and nothing is saved; `1,000` (with comma) is accepted as 1000.00. *(v2)*
- **AC4** — Given a future date, When I save, Then it is allowed with a non-blocking warning "วันที่อยู่ในอนาคต / Date is in the future". *(v2)*
- **AC5** — Given I press Cancel with unsaved input, When I confirm, Then the form closes without saving.
- **AC6** — Given text fields, When saved, Then leading/trailing whitespace is trimmed. *(v2)*

### E4 — Transaction Management

#### OMX-014 — Transaction list *(rewritten v2)*
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want to see all my transactions for the selected month so that I can check what was recorded.

**Acceptance Criteria**
- **AC1 (order)** — Given saved transactions, When I open "รายการ / Transactions", Then transactions of the selected month are grouped by date (newest date first); within a date: by time desc, then `createdAt` desc; items without time come after timed items of that date.
- **AC2 (group header)** — Given a date group, When rendered, Then a sticky header shows the formatted date and that day's net total.
- **AC3 (row)** — Given a row, When rendered, Then it shows category icon + name, payee (or note; ellipsis if too long), amount in THB with `+`/`−` sign + arrow icon + screen-reader label "รายรับ/Income" or "รายจ่าย/Expense" (not color-only), and a source badge (icon + text: สลิป/Slip, กรอกเอง/Manual).
- **AC4 (locale)** — Given TH, When dates render, Then they use BE (e.g. "13 พ.ย. 2569") in both group headers and details; EN uses "13 Nov 2026".
- **AC5 (layout)** — Given an amount of 1,000,000.00 at 360px width, When rendered, Then nothing overflows or overlaps.
- **AC6 (performance)** — Given 500 seeded transactions in the selected month, When the list opens, Then first render completes ≤ 1 s (performance mark) on the reference devices (OMX-029) and Chrome Performance shows no long task > 200 ms while scrolling.
- **AC7 (empty)** — Given no transactions this month but some in other months, When opened, Then the message "เดือนนี้ยังไม่มีรายการ / No transactions this month" is shown (distinct from the first-use empty state in OMX-026).

#### OMX-015 — Filter & search transactions
**Priority:** Should · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1-stretch #2
**Story:** As a user, I want to filter and search transactions so that I can quickly find a specific payment.

**Acceptance Criteria**
- **AC1** — Given the list, When I filter by type (All/Income/Expense), Then only matching transactions are shown.
- **AC2** — Given the "ตัวกรอง (n) / Filters (n)" button (bottom sheet on mobile), When I select categories, Then only those are shown and active filters appear as removable chips.
- **AC3** — Given the search box, When I type, Then results match payee, note or amount by substring (case-insensitive, NFC-normalized, trimmed); `1250`, `1,250` and `125` all match 1,250.00; regex special characters do not cause errors. *(v2)*
- **AC4** — Given filters are active, When results show, Then a filtered total, "ล้างตัวกรอง / Clear filters", and an `aria-live` count ("พบ 5 รายการ / 5 results") are shown; no results → OMX-026 AC2.
- **AC5** — Given active filters, When I change month, Then filters are kept. *(v2 — PO decision)*

#### OMX-016 — Edit & delete transaction
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want to edit or delete a saved transaction so that I can fix mistakes.

**Acceptance Criteria**
- **AC1** — Given a transaction in the list, When I tap it, Then the shared transaction form opens prefilled (same validation as OMX-013); changing type revalidates category.
- **AC2** — Given I save changes, When saved, Then list, dashboard and storage update immediately; changing the date to another month moves it out of the current month list and both months' totals are correct. *(v2)*
- **AC3** — Given the destructive "ลบ / Delete" button at the bottom of the edit form (no swipe-to-delete), When I confirm in a dialog (default focus = Cancel), Then the transaction is removed and an "เลิกทำ / Undo" toast is shown ≥ 5 s and does not dismiss while it has focus; Undo restores it with the same ID. *(v2)*
- **AC4** — Given I cancel the delete dialog (button or Esc), When closed, Then nothing changes.
- **AC5** — Given I navigate away or reload during the undo window, When that happens, Then the delete becomes permanent (documented behaviour). *(v2)*

### E5 — Dashboard & Insights

#### OMX-017 — Month selector
**Priority:** Must · **Pts:** 2 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want to switch between months so that I can review past spending.

**Acceptance Criteria**
- **AC1** — Given the app opens, When the dashboard loads, Then the current month in **Asia/Bangkok** is selected (selection is not persisted). *(v2)*
- **AC2** — Given "‹ พฤศจิกายน 2569 ›" in the shared header of Dashboard and Transactions, When I tap previous/next or pick from the month/year grid, Then both screens update; **next is disabled at the current month**; a "เดือนนี้ / This month" shortcut appears when not on the current month. *(v2)*
- **AC3** — Given TH, When displayed, Then Thai month + BE year (พฤศจิกายน 2569); EN shows "November 2026"; Dec 2569 → next → มกราคม 2570 (CE 2027).
- **AC4** — Given the selected month, When I navigate between Dashboard and Transactions, Then the selection is kept.
- **AC5** — Given the arrow buttons, When read by a screen reader, Then they have labels "เดือนก่อนหน้า/Previous month", "เดือนถัดไป/Next month". *(v2)*

#### OMX-018 — Monthly summary (income / expense / balance)
**Priority:** Must · **Pts:** 2 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want to see my total income, expenses and balance for the month so that I know where I stand.

**Acceptance Criteria**
- **AC1** — Given transactions in the selected month, When the dashboard loads, Then a **Balance hero card** (income − expense) appears on top and Income/Expense cards below (2 columns at 360px), in THB with thousand separators and 2 decimals, computed in satang (0.10 + 0.20 = 0.30 exactly). *(v2)*
- **AC2** — Given balance is negative, When shown, Then it uses "−" and a warning style with icon (not color-only); balance 0 shows `0.00`, never `−0.00`. *(v2)*
- **AC3** — Given I add/edit/delete a transaction, When I return to the dashboard, Then totals reflect the change.
- **AC4** — Given no transactions this month, When the dashboard loads, Then totals show 0.00 plus an empty-state CTA to add a slip.
- **AC5** — Given totals up to 99,999,999.99, When rendered at 360px, Then numbers do not overflow (font scales or wraps). *(v2)*

#### OMX-019 — Category breakdown chart (horizontal bar)
**Priority:** Should · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1-stretch #3
**Story:** As a user, I want to see expenses by category so that I know what I spend the most on.

**Acceptance Criteria**
- **AC1** — Given expenses in the selected month, When the dashboard loads, Then a **hand-rolled SVG horizontal bar chart** shows each category's amount and % (1 decimal) sorted descending; % totals may differ from 100% by ±0.1% due to rounding. *(v2)*
- **AC2** — Given the chart, When rendered, Then each row has a visible text label and value, bars have ≥ 3:1 contrast against the background, a single accent color is used (no reliance on color to distinguish categories), and an accessible text table/summary exists. *(v2)*
- **AC3** — Given each bar row is a `<button>` (≥ 44px tall), When I activate it, Then I go to Transactions filtered by that category (if OMX-015 is done; otherwise to Transactions of that month). *(v2)*
- **AC4** — Given no expenses, When rendered, Then an empty state replaces the chart.
- **AC5** — Given `prefers-reduced-motion`, When rendered, Then no animation runs. *(v2)*

#### OMX-020 — Monthly trend chart
**Priority:** Should · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1-stretch #4
**Story:** As a user, I want to see income vs expense over recent months so that I can see whether my finances are improving.

**Acceptance Criteria**
- **AC1** — Given saved data, When the dashboard loads, Then a hand-rolled SVG grouped bar chart shows income and expense for the 6 months ending at the selected month (crossing years correctly, e.g. ส.ค. 2569 – ม.ค. 2570). *(v2)*
- **AC2** — Given a month with no data, When rendered, Then it shows 0 (not omitted).
- **AC3** — Given the chart, When rendered, Then income/expense are distinguished by pattern/order + text legend (not color-only), month labels follow the language (พ.ย. / Nov), and a "ดูเป็นตาราง / View as table" toggle shows the data table. *(v2)*

### E6 — Data & Persistence

#### OMX-021 — Persist data in localStorage
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want my transactions saved in my browser so that they are still there next time I open the app.

**Acceptance Criteria**
- **AC1** — Given I save transactions, When I reload or reopen the app in the same browser, Then all transactions and my language preference are restored.
- **AC2** — Given stored data, When saved, Then it uses one versioned envelope `omx.v1` `{version: 1, transactions, settings}` validated by schema on load (R8). *(v2)*
- **AC3** — Given localStorage is full or throws (quota, private mode, `SecurityError`), When saving fails, Then a dismissible banner suggests JSON export, in-memory state rolls back, and the stored value is byte-for-byte identical to before the failed save. *(v2)*
- **AC4** — Given corrupted or unknown-version stored JSON, When the app loads, Then it does not crash, copies the raw value to `omx.v1.corrupt.<timestamp>`, and shows a recovery banner with "ส่งออกข้อมูลดิบ / Export raw data". *(v2)*
- **AC5** — Given localStorage is entirely unavailable on first load, When the app starts, Then it still renders (in-memory mode) with a banner explaining data won't be kept. *(v2)*
- **AC6** — Given the app is open in two tabs, When one tab saves, Then the other tab reloads state from storage via the `storage` event before its next write (no silent overwrite). *(v2 — QA Q6)*
- **AC7** — Given Settings → About, When viewed, Then it states data is stored only in this browser, may be cleared by the browser (e.g. Safari after inactivity), and recommends regular backup.

#### OMX-022 — JSON backup export / import
**Priority:** Should · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1-stretch #5
**Story:** As a user, I want to export and import my data as a JSON file so that I can back up or move to another device.

**Acceptance Criteria**
- **AC1** — Given "ส่งออกข้อมูล / Export data" → JSON, When done, Then `omnitrix-money-backup-YYYYMMDD.json` (local Asia/Bangkok date) downloads with schema version, export timestamp and all transactions.
- **AC2** — Given I choose a backup file, When it is valid, Then a preview shows "ไฟล์มี 120 รายการ, ซ้ำ 30 / File has 120 transactions, 30 duplicates" and I choose **Merge** (default; dedupe by transaction ID) or **Replace** (destructive; second confirmation); a summary "นำเข้า N รายการ / Imported N" is shown. Importing the same file twice with Merge yields "Imported 0". *(v2)*
- **AC3** — Given an invalid file (not JSON, wrong schema, newer version, > 5 MB), When importing, Then nothing changes and an error explains why. *(v2)*
- **AC4** — Given I cancel at any confirmation, When closed, Then nothing changes. *(v2)*

#### OMX-023 — CSV export
**Priority:** Should · **Pts:** 2 · **Status:** Accepted (pending deploy) · **Sprint:** S1-stretch #6
**Story:** As a user, I want to export transactions to CSV so that I can analyse them in Excel/Google Sheets.

**Acceptance Criteria**
- **AC1** — Given "ส่งออกข้อมูล / Export data" → CSV, When done, Then a UTF-8 CSV with BOM downloads with columns `date,time,type,category,amount,payee,note,source`; `date` = `YYYY-MM-DD` (CE), `amount` = positive number with 2 decimals and no thousand separator, `type` = `income|expense`, `category` = category name in the current UI language. *(v2)*
- **AC2** — Given scope "เดือนที่เลือก / Selected month" or "ทั้งหมด / All", When exporting, Then only that range is exported; an empty range yields a header-only file with a notice.
- **AC3** — Given a field with comma, quote or newline, When exported, Then it is escaped per RFC 4180.
- **AC4** — Given a payee/note starting with `=`, `+`, `-`, `@`, Tab or CR, When exported, Then it is prefixed with `'` (CSV formula-injection protection, OWASP). *(v2)*
- **AC5** — Given the exported file, When opened in Excel (Win/Mac) and Google Sheets, Then Thai text displays correctly — *manual test*. *(v2)*

### E7 — Platform, i18n & UX Quality

#### OMX-024 — TH / EN language switch
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a Thai or English-speaking user, I want to switch the UI language so that I can use the app comfortably.

**Acceptance Criteria**
- **AC1** — Given first visit, When the app loads, Then language = TH if `navigator.languages[0]` starts with `th` (e.g. `th-TH`), otherwise EN. *(v2)*
- **AC2** — Given the "TH | EN" text switch (header on desktop, compact header + Settings on mobile; each option has its own `lang` attribute), When I toggle it, Then all UI text, category names, dates, month names and number formats switch immediately without reload, including open dialogs, errors and toasts. *(v2)*
- **AC3** — Given I switch language, When I reopen the app, Then my choice is remembered.
- **AC4** — Given language changes, When it does, Then `<html lang>` updates to `th` / `en`.
- **AC5** — Given the i18n resource files, When CI runs, Then a check verifies TH and EN have identical key sets with no empty values, and the e2e smoke on each screen finds no raw keys and no "missing key" console warnings. *(v2)*
- **AC6** — Given the Designer's copy deck v1, When implemented, Then all strings come from it (key-based). *(v2)*

#### OMX-025 — Mobile-first responsive layout & navigation
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a mobile user, I want an app that fits my phone screen so that I can record slips on the go.

**Acceptance Criteria**
- **AC1** — Given viewport widths 320, 360, 768 and 1280px (and one landscape phone size), When I use every screen, Then there is no horizontal scrolling and content is readable (WCAG 1.4.10). *(v2)*
- **AC2** — Given mobile, When navigating, Then a bottom nav shows หน้าหลัก/Home · รายการ/Transactions · **เพิ่ม/Add** (prominent centre) · ตั้งค่า/Settings, respecting iOS safe-area; Add opens an action sheet: อัปโหลดสลิป/Upload slip · Google Photos · กรอกเอง/Add manually; ≥ 1024px uses a side nav in the same order. *(v2)*
- **AC3** — Given the active tab, When rendered, Then it has icon + label + indicator and `aria-current="page"`. *(v2)*
- **AC4** — Given routing, When I deep-link or refresh any screen on GitHub Pages, Then it loads (HashRouter, e.g. `#/transactions`), no 404. *(v2)*
- **AC5** — Given design tokens (colors, spacing, radius, type scale as CSS custom properties), When the app renders, Then body text is ≥ 16px, Thai line-height ≥ 1.6, amounts use `tabular-nums`, and the Thai/English font is self-hosted (no Google Fonts request). *(v2)*

#### OMX-026 — Empty states & error handling
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user, I want helpful messages when there is no data or something goes wrong so that I always know what to do next.

**Acceptance Criteria**
- **AC1** — Given no transactions at all, When I open Dashboard/Transactions, Then a first-use empty state explains the app and offers "อัปโหลดสลิป / Upload slip" and "กรอกเอง / Add manually".
- **AC2** — Given a filter/search with no results, When shown, Then the message says no matches and offers to clear filters.
- **AC3** — Given a screen component throws, When it occurs, Then an error boundary shows a friendly message with "โหลดใหม่ / Reload", no stack trace or financial data is shown, and stored data is not lost (verified by component test). *(v2)*
- **AC4** — Given the device is offline, When I use network features (first OCR model download, Google Photos), Then an app banner explains offline; when back online, Retry works; other features keep working. *(v2)*
- **AC5** — Given all messages, When displayed, Then they follow the Designer's empty/error catalogue (what happened + what to do next), exist in TH and EN, and are announced via `aria-live` where appropriate. *(v2)*
- **AC6** — Given data screens, When loading, Then skeletons are shown instead of bare spinners. *(v2)*

#### OMX-027 — Accessibility (WCAG 2.1 AA)
**Priority:** Must · **Pts:** 3 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a user with visual or motor impairments, I want the app to work with keyboard and screen readers so that I can manage my money independently.

**Acceptance Criteria**
- **AC1** — Given keyboard-only use, When I tab through every screen, Then all actions are reachable in logical order with visible focus; a "ข้ามไปเนื้อหา / Skip to content" link exists; dialogs (native `<dialog>`) trap/restore focus and close with Esc. *(v2)*
- **AC2** — Given a route change, When the new screen renders, Then focus moves to its main heading. *(v2)*
- **AC3** — Given forms, When used with a screen reader, Then every input has a label and errors are linked (`aria-describedby`) and announced; verified with NVDA + Chrome, VoiceOver + iOS Safari, TalkBack smoke. *(v2)*
- **AC4** — Given text and UI components, When checked, Then contrast ≥ 4.5:1 for text and ≥ 3:1 for UI components; meaning is never conveyed by color alone.
- **AC5** — Given 200% zoom / large OS text, When used, Then content remains usable.
- **AC6** — Given axe-core (Playwright) on Dashboard, Transactions, Add slip, Review, Manual form and Settings, When run, Then 0 critical and 0 serious violations, and Lighthouse a11y ≥ 90. *(v2)*
- **AC7** — Given `prefers-reduced-motion`, When enabled, Then non-essential animations are disabled.
- **AC8** — Given interactive elements, When measured, Then touch targets are ≥ 44×44 px (moved here from OMX-025). *(v2)*

#### OMX-028 — Deploy to GitHub Pages via GitHub Actions
**Priority:** Must · **Pts:** 3 · **Status:** Blocked (B3) — carry-over · **Sprint:** S1 → S2
> *(v4, 2026-11-23)* B1 ส่วน push/CI ปิดแล้ว — ทุก job ใน `ci.yml` เขียวบน GitHub แต่ `deploy.yml` ล้มที่ `configure-pages` เพราะ repo เป็น private และยังไม่เปิด Pages → live URL ตอบ 404 (FB-012). Blocker ใหม่ **B3** owner = repo owner (ผู้ใช้), PO ติดตาม. AC1, AC3, AC4 คาดว่าผ่านแล้วจาก CI run แต่ยืนยันพร้อม AC2 หลัง deploy สำเร็จครั้งแรก
> *(v5, grooming)* Remaining ≈ 1 pt: Dev ยืนยันว่า **ไม่ต้องแก้ workflow** · task ใน 028 (ไม่เพิ่ม pts): step ตรวจ Pages ก่อน `configure-pages` ที่พิมพ์ error อ่านง่าย ("Pages is not enabled… private repos need a paid plan") · ถ้า repo ต้องเปลี่ยนเป็น public (UQ2): รัน gitleaks full history + ยืนยันว่าไม่มีรูปสลิปจริงใน `git log --all` ก่อนเปลี่ยน · การอัปเกรด actions Node 20 → 24 = tech debt (parked)
**Story:** As the customer, I want the app hosted on a public URL so that anyone can access it from outside without installing anything.

**Acceptance Criteria**
- **AC1** — Given a push/merge to `main`, When the workflow runs, Then it runs `npm ci`, typecheck, lint, i18n check, unit tests, build and e2e smoke, then deploys via `actions/deploy-pages`; any failed step blocks deployment (verified with an intentionally failing PR).
- **AC2** — Given the deployment, When I open `https://jaijimjim.github.io/omnitrix-project/`, Then the app loads with the correct base path; assets, hash routes and self-hosted Tesseract worker/core/language files all resolve.
- **AC3** — Given the repository **variable** `VITE_GOOGLE_CLIENT_ID`, When the workflow builds, Then it is injected at build time; CI builds both with and without it and both succeed (without → OMX-004 state). *(v2)*
- **AC4** — Given Tesseract assets, When building, Then they are copied from pinned npm packages at build time (not committed to git, no CDN). *(v2)*
- **AC5** — Given the README, When read, Then it includes the live URL, local dev steps, and deployment/config notes.

### E8 — Non-functional Requirements

#### OMX-029 — NFR — Performance budget *(rewritten v2)*
**Priority:** Should · **Pts:** 3 · **Status:** In Progress (partial) — carry-over · **Sprint:** S1-stretch #9 → S2
**Story:** As a user on a mid-range phone, I want the app to load and respond quickly so that recording slips doesn't feel slow.

**Reference devices:** 1 mid-range Android (2023–2024, e.g. Samsung Galaxy A-series) + 1 iPhone 2–3 generations old; exact models owned by the team are recorded in the QA test plan.

**Acceptance Criteria**
- **AC1 (load)** — Given Lighthouse **mobile preset** (simulated Slow 4G, 4× CPU throttle) on the deployed URL, When run 3 times, Then median LCP ≤ 2.5 s.
- **AC2 (bundle)** — Given the production build, When CI runs the bundle-size check, Then JavaScript loaded before first interaction ≤ 300 KB gzipped; Tesseract and charts are not in the initial bundle (dynamic import).
- **AC3 (OCR time)** — Given the OCR model is cached, When processing 5 synthetic 1080×2400 PNG slips on each reference device, Then median OCR time ≤ 15 s per image.
- **AC4 (downscale)** — Given an image whose long edge > 2,000 px, When queued, Then it is downscaled to 2,000 px before OCR (unit-tested), and the image object URL is revoked after use.
- **AC5 (data scale)** — Given 1,000 seeded transactions (JSON fixture), When opening Dashboard or Transactions, Then render completes ≤ 1 s measured by in-app performance marks on the reference devices.

#### OMX-030 — NFR — Privacy: images stay in the browser
**Priority:** Must · **Pts:** 2 · **Status:** Accepted (pending deploy) · **Sprint:** S1
**Story:** As a privacy-conscious user, I want my slip images and financial data to stay on my device so that my personal information is not exposed.

**Acceptance Criteria**
- **AC1** — Given the full flow upload → OCR → review → save, When an automated network allowlist test runs, Then all requests go to the app's own origin (including Tesseract assets and fonts); Google domains (`accounts.google.com`, `apis.google.com`, `photospicker.googleapis.com`, `*.googleusercontent.com`) are allowed only during Google Photos import; POST/PUT to any other origin = 0. *(v2)*
- **AC2** — Given the app, When inspected, Then there is no third-party analytics/tracking, and a CSP `<meta>` restricts `connect-src` to self + the Google domains above. *(v2)*
- **AC3** — Given saved data, When stored, Then full images are not persisted (only derived fields + hash).
- **AC4** — Given Settings → danger zone "ลบข้อมูลทั้งหมด / Delete all data", When I confirm (default focus = Cancel), Then `omx.v1`, any `omx.v1.corrupt.*` backups and the in-memory OCR queue are cleared. *(v2)*
- **AC5** — Given the Add screen, When shown, Then a trust message with lock icon reads "รูปของคุณไม่ถูกส่งออกจากเครื่อง / Your images never leave this device" linking to the Privacy section (TH/EN) that explains what is processed and where. *(v2)*

#### OMX-031 — NFR — Security & configuration hygiene
**Priority:** Should · **Pts:** 2 · **Status:** Accepted (pending deploy) · **Sprint:** S1-stretch #10
**Story:** As the team, we want safe defaults so that the public app does not expose secrets or allow injection.

**Acceptance Criteria**
- **AC1** — Given the repository, When CI runs gitleaks, Then no secrets are found (Client ID via Actions variable; no client secret used).
- **AC2** — Given OCR text, payee and notes, When rendered, Then they are text only; ESLint `react/no-danger` is an error; a synthetic slip and a JSON backup containing `<img src=x onerror=alert(1)>` do not execute script. *(v2)*
- **AC3** — Given imported JSON, When parsed, Then it is schema-validated (zod) before use.
- **AC4** — Given the OAuth flow, When complete, Then only the minimum Photos Picker scope was requested and no token exists in localStorage/sessionStorage.

### E9 — Future

#### OMX-039 — Detect received transfers via owner name/account *(new v2, from Dev grooming input)*
**Priority:** Could · **Pts:** 3 · **Status:** New — deferred to Sprint 3 (v5) · **Sprint:** S3 candidate · **Depends on:** OMX-009, OMX-049 (payee ถูกต้อง), OMX-050b (`fold()` สำหรับเทียบชื่อ), Designer spec Settings "ชื่อของฉัน" (M)
**Story:** As a user who receives transfer slips from other people, I want the app to recognise slips where I am the recipient so that they are recorded as income automatically.

**Acceptance Criteria (draft — refine in next grooming)**
- **AC1** — Given Settings "ชื่อของฉัน / My names", When I add one or more names (TH/EN) and optionally the last 4 digits of my accounts/PromptPay, Then they are stored locally in `settings`.
- **AC2** — Given a transfer slip whose recipient (after removing prefixes นาย/นาง/นางสาว/Mr./Ms., spaces, and allowing ≤ 2 character OCR differences) matches one of my names, When classified, Then type = Income, category = `other_income`, confidence = High if account digits also match, otherwise Medium.
- **AC3** — Given the sender matches my name, When classified, Then type = Expense with High confidence.
- **AC4** — Given no names are configured, When classifying, Then behaviour is unchanged from OMX-006.

### New items from Sprint 1 Review / Retrospective (v3)

#### OMX-040 — Robust Thai-digit amount extraction (BUG-007)
**Priority:** Could · **Pts:** 2 · **Status:** New · **Source:** BUG-007 (Low), Sprint 1 Review
**Story:** As a user whose slip shows Thai digits, I want the amount to be read correctly so that I don't need to type it.

**Acceptance Criteria**
- **AC1** — Given OCR text with mixed Thai/Arabic digits next to an amount label (e.g. `๓๕๒.๕6๐ บาท`), When extracted, Then digits are normalized and the candidate with exactly 2 decimals that fits the surrounding pattern is chosen (`35250` satang for the BUG-007 fixture), otherwise the field stays empty (no wrong guess).
- **AC2** — Given Layer B image `b16-bill-water-thai-digits.png`, When the benchmark runs, Then amount is correct and the Layer B amount accuracy is ≥ 96.3% (no regression on other images).
- **AC3** — Given existing Layer A fixtures, When unit tests run, Then all still pass.

#### OMX-041 — Google Photos per-item Failed row + Retry (K1)
**Priority:** Must · **Pts:** 2 · **Status:** New · **Source:** Dev K1, closes OMX-003b AC5
**Story:** As a user importing from Google Photos, I want each photo that fails to download to show its own Retry so that I don't lose photos when the network flickers.

**Acceptance Criteria**
- **AC1** — Given a Google Photos download fails (network, 401/403, timeout), When the import continues, Then that photo appears in the queue as a Failed row with its thumbnail/name and "ลองใหม่ / Retry"; other items continue.
- **AC2** — Given I press Retry and the token has expired, When retrying, Then a new token is requested (silent or consent) and the download is retried once more.
- **AC3** — Given all failed items are retried successfully, When done, Then they are OCR-processed like other items and the summary count updates; screen readers hear the status change (`aria-live`).
- **AC4** — Given the stub Google wrapper, When e2e tests run, Then failure → Retry → success is covered.

#### OMX-042 — Real-slip accuracy measurement (Layer C + UAT)
**Priority:** Must · **Pts:** 3 · **Status:** New · **Source:** QA risk R1, UAT exit #3
**Story:** As the PO, I want accuracy measured on real, redacted slips so that we know whether the app meets the MVP metrics outside synthetic data.

**Acceptance Criteria**
- **AC1** — Given ≥ 11 redacted real slips (≥ 2 each of K PLUS, SCB EASY, Krungthai NEXT, PromptPay + 3 salary formats) stored privately (never committed), When QA runs the benchmark locally, Then a report lists type/amount/date/category accuracy per bank/format without any personal data.
- **AC2** — Given the report, When compared with the MVP metrics (amount ≥ 80%, type ≥ 90%, category ≥ 60%), Then gaps are logged as FB items with proposed rule/fixture changes.
- **AC3** — Given each failure, When analysed, Then its OCR text, with personal data replaced by fake values, is added as a Layer A fixture.
- **AC4** — Given UAT participants process their own slips on their own devices, When UAT ends, Then their correction rate (fields edited on Review) is collected anonymously by the participant reporting counts (no data leaves the device).

#### OMX-043 — Real-device & assistive-tech verification (Tier 1)
**Priority:** Must · **Pts:** 3 · **Status:** New · **Source:** QA condition C5, 12 Blocked TCs
**Story:** As a mobile user, I want the app verified on real phones and screen readers so that it works where I actually use it.

**Acceptance Criteria**
- **AC1** — Given the Pages build, When QA runs journeys 1–7 on a mid-range Android (Chrome) and an iPhone (Safari, latest and latest-1), Then all Must TCs pass, including native picker/camera (OMX-001 AC7), safe-area and Google Photos popup/tab behaviour.
- **AC2** — Given NVDA + Chrome, VoiceOver + iOS Safari, and a TalkBack smoke, When the main flows are run, Then there is no a11y blocker (OMX-027 AC3).
- **AC3** — Given a CSV export, When opened in Excel (Win/Mac) and Google Sheets, Then Thai text displays correctly (OMX-023 AC5).
- **AC4** — Given the results, When recorded in `docs/qa/test-cases.md`, Then the 12 previously Blocked TCs are Pass/Fail (none Blocked unless B2 is still open).

#### OMX-044 — Transaction list virtualization (large months)
**Priority:** Should · **Pts:** 3 · **Status:** New · **Source:** Dev K4, OMX-014 AC6 / OMX-029 AC5
**Story:** As a heavy user, I want long transaction lists to stay smooth so that the app doesn't lag with many entries.

**Acceptance Criteria**
- **AC1** — Given a month with > 200 transactions, When the list renders, Then only visible rows (+ overscan) are mounted and sticky date headers still work.
- **AC2** — Given 1,000 seeded transactions, When opening Transactions on the reference devices, Then first render ≤ 1 s and no long task > 200 ms while scrolling.
- **AC3** — Given keyboard and screen-reader use, When navigating the virtualized list, Then focus order, row count announcements and find-in-page behaviour stay acceptable (documented trade-offs).
- **AC4** — Given virtualization, When measured, Then the initial JS budget (≤ 300 KB gz) still holds.

#### OMX-045 — Salary slip date rule when the pay-period end is in the future (O2)
**Priority:** Could · **Pts:** 1 · **Status:** Ready — **PO decision (Sprint 2 grooming): option A** (date = today ถ้าวันนี้อยู่ใน pay period; ไม่ยกเว้น R3 future-date rule) · **Source:** QA O2
**Story:** As a salaried user, I want a salary slip without a pay date to be dated sensibly so that it lands in the right month.

**Acceptance Criteria (draft, depends on the decision)**
- **AC1** — Given a salary slip with no pay date whose period is the current month (period end in the future), When extracted, Then the date = today if today is within the pay period *(option A)* or the period end *(option B, allows a future date for salary only)*. The PO picks one at grooming.
- **AC2** — Given the chosen rule, When Review opens, Then a hint explains how the date was chosen.

#### OMX-046 — Search placeholder fits at 320px (O5)
**Priority:** Could · **Pts:** 1 · **Status:** New · **Source:** QA O5
**Story:** As a user on a very small screen, I want the search hint to be fully readable so that I know what I can search.
- **AC1** — Given 320px width, TH and EN, When Transactions renders, Then the search placeholder is not truncated (shorter copy or responsive placeholder approved by the Designer); the 375px behaviour is unchanged.

#### OMX-047 — Manual light/dark theme switch
**Priority:** Could · **Pts:** 2 · **Status:** New — deferred to Sprint 3 (v5, Designer: auto theme ใช้ได้แล้ว ไม่ช่วย Sprint Goal) · **Source:** Designer retro (dark mode ships automatic only)
**Story:** As a user, I want to choose light, dark or system theme so that the app suits my preference regardless of device setting.
- **AC1** — Given Settings → Theme (ระบบ/System · สว่าง/Light · มืด/Dark), When I choose an option, Then `<html data-theme>` updates immediately and the choice persists in `settings`.
- **AC2** — Given either theme, When checked, Then contrast stays at WCAG AA (existing token tables) and axe reports 0 critical/serious.

#### OMX-048 — Post-deploy verification on GitHub Pages (DoD closure)
**Priority:** Must · **Pts:** 2 · **Status:** New · **Source:** Sprint 1 Review (QA condition C1). Depends on OMX-028
**Story:** As the PO, I want every accepted story verified on the deployed Pages build so that Sprint 1 work becomes formally Done.

**Acceptance Criteria**
- **AC1** — Given the first successful deploy, When QA runs the e2e suite with `E2E_BASE_URL=https://jaijimjim.github.io/omnitrix-project/`, Then all non-Google journeys pass.
- **AC2** — Given the Pages URL, When Lighthouse mobile runs (median of 3), Then a11y ≥ 90 and LCP is recorded (OMX-029 AC1).
- **AC3** — Given a HAR capture of upload → OCR → save on Pages, When reviewed, Then no request leaves the allowlist (OMX-030), and Tesseract assets load from our origin and are cached on the second visit.
- **AC4** — Given AC1–AC3 pass, When the PO reviews, Then all stories in status "Accepted (pending deploy)" move to **Done** and the build is tagged `v0.1.0-uat`.

### New items from real-slip feedback (v4 → groomed v5)

> ที่มา: **FB-011** — ผู้ใช้ทดสอบสลิปจริงของตัวเอง 3 ใบ (14 พ.ย. 69): ยอด/วันที่/เวลา/ประเภท 3/3 · หมวดหมู่ 1/3 · ผู้รับ 0/3 (QA: TC-163 Fail interim n = 3) · ผู้ใช้เลือก **ไม่ทำ hotfix** → Sprint 2 · groomed 2026-11-23 (`sprints/sprint-2/01-grooming-minutes.md`)
>
> **Privacy rule (ใช้กับ OMX-049, 050a, 050b, 051):** **ห้าม commit รูปสลิปจริง** (repo ปัจจุบันเป็น **private** แต่กฎนี้ใช้เสมอ ไม่ว่า repo จะ private หรือ public — และอาจต้องเปลี่ยนเป็น public เพื่อเปิด Pages, UQ2) และห้าม commit OCR text ที่ยังมีข้อมูลส่วนตัว. Fixture = **OCR text ที่ปิดข้อมูลแล้วเท่านั้น** ตาม redaction guideline ของ QA (`grooming/sprint-2-qa.md` §2): ชื่อบุคคล → ชื่อสมมติความยาวใกล้เคียง คงคำนำหน้า, เลขบัญชี → **คง pattern masked** (`XXX-X-X0000-X`) เปลี่ยนตัวเลข, Ref/Biller ID/QR payload → ค่าปลอมความยาวเท่าเดิม, ชื่อร้าน → คง keyword ที่ตัดสิน category ("ไก่ย่าง", "FOOD", "ลาชาดาเพย") แต่เปลี่ยนส่วนที่ระบุตัวร้าน, **คง OCR noise เดิมทุกตัว**. QA ตรวจ redaction ก่อน merge; สงสัยว่าปิดไม่หมด → ไม่ commit (R7, OMX-042 AC3). fixture id `real-redacted-*`
>
> **OCR noise ที่พบในสลิปจริง (ต้องอยู่ใน fixture):** "พ.ย." → "พ.ุย." (date parser รองรับแล้วจาก BUG-001 — ใช้เป็น regression guard) · "ชำระเงิน" → "ชําระเจิน" (ทำให้ type ตกไป rule weak → confidence Medium) · ตัวอักษรขยะจากรูปการ์ตูน/QR code · ลูกศร "↓" หายหรือเป็นขยะ (`V`, `J`, `|`, `+`)
>
> **Fixture source (UQ1):** (A) ผู้ใช้คัดลอก OCR text จากหน้า Review (raw text, OMX-012b) แล้วปิดข้อมูลเองก่อนส่ง หรือ (B) fallback ถ้าไม่ได้ภายใน **Sprint 2 Day 2**: QA สร้าง synthetic จากคำบรรยาย FB-011 + seed S1–S4 จาก spike ของ Dev (ความมั่นใจต่ำกว่า). Dev เริ่มจาก seed ได้ แล้วสลับเป็น fixture จริงเมื่อมา
>
> **Joint dependency (spike Dev S2/S4):** สลิป "จ่ายบิล" + ไก่ย่าง แก้ได้ก็ต่อเมื่อมีทั้ง **OMX-049 และ OMX-050a** → ทั้งสอง (และ 050b) commit เป็นชุดเดียว ห้ามตัดตัวใดตัวหนึ่งออกตอน scope cut · ลำดับทำ **051 → 049 → 050a → 050b** (051 ขนานได้ตั้งแต่ Day 1)

#### OMX-052 — Rename app to Spendy Money *(new v6, FB-013)*

**Priority:** Must · **Pts:** 1 · **Status:** Accepted (pending deploy) · **Sprint:** S2 (chore, ทำก่อน Planning ตามคำขอผู้ใช้)

- **AC1** — Given the production build, When opened, Then `<title>`, meta description, sidebar brand และ copy deck TH/EN แสดง "Spendy Money"
- **AC2** — Given an export, Then filenames are `spendy-money-*.json|csv` and backup `app` = `spendy-money`
- **AC3 (backward compatible)** — Given a backup made before the rename (`app: "omnitrix-money"`), When imported, Then it imports normally; other `app` ids are still rejected (`errorSchema`)
- **AC4** — Storage key `omx.v1`, CSS token prefix `--omx-*` และ test hook `__OMX_TEST__` คงเดิม (internal, เปลี่ยนแล้วข้อมูลผู้ใช้หาย)
- **AC5** — Build/preview/e2e default base = `/spendy-project/`; deploy ใช้ `/<repo-name>/`

#### OMX-051 — Payee measurement in fixtures & benchmark (enabler) *(new v5, from grooming)*
**Priority:** Must (enabler ของ 049) · **Pts:** 2 · **Status:** Ready · **Sprint:** S2 candidate · **Owner:** QA (Dev pairs) · **Source:** Dev benchmark gap + QA estimate (grooming 2026-11-23)
**Story:** As the team, we want payee to be measured in Layer A and Layer B so that a payee fix (OMX-049) and any regression can be proven with numbers instead of eyeballing.

**Acceptance Criteria**
- **AC1 (Layer A schema)** — Given `QaFixture.expected`, When extended with optional `payee?: string`, Then `qaGolden.test.ts` compares it after `normalizePayee()` and existing fixtures without `payee` still pass unchanged.
- **AC2 (Layer B expected)** — Given `tests/fixtures/slips/expected.json`, When `payee` is added for all 27 synthetic slips (fake names), Then the real-OCR benchmark reports payee exact-match % and CER in `benchmark-results.json` — **report only, no gate** (OMX-009 AC6).
- **AC3 (baseline)** — Given the current `main` (before OMX-049), When the benchmark runs, Then the payee baseline is recorded in `docs/qa/test-summary-report.md` and used by OMX-049 AC7.
- **AC4 (no regression)** — Given the change, When CI runs, Then type/amount/date/category results on Layer A and the 27 Layer B slips are identical to before (test-infra change only).

#### OMX-049 — Recipient extraction for KBank / K PLUS arrow (↓) layout (BUG-009)
**Priority:** Must · **Severity:** High · **Pts:** **3** *(planning poker round 2 — ดู minutes §3.1)* · **Status:** New — DoR ✗ (fixtures UQ1) · **Sprint:** S2 candidate · **Source:** FB-011 / BUG-009
**Depends on:** OMX-051 (AC7) · fixtures (UQ1 A/B) · extends OMX-009 AC1 · feeds OMX-010 / OMX-050a (`payee`, `payeeExtra`) · joint acceptance with 050a/050b on real slips
**Story:** As a K PLUS / KBank user, I want the app to read who I paid even when the slip shows the recipient under an arrow without a "ไปยัง/To" label, so that I can recognise each transaction later and the category is based on the right payee.

**Layout ที่พบ (make by KBank / K PLUS):** ชื่อผู้โอน → ธนาคาร/เลขบัญชีผู้โอนแบบ masked `XXX-X-X####-X` → ลูกศร "↓" (อาจหาย/เป็นขยะ) → **ชื่อผู้รับ / ร้าน** → (biller name บรรทัดสอง) → เลขบัญชีผู้รับ / PromptPay / Biller ID. ไม่มีป้าย "ไปยัง / ถึง / To"
**Scope decision (grooming):** fallback ใช้กับ **ทุกธนาคาร** ที่มี masked-account anchor แต่ **เฉพาะ type = expense** (ไม่ใช้กับสลิปรับเงิน/เงินเดือน — Dev R2); ถ้า Layer A ธนาคารอื่นพัง → จำกัดเฉพาะ K PLUS/KBank

**Acceptance Criteria**
- **AC1 (arrow layout)** — Given a redacted OCR fixture of a KBank/K PLUS expense slip with no recipient label, When extracted, Then payee = the first *name-like* line after the sender's masked account line and before the next account/ID line, equal to the expected redacted name after normalization (R4), and `payeeSource = 'arrow'`.
- **AC2 (noise tolerance)** — Given the arrow line is missing or OCR'd as junk (`↓`, `V`, `J`, `|`, `+`, a line of ≤ 2 non-name characters, cartoon/QR garbage), When extracted, Then up to 3 junk lines are skipped and AC1 still holds; Given the masked account is OCR'd with `x`/`X`/`×`/`*`, spaces around the dash or `–`/`—`, Then the anchor still matches.
- **AC3 (bill / merchant)** — Given a "จ่ายบิลสำเร็จ" or "ชำระเงินสำเร็จ" slip in the same layout, When extracted, Then payee = the merchant line (e.g. redacted "ร้านไก่ย่าง…", "บลูเพย-ลาชาดาเพย") shown **as OCR'd, not normalized** (Designer Q3); a second biller-name line (e.g. "… FOOD") is kept as `payeeExtra` for the categorizer and is not appended to the displayed payee; the Biller ID / reference line is never the payee.
- **AC4 (no sender confusion / no guess)** — Given the slip, When extracted, Then the sender's name is never returned as payee (sender-equality guard); Given no label and no anchor, or a received/salary slip, Then payee stays empty — same as Sprint 1.
- **AC5 (labeled layout unchanged)** — Given slips with a "ไปยัง / ถึง / To" label, When extracted, Then the label rule runs first and wins; all existing Layer A fixtures pass unchanged; Layer B b01, b08, b12, d15 keep category `transfer` and b08 keeps its type.
- **AC6 (payee empty state — Designer D1)** *(v5)* — Given an expense slip (not salary/income) where no payee was found, When Review renders, Then the payee field shows the info helper `review.noPayee` ("ไม่พบชื่อผู้รับในสลิป — แตะเพื่อกรอก" / "No recipient found on the slip — tap to add") with an `Info` icon and the `form.payeePlaceholder` placeholder, linked via `aria-describedby`; the helper disappears once the user types; the collapsed card shows the payee line, or "ไม่ระบุผู้รับ / No payee" (`transactions.noPayee`, muted) when empty; payee stays **optional** (no Save block) and the overall confidence badge is **not** lowered; TH/EN keys come from `design/copy-deck.json`.
- **AC7 (measured, no regression)** — Given OMX-051, When the benchmark runs on the original 27 Layer B slips, Then type 100%, amount ≥ 96.3% (26/27, b16 = BUG-007), category 100%, date 100%, and payee exact-match % / CER is not worse than the OMX-051 baseline; Layer B gains 2 arrow-layout templates (1 base + 1 degraded, fake bank/name) whose payee is correct.
- **AC8 (real slips — Layer C)** — Given the 3 real slips from FB-011, When the user re-tests on their own device with the Sprint 2 build, Then payee is correct for **3/3 (target)**; **≥ 2/3 is the acceptance minimum**; a shortfall is decided by the PO (UAT exit #3) and does not auto-block merge. Only counts are reported — no images/text leave the device.
- **AC9 (privacy)** — Given the PR, When reviewed, Then `git diff --stat` contains no real slip image (no `.png/.jpg/.heic` outside generated `tests/fixtures/slips/images`), fixtures are redacted text only (QA checklist) and gitleaks passes.

#### OMX-050a — Category precedence: merchant/biller outranks transaction-type phrase + Thai food keywords (BUG-010 part a) *(split v5)*
**Priority:** Must · **Severity:** High · **Pts:** **3** · **Status:** New — DoR ✗ (fixtures UQ1) · **Sprint:** S2 candidate · **Source:** FB-011 / BUG-010
**Depends on:** OMX-049 (joint — สลิปไก่ย่างต้องการทั้งคู่; `payeeExtra`) · fixtures (UQ1) · changes OMX-010 AC2 and §4 rule *(v5 confirmed)*
**Story:** As a user who pays restaurants through bill-payment flows, I want the category to follow the shop or biller rather than the words "จ่ายบิล/ชำระเงิน", so that my food spending is not counted as Bills.

**Acceptance Criteria**
- **AC1 (merchant over phrase)** — Given a redacted "จ่ายบิลสำเร็จ" fixture whose merchant name contains "ไก่ย่าง" and biller line ends with "FOOD", When categorised, Then category = `food` (not `bills`) both with payee from OMX-049 **and** with payee empty (match from text).
- **AC2 (weak tier)** — Given the rules file, When transaction-type phrases ("จ่ายบิล", "ชำระบิล", "ชำระเงิน", "โอนเงิน", "Bill Payment", "Payment") are matched, Then they live in a separate weak tier (`TX_PHRASES`) in `categories.rules.ts` and are used only when **no** strong merchant/biller/brand keyword matches anywhere; precedence = payee → payeeExtra → memo → person → text (strong) → weak tier → `other`. "จ่ายบิล" is removed from `bills.keywords`.
- **AC3 (real bills unchanged)** — Given "จ่ายบิล" + a utility biller (การไฟฟ้า/MEA/PEA/การประปา/AIS/TrueMove …), Then `bills` with High confidence; Given "จ่ายบิล" alone, Then `bills` with **Medium** confidence (R5). Existing tests that asserted High for "จ่ายบิล"-only are updated as an **expected change** (agreed by QA).
- **AC4 (Thai food keywords)** — Given new `food` keywords agreed in grooming (`ไก่ย่าง`, `ไก่ทอด`, `หมูปิ้ง`, `ข้าวมันไก่`, `ข้าวขาหมู`, `ก๋วยจั๊บ`, `ราดหน้า`, `ผัดไทย`, `ร้านข้าว`, `ShopeeFood`; **not** "ครัว"), When categorised, Then each maps to `food` with a table-driven test, and the BUG-006 guards ("นาขวัญ ฟาร์มสุข", "สวนนายเฒ่า") still pass.
- **AC5 (type unchanged)** — Given `type.ts`, When the rules change, Then type detection (OMX-006) results are identical on Layer A/B.
- **AC6 (category Medium highlight + a11y — Designer D2)** *(v5)* — Given a category with `confidence === 'medium'` and `field === 'text'`, When Review renders, Then the category field shows the existing §6.3 highlight (border + icon + `review.checkField`) and the card counts as "needs review" for auto-expand; `CategoryPicker` accepts `warning` and links it with `aria-describedby` (like AmountInput/DateInput) for both Low and Medium, so screen readers read it on focus (WCAG 1.3.1/3.3.1); no new copy.
- **AC7 (no regression)** — Given Layer A, Then category 100% (all existing + new fixtures); Given the original 27 Layer B slips, Then category 100% and type/amount/date unchanged (100% / ≥ 96.3% / 100%), incl. b05, b06, b16 (bills), b09 (housing), b17 (shopping), b18 (entertainment); Layer B gains 1 restaurant bill template (biller "…FOOD", fake names).
- **AC8 (real slips)** — Together with 049/050b: the 3 FB-011 slips re-tested by the user → category **3/3 target, ≥ 2/3 minimum** (counts only).
- **AC9 (privacy)** — Same as OMX-049 AC9.

#### OMX-050b — Fuzzy keywords for Lazada / Shopee tolerant to Thai OCR noise (BUG-010 part b) *(split v5)*
**Priority:** Must · **Severity:** High · **Pts:** **2** · **Status:** New — DoR ✗ (variant + negative list, QA Day 1) · **Sprint:** S2 candidate · **Source:** FB-011 / BUG-010
**Depends on:** OMX-050a (same rules file, merge after) · reusable later by OMX-039 (`fold()`)
**Story:** As a user who pays through Lazada/Shopee wallets, I want those payments recognised as Shopping even when OCR garbles the Thai name, so that they don't fall into Other.

**Approach agreed:** confusable-char **folding** (Dev option A) inside the keyword matcher only — **not** in `normalizeText()` (stored payee/memo/rawText stay as OCR'd). Fold table round 1: drop tone marks `่ ้ ๊ ๋`, `์`, `็`, `ๆ`; `ซ↔ช`, `บ↔ป`, `ผ↔พ`, `ฝ↔ฟ`, `ง↔จ`; Latin `0↔O`, `1↔l↔I`, `rn↔m`; **no `ด↔ต`** in round 1. Edit distance = not in Sprint 2.

**Acceptance Criteria**
- **AC1 (fuzzy Lazada)** — Given OCR text containing "Lazada", "LAZADA", "ลาซาด้า", "ลาซาดา", "ลาชาดา", "LazPay", "ลาซาด้าเพย์", "บลูเพย์-ลาซาด้าเพย์" or the noisy **"บลูเพย-ลาชาดาเพย"**, When categorised, Then category = `shopping`.
- **AC2 (fuzzy Shopee)** — Given "Shopee", "SHOPEE", "ช้อปปี้", "ShopeePay", "Shopee Pay", "ช้อปปี้เพย์" and their fold variants, When categorised, Then `shopping`; Given "ShopeeFood"/"GrabFood"/"LINE MAN", Then `food` still wins (longest match, §4).
- **AC3 (bounded)** — Given fuzzy applies only to keywords flagged `fuzzy: true` in `categories.rules.ts` (R6) whose folded length ≥ 5, When run on ≥ 20 negative fixtures (8 fake person names, 8 other merchants, 4 Thai words close to "ลาซาดา/ช้อปปี้" after folding) plus the text of the 27 Layer B slips, Then **0 false positives**.
- **AC4 (type confidence)** — Given "ชําระเจินสำเร็จ", When type is detected, Then fuzzy matching of `TRANSFER_STRONG` restores type = expense with **High** confidence.
- **AC5 (OCR noise invariance)** — Given fixtures with "พ.ุย.", "ชําระเจิน" and cartoon/QR garbage, When parsed, Then type/amount/date/category equal the clean-text version.
- **AC6 (no regression, perf)** — Layer A 100% · original 27 Layer B unchanged (as 050a AC7) · Layer B gains 1 marketplace e-wallet template (fake names) · parse time not measurably changed.
- **AC7 (real slips / privacy)** — As 050a AC8 / OMX-049 AC9.

#### Won't (this release)

| ID | Title | Story (summary) | Notes |
|---|---|---|---|
| OMX-032 | Cloud sync & login | As a user, I want to log in and sync across devices so that I don't lose data. | ต้องมี backend/auth → เปลี่ยน architecture constraint |
| OMX-033 | Budgets & overspend alerts | As a user, I want monthly budgets per category with alerts so that I control spending. | ต่อยอดจาก E5 |
| OMX-034 | PDF payslip import | As a salaried user, I want to import PDF payslips so that I don't need screenshots. | pdf.js render → OCR / text layer |
| OMX-035 | Learn custom category rules | As a user, I want the app to remember my category corrections per payee. | ต่อยอด OMX-039 · *(v5)* = Designer D4 — คง Won't ใน Sprint 2; พิจารณา revive เป็น Sprint 3 candidate หลังผล OMX-049/042 |
| OMX-036 | Recurring transactions | As a user, I want recurring items (rent, subscriptions) added automatically. | |
| OMX-037 | Installable PWA / offline mode | As a mobile user, I want to install the app and use it offline. | ได้ประโยชน์จาก self-hosted Tesseract assets |
| OMX-038 | HEIC/HEIF image support | As an iPhone user, I want to upload HEIC photos directly. | ต้องมี decoder ใน browser (ขนาดใหญ่) |

**Parked ideas (from grooming, not yet stories):** *(v5)* **D3 quick chip หมวดอันดับ 2 บน Review** (Designer, Sprint 2 grooming — ประเมินใหม่หลังผล OMX-042; ทำคู่กับ amount chips), *(v5)* hint "จัดหมวดจาก…" (explainability — ทำคู่กับ OMX-035 ถ้า revive), *(v5)* search ที่ค้นชื่อหมวดด้วย (Designer Q3), *(v5)* tech debt: อัปเกรด GitHub Actions ที่รันบน Node 20 → major ที่รองรับ Node 24 (Dev, PR แยกหลัง deploy แรกเขียว), amount alternative chips on Review (Designer), "บันทึกและเพิ่มอีก / Save & add another" (Designer), backup nudge after 20 new transactions (Designer), dark mode, staging path separate from production (QA Q10), multi-currency, multiple wallets, receipt line-item parsing, LLM/ML classification, shared household ledger.

---

## 8. Resolved Questions (Sprint 1 Grooming)

| # | Question | Decision |
|---|---|---|
| OQ1 | ใครจัดหาสลิปตัวอย่าง | **QA เป็นเจ้าของ** fixtures: synthetic slip images ≥ 5 ต่อธนาคาร/รูปแบบ (commit ใน repo) + golden OCR-text; ทีมบริจาคสลิปจริงที่ปิดข้อมูล ≥ 2/คน และ PO ขอสลิปเงินเดือนจากลูกค้า → calibration set (private, ไม่ commit) |
| OQ2 | Tesseract language data host | **Self-host same origin** — copy จาก npm packages ที่ pin version ตอน build (ไม่ commit binary, ไม่ใช้ CDN) |
| OQ3 | สลิป "ได้รับเงินโอน" | **Keyword rules (OMX-006 AC2) + ผู้ใช้สลับ type บน Review (OMX-012a AC3)**; การ match ชื่อ/บัญชีเจ้าของ = OMX-039 (Could) |
| OQ4 | Chart library | **Hand-rolled SVG**; category = **horizontal bar**, trend = grouped bar |
| — | Money / date representation | Integer satang; `YYYY-MM-DD` ใน Asia/Bangkok (R1, R2) |

---

## 9. Sprint 2 Candidate List (groomed 2026-11-23 — to be confirmed at Sprint 2 Planning)

**Proposed Sprint 2 Goal (v5, unchanged from v4):** ทำให้ MVP_0001 **ใช้งานได้จริงบน GitHub Pages** (ปิด DoD ของงาน 92 pts จาก Sprint 1) และ **อ่านสลิปจริงของ KBank/K PLUS ได้ถูกต้อง** — ผู้รับและหมวดหมู่ถูก 3/3 (ขั้นต่ำ 2/3) บนสลิปของผู้ใช้ (BUG-009/010) พร้อมวัดความแม่นยำบนสลิปจริงและเริ่ม UAT เพื่อปล่อย `v0.1.0`
*(v3 goal เดิม: get MVP_0001 live on GitHub Pages, verify it on real devices and real slips, connect Google Photos for real, and complete UAT with the customer, so that `v0.1.0` can be released.)*

Planning basis (retro AI-3): commit at **measured velocity (~40 pts) minus a UAT/hotfix buffer (~10 pts)** → **commit ≈ 30 pts**. AI-assisted throughput is tracked separately and not used as the baseline.
Status ณ grooming: QA re-run Pass 120 / Fail 2 / Blocked 9 / Not run 1 · **NOT READY for UAT** (B3, BUG-009/010 High open, B2) — `docs/qa/test-summary-report.md` §7

| Rank | ID | Title | Priority | Pts (final, remaining) | Depends on | DoR | Note |
|---|---|---|---|---|---|---|---|
| 1 | OMX-028 | Deploy via GitHub Actions *(carry-over)* | Must | 1 | **B3** (UQ2) | ✗ B3 | Workflow ไม่ต้องแก้; error-message step เป็น task |
| 2 | OMX-048 | Post-deploy verification on Pages (DoD closure) | Must | 2 | 028 | ✗ (028) | 92 pts → Done, tag `v0.1.0-uat` |
| 3 | **OMX-051** *(v5)* | Payee measurement in fixtures & benchmark (enabler) | Must | 2 | — | ✓ | QA owner, เริ่ม Day 1 ขนานได้ |
| 4 | **OMX-049** | Recipient under ↓ on KBank/K PLUS + payee empty state D1 (BUG-009) | Must (High) | 3 | 051, UQ1 | ✗ fixtures | Joint bundle กับ 050a/050b |
| 5 | **OMX-050a** *(v5 split)* | Precedence merchant/biller > phrase + Thai food keywords + D2 (BUG-010a) | Must (High) | 3 | 049 (joint), UQ1 | ✗ fixtures | |
| 6 | **OMX-050b** *(v5 split)* | Fuzzy Lazada/Shopee (BUG-010b) | Must (High) | 2 | 050a | ✗ lists (QA Day 1) | |
| 7 | OMX-042 | Real-slip accuracy measurement | Must | 3 | UQ4 slips | ✗ slips | 3 สลิป FB-011 = Layer C ชุดแรก |
| 8 | OMX-043 | Real-device & assistive-tech verification | Must | 3 | 028 | ✗ B3 | |
| 9 | OMX-003a / 003b | Google Photos real OAuth *(carry-over)* | Must | 2 | **B2** (UQ3) | ✗ B2 | ทดสอบบน localhost:4173 ได้ไม่ต้องรอ B3 |
| 10 | OMX-041 | Google Photos per-item Retry (K1) | Must | 2 | 003b (acceptance) | ✓ | Dev ทำกับ stub ได้ก่อน B2; Designer spec Day 1 |
| 11 | OMX-029 | Performance budget *(carry-over AC1, AC3, AC5)* | Should | 2 | 028 | ✗ B3 | local LCP 755 ms (interim) |
| 12 | OMX-040 | Thai-digit amounts (BUG-007) | Could | 2 | — | ✓ | |
| 13 | OMX-045 | Salary slip date rule (O2) — option A | Could | 1 | — | ✓ | |
| 14 | OMX-046 | Search placeholder at 320px | Could | 1 | — | ✓ | copy พร้อม (Designer) |
| — | OMX-044 | List virtualization | Should | 3 | 029 AC5 fail | conditional | ไม่นับใน commit |
| — | OMX-039 | Received transfers via owner name | Could | 3 | 049, 050b, Designer spec | ✗ | **Deferred → Sprint 3** |
| — | OMX-047 | Manual theme switch | Could | 2 | — | — | **Deferred → Sprint 3** |
| — | *UAT execution, feedback triage, hotfixes* | — | Buffer | ~10 | R5 freeze | — | Not a story. Capacity is reserved |

**Proposed commit (for Planning) = 29 pts:** Must 23 (ranks 1–10) + Should 2 (029) + Could 4 (040, 045, 046) · buffer ~10 · total ≈ 39 ≤ velocity ~40
**B3 risk:** ranks 1, 2, 8, 11 (= 8 pts) ทำไม่ได้จนกว่า Pages เปิด — ถ้า B3 ยังไม่ปิดภายใน Day 2 ให้ทำ 051/049/050a/050b/041/040 ก่อน และ PO ทบทวน Sprint Goal ร่วมกับทีม (charter §8)
**Cut order (if needed, last-in first-out):** 046 → 045 → 040 → 029 → 041. **ห้ามตัด** 049/050a/050b แยกกัน (joint dependency)
