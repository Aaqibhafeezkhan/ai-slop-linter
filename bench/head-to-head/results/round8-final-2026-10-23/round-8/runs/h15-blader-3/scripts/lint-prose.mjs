// Flags AI-sounding phrasing in README.md and docs/**/*.md.
// Code, blockquotes and double-quoted spans are skipped, so docs can quote bad
// examples. Translated pages (docs/<xx>/) are skipped: the rules are English.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

const root = process.cwd();

const RULES = [
  [/\blet me know if\b/i, 'chatbot closer'],
  [/\bi hope this helps\b/i, 'chatbot closer'],
  [/\bin today['’]s (?:fast-paced|digital|modern)\b/i, 'staged opener'],
  [/\b(?:a|the) testament to\b/i, 'inflated claim'],
  [/\bdelv(?:e|es|ed|ing)\b/i, 'stock AI word'],
  [/\b(?:seamless(?:ly)?|robust|game-chang\w+|cutting-edge|rich tapestry)\b/i, 'stock AI word'],
  [/\bthe future of [\w\s]+ looks bright\b/i, 'upbeat closer'],
  [/\bit(?:['’]s| is) not just\b[^.]*\bit(?:['’]s| is)\b/i, 'not-X-but-Y contrast'],
  [/—/, 'em dash'],
];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : [];
  });
}

function strip(text) {
  const lines = [];
  let fenced = false;
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; lines.push(''); continue; }
    if (fenced || /^\s*>/.test(line)) { lines.push(''); continue; }
    lines.push(
      line
        .replace(/`[^`]*`/g, '')
        .replace(/"[^"]*"|“[^”]*”/g, ''),
    );
  }
  return lines;
}

const files = [];
if (existsSync('README.md')) files.push('README.md');
if (existsSync('docs')) files.push(...walk('docs'));

let problems = 0;
for (const file of files) {
  const rel = relative(root, join(root, file));
  if (/^docs[\\/][a-z]{2}(?:-[A-Za-z]+)?[\\/]/.test(rel)) continue;
  strip(readFileSync(file, 'utf8')).forEach((line, i) => {
    for (const [re, why] of RULES) {
      const m = re.exec(line);
      if (m) { console.log(`${rel.split(sep).join('/')}:${i + 1}: ${why}: "${m[0]}"`); problems++; }
    }
  });
}

if (problems) {
  console.error(`\n${problems} prose problem(s) found.`);
  process.exit(1);
}
console.log(`prose ok (${files.length} files checked)`);
