# Omnitrix Money — Design System v1

> Owner: Designer · Sprint 1 · Date: 2026-11-13 · Status: **Handed off to Dev** (D1, D2, D10)
> Files: `design/tokens.css` (import directly) · `design/screens.md` · `design/copy-deck.json` · `design/mockups.html` / `mockups.png`
> Stories: OMX-024, 025, 026, 027 (foundation for every UI story)

---

## 1. Brand direction

| | |
|---|---|
| **Personality** | เป็นมิตร (friendly) · น่าไว้ใจ (trustworthy) · ทันสมัย (modern fintech) · สงบ ไม่ตื่นตกใจกับตัวเลข (calm) |
| **Voice** | พูดเหมือนเพื่อนที่เก่งเรื่องเงิน: สั้น ชัด บอกว่า "เกิดอะไร + ทำอะไรต่อ" · TH ใช้ "คุณ" ไม่ใช้ "ท่าน", ไม่ใช้คำลงท้าย ค่ะ/ครับ ใน UI · EN sentence case, no ALL CAPS · ไม่โทษผู้ใช้ ("อ่านสลิปไม่ได้" ไม่ใช่ "คุณอัปโหลดรูปผิด") |
| **Primary color** | **Omni Indigo `#4433C4`** — เลือกเพื่อ *ไม่* ซ้ำแบรนด์ธนาคารไทย (KBank เขียว, SCB ม่วงเข้ม, Krungthai ฟ้า, Bangkok Bank น้ำเงินกรม, Krungsri เหลือง) และไม่ชนกับสีเขียว/แดงที่สงวนไว้สำหรับรายรับ/รายจ่าย |
| **Shape** | มุมโค้งนุ่ม (card 16px, sheet 24px), เส้นบาง, เงาเบา — ความรู้สึก "เรียบร้อย ปลอดภัย" ไม่ใช่ "เกม" |
| **Imagery** | Icon line (lucide), illustration เรียบแบบ 2 สี (indigo + accent amber `#F5B94A`) เป็น inline SVG เล็ก — ไม่ใช้รูปถ่าย, ไม่ใช้โลโก้ธนาคาร (OMX-009 AC3) |
| **Trust cues** | Lock icon + "รูปของคุณไม่ถูกส่งออกจากเครื่อง" บนหน้า Add (OMX-030), ตัวเลขชัดเจน tabular, ไม่มี dark pattern (ปุ่ม destructive ไม่เป็นค่า default) |

---

## 2. Color

### 2.1 Token map (light / dark)

| Token (`--omx-color-*`) | Light | Dark | Use |
|---|---|---|---|
| `bg` | `#F5F6FA` | `#0E1120` | App background |
| `surface` | `#FFFFFF` | `#161A2C` | Cards, nav, sheets |
| `surface-2` | `#EDEFF5` | `#1F2439` | Inset, segmented track, skeleton |
| `border` | `#DADDE7` | `#2C3250` | Decorative dividers only (not for control boundaries) |
| `border-strong` | `#7C8297` | `#767E9E` | Input/checkbox/toggle borders (≥ 3:1) |
| `text` | `#151A28` | `#ECEEF7` | Primary text |
| `text-muted` | `#4F566B` | `#AAB0C6` | Secondary text |
| `text-subtle` | `#6B7186` | `#8D94AD` | Placeholder, meta (still ≥ 4.5:1) |
| `primary` / `on-primary` | `#4433C4` / `#FFF` | `#A9B1FF` / `#14123A` | Primary buttons, links, active nav, chart bars |
| `primary-subtle` / `primary-text` | `#ECEAFD` / `#3A2BB0` | `#25265A` / `#C3C8FF` | Selected chip/tile, active nav pill |
| `income` / `income-subtle` | `#03754F` / `#E2F5EC` | `#4ADE9F` / `#0F2E25` | Income amounts, income toggle selected |
| `expense` / `expense-subtle` | `#B8321F` / `#FCEAE6` | `#FF8F7D` / `#3A1C1A` | Expense amounts, expense toggle selected |
| `warning` / `-subtle` | `#9A4A00` / `#FFF3D6` | `#F8C25C` / `#33280F` | Low/Medium confidence, negative balance, future date |
| `danger` / `on-danger` / `-subtle` | `#B42318` / `#FFF` / `#FDE8E6` | `#FF8F7D` / `#2A0B07` / `#3A1C1A` | Errors, destructive buttons |
| `info` / `-subtle` | `#1F4FC9` / `#E6EEFE` | `#94B8FF` / `#18264A` | Info banners, trust message |
| `focus` | `#4433C4` | `#A9B1FF` | 2px ring + 2px surface gap |
| `accent` | `#F5B94A` | `#F5B94A` | Illustration only — **never text** |

