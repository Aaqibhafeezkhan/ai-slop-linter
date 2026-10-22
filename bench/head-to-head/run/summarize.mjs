#!/usr/bin/env node
// usage: node bench/head-to-head/run/summarize.mjs <H2H_OUT>
// Reads <H2H_OUT>/scores.json, merges <H2H_OUT>/blind.json (blind C5 verdicts from grade-collect.mjs),
// and reads process.json, meta.json and competitors-status.json when present.
//
// Every run is scored twice. OUTCOME counts only the criteria that labels.json marks "outcome" (the
// denominator of a task is its number of outcome criteria). FULL counts every criterion. A criterion
// marked "process" is reported in the PROCESS section and never enters the win rule.
//
// Arms: ours, base, and for each competitor a natural arm and an invoked arm (-inv).
//
// Win rule, as restated by the owner on 2026-10-22 (OUTCOME scores only; the rivals are every other counted
// arm: all competitor arms, natural and invoked, and the base arm; comparing with the better of a competitor's
// two forms is the same as comparing with both).
// Rule B (per task, with the ceiling rule): on every task ours has a mean strictly above the highest mean of
// any rival. When a rival reaches the task maximum, ours passes that task only by reaching the maximum too
// (a tie at the maximum passes).
// Rule A (lost points): ours' lost points (the maximum total minus ours' total) are at most 0.8 times the lost
// points of the best other arm (the rival with the highest total). If that arm lost 0, ours must lose 0.
// Both verdicts are printed with their numbers, and every failing task with its reason. There is no separate
// strict view. The better arm of each competitor is still printed, for information only. A competitor listed
// as not runnable in competitors-status.json is printed as "not run, <reason>" and never counted.
//
// Leaks: a scores.json row with leak: true (a tool call that mentioned the answer key, see score.mjs) is
// printed as a LEAK line and counted in the verdict line. The verdict is INCOMPLETE until each flagged run
// is reviewed, which is recorded in <H2H_OUT>/leak-review.json as { "<run>": { "verdict": "benign" |
// "confirmed", "reason": "<text>" } }. A confirmed leak keeps the verdict INCOMPLETE ("CONFIRMED LEAK in run X").
// A malformed review file is an error (exit 2).
//
// Exit 2 when labels.json is missing or does not label every criterion of tasks.json. Otherwise exit 0.
// If an outcome criterion is still null after the merge, the verdict is INCOMPLETE.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { ACTIVE_IDS, ARMS, COMPETITORS, DEFAULT_MODEL, INCLUDE_RETIRED, RETIRED_TASKS, TASK_IDS, TASK_LIST, competitorOf, loadLabels, usageExit } from "./lib.mjs";

const h2hOut = process.argv.slice(2).find((a) => a !== "--include-retired");
if (!h2hOut) usageExit("usage: summarize.mjs <H2H_OUT> [--include-retired]");

const loaded = loadLabels();
if (loaded.error) usageExit(`summarize: refusing to run, ${loaded.error}`);
const labels = loaded.labels;

const scoresPath = join(h2hOut, "scores.json");
if (!existsSync(scoresPath)) {
  console.log(`no ${scoresPath}: run score.mjs first`);
  process.exit(0);
}

// Rule A: ours may lose at most this share of the points that the best other arm lost.
const LOST_SHARE = 0.8;
const EPS = 1e-9;
const readJson = (name, fallback) => {
  const p = join(h2hOut, name);
  return existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : fallback;
};
const scores = JSON.parse(readFileSync(scoresPath, "utf8"));
const blind = readJson("blind.json", {});
const processCheck = readJson("process.json", {});
const meta = readJson("meta.json", {});
const status = readJson("competitors-status.json", []);

// Blind verdicts are kept apart from scores.json, so a re-score cannot clear them.
for (const [key, pass] of Object.entries(blind)) {
  if (key in scores && typeof pass === "boolean") scores[key].C5 = pass;
}

const leakKeys = Object.entries(scores).filter(([, row]) => row?.leak === true).map(([key]) => key);

