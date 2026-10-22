#!/usr/bin/env node
/**
 * Measures the first-person and claim words that `slop --compare` may flag, and writes
 * bench/COMPARE-WORDS.md.
 *
 *   node bench/compare-words.mjs           regenerate the table
 *   node bench/compare-words.mjs --check   fail if the committed table is stale, or if the
 *                                          word lists shipped in src/compare.ts differ from
 *                                          the words this measurement keeps
 *
 * The precision rule: a word is flagged only if it flags no golden rewrite and at most 5 percent
 * of the honest rewrites of the head-to-head, in the language of the rewrite. Each direction of a
 * person word (added, lost) is judged on its own. Claim words are judged for additions only.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  CLAIM_CANDIDATES,
  CLAIM_WORDS,
  PERSON_ADDED,
  PERSON_CANDIDATES,
  PERSON_LOST,
  countPersonWords,
  countTerms,
  languageOf,
} from "../dist/src/compare.js";

const root = new URL("..", import.meta.url).pathname;
const hh = join(root, "bench", "head-to-head");
const output = join(root, "bench", "COMPARE-WORDS.md");
const LIMIT = 0.05;

const walk = (dir, base = "") =>
  readdirSync(dir).flatMap((f) => {
    const rel = base ? `${base}/${f}` : f;
    return statSync(join(dir, f)).isDirectory() ? walk(join(dir, f), rel) : [rel];
  });
const isProse = (f) => /\.md$/.test(f);
const read = (p) => readFileSync(p, "utf8");
const lang = (b, a) => (languageOf(b, a) ?? "en").split(/[-_]/)[0].toLowerCase();

/** Every {before, after, lang, source} pair: goldens, and honest rewrites of other tools. */
const golden = [];
for (const h of readdirSync(join(hh, "fixtures")).sort()) {
  for (const f of walk(join(hh, "fixtures", h)).sort()) {
    if (!isProse(f) || !existsSync(join(hh, "golden", h, f))) continue;
    const b = read(join(hh, "fixtures", h, f));
    const a = read(join(hh, "golden", h, f));
    golden.push({ before: b, after: a, lang: lang(b, a), name: `${h}/${f}` });
  }
}

const scores = JSON.parse(read(join(hh, "results", "round-1", "scores.json")));
const runsDir = join(hh, "results", "round-1", "runs");
const honest = [];
const ours = [];
for (const run of readdirSync(runsDir).sort()) {
  const m = /^(h\d+)-(.+)-\d+$/.exec(run);
  if (!m) continue;
  const [, task, arm] = m;
  const s = scores[run];
  if (arm !== "ours" && (!s || !(s.C1 && s.C2 && s.C3 && s.C4))) continue;
  for (const f of walk(join(runsDir, run)).sort()) {
    if (!isProse(f) || !existsSync(join(hh, "fixtures", task, f))) continue;
    const b = read(join(hh, "fixtures", task, f));
    const a = read(join(runsDir, run, f));
    (arm === "ours" ? ours : honest).push({ before: b, after: a, lang: lang(b, a), name: `${run}/${f}` });
  }
}

/** word -> { added, lost } over a set of pairs, for one kind. */
function tally(pairs, language, kind, words) {
  const out = new Map(words.map((w) => [w, { added: 0, lost: 0, seen: 0 }]));
  for (const p of pairs) {
    if (p.lang !== language) continue;
    const tag = p.lang;
    const cb = kind === "person" ? countPersonWords(p.before, tag) : countTerms(p.before, words);
    const ca = kind === "person" ? countPersonWords(p.after, tag) : countTerms(p.after, words);
    for (const w of words) {
      if (cb.get(w) || ca.get(w)) out.get(w).seen++;
      const d = (ca.get(w) ?? 0) - (cb.get(w) ?? 0);
      if (d > 0) out.get(w).added++;
      else if (d < 0) out.get(w).lost++;
    }
  }
  return out;
}

const rows = [];
const kept = { person: { added: {}, lost: {} }, claim: { added: {} } };
const languages = [...new Set([...Object.keys(PERSON_CANDIDATES), ...Object.keys(CLAIM_CANDIDATES)])];
for (const language of languages) {
  const nHonest = honest.filter((p) => p.lang === language).length;
  const nGolden = golden.filter((p) => p.lang === language).length;
  for (const kind of ["person", "claim"]) {
    const words = (kind === "person" ? PERSON_CANDIDATES : CLAIM_CANDIDATES)[language] ?? [];
    if (!words.length) continue;
    const g = tally(golden, language, kind, words);
    const h = tally(honest, language, kind, words);
    const o = tally(ours, language, kind, words);
    for (const w of words) {
      const judge = (dir) => {
        // A removal is reported only for a word the corpus shows being kept or removed without harm.
        if (dir === "lost" && g.get(w).seen + h.get(w).seen === 0) return "not flagged: never seen in the corpus";
        if (g.get(w)[dir] > 0) return "dropped: flags a golden";
        if (nHonest === 0 ? false : h.get(w)[dir] / nHonest > LIMIT) return "dropped: over 5 percent of honest rewrites";
        return "kept";
      };
      const va = judge("added");
      const vl = kind === "person" ? judge("lost") : "not flagged";
      if (va === "kept") (kept[kind].added[language] ??= []).push(w);
      if (kind === "person" && vl === "kept") (kept.person.lost[language] ??= []).push(w);
      rows.push({ language, kind, w, g: g.get(w), h: h.get(w), o: o.get(w), nHonest, nGolden, va, vl });
    }
  }
}

