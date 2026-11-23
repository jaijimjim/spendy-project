# Sprint 2 — Sprint Planning

> Date: 2026-11-23 (Day 1, จันทร์) · Timebox: 60 นาที · Facilitator: PO/PM · Attendees: PO/PM, Designer, Dev, QA
> Sprint: **Sprint 2** · 1 สัปดาห์ (compressed mode ตาม charter §5) · Day 1 = 23 พ.ย. → Day 5 = 27 พ.ย. 2569 (Review/Demo + Retro)
> Inputs: `01-product-backlog.md` v6 (§6, §7, §9), `00-grooming-agenda.md`, `01-grooming-minutes.md` (§4, §6–§10), `grooming/sprint-2-{design,dev,qa}.md`, `docs/qa/test-summary-report.md` §7, `sprints/sprint-1/05-retrospective.md` (AI-3)
> Output: Sprint Goal, Sprint Backlog (commit **26 pts**), stretch, task breakdown, risks · backlog → **v7** · `03-daily-standup.md` Day 1

## 0. สถานะก่อน Planning (สิ่งที่เปลี่ยนตั้งแต่ grooming)

| เรื่อง | สถานะ ณ 23 พ.ย. 2569 |
|---|---|
| **B3 (Pages)** | **ปิดแล้ว** — ผู้ใช้เปลี่ยน repo เป็น **public**, เปลี่ยนชื่อเป็น `spendy-project` และตั้ง Pages Source = GitHub Actions · run **`45208481550`** (commit `6ebe779`) ผ่านทุก job: CI ทั้งหมด (gitleaks, lint/typecheck/unit, build ×2, e2e) + Build for Pages + Deploy · **https://jaijimjim.github.io/spendy-project/** ขึ้นหน้า "Home · Spendy Money" |
| **UQ2** | ปิดแล้ว (= B3) |
| **OMX-052** rename (FB-013, 1 pt) | ทำเสร็จในโค้ดแล้ว และอยู่ใน build ที่ deploy · รอยืนยัน AC บน live ใน OMX-048 |
| **UQ1** (OCR text จริงแบบ redact) | **ยังไม่ได้คำตอบ** → ใช้สมมติฐาน A1 (§6) = synthetic OCR text |
| **UQ3** (Google Client ID / B2) | **ยังไม่ได้คำตอบ** → B2 ยังเปิด · 003a/003b/041 ไม่นับใน commitment |
| UQ4–UQ6 | ยังไม่ได้คำตอบ (ติดตามต่อ — ดู §6) |
| QA re-run บน live | QA กำลังรัน TC ที่เคยติด B3 บน live URL — ผลจะบันทึกใน `docs/qa/` และ Daily Day 2 |
| Sprint 1 | Accepted (pending deploy) = 92 pts · **Done = 0** จนกว่า OMX-048 ผ่าน → เป็นงาน Day 1 ของ QA + PO |

ผู้ใช้สั่ง "เริ่ม sprint ถัดไปได้" → PO เปิด Planning ตามกำหนด Day 1 โดยไม่รอ UQ1/UQ3 (grooming G11)

## 1. Sprint Goal

> **Spendy Money ขึ้น live บน GitHub Pages แล้ว — ยืนยันบน live ให้งาน Sprint 1 ทั้ง 92 pts เป็น Done และ tag `v0.1.0-uat` ภายใน Day 2 จากนั้นแก้การอ่านสลิปจริงของ KBank/K PLUS ให้ได้ผู้รับและหมวดหมู่ถูกต้อง (BUG-009/010) แล้ว deploy ภายใน Day 3 เพื่อให้ผู้ใช้ re-test บนเครื่องตัวเอง พร้อมตรวจบนอุปกรณ์จริง วัดความแม่นยำบนสลิปจริง และผ่าน UAT entry criteria เพื่อเริ่ม UAT ของ `v0.1.0`**
>
> *EN:* Spendy Money is live on GitHub Pages. Verify it on the live URL so that all 92 Sprint 1 pts become Done and `v0.1.0-uat` is tagged by Day 2; then fix real KBank/K PLUS slip reading (payee + category, BUG-009/010) and deploy it by Day 3 for the user to re-test on their own device; verify on real devices, measure real-slip accuracy and meet the UAT entry criteria for `v0.1.0`.

**เปลี่ยนจากที่เสนอใน grooming:** goal เดิม "ทำให้ใช้งานได้จริงบน Pages" → ตอนนี้ **live แล้ว** จึงเปลี่ยนเป็น "ยืนยันบน live + ปิด DoD" และเพิ่ม milestone วัน (Day 2 = Done/tag, Day 3 = bundle parser บน live) · Google Photos จริง (B2) **ไม่อยู่ใน goal** จนกว่าผู้ใช้ตอบ UQ3

### Success measures