Theme switching: tokens follow `prefers-color-scheme`; `<html data-theme="light|dark">` overrides (theme switch UI = not in Sprint 1; dark mode ships as automatic only).

### 2.2 Income / expense semantics (never color alone — OMX-014 AC3, OMX-027 AC4)
| | Income รายรับ | Expense รายจ่าย |
|---|---|---|
| Sign | `+1,250.00` | `−1,250.00` (U+2212 minus, not hyphen) |
| Icon | `ArrowDownLeft` (เงินเข้า) | `ArrowUpRight` (เงินออก) |
| SR label | "รายรับ 1,250.00 บาท" | "รายจ่าย 1,250.00 บาท" |
| Color | `income` | `expense` |
| Chart | solid fill, first in each group | **diagonal hatch** fill, second in group |

ค่า luminance ของเขียว/แดงใกล้กัน (1.04:1 light) → **ห้าม** ใช้สีเป็นตัวแยกอย่างเดียว; sign + icon + order + pattern เป็นตัวแยกหลัก (ทดสอบแล้วว่ายังอ่านได้ใน grayscale/deuteranopia).

### 2.3 Negative balance (OMX-018 AC2)
`−3,420.50` + `TriangleAlert` icon + text "ใช้เกินรายรับ / Spent more than earned" in `warning` on `warning-subtle`. Balance 0 → `0.00` (never `−0.00`).

### 2.4 Contrast verification (WCAG 2.1, computed with relative-luminance formula)

