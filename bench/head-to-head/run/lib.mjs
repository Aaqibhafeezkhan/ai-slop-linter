// Shared helpers for the head-to-head run, grade and summary scripts. Node built-ins only.
// Imported by score.mjs, grade-prep.mjs, grade-collect.mjs and summarize.mjs; not run directly.
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const BENCH = join(HERE, "..");
export const BIN_OURS = join(HERE, "bin-ours");
export const CHECK = join(BENCH, "checks", "check.mjs");
export const FIXTURES = join(BENCH, "fixtures");
// Task ids, blind-graded tasks and arms are read from tasks.json, never hard-coded.
// Every task has a status, "active" or "retired". The scripts run and summarise the active tasks only, unless
// they are called with --include-retired (or H2H_INCLUDE_RETIRED=1). A retired task stays in tasks.json with its
// reason and evidence; its fixture, golden, checks and old results stay in the repository.
export const ALL_TASKS = JSON.parse(readFileSync(join(BENCH, "tasks.json"), "utf8")).tasks;
export const INCLUDE_RETIRED = process.argv.includes("--include-retired") || process.env.H2H_INCLUDE_RETIRED === "1";
export const isRetired = (t) => t.status === "retired";
export const ACTIVE_TASKS = ALL_TASKS.filter((t) => !isRetired(t));
export const RETIRED_TASKS = ALL_TASKS.filter(isRetired);
export const ACTIVE_IDS = ACTIVE_TASKS.map((t) => t.id);
// The tasks the scripts work on: active ones, plus the retired ones with --include-retired.
export const TASK_LIST = INCLUDE_RETIRED ? ALL_TASKS : ACTIVE_TASKS;
export const TASK_IDS = TASK_LIST.map((t) => t.id);
// Competitors, each with a natural arm and an invoked arm (-inv). Our arm and the baseline have one form.
export const COMPETITORS = ["blader", "unslop", "everwrite"];
export const ARMS = ["ours", "blader", "blader-inv", "unslop", "unslop-inv", "everwrite", "everwrite-inv", "base"];
export const CRITERIA = ["C1", "C2", "C3", "C4", "C5"];
export const DEFAULT_MODEL = "claude-sonnet-5-5";
// Tasks with at least one criterion of kind "blind" (h1..h4 C5). Every other criterion is scripted.
export const BLIND_TASKS = TASK_LIST.filter((t) => t.criteria.some((c) => c.kind === "blind")).map((t) => t.id);
// The file each blind-graded task edits (the grader reads it). Scripted tasks need no entry here:
// checks/check.mjs has its own table.
const BLIND_OUTPUT = { h1: "note.md", h2: "README.md", h3: "pr.md", h4: "RELEASE-NOTES.md" };
export const OUTPUT_FILE = Object.fromEntries(BLIND_TASKS.map((id) => [id, BLIND_OUTPUT[id]]));
// A Bash call in a transcript that ran a deterministic check. Reported separately, never scored.
export const PROCESS_RE = /ai-slop-linter|\bslop\b|tells\.py|grep -c|grep -n|wc -l|diff /;

const RUN_RE = new RegExp(`^(${ALL_TASKS.map((t) => t.id).join("|")})-(${ARMS.join("|")})-(\\d+)$`);

// The competitor an arm belongs to, or null for ours and base.
export function competitorOf(arm) {
  const name = arm.replace(/-inv$/, "");
  return COMPETITORS.includes(name) ? name : null;
}

// Run directories under H2H_OUT, in task, arm, iteration order. Runs of a retired task are left out unless
// --include-retired was passed or all is true (publishing a finished round keeps every run).
export function listRuns(h2hOut, all = false) {
  const runs = [];
  const wanted = new Set((all ? ALL_TASKS : TASK_LIST).map((t) => t.id));
  for (const name of readdirSync(h2hOut)) {
    const m = RUN_RE.exec(name);
    const dir = join(h2hOut, name);
    if (!m || !wanted.has(m[1]) || !statSync(dir).isDirectory()) continue;
    runs.push({ key: name, task: m[1], arm: m[2], iteration: Number(m[3]), dir });
  }
  const ids = ALL_TASKS.map((t) => t.id);
  const order = (x) => ids.indexOf(x.task) * 10000 + ARMS.indexOf(x.arm) * 100 + x.iteration;
  return runs.sort((a, b) => order(a) - order(b));
}

export function loadTasks() {
  return ALL_TASKS;
}

// labels.json: { labels: { <task>: { <criterion>: { label: "outcome" | "process" } } } }.
// Returns { labels } on success or { error } when the file is missing, unreadable, or does not label
// every criterion of tasks.json with "outcome" or "process".
export function loadLabels(path = process.env.H2H_LABELS || join(BENCH, "labels.json")) {
  if (!existsSync(path)) return { error: `labels file missing: ${path}` };
  let doc;
  try {
    doc = JSON.parse(readFileSync(path, "utf8"));
  } catch (err) {
    return { error: `labels file is not valid JSON: ${path} (${err.message})` };
  }
  const labels = {};
  const problems = [];
  for (const task of TASK_LIST) {
    labels[task.id] = {};
    for (const c of task.criteria) {
      const label = doc?.labels?.[task.id]?.[c.id]?.label;
      if (label !== "outcome" && label !== "process") problems.push(`${task.id} ${c.id}`);
      else labels[task.id][c.id] = label;
    }
  }
  if (problems.length) return { error: `no outcome/process label for: ${problems.join(", ")} (in ${path})` };
  return { labels };
}

export function taskById(id) {
  const t = ALL_TASKS.find((x) => x.id === id);
  if (!t) throw new Error(`unknown task ${id}`);
  return t;
}

// Seeded PRNG (mulberry32): the same seed always gives the same order.
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

export function shuffle(items, rng) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// The Bash command strings of a stream-json transcript. Lines that are not JSON are skipped.
export function bashCommands(jsonlPath) {
  if (!existsSync(jsonlPath)) return [];
  const commands = [];
  for (const line of readFileSync(jsonlPath, "utf8").split("\n")) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    const content = event?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block?.type === "tool_use" && block.name === "Bash" && typeof block.input?.command === "string") {
        commands.push(block.input.command);
      }
    }
  }
  return commands;
}

// A tool call in a transcript that points at the answer key: the repository's bench/head-to-head, the
// golden outputs (golden/h<N>), the competitors' After texts (after/h<N>), checker data, tasks.json, the
// home-ground lists (home/h7..), labels.json, scores.json, blind.json, labelmap, probes/ or the repository's .superpowers. Any tool counts (Bash, Read, Grep, Glob, Edit...); the whole input is searched.
export const LEAK_RE = /bench\/head-to-head|golden\/h\d|after\/h\d|checker-data|tasks\.json|home\/h\d|labels\.json|scores\.json|blind\.json|labelmap|probes\/|\.superpowers/;

// The tool calls of a stream-json transcript that match LEAK_RE, as { tool, input } (input cut to 200 characters).
export function leakCalls(jsonlPath) {
  if (!existsSync(jsonlPath)) return [];
  const hits = [];
  for (const line of readFileSync(jsonlPath, "utf8").split("\n")) {
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    const content = event?.message?.content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (block?.type !== "tool_use") continue;
      const input = JSON.stringify(block.input ?? {});
      if (LEAK_RE.test(input)) hits.push({ tool: String(block.name), input: input.slice(0, 200) });
    }
  }
  return hits;
}

export function usageExit(message) {
  console.error(message);
  process.exit(2);
}
