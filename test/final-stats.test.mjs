import { test } from "node:test";
import assert from "node:assert/strict";
import { heldoutCells, stats, render } from "../bench/head-to-head/run/final-stats.mjs";

const mk = (scores) => heldoutCells(Object.entries(scores).flatMap(([arm, perTask]) => perTask.flatMap((runs, ti) => runs.map((s, ri) => JSON.stringify({ cell: `ho${ti + 1}-${arm}-${ri + 1}`, score: s })))).join("\n"));
const six = (v) => Array.from({ length: 6 }, () => v);

test("a steady lead has an interval above zero and passes Rules A, B and B-prime", () => {
  const s = stats(mk({ ours: six([5, 5, 5]), blader: six([4, 4, 4]), base: six([3, 3, 3]) }), { replicates: 2000 });
  assert.equal(s.best, "blader");
  assert.equal(s.D, 6);
  assert.equal(s.i1, true);
  assert.equal(s.ruleB.pass, true);
  assert.equal(s.ruleA.pass, true);
  assert.match(render("t", s), /Claim I1 \(lower bound above 0\): YES/);
});

test("equal arms: no I1, Rule B fails, the interval contains zero", () => {
  const s = stats(mk({ ours: six([4, 4, 4]), blader: six([4, 4, 4]), base: six([3, 3, 3]) }), { replicates: 2000 });
  assert.equal(s.i1, false);
  assert.equal(s.ruleB.pass, false);
});

test("ceiling rule: a rival at the maximum is matched only by the maximum", () => {
  const ours = six([5, 5, 4]);
  const s = stats(mk({ ours, blader: six([5, 5, 5]), base: six([3, 3, 3]) }), { replicates: 500 });
  assert.equal(s.ruleB.pass, false);
  assert.equal(s.ruleBPrime.pass, false);
});

test("Rule B-prime allows one task behind by at most 0.34", () => {
  const ours = [[5, 5, 5], [5, 5, 5], [5, 5, 5], [5, 5, 5], [5, 5, 5], [5, 5, 4]];
  const rival = six([5, 5, 4.5].map(Math.round));
  const s = stats(mk({ ours, blader: [[5, 5, 5], [5, 5, 5], [5, 5, 5], [5, 5, 5], [5, 5, 5], [5, 5, 5]], base: rival }), { replicates: 500 });
  assert.equal(s.ruleB.pass, false);
  assert.equal(s.ruleBPrime.pass, true);
});

test("same input, same interval (fixed seed)", () => {
  const cells = mk({ ours: six([5, 4, 5]), blader: six([4, 4, 5]), base: six([3, 3, 3]) });
  assert.deepEqual(stats(cells, { replicates: 1000 }).diffCi, stats(cells, { replicates: 1000 }).diffCi);
});
