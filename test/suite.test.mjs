// @ts-check
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const script = () => JSON.parse(readFileSync(join(root, "package.json"), "utf8")).scripts.test;
// Compare whole whitespace-separated tokens. A substring check let two glued names
// ("dist/test/a.test.jstest/b.test.mjs") satisfy both files, so neither one ran.
const tokens = () => new Set(script().split(/\s+/).filter(Boolean));

// This has now gone wrong twice across these repositories: a test file was added and never
// named in the script, so it never ran and CI stayed green without it. A TypeScript test
// compiles to dist/test/<name>.test.js and must be named there; an .mjs test runs from
// test/ directly. Either way, a file that exists and is not run is a defect.
test("every TypeScript test is named in the npm test script", () => {
  const s = tokens();
  const onDisk = readdirSync(join(root, "test")).filter((f) => f.endsWith(".test.ts"));
  const missing = onDisk.filter((f) => !s.has(`dist/test/${f.replace(/\.ts$/, ".js")}`));
  assert.deepEqual(missing, [], `not run by npm test: ${missing.join(", ")}`);
});

test("every .mjs test is named in the npm test script", () => {
  const s = tokens();
  const onDisk = readdirSync(join(root, "test")).filter((f) => f.endsWith(".test.mjs"));
  const missing = onDisk.filter((f) => !s.has(`test/${f}`));
  assert.deepEqual(missing, [], `not run by npm test: ${missing.join(", ")}`);
});
