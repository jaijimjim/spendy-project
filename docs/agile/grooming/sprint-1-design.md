# Sprint 1 Grooming — Designer (UI/UX) Input

> Author: Designer · Date: 2026-11-13 · Ceremony: Backlog Grooming (Day 0)
> Scope: ทุก story ระดับ Must/Should ใน `01-product-backlog.md` · ยังไม่ใช่ design — เป็น input เพื่อให้ story ผ่าน DoR (ข้อ 4: UI spec + copy TH/EN)
> Design effort: **S** = ≤ ½ วัน (reuse pattern) · **M** = ~1 วัน (หน้าจอ/flow ใหม่ + states) · **L** = > 1 วัน (flow ซับซ้อน, หลาย breakpoint, หลาย states)
> ข้อเสนอ AC ทั้งหมดด้านล่างเป็น **proposal ให้ PO พิจารณา** — Designer ไม่ได้แก้ backlog

---

## 1. Cross-cutting proposals (ใช้กับทุก story)

| # | Topic | Proposal |
|---|---|---|
| X1 | **State matrix** | ทุกหน้าจอ/คอมโพเนนต์ที่มีข้อมูลต้องระบุ 4 states: **loading** (skeleton, ไม่ใช่ spinner เปล่า) · **empty** · **error** (ข้อความ + action แก้ไข) · **success** (toast `aria-live="polite"` 4–5 s). เสนอให้เป็น DoR checklist ของ Designer |
| X2 | **Feedback patterns** | Toast = ผลลัพธ์ที่ไม่ต้องตัดสินใจ (Saved, Deleted+Undo) · Inline error = validation · Dialog = destructive/ออกจากหน้าที่มีงานค้าง · Banner = ปัญหาระดับแอป (offline, storage full, not configured) |
| X3 | **Income/expense encoding** | ไม่ใช้สีอย่างเดียว: `+` / `−` + icon ลูกศร + label ซ่อนสำหรับ screen reader ("รายรับ/Income"). สีเขียว/แดงต้องผ่าน 4.5:1 บนพื้นหลังทั้งสองแบบ และแยกได้สำหรับ color-blind (เขียวอมฟ้า vs แดงส้ม) |
| X4 | **Typography (P3 ป้าแดง)** | Body 16px ขั้นต่ำ, ตัวเลขจำนวนเงินใช้ `tabular-nums`, line-height ภาษาไทย ≥ 1.6 (สระบน/ล่าง). ฟอนต์ไทย+อังกฤษ เช่น IBM Plex Sans Thai / Noto Sans Thai — **self-host** ใน `public/` (ไม่เรียก Google Fonts เพื่อให้สอดคล้อง OMX-030) |
| X5 | **Copy length** | ออกแบบเผื่อ EN ยาวกว่า TH ~30% และ TH มีสระซ้อน — ปุ่ม/ป้ายต้องไม่ truncate ที่ 360px; ห้ามใช้ ALL CAPS |
| X6 | **Date input** | Native `<input type="date">` (a11y ดีกว่า custom) แต่แสดงค่าแบบ CE ในบาง browser → แสดง label ที่ format แล้วข้าง input (เช่น "13 พ.ย. 2569") เพื่อไม่ให้ผู้ใช้สับสน BE/CE |
| X7 | **Amount input** | `inputmode="decimal"`, ยอมรับ `,` เป็น thousand separator, แสดง "฿" เป็น prefix ที่ไม่ใช่ส่วนของค่า, format เมื่อ blur |
| X8 | **Design tokens** | สี/spacing/radius/type scale เป็น CSS variables ตั้งแต่ Slice 1 (light theme เท่านั้นใน MVP; dark mode = Could ภายหลัง) |

---

## 2. Story-by-story input

### E1 — Slip Import

