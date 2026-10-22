import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The run, blind-grading and summary scripts for the head-to-head. Each test runs the real script
// with a temporary output directory. No test calls the real claude: run-one.sh gets a fake one on PATH.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BENCH = join(ROOT, "bench", "head-to-head");
const RUN = join(BENCH, "run");
const BIN = join(RUN, "bin-ours");
const FIXTURES = join(BENCH, "fixtures");
const ARMS = ["ours", "blader", "blader-inv", "unslop", "unslop-inv", "everwrite", "everwrite-inv", "base"];
// The active blind-graded tasks (h4 was blind-graded too, until it was retired).
const OUTPUT_FILE = { h1: "note.md", h2: "README.md", h3: "pr.md" };
const CRITERIA = ["C1", "C2", "C3", "C4", "C5"];

// A round directory holds read-only exports; make it writable before removing it.
const rmRound = (dir) => {
  spawnSync("chmod", ["-R", "u+w", dir]);
  rmSync(dir, { recursive: true, force: true });
};
const tmp = (name) => mkdtempSync(join(tmpdir(), `h2h-${name}-`));
const tasks = () => JSON.parse(readFileSync(join(BENCH, "tasks.json"), "utf8")).tasks;
// The scripts work on the active tasks only; the retired ones are checked in their own tests.
const IDS = tasks().filter((t) => t.status !== "retired").map((t) => t.id);
const RETIRED_IDS = tasks().filter((t) => t.status === "retired").map((t) => t.id);

// labels.json is written by an auditor after a freeze, so the tasks frozen on 2026-10-22 have no labels yet and
// summarize.mjs refuses to run on them. The tests label every missing criterion `outcome` in a copy of the file
// and point every script at it through H2H_LABELS.
function withAllLabels(doc) {
  for (const task of tasks()) {
    doc.labels[task.id] ??= {};
    for (const c of task.criteria) doc.labels[task.id][c.id] ??= { label: "outcome", reason: "test default" };
  }
  return doc;
}
const TEST_LABELS = join(mkdtempSync(join(tmpdir(), "h2h-labels-")), "labels.json");
writeFileSync(TEST_LABELS, JSON.stringify(withAllLabels(JSON.parse(readFileSync(join(BENCH, "labels.json"), "utf8")))));
process.env.H2H_LABELS = TEST_LABELS;

// The ours arm runs from a git-archive copy of the code under test (H2H_CODE_DIR), never from the working tree.
// Most tests only need a stand-in for that copy: a directory with the shims, a CLI that prints its own
// location, and a plugin. It lives outside the repository, as a real copy does.
function fakeCodeDir(parent, label = "code") {
  const dir = join(parent, label);
  mkdirSync(join(dir, "dist", "src"), { recursive: true });
  mkdirSync(join(dir, ".claude-plugin"), { recursive: true });
  mkdirSync(join(dir, "skills", "ai-slop-linter"), { recursive: true });
  mkdirSync(join(dir, "bench", "head-to-head", "run"), { recursive: true });
  cpSync(join(RUN, "bin-ours"), join(dir, "bench", "head-to-head", "run", "bin-ours"), { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "ai-slop-linter", version: "0.0.0-fake", files: ["dist", "skills", ".claude-plugin"] }));
  writeFileSync(join(dir, ".claude-plugin", "plugin.json"), "{}\n");
  writeFileSync(join(dir, "skills", "ai-slop-linter", "SKILL.md"), "fake skill\n");
  writeFileSync(join(dir, "dist", "src", "cli.js"), `console.log("FAKE-CLI " + ${JSON.stringify(label)} + " " + process.argv.slice(2).join(" "));\n`);
  return dir;
}
const FAKE_CODE = fakeCodeDir(realpathSync(mkdtempSync(join(tmpdir(), "h2h-code-"))));
process.env.H2H_CODE_DIR = FAKE_CODE;
const CODE_BIN = join(FAKE_CODE, "bench", "head-to-head", "run", "bin-ours");
const SHA_A = "a".repeat(40);
const node = (script, args, opts = {}) => spawnSync(process.execPath, [join(RUN, script), ...args], { encoding: "utf8", timeout: 300000, ...opts });

// scoresFor({ h1: { ours: [5,5,5], base: [0,0,0] } }) builds a scores.json: iteration i of an arm
// passes its first k criteria, where k is the i-th number.
function scoresFor(byTaskArm) {
  const out = {};
  for (const [task, arms] of Object.entries(byTaskArm)) {
    for (const [arm, perIteration] of Object.entries(arms)) {
      perIteration.forEach((k, i) => {
        const row = {};
        CRITERIA.forEach((c, j) => { row[c] = j < k; });
        out[`${task}-${arm}-${i + 1}`] = row;
      });
    }
  }
  return out;
}

// A cell as three iterations whose points total `sum` (0 to 15), spread as evenly as possible.
const cell = (sum) => {
  const base = Math.floor(sum / 3);
  const extra = sum - base * 3;
  return [0, 1, 2].map((i) => base + (i < extra ? 1 : 0));
};

// perTask: { arm: number | { h1: sum, ... } }; a number applies to all twelve active tasks.
function caseScores(arms) {
  const byTaskArm = {};
  for (const task of IDS) {
    byTaskArm[task] = {};
    for (const [arm, spec] of Object.entries(arms)) byTaskArm[task][arm] = cell(typeof spec === "number" ? spec : spec[task]);
  }
  return byTaskArm;
}

// Rival sums per task (blader natural): seven tasks at 12 and the other five at 11, total 139 of 180 (mean 46.33 of 60).
const RIVAL = Object.fromEntries(IDS.map((t, i) => [t, i < 7 ? 12 : 11]));
const ONLY_ZERO = { unslop: 0, "unslop-inv": 0, everwrite: 0, "everwrite-inv": 0, base: 0, "blader-inv": 0 };
const PASSING = { ours: 15, blader: RIVAL, ...ONLY_ZERO };

function labelsFile(overrides = {}) {
  const doc = withAllLabels(JSON.parse(readFileSync(join(BENCH, "labels.json"), "utf8")));
  for (const [key, label] of Object.entries(overrides)) {
    const [task, crit] = key.split(".");
    if (label === null) delete doc.labels[task][crit];
    else doc.labels[task][crit].label = label;
  }
  const file = join(tmp("labels"), "labels.json");
  writeFileSync(file, JSON.stringify(doc));
  return file;
}

function summarizeRaw(scores, { blind, labels, extra = {}, args = [] } = {}) {
  const dir = tmp("summary");
  writeFileSync(join(dir, "scores.json"), JSON.stringify(scores));
  if (blind) writeFileSync(join(dir, "blind.json"), JSON.stringify(blind));
  for (const [name, value] of Object.entries(extra)) writeFileSync(join(dir, name), JSON.stringify(value));
  const env = { ...process.env };
  if (labels) env.H2H_LABELS = labels;
  return node("summarize.mjs", [dir, ...args], { env });
}

function summarize(scores, options) {
  const r = summarizeRaw(scores, options);
  assert.equal(r.status, 0, r.stderr);
  return r.stdout;
}

// Run directories (fixture copies) for h1..h4 and all eight arms, plus the iteration count given.
function makeBlindRuns(out, iterations = 1) {
  mkdirSync(out, { recursive: true });
  const keys = [];
  for (const task of Object.keys(OUTPUT_FILE)) {
    for (const arm of ARMS) {
      for (let i = 1; i <= iterations; i++) {
        const dir = join(out, `${task}-${arm}-${i}`);
        mkdirSync(dir);
        cpSync(join(FIXTURES, task, OUTPUT_FILE[task]), join(dir, OUTPUT_FILE[task]));
        writeFileSync(`${dir}.jsonl`, '{"type":"result","is_error":false}\n');
        keys.push(`${task}-${arm}-${i}`);
      }
    }
  }
  return keys;
}

test("win rule passes when ours beats every arm on every task by a wide margin", () => {
  const out = summarize(scoresFor(caseScores(PASSING)));
  assert.match(out, /Win rule: PASS/);
  assert.match(out, /Failing tasks: none$/m);
  assert.doesNotMatch(out, /Strict view/, "the separate strict view is gone");
});

test("win rule fails when ours ties the rival on one task, even with a high total", () => {
  const out = summarize(scoresFor(caseScores({ ...PASSING, ours: { ...Object.fromEntries(IDS.map((t) => [t, 15])), h3: RIVAL.h3 } })));
  assert.match(out, /Win rule: FAIL/);
  assert.match(out, /Failing tasks: h3$/m);
});

// ---- the win rule as restated by the owner on 2026-10-22 --------------------------------------------------------
// Rule A: ours' lost points (maximum total minus ours' total) at most 0.8 times the best other arm's lost points.
// Rule B with the ceiling rule: strictly above every other arm on every task; a rival at the task maximum needs
// ours at the maximum too. Sums below are per cell of three runs (15 = mean 5.00, the task maximum).
const ALL_15 = Object.fromEntries(IDS.map((t) => [t, 15]));
const ALL_0 = Object.fromEntries(IDS.map((t) => [t, 0]));
const OTHERS_0 = { "blader-inv": 0, unslop: 0, "unslop-inv": 0, everwrite: 0, "everwrite-inv": 0, base: 0 };
const restated = (ours, blader) => summarize(scoresFor(caseScores({ ours: { ...ALL_15, ...ours }, blader: { ...ALL_0, ...blader }, ...OTHERS_0 })));

test("the active task set has twelve tasks of five outcome points each, so the maximum total is 60", () => {
  assert.equal(IDS.length, 12);
  assert.match(restated({}, {}), /^Total \(OUTCOME, of 60\): ours 60\.00 vs strongest other arm blader 0\.00$/m);
});

test("ceiling rule: a tie at the task maximum passes", () => {
  const out = restated({}, { h1: 15 });
  assert.match(out, /Rule B \(.*\): PASS \(12 of 12 tasks pass\)/);
  assert.match(out, /Win rule: PASS/);
  assert.match(out, /Failing tasks: none$/m);
});

test("ceiling rule: a rival at the maximum where ours is not fails the task, with the reason", () => {
  const out = restated({ h1: 14 }, { h1: 15 });
  assert.match(out, /Rule A \(.*\): PASS/, "rule A alone would pass");
  assert.match(out, /Rule B \(.*\): FAIL \(11 of 12 tasks pass\)/);
  assert.match(out, /Win rule: FAIL/);
  assert.match(out, /Failing tasks: h1$/m);
  assert.match(out, /^- h1: rival at max, we are not: blader at the maximum 5\.00, ours 4\.67$/m);
});

test("rule B: strictly above every other arm below the maximum passes", () => {
  const out = restated({ h1: 13 }, { h1: 12 });
  assert.match(out, /Rule B \(.*\): PASS/);
  assert.match(out, /Win rule: PASS/);
});

test("rule B: equal to the best rival below the maximum fails, and so does below", () => {
  const equal = restated({ h1: 12 }, { h1: 12 });
  assert.match(equal, /Win rule: FAIL/);
  assert.match(equal, /Failing tasks: h1$/m);
  assert.match(equal, /^- h1: not above rival blader \(ours 4\.00 vs 4\.00, maximum 5\.00\)$/m);
  const below = restated({ h1: 11 }, { h1: 12 });
  assert.match(below, /^- h1: below rival blader \(ours 3\.67 vs 4\.00, maximum 5\.00\)$/m);
});

test("rule A: ours losing exactly 0.8 times the best other arm's lost points passes", () => {
  // blader is at the maximum on eleven tasks (ours too) and at 10 of 15 on h1: it loses 5/3 = 1.67 points.
  // Ours scores 11 of 15 on h1 (above blader): it loses 4/3 = 1.33 points, exactly 0.8 x 1.67.
  const out = restated({ h1: 11 }, { ...ALL_15, h1: 10 });
  assert.match(out, /^Lost points: ours 1\.33, strongest other arm 1\.67; limit 0\.8 x 1\.67 = 1\.33$/m);
  assert.match(out, /Rule A \(.*\): PASS \(ours lost 1\.33, limit 1\.33\)/);
  assert.match(out, /Rule B \(.*\): PASS/);
  assert.match(out, /Win rule: PASS/);
});

test("rule A: ours losing slightly more than 0.8 times the best other arm's lost points fails", () => {
  // blader loses 6/3 = 2.00 points on h1 (limit 1.60); ours loses 5/3 = 1.67 and is still above blader on h1.
  const out = restated({ h1: 10 }, { ...ALL_15, h1: 9 });
  assert.match(out, /Rule A \(.*\): FAIL \(ours lost 1\.67, limit 1\.60\)/);
  assert.match(out, /Rule B \(.*\): PASS/, "rule B alone would pass");
  assert.match(out, /Win rule: FAIL/);
  assert.match(out, /Failing tasks: none$/m);
});

test("rule A: when the best other arm lost 0 points, ours must lose 0", () => {
  const tie = restated({}, ALL_15);
  assert.match(tie, /Rule A \(.*\): PASS \(ours lost 0\.00, limit 0\.00; the strongest other arm lost 0, so ours must lose 0\)/);
  assert.match(tie, /Win rule: PASS/);
  const short = restated({ h1: 14 }, ALL_15);
  assert.match(short, /Rule A \(.*\): FAIL \(ours lost 0\.33, limit 0\.00; the strongest other arm lost 0, so ours must lose 0\)/);
  assert.match(short, /Win rule: FAIL/);
});

test("rule A: the best other arm is the rival with the highest total, the baseline included", () => {
  const out = summarize(scoresFor(caseScores({ ours: { ...ALL_15, h1: 13 }, blader: { ...ALL_0, h1: 12 }, ...OTHERS_0, base: { ...ALL_15, h1: 12 } })));
  assert.match(out, /^Total \(OUTCOME, of 60\): ours 59\.33 vs strongest other arm base 59\.00$/m);
  // base lost 1.00 (limit 0.80); ours lost 0.67.
  assert.match(out, /Rule A \(.*\): PASS \(ours lost 0\.67, limit 0\.80\)/);
});

test("round 1 under the restated rules: lost 5.67 against a limit of 2.93, six tasks fail", () => {
  // The per-run OUTCOME scores of round 1, copied from docs/HEAD-TO-HEAD.md ("Results, round 1", per run).
  const doc = readFileSync(join(ROOT, "docs", "HEAD-TO-HEAD.md"), "utf8");
  const section = doc.slice(doc.indexOf("Per run (the three scores of each cell"), doc.indexOf("Process column, not part of the gate"));
  const header = section.split("\n").find((l) => l.startsWith("| Task |")).split("|").slice(2, -1).map((c) => c.trim());
  const byTaskArm = {};
  for (const line of section.split("\n").filter((l) => /^\| h\d+ \|/.test(l))) {
    const [task, ...cells] = line.split("|").slice(1, -1).map((c) => c.trim());
    byTaskArm[task] = Object.fromEntries(header.map((arm, i) => [arm, cells[i].split(",").map(Number)]));
  }
  assert.deepEqual(Object.keys(byTaskArm), IDS);
  const out = summarize(scoresFor(byTaskArm));
  assert.match(out, /^Total \(OUTCOME, of 60\): ours 54\.33 vs strongest other arm blader-inv 56\.33$/m);
  assert.match(out, /^Lost points: ours 5\.67, strongest other arm 3\.67; limit 0\.8 x 3\.67 = 2\.93$/m);
  assert.match(out, /Rule A \(.*\): FAIL \(ours lost 5\.67, limit 2\.93\)/);
  assert.match(out, /Rule B \(.*\): FAIL \(6 of 12 tasks pass\)/);
  assert.match(out, /^Failing tasks: h1, h2, h9, h10, h17, h18$/m);
  assert.match(out, /^- h9: below rival base \(ours 4\.00 vs 4\.67, maximum 5\.00\)$/m);
  assert.match(out, /^- h1: rival at max, we are not: blader-inv, everwrite at the maximum 5\.00, ours 4\.33$/m);
});

test("a missing blind verdict prints INCOMPLETE instead of PASS or FAIL", () => {
  const scores = scoresFor(caseScores(PASSING));
  scores["h1-ours-1"].C5 = null;
  const out = summarize(scores);
  assert.match(out, /Win rule: INCOMPLETE \(1 blind verdicts missing\)/);
  assert.doesNotMatch(out, /Win rule: (PASS|FAIL)/);
  assert.doesNotMatch(out, /Strict view/);
});

test("blind.json fills the blind C5 values; without it the verdict stays INCOMPLETE", () => {
  const full = scoresFor(caseScores(PASSING));
  const blind = {};
  const withheld = structuredClone(full);
  const blindTasks = tasks().filter((t) => t.status === "active" && t.criteria.some((c) => c.kind === "blind")).map((t) => t.id);
  assert.deepEqual(blindTasks, ["h1", "h2", "h3"]);
  let n = 0;
  for (const key of Object.keys(full)) {
    if (blindTasks.some((t) => key.startsWith(`${t}-`))) {
      blind[key] = full[key].C5;
      withheld[key].C5 = null;
      n += 1;
    }
  }
  assert.match(summarize(withheld), new RegExp(`Win rule: INCOMPLETE \\(${n} blind verdicts missing\\)`));
  assert.match(summarize(withheld, { blind }), /Win rule: PASS/);
});