const sameLists = (a, b) => {
  const norm = (o) => JSON.stringify(Object.fromEntries(Object.entries(o).filter(([, v]) => v.length).sort()));
  return norm(a) === norm(b);
};
const problems = [];
if (!sameLists(kept.person.added, PERSON_ADDED)) problems.push("PERSON_ADDED in src/compare.ts differs from the kept words");
if (!sameLists(kept.person.lost, PERSON_LOST)) problems.push("PERSON_LOST in src/compare.ts differs from the kept words");
if (!sameLists(kept.claim.added, CLAIM_WORDS)) problems.push("CLAIM_WORDS in src/compare.ts differs from the kept words");

const counts = languages.map((l) => `${l}: ${golden.filter((p) => p.lang === l).length} golden, ${honest.filter((p) => p.lang === l).length} honest`).join("; ");
const table = (kind) =>
  rows
    .filter((r) => r.kind === kind)
    .map((r) => `| ${r.language} | \`${r.w}\` | ${r.g.added} | ${r.g.lost} | ${r.h.added} | ${r.h.lost} | ${r.g.seen + r.h.seen} | ${r.nHonest} | ${r.va} | ${r.vl} |`)
    .join("\n");
const ourRows = rows
  .filter((r) => r.o.added || r.o.lost)
  .map((r) => `| ${r.language} | ${r.kind} | \`${r.w}\` | ${r.o.added} | ${r.o.lost} | ${r.va} |`)
  .join("\n");
const keptLine = (o) =>
  Object.entries(o)
    .map(([l, w]) => `${l}: ${w.map((x) => `\`${x}\``).join(", ")}`)
    .join("; ") || "none";

const md = `# Words that \`slop --compare\` flags

Generated by \`node bench/compare-words.mjs\`. Do not edit by hand; CI fails when this file
does not match a fresh run, or when the lists in \`src/compare.ts\` differ from the words kept here.

## Method

\`slop --compare\` reports two more kinds of fact than numbers and names: \`person\` (a first-person
word such as \`our\` that the rewrite has more of, or fewer of, than the source) and \`claim\` (a word
such as \`always\` that the rewrite has more of). A word is flagged only if it passes this rule, in
the language of the pair:

- It flags no golden rewrite. The goldens are the hand-made rewrites in \`bench/head-to-head/golden\`
  next to their fixtures (${golden.length} Markdown pairs).
- It flags at most ${LIMIT * 100} percent of the honest rewrites. Honest means a rewrite of round 1 by
  the base model or by a competitor skill, in a run whose criteria C1 to C4 all pass (${honest.length} files).
  The rewrites by this tool's own skill are listed separately below and are not in the rate.

Each direction of a person word is judged on its own: a word can be flagged when added and
not when lost. A claim word is judged for additions only, because removing puffery is the point of a
rewrite. Counts are files with at least one more (added) or one fewer (lost) occurrence. Code,
urls and quoted text are not read. A word with no flag anywhere is kept, which means it has not
been shown to over-flag on this corpus, not that it has been shown to catch a real addition.
A removal ("when lost") is reported only for a word that the corpus shows in at least one file,
because a removal that was never tried cannot be called safe. The honest rewrites of French, Spanish and German are few, so their rates move on a single file.

Files per language, golden and honest: ${counts}.

## Person words

| language | word | golden added | golden lost | honest added | honest lost | files with the word | honest files | when added | when lost |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
${table("person")}

Kept when added: ${keptLine(kept.person.added)}.

Kept when lost: ${keptLine(kept.person.lost)}.

## Claim words

| language | word | golden added | golden lost | honest added | honest lost | files with the word | honest files | when added | when lost |
|---|---|---:|---:|---:|---:|---:|---:|---|---|
${table("claim")}

Kept: ${keptLine(kept.claim.added)}.

## This tool's own rewrites, for information

Every round 1 rewrite by this tool's skill (whatever its scores) that carries at least one
flag of a candidate word. They are not part of the rate. \`h2-ours-2\` and \`h2-ours-3\` are the rewrites
that turned "In benchmarks" into "In our benchmarks".

| language | kind | word | files with more | files with fewer | verdict when added |
|---|---|---|---:|---:|---|
${ourRows || "| | | | | | |"}
`;

if (process.argv.includes("--check")) {
  const current = existsSync(output) ? read(output) : "";
  if (current !== md) {
    console.error("bench/COMPARE-WORDS.md is stale; run `node bench/compare-words.mjs` and commit the result");
    process.exit(1);
  }
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`compare words up to date (${rows.length} words, ${golden.length} golden and ${honest.length} honest pairs)`);
} else {
  writeFileSync(output, md);
  console.log(`wrote bench/COMPARE-WORDS.md (${rows.length} words, ${golden.length} golden and ${honest.length} honest pairs)`);
  for (const p of problems) console.log(`NOTE: ${p}; update src/compare.ts:\n  added ${JSON.stringify(kept.person.added)}\n  lost ${JSON.stringify(kept.person.lost)}\n  claims ${JSON.stringify(kept.claim.added)}`);
}
