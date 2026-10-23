import { test } from "node:test";
import assert from "node:assert/strict";
import { compareFacts, extractFacts } from "../dist/src/compare.js";

// Every sentence below was written for this file. None comes from a benchmark task.
const cmp = (before, after, language = "en") => {
  const r = compareFacts(before, after, { language });
  return { lost: r.lost.map((f) => `${f.kind}:${f.value}`), added: r.added.map((f) => `${f.kind}:${f.value}`) };
};
const facts = (text) => extractFacts(text).map((f) => `${f.kind}:${f.value}`);

// numbers (T1, G1 G2 G3): currency glue, group marks, canonical value, dotted number versus version.
test("numbers: a currency code glued to a number does not hide its magnitude", () => {
  assert.deepEqual(cmp("Rp1.500.000 budget", "Rp1.500 budget"), { lost: ["number:1500000"], added: ["version:1.500"] });
  assert.deepEqual(cmp("USD2,500,000 raised", "USD2,500 raised"), { lost: ["number:2500000"], added: ["number:2500"] });
  // A code inside a word is not a currency, so no number is read at all.
  assert.deepEqual(cmp("xRp1.500.000 saved", "xRp1.500 saved"), { lost: [], added: [] });
  assert.deepEqual(cmp("BUSD500 tokens", "BUSD400 tokens"), { lost: [], added: [] });
});

test("numbers: space, no-break space and apostrophe groups are one number", () => {
  assert.deepEqual(cmp("1\u00a0000", "1\u00a0500"), { lost: ["number:1000"], added: ["number:1500"] });
  assert.deepEqual(cmp("1'250", "1'500"), { lost: ["number:1250"], added: ["number:1500"] });
  assert.deepEqual(cmp("1\u00a0000", "1\u00a0500"), { lost: ["number:1000"], added: ["number:1500"] });
  // A first group of four digits is not a group, so the two numbers stay two numbers.
  assert.deepEqual(cmp("1234 567", "1234 999"), { lost: ["number:567"], added: ["number:999"] });
  assert.deepEqual(facts("1234 567"), ["number:1234", "number:567"]);
});

test("numbers: a grouped decimal keeps its value, and both mark orders give one value", () => {
  assert.deepEqual(cmp("1\u00a0250,5", "1\u00a0250,5"), { lost: [], added: [] });
  assert.deepEqual(facts("1\u00a0250,5"), ["number:1250.5"]);
  assert.deepEqual(cmp("1.250,50", "1,250.50"), { lost: [], added: [] });
  assert.deepEqual(cmp("1,250,000", "1.250.000"), { lost: [], added: [] });
  // A lone comma decimal keeps its text, and so does a lone `.` or `,` with three digits after it.
  assert.deepEqual(cmp("0,53", "0,54"), { lost: ["number:0,53"], added: ["number:0,54"] });
  assert.deepEqual(cmp("12,5", "12,6"), { lost: ["number:12,5"], added: ["number:12,6"] });
  assert.deepEqual(facts("1.250"), ["version:1.250"]);
});

test("numbers: a dotted run of three-digit groups is a number, a version otherwise", () => {
  assert.deepEqual(cmp("€2.500.000", "€2.500"), { lost: ["number:2500000"], added: ["version:2.500"] });
  assert.deepEqual(cmp("1.000.000.000", "1.000.000.001"), { lost: ["number:1000000000"], added: ["number:1000000001"] });
  assert.deepEqual(facts("3.2.1"), ["version:3.2.1"]);
  assert.deepEqual(facts("v2.4"), ["version:v2.4"]);
  assert.deepEqual(facts("2.3.456"), ["version:2.3.456"]);
  assert.deepEqual(facts("10.0.0.1"), ["version:10.0.0.1"]);
});

test("numbers: text with a grouped number and no change is unchanged", () => {
  assert.deepEqual(cmp("1\u00a0000 requests", "1\u00a0000 requests"), { lost: [], added: [] });
});

test("numbers: an address of four short groups stays a version, not a number", () => {
  const f = extractFacts("Host 192.168.100.200 and 10.0.0.1 answer.").map((x) => `${x.kind}:${x.value}`);
  assert.ok(f.includes("version:192.168.100.200"), f.join());
  assert.ok(!f.some((x) => x.startsWith("number:192")), f.join());
});

test("numbers: a percent sign does not hide a lost qualifier or a lost unit on a grouped number", () => {
  assert.deepEqual(cmp("Up to 40% of builds fail.", "40% of builds fail.").lost, ["qualifier:up to 40"]);
  assert.deepEqual(cmp("Start took 1\u00a0250 ms.", "Start took 1\u00a0250.").lost, ["unit:1250 ms"]);
  assert.deepEqual(cmp("Start took 1\u00a0250 ms.", "Start took 1\u00a0250 ms.").lost, []);
});

test("numbers: a plain space never joins digits, mixed marks are two numbers, a no-break space joins", () => {
  assert.deepEqual(cmp("Chapter 3 200 pages", "Chapter 3: 200 pages"), { lost: [], added: [] });
  assert.deepEqual(facts("Step 1 500 users"), ["number:1", "number:500"]);
  assert.ok(!facts("It shows 1,000 000 rows").some((f) => f.includes(" ")), "no fact value holds a space");
  assert.deepEqual(facts("Limit 1\u00a0000 requests"), ["number:1000"]);
  assert.deepEqual(cmp("Limit 1\u00a0000 requests", "Limit 1\u00a0500 requests"), { lost: ["number:1000"], added: ["number:1500"] });
  assert.deepEqual(cmp("At least Rp1.500.000 a month.", "Rp1.500.000 a month.").lost, ["qualifier:at least 1500000"]);
});

test("numbers: two different group marks in a row are two numbers", () => {
  assert.deepEqual(facts("1,000 000"), ["number:1000", "number:000"]);
});