// leak-review.json: { "<run>": { "verdict": "benign" | "confirmed", "reason": "<non-empty text>" } }, one entry
// per reviewed flagged run. Anything else is an error (exit 2), never silently accepted.
function loadLeakReview() {
  const path = join(h2hOut, "leak-review.json");
  if (!existsSync(path)) return {};
  const fail = (why) => usageExit(`summarize: refusing to run, leak-review.json is invalid: ${why}`);
  let doc;
  try {
    doc = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    return fail(`not valid JSON (${err.message})`);
  }
  if (doc === null || typeof doc !== "object" || Array.isArray(doc)) return fail("the file must be a JSON object keyed by run");
  for (const [key, entry] of Object.entries(doc)) {
    if (!leakKeys.includes(key)) fail(`"${key}" is not a leak-flagged run in scores.json`);
    if (entry === null || typeof entry !== "object" || Array.isArray(entry)) fail(`"${key}" must be an object with verdict and reason`);
    if (entry.verdict !== "benign" && entry.verdict !== "confirmed") fail(`"${key}": verdict must be "benign" or "confirmed"`);
    if (typeof entry.reason !== "string" || entry.reason.trim() === "") fail(`"${key}": reason must be a non-empty string`);
  }
  return doc;
}
const leakReview = loadLeakReview();
const confirmedLeaks = leakKeys.filter((key) => leakReview[key]?.verdict === "confirmed");
const unreviewedLeaks = leakKeys.filter((key) => !(key in leakReview));

const notRun = new Map(status.filter((s) => s.runnable === false).map((s) => [s.name, s.reason ?? "no reason recorded"]));
// The round-4 competitors are optional: one with no run directory in this round is left out, not counted as missing.
for (const comp of ["avoid-ai-writing", "slopless", "slop-cop"]) {
  const present = existsSync(h2hOut) && readdirSync(h2hOut).some((n) => new RegExp(`^h\\d+-${comp}(-inv)?-\\d+$`).test(n));
  if (!present && !notRun.has(comp)) notRun.set(comp, "not part of this round");
}
const countedArms = ARMS.filter((arm) => !notRun.has(competitorOf(arm)));

const KEY_RE = new RegExp(`^(${TASK_IDS.join("|")})-(${ARMS.join("|")})-(\\d+)$`);
const idsWhere = (task, test) => task.criteria.map((c) => c.id).filter((id) => test(id));
const outcomeIds = Object.fromEntries(TASK_LIST.map((t) => [t.id, idsWhere(t, (id) => labels[t.id][id] === "outcome")]));
const processIds = Object.fromEntries(TASK_LIST.map((t) => [t.id, idsWhere(t, (id) => labels[t.id][id] === "process")]));
const allIds = Object.fromEntries(TASK_LIST.map((t) => [t.id, idsWhere(t, () => true)]));
const maxOutcome = ACTIVE_IDS.reduce((s, t) => s + outcomeIds[t].length, 0);
const maxFull = ACTIVE_IDS.reduce((s, t) => s + allIds[t].length, 0);

// runs[task][arm] = [{ iteration, outcome, full, process, checked }] sorted by iteration.
const runs = {};
let missing = 0;
for (const [key, row] of Object.entries(scores)) {
  const m = KEY_RE.exec(key);
  if (!m) continue;
  const [, task, arm, iter] = m;
  const count = (ids) => ids.filter((id) => row[id] === true).length;
  for (const id of outcomeIds[task]) if (row[id] === null || row[id] === undefined) missing += 1;
  ((runs[task] ??= {})[arm] ??= []).push({
    iteration: Number(iter),
    outcome: count(outcomeIds[task]),
    full: count(allIds[task]),
    process: count(processIds[task]),
    checked: processCheck[key] === true,
  });
}
for (const byArm of Object.values(runs)) for (const list of Object.values(byArm)) list.sort((a, b) => a.iteration - b.iteration);

