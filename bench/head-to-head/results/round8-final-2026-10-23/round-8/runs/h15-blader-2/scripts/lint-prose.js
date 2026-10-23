#!/usr/bin/env node
// Fails when README.md or docs/**/*.md contain stock AI-sounding prose.
// Skips fenced code, blockquotes, inline code and quoted text, so examples
// that discuss these phrases do not trip the check.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const RULES = [
  [/\bin today's (?:fast-paced|digital|modern) world\b/i, 'stock opener'],
  [/\b(?:is|are|stands as) a testament to\b/i, 'inflated claim'],
  [/\blet me know if you (?:have|need)\b/i, 'chatbot closer'],
  [/\bi hope this (?:helps|finds you)\b/i, 'chatbot closer'],
  [/\bdelves? into\b/i, 'stock AI word'],
  [/\b(?:seamless|seamlessly|robust|tapestry|multifaceted|game-changing|cutting-edge)\b/i, 'stock AI word'],
  [/\bthe future of [\w ]+ looks bright\b/i, 'upbeat closer'],
  [/\bit'?s important to note that\b/i, 'filler'],
  [/—/, 'em dash'],
];
const LOCALE_DIR = /^docs\/[a-z]{2}\//; // non-English pages use their own punctuation
const PHRASE_ONLY = new Set(['em dash']);

function listFiles() {
  const out = ['README.md'];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith('.md')) out.push(path.relative(root, p));
    }
  };
  if (fs.existsSync(path.join(root, 'docs'))) walk(path.join(root, 'docs'));
  return out.filter((f) => fs.existsSync(path.join(root, f)));
}

function lint(file) {
  const rel = file.split(path.sep).join('/');
  const problems = [];
  let fence = false;
  fs.readFileSync(path.join(root, file), 'utf8').split('\n').forEach((raw, i) => {
    if (/^\s*(```|~~~)/.test(raw)) { fence = !fence; return; }
    if (fence || /^\s*>/.test(raw)) return;
    const line = raw
      .replace(/`[^`]*`/g, '')
      .replace(/"[^"]*"|“[^”]*”|„[^“]*“|«[^»]*»/g, '');
    for (const [re, label] of RULES) {
      if (PHRASE_ONLY.has(label) && LOCALE_DIR.test(rel)) continue;
      const m = re.exec(line);
      if (m) problems.push(`${rel}:${i + 1}: ${label}: "${m[0]}"`);
    }
  });
  return problems;
}

const problems = listFiles().flatMap(lint);
if (problems.length) {
  console.error(problems.join('\n'));
  console.error(`\nlint:prose found ${problems.length} problem(s).`);
  process.exit(1);
}
console.log('lint:prose ok');
