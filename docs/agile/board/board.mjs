#!/usr/bin/env node
// Spendy board helper (team rule: every role updates the board when a ticket changes status).
//   node docs/agile/board/board.mjs set OMX-051 done [--note "text"]   columns: backlog|blocked|todo|progress|qa|done
//   node docs/agile/board/board.mjs add OMX-053 E2 "Title" Must 3 todo [--high] [--owner Dev]
//   node docs/agile/board/board.mjs build    → docs/agile/board/dist/index.html (published as the Spendy board artifact)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = dirname(fileURLToPath(import.meta.url));
const file = join(dir, 'data.json');
const COLS = ['backlog', 'blocked', 'todo', 'progress', 'qa', 'done'];
const data = JSON.parse(readFileSync(file, 'utf8'));
const [cmd, ...a] = process.argv.slice(2);
const flag = (n) => { const i = a.indexOf(n); return i < 0 ? undefined : a[i + 1] ?? true; };
const save = () => writeFileSync(file, JSON.stringify(data, null, 0).replace(/\},\{/g, '},\n{') + '\n');
if (cmd === 'set') {
  const [id, col] = a;
  const it = data.find((x) => x.id === id);
  if (!it || !COLS.includes(col)) throw new Error(`usage: set <OMX-id> <${COLS.join('|')}>`);
  it.c = col;
  if (col === 'done') it.pd = false;
  if (typeof flag('--note') === 'string') it.n = flag('--note');
  save();
  console.log(`${id} → ${col}`);
} else if (cmd === 'add') {
  const [id, ep, t, pr, pts, col] = a;
  if (data.some((x) => x.id === id)) throw new Error(`${id} exists`);
  data.push({ id, ep, t, pr, hi: a.includes('--high'), pts: Number(pts) || 0, c: col || 'todo', o: flag('--owner') || 'Dev', n: flag('--note') || '', pd: false, s: flag('--sprint') || 'S2' });
  save();
  console.log(`added ${id}`);
} else if (cmd === 'build') {
  const html = readFileSync(join(dir, 'template-head.html'), 'utf8') + readFileSync(join(dir, 'template-body.html'), 'utf8').replace('__DATA__', JSON.stringify(data));
  mkdirSync(join(dir, 'dist'), { recursive: true });
  writeFileSync(join(dir, 'dist/index.html'), html.replace('__UPDATED__', new Date().toISOString().slice(0, 16).replace('T', ' ') + ' UTC'));
  console.log('built dist/index.html');
} else {
  console.log('commands: set | add | build');
}