test("OUTCOME counts only outcome-labelled criteria; a failing process criterion changes FULL but not the gate", () => {
  const labels = labelsFile({ "h1.C5": "process" });
  const withProcess = caseScores(PASSING);
  withProcess.h1.blader = cell(9); // 3 of the 4 outcome criteria; ours gets 4 (its fifth point is the process criterion)
  const base = scoresFor(withProcess);
  const failedProcess = structuredClone(base);
  for (const arm of ["ours", "blader"]) for (let i = 1; i <= 3; i++) failedProcess[`h1-${arm}-${i}`].C5 = false;

  const a = summarize(base, { labels });
  const b = summarize(failedProcess, { labels });
  const section = (text, title) => text.slice(text.indexOf(title), text.indexOf("\n\n", text.indexOf(title)));
  assert.equal(section(a, "OUTCOME table"), section(b, "OUTCOME table"), "OUTCOME table is unchanged");
  assert.notEqual(section(a, "FULL table"), section(b, "FULL table"), "FULL table changed");
  assert.match(b, /Win rule: PASS/);
  assert.match(section(b, "FULL table"), /\| h1 \| 4\.00 \(80%\) \| 3\.00 \(60%\) \|/, "h1 FULL row shows the failed process criterion, with the percent of the task");
  assert.match(section(a, "FULL table"), /\| h1 \| 5\.00 \(100%\) \| 3\.00 \(60%\) \|/);
  assert.match(section(a, "OUTCOME table"), /\| h1 \| 4\.00 \(100%\) \| 3\.00 \(75%\) \|/, "the h1 OUTCOME denominator is 4");
  assert.match(a, /OUTCOME table \(mean points per task, only criteria labelled outcome; of 59\)/, "the h1 denominator is 4");
});

test("a process criterion cannot rescue a failing outcome: only outcome points decide the gate", () => {
  const labels = labelsFile({ "h1.C1": "process" });
  // Ours ties the rival on three of the four outcome criteria of h1 (below the maximum) and wins the process
  // criterion C1.
  const arms = caseScores({ ...PASSING });
  arms.h1.ours = [4, 4, 4]; // the process point C1 plus outcome C2 to C4
  const scores = scoresFor(arms);
  for (let i = 1; i <= 3; i++) scores[`h1-blader-${i}`] = { C1: false, C2: true, C3: true, C4: true, C5: false };
  const out = summarize(scores, { labels });
  assert.match(out, /Win rule: FAIL/);
  assert.match(out, /Failing tasks: h1$/m);
});

test("summarize refuses with exit 2 when labels.json is missing or a criterion has no label", () => {
  const scores = scoresFor(caseScores(PASSING));
  const missingFile = summarizeRaw(scores, { labels: join(tmp("nolabels"), "labels.json") });
  assert.equal(missingFile.status, 2);
  assert.match(missingFile.stderr, /labels file missing/);
  assert.equal(missingFile.stdout, "");

  const unlabelled = summarizeRaw(scores, { labels: labelsFile({ "h11.C5": null }) });
  assert.equal(unlabelled.status, 2);
  assert.match(unlabelled.stderr, /no outcome\/process label for: h11 C5/);
  assert.equal(unlabelled.stdout, "");
});

test("better arm: the invoked arm counts when it has the higher OUTCOME total, and the natural arm otherwise", () => {
  // The natural arm of blader scores 12 per task; the invoked arm 15 on h2 only. Ours is 15 everywhere.
  const inv = caseScores({ ...PASSING, blader: 12, "blader-inv": { ...Object.fromEntries(IDS.map((t) => [t, 0])), h2: 14 } });
  // Totals: natural 12*12/3 = 48, invoked 14/3. The natural arm is the better one.
  const natural = summarize(scoresFor(inv));
  assert.match(natural, /Better arm per competitor .*blader=blader,/);

  // Invoked arm higher in total than natural, and it is at the maximum on h2 where ours (14) is not: the gate
  // fails on h2 (the ceiling rule).
  const arms = caseScores({ ...PASSING, ours: { ...Object.fromEntries(IDS.map((t) => [t, 15])), h2: 14 }, blader: 6, "blader-inv": { ...Object.fromEntries(IDS.map((t) => [t, 10])), h2: 15 } });
  const out = summarize(scoresFor(arms));
  assert.match(out, /Better arm per competitor .*blader=blader-inv/);
  assert.match(out, /Win rule: FAIL/);
  assert.match(out, /Failing tasks: h2$/m);
});

