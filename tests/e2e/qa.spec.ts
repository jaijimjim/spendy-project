/**
 * QA gap tests (Sprint 1 test execution) — cases from docs/qa/test-cases.md that the Dev suite
 * did not cover. Runs in the `mobile` (375) and `desktop` (1280) projects with fake OCR.
 * Tests marked `test.fail()` document an OPEN defect (BUG-xxx): they pass while the bug exists and
 * will start failing once Dev fixes it — then remove the marker.
 */
import { expect, test, type Page } from '@playwright/test';
import { makePng, seed, setup, SAMPLE, tx } from './helpers';

const png = (name: string, n: number, size = 24) => ({
  name,
  mimeType: 'image/png',
  buffer: makePng(n, size),
});

/** A valid PNG padded with trailing bytes to an exact size (signature check still passes). */
function pngOfSize(name: string, bytes: number, n = 1) {
  const base = makePng(n, 24);
  return {
    name,
    mimeType: 'image/png',
    buffer: Buffer.concat([base, Buffer.alloc(bytes - base.length)]),
  };
}

async function addManual(
  page: Page,
  amount: string,
  category: RegExp,
  type: 'Expense' | 'Income' = 'Expense',
) {
  await page.goto('./#/transactions/new');
  if (type === 'Income') await page.getByRole('radio', { name: /Income/ }).click();
  await page.getByLabel('Amount (THB)').fill(amount);
  await page.getByRole('button', { name: 'Category', exact: true }).click();
  await page.getByRole('radio', { name: category }).click();
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(page.getByTestId('toast')).toContainText('Transaction saved');
}

test.describe('QA — import rules (OMX-001)', () => {
  test('TC-002/003/004/006: type by signature, 0-byte, 10 MiB boundary → one summary message', async ({
    page,
  }) => {
    await setup(page, {}, 'en');
    await page.goto('./#/add');
    await page.getByTestId('file-input').setInputFiles([
      png('slip-food.png', 11),
      { name: 'fake.jpg', mimeType: 'image/jpeg', buffer: Buffer.from('%PDF-1.7 not an image') },
      { name: 'empty.png', mimeType: 'image/png', buffer: Buffer.alloc(0) },
      pngOfSize('slip-bill.png', 10_485_760, 12), // exactly 10 MiB → accepted
      pngOfSize('slip-transfer.png', 10_485_761, 13), // 1 byte over → skipped
    ]);
    const toast = page.getByTestId('toast');
    await expect(toast).toContainText('Skipped 3 files');
    await expect(toast).toContainText('unsupported type 2');
    await expect(toast).toContainText('over 10 MB 1');
    await expect(page.getByRole('button', { name: /Review \(2 ready\)/ })).toBeVisible();
  });

  test('TC-005: queue limit 20 — 21st image skipped and reported', async ({ page }) => {
    await setup(page, {}, 'en');
    await page.goto('./#/add');
    await page
      .getByTestId('file-input')
      .setInputFiles(Array.from({ length: 21 }, (_, i) => png(`slip-food-${i}.png`, 100 + i)));
    await expect(page.getByTestId('toast')).toContainText('over the 20-image limit 1');
    await expect(page.getByRole('button', { name: /Review \(20 ready\)/ })).toBeVisible({
      timeout: 30_000,
    });
  });
});

