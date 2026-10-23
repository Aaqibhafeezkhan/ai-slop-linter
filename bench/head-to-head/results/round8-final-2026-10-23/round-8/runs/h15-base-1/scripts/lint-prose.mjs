// Fails when README.md or docs/**/*.md contain stock AI-sounding phrases.
// Fenced code, inline code and blockquotes are skipped so docs can quote bad examples.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RULES = [
  [/let me know if you (?:have|need) (?:any|further) (?:questions|help)/, "chatbot closer"],
  [/i hope this helps/, "chatbot closer"],
  [/in today'?s (?:fast-paced|digital|ever-changing|modern) world/, "stock opener"],
  [/in the (?:ever-evolving|ever-changing) (?:world|landscape) of/, "stock opener"],
  [/(?:is|are|serves as) a testament to/, "\"testament to\""],
  [/\bdelv(?:e|es|ed|ing)\b/, "\"delve\""],
  [/\bseamless(?:ly)?\b/, "\"seamless\""],
  [/\bleverag(?:e|es|ed|ing)\b/, "\"leverage\""],
  [/\btapestry\b/, "\"tapestry\""],
  [/the future of [\w\s-]{1,30} looks bright/, "stock closer"],
  [/it'?s important to note that/, "filler"],
  [/\bas an ai\b/, "chatbot self-reference"],
];

function collect(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return collect(p);
    return e.name.endsWith(".md") ? [p] : [];
  });
}

// Blank out skipped regions, keeping newlines so line numbers stay correct.
function mask(text) {
  const blank = (s) => s.replace(/[^\n]/g, " ");
  return text
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/^>.*$/gm, blank)
    .replace(/`[^`\n]*`/g, blank);
}

const files = ["README.md", ...collect("docs")];
let failures = 0;
for (const file of files) {
  const text = mask(readFileSync(file, "utf8")).replace(/[‘’]/g, "'");
  for (const [re, label] of RULES) {
    const g = new RegExp(re.source.replace(/ /g, "\\s+"), "gi");
    for (const m of text.matchAll(g)) {
      const line = text.slice(0, m.index).split("\n").length;
      console.error(`${file}:${line}: ${label}: "${m[0]}"`);
      failures++;
    }
  }
}
if (failures) {
  console.error(`\nlint:prose found ${failures} problem(s).`);
  process.exit(1);
}
console.log(`lint:prose ok (${files.length} files)`);
