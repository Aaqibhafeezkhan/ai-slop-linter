/**
 * Facts a text states: numbers, versions, dates, urls, issue ids, quotations, code and names.
 * Comparing a text with its rewrite shows which facts the rewrite added or lost. The method is
 * deterministic and reads the raw text: it does not judge whether a change is good.
 *
 * Known limits, on purpose:
 * - Spelled-out numbers are not extracted (`forty percent`).
 * - Dotted thousands read as versions (`1.000.000` is a version fact, not a number).
 * - Ordinals read as numbers: `3rd` gives number `3`.
 * - `person` facts are first-person words (`our`, `we`, `ich`, `nous`), compared by count: a word
 *   that occurs more often in the rewrite is added (`In benchmarks` becoming `In our benchmarks`
 *   adds `our`, an owner the source never named), a word that occurs less often is lost. Code,
 *   urls, link targets, e-mail addresses and text in double quotation marks (straight, curly,
 *   guillemet and low quotes) are not read, so quoted speech does not count; neither is a word
 *   joined to a letter or digit by `-`, `_`, `/`, `.` or `@` (`us-east-1`, `my-app`), except a
 *   French hyphen (`contactez-nous`, `nous-mêmes`). Limits: the word lists cover English,
 *   French, Spanish, German and Turkish, chosen by the declared, front matter or detected
 *   language (English when it cannot be told, none for another detected language such as Italian; Turkish and texts under about
 *   25 words are not detected, so declare them); Turkish suffixes (`-im`) are not read; a word in
 *   an all-capitals token (`US`, `ME`) is never read; a lowercase `i` is never read; a capital
 *   `I` is skipped as a Roman numeral or list marker (`I.`, `Part I`), in `I/O` and in
 *   abbreviations (`I.T.`); single quotation marks, Markdown block quotes and indented code
 *   blocks are read; a quotation that runs over several lines is read; a stray quotation mark
 *   can hide a stretch of text.
 * - `claim` facts are claim words (`always`, `guaranteed`, `because`) and are reported only when
 *   the rewrite has more of them than the source. Removing a claim word is never reported. The
 *   list is short on purpose: `bench/COMPARE-WORDS.md` records each candidate word with its
 *   flags on honest rewrites, and a word that flagged too many honest rewrites was dropped.
 * - `qualifier` facts are an approximator or a bound right before a number (`about 40%`, `up to 3`,
 *   `bis zu 3`, `plus de 300`). A qualifier is part of the fact: `about 40%` becoming `40%` is a lost
 *   qualifier, `300` becoming `over 300` an added one. Qualifiers are grouped by meaning (about,
 *   at least, at most), so a swap within a group (`about` for `around`, `over` for `more than`) is
 *   not reported. Only a number both texts have is read: a changed number is already a lost and an
 *   added number. Only the words in QUALIFIERS are read; `bench/COMPARE-QUALIFIERS.md` records each
 *   candidate with its flags on honest rewrites. Limits: a qualifier after its number (`40 % environ`)
 *   or spelled-out numbers are not read; code, urls and quoted text are not read.
 * - In German (or Luxembourgish) text only a run of two or more capitalised words is a name:
 *   every noun is capitalised there, so a single "Kaufmann" or "Technik" says nothing, while
 *   "Herr Krause" does. A single surname alone is therefore not compared. The language is the
 *   declared one, the front matter's, or detected from the text; every other kind of fact is
 *   compared as always.
 * - A single capitalised word that opens a table cell is not a name (a run of several is). A name that starts a sentence or a list item is not extracted, and an all-capitals token (an acronym)
 *   is not a name. A name counts as lost or added only when it is absent from the other text
 *   as a whole word, so a name that moves between sentence-initial and mid-sentence is kept.
 */

import { detectLanguage, frontMatterLanguage } from "./lang.js";

export type FactKind = "number" | "version" | "date" | "url" | "reference" | "quote" | "code" | "name" | "person" | "claim" | "qualifier";

