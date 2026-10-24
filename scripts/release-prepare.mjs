#!/usr/bin/env node
// Run by scripts/release.mjs as `npm run release:prepare`, after it has set the version in
// package.json. Brings the packages that publish on their own (test/extra-versions.test.mjs)
// to the same version, and rewrites llms-full.txt, which quotes the README. Node built-ins only.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
for (const rel of ["textlint-rule-ai-slop/package.json", "vscode/package.json"]) {
  const path = join(root, rel);
  const text = readFileSync(path, "utf8");
  let next = text.replace(/("version":\s*")[^"]*(")/, `$1${version}$2`);
  // Only a version range moves; a local spec such as "file:.." is deliberate and stays.
  next = next.replace(/("ai-slop-linter":\s*")\^?\d[^"]*(")/, `$1^${version}$2`);
  if (next !== text) writeFileSync(path, next);
  console.log(`release:prepare: ${rel} -> ${version}`);
}
execFileSync(process.execPath, [join(root, "scripts/llms-full.mjs")], { stdio: "inherit" });
console.log("release:prepare: llms-full.txt rewritten");