| Theme | Pair | Ratio | Required | Result |
|---|---|---|---|---|
| light | `text` #151A28 on `bg` #F5F6FA | 16.07:1 | 4.5:1 | PASS |
| light | `text` on `surface` #FFFFFF | 17.35:1 | 4.5:1 | PASS |
| light | `text` on `surface-2` #EDEFF5 | 15.09:1 | 4.5:1 | PASS |
| light | `text-muted` #4F566B on `surface` | 7.30:1 | 4.5:1 | PASS |
| light | `text-muted` on `bg` | 6.76:1 | 4.5:1 | PASS |
| light | `text-subtle` #6B7186 on `surface` | 4.85:1 | 4.5:1 | PASS |
| light | `on-primary` #FFF on `primary` #4433C4 | 8.35:1 | 4.5:1 | PASS |
| light | `on-primary` on `primary-hover` #3727A8 | 10.41:1 | 4.5:1 | PASS |
| light | `on-danger` #FFF on `danger` #B42318 | 6.57:1 | 4.5:1 | PASS |
| light | `primary` on `surface` (links) | 8.35:1 | 4.5:1 | PASS |
| light | `primary-text` #3A2BB0 on `primary-subtle` #ECEAFD | 8.25:1 | 4.5:1 | PASS |
| light | `income` #03754F on `surface` | 5.74:1 | 4.5:1 | PASS |
| light | `income` on `income-subtle` #E2F5EC | 5.05:1 | 4.5:1 | PASS |
| light | `expense` #B8321F on `surface` | 5.98:1 | 4.5:1 | PASS |
| light | `expense` on `expense-subtle` #FCEAE6 | 5.14:1 | 4.5:1 | PASS |
| light | `warning` #9A4A00 on `surface` | 6.26:1 | 4.5:1 | PASS |
| light | `warning` on `warning-subtle` #FFF3D6 | 5.68:1 | 4.5:1 | PASS |
| light | `danger` on `surface` | 6.57:1 | 4.5:1 | PASS |
| light | `danger` on `danger-subtle` #FDE8E6 | 5.59:1 | 4.5:1 | PASS |
| light | `info` #1F4FC9 on `surface` | 6.95:1 | 4.5:1 | PASS |
| light | `info` on `info-subtle` #E6EEFE | 5.97:1 | 4.5:1 | PASS |
| light | `border-strong` #7C8297 on `surface` (UI) | 3.82:1 | 3:1 | PASS |
| light | `focus` on `surface` / `bg` (UI) | 8.35 / 7.73:1 | 3:1 | PASS |
| light | `chart-bar` / `chart-income` / `chart-expense` on `surface` | 8.35 / 5.74 / 5.98:1 | 3:1 | PASS |
| dark | `text` #ECEEF7 on `bg` #0E1120 | 16.20:1 | 4.5:1 | PASS |
| dark | `text` on `surface` #161A2C | 14.89:1 | 4.5:1 | PASS |
| dark | `text` on `surface-2` #1F2439 | 13.24:1 | 4.5:1 | PASS |
| dark | `text-muted` #AAB0C6 on `surface` / `bg` | 7.99 / 8.69:1 | 4.5:1 | PASS |
| dark | `text-subtle` #8D94AD on `surface` | 5.72:1 | 4.5:1 | PASS |
| dark | `on-primary` #14123A on `primary` #A9B1FF | 8.85:1 | 4.5:1 | PASS |
| dark | `on-primary` on `primary-hover` #C3C8FF | 11.06:1 | 4.5:1 | PASS |
| dark | `on-danger` #2A0B07 on `danger` #FF8F7D | 8.25:1 | 4.5:1 | PASS |
| dark | `primary` on `surface` | 8.55:1 | 4.5:1 | PASS |
| dark | `primary-text` #C3C8FF on `primary-subtle` #25265A | 8.66:1 | 4.5:1 | PASS |
| dark | `income` #4ADE9F on `surface` / `income-subtle` | 10.05 / 8.51:1 | 4.5:1 | PASS |
| dark | `expense` #FF8F7D on `surface` / `expense-subtle` | 7.78 / 6.96:1 | 4.5:1 | PASS |
| dark | `warning` #F8C25C on `surface` / `warning-subtle` | 10.56 / 8.86:1 | 4.5:1 | PASS |
| dark | `danger` on `surface` / `danger-subtle` | 7.78 / 6.96:1 | 4.5:1 | PASS |
| dark | `info` #94B8FF on `surface` / `info-subtle` | 8.67 / 7.46:1 | 4.5:1 | PASS |
| dark | `border-strong` #767E9E on `surface` (UI) | 4.31:1 | 3:1 | PASS |
| dark | `focus` on `surface` / `bg` (UI) | 8.55 / 9.31:1 | 3:1 | PASS |
| dark | chart bar / income / expense on `surface` | 8.55 / 10.05 / 7.78:1 | 3:1 | PASS |

All 54 pairs pass. Rule for new pairs: only combine tokens as listed above; QA re-checks with axe (OMX-027 AC6).

---

## 3. Typography

**Font: IBM Plex Sans Thai** (เลือกแทน Noto Sans Thai) — มี Latin + Thai ในชุดเดียว (ไม่ต้อง pair 2 ฟอนต์), ตัวเลขอ่านง่ายแบบ fintech, รูปทรงไทยแบบ loopless-friendly แต่ยังมีหัว อ่านง่ายสำหรับ P3, license OFL.

```bash
npm i @fontsource/ibm-plex-sans-thai
```
```ts
// main.tsx — self-hosted, same origin (OMX-025 AC5, OMX-030 AC1)
import '@fontsource/ibm-plex-sans-thai/thai-400.css';
import '@fontsource/ibm-plex-sans-thai/thai-500.css';
import '@fontsource/ibm-plex-sans-thai/thai-600.css';
import '@fontsource/ibm-plex-sans-thai/thai-700.css';
import '@fontsource/ibm-plex-sans-thai/latin-400.css';
import '@fontsource/ibm-plex-sans-thai/latin-500.css';
import '@fontsource/ibm-plex-sans-thai/latin-600.css';
import '@fontsource/ibm-plex-sans-thai/latin-700.css';
```
(~120 KB woff2 total, `font-display: swap` by default in fontsource.)

