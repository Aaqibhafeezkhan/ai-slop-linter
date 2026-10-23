// Fails when README.md or docs/**/*.md contain common AI-writing tells.
// Code blocks, inline code, blockquotes and quoted text are ignored.
// Phrase rules are English; the em dash rule skips locale folders (docs/de, docs/fr).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const PHRASES = [
  "in today's fast-paced world", 'testament to', 'delve', 'delves', 'delving',
  'seamless', 'seamlessly', 'robust', 'tapestry', 'game-changer', 'game changer',
  'the future of .{1,30} looks bright', "it's important to note", 'it is important to note',
  "let me know if you have any questions", 'i hope this helps', 'feel free to reach out',
  "in conclusion", "at the end of the day", 'unlock the (full )?potential', 'leverage',
  'ever-evolving', 'landscape of', 'navigate the complexities', 'elevate your',
];
const phraseRe = new RegExp(`\\b(?:${PHRASES.join('|')})\\b`, 'i');
const LOCALE_DIR = /^docs\/[a-z]{2}\//;

function walk(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

const files = ['README.md', ...walk('docs')];
let problems = 0;

for (const file of files) {
  let inFence = false;
  readFileSync(file, 'utf8').split('\n').forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) { inFence = !inFence; return; }
    if (inFence || /^\s*>/.test(line)) return;
    const text = line
      .replace(/`[^`]*`/g, '')
      .replace(/"[^"]*"|“[^”]*”|„[^“”]*[“”]|«[^»]*»/g, '');
    const hits = [];
    const m = text.match(phraseRe);
    if (m) hits.push(`AI-sounding phrase "${m[0]}"`);
    if (text.includes('—') && !LOCALE_DIR.test(file)) hits.push('em dash');
    for (const h of hits) {
      console.error(`${file}:${i + 1}: ${h}`);
      problems++;
    }
  });
}

if (problems) {
  console.error(`\nlint:prose found ${problems} problem(s).`);
  process.exit(1);
}
console.log(`lint:prose ok (${files.length} files)`);
