import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanCatalog } from "../dist/src/catalog.js";
import { prepare } from "../dist/src/doc.js";

const CLI = "dist/src/cli.js";

function verify(before, after) {
  const dir = mkdtempSync(join(tmpdir(), "slop-round5-"));
  try {
    writeFileSync(join(dir, "before.md"), before);
    writeFileSync(join(dir, "after.md"), after);
    const r = spawnSync(process.execPath, [CLI, "--verify", join(dir, "before.md"), join(dir, "after.md")], { encoding: "utf8" });
    return { status: r.status, out: r.stdout };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const hits = (text) => scanCatalog(prepare("a.md", text), "en").map((h) => h.phrase.toLowerCase());

// Ten plain sentences, each longer than 40 characters, so the original passes the 200 character floor.
const S = (n) => `Sentence number ${n} says the parser reads ${n} files per second.`;
const BODY = [1, 2, 3, 4, 5].map(S).join(" ") + "\n";

test("catalog: hopefully after a modal or opening a sentence is a hit", () => {
  assert.deepEqual(hits("The patch should hopefully land on Friday.\n"), ["should hopefully"]);
  assert.deepEqual(hits("The cache is warm now. Hopefully, the next run is faster.\n"), ["hopefully,"]);
});

test("catalog: hope as a verb and hopeful as an adjective are not hits", () => {
  assert.deepEqual(hits("We hope the patch lands on Friday.\n"), []);
  assert.deepEqual(hits("The maintainers are hopeful about the release.\n"), []);
});

test("verify: a collapse below 35 percent blocks with a length line", () => {
  const r = verify(BODY, S(1) + "\n");
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^length after is \d+% of before/m);
  assert.match(r.out, /^verify: \d+ problem\(s\)$/m);
});

test("verify: growth above 130 percent blocks", () => {
  const r = verify(BODY, BODY + BODY.slice(0, BODY.length / 2));
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^length /m);
});

test("verify: removing a wrapper at ratio 0.6 passes", () => {
  const wrapped = [S(1), S(2), "This sentence only wraps the text and says nothing about the parser at all.", "Another wrapper sentence that the editor can cut without losing a single fact.", S(3)].join(" ") + "\n";
  const r = verify(wrapped, [S(1), S(2), S(3)].join(" ") + "\n");
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /^length/m);
});

test("verify: the length check skips an original under 200 characters", () => {
  const r = verify("Short text here.\n", "S.\n");
  assert.doesNotMatch(r.out, /^length/m);
});

test("verify: code fences do not pad the length", () => {
  const code = "```\n" + "x".repeat(2000) + "\n```\n";
  const r = verify(BODY + code, S(1) + "\n" + code);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /^length /m);
});

test("verify: a rewritten sentence with no tell is listed as an unrequested edit, without blocking", () => {
  const after = BODY.replace(S(3), "The parser reads 3 files per second, as sentence number 3 states.");
  const r = verify(BODY, after);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^unrequested edit: Sentence number 3 says the parser reads 3 files per second\.$/m);
  assert.match(r.out, /^alignment: 4 of 5 sentences kept verbatim$/m);
  assert.match(r.out, /^clean source: no edit is expected$/m);
  assert.match(r.out, /^verify: ok$/m);
});

test("verify: a sentence with a catalog hit may change without being listed", () => {
  const before = BODY.replace(S(3), "The tool streamlines the parser and reads 3 files per second.");
  const after = BODY.replace(S(3), "The parser reads 3 files per second.");
  const r = verify(before, after);
  assert.equal(r.status, 0, r.out);
  assert.doesNotMatch(r.out, /unrequested edit/);
  assert.doesNotMatch(r.out, /clean source/);
  assert.match(r.out, /^alignment: 4 of 5 sentences kept verbatim$/m);
});

test("verify: the report shows 8 unrequested edits and counts the rest", () => {
  const many = Array.from({ length: 11 }, (_, i) => S(i + 1)).join("\n") + "\n";
  const r = verify(many, "Everything was rewritten into this one line.\n");
  assert.match(r.out, /^and 3 more$/m);
  assert.equal(r.out.match(/^unrequested edit:/gm).length, 8);
});

test("verify: identical files print ok (unchanged)", () => {
  const r = verify(BODY, BODY);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^verify: ok \(unchanged\)$/m);
  assert.doesNotMatch(r.out, /alignment/);
});
