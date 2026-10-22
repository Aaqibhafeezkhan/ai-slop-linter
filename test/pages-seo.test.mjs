import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CATEGORY } from "./surface-text.mjs";

// What a search engine or a language model reads from the Pages site. The page itself is tested
// in playground.test.ts; this checks the metadata and the extra files.
const site = mkdtempSync(join(tmpdir(), "slop-seo-"));
const built = spawnSync(process.execPath, ["scripts/playground-build.mjs", "--out", site], { encoding: "utf8" });
assert.equal(built.status, 0, built.stderr);
const html = readFileSync(join(site, "index.html"), "utf8");
test.after(() => rmSync(site, { recursive: true, force: true }));

test("the page title and meta description say what the tool is", () => {
  assert.match(html, /<title>ai-slop-linter playground: lint AI-sounding phrases in your text<\/title>/);
  assert.ok(html.includes(`<meta name="description" content="${CATEGORY}">`));
  assert.ok(html.includes(`<meta property="og:description" content="${CATEGORY}">`));
});

test("the JSON-LD parses and describes the repository as SoftwareSourceCode", () => {
  const m = /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/.exec(html);
  assert.ok(m, "no JSON-LD block");
  const ld = JSON.parse(m[1]);
  assert.equal(ld["@context"], "https://schema.org");
  assert.equal(ld["@type"], "SoftwareSourceCode");
  assert.equal(ld.description, CATEGORY);
  assert.equal(ld.codeRepository, "https://github.com/Bubblegunn/ai-slop-linter");
});

test("the sitemap lists the page, and llms.txt links point at GitHub, not at paths that 404 on Pages", () => {
  const sitemap = readFileSync(join(site, "sitemap.xml"), "utf8");
  assert.ok(sitemap.includes("<loc>https://bubblegunn.github.io/ai-slop-linter/</loc>"));
  const llms = readFileSync(join(site, "llms.txt"), "utf8");
  assert.ok(llms.includes(CATEGORY));
  assert.deepEqual([...llms.matchAll(/\]\((?!https?:|mailto:|#)([^)\s]+)\)/g)].map((m) => m[1]), [], "a relative link is left in the published llms.txt");
  assert.ok(llms.includes("](https://github.com/Bubblegunn/ai-slop-linter/blob/main/docs/FAQ.md)"));
});
