// Flags stock AI phrasing in README.md and docs/**/*.md.
// Code blocks, inline code, blockquotes and quoted strings are skipped,
// so docs can still quote a bad phrase when they talk about it.
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const RULES = [
  [/\bin today'?s (?:fast-paced|digital|ever-changing|modern) world\b/i, "stock opener"],
  [/\bin the (?:ever-evolving|ever-changing) (?:world|landscape) of\b/i, "stock opener"],
  [/\b(?:is|are|stands as) a testament to\b/i, "\"testament to\""],
  [/\bdelves? into\b|\bdelving\b/i, "\"delve\""],
  [/\bseamless(?:ly)?\b/i, "\"seamless\""],
  [/\brobust\b/i, "\"robust\""],
  [/\bleverag(?:e|es|ed|ing)\b/i, "\"leverage\""],
  [/\b(?:rich )?tapestry\b/i, "\"tapestry\""],
  [/\bunlock(?:s|ing)? the (?:full )?(?:power|potential)\b/i, "\"unlock the power\""],
  [/\bgame-?changer\b/i, "\"game-changer\""],
  [/\blet me know if you (?:have|need) (?:any )?(?:questions|anything)\b/i, "chatbot closer"],
  [/\bi hope this (?:helps|finds you well)\b/i, "chatbot closer"],
  [/\b(?:feel free to|don'?t hesitate to) (?:reach out|ask)\b/i, "chatbot closer"],
  [/\bas an ai\b/i, "chatbot self-reference"],
  [/\bthe future of [\w-]+ looks (?:bright|promising)\b/i, "vague upbeat closer"],
  [/\bit'?s (?:important|worth) (?:to note|noting) that\b/i, "filler lead-in"],
  [/\bin conclusion,/i, "filler lead-in"],
  [/\bin der heutigen schnelllebigen welt\b/i, "Floskel-Einstieg"],
  [/\bmelden sie sich (?:gerne|jederzeit)\b|\bzögern sie nicht\b/i, "Chatbot-Schluss"],
  [/\bdans le monde (?:en constante évolution|trépidant) d/i, "ouverture creuse"],
];
// Em dashes as punctuation are a tell in English prose; French uses them for dialogue.
const EM_DASH_LANGS = new Set(["en"]);

const strip = (text) =>
  text
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, (m) => m.replace(/[^\n]/g, " "))
    .replace(/^[ \t]*>.*$/gm, "")
    .replace(/`[^`\n]*`/g, "")
    .replace(/"[^"\n]*"|“[^”\n]*”|„[^“”\n]*[“”]|«[^»\n]*»|‘[^’\n]*’/g, "");

function files() {
  const out = [];
  if (existsSync("README.md")) out.push("README.md");
  const walk = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else if (e.name.endsWith(".md")) out.push(p);
    }
  };
  if (existsSync("docs")) walk("docs");
  return out;
}

const lang = (f) => (/^docs\/(de|fr|es|it)\//.test(f) ? f.split("/")[1] : "en");

let bad = 0;
for (const f of files()) {
  const lines = strip(readFileSync(f, "utf8")).split("\n");
  const rules = EM_DASH_LANGS.has(lang(f)) ? [...RULES, [/—/, "em dash"]] : RULES;
  lines.forEach((line, i) => {
    for (const [re, why] of rules) {
      const m = line.match(re);
      if (m) {
        console.error(`${f}:${i + 1}: ${why}: "${m[0]}"`);
        bad++;
      }
    }
  });
}
if (bad) {
  console.error(`\n${bad} AI-sounding phrase(s) found. Rewrite them in plain words.`);
  process.exit(1);
}
console.log("prose ok");