const mean = (task, arm, field) => {
  const list = runs[task]?.[arm];
  return list?.length ? list.reduce((s, r) => s + r[field], 0) / list.length : null;
};
const complete = (arm) => ACTIVE_IDS.every((task) => mean(task, arm, "outcome") !== null);
const total = (arm, field) => ACTIVE_IDS.reduce((s, task) => s + (mean(task, arm, field) ?? 0), 0);
const fmt = (x) => (x === null ? "-" : x.toFixed(2));
const pct = (points, max) => (max > 0 ? `${((100 * points) / max).toFixed(1)}%` : "-");
const nRange = (arm) => {
  const ns = ACTIVE_IDS.map((t) => runs[t]?.[arm]?.length ?? 0).filter((n) => n > 0);
  if (!ns.length) return "0";
  const lo = Math.min(...ns);
  const hi = Math.max(...ns);
  return lo === hi ? String(lo) : `${lo}-${hi}`;
};

const today = new Date().toISOString().slice(0, 10);
const perCell = Math.max(0, ...Object.values(runs).flatMap((byArm) => Object.values(byArm).map((l) => l.length)));
console.log(`Scope: these ${ACTIVE_IDS.length} tasks, model ${meta.model ?? process.env.H2H_MODEL ?? DEFAULT_MODEL}, ${perCell} runs per cell, ${meta.date ?? today}; not a general ranking.`);
// The code under test, as prepare-code.sh recorded it (see docs/HEAD-TO-HEAD.md, "Isolation").
const readText = (name) => (existsSync(join(h2hOut, name)) ? readFileSync(join(h2hOut, name), "utf8").trim() : "");
const codeCommit = readText("code-commit.txt");
if (codeCommit === "") {
  console.log("Code under test: not recorded (no code-commit.txt); the ours arm cannot be tied to a commit.");
} else {
  const probes = readText("code-probe.txt").split("\n").filter((l) => /^(PASS|FAIL) /.test(l));
  const passed = probes.filter((l) => l.startsWith("PASS ")).length;
  console.log(`Code under test: commit ${codeCommit}, tree ${readText("code-tree.txt") || "not recorded"}, git archive copy; probes ${passed} of ${probes.length} passed.`);
  for (const l of probes) console.log(`  ${l}`);
}
console.log("");
for (const [name, reason] of notRun) console.log(`${name}: not run, ${reason}`);
if (notRun.size) console.log("");
// Retired tasks are listed with their reason; they are not in the totals or the win rule, with or without
// --include-retired (that flag only adds their rows to the tables below).
if (RETIRED_TASKS.length) {
  console.log(`Retired tasks (not in the totals or the win rule${INCLUDE_RETIRED ? "; listed in the tables as retired" : ""}):`);
  for (const t of RETIRED_TASKS) console.log(`- ${t.id}${t.retired?.replacedBy ? ` (replaced by ${t.retired.replacedBy})` : ""}: ${t.retired?.reason ?? "no reason recorded"}`);
  console.log("");
}

function grid(title, field, max) {
  console.log(title);
  console.log(`| Task | ${countedArms.join(" | ")} |`);
  console.log(`|---|${countedArms.map(() => "---").join("|")}|`);
  for (const task of TASK_IDS) {
    const taskMax = field === "outcome" ? outcomeIds[task].length : allIds[task].length;
    const show = (arm) => {
      const m = mean(task, arm, field);
      return m === null ? "-" : `${fmt(m)} (${Math.round((100 * m) / taskMax)}%)`;
    };
    console.log(`| ${task}${ACTIVE_IDS.includes(task) ? "" : " (retired)"} | ${countedArms.map(show).join(" | ")} |`);
  }
  console.log(`| **Mean total (of ${max})** | ${countedArms.map((arm) => fmt(complete(arm) ? total(arm, field) : null)).join(" | ")} |`);
  console.log(`| **Percent** | ${countedArms.map((arm) => (complete(arm) ? pct(total(arm, field), max) : "-")).join(" | ")} |`);
  console.log(`| **n per cell** | ${countedArms.map((arm) => nRange(arm)).join(" | ")} |`);
  console.log("");
}

grid(`OUTCOME table (mean points per task, only criteria labelled outcome; of ${maxOutcome})`, "outcome", maxOutcome);

console.log("OUTCOME per run (runs in iteration order, mean, min-max, n)");
console.log("| Task | Arm | Runs | Mean | Min-max | n |");
console.log("|---|---|---|---|---|---|");
for (const task of TASK_IDS) {
  for (const arm of countedArms) {
    const list = runs[task]?.[arm];
    if (!list?.length) continue;
    const vals = list.map((r) => r.outcome);
    console.log(`| ${task} | ${arm} | ${vals.join(",")} | ${fmt(mean(task, arm, "outcome"))} | ${Math.min(...vals)}-${Math.max(...vals)} | ${vals.length} |`);
  }
}
console.log("");

