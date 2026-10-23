import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanHedge, EFFECT_VERBS } from "../dist/src/hedge.js";
import { prepare } from "../dist/src/doc.js";
import { detectLanguage } from "../dist/src/lang.js";

const CLI = "dist/src/cli.js";
const hedge = (lang, text) => scanHedge(prepare("a.md", text), lang).map((h) => h.phrase);
const hits = (lang, text) => hedge(lang, text).length;

// Every sentence below was written for this file. None comes from a benchmark task.
// Class 3a: a conditional or subjunctive-II marker next to an effect predicate.
// Class 3b: a conditional ending on an effect verb (Romance languages).
// Class 3c: an appearance verb next to an effect predicate.
const CASES = {
  en: {
    a: { pos: ["The new index could shorten report generation.", "The patch might lower memory pressure on small hosts."], neg: ["The new index can shorten report generation.", "She could hardly see the screen.", "Could you lower the log level?"] },
    c: { pos: ["The retry loop appears to speed up startup.", "The new queue seems to ease the pressure on the database."], neg: ["The retry loop appears to be broken.", "The release seemed late to everyone."] },
    connector: ["The change could reduce load times because the cache is warm.", "The patch might lower memory use if the pool is small."],
    unit: ["The change could cut build time by 30%.", "The new index might speed up queries by 200 ms."],
  },
  es: {
    a: { pos: ["El parche podría aliviar la carga de la base de datos.", "El nuevo índice podría acelerar los informes."], neg: ["El parche puede acelerar los informes.", "Ella podría venir a la reunión.", "Podría llover mañana en la oficina."] },
    b: { pos: ["El nuevo índice aceleraría los informes.", "El parche aliviaría la carga de la base."], neg: ["El parche acelera los informes.", "Ella llegaría tarde a la reunión."] },
    c: { pos: ["El cambio parece facilitar el despliegue.", "La caché parece acelerar el arranque."], neg: ["El cambio parece correcto.", "El servidor parece estar apagado."] },
    connector: ["El parche podría aliviar la carga porque la caché está caliente.", "El nuevo índice aceleraría los informes si la tabla es grande."],
    unit: ["El parche podría acortar el arranque en 300 ms.", "La caché aceleraría las consultas un 20 %."],
  },
  pt: {
    a: { pos: ["O novo índice poderia acelerar a geração de relatórios.", "A revisão poderia facilitar a leitura do código."], neg: ["O novo índice pode acelerar a geração de relatórios.", "Ela poderia chegar mais cedo.", "Poderia chover amanhã no escritório."] },
    b: { pos: ["O novo índice aceleraria os relatórios.", "O ajuste aliviaria a carga do banco."], neg: ["O novo índice acelera os relatórios.", "Ela chegaria mais cedo."] },
    c: { pos: ["A mudança parece facilitar a implantação.", "O cache parece acelerar a inicialização."], neg: ["A mudança parece correta.", "O servidor parece estar desligado."] },
    connector: ["O ajuste poderia aliviar a carga porque o cache está quente.", "O novo índice aceleraria os relatórios quando a tabela for grande.", "O novo índice poderia acelerar os relatórios se a tabela for grande."],
    unit: ["O ajuste poderia encurtar a inicialização em 300 ms.", "O cache aceleraria as consultas em 20%."],
  },
  de: {
    a: { pos: ["Der neue Index könnte die Berichte beschleunigen.", "Die Änderung dürfte die Ladezeit verkürzen."], neg: ["Der neue Index kann die Berichte beschleunigen.", "Sie könnte morgen kommen.", "Es würde regnen."] },
    c: { pos: ["Der Cache scheint den Start zu beschleunigen.", "Die Änderung scheint die Wartung zu erleichtern."], neg: ["Der Cache scheint kaputt zu sein.", "Die Sonne scheint heute."] },
    connector: ["Der neue Index könnte die Berichte beschleunigen, weil die Tabelle groß ist.", "Die Änderung dürfte die Ladezeit verkürzen, wenn der Cache warm ist."],
    unit: ["Der Index könnte die Startzeit um 300 ms verkürzen.", "Die Änderung würde den Speicher um 20 % senken."],
  },
  fr: {
    a: { pos: ["Le nouvel index pourrait accélérer les rapports.", "Le correctif pourrait alléger la charge de la base."], neg: ["Le nouvel index peut accélérer les rapports.", "Elle pourrait venir demain.", "Il pourrait pleuvoir."] },
    b: { pos: ["Le nouvel index accélérerait les rapports.", "Le correctif allégerait la charge."], neg: ["Le nouvel index accélère les rapports.", "Elle viendrait demain."] },
    c: { pos: ["Le cache semble accélérer le démarrage.", "Le changement semble faciliter le déploiement."], neg: ["Le changement semble correct.", "Le serveur semble éteint."] },
    connector: ["Le correctif pourrait alléger la charge parce que le cache est chaud.", "Le nouvel index accélérerait les rapports si la table est grande."],
    unit: ["Le correctif pourrait raccourcir le démarrage de 300 ms.", "Le cache accélérerait les requêtes de 20 %."],
  },
  nl: {
    a: { pos: ["De nieuwe index zou de rapporten kunnen versnellen.", "De wijziging zou de laadtijd verkorten."], neg: ["De nieuwe index kan de rapporten versnellen.", "Zij zou morgen komen.", "Het zou kunnen regenen."] },
    c: { pos: ["De cache lijkt het opstarten te versnellen.", "De wijziging lijkt het onderhoud te vergemakkelijken."], neg: ["De wijziging lijkt correct.", "De server lijkt uitgeschakeld."] },
    connector: ["De nieuwe index zou de rapporten kunnen versnellen omdat de tabel groot is.", "De wijziging zou de laadtijd verkorten als de cache warm is."],
    unit: ["De index zou de opstarttijd met 300 ms verkorten.", "De wijziging zou het geheugen met 20 % verlagen."],
  },
};

