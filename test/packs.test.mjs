import { test } from "node:test";
import assert from "node:assert/strict";
import { lintText, languageRules, checkLanguagePack } from "../dist/src/index.js";
import { scan } from "../dist/src/doc.js";
import { corpusFor, shippingProblems, wordsIn, MIN_HUMAN_WORDS, MIN_MACHINE_WORDS } from "../bench/packs-lib.mjs";

/** A stand-in rule. It exists only inside these tests and is never committed. */
const standIn = (id, pattern) => ({
  id,
  title: "Stand-in rule",
  severity: "warning",
  source: "test stand-in",
  why: "test",
  example: { before: "x", after: "y" },
  ignoreWhen: "never",
  check: (doc) => scan(doc, { id, severity: "warning" }, pattern, () => id),
});
const frenchLe = standIn("fr/le-word", /\ble\b/gi);
const germanDer = standIn("de/der-word", /\bder\b/gi);

/** Runs `body` with the given packs registered, and restores whatever was registered before. */
function withPacks(packs, body) {
  const previous = Object.fromEntries(Object.keys(packs).map((k) => [k, languageRules[k]]));
  Object.assign(languageRules, packs);
  try {
    body();
  } finally {
    for (const [k, v] of Object.entries(previous)) {
      if (v === undefined) delete languageRules[k];
      else languageRules[k] = v;
    }
  }
}

/** Filler words that match none of the stand-in patterns, so synthetic corpora carry no hits. */
const filler = (n) => Array.from({ length: n }, () => "mot").join(" ");

const FRENCH = "Le chat est sur la table et le chien dort dans la maison avec les enfants, mais nous ne savons pas pourquoi il ne bouge pas du tout.";
const GERMAN = "Der Hund schläft im Haus und die Katze spielt mit dem Ball, aber wir wissen nicht warum er nicht aufsteht, denn es ist sehr spät.";
const ENGLISH = "The cat sits on the table and the dog sleeps in the house with the children, but we do not know why it does not move at all.";

test("a pack runs on the whole file when the file is declared in that language", () => {
  withPacks({ fr: [frenchLe] }, () => {
    const r = lintText("a.md", `${FRENCH}\n`, { language: "fr" });
    assert.ok(r.findings.some((f) => f.rule === "fr/le-word"));
  });
});

test("a pack switches on for a file detected as that language, without a declaration", () => {
  withPacks({ fr: [frenchLe] }, () => {
    const r = lintText("a.md", `${FRENCH} ${FRENCH} ${FRENCH}\n`);
    assert.equal(r.languageSource, "detected");
    assert.equal(r.language, "fr");
    assert.ok(r.findings.some((f) => f.rule === "fr/le-word"));
  });
});

test("a regional declared tag finds the pack of its primary subtag", () => {
  withPacks({ fr: [frenchLe] }, () => {
    const r = lintText("a.md", `${FRENCH}\n`, { language: "fr-CA" });
    assert.equal(r.language, "fr-CA");
    assert.ok(r.findings.some((f) => f.rule === "fr/le-word"));
  });
});

test("a regional tag in front matter finds the pack of its primary subtag", () => {
  withPacks({ fr: [frenchLe] }, () => {
    const r = lintText("a.md", `---\nlang: fr-CA\n---\n\n${FRENCH}\n`);
    assert.equal(r.languageSource, "front-matter");
    assert.ok(r.findings.some((f) => f.rule === "fr/le-word"));
  });
});

test("an English file never runs a French pack on its own prose", () => {
  withPacks({ fr: [frenchLe] }, () => {
    const r = lintText("a.md", `${ENGLISH} The le word appears here.\n`);
    assert.equal(r.language, "en");
    assert.ok(!r.findings.some((f) => f.rule === "fr/le-word"));
  });
});

test("an English file runs a French pack on a French paragraph inside it, and on nothing else", () => {
  withPacks({ fr: [frenchLe] }, () => {
    // The English paragraphs carry the same word the pack matches, so a pack that leaks into them shows.
    const english = `${ENGLISH} The le word is here.`;
    const r = lintText("a.md", `${english}\n\n${FRENCH}\n\n${english}\n`);
    const hits = r.findings.filter((f) => f.rule === "fr/le-word");
    assert.ok(hits.length > 0, "the French paragraph is checked");
    assert.ok(hits.every((f) => f.line === 3), `only the French paragraph is checked, got lines ${hits.map((f) => f.line)}`);
  });
});

test("a German paragraph inside a French file switches to the German pack, and only there", () => {
  withPacks({ fr: [frenchLe], de: [germanDer] }, () => {
    const r = lintText("a.md", `${FRENCH} ${FRENCH} ${FRENCH}\n\n${GERMAN}\n\n${FRENCH} ${FRENCH}\n`);
    assert.equal(r.language, "fr", "the file itself is French");
    const hits = r.findings.filter((f) => f.rule === "de/der-word");
    assert.ok(hits.length > 0, "the German paragraph is checked with the German pack");
    assert.ok(hits.every((f) => f.line === 3), `only the German paragraph, got lines ${hits.map((f) => f.line)}`);
  });
});

test("a paragraph under 12 words never switches a pack, and one of 12 or more does", () => {
  withPacks({ fr: [frenchLe] }, () => {
    const short = lintText("a.md", `${ENGLISH}\n\nLe chat est sur la table.\n`);
    assert.ok(!short.findings.some((f) => f.rule === "fr/le-word"), "five words stay unswitched");
    // Positive control: the same kind of sentence, long enough to be judged, does switch.
    const long = lintText("a.md", `${ENGLISH}\n\nLe chat est sur la table et le chien dort dans la maison.\n`);
    assert.ok(long.findings.some((f) => f.rule === "fr/le-word"), "fourteen words switch");
  });
});

