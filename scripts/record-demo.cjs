// Records the Sprint 1 demo of Omnitrix Money (real OCR, production build) to webm + a timing log.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const OUT = __dirname;
const IMG = '/home/claude/omnitrix-project/tests/fixtures/slips/images/';
const BASE = 'http://localhost:4173/omnitrix-project/';
const W = 1280, H = 720;

const mk = (id, type, cat, baht, date, payee, source = 'slip') => ({
  id, type, categoryId: cat, amountSatang: Math.round(baht * 100), date, payee, source,
  createdAt: '2026-11-01T00:00:00Z', updatedAt: '2026-11-01T00:00:00Z',
  ...(source === 'slip' ? { slip: { confidence: 'high' } } : {}),
});
const SEED = [];
const months = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10'];
const inc = [44000, 44000, 45000, 45000, 45000];
const exp = [[8500, 6200, 2100, 1800, 3900], [8500, 5800, 2300, 1500, 2100], [8500, 7100, 2050, 2200, 5400], [8500, 6600, 2200, 1700, 2600], [8500, 6900, 2150, 1900, 4300]];
months.forEach((m, i) => {
  if (m !== '2026-10') SEED.push(mk(`s${i}a`, 'income', 'salary', inc[i], `${m}-25`, 'บริษัท ออมนิ จำกัด'));
  ['housing', 'food', 'bills', 'transport', 'shopping'].forEach((c, j) =>
    SEED.push(mk(`s${i}${j}`, 'expense', c, exp[i][j], `${m}-1${j}`, ['ค่าเช่าคอนโด', 'อาหาร', 'ค่าโทรศัพท์', 'BTS', 'Shopee'][j], j % 2 ? 'manual' : 'slip')));
});
SEED.push(mk('n1', 'expense', 'housing', 8500, '2026-11-02', 'ค่าเช่าคอนโด'));
SEED.push(mk('n2', 'expense', 'transport', 47, '2026-11-12', 'BTS สถานีอโศก'));
SEED.push(mk('n3', 'expense', 'shopping', 1290, '2026-11-10', 'Uniqlo'));

