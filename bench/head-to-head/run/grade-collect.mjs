#!/usr/bin/env node
// usage: node bench/head-to-head/run/grade-collect.mjs <H2H_OUT>
// Reads each grader answer <H2H_OUT>/grading/<id>.out, maps the id to its run with labelmap.json, and
// writes the blind verdicts (true or false, keyed by run) to <H2H_OUT>/blind.json. summarize.mjs merges
// blind.json into the C5 values, so score.mjs can never clear them. The answer is the last line that
// is a JSON object with a boolean "pass". A missing file or an answer with no such line is an error,
// and nothing is written in that case.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { usageExit } from "./lib.mjs";

const h2hOut = process.argv[2];
if (!h2hOut) usageExit("usage: grade-collect.mjs <H2H_OUT>");

const gradingDir = join(h2hOut, "grading");
const labelMapPath = join(gradingDir, "labelmap.json");
const scoresPath = join(h2hOut, "scores.json");
for (const p of [labelMapPath, scoresPath]) {
  if (!existsSync(p)) {
    console.error(`missing ${p}`);
    process.exit(1);
  }
}

const labelMap = JSON.parse(readFileSync(labelMapPath, "utf8"));
const scores = JSON.parse(readFileSync(scoresPath, "utf8"));
const errors = [];
const verdicts = {};

function parseAnswer(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    try {
      const v = JSON.parse(lines[i]);
      if (v && typeof v === "object" && typeof v.pass === "boolean") return v.pass;
    } catch {
      // not JSON: keep looking upward
    }
  }
  return undefined;
}

for (const [id, key] of Object.entries(labelMap)) {
  const outPath = join(gradingDir, `${id}.out`);
  if (!existsSync(outPath)) {
    errors.push(`${id} (${key}): no answer file ${outPath}`);
    continue;
  }
  const pass = parseAnswer(readFileSync(outPath, "utf8"));
  if (pass === undefined) {
    errors.push(`${id} (${key}): no JSON line with a boolean "pass" in ${outPath}`);
    continue;
  }
  if (!(key in scores)) {
    errors.push(`${id} (${key}): run is not in scores.json`);
    continue;
  }
  verdicts[key] = pass;
}

if (errors.length) {
  console.error(`grade-collect: ${errors.length} problem(s), blind.json not written:`);
  for (const e of errors) console.error(`  ${e}`);
  process.exit(1);
}

const blindPath = join(h2hOut, "blind.json");
writeFileSync(blindPath, JSON.stringify(verdicts, null, 2) + "\n");
console.log(`wrote ${Object.keys(verdicts).length} blind verdicts to ${blindPath}`);
