import { test } from "node:test";
import assert from "node:assert/strict";
import { sample, compareRuns, compareGrader } from "../bench/head-to-head/run/f6.mjs";

const arms = ["ours", "a", "b", "c"];
const cells = [];
for (const set of ["pub", "held"]) for (let t = 1; t <= 5; t++) for (const arm of arms) for (let r = 1; r <= 3; r++) cells.push({ set, task: `t${t}`, arm, run: r, score: 3 + (r % 3) });

test("the sample is 10 percent per set, unique by task and arm, and covers every arm", () => {
  const s = sample(cells);
  for (const set of ["pub", "held"]) {
    const mine = s.filter((x) => x.set === set);
    assert.equal(mine.length, Math.ceil(0.1 * 60));
    assert.equal(new Set(mine.map((x) => `${x.task}/${x.arm}`)).size, mine.length);
    for (const arm of arms) assert.ok(mine.some((x) => x.arm === arm), `${set} lacks ${arm}`);
    assert.ok(mine.every((x) => x.original.length === 3));
  }
});

test("the same seed gives the same sample, another seed another one", () => {
  assert.deepEqual(sample(cells, 1), sample(cells, 1));
  assert.notDeepEqual(sample(cells, 1), sample(cells, 2));
});

test("F6-runs counts re-runs inside the min-max of the three originals", () => {
  const s = [{ set: "pub", task: "t1", arm: "ours", original: [3, 4, 5] }, { set: "pub", task: "t2", arm: "a", original: [4, 4, 4] }];
  const r = compareRuns(s, [{ set: "pub", task: "t1", arm: "ours", score: 5 }, { set: "pub", task: "t2", arm: "a", score: 2 }]);
  assert.equal(r.within, 1);
  assert.equal(r.rerun, 2);
});

test("F6-grader passes only with no cell off by more than 1 point and 90 percent criterion agreement", () => {
  const same = [{ key: "k1", criteria: { C1: true, C2: false } }];
  assert.equal(compareGrader(same, same).pass, true);
  const off = compareGrader([{ key: "k1", criteria: { C1: true, C2: true, C3: true } }], [{ key: "k1", criteria: { C1: false, C2: false, C3: true } }]);
  assert.equal(off.differ, 1);
  assert.equal(off.pass, false);
  const lowAgree = compareGrader(Array.from({ length: 5 }, (_, i) => ({ key: `k${i}`, criteria: { C1: true, C2: true } })), Array.from({ length: 5 }, (_, i) => ({ key: `k${i}`, criteria: { C1: i < 1, C2: true } })));
  assert.equal(lowAgree.differ, 0);
  assert.equal(lowAgree.pass, false);
});
