/**
 * The measurement and the shipping limit for language rule packs, shared by
 * bench/packs.mjs (which writes bench/PACKS.md) and test/packs.test.mjs (which
 * enforces the limit for every registered pack).
 */
import { fileURLToPath } from "node:url";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { prepare, suppressed } from "../dist/src/doc.js";

const root = fileURLToPath(new URL("..", import.meta.url));

/** A corpus must carry at least this many words before its rates mean anything. */
export const MIN_HUMAN_WORDS = 500;
export const MIN_MACHINE_WORDS = 300;

/** The primary subtag, lower case: `fr-CA` gives `fr`. A pack and its corpus share one key. */
export const primaryTag = (lang) => lang.toLowerCase().split(/[-_]/)[0];

/** The human corpus for a language: the typography excerpt plus any packs/human files. */
export function humanFilesFor(lang) {
  const tag = primaryTag(lang);
  const out = [];
  const typography = join(root, "bench", "typography");
  for (const f of readdirSync(typography).filter((n) => n.startsWith(`${tag}-`) && n.endsWith(".md")).sort()) {
    out.push({ name: `typography/${f}`, text: readFileSync(join(typography, f), "utf8") });
  }
  out.push(...filesIn(join(root, "bench", "packs", "human", tag), `packs/human/${tag}`));
  return out;
}

/** The machine corpus for a language: unedited model output under packs/machine. */
export function machineFilesFor(lang) {
  const tag = primaryTag(lang);
  return filesIn(join(root, "bench", "packs", "machine", tag), `packs/machine/${tag}`);
}

function filesIn(dir, label) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => ({ name: `${label}/${f}`, text: readFileSync(join(dir, f), "utf8") }));
}

/** { human, machine } for a language, read from disk. A regional tag reads its primary corpus. */
export function corpusFor(lang) {
  return { human: humanFilesFor(lang), machine: machineFilesFor(lang) };
}

/** Words per file, counted as the rules count them. */
export function wordsIn(files) {
  return files.reduce((n, f) => n + prepare(f.name, f.text).words, 0);
}

/**
 * Runs the pack's own rules directly over every file's text, applying inline suppression as
 * lintText does. The rules are called without a declared language, so a pack is measured
 * whether or not it is registered in languageRules yet.
 */
export function measure(pack, files) {
  const perRule = new Map(pack.map((r) => [r.id, { total: 0, files: 0 }]));
  let words = 0;
  for (const f of files) {
    const doc = prepare(f.name, f.text);
    words += doc.words;
    for (const rule of pack) {
      const found = rule.check(doc).filter((finding) => !suppressed(doc, finding));
      if (found.length === 0) continue;
      perRule.get(rule.id).total += found.length;
      perRule.get(rule.id).files++;
    }
  }
  return { words, perRule };
}

/**
 * Whether a corpus is large enough to measure against: it has files, each file has words, and
 * the total reaches the minimum. Returns problems as sentences.
 */
function corpusProblems(label, files, minimum) {
  const problems = [];
  if (files.length === 0) return [`${label} corpus has no files`];
  for (const f of files) {
    if (wordsIn([f]) === 0) problems.push(`${label} corpus file ${f.name} has no words`);
  }
  const total = wordsIn(files);
  if (total < minimum) problems.push(`${label} corpus has ${total} words; it needs at least ${minimum}`);
  return problems;
}

/**
 * The shipping limit. A pack rule ships only if it produces zero findings on every human file
 * of its language and at least one finding on the machine corpus of that language, and both
 * corpora are large enough to measure against. Returns the problems as sentences; an empty
 * array means the pack passes.
 */
export function shippingProblems(lang, pack, { human, machine }) {
  const problems = [
    ...corpusProblems("human", human, MIN_HUMAN_WORDS).map((p) => `${lang}: ${p}`),
    ...corpusProblems("machine", machine, MIN_MACHINE_WORDS).map((p) => `${lang}: ${p}`),
  ];
  const h = measure(pack, human).perRule;
  const m = measure(pack, machine).perRule;
  for (const rule of pack) {
    const hs = h.get(rule.id);
    const ms = m.get(rule.id);
    if (hs.total > 0) problems.push(`${rule.id} fires ${hs.total} time(s) on ${hs.files} human file(s); a pack rule must fire zero times on human text`);
    if (ms.total === 0) problems.push(`${rule.id} never fires on the machine corpus; a pack rule must fire at least once on it`);
  }
  return problems;
}
