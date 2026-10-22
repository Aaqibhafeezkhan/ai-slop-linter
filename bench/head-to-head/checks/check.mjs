#!/usr/bin/env node
// Scripted criteria for the eighteen head-to-head tasks. Node built-ins only.
// Usage: node bench/head-to-head/checks/check.mjs <h1..h18> <runDir> [--path <PATH>]
// Prints one JSON line. Blind criteria are null; a script criterion is true or false.
import { cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, readlinkSync, rmSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { randomBytes } from "node:crypto";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const FIXTURES = join(HERE, "..", "fixtures");
const HOME_DIR = join(HERE, "..", "home");
const CHECKER_DIR = join(HERE, "..", "checker-data");
const CLEAN_GUIDE = join(CHECKER_DIR, "h6-clean-guide.md");
const CLEAN_GUIDE_15 = join(CHECKER_DIR, "h15-clean-guide.md");
const dataOf = (id) => JSON.parse(readFileSync(join(CHECKER_DIR, `${id}.json`), "utf8"));
const TIMEOUT_MS = 120000;
const EM = "—";
const EN = "–";
const DASH = new RegExp(`[${EM}${EN}]`);
const OUTPUT_FILE = { h1: "note.md", h2: "README.md", h3: "pr.md", h4: "RELEASE-NOTES.md", h5: "guide.md",
  h7: "announcement.md", h8: "lisbon.md", h9: "blog.md", h10: "post.md", h11: "release.md", h12: "town.md",
  h13: "RELEASE-NOTES.md", h14: "guide.md", h16: "lisbon-trip.md", h17: "sammlung.md", h18: "drafts.md" };
const BLIND = { h1: ["C5"], h2: ["C5"], h3: ["C5"], h4: ["C5"] };
// Home-ground tasks (kind "home") read their lists from home/<id>.json and have no blind criterion.
const HOME_IDS = ["h7", "h8", "h9", "h10", "h11", "h12", "h16", "h17", "h18"];

// ---- text helpers -------------------------------------------------------------------------
const norm = (s) => s.normalize("NFC");
const lower = (s) => norm(s).replace(/[‘’]/g, "'").toLowerCase();
const WORD = /[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu;
const words = (s) => new Set(lower(s).match(WORD) ?? []);
const NUM = /\d[\d,.]*\d|\d/g;
const NUM_PCT = /\d+(?:[.,]\d+)*%?/g;
const ISO = /\d{4}-\d{2}-\d{2}/g;
const URL = /https?:\/\/[^\s)"'`]+/g;
const CODE = /`([^`\n]+)`/g;
const FENCE = /^```[\s\S]*?^```$/gm;
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// A literal must not sit inside a longer version or number: "2.3" is not part of "1.2.3" or "2.3.1".
const containsWhole = (text, s) => new RegExp(`(?<![\\p{L}\\p{N}])(?<!\\d\\.)${esc(s)}(?![\\p{L}\\p{N}])(?!\\.\\d)`, "u").test(norm(text));
const lines = (s) => norm(s).split("\n");
const hasDash = (s) => DASH.test(norm(s));
const tellsIn = (text, list) => list.filter((p) => lower(text).includes(lower(p)));
const numbersOf = (s, re) => new Set(norm(s).match(re) ?? []);
const numbersPct = (s) => new Set([...(norm(s).match(ISO) ?? []), ...(norm(s).match(NUM_PCT) ?? [])]);
const fences = (s) => norm(s).match(FENCE) ?? [];

function atSentenceStart(text, index) {
  const before = text.slice(0, index);
  const line = before.slice(before.lastIndexOf("\n") + 1);
  return /^[\s#>*+\-|]*$/.test(line) || /[.!?]\s*$/.test(before);
}

// Capitalised words that the fixture does not contain, outside sentence starts. With cells: true, the first
// word of a Markdown table cell also counts as a sentence start.
function unexplainedCapitals(out, fixture, { cells = false } = {}) {
  const known = new Set(norm(fixture).match(WORD) ?? []);
  const text = norm(out);
  const bad = [];
  for (const m of text.matchAll(WORD)) {
    const tok = m[0];
    if (!/^\p{Lu}/u.test(tok) || known.has(tok) || atSentenceStart(text, m.index)) continue;
    if (cells && /\|\s*$/.test(text.slice(0, m.index))) continue;
    bad.push(tok);
  }
  return bad;
}

// ---- task 1: French dialogue -----------------------------------------------------------------
function h1(out) {
  const x = norm(out);
  const quote = "« Je viens — enfin presque — demain présenter la version finale »";
  const c1 = lines(x).filter((l) => l.startsWith(`${EM} `)).length >= 4 && x.includes(quote);
  const c2 = ["3 mars", "Atelier 2.0", "29 euros"].every((s) => containsWhole(x, s))
    && (containsWhole(x, "quatorze") || containsWhole(x, "14 minutes"))
    && (containsWhole(x, "quarante") || containsWhole(x, "40 minutes"));
  const tells = ["pas seulement", "révolution", "plongeons", "robuste", "n'hésitez pas", "sans faille", "en conclusion", "l'avenir s'annonce"];
  const c3 = tellsIn(x, tells).length === 0;
  const w = words(x);
  const french = ["le", "la", "les", "nous", "des", "est", "une", "pour"].filter((v) => w.has(v)).length;
  const c4 = french >= 5 && !["the", "and", "we"].some((v) => w.has(v));
  return { C1: c1, C2: c2, C3: c3, C4: c4 };
}

// ---- task 2: marketing intro -------------------------------------------------------------------
function h2(out, fixture) {
  const x = norm(out);
  const L = lines(x);
  const c1 = ["2.3", "12,000", "4-core", "40%", "2.2", "35%", "p99", "Acme Corp", "Node 20", "MIT"].every((s) => containsWhole(x, s));
  const stock = ["seamless", "robust", "battle-tested", "game-changer", "blazing", "unparalleled", "effortless", "empower", "unlock", "not just", "future of job processing"];
  const c2 = !hasDash(x) && tellsIn(x, stock).length === 0;
  const fx = fences(fixture);
  const c3 = L.includes("# Fastq") && fx.length > 0 && fx.every((b) => x.includes(b))
    && L.includes("See the [changelog](CHANGELOG.md) for details.");
  const fixNums = numbersOf(fixture, NUM);
  const fixWords = words(fixture);
  const outWords = words(x);
  const c4 = [...numbersOf(x, NUM)].every((n) => fixNums.has(n))
    && ["our", "we", "we've", "us", "my"].every((p) => !outWords.has(p) || fixWords.has(p))
    && unexplainedCapitals(x, fixture).length === 0;
  return { C1: c1, C2: c2, C3: c3, C4: c4 };
}

// ---- task 3: pull request description ----------------------------------------------------------
function h3(out, fixture) {
  const x = norm(out);
  const c1 = ["#311", "legacy_auth", "12", "24", "38"].every((s) => containsWhole(x, s))
    && lines(x).includes("npm run migrate -- --to 0042");
  const fx = fences(fixture);
  const c2 = fx.length > 0 && fx.every((b) => x.includes(b));
  const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
  const boldBullet = /^\s*[-*]\s+\*\*[^*]+:?\*\*/m;
  const c3 = !emoji.test(x) && !boldBullet.test(x) && !hasDash(x) && !/let me know/i.test(x);
  const fixNums = numbersOf(fixture, NUM);
  const c4 = [...numbersOf(x, NUM)].every((n) => n === "1" || n === "2" || fixNums.has(n));
  return { C1: c1, C2: c2, C3: c3, C4: c4 };
}

// ---- task 4: release notes with facts that must survive ----------------------------------------
const H4_TOKENS = [
  "3.1.0", "2026-09-14", "1,248", "9 minutes 40 seconds", "31 minutes", "3.2x", "#1042", "5 times",
  "250 ms", "4.1%", "0.4%", "#1051", "`--max-old-space-size=4096`", "16 GB", "`POST /v2/rollouts/{id}/pause`",
  "https://docs.harbor.example/v2/pause", "Priya Raman", "Tomás Ibarra",
  "\"the slow path was never slow, it was waiting\"", "`harbor migrate --to 31`", "2.9", "2026-12-01",
];

function h4(out, fixture) {
  const x = norm(out);
  const fx = norm(fixture);
  const missing = H4_TOKENS.filter((t) => !x.includes(t));
  const c1 = missing.length === 0;
  const fixNums = numbersPct(fixture);
  // A URL in running text can end with sentence punctuation, which is not part of the address.
  const urlsOf = (s) => (s.match(URL) ?? []).map((u) => u.replace(/[.,;:!?)]+$/, ""));
  const fixUrls = new Set(urlsOf(fx));
  const fixCodes = new Set([...fx.matchAll(CODE)].map((m) => m[1]));
  const outUrls = urlsOf(x);
  const outCodes = [...x.matchAll(CODE)].map((m) => m[1]);

  const c2 = [...numbersPct(x)].every((n) => fixNums.has(n))
    && outUrls.every((u) => fixUrls.has(u))
    && outCodes.every((c) => fixCodes.has(c))
    && unexplainedCapitals(x, fixture).length === 0;
  const tells = ["testament", "delves", "seamless", "robust", "fast-paced", "not just", "foundation for everything", "i hope this helps", "commitment to"];
  const c3 = tellsIn(x, tells).length === 0 && !hasDash(x);
  const L = lines(x);
  const c4 = ["## Highlights", "## Credits", "## Upgrade"].every((h) => L.includes(h)) && L[0] === lines(fx)[0];
  return { C1: c1, C2: c2, C3: c3, C4: c4, missing };
}

// ---- task 5: mixed-language guide --------------------------------------------------------------
const H5_EXEMPT = [
  "— ¿Cuánto tarda el envío? —pregunta Lucía.",
  "— Unos cuatro días —responde Mateo—, pero depende del puerto.",
  "Der Support schrieb: „Wir melden uns innerhalb von 24 Stunden – versprochen“.",
  "La directrice a déclaré : « Je viens — enfin presque — demain présenter la version finale ».",
];

function h5(out) {
  const x = norm(out);
  const L = lines(x);
  const c1 = L.includes(H5_EXEMPT[0]) && L.includes(H5_EXEMPT[1]);
  const c2 = L.includes(H5_EXEMPT[2]);
  const c3 = L.includes(H5_EXEMPT[3]);
  const tells = ["testament", "delves", "pivotal", "seamless", "robust", "leverage", "fast-paced", "game-changer",
    "not just", "isn't just", "let me know", "future of localization looks bright", "commitment to"];
  const c4 = tellsIn(x, tells).length === 0 && L.every((l) => !l.includes(EM) || H5_EXEMPT.includes(l));
  const nums = numbersOf(x, NUM_PCT);
  const c5 = ["6", "22%", "30", "3"].every((n) => nums.has(n));
  return { C1: c1, C2: c2, C3: c3, C4: c4, C5: c5 };
}

// ---- task 13: long release notes with tells inside lists and a table --------------------------
// checker-data/h13.json holds { facts, tells, cellTells }. facts: literal strings that must stay verbatim.
// tells: case-insensitive regular expressions applied to the whole text. cellTells: a second list applied
// only to table rows and list items (bold-label bullets, riders and the wider word list of those lines).
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+/;
const TABLE_ROW = /^\s*\|/;
const cellCount = (row) => row.trim().replace(/^\||\|$/g, "").split("|").length;

function h13(out, fixture) {
  const data = dataOf("h13");
  const x = norm(out);
  const fx = norm(fixture);
  const missing = data.facts.filter((f) => !containsWhole(x, f));
  const c1 = missing.length === 0;

  const urlsOf = (s) => (s.match(URL) ?? []).map((u) => u.replace(/[.,;:!?)]+$/, ""));
  const fixUrls = new Set(urlsOf(fx));
  const fixCodes = new Set([...fx.matchAll(CODE)].map((m) => m[1]));
  const fixNums = numbersPct(fx);
  const c2 = [...numbersPct(x)].every((n) => fixNums.has(n))
    && urlsOf(x).every((u) => fixUrls.has(u))
    && [...x.matchAll(CODE)].every((m) => fixCodes.has(m[1]))
    && unexplainedCapitals(x, fx, { cells: true }).length === 0;

  const c3 = data.tells.every((p) => !new RegExp(p, "imu").test(x));

  const headings = (s) => lines(s).filter((l) => /^#{1,6}\s/.test(l));
  const fixRows = lines(fx).filter((l) => TABLE_ROW.test(l));
  const outRows = lines(x).filter((l) => TABLE_ROW.test(l));
  const items = (s) => lines(s).filter((l) => LIST_ITEM.test(l)).length;
  const c4 = headings(fx).every((h) => lines(x).includes(h))
    && fixRows.length > 0 && outRows.length === fixRows.length
    && outRows.every((r) => cellCount(r) === cellCount(fixRows[0]))
    && Math.abs(items(x) - items(fx)) <= 2;

  const scoped = lines(x).filter((l) => TABLE_ROW.test(l) || LIST_ITEM.test(l));
  const c5 = scoped.every((l) => data.cellTells.every((p) => !new RegExp(p, "iu").test(l)));
  return { C1: c1, C2: c2, C3: c3, C4: c4, C5: c5, missing };
}

// ---- task 14: English guide with three foreign blocks, a code block and front matter -----------
// checker-data/h14.json holds the foreign lines (spanish, turkish, german, french), the code block, facts, tells.
const frontMatter = (s) => /^---\n([\s\S]*?)\n---\n/.exec(norm(s))?.[1];

function h14(out, fixture) {
  const d = dataOf("h14");
  const x = norm(out);
  const L = lines(x);
  const has = (list) => list.every((l) => L.includes(l));
  const c1 = has(d.spanish) && has(d.turkish);
  const c2 = has(d.german);
  const c3 = has(d.french) && x.includes(d.code);

  // English prose lines: every line that is not a foreign line and not inside a fenced code block.
  const exempt = new Set([...d.spanish, ...d.turkish, ...d.german, ...d.french]);
  const english = [];
  let inFence = false;
  for (const l of L) {
    if (/^```/.test(l)) {
      inFence = !inFence;
      continue;
    }
    if (!inFence && !exempt.has(l)) english.push(l);
  }
  const prose = english.join("\n");
  const c4 = d.tells.every((p) => !new RegExp(p, "imu").test(prose)) && !prose.includes(EM);

  const fm = frontMatter(x);
  const c5 = d.facts.every((f) => containsWhole(x, f)) && fm !== undefined && fm === frontMatter(fixture);
  return { C1: c1, C2: c2, C3: c3, C4: c4, C5: c5 };
}

