#!/usr/bin/env node
/**
 * Measures what the three severities of `dash` would do on the committed corpus and writes
 * bench/DASH-DEFAULT.md, a decision memo. It changes no rule.
 *
 *   node bench/dash.mjs           regenerate the memo
 *   node bench/dash.mjs --check   fail if the committed memo is stale
 */
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { measure, render } from "./dash-lib.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const output = join(root, "bench", "DASH-DEFAULT.md");
const md = render(measure(join(root, "bench", "corpus")));

if (process.argv.includes("--check")) {
  if (readFileSync(output, "utf8") !== md) {
    console.error("bench/DASH-DEFAULT.md is stale; run node bench/dash.mjs and commit the result");
    process.exit(1);
  }
  console.log("dash: bench/DASH-DEFAULT.md is current");
} else {
  writeFileSync(output, md);
  console.log(`wrote ${output}`);
}
