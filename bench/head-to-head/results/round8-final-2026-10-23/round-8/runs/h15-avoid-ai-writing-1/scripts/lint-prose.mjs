// Fails when README.md or docs/**/*.md contain stock AI-writing phrases.
// Code blocks, inline code, blockquotes and quoted text are ignored, so docs
// can still quote or discuss these phrases.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const PATTERNS = [
  /in today['’]s (fast-paced|digital|ever-changing) world/i,
  /in the ever-evolving/i,
  /\ba testament to\b/i,
  /\bdelv(e|es|ed|ing)\b/i,
  /\bseamless(ly)?\b/i,
  /\brobust\b/i,
  /\btapestry\b/i,
  /\bgame-?changer\b/i,
  /\bleverag(e|es|ed|ing)\b/i,
  /\bunlock the (power|potential)\b/i,
  /\bnavigat(e|es|ing) the complexities\b/i,
  /it['’]s (important|worth) (to note|noting)/i,
  /\blet me know if\b/i,
  /\bi hope this (helps|finds you)\b/i,
  /\bthe future of .{0,40} looks bright\b/i,
];

function markdownFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return path.endsWith(".md") ? [path] : [];
  });
}

// Blank out ignored regions but keep newlines so line numbers stay right.
const blank = (s) => s.replace(/[^\n]/g, " ");
function prose(text) {
  return text
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/^ {0,3}>.*$/gm, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/"[^"\n]*"|“[^”\n]*”|„[^“”\n]*[“”]|«[^»\n]*»/g, blank);
}

const files = ["README.md", ...markdownFiles("docs")];
let failures = 0;
for (const file of files) {
  prose(readFileSync(file, "utf8")).split("\n").forEach((line, i) => {
    for (const re of PATTERNS) {
      const m = line.match(re);
      if (m) {
        console.error(`${file}:${i + 1}: AI-sounding phrase "${m[0]}"`);
        failures++;
      }
    }
  });
}
if (failures) {
  console.error(`\n${failures} problem(s) found. Rewrite in plain words.`);
  process.exit(1);
}
console.log(`prose ok (${files.length} files)`);