// ---- tasks 7 to 12 and 16 to 18: home-ground tasks taken from the competitors' own examples ---------------
// The data file home/<id>.json holds { lang, facts, tells, preserve, notes, allowFirstPerson }.
// facts: case-insensitive regular expressions (plain text is fine, alternatives are allowed).
// tells: case-insensitive regular expressions from the competitor's strong catalog entries.
// notes: weaker tells, listed for the reader and never scored.
const INVISIBLE = /[\u00AD\u200B-\u200D\u2060\uFEFF]/g;
const WC = /[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu;
const wordCount = (s) => (lower(s).match(WC) ?? []).length;
// A possessive or a contraction counts as its base word: Alfama's is Alfama, and I'd is I (criteria repair 2026-10-22).
const baseWord = (w) => w.replace(/'(?:s|d|m|ll|ve|re)$/, "");
const baseWords = (s, lang) => new Set((lower(s).match(WC) ?? []).map((w) => {
  const base = w.split("'")[0];
  return lang === "de" && base.startsWith("unser") ? "unser" : base;
}));
const NUMBER_WORDS = {
  1: "one", 2: "two", 3: "three", 4: "four", 5: "five", 6: "six", 7: "seven", 8: "eight", 9: "nine", 10: "ten",
  11: "eleven", 12: "twelve", 13: "thirteen", 14: "fourteen", 15: "fifteen", 16: "sixteen", 17: "seventeen",
  18: "eighteen", 19: "nineteen", 20: "twenty", 30: "thirty", 40: "forty", 50: "fifty", 60: "sixty", 70: "seventy",
  80: "eighty", 90: "ninety", 100: "hundred",
};
// Markdown list numbers ("1. item") are structure, not figures.
const withoutListNumbers = (s) => norm(s).replace(/^\s*\d+[.)]\s/gm, "");
const factRe = (f) => new RegExp(`(?<![\\p{L}\\p{N}])(?<!\\d\\.)(?:${norm(f)})(?![\\p{L}\\p{N}])(?!\\.\\d)`, "iu");

// Capitalised words that the fixture does not contain, outside sentence starts. A possessive counts as its base word.
function newCapitals(out, fixture) {
  const known = new Set((norm(fixture).match(WORD) ?? []).map(baseWord));
  const text = norm(out).replace(/[‘’]/g, "'");
  const bad = [];
  for (const m of text.matchAll(WORD)) {
    const tok = m[0];
    if (!/^\p{Lu}/u.test(tok) || known.has(baseWord(tok)) || atSentenceStart(text, m.index)) continue;
    bad.push(tok);
  }
  return bad;
}

const STOPWORDS = new Set(("about above after again against along among another around because before behind being below between both "
  + "could doing during either every first found great however into least might never other ought rather shall should since still "
  + "their there these they those through under until where whether which while whose would your "
  + "aber alle allem allen aller alles auch durch eines einem einen einer haben hatte heute jetzt kein keine keinen letzten "
  + "meist ohne rund seit sein seine sich sind sowie über unser unsere waren wegen werden wird wurde zwischen").split(" "));

// Content stems: lowercase words of five or more letters in the before text that are not stopwords and
// do not sit inside a match of a scored tell. A stem is the first five letters.
function contentStems(fixture, tells) {
  const text = norm(fixture).replace(/[‘’]/g, "'");
  const spans = [];
  for (const p of tells) for (const m of text.matchAll(new RegExp(p, "gimu"))) spans.push([m.index, m.index + m[0].length]);
  const stems = new Set();
  for (const m of text.matchAll(/\p{L}{5,}/gu)) {
    if (spans.some(([a, b]) => m.index >= a && m.index < b)) continue;
    const w = m[0].toLowerCase();
    if (!STOPWORDS.has(w)) stems.add(w.slice(0, 5));
  }
  return stems;
}

// Calibrated so that the competitors' own published After texts keep enough of the Before content (they score
// 0.35 to 0.50); a list of the facts alone scores far lower.
const RETENTION_MIN = 0.3;

function retention(out, fixture, tells) {
  const stems = contentStems(fixture, tells);
  const have = new Set((lower(out).match(/\p{L}{5,}/gu) ?? []).map((w) => w.slice(0, 5)));
  return stems.size === 0 ? 1 : [...stems].filter((s) => have.has(s)).length / stems.size;
}

function home(id, out, fixture) {
  const data = JSON.parse(readFileSync(join(HOME_DIR, `${id}.json`), "utf8"));
  const lang = data.lang ?? "en";
  const x = norm(out).replace(INVISIBLE, "");
  const c1 = data.facts.every((f) => factRe(f).test(x));
  const plain = x.replace(/[‘’]/g, "'");
  const c2 = data.tells.every((p) => !new RegExp(p, "imu").test(plain));

  const fixNums = numbersOf(withoutListNumbers(fixture), NUM);
  const fixWords = new Set(lower(fixture).match(WC) ?? []);
  const person = (lang === "de" ? ["wir", "unser", "ich"] : ["our", "we", "i", "my"]).filter((p) => !(data.allowFirstPerson ?? []).includes(p));
  const had = baseWords(fixture, lang);
  const has = baseWords(x, lang);
  // A figure written as a digit is fine when the before text spells it out ("five" for 5).
  const numberOk = (n) => fixNums.has(n) || fixWords.has(NUMBER_WORDS[n]);
  // German capitalises every noun, so a new capitalised word says nothing there; English checks it.
  const c3 = [...numbersOf(withoutListNumbers(x), NUM)].every(numberOk)
    && person.every((p) => !has.has(p) || had.has(p))
    && (lang === "de" || newCapitals(x, fixture).length === 0);

  const dashLines = data.preserve.filter((p) => hasDash(p));
  const c4 = lines(x).every((l) => !hasDash(dashLines.reduce((rest, k) => rest.split(norm(k)).join(""), l)));

  const ratio = wordCount(x) / wordCount(fixture);
  const c5 = data.preserve.every((p) => x.includes(norm(p))) && ratio >= (data.minRatio ?? 0.4) && ratio <= 1.3
    && retention(x, fixture, data.tells) >= RETENTION_MIN;
  return { C1: c1, C2: c2, C3: c3, C4: c4, C5: c5 };
}

// ---- task 6: CI and the local command, checked by running them --------------------------------
const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
};
const put = (dir, rel, content) => {
  const p = join(dir, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, content);
};

