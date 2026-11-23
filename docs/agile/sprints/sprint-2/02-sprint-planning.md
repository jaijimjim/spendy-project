# Sprint 2 — Sprint Planning

> Date: 2026-11-23 (Day 1, จันทร์) · Timebox: 60 นาที · Facilitator: PO/PM · Attendees: PO/PM, Designer, Dev, QA
> Sprint: **Sprint 2** · 1 สัปดาห์ (compressed mode ตาม charter §5) · Day 1 = 23 พ.ย. → Day 5 = 27 พ.ย. 2569 (Review/Demo + Retro)
> Inputs: `01-product-backlog.md` v6 (§6, §7, §9), `00-grooming-agenda.md`, `01-grooming-minutes.md` (§4, §6–§10), `grooming/sprint-2-{design,dev,qa}.md`, `docs/qa/test-summary-report.md` §7, `sprints/sprint-1/05-retrospective.md` (AI-3)
> Output: Sprint Goal, Sprint Backlog (commit **26 pts**), stretch, task breakdown, risks · backlog → **v7** · `03-daily-standup.md` Day 1
> **⚠️ Scope change Day 1 (23 พ.ย. บ่าย) — commit 26 → 29 pts:** หลัง OMX-042 (สลิปจริง n = 16) · ดู **§9** (มีผลเหนือ §2–§5 ในส่วนที่ขัดกัน) · backlog → **v8**

## 0. สถานะก่อน Planning (สิ่งที่เปลี่ยนตั้งแต่ grooming)

| เรื่อง | สถานะ ณ 23 พ.ย. 2569 |
|---|---|
| **B3 (Pages)** | **ปิดแล้ว** — ผู้ใช้เปลี่ยน repo เป็น **public**, เปลี่ยนชื่อเป็น `spendy-project` และตั้ง Pages Source = GitHub Actions · run **`45208481550`** (commit `6ebe779`) ผ่านทุก job: CI ทั้งหมด (gitleaks, lint/typecheck/unit, build ×2, e2e) + Build for Pages + Deploy · **https://jaijimjim.github.io/spendy-project/** ขึ้นหน้า "Home · Spendy Money" |
| **UQ2** | ปิดแล้ว (= B3) |
| **OMX-052** rename (FB-013, 1 pt) | ทำเสร็จในโค้ดแล้ว และอยู่ใน build ที่ deploy · รอยืนยัน AC บน live ใน OMX-048 |
| **UQ1** (OCR text จริงแบบ redact) | **ยังไม่ได้คำตอบ** → ใช้สมมติฐาน A1 (§6) = synthetic OCR text |
| **UQ3** (Google Client ID / B2) | **ยังไม่ได้คำตอบ** → B2 ยังเปิด · 003a/003b/041 ไม่นับใน commitment |
| UQ4–UQ6 | ยังไม่ได้คำตอบ (ติดตามต่อ — ดู §6) · *(Day 1 บ่าย)* **UQ4 ปิด** — ผู้ใช้ส่งสลิปจริง 16 ใบ → §9 |
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
| A4 | ~~UQ4 ยังไม่ตอบ → OMX-042 เริ่มด้วย n = 3 (FB-011)~~ **ปิด Day 1: ได้ n = 16 → 042 Done (§9.1)** | ผู้ใช้ยังไม่ยินยอม/ส่งสลิปเพิ่ม | ถ้าไม่ได้สลิปเพิ่มภายใน Day 3 → report เท่าที่มี + บันทึกเหตุผล (S4) และ PO ตัดสินว่า 042 accept บางส่วนหรือ carry-over (AC1 ต้อง ≥ 11) |
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

### 6.2a คำถามถึงผู้ใช้ที่เปิดใหม่ Day 1 *(scope change §9)*

