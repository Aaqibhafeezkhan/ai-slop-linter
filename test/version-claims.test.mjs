import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

// The README said "The npm version is 0.1.10" for a week after 0.2.0 and 0.2.1 were on npm.
// This test fails when a document states a version that is not the one in package.json.
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const cmp = (a, b) => {
  const x = a.split(".").map(Number);
  const y = b.split(".").map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
};

// Documents that describe the current state. Dated records (CHANGELOG, benchmarks, research) are excluded.
const CURRENT = ["README.md", "README.tr.md", "llms.txt", "llms-full.txt", "docs/FAQ.md", "docs/LISTINGS.md", "docs/mcp.md"];

/** Statements that name a version as the current npm one or as not yet released. */
export function versionClaims(text) {
  const claims = [];
  for (const m of text.matchAll(/npm version is (\d+\.\d+\.\d+)/g)) claims.push({ kind: "current", version: m[1], text: m[0] });
  for (const m of text.matchAll(/npm'deki sürüm (\d+\.\d+\.\d+)/g)) claims.push({ kind: "current", version: m[1], text: m[0] });
  for (const m of text.matchAll(/unreleased (\d+\.\d+\.\d+)/g)) claims.push({ kind: "unreleased", version: m[1], text: m[0] });
  return claims;
}

export function problems(file, text, current) {
  return versionClaims(text).flatMap((c) => {
    if (c.kind === "current" && c.version !== current) return [`${file}: "${c.text}" but package.json says ${current}`];
    if (c.kind === "unreleased" && cmp(c.version, current) <= 0) return [`${file}: "${c.text}" but ${c.version} is already released (package.json ${current})`];
    return [];
  });
}

test("no document names an old version as the current npm one, or an already released one as unreleased", () => {
  const found = CURRENT.flatMap((f) => problems(f, readFileSync(f, "utf8"), pkg.version));
  assert.deepEqual(found, []);
});

test("the checker catches the stale text this repository shipped (README at 59d6b21)", () => {
  const stale = "The npm version is 0.1.10. Those are in the unreleased 0.2.0.";
  assert.equal(problems("README.md", stale, "0.2.1").length, 2);
  assert.deepEqual(problems("README.md", "The npm version is 0.2.1. Next is the unreleased 0.3.0.", "0.2.1"), []);
});

test("every manifest carries the package.json version", () => {
  const read = (p) => JSON.parse(readFileSync(p, "utf8")).version;
  assert.equal(read("plugin/.claude-plugin/plugin.json"), pkg.version);
  assert.equal(read("textlint-rule-ai-slop/package.json"), pkg.version);
  assert.equal(read("vscode/package.json"), pkg.version);
  assert.match(readFileSync("action.yml", "utf8"), new RegExp(`default: "${pkg.version.replaceAll(".", "\\.")}"`));
});
