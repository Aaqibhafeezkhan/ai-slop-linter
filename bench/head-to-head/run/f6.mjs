#!/usr/bin/env node
// F6 helper for docs/FINAL-R8.md (two parts).
//   node f6.mjs sample <cells.json> [seed]       cells.json: [{set, task, arm, run, score}], writes the sample on stdout
//   node f6.mjs runs <sample.json> <rerun.json>  F6-runs: how many re-runs lie within the min-max of the three original runs
//   node f6.mjs grader <orig.json> <regrade.json> F6-grader: cells that differ by more than 1 point, criterion agreement
// Sample: 10 percent of the cells of each set (rounded up), unique by (set, task, arm), chosen with the seed so that
// every arm and then every task appears at least once where the number allows, the rest drawn at random.
import { readFileSync } from "node:fs";
import { mulberry32 } from "./devgate-judge.mjs";

export function sample(cells, seed = 20261023) {
  const rand = mulberry32(seed);
  const shuffle = (xs) => { const a = [...xs]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const out = [];
  for (const set of [...new Set(cells.map((c) => c.set))].sort()) {
    const mine = cells.filter((c) => c.set === set);
    const keys = [...new Set(mine.map((c) => `${c.task}\u0000${c.arm}`))];
    const want = Math.ceil(0.1 * mine.length);
    const pool = shuffle(keys);
    const chosen = [];
    const take = (k) => { if (!chosen.includes(k)) chosen.push(k); };
    for (const arm of [...new Set(mine.map((c) => c.arm))].sort()) { const k = pool.find((x) => x.endsWith(`\u0000${arm}`)); if (k && chosen.length < want) take(k); }
    for (const task of [...new Set(mine.map((c) => c.task))].sort()) { if (chosen.length >= want) break; if (!chosen.some((k) => k.startsWith(`${task}\u0000`))) { const k = pool.find((x) => x.startsWith(`${task}\u0000`)); if (k) take(k); } }
    for (const k of pool) { if (chosen.length >= want) break; take(k); }
    for (const k of chosen) { const [task, arm] = k.split("\u0000"); out.push({ set, task, arm, original: mine.filter((c) => c.task === task && c.arm === arm).map((c) => c.score) }); }
  }
  return out;
}

export function compareRuns(samp, rerun) {
  const rows = samp.map((s) => {
    const r = rerun.find((x) => x.set === s.set && x.task === s.task && x.arm === s.arm);
    const lo = Math.min(...s.original), hi = Math.max(...s.original);
    return { ...s, rerun: r ? r.score : null, within: r ? r.score >= lo && r.score <= hi : null };
  });
  const done = rows.filter((r) => r.rerun !== null);
  return { rows, cells: rows.length, rerun: done.length, within: done.filter((r) => r.within).length };
}

export function compareGrader(orig, regrade) {
  // orig and regrade: [{key, criteria: {C1: bool, ...}}]
  let differ = 0, agree = 0, total = 0;
  const rows = [];
  for (const o of orig) {
    const g = regrade.find((x) => x.key === o.key);
    if (!g) continue;
    let diffPts = 0;
    for (const c of Object.keys(o.criteria)) { total++; if (o.criteria[c] === g.criteria[c]) agree++; else diffPts++; }
    if (diffPts > 1) differ++;
    rows.push({ key: o.key, diffPts });
  }
  const agreement = total ? agree / total : 1;
  return { cells: rows.length, differ, agreement, pass: differ === 0 && agreement >= 0.9, rows };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [cmd, a, b] = process.argv.slice(2);
  const j = (p) => JSON.parse(readFileSync(p, "utf8"));
  if (cmd === "sample") console.log(JSON.stringify(sample(j(a), b ? Number(b) : undefined), null, 1));
  else if (cmd === "runs") console.log(JSON.stringify(compareRuns(j(a), j(b)), null, 1));
  else if (cmd === "grader") console.log(JSON.stringify(compareGrader(j(a), j(b)), null, 1));
  else { console.error("usage: f6.mjs sample|runs|grader ..."); process.exit(2); }
}
