#!/usr/bin/env node
// Judges a development gate from a cells.jsonl written by heldout/run-heldout.sh.
// Usage: node devgate-judge.mjs <cells.jsonl> [--ours ours] [--rivals blader,blader-inv] [--base base]
// Cell names are <task>-<arm>-<run>. A cell's score is the field `score` (0 to 5).
// Rule (frozen in docs/DEV-GATE-r8.md before any run): total of an arm = sum over tasks of the mean over runs.
// D = total(ours) - total(best rival), the best rival being the one with the higher observed total.
// Bootstrap: 10000 replicates, seed 20261023, runs of each (task, arm) cell resampled independently with
// replacement; the 95% interval is the 2.5th and 97.5th percentile of D.
// Clear lead = lower bound > 0, observed D >= 1.0, and no task where ours trails the best rival's task mean by more
// than 0.34, except at most one task where the deficit is at most 0.67.
import { readFileSync } from "node:fs";

export function parseCells(text) {
  const cells = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    const r = JSON.parse(line);
    const m = /^(.+?)-(ours|blader-inv|blader|unslop-inv|unslop|everwrite-inv|everwrite|avoid-ai-writing-inv|avoid-ai-writing|slopless-inv|slopless|slop-cop-inv|slop-cop|base)-(\d+)$/.exec(r.cell);
    if (!m) throw new Error(`cannot read cell name: ${r.cell}`);
    cells.push({ task: m[1], arm: m[2], run: Number(m[3]), score: Number(r.score) });
  }
  return cells;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function judge(cells, { ours = "ours", rivals = ["blader", "blader-inv"], base = "base", replicates = 10000, seed = 20261023 } = {}) {
  const tasks = [...new Set(cells.map((c) => c.task))].sort();
  const by = (arm, task) => cells.filter((c) => c.arm === arm && c.task === task).map((c) => c.score);
  for (const arm of [ours, ...rivals, base]) for (const t of tasks) if (!by(arm, t).length) throw new Error(`no cells for ${arm} on ${t}`);
  const total = (arm, pick) => tasks.reduce((s, t) => s + mean(pick(by(arm, t))), 0);
  const observed = Object.fromEntries([ours, ...rivals, base].map((a) => [a, total(a, (xs) => xs)]));
  const best = [...rivals].sort((a, b) => observed[b] - observed[a])[0];
  const taskMeans = (arm) => Object.fromEntries(tasks.map((t) => [t, mean(by(arm, t))]));
  const mo = taskMeans(ours), mb = taskMeans(best);
  const deficits = tasks.map((t) => ({ task: t, ours: mo[t], best: mb[t], deficit: Math.max(0, mb[t] - mo[t]) }));
  const rand = mulberry32(seed);
  const resample = (xs) => xs.map(() => xs[Math.floor(rand() * xs.length)]);
  const ds = [];
  for (let i = 0; i < replicates; i++) ds.push(total(ours, resample) - total(best, resample));
  ds.sort((a, b) => a - b);
  const lo = ds[Math.floor(0.025 * replicates)], hi = ds[Math.ceil(0.975 * replicates) - 1];
  const D = observed[ours] - observed[best];
  const over = deficits.filter((d) => d.deficit > 0.34);
  const taskOk = over.every((d) => d.deficit <= 0.67) && over.length <= 1;
  const clear = lo > 0 && D >= 1.0 && taskOk;
  return { tasks, observed, best, D, ci: [lo, hi], deficits, taskOk, clear };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const opt = (name, d) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : d; };
  const r = judge(parseCells(readFileSync(args[0], "utf8")), { ours: opt("--ours", "ours"), rivals: opt("--rivals", "blader,blader-inv").split(","), base: opt("--base", "base") });
  console.log(JSON.stringify(r, null, 2));
  console.log(r.clear ? "GATE: clear lead" : "GATE: no clear lead");
  process.exit(r.clear ? 0 : 1);
}
