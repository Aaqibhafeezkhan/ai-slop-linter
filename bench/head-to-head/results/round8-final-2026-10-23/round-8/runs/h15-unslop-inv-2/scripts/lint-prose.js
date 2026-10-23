#!/usr/bin/env node
// Flags stock AI phrasing in README.md and docs/**/*.md.
// Code, inline code, blockquotes and quoted text are skipped, so a doc may
// quote a bad phrase to talk about it. Usage: node scripts/lint-prose.js [files...]
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

const RULES = [
  // Chat artifacts
  [/\blet me know if\b/i, 'chat artifact'],
  [/\bI hope this (helps|email finds)\b/i, 'chat artifact'],
  [/\b(certainly|absolutely)!/i, 'chat artifact'],
  [/\bas an AI\b/i, 'chat artifact'],
  [/\bgreat question\b/i, 'chat artifact'],
  [/\bIch hoffe, das hilft\b/i, 'chat artifact'],
  [/\bGerne erstelle ich\b/i, 'chat artifact'],
  [/\bLassen Sie es mich wissen\b/i, 'chat artifact'],
  // Wide-angle openers, generic closers, filler transitions
  [/\bin today['’]s (fast-paced|digital|ever-changing|modern) (world|age|landscape)\b/i, 'formulaic opener'],
  [/\bIn der heutigen (digitalen|schnelllebigen)\b/i, 'formulaic opener'],
  [/\bthe future of \w+ (looks|is) (bright|exciting)\b/i, 'generic closer'],
  [/\bDie Zukunft bleibt spannend\b/i, 'generic closer'],
  [/\bin conclusion\b/i, 'generic closer'],
  [/\bZusammenfassend lässt sich sagen\b/i, 'generic closer'],
  [/\bit(['’]s| is) (important|worth) (to note|noting)\b/i, 'filler transition'],
  [/\bEs ist wichtig zu beachten\b/i, 'filler transition'],
  [/\bwhen it comes to\b/i, 'filler transition'],
  [/\bdive (deep )?into\b|\bdeep dive\b/i, 'stock phrase'],
  [/\bunlock the (full )?potential\b/i, 'stock phrase'],
  [/\btake (it|\w+) to the next level\b/i, 'stock phrase'],
  // Tier 1 vocabulary
  [/\bdelv(e|es|ed|ing)\b/i, 'AI vocabulary'],
  [/\btestament to\b/i, 'AI vocabulary'],
  [/\b(seamless|seamlessly|robust|holistic|multifaceted|pivotal|groundbreaking|cutting-edge|game-changer|game-changing)\b/i, 'AI vocabulary'],
  [/\b(leverage|leverages|leveraged|leveraging|utilize|utilizes|utilized|utilizing)\b/i, 'AI vocabulary'],
  [/\b(tapestry|myriad|plethora|realm)\b/i, 'AI vocabulary'],
  [/\b(unleash|unleashes|empower|empowers|supercharge|streamline)\b/i, 'AI vocabulary'],
  [/\b(nahtlos\w*|ganzheitlich\w*|maßgeschneidert\w*|bahnbrechend\w*|zukunftsweisend\w*|Gamechanger)\b/i, 'AI vocabulary'],
  [/\bin the ever-evolving\b/i, 'AI vocabulary'],
  // Punctuation: em dash in prose (hyphen-with-spaces and en dash stay allowed)
  [/—/, 'em dash in prose'],
];

function stripNonProse(text) {
  const keep = (m) => m.replace(/[^\n]/g, ' ');
  return text
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, keep) // fenced code
    .replace(/`[^`\n]*`/g, keep) // inline code
    .replace(/^[ \t]*>.*$/gm, keep) // blockquotes
    .replace(/^[ \t]*—.*$/gm, keep) // dialogue lines opened by a dash
    .replace(/„[^“”\n]*[“”]/g, keep) // German quotes
    .replace(/«[^»\n]*»/g, keep) // French quotes
    .replace(/“[^”\n]*”/g, keep) // curly quotes
    .replace(/"[^"\n]*"/g, keep) // straight quotes
    .replace(/<!--[\s\S]*?-->/g, keep);
}

function collect(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return collect(p);
    return e.name.endsWith('.md') ? [p] : [];
  });
}

const args = process.argv.slice(2);
const files = args.length
  ? args.map((f) => path.resolve(f))
  : [path.join(root, 'README.md'), ...collect(path.join(root, 'docs'))];

let problems = 0;
for (const file of files) {
  const prose = stripNonProse(fs.readFileSync(file, 'utf8'));
  prose.split('\n').forEach((line, i) => {
    for (const [re, label] of RULES) {
      const m = line.match(re);
      if (m) {
        problems++;
        const rel = path.relative(process.cwd(), file);
        console.error(`${rel}:${i + 1}: ${label}: "${m[0]}"`);
      }
    }
  });
}

if (problems) {
  console.error(`\nlint:prose found ${problems} problem${problems === 1 ? '' : 's'}. Rewrite the text; quote a phrase if the doc is about the phrase.`);
  process.exit(1);
}
console.log(`lint:prose ok (${files.length} files)`);