test.describe('QA — dates & money', () => {
  test.describe('device timezone America/Los_Angeles', () => {
    test.use({ timezoneId: 'America/Los_Angeles' });
    test('TC-059: slip dated 31/10/2569 23:59 is saved in October 2026 (OMX-008 AC7)', async ({
      page,
    }) => {
      await setup(
        page,
        {
          fakeOcr: {
            'late.png': 'โอนเงินสำเร็จ\n31/10/2569 23:59\nไปยัง\nนาย ทดสอบ ระบบ\nจำนวนเงิน 100.00 บาท',
          },
        },
        'en',
      );
      await page.goto('./#/add');
      await page.getByTestId('file-input').setInputFiles([png('late.png', 21)]);
      await page.getByRole('button', { name: /Review \(1 ready\)/ }).click();
      await page.getByRole('button', { name: /Save selected \(1\)/ }).click();
      await page.goto('./#/transactions');
      await expect(page.getByText('No transactions this month')).toBeVisible();
      await page.getByRole('button', { name: 'Previous month' }).click();
      await expect(page.getByText('October 2026').first()).toBeVisible();
      await expect(page.getByTestId('tx-row')).toContainText('100.00');
    });
  });

  test('TC-101: totals in satang — 0.10 + 0.20 = 0.30, zero balance shows 0.00 (OMX-018)', async ({
    page,
  }) => {
    await setup(page, {}, 'en');
    await addManual(page, '0.10', /Food/);
    await addManual(page, '0.20', /Food/);
    await page.goto('./#/');
    await expect(page.getByTestId('total-expense')).toHaveText('−0.30');
    await addManual(page, '0.30', /Other income/, 'Income');
    await page.goto('./#/');
    await expect(page.getByTestId('balance')).toHaveText('0.00');
  });

  test('TC-089/090: manual form — decimals, max, future-date warning (OMX-013 AC3/AC4)', async ({
    page,
  }) => {
    await setup(page, {}, 'en');
    await page.goto('./#/transactions/new');
    const amount = page.getByLabel('Amount (THB)');
    await page.getByRole('button', { name: 'Category', exact: true }).click();
    await page.getByRole('radio', { name: /Food/ }).click();
    await amount.fill('1.234');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Use at most 2 decimal places')).toBeVisible();
    await amount.fill('100000000');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByText('Maximum amount is 99,999,999.99')).toBeVisible();
    await amount.fill('55');
    await page.getByLabel('Date').fill('2026-11-20');
    await expect(page.getByText('Date is in the future')).toBeVisible();
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page).toHaveURL(/#\/transactions$/);
  });
});

test.describe('QA — month selector (OMX-017)', () => {
  test('TC-100: next disabled at current month; Jan 2570 → previous = ธันวาคม 2569; "This month" shortcut', async ({
    page,
  }) => {
    await setup(page, { now: '2027-01-05T09:00:00+07:00' });
    await seed(page, [tx({ date: '2026-12-31', amountSatang: 5000 })]);
    await page.goto('./#/');
    await expect(page.getByText('มกราคม 2570').first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'เดือนถัดไป' })).toBeDisabled();
    await page.getByRole('button', { name: 'เดือนก่อนหน้า' }).click();
    await expect(page.getByText('ธันวาคม 2569').first()).toBeVisible();
    await expect(page.getByTestId('total-expense')).toHaveText('−50.00');
    await page.getByRole('button', { name: 'เดือนนี้' }).click();
    await expect(page.getByText('มกราคม 2570').first()).toBeVisible();
  });
});

test.describe('QA — review (OMX-012a/b)', () => {
  test('TC-079: flipping type resets an invalid category (Expense → Income ⇒ Other income)', async ({
    page,
  }) => {
    await setup(page, {}, 'en');
    await page.goto('./#/add');
    await page.getByTestId('file-input').setInputFiles([png('slip-food.png', 31)]);
    await page.getByRole('button', { name: /Review \(1 ready\)/ }).click();
    const card = page.getByTestId('review-card');
    const expand = card.getByRole('button', { name: 'Expand' });
    if (await expand.isVisible()) await expand.click();
    await card.getByRole('radio', { name: /Income/ }).click();
    await expect(card.getByText('Other income').first()).toBeVisible();
  });

  test('TC-085: leaving Review with unsaved items asks to confirm', async ({ page, isMobile }) => {
    // Mobile hides the nav on Review; its Back button returns to Add (queue kept in memory) by design.
    test.skip(
      isMobile,
      'covered on desktop: mobile Review has no nav, Back → #/add keeps the queue',
    );
    await setup(page, {}, 'en');
    await page.goto('./#/add');
    await page.getByTestId('file-input').setInputFiles([png('slip-bill.png', 32)]);
    await page.getByRole('button', { name: /Review \(1 ready\)/ }).click();
    await page.getByRole('link', { name: 'Home' }).first().click();
    const dlg = page.getByRole('dialog', { name: 'Unsaved items' });
    await expect(dlg).toBeVisible();
    await dlg.getByRole('button', { name: 'Keep reviewing' }).click();
    await expect(page.getByTestId('review-card')).toHaveCount(1);
  });
});

