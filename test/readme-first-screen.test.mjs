import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { CATEGORY, PAIN } from "./surface-text.mjs";

const readme = readFileSync("README.md", "utf8");
const lines = readme.split("\n");

test("line 1 is the pain sentence and the first paragraph after it is the category sentence", () => {
  assert.equal(lines[0], PAIN);
  assert.equal(readme.split("\n\n")[1], CATEGORY + " It lists each tell with a line, a column and a reason, and `--explain <rule>` gives the source for that rule. It runs on your machine and calls no model.");
});

test("the run command is the first code block, within the first ten lines", () => {
  const open = lines.findIndex((l) => l.startsWith("```"));
  assert.ok(open >= 0 && open < 10, `the first code block opens on line ${open + 1}`);
  assert.equal(lines[open + 1], "npx ai-slop-linter README.md");
});

test("the recording sits on the first screen and is referenced by a relative path", () => {
  const img = lines.slice(0, 20).findIndex((l) => /^!\[[^\]]+\]\(docs\/demo\.gif\)$/.test(l));
  assert.ok(img >= 0, "no ![...](docs/demo.gif) in the first twenty lines");
  const images = [...readme.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)|<img[^>]*\bsrc="([^"]+)"/g)].map((m) => m[1] ?? m[2]);
  // The image itself must not be served from raw.githubusercontent.com. A shields endpoint badge
  // carries such a URL as its ?url= parameter, but the image comes from img.shields.io.
  const host = (u) => (/^https?:/.test(u) ? new URL(u.replace(/&amp;/g, "&")).host : "");
  assert.deepEqual(images.filter((u) => host(u) === "raw.githubusercontent.com"), [], "an image uses a raw.githubusercontent.com URL");
});

test("no star badge, and no badge that shows a single-digit count", () => {
  assert.ok(!/img\.shields\.io\/github\/stars/.test(readme), "the stars badge is back");
});

test("the version pins that scripts/release.mjs rewrites are still in the README", () => {
  assert.match(readme, /rev: v\d+\.\d+\.\d+-pre-commit/);
  assert.match(readme, /uses: Bubblegunn\/ai-slop-linter@v0\n/);
});

// Not personal: a GitHub noreply address, and the noreply address that commit trailers name
// (`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`). Every other address fails.
const NOT_PERSONAL = [/@users\.noreply\.github\.com$/i, /^noreply@anthropic\.com$/i];

test("no personal e-mail address in the documents readers see", () => {
  const files = ["README.md", "README.tr.md", ...readdirSync("docs").filter((f) => /^[A-Z-]+\.md$/.test(f)).map((f) => `docs/${f}`)];
  for (const f of files) {
    const bad = [...readFileSync(f, "utf8").matchAll(/[\w.+-]+@(?:[\w-]+\.)+[a-z]{2,}/gi)].map((m) => m[0]).filter((a) => !NOT_PERSONAL.some((re) => re.test(a)));
    assert.deepEqual(bad, [], `${f} shows ${bad.join(", ")}`);
  }
});

test("the dash default is not described as decided", () => {
  assert.match(readme, /has not been decided/);
  assert.ok(!/we decided|was decided|default is now/i.test(readme));
});