test("rule B compares ours with the per-task maximum over ALL rival arms: an invoked arm that ties on one task fails the round", () => {
  // Natural blader leads in total (h1 = 13, rest 0); invoked blader scores 12 on h2 only. Ours is 15
  // except h2 = 12. The better arm by total is the natural one, but the invoked arm ties ours on h2.
  const zero = Object.fromEntries(IDS.map((t) => [t, 0]));
  const arms = caseScores({
    ours: { ...Object.fromEntries(IDS.map((t) => [t, 15])), h2: 12 },
    blader: { ...zero, h1: 13 },
    "blader-inv": { ...zero, h2: 12 },
    ...Object.fromEntries(["unslop", "unslop-inv", "everwrite", "everwrite-inv", "base"].map((a) => [a, 0])),
  });
  const out = summarize(scoresFor(arms));
  assert.match(out, /Win rule: FAIL/);
  assert.match(out, /Failing tasks: h2$/m);
  assert.match(out, /Better arm per competitor \(informational.*blader=blader,/, "the better arm is still printed, for information");
  assert.doesNotMatch(out, /Strict/);
});

test("rule B includes the base arm and the natural arm of every competitor", () => {
  const zero = Object.fromEntries(IDS.map((t) => [t, 0]));
  for (const arm of ["base", "unslop", "everwrite-inv"]) {
    // The rival ties ours below the maximum on h14.
    const arms = caseScores({ ...PASSING, ...ONLY_ZERO, blader: zero, [arm]: { ...zero, h14: 14 }, ours: { ...Object.fromEntries(IDS.map((t) => [t, 15])), h14: 14 } });
    const out = summarize(scoresFor(arms));
    assert.match(out, /Win rule: FAIL/, arm);
    assert.match(out, /Failing tasks: h14$/m, arm);
  }
});

test("rule A uses the lost points of the best single arm, not of the sum of the per-task maxima", () => {
  // Blader natural scores 12 (mean 4) on the first six tasks, blader-inv 6 (mean 2) on the other six: the best
  // single arm totals 24 and loses 36 (limit 28.80); the per-task maxima total 36 and lose 24 (limit 19.20).
  // Ours scores 13 and 7 (above every arm on every task), totals 40 and loses 20: it passes against the best
  // single arm, and would fail against the per-task maxima.
  const zero = Object.fromEntries(IDS.map((t) => [t, 0]));
  const first = Object.fromEntries(IDS.map((t, i) => [t, i < 6 ? 12 : 0]));
  const second = Object.fromEntries(IDS.map((t, i) => [t, i < 6 ? 0 : 6]));
  const ours = Object.fromEntries(IDS.map((t, i) => [t, i < 6 ? 13 : 7]));
  const out = summarize(scoresFor(caseScores({ ours, blader: first, "blader-inv": second, unslop: zero, "unslop-inv": zero, everwrite: zero, "everwrite-inv": zero, base: zero })));
  assert.match(out, /^Lost points: ours 20\.00, strongest other arm 36\.00; limit 0\.8 x 36\.00 = 28\.80$/m);
  assert.match(out, /Win rule: PASS/);
});

test("rule A fails when the best other arm is an invoked one and ours loses more than 0.8 times its lost points", () => {
  // blader-inv loses 2.00 points on h1 (limit 1.60); ours loses 1.67 there and is still above it on every task.
  const out = summarize(scoresFor(caseScores({ ...ONLY_ZERO, blader: 0, "blader-inv": { ...Object.fromEntries(IDS.map((t) => [t, 15])), h1: 9 }, ours: { ...Object.fromEntries(IDS.map((t) => [t, 15])), h1: 10 } })));
  assert.match(out, /vs strongest other arm blader-inv 58\.00$/m);
  assert.match(out, /Rule A \(.*\): FAIL \(ours lost 1\.67, limit 1\.60\)/);
  assert.match(out, /Win rule: FAIL/);
  assert.match(out, /Failing tasks: none$/m);
});

test("a leak-flagged run prints a LEAK line, counts in the verdict and makes the round INCOMPLETE until reviewed", () => {
  const scores = scoresFor(caseScores(PASSING));
  scores["h3-blader-2"].leak = true;
  const out = summarize(scores);
  assert.match(out, /^LEAK: h3-blader-2 /m);
  assert.match(out, /Leak-flagged runs: 1 \(1 not reviewed, 0 confirmed\)/);
  assert.match(out, /Win rule: INCOMPLETE .*1 leak-flagged run\(s\) not reviewed: h3-blader-2/);
  assert.doesNotMatch(out, /Win rule: (PASS|FAIL)/);

  const benign = { "h3-blader-2": { verdict: "benign", reason: "read the task list only; no effect" } };
  const reviewed = summarize(scores, { extra: { "leak-review.json": benign } });
  assert.match(reviewed, /^LEAK \(reviewed, benign\): h3-blader-2: read the task list only/m);
  assert.match(reviewed, /Leak-flagged runs: 1 \(0 not reviewed, 0 confirmed\)/);
  assert.match(reviewed, /Win rule: PASS/);

  assert.match(summarize(scoresFor(caseScores(PASSING))), /Leak-flagged runs: 0 \(0 not reviewed, 0 confirmed\)/);
});

test("a confirmed leak keeps the round INCOMPLETE, names the run, and never prints PASS or FAIL", () => {
  const scores = scoresFor(caseScores(PASSING));
  scores["h3-blader-2"].leak = true;
  scores["h13-ours-1"].leak = true;
  const review = {
    "h3-blader-2": { verdict: "benign", reason: "looked at its own tasks.json copy" },
    "h13-ours-1": { verdict: "confirmed", reason: "read the golden answer" },
  };
  const out = summarize(scores, { extra: { "leak-review.json": review } });
  assert.match(out, /^LEAK \(CONFIRMED\): h13-ours-1: read the golden answer/m);
  assert.match(out, /Leak-flagged runs: 2 \(0 not reviewed, 1 confirmed\)/);
  assert.match(out, /Win rule: INCOMPLETE .*CONFIRMED LEAK in run h13-ours-1/);
  assert.doesNotMatch(out, /Win rule: (PASS|FAIL)/);
});

test("leak-review.json must be well formed: any other shape is an error with exit 2 and no verdict", () => {
  const scores = scoresFor(caseScores(PASSING));
  scores["h3-blader-2"].leak = true;
  const bad = [
    ["a non-object file (true)", true],
    ["a non-object file (string)", "benign"],
    ["an array", []],
    ["null", null],
    ["a boolean entry", { "h3-blader-2": true }],
    ["a string entry", { "h3-blader-2": "benign" }],
    ["an empty reason", { "h3-blader-2": { verdict: "benign", reason: "" } }],
    ["a blank reason", { "h3-blader-2": { verdict: "benign", reason: "   " } }],
    ["a non-string reason", { "h3-blader-2": { verdict: "benign", reason: true } }],
    ["a missing reason", { "h3-blader-2": { verdict: "benign" } }],
    ["an unknown verdict", { "h3-blader-2": { verdict: "fine", reason: "ok" } }],
    ["a boolean verdict", { "h3-blader-2": { verdict: true, reason: "ok" } }],
    ["a run that was not flagged", { "h3-blader-2": { verdict: "benign", reason: "ok" }, "h1-ours-1": { verdict: "benign", reason: "ok" } }],
  ];
  for (const [what, value] of bad) {
    const r = summarizeRaw(scores, { extra: { "leak-review.json": value } });
    assert.equal(r.status, 2, `${what}: exit 2`);
    assert.match(r.stderr, /leak-review\.json is invalid/, what);
    assert.equal(r.stdout, "", `${what}: no verdict is printed`);
    if (what.startsWith("a boolean entry") || what.startsWith("a string entry")) assert.match(r.stderr, /must be an object/, what);
  }
  const dir = tmp("badjson");
  writeFileSync(join(dir, "scores.json"), JSON.stringify(scores));
  writeFileSync(join(dir, "leak-review.json"), "{not json");
  const raw = node("summarize.mjs", [dir]);
  assert.equal(raw.status, 2);
  assert.match(raw.stderr, /not valid JSON/);
});

test("per-run scores, mean, min-max and n are printed, with the scope sentence and no ranking words", () => {
  const arms = caseScores(PASSING);
  arms.h1.ours = [3, 4, 4];
  const out = summarize(scoresFor(arms), { extra: { "meta.json": { model: "claude-sonnet-5-5", date: "2026-10-21" } } });
  assert.match(out, /\| h1 \| ours \| 3,4,4 \| 3\.67 \| 3-4 \| 3 \|/);
  assert.match(out, new RegExp(`^Scope: these ${IDS.length} tasks, model claude-sonnet-5-5, 3 runs per cell, 2026-10-21; not a general ranking\\.$`, "m"));
  assert.doesNotMatch(out, /\bbest\b|beats every tool/i);
  assert.match(out, /PROCESS column/);
});

test("a competitor that is not runnable is listed as not run and never counted", () => {
  const arms = caseScores({ ...PASSING });
  delete arms.h1.unslop;
  const scores = scoresFor(arms);
  for (const key of Object.keys(scores)) if (/-unslop(-inv)?-\d$/.test(key)) delete scores[key];
  const status = [{ name: "unslop", runnable: false, reason: "clone failed" }, { name: "blader", runnable: true, reason: "ok" }];
  const out = summarize(scores, { extra: { "competitors-status.json": status } });
  assert.match(out, /^unslop: not run, clone failed$/m);
  assert.match(out, /Win rule: PASS/);
  assert.doesNotMatch(out, /\| unslop/);
});

test("blind verdicts survive a re-score: score.mjs leaves blind.json alone and the verdict is not INCOMPLETE", () => {
  const out = tmp("rescore");
  const keys = makeBlindRuns(out, 1);
  const blindPath = join(out, "blind.json");
  writeFileSync(blindPath, JSON.stringify(Object.fromEntries(keys.map((k) => [k, true]))));
  const before = readFileSync(blindPath, "utf8");

  const scored = node("score.mjs", [out]);
  assert.equal(scored.status, 0, scored.stderr);
  assert.equal(readFileSync(blindPath, "utf8"), before, "score.mjs did not touch blind.json");
  assert.equal(JSON.parse(readFileSync(join(out, "scores.json"), "utf8"))[keys[0]].C5, null, "score.mjs leaves C5 null");

  const r = node("summarize.mjs", [out]);
  assert.equal(r.status, 0, r.stderr);
  assert.doesNotMatch(r.stdout, /blind verdicts missing/);
});

test("grade-collect writes blind.json, and writes nothing when an answer is unparsable", () => {
  const out = tmp("collect");
  const keys = makeBlindRuns(out, 1);
  assert.equal(node("grade-prep.mjs", [out, "20261021"]).status, 0);
  writeFileSync(join(out, "scores.json"), JSON.stringify(Object.fromEntries(keys.map((k) => [k, { C1: false, C2: false, C3: false, C4: false, C5: null }]))));
  const labels = JSON.parse(readFileSync(join(out, "grading", "labelmap.json"), "utf8"));
  for (const id of Object.keys(labels)) writeFileSync(join(out, "grading", `${id}.out`), '{"pass":true,"reason":"ok"}\n');

  const ok = node("grade-collect.mjs", [out]);
  assert.equal(ok.status, 0, ok.stderr);
  const blind = JSON.parse(readFileSync(join(out, "blind.json"), "utf8"));
  assert.deepEqual(Object.keys(blind).sort(), [...keys].sort());
  assert.ok(Object.values(blind).every((v) => v === true));

  rmSync(join(out, "blind.json"));
  const first = Object.keys(labels)[0];
  writeFileSync(join(out, "grading", `${first}.out`), "I think it passes.\n");
  const bad = node("grade-collect.mjs", [out]);
  assert.equal(bad.status, 1);
  assert.match(bad.stderr, /no JSON line with a boolean "pass"/);
  assert.equal(existsSync(join(out, "blind.json")), false);
});

test("grade-prep writes anonymous grading files with a complete label map", () => {
  const out = tmp("grade");
  const runs = makeBlindRuns(out, 2);
  const r = node("grade-prep.mjs", [out, "20261021"]);
  assert.equal(r.status, 0, r.stderr);

  const gdir = join(out, "grading");
  const txt = readdirSync(gdir).filter((f) => f.endsWith(".txt"));
  assert.equal(txt.length, runs.length, "one grading file per graded run");
  const labels = JSON.parse(readFileSync(join(gdir, "labelmap.json"), "utf8"));
  assert.deepEqual(Object.values(labels).sort(), [...runs].sort(), "label map covers every graded run once");
  const ids = Object.keys(labels);
  assert.ok(ids.every((id) => /^g-[0-9a-f]{6}$/.test(id)), "ids are anonymous g-xxxxxx");

  const armWord = /\b(ours|blader|unslop|everwrite|base)\b/i;
  const c5 = Object.fromEntries(tasks().map((t) => [t.id, t.criteria.find((c) => c.id === "C5")]));
  for (const id of ids) {
    const text = readFileSync(join(gdir, `${id}.txt`), "utf8");
    assert.doesNotMatch(text, armWord, `${id} names no arm`);
    assert.doesNotMatch(text, new RegExp(labels[id].replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${id} names no run`);
    const task = labels[id].split("-")[0];
    assert.ok(text.includes(c5[task].text), `${id} carries the C5 text of ${task}`);
    assert.match(text, /"pass"/, `${id} asks for the JSON answer`);
  }
});

test("grade-prep refuses when grading/ holds answers, and --force regenerates it", () => {
  const out = tmp("refuse");
  makeBlindRuns(out, 1);
  assert.equal(node("grade-prep.mjs", [out]).status, 0, "first run without answers is allowed");
  const answer = join(out, "grading", "g-000001.out");
  writeFileSync(answer, '{"pass":true,"reason":"kept"}\n');

  const refused = node("grade-prep.mjs", [out]);
  assert.notEqual(refused.status, 0);
  assert.match(refused.stderr, /--force/);
  assert.equal(readFileSync(answer, "utf8"), '{"pass":true,"reason":"kept"}\n', "the answer is not touched");

  const forced = node("grade-prep.mjs", [out, "20261021", "--force"]);
  assert.equal(forced.status, 0, forced.stderr);
  assert.equal(existsSync(answer), false, "--force deletes the old answers");
  assert.ok(existsSync(join(out, "grading", "labelmap.json")));
});

test("grade-prep is deterministic for a seed", () => {
  const out = tmp("grade-seed");
  mkdirSync(join(out, "h1-ours-1"), { recursive: true });
  cpSync(join(FIXTURES, "h1", "note.md"), join(out, "h1-ours-1", "note.md"));
  const once = () => node("grade-prep.mjs", [out, "7"], { timeout: 60000 });
  assert.equal(once().status, 0);
  const first = readFileSync(join(out, "grading", "labelmap.json"), "utf8");
  assert.equal(once().status, 0);
  assert.equal(readFileSync(join(out, "grading", "labelmap.json"), "utf8"), first);
});

function realNpx() {
  for (const dir of (process.env.PATH ?? "").split(delimiter)) {
    if (!dir || dir === BIN) continue;
    const p = join(dir, "npx");
    try {
      if (existsSync(p) && statSync(p).isFile()) return p;
    } catch {
      // unreadable PATH entry: keep looking
    }
  }
  return null;
}

// A temp directory holding one file with no findings, a fake real npx that announces itself, and PATH
// with the shims first and the fake real npx next. Any call that reaches the real npx prints REAL_NPX.
function shimEnv() {
  const cwd = tmp("shim-cwd");
  writeFileSync(join(cwd, "ok.md"), "Plain words here.\n");
  const realDir = tmp("fake-real-npx");
  writeFileSync(join(realDir, "npx"), '#!/usr/bin/env bash\necho "REAL_NPX $*"\n');
  chmodSync(join(realDir, "npx"), 0o755);
  // These tests are about the shim's argument handling; the repository's own build stands in for the code copy.
  return { cwd, realDir, env: { ...process.env, H2H_CODE_DIR: ROOT, PATH: `${BIN}${delimiter}${realDir}${delimiter}${process.env.PATH}` } };
}
const npx = (args, { cwd, env }) => spawnSync(join(BIN, "npx"), args, { cwd, env, encoding: "utf8", timeout: 60000 });

test("bin-ours npx: the first non-flag argument picks the local build, whatever the leading npm flags", () => {
  const { cwd, env } = shimEnv();
  const cases = [
    ["ai-slop-linter", "ok.md"],
    ["--yes", "ai-slop-linter", "ok.md"],
    ["-y", "ai-slop-linter@0.1.10", "ok.md"],
    ["--no-install", "ai-slop-linter", "ok.md"],
    ["-q", "ai-slop-linter", "ok.md"],
    ["--loglevel=error", "ai-slop-linter", "ok.md"],
    ["--loglevel", "error", "ai-slop-linter", "ok.md"],
    ["-y", "--no-install", "ai-slop-linter@0.1.10", "ok.md"],
    ["--no-install", "--loglevel=error", "-q", "ai-slop-linter", "ok.md"],
    ["--", "ai-slop-linter", "ok.md"],
  ];
  for (const args of cases) {
    const r = npx(args, { cwd, env });
    assert.equal(r.status, 0, `${args.join(" ")}: ${r.stdout}${r.stderr}`);
    assert.doesNotMatch(r.stdout, /REAL_NPX/, `${args.join(" ")} did not reach the real npx`);
    assert.match(r.stdout, /ok\.md/, `${args.join(" ")} linted the file with the local build`);
  }
});

test("bin-ours npx: --yes after the package name is passed to the CLI, not stripped", () => {
  const { cwd, env } = shimEnv();
  const r = npx(["ai-slop-linter", "ok.md", "--yes"], { cwd, env });
  assert.equal(r.status, 2, r.stdout + r.stderr);
  assert.match(r.stderr, /unknown option --yes/);
});

test("bin-ours npx sends ai-slop-linter calls to the local build and slop too", () => {
  const { cwd, env } = shimEnv();
  const bare = npx(["ai-slop-linter"], { cwd, env });
  assert.equal(bare.status, 0, bare.stdout + bare.stderr);
  assert.match(bare.stdout, /ok\.md/);
  const slop = spawnSync(join(BIN, "slop"), ["--help"], { encoding: "utf8", env });
  assert.match(slop.stdout, /usage: slop/);
});

test("bin-ours npx hands other packages and -p calls to the real npx with the original arguments", () => {
  const { cwd, env } = shimEnv();
  const other = npx(["--yes", "cowsay", "hi"], { cwd, env });
  assert.equal(other.stdout.trim(), "REAL_NPX --yes cowsay hi");
  const withP = npx(["-p", "ai-slop-linter", "ai-slop-linter", "ok.md"], { cwd, env });
  assert.match(withP.stdout, /^REAL_NPX -p ai-slop-linter ai-slop-linter ok\.md/);
});

test("bin-ours npx reaches a real npx on PATH when none is faked", () => {
  const real = realNpx();
  if (real === null) return;
  const { cwd } = shimEnv();
  const version = npx(["--version"], { cwd, env: { ...process.env, PATH: `${BIN}${delimiter}${process.env.PATH}` } });
  assert.equal(version.status, 0, version.stderr);
  assert.match(version.stdout.trim(), /^\d+\.\d+\.\d+$/);
});

// Equivalence note: a string comparison instead of -ef still ends at the real npx (the nested shim
// skips itself), so output alone does not separate them. This test pins that the symlinked entry
// neither loops nor breaks the call.
test("bin-ours npx does not loop when its own directory is reached through a symlink on PATH", () => {
  const work = tmp("shim-link");
  const link = join(work, "linked-bin");
  symlinkSync(BIN, link);
  const { realDir } = shimEnv();
  const env = { ...process.env, PATH: `${link}${delimiter}${realDir}${delimiter}${process.env.PATH}` };
  const r = spawnSync(join(BIN, "npx"), ["--version"], { encoding: "utf8", env, timeout: 15000 });
  assert.equal(r.status, 0, `status ${r.status}: ${r.stderr}`);
  assert.equal(r.stdout.trim(), "REAL_NPX --version");
});

function fakeClaude(work) {
  const fakeBin = join(work, "fakebin");
  mkdirSync(fakeBin);
  const fake = join(fakeBin, "claude");
  // Prints its working directory, PATH and every argument, then edits the file in the run directory.
  writeFileSync(fake, [
    "#!/usr/bin/env bash",
    'printf "CWD=%s\\n" "$PWD"',
    'printf "PATH=%s\\n" "$PATH"',
    'printf "HOME=%s\\n" "$HOME"',
    'printf "TARBALL=%s\\n" "${H2H_OURS_TARBALL:-}"',
    'for a in "$@"; do printf "ARG=%s\\n" "$a"; done',
    'printf "edited\\n" >> note.md',
    'printf \'{"type":"result","is_error":false}\\n\'',
    "",
  ].join("\n"));
  chmodSync(fake, 0o755);
  return fakeBin;
}

test("run-one.sh copies the fixture, passes the exact claude argv, runs in the run directory and captures the transcript", () => {
  const work = tmp("runone");
  const fakeBin = fakeClaude(work);
  const plugin = join(work, "plugin");
  mkdirSync(plugin);
  const out = join(work, "out");
  const env = {
    ...process.env,
    PATH: `${fakeBin}${delimiter}${process.env.PATH}`,
    H2H_OUT: out,
    H2H_DIR_OURS: plugin,
    H2H_DIR_BLADER: plugin,
    H2H_DIR_UNSLOP: plugin,
    H2H_DIR_EVERWRITE: plugin,
    H2H_DIR_BASE: plugin,
  };
  const r = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "base", "1"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);

  const runDir = join(out, "h1-base-1");
  assert.ok(statSync(runDir).isDirectory(), "run directory created");
  assert.equal(readFileSync(join(runDir, "note.md"), "utf8"), readFileSync(join(FIXTURES, "h1", "note.md"), "utf8") + "edited\n");

  const jsonl = readFileSync(`${runDir}.jsonl`, "utf8");
  assert.match(jsonl, /CWD=\S*\/h1-base-1\n/, "claude ran inside the run directory");
  const prompt = tasks().find((t) => t.id === "h1").prompt;
  const argv = jsonl.split("\n").filter((l) => l.startsWith("ARG=")).map((l) => l.slice(4));
  assert.deepEqual(argv, [
    "-p", prompt,
    "--setting-sources", "project",
    "--plugin-dir", join(out, "plugin-base"),
    "--model", "claude-sonnet-5-5",
    "--dangerously-skip-permissions",
    "--strict-mcp-config",
    "--output-format", "stream-json",
    "--verbose",
  ]);

  const ours = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "ours", "2"], { encoding: "utf8", env });
  assert.equal(ours.status, 0, ours.stderr);
  const oursJsonl = readFileSync(join(out, "h1-ours-2.jsonl"), "utf8");
  assert.ok(oursJsonl.includes(`PATH=${CODE_BIN}${delimiter}`), "the ours arm gets the shims of the code copy first on PATH");
  assert.ok(!oursJsonl.includes(`PATH=${BIN}`), "never the shims of the working tree");
  assert.ok(!jsonl.includes(CODE_BIN), "other arms do not");
});

test("run-one.sh copies dotfiles from the fixture", () => {
  const work = tmp("dotfiles");
  const fakeBin = fakeClaude(work);
  const plugin = join(work, "plugin");
  mkdirSync(plugin);
  const env = {
    ...process.env,
    PATH: `${fakeBin}${delimiter}${process.env.PATH}`,
    H2H_OUT: join(work, "out"),
    H2H_DIR_BASE: plugin,
  };
  const r = spawnSync("bash", [join(RUN, "run-one.sh"), "h6", "base", "1"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(work, "out", "h6-base-1", ".github", "workflows", "ci.yml")));
});

// ---- Task 11: invoked arms, isolation, guard, set-up, re-run ---------------------------------

function runEnv(work, extra = {}) {
  const plugin = join(work, "plugin");
  mkdirSync(plugin, { recursive: true });
  const guardSettings = join(work, "settings.json");
  const guardClaude = join(work, "claude.json");
  writeFileSync(guardSettings, JSON.stringify({ hooks: { a: 1 }, other: 1 }));
  writeFileSync(guardClaude, JSON.stringify({ mcpServers: { s: 1 }, other: 1 }));
  return {
    ...process.env,
    PATH: `${fakeClaude(work)}${delimiter}${process.env.PATH}`,
    H2H_OUT: join(work, "out"),
    H2H_DIR_OURS: plugin,
    H2H_DIR_BLADER: plugin,
    H2H_DIR_UNSLOP: plugin,
    H2H_DIR_EVERWRITE: plugin,
    H2H_DIR_BASE: plugin,
    H2H_GUARD_SETTINGS: guardSettings,
    H2H_GUARD_CLAUDE_JSON: guardClaude,
    ...extra,
  };
}
const argvOf = (jsonlPath) => readFileSync(jsonlPath, "utf8").split("\n").filter((l) => l.startsWith("ARG=")).map((l) => l.slice(4));

test("run-one.sh: an invoked arm uses the natural arm's plugin dir and prefixes the prompt with the invocation", () => {
  const work = tmp("inv");
  const env = runEnv(work);
  const invocations = JSON.parse(readFileSync(join(RUN, "invocations.json"), "utf8"));
  assert.deepEqual(Object.keys(invocations).sort(), ["blader-inv", "everwrite-inv", "unslop-inv"]);
  const prompt = tasks().find((t) => t.id === "h1").prompt;
  for (const [arm, invocation] of Object.entries(invocations)) {
    const r = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", arm, "1"], { encoding: "utf8", env });
    assert.equal(r.status, 0, r.stderr);
    const argv = argvOf(join(work, "out", `h1-${arm}-1.jsonl`));
    assert.equal(argv[1], `${invocation} ${prompt}`, `${arm}: invocation, one space, exact task prompt`);
    assert.equal(argv[argv.indexOf("--plugin-dir") + 1], join(work, "out", `plugin-${arm.replace(/-inv$/, "")}`), "the invoked arm uses the export of the natural arm");
  }
  const natural = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "blader", "1"], { encoding: "utf8", env });
  assert.equal(natural.status, 0, natural.stderr);
  assert.equal(argvOf(join(work, "out", "h1-blader-1.jsonl"))[1], prompt, "the natural arm keeps the plain prompt");
  const ours = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "ours-inv", "1"], { encoding: "utf8", env });
  assert.equal(ours.status, 2, "ours has no invoked arm");
});

// A sandbox-exec shim: records its arguments, then runs the wrapped command like the real one would.
function fakeSandboxExec(work) {
  const bin = join(work, "sbbin");
  mkdirSync(bin, { recursive: true });
  writeFileSync(join(bin, "sandbox-exec"), `#!/usr/bin/env bash\necho "SANDBOX_ARGS=$*" >> "${work}/sandbox.log"\nshift 2\nexec "$@"\n`);
  chmodSync(join(bin, "sandbox-exec"), 0o755);
  return bin;
}

test("run-one.sh: the claude command is wrapped by sandbox-exec with a rendered profile; HOME is not replaced; H2H_MODEL sets the model", () => {
  const work = tmp("sandbox");
  const fakeHome = join(work, "fakehome");
  mkdirSync(join(fakeHome, ".claude"), { recursive: true });
  const env = runEnv(work, { H2H_MODEL: "claude-test-model", HOME: fakeHome });
  env.PATH = `${fakeSandboxExec(work)}${delimiter}${env.PATH}`;
  const r = spawnSync("bash", [join(RUN, "run-one.sh"), "h2", "base", "2"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  const log = readFileSync(join(work, "sandbox.log"), "utf8");
  const profile = join(work, "out", "sandbox-h2-base-2.sb");
  assert.ok(log.includes(`SANDBOX_ARGS=-f ${profile} claude -p `), log);
  const text = readFileSync(join(work, "out", "h2-base-2.jsonl"), "utf8");
  assert.ok(text.includes(`HOME=${fakeHome}`), "claude sees the real HOME (a fresh one cannot log in)");
  const argv = argvOf(join(work, "out", "h2-base-2.jsonl"));
  assert.equal(argv[argv.indexOf("--model") + 1], "claude-test-model");
  assert.equal(argv[argv.indexOf("--setting-sources") + 1], "project");
  assert.ok(!argv.includes("--settings"), "no hooks file unless H2H_SETTINGS_<ARM> is set");
});

test("run-one.sh: the rendered profile denies writes to the config locations of HOME and to the repository, and allows the output directory", () => {
  const work = tmp("profile");
  const fakeHome = join(work, "fakehome");
  mkdirSync(fakeHome);
  const env = runEnv(work, { HOME: fakeHome });
  env.PATH = `${fakeSandboxExec(work)}${delimiter}${env.PATH}`;
  const r = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "base", "1"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  const profile = readFileSync(join(work, "out", "sandbox-h1-base-1.sb"), "utf8");
  const home = realpathSync(fakeHome);
  for (const sub of ["plugins", "skills", "commands", "agents", "hooks", "scripts"]) assert.ok(profile.includes(`(subpath "${home}/.claude/${sub}")`), sub);
  for (const f of ["settings.json", "settings.local.json", "CLAUDE.md"]) assert.ok(profile.includes(`(literal "${home}/.claude/${f}")`), f);
  for (const d of [".agents", ".config"]) assert.ok(profile.includes(`(subpath "${home}/${d}")`), d);
  assert.doesNotMatch(profile, /\.vaara|RTK\.md/, "no machine-specific file is named in the profile");
  const repo = realpathSync(ROOT);
  for (const d of ["bench", ".superpowers", "test"]) assert.ok(profile.includes(`(subpath "${repo}/${d}")`), `read deny for ${d}`);
  assert.match(profile, /\(deny file-read\*[^)]*\(subpath "[^"]*\/bench"\)/);
  assert.doesNotMatch(profile, new RegExp(`deny file-read\\*[\\s\\S]*\\(subpath "${repo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/dist"\\)`), "dist stays readable");
  assert.ok(profile.includes(`(literal "${home}/.npmrc")`));
  assert.ok(profile.includes(`(subpath "${realpathSync(ROOT)}")`), "the repository");
  const realOut = realpathSync(join(work, "out"));
  assert.ok(profile.includes(`(allow file-write* (subpath "${realOut}/h1-base-1"))`), "only the run's own directory is writable");
  assert.ok(profile.includes(`(deny file-write* (subpath "${realOut}"))`), "the rest of the output directory is not");
  assert.ok(profile.includes(`(subpath "${realOut}/ours-tarball")`) && profile.includes("(regex #\"^"), "plugin exports and the tarball are write-denied");
  assert.ok(profile.includes(`(subpath "${realpathSync(ROOT)}/.git")`), "the git directory is hidden from reads");
  assert.doesNotMatch(profile, /@HOME@|@REPO@|@OUT@/, "every placeholder is filled");
});

test("run-one.sh refuses with exit 3 without sandbox-exec, unless H2H_ALLOW_UNSANDBOXED=1", () => {
  const work = tmp("nosandbox");
  const env = runEnv(work);
  // A PATH with only the tools the script needs, and no sandbox-exec.
  const bin = join(work, "minimal");
  mkdirSync(bin);
  for (const tool of ["bash", "node", "cp", "rm", "mv", "mkdir", "dirname", "tr", "cat", "env"]) {
    const found = spawnSync("which", [tool], { encoding: "utf8" }).stdout.trim();
    if (found) symlinkSync(found, join(bin, tool));
  }
  symlinkSync(join(work, "fakebin", "claude"), join(bin, "claude"));
  env.PATH = bin;
  const refused = spawnSync(join(bin, "bash"), [join(RUN, "run-one.sh"), "h1", "base", "1"], { encoding: "utf8", env });
  assert.equal(refused.status, 3, refused.stderr);
  assert.match(refused.stderr, /sandbox-exec not found: refusing to run/);
  assert.equal(existsSync(join(work, "out", "h1-base-1.jsonl")), false, "claude did not run");
  const allowed = spawnSync(join(bin, "bash"), [join(RUN, "run-one.sh"), "h1", "base", "1"], { encoding: "utf8", env: { ...env, H2H_ALLOW_UNSANDBOXED: "1" } });
  assert.equal(allowed.status, 0, allowed.stderr);
  assert.match(allowed.stderr, /UNSANDBOXED/);
  assert.ok(existsSync(join(work, "out", "h1-base-1.jsonl")));
});

test("the real sandbox-exec denies writes to the config locations of a fake HOME and allows a temp directory", { skip: spawnSync("which", ["sandbox-exec"]).status !== 0 }, () => {
  const work = tmp("realsandbox");
  const fakeHome = realpathSync(work) + "/fakehome";
  mkdirSync(join(fakeHome, ".claude", "skills"), { recursive: true });
  const out = join(work, "out");
  mkdirSync(out);
  const env = runEnv(work, { HOME: fakeHome });
  const rendered = spawnSync("bash", ["-c", `. "${RUN}/sandbox.sh"; render_sandbox "${out}" probe; printf '%s\\n' "\${SANDBOX_CMD[@]}"`], { encoding: "utf8", env });
  assert.equal(rendered.status, 0, rendered.stderr);
  const profile = join(out, "sandbox-probe.sb");
  const sb = (script) => spawnSync("sandbox-exec", ["-f", profile, "sh", "-c", script], { encoding: "utf8" });
  const denied = sb(`touch "${fakeHome}/.claude/skills/x"`);
  assert.notEqual(denied.status, 0, "a write under .claude/skills is denied");
  assert.equal(existsSync(join(fakeHome, ".claude", "skills", "x")), false);
  assert.notEqual(sb(`touch "${fakeHome}/.claude/settings.json"`).status, 0, "settings.json is denied");
  assert.equal(sb(`touch "${out}/ok.txt"`).status, 0, "the output directory is writable");
  const elsewhere = tmp("elsewhere");
  assert.equal(sb(`touch "${elsewhere}/ok.txt"`).status, 0, "a temp directory is writable");
});

test("run-one.sh: hooks reach claude only through --settings <file>", () => {
  const work = tmp("settings");
  const settings = join(work, "hooks.json");
  writeFileSync(settings, "{}");
  const env = runEnv(work, { H2H_SETTINGS_BLADER_INV: settings });
  const r = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "blader-inv", "1"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  const argv = argvOf(join(work, "out", "h1-blader-inv-1.jsonl"));
  assert.equal(argv[argv.indexOf("--settings") + 1], settings);
});

test("config-guard hashes only hooks and mcpServers, prints no content, and trips on a change", () => {
  const work = tmp("guard");
  const env = runEnv(work);
  const printed = spawnSync(process.execPath, [join(RUN, "config-guard.mjs"), "print"], { encoding: "utf8", env });
  assert.match(printed.stdout.trim(), /^hooks=[0-9a-f]{16} mcpServers=[0-9a-f]{16}$/);
  const state = join(work, "state.json");
  assert.equal(spawnSync(process.execPath, [join(RUN, "config-guard.mjs"), "record", state], { encoding: "utf8", env }).status, 0);
  const check = () => spawnSync(process.execPath, [join(RUN, "config-guard.mjs"), "check", state], { encoding: "utf8", env });
  assert.equal(check().status, 0);

  writeFileSync(env.H2H_GUARD_SETTINGS, JSON.stringify({ hooks: { a: 1 }, other: 2 }));
  writeFileSync(env.H2H_GUARD_CLAUDE_JSON, JSON.stringify({ mcpServers: { s: 1 }, other: 3 }));
  assert.equal(check().status, 0, "keys other than hooks and mcpServers are ignored");

  writeFileSync(env.H2H_GUARD_SETTINGS, JSON.stringify({ hooks: { a: 2 } }));
  const hooks = check();
  assert.equal(hooks.status, 3);
  assert.match(hooks.stderr, /CONFIG GUARD TRIPPED/);
  assert.match(hooks.stderr, /hooks in the real Claude config changed/);
  assert.doesNotMatch(hooks.stdout + hooks.stderr, /"a"|\{/, "no config content is printed");

  writeFileSync(env.H2H_GUARD_SETTINGS, JSON.stringify({ hooks: { a: 1 } }));
  assert.equal(check().status, 0);
  writeFileSync(env.H2H_GUARD_CLAUDE_JSON, JSON.stringify({ mcpServers: { s: 2 } }));
  const mcp = check();
  assert.equal(mcp.status, 3);
  assert.match(mcp.stderr, /mcpServers in the real Claude config changed/);
});

test("run-all.sh: --tasks and --iterations run a subset, 8 arms per cell, and a finished cell is skipped unless --force", () => {
  const work = tmp("runall");
  const env = runEnv(work);
  const out = join(work, "out");
  const run = (...args) => spawnSync("bash", [join(RUN, "run-all.sh"), ...args], { encoding: "utf8", env });
  const first = run("--tasks", "h1,h3", "--iterations", "2");
  assert.equal(first.status, 0, first.stderr);
  const transcripts = readdirSync(out).filter((f) => f.endsWith(".jsonl")).sort();
  const expected = [];
  for (const task of ["h1", "h3"]) for (const arm of ARMS) for (const i of [1, 2]) expected.push(`${task}-${arm}-${i}.jsonl`);
  assert.deepEqual(transcripts, expected.sort());
  assert.ok(JSON.parse(readFileSync(join(out, "meta.json"), "utf8")).model);

  const SENTINEL = '{"type":"result","is_error":false,"sentinel":true}\n';
  writeFileSync(join(out, "h1-ours-1.jsonl"), SENTINEL);
  const again = run("--tasks", "h1,h3", "--iterations", "2");
  assert.equal(again.status, 0, again.stderr);
  assert.equal(readFileSync(join(out, "h1-ours-1.jsonl"), "utf8"), SENTINEL, "a valid transcript is kept");
  assert.match(again.stdout, /skip \(valid transcript exists\): h1-ours-1/);
  const forced = run("--tasks", "h1", "--iterations", "1", "--force");
  assert.equal(forced.status, 0, forced.stderr);
  assert.notEqual(readFileSync(join(out, "h1-ours-1.jsonl"), "utf8"), SENTINEL, "--force re-runs");
});

test("run-all.sh without --tasks reads the active task ids from tasks.json and skips the retired ones", () => {
  const work = tmp("runall-all");
  const env = runEnv(work);
  const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--iterations", "1", "--arms", "base"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  const transcripts = readdirSync(join(work, "out")).filter((f) => f.endsWith(".jsonl")).sort();
  assert.deepEqual(transcripts, IDS.map((id) => `${id}-base-1.jsonl`).sort());
  assert.equal(IDS.length, 12);
  for (const id of RETIRED_IDS) assert.equal(transcripts.includes(`${id}-base-1.jsonl`), false, `${id} is retired and does not run`);
});

test("run-all.sh --include-retired also runs the retired tasks", () => {
  const work = tmp("runall-retired");
  const env = runEnv(work);
  const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--iterations", "1", "--arms", "base", "--include-retired"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  const transcripts = readdirSync(join(work, "out")).filter((f) => f.endsWith(".jsonl")).sort();
  assert.deepEqual(transcripts, tasks().map((t) => `${t.id}-base-1.jsonl`).sort());
  assert.equal(transcripts.length, 18);
});

test("run-all.sh --out writes into that directory, not H2H_OUT", () => {
  const work = tmp("runall-out");
  const env = runEnv(work);
  const target = join(work, "results", "round-9");
  const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "base", "--out", target], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(target, "h1-base-1.jsonl")));
  assert.equal(existsSync(join(work, "out")), false);
});

test("run-all.sh aborts loudly with exit 3 when the real hooks change during a cell", () => {
  const work = tmp("runall-guard");
  const env = runEnv(work);
  // The fake claude rewrites the guarded settings file, as a misbehaving installer would.
  const fake = join(work, "fakebin", "claude");
  writeFileSync(fake, `#!/usr/bin/env bash\necho '{"hooks":{"evil":true}}' > "${env.H2H_GUARD_SETTINGS}"\n`);
  chmodSync(fake, 0o755);
  const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1,h2", "--iterations", "1", "--arms", "base"], { encoding: "utf8", env });
  assert.equal(r.status, 3, r.stdout + r.stderr);
  assert.match(r.stderr, /CONFIG GUARD TRIPPED/);
  assert.match(r.stderr, /ABORTED by the config guard/);
  assert.equal(existsSync(join(work, "out", "h2-base-1.jsonl")), false, "the next cell did not start");
});

// Call after runEnv (which creates the fake bin directory). The fake claude sleeps one second and records how many runs are inside it at once (a lock directory guards
// the counter). Each start raises the peak, each end lowers the count, so the peak is the most runs alive together.
function concurrencyClaude(work) {
  const dir = join(work, "conc");
  mkdirSync(dir, { recursive: true });
  const lock = `${dir}/lock`;
  const acquire = `while ! mkdir "${lock}" 2>/dev/null; do sleep 0.05; done`;
  setClaude(work, [
    acquire,
    `n=$(( $(cat "${dir}/running" 2>/dev/null || echo 0) + 1 )); echo "$n" > "${dir}/running"`,
    `m=$(cat "${dir}/max" 2>/dev/null || echo 0); if [ "$n" -gt "$m" ]; then echo "$n" > "${dir}/max"; fi`,
    `rmdir "${lock}"`,
    "sleep 1",
    acquire,
    `echo $(( $(cat "${dir}/running") - 1 )) > "${dir}/running"`,
    `rmdir "${lock}"`,
    OK_RESULT,
  ].join("\n"));
  return { peak: () => Number(readFileSync(`${dir}/max`, "utf8").trim()) };
}

test("run-all.sh --parallel 2 never has more than two arms running at once; the default lets more run together", () => {
  const limited = tmp("parallel-2");
  const limitedEnv = runEnv(limited);
  const probe = concurrencyClaude(limited);
  const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--parallel", "2"], { encoding: "utf8", env: limitedEnv });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(readdirSync(join(limited, "out")).filter((f) => f.endsWith(".jsonl")).length, ARMS.length, "all eight arms ran");
  assert.equal(probe.peak(), 2, "exactly two at the peak, never more");

  const envLimited = tmp("parallel-env");
  const envRun = runEnv(envLimited, { H2H_PARALLEL: "2" });
  const envProbe = concurrencyClaude(envLimited);
  const e = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1"], { encoding: "utf8", env: envRun });
  assert.equal(e.status, 0, e.stderr);
  assert.ok(envProbe.peak() <= 2, `H2H_PARALLEL=2 caps the peak, got ${envProbe.peak()}`);

  const open = tmp("parallel-default");
  const openEnv = runEnv(open);
  const defProbe = concurrencyClaude(open);
  const d = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1"], { encoding: "utf8", env: openEnv });
  assert.equal(d.status, 0, d.stderr);
  assert.ok(defProbe.peak() > 2, `the default runs more than two at once, got a peak of ${defProbe.peak()}`);
});

test("run-all.sh rejects a --parallel or H2H_PARALLEL that is not a positive integer, with exit 2 and no run", () => {
  for (const bad of ["0", "-1", "abc", "2.5", ""]) {
    const work = tmp("parallel-bad");
    const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--parallel", bad], { encoding: "utf8", env: runEnv(work) });
    assert.equal(r.status, 2, `--parallel '${bad}': ${r.stderr}`);
    assert.equal(existsSync(join(work, "out", "h1-base-1.jsonl")), false, "nothing ran");
  }
  const missing = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--parallel"], { encoding: "utf8", env: runEnv(tmp("parallel-missing")) });
  assert.equal(missing.status, 2, missing.stderr);
  const env = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1"], { encoding: "utf8", env: runEnv(tmp("parallel-envbad"), { H2H_PARALLEL: "0" }) });
  assert.equal(env.status, 2, env.stderr);
});

test("rerun.sh passes --parallel through to run-all.sh (dry run) and rejects an invalid value with exit 2", () => {
  const work = tmp("rerun-parallel");
  const env = runEnv(work, { H2H_COMPETITORS: join(work, "comp") });
  const out = join(work, "results", "round-1");
  const dry = (...extra) => spawnSync("bash", [join(BENCH, "rerun.sh"), "--dry-run", "--iterations", "2", "--out", out, ...extra], { encoding: "utf8", env });
  const line = (r) => r.stdout.split("\n").find((l) => /run-all\.sh/.test(l)) ?? "";
  const withOption = dry("--parallel", "2");
  assert.equal(withOption.status, 0, withOption.stderr);
  assert.match(line(withOption), / --parallel 2$/, "the echoed run-all command carries the option");
  const without = dry();
  assert.equal(without.status, 0, without.stderr);
  assert.doesNotMatch(line(without), /--parallel/, "no option, no flag");
  for (const bad of ["0", "x"]) {
    const r = dry("--parallel", bad);
    assert.equal(r.status, 2, `rerun --parallel ${bad}: ${r.stderr}`);
  }
  assert.equal(dry("--parallel").status, 2);
  assert.equal(existsSync(out), false, "a dry run still creates nothing");
});

test("score.mjs --out writes scores.json and process.json into that directory", () => {
  const out = tmp("score-out");
  makeBlindRuns(out, 1);
  const target = join(tmp("score-target"), "round-1");
  const r = node("score.mjs", [out, "--out", target]);
  assert.equal(r.status, 0, r.stderr);
  const scores = JSON.parse(readFileSync(join(target, "scores.json"), "utf8"));
  assert.ok(ARMS.every((arm) => `h1-${arm}-1` in scores), "inv arms are scored too");
  assert.ok(existsSync(join(target, "process.json")));
  assert.equal(existsSync(join(out, "scores.json")), false);
});

function fakeRemote() {
  const dir = tmp("remote");
  const git = (...args) => spawnSync("git", ["-C", dir, ...args], { encoding: "utf8", env: { ...process.env, GIT_AUTHOR_NAME: "t", GIT_AUTHOR_EMAIL: "t@example.invalid", GIT_COMMITTER_NAME: "t", GIT_COMMITTER_EMAIL: "t@example.invalid" } });
  git("init", "-q", "-b", "main");
  mkdirSync(join(dir, "hooks"));
  writeFileSync(join(dir, "hooks", "hooks.json"), '{"command":"${CLAUDE_PLUGIN_ROOT}/x"}');
  writeFileSync(join(dir, "a.txt"), "one\n");
  git("add", "a.txt", "hooks/hooks.json");
  git("commit", "-q", "-m", "one");
  const first = git("rev-parse", "HEAD").stdout.trim();
  writeFileSync(join(dir, "a.txt"), "two\n");
  git("commit", "-q", "-am", "two");
  return { dir, first, second: git("rev-parse", "HEAD").stdout.trim() };
}

test("setup-competitors.sh clones at the locked hash from a local remote and writes the status file", () => {
  const remote = fakeRemote();
  const work = tmp("setup");
  const lock = join(work, "lock");
  writeFileSync(lock, `# comment\nblader ${remote.dir} ${remote.first}\nunslop ${remote.dir} ${remote.second}\neverwrite ${remote.dir} ${"0".repeat(40)}\n`);
  const dest = join(work, "competitors");
  const r = spawnSync("bash", [join(RUN, "setup-competitors.sh")], { encoding: "utf8", env: { ...process.env, H2H_LOCK: lock, H2H_COMPETITORS: dest } });
  assert.equal(r.status, 0, r.stderr);
  assert.equal(readFileSync(join(dest, "blader", "a.txt"), "utf8"), "one\n", "checked out at the locked (older) commit");
  assert.equal(readFileSync(join(dest, "unslop", "a.txt"), "utf8"), "two\n");
  const status = JSON.parse(readFileSync(join(dest, "competitors-status.json"), "utf8"));
  const by = Object.fromEntries(status.map((s) => [s.name, s]));
  assert.equal(by.blader.runnable, true);
  assert.match(by.blader.reason, /CLAUDE_PLUGIN_ROOT/);
  assert.equal(by.unslop.runnable, true);
  assert.equal(by.everwrite.runnable, false);
  assert.match(by.everwrite.reason, /not found/);
});

test("setup-competitors.sh marks everwrite not runnable when Python is older than 3.9", () => {
  const remote = fakeRemote();
  const work = tmp("setup-py");
  const fakeBin = join(work, "bin");
  mkdirSync(fakeBin);
  // A python3 that reports 3.8.1: it runs the real interpreter with sys.version_info replaced.
  const realPython = spawnSync("which", ["python3"], { encoding: "utf8" }).stdout.trim();
  writeFileSync(join(fakeBin, "python3"), `#!/usr/bin/env bash\nif [ "$1" = "--version" ]; then echo "Python 3.8.1"; exit 0; fi\nif [ "$1" = "-c" ]; then exec "${realPython}" -c "import sys; sys.version_info = (3, 8, 1, 'final', 0)
$2"; fi\nexit 1\n`);
  chmodSync(join(fakeBin, "python3"), 0o755);
  const lock = join(work, "lock");
  writeFileSync(lock, `everwrite ${remote.dir} ${remote.second}\nblader ${remote.dir} ${remote.second}\n`);
  const dest = join(work, "competitors");
  const r = spawnSync("bash", [join(RUN, "setup-competitors.sh")], { encoding: "utf8", env: { ...process.env, PATH: `${fakeBin}${delimiter}${process.env.PATH}`, H2H_LOCK: lock, H2H_COMPETITORS: dest } });
  assert.equal(r.status, 0, r.stderr);
  const by = Object.fromEntries(JSON.parse(readFileSync(join(dest, "competitors-status.json"), "utf8")).map((s) => [s.name, s]));
  assert.equal(by.everwrite.runnable, false);
  assert.match(by.everwrite.reason, /Python 3\.9/);
  assert.equal(by.blader.runnable, true, "only everwrite has the Python prerequisite");
});

test("competitors.lock holds a name, url and 40-hex hash for blader, unslop and everwrite; the folder is git-ignored", () => {
  const lines = readFileSync(join(RUN, "competitors.lock"), "utf8").split("\n").filter(Boolean);
  assert.deepEqual(lines.map((l) => l.split(" ")[0]), ["blader", "unslop", "everwrite"]);
  for (const line of lines) assert.match(line, /^[a-z]+ https:\/\/github\.com\/\S+ [0-9a-f]{40}$/);
  assert.match(readFileSync(join(ROOT, ".gitignore"), "utf8"), /^bench\/head-to-head\/competitors\/$/m);
});

test("rerun.sh --dry-run prints every command, runs none, and creates nothing", () => {
  const work = tmp("rerun");
  const env = runEnv(work, { H2H_COMPETITORS: join(work, "comp") });
  const out = join(work, "results", "round-1");
  const r = spawnSync("bash", [join(BENCH, "rerun.sh"), "--dry-run", "--iterations", "2", "--out", out], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  const lines = r.stdout.split("\n");
  const idx = (re) => lines.findIndex((l) => re.test(l));
  const order = [/\+ bash \S*setup-competitors\.sh/, /\+ bash \S*run-all\.sh --iterations 2 --out \S+ --arms ours,blader,blader-inv,unslop,unslop-inv,everwrite,everwrite-inv,base/, /\+ node \S*score\.mjs/, /\+ node \S*grade-prep\.mjs/, /grade-run\.sh/, /grade-collect\.mjs/, /summarize\.mjs/].map(idx);
  assert.ok(order.every((i) => i >= 0), `all steps printed: ${order}`);
  assert.deepEqual([...order].sort((a, b) => a - b), order, "steps are printed in order");
  assert.match(r.stdout, /model: claude-sonnet-5-5/);
  assert.equal(existsSync(out), false, "dry run creates no output");
  assert.equal(existsSync(join(work, "out")), false);
  assert.equal(existsSync(join(work, "comp")), false, "dry run clones nothing");
  assert.equal(r.stdout.includes("ARG="), false, "claude was not called");
});

test("grade-run.sh feeds each grading file to claude on stdin with the model, under sandbox-exec and with no file names", () => {
  const work = tmp("graderun");
  const out = join(work, "out");
  mkdirSync(join(out, "grading"), { recursive: true });
  writeFileSync(join(out, "grading", "g-000001.txt"), "GRADE ME ONE\n");
  writeFileSync(join(out, "grading", "g-000002.txt"), "GRADE ME TWO\n");
  writeFileSync(join(out, "grading", "g-000003.txt"), "ALREADY\n");
  writeFileSync(join(out, "grading", "g-000003.out"), '{"pass":false,"reason":"kept"}\n');
  const fakeBin = join(work, "bin");
  mkdirSync(fakeBin);
  writeFileSync(join(fakeBin, "claude"), '#!/usr/bin/env bash\nprintf "ARGS=%s\\n" "$*"\nprintf "HOME=%s\\n" "$HOME"\nprintf "STDIN=%s\\n" "$(cat)"\n');
  chmodSync(join(fakeBin, "claude"), 0o755);
  const env = { ...process.env, PATH: `${fakeSandboxExec(work)}${delimiter}${fakeBin}${delimiter}${process.env.PATH}`, H2H_GUARD_SETTINGS: join(work, "none1.json"), H2H_GUARD_CLAUDE_JSON: join(work, "none2.json") };
  const r = spawnSync("bash", [join(RUN, "grade-run.sh"), out], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  const one = readFileSync(join(out, "grading", "g-000001.out"), "utf8");
  assert.match(one, /ARGS=-p --model claude-sonnet-5-5 --setting-sources project --strict-mcp-config/);
  assert.match(one, /STDIN=GRADE ME ONE/);
  
  assert.doesNotMatch(one, /g-000001/, "the file name never reaches the model");
  assert.match(readFileSync(join(out, "grading", "g-000002.out"), "utf8"), /STDIN=GRADE ME TWO/);
  assert.match(readFileSync(join(work, "sandbox.log"), "utf8"), /SANDBOX_ARGS=-f \S*sandbox-grader\.sb claude -p/);
  assert.equal(readFileSync(join(out, "grading", "g-000003.out"), "utf8"), '{"pass":false,"reason":"kept"}\n', "an answered file is skipped");
});

// ---- Task 11, fix round 2: failed runs, absolute paths, completeness, publish ------------------

// Replace the fake claude by a script body (bash). The fake runs in the run directory.
function setClaude(work, body) {
  const fake = join(work, "fakebin", "claude");
  writeFileSync(fake, `#!/usr/bin/env bash\n${body}\n`);
  chmodSync(fake, 0o755);
}
const OK_RESULT = `printf '{"type":"result","is_error":false}\\n'`;

test("a failed, rate-limited or killed run is kept as .failed.jsonl, never as a valid transcript, and run-all reports it", () => {
  const cases = {
    failing: `echo "boom" >&2\n${OK_RESULT}\nexit 1`,
    "rate-limited": `printf '{"type":"result","is_error":true,"result":"rate limit"}\\n'\nexit 0`,
    killed: `printf '{"type":"assistant"}\\n'\nkill -9 $$`,
    "no result event": `printf '{"type":"assistant"}\\n'\nexit 0`,
  };
  for (const [name, body] of Object.entries(cases)) {
    const work = tmp(`failed-${name.replace(/\W/g, "")}`);
    const env = runEnv(work);
    setClaude(work, body);
    const out = join(work, "out");
    const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "base,ours"], { encoding: "utf8", env });
    assert.equal(r.status, 1, `${name}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /2 run\(s\) failed and have no valid transcript: h1-base-1 h1-ours-1|2 run\(s\) failed and have no valid transcript: h1-ours-1 h1-base-1/, name);
    for (const arm of ["base", "ours"]) {
      assert.equal(existsSync(join(out, `h1-${arm}-1.jsonl`)), false, `${name}: no valid transcript for ${arm}`);
      assert.ok(existsSync(join(out, `h1-${arm}-1.failed.jsonl`)), `${name}: failed transcript kept for ${arm}`);
    }
  }
});

test("a resumed round re-runs failed cells and keeps finished ones", () => {
  const work = tmp("resume");
  const env = runEnv(work);
  const out = join(work, "out");
  const run = () => spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "base,ours"], { encoding: "utf8", env });
  // ours fails (the fake fails when it sees the ours PATH shim), base succeeds.
  setClaude(work, `case "$PATH" in *bin-ours*) printf '{"type":"result","is_error":true}\\n'; exit 0;; esac\nprintf 'ARG=first\\n'\n${OK_RESULT}`);
  assert.equal(run().status, 1);
  const first = readFileSync(join(out, "h1-base-1.jsonl"), "utf8");
  assert.ok(existsSync(join(out, "h1-ours-1.failed.jsonl")));
  setClaude(work, `printf 'ARG=second\\n'\n${OK_RESULT}`);
  const again = run();
  assert.equal(again.status, 0, again.stderr);
  assert.match(again.stdout, /skip \(valid transcript exists\): h1-base-1/);
  assert.equal(readFileSync(join(out, "h1-base-1.jsonl"), "utf8"), first, "the finished cell was not re-run");
  assert.match(readFileSync(join(out, "h1-ours-1.jsonl"), "utf8"), /ARG=second/, "the failed cell was re-run");
  assert.equal(existsSync(join(out, "h1-ours-1.failed.jsonl")), false, "the stale failed transcript is gone");
});

test("score.mjs treats a run directory without a transcript as no run, not as all-zero", () => {
  const out = tmp("score-missing");
  const keys = makeBlindRuns(out, 1);
  rmSync(join(out, "h1-ours-1.jsonl"));
  const r = node("score.mjs", [out]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /no run \(no valid transcript\), not scored: 1: h1-ours-1/);
  const scores = JSON.parse(readFileSync(join(out, "scores.json"), "utf8"));
  assert.equal("h1-ours-1" in scores, false);
  assert.equal(Object.keys(scores).length, keys.length - 1);
});

test("run-all.sh makes relative paths absolute: the plugin dir that reaches claude is absolute and exists", () => {
  const work = tmp("relative");
  const env = runEnv(work);
  mkdirSync(join(work, "rel-plugin"));
  mkdirSync(join(work, "rel-base"));
  writeFileSync(join(work, "rel-plugin", "marker.txt"), "x");
  for (const v of ["H2H_DIR_OURS", "H2H_DIR_BLADER", "H2H_DIR_UNSLOP", "H2H_DIR_EVERWRITE"]) env[v] = "./rel-plugin";
  env.H2H_DIR_BASE = "rel-base";
  env.H2H_OUT = "rel-out";
  const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "base,blader"], { encoding: "utf8", env, cwd: work });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const arm of ["base", "blader"]) {
    const argv = argvOf(join(work, "rel-out", `h1-${arm}-1.jsonl`));
    const plugin = argv[argv.indexOf("--plugin-dir") + 1];
    assert.ok(plugin.startsWith("/"), `${arm}: absolute, got ${plugin}`);
    assert.equal(realpathSync(plugin), realpathSync(join(work, "rel-out", `plugin-${arm}`)), "the arm gets the export in the output directory");
  }
  assert.ok(existsSync(join(work, "rel-out", "plugin-blader", "marker.txt")), "the export holds the source plugin's files");
  const missing = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--arms", "base"], { encoding: "utf8", env: { ...env, H2H_DIR_BASE: "nope" }, cwd: work });
  assert.equal(missing.status, 2);
  assert.match(missing.stderr, /H2H_DIR_BASE does not name an existing directory/);
});

test("run-all.sh and rerun.sh refuse an output directory inside the repository", () => {
  const work = tmp("insiderepo");
  const env = runEnv(work, { H2H_COMPETITORS: join(work, "comp") });
  const inside = join(BENCH, "results", "round-test-never-created");
  rmSync(inside, { recursive: true, force: true }); // a leftover from an older run would hide a regression
  const a = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--arms", "base", "--out", inside], { encoding: "utf8", env });
  assert.equal(a.status, 2);
  assert.match(a.stderr, /inside the repository/);
  const b = spawnSync("bash", [join(BENCH, "rerun.sh"), "--dry-run", "--out", inside], { encoding: "utf8", env });
  assert.equal(b.status, 2);
  assert.match(b.stderr, /inside the repository/);
  assert.equal(existsSync(inside), false);
});

test("rerun.sh --dry-run resolves a relative --out to an absolute path", () => {
  const work = tmp("rerun-rel");
  const env = runEnv(work, { H2H_COMPETITORS: join(work, "comp") });
  const r = spawnSync("bash", [join(BENCH, "rerun.sh"), "--dry-run", "--out", "rel/out"], { encoding: "utf8", env, cwd: work });
  assert.equal(r.status, 0, r.stderr);
  const real = realpathSync(work);
  assert.ok(r.stdout.includes(`--out ${work}/rel/out`) || r.stdout.includes(`--out ${real}/rel/out`), r.stdout);
  assert.doesNotMatch(r.stdout, /--out rel\/out/);
  assert.equal(existsSync(join(work, "rel")), false);
});

test("rerun.sh runs the whole flow with a fake claude, and propagates the failing step's exit status", () => {
  const remote = fakeRemote();
  const work = tmp("rerun-full");
  const lock = join(work, "lock");
  writeFileSync(lock, ["blader", "unslop", "everwrite"].map((n) => `${n} ${remote.dir} ${remote.second}`).join("\n") + "\n");
  const env = runEnv(work, { H2H_LOCK: lock, H2H_COMPETITORS: join(work, "comp") });
  const out = join(work, "round");
  const rerun = (extraEnv = {}) => spawnSync("bash", [join(BENCH, "rerun.sh"), "--tasks", "h1", "--iterations", "1", "--out", out], { encoding: "utf8", env: { ...env, ...extraEnv }, timeout: 280000 });

  const ok = rerun();
  assert.equal(ok.status, 0, ok.stdout + ok.stderr);
  assert.ok(existsSync(join(out, "scores.json")));
  assert.match(ok.stdout, /grade-run\.sh/);
  assert.ok(existsSync(join(out, "empty-plugin")), "the base plugin dir is created");
  assert.ok(ARMS.every((arm) => existsSync(join(out, `h1-${arm}-1.jsonl`))));

  rmRound(out);
  setClaude(work, "exit 1");
  const failed = rerun();
  assert.equal(failed.status, 1, "a failing run-all makes rerun fail with that status");
  assert.match(failed.stderr, /step failed with exit 1/);

  rmRound(out);
  setClaude(work, `echo '{"hooks":{"evil":true}}' > "${env.H2H_GUARD_SETTINGS}"\n${OK_RESULT}`);
  const tripped = rerun();
  assert.equal(tripped.status, 3, "a guard trip stays 3");
});

test("config-guard exits 3 with a fixed message, quoting nothing, when a guarded file is not JSON", () => {
  const work = tmp("guard-bad");
  const env = runEnv(work);
  writeFileSync(env.H2H_GUARD_SETTINGS, '{"hooks": SECRET-TOKEN-123');
  for (const mode of [["print"], ["record", join(work, "s.json")]]) {
    const r = spawnSync(process.execPath, [join(RUN, "config-guard.mjs"), ...mode], { encoding: "utf8", env });
    assert.equal(r.status, 3);
    assert.match(r.stderr, /could not be read as JSON/);
    assert.doesNotMatch(r.stdout + r.stderr, /SECRET-TOKEN|Unexpected|position/);
  }
});

// A summary directory for a complete round: ours and every rival arm have 3 runs in every task.
function fullScores() {
  return scoresFor(caseScores(PASSING));
}

test("summarize: a subset round is INCOMPLETE for both verdicts and names the missing tasks", () => {
  const scores = Object.fromEntries(Object.entries(fullScores()).filter(([k]) => /^h[13]-/.test(k)));
  const out = summarize(scores);
  assert.match(out, /Win rule: INCOMPLETE \(.*arm ours has no runs for h2, h9/);
  assert.doesNotMatch(out, /Win rule: (PASS|FAIL)/);
  assert.match(out, /Missing runs: /);
});

test("summarize: a missing invoked arm is reported by name, not skipped", () => {
  const scores = Object.fromEntries(Object.entries(fullScores()).filter(([k]) => !/-blader-inv-\d$/.test(k)));
  const out = summarize(scores);
  assert.match(out, /Win rule: INCOMPLETE \(arm blader-inv has no runs\)/);
});

test("summarize: unequal n per cell is warned about and the missing runs are counted", () => {
  const scores = fullScores();
  delete scores["h14-blader-3"];
  delete scores["h14-base-3"];
  const out = summarize(scores);
  assert.match(out, /Missing runs: 2 of 288 expected \(n=3 per cell\)/);
  assert.match(out, /Warning: unequal n per cell .*h14-blader n=2, h14-base n=2/);
  assert.match(out, /Win rule: PASS/, "unequal n alone does not block a verdict");
});

test("publish.sh copies the evidence, not the run directories or failed transcripts, and refuses to overwrite", () => {
  const work = tmp("publish");
  const out = join(work, "out");
  const keys = makeBlindRuns(out, 1);
  writeFileSync(join(out, "h1-ours-1.failed.jsonl"), "x\n");
  assert.equal(node("score.mjs", [out]).status, 0);
  assert.equal(node("grade-prep.mjs", [out]).status, 0);
  writeFileSync(join(out, "meta.json"), "{}");
  writeFileSync(join(out, "sandbox-x.sb"), "(version 1)");
  const results = join(work, "results");
  const env = { ...process.env, H2H_RESULTS: results };
  const r = spawnSync("bash", [join(RUN, "publish.sh"), out, "round-7"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const dest = join(results, "round-7");
  const files = readdirSync(dest).sort();
  assert.ok(files.includes("summary.md") && files.includes("scores.json") && files.includes("meta.json"));
  assert.deepEqual(files.filter((f) => f.endsWith(".jsonl")).sort(), keys.map((k) => `${k}.jsonl`).sort());
  assert.ok(!files.some((f) => f.endsWith(".sb") || f.endsWith(".failed.jsonl") || f.startsWith("h1-ours-1") && !f.endsWith(".jsonl")), "no profile, and no failed transcript or run directory at the top level");
  assert.deepEqual(readdirSync(join(dest, "failed")), ["h1-ours-1.failed.jsonl"], "failed runs are published in failed/");
  assert.ok(existsSync(join(dest, "runs", "h1-ours-1", "note.md")), "the scored run directories are published in runs/");
  const grading = readdirSync(join(dest, "grading"));
  assert.ok(grading.includes("labelmap.json") && grading.some((f) => f.endsWith(".txt")));
  assert.match(readFileSync(join(dest, "summary.md"), "utf8"), /^Scope: /m);

  const again = spawnSync("bash", [join(RUN, "publish.sh"), out, "round-7"], { encoding: "utf8", env });
  assert.equal(again.status, 1);
  assert.match(again.stderr, /refusing to overwrite/);
  const badName = spawnSync("bash", [join(RUN, "publish.sh"), out, "latest"], { encoding: "utf8", env });
  assert.equal(badName.status, 2);
});

test("grade-prep grades only runs that have a valid transcript", () => {
  const out = tmp("grade-failed");
  makeBlindRuns(out, 1);
  rmSync(join(out, "h2-base-1.jsonl"));
  assert.equal(node("grade-prep.mjs", [out]).status, 0);
  const labels = JSON.parse(readFileSync(join(out, "grading", "labelmap.json"), "utf8"));
  assert.ok(!Object.values(labels).includes("h2-base-1"));
  assert.ok(Object.values(labels).includes("h2-ours-1"));
});

// ---- Task 17: harness validity repairs -------------------------------------------------------------

function fakeRealNpm() {
  const realDir = tmp("fake-real-npm");
  writeFileSync(join(realDir, "npm"), '#!/usr/bin/env bash\nprintf "REAL_NPM"\nfor a in "$@"; do printf "|%s" "$a"; done\nprintf "\\n"\n');
  chmodSync(join(realDir, "npm"), 0o755);
  return realDir;
}
const npmShim = (args, env) => spawnSync(join(BIN, "npm"), args, { encoding: "utf8", env, timeout: 15000 });

test("bin-ours npm: install, i and add of ai-slop-linter[@spec] install the tarball; every other call goes to the real npm unchanged", () => {
  const realDir = fakeRealNpm();
  const env = { ...process.env, PATH: `${BIN}${delimiter}${realDir}${delimiter}${process.env.PATH}`, H2H_OURS_TARBALL: "/tmp/ours/ai-slop-linter-9.9.9.tgz" };
  const TAR = "/tmp/ours/ai-slop-linter-9.9.9.tgz";
  const rewritten = [
    [["install", "ai-slop-linter"], `REAL_NPM|install|${TAR}`],
    [["i", "-D", "ai-slop-linter@0.1.10"], `REAL_NPM|i|-D|${TAR}`],
    [["add", "--save-dev", "ai-slop-linter@latest", "typescript"], `REAL_NPM|add|--save-dev|${TAR}|typescript`],
    [["--loglevel", "error", "install", "ai-slop-linter@^0.1"], `REAL_NPM|--loglevel|error|install|${TAR}`],
    [["-g", "install", "ai-slop-linter"], `REAL_NPM|-g|install|${TAR}`],
    [["install", "typescript", "ai-slop-linter"], `REAL_NPM|install|typescript|${TAR}`],
  ];
  for (const [args, want] of rewritten) {
    const r = npmShim(args, env);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim(), want, args.join(" "));
  }
  const untouched = [
    ["install"],
    ["install", "typescript"],
    ["install", "@scope/ai-slop-linter"],
    ["install", "ai-slop-linter-extra"],
    ["run", "lint:prose"],
    ["run", "ai-slop-linter"],
    ["ls", "ai-slop-linter"],
    ["--version"],
    ["test"],
  ];
  for (const args of untouched) {
    const r = npmShim(args, env);
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim(), `REAL_NPM${args.map((a) => `|${a}`).join("")}`, args.join(" "));
  }
});

test("bin-ours npm: without a tarball the call goes to the real npm unchanged with a warning, and the shim never calls itself", () => {
  const realDir = fakeRealNpm();
  const env = { ...process.env, PATH: `${BIN}${delimiter}${realDir}${delimiter}${process.env.PATH}` };
  delete env.H2H_OURS_TARBALL;
  const r = npmShim(["install", "ai-slop-linter"], env);
  assert.equal(r.status, 0, r.stderr);
  assert.equal(r.stdout.trim(), "REAL_NPM|install|ai-slop-linter");
  assert.match(r.stderr, /H2H_OURS_TARBALL is not set/);
  const link = join(tmp("npm-link"), "linked-bin");
  symlinkSync(BIN, link);
  const viaLink = npmShim(["--version"], { ...env, PATH: `${link}${delimiter}${realDir}${delimiter}${process.env.PATH}` });
  assert.equal(viaLink.stdout.trim(), "REAL_NPM|--version");
});

// h15 is active; h6 (retired) is scored only with --include-retired. Both command checks use the same PATH rule.
for (const [task, runsPerArm, flags] of [["h15", 4, []], ["h6", 3, ["--include-retired"]]]) test(`score.mjs runs the ${task} command check for every arm with the same PATH: bin-ours first, then the normal PATH`, () => {
  const out = tmp("samepath");
  const logs = tmp("pathlogs");
  mkdirSync(join(out, "ours-tarball"));
  writeFileSync(join(out, "ours-tarball", "ai-slop-linter-1.0.0.tgz"), "x");
  for (const arm of ["ours", "base", "blader-inv"]) {
    const dir = join(out, `${task}-${arm}-1`);
    cpSync(join(BENCH, "golden", task), dir, { recursive: true });
    const pkgPath = join(dir, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    pkg.scripts["lint:prose"] = `node -e "require('fs').writeFileSync(process.env.PATHLOG + '/' + require('path').basename(process.cwd()), process.env.PATH + '\\n' + (process.env.H2H_OURS_TARBALL || ''))"`;
    writeFileSync(pkgPath, JSON.stringify(pkg));
    writeFileSync(`${dir}.jsonl`, '{"type":"result","is_error":false}\n');
  }
  const env = { ...process.env, PATHLOG: logs };
  delete env.H2H_OURS_TARBALL;
  const r = node("score.mjs", [out, ...flags], { env });
  assert.equal(r.status, 0, r.stderr);
  const seen = readdirSync(logs).map((f) => readFileSync(join(logs, f), "utf8").split("\n")[0]);
  const tarballs = readdirSync(logs).map((f) => readFileSync(join(logs, f), "utf8").split("\n")[1]);
  for (const t of tarballs) assert.equal(t, join(out, "ours-tarball", "ai-slop-linter-1.0.0.tgz"), "the npm shim can install the round's tarball for every arm");
  assert.equal(seen.length, 3 * runsPerArm, `${runsPerArm} lint:prose runs for each of three arms`);
  const tails = seen.map((p) => {
    const at = p.indexOf(CODE_BIN);
    assert.ok(at >= 0, `the code copy's bin-ours is on PATH: ${p}`);
    return p.slice(at);
  });
  for (const tail of tails) assert.equal(tail, `${CODE_BIN}${delimiter}${process.env.PATH}`, "bin-ours first, then the normal PATH, identical for every arm");
});

const LEAKY = [
  ["Bash", { command: "ls /r/bench/head-to-head/" }],
  ["Bash", { command: "cat /r/bench/head-to-head/tasks.json" }],
  ["Read", { file_path: "/r/bench/head-to-head/golden/h1/note.md" }],
  ["Grep", { pattern: "x", path: "/r/bench/head-to-head/checker-data" }],
  ["Glob", { pattern: "**/golden/h3/*" }],
  ["Read", { file_path: "/r/x/after/h2/README.md" }],
  ["Bash", { command: "ls probes/" }],
  ["Bash", { command: "cat scores.json" }],
  ["Bash", { command: "cat out/blind.json" }],
  ["Bash", { command: "cat grading/labelmap.json" }],
  ["Bash", { command: "ls home/h7.json" }],
  ["Bash", { command: "cat labels.json" }],
  ["Read", { file_path: "/r/.superpowers/sdd/plan-round1/constraints.md" }],
  ["Bash", { command: "cat tasks.json" }],
  ["Bash", { command: "cat checker-data/h6-clean-guide.md" }],
];
const toolLine = (name, input) => JSON.stringify({ type: "assistant", message: { content: [{ type: "tool_use", name, input }] } }) + "\n";

test("score.mjs flags every transcript with a tool call that mentions the answer key, for any tool, and leaves clean runs alone", () => {
  const out = tmp("leaks");
  makeBlindRuns(out, 1);
  const byRun = new Map();
  const runs = [];
  for (const task of ["h2", "h3"]) for (const arm of ARMS) runs.push(`${task}-${arm}-1`);
  LEAKY.forEach(([name, input], i) => {
    const key = runs[i];
    writeFileSync(join(out, `${key}.jsonl`), toolLine("Bash", { command: "cat note.md" }) + toolLine(name, input) + '{"type":"result","is_error":false}\n');
    byRun.set(key, `${name} ${JSON.stringify(input)}`);
  });
  writeFileSync(join(out, "h1-ours-1.jsonl"), toolLine("Bash", { command: "cat note.md && ai-slop-linter note.md && grep -n golden note.md" }) + toolLine("Read", { file_path: "note.md" }) + '{"type":"result","is_error":false}\n');
  const r = node("score.mjs", [out]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /LEAK: 15 run\(s\)/);
  const scores = JSON.parse(readFileSync(join(out, "scores.json"), "utf8"));
  for (const [key, label] of byRun) assert.equal(scores[key].leak, true, `${key} (${label}) is flagged`);
  assert.equal(scores["h1-ours-1"].leak, undefined, "a run that only touched its own files is not flagged");
  assert.equal(scores[runs[LEAKY.length]].leak, undefined);
  const leaks = JSON.parse(readFileSync(join(out, "leaks.json"), "utf8"));
  assert.deepEqual(Object.keys(leaks).sort(), [...byRun.keys()].sort());
  assert.equal(leaks[runs[2]][0].tool, "Read");
  // and summarize shows it
  const s = node("summarize.mjs", [out]);
  assert.match(s.stdout, /^LEAK: h2-blader-1 /m);
  assert.match(s.stdout, /Leak-flagged runs: 15/);
});

test("export_plugin: ours is exported as .claude-plugin, skills and hooks only (no THIRD-PARTY-NOTICES.md), read-only, and no answer-key file is reachable", () => {
  const out = tmp("export");
  const dest = spawnSync("bash", ["-c", `. "${RUN}/export-plugins.sh"; export_plugin ours "${ROOT}"`], { encoding: "utf8", env: { ...process.env, H2H_OUT: out } });
  assert.equal(dest.status, 0, dest.stderr);
  assert.equal(dest.stdout, join(out, "plugin-ours"));
  assert.deepEqual(readdirSync(dest.stdout).sort(), [".claude-plugin", "hooks", "skills"]);
  assert.ok(existsSync(join(dest.stdout, "hooks", "hooks.json")) && existsSync(join(dest.stdout, "hooks", "rewrite-prompt.sh")), "the UserPromptSubmit hook is exported");
  assert.equal(statSync(join(dest.stdout, ".claude-plugin", "plugin.json")).mode & 0o222, 0, "exported files are read-only");
  assert.equal(statSync(dest.stdout).mode & 0o222, 0, "the export directory is read-only");
  const again = spawnSync("bash", ["-c", `. "${RUN}/export-plugins.sh"; export_plugin ours "${ROOT}"`], { encoding: "utf8", env: { ...process.env, H2H_OUT: out } });
  assert.equal(again.status, 0, `a second export replaces the read-only one: ${again.stderr}`);
  const all = [];
  const walk = (d) => readdirSync(d).forEach((n) => { const p = join(d, n); all.push(p); if (statSync(p).isDirectory()) walk(p); });
  walk(dest.stdout);
  assert.ok(all.length > 3);
  assert.ok(!all.some((p) => /golden|checker-data|tasks\.json|labels\.json|\/home\/h|\.superpowers|\/bench\b/.test(p.slice(dest.stdout.length))), "no answer-key path inside the export");
  assert.ok(existsSync(join(dest.stdout, "skills")) && existsSync(join(dest.stdout, ".claude-plugin", "plugin.json")));
});

test("run-all.sh starts every arm with an export of its plugin, not the source; competitors lose .git; the repository is never a plugin dir", () => {
  const work = tmp("exportall");
  const env = runEnv(work);
  const fakeRepo = join(work, "fake-repo");
  mkdirSync(join(fakeRepo, ".claude-plugin"), { recursive: true });
  mkdirSync(join(fakeRepo, "skills", "s"), { recursive: true });
  mkdirSync(join(fakeRepo, "bench", "head-to-head", "golden"), { recursive: true });
  writeFileSync(join(fakeRepo, ".claude-plugin", "plugin.json"), "{}");
  writeFileSync(join(fakeRepo, "skills", "s", "SKILL.md"), "s");
  writeFileSync(join(fakeRepo, "bench", "head-to-head", "golden", "secret.md"), "key");
  writeFileSync(join(fakeRepo, "THIRD-PARTY-NOTICES.md"), "n");
  const comp = join(work, "comp");
  mkdirSync(join(comp, ".git"), { recursive: true });
  writeFileSync(join(comp, ".git", "HEAD"), "ref");
  writeFileSync(join(comp, "SKILL.md"), "c");
  env.H2H_DIR_OURS = fakeRepo;
  env.H2H_DIR_BLADER = comp;
  env.H2H_OURS_TARBALL = join(work, "fake.tgz");
  writeFileSync(env.H2H_OURS_TARBALL, "x");
  const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "ours,blader,blader-inv"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const out = join(work, "out");
  assert.deepEqual(readdirSync(join(out, "plugin-ours")).sort(), [".claude-plugin", "skills"], "no THIRD-PARTY-NOTICES.md in the export");
  assert.equal(statSync(join(out, "plugin-blader", "SKILL.md")).mode & 0o222, 0, "competitor exports are read-only too");
  assert.equal(existsSync(join(out, "plugin-ours", "bench")), false, "the answer key is not exported");
  assert.deepEqual(readdirSync(join(out, "plugin-blader")), ["SKILL.md"], "no .git in a competitor export");
  for (const [arm, plugin] of [["ours", "plugin-ours"], ["blader", "plugin-blader"], ["blader-inv", "plugin-blader"]]) {
    const argv = argvOf(join(out, `h1-${arm}-1.jsonl`));
    assert.equal(argv[argv.indexOf("--plugin-dir") + 1], join(realpathSync(out), plugin), arm);
  }
  assert.match(readFileSync(join(out, "h1-ours-1.jsonl"), "utf8"), /^TARBALL=.*fake\.tgz$/m, "the ours arm gets the tarball for the npm shim");
  assert.match(readFileSync(join(out, "h1-blader-1.jsonl"), "utf8"), /^TARBALL=$/m, "other arms do not");
});

test("run-all.sh builds the tarball once per round with npm pack of the code copy into ours-tarball/", () => {
  const work = tmp("tarball");
  const env = runEnv(work);
  delete env.H2H_OURS_TARBALL;
  const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "ours"], { encoding: "utf8", env, timeout: 280000 });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const dir = join(work, "out", "ours-tarball");
  const tgz = readdirSync(dir).filter((f) => f.endsWith(".tgz"));
  assert.equal(tgz.length, 1);
  const list = spawnSync("tar", ["-tzf", join(dir, tgz[0])], { encoding: "utf8" });
  assert.equal(list.status, 0, list.stderr);
  assert.match(list.stdout, /package\/dist\/src\/cli\.js/);
  assert.doesNotMatch(list.stdout, /package\/bench\//);
  assert.match(readFileSync(join(work, "out", "h1-ours-1.jsonl"), "utf8"), new RegExp(`^TARBALL=${join(realpathSync(work), "out", "ours-tarball").replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/.*\\.tgz$`, "m"));
  const again = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "ours", "--force"], { encoding: "utf8", env, timeout: 280000 });
  assert.equal(again.status, 0, again.stderr);
  assert.equal(readdirSync(dir).filter((f) => f.endsWith(".tgz")).length, 1, "an existing tarball is reused");
});

test("run-one.sh uses an existing export when H2H_PLUGINS_EXPORTED=1 and makes its own export otherwise", () => {
  const work = tmp("exportflag");
  const env = runEnv(work);
  const out = join(work, "out");
  mkdirSync(join(out, "plugin-base"), { recursive: true });
  writeFileSync(join(out, "plugin-base", "sentinel.txt"), "kept");
  const kept = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "base", "1"], { encoding: "utf8", env: { ...env, H2H_PLUGINS_EXPORTED: "1" } });
  assert.equal(kept.status, 0, kept.stderr);
  assert.ok(existsSync(join(out, "plugin-base", "sentinel.txt")), "run-all's export is not rebuilt per run");
  const rebuilt = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "base", "2"], { encoding: "utf8", env });
  assert.equal(rebuilt.status, 0, rebuilt.stderr);
  assert.equal(existsSync(join(out, "plugin-base", "sentinel.txt")), false, "a standalone run exports afresh");
});

