#!/usr/bin/env node
// usage: node code-manifest.mjs <dir> [--all | --hash]
// Prints "<sha256>  <relative path>" for the files of <dir> that matter for the code under test, sorted by
// path: dist/**/*.js, skills/**, hooks/** and .claude-plugin/** (or every file with --all). Symbolic links
// are never followed or listed. --hash prints the SHA-256 of the whole listing instead (with --all as well when given
// first: `--all --hash`). Node built-ins only.
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

export function listFiles(dir, rel = "") {
  const out = [];
  for (const name of readdirSync(join(dir, rel)).sort()) {
    const r = rel === "" ? name : `${rel}/${name}`;
    const st = lstatSync(join(dir, r));
    if (st.isSymbolicLink()) continue;
    if (st.isDirectory()) out.push(...listFiles(dir, r));
    else if (st.isFile()) out.push(r);
  }
  return out;
}

const sha = (buf) => createHash("sha256").update(buf).digest("hex");
const matters = (r) => (r.startsWith("dist/") && r.endsWith(".js")) || r.startsWith("skills/") || r.startsWith("plugin/") || r.startsWith("hooks/") || r.startsWith(".claude-plugin/");

export function manifest(dir, all = false) {
  const files = listFiles(dir).filter((r) => all || matters(r)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
  return files.map((r) => `${sha(readFileSync(join(dir, r)))}  ${r}\n`).join("");
}

export const manifestHash = (dir, all = false) => sha(manifest(dir, all));

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("code-manifest.mjs")) {
  const args = process.argv.slice(2);
  const dir = args.find((a) => !a.startsWith("--"));
  if (!dir) {
    console.error("usage: code-manifest.mjs <dir> [--all] [--hash]");
    process.exit(2);
  }
  const all = args.includes("--all");
  if (args.includes("--hash")) console.log(manifestHash(dir, all));
  else process.stdout.write(manifest(dir, all));
}
