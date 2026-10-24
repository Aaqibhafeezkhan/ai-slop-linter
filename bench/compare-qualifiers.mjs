#!/usr/bin/env node
/**
 * Measures the number qualifiers (`about 40%`, `up to 3`, `bis zu 3`) that `slop --compare` may flag,
 * and writes bench/COMPARE-QUALIFIERS.md.
 *
 *   node bench/compare-qualifiers.mjs           regenerate the table
 *   node bench/compare-qualifiers.mjs --check   fail if the committed table is stale, or if the list
 *                                               shipped in src/compare.ts (QUALIFIERS) differs from
 *                                               the qualifiers this measurement keeps
 *
 * The precision rule is stricter than the one for person and claim words (bench/compare-words.mjs): a
 * qualifier is kept only if it flags no golden rewrite, no honest rewrite of round 1 and no honest pair
 * of test/fixtures/compare-qualifiers.json, in the language of the pair. A lost and an added qualifier
 * both count as a flag. The round 1 honest set here is every rewrite that is not by this tool's own
 * skill, whatever its scores: the scores file is absent from the cloud copy of the branch, and a set
 * that also holds the failed runs can only make the rule stricter. The script prints counts only.
 */
import { fileURLToPath } from "node:url";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { QUALIFIER_CANDIDATES, QUALIFIERS, languageOf, qualifierChanges, qualifiedNumbers } from "../dist/src/compare.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const hh = join(root, "bench", "head-to-head");
const output = join(root, "bench", "COMPARE-QUALIFIERS.md");
const own = JSON.parse(readFileSync(join(root, "test", "fixtures", "compare-qualifiers.json"), "utf8"));

const walk = (dir, base = "") =>
  readdirSync(dir).flatMap((f) => {
    const rel = base ? `${base}/${f}` : f;
    return statSync(join(dir, f)).isDirectory() ? walk(join(dir, f), rel) : [rel];
  });
const isProse = (f) => /\.md$/.test(f);
const read = (p) => readFileSync(p, "utf8");
const lang = (b, a) => (languageOf(b, a) ?? "en").split(/[-_]/)[0].toLowerCase();

const golden = [];
for (const h of readdirSync(join(hh, "fixtures")).sort()) {
  for (const f of walk(join(hh, "fixtures", h)).sort()) {
    if (!isProse(f) || !existsSync(join(hh, "golden", h, f))) continue;
    const b = read(join(hh, "fixtures", h, f));
    const a = read(join(hh, "golden", h, f));
    golden.push({ before: b, after: a, lang: lang(b, a) });
  }
}

const runsDir = join(hh, "results", "round-1", "runs");
const honest = [];
const ours = [];
if (existsSync(runsDir)) {
  for (const run of readdirSync(runsDir).sort()) {
    const m = /^(h\d+)-(.+)-\d+$/.exec(run);
    if (!m) continue;
    const [, task, arm] = m;
    for (const f of walk(join(runsDir, run)).sort()) {
      if (!isProse(f) || !existsSync(join(hh, "fixtures", task, f))) continue;
      const b = read(join(hh, "fixtures", task, f));
      const a = read(join(runsDir, run, f));
      (arm === "ours" ? ours : honest).push({ before: b, after: a, lang: lang(b, a) });
    }
  }
}
const pairs = own.honest.map((p) => ({ before: p.before, after: p.after, lang: p.lang }));
const dishonest = own.dishonest;

/**
 * Per qualifier, with `words` read for the language: files where a lost or added fact names it, and files
 * that hold it at all. A swap within a group is silent only when both words are read, so the flags of one
 * word depend on which others are read; the list is therefore settled as a fixpoint below.
 */
function tally(set, language, word, words) {
  let flags = 0;
  let seen = 0;
  for (const p of set) {
    if (p.lang !== language) continue;
    if (qualifiedNumbers(p.before, language, [word]).length || qualifiedNumbers(p.after, language, [word]).length) seen++;
    const r = qualifierChanges(p.before, p.after, language, words);
    if ([...r.lost, ...r.added].some((f) => f.value.startsWith(`${word} `))) flags++;
  }
  return { flags, seen };
}

/** Recall on the dishonest pairs, with a list of qualifiers: pairs whose expected lines all appear. */
function recall(words) {
  let caught = 0;
  for (const p of dishonest) {
    const r = qualifierChanges(p.before, p.after, p.lang, words[p.lang] ?? []);
    const got = (xs) => xs.map((f) => f.value).sort().join("|");
    if (got(r.lost) === [...p.lost].sort().join("|") && got(r.added) === [...p.added].sort().join("|")) caught++;
  }
  return caught;
}

const rows = [];
const kept = {};
const languages = Object.keys(QUALIFIER_CANDIDATES);
for (const language of languages) {
  // Start from every candidate; drop each qualifier that flags anything; repeat until nothing changes.
  let words = Object.keys(QUALIFIER_CANDIDATES[language]);
  const verdicts = {};
  for (;;) {
    const flagged = [];
    for (const word of words) {
      const g = tally(golden, language, word, words);
      const h = tally(honest, language, word, words);
      const o = tally(pairs, language, word, words);
      if (g.flags) verdicts[word] = "dropped: flags a golden";
      else if (h.flags) verdicts[word] = "dropped: flags an honest round 1 rewrite";
      else if (o.flags) verdicts[word] = "dropped: flags an honest pair";
      else continue;
      flagged.push(word);
    }
    if (!flagged.length) break;
    words = words.filter((w) => !flagged.includes(w));
  }
  if (words.length) kept[language] = words;
  // The counts shown are those of the first round, with every candidate read.
  const all = Object.keys(QUALIFIER_CANDIDATES[language]);
  for (const word of all) {
    const g = tally(golden, language, word, all);
    const h = tally(honest, language, word, all);
    const o = tally(pairs, language, word, all);
    const u = tally(ours, language, word, all);
    const verdict = words.includes(word) ? "kept" : verdicts[word];
    rows.push(`| ${language} | \`${word}\` | ${QUALIFIER_CANDIDATES[language][word]} | ${g.flags} | ${h.flags} | ${o.flags} | ${g.seen + h.seen + o.seen} | ${u.flags} | ${verdict} |`);
  }
}