const HAS_SANDBOX = spawnSync("which", ["sandbox-exec"]).status === 0;
function renderProbe(extraEnv = {}) {
  const work = tmp("sbprobe");
  const out = join(work, "out");
  mkdirSync(out);
  for (const d of ["run-a", "run-b", "plugin-ours", "ours-tarball"]) mkdirSync(join(out, d));
  writeFileSync(join(out, "run-b", "theirs.txt"), "sibling output");
  const fakeHome = join(realpathSync(work), "fakehome");
  mkdirSync(fakeHome, { recursive: true });
  const r = spawnSync("bash", ["-c", `. "${RUN}/sandbox.sh"; render_sandbox "${out}" probe "${out}/run-a"`], { encoding: "utf8", env: { ...process.env, HOME: fakeHome, ...extraEnv } });
  return { r, work, out, fakeHome, profile: join(out, "sandbox-probe.sb") };
}

test("the real sandbox-exec hides bench, .superpowers and test from reads, keeps dist and the bin-ours shims readable", { skip: !HAS_SANDBOX }, () => {
  const { r, profile } = renderProbe({ H2H_CODE_DIR: ROOT });
  assert.equal(r.status, 0, r.stderr);
  const repo = realpathSync(ROOT);
  const sb = (script) => spawnSync("sandbox-exec", ["-f", profile, "sh", "-c", script], { encoding: "utf8", timeout: 30000 });
  for (const hidden of ["bench/head-to-head/tasks.json", "bench/head-to-head/golden/h1/note.md", "bench/head-to-head/checker-data/h6-clean-guide.md", "test/head-to-head.test.mjs"]) {
    const res = sb(`cat "${repo}/${hidden}" > /dev/null`);
    assert.notEqual(res.status, 0, `${hidden} must not be readable`);
  }
  assert.notEqual(sb(`ls "${repo}/bench"`).status, 0, "bench cannot be listed");
  assert.notEqual(sb(`ls "${repo}/.superpowers"`).status, 0, ".superpowers cannot be listed");
  assert.equal(sb(`cat "${repo}/dist/src/cli.js" > /dev/null`).status, 0, "dist stays readable");
  assert.equal(sb(`cat "${repo}/package.json" > /dev/null`).status, 0, "other repository files stay readable");
  assert.equal(sb(`cat "${repo}/bench/head-to-head/run/bin-ours/npx" > /dev/null`).status, 0, "the shim directory is readable");
  const shim = sb(`H2H_CODE_DIR="${repo}" PATH="${BIN}:$PATH" ai-slop-linter --version`);
  assert.equal(shim.status, 0, `the local CLI shim still runs inside the sandbox: ${shim.stderr}`);
  assert.match(shim.stdout.trim(), /^\d+\.\d+\.\d+/);
});

