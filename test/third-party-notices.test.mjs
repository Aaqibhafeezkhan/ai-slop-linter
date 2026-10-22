import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// THIRD-PARTY-NOTICES.md must carry each competitor's copyright line exactly as its LICENSE
// states it. The three lines are written here, not read from the competitors' checkouts, so the
// test needs nothing outside this repository. Every source that the candidates file names must be
// named in the notices too.
const notices = readFileSync("THIRD-PARTY-NOTICES.md", "utf8");
const candidates = readFileSync("bench/packs/CANDIDATES.md", "utf8");
const skill = readFileSync("skills/ai-slop-linter/SKILL.md", "utf8");

const COPYRIGHT = [
  "Copyright (c) 2026 Jean-Luc Winkler", // unslop
  "Copyright (c) 2025 Siqi Chen", // Humanizer (blader)
  "Copyright (c) 2026 Tato Polanco", // anti-ai-writing
  "Copyright (c) 2026 Mark Rogers", // everwrite (home-ground test material)
];

for (const line of COPYRIGHT) {
  test(`THIRD-PARTY-NOTICES.md carries the copyright line "${line}"`, () => {
    assert.ok(notices.split("\n").includes(line), `no line reading exactly "${line}"`);
  });
}

const SOURCES = ["unslop", "anti-ai-writing", "h1 fixture"];

for (const source of SOURCES) {
  test(`CANDIDATES.md names "${source}" and THIRD-PARTY-NOTICES.md names it too`, () => {
    assert.ok(candidates.includes(source), `CANDIDATES.md does not mention ${source}`);
    assert.ok(notices.includes(source), `THIRD-PARTY-NOTICES.md does not mention ${source}`);
  });
}

test("the judgment section names anti-ai-writing next to unslop", () => {
  const sentence = skill.split("\n").find((l) => l.startsWith("The lists come from"));
  assert.ok(sentence, "no source sentence in the judgment section");
  assert.ok(sentence.includes("unslop and anti-ai-writing"), sentence);
});

test("THIRD-PARTY-NOTICES.md has a Corpus texts section that points at both corpus manifests", () => {
  const section = notices.slice(notices.indexOf("## Corpus texts"));
  assert.ok(notices.includes("## Corpus texts"), "no Corpus texts section");
  assert.ok(section.includes("bench/packs/MANIFEST.md") && section.includes("bench/typography/MANIFEST.md"), "section does not name both manifests");
});