| Style | Token | Size / weight | Line-height | Use |
|---|---|---|---|---|
| Hero amount | `--omx-text-3xl` (fluid via `.omx-amount-hero`) | 24–36 / 700 | 1.3 | Balance |
| Stat value | `--omx-text-2xl` | 28 / 700 | 1.3 | Income/expense tiles (shrink to `xl` at < 360px) |
| Screen title (h1) | `--omx-text-xl` | 22 / 700 | 1.6 | Each screen; focus target on route change |
| Section title (h2) | `--omx-text-lg` | 18 / 600 | 1.6 | Card headings |
| Body | `--omx-text-md` | 16 / 400 | 1.6 | Default; inputs never < 16px (prevents iOS zoom) |
| Label | `--omx-text-md` | 16 / 500 | 1.6 | Form labels |
| Meta / helper | `--omx-text-sm` | 14 / 400 | 1.6 | Dates in rows, helper text, errors |
| Badge / tick | `--omx-text-xs` | 13 / 600 | 1.4 | Badges, chart ticks only |

Rules: Thai line-height ≥ 1.6 everywhere (สระบน/ล่าง + วรรณยุกต์); amounts use `.omx-amount` (tabular-nums, no wrap); never letter-space Thai; no italics for Thai; font sizes in `rem` so OS large-text works (OMX-027 AC5).

---

## 4. Spacing, radius, elevation, motion

| Scale | Values |
|---|---|
| Spacing (4px grid) | 4 · 8 · 12 · **16 (mobile gutter, card padding)** · 20 · 24 (desktop gutter) · 32 · 40 · 48 · 64 |
| Layout | Mobile content padding 16; card gap 12; section gap 24 · Desktop: side nav 248, content max 960, form max 560 |
| Touch | Min target 44×44 (`--omx-touch-min`); controls 48 high; list rows ≥ 56 |
| Radius | sm 6 (badge/chip) · md 10 (input/button) · lg 16 (card) · xl 24 (sheet top, hero) · full (pill, FAB) |
| Elevation | `shadow-1` cards · `shadow-2` sticky footer, bottom nav, popovers · `shadow-3` sheets, dialogs, toasts · `shadow-fab` Add button |
| Motion | fast 150ms (press/toggle/hover) · base 240ms (sheet/dialog/toast) · slow 360ms (chart bar grow) · easing `standard` for state, `enter` for in, `exit` for out. **All → 0ms under `prefers-reduced-motion`**; skeleton shimmer becomes static. No looping animation except skeleton and progress. |

---

## 5. Iconography — `lucide-react`

Stroke 2px (1.75 at ≥ 24px), sizes 20 (inline), 24 (nav, rows), 32/48 (empty states). Icons next to text are `aria-hidden="true"`; icon-only buttons need `aria-label` from the copy deck.

### 5.1 Category icons (12 categories, `categories.*` in copy deck)
| ID | TH / EN | lucide icon | Chip style |
|---|---|---|---|
| `food` | อาหารและเครื่องดื่ม / Food & Drink | `UtensilsCrossed` | neutral |
| `transport` | การเดินทาง / Transport | `Bus` | neutral |
| `shopping` | ช้อปปิ้ง / Shopping | `ShoppingBag` | neutral |
| `bills` | ค่าบิลและสาธารณูปโภค / Bills & Utilities | `ReceiptText` | neutral |
| `housing` | ที่อยู่อาศัย/ค่าเช่า / Housing/Rent | `House` | neutral |
| `health` | สุขภาพ / Health | `HeartPulse` | neutral |
| `entertainment` | บันเทิง / Entertainment | `Clapperboard` | neutral |
| `education` | การศึกษา / Education | `GraduationCap` | neutral |
| `transfer` | โอนให้บุคคล / Transfer to person | `Send` | neutral |
| `other` | อื่น ๆ / Other | `Shapes` | neutral |
| `salary` | เงินเดือน / Salary | `BriefcaseBusiness` | income-subtle |
| `other_income` | รายรับอื่น ๆ / Other income | `PiggyBank` | income-subtle |

