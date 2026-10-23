import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCatalog, scanCatalog } from "../dist/src/catalog.js";
import { scanHedge } from "../dist/src/hedge.js";
import { prepare } from "../dist/src/doc.js";
import { detectLanguage } from "../dist/src/lang.js";

const CLI = "dist/src/cli.js";
const REFERENCES = "skills/ai-slop-linter/references";
const catalog = (lang, text) => scanCatalog(prepare("a.md", text), lang).map((h) => h.phrase);
const hedge = (lang, text) => scanHedge(prepare("a.md", text), lang).map((h) => h.phrase);
const skill = readFileSync("skills/ai-slop-linter/SKILL.md", "utf8");

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});

// Every catalog entry and every hedge lexicon stays silent on the text this repository ships as clean:
// the goldens, the clean fixtures and the prose docs. sloppy.md is slop on purpose and stays out.
const CLEAN = [
  ...walk("bench/head-to-head/golden"),
  ...walk("test/fixtures").filter((f) => !f.endsWith("sloppy.md")),
  "README.md", "README.tr.md", "CHANGELOG.md", "CONTRIBUTING.md", "docs/FAQ.md", "docs/LANGUAGES.md", "docs/SCORING.md",
  "skills/ai-slop-linter/SKILL.md",
].filter((f) => /\.(?:md|txt)$/.test(f));

test("round 6: no catalog entry and no hedge check hits any clean or golden text in the repository", () => {
  assert.ok(CLEAN.length > 20, `only ${CLEAN.length} clean files found`);
  for (const file of CLEAN) {
    const doc = prepare(file, readFileSync(file, "utf8"));
    for (const lang of ["en", "de", "fr", "es", "pt"]) {
      assert.deepEqual(scanCatalog(doc, lang).map((h) => `${h.line} ${h.phrase}`), [], `${file} (${lang} catalog)`);
      assert.deepEqual(scanHedge(doc, lang).map((h) => `${h.line} ${h.phrase}`), [], `${file} (${lang} hedge)`);
    }
  }
});

test("round 6: pt.tells.txt exists and every entry compiles", () => {
  const lines = readFileSync(`${REFERENCES}/pt.tells.txt`, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("#"));
  assert.ok(lines.length >= 10);
  assert.equal(loadCatalog("pt").length, lines.length);
  assert.equal(loadCatalog("pt-BR").length, lines.length);
  for (const lang of ["en", "de", "fr", "es"]) {
    const n = readFileSync(`${REFERENCES}/${lang}.tells.txt`, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("#")).length;
    assert.equal(loadCatalog(lang).length, n, `${lang}: an entry did not compile`);
  }
});

test("pt catalog: stock phrases are hits", () => {
  assert.equal(catalog("pt", "É importante notar que o build mudou.").length, 1);
  assert.equal(catalog("pt", "Vale ressaltar o resultado. O parser tem um papel crucial na análise.").length, 2);
  assert.equal(catalog("pt", "A ferramenta é não apenas rápida mas também estável.").length, 1);
  assert.equal(catalog("pt", "Em suma, o projeto cresceu.").length, 1);
  assert.equal(catalog("pt", "Espero que isso ajude.").length, 1);
});

test("pt catalog: honest uses are not hits", () => {
  assert.deepEqual(catalog("pt", "O valor pode variar conforme o plano. Talvez a fila tenda a crescer; o serviço tende a lotar às sextas."), []);
  assert.deepEqual(catalog("pt", "O papel de parede mudou. O marco da fronteira fica ao norte. Ela disse: \"É importante notar\"."), []);
  assert.deepEqual(catalog("pt", "Além disso, o cache guarda 80% das leituras. Em conclusão do contrato, assine aqui."), []);
});

test("en catalog round 6: information-availability hedges, announced lists and sign-offs are hits", () => {
  assert.equal(catalog("en", "While specific details are limited, the firm opened in 1990.").length, 1);
  assert.equal(catalog("en", "Based on available information, the plant closed. Efforts are ongoing to restore the site.").length, 2);
  assert.equal(catalog("en", "Key takeaways\n\nHere are the top seven reasons.").length, 2);
  assert.equal(catalog("en", "Here are several options for you:\n").length, 1);
  assert.equal(catalog("en", "It is important to note that the flag is off. Experts argue otherwise.").length, 2);
  assert.equal(catalog("en", "I hope this message finds you well. Certainly! Would you like me to continue?").length, 3);
});

test("en catalog round 6: honest uses are not hits", () => {
  assert.deepEqual(catalog("en", "Here are the logs from the failed run. Here is the diff."), []);
  assert.deepEqual(catalog("en", "The ongoing effort to restore the site is tracked in #12. The details are in the ticket."), []);
  assert.deepEqual(catalog("en", "Experts at the lab argued for a week. The key was in the lock; take the key."), []);
  assert.deepEqual(catalog("en", "It is important to back up the data first. Of course we can help, she said."), []);
});

