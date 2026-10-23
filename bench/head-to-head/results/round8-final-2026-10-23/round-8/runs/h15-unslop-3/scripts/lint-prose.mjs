// Flags stock AI phrasing in README.md and docs/**/*.md.
// Code blocks, inline code, blockquotes and quoted text are skipped,
// so a page may quote a bad phrase while discussing it.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const RULES = [
  // chat artifacts and stock phrases (English)
  { re: /let me know if you have any questions/i, msg: "chatbot closer" },
  { re: /i hope this (helps|finds you well)/i, msg: "chatbot closer" },
  { re: /in today['’]s (fast-paced|digital|ever-changing) (world|age|landscape)/i, msg: "wide-angle opener" },
  { re: /\ba testament to\b/i, msg: "significance inflation" },
  { re: /\b(delve|delves|delved|delving) (into|deeper)\b/i, msg: "AI vocabulary: delve" },
  { re: /\b(rich )?tapestry of\b/i, msg: "AI vocabulary: tapestry" },
  { re: /\bseamless(ly)?\b/i, msg: "AI vocabulary: seamless" },
  { re: /\bthe future of [\w ]+ looks bright\b/i, msg: "generic closer" },
  { re: /\bit['’]s not (just )?[^.]{1,60}, it['’]s\b/i, msg: "negative parallelism" },
  { re: /—/, msg: "em dash in English prose", langs: ["en"] },
  // German
  { re: /ich hoffe, (das|dies) hilft/i, msg: "chatbot closer", langs: ["de"] },
  { re: /in der heutigen (schnelllebigen|digitalen) welt/i, msg: "wide-angle opener", langs: ["de"] },
  { re: /lass(en)? uns (eintauchen|in .{1,30} eintauchen)|tauchen wir ein/i, msg: "AI stock phrase", langs: ["de"] },
  // French
  { re: /j['’]esp[èe]re que (cela|ça) (vous )?aide/i, msg: "chatbot closer", langs: ["fr"] },
  { re: /dans le monde (effréné|numérique) d['’]aujourd['’]hui/i, msg: "wide-angle opener", langs: ["fr"] },
];

function walk(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(join(dir, e.name)) : e.name.endsWith(".md") ? [join(dir, e.name)] : []);
}

const lang = (f) => (/^docs\/de\//.test(f) ? "de" : /^docs\/fr\//.test(f) ? "fr" : "en");

// Blank out skipped regions but keep line structure.
function strip(text) {
  const blank = (s) => s.replace(/[^\n]/g, " ");
  return text
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1[^\n]*$/gm, blank)
    .replace(/^>.*$/gm, blank)
    .replace(/`[^`\n]*`/g, blank)
    .replace(/"[^"\n]*"|“[^”\n]*”|„[^“”\n]*[“”]|«[^»\n]*»/g, blank);
}

const files = ["README.md", ...walk("docs")];
let failures = 0;
for (const f of files) {
  const lines = strip(readFileSync(f, "utf8")).split("\n");
  const l = lang(f);
  lines.forEach((line, i) => {
    for (const r of RULES) {
      if (r.langs && !r.langs.includes(l)) continue;
      if (!r.langs && l !== "en" && !/[a-z]/i.test(line)) continue;
      const m = line.match(r.re);
      if (m) {
        console.error(`${f}:${i + 1}: ${r.msg}: "${m[0]}"`);
        failures++;
      }
    }
  });
}
if (failures) {
  console.error(`\n${failures} prose problem(s) found.`);
  process.exit(1);
}
console.log(`prose ok (${files.length} files)`);