| # | Measure | Target | วัดโดย / เมื่อไร |
|---|---|---|---|
| S1 | OMX-048 ผ่าน: e2e non-Google บน live, Lighthouse mobile median-of-3 (a11y ≥ 90, LCP ≤ 2.5 s), HAR ไม่มี request นอก allowlist | ผ่านทั้งหมด → 92 pts (+ OMX-052) เป็น **Done**, tag `v0.1.0-uat` | QA + PO · Day 1–2 |
| S2 | สลิปจริง FB-011 (ผู้ใช้ re-test, รายงานเป็นตัวเลข) | payee + category **3/3 (target)**, **≥ 2/3 (ขั้นต่ำ)** | ผู้ใช้ (UQ5) · Day 4 |
| S3 | ไม่ถอยหลังบน synthetic | Layer A 100% · Layer B 27/27: type 100%, amount ≥ 96.3% (→ 100% ถ้า 040 ผ่าน), category 100%, date 100% · payee ≥ baseline ของ OMX-051 | QA benchmark · ทุก PR |
| S4 | OMX-042 report บนสลิปจริง | ≥ 11 ใบ หรือบันทึกเหตุผล + จำนวนที่ได้ (ขึ้นกับ UQ4) | QA · Day 4 |
| S5 | UAT entry | BUG-009/010 Closed, ไม่มี Critical/High ค้าง, 12 TC เดิมที่ Blocked ไม่เหลือ Blocked ยกเว้น B2 | QA + PO · Day 4–5 |

## 2. Capacity & Commitment Decision

| Item | Pts |
|---|---|
| Measured velocity (planning baseline, retro AI-3) | ~40 |
| Buffer: UAT execution, feedback triage, hotfix จากผล live (ไม่ใช่ story) | ~10 |
| **Commit line** | **≤ ~30** |
| **Committed** | **26** |
| Stretch (B2-dependent) | 4 → รวมสูงสุด 30 ถ้าผู้ใช้ยืนยัน UQ3 |
| AI-assisted throughput | ติดตามแยก ไม่ใช้เป็น baseline |

**ทำไม 26 ไม่ใช่ 29 ตามที่เสนอใน grooming:** commit ที่เสนอ 29 pts รวม OMX-003a/b (2) + OMX-041 (2) — ทั้งสองขึ้นกับ **B2** ซึ่งยังไม่ได้คำตอบ (UQ3) → ย้ายเป็น stretch (−4) · เพิ่ม **OMX-052** (+1, เสร็จในโค้ดแล้ว ทำใน Sprint 2 ตามคำขอผู้ใช้) → 29 − 4 + 1 = **26** · ช่องว่าง 4 pts ถึง commit line สงวนไว้ให้ stretch B2 หรือ hotfix จากผล QA บน live (ไม่ดึง Could/Sprint 3 เพิ่ม — OMX-039/047 ยังเลื่อนไป Sprint 3 ตาม grooming)

## 3. Sprint Backlog (Committed — 26 pts)

| Order | ID | Title | Priority | Pts | Owner (lead / support) | Depends on | DoR | Status เริ่ม sprint |
|---|---|---|---|---|---|---|---|---|
| 1 | **OMX-052** | Rename app → Spendy Money / repo `spendy-project` (FB-013) | Must | 1 | Dev / QA (verify) | — | ✓ | Accepted (pending deploy) → ยืนยันใน 048 |
| 2 | **OMX-028** | Deploy to GitHub Pages via GitHub Actions *(carry-over)* | Must | 1 | Dev / QA | ~~B3~~ ปิดแล้ว | ✓ | **In QA** — deploy run `45208481550` เขียว |
| 3 | **OMX-048** | Post-deploy verification on Pages (DoD closure) | Must | 2 | QA / PO (accept + ย้าย status) | 028 | ✓ | **In Progress** (Day 1) |
| 4 | **OMX-051** | Payee measurement in fixtures & benchmark (enabler) | Must | 2 | QA / Dev pairs | — | ✓ | **In Progress** (Day 1) |
| 5 | **OMX-049** 🔗 | Recipient under ↓ on KBank/K PLUS + payee empty state D1 (BUG-009) | Must (High) | 3 | Dev / QA (fixtures), Designer (D1) | **051**, fixtures (A1 synthetic), G1 | ✓ *(A1)* | Ready → In Progress Day 1 บ่าย (parser) |
| 6 | **OMX-050a** 🔗 | Precedence merchant/biller > phrase + Thai food keywords + D2 (BUG-010a) | Must (High) | 3 | Dev / QA, Designer (design QA D2) | 049 (joint), fixtures (A1) | ✓ *(A1)* | Ready |
| 7 | **OMX-050b** 🔗 | Fuzzy Lazada/Shopee (BUG-010b) | Must (High) | 2 | Dev / QA (variant + ≥ 20 negatives) | 050a (same rules file), G6 | ✓ *(A1, G6 Day 1)* | Ready |
| 8 | **OMX-043** | Real-device & assistive-tech verification (Tier 1) | Must | 3 | QA / Designer (SR review Review card) | 028; Review card หลัง bundle deploy | ✓ (B3 ปิด) | Ready |
| 9 | **OMX-042** | Real-slip accuracy measurement (Layer C + UAT) | Must | 3 | QA / Dev (local-only script), PO (UQ4) | slips (UQ4), bundle deploy | ◐ conditional (UQ4) | Ready (conditional) |
| 10 | **OMX-029** | Performance budget *(carry-over AC1, AC3, AC5)* | Should | 2 | QA / Dev | 028 | ✓ (B3 ปิด) | Ready |
| 11 | **OMX-040** | Thai-digit amounts (BUG-007) | Could | 2 | Dev / QA | — | ✓ | Ready |
| 12 | **OMX-045** | Salary slip date rule (O2) — option A | Could | 1 | Dev / Designer (hint copy) | — | ✓ | Ready |
| 13 | **OMX-046** | Search placeholder at 320px | Could | 1 | Dev / Designer | G3 copy key | ✓ | Ready |
| | | | | **26** | | | | |