test("de catalog round 6: Wikipedia phrases are hits", () => {
  assert.equal(catalog("de", "Obwohl spezifische Details begrenzt sind, startete die Firma 1990.").length, 1);
  assert.equal(catalog("de", "Basierend auf verfügbaren Informationen wurde das Werk geschlossen.").length, 1);
  assert.equal(catalog("de", "Es ist wichtig, zu bedenken, dass das Tool alt ist. Der Cache ist alt.").length, 1);
  assert.equal(catalog("de", "Gut.\nLassen Sie mich wissen, ob es hilft.").length, 1);
});

test("de catalog round 6: honest uses are not hits", () => {
  assert.deepEqual(catalog("de", "Die Details stehen im Ticket. Der Cache hält 80 % der Lesezugriffe."), []);
  assert.deepEqual(catalog("de", "Beobachter haben den Schalter nicht gesehen. Er spielt Klavier. Natürlich, das geht."), []);
  assert.deepEqual(catalog("de", "Hier ist der Pfad zur Datei. Das Erbe der Familie ist klein."), []);
});

test("fr and es catalogs round 6: Wikipedia phrases are hits", () => {
  assert.equal(catalog("fr", "Voici une version complète du texte.").length, 1);
  assert.equal(catalog("fr", "Le plus sûr reste de vérifier les sources.").length, 1);
  assert.equal(catalog("es", "Claro, aquí tienes el texto. Es una excelente opción para equipos.").length, 2);
  assert.equal(catalog("es", "Lo siento, como modelo de lenguaje no puedo ayudar.").length, 1);
});

test("fr and es catalogs round 6: honest uses are not hits", () => {
  assert.deepEqual(catalog("fr", "Voici la liste des fichiers. Le plus sûr est de sauvegarder avant."), []);
  assert.deepEqual(catalog("fr", "Voici un exemple. Il garde le résumé du build."), []);
  assert.deepEqual(catalog("es", "Claro que el servidor falla. La opción excelente del menú es la tercera."), []);
  assert.deepEqual(catalog("es", "El museo ofrece a los visitantes entradas. Lo siento mucho."), []);
});

test("hedge class 1: a modal with a hedge adverb within three words is a hit in every language", () => {
  assert.deepEqual(hedge("en", "The change could potentially improve cold starts."), ["could potentially"]);
  assert.deepEqual(hedge("en", "The cache may, in practice, possibly serve stale rows."), ["may, in practice, possibly"]);
  assert.deepEqual(hedge("en", "It might arguably help."), ["might arguably"]);
  assert.deepEqual(hedge("pt", "A mudança poderia potencialmente reduzir a latência."), ["poderia potencialmente"]);
  assert.deepEqual(hedge("es", "El cambio puede eventualmente mejorar el arranque."), ["puede eventualmente"]);
  assert.deepEqual(hedge("fr", "Le correctif pourrait potentiellement réduire la latence."), ["pourrait potentiellement"]);
  assert.deepEqual(hedge("de", "Das könnte möglicherweise die Latenz senken."), ["könnte möglicherweise"]);
  assert.deepEqual(hedge("de", "Das kann potenziell helfen."), ["kann potenziell"]);
});

test("hedge class 2: an evidential with a vague link in one clause is a hit in every language", () => {
  assert.deepEqual(hedge("en", "The spike seems to be related to the new cache."), ["seems to be related to"]);
  assert.deepEqual(hedge("en", "The outage appears to be linked with the deploy."), ["appears to be linked with"]);
  assert.deepEqual(hedge("pt", "A queda parece estar relacionada ao cache."), ["parece estar relacionada"]);
  assert.deepEqual(hedge("es", "El fallo parece estar vinculado al despliegue."), ["parece estar vinculado"]);
  assert.deepEqual(hedge("fr", "La panne semble être liée au déploiement."), ["semble être liée"]);
  assert.deepEqual(hedge("de", "Der Ausfall scheint mit dem Deployment zusammenzuhängen."), ["scheint mit dem Deployment zusammenzuhängen"]);
});

test("hedge: a modal alone, seems alone, a month and a far or separate adverb are never hits", () => {
  assert.deepEqual(hedge("en", "The change can improve cold starts. It may rain. It seems fine. The spike seems to be the cache."), []);
  assert.deepEqual(hedge("en", "We ship in May possibly, but the build could run long and then possibly fail."), []);
  assert.deepEqual(hedge("en", "The change can help. Possibly the cache is stale."), []);
  assert.deepEqual(hedge("pt", "Ela pode ajudar. Parece estar certo. Parece estar em casa."), []);
  assert.deepEqual(hedge("es", "Puede ayudar. Parece estar bien. Parece ser rápido."), []);
  assert.deepEqual(hedge("fr", "Il peut aider. Il semble être prêt. Il semble lent."), []);
  assert.deepEqual(hedge("de", "Das kann helfen. Es scheint zu funktionieren. Das Kabel ist verbunden."), []);
});

