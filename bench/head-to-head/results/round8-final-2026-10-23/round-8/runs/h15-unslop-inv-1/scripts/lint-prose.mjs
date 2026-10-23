#!/usr/bin/env node
// Fails when README.md or docs/**/*.md contain stock AI-writing tells.
// Usage: node scripts/lint-prose.mjs [file ...]
// Code blocks, inline code, blockquotes and quoted spans are not checked.
// Add <!-- prose-lint-ignore --> to a line to skip it.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const RULES = [
  // Chat artifacts and leaked tokens
  [/let me know if you (have|need)/i, 'chat artifact'],
  [/\bhope this helps\b/i, 'chat artifact'],
  [/\bgreat question\b/i, 'chat artifact'],
  [/\bas an ai\b/i, 'chat artifact'],
  [/ich hoffe,? (das|dies) hilft/i, 'chat artifact'],
  [/gerne erstelle ich/i, 'chat artifact'],
  [/oaicite|turn\d+search\d+|utm_source=chatgpt/i, 'leaked citation token'],
  [/\[[^\]\n]*(einsetzen|insert|placeholder|your name)[^\]\n]*\](?!\()/i, 'unfilled placeholder'],
  // Formulaic openers and closers
  [/in today['’]s (fast-paced|digital|ever-changing|modern)\b/i, 'wide-angle opener'],
  [/in the ever-(evolving|changing)\b/i, 'wide-angle opener'],
  [/in der heutigen (digitalen|schnelllebigen)/i, 'wide-angle opener'],
  [/\bthe future of .{1,40} (looks|remains|is) (bright|exciting|promising)/i, 'generic closer'],
  [/\bonly time will tell\b/i, 'generic closer'],
  [/\bit remains to be seen\b/i, 'generic closer'],
  [/es bleibt abzuwarten/i, 'generic closer'],
  [/zusammenfassend lässt sich sagen/i, 'generic closer'],
  // Stock vocabulary
  [/\b(delve[sd]?|delving)\b/i, 'stock word'],
  [/\btestament to\b/i, 'stock phrase'],
  [/\btapestry\b/i, 'stock word'],
  [/\bseamless(ly)?\b/i, 'stock word'],
  [/\bgame[- ]chang(er|ing)\b/i, 'stock word'],
  [/\bunlock(s|ing)? the (full )?(power|potential)\b/i, 'stock phrase'],
  [/\bnavigat(e|es|ing) the (complexities|landscape)\b/i, 'stock phrase'],
  [/\bmarks a (turning point|new era)\b/i, 'significance inflation'],
  [/\bheralds? a new era\b/i, 'significance inflation'],
  [/\bdient als\b|\bfungiert als\b/i, 'copula avoidance'],
  // Punctuation: em dash outside dialogue lines
  [/—/, 'em dash'],
];

// Blank out what the rules must not see, keeping line numbers intact.
function strip(text) {
  let fence = null;
  return text
    .split('\n')
    .map((line) => {
      const m = line.match(/^\s*(```+|~~~+)/);
      if (fence) {
        if (m && m[1][0] === fence[0] && m[1].length >= fence.length) fence = null;
        return '';
      }
      if (m) {
        fence = m[1];
        return '';
      }
      if (/^\s*>/.test(line) || /prose-lint-ignore/.test(line)) return '';
      return line
        .replace(/^\s*—\s?/, '') // French dialogue dash
        .replace(/`[^`\n]*`/g, '')
        .replace(/"[^"\n]*"/g, '')
        .replace(/“[^”\n]*”/g, '')
        .replace(/„[^“”"\n]*[“”"]/g, '')
        .replace(/«[^»\n]*»/g, '');
    })
    .join('\n');
}

function collect(dir) {
  return readdirSync(dir, { recursive: true })
    .filter((f) => f.endsWith('.md'))
    .map((f) => join(dir, f));
}

const args = process.argv.slice(2);
const files = args.length
  ? args
  : ['README.md', ...(existsSync('docs') ? collect('docs') : [])].filter(existsSync);

let problems = 0;
for (const file of files.sort()) {
  strip(readFileSync(file, 'utf8')).split('\n').forEach((line, i) => {
    for (const [re, label] of RULES) {
      const hit = line.match(re);
      if (hit) {
        console.error(`${file}:${i + 1}: ${label}: "${hit[0]}"`);
        problems++;
      }
    }
  });
}

if (problems) {
  console.error(`\n${problems} prose problem(s) in ${files.length} file(s).`);
  process.exit(1);
}
console.log(`prose ok (${files.length} files)`);
