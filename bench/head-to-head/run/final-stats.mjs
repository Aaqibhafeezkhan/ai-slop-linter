#!/usr/bin/env node
// usage: node final-stats.mjs <public H2H_OUT> <held-out cells.jsonl> [--out SUMMARY-STATS.md]
// Round 8 statistics (docs/FINAL-R8.md): per set, the total of every arm (sum over tasks of the mean over runs),
// its 95% bootstrap interval, and the interval of ours minus the best other arm (best by observed total).
// Bootstrap: 10,000 replicates, seed 20261023, the runs of each (task, arm) cell resampled independently.
// Public scores: scores.json merged with blind.json, counting only criteria that labels.json marks outcome.
// Held-out scores: the `score` field of each line of cells.jsonl (heldout/score.mjs).
// Rule A, Rule B and Rule B-prime are computed from the task means (ceiling rule included).
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { mulberry32 } from "./devgate-judge.mjs";

const ARM_RE = "ours|blader-inv|blader|unslop-inv|unslop|everwrite-inv|everwrite|avoid-ai-writing-inv|avoid-ai-writing|slopless-inv|slopless|slop-cop-inv|slop-cop|base";

export function publicCells(out, tasksJson, labels) {
  const scores = JSON.parse(readFileSync(join(out, "scores.json"), "utf8"));
  const blindPath = join(out, "blind.json");
  const blind = existsSync(blindPath) ? JSON.parse(readFileSync(blindPath, "utf8")) : {};
  for (const [k, v] of Object.entries(blind)) if (k in scores && typeof v === "boolean") scores[k].C5 = v;
  const active = tasksJson.tasks.filter((t) => t.status === "active");
  const ids = Object.fromEntries(active.map((t) => [t.id, t.criteria.map((c) => c.id).filter((id) => labels.labels[t.id][id].label === "outcome")]));
  const cells = [];
  for (const [key, row] of Object.entries(scores)) {
    const m = new RegExp(`^(h\\d+)-(${ARM_RE})-(\\d+)$`).exec(key);
    if (!m || !ids[m[1]]) continue;
    cells.push({ task: m[1], arm: m[2], run: Number(m[3]), score: ids[m[1]].filter((id) => row[id] === true).length, max: ids[m[1]].length });
  }
  return cells;
}

export function heldoutCells(text) {
  return text.split("\n").filter((l) => l.trim()).map((l) => {
    const r = JSON.parse(l);
    const m = new RegExp(`^(.+?)-(${ARM_RE})-(\\d+)$`).exec(r.cell);
    if (!m) throw new Error(`cell name: ${r.cell}`);
    return { task: m[1], arm: m[2], run: Number(m[3]), score: Number(r.score), max: 5 };
  });
}

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;

