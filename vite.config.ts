/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as {
  version: string;
};

/**
 * Content-Security-Policy for the production build only (dev needs inline HMR scripts).
 * connect-src = self + Google Photos import domains (OMX-030 AC2). GitHub Pages cannot send
 * headers, so the policy is delivered as a <meta> tag.
 */
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval' https://accounts.google.com/gsi/client",
  "style-src 'self' 'unsafe-inline' https://accounts.google.com/gsi/style",
  "img-src 'self' blob: data: https://*.googleusercontent.com",
  "font-src 'self'",
  "worker-src 'self' blob:",
  "connect-src 'self' blob: data: https://accounts.google.com https://oauth2.googleapis.com https://photospicker.googleapis.com https://*.googleusercontent.com",
  'frame-src https://accounts.google.com',
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'",
].join('; ');

function cspPlugin(): Plugin {
  return {
    name: 'omx-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace(
        '<!--CSP-->',
        `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`,
      );
    },
  };
}

export default defineConfig(({ command, mode, isPreview }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // GitHub Pages project site lives under /spendy-project/ (OMX-028 AC2).
  const base = env.VITE_BASE ?? (command === 'build' || isPreview ? '/spendy-project/' : '/');
  return {
    base,
    plugins: [react(), cspPlugin()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
      target: 'es2022',
      sourcemap: false,
      chunkSizeWarningLimit: 600,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      css: { modules: { classNameStrategy: 'non-scoped' } },
      coverage: {
        provider: 'v8',
        include: ['src/domain/**/*.ts'],
        exclude: ['src/domain/**/*.test.ts', 'src/domain/**/__fixtures__/**'],
        reporter: ['text-summary', 'text', 'html'],
        thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
      },
    },
  };
});
