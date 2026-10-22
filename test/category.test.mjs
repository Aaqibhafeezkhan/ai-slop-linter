import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { CATEGORY } from "./surface-text.mjs";

// The sentence lives in test/surface-text.mjs. Each surface below must carry it unchanged.

const SURFACES = [
  { file: "package.json", equal: (t) => JSON.parse(t).description },
  { file: "llms.txt", includes: true },
];

for (const s of SURFACES) {
  test(`${s.file} carries the category sentence unchanged`, { skip: !existsSync(s.file) }, () => {
    const text = readFileSync(s.file, "utf8");
    if (s.equal) assert.equal(s.equal(text), CATEGORY);
    else assert.ok(text.includes(CATEGORY), `${s.file} does not contain the category sentence`);
  });
}

test("package keywords are lower case, unique and include the search phrases", () => {
  const { keywords } = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(new Set(keywords).size, keywords.length, "a keyword is listed twice");
  for (const k of keywords) assert.match(k, /^[a-z0-9-]+$/, `${k} is not lower case with hyphens`);
  for (const k of ["ai-slop-linter", "lint-ai-writing", "detect-ai-writing", "em-dash-linter", "ai-pr-description", "stop-ai-slop", "mcp", "mcp-server"]) {
    assert.ok(keywords.includes(k), `missing keyword ${k}`);
  }
  assert.ok(!keywords.includes("textlintrule"), "the root package is not a textlint rule package");
});
