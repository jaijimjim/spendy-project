/** Critical journeys on the production build with the fake OCR engine (QA test plan, journeys 1–7). */
import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { makePng, seed, setup, SAMPLE } from './helpers';

const png = (name: string, seedN = 1) => ({
  name,
  mimeType: 'image/png',
  buffer: makePng(seedN, 24),
});

test.describe('slip journey', () => {
  test('upload → OCR → review → save → dashboard (OMX-001/005/012/018)', async ({ page }) => {
    await setup(page);
    await page.goto('./#/add');
    await page
      .getByTestId('file-input')
      .setInputFiles([
        png('slip-food.png', 1),
        png('slip-salary.png', 2),
        png('slip-noamount.png', 3),
        png('corrupt.png', 4),
      ]);
    await expect(page.getByText('อ่านไม่สำเร็จ', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: /ตรวจรายการ \(3 พร้อม\)/ })).toBeVisible();
    await page.getByRole('button', { name: /ตรวจรายการ/ }).click();

    const cards = page.getByTestId('review-card');
    await expect(cards).toHaveCount(3);
    // incomplete item blocks saving until fixed (OMX-012a AC5)
    await expect(page.getByText('1 รายการยังไม่ครบ')).toBeVisible();
    const incomplete = cards.filter({ hasText: 'ยังไม่ครบ' });
    await incomplete.getByLabel('จำนวนเงิน (บาท)').fill('99');
    await expect(page.getByText('1 รายการยังไม่ครบ')).toHaveCount(0);
    await page.getByRole('button', { name: /บันทึกที่เลือก \(3\)/ }).click();
    await expect(page.getByTestId('toast')).toContainText('บันทึกแล้ว 3 รายการ');
    await expect(page.getByText('ไม่มีรายการให้ตรวจ')).toBeVisible();

    await page.goto('./#/');
    await expect(page.getByTestId('total-expense')).toHaveText('−344.00');
    // salary slip is dated October (pay date 25/10/2569) so November income is 0
    await expect(page.getByTestId('total-income')).toHaveText('0.00');
    await page.getByRole('button', { name: 'เดือนก่อนหน้า' }).click();
    await expect(page.getByTestId('total-income')).toHaveText('+43,650.00');
  });

  test('duplicate image in same batch is skipped and summary shown (OMX-001 AC5, OMX-011 AC5)', async ({
    page,
  }) => {
    await setup(page);
    await page.goto('./#/add');
    await page
      .getByTestId('file-input')
      .setInputFiles([
        png('slip-food.png', 7),
        png('slip-food-copy.png', 7),
        { name: 'x.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a......') },
      ]);
    await expect(page.getByTestId('toast')).toContainText('ข้าม 2 ไฟล์');
  });

  test('re-importing a saved slip is flagged Duplicate and unchecked (OMX-011 AC1)', async ({
    page,
  }) => {
    await setup(page);
    await page.goto('./#/add');
    await page.getByTestId('file-input').setInputFiles([png('slip-bill.png', 9)]);
    await page.getByRole('button', { name: /ตรวจรายการ/ }).click();
    await page.getByRole('button', { name: /บันทึกที่เลือก \(1\)/ }).click();
    await page.goto('./#/add');
    await page.getByTestId('file-input').setInputFiles([png('slip-bill.png', 9)]);
    await page.getByRole('button', { name: /ตรวจรายการ/ }).click();
    const card = page.getByTestId('review-card');
    await expect(card.getByText('ซ้ำ', { exact: true })).toBeVisible();
    await expect(card.getByRole('checkbox')).not.toBeChecked();
  });

  test('OCR text is rendered as plain text — no script execution (OMX-031 AC2)', async ({
    page,
  }) => {
    let dialog = false;
    page.on('dialog', (d) => {
      dialog = true;
      void d.dismiss();
    });
    await setup(page);
    await page.goto('./#/add');
    await page.getByTestId('file-input').setInputFiles([png('slip-xss.png', 5)]);
    await page.getByRole('button', { name: /ตรวจรายการ/ }).click();
    await expect(page.getByLabel(/ผู้รับ/).first()).toHaveValue('<img src=x onerror=alert(1)>');
    expect(dialog).toBe(false);
  });
});