Category chip = 40×40 circle; expense categories `surface-2` bg + `text` icon; income categories `income-subtle` bg + `income` icon. (Category identity = icon + name, **not** color.)

### 5.2 UI icons
| Purpose | Icon | Purpose | Icon |
|---|---|---|---|
| Nav Home | `House` | Upload slip | `ImageUp` |
| Nav Transactions | `ListOrdered` | Google Photos | `Images` |
| Nav Add | `Plus` | Manual entry | `PencilLine` |
| Nav Settings | `Settings` | Trust / privacy | `LockKeyhole` |
| Income / Expense | `ArrowDownLeft` / `ArrowUpRight` | Source: slip / manual | `ScanText` / `PencilLine` |
| Prev / next month | `ChevronLeft` / `ChevronRight` | Close | `X` |
| Delete | `Trash2` | Retry | `RotateCcw` |
| Success | `CircleCheck` | Error | `CircleAlert` |
| Warning / low confidence | `TriangleAlert` | Info | `Info` |
| Duplicate | `CopyCheck` | Offline | `WifiOff` |
| Search / filter | `Search` / `SlidersHorizontal` | OCR text | `FileText` |
| Export / import | `Download` / `FileUp` | Language | `Languages` |
| Zoom image | `ZoomIn` | Waiting (queue) | `Clock` |
| Cancelled (queue) | `Ban` | Empty: month / no results / import error | `CalendarX2` / `SearchX` / `FileX2` |

---

## 6. Component specs

Notation: **A11y** = required semantics; sizes in px at 1rem = 16px. All components consume tokens only (no raw hex in components).

### 6.1 Button
| Variant | Fill | Text | Border | Use |
|---|---|---|---|---|
| `primary` | `primary` | `on-primary` | — | One per view: Save, Save selected, Upload |
| `secondary` | `surface` | `primary` | 1px `border-strong` | Cancel, secondary CTA |
| `ghost` | transparent | `primary` | — | Tertiary (Select all, View existing) |
| `danger` | `danger` | `on-danger` | — | Confirm delete (inside dialog only) |
| `danger-ghost` | transparent | `danger` | 1px `danger` | Delete entry point in edit form, Delete all |

Size: `md` h48, padding 0 20, radius md, text md/600 · `sm` visual h40 with hit-area padding to 44. Icon 20 left of label, gap 8. Full-width on mobile in sheets/footers.
States: hover = `primary-hover`; active = `primary-active` + scale .98 (fast); focus-visible = focus ring; disabled = `aria-disabled="true"` (stays focusable so reason is reachable), 40% opacity of fill **plus** reason text nearby (e.g. Review footer); loading = spinner 16 replaces icon, label stays ("กำลังบันทึก…"), `aria-busy="true"`, prevents double submit (OMX-013 AC2).

### 6.2 Card
`surface`, radius lg, padding 16, `shadow-1`, 1px `border` in dark mode (shadows weak). Header row: h2 18/600 + optional action (ghost button). Interactive cards: whole card is a `<button>`/`<a>` with focus ring; hover lifts to `shadow-2`.

### 6.3 Input (text / amount / date / textarea)
Label above (16/500), control h48, radius md, 1px `border-strong`, bg `surface`, padding 0 12, text 16. Helper below (14 `text-muted`). Error: border 2px `danger` + `CircleAlert` + message (14 `danger`), linked via `aria-describedby`, `aria-invalid="true"`.
- **Amount:** `inputmode="decimal"`, prefix "฿" (decorative, `aria-hidden`; label says "จำนวนเงิน (บาท)"), value 22/600 tabular, right-aligned; formats with thousand separators on blur; accepts `1,000`.
- **Date:** native `<input type="date">` + formatted label to the right/below: "13 พ.ย. 2569" (X6, OMX-013 AC1). Future date → warning helper (non-blocking).
- **Needs review highlight (Review):** 2px `warning` border + `TriangleAlert` + helper text "ตรวจสอบช่องนี้" (border + icon + text, OMX-012a AC1).
- Optional fields: "(ไม่บังคับ / optional)" in label, never only placeholder.