🔗 = **bundle เดียว (049 + 050a + 050b = 8 pts)** — commit พร้อมกัน, ห้ามตัดตัวใดตัวหนึ่งตอน scope cut, real-slip acceptance (Layer C, AC8) วัดรวมกัน · Layer A AC ของ 050a ต้องผ่านแม้ payee ว่าง (test แยกได้)

**Breakdown:** Must **20** (052 1 + 028 1 + 048 2 + 051 2 + bundle 8 + 043 3 + 042 3) · Should **2** (029) · Could **4** (040, 045, 046) → 20 + 2 + 4 = **26**

> นับ OMX-052 และ OMX-028/048 เป็น velocity ของ Sprint 2 เมื่อ Done · 92 pts ของ Sprint 1 ที่ย้ายเป็น Done ผ่าน OMX-048 **นับเป็นผลของ Sprint 1** (ไม่บวกใน velocity Sprint 2)

### 3.1 Dependency & ลำดับงาน

```
OMX-028 (In QA) ──► OMX-048 (Day 1–2) ──► 92 pts + 052 → Done, tag v0.1.0-uat
                          │
                          ├──► OMX-029 (Lighthouse/LCP บน live, Day 2) ──► OMX-044 ถ้า AC5 fail (conditional)
                          └──► OMX-043 (device/SR, Day 2 รอบแรก → Day 4 รอบ Review card ใหม่)

OMX-051 (Day 1) ──► OMX-049 (Day 1 บ่าย–2) ──► OMX-050a (Day 2–3) ──► OMX-050b (Day 3)
   baseline payee      ▲ fixtures synthetic (QA G7, Day 1–2)          │
                       └ spec D1 (Designer G1, Day 1)                  ▼
                                                   bundle merge + deploy (Day 3 EOD)
                                                                       │
                                     ผู้ใช้ re-test 3 สลิป (UQ5, Day 4) ◄┘──► OMX-042 report (Day 4)

OMX-040 / 045 / 046 — อิสระ, Dev ทำแทรกเมื่อรอ review/QA (Day 3–4)
```

**กฎ:** 051 ต้องได้ baseline payee **ก่อน** merge 049 (049 AC7) · Dev เริ่มเขียน parser 049 จาก seed S1–S4 ได้ทันที (logic-only) แต่ UI ของ AC6 (D1) เริ่มหลัง Designer ส่ง G1 · 050b merge หลัง 050a (rules file เดียวกัน) · deploy bundle เป็นชุดเดียวเพื่อ Layer C re-test ครั้งเดียว

### 3.2 DoR — อัปเดตจาก grooming §7

