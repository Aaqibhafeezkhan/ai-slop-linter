import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";

// The README's recording must show this tool's real output and nothing else. The tape types
// only `ai-slop-linter ...` and `clear`, and puts `scripts/vhs-bin` (a shim that runs the build in
// this repository) on PATH inside a Hide block. A fake command in the tape fails here.
const tape = readFileSync("docs/demo.tape", "utf8").split("\n");

test("the tape records docs/demo.gif and types only real commands", () => {
  assert.ok(tape.includes("Output docs/demo.gif"));
  let hidden = false;
  const shown = [];
  const hiddenTyped = [];
  for (const line of tape) {
    if (line === "Hide") hidden = true;
    else if (line === "Show") hidden = false;
    const m = /^Type "(.*)"$/.exec(line);
    if (m) (hidden ? hiddenTyped : shown).push(m[1]);
  }
  assert.deepEqual(hiddenTyped, ["export PATH=$PWD/scripts/vhs-bin:$PATH && clear"]);
  assert.ok(shown.length >= 2, "the recording shows fewer than two commands");
  for (const cmd of shown) {
    assert.match(cmd, /^(clear|ai-slop-linter( --?[a-z-]+| [\w./-]+)+)$/, `the tape types "${cmd}", which is not an ai-slop-linter command`);
    for (const word of cmd.split(" ").filter((w) => w.endsWith(".md"))) assert.ok(existsSync(word), `${word} is linted in the recording but does not exist`);
  }
});

test("the shim runs the build in this repository", () => {
  const shim = "scripts/vhs-bin/ai-slop-linter";
  assert.equal(readFileSync(shim, "utf8"), '#!/bin/sh\nexec node "$(dirname "$0")/../../dist/src/cli.js" "$@"\n');
  assert.ok(statSync(shim).mode & 0o111, "the shim is not executable");
});

test("the GIF exists, is a GIF and stays small", () => {
  const bytes = readFileSync("docs/demo.gif");
  assert.equal(bytes.subarray(0, 6).toString("latin1"), "GIF89a");
  assert.ok(bytes.length <= 600_000, `docs/demo.gif is ${bytes.length} bytes; the limit is 600000`);
});
