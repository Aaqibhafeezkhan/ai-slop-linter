#!/usr/bin/env node
"use strict";

// Runs the vendored avoid-ai-writing gate over README.md and docs/**/*.md.
// Threshold 1: the detector flags one em dash in README.md (shell comment) and one in
// docs/fr/notes.md (quoted dialogue), so 1 is the lowest value the current clean files pass.
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const files = ["README.md"];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith(".md")) files.push(path.relative(root, full));
  }
}
walk(path.join(root, "docs"));

const gate = path.join(__dirname, "prose", "bin", "avoid-ai-writing-gate.js");
const result = spawnSync(process.execPath, [gate, "--threshold", "1", "--", ...files.sort()], { cwd: root, stdio: "inherit" });
process.exit(result.status === null ? 1 : result.status);