test.describe('QA — data (OMX-021/022/030)', () => {
  test('TC-110: two tabs — a save in tab A is not overwritten by a later save in tab B', async ({
    context,
  }) => {
    const a = await context.newPage();
    const b = await context.newPage();
    for (const p of [a, b]) await setup(p, {}, 'en');
    await a.goto('./#/transactions');
    await b.goto('./#/transactions');
    await addManual(a, '11', /Food/);
    await addManual(b, '22', /Transport/);
    await a.reload();
    const amounts = await a.evaluate(() =>
      JSON.parse(localStorage.getItem('omx.v1')!)
        .transactions.map((t: { amountSatang: number }) => t.amountSatang)
        .sort(),
    );
    expect(amounts).toEqual([1100, 2200]);
    await expect(a.getByTestId('tx-row')).toHaveCount(2);
  });

  test('TC-112/113: importing the same backup twice with Merge yields "Imported 0"; non-JSON is rejected', async ({
    page,
  }) => {
    await setup(page, {}, 'en');
    await page.goto('./#/settings');
    const backup = JSON.stringify({
      app: 'omnitrix-money',
      schemaVersion: 1,
      exportedAt: '2026-11-13T03:00:00.000Z',
      transactions: [tx({ id: 'imp-1', payee: 'Imported shop' }), tx({ id: 'imp-2' })],
    });
    const importOnce = async (buffer: Buffer, name = 'backup.json') => {
      await page.getByRole('button', { name: /Import backup/ }).click();
      const dlg = page.getByRole('dialog', { name: 'Import backup' });
      await dlg
        .locator('input[type=file]')
        .setInputFiles({ name, mimeType: 'application/json', buffer });
      return dlg;
    };
    let dlg = await importOnce(Buffer.from(backup));
    await dlg.getByRole('button', { name: 'Import', exact: true }).click();
    await expect(page.getByTestId('toast')).toContainText('Imported 2 transactions');
    dlg = await importOnce(Buffer.from(backup));
    await expect(dlg.getByText('File has 2 transactions, 2 duplicates')).toBeVisible();
    await dlg.getByRole('button', { name: 'Import', exact: true }).click();
    await expect(page.getByTestId('toast').last()).toContainText('Imported 0');
    dlg = await importOnce(Buffer.from('hello, not json'), 'notes.json');
    await expect(dlg.getByRole('alert')).toContainText('This file isn’t JSON');
  });

  test('TC-140: Delete all data also removes omx.v1.corrupt.* backups (OMX-030 AC4)', async ({
    page,
  }) => {
    await setup(page, {}, 'en');
    await page.addInitScript(() => {
      if (!sessionStorage.getItem('qa-once')) {
        sessionStorage.setItem('qa-once', '1');
        localStorage.setItem('omx.v1', '{broken');
      }
    });
    await page.goto('./#/settings');
    await expect(page.getByRole('alert').first()).toBeVisible();
    await page.getByRole('button', { name: 'Delete all data' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete everything' }).click();
    const keys = await page.evaluate(() =>
      Object.keys(localStorage).filter((k) => k.startsWith('omx.v1')),
    );
    expect(keys).toEqual([]);
  });
});

test.describe('QA — more coverage', () => {
  test('TC-109: storage unavailable on first load → app renders in memory mode with banner (OMX-021 AC5)', async ({
    page,
  }) => {
    await setup(page, { storage: 'unavailable' }, 'en');
    await page.goto('./#/');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Home');
    await expect(page.getByText(/won’t let us store data/)).toBeVisible();
  });

  test('TC-099: editing the date into another month moves the row and both totals (OMX-016 AC2)', async ({
    page,
  }) => {
    await setup(page, {}, 'en');
    await seed(
      page,
      [tx({ id: 'mv-1', payee: 'Mover', amountSatang: 12300, date: '2026-11-10' })],
      'en',
    );
    await page.goto('./#/transactions');
    await page.getByRole('button', { name: /Mover/ }).click();
    await page.getByLabel('Date').fill('2026-10-10');
    await page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(page.getByTestId('toast')).toContainText('Transaction updated');
    await page.goto('./#/');
    await expect(page.getByTestId('total-expense')).toHaveText('0.00');
    await page.getByRole('button', { name: 'Previous month' }).click();
    await expect(page.getByTestId('total-expense')).toHaveText('−123.00');
  });

  test('TC-097: active filters are kept when changing month (OMX-015 AC5)', async ({ page }) => {
    await setup(page, {}, 'en');
    await seed(page, SAMPLE, 'en');
    await page.goto('./#/transactions');
    await page.getByLabel('Search transactions').fill('Grab');
    await expect(page.getByText('1 result')).toBeVisible();
    await page.getByRole('button', { name: 'Previous month' }).click();
    await expect(page.getByLabel('Search transactions')).toHaveValue('Grab');
  });

  test('TC-111: JSON export file name uses the Bangkok date (OMX-022 AC1)', async ({ page }) => {
    await setup(page, { now: '2026-11-13T23:30:00+07:00' }, 'en');
    await seed(page, SAMPLE, 'en');
    await page.goto('./#/settings');
    await page.getByRole('button', { name: /Export data/ }).click();
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: 'Download' }).click(),
    ]);
    expect(download.suggestedFilename()).toBe('omnitrix-money-backup-20261113.json');
    const json = JSON.parse(
      await (
        await download.createReadStream()
      )
        .toArray()
        .then((c) => Buffer.concat(c).toString('utf8')),
    );
    expect(json.schemaVersion).toBe(1);
    expect(json.transactions).toHaveLength(SAMPLE.length);
  });

  test.describe('360px', () => {
    test.use({ viewport: { width: 360, height: 740 } });
    test('TC-093/103: 1,000,000.00 row and 99,999,999.99 totals do not overflow at 360px (OMX-014 AC5, OMX-018 AC5)', async ({
      page,
    }) => {
      await setup(page);
      await seed(page, [
        tx({ amountSatang: 100_000_000, payee: 'น.ส. สมใจ ใจดี ชื่อยาวมากเพื่อทดสอบการตัดคำ' }),
        tx({ type: 'income', categoryId: 'salary', amountSatang: 9_999_999_999 }),
      ]);
      for (const route of ['#/', '#/transactions']) {
        await page.goto('./' + route);
        await page.waitForTimeout(300);
        const [sw, cw] = await page.evaluate(() => [
          document.documentElement.scrollWidth,
          document.documentElement.clientWidth,
        ]);
        expect(sw, route).toBeLessThanOrEqual(cw);
      }
    });
  });
});