test("sandbox profile: no machine-specific file is named, and H2H_SANDBOX_EXTRA_DENY adds write denies (real sandbox-exec)", () => {
  const work = tmp("extradeny");
  const a = join(realpathSync(work), "secret-a");
  const b = join(realpathSync(work), "secret-b");
  mkdirSync(a);
  mkdirSync(b);
  const { r, profile } = renderProbe({ H2H_SANDBOX_EXTRA_DENY: `${a}:${b}` });
  assert.equal(r.status, 0, r.stderr);
  const text = readFileSync(profile, "utf8");
  assert.ok(text.includes(`(subpath "${a}")`) && text.includes(`(subpath "${b}")`));
  assert.doesNotMatch(text, /\.vaara|RTK|@EXTRA_DENY@/);
  if (HAS_SANDBOX) {
    const sb = (script) => spawnSync("sandbox-exec", ["-f", profile, "sh", "-c", script], { encoding: "utf8" });
    assert.notEqual(sb(`touch "${a}/x"`).status, 0, "extra path a is write-denied");
    assert.notEqual(sb(`touch "${b}/x"`).status, 0, "extra path b is write-denied");
    assert.equal(sb(`touch "${tmp("ok")}/x"`).status, 0, "other temp paths stay writable");
  }
  const plain = renderProbe();
  assert.doesNotMatch(readFileSync(plain.profile, "utf8"), /secret-a/);
  for (const bad of ["relative/path", `${a}"x`]) {
    const refused = renderProbe({ H2H_SANDBOX_EXTRA_DENY: bad });
    assert.notEqual(refused.r.status, 0, `refused: ${bad}`);
    assert.match(refused.r.stderr, /H2H_SANDBOX_EXTRA_DENY/);
  }
});