grid(`FULL table (mean points per task, all criteria; of ${maxFull})`, "full", maxFull);

// Better arm per competitor, by OUTCOME total (the natural arm wins a tie). Informational only.
const better = {};
for (const comp of COMPETITORS) {
  if (notRun.has(comp)) continue;
  better[comp] = total(`${comp}-inv`, "outcome") > total(comp, "outcome") + EPS ? `${comp}-inv` : comp;
}
const rivalArms = countedArms.filter((a) => a !== "ours");

// Completeness: a verdict needs ours and every counted rival arm (natural, invoked and base) to have at
// least one run in every task. Unequal n per cell is reported but does not by itself block a verdict.
const problems = [];
for (const arm of countedArms) {
  const have = ACTIVE_IDS.filter((t) => (runs[t]?.[arm]?.length ?? 0) > 0);
  if (have.length === 0) problems.push(`arm ${arm} has no runs`);
  else if (have.length < ACTIVE_IDS.length) problems.push(`arm ${arm} has no runs for ${ACTIVE_IDS.filter((t) => !have.includes(t)).join(", ")}`);
}
const nMax = Math.max(0, ...ACTIVE_IDS.flatMap((t) => countedArms.map((a) => runs[t]?.[a]?.length ?? 0)));
const unequal = [];
let missingRuns = 0;
for (const arm of countedArms) {
  for (const task of ACTIVE_IDS) {
    const n = runs[task]?.[arm]?.length ?? 0;
    missingRuns += nMax - n;
    if (n > 0 && n !== nMax) unequal.push(`${task}-${arm} n=${n}`);
  }
}
if (missingRuns > 0) console.log(`Missing runs: ${missingRuns} of ${nMax * ACTIVE_IDS.length * countedArms.length} expected (n=${nMax} per cell)`);
if (unequal.length) console.log(`Warning: unequal n per cell (n range per arm in the n row above; cells below n=${nMax}: ${unequal.join(", ")})`);
console.log(`Better arm per competitor (informational, higher OUTCOME total): ${Object.entries(better).map(([c, a]) => `${c}=${a}`).join(", ") || "none"}`);

const maxOver = (task, arms) => {
  const ms = arms.map((a) => mean(task, a, "outcome")).filter((m) => m !== null);
  return ms.length ? Math.max(...ms) : null;
};
// Rule B with the ceiling rule: per failing task, the reason. Ours passes a task when its mean is strictly
// above the highest rival mean, or when a rival is at the task maximum and ours is at the maximum too.
function failingTasks(arms) {
  const out = [];
  for (const task of ACTIVE_IDS) {
    const ours = mean(task, "ours", "outcome");
    const rival = maxOver(task, arms);
    if (ours === null || rival === null) {
      out.push({ task, reason: ours === null ? "ours has no runs" : "no rival has runs" });
      continue;
    }
    const taskMax = outcomeIds[task].length;
    const top = arms.filter((a) => {
      const m = mean(task, a, "outcome");
      return m !== null && Math.abs(m - rival) < EPS;
    });
    const atMax = rival >= taskMax - EPS;
    if (atMax) {
      if (ours >= taskMax - EPS) continue; // a tie at the maximum passes
      out.push({ task, reason: `rival at max, we are not: ${top.join(", ")} at the maximum ${fmt(taskMax)}, ours ${fmt(ours)}` });
    } else if (!(ours > rival + EPS)) {
      out.push({ task, reason: `${ours < rival - EPS ? "below" : "not above"} rival ${top.join(", ")} (ours ${fmt(ours)} vs ${fmt(rival)}, maximum ${fmt(taskMax)})` });
    }
  }
  return out;
}
const oursTotal = total("ours", "outcome");
// Rule A: lost points. The best other arm is the rival with the highest total (first in arm order on a tie).
const bestArm = rivalArms.reduce((best, a) => (best === null || total(a, "outcome") > total(best, "outcome") + EPS ? a : best), null);
const strongest = bestArm === null ? 0 : total(bestArm, "outcome");
const oursLost = maxOutcome - oursTotal;
const bestLost = maxOutcome - strongest;
const lostLimit = LOST_SHARE * bestLost;
const ruleAOk = complete("ours") && oursLost <= lostLimit + EPS;

