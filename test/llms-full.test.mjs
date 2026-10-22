import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { SOURCES, build } from "../scripts/llms-full.mjs";
import { CATEGORY } from "./surface-text.mjs";

test("every source exists and llms-full.txt carries each one and the category sentence", () => {
  for (const f of SOURCES) assert.ok(existsSync(f), `${f} is listed in scripts/llms-full.mjs and does not exist`);
  const out = build();
  for (const f of SOURCES) assert.ok(out.includes(`Source: ${f}\n`), `${f} is missing from the output`);
  assert.ok(out.includes(CATEGORY));
});

test("the committed llms-full.txt is what the script writes now", () => {
  const r = spawnSync(process.execPath, ["scripts/llms-full.mjs", "--check"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
});

test("llms.txt points at llms-full.txt", () => {
  assert.ok(readFileSync("llms.txt", "utf8").includes("llms-full.txt"));
});
