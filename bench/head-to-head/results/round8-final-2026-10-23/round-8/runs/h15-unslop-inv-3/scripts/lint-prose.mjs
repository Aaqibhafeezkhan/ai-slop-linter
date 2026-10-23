// Flags AI-sounding prose in README.md and docs/**/*.md.
// Patterns come from the unslop word lists (chat artifacts, tier 1 words,
// stock openers and closers). Code, quotations, blockquotes and dialogue
// lines are skipped, so examples of bad text can still be documented.
import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = process.argv[2] ?? '.';

const RULES = [
  // P0: chat artifacts and prompt echoes
  ['chat artifact', /\b(let me know if you (have|need)|i hope this (helps|email finds)|feel free to (reach out|ask)|great question|certainly!|happy to help|as an ai\b)/i],
  ['chat artifact', /(ich hoffe,? (das|dies) hilft|gerne erstelle ich|lassen sie es mich wissen|das ist eine gute frage|selbstverständlich!)/i],
  ['placeholder', /\[(insert|name einsetzen|your [a-z ]+ here|todo)[^\]]*\]/i],
  ['citation token', /(oaicite|turn\d+search\d+|utm_source=chatgpt)/i],
  // P1: stock vocabulary
  ['stock word', /\b(delv(e|es|ed|ing)|testament to|tapestry|seamless(ly)?|game[- ]chang(er|ing)|groundbreaking|cutting-edge|unlock(s|ing)? the (full )?potential|leverag(e|es|ed|ing)|elevate[sd]?|embark(s|ed|ing)? on|navigat(e|es|ing) the (complex|landscape)|ever-evolving|rich tapestry|realm of|pivotal|vibrant|holistic)\b/i],
  ['stock word', /\b(nahtlos\w*|ganzheitlich\w*|maßgeschneidert\w*|bahnbrechend\w*|zukunftsweisend\w*|wegweisend\w*|eintauchen|tauchen wir ein|das volle potenzial)\b/i],
  // P1: stock openers, transitions, closers
  ['stock opener', /(in today's (digital |fast-paced |ever-changing )?(world|age|landscape)|fast-paced world|in the (modern|digital) (age|era|world)|in der heutigen (digitalen |schnelllebigen )?(welt|zeit)|im zeitalter von)/i],
  ['stock transition', /(it(')?s (important|worth) (to note|noting) that|es ist wichtig zu beachten|let's dive (in|into)|dive into|werfen wir einen blick auf|hier kommt \w+ ins spiel)/i],
  ['generic closer', /(the future (of \w+ )?(looks|is|remains) (bright|exciting)|only time will tell|es bleibt abzuwarten|die zukunft bleibt spannend|in conclusion,|to sum up,|zusammenfassend lässt sich sagen)/i],
  ['faux insight', /(what (most|many) people (miss|overlook)|what nobody tells you|was die meisten übersehen|was dir niemand sagt)/i],
  ['false agency', /(the (numbers|data) (speak|tell)[^.]*|die zahlen sprechen für sich|die daten erzählen eine geschichte)/i],
];

const EM_DASH_PER_WORDS = 500;

function listMarkdown(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name);
    if (e.isDirectory()) return e.name === 'node_modules' ? [] : listMarkdown(p);
    return e.name.endsWith('.md') ? [p] : [];
  });
}

const blank = (s) => s.replace(/[^\n]/g, ' ');

// Replace everything that is code, quotation or dialogue with spaces,
// keeping line numbers and offsets intact.
function mask(text) {
  let out = text.replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank);
  out = out.replace(/`[^`\n]*`/g, blank);
  out = out.replace(/^[ \t]*>.*$/gm, blank);
  out = out.replace(/^[ \t]*[—–-]\s.*$/gm, (l) => (/^[ \t]*—/.test(l) ? blank(l) : l));
  out = out.replace(/„[^“”\n]*[“”]|“[^”\n]*”|«[^»\n]*»|"[^"\n]*"/g, blank);
  out = out.replace(/<!--[\s\S]*?-->/g, blank);
  return out;
}

const files = [
  ...(existsSync(join(root, 'README.md')) ? [join(root, 'README.md')] : []),
  ...listMarkdown(join(root, 'docs')),
].sort();

let problems = 0;
const report = (file, line, rule, hit) => {
  problems++;
  console.error(`${file}:${line}: ${rule}: "${hit.trim()}"`);
};

for (const file of files) {
  const text = mask(readFileSync(file, 'utf8'));
  text.split('\n').forEach((line, i) => {
    for (const [rule, re] of RULES) {
      const m = line.match(re);
      if (m) report(file, i + 1, rule, m[0]);
    }
  });
  const words = (text.match(/\S+/g) ?? []).length;
  const allowed = Math.max(1, Math.ceil(words / EM_DASH_PER_WORDS));
  const dashes = [...text.matchAll(/—/g)];
  if (dashes.length > allowed) {
    const line = text.slice(0, dashes[allowed].index).split('\n').length;
    report(file, line, `em dash (${dashes.length} in ${words} words, max ${allowed})`, '—');
  }
}

if (problems) {
  console.error(`\n${problems} prose problem(s) in ${files.length} file(s).`);
  process.exit(1);
}
console.log(`prose ok (${files.length} files)`);
