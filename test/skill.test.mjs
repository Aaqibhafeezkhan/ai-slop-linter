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
// a README that quotes a stock phrase on purpose.
test("SKILL.md is under 150 lines", () => {
  const lines = skill.split("\n").length;
  assert.ok(lines < 150, `${lines} lines`);
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

test("the CI section lints a directory or glob from a lint:prose script, configured by .slop.json", () => {
  assert.match(skill, /^## Set up a prose check in CI$/m);
  const section = sectionOf("## Set up a prose check in CI");
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
  const section = sectionOf("## Set up a prose check in CI");
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
  const section = sectionOf("## Set up a prose check in CI");
  assert.ok(section.includes('"**/*.md"'), "the script lints every Markdown file");
  assert.ok(section.includes("README"), "the README is named");
  assert.ok(section.includes("CHANGELOG"), "the CHANGELOG is named");
  assert.ok(section.includes("overrides"), "the quoted-phrase case names overrides");
  assert.ok(!/"lint:prose": "ai-slop-linter \\"docs\/\*\*/.test(section), "the script is not the docs-only glob");
  assert.match(section, /override's `ignore` replaces the top-level `ignore` for that path/, "an override replaces the top-level ignore");
  assert.match(section, /copy the repository's top-level ignores/);
  assert.match(skill, /`--fix` also rewrites a dash inside a quotation in another language/);
});
