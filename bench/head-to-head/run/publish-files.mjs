#!/usr/bin/env node
// usage: node publish-files.mjs <out dir> <dest dir>
// Helper of publish.sh. (1) Copies every scored run directory <out>/<task>-<arm>-<i>/ (the files the
// agent left behind) to <dest>/runs/<key>/, without node_modules and .git, skipping any file over 1 MB and
// any binary file (a NUL byte in the first 8 KB). Symbolic links are never followed or copied (lstat).
// (2) Scrubs every text file under <dest>: /Users/<name>
// becomes /Users/<user>, the output directory becomes <out>, a Claude scratchpad path (/tmp/claude-<uid>/...)
// becomes <scratchpad>, a macOS per-user temporary directory (/var/folders/xx/yyyy/T) becomes <tmp>,
// and the value of HOME becomes <home>. Nothing is changed in the output directory itself.
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, writeFileSync } from "node:fs";
import { userInfo } from "node:os";
import { join, relative } from "node:path";
import { listRuns } from "./lib.mjs";

const MAX_BYTES = 1024 * 1024;
const [out, dest] = process.argv.slice(2);
if (!out || !dest) {
  console.error("usage: publish-files.mjs <out dir> <dest dir>");
  process.exit(2);
}

const isBinary = (buf) => buf.subarray(0, 8192).includes(0);

function copyTree(src, to) {
  for (const name of readdirSync(src)) {
    if (name === "node_modules" || name === ".git") continue;
    const from = join(src, name);
    const st = lstatSync(from);
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) {
      copyTree(from, join(to, name));
    } else if (st.isFile() && st.size <= MAX_BYTES) {
      const buf = readFileSync(from);
      if (isBinary(buf)) continue;
      mkdirSync(to, { recursive: true });
      writeFileSync(join(to, name), buf);
    }
  }
}

let copied = 0;
for (const run of listRuns(out, true)) {
  if (!existsSync(`${run.dir}.jsonl`)) continue; // scored runs only
  copyTree(run.dir, join(dest, "runs", run.key));
  copied += 1;
}

// ---- scrub -------------------------------------------------------------------------------------
const literal = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// A path matches as whole segments only: /tmp/h2h-round-1 does not match inside /tmp/h2h-round-10 or
// /x/tmp/h2h-round-1.
const wholePath = (p) => new RegExp(`(?<![A-Za-z0-9_.-])${literal(p)}(?![A-Za-z0-9_.-])`, "g");
const outPaths = new Set([out.replace(/\/+$/, "")]);
try {
  outPaths.add(realpathSync(out));
} catch {}
const ZERO_UUID = "00000000-0000-0000-0000-000000000000";
const rules = [];
for (const p of [...outPaths].sort((a, b) => b.length - a.length)) rules.push([wholePath(p), "<out>"]);
rules.push([/(?:\/private)?\/tmp\/claude-\d+(?:\/[^\s"'\\)]*)?/g, "<scratchpad>"]);
rules.push([/(?:\/private)?\/var\/folders\/[^/\s"'\\]+\/[^/\s"'\\]+\/T/g, "<tmp>"]);
rules.push([/\/Users\/[^/\s"'\\]+/g, "/Users/<user>"]);
// The dashed form of a project path in Claude's own directory names: -Users-<name>-Desktop-...
let account = "";
try {
  account = userInfo().username;
} catch {}
if (account) rules.push([new RegExp(`-Users-${literal(account)}(?![A-Za-z0-9_.])`, "g"), "-Users-<user>"]);
rules.push([/-Users-[^-/\s"'\\]+/g, "-Users-<user>"]);
rules.push([/-(?:private-)?tmp-claude-\d+/g, "-<scratchpad>"]);
rules.push([/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, ZERO_UUID]);
if (process.env.HOME && process.env.HOME.length > 1) rules.push([new RegExp(`${literal(process.env.HOME.replace(/\/+$/, ""))}(?=[/\\s"'\\\\]|$)`, "g"), "<home>"]);
const applyRules = (text) => rules.reduce((t, [re, to]) => t.replace(re, to), text);

// The private fields of a stream-json transcript (see probes/README.md, "Scrubbed"): lines that are not JSON
// and rate_limit_event lines are dropped; rate_limit_info, session_id, uuid, request_id and memory_paths are
// removed at any depth; UUIDs inside strings become the all-zero UUID. Lines are written back as compact JSON.
const PRIVATE_FIELDS = new Set(["rate_limit_info", "session_id", "uuid", "request_id", "memory_paths"]);
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).filter(([k]) => !PRIVATE_FIELDS.has(k)).map(([k, v]) => [k, clean(v)]));
  }
  return value;
}
function scrubJsonl(text) {
  const kept = [];
  for (const line of text.split("\n")) {
    if (line.trim() === "") continue;
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      continue;
    }
    if (event?.type === "rate_limit_event") continue;
    kept.push(applyRules(JSON.stringify(clean(event))));
  }
  return kept.length ? `${kept.join("\n")}\n` : "";
}

function scrubTree(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = lstatSync(p);
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) {
      scrubTree(p);
      continue;
    }
    const buf = readFileSync(p);
    if (isBinary(buf)) continue;
    const before = buf.toString("utf8");
    const text = name.endsWith(".jsonl") ? scrubJsonl(before) : applyRules(before);
    if (text !== before) writeFileSync(p, text);
  }
}
if (existsSync(dest)) scrubTree(dest);
console.log(`copied ${copied} run director${copied === 1 ? "y" : "ies"}; scrubbed ${relative(process.cwd(), dest) || dest}`);