| # | คำถาม | ทำไมต้องรู้ | ผลต่อแผน | Owner / Due |
|---|---|---|---|---|
| **UQ7** | ยืนยันหมวดของสลิปจริง 7 ใบ (FB-015): **r04** ล้างแอร์ (ฮิปโป เซอร์วิส เซ็นเตอร์) → ที่อยู่อาศัย? · **r06** TrueMoney Shop (นัวสะเด็ด) → อาหาร? · **r07** QR ร้าน TTB(ชื่อบุคคล) 140 บาท → ซื้ออะไร? · **r09** SCB มณี SHOP (โจนมุมตึก) → ร้านประเภทไหน? · **r11** KSHER_SIAM PARAGON ONLINE → ช้อปปิ้ง (หรือที่จอดรถ/อาหาร)? · **r13** เติม G-Wallet (เป๋าตัง) → โอน หรือหมวดอื่น? · **r14** วิสาหกิจชุมชนท่องเที่ยว → บันเทิง/ท่องเที่ยว? | ground truth ของ category gate (§9.3) — QA ไม่เดา | ใบที่ยืนยันแล้วเข้า "ใบที่หมวดชัด" → gate = ≥ 60% ของชุดที่ขยาย (ปัดขึ้น) · ไม่ตอบ → gate คงที่ 9 ใบ | PO · Day 2 |
| **UQ8** | r10 บริจาควัด → โอเคกับ "อื่น ๆ" หรืออยากได้หมวดใหม่ "บริจาค / Donation" (ลดหย่อนภาษี)? | taxonomy v1 ไม่มีหมวดนี้ | "อื่น ๆ" → ใช้ `other` ต่อ · "อยากได้" → story ใหม่ (taxonomy v2, Designer + i18n) **Sprint 3** ไม่เข้า Sprint 2 | PO · Day 3 |
| **UQ9** | FB-016 อัปโหลดหลายรูป: รุ่นเครื่อง/OS, เบราว์เซอร์ (หรือเปิดจาก LINE/FB), ปุ่มที่กด, หน้าต่างเลือกรูปเป็นแอปอะไร | โค้ดมี `multiple` ทุกจุด + TC-005 (21 รูป) ผ่าน → น่าจะเป็น picker ของเครื่อง | ยังไม่สร้าง ticket · Dev ตรวจ append/replace (≤ 30 นาที, buffer) · QA ลองใน 043 | PO · Day 2 |
| UQ10 *(ไม่ block)* | ขอสลิปเพิ่ม: SCB EASY ≥ 2, Krungthai +1, สลิปเงินเดือน, สลิปรับเงิน | OMX-042 AC1 bank mix ที่ยกไป OMX-057 | Sprint 3 | PO · ก่อน Sprint 3 Planning |

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

---

## 9. Scope Change — Day 1 บ่าย (2026-11-23) หลัง OMX-042 n = 16

> Facilitator: PO/PM · Input: `docs/qa/test-summary-report.md` §8–§9, `docs/qa/bug-report.md` BUG-009…015, `tests/fixtures/real-slips/README.md`, FB-014–016 · ใช้ Change Coordination (charter §8) — Dev ยืนยัน estimate ใน Daily Day 2 · board อัปเดตด้วย `board.mjs` แล้ว

### 9.0 เกิดอะไรขึ้น
- **UQ4 ปิด:** ผู้ใช้ส่งสลิปจริง **16 ใบ** (make by KBank 9 · K PLUS 6 · Krungthai 1) และอนุญาตให้ QA เก็บไว้ทดสอบแบบ **local-only, git-ignored** (`images/`, `*.local.json`) — commit เฉพาะ OCR text ที่ redact แล้ว + `expected.json` ชื่อสมมติ · วัดซ้ำได้ใน CI: `npx vitest run src/domain/slip/realSlips.test.ts` (ratchet `BASELINE`)
- **Baseline (`main` @ `6ebe779`):** type **16/16** · amount **13/16** (ยอดผิดแบบไม่ว่าง **2/16** r04, r05) · date 13/16 · time 16/16 · **payee 0/16** · category 2/16 (**ใบที่หมวดชัด 0/9**)
- ข้อสรุป PO: ปัญหาใหญ่กว่าที่ 3 สลิปของ FB-011 บอก — payee ว่างทุกแอปรวมร้านค้า/biller และ "ยอดเงินผิดแบบเงียบ" เป็นความเสี่ยงต่อความเชื่อถือสูงสุด → Sprint Goal ส่วน "อ่านสลิปจริงให้ถูก" ต้องขยาย scope ไม่ใช่รอ Sprint 3

### 9.1 PO review — OMX-042 → **Accepted (Done)**

