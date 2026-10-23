import { test } from "node:test";
import assert from "node:assert/strict";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

// skills/ai-slop-linter/SKILL.md is the text an agent loads. Its description is pinned by
// docs/LISTINGS.md and test/listings.test.mjs, so this file checks the body and the frontmatter
// shape, and that the skill itself passes the linter it teaches.
const skill = readFileSync("skills/ai-slop-linter/SKILL.md", "utf8");
const listings = readFileSync("docs/LISTINGS.md", "utf8");
// The CI recipe moved to references/ci.md in round 3 so the rewrite steps carry more weight in SKILL.md;
// SKILL.md keeps a pointer section. The CI tests below read the recipe from there.
const ci = readFileSync("skills/ai-slop-linter/references/ci.md", "utf8");

test("SKILL.md frontmatter names the skill and keeps the listed description", () => {
  const name = /^name: (.+)$/m.exec(skill)?.[1];
  assert.equal(name, "ai-slop-linter");
  const description = /^description: (.+)$/m.exec(skill)?.[1];
  assert.ok(description, "no description line");
  const listed = /^- Description: `` (.+) ``$/m.exec(listings)?.[1];
  assert.equal(description, listed);
});

test("the body names the language flag, the comparison, dialogue and guillemets", () => {
  for (const term of ["--language", "--compare", "dialogue", "guillemets"]) {
    assert.ok(skill.includes(term), `SKILL.md does not mention ${term}`);
  }
});

// The bound was 140. The CI section grew by about ten lines on 2026-10-22 because the h15 readiness
// check showed that its old recipe left the README unchecked and said nothing about the CHANGELOG or
// a README that quotes a stock phrase on purpose. In round 3 the recipe moved to references/ci.md.
test("SKILL.md is under 155 lines", () => {
  const lines = skill.split("\n").length;
  assert.ok(lines < 155, `${lines} lines`);
});

test("SKILL.md has no em dash or en dash", () => {
  assert.doesNotMatch(skill, /[–—]/);
});

test("the linter passes on SKILL.md with exit 0", () => {
  const run = spawnSync(process.execPath, ["dist/src/cli.js", "skills/ai-slop-linter/SKILL.md"], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stdout + run.stderr);
});

test("the compare step defines TMP explicitly and writes the before copy under it", () => {
  assert.ok(skill.includes("TMP=$(mktemp -d)"), "SKILL.md does not define TMP=$(mktemp -d)");
  assert.ok(skill.includes('"$TMP/before.md"'), 'SKILL.md does not write the before copy to "$TMP/before.md"');
});

test("the dash statement is the exact one", () => {
  assert.ok(
    skill.includes("for text whose language is not English the `dash` and `title-case-heading` rules stand down"),
    "the dash sentence is not the exact statement",
  );
  assert.ok(skill.includes("the CLI names the language it used"), "the CLI does not name the language it used");
});

test("the judgment section exists, says the CLI does not enforce it, and lists the stock tells", () => {
  assert.match(skill, /^## Judgment checks for other languages$/m);
  const section = skill.slice(skill.indexOf("## Judgment checks for other languages"));
  assert.match(section, /the CLI does not enforce/);
  for (const tell of [
    "pas seulement",
    "véritable révolution",
    "Plongeons dans",
    "sans faille",
    "En conclusion",
    "N'hésitez pas à",
    "l'avenir s'annonce radieux",
    "sumérgete en",
    "no solo",
    "sino",
    "no dudes en",
    "tauchen wir ein",
    "nicht nur",
    "sondern auch",
    "zögern Sie nicht",
  ]) {
    assert.ok(section.includes(tell), `the judgment section does not list "${tell}"`);
  }
});

/** The text of one "## " section, up to the next one. */
function sectionOf(heading) {
  const start = skill.indexOf(`\n${heading}\n`);
  assert.ok(start >= 0, `SKILL.md has no section "${heading}"`);
  const end = skill.indexOf("\n## ", start + 1);
  return skill.slice(start, end === -1 ? undefined : end);
}

test("the description fires on rewrites, other languages, launch and release notes, and CI setup", () => {
  const description = /^description: (.+)$/m.exec(skill)?.[1] ?? "";
  assert.ok(description.length < 600, `${description.length} characters`);
  for (const term of ["any language", "rewrite", "sound natural", "more human", "launch notes", "release notes", "CI"]) {
    assert.ok(description.includes(term), `the description does not mention "${term}"`);
  }
  for (const verb of ["réécris", "reescribe", "schreib um", "yeniden yaz"]) {
    assert.ok(description.includes(verb), `the description does not give the example verb "${verb}"`);
  }
});

test("SKILL.md keeps a CI pointer section that sends the agent to references/ci.md", () => {
  const pointer = sectionOf("## Set up a prose check in CI");
  assert.ok(pointer.includes("references/ci.md"), "the pointer does not name references/ci.md");
  assert.ok(pointer.includes("lint:prose"), "the pointer does not name the lint:prose script");
});

test("references/ci.md lints clean", () => {
  const run = spawnSync(process.execPath, ["dist/src/cli.js", "--warn", "skills/ai-slop-linter/references/ci.md"], { encoding: "utf8" });
  assert.match(run.stdout, /, 0 findings\)/, run.stdout + run.stderr);
});

