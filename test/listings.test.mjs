import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CATEGORY } from "./surface-text.mjs";

// docs/LISTINGS.md is the text to paste into each store. The metadata files in this repository
// must carry the same strings, or the store shows one thing and the listing file another.
const listings = readFileSync("docs/LISTINGS.md", "utf8");
const json = (f) => JSON.parse(readFileSync(f, "utf8"));

/** The value of "- <label>: `value`" inside the "## <heading>" section. */
function field(heading, label) {
  const start = listings.indexOf(`\n## ${heading}\n`);
  assert.ok(start >= 0, `LISTINGS.md has no section "${heading}"`);
  const end = listings.indexOf("\n## ", start + 4);
  const section = listings.slice(start, end === -1 ? undefined : end);
  // A value containing a backtick uses a double-backtick code span (CommonMark).
  const m = new RegExp(`^- ${label}: (?:\`\` (.+) \`\`|\`([^\`]+)\`)$`, "m").exec(section);
  assert.ok(m, `no "- ${label}: \`...\`" line in section "${heading}"`);
  return m[1] ?? m[2];
}
const list = (s) => s.split(",").map((x) => x.trim());

test("npm: ai-slop-linter listing matches package.json and the category sentence", () => {
  const pkg = json("package.json");
  assert.equal(field("npm: ai-slop-linter", "Short description"), CATEGORY);
  assert.equal(pkg.description, CATEGORY);
  assert.deepEqual(list(field("npm: ai-slop-linter", "Keywords")), pkg.keywords);
});

test("npm: textlint-rule-ai-slop listing matches its package.json", () => {
  const pkg = json("textlint-rule-ai-slop/package.json");
  assert.equal(field("npm: textlint-rule-ai-slop", "Short description"), pkg.description);
  assert.deepEqual(list(field("npm: textlint-rule-ai-slop", "Keywords")), pkg.keywords);
});

test("the Action listing matches action.yml and fits the 125-character limit", () => {
  const text = field("GitHub Marketplace listing for the Action", "Short description");
  assert.ok(text.length <= 125, `${text.length} characters`);
  const line = readFileSync("action.yml", "utf8").split("\n").find((l) => l.startsWith("description: "));
  assert.equal(line, `description: ${text}`);
});

test("the VS Code listing matches vscode/package.json", () => {
  const pkg = json("vscode/package.json");
  assert.equal(field("VS Code Marketplace listing", "Short description"), pkg.description);
  assert.equal(field("VS Code Marketplace listing", "Display name"), pkg.displayName);
  assert.equal(field("VS Code Marketplace listing", "Category"), pkg.categories[0]);
  assert.deepEqual(list(field("VS Code Marketplace listing", "Keywords")), pkg.keywords);
});

test("the skills.sh description is the SKILL.md description, unchanged", () => {
  const front = /^description: (.+)$/m.exec(readFileSync("skills/ai-slop-linter/SKILL.md", "utf8"));
  assert.equal(field("skills.sh", "Description"), front[1]);
});

test("the Claude Code plugin listing matches plugin.json and marketplace.json", () => {
  const text = field("Claude Code plugin directory", "Short description");
  assert.equal(json(".claude-plugin/plugin.json").description, text);
  assert.equal(json(".claude-plugin/marketplace.json").plugins[0].description, text);
  assert.deepEqual(list(field("Claude Code plugin directory", "Keywords")), json(".claude-plugin/plugin.json").keywords);
});