| AC | ผล | การตัดสินของ PO |
|---|---|---|
| AC1 ≥ 11 slips, private, report ต่อธนาคาร/รูปแบบ | n = 16 ✓ · รูป/OCR ดิบ git-ignored ✓ · report ไม่มีชื่อจริง ✓ · bank mix ไม่ครบ (ไม่มี SCB EASY, เงินเดือน, รายรับ; Krungthai 1) | **ยอมรับ scope = 3 แอปที่ผู้ใช้ใช้จริง** — รายชื่อธนาคารใน AC1 เขียนก่อนรู้ว่าผู้ใช้ใช้แอปอะไร; เป้าหมายของ story (รู้ว่าแอปผ่าน MVP metric นอก synthetic หรือไม่) บรรลุแล้ว · bank mix ที่ขาด → **OMX-057** (S3) |
| AC2 เทียบ MVP metrics + log gap เป็น FB พร้อมข้อเสนอ | ✓ BUG-011…015 + scope BUG-009/010 พร้อม suggestion · PO log **FB-014/015** แล้ว | ✓ |
| AC3 OCR text ที่ fail เป็น Layer A fixture (redacted) | ✓ `redacted/r01–r16.txt` + `realSlips.test.ts` ใน CI | ✓ |
| AC4 UAT correction rate | ⛔ UAT ยังไม่เริ่ม | **แยกออกไป OMX-057** — วัดได้ตอน UAT exit เท่านั้น ไม่ใช่งานวัด accuracy ของ story นี้; ไม่ถือว่า story ค้าง |

**เหตุผลที่รับ:** n = 16 ≥ 11, ข้อมูลเชื่อถือได้ (redaction ยืนยันว่าไม่เปลี่ยนผล parser), วัดซ้ำได้ใน CI ทุก PR และให้ gate ตัวเลขที่ใช้กับ 049/050a/050b/053/054 ทันที · ส่วนที่ไม่ครบแยกเป็น story ชัดเจน (ไม่ซ่อน) · `board.mjs set OMX-042 done` · **3 pts นับ velocity Sprint 2** · S4 (§1) ✓

### 9.2 Bug triage

| Bug | Sev | การตัดสิน | Ticket | Pts (PO prelim → Dev ยืนยัน Day 2) | Sprint |
|---|---|---|---|---|---|
| **BUG-009 ขยาย** (payee 0/16 ทุกแอป รวมร้าน/biller) | High | **รวมเข้า OMX-049** — rule เดียวกัน (บรรทัดชื่อแรกหลัง masked account ผู้โอน) ขยายให้ครอบคลุม make + K PLUS + Krungthai, mask ที่ OCR เพี้ยน, junk ลูกศร, ชื่อธนาคาร, merchant 2 บรรทัด · Dev re-estimate trigger (§6.2) เกิดแล้ว | OMX-049 | **3 → 5** | S2 |
| **BUG-010 ขยาย** (K PLUS "จ่ายบิล" 4/4 → bills, ก๋วยเตี๋ยว/ลูกชิ้น) | High | **รวมเข้า OMX-050a** (precedence + คำอาหาร) — เป็น scope เดิม เพิ่ม keyword + AC บนสลิปจริง | OMX-050a | 3 → 3 | S2 |
| **BUG-011** ยอดผิดแบบไม่ว่าง (r04, r05) | **High** | **OMX ใหม่** — ต่างจาก 040 (เลขไทยปน) แม้ใช้ไฟล์เดียวกัน; High ต้องเห็นบนบอร์ดแยก · **เข้า Sprint นี้** | **OMX-053** | **2** | **S2** |
| **BUG-013** "พ.ย." → `w.g.` (3/9 ของ make) | Medium | **OMX ใหม่** (แยกจาก 053 เพื่อให้ตัดได้อิสระ) · เข้า sprint เพราะ make คือแอปหลักของผู้ใช้ และรายการตกเดือนผิดถ้าข้ามเดือน | **OMX-054** | **1** | **S2** (ตัดเป็นตัวแรกถ้าเสี่ยง) |
| **BUG-014** Rabbit / บางกอก สมาร์ทการ์ด → transport | Medium | **รวมเข้า OMX-050b** (fuzzy keyword — OCR "ซิสแทม") · จำเป็นต่อ gate 60% (QA projection: ไม่มี Rabbit = 56%) | OMX-050b | **2 → 3** | S2 |
| BUG-014 r01/r02 (โอนบุคคล → transfer) | Medium | หายเมื่อ 049 ได้ payee — **รวมใน OMX-049 AC10** | OMX-049 | — | S2 |
| BUG-014 r08 (โอนเข้าบัญชีตัวเอง) | Medium | **รวมเข้า OMX-039** (owner name/account ใน Settings) — 049 AC4 sender guard ทำให้ payee ว่างถูกต้อง | OMX-039 | 3 (เดิม) | S3 |
| BUG-014 r12 (memo "ค่ากางเกง") | Medium | ต้องอ่าน memo make ก่อน → **รวมเข้า OMX-056** | OMX-056 | — | S3 |
| **BUG-012** ยอดแตกหลายบรรทัด → ว่าง | Low | **OMX ใหม่ (spike)** — ห้ามเดาต่อตัวเลข; known limitation ระหว่างนี้ | **OMX-055** | 2 | S3 candidate |
| **BUG-015** memo make, disclaimer เป็น memo, bank null, type Low ("เติมเงิน") | Low | **OMX ใหม่** · ส่วน "ชําระเจิน" อยู่ใน 050b AC4 แล้ว | **OMX-056** | 3 | S3 candidate |
| OMX-042 AC1 bank mix + AC4 | — | **OMX ใหม่** (split จาก 042) | **OMX-057** | 2 | S3 candidate |

