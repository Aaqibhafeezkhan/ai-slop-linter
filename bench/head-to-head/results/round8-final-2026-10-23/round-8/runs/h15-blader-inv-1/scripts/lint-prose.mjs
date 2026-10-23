// Fails when README.md or docs/**/*.md contain common AI-writing tells.
// Code blocks, inline code, blockquotes and quoted text are ignored.
// Add <!-- prose-ok --> to a line to skip it.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const RULES = [
  [/\b(let me know if|i hope this helps|great question|certainly!|of course!)/i, "chatbot residue"],
  [/\b(in today's fast-paced world|the future (of \w+ )?looks bright|exciting times)/i, "stock opener or send-off"],
  [/\b(let's dive in|let's break this down|here's the thing|here's what you need to know)/i, "staged run-up"],
  [/\b(delves?|delving|tapestry|testament|pivotal|vibrant|meticulous(ly)?|showcas(e|es|ing)|underscor(e|es|ing)|seamless(ly)?|deep dive)\b/i, "overused AI word"],
  [/\bnot (just|only|merely)\b[^.]*\bbut\b/i, "not X but Y"],
  [/\bit'?s not [^.,;]+[,;] it'?s\b/i, "not X but Y"],
  [/[—–]|\s--\s/, "dash"],
];

function files(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".md") ? [p] : [];
  });
}

function strip(line) {
  return line
    .replace(/`[^`]*`/g, "")
    .replace(/„[^“”"]*[“”"]|«[^»]*»|“[^”]*”|"[^"]*"/g, "")
    .replace(/(\d)–(\d)/g, "$1-$2");
}

let failed = 0;
for (const file of ["README.md", ...files("docs")]) {
  let inFence = false;
  readFileSync(file, "utf8").split("\n").forEach((raw, i) => {
    if (/^\s*(```|~~~)/.test(raw)) { inFence = !inFence; return; }
    if (inFence || /^\s*>/.test(raw) || /^\s*[—–]\s/.test(raw) || raw.includes("prose-ok")) return;
    const line = strip(raw);
    for (const [re, label] of RULES) {
      const m = line.match(re);
      if (m) { console.error(`${file}:${i + 1}: ${label}: "${m[0]}"`); failed++; }
    }
  });
}
if (failed) { console.error(`${failed} prose problem(s)`); process.exit(1); }
console.log("prose ok");