| ID | #1 | #2 | #3 | #4 UI/copy | #5 ≤ 8 | #6 No blocking OQ / fixtures | #7 Env | **Ready?** | เปลี่ยนจาก grooming |
|---|---|---|---|---|---|---|---|---|---|
| OMX-052 | ✓ | ✓ | ✓ | ✓ | ✓ (1) | ✓ | ✓ | **✓** | ใหม่ (v6) |
| OMX-028 | ✓ | ✓ | ✓ | n/a | ✓ (1) | ✓ | ✓ **B3 ปิด** | **✓** | ✗ → ✓ |
| OMX-048 | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✓ | ✓ (live) | **✓** | ✗ → ✓ |
| OMX-051 | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✓ synthetic | ✓ | **✓** | — |
| OMX-049 | ✓ | ✓ | ✓ | ◐ G1 Day 1 (parser เริ่มได้ก่อน) | ✓ (3) | ✓ **synthetic (A1)** — QA G7 Day 1–2 จากคำบรรยาย FB-011 + seed S1–S4 | ✓ | **✓ (A1)** | ✗ → ✓ |
| OMX-050a | ✓ | ✓ | ✓ | ✓ (ไม่มี copy ใหม่) | ✓ (3) | ✓ **synthetic (A1)** — fixture "จ่ายบิล + ไก่ย่าง + …FOOD" (G6/G7) | ✓ | **✓ (A1)** | ✗ → ✓ |
| OMX-050b | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✓ **synthetic (A1)** — variant list + ≥ 20 negatives (G6 Day 1) เป็น synthetic อยู่แล้ว ไม่ขึ้นกับ UQ1 | ✓ | **✓ (A1)** | ✗ → ✓ |
| OMX-043 | ✓ | ✓ | ✓ | n/a | ✓ (3) | ✓ | ✓ B3 ปิด · device list ยืนยัน Day 1 | **✓** | ✗ → ✓ |
| OMX-042 | ✓ | ✓ | ✓ | n/a | ✓ (3) | ◐ slips ≥ 11 (UQ4) — เริ่มด้วย 3 สลิป FB-011 | ✓ | **◐ conditional** (DoR #7: owner PO + due Day 2 + แผนสำรอง §6 A4) | — |
| OMX-029 | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✓ | ✓ B3 ปิด | **✓** | ✗ → ✓ |
| OMX-040 | ✓ | ✓ | ✓ | n/a | ✓ (2) | ✓ | ✓ | **✓** | — |
| OMX-045 | ✓ | ✓ (option A) | ✓ | ✓ | ✓ (1) | ✓ | ✓ | **✓** | — |
| OMX-046 | ✓ | ✓ | ✓ | ✓ (G3) | ✓ (1) | ✓ | ✓ | **✓** | — |
| OMX-003a/b | ✓ | ✓ | ✓ | ✓ | ✓ (2) | ✓ | ✗ **B2 (UQ3)** | **✗** → stretch | — |
| OMX-041 | ✓ | ✓ | ✓ | ◐ G2 Day 1 | ✓ (2) | ✓ (stub) | ✓ stub / ✗ acceptance (B2) | **✗** → stretch | — |

**(A1)** = Ready ภายใต้สมมติฐาน UQ1 = synthetic (§6) · ถ้าผู้ใช้ส่ง redacted OCR text มา ไม่ต้อง re-plan แต่ต้องทำ re-check ตาม §6.2

## 4. Stretch & Not in Sprint

### 4.1 Stretch (ดึงตามลำดับ เฉพาะเมื่อเงื่อนไขครบ)

| # | ID | Pts | เงื่อนไขดึงเข้า | หมายเหตุ |
|---|---|---|---|---|
| 1 | OMX-003a/003b | 2 | ผู้ใช้ยืนยัน UQ3 (repo variable `VITE_GOOGLE_CLIENT_ID` + Photos Picker API + test users) ไม่เกิน **Day 3** | ทดสอบบน `localhost:4173` และ live ได้ทันที · ดึงเข้าแล้วต้อง re-deploy เพื่อ inject ตัวแปร |
| 2 | OMX-041 | 2 | ดึงพร้อม/หลัง 003b | Dev ทำ e2e กับ stub wrapper ("fail N ครั้งแล้วสำเร็จ") ได้ก่อนถ้ามีเวลาว่าง แต่ acceptance ต้องใช้ B2 · Designer ส่ง state table G2 Day 1 ไว้ก่อน |
| — | OMX-044 | 3 | **Conditional** — เฉพาะเมื่อ OMX-029 AC5 fail บน live/อุปกรณ์ | ไม่นับใน commit และไม่นับเป็น stretch ปกติ; ถ้าเกิดให้ใช้ buffer |

ถ้าผู้ใช้ตอบ UQ3 ว่ายอมรับ UAT แบบ "Not configured" → PO บันทึกการตัดสินใจ (retro AI-6) ใน daily + feedback-log, 003a/b/041 → Sprint 3 candidate, TC-015/016/017 คง Blocked (B2) พร้อมเหตุผล

### 4.2 Not taken into Sprint 2

| ID | เหตุผล |
|---|---|
| OMX-039 Received transfers via owner name (3) | Deferred → Sprint 3 (grooming) — ต้องใช้ 049 + `fold()` จาก 050b และ Designer spec (M) |
| OMX-047 Manual theme switch (2) | Deferred → Sprint 3 — auto theme ใช้ได้แล้ว ไม่ช่วย goal |
| OMX-035 / D4 จดจำ merchant → category | Won't ใน Sprint 2 · พิจารณา revive หลังผล 049/042 |
| D3 quick chip หมวดอันดับ 2, hint "จัดหมวดจาก…" | Parked ideas |
| Tech debt: GitHub Actions Node 20 → 24 | Parked — PR แยกหลัง deploy แรกเขียว (ตอนนี้เขียวแล้ว → candidate Sprint 3 หรือใช้ buffer ถ้ามี warning กระทบ) |
| O6 zod eval probe vs CSP | Observation ไม่กระทบการทำงาน |

### 4.3 Cut order (ถ้าต้องลด scope — last-in first-out)

**046 → 045 → 040 → 029 → 042 (ลดเป็น report n ที่มี)** · **ห้ามตัด** 049/050a/050b แยกกัน · 048 และ bundle คือแกนของ goal — ถ้าเสี่ยง PO รัน change coordination (charter §8) ไม่ตัดเงียบ

## 5. Task Breakdown per Role (ระดับวันโดยคร่าว)

Sprint ปฏิทิน: **Day 1** จ. 23 · **Day 2** อ. 24 · **Day 3** พ. 25 (mid-sprint grooming) · **Day 4** พฤ. 26 · **Day 5** ศ. 27 (Review/Demo บน live + Retro)

```
Day 1 ─ QA:  ผล TC ที่ติด B3 บน live · 048 smoke e2e บน live · 051 schema + expected payee · G6 variant/negative lists · G7 synthetic fixtures เริ่ม
        Dev: 028 wrap-up (Pages-check step, README live URL, G8 CONTRIBUTING) · pair 051 · เริ่ม 049 parser จาก seed
        Des: G1 spec D1 · G2 state table 041 · G3 copy 046 · G4 แก้ screens.md
        PO:  Planning, backlog v7, HANDOFF · ร่วม 048 → ย้าย 92 pts → Done · ติดตาม UQ1/UQ3/UQ4–6
Day 2 ─ QA:  048 Lighthouse ×3 + HAR → PO accept · tag v0.1.0-uat · 029 วัดบน live · 051 baseline · 043 รอบแรก (device/SR บน build ปัจจุบัน) · G7 fixtures เสร็จ
        Dev: 049 (parser + AC6 UI) → PR · เริ่ม 050a
        Des: design QA 049 AC6 (D1)
Day 3 ─ Dev: 050a → PR · 050b → PR · bundle merge + deploy (EOD) · 040
        QA:  regression gate (Layer A 100%, Layer B 27/27) ต่อ PR · Layer B template ใหม่ 4 ใบ · benchmark
        Des: design QA 050a AC6 (D2 + aria-describedby) · mid-sprint grooming (Sprint 3 input)
        PO:  mid-sprint grooming · ส่งคำขอ re-test ให้ผู้ใช้ (UQ5) · ตัดสิน stretch B2
Day 4 ─ ผู้ใช้ re-test 3 สลิป (UQ5) → QA บันทึก Layer C · 042 report · 043 รอบ Review card ใหม่ (SR)
        Dev: 045, 046 · fixes จาก QA · (stretch 003a/b/041 ถ้า UQ3)
        QA:  BUG-009/010 re-test → Closed · UAT entry checklist · UAT เริ่มได้ (buffer)
Day 5 ─ Hardening, UAT (buffer), Sprint Review/Demo บน live URL, Retro
```

### 5.1 Dev

| Task | Item | Day |
|---|---|---|
| V1 028 wrap-up: step ตรวจ Pages ก่อน `configure-pages` พร้อม error อ่านง่าย (ไม่บังคับแล้วแต่ยังเป็น task ใน 028), README ใส่ live URL `https://jaijimjim.github.io/spendy-project/` (AC5), ยืนยัน AC1 ด้วย PR แรกของ sprint (TC-138 PR trigger) | 028 | 1 |
| V2 G8 CONTRIBUTING: Playwright Chromium path + proxy (AI-8) | 028 (chore) | 1 |
| V3 Pair กับ QA: `QaFixture.expected.payee?`, `normalizePayee()` compare ใน `qaGolden.test.ts`, benchmark รายงาน payee exact-match % + CER (report only) | 051 | 1 |
| V4 049 parser: masked-account anchor ทน `x/X/×/*` + dash variants, junk-line skip ≤ 3, name-like line, sender-equality guard, expense-only, `payeeSource = 'arrow'`, `payeeExtra` · label rule รันก่อนเสมอ (`src/domain/slip/parties.ts`) | 049 | 1–2 |
| V5 049 AC6 UI (D1): `review.noPayee` helper + `aria-describedby`, placeholder, collapsed card payee line / `transactions.noPayee` | 049 | 2 |
| V6 050a: `TX_PHRASES` weak tier, ลบ "จ่ายบิล" จาก `bills.keywords`, precedence payee → payeeExtra → memo → person → text → weak → other, keyword อาหารไทย 10 คำ (ไม่ใส่ "ครัว"), อัปเดต test เดิม High → Medium (expected change) | 050a | 2–3 |
| V7 050a AC6 (D2): highlight category Medium (`field === 'text'`), นับ "ต้องตรวจ" สำหรับ auto-expand, `CategoryPicker` รับ `warning` + `aria-describedby` | 050a | 3 |
| V8 050b: `fold()` ใน keyword matcher เท่านั้น (ไม่แตะ `normalizeText()`), fold table round 1 (ไม่มี `ด↔ต`), flag `fuzzy: true` ยาว ≥ 5, fuzzy `TRANSFER_STRONG` ("ชําระเจิน") | 050b | 3 |
| V9 Bundle merge (049 → 050a → 050b) + deploy + ตรวจ live หลัง deploy | bundle | 3 EOD |
| V10 040 Thai-digit amount normalize + เลือก candidate 2 ทศนิยม | 040 | 3–4 |
| V11 045 option A + hint บน Review; 046 `searchPlaceholderShort` < 360px + hint visually-hidden | 045, 046 | 4 |
| V12 Local-only script สำหรับ Layer C (ผลเป็นตัวเลขเท่านั้น ไม่เก็บ text/รูป) | 042 | 2–3 |
| V13 Fix จากผล QA บน live / 029 (ใช้ buffer) · stretch: 003a/b config + 041 Retry (stub → real) ถ้า UQ3 | buffer / stretch | 2–5 |

### 5.2 QA

| Task | Item | Day |
|---|---|---|
| Q1 รัน TC ที่เคยติด B3 บน live (TC-137, 139, 135, 008 ฯลฯ) — บันทึกผลแบบ incremental (AI-4) ใน `docs/qa/` | 048, 043 | 1 |
| Q2 048 AC1: `E2E_BASE_URL=https://jaijimjim.github.io/spendy-project/ npm run e2e` (non-Google journeys) + ยืนยัน AC ของ 052 บน live (title/brand/export filename/backward-compatible import) | 048, 052 | 1 |
| Q3 048 AC2/AC3: Lighthouse mobile ×3 (median) + HAR upload → OCR → save (allowlist, Tesseract จาก origin เรา, cache รอบสอง) → ส่ง PO accept | 048, 029 | 1–2 |
| Q4 051: payee ใน `expected.json` 27 ใบ (ชื่อสมมติ) + baseline บน `main` ก่อน 049 → `test-summary-report.md` | 051 | 1–2 |
| Q5 G6: variant list Lazada/Shopee + ≥ 20 negative fixtures (8 ชื่อคน, 8 merchant, 4 คำไทยใกล้เคียง) + fixture "จ่ายบิล" utility/เดี่ยว | 050a, 050b | 1 |
| Q6 G7 (**option B — synthetic**, เริ่ม Day 1 แทน Day 2 ตามสมมติฐาน A1): Layer A OCR text เลียนแบบ layout KBank "make by KBank" + K PLUS (ลูกศร ↓ หาย/เป็นขยะ, masked `XXX-X-X####-X`, "พ.ุย.", "ชําระเจิน", ขยะ QR/การ์ตูน) ชื่อ/ร้าน/เลขสมมติทั้งหมด · fixture id `synthetic-kplus-*` + comment ที่มา "FB-011 description, synthetic" · **ห้ามใช้รูปสลิปจริง** | 049, 050a, 050b | 1–2 |
| Q7 Layer B templates ใหม่: arrow base + degraded (049), restaurant bill "…FOOD" (050a), marketplace e-wallet (050b) → regenerate + benchmark | bundle | 2–3 |
| Q8 Regression gate ต่อ PR: Layer A 100%, Layer B 27/27 ไม่ลด, e2e เขียว · privacy check `git diff --stat` + gitleaks (AC9) | bundle, 040 | 2–4 |
| Q9 029 AC1/AC3/AC5 บน live + อุปกรณ์อ้างอิง → ตัดสินว่าต้องดึง 044 หรือไม่ | 029 | 2 |
| Q10 043: journeys 1–7 บน Android Chrome + iPhone Safari, NVDA/VoiceOver/TalkBack smoke, CSV ใน Excel/Sheets · รอบสองหลัง bundle deploy (Review card payee ว่าง + category Medium ร่วมกับ Designer) | 043 | 2, 4 |
| Q11 042: Layer C ชุดแรก = 3 สลิป FB-011 (ผลเป็นตัวเลข) + สลิปเพิ่มจาก UQ4 ถ้ามี → report ต่อธนาคาร/รูปแบบ, gap → FB items | 042 | 4 |
| Q12 BUG-009/010 re-test → Closed, TC ใหม่ (payee series), UAT entry checklist, test summary | bundle | 4–5 |

### 5.3 Designer

| Task | Item | Day |
|---|---|---|
| G1 Spec D1 (payee empty/filled/touched + collapsed line) + `review.noPayee` ใน `design/copy-deck.json` | 049 | 1 |
| G2 OMX-041 state table + copy keys (เตรียมไว้สำหรับ stretch) | 041 | 1 |
| G3 Copy key `transactions.searchPlaceholderShort` | 046 | 1 |
| G4 แก้ spec ขัดกันใน `design/screens.md` (payee ใน collapsed card) | 049 | 1 |
| G5 Hint copy ของ 045 (ถ้ายังไม่มี key) | 045 | 2 |
| G6 Per-story design QA (AI-5): 049 AC6, 050a AC6, 046 ที่ 320px | 049, 050a, 046 | 2–4 |
| G7 Screen-reader review ของ Review card ร่วมกับ QA | 043 | 4 |
| G8 ตรวจ brand "Spendy Money" บน live (TH/EN, light/dark) — feedback เข้า buffer ถ้าพบ | 052 | 1–2 |

### 5.4 PO/PM

| Task | Day |
|---|---|
| P1 Sprint Planning, backlog v7, HANDOFF, daily Day 1 | 1 |
| P2 ร่วมกับ QA ปิด 048: review ผล → ย้าย Sprint 1 Accepted (pending deploy) 92 pts + 052 + 028 → **Done**, tag `v0.1.0-uat` (ขอ Dev สร้าง tag) | 1–2 |
| P3 ติดตามผู้ใช้: UQ1 (ถ้าส่ง → re-check §6.2), UQ3 (ตัดสิน stretch Day 3), UQ4 (สลิปเพิ่ม ≥ 11), UQ5 (นัด re-test Day 4), UQ6 (ช่วง UAT) — escalate ภายใน 1 วันถ้าไม่มีคำตอบ | 1–3 |
| P4 Accept story ตามที่ถึง Done; daily scope/burndown check; mid-sprint grooming (Day 3) | 1–5 |
| P5 Close loop feedback: FB-012 (Pages 404 → live แล้ว), FB-013 (rename) ใน `feedback-log.md` | 1 |
| P6 เตรียม Sprint Review/Demo บน live + UAT pack กับ QA | 4–5 |

## 6. Assumptions, Risks & Re-check Conditions

### 6.1 Assumptions ที่ใช้ในแผนนี้

| # | Assumption | เหตุผล | ผลต่อแผน |
|---|---|---|---|
| **A1** | **UQ1 = ใช้ synthetic OCR text** — ไม่มี redacted text จริง · fixture เลียนแบบ layout KBank/K PLUS จากคำบรรยาย FB-011 + seed S1–S4 · **ห้ามใช้รูปสลิปจริง** | ผู้ใช้สั่งเริ่ม sprint แต่ยังไม่ตอบ UQ1; grooming กำหนด fallback B ไว้แล้ว | DoR #6 ของ 049/050a/050b = ✓ · QA G7 เริ่ม Day 1 แทน Day 2 · Layer C re-test โดยผู้ใช้ (UQ5) เป็นตัวยืนยันจริงเพียงตัวเดียว |
| **A2** | **UQ2 = ปิดแล้ว** (repo public, Pages เปิด, deploy เขียว) | run `45208481550` + หน้า live | 028/048/043/029 Ready |
| **A3** | **UQ3 = ยังไม่ยืนยัน** → B2 เปิด | ไม่มีคำตอบ | 003a/003b/041 = Blocked (B2), stretch, ไม่นับใน commit |
| A4 | UQ4 ยังไม่ตอบ → OMX-042 เริ่มด้วย n = 3 (FB-011) | ผู้ใช้ยังไม่ยินยอม/ส่งสลิปเพิ่ม | ถ้าไม่ได้สลิปเพิ่มภายใน Day 3 → report เท่าที่มี + บันทึกเหตุผล (S4) และ PO ตัดสินว่า 042 accept บางส่วนหรือ carry-over (AC1 ต้อง ≥ 11) |
| A5 | UQ5: ผู้ใช้ re-test ได้ Day 4 | ตามที่ขอใน grooming | ถ้าไม่ได้ → AC8 ของ bundle ค้าง; PO ตัดสินตาม UAT exit #3 (ไม่ block merge อัตโนมัติ) |
| A6 | Build ที่ live ทำงานถูกต้อง (QA ยืนยัน Day 1) | หน้า Home ขึ้นแล้ว แต่ TC บน live ยังไม่ครบ | ถ้า TC บน live fail → hotfix จาก buffer ก่อน bundle |

### 6.2 Re-check conditions (ถ้าผู้ใช้ตอบกลาง sprint)

| เมื่อ | ต้องตรวจซ้ำ | Owner | ผลกระทบสูงสุด |
|---|---|---|---|
| **ผู้ใช้ส่ง redacted OCR text (UQ1-A)** | (1) QA ตรวจ redaction ตาม `grooming/sprint-2-qa.md` §2 ก่อนเพิ่มเป็น `real-redacted-*` (ไม่มีชื่อจริง/เลขบัญชีเต็ม/เบอร์/เลขอ้างอิงจริง; คง masked pattern + OCR noise) · (2) รัน 049/050a/050b กับ fixture จริงเพิ่มจาก synthetic — ถ้า fail ให้แก้ใน PR เดิมถ้ายังไม่ merge หรือ follow-up ใน buffer · (3) **Dev re-estimate trigger (minutes §4.1):** ถ้า layout "make by KBank" กับ K PLUS ต่างกันมาก หรือ OCR ตัดชื่อเป็นหลายบรรทัด → 049 เป็น 5 → แจ้ง PO ทันที, PO ใช้ buffer (+2) หรือตัดตาม §4.3 (ไม่แตะ bundle) · (4) ถ้ามาหลัง bundle deploy (Day 3) → ใช้เป็น regression guard + เข้า 042 AC3 | QA → Dev → PO | +2 pts (จาก buffer) |
| **ผู้ใช้ยืนยัน UQ3 (B2 ปิด) ≤ Day 3** | DoR #7 ของ 003a/b/041 → ✓ · ดึง stretch (+4 → 30 pts) · re-deploy เพื่อ inject `VITE_GOOGLE_CLIENT_ID` · QA รัน TC-015/016/017 บน live + localhost:4173 · ตรวจว่า commit 30 ยังเหลือ buffer ~10 | PO → Dev/QA | +4 pts (stretch) |
| **ผู้ใช้ยืนยัน UQ3 หลัง Day 3** | ไม่ดึงเข้า sprint (เหลือ buffer สำหรับ UAT) · เตรียมเป็น Sprint 3 item แรก · QA อาจรัน TC-015/016/017 แบบ exploratory ถ้ามีเวลา | PO | 0 |
| **ผู้ใช้ตอบ UQ3 = ยอมรับ "Not configured"** | PO บันทึกการตัดสินใจ (AI-6) · 003a/b/041 → Sprint 3 candidate · UAT ทำโดยไม่มี Google Photos จริง | PO | 0 |
| **ผู้ใช้ส่งสลิปเพิ่ม (UQ4)** | QA รัน Layer C local-only, ผลเป็นตัวเลข · ไม่มีรูป/text จริงเข้า repo/sandbox | QA | 0 (อยู่ใน 042) |

### 6.3 Risks

| # | Risk | L / I | Mitigation | Owner |
|---|---|---|---|---|
| R1 | **Synthetic fixture ไม่ตรง layout จริง (A1)** → bundle ผ่าน Layer A/B แต่ Layer C ยังไม่ถึง 2/3 | **M / H** | ใช้คำบรรยาย FB-011 + seed S1–S4 จาก spike ที่ Dev ดูจากผล OCR จริงแล้ว · ใส่ noise ทุกแบบที่พบ · deploy Day 3 เพื่อเหลือเวลาแก้ 1 รอบหลัง re-test Day 4 · ขอ UQ1 ต่อ | QA / PO |
| R2 | TC บน live fail (base path, Tesseract assets, cache, CSP บน Pages) → 048 ไม่ผ่าน, 92 pts ยังไม่ Done | L / H | QA รัน Day 1 แรกสุด · hotfix จาก buffer ก่อน bundle · Dev พร้อมดู Day 1–2 | QA / Dev |
| R3 | Arrow fallback หยิบชื่อผู้โอน/ธนาคาร/ขยะ QR (K3 เดิม) | M / H | expense-only + anchor + sender guard + junk filter; negative fixtures; จำกัด KBank ถ้าพัง | Dev / QA |
| R4 | Fuzzy folding ทำ false positive (K4 เดิม) | M / M | flag + ≥ 5 ตัว + ไม่ fold `ด↔ต`; ≥ 20 negatives = 0 FP | Dev / QA |
| R5 | ข้อมูลส่วนตัวหลุดเข้า repo — **repo เป็น public แล้ว** ความเสียหายถาวร | L / **Critical** | ใช้ synthetic เท่านั้น (A1) · redaction checklist ถ้าได้ UQ1 · `git diff --stat` + gitleaks ทุก PR · ห้ามส่งรูปเข้า sandbox/agent/chat | QA / ทุกคน |
| R6 | ผู้ใช้ไม่ว่าง re-test Day 4 (UQ5) → AC8 ของ bundle + S2 ค้าง | M / M | นัดล่วงหน้าตั้งแต่ Day 3, ส่งขั้นตอนสั้น ๆ (เปิด live → อัปโหลด 3 ใบ → รายงานถูก/ผิดต่อ field) · ไม่ block merge; PO ตัดสินตาม UAT exit #3 | PO |
| R7 | Layer C n = 3 เล็กเกินจะสรุป (K7 เดิม) | H / M | 042 ขอ ≥ 11 (UQ4); 3 ใบเป็น signal/regression เท่านั้น | PO / QA |
| R8 | 049 โตเป็น 5 (K8 เดิม) — เสี่ยงขึ้นเมื่อได้ fixture จริงกลาง sprint | L / M | trigger ชัดเจน §6.2 · buffer รองรับ | Dev → PO |
| R9 | B2 ยังเปิดจนจบ sprint → TC-015/016/017 Blocked, Google Photos จริงไม่อยู่ใน UAT | M / M | stretch แยกจาก commit · ขอให้ผู้ใช้เลือก "ยืนยัน" หรือ "Not configured" (AI-6) | PO |

## 7. Definition of Done

ทุก item ต้องผ่าน **DoD ใน `docs/agile/00-team-charter.md` §4** (PR + review, CI เขียว, QA ผ่านบน **GitHub Pages build ที่ live แล้ว** — ตอนนี้ทำได้จริงเป็นครั้งแรก, TH+EN, a11y, ไม่มี Critical/High ค้าง, ไม่มีข้อมูลออกนอก browser, docs อัปเดต, PO accept) · เพิ่มเติมสำหรับ Sprint 2:
- [ ] Bundle 049/050a/050b: regression gate (`grooming/sprint-2-qa.md` §3) เขียว · benchmark attach ใน PR · payee ≥ baseline 051
- [ ] Parser fixtures เป็น synthetic หรือ redacted text เท่านั้น — **ไม่มีไฟล์รูปสลิปจริงใน diff** + gitleaks ผ่าน (repo public)
- [ ] UI (049 AC6, 050a AC6, 046): ผ่าน design QA ของ Designer (AI-5) + `aria-describedby` ตรวจด้วย SR อย่างน้อย 1 ตัว
- [ ] ทุก story ตรวจบน live URL `https://jaijimjim.github.io/spendy-project/` หลัง merge (status `Accepted (pending deploy)` ไม่ควรเกิดอีกใน Sprint 2)

## 8. Sprint Board (end of Planning)

| To Do | In Progress | In Review | QA | Done |
|---|---|---|---|---|
| OMX-049 Payee arrow + D1 (3) 🔗 | OMX-048 Post-deploy verify (2) — QA | | OMX-028 Deploy (1) — run `45208481550` | |
| OMX-050a Precedence + D2 (3) 🔗 | OMX-051 Payee measurement (2) — QA + Dev | | OMX-052 Rename (1) — verify on live | |
| OMX-050b Fuzzy (2) 🔗 | | | | |
| OMX-043 Devices/AT (3) | | | | |
| OMX-042 Real-slip accuracy (3) ◐ | | | | |
| OMX-029 Perf budget (2) | | | | |
| OMX-040 Thai digits (2) | | | | |
| OMX-045 Salary date (1) | | | | |
| OMX-046 Search 320px (1) | | | | |
| *Stretch (B2):* 003a/b (2), 041 (2) · *Conditional:* 044 (3) | | | | |
| **26 pts committed** | **4** | **0** | **2** | **0** |

> Live board updates อยู่ใน `03-daily-standup.md`