test("the real sandbox-exec hides the git history, so git show of a bench file fails inside and works outside", { skip: !HAS_SANDBOX }, () => {
  const { r, profile } = renderProbe();
  assert.equal(r.status, 0, r.stderr);
  const repo = realpathSync(ROOT);
  const outside = spawnSync("git", ["-C", repo, "show", "HEAD:bench/head-to-head/tasks.json"], { encoding: "utf8" });
  assert.equal(outside.status, 0, "precondition: git show works outside the sandbox");
  const sb = (script) => spawnSync("sandbox-exec", ["-f", profile, "sh", "-c", script], { encoding: "utf8", timeout: 30000 });
  const show = sb(`git -C "${repo}" show HEAD:bench/head-to-head/tasks.json`);
  assert.notEqual(show.status, 0, "git show of an answer-key file fails inside the sandbox");
  assert.doesNotMatch(show.stdout, /"tasks"/);
  assert.notEqual(sb(`git -C "${repo}" show HEAD:package.json`).status, 0, "no git object is readable");
  assert.notEqual(sb(`cat "${repo}/.git/HEAD"`).status, 0, ".git cannot be read");
  assert.equal(sb(`cat "${repo}/dist/src/cli.js" > /dev/null`).status, 0, "dist stays readable");
  assert.equal(sb(`cat "${repo}/bench/head-to-head/run/bin-ours/npm" > /dev/null`).status, 0, "bin-ours stays readable");
});