### 6.4 Category picker — icon grid
Trigger: input-like button showing chip + name + `ChevronDown`, `aria-haspopup="dialog"`.
Panel: **bottom sheet on mobile / popover (`<dialog>`) on desktop**, title "เลือกหมวดหมู่". Grid 3 columns (mobile) / 4 (desktop), tile min 96×88: chip 40 + name (14/500, 2 lines max, centered).
Only categories valid for current type are shown (expense: 10, income: 2) (OMX-012a AC3, OMX-013 AC1).
A11y: `role="radiogroup"` with tiles `role="radio"` `aria-checked`; arrow keys move, Enter/Space selects and closes, Esc closes and returns focus to trigger. Selected tile: `primary-subtle` bg + 2px `primary` border + `Check` badge (not color-only).

### 6.5 Type toggle (segmented control)
Two segments รายจ่าย/Expense · รายรับ/Income (expense first = default). h48, track `surface-2` radius md, padding 4. Selected: `surface` bg + `shadow-1` + text in `expense`/`income` + arrow icon + `Check`; unselected `text-muted`.
A11y: `role="radiogroup"` + `aria-label="ประเภทรายการ"`, segments `role="radio"`, arrow keys switch. Changing type resets invalid category (OMX-012a AC3) and announces "เปลี่ยนหมวดเป็น รายรับอื่น ๆ" via live region.

### 6.6 Toast
Bottom-center, above bottom nav (mobile) / bottom-right (desktop), max-width 420, `surface-raised` bg + 1px `border` + `shadow-3` + 4px left bar in semantic color + icon. Text 16, optional action (ghost button, e.g. "ดูรายการ", "เลิกทำ").
Duration: 5s default; **with action ≥ 6s and paused while hovered/focused** (OMX-016 AC3, WCAG 2.2.1). Container `role="status" aria-live="polite"`; errors use banner/inline instead of toast. Max 1 visible; newer replaces older.

### 6.7 Banner (app-level)
Full width under header: icon + message + action + dismiss (`X`). Variants: info (in-memory mode), warning (storage full → "ส่งออกข้อมูล"), danger (corrupt data → "ส่งออกข้อมูลดิบ"), offline (`WifiOff`). `role="status"` (warning/info) or `role="alert"` (danger, once).

### 6.8 Navigation
**Bottom nav (< 1024px):** h64 + safe-area, `surface` + top border + `shadow-2`. 4 slots: Home · Transactions · **Add (centre)** · Settings. Item = icon 24 + label 13/600, min 64×56. Active: icon+label `primary` + 32×4 pill indicator above icon + `aria-current="page"`. Add = 56px circle `primary` FAB raised 12px with `shadow-fab`, label "เพิ่ม" beneath; it opens the Add sheet (`aria-haspopup="dialog"`, `aria-expanded`).
**Side nav (≥ 1024px):** w248, `surface`, right border. Top: logo + wordmark. Primary "+ เพิ่มรายการ" button (opens same menu as popover), then nav items (h48, radius md; active = `primary-subtle` bg + `primary-text` + 3px left bar). Bottom: TH|EN switch + privacy line.
**Header (mobile):** h56: screen title (h1) left · TH|EN compact switch right. On Dashboard/Transactions the Month selector sits in a second row.
**Skip link:** first focusable, "ข้ามไปเนื้อหา", visible on focus.

### 6.9 Sheet (bottom sheet / dialog)
Native `<dialog>` (`showModal`) → focus trap, Esc closes, focus returns to opener (OMX-027 AC1). Mobile: anchored bottom, radius xl top, drag handle 36×4 (decorative; close button always present), max-height 90vh, scroll inside, sticky footer actions. Desktop: centered dialog, max-width 560, radius xl. Scrim `overlay`. Enter: slide-up 240ms `enter`; exit 200ms `exit`.
Full-screen variant (Transaction form on mobile): own route (`#/transactions/new`) so Back closes it (OMX-013 AC1).