| ID | Pri | UX questions | Missing / proposed AC | Design |
|---|---|---|---|---|
| OMX-001 | M | ปุ่ม Upload กับ Google Photos อยู่หน้าเดียวกันเป็น 2 ปุ่มเท่ากัน หรือ Upload เป็น primary? หลังเลือกไฟล์ เริ่ม OCR อัตโนมัติหรือต้องกด "เริ่มอ่าน"? | **Auto-start** OCR หลังเลือก (ลดขั้นตอน → เป้า 2 นาที) · ข้อความ reject รวมเป็น **สรุปเดียว** ("ข้าม 2 ไฟล์: …") ไม่ใช่ alert ต่อไฟล์ · ลบ thumbnail ออกจาก queue ได้ก่อนประมวลผล · empty state ของหน้า Add มีภาพประกอบ + "สลิปแบบไหนอ่านได้ดี" (ภาพคมชัด, ไม่ crop) | M |
| OMX-002 | S | Drop zone เต็มหน้าหรือเฉพาะกรอบ? | Drop zone = กรอบเดียวกับปุ่ม Upload (component เดียว) · แสดงเฉพาะ ≥ 768px; บนมือถือซ่อนข้อความ "ลากไฟล์" · highlight ต้องมีมากกว่าสี (เส้นประหนา + icon) | S |
| OMX-003 | M | บนมือถือ Picker เปิดแท็บใหม่ — ผู้ใช้กลับมาแล้วรู้ไหมว่าต้องทำอะไร? | สถานะ "กำลังรอการเลือกรูป…" ต้องคงอยู่เมื่อกลับมาที่แท็บ + ปุ่ม "เปิด Google Photos อีกครั้ง" · ระหว่าง download แสดง progress "ดาวน์โหลด 3/8" · ถ้าเลือก > 20 รูป ใช้ข้อความเดียวกับ OMX-001 AC4 · copy อธิบายสั้น ๆ ก่อน consent ว่า "เราอ่านเฉพาะรูปที่คุณเลือก" (ลดความกลัวของ P3) | M |
| OMX-004 | S | Disabled button อ่านโดย screen reader ไม่ได้ในบางกรณี | ใช้ `aria-disabled` + ข้อความ hint ที่มองเห็นได้ (ไม่ใช้ tooltip อย่างเดียว) · error states (denied / network) แสดงเป็น inline message ใต้ปุ่ม + "ลองอีกครั้ง" — ไม่ใช่ modal | S |

### E2 — OCR & Smart Extraction

| ID | Pri | UX questions | Missing / proposed AC | Design |
|---|---|---|---|---|
| OMX-005 | M | ผู้ใช้ต้องรอดู queue หรือไปหน้า Review ทีละใบได้เลยเมื่อใบแรกเสร็จ? ถ้าออกจากหน้าระหว่าง OCR จะเกิดอะไรขึ้น? | **Progressive review:** ปุ่ม "ตรวจรายการ (3 พร้อม)" เปิดได้ทันทีเมื่อมีใบเสร็จแล้ว · overall progress "2/8" + per-item bar (`role="progressbar"` + `aria-valuenow`) · ประกาศ screen reader เฉพาะตอนเปลี่ยนสถานะ (ไม่ใช่ทุก %) · model loading แสดงขนาดโดยประมาณ ("~xx MB") ตามคำตอบ Open Q2 · ออกจากหน้าระหว่าง OCR → confirm dialog | L |
| OMX-006 | M | Confidence 3 ระดับแสดงอย่างไรให้ไม่รก? | แสดงเฉพาะ **Medium/Low** เป็น badge (icon + text "ไม่แน่ใจ / Check this"); High ไม่ต้องแสดง badge (ลด noise) — ยังมีใน detail/raw · field ที่ต้องตรวจ: เส้นขอบ + icon + ข้อความ ไม่ใช่สีพื้นหลังอย่างเดียว | S |
| OMX-007 | M | — | ถ้าพบหลายตัวเลขที่เป็นไปได้ → เสนอ "ตัวเลือกอื่นจากสลิป" เป็น chips ให้แตะเลือก (ลดการพิมพ์บนมือถือ) — *Could, ถ้า Dev ทำได้* | S |
| OMX-008 | M | วันที่ default = วันนี้ เสี่ยงผู้ใช้ไม่สังเกตและบันทึกผิดเดือน | ข้อความชี้ชัด "ไม่พบวันที่ในสลิป — ใช้วันนี้" ใต้ field · แสดงวันที่ตามภาษา UI (TH = พ.ศ.) ตาม X6 | S |
| OMX-009 | S | Bank tag ใช้โลโก้ธนาคารหรือ text? | ใช้ **text tag** (ไม่ใช้โลโก้ — ประเด็นเครื่องหมายการค้า + ขนาด) · เลขบัญชีแสดงแบบ masked เสมอ | S |
| OMX-010 | M | ผู้ใช้เปลี่ยนหมวดได้ง่ายแค่ไหนบนมือถือ? | Category picker = **grid ของ icon + ชื่อ** (12 หมวด) ใน bottom sheet บนมือถือ / popover บน desktop; ไม่ใช้ `<select>` ยาว ๆ · ต้องกำหนด **icon set ต่อหมวด** (เสนอ Lucide/Material Symbols แบบ self-host, outline) | M |
| OMX-011 | S | "Possible duplicate" ลิงก์ไปที่รายการเดิม — เปิดที่ไหนโดยไม่เสียงาน Review? | เปิดรายการเดิมเป็น **preview sheet/dialog** (ไม่ navigate ออกจาก Review) · Duplicate = card จาง + checkbox unchecked + label "ซ้ำ" (ไม่ใช่ opacity อย่างเดียว — contrast ต้องผ่าน) | S |

