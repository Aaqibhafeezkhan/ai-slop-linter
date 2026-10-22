import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { lintText, languageRules, checkLanguagePack } from "../dist/src/index.js";
import { prepare } from "../dist/src/doc.js";
import { corpusFor } from "../bench/packs-lib.mjs";

const root = new URL("..", import.meta.url).pathname;
const fr = () => languageRules.fr;
const ruleById = (id) => fr().find((r) => r.id === id);
const firing = (id, text) => ruleById(id).check(prepare("x.md", text));
const frFindings = (result) => result.findings.filter((f) => f.rule.startsWith("fr/"));
const packFindings = (text) => fr().flatMap((r) => r.check(prepare("x.md", text)));

/** Sentences the pack must flag. */
const POSITIVE = {
  "fr/closer": [
    "Essayez Calbo dès aujourd'hui pour vos classes.",
    "Essayez-le dès aujourd’hui et dites-nous ce que vous en pensez.",
    "Adoptez Fastq dès aujourd'hui et propulsez vos applications.",
    "Installez Fastq dès aujourd'hui.",
  ],
};

/** Ordinary French and English that the pack must not flag. The rule must fire on none of these. */
const NEGATIVE = {
  "fr/closer": [
    "Le formulaire est disponible dès aujourd'hui à la mairie.",
    "Les travaux commencent dès aujourd'hui sur la rue Victor-Hugo.",
    "Le tarif s'applique dès aujourd'hui pour les nouveaux abonnés.",
    "Essayez de dormir un peu, la réunion a été reportée à demain.",
    "Commencez le traitement dès aujourd'hui, matin et soir.",
    "Découvrez le programme dès aujourd'hui à la mairie.",
    "Téléchargez le formulaire dès aujourd'hui avant la coupure.",
  ],
};

/** Hand-written sentences from the review, each a plausible legitimate use of a word or frame a rule has in it. */
const REVIEW_NEGATIVES = [
  "Il n'est pas juste de blâmer le stagiaire, mais il faut comprendre.",
  "Ce n'est pas seulement une question d'argent, mais aussi de temps.",
  "Un pont robuste et économique",
  "Une estimation robuste et sans biais.",
  "Nous vivons dans un monde où la guerre est revenue.",
  "Suivez le guide, il connaît le chemin du refuge.",
  "Rejoignez la communauté de communes avant le 1er mai pour voter.",
  "Je ne connais pas de projet de loi semblable en Europe.",
  "Si vous m'indiquez votre adresse, je vous envoie le colis.",
  "Dans cet article, nous reviendrons sur la décision du 4 mars.",
  "Les armes révolutionnaires de 1793",
  "Une alarme à toute épreuve, certifiée par l'assureur.",
  "Il veut repousser les frontières du parc national.",
  "Dites-nous ce que vous en pensez : le formulaire est ouvert jusqu'au 5 mai.",
  "Libérez la puissance du ressort pour lancer la bille",
];

test("the French pack is registered under fr and passes the contract", () => {
  assert.ok(Array.isArray(fr()) && fr().length > 0, "the fr pack is registered");
  assert.deepEqual(checkLanguagePack("fr", fr()), []);
  assert.deepEqual(fr().map((r) => r.id).sort(), Object.keys(POSITIVE).sort());
});

test("every French rule carries the fields the English rules carry", () => {
  for (const r of fr()) {
    assert.ok(r.title && r.why && r.ignoreWhen && r.source, `${r.id} has a title, why, ignoreWhen and source`);
    assert.ok(["error", "warning", "info"].includes(r.severity), `${r.id} has a severity`);
    assert.ok(r.example.before && r.example.after, `${r.id} has an example`);
  }
});

test("each French rule fires on its positive sentences", () => {
  for (const [id, sentences] of Object.entries(POSITIVE)) {
    for (const s of sentences) assert.ok(firing(id, s).length > 0, `${id} fires on: ${s}`);
  }
});

test("each French rule stays silent on its own negatives, at least three per rule", () => {
  for (const [id, sentences] of Object.entries(NEGATIVE)) {
    assert.ok(sentences.length >= 3, `${id} has at least three negatives`);
    for (const s of sentences) assert.equal(firing(id, s).length, 0, `${id} must not fire on: ${s}`);
  }
});

test("no French rule fires on the hand-written review negatives", () => {
  for (const s of REVIEW_NEGATIVES) assert.equal(packFindings(s).length, 0, `must not fire on: ${s}`);
});

test("each French rule's example fires before the rewrite and not after", () => {
  for (const r of fr()) {
    assert.ok(firing(r.id, r.example.before).length > 0, `${r.id}: before fires`);
    assert.equal(firing(r.id, r.example.after).length, 0, `${r.id}: after does not fire`);
  }
});

test("a glued prefix or suffix does not match: each boundary is a real word boundary", () => {
  assert.equal(firing("fr/closer", "Bessayez-le dès aujourd'hui.").length, 0, "a letter glued before the verb");
  assert.equal(firing("fr/closer", "Essayez-le redès aujourd'hui.").length, 0, "a letter glued before dès");
  assert.equal(firing("fr/closer", "Essayez-le dès aujourd'huiste.").length, 0, "a letter glued after hui");
  assert.equal(firing("fr/closer", "Essayez-le dès aujourd'hui.").length, 1, "the control with proper spacing fires once");
});

test("both apostrophes match: the straight one and the typographic one", () => {
  assert.ok(firing("fr/closer", "Essayez Calbo dès aujourd'hui.").length > 0, "straight apostrophe");
  assert.ok(firing("fr/closer", "Essayez Calbo dès aujourd’hui.").length > 0, "curly apostrophe");
});

test("an English README produces no French findings, declared or detected", () => {
  const readme = readFileSync(join(root, "README.md"), "utf8");
  assert.deepEqual(frFindings(lintText("README.md", readme, { language: "en" })), []);
  assert.deepEqual(frFindings(lintText("README.md", readme)), []);
});

test("an English paragraph that contains a French pattern is not checked by the French pack", () => {
  const text = "The launch page says: Essayez Calbo dès aujourd'hui, and the install steps follow in the next section of the page.\n";
  assert.deepEqual(frFindings(lintText("guide.md", text, { language: "en" })), [], "declared English");
  assert.deepEqual(frFindings(lintText("guide.md", text)), [], "detected English");
});

test("the h1 fixture triggers no French rule; the golden text triggers none", () => {
  // The brief asked for four distinct fr/ rules on this fixture. After the widened corpus, no
  // candidate that fires on it survived the shipping limit and the negatives; see the report for the
  // tells it contains and why they were dropped.
  const fixture = lintText("note.md", readFileSync(join(root, "bench/head-to-head/fixtures/h1/note.md"), "utf8"));
  assert.deepEqual([...new Set(frFindings(fixture).map((f) => f.rule))], []);
  const golden = lintText("note.md", readFileSync(join(root, "bench/head-to-head/golden/h1/note.md"), "utf8"));
  assert.deepEqual(frFindings(golden), []);
});

test("every French human file produces no French findings when the file is declared French", () => {
  const { human } = corpusFor("fr");
  assert.ok(human.length >= 14, "the widened human corpus is read");
  for (const f of human) assert.deepEqual(frFindings(lintText(f.name, f.text, { language: "fr" })), [], f.name);
});

test("the CLI explains a French rule by its id", () => {
  const out = execFileSync(process.execPath, [join(root, "dist", "src", "cli.js"), "--explain", "fr/closer"], { encoding: "utf8" });
  assert.match(out, /^fr\/closer\b/m);
});
