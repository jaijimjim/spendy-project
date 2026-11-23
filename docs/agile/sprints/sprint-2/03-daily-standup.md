# Sprint 2 — Daily Stand-up Log

> Timebox: 15 นาที · Facilitator: PO/PM · Format: yesterday / today / blockers
> Sprint Goal: ดู `02-sprint-planning.md` §1 (+ เกณฑ์ใหม่ §9.7) · Committed: ~~26~~ → **29 pts** (scope change Day 1, §9) · Stretch (B2): 4 pts · Buffer ~10 · Live: https://jaijimjim.github.io/spendy-project/ · สถานะอ้างจาก Spendy board (`board.mjs`, charter §6.1)

---

## Day 1 — 2026-11-23 (จันทร์)

**Attendees:** PO/PM, Designer, Dev, QA

### Planning recap
- Sprint Planning เสร็จ (`02-sprint-planning.md`) · Sprint Goal ปรับให้สะท้อนว่า **live แล้ว**: ยืนยันบน live → 92 pts Done + tag `v0.1.0-uat` (Day 2) → bundle parser 049/050a/050b deploy Day 3 → ผู้ใช้ re-test Day 4 → UAT entry
- **Commit 26 pts:** 052 (1), 028 (1), 048 (2), 051 (2), 049 (3), 050a (3), 050b (2), 043 (3), 042 (3), 029 (2), 040 (2), 045 (1), 046 (1) · **Stretch:** 003a/b (2) + 041 (2) เมื่อ UQ3 ยืนยัน · 044 conditional
- **B3 ปิดแล้ว:** repo public + `spendy-project`, Pages Source = GitHub Actions · run `45208481550` (commit `6ebe779`) เขียวทุก job รวม Deploy · live ขึ้นหน้า "Home · Spendy Money"
- สมมติฐาน: **UQ1 = synthetic OCR text** (ไม่มีรูปสลิปจริง) · UQ2 ปิด · **UQ3 ยังไม่ยืนยัน** (B2) — re-check conditions ใน planning §6.2
- Backlog → **v7**, HANDOFF อัปเดต

| Role | Yesterday | Today | Blockers |
|---|---|---|---|
| **PO/PM** | Sprint 2 Grooming (minutes, backlog v5), ส่ง UQ1–UQ6, FB-013 → OMX-052 (backlog v6), ติดตาม B3 จนผู้ใช้เปิด Pages | Sprint Planning · backlog v7 + HANDOFF · ร่วม QA ปิด OMX-048 → ย้าย 92 pts (+ 028, 052) เป็น Done เมื่อผลผ่าน · ติดตาม UQ1, UQ3, UQ4–UQ6 · close loop FB-012/FB-013 ใน feedback-log | UQ1/UQ3/UQ4 ยังไม่มีคำตอบ (ไม่ block commitment — ใช้สมมติฐาน) |
| **Designer** | Grooming input D1–D4, a11y A1–A8, copy keys | G1 spec D1 + `review.noPayee` · G2 state table 041 · G3 `transactions.searchPlaceholderShort` · G4 แก้ `design/screens.md` · ตรวจ brand Spendy Money บน live (TH/EN, light/dark) | ไม่มี |
| **Dev** | Spike S1–S4 (grooming), OMX-052 rename, ตรวจ git history ก่อน public (gitleaks full history = 1 false positive) | OMX-028 wrap-up: Pages-check step, README live URL (AC5), PR แรกของ sprint เพื่อยืนยัน PR trigger (TC-138) · G8 CONTRIBUTING · pair QA ทำ OMX-051 · เริ่ม OMX-049 parser จาก seed S1–S4 (logic-only; UI AC6 รอ G1) | ไม่มี |
| **QA** | Day 0 re-run (`test-summary-report.md` §7: Pass 120 / Fail 2 / Blocked 9 / Not run 1), test approach + redaction guideline | **รัน TC ที่เคยติด B3 บน live** (TC-137, 139, 135, 008 ฯลฯ) — บันทึกผล incremental · OMX-048 AC1 e2e `E2E_BASE_URL=https://jaijimjim.github.io/spendy-project/` + ยืนยัน AC ของ 052 บน live · OMX-051 schema + payee ใน `expected.json` · G6 variant/negative lists · G7 synthetic fixtures (option B) เริ่มวันนี้ | ผล live ยังไม่ครบ — จะรายงาน Day 2 |