test("the CI section lints a directory or glob from a lint:prose script, configured by .slop.json", () => {
  const section = ci;
  assert.ok(section.includes("lint:prose"), "the CI section does not name the lint:prose script");
  assert.ok(section.includes(".slop.json"), "the CI section does not mention .slop.json");
  assert.ok(section.includes("directory"), 'the CI section does not say "directory"');
});

// ---- the CI recipe, applied literally to a copy of the h15 fixture (Task 20 readiness check) ----------------------
// The recipe is read out of SKILL.md, so a change to its text changes what this test runs. The CLI is the
// built one, reached through a node_modules/.bin shim the way npm run would reach an installed package.
const BENCH = resolve("bench", "head-to-head");
const DIRTY = "In today's fast-paced world, this guide delves into a seamless, robust workflow \u2014 and it is a testament to our commitment. I hope this helps!";
function recipe() {
  const section = ci;
  const blocks = [...section.matchAll(/```json\n([\s\S]*?)\n```/g)].map((m) => m[1]);
  const script = JSON.parse(`{${blocks[0]}}`).scripts["lint:prose"];
  const config = JSON.parse(blocks[1]);
  return { script, config };
}
function setup() {
  const dir = mkdtempSync(join(tmpdir(), "slop-recipe-"));
  cpSync(join(BENCH, "fixtures", "h15"), dir, { recursive: true });
  cpSync(join(BENCH, "golden", "h15", "docs", "guide.md"), join(dir, "docs", "guide.md"));
  const bin = join(dir, "node_modules", ".bin");
  mkdirSync(bin, { recursive: true });
  writeFileSync(join(bin, "ai-slop-linter"), `#!/bin/sh\nexec node ${JSON.stringify(resolve("dist", "src", "cli.js"))} "$@"\n`);
  chmodSync(join(bin, "ai-slop-linter"), 0o755);
  const { script, config } = recipe();
  const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
  pkg.scripts["lint:prose"] = script;
  writeFileSync(join(dir, "package.json"), JSON.stringify(pkg, null, 2));
  writeFileSync(join(dir, ".slop.json"), JSON.stringify(config));
  return dir;
}
const lint = (dir) => spawnSync("npm", ["run", "lint:prose"], { cwd: dir, encoding: "utf8" }).status;