### 6.10 Month selector
`‹  พฤศจิกายน 2569  ›` centered; arrows 44×44 icon buttons with `aria-label` "เดือนก่อนหน้า"/"เดือนถัดไป"; **next `aria-disabled` at current month** (OMX-017 AC2). Label is a button opening month/year grid (sheet: year stepper + 12 month tiles 3×4, future months disabled). "เดือนนี้" ghost chip appears at right when not on current month. Label `aria-live="polite"` announces new month.

### 6.11 Stat tile
- **Hero (Balance):** `surface`, radius xl, padding 20, label "คงเหลือ" 14/500 muted, value `.omx-amount-hero` 700; sub-line "รายรับ − รายจ่าย เดือนนี้". Negative → warning style (§2.3).
- **Mini (Income / Expense):** 2 columns, padding 16, icon chip 32 (income-subtle / expense-subtle) + label 14 + value 22/700 tabular in semantic color with sign. Values shrink to 18 if width < 150 (OMX-018 AC5).
Loading: skeleton bars at the value positions. A11y: each tile is a group with `aria-label` "รายรับเดือนนี้ 45,000.00 บาท".

### 6.12 Bar charts (hand-rolled SVG — OMX-019/020)
**Category (horizontal):** each row is a `<button>` (min h52): chip 32 + name (16/500) + right value "4,250.00" + "(32.4%)" muted; bar below, h8 radius full, track `chart-track`, fill `chart-bar` (single accent, ≥ 3:1). Sorted descending. Max 6 rows + "ดูทั้งหมด" if more. Text table available via "ดูเป็นตาราง" toggle (shared with trend).
**Trend (grouped vertical):** 6 groups, bar width 12, gap 4, income solid `chart-income` first, expense `chart-expense` with 45° hatch (SVG `<pattern>`) second; y-axis 3 gridlines with compact labels ("20k"), month labels 13px (พ.ย./Nov). Legend above with swatch-pattern + text. `role="img"` + `aria-label` summary ("6 เดือน: รายรับสูงสุด พ.ย. …") + visible table toggle.
Bars grow from 0 in 360ms; none under reduced motion (OMX-019 AC5).

### 6.13 Empty state
Centered in card or screen: illustration/icon 48 in a 96 circle (`primary-subtle`), title 18/600, body 16 muted (max 2 lines), primary + secondary buttons stacked (mobile) / inline (desktop). Copy from `empty.*` keys. Variants: first-use (2 CTAs), no-month-data (1 CTA), no-results (Clear filters), review-all-failed (Enter manually), chart-no-expense (text only).

### 6.14 Skeleton
Blocks in `surface-2`, radius sm, shimmer gradient 1.4s (static when reduced motion). Mirrors final layout: hero (1 line 60%), 2 tiles, 5 list rows (chip circle + 2 lines + amount). Container `aria-busy="true"` + visually-hidden "กำลังโหลด…". Show only if loading > 150ms to avoid flash (OMX-026 AC6).

### 6.15 Dropzone / Upload button (OMX-001, 002)
Single component. Mobile: large primary button "อัปโหลดรูปสลิป" (h56, icon `ImageUp`) + helper "JPG, PNG, WebP · สูงสุด 10 MB · ครั้งละ 20 รูป". ≥ 768px: dashed 2px `border-strong` box radius lg, padding 32, icon 32 + "ลากรูปสลิปมาวาง หรือ" + button. Drag-over: 3px dashed `primary` + `primary-subtle` bg + text "วางไฟล์ที่นี่" (OMX-002 AC1). Whole zone keyboard-activatable (`role="button"`, Enter/Space opens picker) with hidden `<input type="file" accept="image/jpeg,image/png,image/webp" multiple>`.

