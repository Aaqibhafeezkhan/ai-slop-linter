/**
 * The deterministic hedge check behind `--verify`: two classes of hedge that stack a second
 * softener on a claim. A hit blocks like a catalog hit, with the same exemptions (code, front
 * matter, quotes, dialogue lines) and the same inline suppression, under the rule name `hedge`.
 *
 * Class 1 is a modal verb with a hedge adverb within three words (`could potentially`,
 * `may possibly`). English is supported by Wikipedia, "Signs of AI writing" (CC BY-SA 4.0, facts
 * only), and by two MIT catalogs (blader/humanizer, conorbronsdon/avoid-ai-writing). Class 2 is an
 * evidential hedge verb with a vague-link participle in one clause (`seems to be related to`).
 * Its only independent source is the English Wikipedia page, on vague connection. The Portuguese,
 * Spanish, French and German lexicons are our translations of ordinary words, not catalog phrases.
 * A modal alone, or `seems` alone, is never a hit.
 */
import { exempt } from "./catalog.js";
import { position, suppressed, type Doc } from "./doc.js";

export interface HedgeHit {
  line: number;
  column: number;
  phrase: string;
}

interface Lexicon {
  modals: readonly string[];
  adverbs: readonly string[];
  /** The evidential hedge with its vague-link participle, within one clause. */
  link: RegExp;
}

const WORD = "\\p{L}";

const LEXICONS: Readonly<Record<string, Lexicon>> = {
  en: {
    modals: ["could", "may", "might"],
    adverbs: ["potentially", "possibly", "arguably"],
    link: new RegExp(`(?<!${WORD})(?:seems?|seemed|appears?|appeared)\\s+to\\s+be\\s+(?:${WORD}+ly\\s+)?(?:related|linked|associated)\\s+(?:to|with)(?!${WORD})`, "giu"),
  },
  pt: {
    modals: ["poderia", "poderiam", "pode", "podem"],
    adverbs: ["potencialmente", "eventualmente"],
    link: new RegExp(`(?<!${WORD})parece(?:m)?\\s+(?:estar|ser)\\s+(?:${WORD}+mente\\s+)?(?:relacionad|ligad|associad)[ao]s?(?!${WORD})`, "giu"),
  },
  es: {
    modals: ["podría", "podrían", "puede", "pueden"],
    adverbs: ["potencialmente", "eventualmente"],
    link: new RegExp(`(?<!${WORD})parece(?:n)?\\s+(?:estar|ser)\\s+(?:${WORD}+mente\\s+)?(?:relacionad|vinculad|asociad)[ao]s?(?!${WORD})`, "giu"),
  },
  fr: {
    modals: ["pourrait", "pourraient", "peut", "peuvent"],
    adverbs: ["potentiellement", "éventuellement"],
    link: new RegExp(`(?<!${WORD})semble(?:nt)?\\s+(?:être\\s+)?(?:${WORD}+ment\\s+)?(?:lié|associé)(?:e|s|es)?(?!${WORD})`, "giu"),
  },
  de: {
    modals: ["könnte", "könnten", "kann", "können"],
    adverbs: ["möglicherweise", "potenziell", "potentiell"],
    link: new RegExp(`(?<!${WORD})schein(?:t|en)\\b[^.!?;:,]{0,40}?\\szusammenzuhängen(?!${WORD})`, "giu"),
  },
};

const TOKEN = /[\p{L}\p{M}'’]+/gu;
const BOUNDARY = /[.!?;:]|\n[ \t]*\n/;
/** How many words after the modal a hedge adverb may stand. */
const REACH = 3;

/** Hedge hits in a document, in reading order. A language with no lexicon, or an unknown one, gives none. */
export function scanHedge(doc: Doc, tag: string): HedgeHit[] {
  const lexicon = LEXICONS[tag.split(/[-_]/)[0]!.toLowerCase()];
  if (!lexicon) return [];
  const text = exempt(doc);
  const found: { at: number; phrase: string }[] = [];
  const tokens = [...text.matchAll(TOKEN)].map((m) => ({ word: m[0].replace(/^['’]+|['’]+$/g, "").toLowerCase(), raw: m[0].replace(/^['’]+|['’]+$/g, ""), start: m.index!, end: m.index! + m[0].length }));
  for (let i = 0; i < tokens.length; i++) {
    const modal = tokens[i]!;
    // A capitalised "May" is a month or a name; other modals match in any case.
    if (!lexicon.modals.includes(modal.word) || modal.raw === "May") continue;
    for (let j = i + 1; j <= i + REACH && j < tokens.length; j++) {
      const next = tokens[j]!;
      if (BOUNDARY.test(text.slice(tokens[j - 1]!.end, next.start))) break;
      if (lexicon.adverbs.includes(next.word)) {
        found.push({ at: modal.start, phrase: text.slice(modal.start, next.end) });
        break;
      }
    }
  }
  for (const m of text.matchAll(lexicon.link)) found.push({ at: m.index!, phrase: m[0] });
  found.sort((a, b) => a.at - b.at);
  const hits: HedgeHit[] = [];
  for (const { at, phrase } of found) {
    const { line, column } = position(doc, at);
    if (suppressed(doc, { rule: "hedge", severity: "error", line, column, excerpt: "", message: "" })) continue;
    hits.push({ line, column, phrase });
  }
  return hits;
}
