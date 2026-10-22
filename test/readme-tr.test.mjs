import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { rules } from "../dist/src/index.js";
import { CATEGORY_TR, PAIN_TR } from "./surface-text.mjs";

const tr = readFileSync("README.tr.md", "utf8");
const ONES = ["sıfır", "bir", "iki", "üç", "dört", "beş", "altı", "yedi", "sekiz", "dokuz"];
const TENS = ["", "on", "yirmi", "otuz", "kırk", "elli", "altmış", "yetmiş", "seksen", "doksan"];
const word = (n) => (n < 10 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : ""));

test("README.tr.md opens with the Turkish pain sentence, then the Turkish category sentence", () => {
  assert.equal(tr.split("\n")[0], PAIN_TR);
  assert.ok(tr.split("\n\n")[1].startsWith(CATEGORY_TR));
  assert.ok(tr.split("\n").findIndex((l) => l === "npx ai-slop-linter README.md") < 10, "the command is not on the first screen");
});

test("README.tr.md states the same rule count as the code", () => {
  const n = word(rules.length);
  assert.ok(tr.includes(`${n[0].toLocaleUpperCase("tr")}${n.slice(1)} kural. Çoğu`), `README.tr.md does not say "${n} kural."`);
});

test("README.tr.md points at the recording and at the moved own-writing table", () => {
  assert.ok(tr.includes("](docs/demo.gif)"));
  assert.ok(tr.includes("(docs/OWN-WRITING.md)"));
});