### 6.16 Queue item with progress (OMX-005)
Row h72: thumbnail 48×48 radius sm · file name (ellipsis, 14 muted) + status line · trailing action.
| Status | Visual | Status text key | Action |
|---|---|---|---|
| Waiting | `Clock` muted | `queue.status.waiting` | Remove `X` (OMX-001 AC6) |
| Loading model | spinner + indeterminate bar | `queue.status.loadingModel` | — |
| Recognizing | progress bar h6 `primary`, % right (tabular) | `queue.status.recognizing` | — |
| Done | `CircleCheck` income + summary "−1,250.00 · อาหาร" | `queue.status.done` | — |
| Failed | `CircleAlert` danger + reason | `queue.status.failed` | Retry · Enter manually |
| Cancelled | `Ban` muted | `queue.status.cancelled` | — |
Progress: `role="progressbar"` `aria-valuemin=0 aria-valuemax=100 aria-valuenow` + `aria-label` file name. Header: "กำลังอ่านสลิป 2/8" + overall bar + Cancel (secondary). Status changes announced via one polite live region (not per %).

### 6.17 Review card (OMX-012a/b, 011)
**Collapsed (mobile):** checkbox 24 (hit 44) · thumbnail 56×72 (button → image dialog) · amount 18/700 with sign + type text · date · category chip+name · badges row (confidence Medium/Low `warning-subtle`; Duplicate/Possible duplicate `info-subtle`) · `ChevronDown` expand.
**Expanded:** Type toggle **at top** → Amount → Category → Date (+time) → Payee → Note → `<details>` "ข้อความจาก OCR" (mono 14, plain text) → footer: "ทิ้ง" danger-ghost (confirm) · "ดูรายการเดิม" ghost (if duplicate).
**Desktop ≥ 1024:** card becomes 2 columns: slip image 280 wide (sticky, zoomable) left, form right (always expanded).
States: needs-review fields highlighted (§6.3); invalid → card gets 2px `danger` left bar + "ยังไม่ครบ" badge; duplicate → unchecked, `surface-2` bg and "ซ้ำ" label (not opacity-only, OMX-011 AC1).
**Sticky footer:** `surface` + `shadow-2`: "เลือกทั้งหมด / ไม่เลือก" ghost + primary "บันทึกที่เลือก (N)"; disabled with reason text above ("2 รายการยังไม่ครบ") (OMX-012a AC5).

### 6.18 Dialog (confirm)
`<dialog>`, max-width 400, title 18/600, body 16, actions right-aligned (stacked on mobile, primary on top). **Destructive confirm: initial focus = Cancel** (OMX-016 AC3, OMX-030 AC4). Copy in `dialog.*`.

### 6.19 Transaction row (OMX-014)
h≥64: category chip 40 · column [payee or note (16/500, ellipsis) / category name · time (14 muted)] · right column: amount (18/600 tabular, sign + arrow icon 16, semantic color, visually-hidden type label) with source badge underneath (keeps meta on one line at 320px). Row is a button opening the edit form. Date group header sticky: "13 พ.ย. 2569" left, day net "−1,770.00" right, 14/600 on `bg`.

### 6.20 Language switch
Segmented text "TH | EN" (h36 visual, hit 44), current `aria-pressed="true"` / or radiogroup; each option has `lang` attribute ("ไทย" `lang="th"`, "English" `lang="en"`; visible labels TH / EN with `aria-label` full names). Never flags.

---

## 7. Accessibility checklist (D10 — applies to every screen)
1. Route change → focus `h1` (`tabIndex=-1`) and update `document.title` (`app.title` + screen) (OMX-027 AC2).
2. Single polite live region in shell for toasts/status; assertive only for blocking errors.
3. Tab order follows visual order; sticky footers/bottom nav come after main content in DOM.
4. All dialogs/sheets = native `<dialog>`; Esc + back button close; focus returns.
5. Never color alone: sign, icon, text label, pattern.
6. Touch targets ≥ 44; spacing ≥ 8 between adjacent targets.
7. 200% zoom / 320px width: single column, no horizontal scroll, sticky elements must not cover > 30% of viewport (collapse sticky header when zoomed).
8. Reduced motion: tokens → 0ms.
9. Form errors: inline, `aria-describedby`, focus first invalid field on submit.
10. Language: `<html lang>` follows UI; mixed-language strings (e.g. bank name) don't need `lang` unless full sentences.
