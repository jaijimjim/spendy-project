# ADR-0002: Hand-rolled SVG charts instead of a chart library

- Status: Accepted (Sprint 1) · Stories: OMX-019, OMX-020, OMX-027, OMX-029

## Context
Two simple charts are needed (category horizontal bars, 6-month grouped bars). ACs require text tables, ≥ 3:1 contrast, no colour-only encoding, TH/EN labels, reduced motion, and an initial JS budget of 300 KB gz.

## Decision
Implement both charts as small React components rendering SVG/HTML (`src/features/dashboard/charts.tsx`). Category rows are `<button>`s (navigate to filtered transactions); the trend chart uses `role="img"` + summary label, hatch `<pattern>` for expenses, and a "View as table" toggle rendering a real `<table>`. Sizes are measured with `ResizeObserver` so text never scales.

## Consequences
- ~0 KB dependency cost, full control over accessibility and tokens (dark mode for free).
- No tooltips/zoom; if richer interactions are needed later, re-evaluate a lazy-loaded library (Chart.js) behind the same component API.
