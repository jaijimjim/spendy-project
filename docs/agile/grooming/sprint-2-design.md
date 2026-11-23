# Sprint 2 Grooming — Designer (UI/UX) Input

> Author: Designer · Date: 2026-11-23 · Ceremony: Sprint 2 Backlog Grooming (Day 0)
> Inputs: `HANDOFF.md`, `sprints/sprint-2/00-grooming-agenda.md` (§6.1), `01-product-backlog.md` v4 (OMX-049, OMX-050, §9), `grooming/sprint-1-design.md`, `design/` (design-system §6.3/§6.16/§6.17, screens §6, copy-deck), code ที่ ship แล้ว: `src/features/review/ReviewCard.tsx`, `src/components/FormControls.tsx`, `src/domain/slip/categorize.ts`, `src/domain/slip/parseSlip.ts`, `src/features/add/AddSlipPage.tsx`, `src/features/add/GooglePhotosPanel.tsx`
> Design effort (เหมือน Sprint 1): **S** = ≤ ½ วัน · **M** = ~1 วัน · **L** = > 1 วัน
> ทุกข้อเสนอเป็น **proposal ให้ PO ตัดสิน** — Designer ไม่ได้แก้ backlog/code. ข้อเสนอที่ติดป้าย **[อยู่ใน scope?]** ต้องให้ PO ตัดสินว่าเป็นส่วนของ OMX-049/050 หรือเป็น item ใหม่

---

## 0. TL;DR

