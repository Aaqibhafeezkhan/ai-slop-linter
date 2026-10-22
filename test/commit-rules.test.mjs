import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { alreadyFlagged, hitsPerRule, splitMachine, tokenHits } from "../bench/commit-rules-lib.mjs";
import { candidateRules, commitRules, NOT_ADOPTED } from "../dist/src/commits.js";

const rule = (id) => candidateRules.find((r) => r.id === id);

test("the machine fixture splits into its four messages", () => {
  assert.equal(splitMachine(readFileSync("bench/corpus/machine/commit-messages.md", "utf8")).length, 4);
  assert.deepEqual(splitMachine("a\n---\nb\n---\n\n"), ["a", "b"]);
});

test("a message counts once per rule however many times the rule fires in it", () => {
  const one = "As part of this change, move it. As part of this change, move it again.";
  const counts = hitsPerRule([one, "Retry failed uploads", "as part of this effort, tidy"], [rule("commit-overexplanation"), rule("commit-marketing")]);
  assert.deepEqual(counts, { "commit-overexplanation": 2, "commit-marketing": 0 });
});

test("token hits use the full upstream list and report each phrase's message count", () => {
  const hits = tokenHits(["Add comprehensive tests", "More comprehensive tests here", "Nothing special"]);
  assert.deepEqual(hits["commit-buzzwords"].find((t) => t.token === "comprehensive tests"), { token: "comprehensive tests", messages: 2 });
  assert.deepEqual(hits["commit-hedging"], []);
});

test("every rule kept out names a candidate and gives a reason, and the rest are the adopted rules", () => {
  for (const [id, reason] of Object.entries(NOT_ADOPTED)) {
    assert.ok(candidateRules.some((r) => r.id === id), `${id} is not a candidate rule`);
    assert.ok(reason.trim().length > 0, `${id} has no reason`);
  }
  assert.equal(commitRules.length + Object.keys(NOT_ADOPTED).length, candidateRules.length);
});

test("a rule with no phrase list reports 0 of 0 rather than failing", () => {
  assert.deepEqual(alreadyFlagged("commit-unquantified"), { flagged: 0, total: 0 });
  const covered = alreadyFlagged("commit-self-reference");
  assert.ok(covered.total >= 60 && covered.flagged <= covered.total);
});

test("the README commit-rules table lists exactly the adopted commit rules, in order", () => {
  const readme = readFileSync("README.md", "utf8");
  const start = readme.indexOf("## Commit message rules");
  assert.ok(start >= 0, "README has no commit message rules section");
  const end = readme.indexOf("\n## ", start + 1);
  const section = readme.slice(start, end === -1 ? undefined : end);
  const ids = [...section.matchAll(/^\| `([a-z-]+)` \|/gm)].map((m) => m[1]);
  assert.ok(ids.length > 0, "the commit rules table has no rows");
  assert.deepEqual(ids, commitRules.map((r) => r.id));
});
