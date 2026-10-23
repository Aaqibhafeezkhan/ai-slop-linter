// Flags AI-sounding boilerplate in README.md and docs/**/*.md.
// Code, blockquotes and quoted text are ignored, so docs can discuss the phrases.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const RULES = [
  [/\bin today'?s (?:fast[- ]paced|digital|ever[- ]changing) world\b/i, "stock opener"],
  [/\b(?:is|are|stands as) an? testament to\b/i, "\"testament to\""],
  [/\bdelves? (?:into|deeper)\b|\bdelves\b/i, "\"delve\""],
  [/\bseamless(?:ly)?\b/i, "\"seamless\""],
  [/\brobust\b/i, "\"robust\""],
  [/\bgame[- ]chang(?:er|ing)\b/i, "\"game-changer\""],
  [/\brich tapestry\b/i, "\"tapestry\""],
  [/\bunlock the (?:full )?(?:power|potential)\b/i, "\"unlock the potential\""],
  [/\bit(?:'s| is) (?:important|worth) to note\b/i, "\"it's important to note\""],
  [/\bthe future of [^.!?]{0,40} looks bright\b/i, "upbeat closer"],
  [/\blet me know if you (?:have|need)\b/i, "chatbot closer"],
  [/\bi hope this (?:helps|finds you)\b/i, "chatbot closer"],
  [/\bin conclusion,/i, "\"in conclusion\""],
  [/\bin der heutigen (?:schnelllebigen|digitalen) welt\b/i, "Floskel"],
  [/\bnahtlos(?:e[rnms]?)?\b/i, "\"nahtlos\""],
  [/\btauchen wir ein\b|\btauche ein\b/i, "\"tauchen wir ein\""],
  [/\bzusammenfassend lässt sich sagen\b/i, "Floskel"],
  [/\bgib(?:t)? mir bescheid\b|\bmelde dich gerne\b/i, "Chatbot-Schluss"],
  [/\bich hoffe,? (?:das|dies) hilft\b/i, "Chatbot-Schluss"],
  [/ — /, "spaced em dash"],
];

function files(dir) {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? files(p) : p.endsWith(".md") ? [p] : [];
  });
}

// Replace ignored text with spaces so line numbers and columns survive.
const blank = (s) => s.replace(/[^\n]/g, " ");
function strip(text) {
  return text
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/^>.*$/gm, blank)
    .replace(/^\s*[—–-] .*$/gm, (l) => (/^\s*—/.test(l) ? blank(l) : l))
    .replace(/`[^`\n]*`/g, blank)
    .replace(/„[^“”"\n]*[“”"]|«[^»\n]*»|“[^”\n]*”|"[^"\n]*"/g, blank);
}

const targets = [
  ...(existsSync("README.md") ? ["README.md"] : []),
  ...(existsSync("docs") ? files("docs") : []),
];

let problems = 0;
for (const file of targets) {
  strip(readFileSync(file, "utf8")).split("\n").forEach((line, i) => {
    for (const [re, why] of RULES) {
      const m = re.exec(line);
      if (m) {
        problems++;
        console.log(`${file}:${i + 1}:${m.index + 1}  ${why}: "${m[0].trim()}"`);
      }
    }
  });
}

console.log(problems ? `\n${problems} prose problem(s) in ${targets.length} files` : `prose ok (${targets.length} files)`);
process.exit(problems ? 1 : 0);
