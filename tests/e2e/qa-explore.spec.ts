/**
 * QA exploratory matrix (TC-150..TC-153): 375px / 1280px × TH / EN × light / dark on every main route.
 * Per screen: no horizontal scroll, no raw i18n keys, UI chrome translated (EN has no Thai in
 * headings/buttons/labels except the "ไทย" language option), <html lang> matches, no console
 * errors, dark scheme really dark. Screenshots → test-results/qa-explore/ for visual review.
 * Runs once (desktop project); the viewport is set per combination.
 */
import { expect, test } from '@playwright/test';
import { seed, setup, SAMPLE } from './helpers';

const ROUTES = ['#/', '#/transactions', '#/transactions/new', '#/add', '#/settings'];
const VIEWPORTS = [
  { w: 375, h: 812 },
  { w: 1280, h: 900 },
];
const THAI = /[฀-๿]/;

for (const lang of ['th', 'en'] as const)
  for (const scheme of ['light', 'dark'] as const)
    test(`TC-150..153 explore matrix: ${lang.toUpperCase()} ${scheme}`, async ({
      page,
      isMobile,
    }) => {
      test.skip(isMobile, 'matrix sets its own viewports — run once in the desktop project');
      const errors: string[] = [];
      page.on('console', (m) => {
        if (m.type() === 'error') errors.push(m.text());
      });
      page.on('pageerror', (e) => errors.push(e.message));
      await page.emulateMedia({ colorScheme: scheme });
      await setup(page, {}, lang);
      // EN run uses English payees so data does not look like untranslated UI
      await seed(
        page,
        lang === 'en' ? SAMPLE.map((t, i) => ({ ...t, payee: `Payee ${i}` })) : SAMPLE,
        lang,
      );
      const findings: string[] = [];
      for (const vp of VIEWPORTS) {
        await page.setViewportSize({ width: vp.w, height: vp.h });
        for (const route of ROUTES) {
          await page.goto('./' + route);
          await page.locator('main').first().waitFor();
          await page.waitForTimeout(250);
          const where = `${vp.w}px ${route}`;
          const r = await page.evaluate(() => {
            const de = document.documentElement;
            const texts = Array.from(
              document.querySelectorAll('h1,h2,h3,button,label,nav a,th,legend,[role="tab"]'),
            )
              .map((e) => (e.textContent ?? '').trim())
              .filter(Boolean);
            const rawKeys = Array.from(document.body.querySelectorAll('*'))
              .filter((e) => e.children.length === 0)
              .map((e) => (e.textContent ?? '').trim())
              .filter((t) => /^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9_]+)+$/.test(t));
            return {
              sw: de.scrollWidth,
              cw: de.clientWidth,
              lang: de.lang,
              texts,
              rawKeys,
              bg: getComputedStyle(document.body).backgroundColor,
            };
          });
          if (r.sw > r.cw) findings.push(`${where}: horizontal scroll ${r.sw} > ${r.cw}`);
          if (r.rawKeys.length) findings.push(`${where}: raw i18n keys ${r.rawKeys.join(', ')}`);
          if (!r.lang.startsWith(lang)) findings.push(`${where}: <html lang="${r.lang}">`);
          if (lang === 'en') {
            const thai = r.texts.filter((t) => THAI.test(t.replace(/ไทย/g, '')));
            if (thai.length) findings.push(`${where}: Thai text in EN UI: ${thai.join(' | ')}`);
          }
          const rgb = (r.bg.match(/\d+/g) ?? ['255', '255', '255']).slice(0, 3).map(Number);
          const lum = (rgb[0]! + rgb[1]! + rgb[2]!) / 3;
          if (scheme === 'dark' && lum > 100) findings.push(`${where}: dark bg too light ${r.bg}`);
          if (scheme === 'light' && lum < 155) findings.push(`${where}: light bg too dark ${r.bg}`);
          await page.screenshot({
            path: `test-results/qa-explore/${lang}-${scheme}-${vp.w}-${route.replace(/[#/]+/g, '_') || 'root'}.png`,
            fullPage: true,
          });
        }
      }
      if (errors.length) findings.push(`console errors: ${errors.join(' | ')}`);
      console.log(`[explore ${lang} ${scheme}] ${findings.length ? findings.join('\n') : 'clean'}`);
      expect(findings).toEqual([]);
    });