for (const key of leakKeys) {
  console.log(key in leakReview
    ? `LEAK (${leakReview[key].verdict === "confirmed" ? "CONFIRMED" : "reviewed, benign"}): ${key}: ${leakReview[key].reason.trim()}`
    : `LEAK: ${key} has tool calls that mention the answer key (bench/head-to-head, golden, checker-data, tasks.json, home/h, labels.json or .superpowers); review the transcript`);
}
console.log(`Leak-flagged runs: ${leakKeys.length} (${unreviewedLeaks.length} not reviewed, ${confirmedLeaks.length} confirmed)`);
console.log(`Total (OUTCOME, of ${maxOutcome}): ours ${oursTotal.toFixed(2)} vs strongest other arm ${bestArm ?? "none"} ${strongest.toFixed(2)}`);
console.log(`Lost points: ours ${oursLost.toFixed(2)}, strongest other arm ${bestLost.toFixed(2)}; limit ${LOST_SHARE} x ${bestLost.toFixed(2)} = ${lostLimit.toFixed(2)}`);
if (problems.length > 0 || missing > 0 || unreviewedLeaks.length > 0 || confirmedLeaks.length > 0) {
  const why = [
    ...problems,
    ...(missing > 0 ? [`${missing} blind verdicts missing`] : []),
    ...confirmedLeaks.map((key) => `CONFIRMED LEAK in run ${key}`),
    ...(unreviewedLeaks.length > 0 ? [`${unreviewedLeaks.length} leak-flagged run(s) not reviewed: ${unreviewedLeaks.join(", ")}`] : []),
  ].join("; ");
  console.log(`Win rule: INCOMPLETE (${why})`);
} else {
  const failing = failingTasks(rivalArms);
  const ruleBOk = failing.length === 0;
  console.log(
    `Rule A (lost points at most ${LOST_SHARE} x the strongest other arm's): ${ruleAOk ? "PASS" : "FAIL"} ` +
      `(ours lost ${oursLost.toFixed(2)}, limit ${lostLimit.toFixed(2)}${bestLost < EPS ? "; the strongest other arm lost 0, so ours must lose 0" : ""})`,
  );
  console.log(`Rule B (every task strictly above every other arm; a rival at the maximum needs ours at the maximum): ${ruleBOk ? "PASS" : "FAIL"} (${ACTIVE_IDS.length - failing.length} of ${ACTIVE_IDS.length} tasks pass)`);
  console.log(`Win rule: ${ruleBOk && ruleAOk ? "PASS" : "FAIL"}`);
  console.log(`Failing tasks: ${failing.length ? failing.map((f) => f.task).join(", ") : "none"}`);
  for (const f of failing) console.log(`- ${f.task}: ${f.reason}`);
  if (!complete("ours")) console.log("Note: ours has no runs for at least one task.");
}

// PROCESS column, reported separately and never part of the gate.
const processTasks = ACTIVE_IDS.filter((t) => processIds[t].length > 0);
console.log("");
console.log("PROCESS column (not in the win rule): runs whose transcript ran a deterministic check, and criteria labelled process");
console.log("| Arm | Runs with a check | Runs | Process criteria mean |");
console.log("|---|---|---|---|");
for (const arm of countedArms) {
  let checked = 0;
  let n = 0;
  for (const task of ACTIVE_IDS) {
    for (const r of runs[task]?.[arm] ?? []) {
      n += 1;
      if (r.checked) checked += 1;
    }
  }
  const proc = processTasks.length
    ? `${fmt(processTasks.reduce((s, t) => s + (mean(t, arm, "process") ?? 0), 0))} of ${processTasks.reduce((s, t) => s + processIds[t].length, 0)}`
    : "none labelled";
  console.log(`| ${arm} | ${checked} | ${n} | ${proc} |`);
}
