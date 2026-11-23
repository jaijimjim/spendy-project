#!/usr/bin/env node
/**
 * OMX-048 AC2 / OMX-029 AC1 — summarise a Lighthouse CI run (filesystem upload target).
 * Reads lhci-report/manifest.json + the per-run JSON reports, prints the median LCP and the
 * accessibility score per URL (median of the runs) as Markdown, and appends it to
 * $GITHUB_STEP_SUMMARY when present. Pass/fail is decided by `lhci assert` (lighthouserc.json).
 * Usage: node scripts/lhci-summary.mjs [reportDir=lhci-report]
 */
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { isAbsolute, join, resolve } from 'node:path';

const dir = resolve(process.argv[2] ?? 'lhci-report');
const manifestPath = join(dir, 'manifest.json');
const lines = ['## Lighthouse CI — mobile (simulated Slow 4G, 4× CPU)', ''];

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

if (!existsSync(manifestPath)) {
  lines.push(`:x: No Lighthouse results (\`${manifestPath}\` missing) — see the collect step log.`);
} else {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const byUrl = new Map();
  for (const run of manifest) {
    const jsonPath = isAbsolute(run.jsonPath) ? run.jsonPath : join(dir, run.jsonPath);
    const lhr = JSON.parse(readFileSync(jsonPath, 'utf8'));
    const row = byUrl.get(run.url) ?? { lcp: [], a11y: [], perf: [], lhr: lhr.lighthouseVersion };
    row.lcp.push(lhr.audits['largest-contentful-paint']?.numericValue ?? NaN);
    row.a11y.push(lhr.categories.accessibility?.score ?? NaN);
    row.perf.push(lhr.categories.performance?.score ?? NaN);
    byUrl.set(run.url, row);
  }
  lines.push(
    '| URL | Runs | Median LCP | LCP ≤ 2.5 s | LCP per run (ms) | Median a11y | a11y ≥ 90 | Median perf |',
    '|---|---|---|---|---|---|---|---|',
  );
  for (const [url, r] of byUrl) {
    const lcp = median(r.lcp);
    const a11y = median(r.a11y) * 100;
    lines.push(
      `| ${url} | ${r.lcp.length} | ${(lcp / 1000).toFixed(2)} s | ${lcp <= 2500 ? '✅' : '⚠️'} | ` +
        `${r.lcp.map((v) => Math.round(v)).join(' / ')} | ${a11y.toFixed(0)} | ` +
        `${a11y >= 90 ? '✅' : '❌'} | ${(median(r.perf) * 100).toFixed(0)} |`,
    );
  }
  const version = [...byUrl.values()][0]?.lhr;
  lines.push(
    '',
    `Lighthouse ${version ?? '?'} · ${manifest.length} runs · HTML/JSON reports in the \`lighthouse-live\` artifact.`,
  );
}

const md = lines.join('\n') + '\n';
console.log(md);
writeFileSync(join(existsSync(dir) ? dir : '.', 'summary.md'), md);
if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, md);
