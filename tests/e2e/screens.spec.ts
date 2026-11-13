/**
 * Visual capture of key screens at 375px (DPR 1) for design review against design/mockups.png.
 * Not an assertion suite — run with `npx playwright test --project=screens`.
 */
import { test } from '@playwright/test';
import { makePng, seed, setup, SAMPLE } from './helpers';

const out = (name: string) => `test-results/screens/${name}.png`;

test('capture key screens', async ({ page }) => {
  await setup(page);
  await seed(page, SAMPLE);
  await page.goto('./#/');
  await page.getByTestId('balance').waitFor();
  await page.screenshot({ path: out('1-dashboard'), fullPage: true });

  await page.getByRole('button', { name: 'เพิ่ม', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await page.waitForTimeout(400);
  await page.screenshot({ path: out('2-add-sheet') });
  await page.keyboard.press('Escape');

  await page.goto('./#/add');
  await page.getByTestId('file-input').setInputFiles([
    { name: 'slip-bill.png', mimeType: 'image/png', buffer: makePng(1, 40) },
    { name: 'slip-food.png', mimeType: 'image/png', buffer: makePng(2, 40) },
    { name: 'slip-noamount.png', mimeType: 'image/png', buffer: makePng(3, 40) },
    { name: 'corrupt-slip.png', mimeType: 'image/png', buffer: makePng(4, 40) },
    { name: 'notes.gif', mimeType: 'image/gif', buffer: Buffer.from('GIF89a') },
  ]);
  await page.getByText('อ่านไม่สำเร็จ', { exact: true }).waitFor();
  await page.waitForTimeout(300);
  await page.screenshot({ path: out('3-add-queue'), fullPage: true });

  await page.getByRole('button', { name: /ตรวจรายการ/ }).click();
  await page.getByTestId('review-card').first().waitFor();
  await page.screenshot({ path: out('4-review'), fullPage: true });

  await page.goto('./#/transactions');
  await page.getByRole('button', { name: /ตัวกรอง/ }).waitFor();
  await page.screenshot({ path: out('5-transactions'), fullPage: true });

  await page.goto('./#/transactions/new');
  await page.getByLabel('จำนวนเงิน (บาท)').fill('120');
  await page.screenshot({ path: out('6-manual-form'), fullPage: true });

  await page.goto('./#/settings');
  await page.waitForTimeout(200);
  await page.screenshot({ path: out('7-settings'), fullPage: true });
});

test('capture dark EN dashboard', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await setup(page, {}, 'en');
  await seed(
    page,
    SAMPLE.map((t) =>
      t.date.startsWith('2026-10') && t.type === 'expense' ? { ...t, amountSatang: 6000000 } : t,
    ),
    'en',
  );
  await page.goto('./#/');
  await page.getByRole('button', { name: 'Previous month' }).click();
  await page.getByTestId('balance').waitFor();
  await page.screenshot({ path: out('8-dashboard-dark-en'), fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.screenshot({ path: out('9-dashboard-desktop'), fullPage: true });
});