### Work started today
| Item | Who | Note |
|---|---|---|
| OMX-048 | QA (+ PO) | smoke e2e บน live วันนี้ → Lighthouse ×3 + HAR Day 2 → PO accept, tag `v0.1.0-uat` |
| OMX-051 | QA + Dev | baseline payee ต้องเสร็จก่อน merge 049 |
| OMX-049 | Dev | parser จาก seed S1–S4; fixture synthetic จาก QA G7 |
| OMX-028 | Dev → QA | deploy เขียวแล้ว · เหลือ AC5 README + ยืนยัน AC1 ด้วย PR |

### Blockers & follow-ups

| # | Blocker | Impact | Owner | Action | Target |
|---|---|---|---|---|---|
| ~~B3~~ | ~~Pages ยังไม่เปิด / repo private~~ | — | — | **ปิดแล้ว 23 พ.ย.** (run `45208481550`, live URL ใช้งานได้) | ✔ |
| B2 | Google Client ID: repo variable `VITE_GOOGLE_CLIENT_ID`, Photos Picker API, test users ยังไม่ยืนยัน (UQ3) | 003a/b + 041 อยู่ใน stretch; TC-015/016/017 Blocked | PO | ติดตามผู้ใช้; ถ้ายืนยัน ≤ Day 3 ดึง stretch, ถ้ายอมรับ "Not configured" บันทึกการตัดสินใจ (AI-6) | Day 3 |
| — | UQ1 ยังไม่ตอบ | ใช้ synthetic (A1) — ความเสี่ยง R1 | PO / QA | QA ทำ G7 synthetic วันนี้; ถ้าผู้ใช้ส่ง text มา → re-check §6.2 | Day 2 |
| — | UQ4 สลิปจริง ≥ 11 ใบ | OMX-042 AC1 | PO | ติดตาม; ถ้าไม่ได้ภายใน Day 3 → report n ที่มี | Day 3 |
| — | UQ5 นัด re-test Day 4 / UQ6 ช่วง UAT | AC8 ของ bundle, แผน UAT | PO | ส่งคำขอพร้อมขั้นตอนสั้น ๆ | Day 3 |

### Board snapshot (end of Day 1 stand-up)

| To Do | In Progress | In Review | QA | Done |
|---|---|---|---|---|
| 050a, 050b, 043, 042, 029, 040, 045, 046 · stretch 003a/b, 041 | OMX-048 (QA) · OMX-051 (QA + Dev) · OMX-049 (Dev, parser) | — | OMX-028 · OMX-052 | — |

**Burndown:** 26 pts remaining (Day 1 of 5) · Sprint 1: 92 pts รอย้ายเป็น Done เมื่อ OMX-048 ผ่าน

---

### Day 1 — Update บ่าย (PO + QA) · 2026-11-23

**สิ่งที่เปลี่ยน:** ผู้ใช้ส่งสลิปจริง **16 ใบ** (UQ4 ปิด — เก็บแบบ local-only, git-ignored ให้ QA ทดสอบ) → QA วัด OMX-042 เสร็จ → PO review + scope change (`02-sprint-planning.md` §9, charter Change Log)