for (const [lang, c] of Object.entries(CASES)) {
  for (const klass of ["a", "b", "c"]) {
    if (!c[klass]) continue;
    test(`hedge class 3${klass} (${lang}): positive sentences hit, negative sentences stay silent`, () => {
      assert.ok(c[klass].pos.length >= 2 && c[klass].neg.length >= 2);
      for (const s of c[klass].pos) assert.equal(hits(lang, s), 1, `${lang}: expected one hit in: ${s}`);
      for (const s of c[klass].neg) assert.deepEqual(hedge(lang, s), [], `${lang}: expected none in: ${s}`);
    });
  }
  test(`hedge class 3 (${lang}): a condition or cause connector, or a number with a unit, in the sentence suppresses the hit`, () => {
    assert.ok(c.connector.length >= 2 && c.unit.length >= 2);
    for (const s of [...c.connector, ...c.unit]) assert.deepEqual(hedge(lang, s), [], `${lang}: expected none in: ${s}`);
  });
}

test("hedge class 3: a connector in the next sentence does not suppress; the hit is reported at the marker", () => {
  const phrases = hedge("en", "The new index could shorten report generation. It stays cold because nobody warms it.");
  assert.equal(phrases.length, 1);
  assert.match(phrases[0], /^could shorten/);
});

test("hedge class 3: the same exemptions as classes 1 and 2 (code, quotes, dialogue, slop-ignore) apply", () => {
  assert.deepEqual(hedge("en", 'He said "the index could shorten report generation" in the call.'), []);
  assert.deepEqual(hedge("en", "```\nThe index could shorten report generation.\n```\n"), []);
  assert.deepEqual(hedge("en", "<!-- slop-ignore hedge -->\nThe index could shorten report generation.\n"), []);
  assert.deepEqual(hedge("fr", "— Le correctif pourrait alléger la charge.\n"), []);
});

test("hedge class 3: class 1 and class 2 hits are not reported twice", () => {
  assert.deepEqual(hedge("en", "The index could potentially shorten report generation."), ["could potentially"]);
  assert.deepEqual(hedge("en", "The spike seems to be related to the new cache."), ["seems to be related to"]);
});

test("hedge class 3: the grammar lists are 12 effect stems or more per language and carry a header note", () => {
  const src = readFileSync("src/hedge.ts", "utf8");
  assert.match(src, /function words and verb stems of grammatical classes/);
  assert.match(src, /no independent catalog source/);
  assert.doesNotMatch(src, /podría reducir|parece estar relacionada/);
  for (const lang of Object.keys(CASES)) assert.ok(EFFECT_VERBS[lang].length >= 12, `${lang}: ${EFFECT_VERBS[lang].length} effect verbs`);
});

