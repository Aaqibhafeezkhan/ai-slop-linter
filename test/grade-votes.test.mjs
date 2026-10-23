import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The blind grader with H2H_VOTES (grade-run.sh), and the vote collection in grade-collect.mjs. No test calls the
// real claude: grade-run.sh gets a fake one on PATH that logs the id of its stdin and answers from a script body.
// The sandbox is faked the same way as in head-to-head-run.test.mjs.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const RUN = join(ROOT, "bench", "head-to-head", "run");
const FIXTURES = join(ROOT, "bench", "head-to-head", "fixtures");
const tmp = (name) => mkdtempSync(join(tmpdir(), `h2h-votes-${name}-`));
const node = (script, args, opts = {}) => spawnSync(process.execPath, [join(RUN, script), ...args], { encoding: "utf8", timeout: 120000, ...opts });
const IDS = ["g-000001", "g-000002", "g-000003"];
const VALID = '{"reason":"fine","pass":true}';

function fakeSandboxExec(work) {
  const bin = join(work, "sbbin");
  mkdirSync(bin, { recursive: true });
  writeFileSync(join(bin, "sandbox-exec"), `#!/usr/bin/env bash\necho "SANDBOX_ARGS=$*" >> "${work}/sandbox.log"\nshift 2\nexec "$@"\n`);
  writeFileSync(join(bin, "bwrap"), `#!/usr/bin/env bash\necho "SANDBOX_ARGS=$*" >> "${work}/sandbox.log"\nwhile [ $# -gt 0 ] && [ "$1" != "--" ]; do shift; done\nshift\nexec "$@"\n`);
  chmodSync(join(bin, "sandbox-exec"), 0o755);
  chmodSync(join(bin, "bwrap"), 0o755);
  return bin;
}

// Grading files: each says its id on the first line, as the fake claude reads it back from stdin.
function gradingDir(out, ids) {
  mkdirSync(join(out, "grading"), { recursive: true });
  for (const id of ids) writeFileSync(join(out, "grading", `${id}.txt`), `ID=${id}\nGRADE ME\n`);
  return join(out, "grading");
}

// A fake claude: logs the id it was given to <work>/calls.log, counts its calls per id in <work>/count-<id>,
// then runs answerBody (bash, with $id and $n set). Paths are literal because scrub_env drops other variables.
function fakeClaude(work, answerBody) {
  const bin = join(work, "bin");
  mkdirSync(bin, { recursive: true });
  const body = `#!/usr/bin/env bash
input="$(cat)"
id="$(printf '%s\\n' "$input" | sed -n 's/^ID=//p' | head -n 1)"
printf '%s\\n' "$id" >> "${work}/calls.log"
n=$(( $(cat "${work}/count-$id" 2>/dev/null || echo 0) + 1 ))
echo "$n" > "${work}/count-$id"
${answerBody}
`;
  writeFileSync(join(bin, "claude"), body);
  chmodSync(join(bin, "claude"), 0o755);
  return bin;
}
const ALL_VALID = `echo '${VALID}'`;
// g-000001 answers in prose on its first call only; g-000002 never answers in JSON; g-000003 is valid.
const SOME_INVALID = `case "$id" in
  g-000001) if [ "$n" -eq 1 ]; then echo "I think it passes."; else echo '${VALID}'; fi ;;
  g-000002) echo "no json here" ;;
  *) echo '${VALID}' ;;
esac`;

// runGrade: grade-run.sh with the fake claude first on PATH. H2H_VOTES and H2H_MODEL are unset unless passed.
function runGrade(out, work, bin, extraEnv = {}) {
  const env = { ...process.env, PATH: `${fakeSandboxExec(work)}${delimiter}${bin}${delimiter}${process.env.PATH}`, H2H_GUARD_SETTINGS: join(work, "none1.json"), H2H_GUARD_CLAUDE_JSON: join(work, "none2.json"), H2H_GUARD_LAUNCHER_SETTINGS: join(work, "none3.json") };
  delete env.H2H_VOTES;
  delete env.H2H_MODEL;
  return spawnSync("bash", [join(RUN, "grade-run.sh"), out], { encoding: "utf8", env: { ...env, ...extraEnv }, timeout: 120000 });
}
const calls = (work) => (existsSync(join(work, "calls.log")) ? readFileSync(join(work, "calls.log"), "utf8").trim().split("\n") : []);
const list = (out) => readdirSync(join(out, "grading")).sort();