export interface CompareOptions {
  /** The language of the texts, when the caller knows it. Unset or "auto": front matter, then detection. */
  language?: string | undefined;
}

export interface Fact {
  kind: FactKind;
  value: string;
}

/** Each extractor blanks what it has taken, so a later one cannot count the same text twice. */
const blank = (s: string) => s.replace(/[^\n]/g, " ");

const MONTHS =
  "january|february|march|april|may|june|july|august|september|october|november|december|janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre";

/** Function words that are capitalised at the start of a sentence and are not names. */
const STOPWORDS = new Set(
  (
    "I A An The And Or But If In On At To For Of With By From As It This That These Those We You They He She Our Your " +
    "Their My His Her Its Is Are Was Were Be Do Not No Yes So Then When Where Why How What Who Which Also There Here Some " +
    "Any All Each Every Both Other Such Only Than Too Very Just Can Will Would Should Could Let " +
    "Le La Les Un Une Des Du De Et Ou Mais Donc Ni Car Dans Sur Sous Pour Par Avec Sans En Au Aux Ce Cet Cette Ces " +
    "Il Elle Ils Elles Nous Vous On Je Tu Qui Que Quoi Dont Son Sa Ses Leur Leurs Mon Ma Mes Ton Ta Tes Notre Votre " +
    "Nos Vos Lors Si Comme Plus Moins Pas Ne Aussi Cela Ceci Oui Non Sont Est"
  ).split(" "),
);

/** A word that starts with a capital and has a lowercase letter: an acronym such as NASA is not one. */
const WORD = "\\p{Lu}\\p{L}*\\p{Ll}\\p{L}*";

const normaliseNumber = (value: string) => value.replace(/(\d),(?=\d{3}(?!\d))/g, "$1");

/** Languages that capitalise every noun: a capital in the middle of a sentence says nothing about a name. */
const CAPITALISED_NOUNS = new Set(["de", "lb"]);

/** Whether single capitalised words are no names in these texts: the language capitalises every noun. */
function namesAreNoise(before: string, after: string, language?: string): boolean {
  const declared = language !== undefined && language !== "" && language.toLowerCase() !== "auto" ? language : undefined;
  const tag = declared ?? frontMatterLanguage(before) ?? frontMatterLanguage(after) ?? detectLanguage(before).tag ?? detectLanguage(after).tag;
  return tag !== null && tag !== undefined && CAPITALISED_NOUNS.has(tag.split(/[-_]/)[0]!.toLowerCase());
}

