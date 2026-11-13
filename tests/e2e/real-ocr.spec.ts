/**
 * Real Tesseract run in the built app (OMX-005 AC1, OMX-028 AC2/AC4, OMX-030 AC1):
 * renders a synthetic Thai transfer slip (HTML → PNG), uploads it, and checks that
 * the self-hosted worker/core/tha+eng data load from our origin and the parser fills the fields.
 */
import { expect, test } from '@playwright/test';
import { setup } from './helpers';

const SLIP_HTML = `<!doctype html><html><head><meta charset="utf-8"><style>
body{margin:0;background:#fff;font-family:"Noto Sans Thai","Loma","Garuda",sans-serif;color:#111}
.slip{width:720px;padding:48px 56px;box-sizing:border-box}
h1{font-size:44px;margin:0 0 12px;color:#0a7a3e}
p{font-size:34px;margin:14px 0;line-height:1.5}
.amt{font-size:48px;font-weight:700}
</style></head><body><div class="slip">
<h1>โอนเงินสำเร็จ</h1>
<p>13 พ.ย. 69 14:35 น.</p>
<p>ไปยัง GrabFood</p>
<p>จำนวน: <span class="amt">245.00</span> บาท</p>
<p>ค่าธรรมเนียม: 0.00 บาท</p>
<p>K PLUS</p>
</div></body></html>`;

test('real OCR reads a generated Thai slip using self-hosted assets', async ({
  page,
  browser,
  baseURL,
}) => {
  // 1) Render the synthetic slip to PNG.
  const render = await browser.newPage({ viewport: { width: 720, height: 560 } });
  await render.setContent(SLIP_HTML);
  const slipPng = await render.screenshot({ type: 'png' });
  await render.close();

  // 2) Record every request — all OCR assets must come from our own origin.
  const origin = new URL(baseURL!).origin;
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));

  await setup(page, { ocr: 'real' });
  await page.goto('./#/add');
  await page
    .getByTestId('file-input')
    .setInputFiles([{ name: 'generated-slip.png', mimeType: 'image/png', buffer: slipPng }]);
  await expect(page.getByRole('button', { name: /ตรวจรายการ \(1/ })).toBeVisible({
    timeout: 200_000,
  });
  await page.getByRole('button', { name: /ตรวจรายการ/ }).click();

  const card = page.getByTestId('review-card');
  await expect(card.getByLabel('จำนวนเงิน (บาท)')).toHaveValue('245.00');
  await card.getByText('ข้อความจาก OCR').click();
  console.log('[real-ocr] OCR text:\n' + (await card.locator('pre').innerText()));

  const tesseractRequests = requests.filter((u) => /tesseract|traineddata|wasm/.test(u));
  console.log('[real-ocr] tesseract requests:\n' + tesseractRequests.join('\n'));
  expect(tesseractRequests.some((u) => u.endsWith('/tesseract/lang/tha.traineddata.gz'))).toBe(
    true,
  );
  expect(tesseractRequests.some((u) => u.endsWith('/tesseract/lang/eng.traineddata.gz'))).toBe(
    true,
  );
  expect(requests.filter((u) => /^https?:/.test(u) && !u.startsWith(origin))).toEqual([]);
});
