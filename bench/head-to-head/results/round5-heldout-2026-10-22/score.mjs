#!/usr/bin/env node
// Generic scorer for the deep-round held-out tasks. Node built-ins only.
// Usage: node score.mjs <taskDir> <runDir>
//   <taskDir> holds the fixture files and check.json; <runDir> holds the rewritten file.
// check.json: { "output": "file.md", "facts": [str], "tells": [str | {"re": str}],
//   "protected": [str], "forbidden_added": [word], "language_absent": [word] }
// Prints one JSON line: C1 facts kept, C2 tells absent outside protected text, C3 protected text byte-identical,
// C4 nothing added (numbers, URLs, code spans, forbidden words), C5 structure kept (front matter, headings,
// fenced blocks). Every value is true or false; "detail" lists what failed.
import { readFileSync } from "node:fs";
import { join } from "node:path";

const [taskDir, runDir] = process.argv.slice(2);
const check = JSON.parse(readFileSync(join(taskDir, "check.json"), "utf8"));
const norm = (s) => s.normalize("NFC").replace(/\r\n/g, "\n");
const fixture = norm(readFileSync(join(taskDir, check.output), "utf8"));
let out;
try { out = norm(readFileSync(join(runDir, check.output), "utf8")); }
catch { console.log(JSON.stringify({ C1: false, C2: false, C3: false, C4: false, C5: false, detail: ["output file missing"] })); process.exit(0); }

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const has = (t, s) => new RegExp(`(?<![\\p{L}\\p{N}])${esc(norm(s))}(?![\\p{L}\\p{N}])`, "u").test(t);
const detail = [];
const note = (m) => detail.push(m);

const C1 = check.facts.every((f) => has(out, f) || (note(`missing fact: ${f}`), false));
const C3 = check.protected.every((p) => out.includes(norm(p)) || (note(`protected text changed: ${p.slice(0, 40)}`), false));

let rest = out;
for (const p of check.protected) rest = rest.split(norm(p)).join(" ");
const low = rest.toLowerCase();
const C2 = check.tells.every((t) => {
  const hit = typeof t === "string" ? low.includes(norm(t).toLowerCase()) : new RegExp(t.re, "iu").test(rest);
  if (hit) note(`tell left: ${typeof t === "string" ? t : t.re}`);
  return !hit;
});

const set = (s, re) => new Set(s.match(re) ?? []);
const subset = (a, b) => [...a].filter((x) => !b.has(x));
const NUM = /\d[\d.,]*\d|\d/g, URL = /https?:\/\/[^\s)"'`]+/g, CODE = /`[^`\n]+`/g;
const addNum = subset(set(out, NUM), set(fixture, NUM));
const addUrl = subset(set(out, URL), set(fixture, URL));
const addCode = subset(set(out, CODE), set(fixture, CODE));
const words = (s) => new Set(s.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? []);
const fw = words(fixture), ow = words(rest);
const addWord = (check.forbidden_added ?? []).filter((w) => ow.has(w.toLowerCase()) && !fw.has(w.toLowerCase()));
const lang = (check.language_absent ?? []).filter((w) => ow.has(w.toLowerCase()));
for (const [k, v] of [["number", addNum], ["url", addUrl], ["code span", addCode], ["added word", addWord], ["wrong-language word", lang]])
  for (const x of v) note(`${k}: ${x}`);
const C4 = !addNum.length && !addUrl.length && !addCode.length && !addWord.length && !lang.length;

const front = (s) => (/^---\n[\s\S]*?\n---\n/.exec(s) ?? [""])[0];
const stripFences = (s) => s.replace(/^```[\s\S]*?^```$/gm, "");
const headings = (s) => stripFences(s).split("\n").filter((l) => /^#{1,6}\s/.test(l));
const fences = (s) => s.match(/^```[\s\S]*?^```$/gm) ?? [];
const okFront = front(fixture) === front(out) || (note("front matter changed"), false);
const oh = new Set(headings(out));
const okHead = headings(fixture).every((h) => oh.has(h) || (note(`heading changed: ${h}`), false));
const fa = fences(fixture), fb = fences(out);
const okFence = (fa.length === fb.length && fa.every((b, i) => b === fb[i])) || (note("fenced block changed"), false);
const C5 = okFront && okHead && okFence;

console.log(JSON.stringify({ C1, C2, C3, C4, C5, score: [C1, C2, C3, C4, C5].filter(Boolean).length, detail }));