export function extractFacts(text: string, options: { names?: boolean; multiWordNamesOnly?: boolean } = {}): Fact[] {
  const found: Fact[] = [];
  const add = (kind: FactKind, value: string) => {
    if (value) found.push({ kind, value });
  };
  let rest = text;

  // Code is a fact itself, and nothing inside it is read as prose.
  rest = rest.replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n([\s\S]*?)^[ \t]*\1[ \t]*$/gm, (m, _fence: string, body: string) => {
    add("code", body.trim());
    return blank(m);
  });
  rest = rest.replace(/`([^`\n]+)`/g, (m, body: string) => {
    add("code", body.trim());
    return blank(m);
  });

  rest = rest.replace(/https?:\/\/[^\s)>\]]+/g, (m) => {
    add("url", m.replace(/[.,;:]+$/, ""));
    return blank(m);
  });

  rest = rest.replace(/(?<![\p{L}\d&])#\d+(?![\p{L}\d])/gu, (m) => {
    add("reference", m);
    return blank(m);
  });
  rest = rest.replace(/(?<![\p{L}\d-])[A-Z][A-Z0-9]+-\d+(?![\p{L}\d])/gu, (m) => {
    add("reference", m);
    return blank(m);
  });

  rest = rest.replace(/(?<!\d)\d{4}-\d{2}-\d{2}(?!\d)/g, (m) => {
    add("date", m);
    return blank(m);
  });
  // A trailing year is part of the date: "14 September, 2024" is one fact, not a date and a number.
  rest = rest.replace(new RegExp(`(?<![\\p{L}\\d])\\d{1,2}[ \\u00a0]+(?:${MONTHS})(?:,?[ \\u00a0]+\\d{4}(?!\\d))?(?![\\p{L}])`, "giu"), (m) => {
    add("date", m.replace(/,/g, "").replace(/\s+/g, " "));
    return blank(m);
  });

  // A dotted number is a version, unless a letter or a percent sign follows it (3.2x, 40.5%).
  rest = rest.replace(/(?<![\p{L}\d.,])v?\d+(?:\.\d+)+(?![\p{L}\d%]|[.,]\d)/gu, (m) => {
    add("version", m);
    return blank(m);
  });

  // Quotations: straight, curly, guillemets and German low quotes; three or more words only.
  rest = rest.replace(/"([^"\n]+)"|“([^”\n]+)”|„([^“”\n]+)[“”"]|«([^»\n]+)»/gu, (m, a?: string, b?: string, c?: string, d?: string) => {
    const inner = a ?? b ?? c ?? d ?? "";
    const value = inner
      .replace(/[“”„«»]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
    if (value.split(" ").length < 3) return m;
    add("quote", value);
    return blank(m);
  });

  // An ordered-list marker (`1.` at the start of a line) is layout, not a fact.
  rest = rest.replace(/^[ \t]*\d+[.)](?=[ \t])/gm, blank);

  rest = rest.replace(/(?<![\p{L}\d.,])\d+(?:[.,]\d+)*%?/gu, (m) => {
    add("number", normaliseNumber(m));
    return blank(m);
  });

  // Names: capitalised runs that do not start a sentence, a list item or a heading.
  const runs = new RegExp(`(?<![\\p{L}\\d])${WORD}(?: ${WORD})*(?![\\p{L}\\d])`, "gu");
  rest.replace(runs, (m, offset: number) => {
    const lineStart = rest.lastIndexOf("\n", offset - 1) + 1;
    // Emphasis markers are not text: "- **Faster rollouts:** Rollouts" starts a sentence after the colon.
    const before = rest.slice(lineStart, offset).replace(/[*_~]+/g, "").trimEnd();
    // Only list, heading, emoji, digit or dialogue marks before the word: it starts the line or a list item.
    const onlyMarks = /^[\s\p{Extended_Pictographic}\uFE0F#>+\-\d.)¿¡—–"“„«]*$/u.test(before);
    // A sentence-ending mark before the word: the word starts the next sentence. A table-cell
    // border counts too: the first word of a cell starts that cell's text.
    const afterStop = /[.!?:"“„«—–]$/.test(before);
    if (onlyMarks || afterStop) return m;
    // A table-cell border: one capitalised word opening a cell is the start of that cell's text
    // ("Delves into typing"), but a run of several is a name ("Mateusz Wójcik | Maintainer").
    if (/\|$/.test(before) && !m.includes(" ")) return m;
    const words = m.split(" ");
    while (words.length && STOPWORDS.has(words[0]!)) words.shift();
    while (words.length && STOPWORDS.has(words[words.length - 1]!)) words.pop();
    // German capitalises every noun, so there only a run of several capitalised words is a name.
    if (words.length && options.names !== false && (!options.multiWordNamesOnly || words.length >= 2)) add("name", words.join(" "));
    return m;
  });

  // The same fact counted once, whatever number of times it appears.
  const seen = new Set<string>();
  return found.filter((f) => {
    const key = `${f.kind}\u0000${f.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Every first-person word the reader recognises, by language tag. Lowercase; a trailing apostrophe
 * is an elision (French `j'`). A language not listed here has no person facts; text whose language
 * cannot be told is read with the English list. Which of these words may raise a flag is decided
 * below, from the measurement in bench/COMPARE-WORDS.md.
 */
export const PERSON_CANDIDATES: Readonly<Record<string, readonly string[]>> = {
  en: ["i", "i'm", "i've", "i'll", "i'd", "me", "my", "mine", "myself", "we", "we're", "we've", "we'll", "we'd", "us", "our", "ours", "ourselves"],
  fr: ["je", "j'", "nous", "notre", "nos", "mon", "ma", "mes", "moi"],
  es: ["yo", "nosotros", "nosotras", "nuestro", "nuestra", "nuestros", "nuestras", "mi", "mis"],
  de: ["ich", "wir", "unser", "unsere", "unseren", "unserem", "unserer", "mein", "meine", "meinen", "meinem", "meiner", "mich", "uns"],
  tr: ["ben", "biz", "bizim", "benim"],
};

/**
 * Claim words and phrases measured for the precision rule, by language tag. `leading` alone is not
 * a candidate: technical text adds it honestly (`the leading slash`, `leading zeros`), and the
 * corpus has no case of it either way; `industry-leading` is the claim.
 */
export const CLAIM_CANDIDATES: Readonly<Record<string, readonly string[]>> = {
  en: [
    "best", "fastest", "world-class", "unmatched", "unparalleled", "only", "always", "never", "every", "everyone",
    "nobody", "guaranteed", "guarantees", "proven", "revolutionary", "industry-leading", "because", "therefore", "thus",
    "ensuring", "ensures", "enabling", "enables", "so that", "which means", "as a result",
  ],
  fr: ["par conséquent", "donc", "car", "garantit", "toujours", "jamais"],
  es: ["por lo tanto", "siempre", "nunca", "garantiza"],
  de: ["daher", "deshalb", "immer", "nie", "garantiert"],
};

/** Person words reported when the rewrite has more of them than the source. */
export const PERSON_ADDED: Readonly<Record<string, readonly string[]>> = {
  en: ["i'm", "i've", "i'll", "me", "my", "mine", "myself", "we", "we're", "we've", "we'll", "we'd", "us", "our", "ours", "ourselves"],
  fr: ["je", "j'", "nous", "notre", "nos", "mon", "ma", "mes", "moi"],
  es: ["yo", "nosotros", "nosotras", "nuestro", "nuestra", "nuestros", "nuestras", "mi", "mis"],
  de: ["ich", "wir", "unser", "unsere", "unseren", "unserem", "unserer", "mein", "meine", "meinen", "meinem", "meiner", "mich"],
  tr: ["ben", "biz", "bizim", "benim"],
};

/** Person words reported when the rewrite has fewer of them than the source. */
export const PERSON_LOST: Readonly<Record<string, readonly string[]>> = {
  en: ["i'd", "us"],
  fr: ["notre"],
  de: ["uns"],
};

/** Claim words reported when the rewrite has more of them than the source (removals are never reported). */
export const CLAIM_WORDS: Readonly<Record<string, readonly string[]>> = {
  en: ["fastest", "world-class", "unmatched", "unparalleled", "always", "never", "every", "guaranteed", "guarantees", "proven", "revolutionary", "industry-leading", "because", "therefore", "thus", "ensuring", "ensures", "enabling", "enables", "so that", "which means", "as a result"],
  fr: ["par conséquent", "donc", "car", "garantit", "toujours", "jamais"],
  es: ["por lo tanto", "siempre", "nunca", "garantiza"],
  de: ["daher", "deshalb", "immer", "nie", "garantiert"],
};

/**
 * Qualifier candidates: an approximator or a bound written right before a number, by language tag,
 * each mapped to its group. `approx` is "about that number", `min` "that number or more", `max` "that
 * number or less". A swap within a group is not a change of fact; a move between groups, a lost or an
 * added qualifier is. Which of these may raise a flag is decided from bench/COMPARE-QUALIFIERS.md.
 */
export const QUALIFIER_CANDIDATES: Readonly<Record<string, Readonly<Record<string, "approx" | "min" | "max">>>> = {
  en: {
    about: "approx", around: "approx", roughly: "approx", approximately: "approx", nearly: "approx", almost: "approx", "close to": "approx",
    "up to": "max", "at most": "max", under: "max", "less than": "max", "fewer than": "max",
    "at least": "min", over: "min", "more than": "min",
  },
  fr: {
    environ: "approx", "près de": "approx", presque: "approx", quasiment: "approx",
    "jusqu'à": "max", "moins de": "max", "au plus": "max",
    "plus de": "min", "au moins": "min",
  },
  de: {
    etwa: "approx", rund: "approx", ca: "approx", circa: "approx", fast: "approx", knapp: "approx", ungefähr: "approx",
    "bis zu": "max", "weniger als": "max", "höchstens": "max",
    "mehr als": "min", "mindestens": "min", "über": "min",
  },
  es: {
    unos: "approx", unas: "approx", "alrededor de": "approx", casi: "approx", aproximadamente: "approx", "cerca de": "approx",
    hasta: "max", "menos de": "max", "como máximo": "max",
    "más de": "min", "al menos": "min", "como mínimo": "min",
  },
};

/**
 * Qualifiers reported when a rewrite drops or adds one next to a number both texts have. English `about`
 * and `approximately` are not here: `about` flagged an honest round 1 rewrite, and without it a swap of
 * `approximately` for `about` would flag (bench/COMPARE-QUALIFIERS.md).
 */
export const QUALIFIERS: Readonly<Record<string, readonly string[]>> = {
  en: ["around", "roughly", "nearly", "almost", "close to", "up to", "at most", "under", "less than", "fewer than", "at least", "over", "more than"],
  fr: ["environ", "près de", "presque", "quasiment", "jusqu'à", "moins de", "au plus", "plus de", "au moins"],
  de: ["etwa", "rund", "ca", "circa", "fast", "knapp", "ungefähr", "bis zu", "weniger als", "höchstens", "mehr als", "mindestens", "über"],
  es: ["unos", "unas", "alrededor de", "casi", "aproximadamente", "cerca de", "hasta", "menos de", "como máximo", "más de", "al menos", "como mínimo"],
};

/** One qualifier before a number: the words as written, its group, and the number it qualifies. */
export interface QualifiedNumber {
  qualifier: string;
  group: string;
  number: string;
}

/** Verbs and nouns after which English `about` means "on the subject of": `talked about 3 options`. */
const ABOUT_TOPIC = /(?:^|[^\p{L}])(?:talk|talks|talked|talking|think|thinks|thought|thinking|write|writes|wrote|written|writing|ask|asks|asked|asking|know|knows|knew|known|learn|learns|learned|learnt|read|reads|reading|hear|hears|heard|care|cares|cared|worry|worries|worried|complain|complains|complained|say|says|said|tell|tells|told|story|stories|question|questions|post|posts|article|articles|note|notes|more|all)\s+$/iu;
/** Units of time after which `over` and `über` mean "across" (`over 2 weeks`), not "more than". */
const SPAN_UNIT = /^\s*(?:minutes?|hours?|days?|nights?|weeks?|months?|years?|decades?|quarters?|sprints?|releases?|versions?|Minuten|Stunden|Tagen?|Wochen|Monaten?|Jahren?|Jahrzehnten?|Quartalen?|Sprints?|Releases?|Versionen)(?![\p{L}])/iu;

/**
 * Whether a qualifier word is used in another sense here: English `about` after a verb of talking or
 * thinking, `over` or `über` before a span of time, Spanish `hasta` before a year (until 2025).
 */
function otherSense(lang: string, key: string, before: string, after: string, number: string): boolean {
  if (lang === "en" && key === "about") return ABOUT_TOPIC.test(before);
  if ((lang === "en" && key === "over") || (lang === "de" && key === "über")) return SPAN_UNIT.test(after);
  if (lang === "es" && key === "hasta") return /^(?:1[89]|20)\d\d$/.test(number) && !/^\s*%/.test(after);
  return false;
}

/** Every listed qualifier written right before a number, in the prose of a text (code, urls and quotes are blanked). */
export function qualifiedNumbers(text: string, tag?: string | null, words?: readonly string[]): QualifiedNumber[] {
  const lang = tag ? tag.split(/[-_]/)[0]!.toLowerCase() : "en";
  const groups = QUALIFIER_CANDIDATES[lang] ?? {};
  const list = (words ?? QUALIFIERS[lang] ?? []).filter((w) => groups[w] !== undefined);
  if (!list.length) return [];
  const alternation = [...list]
    .sort((a, b) => b.length - a.length)
    .map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, "['’]").replace(/ /g, "\\s+"))
    .join("|");
  // `ca.` keeps its dot; a currency sign may sit between the qualifier and the digits (`about $40`). A
  // qualifier glued to its number (`over40`) is not read.
  const re = new RegExp(`(?<![\\p{L}\\d'’-])(${alternation})(?:\\.?\\s+(?:[$€£¥]\\s?)?|\\s*[$€£¥]\\s?)(\\d+(?:[.,]\\d+)*)(?![.,]?\\d)`, "giu");
  const found: QualifiedNumber[] = [];
  const prose = proseOnly(text);
  for (const m of prose.matchAll(re)) {
    // `jusqu'à` and `jusqu’à` are one word, and so are runs of spaces.
    const key = m[1]!.toLowerCase().replace(/’/g, "'").replace(/\s+/g, " ");
    const group = groups[key];
    if (group === undefined) continue;
    if (otherSense(lang, key, prose.slice(Math.max(0, m.index! - 24), m.index!), prose.slice(m.index! + m[0].length, m.index! + m[0].length + 16), m[2]!)) continue;
    found.push({ qualifier: key, group, number: normaliseNumber(m[2]!) });
  }
  return found;
}