test.describe('manual entry & management', () => {
  test('add, edit and delete with undo (OMX-013/016)', async ({ page }) => {
    await setup(page);
    await page.goto('./#/transactions/new');
    await page.getByRole('button', { name: 'บันทึก', exact: true }).click();
    await expect(page.getByText('กรุณากรอกจำนวนเงิน')).toBeVisible();
    await page.getByLabel('จำนวนเงิน (บาท)').fill('1,000');
    await page.getByRole('button', { name: 'หมวดหมู่', exact: true }).click();
    await page.getByRole('radio', { name: /การเดินทาง/ }).click();
    await page.getByLabel(/ผู้รับ/).fill('  วินมอเตอร์ไซค์  ');
    await page.getByRole('button', { name: 'บันทึก', exact: true }).click();
    await expect(page).toHaveURL(/#\/transactions$/);
    await expect(page.getByTestId('toast')).toContainText('บันทึกรายการแล้ว');
    const row = page.getByRole('button', { name: /วินมอเตอร์ไซค์/ });
    await expect(row).toContainText('−1,000.00');

    await row.click();
    await page.getByLabel('จำนวนเงิน (บาท)').fill('80');
    await page.getByRole('button', { name: 'บันทึก', exact: true }).click();
    await expect(page.getByTestId('toast')).toContainText('อัปเดตรายการแล้ว');
    await expect(page.getByRole('button', { name: /วินมอเตอร์ไซค์/ })).toContainText('−80.00');

    await page.getByRole('button', { name: /วินมอเตอร์ไซค์/ }).click();
    await page.getByRole('button', { name: 'ลบรายการนี้' }).click();
    const dlg = page.getByRole('dialog', { name: 'ลบรายการนี้?' });
    await expect(dlg.getByRole('button', { name: 'ยกเลิก' })).toBeFocused(); // destructive ⇒ Cancel focused
    await dlg.getByRole('button', { name: 'ลบ', exact: true }).click();
    await expect(page.getByText('เริ่มบันทึกจากสลิปแรกของคุณ')).toBeVisible();
    await page.getByRole('button', { name: 'เลิกทำ' }).click();
    await expect(page.getByRole('button', { name: /วินมอเตอร์ไซค์/ })).toBeVisible();
  });

  test('filters & search (OMX-015)', async ({ page }) => {
    await setup(page);
    await seed(page, SAMPLE);
    await page.goto('./#/transactions');
    await page.getByLabel('ค้นหารายการ').fill('1,385');
    await expect(page.getByText('พบ 1 รายการ')).toBeVisible();
    await page.getByLabel('ค้นหารายการ').fill('zzzz');
    await expect(page.getByText('ไม่พบรายการที่ตรงกัน')).toBeVisible();
    await page.getByRole('button', { name: 'ล้างตัวกรอง' }).click();
    await page.getByRole('button', { name: /ตัวกรอง/ }).click();
    await page.getByRole('checkbox', { name: /การเดินทาง/ }).click();
    await page.getByRole('button', { name: 'ดูผลลัพธ์' }).click();
    await expect(page.getByText('พบ 1 รายการ')).toBeVisible();
    await expect(page.getByRole('button', { name: /ลบตัวกรอง การเดินทาง/ })).toBeVisible();
  });
});

test.describe('platform', () => {
  test('language switch is immediate, persisted and sets <html lang> (OMX-024)', async ({
    page,
  }) => {
    await setup(page);
    await seed(page, SAMPLE);
    await page.goto('./#/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'th');
    await page.getByRole('button', { name: 'English' }).first().click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByText('November 2026')).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home');
  });

  test('data persists across reload; deep link works (OMX-021, OMX-025 AC4)', async ({ page }) => {
    await setup(page);
    await seed(page, SAMPLE);
    await page.goto('./#/transactions');
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('รายการ');
    await expect(page.getByText('GrabFood')).toBeVisible();
  });

  test('corrupt storage shows recovery banner and keeps a backup (OMX-021 AC4)', async ({
    page,
  }) => {
    await setup(page);
    await page.addInitScript(() => localStorage.setItem('omx.v1', '{broken'));
    await page.goto('./#/');
    await expect(page.getByRole('alert')).toContainText('ข้อมูลที่เก็บไว้เสียหาย');
    const keys = await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith('omx.v1.corrupt.')),
    );
    expect(keys.length).toBe(1);
  });

  test('failed storage write shows banner and keeps memory unchanged (OMX-021 AC3)', async ({
    page,
  }) => {
    await setup(page, { storage: 'broken' });
    await page.goto('./#/transactions/new');
    await page.getByLabel('จำนวนเงิน (บาท)').fill('10');
    await page.getByRole('button', { name: 'หมวดหมู่', exact: true }).click();
    await page.getByRole('radio', { name: /อื่น ๆ/ }).click();
    await page.getByRole('button', { name: 'บันทึก', exact: true }).click();
    await expect(page.getByText(/บันทึกไม่สำเร็จ/)).toBeVisible();
    await expect(page).toHaveURL(/transactions\/new/);
  });

  test('Google Photos shows "not configured" without a Client ID (OMX-004 AC1)', async ({
    page,
  }) => {
    await setup(page);
    await page.goto('./#/add');
    await expect(page.getByRole('button', { name: 'นำเข้าจาก Google Photos' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );
    await expect(page.getByText('ยังไม่ได้ตั้งค่า Google Photos — ใช้การอัปโหลดแทน')).toBeVisible();
  });

  test('delete all data clears storage (OMX-030 AC4)', async ({ page }) => {
    await setup(page);
    await seed(page, SAMPLE);
    await page.goto('./#/settings');
    await page.getByRole('button', { name: 'ลบข้อมูลทั้งหมด' }).click();
    await page.getByRole('button', { name: 'ลบทั้งหมด' }).click();
    await expect(page.getByText('เริ่มบันทึกจากสลิปแรกของคุณ')).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('omx.v1'))).toBeNull();
  });

  test('CSV export escapes formulas and has BOM (OMX-023)', async ({ page }) => {
    await setup(page);
    await seed(page, [{ ...SAMPLE[2], payee: '=HYPERLINK("x")' }]);
    await page.goto('./#/settings');
    await page.getByRole('button', { name: /ส่งออกข้อมูล/ }).click();
    await page.getByLabel(/CSV/).check();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'ดาวน์โหลด' }).click(),
    ]);
    const text = await (
      await download.createReadStream()
    )
      .toArray()
      .then((c) => Buffer.concat(c).toString('utf8'));
    expect(text.charCodeAt(0)).toBe(0xfeff);
    expect(text).toContain(`"'=HYPERLINK(""x"")"`);
  });

  test('network allowlist: only same-origin requests during the slip flow (OMX-030 AC1)', async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL!).origin;
    const foreign: string[] = [];
    page.on('request', (r) => {
      const u = r.url();
      if (!u.startsWith(origin) && !u.startsWith('blob:') && !u.startsWith('data:'))
        foreign.push(`${r.method()} ${u}`);
    });
    await setup(page);
    await page.goto('./#/add');
    await page.getByTestId('file-input').setInputFiles([png('slip-food.png', 11)]);
    await page.getByRole('button', { name: /ตรวจรายการ/ }).click();
    await page.getByRole('button', { name: /บันทึกที่เลือก/ }).click();
    await page.goto('./#/');
    expect(foreign).toEqual([]);
  });
});

