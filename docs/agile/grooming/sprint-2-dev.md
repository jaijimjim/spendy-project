# Grooming — Sprint 2 · Developer Input

> Author: Dev · Date: 2026-11-23 · Ceremony: Backlog Grooming (Sprint 2, Day 0)
> Inputs: `sprints/sprint-2/00-grooming-agenda.md` (§6.2), `01-product-backlog.md` v4 (§4 note, §7 OMX-049/050, §9), `HANDOFF.md` §4, `docs/adr/0001–0003`, source `src/domain/slip/*`
> Scale: Fibonacci 1, 2, 3, 5, 8 · สถานะ: **ข้อเสนอจาก Dev** — ตัวเลขสุดท้ายตกลงใน planning poker แล้ว PO อัปเดต backlog

---

## 0. TL;DR

| Item | Dev view |
|---|---|
| **OMX-049** (BUG-009) | **3 pts — ยืนยัน** · anchor = บรรทัดเลขบัญชี masked ตัวแรก → ชื่อผู้รับ = บรรทัด name-like ถัดไปก่อนบัญชี/ID บรรทัดถัดไป · label rule เดิมรันก่อนเสมอ |
| **OMX-050** (BUG-010) | **5 pts รวม → เสนอแตก 050a (3) + 050b (2)** · 050a = tier weak/strong + keyword ร้านอาหารไทย (เช่น "ไก่ย่าง") · 050b = fuzzy matcher (confusable-char folding) สำหรับ Lazada/Shopee |
| Root cause (ยืนยันด้วย spike) | BUG-009: `parties.ts` หา payee **จาก label เท่านั้น** · BUG-010: `categorize.ts` ตัดสิน "longest keyword wins" ทั้ง text → "จ่ายบิล" (7 ตัว) ชนะ "Food" (4 ตัว) และ "ไก่ย่าง" **ไม่มีใน rules เลย** · "ลาชาดา" ไม่ match "Lazada" เพราะ matcher เป็น exact (case/space-insensitive เท่านั้น) |
| ข้อค้นพบสำคัญจาก spike | (1) แก้ 049 อย่างเดียว **ไม่ทำให้** สลิปไก่ย่างเป็น food — ต้องมี 050a ด้วย (2) "พ.ุย." แก้ไปแล้วใน BUG-001 (`slipDate.ts`) — date ถูกอยู่แล้ว (3) "ชําระเจิน" ทำให้ type ตกไป rule `weak` (ยัง expense แต่ confidence Medium) |
| Benchmark gap | Layer B (`tests/fixtures/slips/expected.json`) **ไม่มี field payee** → OMX-049 AC7 ("payee ไม่แย่กว่า baseline") วัดไม่ได้ตอนนี้ — ต้องเพิ่ม payee ใน expected + benchmark spec ก่อน (QA/Dev, ~0.5 pt รวมใน 049) |
| Deploy (028/048) | Workflow ไม่ต้องแก้เพื่อให้ผ่าน — รอ B3 (UQ2) เท่านั้น · hardening เสนอเป็น task เล็ก (≤ 1 pt) ไม่บังคับ |

---

## 1. Root-cause Analysis (โค้ดจริง)

Pipeline: `parseSlip()` (`src/domain/slip/parseSlip.ts`) → `normalizeText()` (`normalize.ts`) → `detectType()` (`type.ts`) → `extractAmount()` → `extractParties()` (`parties.ts`) → `categorize()` (`categorize.ts` + `categories.rules.ts`)

### 1.1 BUG-009 — ผู้รับใต้ลูกศร ↓ (make by KBank / K PLUS)

| จุด | โค้ด | ผล |
|---|---|---|
| `extractParties()` | `const payee = labelledValue(lines, PAYEE_LABEL)` | payee มาจาก **label เท่านั้น** ไม่มี fallback ตาม layout |
| `PAYEE_LABEL` | `^(?:ไปยัง\|ไปที่\|ถึง\|โอนไป\|ผู้รับเงิน\|…\|To\|Payee)…` anchored `^` | สลิป arrow layout ไม่มีบรรทัดใดขึ้นต้นด้วยคำเหล่านี้ → `labelledValue` คืน `{ value: null }` |
| `parseSlip()` | `payee = parties.payee ?? null` | payee ว่าง → Review ว่าง (ไม่เดาผิด — ตรงกับ AC4 เดิม) |
| ผลกระทบต่อ category | `categorize()` ข้าม payee match **และ** ข้าม person rule (`looksLikePerson(input.payee)`) | สลิปโอนให้บุคคลแบบ arrow layout ได้ `other` แทน `transfer` (spike S1) — BUG-009 จึงทำให้ category ผิดด้วย |
| `ACCOUNT_RE` | `[xX*\d]{3}-[xX*\d]-[xX*\d]{5}-[xX*\d]` | รองรับ `XXX-X-X1234-X` แล้ว แต่ **ไม่รองรับ** `×`, ช่องว่างรอบ `-`, หรือ `—`/`–` → ต้องขยายเมื่อใช้เป็น anchor (AC2) |