/** The plain numbers of a text's prose, normalised as number facts are. */
function proseNumbers(text: string): Set<string> {
  return new Set([...proseOnly(text).matchAll(/(?<![\p{L}\d.,])\d+(?:[.,]\d+)*/gu)].map((m) => normaliseNumber(m[0])));
}

/**
 * The qualifier facts a rewrite lost or added: for each group and number, a rewrite with fewer
 * qualified occurrences lost one, with more added one. Only a number that the other text also has
 * counts, because a changed number is reported as a number already. `words` defaults to QUALIFIERS.
 */
export function qualifierChanges(before: string, after: string, tag?: string | null, words?: readonly string[]): { lost: Fact[]; added: Fact[] } {
  const qb = qualifiedNumbers(before, tag, words);
  const qa = qualifiedNumbers(after, tag, words);
  const lost: Fact[] = [];
  const added: Fact[] = [];
  if (!qb.length && !qa.length) return { lost, added };
  const tally = (list: QualifiedNumber[]) => {
    const m = new Map<string, QualifiedNumber[]>();
    for (const q of list) {
      const key = `${q.group}\u0000${q.number}`;
      m.set(key, [...(m.get(key) ?? []), q]);
    }
    return m;
  };
  const diff = (from: Map<string, QualifiedNumber[]>, to: Map<string, QualifiedNumber[]>, numbersOfTo: Set<string>, out: Fact[]) => {
    for (const [key, list] of from) {
      const q = list[0]!;
      if ((to.get(key)?.length ?? 0) < list.length && numbersOfTo.has(q.number)) out.push({ kind: "qualifier", value: `${q.qualifier} ${q.number}` });
    }
  };
  diff(tally(qb), tally(qa), proseNumbers(after), lost);
  diff(tally(qa), tally(qb), proseNumbers(before), added);
  return { lost, added };
}