test.describe('accessibility (OMX-027 AC6)', () => {
  for (const [name, path] of [
    ['dashboard', '#/'],
    ['transactions', '#/transactions'],
    ['add', '#/add'],
    ['form', '#/transactions/new'],
    ['settings', '#/settings'],
  ] as const) {
    test(`axe: ${name} has no critical/serious violations`, async ({ page }) => {
      await setup(page);
      await seed(page, SAMPLE);
      await page.goto(`./${path}`);
      await page.getByRole('heading', { level: 1 }).waitFor();
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();
      const bad = results.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      );
      expect(
        bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      ).toEqual([]);
    });
  }

  test('axe: review screen', async ({ page }) => {
    await setup(page);
    await page.goto('./#/add');
    await page
      .getByTestId('file-input')
      .setInputFiles([png('slip-food.png', 12), png('slip-noamount.png', 13)]);
    await page.getByRole('button', { name: /ตรวจรายการ \(2/ }).click();
    await page.getByTestId('review-card').first().waitFor();
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious');
    expect(bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual(
      [],
    );
  });

  test('skip link and focus on route change (OMX-027 AC1/AC2)', async ({ page }) => {
    await setup(page);
    await seed(page, SAMPLE);
    await page.goto('./#/');
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'ข้ามไปเนื้อหา' })).toBeFocused();
    await page.goto('./#/settings');
    await expect(page.getByRole('heading', { level: 1, name: 'ตั้งค่า' })).toBeFocused();
  });
});
