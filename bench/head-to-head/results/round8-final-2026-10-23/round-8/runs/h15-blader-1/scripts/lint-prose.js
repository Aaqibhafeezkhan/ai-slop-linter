#!/usr/bin/env node
// Fails when README.md or docs/**/*.md contain stock AI-sounding prose.
// Code blocks, inline code, blockquotes and quoted text are ignored, so docs
// can still discuss or quote these phrases. Docs under a two-letter language
// folder (docs/de, docs/fr) are skipped: the rules are English-only.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const RULES = [
  [/\bin today's (?:fast-paced|digital|ever-changing|modern) (?:world|landscape|age)\b/i, 'stock opener'],
  [/\b(?:is|are|stands as|serves as) (?:a|an) (?:testament|beacon|tapestry)\b/i, 'inflated claim'],
  [/\bdelv(?:e|es|ed|ing)\b/i, 'stock AI word "delve"'],
  [/\b(?:seamless(?:ly)?|robust|game-chang(?:er|ing)|cutting-edge|unlock the power)\b/i, 'sales language'],
  [/\blet me know if you (?:have|need)\b/i, 'chatbot closer'],
  [/\bI hope this (?:helps|finds you well)\b/i, 'chatbot closer'],
  [/\bthe future of [\w\s-]{1,40}? looks bright\b/i, 'one-line closer'],
  [/—/, 'em dash'],
];

function collect(dir, out) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (e.name === 'node_modules' || /^[a-z]{2}$/.test(e.name)) continue;
      collect(p, out);
    } else if (e.name.endsWith('.md')) out.push(p);
  }
  return out;
}

const files = [path.join(root, 'README.md')].filter(fs.existsSync);
const docs = path.join(root, 'docs');
if (fs.existsSync(docs)) collect(docs, files);

let problems = 0;
for (const file of files) {
  let fence = null;
  fs.readFileSync(file, 'utf8').split('\n').forEach((raw, i) => {
    const m = raw.match(/^\s*(`{3,}|~{3,})/);
    if (m) {
      if (!fence) fence = m[1][0];
      else if (m[1][0] === fence) fence = null;
      return;
    }
    if (fence || /^\s*>/.test(raw)) return;
    const line = raw
      .replace(/`[^`]*`/g, '')
      .replace(/"[^"]*"|“[^”]*”/g, '');
    for (const [re, why] of RULES) {
      const hit = line.match(re);
      if (hit) {
        console.log(`${path.relative(root, file)}:${i + 1}: ${why}: "${hit[0]}"`);
        problems++;
      }
    }
  });
}

if (problems) {
  console.log(`\n${problems} prose problem(s) found.`);
  process.exit(1);
}
console.log(`prose ok (${files.length} files)`);