/** Text with code, urls, link targets and quoted text blanked, so none of it is read as the author's own words. */
export function proseOnly(text: string): string {
  let rest = text;
  // A fence that is never closed runs to the end of the text, as in CommonMark.
  rest = rest.replace(/^[ \t]*(`{3,}|~{3,})[^\n]*\n([\s\S]*?)(?:^[ \t]*\1[ \t]*$|(?![\s\S]))/gm, blank);
  rest = rest.replace(/`[^`\n]+`/g, blank);
  rest = rest.replace(/https?:\/\/[^\s)>\]]+/g, blank);
  // The target of a Markdown link or image (`[contact](#us)`); its text stays.
  rest = rest.replace(/\]\([^)\n]*\)/g, (m) => `]${blank(m.slice(1))}`);
  rest = rest.replace(/"[^"\n]*"|“[^”\n]*”|„[^“”\n]*[“”"]|«[^»\n]*»/gu, blank);
  return rest;
}

/** Words that, before a capital `I`, make it a numeral or a label (`Part I`, `Type I error`). */
const NUMERAL_LEAD = /(?:part|chapter|section|appendix|annex|phase|stage|tier|level|type|class|group|vol|volume|act|book|table|figure|fig|category|grade|step|plan|option|case|rule|article|schedule|war|henry|richard|louis|james|george|charles|edward|william|elizabeth|napoleon|world)\s+$/i;