ข้อสังเกต: fixture เดิม `kplus-food-grabfood` (`__fixtures__/ocrText.ts`) มีบรรทัด "ไปยัง" อยู่ ซึ่งเป็น layout ที่เราเดาไว้ตอน Sprint 1 — สลิปจริงไม่มีป้ายนี้ จึงไม่มี test ใดจับ layout จริงได้

### 1.2 BUG-010 — "จ่ายบิล" ชนะชื่อร้าน / Lazada ไม่ match

| # | จุด | โค้ด | ผล |
|---|---|---|---|
| a | `categories.rules.ts` `bills` | `'จ่ายบิล'` อยู่ในรายการ keyword เดียวกับ biller จริง (การไฟฟ้า, MEA, AIS …) | คำบอก**ประเภทธุรกรรม**ถูกปฏิบัติเหมือนชื่อ biller |
| b | `bestMatch()` ใน `categorize.ts` | เลือก **keyword ที่ยาวที่สุด** แล้วค่อย `priority` | ใน field `text`: "จ่ายบิล" (7) > "Food" (4) → `bills`; และ `bills` priority 60 สูงสุดอยู่แล้ว |
| c | `food` keywords | ไม่มี "ไก่ย่าง", "ส้มตำ" มี แต่ไม่มีชื่ออาหาร/ร้านทั่วไปอื่น ๆ | ต่อให้ payee ถูก (หลัง 049) payee "ร้านไก่ย่าง…" ก็ไม่ match → ตกไป text → `bills` (spike S4) |
| d | `keywordRegex()` ใน `keywords.ts` | exact match (ไม่สนตัวพิมพ์/ช่องว่างเท่านั้น) | "ลาชาดา" ≠ "ลาซาด้า" ≠ "Lazada"; ไม่มี keyword ภาษาไทยของ Lazada/Shopee เลย → `other` (spike S3) |
| e | `normalizeText()` (R4) | แก้ `ํา→ำ` แล้ว แต่ไม่ fold ตัวอักษรที่ OCR สับกัน | "ชําระเจิน" → "ชำระเจิน" ไม่ match `ชำระเงินสำเร็จ` ใน `TRANSFER_STRONG` → type ตก rule `weak` (ยังถูกเพราะมี "K+/กสิกรไทย") |

### 1.3 Spike result (รันนอก repo, ไม่ commit)

Synthetic OCR text 4 ชิ้น (ชื่อ/เลขบัญชีปลอม เลียนแบบ arrow layout) ใน `/tmp/omx-spike/spike.ts` → bundle ด้วย `esbuild` ของโปรเจกต์ → `node` (ไม่มีไฟล์ใน repo)

| Fixture | Expected | Actual (โค้ดปัจจุบัน) | ยืนยัน |
|---|---|---|---|
| S1 โอนให้บุคคล, `XXX-X-X1234-X` → `↓` → `น.ส. …` | payee = ชื่อผู้รับ, `transfer` | payee `null`, category `other` (field default) | BUG-009 ✔ |
| S2 "จ่ายบิลสำเร็จ" + `V` (ลูกศรเพี้ยน) + "ร้านไก่ย่าง…" + "… FOOD" | payee = ร้าน, `food` | payee `null`, `bills` (keyword "จ่ายบิล", field text) | BUG-009 + BUG-010 ✔ |
| S3 "ชําระเจินสำเร็จ" + `\|` + บรรทัดขยะ + "บลูเพย-ลาชาดาเพย" | payee = ร้าน, `shopping` | payee `null`, `other`; type rule `weak` | BUG-009 + BUG-010 ✔ |
| S4 มีป้าย "ไปยัง" + "ร้านไก่ย่าง…" + "จ่ายบิลสำเร็จ" | `food` | payee ถูก แต่ `bills` | 049 อย่างเดียวไม่พอ ✔ |