### 9.3 เกณฑ์ตัวเลขบนสลิปจริง (fixture `tests/fixtures/real-slips`, รันใน `realSlips.test.ts`)

| Field | Baseline | **Gate (ขั้นต่ำ, ต้องผ่านก่อน PO accept)** | Target | Ticket ที่รับผิดชอบ |
|---|---|---|---|---|
| Payee | 0/16 | **≥ 12/16 (75%)** และถูก ≥ 1 ใบในทุกแอป (make, K PLUS, Krungthai) · **0 ใบ** ที่คืนชื่อผู้โอนเป็น payee · r08 (บัญชีตัวเอง) payee ว่าง = ผ่าน | 14/16 | 049 |
| Category — ใบที่หมวดชัด | 0/9 | **≥ 6/9 (67% ≥ MVP 60%)** วัดรวม bundle · เมื่อผู้ใช้ตอบ UQ7 ใบที่ยืนยันเข้าชุดนี้ → gate = ≥ 60% ของชุดใหม่ (ปัดขึ้น) | 7/9 (r01, r02, r03, r05, r10, r15, r16) | 049 + 050a + 050b |
| Category — K PLUS "จ่ายบิล" | 4/4 เป็น `bills` | **0/4 เป็น `bills`** (ไม่มีใบใดเป็น biller สาธารณูปโภค) | r03 food, r10 other | 050a |
| Amount | 13/16, ผิด 2 | **≥ 15/16 และยอดผิดแบบไม่ว่าง = 0** (r14 = BUG-012 ยกเว้น) | 15/16 | 053 |
| Date | 13/16 | **16/16** | 16/16 | 054 |
| Type / Time | 16/16 | ไม่ลด | — | ทุก ticket |

กฎ: ทุก PR ที่แก้ต้อง **ยก `BASELINE` ใน `realSlips.test.ts`** ใน PR เดียวกัน (ratchet) · Layer A 100% และ Layer B 27/27 ไม่ถอย (gate เดิม) · ใบที่แก้ได้ย้ายเข้า `qaGolden.ts` เป็น `real-redacted-rNN` · **AC8 เดิม (ผู้ใช้ re-test 3 ใบ FB-011)** คงไว้เป็น signal บนเครื่องจริง แต่ gate หลักย้ายมาที่ n = 16 ใน CI (ไม่ขึ้นกับเวลาว่างของผู้ใช้ — ลด R6)

### 9.4 Capacity & commitment ใหม่

| | Pts |
|---|---|
| Commit เดิม | 26 |
| + OMX-049 re-estimate 3 → 5 | +2 |
| + OMX-050b 2 → 3 (Rabbit/transport) | +1 |
| + OMX-048 2 → 3 (Dev ทำ `post-deploy.yml` — §9.6) | +1 |
| + **OMX-053** (BUG-011 High) | +2 |
| + **OMX-054** (BUG-013) | +1 |
| = ก่อนตัด | **33** — เกิน commit line ~30 |
| − OMX-040 Thai digits (Could, BUG-007 Low — สลิปจริงไม่พบปัญหานี้) → S3 | −2 |
| − OMX-045 salary date (Could) → S3 | −1 |
| − OMX-046 search 320px (Could) → S3 | −1 |
| **Commit ใหม่** | **29** (Must 26 · Should 3: 029 + 054 · Could 0) |
| Done แล้ว | 052 (1) + 042 (3) = **4** → remaining **25** |
| Buffer (UAT, hotfix, FB-016 ตรวจ append/replace) | ~10 → รวม ~39 ≤ velocity ~40 ✓ |
| Stretch (B2) | 003a/b + 041 = 4 — **ดึงได้เฉพาะเมื่อมี pts Done เกินแผนแล้วเท่านั้น** (ไม่ดึงเพียงเพราะ UQ3 ตอบ) เพื่อไม่ให้ commit เกิน velocity |