test("H2H_VOTES=5 writes five answer files per id; votes 1-3 go in name order, votes 4-5 in reverse", () => {
  const work = tmp("order");
  const out = join(work, "out");
  gradingDir(out, IDS);
  const bin = fakeClaude(work, ALL_VALID);
  const r = runGrade(out, work, bin, { H2H_VOTES: "5" });
  assert.equal(r.status, 0, r.stderr);
  const forward = [...IDS];
  const backward = [...IDS].reverse();
  assert.deepEqual(calls(work), [...forward, ...forward, ...forward, ...backward, ...backward], "call order");
  for (const id of IDS) {
    for (let k = 1; k <= 5; k++) assert.equal(readFileSync(join(out, "grading", `${id}.out.${k}`), "utf8"), `${VALID}\n`);
    assert.equal(existsSync(join(out, "grading", `${id}.out`)), false, "no single .out file in votes mode");
  }
  assert.equal(list(out).filter((f) => f.endsWith(".out.1") || f.endsWith(".out.5")).length, 6);
});

test("an invalid vote is asked again and the valid retry is kept; an answer that stays invalid is kept as the last one", () => {
  const work = tmp("retry");
  const out = join(work, "out");
  gradingDir(out, IDS);
  const bin = fakeClaude(work, SOME_INVALID);
  const r = runGrade(out, work, bin, { H2H_VOTES: "2" });
  assert.equal(r.status, 0, r.stderr);
  // vote 1: id 1 twice (prose, then valid), id 2 three times (never valid), id 3 once; vote 2 the same, forward.
  assert.deepEqual(calls(work), ["g-000001", "g-000001", "g-000002", "g-000002", "g-000002", "g-000003", "g-000001", "g-000002", "g-000002", "g-000002", "g-000003"]);
  assert.equal(readFileSync(join(out, "grading", "g-000001.out.1"), "utf8"), `${VALID}\n`);
  assert.equal(readFileSync(join(out, "grading", "g-000002.out.1"), "utf8"), "no json here\n");
  assert.ok(list(out).every((f) => !f.endsWith(".part")), "no partial answer is left behind");
  assert.match(r.stderr, /still invalid after 3 calls: g-000002\.out\.1/);
});

test("H2H_VOTES outside 1 to 9 is refused before any call", () => {
  const work = tmp("range");
  const out = join(work, "out");
  gradingDir(out, IDS);
  const bin = fakeClaude(work, ALL_VALID);
  for (const v of ["0", "10", "x"]) {
    const r = runGrade(out, work, bin, { H2H_VOTES: v });
    assert.equal(r.status, 2, `H2H_VOTES=${v}`);
    assert.match(r.stderr, /H2H_VOTES must be an integer from 1 to 9/);
  }
  assert.equal(existsSync(join(work, "calls.log")), false);
});

test("default: one answer per id in name order, invalid answers are not asked again, and collect writes blind.json with no votes.json", () => {
  const work = tmp("default");
  const out = join(work, "out");
  gradingDir(out, IDS);
  const bin = fakeClaude(work, SOME_INVALID);
  const r = runGrade(out, work, bin);
  assert.equal(r.status, 0, r.stderr);
  assert.deepEqual(calls(work), IDS, "one call per id, in name order");
  assert.deepEqual(list(out), ["g-000001.out", "g-000002.out", "g-000003.out", "g-000001.txt", "g-000002.txt", "g-000003.txt"].sort());
  assert.equal(readFileSync(join(out, "grading", "g-000001.out"), "utf8"), "I think it passes.\n", "the invalid answer stays in place");

  for (const id of IDS) writeFileSync(join(out, "grading", `${id}.out`), `${VALID}\n`);
  writeFileSync(join(out, "grading", "labelmap.json"), JSON.stringify({ "g-000001": "h1-ours-1", "g-000002": "h1-ours-2", "g-000003": "h1-ours-3" }));
  writeFileSync(join(out, "scores.json"), JSON.stringify({ "h1-ours-1": {}, "h1-ours-2": {}, "h1-ours-3": {} }));
  const c = node("grade-collect.mjs", [out]);
  assert.equal(c.status, 0, c.stderr);
  assert.equal(c.stdout.includes("votes:"), false);
  assert.equal(existsSync(join(out, "grading", "votes.json")), false);
  const blind = JSON.parse(readFileSync(join(out, "blind.json"), "utf8"));
  assert.deepEqual(blind, { "h1-ours-1": true, "h1-ours-2": true, "h1-ours-3": true });
});