ส่วนที่ **ถูกอยู่แล้ว** ทุกชิ้น: amount, time, date (รวม "พ.ุย." → 2026-11-14 เพราะ BUG-001 regex `พ[.ุ]{0,2}\s?ย…` ใน `slipDate.ts`), type = expense → สอดคล้องกับ FB-011 (ยอด/วันที่/เวลา/ประเภท 3/3) · spike เสริม: masked account แบบ `×××-×-×1234-×` + ป้าย "ไปยัง" ยังได้ payee ถูก (label path ไม่พึ่ง ACCOUNT_RE)

---

## 2. Technical Approach

### 2.1 OMX-049 — Arrow / second-account-line anchor (`parties.ts`)

ลำดับใน `extractParties()`:
1. **Label rule เดิม** (`labelledValue(PAYEE_LABEL)`) — ถ้าได้ค่า ใช้เลย (AC5)
2. ถ้าไม่ได้ → `arrowLayoutPayee(lines)` (ใหม่, pure function):
   - **Anchor** = บรรทัดแรกที่ match `MASKED_ACCOUNT_RE` (ขยายจาก `ACCOUNT_RE`: `[xX×*\d]`, ยอม `\s*[-–—]\s*`, รูปแบบ `xxx-x-x####-x`, `xxx-xxx-####`, PromptPay `xxx-xxx-####`/e-wallet 15 หลัก masked). ต้องเป็น **บัญชีผู้โอน** คือ anchor ตัวแรกที่อยู่หลังบรรทัดหัวสลิป/วันที่ — ถ้าเจอ anchor ตัวเดียวและเป็นบรรทัดสุดท้ายของ block → ไม่เดา
   - **Skip** สูงสุด 3 บรรทัดที่เป็นขยะ: ลูกศร/สัญลักษณ์ (`↓ V v J \| + ⬇ ↡`), บรรทัด ≤ 2 ตัวอักษรที่ไม่ใช่ชื่อ, บรรทัดที่อักขระ non-letter > 50%, บรรทัดชื่อธนาคาร (`BANK_NOISE`)
   - **Name-like line** = มีตัวอักษรไทย/อังกฤษ ≥ 3 ตัว, ไม่ match `ACCOUNT_RE`/ตัวเลขล้วน/`REF_LABEL`/amount label/`Biller ID`/`รหัสร้านค้า`/`Service code`, ไม่ใช่วันที่-เวลา
   - **Stop** เมื่อเจอบรรทัด account/ID ถัดไป (= เลขบัญชีผู้รับ / Biller ID) → ถ้ายังไม่ได้ชื่อ = `null`
   - คืน `{ value, account, source: 'arrow' }` → `payeeAccount` = account บรรทัดถัดไป (masked)
3. **กันชื่อผู้โอน (AC4):** ชื่อที่ได้ต้อง ≠ บรรทัด name-like ที่อยู่**ก่อน** anchor (ชื่อผู้โอน) หลัง `normalizePayee()`; ถ้าเท่ากัน → `null`
4. **Bill/merchant (AC3):** ใช้ rule เดียวกัน — บรรทัดแรกหลัง anchor ที่ name-like คือชื่อร้าน ("ร้านไก่ย่าง…"); บรรทัด "… FOOD" (biller name บรรทัดสอง) เก็บเป็น `payeeExtra` ให้ categorizer ใช้ (ดู 2.2) แต่ไม่ต่อเข้า payee ที่แสดง
5. เพิ่ม `payeeSource: 'label' | 'arrow' | null` ใน `Parties`/`ParsedSlip` → Designer ใช้แสดง confidence Medium ได้ (§6.1 Q1); ไม่เปลี่ยน schema storage (`ADR-0003`) เพราะเป็น field ของ draft เท่านั้น

Scope: ใช้ fallback นี้ **ทุก bank** หรือเฉพาะ `bank === 'kplus'`? → Dev เสนอ **ทุก bank แต่ต้องมี anchor masked account** (เงื่อนไขแคบพออยู่แล้ว) และให้ Layer A ทั้งชุดเป็นตัวจับ regression; ถ้า fixture ธนาคารอื่นพัง → จำกัดเป็น kplus