1. **Parser ผิดแล้ว UI เงียบ:** ช่องผู้รับว่างไม่มีการเตือนใด ๆ (ไม่มี flag, ไม่มี highlight, ไม่แสดงใน collapsed card) และหมวดหมู่ที่ผิดแต่ confidence = Medium (กรณี "จ่ายบิล" → Bills) **ไม่ highlight ที่ field** — มีแค่ badge "ควรตรวจ" ระดับ card. จาก 3 สลิปจริง (FB-011) field ที่ผิดทั้งหมด 5 จุด (ผู้รับ 3 + หมวด 2) ถูก highlight ที่ตัว field แค่ **1/5** (Lazada → Other, Low)
2. **ข้อเสนอขั้นต่ำ (แนะนำ, design S):** (D1) empty state ของช่องผู้รับ "ไม่พบผู้รับในสลิป — แตะเพื่อกรอก" และ (D2) highlight หมวดหมู่ตอน confidence Medium ด้วย + แก้ a11y ของ CategoryPicker ที่ไม่ผูกข้อความเตือน — ทั้งคู่ใช้ pattern §6.3 ที่มีอยู่แล้ว ไม่มี component ใหม่
3. **ข้อเสนอเพิ่ม (ไม่แนะนำให้เข้า Sprint 2 commit):** (D3) quick chip หมวดหมู่อันดับ 2, (D4) จดจำ merchant→category = OMX-035 (Won't) → ควรเป็น item ใหม่/backlog เดิม ไม่ใช่ส่วนของ 049/050
4. **Agenda §6.1:** Q1 ไม่ต้องมี badge ใหม่ · Q2 ไม่ต้องมี hint "จัดหมวดจากชื่อร้าน" ใน Sprint 2 · Q3 แสดงตามที่อ่านได้ (ไม่ normalize ชื่อ) · Q4 design QA 5 items ≈ 1.5 ชม. · Q5 OMX-046 copy พร้อมเสนอ, OMX-047 ไม่จำเป็นใน Sprint 2
5. **Design effort รวมที่เสนอเข้า Sprint 2:** ≈ 1.5 วัน Designer (D1 + D2 + copy deck + OMX-041 spec + OMX-046 copy + design QA) — ไม่มีงาน L

---

## 1. UX impact ของ BUG-009 / BUG-010 บนหน้า Review (สถานะปัจจุบัน — ตามที่ code ship จริง)

### 1.1 สิ่งที่ผู้ใช้เห็นวันนี้

| สถานการณ์ (FB-011) | Collapsed card (mobile) | Expanded form | Field highlight (§6.3) | Badge ระดับ card | Screen reader |
|---|---|---|---|---|---|
| **BUG-009 ผู้รับว่าง** (3/3 สลิป) | ไม่แสดง payee เลย (meta = วันที่ · เวลา · ธนาคาร) | ช่อง "ผู้รับ / แหล่งที่มา (ไม่บังคับ)" เป็น input ว่าง ไม่มี helper — copy deck มี `form.payeePlaceholder` ("เช่น ร้านข้าวมันไก่, บริษัท") แต่ ReviewCard ไม่ได้ใช้ | **ไม่มี** — `parseSlip` ไม่มี flag `noPayee` และ Field ของ payee ไม่รับ `warning` | ไม่กระทบ — payee ไม่อยู่ใน `minConfidence` จึงอาจได้ "มั่นใจ" (ไม่มี badge) ทั้งที่ผู้รับว่าง | อ่านแค่ "ผู้รับ, ไม่บังคับ, ช่องแก้ไข, ว่าง" |
| **BUG-010a "จ่ายบิล" + ไก่ย่าง → Bills** | chip "ค่าบิล" แสดงเหมือนผลปกติ | Category trigger แสดง Bills | **ไม่มี** — `catWarn` เกิดเฉพาะ `confidence === 'low'`; กรณีนี้ match จาก text → **Medium** | "ควรตรวจ" (Medium) — แต่ไม่บอกว่า field ไหน | ไม่มีข้อความเตือนที่ field |
| **BUG-010b ลาชาดาเพย → Other** | chip "อื่น ๆ" | Category trigger แสดง Other | **มี** border + icon + "ตรวจสอบช่องนี้" (Low) | "ไม่แน่ใจ" (Low) | ⚠ ข้อความเตือนมองเห็นได้ แต่ **ไม่ถูกอ่าน** เมื่อ focus ที่ trigger — `CategoryPicker` ตั้ง `aria-describedby` เฉพาะตอน `error` ไม่รวม `warning` (Amount/Date ทำถูกแล้ว) |

**ข้อค้นพบเพิ่ม (design debt จาก Sprint 1):**
- `design/screens.md` ตาราง coverage เขียนว่า OMX-009 = "payee, bank text tag in collapsed card meta" แต่ spec collapsed card ข้อ 3 และ code ไม่แสดง payee → spec ขัดกันเอง ผลคือผู้ใช้ไม่เห็นว่าผู้รับว่างจนกว่าจะขยาย card
- ผู้รับว่างมีผลต่อเนื่อง: หน้า Transactions ใช้ `payee || note || ชื่อหมวด` เป็นชื่อรายการ (`TransactionRow`) → รายการจากสลิป KBank ทุกใบจะชื่อ "ค่าบิล"/"อื่น ๆ" ซ้ำกัน และค้นหาด้วยชื่อร้าน (OMX-015) ไม่เจอ — นี่คือเหตุที่ BUG-009 กระทบผู้ใช้มากกว่าที่ "optional" field ดู

### 1.2 จำนวน tap ที่ต้องแก้ (mobile 375, card ที่ยังไม่ขยาย)

| งานแก้ | ขั้นตอน | Taps |
|---|---|---|
| กรอกผู้รับ | ขยาย card (1) → แตะช่องผู้รับ (1) → พิมพ์ชื่อ (keyboard; ต้องเปิดรูปสลิปดูชื่อ +2 tap: เปิด/ปิด image dialog) | **2 tap + พิมพ์** (4 ถ้าต้องเปิดรูป) |
| แก้หมวดหมู่ | ขยาย card (1) → แตะ category trigger (1) → เลือกใน grid (1, sheet ปิดเอง) | **3 tap** |
| ทั้งสองอย่างในใบเดียว | ขยายครั้งเดียว | **≈ 4 tap + พิมพ์** |
| 3 สลิป FB-011 | 3 × ผู้รับ + 2 × หมวด | **≈ 12 tap + พิมพ์ 3 ชื่อ** |

หมายเหตุ: card แรกที่ "ต้องตรวจ" ถูก auto-expand (screens §6) แต่เกณฑ์ "ต้องตรวจ" ไม่รวมผู้รับว่าง/หมวด Medium → กรณี BUG-010a card อาจไม่ถูกขยายให้เลย บน desktop ≥ 1024 form ขยายตลอดจึงไม่ต้อง tap ขยาย (−1 tap ต่อใบ)

### 1.3 ความเสี่ยงเชิง UX
- **Silent error สำคัญกว่า error ที่เห็น:** Low (Other) ผู้ใช้เห็นและแก้ · Medium (Bills) และผู้รับว่าง ผู้ใช้มักกด "บันทึกที่เลือก" ผ่านไป → dashboard หมวด Bills สูงเกินจริง (กระทบ OMX-019 ซึ่งเป็นคุณค่าหลักของแอป)
- Parser ที่ดีขึ้น (049/050) ลดจำนวนครั้ง แต่ **ไม่มี parser ไหนถูก 100%** บนสลิปจริงจากธนาคารที่ยังไม่เคยเห็น → UI ต้องบอกผู้ใช้ให้ตรวจเมื่อไม่แน่ใจ ไม่ว่า 049/050 จะผ่านหรือไม่

---

## 2. Design proposals (ช่วยแม้ parser ยังไม่สมบูรณ์)

| # | Proposal | ช่วยอะไร | Dev impact (Designer ประเมิน — Dev ยืนยัน) | Design effort | ข้อเสนอเรื่อง scope |
|---|---|---|---|---|---|
| **D1** | **Payee empty state:** เมื่อ parser ไม่พบผู้รับ (และ type = expense, ไม่ใช่สลิปเงินเดือน) → ช่องผู้รับใช้ pattern "needs review" §6.3 แบบ **info ไม่ใช่ warning**: placeholder + helper "ไม่พบชื่อผู้รับในสลิป — แตะเพื่อกรอก" (icon `Info`), หายเมื่อผู้ใช้พิมพ์ (`touched`). Collapsed card: แสดงบรรทัด payee (แก้ spec ขัดกันใน screens.md) และถ้าว่างแสดง "ไม่มีชื่อผู้รับ" สี muted | ทำให้ BUG-009 มองเห็นได้, ลด silent error, ผู้ใช้รู้ว่า field นี้มีประโยชน์ (ชื่อรายการ + ค้นหา) | flag `noPayee` ใน `parseSlip` + ส่ง `helper/warning` เข้า Field ของ payee + บรรทัดใน summary — คาด ≤ 1 pt | **S** | **[อยู่ใน scope?]** Designer เสนอเป็น **AC เพิ่มของ OMX-049** (AC4 เดิมกำหนด "payee stays empty — no wrong guess" อยู่แล้ว D1 คือ UI ของกรณีนั้น) หรือแยกเป็น item เล็ก 1 pt |
| **D2** | **Category Medium = highlight ที่ field ด้วย:** ขยาย `catWarn` ให้ครอบคลุม `confidence === 'medium'` เมื่อ `field === 'text'` (หมวดที่เดาจากข้อความทั้งสลิป ไม่ใช่จากชื่อผู้รับ) ใช้ข้อความเดิม `review.checkField` + **a11y fix:** `CategoryPicker` รับ `warning` และผูก `aria-describedby` เหมือน AmountInput/DateInput · card ที่มี highlight นี้นับเป็น "ต้องตรวจ" สำหรับ auto-expand | BUG-010a (Bills) จะถูก highlight แม้ precedence ยังผิด; a11y fix ปิดช่องโหว่ WCAG 1.3.1/3.3.1 ที่มีอยู่แล้ว | เปลี่ยนเงื่อนไข + prop 1 ตัว — คาด ≤ 1 pt (a11y fix ควรทำไม่ว่า D2 จะผ่านหรือไม่) | **S** | **[อยู่ใน scope?]** เสนอเป็น AC เพิ่มของ **OMX-050** (เกี่ยวกับ confidence ของหมวด) · a11y fix อาจนับเป็น bug แยก (ให้ QA เปิด BUG) |
| D3 | **Quick chip หมวดอันดับ 2:** ใต้ category trigger แสดง chip 1 อัน "หรือ: อาหาร" เมื่อ categorizer มี match ที่สองจากหมวดอื่น → แก้ได้ 1 tap (จาก 3) | ลด tap กรณีหมวดผิด | ต้องเปลี่ยน `categorize()` ให้คืน alternative (ปัจจุบันคืนผลเดียว) + test + ผลกระทบ golden — คาด 2 pts | M (states: ไม่มีอันดับ 2, type เปลี่ยน, 320px, desktop) | **ไม่แนะนำใน Sprint 2** — เป็น item ใหม่ (คู่กับ parked idea "amount alternative chips"). ถ้า 050 ทำ precedence ถูก คุณค่าของ D3 ลดลง → รอผล OMX-042 ก่อนตัดสิน |
| D4 | **จดจำ merchant → category ที่ผู้ใช้แก้:** เมื่อผู้ใช้เปลี่ยนหมวดของ payee เดิม ครั้งถัดไปเสนอหมวดนั้น (พร้อม hint "จากที่คุณเคยเลือก") | แก้ปัญหาระยะยาวกับร้านที่ rule ไม่รู้จัก | ต้องมี storage schema ใหม่, Settings จัดการ/ลบ rule, privacy copy — = **OMX-035 (Won't)** และขึ้นกับ 049 (ต้องมี payee ก่อน) | M–L (Settings UI + states + copy) | **ไม่ใช่ scope 049/050** — PO พิจารณาย้าย OMX-035 จาก Won't เป็น candidate Sprint 3 หลังเห็นผล 049 |

**สิ่งที่ Designer ไม่เสนอ (กัน scope creep):** ไม่เพิ่ม confidence badge ระดับ field ใหม่, ไม่ทำ "ตรวจทีละช่อง" wizard, ไม่แสดง keyword ที่ match ให้ผู้ใช้เห็น, ไม่เปลี่ยน layout Review

### 2.1 คำตอบ Agenda §6.1

| Q | คำตอบ Designer |
|---|---|
| **Q1** Payee จาก arrow layout ต้องมี confidence badge (Medium) ไหม | **ไม่ต้อง** — ระบบไม่มี confidence ระดับ field สำหรับ payee และการเพิ่ม badge ทำให้ card รก (ขัด R5/OMX-006: แสดงเฉพาะสิ่งที่ต้องทำ). ผู้รับที่อ่านได้แสดงเป็นค่าปกติ ผู้ใช้เห็นและแก้ได้ใน collapsed card (ถ้ารับ D1). สิ่งที่ต้องมี copy ใหม่คือกรณี **ไม่พบ** (D1) ไม่ใช่กรณีพบจาก anchor. Dev ไม่ควรลด overall confidence เพราะใช้ anchor แทน label |
| **Q2** Hint "จัดหมวดจากชื่อร้าน / Categorised by merchant" | **ไม่ใน Sprint 2** — ผู้ใช้ P3 ไม่ต้องรู้ว่าระบบตัดสินอย่างไร ต้องรู้แค่ว่า "ต้องตรวจไหม" (D2 ตอบตรงกว่า). ถ้า PO ต้องการ explainability ไว้ทำคู่กับ D4 ("จากที่คุณเคยเลือก") ใน item เดียวกัน |
| **Q3** แสดงชื่อที่ OCR เพี้ยน หรือชื่อแบรนด์ normalize | **แสดงตามที่อ่านได้ ("บลูเพย-ลาชาดาเพย")** — ผู้ใช้เทียบกับรูปสลิปได้, ไม่สร้างข้อมูลที่ไม่มีในสลิป, และไม่กระทบ OMX-015 (ค้นหา substring บน payee ที่เก็บจริง). ผู้ใช้แก้ชื่อได้เองในช่องผู้รับ. Normalize ใช้ภายใน categorizer เท่านั้น (OMX-050 AC4). ข้อเสียที่ยอมรับ: ค้น "Lazada" จะไม่เจอรายการนี้ → ทางแก้ระยะยาวคือ search ที่ค้นชื่อหมวดด้วย (Could, ไม่ใช่ Sprint 2) |
| **Q4** Per-story design QA (AI-5) | ตาราง §3.2 — 5 items รวม ≈ 1.5 ชม. |
| **Q5** OMX-046 / OMX-047 | OMX-046: เสนอ copy ใน §3 (S, พร้อมก่อน Day 1) · OMX-047: **ไม่จำเป็นใน Sprint 2** — auto theme ใช้งานได้แล้ว, ไม่ช่วย Sprint Goal; ถ้าเข้า stretch ต้องมี spec Settings card (S) ก่อน |

---

## 3. Candidates อื่นใน §9 ที่มี UI — Definition of Ready ฝั่ง design

### 3.1 สิ่งที่ต้องพร้อมก่อน Dev เริ่ม

| ID | งาน UI | ต้องมีก่อน Dev เริ่ม (Design DoR) | สถานะ | Design effort |
|---|---|---|---|---|
| **OMX-049** | ไม่มี UI ใหม่ถ้าไม่รับ D1 | ถ้ารับ D1: spec state ช่องผู้รับ (empty/filled/touched) + collapsed payee line + copy TH/EN 1 key ใหม่ (`review.noPayee`) + reuse 2 key เดิม | รอ PO ตัดสิน D1 | S |
| **OMX-050** | ไม่มี UI ใหม่ถ้าไม่รับ D2 | ถ้ารับ D2: เงื่อนไข highlight (Medium + `field: text`) + a11y annotation (`aria-describedby`) · ไม่มี copy ใหม่ (ใช้ `review.checkField`) | รอ PO ตัดสิน D2 | S |
| **OMX-041** Google Photos per-item Retry | Failed row ใน queue | **Reuse §6.16 Queue item** — code มี failed row + `common.retry` สำหรับ OCR อยู่แล้ว (`AddSlipPage`). ต้องเพิ่ม: (1) status/reason ใหม่ "ดาวน์โหลดไม่สำเร็จ" แยกจาก OCR failed, (2) thumbnail placeholder เมื่อยังไม่มีรูป (icon `ImageOff` + ชื่อไฟล์), (3) state "กำลังขอสิทธิ์ใหม่…" ระหว่าง re-consent (AC2), (4) สรุปบน panel แทน toast เดียว "ดาวน์โหลดไม่สำเร็จ 2 รูป" (ตอนนี้ `googlePhotos.downloadFailed` เป็น announce เดียว และถ้าล้มหมดจะเปลี่ยนเป็น error ของทั้ง panel — ต้อง spec ว่ายังคงแสดง row รายรูป), (5) copy TH/EN + `aria-live` ตาม AC3. **ไม่ต้องทำ mockup ภาพใหม่** — state table + copy เพียงพอ | ยังไม่มี — Designer ส่งได้ Day 1 | S |
| **OMX-046** Search placeholder 320px | Copy | ปัจจุบัน TH `transactions.searchPlaceholder` = "ค้นหาชื่อ บันทึก หรือจำนวนเงิน" / EN "Search name, note, amount" → เสนอ responsive placeholder: < 360px ใช้ `transactions.searchPlaceholderShort` "ค้นหา…" / "Search…"; ≥ 360px คงเดิม (AC1: 375px ไม่เปลี่ยน) · accessible name ยังมาจาก `transactions.searchLabel` ("ค้นหารายการ") และเพิ่ม hint เต็มผ่าน `aria-describedby` แบบ visually-hidden ถ้า placeholder ถูกย่อ · Dev ตรวจด้วย screenshot 320/375 TH+EN | พร้อม (ยืนยัน key จริงใน copy deck ก่อน merge) | S |
| **OMX-047** Theme switch | Settings card | Spec segmented 3 ตัวเลือก (reuse Language card pattern) + copy 4 key + ตาราง contrast เดิม | ทำเมื่อเข้า stretch เท่านั้น | S |
| **OMX-039** Received transfers | Settings "ชื่อของฉัน" | ต้องมี: list เพิ่ม/ลบชื่อ, ช่อง 4 หลักบัญชี, privacy copy, empty state, validation · **ไม่พร้อมสำหรับ Sprint 2** ถ้าไม่มี spec — ต้องการ M ก่อน Dev เริ่ม | ยังไม่มี | M |
| OMX-003a/b | ไม่มี UI ใหม่ (spec Sprint 1 ครอบคลุม) | — | ✔ | — |
| OMX-043 | ไม่ใช่งาน design — Designer ร่วม review ผล screen reader (VoiceOver/TalkBack) ของ Review card | — | — | S (เวลา review) |
| OMX-028/048/029/042/044/040/045 | ไม่มี UI (044 virtualization ต้องคง sticky date header + focus order เดิม — QA ตรวจ) | — | — | — |

### 3.2 Per-story design QA (retro AI-5)
Design QA = Designer ตรวจ build ก่อน PO accept: screenshot 375 + 1024, TH + EN, keyboard/focus, ข้อความ screen reader

| Item | ตรวจอะไร | เวลา |
|---|---|---|
| OMX-049 (+D1) | payee empty/filled ใน collapsed + expanded, ความยาวชื่อร้านยาว (ellipsis ไม่ตัดสระ) | 20′ |
| OMX-050 (+D2) | highlight Medium, VoiceOver อ่านข้อความเตือนบน category trigger | 20′ |
| OMX-041 | failed row, retry, re-consent state, live announcement | 20′ |
| OMX-046 | 320/375 TH+EN | 10′ |
| OMX-047 (ถ้าเข้า) | ทั้ง 3 theme, contrast | 20′ |
| **รวม** | | **≈ 1.5 ชม.** |

---

## 4. i18n TH/EN และ a11y

### 4.1 Copy ใหม่ที่เสนอ (เพิ่มใน `design/copy-deck.json` เมื่อ PO รับ — Designer เป็นคนเพิ่ม, Dev ไม่ hard-code)

| Key (proposal) | TH | EN | ใช้กับ |
|---|---|---|---|
| `review.noPayee` | ไม่พบชื่อผู้รับในสลิป — แตะเพื่อกรอก | No recipient found on the slip — tap to add | D1 helper ใต้ช่องผู้รับ |
| `transactions.noPayee` *(มีอยู่แล้ว — reuse)* | ไม่ระบุผู้รับ | No payee | D1 collapsed card (สี muted) |
| `form.payeePlaceholder` *(มีอยู่แล้ว — แค่ต่อเข้า ReviewCard)* | เช่น ร้านข้าวมันไก่, บริษัท | (ตามที่มีใน copy deck) | D1 placeholder (ไม่ใช่แทน label) |
| `queue.status.downloadFailed` | ดาวน์โหลดไม่สำเร็จ | Download failed | OMX-041 |
| `queue.failedReason.network` *(ใหม่ — ปัจจุบันมีแค่ corrupt/model/unknown)* | ไม่มีการเชื่อมต่อ ลองใหม่อีกครั้ง | No connection. Try again. | OMX-041 |
| `queue.failedReason.auth` | สิทธิ์ Google หมดอายุ แตะลองใหม่เพื่อเข้าสู่ระบบอีกครั้ง | Google access expired. Tap Retry to sign in again. | OMX-041 AC2 |
| `googlePhotos.reauthorizing` | กำลังขอสิทธิ์ Google ใหม่… | Asking Google for access again… | OMX-041 AC2 |
| `googlePhotos.downloadFailedCount_one/_other` | ดาวน์โหลดไม่สำเร็จ {{count}} รูป | {{count}} photo couldn't be downloaded / {{count}} photos couldn't be downloaded | OMX-041 summary |
| `review.retryItem` *(aria-label)* | ลองดาวน์โหลด {{name}} ใหม่ | Retry downloading {{name}} | ปุ่ม Retry ต่อ row (ต้องระบุว่า row ไหน) |
| `transactions.searchPlaceholderShort` | ค้นหา… | Search… | OMX-046 (< 360px) |

**กฎ copy (ต่อจาก Sprint 1 X5):**
- ข้อความ error/empty = "เกิดอะไร + ทำอะไรต่อ" ไม่โทษผู้ใช้ ("ไม่พบ…ในสลิป" ไม่ใช่ "คุณยังไม่ได้กรอก")
- "แตะ/tap" ใช้ได้เพราะแอป mobile-first แต่ desktop ก็เข้าใจ — ไม่ต้องมี variant "คลิก"
- Plural ใช้ `_one/_other` ของ i18next ทั้ง TH/EN (TH ใช้ข้อความเดียวกันได้)
- EN ยาวกว่า TH ~30% → ตรวจที่ 320px ว่า helper ขึ้นบรรทัดใหม่ได้ ไม่ truncate
- ชื่อผู้รับ/ร้านจาก OCR แสดงตามต้นฉบับ ไม่แปล ไม่ normalize (Q3) และใส่ `lang` ไม่ได้ (ไม่รู้ภาษา) → ปล่อยให้สืบทอดจากหน้า

### 4.2 a11y requirements

| # | Requirement | อ้างอิง |
|---|---|---|
| A1 | ข้อความเตือน/empty ของทุก field (รวม payee D1 และ category D2) ต้องผูกกับ control ด้วย `aria-describedby` — **แก้ CategoryPicker ที่ปัจจุบันผูกเฉพาะ error** | WCAG 1.3.1, 3.3.1 |
| A2 | Highlight ต้องเป็น border + icon + ข้อความ (ไม่ใช่สีอย่างเดียว); icon `aria-hidden`, ข้อความเป็น text จริง | §6.3, WCAG 1.4.1 |
| A3 | ไม่ประกาศ `aria-live` ทุกครั้งที่ card render ข้อความเตือน (จะรบกวนเมื่อมีหลายใบ) — อ่านเมื่อ focus field ผ่าน describedby เท่านั้น · ยกเว้นการเปลี่ยนสถานะ queue (OMX-041 AC3) ใช้ region `role="status"` ที่มีอยู่ (`announce`) | Sprint 1 OMX-005 |
| A4 | Collapsed card: ชื่อผู้รับ/“ไม่มีชื่อผู้รับ” เป็นส่วนของเนื้อหา card ที่ screen reader อ่านตามลำดับ (ไม่ใช่ใน `aria-label` ของปุ่ม) | screens §6 A11y |
| A5 | ปุ่ม Retry ต่อ row มี accessible name ระบุรูป (`review.retryItem`) — ไม่ใช่ "ลองใหม่" ซ้ำหลายปุ่ม; target ≥ 44×44 | WCAG 2.4.6, 2.5.8 |
| A6 | Error ระดับ panel (Google Photos ล้มทั้งหมด) ใช้ `role="alert"` ตามเดิม; error รายรูปไม่ใช้ `alert` (ใช้ status) เพื่อไม่ขัดจังหวะซ้ำ | — |
| A7 | Placeholder ไม่ใช่ label: ช่องผู้รับยังมี `<label>` "ผู้รับ / แหล่งที่มา"; search ที่ 320px คง label `transactions.searchLabel` + hint เต็มแบบ visually-hidden | WCAG 3.3.2 |
| A8 | QA ตรวจด้วย axe (0 critical/serious) + VoiceOver iOS / TalkBack Android อย่างน้อย 1 รอบใน OMX-043 สำหรับ Review card ที่มี payee ว่าง + category Medium | OMX-043 |

---

## 5. Questions

### ถึง PO
1. **D1 (payee empty state)** และ **D2 (Medium highlight + a11y fix)** — รับเป็น AC เพิ่มของ OMX-049/050 หรือแยกเป็น item ใหม่ (≈ 1 pt ต่อข้อ)? Designer แนะนำรวมใน 049/050 เพราะเป็น UI ของ AC ที่มีอยู่ (049 AC4, 050 AC3 Medium)
2. **D3 / D4** — ยืนยันว่าไม่อยู่ใน Sprint 2; D4 จะ revive OMX-035 ใน Sprint 3 หรือไม่ (ตัดสินหลังผล OMX-042)
3. ช่องผู้รับยัง "ไม่บังคับ" ต่อไปใช่ไหม? (Designer แนะนำคงไว้ — D1 เป็นการชวน ไม่ใช่บังคับ; ไม่ block Save)
4. OMX-047 ไม่เข้า Sprint 2 ได้ไหม (ไม่ช่วย Sprint Goal)
5. แก้ spec ขัดกันใน `design/screens.md` (payee ใน collapsed card) — ให้ Designer อัปเดตหลัง grooming หรือไม่

### ถึง Dev
1. D1: เพิ่ม `flags.noPayee` ใน `parseSlip` ได้ไหมโดยไม่กระทบ overall `confidence` (Designer เสนอ **ไม่** ลด confidence badge เพราะผู้รับเป็น optional)? ควรยกเว้นกรณีไหนบ้าง (income, salary, ได้รับเงินโอน)
2. D2: `categoryResult.field === 'text'` + `medium` เป็นเกณฑ์ที่ถูกไหม หลัง OMX-050 เปลี่ยน precedence จะมีเคสไหนเป็น Medium เพิ่ม/ลด (เช่น "จ่ายบิล" alone = Medium ตาม 050 AC3) — จะเกิด highlight บ่อยเกินไปบนสลิปปกติไหม
3. OMX-041: reuse queue row component ของ OCR failed ได้ตรง ๆ หรือต้องแยก state "download failed" ใน `queueStore`? ถ้าทุกรูปล้ม ยังคง row รายรูปแทน panel error ได้ไหม
4. D3 ถ้าทำในอนาคต: `categorize()` คืน alternative ได้ราคาเท่าไร

### ถึง QA
1. ช่วยเปิด bug แยกสำหรับ **CategoryPicker ไม่ผูก warning กับ `aria-describedby`** (ยืนยันด้วย axe/VoiceOver) — severity Medium?
2. Test case ใหม่ถ้ารับ D1/D2: payee ว่าง → helper แสดง/หายเมื่อพิมพ์, category Medium → highlight + auto-expand, ทั้ง TH/EN และ 320px
3. Fixture OMX-049/050 (redacted) ขอใช้ทำ screenshot design QA ได้ไหม — Designer ต้องเห็นความยาวชื่อร้านจริงหลัง redact (เช่น biller "...FOOD" ยาว) เพื่อตรวจ ellipsis
4. OMX-041 e2e (stub wrapper) ครอบคลุม re-consent state และ live announcement ตาม copy ใหม่หรือไม่

---

## 6. Design effort summary (Sprint 2)

| Work | Effort | ส่งเมื่อ |
|---|---|---|
| D1 payee empty state spec + copy | S (~2 ชม.) | ก่อน Planning / Day 1 (ถ้า PO รับ) |
| D2 category Medium highlight + a11y annotation | S (~1 ชม.) | ก่อน Planning / Day 1 (ถ้า PO รับ) |
| OMX-041 failed-row state table + copy | S (~3 ชม.) | Day 1 |
| OMX-046 copy + responsive rule | S (~30′) | ก่อน Planning |
| Copy deck v2 (key ใหม่ทั้งหมด TH/EN) + แก้ screens.md | S (~1 ชม.) | Day 1 |
| Design QA (AI-5) | ≈ 1.5 ชม. กระจายตลอด sprint | ตามที่ story พร้อม |
| **รวมที่เสนอ** | **≈ 1–1.5 วัน Designer** | |
| *ไม่รวม:* D3 (M), D4/OMX-035 (M–L), OMX-039 Settings (M), OMX-047 (S) | | ถ้า PO ดึงเข้า |