test("the real sandbox-exec lets a run write only its own directory: not siblings, plugin exports, the tarball or the output root", { skip: !HAS_SANDBOX }, () => {
  const { r, out, profile } = renderProbe();
  assert.equal(r.status, 0, r.stderr);
  const sb = (script) => spawnSync("sandbox-exec", ["-f", profile, "sh", "-c", script], { encoding: "utf8", timeout: 30000 });
  assert.equal(sb(`touch "${out}/run-a/mine.txt"`).status, 0, "its own run directory is writable");
  assert.equal(sb(`mkdir "${out}/run-a/sub" && touch "${out}/run-a/sub/x"`).status, 0);
  assert.notEqual(sb(`touch "${out}/run-b/theirs-new.txt"`).status, 0, "a sibling run directory is not writable");
  assert.notEqual(sb(`echo x >> "${out}/run-b/theirs.txt"`).status, 0, "a sibling run's file is not writable");
  assert.notEqual(sb(`touch "${out}/plugin-ours/x"`).status, 0, "the plugin export is not writable");
  assert.notEqual(sb(`mkdir "${out}/plugin-new"`).status, 0, "a new plugin export directory cannot be created");
  assert.notEqual(sb(`touch "${out}/ours-tarball/x.tgz"`).status, 0, "the tarball directory is not writable");
  assert.notEqual(sb(`touch "${out}/scores.json"`).status, 0, "the output root is not writable");
  assert.equal(sb(`cat "${out}/run-b/theirs.txt" > /dev/null`).status, 0, "reads of sibling run directories stay allowed (documented)");
  // Without a run directory the whole output directory is the run directory, but plugin-* and the tarball stay protected.
  const whole = spawnSync("bash", ["-c", `. "${RUN}/sandbox.sh"; render_sandbox "${out}" whole`], { encoding: "utf8", env: { ...process.env, HOME: realpathSync(dirname(out)) } });
  assert.equal(whole.status, 0, whole.stderr);
  const sbw = (script) => spawnSync("sandbox-exec", ["-f", join(out, "sandbox-whole.sb"), "sh", "-c", script], { encoding: "utf8", timeout: 30000 });
  assert.equal(sbw(`touch "${out}/anything.txt"`).status, 0);
  assert.notEqual(sbw(`touch "${out}/plugin-ours/x"`).status, 0, "plugin-* is denied even when the run directory is the output root");
  assert.notEqual(sbw(`touch "${out}/ours-tarball/x"`).status, 0, "the tarball directory too");
  assert.equal(sb(`touch "${tmp("elsewhere")}/x"`).status, 0, "temporary files elsewhere are writable");
});

test("run-all.sh leaves the plugin exports and the tarball read-only, replaces them on a second run, and rebuilds the tarball when HEAD differs", () => {
  const work = tmp("readonly");
  const env = runEnv(work);
  delete env.H2H_OURS_TARBALL;
  mkdirSync(join(work, "out"), { recursive: true });
  writeFileSync(join(work, "out", "code-commit.txt"), `${SHA_A}\n`);
  const run = (...extra) => spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "ours,base", ...extra], { encoding: "utf8", env, timeout: 280000 });
  assert.equal(run().status, 0);
  const out = join(work, "out");
  const tarDir = join(out, "ours-tarball");
  const tgz = join(tarDir, readdirSync(tarDir).find((f) => f.endsWith(".tgz")));
  assert.equal(statSync(tgz).mode & 0o222, 0, "the tarball is read-only");
  assert.equal(statSync(tarDir).mode & 0o222, 0, "the tarball directory is read-only");
  assert.equal(statSync(join(out, "plugin-base")).mode & 0o222, 0, "the plugin export is read-only");
  const head = SHA_A;
  assert.equal(readFileSync(join(tarDir, "SOURCE_COMMIT"), "utf8").trim(), head, "the tarball records the code commit it was packed from");
  const inode = statSync(tgz).ino;
  assert.equal(run("--force").status, 0, "a second run replaces the read-only exports");
  assert.equal(statSync(tgz).ino, inode, "the same HEAD keeps the tarball");
  // a resume with a different HEAD
  spawnSync("chmod", ["-R", "u+w", tarDir]);
  writeFileSync(join(tarDir, "SOURCE_COMMIT"), "0000000000000000000000000000000000000000\n");
  spawnSync("chmod", ["-R", "a-w", tarDir]);
  assert.equal(run("--force").status, 0);
  assert.equal(readFileSync(join(tarDir, "SOURCE_COMMIT"), "utf8").trim(), head, "rebuilt for the current HEAD");
  assert.equal(readdirSync(tarDir).filter((f) => f.endsWith(".tgz")).length, 1);
  rmRound(out);
});

test("H2H_SANDBOX_EXTRA_DENY paths are resolved with realpath", () => {
  const work = tmp("extrareal");
  const real = join(realpathSync(work), "real-dir");
  mkdirSync(real);
  const link = join(realpathSync(work), "link-dir");
  symlinkSync(real, link);
  const { r, profile } = renderProbe({ H2H_SANDBOX_EXTRA_DENY: link });
  assert.equal(r.status, 0, r.stderr);
  const text = readFileSync(profile, "utf8");
  assert.ok(text.includes(`(subpath "${real}")`) && !text.includes(`(subpath "${link}")`), "the symlink target is denied, not the link name");
});

test("bin-ours npm: exec and x are rewritten too, including --package=", () => {
  const realDir = fakeRealNpm();
  const TAR = "/tmp/ours/ai-slop-linter-9.9.9.tgz";
  const env = { ...process.env, PATH: `${BIN}${delimiter}${realDir}${delimiter}${process.env.PATH}`, H2H_OURS_TARBALL: TAR };
  for (const [args, want] of [
    [["exec", "ai-slop-linter", "--", "README.md"], `REAL_NPM|exec|${TAR}|--|README.md`],
    [["x", "ai-slop-linter@0.1.10", "README.md"], `REAL_NPM|x|${TAR}|README.md`],
    [["exec", "--package=ai-slop-linter@latest", "--", "slop", "."], `REAL_NPM|exec|--package=${TAR}|--|slop|.`],
    [["exec", "--package", "ai-slop-linter", "--", "slop"], `REAL_NPM|exec|--package|${TAR}|--|slop`],
    [["exec", "typescript"], "REAL_NPM|exec|typescript"],
  ]) {
    const r = npmShim(args, env);
    assert.equal(r.stdout.trim(), want, args.join(" "));
  }
});

test("publish.sh never follows symbolic links: a link to a file, a link to a directory and a cycle are skipped", () => {
  const work = tmp("symlinks");
  const out = join(work, "out");
  makeBlindRuns(out, 1);
  const secret = join(work, "secret");
  mkdirSync(secret);
  writeFileSync(join(secret, "key.txt"), "TOP SECRET");
  const runDir = join(out, "h1-ours-1");
  symlinkSync(join(secret, "key.txt"), join(runDir, "file-link.txt"));
  symlinkSync(secret, join(runDir, "dir-link"));
  mkdirSync(join(runDir, "loop"));
  symlinkSync(runDir, join(runDir, "loop", "back"));
  writeFileSync(join(runDir, "loop", "real.txt"), "inside the loop dir");
  assert.equal(node("score.mjs", [out]).status, 0);
  assert.equal(node("grade-prep.mjs", [out]).status, 0);
  const results = join(work, "results");
  const r = spawnSync("bash", [join(RUN, "publish.sh"), out, "round-9"], { encoding: "utf8", env: { ...process.env, H2H_RESULTS: results }, timeout: 60000 });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const pub = join(results, "round-9", "runs", "h1-ours-1");
  assert.equal(existsSync(join(pub, "file-link.txt")), false, "a link to a file is not copied");
  assert.equal(existsSync(join(pub, "dir-link")), false, "a link to a directory is not copied or followed");
  assert.equal(existsSync(join(pub, "loop", "back")), false, "a cycle is not followed");
  assert.equal(readFileSync(join(pub, "loop", "real.txt"), "utf8"), "inside the loop dir", "real files next to links are kept");
  const all = spawnSync("grep", ["-r", "TOP SECRET", join(results, "round-9")], { encoding: "utf8" });
  assert.equal(all.status, 1, "the linked secret was not published");
});

