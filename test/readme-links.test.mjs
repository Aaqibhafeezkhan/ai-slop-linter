import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

// Every relative link and every same-file anchor in the documents this repository ships for
// readers must resolve. Moving a section into docs/ breaks links silently; this makes it loud.
const FILES = ["README.md", "docs/PAIN.md", "docs/FAQ.md", "docs/OWN-WRITING.md", "docs/SCORING.md", "docs/LANGUAGES.md", "docs/MEASUREMENT.md", "docs/SARIF.md", "docs/CITE.md", "docs/GEO-PROMPTS.md", "docs/LISTINGS.md", "README.tr.md", "llms.txt"]; // later tasks append their files here

const slug = (heading) => heading.trim().toLowerCase().replace(/`/g, "").replace(/[^\p{L}\p{N}\s_-]/gu, "").replace(/\s/g, "-");
const withoutCode = (md) => md.replace(/^```[\s\S]*?^```/gm, "").replace(/`[^`\n]*`/g, "");

export function anchors(md) {
  const seen = new Map();
  const out = new Set();
  for (const m of withoutCode(md).matchAll(/^#{1,6}\s+(.+)$/gm)) {
    const base = slug(m[1]);
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.add(n === 0 ? base : `${base}-${n}`);
  }
  return out;
}

export function targets(md) {
  const body = withoutCode(md);
  const found = [];
  for (const m of body.matchAll(/\]\(([^)\s]+)\)/g)) found.push(m[1]);
  for (const m of body.matchAll(/\b(?:href|src)="([^"]+)"/g)) found.push(m[1]);
  return found.filter((t) => !/^(https?:|mailto:)/.test(t));
}

for (const file of FILES) {
  test(`${file}: every relative link and anchor resolves`, () => {
    const md = readFileSync(file, "utf8");
    const bad = [];
    for (const t of targets(md)) {
      const [path, anchor] = t.split("#");
      const resolved = path === "" ? file : normalize(join(dirname(file), path));
      if (!existsSync(resolved)) {
        bad.push(`${t} -> ${resolved} does not exist`);
        continue;
      }
      if (anchor && resolved.endsWith(".md") && !anchors(readFileSync(resolved, "utf8")).has(anchor)) bad.push(`${t} -> no heading "${anchor}" in ${resolved}`);
    }
    assert.deepEqual(bad, []);
  });
}

test("the checker itself finds a broken link and a broken anchor", () => {
  assert.deepEqual(targets("[a](docs/nope.md) `[b](x.md)` [c](#top) [d](https://x.test)"), ["docs/nope.md", "#top"]);
  assert.ok(anchors("# Title\n\n## GitHub code scanning (SARIF)\n\n```\n## not a heading\n```").has("github-code-scanning-sarif"));
  assert.ok(!anchors("```\n## not a heading\n```").has("not-a-heading"));
});