// Check-time symmetry: an arm's own installed copy of the linter (a node_modules/.bin entry named after the
// package or "slop", or any bin link that points at the package) is deleted from the temporary copy, so every
// arm resolves the tool through the same shim PATH and an installed copy that always exits 0 gains nothing.
// The package name is spelled in parts: this file only deletes the tool and never calls or reads it
// (a test pins that no file under checks/ refers to the linter by name).
const PKG = ["ai", "slop", "linter"].join("-");
function stripToolBins(dir) {
  const bin = join(dir, "node_modules", ".bin");
  if (!existsSync(bin)) return;
  for (const name of readdirSync(bin)) {
    const p = join(bin, name);
    let target = "";
    try {
      if (lstatSync(p).isSymbolicLink()) target = readlinkSync(p);
    } catch {}
    if (new RegExp(`^(${PKG}|slop)(\\.cmd|\\.ps1)?$`).test(name) || target.includes(PKG)) rmSync(p, { force: true });
  }
}

// Copy the run directory, apply a mutation, and run lint:prose there with the caller's PATH.
function proseRun(runDir, path, mutate, extra = () => true) {
  const tmp = mkdtempSync(join(tmpdir(), "h6-prose-"));
  try {
    cpSync(runDir, tmp, { recursive: true });
    stripToolBins(tmp);
    mutate(tmp);
    const pkg = readJson(join(tmp, "package.json"));
    const env = { ...process.env };
    if (path !== undefined) env.PATH = path;
    const started = Date.now();
    const r = spawnSync("npm", ["run", "lint:prose"], { cwd: tmp, env, encoding: "utf8", timeout: TIMEOUT_MS });
    return {
      valid: pkg !== null,
      hasScript: typeof pkg?.scripts?.["lint:prose"] === "string",
      status: r.status,
      timedOut: r.error?.code === "ETIMEDOUT" || r.signal !== null,
      ms: Date.now() - started,
      extra: extra(tmp),
    };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

function checkH6(runDir, path) {
  const fixDir = join(FIXTURES, "h6");
  const fixGuide = readFileSync(join(fixDir, "docs", "guide.md"));
  const cleanGuide = readFileSync(CLEAN_GUIDE);
  const fixPkg = readJson(join(fixDir, "package.json"));
  const fail = { C1: false, C2: false, C3: false, C4: false, C5: false };
  if (!existsSync(join(runDir, "package.json"))) return fail;

  // The French note is restored to the fixture's original text in every temporary copy (criteria repair
  // 2026-10-21): an arm that edits or silences docs/fr/notes.md gains nothing, because the check judges
  // the repository's lint:prose command on the original file.
  const fixNotes = readFileSync(join(fixDir, "docs", "fr", "notes.md"));
  const restoreNotes = (t) => put(t, "docs/fr/notes.md", fixNotes);
  const r1 = proseRun(runDir, path, (t) => {
    put(t, "docs/guide.md", fixGuide);
    restoreNotes(t);
  });
  const r2 = proseRun(runDir, path, (t) => {
    put(t, "docs/guide.md", cleanGuide);
    restoreNotes(t);
  }, (t) => existsSync(join(t, "docs", "fr", "notes.md")));
  const r3 = proseRun(runDir, path, (t) => {
    put(t, "docs/guide.md", cleanGuide);
    restoreNotes(t);
    put(t, "docs/extra.md", `The rollout was seamless ${EM} really.\n`);
  });

  const runnable = (r) => r.valid && r.hasScript && !r.timedOut;
  const C1 = runnable(r1) && r1.status !== null && r1.status !== 0;
  const C2 = runnable(r2) && r2.status === 0 && r2.extra;
  const C3 = runnable(r3) && r3.status !== null && r3.status !== 0;

  const C4 = staticCi(runDir, fixDir, fixPkg);
  const C5 = [r1, r2, r3].every((r) => r.valid && !r.timedOut && r.ms <= TIMEOUT_MS);
  return { C1, C2, C3, C4, C5 };
}

// C4 of h6 and h15 is static: a pull_request workflow runs the prose check, the test script is unchanged,
// and the ci.yml job named test still runs npm test.
function staticCi(runDir, fixDir, fixPkg) {
  void fixDir;
  const wfDir = join(runDir, ".github", "workflows");
  const workflows = existsSync(wfDir) ? readdirSync(wfDir).filter((f) => /\.ya?ml$/.test(f)) : [];
  const proseWorkflow = workflows.some((f) => {
    const text = readFileSync(join(wfDir, f), "utf8");
    return /^on:/m.test(text) && /pull_request/.test(text)
      && /lint:prose|ai-slop|slop|vale|textlint|proselint|write-good/.test(text);
  });
  const pkgNow = readJson(join(runDir, "package.json"));
  const testKept = pkgNow?.scripts?.test === fixPkg?.scripts?.test;
  const ci = existsSync(join(wfDir, "ci.yml")) ? readFileSync(join(wfDir, "ci.yml"), "utf8") : "";
  let ciTestJob = false;
  const job = /^  test:[ \t]*$/m.exec(ci);
  if (job) {
    const rest = ci.slice(job.index + job[0].length);
    const next = /^  \S/m.exec(rest);
    const block = next ? rest.slice(0, next.index) : rest;
    ciTestJob = /run:\s*npm test(?=\s|$)/m.test(block);
  }
  return proseWorkflow && testKept && ciTestJob;
}

// ---- task 15: the same, on a harder repository (checked by running it) ---------------------------
// The protected files (README, CHANGELOG, the French and German notes, the clean English guide) are restored
// to the fixture's text in every temporary copy, so an arm gains nothing by editing them. docs/guide.md is
// replaced by a clean guide. Four runs: the clean state must pass (exit 0); a new English file with an AI
// tell in docs/guides/ must fail with exit 1 exactly; the same sentence appended to README.md as a new
// paragraph must fail with exit 1 exactly; and a file under a directory and name that the checker invents
// for this check (random on every call) must fail with exit 1 exactly.
const H15_PROTECTED = ["README.md", "CHANGELOG.md", "docs/fr/notes.md", "docs/de/anleitung.md", "docs/guides/setup.md"];
const H15_DIRTY = `The rollout was seamless ${EM} really, a game-changer. Let me know if you have questions!`;

function checkH15(runDir, path) {
  const fixDir = join(FIXTURES, "h15");
  const fixPkg = readJson(join(fixDir, "package.json"));
  const fail = { C1: false, C2: false, C3: false, C4: false, C5: false };
  if (!existsSync(join(runDir, "package.json"))) return fail;

  const clean = readFileSync(CLEAN_GUIDE_15);
  const restore = (t) => {
    for (const rel of H15_PROTECTED) put(t, rel, readFileSync(join(fixDir, rel)));
    put(t, "docs/guide.md", clean);
  };
  const hex = () => randomBytes(4).toString("hex");
  const invented = `docs/section-${hex()}/page-${hex()}.md`;
  const r1 = proseRun(runDir, path, restore);
  const r2 = proseRun(runDir, path, (t) => {
    restore(t);
    put(t, "docs/guides/new.md", `${H15_DIRTY}\n`);
  });
  const r3 = proseRun(runDir, path, (t) => {
    restore(t);
    put(t, "README.md", `${readFileSync(join(fixDir, "README.md"), "utf8")}\n${H15_DIRTY}\n`);
  });
  const r4 = proseRun(runDir, path, (t) => {
    restore(t);
    put(t, invented, `${H15_DIRTY}\n`);
  });

  const runnable = (r) => r.valid && r.hasScript && !r.timedOut;
  const C1 = runnable(r1) && r1.status === 0;
  const C2 = runnable(r2) && r2.status === 1;
  const C3 = runnable(r3) && r3.status === 1;
  const C4 = staticCi(runDir, fixDir, fixPkg);
  const C5 = [r1, r2, r3, r4].every((r) => r.valid && !r.timedOut && r.ms <= TIMEOUT_MS) && runnable(r4) && r4.status === 1;
  return { C1, C2, C3, C4, C5 };
}

// ---- driver ------------------------------------------------------------------------------------
const TASKS = { h1, h2, h3, h4, h5, h13, h14 };

function usage() {
  console.error("usage: check.mjs <h1..h18> <runDir> [--path <PATH>]");
  process.exit(2);
}

function main(argv) {
  const [taskId, runDir, ...rest] = argv;
  if (!taskId || !/^h(?:[1-9]|1[0-8])$/.test(taskId) || !runDir) usage();
  let path;
  if (rest.length) {
    if (rest.length !== 2 || rest[0] !== "--path") usage();
    path = rest[1];
  }

  let result;
  if (taskId === "h6") {
    result = checkH6(runDir, path);
  } else if (taskId === "h15") {
    result = checkH15(runDir, path);
  } else {
    const file = join(runDir, OUTPUT_FILE[taskId]);
    if (!existsSync(file)) {
      result = { C1: false, C2: false, C3: false, C4: false, C5: false, missing: taskId === "h13" ? dataOf("h13").facts : H4_TOKENS };
    } else {
      const fixture = readFileSync(join(FIXTURES, taskId, OUTPUT_FILE[taskId]), "utf8");
      const text = readFileSync(file, "utf8");
      result = HOME_IDS.includes(taskId) ? home(taskId, text, fixture) : TASKS[taskId](text, fixture);
    }
  }

  const out = { task: taskId };
  for (const id of ["C1", "C2", "C3", "C4", "C5"]) {
    out[id] = (BLIND[taskId] ?? []).includes(id) ? null : Boolean(result[id]);
  }
  if (taskId === "h4" || taskId === "h13") out.missing = result.missing;
  console.log(JSON.stringify(out));
}

main(process.argv.slice(2));