test("a declared English tag takes the file as English and does not switch paragraphs", () => {
  withPacks({ fr: [frenchLe] }, () => {
    const r = lintText("a.md", `${ENGLISH}\n\n${FRENCH}\n`, { language: "en" });
    assert.ok(!r.findings.some((f) => f.rule === "fr/le-word"));
  });
});

test("a pack named both by languages and by the file language runs once, not twice", () => {
  withPacks({ fr: [frenchLe] }, () => {
    const text = `${FRENCH}\n`;
    const once = lintText("a.md", text, { language: "fr" }).findings.filter((f) => f.rule === "fr/le-word").length;
    const both = lintText("a.md", text, { language: "fr", languages: ["fr"] }).findings.filter((f) => f.rule === "fr/le-word").length;
    assert.ok(once > 0);
    assert.equal(both, once);
  });
});

test("a declared language with no pack lints as before and does not throw", () => {
  assert.doesNotThrow(() => lintText("a.md", `${FRENCH}\n`, { language: "fr" }));
});

test("an unknown explicit language still throws", () => {
  assert.throws(() => lintText("a.md", `${FRENCH}\n`, { languages: ["zz"] }), /no rule pack for "zz"/);
});

test("every registered pack passes the contract and the shipping limit on its own corpus", () => {
  for (const [lang, pack] of Object.entries(languageRules)) {
    assert.deepEqual(checkLanguagePack(lang, pack), [], `${lang} pack breaks the contract`);
    assert.deepEqual(shippingProblems(lang, pack, corpusFor(lang)), [], `${lang} pack breaks the shipping limit`);
  }
});

test("the measured corpora for French, Spanish and German carry enough words", () => {
  for (const lang of ["fr", "es", "de"]) {
    const { human, machine } = corpusFor(lang);
    assert.ok(wordsIn(human) >= MIN_HUMAN_WORDS, `${lang} human corpus is large enough`);
    assert.ok(wordsIn(machine) >= MIN_MACHINE_WORDS, `${lang} machine corpus is large enough`);
  }
});

test("a regional tag reads the corpus of its primary subtag", () => {
  assert.deepEqual(corpusFor("fr-CA"), corpusFor("fr"));
});

// Synthetic corpora large enough to clear the size thresholds, so each test isolates one condition.
const HUMAN_OK = [{ name: "h.md", text: `Le projet fonctionne bien. ${filler(MIN_HUMAN_WORDS + 20)}\n` }];
const MACHINE_OK = [{ name: "m.md", text: `Fastq est un projet. ${filler(MIN_MACHINE_WORDS + 20)}\n` }];
const fastq = standIn("fr/fastq", /Fastq/g);

test("the shipping limit rejects a rule that fires on human text", () => {
  const problems = shippingProblems("fr", [frenchLe], { human: [{ name: "h.md", text: `${FRENCH}\n${filler(MIN_HUMAN_WORDS)}\n` }], machine: MACHINE_OK });
  assert.ok(problems.some((p) => p.includes("fr/le-word") && /human/.test(p)), problems.join("; "));
});

test("the shipping limit rejects a rule that never fires on machine text", () => {
  const problems = shippingProblems("fr", [fastq], { human: HUMAN_OK, machine: [{ name: "m.md", text: `Le projet fonctionne. ${filler(MIN_MACHINE_WORDS + 20)}\n` }] });
  assert.ok(problems.some((p) => p.includes("fr/fastq") && /machine/.test(p)), problems.join("; "));
});

test("the shipping limit passes a rule that is silent on human text and fires on machine text", () => {
  assert.deepEqual(shippingProblems("fr", [fastq], { human: HUMAN_OK, machine: MACHINE_OK }), []);
});

test("the shipping limit rejects an empty human corpus", () => {
  const problems = shippingProblems("fr", [fastq], { human: [], machine: MACHINE_OK });
  assert.ok(problems.some((p) => /human corpus has no files/.test(p)), problems.join("; "));
});

test("the shipping limit rejects a whitespace-only human file", () => {
  const problems = shippingProblems("fr", [fastq], { human: [{ name: "blank.md", text: " \n\t\n  " }], machine: MACHINE_OK });
  assert.ok(problems.some((p) => /blank\.md has no words/.test(p)), problems.join("; "));
  assert.ok(problems.some((p) => /human corpus has 0 words/.test(p)), problems.join("; "));
});

test("the shipping limit rejects a human corpus under the word minimum", () => {
  const problems = shippingProblems("fr", [fastq], { human: [{ name: "h.md", text: `Le projet. ${filler(MIN_HUMAN_WORDS - 50)}\n` }], machine: MACHINE_OK });
  assert.ok(problems.some((p) => new RegExp(`human corpus has .* words; it needs at least ${MIN_HUMAN_WORDS}`).test(p)), problems.join("; "));
});

test("the shipping limit rejects a machine corpus under the word minimum", () => {
  const problems = shippingProblems("fr", [fastq], { human: HUMAN_OK, machine: [{ name: "m.md", text: `Fastq. ${filler(MIN_MACHINE_WORDS - 50)}\n` }] });
  assert.ok(problems.some((p) => new RegExp(`machine corpus has .* words; it needs at least ${MIN_MACHINE_WORDS}`).test(p)), problems.join("; "));
});