### 2.2 OMX-050a — Precedence: merchant/biller > transaction-type phrase (`categories.rules.ts`, `categorize.ts`)

- เพิ่ม `TX_PHRASES` (weak tier) แยกจาก `CATEGORY_RULES` ในไฟล์ rules เดียวกัน (R6): `จ่ายบิล`, `ชำระบิล`, `ชำระเงิน`, `โอนเงิน`, `Bill Payment`, `Payment` → map ไป `bills` เฉพาะ `จ่ายบิล/ชำระบิล/Bill Payment`; ที่เหลือไม่มี category (ใช้แค่เป็น signal)
- ลบ `'จ่ายบิล'` ออกจาก `bills.keywords`
- `categorize()` ใหม่: payee → **payeeExtra (biller บรรทัดสอง)** → memo → person → text (strong keywords เท่านั้น) → **weak tier** (`bills`, confidence **Medium** — AC3) → `other`
- เพิ่ม keyword อาหารไทยที่เป็นชื่อร้านทั่วไป (สลิปจริงแสดงว่าชื่อร้านมักเป็นชื่อเมนู): `ไก่ย่าง`, `ไก่ทอด`, `หมูปิ้ง`, `ข้าวมันไก่`, `ข้าวขาหมู`, `ก๋วยจั๊บ`, `ราดหน้า`, `ผัดไทย`, `ร้านข้าว`, `ครัว` (ระวัง — ดู risk), `ShopeeFood`
- "Food" ใน biller: คงเป็น keyword `food` (มี word boundary แล้ว); เมื่อไม่โดน "จ่ายบิล" แย่ง จะชนะเอง
- **Type detection ไม่เปลี่ยน:** `type.ts` ใช้ `จ่ายบิลสำเร็จ` ใน `TRANSFER_STRONG` แยกอยู่แล้ว → OMX-006 ไม่กระทบ (ตอบ §6.2 Q3)
- **กระทบ OMX-010 AC2** (precedence ในเอกสาร) → PO ต้องอัปเดต §4 note v4 เป็น rule จริง + doc comment หัว `categories.rules.ts`

### 2.3 OMX-050b — Fuzzy matcher ทน OCR noise ไทย (`keywords.ts`)

เปรียบเทียบ 2 วิธี (ตอบ §6.2 Q4):

| | A. Confusable-char folding (**เสนอ**) | B. Bounded edit distance (Levenshtein ≤ 1–2) |
|---|---|---|
| วิธี | fold ทั้ง text และ keyword ด้วยตาราง: ตัดวรรณยุกต์ `่ ้ ๊ ๋` + การันต์ `์` + ไม้ยมก/ไม้ไต่คู้ `ๆ ็`; กลุ่มพยัญชนะสับ: `ซ↔ช`, `ด↔ต`(ระวัง), `บ↔ป`, `ผ↔พ`, `ฝ↔ฟ`, `ง↔จ`(จาก "เจิน"), `ฎ/ฏ→ด/ต`; Latin: `0↔O`, `1↔l↔I`, `rn↔m` แล้วใช้ regex เดิม (ยังคง word boundary R4 สำหรับ Latin) | sliding window เทียบทุก substring ยาว ≈ keyword |
| False positive | ต่ำ — fold แบบ deterministic, จำกัดเฉพาะ keyword ที่ flag `fuzzy: true` และยาว ≥ 5 ตัวหลัง fold (AC6) | สูงกว่าในภาษาไทย (คำสั้น, ไม่มี word boundary) — "ลาซาดา" ระยะ 1 จากคำอื่นได้ง่าย |
| Word boundary | คงได้ (regex เดิม) | ต้องเขียนเอง |
| Performance | O(n) ต่อ keyword; fold text ครั้งเดียวต่อสลิป, cache regex — ไม่มีผลที่วัดได้ (< 1 ms) | O(n·m) ต่อ keyword × ทุก keyword — ยังเล็ก แต่ไม่จำเป็น |
| อธิบาย/ทดสอบ | table-driven ง่าย ("fold(x) == fold(y)") | threshold ต้องจูน |

เสนอ: **A เป็นหลัก** + ถ้า fixture จริงต้องการ ให้ B เป็น opt-in ต่อ keyword (`maxEdits: 1`) เฉพาะ Latin ≥ 6 ตัว (เช่น `LAZADA`/`SHOPEE`) — ไม่ทำใน Sprint 2 ถ้าไม่จำเป็น