const norm = (o) => JSON.stringify(Object.fromEntries(Object.entries(o).filter(([, v]) => v.length).sort()));
const problems = norm(kept) === norm(QUALIFIERS) ? [] : ["QUALIFIERS in src/compare.ts differs from the kept qualifiers"];
const per = (set) => languages.map((l) => `${l} ${set.filter((p) => p.lang === l).length}`).join(", ");
const keptLine = Object.entries(kept).map(([l, w]) => `${l}: ${w.map((x) => `\`${x}\``).join(", ")}`).join("; ") || "none";
const caughtAll = recall(Object.fromEntries(languages.map((l) => [l, Object.keys(QUALIFIER_CANDIDATES[l])])));
const caughtKept = recall(kept);

const md = `# Number qualifiers that \`slop --compare\` flags

Generated by \`node bench/compare-qualifiers.mjs\`. Do not edit by hand; the test suite fails when this
file does not match a fresh run, or when \`QUALIFIERS\` in \`src/compare.ts\` differs from the list kept here.

## Method

A \`qualifier\` fact is an approximator or a bound written right before a number (\`about 40%\`,
\`up to 3\`, \`plus de 300\`). \`slop --compare\` reports it when the rewrite keeps the number and drops
the qualifier, or adds one. Qualifiers are grouped by meaning (approx, min, max); a swap within a group
is not reported. A qualifier is kept only if it flags none of these, in the language of the pair:

- the golden rewrites in \`bench/head-to-head/golden\` next to their fixtures;
- the round 1 rewrites by the base model and the competitor skills, all of them whatever their scores
  (the scores file is absent from the cloud copy; the full set can only make the rule stricter);
- the honest pairs written for this check in \`test/fixtures/compare-qualifiers.json\`, which include
  qualifier words used in another sense (\`talked about 3 options\`, \`over 2 weeks\` as a span of time,
  \`hasta 2025\` as a date).

Counts are files (or pairs) with at least one lost or added fact that names the qualifier, with every
candidate of the language read. A swap within a group is silent only when both words are read, so the
list is settled as a fixpoint: every qualifier that flags anything is dropped, and the rest are measured
again without it, until nothing flags; a qualifier dropped in a later round shows zero flags in the
table and the reason in its verdict. "Seen" counts files or pairs that hold the
qualifier at all. A qualifier kept with few sightings has not been shown to over-flag; it has not been shown to
be safe either. This tool's own round 1 rewrites are listed for information and are not in the rule.

Pairs per language: golden ${per(golden)}; round 1 honest ${per(honest)}; hand-written honest ${per(pairs)}; this tool's own ${per(ours)}.

| language | qualifier | group | golden flags | round 1 honest flags | hand-written honest flags | seen | own rewrites flagged | verdict |
|---|---|---|---:|---:|---:|---:|---:|---|
${rows.join("\n")}

Kept: ${keptLine}.

Recall on the ${dishonest.length} hand-written dishonest pairs (every expected line reported, nothing else): ${caughtAll} with every candidate, ${caughtKept} with the kept list.
`;

if (process.argv.includes("--check") && !existsSync(runsDir)) {
  // Without the round 1 runs the honest column cannot be recomputed: check the shipped list only.
  if (!existsSync(output)) {
    console.error("bench/COMPARE-QUALIFIERS.md is missing");
    process.exit(1);
  }
  const keptInDoc = (read(output).split("\n").find((l) => l.startsWith("Kept: ")) ?? "").slice("Kept: ".length);
  const shipped = Object.entries(QUALIFIERS).filter(([, w]) => w.length).map(([l, w]) => `${l}: ${w.map((x) => `\`${x}\``).join(", ")}`).join("; ");
  if (keptInDoc !== `${shipped}.`) {
    console.error("QUALIFIERS in src/compare.ts differs from the Kept line of bench/COMPARE-QUALIFIERS.md");
    process.exit(1);
  }
  console.log("compare qualifiers: partial check passed (kept list = src/compare.ts); the round 1 runs are absent, so the table was not recomputed");
} else if (process.argv.includes("--check")) {
  const current = existsSync(output) ? read(output) : "";
  if (current !== md) {
    console.error("bench/COMPARE-QUALIFIERS.md is stale; run `node bench/compare-qualifiers.mjs` and commit the result");
    process.exit(1);
  }
  if (problems.length) {
    console.error(problems.join("\n"));
    process.exit(1);
  }
  console.log(`compare qualifiers up to date (${rows.length} qualifiers)`);
} else {
  writeFileSync(output, md);
  console.log(`wrote bench/COMPARE-QUALIFIERS.md (${rows.length} qualifiers); kept ${norm(kept)}`);
  for (const p of problems) console.log(`NOTE: ${p}`);
}
