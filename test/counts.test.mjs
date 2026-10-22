import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { rules } from "../dist/src/index.js";
import { commitRules } from "../dist/src/commits.js";

// Counts that appear in prose are derived here, never typed. A rule added or dropped fails this
// test until every document that states the count says the new one.
const ONES = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen", "sixteen", "seventeen", "eighteen", "nineteen"];
const TENS = ["", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy", "eighty", "ninety"];
export const word = (n) => (n < 20 ? ONES[n] : n % 10 === 0 ? TENS[n / 10] : `${TENS[Math.floor(n / 10)]}-${ONES[n % 10]}`);
const cap = (s) => s[0].toUpperCase() + s.slice(1);

test("the README states the number of prose rules, twice", () => {
  const readme = readFileSync("README.md", "utf8");
  const n = cap(word(rules.length));
  assert.ok(readme.includes(`${n} rules. Most come from`), `README "The rules" section does not say "${n} rules."`);
  assert.ok(readme.includes(`${n} rules cover the patterns`), `README "What it cannot show" does not say "${n} rules cover"`);
});

test("llms.txt states the prose rule count and the commit rule count", () => {
  const llms = readFileSync("llms.txt", "utf8");
  assert.ok(llms.includes(`${cap(word(rules.length))} rules for prose`), "llms.txt prose rule count is wrong");
  assert.ok(llms.includes(`${word(commitRules.length)} that only a commit message`), "llms.txt commit rule count is wrong");
});

test("the README demo sentence states the finding count the fixture produces", () => {
  const run = spawnSync(process.execPath, ["dist/src/cli.js", "test/fixtures/sloppy.md", "--warn"], { encoding: "utf8" });
  const n = Number(/(\d+) findings\)/.exec(run.stdout.split("\n")[0])[1]);
  assert.ok(readFileSync("README.md", "utf8").includes(`first eleven of ${word(n)} findings`), `README does not say "first eleven of ${word(n)} findings"`);
});