**Trade-off (charter §8 ข้อ 4):** เพิ่มงาน High/real-slip 7 pts ↔ เอา Could ที่ไม่ช่วย goal ออก 4 pts + ใช้ช่องว่างเดิม 4 pts ถึง commit line · Sprint Goal ไม่เปลี่ยนเจตนา แต่ปรับเกณฑ์ (§9.7)

**Cut order ใหม่ (LIFO):** **054 → 029 → 043 AC3 (CSV Excel/Sheets) → ลด target payee เป็น gate** · **ห้ามตัด** 049/050a/050b แยกกัน และ 053 (High) · ถ้า Dev ยืนยันว่า 049 > 5 (→ 8) ให้ PO ตัด 054 + 029 ทันทีและแจ้งผู้ใช้

### 9.5 OMX-028 AC1 — การตัดสินใจ

**ตัดสิน: ต้องมีหลักฐานจริง ไม่รับหลักฐานเชิงโครงสร้างอย่างเดียว** — แต่ปรับวิธีให้พิสูจน์สิ่งที่ AC ต้องการจริง:
1. Dev สร้าง branch ทิ้ง `chore/omx-028-failing-gate` ที่มี unit test ล้มโดยตั้งใจ 1 ตัว → เปิด **draft PR** → ได้หลักฐาน TC-138 (PR trigger) + CI แดง
2. รัน **`workflow_dispatch` ของ `deploy.yml` บน branch นั้น** → job `ci` แดง → **`Build for Pages` และ `Deploy` = skipped** → นี่คือหลักฐานว่า "failed step blocks deployment" (PR อย่างเดียวพิสูจน์ไม่ได้ เพราะ `deploy.yml` ไม่รันบน `pull_request` เลย)
3. แนบลิงก์ run ทั้งสองใน PR → ปิด PR + ลบ branch · **ห้าม merge และห้าม push สิ่งที่ล้มเข้า `main`** (live site ไม่ถูกแตะ)

**เหตุผล:** AC เขียนวิธีพิสูจน์ไว้ชัด และต้นทุน ≈ 15–20 นาที · หลักฐาน `needs: ci` เป็นแค่การอ่าน config ไม่ใช่การทดสอบ · repo public + มี deploy อัตโนมัติ → gate นี้คือสิ่งที่ปกป้องผู้ใช้จาก build ที่พัง · **Fallback:** ถ้า environment protection / สิทธิ์ทำให้ dispatch บน branch ไม่ได้ → PO ยอมรับ (1) run ของ draft PR ที่แดง + (2) `deploy.yml` `build needs: ci`, `deploy needs: build` เป็นลายลักษณ์อักษรใน 028 และบันทึกใน Daily · Owner: Dev (Day 1–2) → QA ส่ง `qa` → PO accept

### 9.6 OMX-048 — แผนให้ AC1–AC3 ทำได้จริง (Dev task V14, Day 1–2)

ปัญหา: sandbox ของ QA เข้า `github.io` ไม่ได้ (proxy) → ย้ายการรันไปที่ **GitHub Actions runner** ซึ่งเข้า Pages ได้ และได้หลักฐานถาวรเป็น artifact

`.github/workflows/post-deploy.yml` — trigger: `workflow_run` (workflow "Deploy to GitHub Pages", `conclusion == success`) + `workflow_dispatch` · `BASE_URL = https://jaijimjim.github.io/spendy-project/`
| Job | ทำอะไร | ปิด AC |
|---|---|---|
| `e2e-live` | `E2E_BASE_URL=$BASE_URL npx playwright test --project=mobile --project=desktop` (non-Google journeys; Google = skip ตามเดิม) · upload report | 048 AC1 |
| `lighthouse-live` | Lighthouse CI (`@lhci/cli`) mobile, `numberOfRuns: 3`, categories performance + accessibility · assert a11y ≥ 0.90 (error), LCP บันทึก + warn > 2,500 ms · upload JSON/HTML (median) | 048 AC2, 029 AC1 |
| `har-live` | Playwright spec ใหม่ (`tests/e2e/live-har.spec.ts`, รันเฉพาะเมื่อมี `E2E_BASE_URL`): `recordHar` → upload **สลิปสังเคราะห์** จาก `tests/fixtures/slips/images` → real OCR → save → reload (visit 2) · assert ทุก request host = `jaijimjim.github.io`, Tesseract worker/core/lang มาจาก origin เดียว และ visit 2 มาจาก cache (Dev เลือกวิธี เช่น CDP `fromDiskCache`/`fromServiceWorker` หรือ `transferSize = 0`) · upload HAR | 048 AC3, OMX-030 |