| Role | Done (Day 1) | Next | Blockers |
|---|---|---|---|
| **QA** | Live verification §8: TC-137 Pass, 028 AC2–AC5 ✓ (AC1 ขาด failing PR), 048 smoke ✓ แต่ AC1–AC3 รันไม่ได้ (proxy บล็อก `github.io`) · **OMX-042 n = 16** (§9): type 16/16 · amount 13/16 (**ผิดแบบเงียบ 2**) · date 13/16 · time 16/16 · **payee 0/16** · category 2/16 (ใบชัด 0/9) · redacted fixtures + `realSlips.test.ts` (ratchet) · BUG-011…015 + scope BUG-009/010 · 042 → `qa` | อัปเดต `expected.json` ตาม UQ7/UQ8 เมื่อผู้ใช้ตอบ (r08 payee ว่าง = ผ่าน ตาม 049 AC10) · review artifact ของ `post-deploy.yml` → 048 · 051 baseline · 043 รอบแรก | 048 AC1–AC3 รอ `post-deploy.yml` (Dev) |
| **PO/PM** | **OMX-042 → Done** (accept: n = 16 ≥ 11; bank mix = 3 แอปที่ผู้ใช้ใช้จริง; AC4 + bank mix → OMX-057) · triage: **OMX-053** (BUG-011 High, 2, S2) · **OMX-054** (BUG-013, 1, S2) · OMX-055/056/057 (S3) · 049 3→5, 050b 2→3 (+Rabbit), 048 2→3 · เลื่อน 040/045/046 → S3 · **commit 26 → 29** · gate สลิปจริง §9.3 · ตัดสิน **028 AC1** = draft PR ล้มโดยตั้งใจ + `workflow_dispatch` deploy.yml บน branch → build/deploy skipped · แผน **048** = `post-deploy.yml` · FB-014/015/016 · UQ7–UQ10 · board (`board.mjs` set/add/edit) | ส่ง UQ7 (หมวด 7 ใบ), UQ8 (หมวดบริจาค), UQ9 (เครื่อง/เบราว์เซอร์ FB-016) ให้ผู้ใช้ · Daily Day 2: ให้ Dev ยืนยัน estimate 049 (5), 050b (3), 053 (2), 054 (1), 048 (+1) | รอคำตอบผู้ใช้ (ไม่ block งาน Dev) |

**Dev — ลำดับงานที่ปรับแล้ว (มีผลทันที):**
1. 028 AC1 failing-gate proof (≈ 15–20 นาที; ห้าม merge/push เข้า `main`)
2. 048 `post-deploy.yml` (e2e-live, lighthouse-live ×3, har-live synthetic) → ปลด 92 pts Done + tag `v0.1.0-uat` + ผล 029
3. 051 pair → **049** (5, ทุกแอป, gate payee ≥ 12/16)
4. **053** amount (High) ระหว่างรอ review 049
5. 050a → 050b (+Rabbit) → 054
6. Bundle merge + deploy **Day 3 EOD** (post-deploy.yml รันต่ออัตโนมัติ) · ทุก PR ยก `BASELINE` ใน `realSlips.test.ts`
7. Buffer: ตรวจว่าเลือกไฟล์รอบสอง **append หรือ replace** คิว (FB-016, ≤ 30 นาที) — รายงานใน Daily Day 2
- **ยกเลิกจาก sprint:** 040, 045, 046 (→ S3) · Checkpoint Day 2 บ่าย: ถ้า 049 ยังไม่ PR → ตัด 054 (cut order §9.4)

### Board snapshot (end of Day 1)

| Backlog (เลื่อน S3) | To Do | In Progress | QA | Done |
|---|---|---|---|---|
| 040, 045, 046 · ใหม่ 055, 056, 057 | 049 (5) · 053 (2, High) · 050a (3) · 050b (3) · 054 (1) · 051 (2) · 043 (3) · 029 (2) · stretch 003a/b, 041 (blocked B2) | 028 (1) · 048 (3) | — | 052 (1) · **042 (3)** |

**Burndown:** commit 29 · Done 4 · **remaining 25** (Day 1 of 5) · Sprint 1: 92 pts ยังรอ 048
