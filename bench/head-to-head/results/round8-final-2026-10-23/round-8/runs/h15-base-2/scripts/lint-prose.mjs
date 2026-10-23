// Fails when README.md or docs/**/*.md contain stock AI-sounding phrases.
// Code blocks, inline code and blockquotes are skipped so docs can quote bad examples.
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const RULES = [
  [/\blet me know if you have any questions\b/i, 'chatbot closer'],
  [/\bin today'?s (fast-paced|digital|modern) world\b/i, 'stock opener'],
  [/\b(is|are|stands as) a testament to\b/i, '"testament to" cliché'],
  [/\bdelv(e|es|ed|ing)\b/i, '"delve"'],
  [/\bseamless(ly)?\b/i, '"seamless"'],
  [/\btapestry\b/i, '"tapestry"'],
  [/\bthe future of [\w\s-]{1,30} looks bright\b/i, 'stock closer'],
  [/\bas an ai (language )?model\b/i, 'chatbot self-reference'],
  [/\bI hope this (helps|finds you well)\b/i, 'chatbot closer'],
];

function mdFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? mdFiles(join(dir, e.name)) : e.name.endsWith('.md') ? [join(dir, e.name)] : [],
  );
}

let failures = 0;
for (const file of ['README.md', ...mdFiles('docs')].sort()) {
  let fenced = false;
  readFileSync(file, 'utf8').split('\n').forEach((raw, i) => {
    if (/^\s*(```|~~~)/.test(raw)) { fenced = !fenced; return; }
    if (fenced || /^\s*>/.test(raw)) return;
    const line = raw.replace(/`[^`]*`/g, '');
    for (const [re, why] of RULES) {
      const m = line.match(re);
      if (m) { console.error(`${file}:${i + 1}: ${why}: "${m[0]}"`); failures++; }
    }
  });
}
if (failures) { console.error(`\n${failures} prose problem(s) found.`); process.exit(1); }
console.log('prose ok');