### E3 — Review & Manual Entry

| ID | Pri | UX questions | Missing / proposed AC | Design |
|---|---|---|---|---|
| OMX-012 | M | Layout มือถือ: list ของ card ทั้งหมด หรือ step ทีละใบ? Save all vs save per item — อันไหนเป็น primary? | **Mobile:** list ของ card แบบย่อ (thumbnail, amount, date, category, badge) → แตะเพื่อขยายแก้ไข; sticky footer "บันทึกที่เลือก (N)" · **Desktop ≥ 1024px:** split view รูปซ้าย / ฟอร์มขวา · Select all / none · ปุ่ม Save disabled พร้อมเหตุผล ("2 รายการยังไม่ครบ") แทนการกดแล้ว error · หลังบันทึก → toast + ปุ่ม "ดูรายการ" · Image enlarge = dialog ที่ zoom/pinch ได้, ปิดด้วย Esc · raw OCR text = `<details>` ปิดไว้ default · ต้องมี state: ทุกใบ Failed → empty state พร้อม "กรอกเอง" | **L** |
| OMX-013 | M | ฟอร์มเปิดเป็นหน้าใหม่หรือ sheet? | Mobile = full-screen sheet (route ได้ เพื่อ back button ปิดได้), desktop = dialog · ลำดับ field: Type → **Amount (autofocus)** → Category → Date → Payee → Note · type toggle = segmented control (`role="radiogroup"`) · หลัง Save มีตัวเลือก "บันทึกและเพิ่มอีก" (เหมาะกับ P3 กรอกเงินสดหลายรายการ) — *Should* · ใช้ฟอร์มเดียวกับ OMX-016 และ card แก้ไขใน OMX-012 (component เดียว) | M |

### E4 — Transaction Management

| ID | Pri | UX questions | Missing / proposed AC | Design |
|---|---|---|---|---|
| OMX-014 | M | หัวกลุ่มวันที่แสดงยอดรวมรายวันไหม? | Date group header แบบ sticky + ยอดสุทธิของวันนั้น · loading = skeleton rows · empty (ทั้งเดือน) ต่างจาก empty (ทั้งแอป) — ข้อความต่างกัน (เดือนนี้ยังไม่มีรายการ vs เริ่มต้นใช้งาน) · Source badge = icon + text เล็ก | M |
| OMX-015 | S | Filter อยู่ที่ไหนบนมือถือ? | Search field + ปุ่ม "ตัวกรอง (2)" → bottom sheet; filter ที่ใช้อยู่แสดงเป็น chips ลบได้ · ผลลัพธ์ประกาศ `aria-live` ("พบ 5 รายการ") · filter ควรคงอยู่เมื่อเปลี่ยนเดือน (ต้องให้ PO ตัดสิน) | M |
| OMX-016 | M | Delete อยู่ในฟอร์มแก้ไข หรือ swipe บน row? | Delete อยู่ในฟอร์มแก้ไข (ปุ่ม destructive ด้านล่าง) — **ไม่ใช้ swipe-to-delete** ใน MVP (ค้นหาไม่เจอ + a11y) · Undo toast ≥ 5 s, ไม่หายเมื่อ focus อยู่ (WCAG 2.2.1) · ถ้ามี Undo แล้ว confirm dialog อาจซ้ำซ้อน → **เสนอเลือกอย่างใดอย่างหนึ่ง** (Designer แนะนำ: confirm dialog + Undo ตาม AC เดิมเพื่อความปลอดภัยสำหรับ P3) | S |

