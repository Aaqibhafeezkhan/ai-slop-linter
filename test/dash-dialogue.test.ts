import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";
import { lintText } from "../src/index.js";
import type { Finding } from "../src/index.js";
import { detectLanguage } from "../src/lang.js";

const root = join(import.meta.dirname, "..", "..");
const dashes = (findings: Finding[]) => findings.filter((f) => f.rule === "dash");

const ENGLISH_FILE =
  "The release went out on Tuesday with the new parser, and the team spent the week fixing the small problems that users reported. The notes below describe what changed and what the next steps are for the group.";

test("P1: a line that starts with inline code and then a spaced hyphen is a dash finding", () => {
  // Inline code is masked to spaces, so the masked line looks like it opens with a dash.
  const text = `${ENGLISH_FILE}\n\n\`readdirp(root)\` - returns a stream of every entry under the root directory.\n`;
  const found = dashes(lintText("api.md", text).findings);
  assert.equal(found.length, 1, JSON.stringify(found));
  assert.equal(found[0]!.line, 3);
});

test("P1: an English one-line paragraph that opens with an em dash keeps every dash finding, with or without --language en", () => {
  const line = "— Our platform is seamless — truly robust — and fast.";
  const text = `${ENGLISH_FILE}\n\n${line}\n`;
  for (const options of [{}, { language: "en" }]) {
    const found = dashes(lintText("pitch.md", text, options).findings).filter((f) => f.line === 3);
    assert.equal(found.length, 3, `${JSON.stringify(options)}: ${JSON.stringify(found)}`);
  }
});

test("P1: a Spanish raya line, an inner raya attribution and a French dialogue line stay exempt under any language tag", () => {
  const lines = [
    "— ¿Cuánto tarda el envío? —pregunta Lucía.",
    "—Hola —dijo Ana—, pero el tren ya llegó.",
    "— Unos cuatro días —responde Mateo—, pero depende del puerto.",
    "— Nous avons une commande pour vous, mais elle n'est pas encore arrivée dans le magasin.",
  ];
  for (const line of lines) {
    for (const options of [{}, { language: "en" }]) {
      const text = `${ENGLISH_FILE}\n\n${line}\n`;
      const found = dashes(lintText("d.md", text, options).findings).filter((f) => f.line === 3);
      assert.equal(found.length, 0, `${line} ${JSON.stringify(options)}`);
    }
  }
});

test("P1: a line that opens with inline code and then a dash glued to a word is judged on its raw text", () => {
  // Masked, the line looks like it opens with a dash glued to a letter, which is the Spanish raya.
  const text = `${ENGLISH_FILE}\n\n\`readdirp(root)\` \u2014returns a stream of every entry under the root directory.\n`;
  assert.equal(dashes(lintText("api.md", text).findings).filter((f) => f.line === 3).length, 1);
});

test("P1: a dialogue line in a script with no function-word list is not read as English", () => {
  const text = `${ENGLISH_FILE}\n\n— Привет, как у тебя дела сегодня — спросил он.\n`;
  assert.equal(dashes(lintText("ru.md", text).findings).filter((f) => f.line === 3).length, 0);
});

test("P1: short dialogue lines in Polish and Turkish stay exempt, and a short English line with an English function word does not", () => {
  for (const line of ["\u2014 Skąd pan to wie?", "\u2014 Nie prosiłem o to.", "\u2014 Hadi yap! derdi."]) {
    const text = `${ENGLISH_FILE}\n\n${line}\n`;
    assert.equal(dashes(lintText("pl.md", text).findings).filter((f) => f.line === 3).length, 0, line);
  }
  const english = `${ENGLISH_FILE}\n\n\u2014 It is fast.\n`;
  assert.equal(dashes(lintText("en.md", english).findings).filter((f) => f.line === 3).length, 1);
});

test("P2: a short English paragraph is not called foreign on one repeated word", () => {
  const over = "Hover over buttons, ship builds, deploy fixes, restart workers, rotate keys daily, patch images, over";
  const plus = "Ship builds daily, restart workers plus rotate keys, deploy fixes, patch images, tag plus releases";
  // The old paragraph rule: two hits of one word were enough.
  assert.equal(detectLanguage(over, 12).tag, "nl", "the premise: the old call is wrong");
  assert.equal(detectLanguage(plus, 12).tag, "fr", "the premise: the old call is wrong");
  for (const p of [over, plus]) {
    assert.equal(detectLanguage(p, { minTokens: 12, minDistinct: 3, minHits: 3 }).tag, null, p);
    const text = `${ENGLISH_FILE}\n\n${p} — and done.\n`;
    assert.equal(dashes(lintText("p.md", text).findings).filter((f) => f.line === 3).length, 1, p);
  }
});

