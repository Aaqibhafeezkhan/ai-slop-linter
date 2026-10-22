#!/usr/bin/env node
// usage: node cell-meta.mjs write <out> <task> <arm> <iteration>
//        node cell-meta.mjs check <out> <task> <arm> <iteration>
//        node cell-meta.mjs commit <out> <task> <arm> <iteration>
// Every finished cell has <out>/<task>-<arm>-<i>.meta.json: the code commit and tree under test, arm, task,
// the SHA-256 of the task fixture (every file, dotfiles included), of the exact prompt text handed to claude,
// and of the plugin export the arm ran with (a manifest of every file), plus the model id and the date. A cell
// is reusable on a resumed round only when those hashes still match what the round would run now.
//   write   records the meta of the cell (run-one.sh, after a valid transcript).
//   check   prints "ok", "nometa" (no record, so reuse cannot be proved) or "stale: <what differs>".
//           The code commit counts for the ours arm only: a competitor or baseline cell does not depend on it.
//   commit  prints the commit recorded for the cell ("none" when there is no record).
// The code commit and tree come from <out>/code-commit.txt and code-tree.txt (H2H_CODE_COMMIT and
// H2H_CODE_TREE override); "unknown" when neither exists. Node built-ins only.
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BENCH, DEFAULT_MODEL } from "./lib.mjs";
import { manifestHash } from "./code-manifest.mjs";

const sha = (s) => createHash("sha256").update(s).digest("hex");
const readTrim = (p) => (existsSync(p) ? readFileSync(p, "utf8").trim() : "");

export function expectedMeta(out, task, arm, iteration) {
  const tasks = JSON.parse(readFileSync(join(BENCH, "tasks.json"), "utf8")).tasks;
  const t = tasks.find((x) => x.id === task);
  if (!t) throw new Error(`unknown task: ${task}`);
  const natural = arm.replace(/-inv$/, "");
  let prompt = t.prompt;
  if (natural !== arm) {
    const inv = JSON.parse(readFileSync(join(BENCH, "run", "invocations.json"), "utf8"))[arm];
    prompt = `${inv} ${t.prompt}`;
  }
  const pluginDir = join(out, `plugin-${natural}`);
  return {
    commit: process.env.H2H_CODE_COMMIT || readTrim(join(out, "code-commit.txt")) || "unknown",
    tree: process.env.H2H_CODE_TREE || readTrim(join(out, "code-tree.txt")) || "unknown",
    benchTree: process.env.H2H_CODE_BENCH_TREE || readTrim(join(out, "code-bench-tree.txt")) || "unknown",
    arm,
    task,
    iteration: Number(iteration),
    fixtureSha256: manifestHash(join(BENCH, "fixtures", t.fixture), true),
    promptSha256: sha(prompt),
    pluginManifestSha256: existsSync(pluginDir) ? manifestHash(pluginDir, true) : "missing",
    model: process.env.H2H_MODEL || DEFAULT_MODEL,
    date: new Date().toISOString().slice(0, 10),
  };
}

const metaPath = (out, task, arm, iteration) => join(out, `${task}-${arm}-${iteration}.meta.json`);

export function checkMeta(out, task, arm, iteration) {
  const p = metaPath(out, task, arm, iteration);
  if (!existsSync(p)) return "nometa";
  let have;
  try { have = JSON.parse(readFileSync(p, "utf8")); } catch { return "nometa"; }
  const want = expectedMeta(out, task, arm, iteration);
  const keys = ["arm", "task", "fixtureSha256", "promptSha256", "pluginManifestSha256", "model"];
  if (arm === "ours") keys.push("commit");
  const diff = keys.filter((k) => have[k] !== want[k]);
  return diff.length === 0 ? "ok" : `stale: ${diff.join(", ")}`;
}

if (process.argv[1]?.endsWith("cell-meta.mjs")) {
  const [cmd, out, task, arm, iteration] = process.argv.slice(2);
  if (!cmd || !out || !task || !arm || !iteration) {
    console.error("usage: cell-meta.mjs write|check|commit <out> <task> <arm> <iteration>");
    process.exit(2);
  }
  if (cmd === "write") writeFileSync(metaPath(out, task, arm, iteration), `${JSON.stringify(expectedMeta(out, task, arm, iteration), null, 2)}\n`);
  else if (cmd === "check") console.log(checkMeta(out, task, arm, iteration));
  else if (cmd === "commit") {
    const p = metaPath(out, task, arm, iteration);
    let c = "none";
    try { c = JSON.parse(readFileSync(p, "utf8")).commit ?? "none"; } catch { /* no record */ }
    console.log(c);
  } else { console.error(`unknown command: ${cmd}`); process.exit(2); }
}