### E5 — Dashboard & Insights

| ID | Pri | UX questions | Missing / proposed AC | Design |
|---|---|---|---|---|
| OMX-017 | M | ย้อนได้ถึงเดือนไหน? เดินหน้าเกินเดือนปัจจุบันได้ไหม? | ปุ่ม "‹ พฤศจิกายน 2569 ›" — **ปิด next ที่เดือนปัจจุบัน** · แตะชื่อเดือนเปิด month/year grid · ปุ่มย่อ "เดือนนี้" เมื่อไม่ได้อยู่เดือนปัจจุบัน · ปุ่มลูกศรมี `aria-label` ("เดือนก่อนหน้า") · อยู่ใน header ร่วมกันของ Dashboard + Transactions | S |
| OMX-018 | M | ลำดับ card: Balance ก่อนหรือ Income/Expense ก่อน? | **Balance เป็น hero card** (ใหญ่ บนสุด), Income/Expense เป็น 2 card เล็กข้างล่าง (2 คอลัมน์ที่ 360px) · loading = skeleton · ตัวเลขยาว (เช่น 1,234,567.89) ต้องไม่ล้นที่ 360px → ลดขนาด font อัตโนมัติ/ขึ้นบรรทัด | S |
| OMX-019 | S | Donut หรือ bar? | เสนอ **horizontal bar** แทน donut: ป้ายภาษาไทยยาวอ่านง่าย, เปรียบเทียบขนาดได้แม่นกว่า, 12 หมวดไม่ต้องใช้ 12 สี (ใช้สีเดียว + highlight), แตะได้ง่าย (row ≥ 44px) — แต่ละ row เป็น `<button>` ที่ไป filtered list (AC3) · ถ้า PO ต้องการ donut: จำกัด top 5 + "อื่น ๆ" | M |
| OMX-020 | S | — | **Grouped bar** (income vs expense) 6 เดือน, ป้ายเดือนย่อตามภาษา (พ.ย. / Nov) · ใช้ pattern/ลำดับคงที่ + legend ข้อความ ไม่พึ่งสีอย่างเดียว · data table ซ่อนแต่เปิดได้ ("ดูเป็นตาราง") ประโยชน์ทั้ง a11y และ desktop | M |

### E6 — Data & Persistence

| ID | Pri | UX questions | Missing / proposed AC | Design |
|---|---|---|---|---|
| OMX-021 | M | เตือน backup เมื่อไหร่ ไม่ให้รำคาญ? | Banner แบบ dismissible (ไม่ใช่ modal) สำหรับ storage full / private mode / corrupt data · *Proposal:* nudge "สำรองข้อมูล" เมื่อมี ≥ 20 รายการใหม่นับจาก export ล่าสุด (Could) | S |
| OMX-022 | S | Merge vs Replace เข้าใจยากสำหรับผู้ใช้ทั่วไป | Import flow = เลือกไฟล์ → **preview สรุป** ("ไฟล์มี 120 รายการ, ซ้ำ 30") → เลือก Merge (default, แนะนำ) / Replace (destructive, ต้องพิมพ์ยืนยันหรือ confirm สองชั้น) | M |
| OMX-023 | S | — | ใช้ dialog เดียวกับ export JSON ("ส่งออกข้อมูล": รูปแบบ JSON/CSV + ขอบเขต) เพื่อไม่ให้ Settings รก · success toast ระบุชื่อไฟล์ | S |

### E7 — Platform, i18n & UX Quality

