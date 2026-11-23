import { defineConfig, devices } from '@playwright/test';

/**
 * E2E runs against the production build served by `vite preview` under the GitHub Pages base path.
 * - default projects use the fake OCR engine (fast, deterministic) — QA request
 * - `real-ocr` runs real Tesseract on a generated slip image to prove self-hosted assets load
 * Set PW_CHROMIUM_PATH to use a pre-installed Chromium (offline sandboxes).
 */
const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:4173/spendy-project/';
const executablePath = process.env.PW_CHROMIUM_PATH || undefined;
const launchOptions = executablePath ? { executablePath } : {};

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: BASE,
    trace: 'retain-on-failure',
    locale: 'th-TH',
    timezoneId: 'Asia/Bangkok',
    launchOptions,
  },
  projects: [
    {
      name: 'mobile',
      testIgnore: /real-ocr|screens/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 1,
        launchOptions,
      },
    },
    {
      name: 'desktop',
      testIgnore: /real-ocr|screens/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 }, launchOptions },
    },
    {
      name: 'screens',
      testMatch: /screens\.spec/,
      use: {
        ...devices['Pixel 7'],
        viewport: { width: 375, height: 812 },
        deviceScaleFactor: 1,
        launchOptions,
      },
    },
    {
      name: 'real-ocr',
      testMatch: /real-ocr\.spec/,
      timeout: 240_000,
      use: { ...devices['Desktop Chrome'], launchOptions },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'npx vite preview --port 4173 --strictPort',
        url: BASE,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
      },
});