test("publish scrub: dashed project paths, the private transcript fields, UUIDs, and whole-segment output paths", () => {
  const work = tmp("scrub2");
  const out = join(work, "round-1");
  const outTen = join(work, "round-10");
  makeBlindRuns(out, 1);
  const runDir = join(out, "h1-ours-1");
  writeFileSync(join(runDir, "notes.txt"), `${out}/a and ${outTen}/b and prefix${out} and ${out}\n-Users-someone-Desktop-proj and /Users/someone/x\n`);
  const uuid = "123e4567-e89b-12d3-a456-426614174000";
  const lines = [
    "no stdin data received in 3s",
    JSON.stringify({ type: "rate_limit_event", rate_limit_info: { used: 41 } }),
    JSON.stringify({ type: "system", session_id: uuid, uuid, request_id: "req_1", memory_paths: ["/Users/someone/.claude/memory"], cwd: "/Users/someone/p", dir: "-Users-someone-Desktop-proj", note: `see ${uuid} and ${out}/x and ${outTen}/y`, rate_limit_info: { a: 1 }, nested: { session_id: "s", keep: "kept" } }),
    JSON.stringify({ type: "result", is_error: false }),
  ];
  writeFileSync(`${runDir}.jsonl`, lines.join("\n") + "\n");
  assert.equal(node("score.mjs", [out]).status, 0);
  assert.equal(node("grade-prep.mjs", [out]).status, 0);
  const results = join(work, "results");
  const r = spawnSync("bash", [join(RUN, "publish.sh"), out, "round-3"], { encoding: "utf8", env: { ...process.env, H2H_RESULTS: results }, timeout: 60000 });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const dest = join(results, "round-3");
  const notes = readFileSync(join(dest, "runs", "h1-ours-1", "notes.txt"), "utf8");
  assert.match(notes, /^<out>\/a and \S*round-10\/b and prefix\S*round-1 and <out>\n/, "the round-1 path matches whole segments only");
  assert.doesNotMatch(notes, /<out>0|prefix<out>/, "round-10 and a longer prefix are not cut");
  assert.match(notes, /\n-Users-<user>-Desktop-proj and \/Users\/<user>\/x\n$/);
  const jsonl = readFileSync(join(dest, "h1-ours-1.jsonl"), "utf8").trim().split("\n");
  assert.equal(jsonl.length, 2, "the non-JSON line and the rate_limit_event line are dropped");
  const sys = JSON.parse(jsonl[0]);
  for (const f of ["session_id", "uuid", "request_id", "memory_paths", "rate_limit_info"]) assert.ok(!(f in sys), `${f} removed`);
  assert.deepEqual(sys.nested, { keep: "kept" });
  assert.equal(sys.cwd, "/Users/<user>/p");
  assert.equal(sys.dir, "-Users-<user>-Desktop-proj");
  assert.match(sys.note, /^see 00000000-0000-0000-0000-000000000000 and <out>\/x and \S*round-10\/y$/);
  assert.deepEqual(JSON.parse(jsonl[1]), { type: "result", is_error: false });
});

test("grade-prep removes only the marker: comments, pure invocations and fenced invocations go, prose keeps its facts with the mention replaced", () => {
  const out = tmp("anon");
  makeBlindRuns(out, 1);
  const marked = readFileSync(join(FIXTURES, "h2", "README.md"), "utf8");
  const tail = [
    "Run `npx ai-slop-linter README.md` before release.",
    "<!--  slop-ignore",
    "  tells -->",
    "Kept line.",
    "then slop -- check done",
    "Inline <!-- slop-ignore x --> text stays.",
    "We ship 5 builds a day and ran `npx ai-slop-linter . --fail-on error` on every one, cutting findings from 17 to 0. Details at https://x.example. ai-slop-linter 0.1.10 is pinned.",
    "```sh",
    "$ npx ai-slop-linter README.md",
    "npx ai-slop-linter docs --format json",
    "```",
    "```js",
    "const slop = 1;",
    "```",
    "$ ai-slop-linter docs/",
    "npx ai-slop-linter README.md",
    "`slop --explain sales`",
    "",
  ].join("\n");
  writeFileSync(join(out, "h2-ours-1", "README.md"), `<!-- slop-ignore dash -->\n${marked}\n${tail}`);
  assert.equal(node("grade-prep.mjs", [out]).status, 0);
  const labels = JSON.parse(readFileSync(join(out, "grading", "labelmap.json"), "utf8"));
  const id = Object.keys(labels).find((k) => labels[k] === "h2-ours-1");
  const body = readFileSync(join(out, "grading", `${id}.txt`), "utf8");
  const graded = body.slice(body.indexOf("TEXT TO GRADE"), body.indexOf("CRITERION"));
  assert.doesNotMatch(graded, /slop-ignore/);
  assert.doesNotMatch(graded, /ai-slop-linter|slop --/);
  assert.ok(graded.startsWith(`TEXT TO GRADE\n${marked.split("\n")[0]}`), "a removed whole-line comment leaves no blank line behind");
  assert.match(graded, /^Run the linter before release\.$/m, "a prose line keeps its text, the mention becomes the linter");
  assert.match(graded, /^Kept line\.$/m);
  assert.match(graded, /^then the linter check done$/m);
  assert.match(graded, /Inline\s+text stays\./);
  assert.ok(graded.includes("We ship 5 builds a day and ran the linter on every one, cutting findings from 17 to 0. Details at https://x.example. the linter 0.1.10 is pinned."), "the facts of a single-line paragraph survive");
  assert.doesNotMatch(graded, /--format json|\$ |```sh\n\$/, "a fence of only invocations, and bare invocation lines, are removed");
  assert.match(graded, /```js\nconst slop = 1;\n```/, "other code blocks are kept");
  assert.doesNotMatch(graded, /```sh\n```/, "the fence of only invocations goes whole, not just its lines");
  assert.doesNotMatch(graded, /^the linter$/m, "a line that is only an inline command is removed");
  assert.match(body, /^GRADING NOTES\n.*slop-ignore.*removed/m, "the header records the removal");
  for (const other of Object.keys(labels)) {
    assert.match(readFileSync(join(out, "grading", `${other}.txt`), "utf8"), /^GRADING NOTES/, "the same header in every file");
  }
  assert.ok(body.includes(marked.trimEnd().split("\n")[0]));
});

test("publish.sh publishes failed runs, scored run directories without node_modules, big files or binaries, and scrubs user and scratchpad paths", () => {
  const work = tmp("publish2");
  const out = join(work, "out");
  makeBlindRuns(out, 1);
  const runDir = join(out, "h1-ours-1");
  mkdirSync(join(runDir, "node_modules", "dep"), { recursive: true });
  writeFileSync(join(runDir, "node_modules", "dep", "index.js"), "module.exports = 1;\n");
  mkdirSync(join(runDir, "sub"));
  writeFileSync(join(runDir, "sub", "keep.txt"), "kept\n");
  writeFileSync(join(runDir, "big.txt"), "a".repeat(1024 * 1024 + 1));
  writeFileSync(join(runDir, "exactly.txt"), "b".repeat(1024 * 1024));
  writeFileSync(join(runDir, "image.bin"), Buffer.from([0x89, 0x50, 0x00, 0x01, 0x02]));
  writeFileSync(join(runDir, "paths.txt"), `see /Users/someone/Desktop/x and /private/tmp/claude-501/-Users-someone-p/abc/scratchpad/y and ${out}/h1-ours-1 and /var/folders/ab/cdef123/T/tmpdir\n`);
  writeFileSync(`${runDir}.jsonl`, `{"cwd":"/Users/someone/p","file":"/tmp/claude-501/s1/file"}\n{"type":"result","is_error":false}\n`);
  writeFileSync(join(out, "h1-ours-2.failed.jsonl"), '{"path":"/Users/someone/failed"}\n');
  mkdirSync(join(out, "h1-ours-3"));
  writeFileSync(join(out, "h1-ours-3", "orphan.txt"), "no transcript\n");
  assert.equal(node("score.mjs", [out]).status, 0);
  assert.equal(node("grade-prep.mjs", [out]).status, 0);
  const results = join(work, "results");
  const r = spawnSync("bash", [join(RUN, "publish.sh"), out, "round-8"], { encoding: "utf8", env: { ...process.env, H2H_RESULTS: results } });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  const dest = join(results, "round-8");
  const pub = join(dest, "runs", "h1-ours-1");
  assert.ok(existsSync(join(pub, "note.md")));
  assert.equal(readFileSync(join(pub, "sub", "keep.txt"), "utf8"), "kept\n");
  assert.equal(existsSync(join(pub, "node_modules")), false, "no node_modules");
  assert.equal(existsSync(join(pub, "big.txt")), false, "a file over 1 MB is skipped");
  assert.ok(existsSync(join(pub, "exactly.txt")), "a file of exactly 1 MB is kept");
  assert.equal(existsSync(join(pub, "image.bin")), false, "a binary file is skipped");
  assert.equal(existsSync(join(dest, "runs", "h1-ours-3")), false, "a directory without a valid transcript is not published");
  assert.equal(readFileSync(join(dest, "failed", "h1-ours-2.failed.jsonl"), "utf8"), '{"path":"/Users/<user>/failed"}\n', "failed transcripts are scrubbed too");
  const paths = readFileSync(join(pub, "paths.txt"), "utf8");
  assert.equal(paths, "see /Users/<user>/Desktop/x and <scratchpad> and <out>/h1-ours-1 and <tmp>/tmpdir\n");
  assert.equal(readFileSync(join(dest, "h1-ours-1.jsonl"), "utf8").split("\n")[0], '{"cwd":"/Users/<user>/p","file":"<scratchpad>"}');
  // nothing published names a user home or a scratchpad
  const stack = [dest];
  while (stack.length) {
    const d = stack.pop();
    for (const n of readdirSync(d)) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) { stack.push(p); continue; }
      const t = readFileSync(p, "utf8");
      assert.doesNotMatch(t, /\/Users\/(?!<user>)[^/\s"]+|\/tmp\/claude-\d+|\/var\/folders\//, p);
    }
  }
});

// ---- retired tasks (2026-10-22): the scripts work on the active tasks only unless --include-retired ----------------
const retiredScores = () => {
  const out = scoresFor(caseScores(PASSING));
  // Retired tasks hold scores for three arms: ours and blader at full marks (a tie, which would fail rule B on an active task) and base at zero.
  for (const task of RETIRED_IDS) Object.assign(out, scoresFor({ [task]: { ours: [5, 5, 5], base: [0, 0, 0], blader: [5, 5, 5] } }));
  return out;
};

test("summarize prints the retired tasks with their reason and leaves them out of the tables, the totals and the win rule", () => {
  const out = summarize(retiredScores());
  assert.match(out, /^Scope: these 12 tasks,/m);
  assert.match(out, /^Retired tasks \(not in the totals or the win rule\):$/m);
  for (const t of tasks().filter((x) => x.status === "retired")) {
    assert.match(out, new RegExp(`^- ${t.id} \\(replaced by ${t.retired.replacedBy}\\): ${t.retired.reason.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "m"), `${t.id} is listed with its reason`);
    assert.doesNotMatch(out, new RegExp(`^\\| ${t.id}( \\(retired\\))? \\|`, "m"), `${t.id} has no table row`);
  }
  assert.match(out, /Win rule: PASS/);
  assert.match(out, /of 60\)/, "the denominator counts the 12 active tasks only");
});

test("summarize --include-retired adds retired rows marked retired, and the totals and the win rule do not change", () => {
  const scores = retiredScores();
  const plain = summarize(scores);
  const r = summarizeRaw(scores, { args: ["--include-retired"] });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /Failing tasks: none$/m, "a retired task on which a rival ties ours does not fail the round");
  // The flag may come first: the round directory is still found.
  const dir = tmp("summary-flag-first");
  writeFileSync(join(dir, "scores.json"), JSON.stringify(scores));
  const first = node("summarize.mjs", ["--include-retired", dir]);
  assert.equal(first.status, 0, first.stderr);
  assert.equal(first.stdout, r.stdout);
  for (const id of RETIRED_IDS) assert.match(r.stdout, new RegExp(`^\\| ${id} \\(retired\\) \\|`, "m"), `${id} row`);
  const pick = (text, re) => text.match(re)?.[0];
  for (const re of [/^\| \*\*Mean total.*$/m, /^\| \*\*Percent.*$/m, /^Total \(OUTCOME\).*$/m, /^Win rule: .*$/m]) {
    assert.equal(pick(r.stdout, re), pick(plain, re), `${re} is the same with and without the flag`);
  }
});

test("score.mjs skips the runs of retired tasks, and scores them with --include-retired", () => {
  const out = tmp("score-retired");
  makeBlindRuns(out, 1);
  const dir = join(out, "h4-ours-1");
  mkdirSync(dir);
  cpSync(join(FIXTURES, "h4", "RELEASE-NOTES.md"), join(dir, "RELEASE-NOTES.md"));
  writeFileSync(`${dir}.jsonl`, '{"type":"result","is_error":false}\n');
  assert.equal(node("score.mjs", [out]).status, 0);
  assert.equal("h4-ours-1" in JSON.parse(readFileSync(join(out, "scores.json"), "utf8")), false);
  assert.equal(node("score.mjs", [out, "--include-retired"]).status, 0);
  assert.equal("h4-ours-1" in JSON.parse(readFileSync(join(out, "scores.json"), "utf8")), true);
  // The flag may come first: the directory is still the first positional argument.
  rmSync(join(out, "scores.json"));
  assert.equal(node("score.mjs", ["--include-retired", out]).status, 0);
  assert.equal("h4-ours-1" in JSON.parse(readFileSync(join(out, "scores.json"), "utf8")), true);
});

test("grade-prep grades the active blind tasks only; --include-retired adds h4", () => {
  const out = tmp("grade-retired");
  makeBlindRuns(out, 1);
  const dir = join(out, "h4-ours-1");
  mkdirSync(dir);
  cpSync(join(FIXTURES, "h4", "RELEASE-NOTES.md"), join(dir, "RELEASE-NOTES.md"));
  writeFileSync(`${dir}.jsonl`, '{"type":"result","is_error":false}\n');
  assert.equal(node("grade-prep.mjs", [out, "20261021"]).status, 0);
  assert.equal(Object.values(JSON.parse(readFileSync(join(out, "grading", "labelmap.json"), "utf8"))).includes("h4-ours-1"), false);
  assert.equal(node("grade-prep.mjs", [out, "20261021", "--include-retired", "--force"]).status, 0);
  assert.equal(Object.values(JSON.parse(readFileSync(join(out, "grading", "labelmap.json"), "utf8"))).includes("h4-ours-1"), true);
});

test("publish keeps the run directories of retired tasks (publish-files lists every run)", () => {
  const out = tmp("publish-retired");
  const dest = tmp("publish-retired-dest");
  const dir = join(out, "h4-ours-1");
  mkdirSync(dir);
  writeFileSync(join(dir, "RELEASE-NOTES.md"), "x\n");
  writeFileSync(`${dir}.jsonl`, '{"type":"result","is_error":false}\n');
  const r = node("publish-files.mjs", [out, dest]);
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(dest, "runs", "h4-ours-1", "RELEASE-NOTES.md")));
});

test("rerun.sh --include-retired is passed to run-all, score and grade-prep; without it none of them gets the flag", () => {
  const withFlag = spawnSync("bash", [join(BENCH, "rerun.sh"), "--dry-run", "--include-retired", "--out", join(tmp("rerun"), "o")], { encoding: "utf8" });
  assert.equal(withFlag.status, 0, withFlag.stderr);
  for (const script of ["run-all.sh", "score.mjs", "grade-prep.mjs"]) assert.match(withFlag.stdout, new RegExp(`${script.replace(".", "\\.")}.*--include-retired`), script);
  const without = spawnSync("bash", [join(BENCH, "rerun.sh"), "--dry-run", "--out", join(tmp("rerun"), "o")], { encoding: "utf8" });
  assert.equal(without.status, 0, without.stderr);
  assert.doesNotMatch(without.stdout, /--include-retired/);
});

test("labels.json still labels every criterion of h1 to h12, and the new tasks are labelled by the auditor later", () => {
  const doc = JSON.parse(readFileSync(join(BENCH, "labels.json"), "utf8"));
  for (const task of tasks().filter((t) => !["h13", "h14", "h15", "h16", "h17", "h18"].includes(t.id))) {
    for (const c of task.criteria) assert.ok(["outcome", "process"].includes(doc.labels[task.id]?.[c.id]?.label), `${task.id} ${c.id}`);
  }
});