test.describe('QA — defect regressions (test.fail = still open)', () => {
  test('TC-088 / BUG-002 (fixed): double-clicking Save creates only one transaction (OMX-013 AC2)', async ({
    page,
  }) => {
    await setup(page, {}, 'en');
    await page.goto('./#/transactions/new');
    await page.getByLabel('Amount (THB)').fill('55');
    await page.getByRole('button', { name: 'Category', exact: true }).click();
    await page.getByRole('radio', { name: /Food/ }).click();
    await page.getByRole('button', { name: 'Save', exact: true }).dblclick();
    await expect(page).toHaveURL(/#\/transactions$/);
    const stored = await page.evaluate(
      () => JSON.parse(localStorage.getItem('omx.v1')!).transactions.length,
    );
    expect(stored).toBe(1);
  });

  test('TC-114 / BUG-004 (fixed): CSV category column uses the UI language name (OMX-023 AC1)', async ({
    page,
  }) => {
    await setup(page);
    await seed(page, [SAMPLE[2]]);
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
    expect(text.split('\r\n')[1]).toContain('อาหารและเครื่องดื่ม');
  });

  test.describe('320px', () => {
    test.use({ viewport: { width: 320, height: 640 } });
    for (const route of ['#/transactions', '#/transactions/new']) {
      test(`TC-120 / BUG-003 (fixed): no horizontal scroll at 320px on ${route} (OMX-025 AC1)`, async ({
        page,
      }) => {
        await setup(page);
        await seed(page, SAMPLE);
        await page.goto('./' + route);
        await page.waitForTimeout(300);
        const [sw, cw] = await page.evaluate(() => [
          document.documentElement.scrollWidth,
          document.documentElement.clientWidth,
        ]);
        expect(sw).toBeLessThanOrEqual(cw);
      });
    }
  });

  test('TC-132 / BUG-005 (fixed): language switch hit targets are ≥ 44×44 px (OMX-027 AC8)', async ({
    page,
  }) => {
    await setup(page);
    await page.goto('./#/settings');
    const box = await page.getByRole('button', { name: 'English' }).first().boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    // visible pill is 36px high; a ::after extends the hit area 4px above and below
    const extra = await page
      .getByRole('button', { name: 'English' })
      .first()
      .evaluate((el) => -2 * parseFloat(getComputedStyle(el, '::after').top));
    expect(box!.height + extra).toBeGreaterThanOrEqual(44);
  });
});