test("P2: three hits of a single foreign word do not make a paragraph foreign", () => {
  const over = "Hover over buttons, tap over icons, drag over lists, ship builds daily, restart workers and rotate over keys";
  assert.equal(detectLanguage(over, 12).tag, "nl", "the premise: three hits of one word cleared the old threshold");
  assert.equal(detectLanguage(over, { minTokens: 12, minDistinct: 3, minHits: 3 }).tag, null);
});

test("P2: a real French paragraph still clears the paragraph threshold", () => {
  const fr = "La directrice a déclaré que les résultats sont dans le rapport, et nous pensons que le service est très bon pour les clients.";
  assert.equal(detectLanguage(fr, { minTokens: 12, minDistinct: 3, minHits: 3 }).tag, "fr");
});

test("P2: file-level detection is unchanged by the paragraph options", () => {
  const fr = "La directrice a déclaré que les résultats sont dans le rapport, et nous pensons que le service est très bon pour les clients de la région.";
  assert.equal(detectLanguage(fr).tag, "fr");
  assert.equal(detectLanguage(fr, 25).tag, detectLanguage(fr).tag);
});

// Regression: on the committed English corpora and the repository's own Markdown, the dash
// findings are the ones recorded before the dialogue and paragraph-language changes.
// test/fixtures/dash-english-golden.json holds file -> content hash + dash positions. A file
// whose content changed since is skipped (its recorded positions no longer apply); the
// bench/corpus files are immutable and must all be checked.
// The one recorded difference, caused on purpose by P2. This French corpus file is detected as
// English at file level (most of it is code), and its one-line French sentence has only the
// function words "le" and "des" of French that count ("de" is shared with other languages), so
// it no longer reaches three distinct words and its en dash is reported. Anything else that
// differs is a regression.
// Removed on purpose by looksForeign (Task 20 review): correct Arabic, Hebrew, Korean, Turkish,
// Hungarian, Polish and Russian prose has no word list, no English function word and a non-ASCII
// letter, so its dashes are that language's punctuation. Only removals, never an addition.
const DELIBERATE_REMOVALS: Record<string, string[]> = {
  "bench/scripts/ar.md": ["3:36"],
  "bench/scripts/he.md": ["3:33"],
  "bench/scripts/ko.md": ["3:22"],
  "bench/scripts/tr.md": ["3:44"],
  "bench/typography/hu-jokai-uj-foldesur.md": ["57:2"],
  "bench/typography/pl-doyle-baskerville.md": ["63:1", "73:1", "85:1", "89:1", "129:1", "143:1", "143:49"],
  "bench/typography/ru-chekhov-dama-s-sobachkoy.md": ["23:92", "23:808", "25:304", "27:37", "47:318", "47:345", "49:281"],
};

const DELIBERATE_ADDITIONS: Record<string, string[]> = { "bench/packs/human/fr/py-docs-pathlib.md": ["17:28"] };

test("dash findings on English files are identical to the recorded base behaviour", () => {
  const golden = JSON.parse(readFileSync(join(root, "test", "fixtures", "dash-english-golden.json"), "utf8")) as Record<string, { sha1: string; dash: string[] }>;
  let checked = 0;
  let corpus = 0;
  for (const [file, expected] of Object.entries(golden)) {
    const text = readFileSync(join(root, file), "utf8");
    if (createHash("sha1").update(text).digest("hex") !== expected.sha1) {
      assert.ok(!file.startsWith("bench/corpus/"), `${file} is a frozen corpus file and changed`);
      continue;
    }
    const got = dashes(lintText(file, text).findings).map((f) => `${f.line}:${f.column}`);
    const order = (a: string, b: string): number => Number(a.split(":")[0]) - Number(b.split(":")[0]) || Number(a.split(":")[1]) - Number(b.split(":")[1]);
    const removed = new Set(DELIBERATE_REMOVALS[file] ?? []);
    assert.deepEqual(got, [...expected.dash.filter((p) => !removed.has(p)), ...(DELIBERATE_ADDITIONS[file] ?? [])].sort(order), file);
    checked++;
    if (file.startsWith("bench/corpus/")) corpus++;
  }
  assert.ok(corpus >= 10, `only ${corpus} corpus files checked`);
  assert.ok(checked >= 50, `only ${checked} files checked`);
});