// The clean corpus: the goldens, the after folders and the fixtures that are byte-identical to their golden
// (a fixture that differs from its golden carries tells on purpose). No held-out or task path.
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const allowed = (p) => !/\/ho|heldout|tasks\/ho/.test(`/${p}`) && /\.(?:md|txt)$/.test(p);
const GOLDEN = "bench/head-to-head/golden";
const FIXTURES = "bench/head-to-head/fixtures";
const CORPUS = [
  ...walk(GOLDEN),
  // Clean prose written for this test in es, pt, nl and fr, because the benchmark folders hold none in es, pt or nl.
  "test/fixtures/clean-es.md", "test/fixtures/clean-pt.md", "test/fixtures/clean-nl.md", "test/fixtures/clean-fr.md",
  ...walk("bench/head-to-head/after"),
  ...walk(FIXTURES).filter((f) => {
    try { return readFileSync(f, "utf8") === readFileSync(f.replace(FIXTURES, GOLDEN), "utf8"); } catch { return false; }
  }),
].filter(allowed);

const sentencesOf = (text) => text.replace(/```[\s\S]*?```/g, " ").split(/(?<=[.!?])\s+|\n\s*\n/).filter((s) => s.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length >= 3);

test("hedge class 3: zero hits on the repository's clean prose, with the corpus size per language", () => {
  assert.ok(CORPUS.length >= 15, `only ${CORPUS.length} corpus files`);
  const size = {};
  for (const file of CORPUS) {
    const text = readFileSync(file, "utf8");
    const doc = prepare(file, text);
    let tag = (detectLanguage(text).tag ?? "und").split("-")[0];
    if (file.startsWith("test/fixtures/clean-")) tag = file.slice(-5, -3);
    size[tag] = (size[tag] ?? 0) + sentencesOf(text).length;
    for (const lang of Object.keys(CASES)) assert.deepEqual(scanHedge(doc, lang).map((h) => `${h.line} ${h.phrase}`), [], `${file} (${lang})`);
  }
  console.log(`class 3 corpus: ${CORPUS.length} files, sentences per detected language ${JSON.stringify(size)}, class 3 hits 0`);
  assert.ok((size.en ?? 0) >= 50, "an English corpus of at least 50 sentences");
});