export function stats(cells, { ours = "ours", replicates = 10000, seed = 20261023 } = {}) {
  const tasks = [...new Set(cells.map((c) => c.task))].sort();
  const arms = [...new Set(cells.map((c) => c.arm))];
  const by = (arm, task) => cells.filter((c) => c.arm === arm && c.task === task).map((c) => c.score);
  const maxOf = Object.fromEntries(tasks.map((t) => [t, cells.find((c) => c.task === t).max]));
  const total = (arm, pick) => tasks.reduce((s, t) => s + (by(arm, t).length ? mean(pick(by(arm, t))) : 0), 0);
  const observed = Object.fromEntries(arms.map((a) => [a, total(a, (x) => x)]));
  const others = arms.filter((a) => a !== ours);
  const best = [...others].sort((a, b) => observed[b] - observed[a])[0];
  const rand = mulberry32(seed);
  const resample = (xs) => xs.map(() => xs[Math.floor(rand() * xs.length)]);
  const draws = Object.fromEntries(arms.map((a) => [a, []]));
  const diff = [];
  for (let i = 0; i < replicates; i++) {
    const t = Object.fromEntries(arms.map((a) => [a, total(a, resample)]));
    for (const a of arms) draws[a].push(t[a]);
    diff.push(t[ours] - t[best]);
  }
  const ci = (xs) => { const s = [...xs].sort((a, b) => a - b); return [s[Math.floor(0.025 * replicates)], s[Math.ceil(0.975 * replicates) - 1]]; };
  const maxTotal = tasks.reduce((s, t) => s + maxOf[t], 0);
  const taskMean = (arm, t) => mean(by(arm, t));
  const rivalsBest = (t) => Math.max(...others.map((a) => taskMean(a, t)));
  const EPS = 1e-9;
  const ruleB = tasks.map((t) => {
    const r = rivalsBest(t), o = taskMean(ours, t);
    const ok = r >= maxOf[t] - EPS ? o >= maxOf[t] - EPS : o > r + EPS;
    return { task: t, ours: o, bestRival: r, pass: ok, deficit: Math.max(0, r - o) };
  });
  const failing = ruleB.filter((x) => !x.pass);
  const lost = maxTotal - observed[ours], lostBest = maxTotal - observed[best];
  return {
    tasks, arms, maxTotal, observed, best, D: observed[ours] - observed[best],
    armCi: Object.fromEntries(arms.map((a) => [a, ci(draws[a])])), diffCi: ci(diff),
    ruleA: { lost, lostBest, limit: 0.8 * lostBest, pass: lostBest === 0 ? lost === 0 : lost <= 0.8 * lostBest + EPS },
    ruleB: { pass: failing.length === 0, failing: failing.map((x) => x.task) },
    ruleBPrime: { pass: failing.length === 0 || (failing.length === 1 && failing[0].deficit <= 0.34 + EPS), failing: failing.map((x) => `${x.task} (deficit ${x.deficit.toFixed(2)})`) },
    i1: ci(diff)[0] > 0,
    perTask: ruleB,
  };
}

export function render(title, s) {
  const f = (x) => x.toFixed(2);
  const lines = [`## ${title}`, "", `Total of ${f(s.maxTotal)} per arm (sum over tasks of the mean over runs). Best other arm: ${s.best}.`, "", "| arm | total | 95% interval |", "|---|---|---|"];
  for (const a of [...s.arms].sort((x, y) => s.observed[y] - s.observed[x])) lines.push(`| ${a} | ${f(s.observed[a])} | [${f(s.armCi[a][0])}, ${f(s.armCi[a][1])}] |`);
  lines.push("", `ours minus ${s.best}: ${f(s.D)}, 95% interval [${f(s.diffCi[0])}, ${f(s.diffCi[1])}]. Claim I1 (lower bound above 0): ${s.i1 ? "YES" : "NO"}.`, "");
  lines.push(`Rule A: ${s.ruleA.pass ? "PASS" : "FAIL"} (ours lost ${f(s.ruleA.lost)}, best other arm lost ${f(s.ruleA.lostBest)}, limit ${f(s.ruleA.limit)}).`);
  lines.push(`Rule B: ${s.ruleB.pass ? "PASS" : "FAIL"}${s.ruleB.failing.length ? ` (failing: ${s.ruleB.failing.join(", ")})` : ""}.`);
  lines.push(`Rule B-prime: ${s.ruleBPrime.pass ? "PASS" : "FAIL"}${s.ruleBPrime.failing.length ? ` (${s.ruleBPrime.failing.join(", ")})` : ""}.`, "", "| task | ours | best rival | Rule B |", "|---|---|---|---|");
  for (const x of s.perTask) lines.push(`| ${x.task} | ${f(x.ours)} | ${f(x.bestRival)} | ${x.pass ? "pass" : "fail"} |`);
  return lines.join("\n") + "\n";
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const [pub, held] = args;
  const outIdx = args.indexOf("--out");
  const root = new URL("../", import.meta.url).pathname;
  const tasks = JSON.parse(readFileSync(join(root, "tasks.json"), "utf8"));
  const labels = JSON.parse(readFileSync(join(root, "labels.json"), "utf8"));
  const parts = ["# Round 8 final measurement: totals, intervals and rules (generated by final-stats.mjs)\n"];
  if (pub && pub !== "-") parts.push(render("Public set (12 tasks, Sonnet)", stats(publicCells(pub, tasks, labels))));
  if (held && held !== "-") parts.push(render("Held-out g (6 tasks, Sonnet)", stats(heldoutCells(readFileSync(held, "utf8")))));
  const text = parts.join("\n");
  if (outIdx >= 0) writeFileSync(args[outIdx + 1], text); else console.log(text);
}
