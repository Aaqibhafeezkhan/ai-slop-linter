// Flags AI-sounding patterns in README.md and docs/**/*.md.
// Code blocks, inline code, and blockquotes are ignored, so examples and
// quoted text can mention a pattern. Translations under docs/<lang>/ are
// skipped because the rules below are English only.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, sep } from "node:path";

const rules = [
  { name: "chatbot residue", re: /\b(let me know if|i hope this helps|great question|of course!|certainly!|would you like me to)/i },
  { name: "stock opener", re: /\bin today'?s (fast-paced|digital|ever-changing|modern) (world|landscape|era)\b/i },
  { name: "overused AI word", re: /\b(delves?|delving|testament|tapestry|seamless(ly)?|robust|pivotal|meticulous(ly)?|vibrant|showcas(e|es|ing))\b/i },
  { name: "empty send-off", re: /\b(future|road ahead) (of \w+ )?(looks|is) bright\b|\bexciting times\b/i },
  { name: "not X but Y", re: /\bnot (just|only|merely)\b[^.!?\n]{0,80}\bbut\b|\bit'?s not [^.!?\n]{1,60}, it'?s\b/i },
  { name: "em or en dash", re: /[—–]| -- / },
];

function listMarkdown(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? listMarkdown(path) : path.endsWith(".md") ? [path] : [];
  });
}

const files = ["README.md", ...listMarkdown("docs")]
  .filter((f) => !/^docs[\\/][a-z]{2}[\\/]/.test(f));

let problems = 0;
for (const file of files) {
  let inFence = false;
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; return; }
    if (inFence || /^\s*>/.test(line)) return;
    const text = line.replace(/`[^`]*`/g, "");
    for (const { name, re } of rules) {
      const m = text.match(re);
      if (m) {
        problems++;
        console.log(`${file.split(sep).join("/")}:${i + 1}: ${name}: "${m[0]}"`);
      }
    }
  });
}

if (problems) {
  console.error(`\nlint:prose found ${problems} problem(s). See the humanizer patterns for fixes.`);
  process.exit(1);
}
console.log(`lint:prose ok (${files.length} files)`);
