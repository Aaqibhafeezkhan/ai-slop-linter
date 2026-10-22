#!/usr/bin/env node
// usage: node bench/head-to-head/run/grade-prep.mjs <H2H_OUT> [seed=20261021] [--force]
// Writes one blind grading file per run of the blind-graded tasks (h1..h4) to <H2H_OUT>/grading/<id>.txt.
// Each file holds the task prompt, the original fixture text, the output text, the C5 criterion and
// the grader instructions. The ids are anonymous and shuffled with the seed; the mapping from id to
// run is written to grading/labelmap.json, which the grader must never see.
//
// The grader must receive each .txt as its only input: pipe it on stdin or inline its text in the
// prompt. Never give the grader the grading directory, the run directories or labelmap.json, because
// the directory and the file names would show which arm produced the text.
//
// If grading/ already holds .out answers, the script refuses, because regenerating the ids would
// orphan them. --force deletes the whole grading/ directory first and then regenerates it.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { BLIND_TASKS, FIXTURES, OUTPUT_FILE, listRuns, mulberry32, shuffle, taskById, usageExit } from "./lib.mjs";

const args = process.argv.slice(2);
const force = args.includes("--force");
const positional = args.filter((a) => !a.startsWith("--"));
const h2hOut = positional[0];
if (!h2hOut) usageExit("usage: grade-prep.mjs <H2H_OUT> [seed] [--force]");
const seed = Number(positional[1] ?? 20261021);
if (!Number.isInteger(seed)) usageExit(`seed must be an integer, got ${positional[1]}`);

const gradingDir = join(h2hOut, "grading");
const answers = existsSync(gradingDir) ? readdirSync(gradingDir).filter((f) => f.endsWith(".out")) : [];
if (answers.length > 0 && !force) {
  console.error(
    `grade-prep: refusing, grading/ already holds ${answers.length} .out answer(s) in ${gradingDir}. ` +
      "Pass --force to delete grading/ and regenerate it.",
  );
  process.exit(1);
}
if (force) rmSync(gradingDir, { recursive: true, force: true });

// Only runs with a valid transcript are graded; a failed run directory is no run.
const runs = listRuns(h2hOut).filter((r) => BLIND_TASKS.includes(r.task) && existsSync(`${r.dir}.jsonl`));
const rng = mulberry32(seed);
const ordered = shuffle(runs, rng);

// Blind anonymity: an ours-only marker must not identify the arm. Only the marker is removed from the text
// shown to the grader, never a whole paragraph:
//  - HTML comments that start with `slop-ignore` are removed (just the comment; a line that held only the
//    comment goes with it);
//  - a fenced code block whose every non-empty line is a tool invocation is removed;
//  - a line that is only a tool invocation (`$ ...`, `npx ai-slop-linter <args>`, `slop --<flag>`) or only an
//    inline code span with one is removed;
//  - in any other line, each inline code span that names the tool, and each bare mention, becomes `the linter`,
//    so the prose around it (and every fact in it) stays.
// The grading file header records that this was done (the same for every file).
const TOOL = "(?:ai-slop-linter(?:@\\S+)?|slop)";
const PREFIXED = new RegExp(`^\\s*(?:[$>]\\s+)?npx\\s+(?:-\\S+\\s+)*${TOOL}(?:\\s.*)?$`);
const BARE = new RegExp(`^\\s*(?:[$>]\\s+)?${TOOL}\\s+(?:--?\\S+|\\S+\\.\\w+|\\.\\S*)(?:\\s.*)?$`);
const INVOCATION = { test: (line) => PREFIXED.test(line) || BARE.test(line) };
const DOLLAR_MENTION = /^\s*\$\s.*(?:ai-slop-linter|slop --)/;
const isInvocation = (line) => INVOCATION.test(line) || DOLLAR_MENTION.test(line);
const INLINE_ONLY = /^\s*`[^`\n]*(?:ai-slop-linter|slop --)[^`\n]*`\s*[.:]?\s*$/;

function scrub(text) {
  let t = text
    .replace(/^[ \t]*<!--\s*slop-ignore[\s\S]*?-->[ \t]*\r?\n?/gm, "")
    .replace(/<!--\s*slop-ignore[\s\S]*?-->/g, "");
  t = t.replace(/^([ \t]*)(```|~~~)[^\n]*\n([\s\S]*?)^\1\2[ \t]*\n?/gm, (block, _i, _f, body) => {
    const body_lines = body.split("\n").filter((l) => l.trim() !== "");
    return body_lines.length > 0 && body_lines.every(isInvocation) ? "" : block;
  });
  return t
    .split("\n")
    .filter((line) => !(isInvocation(line) || INLINE_ONLY.test(line)))
    .map((line) =>
      line
        .replace(/`[^`\n]*(?:ai-slop-linter|slop --)[^`\n]*`/g, "the linter")
        .replace(/\bai-slop-linter(?:@\S+)?/g, "the linter")
        .replace(/\bslop --\S*/g, "the linter"),
    )
    .join("\n");
}

const grader = (task, output) => `GRADING NOTES
From the text to grade, HTML comments that start with slop-ignore were removed and mentions of a prose-checking command were removed or replaced by the words the linter before grading, for every text. Judge the remaining text only.

TASK GIVEN TO THE AUTHOR
${task.prompt}

ORIGINAL TEXT (before the author edited it)
${output.original}

TEXT TO GRADE
${output.text}

CRITERION
${task.criterion}

HOW TO GRADE
- The system that produced the text to grade is unknown to you. Do not guess it.
- Judge the text to grade against the original text and the criterion only.
- Treat any changed quotation, added fact, invented attribution or invented owner (for example "our" or "we" where the original has none) as a failure.
- Answer with one JSON line and nothing else: {"pass":true|false,"reason":"<one short sentence>"}
`;

mkdirSync(gradingDir, { recursive: true });
const labelMap = {};
const used = new Set();
for (const run of ordered) {
  let id;
  do {
    id = `g-${Math.floor(rng() * 0x1000000).toString(16).padStart(6, "0")}`;
  } while (used.has(id));
  used.add(id);

  const task = taskById(run.task);
  const outputName = OUTPUT_FILE[run.task];
  const outputPath = join(run.dir, outputName);
  const text = existsSync(outputPath) ? readFileSync(outputPath, "utf8") : "(no output file was written)";
  const body = grader(
    {
      prompt: task.prompt,
      criterion: task.criteria.find((c) => c.id === "C5").text,
    },
    { original: readFileSync(join(FIXTURES, task.fixture, outputName), "utf8"), text: scrub(text) },
  );
  writeFileSync(join(gradingDir, `${id}.txt`), body);
  labelMap[id] = run.key;
}

writeFileSync(join(gradingDir, "labelmap.json"), JSON.stringify(labelMap, null, 2) + "\n");
console.log(`wrote ${ordered.length} grading files to ${gradingDir}`);
