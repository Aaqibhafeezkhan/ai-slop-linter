import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { lintText } from "../dist/src/index.js";
import { fails, measure, reassess, render } from "../bench/dash-lib.mjs";

const filler = (n) => "word ".repeat(n).trim();

/** A corpus of one human file (one dash in 200 words) and one machine file (one dash in 200 words, plus chatbot residue). */
function corpus() {
  const dir = mkdtempSync(join(tmpdir(), "dash-corpus-"));
  mkdirSync(join(dir, "human"));
  mkdirSync(join(dir, "machine"));
  writeFileSync(join(dir, "human", "h.md"), `${filler(100)} — ${filler(100)}.\n`);
  writeFileSync(join(dir, "machine", "m.md"), `${filler(98)} — ${filler(98)}. I hope this helps!\n`);
  return dir;
}

test("reassess with today's severity gives exactly what lintText gives", () => {
  for (const text of [readFileSync("test/fixtures/sloppy.md", "utf8"), readFileSync("test/fixtures/clean.md", "utf8"), "short — text\n"]) {
    const r = lintText("x.md", text);
    assert.deepEqual(reassess(r, "error"), { findings: r.findings.length, errors: r.errors, score: r.score });
  }
});

test("a dash as a warning stops failing a file that has nothing else wrong, and cannot hide another error", () => {
  const dir = corpus();
  try {
    const data = measure(dir);
    const by = Object.fromEntries(data.policies.map((p) => [p.id, p.sets]));
    assert.deepEqual(by.error.human["10"].failing, ["human/h.md"]);
    assert.deepEqual(by.warning.human["10"].failing, [], "one warning in 200 words scores 5, under the limit of 10");
    assert.deepEqual(by.off.human["10"].failing, []);
    for (const id of ["error", "warning", "off"]) assert.deepEqual(by[id].machine["10"].failing, ["machine/m.md"], `${id}: the chatbot error still fails the machine file`);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a file under the grading floor is judged on errors alone", () => {
  const r = lintText("x.md", "A short — note.\n");
  assert.equal(r.score, null);
  assert.equal(fails(reassess(r, "error"), 10), true);
  assert.equal(fails(reassess(r, "warning"), 10), false);
});

test("the threshold table counts files by dashes per 1,000 words", () => {
  const dir = corpus();
  try {
    const { sweep, dashes } = measure(dir);
    assert.equal(dashes.human[0].dashes, 1);
    assert.equal(dashes.human[0].per1k, 5);
    const at = (t) => sweep.find((s) => s.threshold === t);
    assert.deepEqual([at(5).human, at(5).machine], [1, 1]);
    assert.deepEqual([at(10).human, at(10).machine], [0, 0]);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the memo changes no default and leaves the decision open", () => {
  const dir = corpus();
  try {
    const md = render(measure(dir));
    assert.match(md, /Decision: pending\./);
    assert.match(md, /No default has been changed/);
    assert.equal(md.includes("—"), false);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  assert.equal(lintText("x.md", "A short — note.\n").findings.find((f) => f.rule === "dash").severity, "error");
});
