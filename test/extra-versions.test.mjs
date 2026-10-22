import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

// Packages that live in this repository but publish on their own must state the version of the
// package they wrap. The release scripts only know package.json, so this test is what keeps the
// others from drifting: a release commit sets all of them, and CI fails if one is forgotten.
const root = join(import.meta.dirname, "..");
const version = JSON.parse(readFileSync(join(root, "package.json"), "utf8")).version;
const MANIFESTS = ["textlint-rule-ai-slop/package.json", "vscode/package.json"];

for (const rel of MANIFESTS) {
  test(`${rel} states the same version as package.json`, () => {
    assert.ok(existsSync(join(root, rel)), `${rel} is missing`);
    const manifest = JSON.parse(readFileSync(join(root, rel), "utf8"));
    assert.equal(manifest.version, version);
    if (manifest.dependencies?.["ai-slop-linter"] !== undefined) assert.equal(manifest.dependencies["ai-slop-linter"], `^${version}`);
  });
}