| ID | Pri | UX questions | Missing / proposed AC | Design |
|---|---|---|---|---|
| OMX-024 | M | Switch อยู่ header ทุกหน้าหรือใน Settings? | Header แบบ "TH \| EN" (ข้อความ ไม่ใช่ธง) บน desktop; บนมือถือพื้นที่ header จำกัด → อยู่ทั้งใน header (compact) และ Settings · ปุ่มภาษาใช้ `lang` attribute ของตัวเอง ("ไทย" `lang="th"`) · Designer ส่ง **copy deck TH/EN** (key-based) ก่อน dev เริ่ม Slice 1 | M (copy deck) |
| OMX-025 | M | ปุ่ม Add เป็น tab ปกติหรือ FAB กลาง? | ดู §3 IA · breakpoints: 360 (base) / 768 / 1024+ (side nav) · respect safe-area (iOS home indicator) สำหรับ bottom nav · active tab: icon + label + indicator (ไม่ใช้สีอย่างเดียว), `aria-current="page"` | **L** (shell + nav ทุก breakpoint) |
| OMX-026 | M | — | Designer เป็นเจ้าของ **empty/error catalogue** (ตารางข้อความ TH/EN + illustration/icon + action) ครอบคลุม: no data, no month data, no search result, OCR failed, all failed, offline, storage full, corrupt data, GP not configured/denied/network, unexpected error · ข้อความ error ต้องบอก "เกิดอะไร + ทำอะไรต่อ" ไม่โทษผู้ใช้ | M |
| OMX-027 | M | — | เพิ่ม AC: **focus ย้ายไปที่ heading ของหน้าใหม่** หลังเปลี่ยน route (SPA) · skip link "ข้ามไปเนื้อหา" · touch target 44×44 (ซ้ำกับ OMX-025 AC3 — รวมไว้ที่เดียว) · Designer ส่ง a11y annotations (focus order, labels, roles) ในทุก wireframe | M (กระจายในทุก story) |
| OMX-028 | M | — | ไม่มีงาน design (นอกจาก favicon/app title/`<meta>` description TH/EN) | S |

### E8 — NFR

| ID | Pri | UX questions | Missing / proposed AC | Design |
|---|---|---|---|---|
| OMX-029 | S | — | ใช้ skeleton แทน spinner เพื่อ perceived performance · illustration เป็น SVG inline เล็ก ๆ (ไม่ใช่ PNG ใหญ่) · ฟอนต์ไทย subset/`font-display: swap` | S |
| OMX-030 | M | ผู้ใช้จะ "รู้สึก" ปลอดภัยได้อย่างไร? | Trust message สั้น ๆ บนหน้า Add ("รูปของคุณไม่ถูกส่งออกจากเครื่อง / Your images never leave this device" + lock icon, ไม่ใช่ emoji) + ลิงก์ไป Privacy · "ลบข้อมูลทั้งหมด" = danger zone ล่างสุดของ Settings, confirm โดยพิมพ์คำยืนยัน หรือ dialog ที่ปุ่ม default = Cancel | S |
| OMX-031 | S | — | ไม่มีงาน design | — |

---

## 3. Proposed Information Architecture (IA) & screens

**Navigation (OMX-025):** Mobile bottom nav 4 ปุ่ม — `หน้าหลัก/Home` · `รายการ/Transactions` · **`เพิ่ม/Add`** (ปุ่มกลางเด่น) · `ตั้งค่า/Settings`. Desktop ≥ 1024px = side nav (ลำดับเดียวกัน). แตะ Add → **action sheet**: อัปโหลดสลิป · Google Photos · กรอกเอง (Google Photos แสดง state Not configured ใน sheet นี้ได้เลย).

| # | Screen / route (hash) | Content | Stories |
|---|---|---|---|
| S1 | Dashboard `#/` | Month selector, Balance hero + Income/Expense cards, Category bars, Trend chart, empty-state CTA | 017, 018, 019, 020, 026 |
| S2 | Transactions `#/transactions` | Month selector (shared state), search + filter chips, grouped list, filtered total | 014, 015, 017, 026 |
| S3 | Transaction form (sheet/dialog) `#/transactions/new`, `#/transactions/:id` | ฟอร์มเดียวสำหรับ add/edit, delete (edit only) | 013, 016 |
| S4 | Add slip `#/add` | Upload / drop zone, Google Photos button + states, trust message, processing queue | 001, 002, 003, 004, 005, 030 |
| S5 | Review `#/add/review` | Card list / split view, select, edit, duplicate flags, Save selected | 006–012 |
| S6 | Settings `#/settings` | Language, Export (JSON/CSV), Import, Privacy/About, Danger zone (delete all) | 021, 022, 023, 024, 030 |
| — | Global | Header (title, TH\|EN), app banners (offline/storage), toasts, error boundary | 024, 026, 027 |