test("grade-prep asks for the reason first and the verdict second, in one JSON line", () => {
  const out = tmp("prep");
  mkdirSync(join(out, "h1-ours-1"), { recursive: true });
  cpSync(join(FIXTURES, "h1", "note.md"), join(out, "h1-ours-1", "note.md"));
  writeFileSync(join(out, "h1-ours-1.jsonl"), '{"type":"result","is_error":false}\n');
  const r = node("grade-prep.mjs", [out, "20261021"]);
  assert.equal(r.status, 0, r.stderr);
  const txt = readdirSync(join(out, "grading")).filter((f) => f.endsWith(".txt"));
  assert.equal(txt.length, 1);
  const text = readFileSync(join(out, "grading", txt[0]), "utf8");
  assert.ok(text.includes('- Answer with a single JSON line and nothing else, writing the reason first and the verdict second: {"reason":"<one short sentence>","pass":true|false}'));
  assert.doesNotMatch(text, /\{"pass":true\|false,"reason"/);
});

// Votes are written by hand here: the collector reads them without grade-run.
function voteRun(out, plan) {
  const ids = Object.keys(plan);
  const labels = {};
  const scores = {};
  ids.forEach((key, i) => {
    const id = `g-${String(i + 1).padStart(6, "0")}`;
    labels[id] = key;
    scores[key] = {};
    plan[key].forEach((v, k) => {
      const body = v === "junk" ? "not json at all" : `{"reason":"because ${v}","pass":${v}}`;
      writeFileSync(join(out, "grading", `${id}.out.${k + 1}`), `${body}\n`);
    });
  });
  mkdirSync(join(out, "grading"), { recursive: true });
  writeFileSync(join(out, "grading", "labelmap.json"), JSON.stringify(labels));
  writeFileSync(join(out, "scores.json"), JSON.stringify(scores));
  return labels;
}

test("collect over votes: 3 of 5 passes, 2 of 5 fails, two valid votes are err, a 2-2 tie with an invalid vote is false", () => {
  const out = tmp("collect");
  mkdirSync(join(out, "grading"), { recursive: true });
  voteRun(out, {
    "h1-ours-1": [true, true, true, false, false],
    "h1-ours-2": [true, true, false, false, false],
    "h1-ours-3": [true, true, "junk"],
    "h1-ours-4": [true, false, true, false, "junk"],
  });
  const r = node("grade-collect.mjs", [out]);
  assert.equal(r.status, 0, r.stderr);
  const blind = JSON.parse(readFileSync(join(out, "blind.json"), "utf8"));
  assert.deepEqual(blind, { "h1-ours-1": true, "h1-ours-2": false, "h1-ours-3": false, "h1-ours-4": false });

  const votes = JSON.parse(readFileSync(join(out, "grading", "votes.json"), "utf8"));
  assert.deepEqual(votes.summary, { cells: 4, errCells: 1, unanimousCells: 1, unanimousShare: 0.25, invalidVotes: 2 });
  assert.deepEqual(votes.runs["h1-ours-3"], { votes: [{ vote: 1, pass: true, reason: "because true" }, { vote: 2, pass: true, reason: "because true" }, { vote: 3, pass: null }], valid: 2, verdict: false, err: true, unanimous: true });
  assert.equal(votes.runs["h1-ours-4"].valid, 4);
  assert.equal(votes.runs["h1-ours-4"].err, false);
  assert.equal(votes.runs["h1-ours-4"].unanimous, false);
  assert.equal(votes.runs["h1-ours-4"].verdict, false);
  assert.deepEqual(votes.runs["h1-ours-4"].votes[4], { vote: 5, pass: null });
  assert.match(r.stdout, /4 cells, 1 err, 1 unanimous \(25\.0%\), 2 invalid vote\(s\)/);
});

test("collect refuses when a run has neither an answer nor votes, and writes neither file", () => {
  const out = tmp("collect-missing");
  mkdirSync(join(out, "grading"), { recursive: true });
  voteRun(out, { "h1-ours-1": [true, true, true] });
  writeFileSync(join(out, "grading", "labelmap.json"), JSON.stringify({ "g-000001": "h1-ours-1", "g-000009": "h1-ours-9" }));
  writeFileSync(join(out, "scores.json"), JSON.stringify({ "h1-ours-1": {}, "h1-ours-9": {} }));
  const r = node("grade-collect.mjs", [out]);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /g-000009 \(h1-ours-9\): no answer file/);
  assert.equal(existsSync(join(out, "blind.json")), false);
  assert.equal(existsSync(join(out, "grading", "votes.json")), false);
});