Keyword เพิ่มใน `shopping` (flag fuzzy): `ลาซาด้า`, `ลาซาด้าเพย์`, `LazPay`, `ช้อปปี้`, `ช้อปปี้เพย์`, `Shopee Pay` → หลัง fold "ลาชาดาเพย" = fold("ลาซาด้าเพย์") ✔, "บลูเพย-…" ไม่ต้องมี keyword ของตัวเอง

**OCR noise อยู่ layer ไหน (§6.2 Q5):** fold ทำ **เฉพาะใน keyword matcher** (`containsKeyword` แบบ fuzzy) — **ไม่** ใส่ใน `normalizeText()` เพราะ (1) date parser มี regex เฉพาะของตัวเองแล้ว ("พ.ุย." ผ่าน — spike) (2) การตัดวรรณยุกต์/สลับพยัญชนะใน text ที่เก็บเป็น payee/memo/rawText จะทำให้ข้อความที่ผู้ใช้เห็นเพี้ยนและกระทบ duplicate detection (`normalizePayee`) · ข้อยกเว้นเดียวที่ควรทำใน type detection: เปิด fuzzy ให้ `TRANSFER_STRONG` (`ชำระเงินสำเร็จ` ↔ "ชําระเจินสำเร็จ") เพื่อคืน confidence High — ทำได้ใน 050b โดยไม่เปลี่ยน normalize

Display (§6.1 Q3 — Designer ตัดสิน): parser ส่ง `categoryResult.keyword` (keyword canonical เช่น `Lazada`) อยู่แล้ว → แสดงชื่อดิบเป็น payee + hint "จัดหมวดจาก: Lazada" ได้โดยไม่แก้ payee

### 2.4 Regression risks

| # | Risk | L / I | Mitigation |
|---|---|---|---|
| R1 | Arrow fallback ดึง**ชื่อผู้โอน**หรือชื่อธนาคาร/บรรทัด QR ขยะมาเป็น payee บนสลิปธนาคารอื่น | M / H | เงื่อนไข anchor + sender-equality guard + junk filter; negative fixtures (SCB/KTB/received/salary) ต้องคง payee เดิม; ถ้าไม่แน่ใจ → `null` |
| R2 | Received slip (b07/b08, `received-*`) — arrow layout ของ "รับเงิน" ชื่อใต้ลูกศรคือ**เรา** | M / M | ใช้ arrow fallback เฉพาะ `type === 'expense'` (parseSlip ใช้ `parties.payee` เฉพาะ non-salary อยู่แล้ว) ; OMX-039 จะใช้ข้อมูลนี้ต่อ |
| R3 | ลด "จ่ายบิล" เป็น weak ทำให้บิลจริงที่ OCR อ่านชื่อ biller ไม่ออกได้ confidence ต่ำลง (High → Medium) | H / L | ตั้งใจตาม AC3; Layer A ที่ expect `bills` ยังผ่าน (category เดิม) แต่ test ที่ assert confidence ต้องอัปเดต — QA รับรู้ |
| R4 | Fuzzy folding ทำให้ keyword สั้น match ผิด (เช่น fold "บ้าน" ↔ "ป้าน", "ด↔ต" กับชื่อคน) | M / M | fuzzy เฉพาะ keyword flag + ยาว ≥ 5 หลัง fold; ไม่ fold `ด↔ต` ในรอบแรก; negative fixtures ≥ 20 (ชื่อคนสมมติ, merchant อื่น, 27 Layer B text) = 0 FP (AC6) |
| R5 | Keyword อาหารไทยใหม่ ("ครัว", "ข้าว" มีอยู่แล้ว) ชนชื่อบริษัท/ที่อยู่ ("ครัวซองต์"→ ok, "บจก. ข้าวทิพย์ ประกันภัย") | M / L | ไม่เพิ่ม "ครัว" ถ้าไม่มี fixture รองรับ; ใช้ longest-match เดิมภายใน tier strong |
| R6 | `ACCOUNT_RE` ที่ขยาย (`×`, ช่องว่าง) กระทบ `cleanName()`/ref ที่ใช้ regex เดียวกัน | L / M | ใช้ `MASKED_ACCOUNT_RE` แยกสำหรับ anchor ก่อน; รวมทีหลังเมื่อ test ครบ |
| R7 | Layer B benchmark ไม่มี payee → regression ของ payee บน OCR จริงมองไม่เห็น | H / M | เพิ่ม `payee` ใน `tests/fixtures/slips/expected.json` + เก็บใน `benchmark-results.json` (report เท่านั้น ไม่ gate) ก่อนเริ่มแก้ → ได้ baseline Sprint 1 |

