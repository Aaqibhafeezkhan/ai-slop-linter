import { test } from "node:test";
import assert from "node:assert/strict";
import { parseStyle } from "../scripts/vale-style.mjs";

test("a Vale existence style yields its tokens and case setting", () => {
  const yml = ["---", "extends: existence", "ignorecase: true", "tokens:", "  # a comment", "  - This commit adds", "  - 'it''s ready'", '  - "quoted"', "  - '(?i)Mixed Case'", ""].join("\n");
  assert.deepEqual(parseStyle(yml), { ignorecase: true, tokens: ["This commit adds", "it's ready", "quoted", "Mixed Case"] });
});

test("syntax the generator cannot translate is an error, not a silently dropped token", () => {
  const yml = "tokens:\n  - '\\bthe tree(?:\\b(?!\\s+of))'\n";
  assert.throws(() => parseStyle(yml), /does not translate/);
  assert.throws(() => parseStyle("tokens:\n"), /no tokens/);
  assert.throws(() => parseStyle("tokens:\n  not a list item\n"), /cannot read token line/);
});
