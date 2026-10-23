import { test } from "node:test";
import assert from "node:assert/strict";
import { judge, parseCells } from "../bench/head-to-head/run/devgate-judge.mjs";

const mk = (scores) => {
  const lines = [];
  for (const [arm, perTask] of Object.entries(scores))
    perTask.forEach((runs, ti) => runs.forEach((s, ri) => lines.push(JSON.stringify({ cell: `hoR${ti + 1}-${arm}-${ri + 1}`, score: s }))));
  return parseCells(lines.join("\n"));
};
const six = (v) => Array.from({ length: 6 }, () => v);

test("a steady lead of one point per task is a clear lead", () => {
  const r = judge(mk({ ours: six([5, 5, 5]), blader: six([4, 4, 4]), "blader-inv": six([4, 4, 4]), base: six([3, 3, 3]) }));
  assert.equal(r.clear, true);
  assert.equal(r.best, "blader");
  assert.equal(r.D, 6);
});

test("equal arms are no lead and the interval contains zero", () => {
  const r = judge(mk({ ours: six([4, 5, 4]), blader: six([4, 4, 5]), "blader-inv": six([4, 4, 4]), base: six([3, 3, 3]) }));
  assert.equal(r.clear, false);
  assert.ok(r.ci[0] <= 0);
});

test("a big total lead is refused when ours trails on two tasks", () => {
  const ours = [[5, 5, 5], [5, 5, 5], [5, 5, 5], [5, 5, 5], [3, 3, 3], [3, 3, 3]];
  const rival = six([4, 4, 4]);
  const r = judge(mk({ ours, blader: rival, "blader-inv": rival, base: six([3, 3, 3]) }));
  assert.equal(r.taskOk, false);
  assert.equal(r.clear, false);
});

test("the same input gives the same interval (fixed seed)", () => {
  const cells = mk({ ours: six([5, 4, 5]), blader: six([4, 4, 4]), "blader-inv": six([4, 5, 4]), base: six([3, 3, 3]) });
  assert.deepEqual(judge(cells).ci, judge(cells).ci);
});

test("a missing cell set is an error, not a pass", () => {
  assert.throws(() => judge(parseCells(JSON.stringify({ cell: "hoR1-ours-1", score: 5 }))), /no cells for blader/);
});
