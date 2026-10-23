#!/usr/bin/env node
// usage: node bench/head-to-head/run/grade-collect.mjs <H2H_OUT>
// Reads each grader answer <H2H_OUT>/grading/<id>.out, maps the id to its run with labelmap.json, and
// writes the blind verdicts (true or false, keyed by run) to <H2H_OUT>/blind.json. summarize.mjs merges
// blind.json into the C5 values, so score.mjs can never clear them. The answer is the last line that
// is a JSON object with a boolean "pass". A missing file or an answer with no such line is an error,
// and nothing is written in that case.
//
// Votes (grade-run.sh with H2H_VOTES=N): when an id has <id>.out.<k> files, its votes are read instead of
// <id>.out. A vote is valid when the last line that parses as JSON is an object with a boolean "pass"; an
// invalid vote counts as null. The verdict of a run is the majority of its valid votes (pass when strictly
// more are true than false, so a tie is false), and a run with fewer than 3 valid votes is err and its verdict
// is false. Also writes <H2H_OUT>/grading/votes.json: per run its votes, valid count, verdict, err and
// unanimous (all valid votes equal), and a summary over the voted runs. An id with neither kind of file is an
// error, as before.
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
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
const votesByRun = {};

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

// A vote: the last line that parses as JSON decides. Valid only when it is an object with a boolean pass.
function parseVote(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i--) {
    let v;
    try {
      v = JSON.parse(lines[i]);
    } catch {
      continue;
    }
    if (!v || typeof v !== "object") return { pass: null };
    const vote = { pass: typeof v.pass === "boolean" ? v.pass : null };
    if (typeof v.reason === "string") vote.reason = v.reason;
    return vote;
  }
  return { pass: null };
}

// Vote files of each grading id: <id>.out.<k>, sorted by k.
const voteFiles = {};
for (const name of readdirSync(gradingDir)) {
  const m = /^(g-[0-9a-f]{6})\.out\.([1-9][0-9]*)$/.exec(name);
  if (!m) continue;
  (voteFiles[m[1]] ??= []).push({ k: Number(m[2]), path: join(gradingDir, name) });
}

for (const [id, key] of Object.entries(labelMap)) {
  if (voteFiles[id]) {
    const votes = voteFiles[id]
      .sort((a, b) => a.k - b.k)
      .map(({ k, path }) => ({ vote: k, ...parseVote(readFileSync(path, "utf8")) }));
    if (!(key in scores)) {
      errors.push(`${id} (${key}): run is not in scores.json`);
      continue;
    }
    const trues = votes.filter((v) => v.pass === true).length;
    const falses = votes.filter((v) => v.pass === false).length;
    const valid = trues + falses;
    const err = valid < 3;
    const verdict = !err && trues > falses;
    const unanimous = valid > 0 && (trues === 0 || falses === 0);
    votesByRun[key] = { votes, valid, verdict, err, unanimous };
    verdicts[key] = verdict;
    continue;
  }
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

const voted = Object.keys(votesByRun);
if (voted.length > 0) {
  const cells = voted.length;
  const errCells = voted.filter((k) => votesByRun[k].err).length;
  const unanimousCells = voted.filter((k) => votesByRun[k].unanimous).length;
  const invalidVotes = voted.reduce((n, k) => n + votesByRun[k].votes.length - votesByRun[k].valid, 0);
  const summary = { cells, errCells, unanimousCells, unanimousShare: unanimousCells / cells, invalidVotes };
  const votesPath = join(gradingDir, "votes.json");
  writeFileSync(votesPath, JSON.stringify({ summary, runs: votesByRun }, null, 2) + "\n");
  console.log(
    `votes: ${cells} cells, ${errCells} err, ${unanimousCells} unanimous (${(summary.unanimousShare * 100).toFixed(1)}%), ` +
      `${invalidVotes} invalid vote(s); wrote ${votesPath}`,
  );
}
