// Fails when README.md or docs/**/*.md contain common AI-writing tells.
// Usage: node scripts/lint-prose.mjs [file ...]   (defaults to README.md and docs/)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const RULES = [
  { name: "dash", re: /[—–]|(?<=\s)--(?=\s)/g, skip: (m, t, i) => /\d/.test(t[i - 1]) && /\d/.test(t[i + 1]), msg: "em/en dash; use a period, comma, colon, or parentheses" },
  { name: "chatbot", re: /\b(let me know if|i hope this helps|great question|you're absolutely right|certainly!|of course!|here is an overview)/gi, msg: "chatbot residue" },
  { name: "staged-opener", re: /\b(let's dive|let's explore|let's break this down|here's what you need to know|in today's fast-paced world|without further ado)/gi, msg: "staged opener" },
  { name: "ai-word", re: /\b(delves?|delving|testaments?|tapestry|pivotal|seamless(ly)?|robust|meticulous(ly)?|showcas(e|es|ing)|vibrant|underscores?)\b/gi, msg: "stock AI word" },
  { name: "inflated", re: /\b(future (of [a-z ]{1,30})?(looks|is) bright|exciting times (lie )?ahead|stands as a|a step in the right direction)/gi, msg: "inflated significance" },
  { name: "not-x-but-y", re: /\bnot (just|only|merely)\b[^.\n]{0,80}\bbut\b|\bit'?s not\b[^.\n]{0,60}\bit'?s\b/gi, msg: "not X but Y contrast" },
];

const blank = (s) => s.replace(/[^\n]/g, " ");

// Blank out text that is quoted or code, so we only judge the author's own prose.
function mask(text) {
  return text
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank) // fenced code
    .replace(/`[^`\n]*`/g, blank) // inline code
    .replace(/^>.*$/gm, blank) // blockquotes
    .replace(/^\s*[—–-]\s.*$/gm, (l) => (/^\s*[—–]/.test(l) ? blank(l) : l)) // dialogue lines
    .replace(/"[^"\n]{1,400}"|“[^”]{1,400}”|„[^“”]{1,400}[“”]|«[^»]{1,400}»/g, blank);
}

function collect(path) {
  if (statSync(path).isDirectory())
    return readdirSync(path).sort().flatMap((n) => collect(join(path, n)));
  return path.endsWith(".md") ? [path] : [];
}

const targets = process.argv.length > 2 ? process.argv.slice(2) : ["README.md", "docs"];
let problems = 0;
for (const file of targets.flatMap(collect)) {
  const masked = mask(readFileSync(file, "utf8"));
  for (const rule of RULES) {
    for (const m of masked.matchAll(rule.re)) {
      if (rule.skip?.(m, masked, m.index)) continue;
      const line = masked.slice(0, m.index).split("\n").length;
      console.error(`${file}:${line}: ${rule.msg}: "${m[0]}"`);
      problems++;
    }
  }
}
if (problems) {
  console.error(`\n${problems} prose problem(s) found.`);
  process.exit(1);
}
console.log("prose ok");