### 2.5 วิธีวัด (measurement)

1. **Layer A unit (CI gate):** fixture ข้อความ OCR **สังเคราะห์หรือ redact แล้วเท่านั้น** ใน `src/domain/slip/__fixtures__/` (เพิ่มไฟล์ `kbankArrow.ts` หรือใน `qaGolden.ts` ตาม QA) — อย่างน้อย: transfer→บุคคล, bill ไก่ย่าง/FOOD, Lazada noisy, Shopee variants, arrow หาย, arrow = `V/J/|/+`, บรรทัดขยะ QR/การ์ตูน, `×`/ช่องว่างใน masked account, no-anchor (payee `null`), received arrow layout (ไม่ดึงผู้รับ) — table-driven ใน `parseSlip.test.ts`/`typeAndCategory.test.ts` · **ห้ามใช้หรือ commit รูปสลิปจริง** และ OCR text ดิบที่ยังไม่ redact
2. **Unit เฉพาะส่วน:** `arrowLayoutPayee()` และ `fold()` เป็น pure function → test ตรง, รวม negative list สำหรับ AC6
3. **Layer B (OCR benchmark 27 สลิปสังเคราะห์เดิม):** `npm run build && npx playwright test --project=real-ocr benchmark` ก่อน/หลัง — gate: type 100%, amount ≥ 96.3%, category 100%, date 100%; payee exact-match % รายงานเทียบ baseline (R7). ถ้าทีมทำ option B ของ UQ1 → เพิ่มภาพสังเคราะห์ arrow layout 2–3 ใบใน `tests/fixtures/slips/templates` (สร้างด้วย `generate.mjs`, ชื่อปลอม)
4. **Layer C:** ผู้ใช้ re-test 3 สลิปบนเครื่องตัวเอง รายงานแค่ถูก/ผิดต่อ field (AC6/AC8) · gitleaks + QA redaction checklist ใน PR (AC8/AC10)

---

## 3. Estimates

### 3.1 New items (OMX-049 / 050)

| ID | PO | **Dev** | Rationale |
|---|---|---|---|
| OMX-049 | 3 | **3 ✔** | function ใหม่ 1 ตัว + regex anchor + guard; งานส่วนใหญ่คือ fixture/negative test และเพิ่ม payee ใน Layer B benchmark (R7). ขึ้นเป็น 5 ถ้า fixture จริง (UQ1-A) แสดงว่า layout K PLUS กับ MAKE ต่างกันมากหรือ OCR ตัดบรรทัดชื่อเป็นหลายบรรทัด |
| OMX-050 | 5 | **5 → แตก 050a (3) + 050b (2) ✔** | 2 ส่วนอิสระต่อกัน, ความเสี่ยงต่างกัน, merge/ทดสอบแยกได้; 050a ให้ value สูงกว่า (สลิปไก่ย่าง) และไม่พึ่ง fuzzy |
| — 050a | | **3** | tier weak + เปลี่ยน precedence ใน `categorize()` + keyword อาหารไทย + อัปเดต test เดิมที่ assert confidence (R3) + doc §4 |
| — 050b | | **2** | `fold()` + flag `fuzzy` ใน rules + keyword Lazada/Shopee + negative fixtures + fuzzy `TRANSFER_STRONG` |

ลำดับทำ: **049 → 050a → 050b** (050a ใช้ `payeeExtra` จาก 049; AC ของ 050a ต้องผ่านแม้ payee ว่าง จึงเริ่มขนานได้ถ้ามีคน 2 คน) · รวม 8 pts เท่าเดิม

### 3.2 Candidates อื่นใน §9