/** The first-person words of a text, counted. `tag` picks the word list. */
export function countPersonWords(text: string, tag?: string | null): Map<string, number> {
  // A language with no list gets no person facts; an unknown language is read as English.
  const lang = tag ? tag.split(/[-_]/)[0]!.toLowerCase() : "en";
  const words = new Set(PERSON_CANDIDATES[lang] ?? []);
  const prose = proseOnly(text);
  const counts = new Map<string, number>();
  const token = /[\p{L}]+(?:['’][\p{L}]+)?'?/gu;
  for (const m of prose.matchAll(token)) {
    const raw = m[0];
    // An all-capitals token is an acronym (US, ME, MA): never the pronoun.
    if (raw.length > 1 && raw === raw.toUpperCase() && !raw.includes("'") && !raw.includes("’")) continue;
    let norm = raw.toLowerCase().replace(/’/g, "'");
    if (lang === "fr") {
      const elided = /^j'/.exec(norm);
      if (elided) norm = "j'";
    }
    if (!words.has(norm)) continue;
    const at = m.index!;
    // A word joined to a letter or digit by a hyphen, underscore, slash, dot or @ is part of a
    // name, not a pronoun: `us-east-1`, `my-app`, `my_var`, `docs/our`, `our.example`. In French
    // a hyphen joins real pronouns (`contactez-nous`, `dites-moi`, `nous-mêmes`), so there it does not count.
    const joiner = lang === "fr" ? /[_/.@]/u : /[-_/.@]/u;
    const joined = (pair: string, letterFirst: boolean) =>
      pair.length === 2 && joiner.test(pair[letterFirst ? 1 : 0]!) && /[\p{L}\d]/u.test(pair[letterFirst ? 0 : 1]!);
    if (joined(prose.slice(Math.max(0, at - 2), at), true) || joined(prose.slice(at + raw.length, at + raw.length + 2), false)) continue;
    if (lang === "en" && /^i('|$)/.test(norm)) {
      if (raw[0] !== "I") continue;
      const next = prose[at + raw.length] ?? "";
      const prev = prose[at - 1] ?? "";
      if (norm === "i") {
        if (next === "/" || prev === "/" || next === "-" || prev === "-") continue;
        if (/^[.)]/.test(next)) {
          const lineStart = prose.lastIndexOf("\n", at - 1) + 1;
          if (/^[\s#>*+\-\d.]*$/.test(prose.slice(lineStart, at))) continue;
          if (/^\.\p{L}\b/u.test(prose.slice(at + 1, at + 4))) continue;
        }
        if (NUMERAL_LEAD.test(prose.slice(Math.max(0, at - 16), at))) continue;
      }
    }
    counts.set(norm, (counts.get(norm) ?? 0) + 1);
  }
  return counts;
}

/** How often each term occurs in the prose of a text (whole words or phrases, case-insensitive). */
export function countTerms(text: string, terms: readonly string[]): Map<string, number> {
  const prose = proseOnly(text);
  const counts = new Map<string, number>();
  for (const term of terms) {
    const source = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/ /g, "\\s+");
    const n = [...prose.matchAll(new RegExp(`(?<![\\p{L}\\d'’-])${source}(?![\\p{L}\\d'’-])`, "giu"))].length;
    if (n > 0) counts.set(term, n);
  }
  return counts;
}

/** The language tag compareFacts reads both texts with. */
export function languageOf(before: string, after: string, language?: string): string | null {
  const declared = language !== undefined && language !== "" && language.toLowerCase() !== "auto" ? language : undefined;
  return declared ?? frontMatterLanguage(before) ?? frontMatterLanguage(after) ?? detectLanguage(before).tag ?? detectLanguage(after).tag ?? null;
}

const keyOf = (f: Fact) => `${f.kind}\u0000${f.value}`;

const order = (a: Fact, b: Fact) => (a.kind < b.kind ? -1 : a.kind > b.kind ? 1 : a.value < b.value ? -1 : a.value > b.value ? 1 : 0);

/**
 * The facts of `before` that `after` no longer has (lost) and the facts `after` has that
 * `before` did not (added), each sorted by kind then value, and how many facts both share.
 */
export function compareFacts(before: string, after: string, options: CompareOptions = {}): { lost: Fact[]; added: Fact[]; kept: number } {
  const multiWordNamesOnly = namesAreNoise(before, after, options.language);
  const b = extractFacts(before, { multiWordNamesOnly });
  const a = extractFacts(after, { multiWordNamesOnly });
  const inB = new Set(b.map(keyOf));
  const inA = new Set(a.map(keyOf));
  // A name is still there when it appears as a whole word anywhere in the other text, including
  // at the start of a sentence, where extraction does not read it as a name.
  const wordIn = (name: string, text: string) => new RegExp(`(?<![\\p{L}\\d])${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\d])`, "u").test(text);
  const lost = b.filter((f) => !inA.has(keyOf(f)) && !(f.kind === "name" && wordIn(f.value, after))).sort(order);
  const added = a.filter((f) => !inB.has(keyOf(f)) && !(f.kind === "name" && wordIn(f.value, before))).sort(order);
  // Every distinct fact of `before` is either kept or lost.
  const kept = b.length - lost.length;

  // First-person words: any change of count is a fact. Claim words: only more of them is a fact.
  const tag = languageOf(before, after, options.language);
  // An unknown language is read as English.
  const base = tag ? tag.split(/[-_]/)[0]!.toLowerCase() : "en";
  const pb = countPersonWords(before, tag);
  const pa = countPersonWords(after, tag);
  const personBase = base;
  for (const word of new Set([...pb.keys(), ...pa.keys()])) {
    const delta = (pa.get(word) ?? 0) - (pb.get(word) ?? 0);
    if (delta > 0 && PERSON_ADDED[personBase]?.includes(word)) added.push({ kind: "person", value: word });
    else if (delta < 0 && PERSON_LOST[personBase]?.includes(word)) lost.push({ kind: "person", value: word });
  }
  const terms = CLAIM_WORDS[base] ?? [];
  const cb = countTerms(before, terms);
  const ca = countTerms(after, terms);
  for (const [word, n] of ca) if (n > (cb.get(word) ?? 0)) added.push({ kind: "claim", value: word.toLowerCase() });

  // Qualifiers: a number both texts have that lost its approximator or bound, or gained one.
  const q = qualifierChanges(before, after, tag);
  lost.push(...q.lost);
  added.push(...q.added);
  return { lost: lost.sort(order), added: added.sort(order), kept };
}
