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
// Win rule (OUTCOME scores only; the rivals are every other counted arm: all competitor arms, natural and
// invoked, and the base arm). Rule B: on every task ours has a mean strictly above the per-task maximum
// mean over all rivals. Rule A: ours' total is at least 1.2 times the highest total of any other single
// arm. There is no "better arm" selection and no separate strict view. The better arm of each competitor
// is still printed, for information only. A competitor listed as not runnable in competitors-status.json
// is printed as "not run, <reason>" and never counted.
//
// Leaks: a scores.json row with leak: true (a tool call that mentioned the answer key, see score.mjs) is
// printed as a LEAK line and counted in the verdict line. The verdict is INCOMPLETE until each flagged run
// is reviewed, which is recorded in <H2H_OUT>/leak-review.json as { "<run>": { "verdict": "benign" |
// "confirmed", "reason": "<text>" } }. A confirmed leak keeps the verdict INCOMPLETE ("CONFIRMED LEAK in run X").
// A malformed review file is an error (exit 2).
//
// Exit 2 when labels.json is missing or does not label every criterion of tasks.json. Otherwise exit 0.
// If an outcome criterion is still null after the merge, the verdict is INCOMPLETE.
import { existsSync, readFileSync } from "node:fs";
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

const RATIO = 1.2;
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
// Rule B: the tasks where ours is not strictly above the per-task maximum over every rival arm.
function failingTasks(arms) {
  return ACTIVE_IDS.filter((task) => {
    const ours = mean(task, "ours", "outcome");
    const rival = maxOver(task, arms);
    return ours === null || rival === null || !(ours > rival + EPS);
  });
}
const oursTotal = total("ours", "outcome");
// Rule A: the highest total of any single other arm.
const strongest = Math.max(0, ...rivalArms.map((a) => total(a, "outcome")));
const totalOk = (rivalTotal) => complete("ours") && oursTotal >= RATIO * rivalTotal - EPS;
const ratioText = (r) => (Number.isFinite(r) ? r.toFixed(3) : "inf");
const ratioOf = (rivalTotal) => (rivalTotal > 0 ? oursTotal / rivalTotal : Infinity);

for (const key of leakKeys) {
  console.log(key in leakReview
    ? `LEAK (${leakReview[key].verdict === "confirmed" ? "CONFIRMED" : "reviewed, benign"}): ${key}: ${leakReview[key].reason.trim()}`
    : `LEAK: ${key} has tool calls that mention the answer key (bench/head-to-head, golden, checker-data, tasks.json, home/h, labels.json or .superpowers); review the transcript`);
}
console.log(`Leak-flagged runs: ${leakKeys.length} (${unreviewedLeaks.length} not reviewed, ${confirmedLeaks.length} confirmed)`);
console.log(`Total (OUTCOME): ours ${oursTotal.toFixed(2)} vs strongest other arm ${strongest.toFixed(2)} (ratio ${ratioText(ratioOf(strongest))}, needs ${RATIO.toFixed(2)})`);
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
  console.log(`Win rule: ${failing.length === 0 && totalOk(strongest) ? "PASS" : "FAIL"}`);
  console.log(`Failing tasks: ${failing.length ? failing.join(", ") : "none"}`);
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
