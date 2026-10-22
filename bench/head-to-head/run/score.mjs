#!/usr/bin/env node
// usage: node bench/head-to-head/run/score.mjs <H2H_OUT> [--out DIR] [--include-retired]
// Runs checks/check.mjs on every run directory of an active task under <H2H_OUT> (retired tasks are skipped
// unless --include-retired is given). Writes <H2H_OUT>/scores.json
// (or DIR/scores.json when --out is given, for example bench/head-to-head/results/round-1)
// ({ "<task>-<arm>-<i>": {C1..C5} }; blind C5 stays null until grade-collect.mjs fills it) and
// <H2H_OUT>/process.json (true when the transcript shows a Bash call that ran a deterministic check;
// reported separately and not scored) and <H2H_OUT>/leaks.json (tool calls that mention the answer key; such a
// run also gets leak: true in scores.json). A run directory with no <dir>.jsonl transcript is skipped (no run, not all-zero).
// Exits non-zero if a check fails to run.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { delimiter, join } from "node:path";
import { BIN_OURS, CHECK, CRITERIA, PROCESS_RE, bashCommands, leakCalls, listRuns, usageExit } from "./lib.mjs";

const args = process.argv.slice(2).filter((a) => a !== "--include-retired");
const outFlag = args.indexOf("--out");
let outDir;
if (outFlag !== -1) {
  outDir = args[outFlag + 1];
  if (!outDir) usageExit("usage: score.mjs <H2H_OUT> [--out DIR] [--include-retired]");
  args.splice(outFlag, 2);
}
const h2hOut = args[0];
if (!h2hOut) usageExit("usage: score.mjs <H2H_OUT> [--out DIR] [--include-retired]");
outDir ??= h2hOut;
mkdirSync(outDir, { recursive: true });

// The h6 and h15 command checks run for EVERY arm with the same PATH: the bin-ours shim directory first (so
// `npx ai-slop-linter`, `ai-slop-linter` and `npm install ai-slop-linter` resolve to the local build for every
// arm, as they would after a release), then the normal PATH. The npm shim installs the round's tarball
// (H2H_OURS_TARBALL, or the first *.tgz in <H2H_OUT>/ours-tarball/).
// The shims run the git-archive copy of the code under test (H2H_CODE_DIR, or <out>/code-<12 sha> from
// <out>/code-commit.txt), never the working tree; the copy's own shim directory is used when it has one.
const checkEnv = { ...process.env };
const commitFile = join(h2hOut, "code-commit.txt");
if (!checkEnv.H2H_CODE_DIR && existsSync(commitFile)) {
  const copy = join(h2hOut, `code-${readFileSync(commitFile, "utf8").trim().slice(0, 12)}`);
  if (existsSync(copy)) checkEnv.H2H_CODE_DIR = copy;
}
const copyBin = checkEnv.H2H_CODE_DIR ? join(checkEnv.H2H_CODE_DIR, "bench", "head-to-head", "run", "bin-ours") : "";
const checkPath = `${copyBin && existsSync(copyBin) ? copyBin : BIN_OURS}${delimiter}${process.env.PATH ?? ""}`;
if (!checkEnv.H2H_OURS_TARBALL || !existsSync(checkEnv.H2H_OURS_TARBALL)) {
  delete checkEnv.H2H_OURS_TARBALL;
  const tarDir = join(h2hOut, "ours-tarball");
  const tgz = existsSync(tarDir) ? readdirSync(tarDir).find((f) => f.endsWith(".tgz")) : undefined;
  if (tgz) checkEnv.H2H_OURS_TARBALL = join(tarDir, tgz);
}
const scores = {};
const processCheck = {};
const leaks = {};

const skipped = [];
for (const run of listRuns(h2hOut)) {
  // A run directory without a valid transcript <dir>.jsonl is no run: it is not scored as all-zero.
  if (!existsSync(`${run.dir}.jsonl`)) {
    skipped.push(run.key);
    continue;
  }
  const args = [CHECK, run.task, run.dir];
  if (run.task === "h6" || run.task === "h15") args.push("--path", checkPath);
  const r = spawnSync(process.execPath, args, { encoding: "utf8", timeout: 600000, env: checkEnv });
  if (r.status !== 0) {
    console.error(`check failed for ${run.key} (exit ${r.status}): ${r.stderr}`);
    process.exit(1);
  }
  const result = JSON.parse(r.stdout.trim().split("\n").pop());
  scores[run.key] = Object.fromEntries(CRITERIA.map((c) => [c, result[c]]));
  // A tool call that mentions the answer key flags the run (leak: true); the round is INCOMPLETE until
  // the flagged runs are reviewed (summarize.mjs prints a LEAK line for each).
  const leaked = leakCalls(`${run.dir}.jsonl`);
  if (leaked.length) {
    scores[run.key].leak = true;
    leaks[run.key] = leaked;
  }
  processCheck[run.key] = bashCommands(`${run.dir}.jsonl`).some((cmd) => PROCESS_RE.test(cmd));
}

writeFileSync(join(outDir, "scores.json"), JSON.stringify(scores, null, 2) + "\n");
writeFileSync(join(outDir, "leaks.json"), JSON.stringify(leaks, null, 2) + "\n");
writeFileSync(join(outDir, "process.json"), JSON.stringify(processCheck, null, 2) + "\n");
if (skipped.length) console.log(`no run (no valid transcript), not scored: ${skipped.length}: ${skipped.join(", ")}`);
if (Object.keys(leaks).length) console.log(`LEAK: ${Object.keys(leaks).length} run(s) have tool calls that mention the answer key: ${Object.keys(leaks).join(", ")} (see leaks.json)`);
console.log(`scored ${Object.keys(scores).length} runs into ${join(outDir, "scores.json")}`);
