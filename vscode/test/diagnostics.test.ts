import { test } from "node:test";
import assert from "node:assert/strict";
import { toDiagnostics, wordEnd } from "../src/diagnostics.ts";
import type { Pos, Settings } from "../src/diagnostics.ts";

const defaults: Settings = { ignore: [], only: [], language: undefined };

/** The text a range covers, so a test states what is underlined instead of counting characters. */
function covered(text: string, start: Pos, end: Pos): string {
  const lines = text.split("\n");
  if (start.line === end.line) return lines[start.line]!.slice(start.character, end.character);
  throw new Error("these tests only use single-line ranges");
}

test("a dash is underlined where it is, with the rule id and an error level", () => {
  const text = "Rates rose — sharply in May.\n";
  const [d] = toDiagnostics(text, defaults);
  assert.equal(d!.rule, "dash");
  assert.equal(d!.level, "error");
  assert.ok(covered(text, d!.start, d!.end).includes("—"));
});

test("a fix carries the range to replace and the replacement, in editor positions", () => {
  const text = "Rates rose — sharply in May.\n";
  const [d] = toDiagnostics(text, defaults);
  assert.ok(d!.fix);
  const line = text.split("\n")[0]!;
  const fixed = line.slice(0, d!.fix.start.character) + d!.fix.replacement + line.slice(d!.fix.end.character);
  assert.ok(!fixed.includes("—"), fixed);
});

test("a finding without a fix is underlined as the word it starts at", () => {
  const text = "We delve into it.\n";
  const d = toDiagnostics(text, defaults).find((x) => x.rule === "ai-vocabulary");
  assert.ok(d, "ai-vocabulary should fire");
  assert.equal(d.fix, undefined);
  assert.equal(covered(text, d.start, d.end), "delve");
  assert.equal(d.level, "warning");
});

test("lines are zero-based and characters count UTF-16 units, so an emoji counts as two characters", () => {
  const plain = toDiagnostics("Hello — there.\n", defaults)[0]!;
  const emoji = toDiagnostics("\u{1F680} Hello — there.\n", defaults)[0]!;
  assert.equal(emoji.start.character - plain.start.character, 3);
  const later = toDiagnostics("Fine.\n\nLet's dive in now.\n", defaults).find((x) => x.rule === "announcing")!;
  assert.equal(later.start.line, 2);
  assert.equal(later.start.character, 0);
});

test("CRLF files give the same positions as LF files", () => {
  const lf = toDiagnostics("Fine.\n\nLet's dive in now.\n", defaults);
  const crlf = toDiagnostics("Fine.\r\n\r\nLet's dive in now.\r\n", defaults);
  assert.deepEqual(crlf.map((d) => d.start), lf.map((d) => d.start));
});

test("ignore, only and language settings reach the linter", () => {
  const text = "Let's dive in — now.\n";
  assert.deepEqual(toDiagnostics(text, { ...defaults, ignore: ["dash"] }).map((d) => d.rule), ["announcing"]);
  assert.deepEqual(toDiagnostics(text, { ...defaults, only: ["dash"] }).map((d) => d.rule), ["dash"]);
  assert.deepEqual(toDiagnostics("Nous partons — il est tard.\n", { ...defaults, language: "fr" }), []);
});

test("a fallback range never ends inside a surrogate pair", () => {
  // The rocket is two UTF-16 units. A one-unit range would end between the high and the low surrogate.
  assert.equal(wordEnd("\u{1F680} go", 0), 2);
  assert.equal(wordEnd("\u{1F680}", 0), 2);
  assert.equal(wordEnd("#\u{1F680}", 1), 3);
  assert.equal(wordEnd("#!", 0), 1);
});

test("clean text and empty text give nothing", () => {
  assert.deepEqual(toDiagnostics("", defaults), []);
  assert.deepEqual(toDiagnostics("Retry the request twice.\n", defaults), []);
});