**Primary flow (เป้า ≤ 2 นาที):** Home empty state → "อัปโหลดสลิป" → เลือกรูป → (auto OCR) → "ตรวจรายการ" → Save → toast "บันทึกแล้ว 3 รายการ · ดูรายการ" → Dashboard อัปเดต. = 4 taps + ตรวจข้อมูล.

---

## 4. Answers to Open Questions (design perspective)

| OQ | Topic | Designer's proposed answer |
|---|---|---|
| 1 | Fixture set | ไม่ใช่งาน design โดยตรง — แต่ Designer ขอใช้ fixture ชุดเดียวกัน (ปิดข้อมูลแล้ว) เป็นภาพตัวอย่างใน wireframe Review เพื่อออกแบบให้ตรงความยาวข้อมูลจริง |
| 2 | Tesseract lang data host | Dev ตัดสิน; จากมุม UX/privacy **เอนไปทาง self-host** (สอดคล้อง trust message "ไม่ส่งออกนอก") · ไม่ว่าเลือกแบบไหน ต้องรู้ขนาดไฟล์เพื่อใส่ใน copy loading ("~xx MB, ครั้งแรกเท่านั้น") |
| 3 | สลิปรับเงินโอน | **เห็นด้วยกับ default: ผู้ใช้เปลี่ยนเองใน Review** สำหรับ MVP — ไม่เพิ่ม onboarding/Settings ชื่อเจ้าของ · เงื่อนไขทาง design: type toggle ต้องอยู่ **บนสุดของ card** และเปลี่ยนได้ใน 1 แตะ; เมื่อเปลี่ยนเป็น Income ให้ category auto → Other income · ตั้งชื่อเจ้าของ = candidate สำหรับ sprint ถัดไป (คู่กับ OMX-035) |
| 4 | Chart library | **Visual/a11y preference: SVG-based (ไม่ใช่ canvas)** เพื่อให้ text คมชัดเมื่อ zoom 200%, ใช้ฟอนต์ไทยเดียวกับ UI, และใส่ ARIA/role ได้ · ตัวเลือกที่แนะนำ: **Recharts (lazy-loaded)** — React-friendly, ปรับ style ด้วย tokens ได้ · ทางเลือกเบาที่สุด: **hand-rolled SVG** (bar charts ที่เสนอใน OMX-019/020 ทำเองได้ง่าย, ~0 KB lib) · ไม่แนะนำ Chart.js (canvas → a11y และ text rendering แย่กว่า) · ไม่ว่าเลือกอะไร: legend/table แบบข้อความต้องมีเสมอ, ปิด animation เมื่อ `prefers-reduced-motion` |

---

## 5. Design effort summary & sequencing

| Size | Stories |
|---|---|
| **L** | OMX-005, OMX-012, OMX-025 |
| **M** | OMX-001, 003, 010, 013, 014, 015, 019, 020, 022, 024 (copy deck), 026, 027 |
| **S** | OMX-002, 004, 006, 007, 008, 009, 011, 016, 017, 018, 021, 023, 028, 029, 030 |
| — | OMX-031 |

**Design delivery order (ตาม release slicing):**
1. **ก่อน Sprint Planning / Day 1:** design tokens, app shell + nav (025), copy deck v1 (024), Dashboard + Transactions + manual form wireframes (017, 018, 014, 013) → ปลด DoR ข้อ 4 ของ Slice 1
2. **Day 1–2:** Add slip + queue + Review (001, 005, 006–012) และ empty/error catalogue (026) → Slice 2
3. **Day 3+ (mid-sprint grooming):** charts, filters, Settings/export/import, Google Photos states → Slice 3

**Risks (UX):** OMX-012 Review เป็นหน้าที่ซับซ้อนที่สุดและเป็นหัวใจของ Sprint Goal — เสนอ timebox wireframe + quick usability check กับ 1–2 คน (persona P1/P3) ก่อน dev เริ่ม · copy TH/EN ที่ยังไม่พร้อมจะ block DoD ข้อ 4 ทุก story — copy deck ต้องมาก่อน