| ID | PO (remaining) | Dev | ข้อสังเกตทางเทคนิค |
|---|---|---|---|
| OMX-028 | ≈1 | **1** | CI เขียวทุก job บน GitHub (run 43827185503) · `deploy.yml` ล้มที่ `actions/configure-pages@v5` เพราะ repo private + Pages ไม่เปิด (B3) — **ไม่ต้องแก้ workflow** · หลังเปิด Pages: ตั้ง Source = GitHub Actions, ตรวจ environment `github-pages` อนุญาต branch `main`, ตรวจ repo variable `VITE_GOOGLE_CLIENT_ID` ถูก inject ตอน build · ถ้าต้องเปลี่ยน repo เป็น public → รัน `gitleaks detect --log-opts="--all"` full history + `git log --all -- '*.png' '*.jpg'` ยืนยันว่าไม่มีรูปสลิปจริง (ปัจจุบันมีแค่ synthetic ใน `tests/fixtures/slips/images`) |
| *(hardening, optional)* | — | **≤1 (task ใน 028)** | (1) step ก่อน `configure-pages` ที่เรียก `gh api repos/{owner}/{repo}/pages` แล้วพิมพ์ `::error::GitHub Pages is not enabled (Settings → Pages → Source: GitHub Actions). Private repos need a paid plan.` แทน error 404 ดิบ (2) actions ที่รันบน Node 20 (deprecated) → อัปเกรดเมื่อมีเวอร์ชันที่รองรับ Node 24: `actions/checkout`, `setup-node`, `upload-artifact`/`download-artifact`, `upload-pages-artifact`, `deploy-pages`, `configure-pages`, `gitleaks-action` — ตรวจ annotation ใน run log แล้ว pin major ใหม่; ทำแยก PR หลัง deploy ครั้งแรกเขียว เพื่อไม่ปนกับการปิด B3 (`concurrency: pages` / `cancel-in-progress: false` มีอยู่แล้ว) |
| OMX-048 | 2 | **2** | ลำดับ: smoke (`E2E_BASE_URL=… npx playwright test --project=desktop --project=mobile`) → real-ocr บน Pages (พิสูจน์ self-host asset ใต้ sub-path, ADR-0001) → Lighthouse → HAR network check (ไม่มี request นอก origin ยกเว้น Google) · `playwright.config.ts` รองรับ `E2E_BASE_URL` แล้ว (ข้าม webServer) → งาน Dev เหลือแค่ support QA |
| OMX-042 | 3 | **3** | Dev ช่วยเขียน script local-only (`scripts/` + `.gitignore` path สำหรับ calibration set) ที่อ่านรูปจากโฟลเดอร์นอก repo แล้วพิมพ์เฉพาะตัวเลข; ไม่ commit ผลที่มี PII |
| OMX-043 | 3 | 3 (QA) | Dev standby แก้ bug — กันเวลาใน buffer |
| OMX-003a/b | ≈2 | **2** | โค้ดเสร็จ (wrapper + stub); เหลือ config จริง (B2) + ทดสอบ origin `jaijimjim.github.io` ซึ่งต้องรอ 028 |
| OMX-041 | 2 | **2 ✔** | ปัจจุบัน `GooglePhotosPanel.tsx` นับ `failed++` แล้วสรุปเป็นข้อความรวม — ไม่มีแถวต่อรูป · ทำ: เพิ่มสถานะ `downloadFailed` ใน `queueStore` (มี `retry(id)` สำหรับ OCR อยู่แล้ว ใช้ pattern เดียวกัน) เก็บ `mediaItem` id + `baseUrl` ไว้ใน item, retry = ขอ token ใหม่ผ่าน wrapper (`services/google`) ถ้า 401 แล้วโหลดซ้ำ · **ทำ e2e ด้วย stub wrapper ได้ก่อน B2 ปิด** (AC4) — ระวัง `baseUrl` หมดอายุ ~60 นาที → retry หลังนั้นต้องแจ้งให้เลือกใหม่ |
| OMX-029 | ≈2 | 2 | วัดบน Pages + เครื่องจริง; ถ้า AC5 (list 1,000 rows) fail → ดึง 044 |
| OMX-044 | 3 | 3 | conditional; ระวัง sticky header + a11y (AC3) — ใช้ windowing เขียนเอง ไม่เพิ่ม dependency ถ้าทำได้ใน budget |
| OMX-040 | 2 | **2** | ทำใน `amount.ts`; `thaiDigitsToAscii` มีแล้วใน normalize — ปัญหาคือ mix digit + จุดเพี้ยน · ทำต่อจาก 050b ได้ (ใช้ fixture style เดียวกัน) |
| OMX-045 | 1 | 1 | Dev แนะนำ **option A** (date = today ถ้าอยู่ใน pay period) — ไม่ต้องยกเว้น R3 future-date rule, Review hint 1 key |
| OMX-039 | 3 | **3** (เดิม) | ต้องการ payee ถูกก่อน (049) และ fuzzy name compare — ใช้ `fold()` จาก 050b ได้ → ทำหลัง 049/050b |
| OMX-046 | 1 | 1 | copy จาก Designer เท่านั้น |
| OMX-047 | 2 | 2 | token มีครบสองธีมแล้ว; เพิ่ม `settings.theme` + `<html data-theme>` |
| AI-8 | — | ≤1 (non-story) | **ยังไม่เสร็จ** — `CONTRIBUTING.md` ยังไม่มีหัวข้อ Playwright Chromium path / proxy; Dev ทำ Day 1 |

