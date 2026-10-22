import { test } from "node:test";
import assert from "node:assert/strict";
import rule from "../integrations/textlint/index.mjs";

// A stand-in for the context textlint passes to a rule: only the parts the rule uses.
function run(text, options) {
  const reports = [];
  const context = {
    Syntax: { Document: "Document" },
    RuleError: class {
      constructor(message, padding) {
        this.message = message;
        this.padding = padding;
      }
    },
    report: (_node, error) => reports.push(error),
    getSource: () => text,
    fixer: { replaceTextRange: (range, replacement) => ({ range, text: replacement }) },
  };
  rule.linter(context, options).Document({ type: "Document" });
  return reports;
}

test("a tell is reported once, at the offset where it starts, with the rule id in the message", () => {
  const text = "Rates rose — sharply in May.\n";
  const reports = run(text);
  const dash = reports.filter((r) => r.message.endsWith("(dash)"));
  assert.equal(dash.length, 1);
  assert.ok(text.slice(dash[0].padding.index).trimStart().startsWith("—"), text.slice(dash[0].padding.index));
});

test("a safe fix is offered to textlint as a range and a replacement", () => {
  const text = "Rates rose — sharply in May.\n";
  const [dash] = run(text).filter((r) => r.message.endsWith("(dash)"));
  const { range, text: replacement } = dash.padding.fix;
  const fixed = text.slice(0, range[0]) + replacement + text.slice(range[1]);
  assert.ok(!fixed.includes("—"), fixed);
});

test("a finding without a safe fix is reported without one", () => {
  const reports = run("Let me know if you need anything else.\n");
  assert.ok(reports.length > 0);
  for (const r of reports.filter((x) => x.message.endsWith("(chatbot)"))) assert.equal("fix" in r.padding, false);
});

test("offsets are right on a later line and in a file with CRLF endings", () => {
  const text = "Fine.\r\n\r\nLet's dive in now.\r\n";
  const [hit] = run(text).filter((r) => r.message.endsWith("(announcing)"));
  assert.equal(hit.padding.index, text.indexOf("Let's"));
});

test("ignore, only and language are honoured", () => {
  const text = "Let's dive in — now.\n";
  const ids = (reports) => reports.map((r) => /\((\S+)\)$/.exec(r.message)[1]).sort();
  assert.deepEqual(ids(run(text)), ["announcing", "dash"]);
  assert.deepEqual(ids(run(text, { ignore: ["dash"] })), ["announcing"]);
  assert.deepEqual(ids(run(text, { only: ["dash"] })), ["dash"]);
  assert.deepEqual(ids(run("Nous partons — il est tard.\n", { language: "fr" })), []);
});

test("the rule exports a fixer as well as a linter, which textlint needs before it will run --fix", () => {
  assert.equal(typeof rule.linter, "function");
  assert.equal(rule.fixer, rule.linter);
});

test("clean text reports nothing", () => {
  assert.deepEqual(run("Retry the request twice, then return the status code.\n"), []);
});