const OVERLAY = () => {
  window.__cap = (t, sub) => {
    let el = document.getElementById('__cap');
    if (!el) {
      el = document.createElement('div');
      el.id = '__cap';
      el.style.cssText = 'position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:2147483647;max-width:1180px;white-space:nowrap;background:rgba(20,18,43,.92);color:#fff;font:600 21px/1.45 "IBM Plex Sans Thai",sans-serif;padding:14px 26px;border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,.25);text-align:center;pointer-events:none;transition:opacity .25s';
      document.documentElement.appendChild(el);
    }
    el.innerHTML = t ? `${t}${sub ? `<div style="font-weight:400;font-size:16px;opacity:.8;margin-top:2px">${sub}</div>` : ''}` : '';
    el.style.opacity = t ? '1' : '0';
  };
  window.__click = (x, y) => {
    const d = document.createElement('div');
    d.style.cssText = `position:fixed;left:${x - 22}px;top:${y - 22}px;width:44px;height:44px;border-radius:50%;background:rgba(68,51,196,.35);border:3px solid rgba(68,51,196,.9);z-index:2147483646;pointer-events:none;transition:all .5s;`;
    document.documentElement.appendChild(d);
    setTimeout(() => { d.style.transform = 'scale(1.6)'; d.style.opacity = '0'; }, 30);
    setTimeout(() => d.remove(), 600);
  };
};

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: W, height: H }, recordVideo: { dir: OUT, size: { width: W, height: H } }, locale: 'th-TH' });
  const page = await ctx.newPage();
  const t0 = Date.now();
  const log = [];
  const mark = (name) => { log.push({ name, t: (Date.now() - t0) / 1000 }); console.log(name, ((Date.now() - t0) / 1000).toFixed(1)); };
  const shot = (n) => page.screenshot({ path: path.join(OUT, `chk-${n}.jpg`), type: 'jpeg', quality: 80 });
  const cap = (t, s) => page.evaluate(([a, b]) => window.__cap && window.__cap(a, b), [t, s]);
  const wait = (ms) => page.waitForTimeout(ms);
  async function click(loc) {
    await loc.scrollIntoViewIfNeeded();
    const b = await loc.boundingBox();
    if (b) await page.evaluate(([x, y]) => window.__click(x, y), [b.x + b.width / 2, b.y + b.height / 2]);
    await wait(350);
    await loc.click();
  }

  await page.addInitScript(OVERLAY);
  await page.addInitScript(([s]) => {
    window.__OMX_TEST__ = { now: '2026-11-13T19:30:00+07:00', ocr: 'real' };
    if (!localStorage.getItem('omx.v1')) localStorage.setItem('omx.v1', JSON.stringify({ version: 1, transactions: s, settings: { language: 'th' } }));
  }, [SEED]);

  // 1) Title card
  await page.setContent(`<html><body style="margin:0;height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#4433c4,#2a1f86);font-family:'IBM Plex Sans Thai',sans-serif;color:#fff">
  <div style="text-align:center"><div style="font-size:20px;letter-spacing:.2em;opacity:.8">SPRINT 1 · DEMO</div>
  <div style="font-size:64px;font-weight:700;margin:10px 0">Omnitrix Money</div>
  <div style="font-size:28px">MVP_0001 · คำนวณรายรับรายจ่ายอัตโนมัติจากสลิป</div>
  <div style="font-size:18px;opacity:.75;margin-top:28px">PO/PM · Designer · Developer · QA — 13 พ.ย. 2569</div></div></body></html>`);
  mark('title'); await wait(4500);

  // 2) Dashboard
  await page.goto(BASE + '#/');
  await page.waitForSelector('[data-testid="total-expense"]');
  await page.evaluate(() => document.fonts.ready);
  mark('dashboard');
  await cap('หน้าหลัก: สรุปคงเหลือ รายรับ รายจ่าย ของเดือนนี้', 'Dashboard · เดือน พ.ย. 2569 · มีข้อมูลตัวอย่างย้อนหลัง 5 เดือน');
  await wait(3500); await shot('dash');
  await page.mouse.wheel(0, 500); await wait(1800);
  await cap('รายจ่ายแยกตามหมวดหมู่ และกราฟแนวโน้ม 6 เดือน', 'กราฟวาดด้วย SVG อ่านได้ด้วย screen reader');
  await page.mouse.wheel(0, 600); await wait(3200);
  await page.mouse.wheel(0, -2000); await wait(600);

  // 3) Upload slips -> real OCR
  mark('add');
  await page.goto(BASE + '#/add');
  await page.waitForSelector('[data-testid="file-input"]', { state: 'attached' });
  await cap('เพิ่มสลิป: อัปโหลดเอง หรือดึงจาก Google Photos', 'รองรับ JPG / PNG / WebP · ลากวางได้หลายรูป');
  await wait(3000); await shot('add');
  await cap('อัปโหลด 3 สลิป: สลิปเงินเดือน · โอนจ่าย GrabFood · ค่าไฟฟ้า');
  await page.getByTestId('file-input').setInputFiles([IMG + 'b10-salary-th-table.png', IMG + 'b02-transfer-th-grabfood-balance.png', IMG + 'b05-bill-electricity.png']);
  await wait(1500);
  await cap('OCR อ่านสลิปภาษาไทยในเบราว์เซอร์ (Tesseract.js)', 'รูปสลิปไม่ถูกส่งออกจากเครื่อง');
  mark('ocr_start');
  await wait(2500); await shot('ocr');
  await page.getByRole('button', { name: /ตรวจรายการ \(3/ }).waitFor({ timeout: 300000 });
  mark('ocr_end');
  await cap('อ่านครบ 3 สลิปแล้ว → ไปตรวจรายการ'); await wait(2200);
  await click(page.getByRole('button', { name: /ตรวจรายการ/ }));

  // 4) Review
  await page.getByTestId('review-card').first().waitFor();
  mark('review');
  await cap('แยกประเภทเอง: สลิปเงินเดือน = รายรับ · สลิปโอน = รายจ่าย', 'ดึงยอดเงิน วันที่ ผู้รับ และจัดหมวดหมู่ให้อัตโนมัติ');
  await wait(4500); await shot('review');
  await page.mouse.wheel(0, 450); await wait(2500);
  await cap('ผู้ใช้ตรวจ/แก้ไขได้ก่อนบันทึก แล้วกด “บันทึกที่เลือก”');
  await page.mouse.wheel(0, 600); await wait(2500); await shot('review2');
  await click(page.getByRole('button', { name: /บันทึกที่เลือก/ }));
  await wait(2200);

  // 5) Dashboard updated
  await page.goto(BASE + '#/');
  await page.waitForSelector('[data-testid="total-income"]');
  mark('dash2');
  await cap('หน้าหลักอัปเดตทันที: ค่าอาหาร + ค่าไฟ เข้าหมวดหมู่ของเดือนนี้');
  await wait(4000); await shot('dash2');
  await click(page.getByRole('button', { name: 'เดือนก่อนหน้า' }));
  await cap('สลิปเงินเดือน ต.ค. ถูกบันทึกเป็นรายรับ +46,200 ของเดือนตุลาคม');
  await wait(4000); await shot('dash3');
  await click(page.getByRole('button', { name: /^เดือนนี้/ }).first());
  await wait(800);

  // 6) Transactions + search
  await click(page.getByRole('link', { name: 'รายการ' }).first());
  mark('tx');
  await cap('รายการทั้งหมด: ค้นหา กรอง แก้ไข ลบ (มีเลิกทำ)');
  await wait(2000);
  const search = page.getByLabel('ค้นหารายการ');
  await click(search);
  await search.pressSequentially('Grab', { delay: 140 });
  await wait(2500); await shot('tx');
  await search.fill(''); await wait(600);

  // 7) Manual entry
  mark('manual');
  await page.goto(BASE + '#/transactions/new');
  await page.getByLabel('จำนวนเงิน (บาท)').waitFor();
  await cap('กรอกเองได้ทั้งรายรับและรายจ่าย', 'เช่น ค่าวินมอเตอร์ไซค์ที่จ่ายเงินสด');
  await wait(1500);
  const amt = page.getByLabel('จำนวนเงิน (บาท)');
  await click(amt); await amt.pressSequentially('80', { delay: 160 });
  await click(page.getByRole('button', { name: 'หมวดหมู่', exact: true }));
  await wait(1200); await shot('cat');
  await click(page.getByRole('radio', { name: /การเดินทาง/ }));
  const payee = page.getByLabel(/ผู้รับ/);
  await click(payee); await payee.pressSequentially('วินมอเตอร์ไซค์', { delay: 90 });
  await wait(800);
  await click(page.getByRole('button', { name: 'บันทึก', exact: true }));
  await wait(2500);

  // 8) Language EN + dark mode
  mark('lang');
  await page.goto(BASE + '#/');
  await page.waitForSelector('[data-testid="total-income"]');
  await cap('สลับภาษา ไทย / English ได้ทุกหน้า');
  await wait(1500);
  await click(page.getByRole('button', { name: /^EN/ }).first());
  await wait(2500); await shot('en');
  await cap('Dark mode follows the device setting', 'Contrast ผ่าน WCAG AA ทั้งธีมสว่างและมืด');
  await page.emulateMedia({ colorScheme: 'dark' });
  await wait(3500); await shot('dark');
  await page.goto(BASE + '#/add'); await wait(600);
  await cap('Google Photos: shows “not configured” until a Client ID is set', 'ฟีเจอร์ทำเสร็จแล้ว รอ Google Client ID เพื่อทดสอบจริง');
  await wait(4000); await shot('gp');
  await page.emulateMedia({ colorScheme: 'light' });
  await cap('');

  // 9) End card
  mark('end');
  await page.setContent(`<html><body style="margin:0;height:100vh;display:grid;place-items:center;background:#f4f3fb;font-family:'IBM Plex Sans Thai',sans-serif;color:#16142b">
  <div style="width:1040px"><div style="font-size:18px;letter-spacing:.15em;color:#4433c4;font-weight:600">SPRINT 1 RESULT</div>
  <div style="font-size:44px;font-weight:700;margin:6px 0 26px">พร้อมเข้า UAT แบบมีเงื่อนไข</div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:16px">
   ${[['Must stories', '77/77 pts', 'Stretch 9/10'], ['Test cases', '118 / 132 ผ่าน', '1 Fail (Low) · 12 Blocked'], ['OCR บนสลิปทดสอบ', 'ยอดเงิน 96%', 'ประเภท/หมวด/วันที่ 100%']].map(([a, b, c]) => `<div style="background:#fff;border:1px solid #dcd9ee;border-radius:16px;padding:22px"><div style="color:#5d5a78;font-size:16px">${a}</div><div style="font-size:34px;font-weight:700;margin:4px 0">${b}</div><div style="color:#5d5a78;font-size:16px">${c}</div></div>`).join('')}
  </div>
  <div style="margin-top:26px;font-size:19px;line-height:1.7"><b>ก่อน UAT:</b> push ขึ้น GitHub + deploy Pages · ใส่ Google OAuth Client ID · ทดสอบบนมือถือจริง · ทดสอบกับสลิปจริง</div></div></body></html>`);
  await wait(6500);
  mark('done');

  const v = page.video();
  await ctx.close();
  await browser.close();
  fs.renameSync(await v.path(), path.join(OUT, 'raw.webm'));
  fs.writeFileSync(path.join(OUT, 'marks.json'), JSON.stringify(log, null, 1));
})().catch((e) => { console.error(e); process.exit(1); });
