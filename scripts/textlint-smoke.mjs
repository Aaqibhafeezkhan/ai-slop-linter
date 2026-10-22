#!/usr/bin/env node
// Installs the packed rule and a pinned real textlint into an empty directory and runs textlint
// on two files, so the rule is proved against textlint itself and not only against the
// stand-in context in test/textlint.test.mjs. Needs network (npm install) and a built dist/.
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";

const TEXTLINT_VERSION = "15.8.0";
const root = process.cwd();
const tmp = mkdtempSync(join(tmpdir(), "textlint-smoke-"));
const npm = (args, cwd, stdio = "pipe") => execFileSync("npm", args, { cwd, encoding: "utf8", stdio });
const pack = (dir) => join(tmp, npm(["pack", "--silent", "--ignore-scripts", "--pack-destination", tmp], dir).trim().split("\n").pop());

try {
  const core = pack(root);
  const wrapper = pack(join(root, "textlint-rule-ai-slop"));
  npm(["init", "-y"], tmp);
  npm(["install", "--no-audit", "--no-fund", `textlint@${TEXTLINT_VERSION}`, core, wrapper], tmp);
  writeFileSync(join(tmp, ".textlintrc.json"), JSON.stringify({ rules: { "ai-slop": true } }));
  writeFileSync(join(tmp, "bad.md"), "# Notes\n\nLet's dive in — this is a testament to the work.\n");
  writeFileSync(join(tmp, "good.md"), "# Notes\n\nRetry the request twice, then return the status code.\n");
  const textlint = (...args) => spawnSync(join(tmp, "node_modules", ".bin", "textlint"), args, { cwd: tmp, encoding: "utf8" });

  const bad = textlint("bad.md");
  assert.equal(bad.status, 1, `bad.md should fail:\n${bad.stdout}\n${bad.stderr}`);
  assert.match(bad.stdout, /\(dash\)/);
  assert.match(bad.stdout, /\(announcing\)/);

  const good = textlint("good.md");
  assert.equal(good.status, 0, `good.md should pass:\n${good.stdout}\n${good.stderr}`);

  textlint("--fix", "bad.md");
  assert.ok(!readFileSync(join(tmp, "bad.md"), "utf8").includes("—"), "--fix should remove the dash");
  console.log(`textlint-smoke: ok with textlint ${TEXTLINT_VERSION}`);
} finally {
  rmSync(tmp, { recursive: true, force: true });
}
