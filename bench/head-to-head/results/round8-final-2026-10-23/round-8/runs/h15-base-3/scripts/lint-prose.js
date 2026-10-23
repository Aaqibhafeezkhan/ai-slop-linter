// Fails when README.md or docs/**/*.md contain stock AI-sounding phrases.
// Fenced code, inline code and blockquotes are skipped so the docs can quote examples.
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const RULES = [
  [/let me know if you (have|need)/i, "chatbot closer"],
  [/\bi hope this (helps|finds you)/i, "chatbot closer"],
  [/\bas an ai\b/i, "chatbot self-reference"],
  [/\bin today'?s (fast-paced|digital|modern)/i, "stock opener"],
  [/\bfast-paced world\b/i, "stock opener"],
  [/\ba testament to\b|\bis a testament\b/i, "stock phrase"],
  [/\bdelv(e|es|ed|ing)\b/i, "overused verb 'delve'"],
  [/\bseamless(ly)?\b/i, "filler adjective 'seamless'"],
  [/\brich tapestry\b/i, "stock phrase"],
  [/\bgame-?changer\b/i, "stock phrase"],
  [/\bthe future of [\w ]{1,30} looks bright\b/i, "stock closer"],
  [/\bin conclusion,/i, "stock closer"],
];

function listMarkdown(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return listMarkdown(p);
    return e.name.endsWith(".md") ? [p] : [];
  });
}

const files = [path.join(root, "README.md"), ...listMarkdown(path.join(root, "docs"))].filter(
  (f) => fs.existsSync(f)
);

let failures = 0;
for (const file of files) {
  let fence = null;
  fs.readFileSync(file, "utf8").split("\n").forEach((raw, i) => {
    const marker = raw.match(/^\s*(```+|~~~+)/);
    if (marker) {
      if (!fence) fence = marker[1][0];
      else if (marker[1][0] === fence) fence = null;
      return;
    }
    if (fence || /^\s*>/.test(raw)) return;
    const line = raw.replace(/`[^`]*`/g, "");
    for (const [re, why] of RULES) {
      const m = line.match(re);
      if (m) {
        failures++;
        console.error(`${path.relative(root, file)}:${i + 1}: ${why}: "${m[0]}"`);
      }
    }
  });
}

if (failures) {
  console.error(`\nlint:prose found ${failures} problem(s).`);
  process.exit(1);
}
console.log(`lint:prose ok (${files.length} files)`);