// E3: the rebuild hint.
function verify(before, after) {
  const dir = mkdtempSync(join(tmpdir(), "slop-r7-"));
  try {
    writeFileSync(join(dir, "before.md"), before);
    writeFileSync(join(dir, "after.md"), after);
    const r = spawnSync(process.execPath, [CLI, "--verify", join(dir, "before.md"), join(dir, "after.md")], { encoding: "utf8" });
    return { status: r.status, out: r.stdout };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const LONG_WITH_FINDING =
  "The migration, which we ran on Monday, touched the orders table, the invoices table, the payments table and the audit log, and it could potentially lock writes, but the pool limit stays at 80 and the retry budget stays at 3.\n";
const LONG_CLEAN =
  "The migration, which ran on Monday, touched the orders table, the invoices table, the payments table and the audit log, and it locks writes for a short time, but the pool limit stays at 80 and the retry budget stays at 3.\n";

test("rebuild hint: a long chained sentence that holds a finding prints rebuild and does not change the exit code", () => {
  const withHint = verify(LONG_WITH_FINDING, LONG_WITH_FINDING);
  assert.match(withHint.out, /^1:\d+ rebuild \d+ words, contains hedge could potentially$/m);
  const fixed = verify(LONG_WITH_FINDING, LONG_WITH_FINDING.replace("could potentially lock", "can lock"));
  assert.match(fixed.out, /rebuild/);
  const plain = verify(LONG_WITH_FINDING, LONG_WITH_FINDING);
  assert.equal(plain.status, withHint.status);
});

test("rebuild hint: clean text and short sentences with a finding never get it", () => {
  const clean = verify(LONG_CLEAN, LONG_CLEAN);
  assert.doesNotMatch(clean.out, /rebuild/);
  assert.equal(clean.status, 0);
  const short = verify("The index could potentially help.\n", "The index could potentially help.\n");
  assert.doesNotMatch(short.out, /rebuild/);
});

// E1, E4, E5, E6: SKILL.md.
const skill = readFileSync("skills/ai-slop-linter/SKILL.md", "utf8");
test("SKILL.md round 7: support test, read-back, clean-text rule and first action are written", () => {
  assert.match(skill, /names a (?:concrete )?reason/i);
  assert.match(skill, /read-back|read back/i);
  assert.match(skill, /byte-identical/);
  assert.match(skill, /reads like an AI wrote it/);
  assert.match(skill, /sounds like ChatGPT/);
  assert.doesNotMatch(skill, /a condition stays conditional/);
  const head = skill.split("\n").slice(0, 12).join("\n");
  assert.match(head, /before (?:you )?read(?:ing)? or edit(?:ing)? anything/i);
});

// Guards found in review: a negation, a reported statement, a habit or a first or second person
// subject is not a hedge on a claim about the product. Sentences written for this file.
const GUARDED = {
  en: ["Nothing seems to help with the flaky test.", "He said the patch could reduce the noise.", "We could cut the review time next sprint."],
  es: ["Nada parece ayudar con la prueba inestable.", "Ella dijo que el parche podría reducir el ruido.", "Antes yo evitaría esa herramienta."],
  pt: ["Nada parece ajudar com o teste instável.", "Ela disse que o ajuste poderia reduzir o ruído.", "Eu ajudaria você com a revisão."],
  de: ["Nichts scheint bei dem instabilen Test zu helfen.", "Er sagte, die Änderung könnte den Lärm senken.", "Wir würden gern bei der Prüfung helfen."],
  fr: ["Rien ne semble aider avec le test instable.", "Il a dit que le correctif pourrait réduire le bruit.", "Tu réduirais ton temps de revue."],
  nl: ["Niets lijkt te helpen bij de wisselvallige test.", "Hij zei dat de wijziging de ruis zou verminderen.", "Wij zouden graag helpen met de review."],
};
for (const [lang, sentences] of Object.entries(GUARDED)) {
  test(`class 3 guard: negation, reported speech and first or second person do not hit (${lang})`, () => {
    for (const s of sentences) assert.equal(hits(lang, s), 0, s);
  });
}
test("class 3 reaches an effect verb late in a German or Dutch clause", () => {
  assert.equal(hits("de", "Das könnte den Arbeitsablauf der gesamten Mannschaft deutlich vereinfachen."), 1);
  assert.equal(hits("nl", "Deze wijziging zou het werk van het hele team kunnen vergemakkelijken."), 1);
});

// A number keeps its unit when the rewrite restates it (round 7, gate iteration 1 diagnosis, general rule).
import { compareFacts } from "../dist/src/compare.js";
const unitLost = (before, after) => compareFacts(before, after).lost.filter((f) => f.kind === "unit").map((f) => f.value);
test("compare: a number that lost its unit is reported, in several languages", () => {
  assert.deepEqual(unitLost("The page loads in 1.2 seconds instead of 4.8 seconds.", "The page loads in 1.2 seconds instead of 4.8."), ["4.8 seconds"]);
  assert.deepEqual(unitLost("Ladezeit: 3 Sekunden statt 9 Sekunden.", "Ladezeit: 3 Sekunden statt 9."), ["9 sekunden"]);
  assert.deepEqual(unitLost("O limite é 80 MB por arquivo.", "O limite é 80 por arquivo."), ["80 mb"]);
  assert.deepEqual(unitLost("Taux d'erreur de 2 % en mars.", "Taux d'erreur de 2 en mars."), ["2 %"]);
});
test("compare: a kept unit, a changed number and an unrelated word are not unit changes", () => {
  assert.deepEqual(unitLost("It takes 5 minutes.", "It takes 5 minutes to finish."), []);
  assert.deepEqual(unitLost("It takes 5 minutes.", "It takes 6 minutes."), []);
  assert.deepEqual(unitLost("Es dauert 5 Minuten.", "Es dauert 5 Minuten."), []);
  assert.deepEqual(unitLost("We fixed 12 bugs.", "We fixed 12 defects."), []);
});
