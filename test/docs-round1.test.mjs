import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// Round 0 ran five tasks that have since been replaced. Its numbers must not stand as a result
// anywhere a reader would take them for one, and the README block that held them is pinned to
// the sentence that replaced them. The other tests pin the round-1 disclosures to their files.
const read = (path) => readFileSync(path, "utf8");

const NUMBER_FILES = ["README.md", "README.tr.md", "CHANGELOG.md", "docs/HEAD-TO-HEAD.md", "llms-full.txt"];
const ARM = "(?:ours|Ours|bizim|Humanizer|unslop|everwrite|No-plugin baseline|no plugin|eklenti yok)";

for (const file of NUMBER_FILES) {
  test(`${file} carries no round-0 score for any arm`, () => {
    // The round-1 results section holds round-1 counts and scores, which are not round 0.
    const text = read(file).replace(/## Results, round 1\n[\s\S]*?\n## How to re-run/, "## How to re-run");
    assert.doesNotMatch(text, new RegExp(`\\|\\s*${ARM}[^|\\n]*\\|\\s*\\d+\\s*\\|`), "a table row gives an arm a score");
    assert.doesNotMatch(text, new RegExp(`${ARM}\\s+(?:22|21|19)\\b`), "a sentence gives an arm a round-0 score");
    assert.doesNotMatch(text, /score, out of 25|25 üzerinden puan/, "the round-0 table header is back");
  });
}

const H2H_START = "<!-- h2h:start -->";
const H2H_END = "<!-- h2h:end -->";
const block = (text) => text.slice(text.indexOf(H2H_START) + H2H_START.length, text.indexOf(H2H_END)).trim();

test("the README comparison block points to the round-1 results", () => {
  assert.equal(
    block(read("README.md")),
    "The round-1 results, including that the win rule was not met, are in docs/HEAD-TO-HEAD.md; the tasks, criteria and harness are public in bench/head-to-head/.",
  );
  assert.equal(block(read("llms-full.txt")), block(read("README.md")));
  assert.match(block(read("README.tr.md")), /docs\/HEAD-TO-HEAD\.md/);
  assert.match(block(read("README.tr.md")), /bench\/head-to-head\//);
});

test("docs/HEAD-TO-HEAD.md keeps the fact that round 0 existed and found T1 and T5 saturated, without scores", () => {
  const text = read("docs/HEAD-TO-HEAD.md");
  assert.match(text, /## Round 0\n\nRound 0 ran on 2026-10-21 with five tasks/);
  assert.match(text, /T1 and T5 were saturated/);
});

test("the 0.2.0 changelog names the star hint, --quiet, compare_facts and the pack listing", () => {
  const text = read("CHANGELOG.md");
  const section = text.slice(text.indexOf("## 0.2.0"), text.indexOf("\n## ", text.indexOf("## 0.2.0") + 4));
  for (const needle of ["star hint", "`--quiet`", "AI_SLOP_LINTER_NO_STAR_HINT", "`compare_facts`", "SARIF", "`--rules`", "`explain_rule`"]) {
    assert.ok(section.includes(needle), `0.2.0 does not mention ${needle}`);
  }
});

test("docs/mcp.md documents compare_facts, and README.tr.md the star hint", () => {
  assert.match(read("docs/mcp.md"), /\| `compare_facts` \| `before` and `after`/);
  const tr = read("README.tr.md");
  assert.ok(tr.includes("AI_SLOP_LINTER_NO_STAR_HINT=1") && tr.includes("--quiet"));
});

test("THIRD-PARTY-NOTICES.md itemises the After texts of h7, h8 and h12 with their sources", () => {
  const text = read("THIRD-PARTY-NOTICES.md");
  for (const needle of ["bench/head-to-head/after/h7/announcement.md", "bench/head-to-head/after/h8/lisbon.md", "bench/head-to-head/after/h12/town.md", "line 14", "lines 188, 190 and 192", "patterns.md"]) {
    assert.ok(text.includes(needle), `the notices do not mention ${needle}`);
  }
});

test("docs/HEAD-TO-HEAD.md discloses its known limits and has a criteria-repairs table with an evidence column", () => {
  const text = read("docs/HEAD-TO-HEAD.md");
  assert.ok(text.includes("## Known limits and disclosures"));
  for (const needle of ["after a smoke run on h1 and h6", "réécris", "schreib um", "all 60 criteria are labelled `outcome`".replace("all", "All"), "`slop-ignore`", "h10 criterion C4"]) {
    assert.ok(text.includes(needle), `the disclosures do not mention ${needle}`);
  }
  assert.ok(text.includes("### Criteria repairs"));
  assert.ok(text.includes("| Date | Task | Criterion | Evidence | Reason |\n|---|---|---|---|---|\n"));
});

test("the skill's CI recipe installs @latest and states the 0.2.0 requirement", () => {
  const skill = read("skills/ai-slop-linter/SKILL.md");
  assert.ok(skill.includes("npm install --save-dev ai-slop-linter@latest"));
  assert.match(skill, /`--compare`, per-file language detection and the French rule need ai-slop-linter 0\.2\.0 or later/);
  assert.match(read("README.md"), /Its `--compare`, per-file language detection and French rule need ai-slop-linter 0\.2\.0 or later/);
});