test("hedge: quotes, code, dialogue, front matter and an unknown language are exempt", () => {
  assert.deepEqual(hedge("en", 'She wrote "it could potentially fail" in the log.'), []);
  assert.deepEqual(hedge("en", "Run `could potentially` as is.\n\n```\nit may possibly fail\n```\n"), []);
  assert.deepEqual(hedge("en", "---\ntitle: could potentially\n---\n\nPlain text.\n"), []);
  assert.deepEqual(hedge("en", "— It could potentially fail, he said.\n"), []);
  assert.deepEqual(hedge("tr", "It could potentially fail."), []);
  assert.deepEqual(hedge("xx", "It could potentially fail."), []);
});

test("hedge: an inline directive suppresses the hit under the rule name hedge", () => {
  assert.deepEqual(hedge("en", "<!-- slop-ignore-next-line hedge -->\nIt could potentially fail.\n"), []);
  assert.deepEqual(hedge("en", "<!-- slop-ignore hedge -->\nIt could potentially fail.\n"), []);
  assert.equal(hedge("en", "<!-- slop-ignore-next-line catalog -->\nIt could potentially fail.\n").length, 1);
});

/** Runs `--verify` on a before and an after text. */
function verify(before, after, ...flags) {
  const dir = mkdtempSync(join(tmpdir(), "slop-hedge-"));
  try {
    writeFileSync(join(dir, "before.md"), before);
    writeFileSync(join(dir, "after.md"), after);
    const r = spawnSync(process.execPath, [CLI, "--verify", ...flags, join(dir, "before.md"), join(dir, "after.md")], { encoding: "utf8" });
    return { status: r.status, out: r.stdout };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("verify: a hedge hit blocks and prints a hedge line; the softened form passes", () => {
  const before = "The change could potentially cut build time by 40%.\n";
  const bad = verify(before, before);
  assert.equal(bad.status, 1, bad.out);
  assert.match(bad.out, /^1:12 hedge could potentially$/m);
  assert.match(bad.out, /verify: 1 problem\(s\)/);
  const good = verify(before, "The change can cut build time by 40%.\n");
  assert.equal(good.status, 0, good.out);
  const pt = verify("A mudança poderia potencialmente cortar 40% do tempo.\n", "A mudança poderia potencialmente cortar 40% do tempo.\n", "--language", "pt");
  assert.equal(pt.status, 1, pt.out);
  assert.match(pt.out, /hedge poderia potencialmente/);
});

test("pt is guessed from its function words", () => {
  const text = "O serviço não está disponível para os usuários que são da região, mas também não foi possível restaurar os dados porque o sistema falhou quando ele foi atualizado pela equipe.";
  assert.equal(detectLanguage(text).tag, "pt");
});

test("SKILL.md carries the round 6 rules", () => {
  assert.match(skill, /Every pattern in the reference files holds in every language\. Translate the construction, not only the word/);
  assert.match(skill, /A language with no reference file is still checked for the classes in the read-back step/);
  assert.match(skill, /Scope hedges and a real uncertainty the source states|keep scope hedges/);
  assert.match(skill, /`could cut load times` becomes `can cut load times`/);
  assert.match(skill, /Hedge-support test, the same in every language/);
  assert.match(skill, /Never strengthen it to a certain claim, and never add a fact to justify it/);
  assert.match(skill, /rebuild the sentence, and split it where the clauses are separate points/);
  assert.match(skill, /modal hedges on effects, vague-link evidentials, hedge adverbs such as `hopefully`, reassurance qualifiers on a stated fact, counted-list openers, stacked intensifiers, assistant wrappers/);
  assert.match(skill, /Skip quoted text, dialogue, and legal, medical or safety text where a hedge is content/);
  assert.match(skill, /`pt\.md` \(Portuguese\)/);
  assert.match(skill, /^- Portuguese: /m);
  assert.match(skill, /`hedge` check/);
  assert.match(skill, /`tende a` and `talvez` are more typical of human writing, so they are not tells/);
});

test("pt.md and the new en.md entries lint clean and keep the tier structure", () => {
  for (const [file, lang] of [["pt.md", "en"], ["en.md", "en"]]) {
    const run = spawnSync(process.execPath, [CLI, "--language", lang, `${REFERENCES}/${file}`], { encoding: "utf8" });
    assert.equal(run.status, 0, run.stdout + run.stderr);
  }
  const pt = readFileSync(`${REFERENCES}/pt.md`, "utf8");
  assert.match(pt.split("\n")[2], /^Source: /);
  assert.ok(pt.indexOf("\n## Act on one sighting\n") > 0 && pt.indexOf("\n## Act only when several appear\n") > pt.indexOf("\n## Act on one sighting\n"));
  assert.match(pt, /Add no fact\. Change no number\./);
  assert.match(pt, /Literal uses stay/);
  assert.match(pt, /not tells; leave them/);
  const en = readFileSync(`${REFERENCES}/en.md`, "utf8");
  assert.match(en.slice(en.indexOf("## Act only when several appear")), /A heading restated by the first sentence under it/);
  assert.match(en.slice(en.indexOf("## Act only when several appear")), /describes the document instead of its subject/);
});

test("THIRD-PARTY-NOTICES.md credits the round 6 sources", () => {
  const notices = readFileSync("THIRD-PARTY-NOTICES.md", "utf8");
  assert.ok(notices.includes("## avoid-ai-writing (conorbronsdon)"));
  assert.ok(notices.split("\n").includes("Copyright (c) 2026 Conor Bronsdon"));
  assert.match(notices, /Humanizer 3\.1\.0/);
  assert.match(notices, /CC BY-SA 4\.0/);
  for (const url of ["en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing", "de.wikipedia.org/wiki/Wikipedia:Anzeichen_für_KI-generierte_Inhalte", "pt.wikipedia.org/wiki/Wikipédia:Sinais_de_texto_gerado_por_inteligência_artificial"]) {
    assert.ok(notices.includes(url), url);
  }
  assert.ok(!/Italian|SKILL-IT|jurigis/.test(notices));
});

// Review fixes: literal and medical senses stay clean, hard-wrapped and capitalised modals are caught, --ignore turns the check off.
import { spawnSync as spawnSyncR } from "node:child_process";
import { mkdtempSync as mkdtempR, writeFileSync as writeR } from "node:fs";
import { tmpdir as tmpdirR } from "node:os";
import { join as joinR } from "node:path";
import { test as testR } from "node:test";
import assertR from "node:assert/strict";

const cliR = new URL("../dist/src/cli.js", import.meta.url).pathname;
function verifyR(before, after, extra = []) {
  const d = mkdtempR(joinR(tmpdirR(), "r6fix-"));
  writeR(joinR(d, "b.md"), before); writeR(joinR(d, "a.md"), after);
  return spawnSyncR("node", [cliR, "--verify", joinR(d, "b.md"), joinR(d, "a.md"), "--language", "en", ...extra], { encoding: "utf8" });
}
testR("hedge: literal and medical senses are not hits", () => {
  for (const t of ["The cable seems to be connected to port 2.", "Replicas may eventually converge."]) {
    const r = verifyR(t + "\n", t + "\n");
    assertR.ok(!/ hedge /.test(r.stdout), t);
  }
});
testR("hedge: hard-wrapped and capitalised modals are hits", () => {
  for (const t of ["It could\npotentially fail.\n", "Could potentially fail here.\n"]) {
    const r = verifyR("Plain text here.\n", t);
    assertR.match(r.stdout, / hedge /, t);
  }
});
testR("hedge: --ignore hedge turns the check off", () => {
  const r = verifyR("Plain text here.\n", "It could potentially fail.\n", ["--ignore", "hedge"]);
  assertR.ok(!/ hedge /.test(r.stdout));
});

import { compareFacts as compareR } from "../dist/src/compare.js";
test("compare pt: an added first-person plural verb is a person fact, nouns and passives are not", () => {
  const src = "A mudança foi testada em produção. O problema ficou nos ramos extremos.";
  const bad = compareR(src, "Testamos a mudança em produção. O problema ficou nos ramos extremos.", { language: "pt" });
  assert.ok(bad.added.some((f) => f.kind === "person" && f.value === "testamos"));
  const good = compareR(src, "A mudança foi testada em produção. O problema ficou nos ramos extremos, sem outro efeito.", { language: "pt" });
  assert.ok(!good.added.some((f) => f.kind === "person"));
  const same = compareR("Testamos a mudança.", "Testamos a mudança em produção.", { language: "pt" });
  assert.ok(!same.added.some((f) => f.kind === "person"));
});
test("compare pt: a stoplisted noun that only the rewrite has is not a person; a swapped verb is not an added person", () => {
  const a = compareR("O problema ficou aberto.", "O problema ficou nos extremos e nos reclamos.", { language: "pt" });
  assert.ok(!a.added.some((f) => f.kind === "person"));
  const b = compareR("Testamos a mudança.", "Fizemos a mudança.", { language: "pt" });
  assert.ok(!b.added.some((f) => f.kind === "person"));
});