กติกา: **ห้ามใช้สลิปจริงใน workflow** (synthetic เท่านั้น) · workflow ไม่ block deploy (รันหลัง deploy) แต่ถ้าแดง → QA เปิด bug + PO ตัดสินภายในวัน · QA review artifact → ส่ง `qa` → PO accept → 92 pts + 028 + 052 → Done, tag `v0.1.0-uat` · ผลพลอยได้: ใช้ซ้ำทุก deploy (bundle Day 3 ด้วย) · **ทางสำรอง:** ถ้า workflow ยังไม่พร้อมภายใน Day 2 ให้ orchestrator/ผู้ใช้รัน 3 คำสั่งเดียวกันจากเครื่องที่เข้า github.io ได้ · 048: 2 → 3 pts (+1 งาน Dev)

### 9.7 Sprint Goal & success measures (ปรับ)

Goal เดิมคงเจตนา — เปลี่ยนเฉพาะเกณฑ์ "อ่านสลิปจริงให้ถูก":
> …จากนั้นแก้การอ่านสลิปจริงของ **make by KBank / K PLUS / Krungthai** ให้ได้ **ผู้รับ หมวดหมู่ ยอดเงิน และวันที่** ถูกตามเกณฑ์บนสลิปจริง 16 ใบ (§9.3: payee ≥ 12/16, category ใบชัด ≥ 60%, ยอดผิดแบบเงียบ = 0) แล้ว deploy ภายใน Day 3…

| # | เปลี่ยน |
|---|---|
| S1 | คงเดิม — วัดผ่าน `post-deploy.yml` (§9.6) |
| S2 | **แทนที่:** gate §9.3 บน `realSlips.test.ts` (n = 16) · ผู้ใช้ re-test 3 ใบ = signal เพิ่มเติม |
| S4 | ✓ **ผ่านแล้ว** (OMX-042 Done, n = 16) |
| S5 | เพิ่ม: BUG-011 Closed (High) ก่อน UAT entry |

### 9.8 Sprint Backlog ปัจจุบัน (29 pts)

| Order (Dev) | ID | Pts | Status (board) |
|---|---|---|---|
| — | OMX-052 | 1 | Done |
| — | OMX-042 | 3 | **Done** (PO accept Day 1) |
| 1 | OMX-028 AC1 failing-gate proof | 1 | progress |
| 2 | OMX-048 `post-deploy.yml` (Dev) → QA review | 3 | progress |
| 3 | OMX-051 pair (baseline payee Layer A/B) | 2 | todo/progress |
| 4 | **OMX-049** payee ทุกแอป | 5 | todo |
| 5 | **OMX-053** amount (High) — ทำต่อทันทีระหว่างรอ review 049 | 2 | todo |
| 6 | **OMX-050a** | 3 | todo |
| 7 | **OMX-050b** (+ Rabbit) | 3 | todo |
| 8 | OMX-054 date `w.g.` | 1 | todo |
| 9 | Bundle merge + deploy (049 → 053 → 050a → 050b → 054) **Day 3 EOD** → `post-deploy.yml` รันอัตโนมัติ | — | — |
| QA | OMX-043 (3), OMX-029 (2 — ใช้ผล Lighthouse จาก `post-deploy.yml`) | 5 | todo |

**ความเสี่ยงใหม่:** R10 — Dev load (049 5 + 053 + 050a + 050b + 054 = 14 pts parser ใน Day 1–3) → bundle deploy อาจเลื่อนเป็น Day 4 เช้า · mitigation: checkpoint ครึ่งวัน Day 2 บ่าย, ถ้า 049 ยังไม่ PR → ตัด 054 ตาม cut order · R11 — gate payee 12/16 สูงเกินถ้า layout ต่างกันมาก → Dev แจ้งภายใน Day 2 เช้า, PO ตัดสินลด gate (ไม่ต่ำกว่า 10/16) พร้อมเหตุผล