---

## 4. Definition of Ready ที่ Dev ต้องการ (เพิ่มจาก DoR ปกติ)

| Item | ต้องมีก่อนเริ่ม |
|---|---|
| OMX-049 | (1) fixture text ≥ 3 ชิ้น arrow layout (A = redact จาก UQ1 หรือ B = synthetic) **ที่คงบรรทัดขยะ/ลูกศรเพี้ยนตามจริง** (2) negative fixtures: SCB/KTB/received/salary ไม่เปลี่ยน (3) payee baseline Layer B (R7) (4) Designer ตอบ §6.1 Q1 (แสดง Medium หรือไม่) |
| OMX-050a | (1) fixture bill ไก่ย่าง/FOOD + bill utility จริง + "จ่ายบิล" เดี่ยว (2) PO ยืนยัน §4 note v4 เป็น rule (3) รายการ keyword อาหารที่ PO/QA ยอมรับ |
| OMX-050b | (1) รายการ variant Lazada/Shopee (AC4/AC5) + negative ≥ 20 รายการ (2) ตกลงตาราง fold (ไม่รวม `ด↔ต` รอบแรก) |
| OMX-028/048 | B3 ปิด (UQ2) |
| OMX-041 | stub wrapper มี mode "fail N ครั้งแล้วสำเร็จ" (Dev ทำเอง) — ไม่ต้องรอ B2 |

**Dependencies:** UQ1 → 049/050 · 049 → 050a (soft, `payeeExtra`) → 050b → 039 · B3 → 028 → 048 → 043/029 · B2 → 003a/b → 041 (acceptance เท่านั้น, dev ทำได้ก่อน)

---

## 5. คำถามถึงทีม

**ถึง PO**
1. ยอมรับแตก OMX-050 เป็น 050a (3) / 050b (2) และลำดับ 049 → 050a → 050b ไหม?
2. ยืนยัน §4 note v4 เป็น domain rule และ "จ่ายบิล" เดี่ยว = `bills` Medium (AC3)?
3. Arrow fallback ใช้กับทุกธนาคารที่มี masked-account anchor หรือจำกัด `kplus` เท่านั้น?
4. Workflow hardening (error message, Node 20 → Node 24 actions) — รับเป็น task ใน 028 หลัง deploy เขียว หรือเก็บเป็น tech debt?
5. OMX-045: Dev แนะนำ option A

**ถึง Designer**
1. `payeeSource: 'arrow'` → แสดง badge Medium + copy ไหม (key ใหม่ใน `design/copy-deck.json`)?
2. Hint "จัดหมวดจาก: {keyword}" ใช้ `categoryResult.keyword` (canonical) ได้ไหม — แสดงชื่อ payee ดิบตาม OCR (ไม่ normalize) เพื่อให้ค้นหาตรงกับที่ผู้ใช้เห็น

**ถึง QA**
1. Fixture (A หรือ B) พร้อมวันไหน — Dev เริ่ม 049 ได้ด้วย synthetic ของ spike นี้ (S1–S4) เป็น seed แล้วสลับเป็นของจริงทีหลัง
2. เพิ่ม `payee` ใน `tests/fixtures/slips/expected.json` + benchmark spec (R7) — QA หรือ Dev ทำ?
3. Negative fixture สำหรับ fuzzy: Dev เสนอ ≥ 20 (ชื่อคน 8, merchant อื่น 8, คำไทยที่ fold แล้วใกล้ "ลาซาดา/ช้อปปี้" 4) + text ของ 27 Layer B
4. Test เดิมที่ assert `bills` confidence High จาก "จ่ายบิล" อย่างเดียวจะเปลี่ยนเป็น Medium (R3) — ยอมรับเป็น expected change ไหม