test("the CI recipe, run literally on the h15 files: clean files exit 0, a new bad file or a bad README exit 1", () => {
  const dir = setup();
  try {
    assert.equal(lint(dir), 0, "the legitimate files pass");
    // Replacement, not addition: with a top-level ignore of dash, a dash passes in other files but
    // fails in the README, whose override list does not repeat dash.
    const cfg = JSON.parse(readFileSync(join(dir, ".slop.json"), "utf8"));
    writeFileSync(join(dir, ".slop.json"), JSON.stringify({ ignore: ["dash"], ...cfg }));
    const readme0 = readFileSync(join(dir, "README.md"), "utf8");
    const guide0 = readFileSync(join(dir, "docs", "guide.md"), "utf8");
    writeFileSync(join(dir, "docs", "guide.md"), `${guide0}\nThe tool is fast \u2014 and small.\n`);
    assert.equal(lint(dir), 0, "the top-level ignore covers a dash in a guide");
    writeFileSync(join(dir, "docs", "guide.md"), guide0);
    writeFileSync(join(dir, "README.md"), `${readme0}\nThe tool is fast \u2014 and small.\n`);
    assert.equal(lint(dir), 1, "the README override replaced the top-level ignore, so its dash fails");
    writeFileSync(join(dir, "README.md"), readme0);
    writeFileSync(join(dir, ".slop.json"), JSON.stringify(cfg));
    mkdirSync(join(dir, "docs", "guides"), { recursive: true });
    writeFileSync(join(dir, "docs", "guides", "new.md"), `# New\n\n${DIRTY}\n`);
    assert.equal(lint(dir), 1, "a new bad file in a subfolder fails with exit 1");
    rmSync(join(dir, "docs", "guides", "new.md"));
    mkdirSync(join(dir, "notes"), { recursive: true });
    writeFileSync(join(dir, "notes", "new.md"), `# New\n\n${DIRTY}\n`);
    assert.equal(lint(dir), 1, "a bad file outside docs/ fails too");
    rmSync(join(dir, "notes"), { recursive: true });
    const readme = readFileSync(join(dir, "README.md"), "utf8");
    writeFileSync(join(dir, "README.md"), `${readme}\n${DIRTY}\n`);
    assert.equal(lint(dir), 1, "a bad paragraph in the README fails with exit 1");
    writeFileSync(join(dir, "README.md"), readme);
    const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
    pkg.scripts["lint:prose"] = 'ai-slop-linter "nothing/**/*.md"';
    writeFileSync(join(dir, "package.json"), JSON.stringify(pkg));
    assert.equal(lint(dir), 2, "a glob that matches no file is a usage error");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("the CI section covers the README, the CHANGELOG and a README that quotes a stock phrase", () => {
  const section = ci;
  assert.ok(section.includes('"**/*.md"'), "the script lints every Markdown file");
  assert.ok(section.includes("README"), "the README is named");
  assert.ok(section.includes("CHANGELOG"), "the CHANGELOG is named");
  assert.ok(section.includes("overrides"), "the quoted-phrase case names overrides");
  assert.ok(!/"lint:prose": "ai-slop-linter \\"docs\/\*\*/.test(section), "the script is not the docs-only glob");
  assert.match(section, /override's `ignore` replaces the top-level `ignore` for that path/, "an override replaces the top-level ignore");
  assert.match(section, /copy the repository's top-level ignores/);
  assert.match(skill, /`--fix` also rewrites a dash inside a quotation in another language/);
});

// The reference files the skill makes the agent read after the linter (round 2 plan item 3). The agent
// reads one on every rewrite, so each stays small, names its source, and passes the linter it serves.
const REFERENCES = ["en", "fr", "de", "es", "pt", "nl", "pl", "id", "tr"].map((l) => `skills/ai-slop-linter/references/${l}.md`);

test("SKILL.md names every reference file, says when to read it and that a failing compare blocks", () => {
  for (const file of ["references/", "en.md", "fr.md", "de.md", "es.md", "pt.md", "nl.md", "pl.md", "id.md", "tr.md"]) {
    assert.ok(skill.includes(file), `SKILL.md does not name ${file}`);
  }
  assert.match(skill, /^## Read the reference file$/m);
  assert.match(skill, /A failing compare is blocking/);
  assert.match(skill, /`added person our`/);
  assert.match(skill, /until it exits 0/);
  // npm still serves 0.1.x, which rejects --compare: the skill must say what to do then, or a blocking
  // compare that can never pass would hold the agent.
  assert.match(skill, /before 0\.2\.0 that answers `--compare` with `unknown option`/);
  assert.match(skill, /UserPromptSubmit/);
});

for (const file of REFERENCES) {
  test(`${file} exists, is under 250 lines, names its source and lints clean`, () => {
    assert.ok(existsSync(file), `${file} is missing`);
    const text = readFileSync(file, "utf8");
    assert.ok(text.split("\n").length < 250, `${file} is too long`);
    assert.match(text.split("\n")[2], /^Source: /, "the third line is not the source note");
    assert.match(text, /Add no fact\. Change no number\./);
    // A fix direction that names a detail ("say what changes", "name who decided") ties it to the source.
    assert.match(text, /from the source/);
    const run = spawnSync(process.execPath, ["dist/src/cli.js", "--warn", file], { encoding: "utf8" });
    assert.match(run.stdout, /, 0 findings\)/, run.stdout + run.stderr);
  });
}

test("the reference files adapted from a competitor name its commit in the source note and in the notices", () => {
  const notices = readFileSync("THIRD-PARTY-NOTICES.md", "utf8");
  for (const [file, commit] of [
    ["skills/ai-slop-linter/references/en.md", "38912ce43453129c63eef958bf65faef4833c18e"],
    ["skills/ai-slop-linter/references/de.md", "d65241e66f2b0e0d0b305cb55dadbffac0f9ef52"],
  ]) {
    assert.ok(readFileSync(file, "utf8").split("\n")[2].includes(commit), `${file} does not name ${commit}`);
    assert.ok(notices.includes(file), `THIRD-PARTY-NOTICES.md does not name ${file}`);
  }
});

// Round 3 plan items 3, 4 and 10: the rewrite is minimal, a second pass lists what is left, and a long
// text is outlined first. Adapted from unslop, Humanizer and everwrite (MIT, see THIRD-PARTY-NOTICES.md).
test("How to work asks for the minimal edit, an outline for long texts and a second pass with a list", () => {
  const work = sectionOf("## How to work");
  assert.match(work, /copy every other sentence word for word/);
  assert.match(work, /over about 300 words, outline it/);
  assert.match(work, /second pass/);
  assert.match(work, /list every tell that is still there/);
  assert.match(work, /Fix each one, or name in a few words why it stays/);
  assert.match(work, /never in the file/);
  assert.match(work, /until the compare exits 0/);
  const notices = readFileSync("THIRD-PARTY-NOTICES.md", "utf8");
  for (const name of ["## unslop", "## Humanizer (blader)", "## everwrite"]) {
    const block = notices.slice(notices.indexOf(name), notices.indexOf("```", notices.indexOf(name)));
    assert.match(block, /How to work/, `${name} does not credit the How to work steps`);
  }
});

// Round 3 plan items 5 to 8 and 14: two tiers per reference file, the load-bearing metaphor family in
// all four, participle and gerund tails in fr/de/es, and the CC0 words (Juzek 2026) in the second tier.
for (const lang of ["en", "fr", "de", "es"]) {
  const file = `skills/ai-slop-linter/references/${lang}.md`;
  test(`${file} has the two tiers, in order, and the load-bearing metaphor family with literal uses kept`, () => {
    const text = readFileSync(file, "utf8");
    const one = text.indexOf("\n## Act on one sighting\n");
    const several = text.indexOf("\n## Act only when several appear\n");
    assert.ok(one > 0 && several > one, "the two tier headings are missing or out of order");
    assert.match(text.slice(one, several), /Load-bearing metaphor/);
    assert.match(text, /Literal uses stay/);
    if (lang !== "en") {
      assert.match(text.slice(one, several), /### (Participle|Gerund)/, "no participle or gerund tail entry in the first tier");
      const tier2 = text.slice(several);
      assert.match(tier2, /Juzek 2026, CC0/, "the CC0 words are not in the second tier");
      assert.ok(readFileSync("THIRD-PARTY-NOTICES.md", "utf8").includes(file), `the notices do not name ${file}`);
    }
  });
}

test("the reference files quote every tell in backticks: the CLI with no --warn filter finds nothing in them", () => {
  for (const lang of ["en", "fr", "de", "es", "pt", "nl", "pl", "id", "tr"]) {
    const run = spawnSync(process.execPath, ["dist/src/cli.js", "--language", "en", `skills/ai-slop-linter/references/${lang}.md`], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
  }
});
