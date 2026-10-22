import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { detectLanguage, frontMatterLanguage, splitParagraphs } from "../src/lang.js";
import { prepare } from "../src/doc.js";
import { findFrontMatter } from "../src/frontmatter.js";

const root = join(import.meta.dirname, "..", "..");
const read = (...parts: string[]) => readFileSync(join(root, ...parts), "utf8");

const FR = [
  "Le matin, nous prenons le café dans la cuisine avec les enfants.",
  "Elle a dit que le train n'est pas encore arrivé à la gare.",
  "Pour les vacances, nous voulons aller dans les montagnes ou sur la côte.",
  "Il ne faut pas oublier les clés, sinon nous ne pourrons pas entrer.",
  "Les résultats du projet sont dans le rapport qui se trouve sur le bureau.",
  "Vous avez une question ? Vous pouvez la poser avec vos collègues.",
  "Ce livre est très intéressant, et je le recommande à tous ceux qui aiment l'histoire.",
  "Dans le jardin, des fleurs poussent au bord du chemin, près du vieux mur.",
  "Nous avons passé la soirée avec des amis qui venaient de loin.",
  "Le directeur a annoncé que la réunion aura lieu au mois de juin, dans la grande salle.",
].join(" ");

const ES = [
  "Por la mañana tomamos el café en la cocina con los niños.",
  "Ella dijo que el tren todavía no ha llegado a la estación.",
  "Para las vacaciones queremos ir a las montañas o a la costa.",
  "No hay que olvidar las llaves, porque si no no podremos entrar.",
  "Los resultados del proyecto están en el informe que se encuentra en la mesa.",
  "¿Tienes alguna pregunta? Puedes hacerla con tus compañeros de trabajo.",
  "Este libro es muy interesante, y lo recomiendo a todos los que aman la historia.",
  "En el jardín, unas flores crecen al borde del camino, cerca del viejo muro.",
  "Pasamos la noche con amigos que venían de muy lejos.",
  "El director anunció que la reunión será en junio, en la sala grande.",
].join(" ");

const DE = [
  "Am Morgen trinken wir den Kaffee in der Küche mit den Kindern.",
  "Sie sagte, dass der Zug noch nicht am Bahnhof angekommen ist.",
  "Für die Ferien wollen wir in die Berge oder an die Küste fahren.",
  "Man darf die Schlüssel nicht vergessen, sonst kommen wir nicht hinein.",
  "Die Ergebnisse des Projekts stehen im Bericht, der auf dem Schreibtisch liegt.",
  "Haben Sie eine Frage? Sie können sie mit Ihren Kollegen besprechen.",
  "Dieses Buch ist sehr interessant, und ich empfehle es allen, die Geschichte mögen.",
  "Im Garten wachsen Blumen am Rand des Weges, nahe der alten Mauer.",
  "Wir haben den Abend mit Freunden verbracht, die von weit her kamen.",
  "Der Direktor hat angekündigt, dass die Besprechung im Juni in dem großen Saal stattfindet.",
].join(" ");

const IT = [
  "Al mattino prendiamo il caffè in cucina con i bambini.",
  "Ha detto che il treno non è ancora arrivato alla stazione.",
  "Per le vacanze vogliamo andare in montagna o sulla costa.",
  "Non bisogna dimenticare le chiavi, altrimenti non potremo entrare.",
  "I risultati del progetto sono nel rapporto che si trova sulla scrivania.",
  "Hai una domanda? Puoi farla ai tuoi colleghi di lavoro.",
  "Questo libro è molto interessante, e lo consiglio a tutti quelli che amano la storia.",
  "Nel giardino crescono dei fiori ai bordi del sentiero, vicino al vecchio muro.",
  "Abbiamo passato la serata con amici che venivano da lontano.",
  "Il direttore ha annunciato che la riunione si terrà a giugno, nella sala grande.",
].join(" ");

const PT = [
  "De manhã tomamos o café na cozinha com as crianças.",
  "Ela disse que o trem ainda não chegou à estação.",
  "Para as férias queremos ir às montanhas ou à costa.",
  "Não podemos esquecer as chaves, senão não vamos conseguir entrar.",
  "Os resultados do projeto estão no relatório que fica na mesa do escritório.",
  "Você tem alguma pergunta? Pode fazê-la aos seus colegas de trabalho.",
  "Este livro é muito interessante, e eu recomendo a todos que gostam de história.",
  "No jardim, há flores crescendo na beira do caminho, perto do muro velho.",
  "Passamos a noite com amigos que vieram de longe.",
  "O diretor anunciou que a reunião será em junho, na sala grande.",
].join(" ");

const NL = [
  "'s Ochtends drinken we koffie in de keuken met de kinderen.",
  "Zij zei dat de trein nog niet op het station is aangekomen.",
  "Voor de vakantie willen we naar de bergen of naar de kust.",
  "Je mag de sleutels niet vergeten, anders kunnen we niet naar binnen.",
  "De resultaten van het project staan in het rapport dat op het bureau ligt.",
  "Heb je een vraag? Je kunt die aan je collega's stellen.",
  "Dit boek is erg interessant, en ik raad het iedereen aan die van geschiedenis houdt.",
  "In de tuin groeien bloemen langs het pad, dicht bij de oude muur.",
  "We brachten de avond door met vrienden die van ver kwamen.",
  "De directeur heeft aangekondigd dat de vergadering in juni in de grote zaal wordt gehouden.",
].join(" ");

const EN = [
  "In the morning we drink coffee in the kitchen with the children.",
  "She said that the train is not yet at the station.",
  "For the holidays we want to go to the mountains or to the coast.",
  "You must not forget the keys, or we will not be able to get in.",
  "The results of the project are in the report that is on the desk.",
  "Do you have a question? You can ask it of your colleagues.",
  "This book is very interesting, and I recommend it to everyone who loves history.",
  "In the garden, flowers grow along the path, close to the old wall.",
  "We spent the evening with friends who came from far away.",
  "The director announced that the meeting will be held in June, in the large hall.",
].join(" ");

test("each language paragraph detects as its own language", () => {
  assert.equal(detectLanguage(FR).tag, "fr");
  assert.equal(detectLanguage(ES).tag, "es");
  assert.equal(detectLanguage(DE).tag, "de");
  assert.equal(detectLanguage(IT).tag, "it");
  assert.equal(detectLanguage(PT).tag, "pt");
  assert.equal(detectLanguage(NL).tag, "nl");
  assert.equal(detectLanguage(EN).tag, "en");
});

test("detection reports a confidence and a token count", () => {
  const r = detectLanguage(EN);
  assert.ok(r.words >= 25);
  assert.ok(r.confidence >= 0.12 && r.confidence <= 1);
});

test("the French note fixture detects as fr", () => {
  assert.equal(detectLanguage(read("bench", "head-to-head", "fixtures", "h1", "note.md")).tag, "fr");
});

test("the English paragraphs of the h5 fixture detect as en", () => {
  const h5 = read("bench", "head-to-head", "fixtures", "h5", "guide.md");
  const blocks = splitParagraphs(h5).filter((p) => /in today's fast-paced world|localized help text isn't|pick your 3 target/i.test(p.text));
  assert.equal(blocks.length, 3);
  for (const b of blocks) assert.equal(detectLanguage(b.text).tag, "en");
});

test("a text under 25 tokens gives null", () => {
  const r = detectLanguage("The cat sat on the mat and the dog ran");
  assert.equal(r.tag, null);
  assert.equal(r.words, 10);
});

test("a text whose function words cover under 12 percent of its tokens gives null", () => {
  const text =
    "Quantum flux capacitor calibration produced seventeen measurements across twelve chambers, while engineers logged every anomaly, vendor ticket, sensor drift, thermal spike, voltage ripple, and firmware rollback. The report lists three follow-up actions for the lab.";
  const r = detectLanguage(text);
  assert.equal(r.tag, null);
  assert.ok(r.words >= 25);
  assert.ok(r.confidence < 0.12);
});

test("two languages with close function-word counts give null", () => {
  const text =
    "The cat and the dog sit on the mat in the house. Le chat et le chien sont sur le tapis dans la maison. The garden is quiet and the river runs slow, la pluie tombe sur les toits, des oiseaux chantent près du pont.";
  assert.equal(detectLanguage(text).tag, null);
});

test("an English text that quotes one French sentence stays en", () => {
  const text = `${EN} She wrote « Je viens demain présenter la version finale » in her notes.`;
  assert.equal(detectLanguage(text).tag, "en");
});

test("a code-only text gives null", () => {
  const code = `
function total(items) {
  return items.map((item) => item.price * item.quantity).reduce((sum, value) => sum + value, 0);
}
const cart = [{ price: 3, quantity: 2 }, { price: 5, quantity: 1 }];
console.log(total(cart));
`;
  assert.equal(detectLanguage(code).tag, null);
});

test("empty input gives null with zero tokens", () => {
  assert.deepEqual(detectLanguage(""), { tag: null, confidence: 0, words: 0 });
});

test("front matter lang key gives its primary subtag", () => {
  assert.equal(frontMatterLanguage("---\nlang: fr\n---\nBody"), "fr");
});

test("front matter language key with a region is normalised", () => {
  assert.equal(frontMatterLanguage('---\nlanguage: "de-AT"\n---\nBody'), "de");
  assert.equal(frontMatterLanguage("---\nlang: fr-CA\n---\n"), "fr");
});

test("TOML front matter (+++) lang and language keys are read too", () => {
  assert.equal(frontMatterLanguage('+++\nlang = "fr"\n+++\nBody'), "fr");
  assert.equal(frontMatterLanguage("+++\ntitle = \"x\"\nlanguage = 'de-AT'  # page language\n+++\nBody"), "de");
  assert.equal(frontMatterLanguage('+++\nlang = "fra"\n+++\n'), "fr");
  // A YAML-style colon inside TOML, or an equals sign inside YAML, is not the other format's key.
  assert.equal(frontMatterLanguage("+++\nlang: fr\n+++\n"), null);
  assert.equal(frontMatterLanguage('---\nlang = "fr"\n---\n'), null);
  assert.equal(frontMatterLanguage('+++\ntitle = "lang = fr"\n+++\n'), null);
});

test("no front matter gives null", () => {
  assert.equal(frontMatterLanguage("Hello world"), null);
});

test("front matter that is not at line 1 gives null", () => {
  assert.equal(frontMatterLanguage("\n---\nlang: fr\n---\nBody"), null);
  assert.equal(frontMatterLanguage("Intro\n---\nlang: fr\n---\n"), null);
});

test("splitParagraphs returns offsets into the original text", () => {
  const text = "First paragraph\nline two\n\n  Second paragraph  \n\n\nThird";
  const blocks = splitParagraphs(text);
  assert.equal(blocks.length, 3);
  for (const b of blocks) assert.equal(text.slice(b.start, b.end), b.text);
  assert.deepEqual(splitParagraphs(""), []);
  const padded = "   \n\nOnly paragraph";
  const only = splitParagraphs(padded);
  assert.equal(only.length, 1);
  assert.equal(only[0]?.text, "Only paragraph");
});

test("every bench/typography file named by language detects as that language", () => {
  const files = readdirSync(join(root, "bench", "typography")).filter((n) => /^(fr|es|de|it|pt|nl)-.*\.md$/.test(n));
  assert.ok(files.length > 0);
  for (const name of files) {
    const r = detectLanguage(read("bench", "typography", name));
    assert.equal(r.tag, name.slice(0, 2), `${name}: ${JSON.stringify(r)}`);
  }
});

test("every bench/corpus human and machine file detects as en", () => {
  for (const dir of ["human", "machine"]) {
    const files = readdirSync(join(root, "bench", "corpus", dir)).filter((n) => n.endsWith(".md"));
    assert.ok(files.length > 0);
    for (const name of files) {
      const r = detectLanguage(read("bench", "corpus", dir, name));
      assert.equal(r.tag, "en", `${dir}/${name}: ${JSON.stringify(r)}`);
    }
  }
});

test("empty front matter gives null and does not read the body", () => {
  // The opening and closing fences are adjacent, so the block is empty. The body's own
  // `lang: fr` line must not be taken as front matter.
  assert.equal(frontMatterLanguage("---\n---\nbody\nlang: fr\n---\n"), null);
});

test("a leading byte order mark before the front matter still parses", () => {
  assert.equal(frontMatterLanguage("﻿---\nlang: fr\n---\nBody"), "fr");
  assert.equal(frontMatterLanguage("﻿---\r\nlanguage: de\r\n---\r\nBody"), "de");
});

test("front matter language is reduced to a two-letter primary subtag", () => {
  // Three-letter ISO 639-2 codes map to their two-letter form.
  const mapped: Array<[string, string]> = [
    ["fra", "fr"], ["fre", "fr"], ["spa", "es"], ["deu", "de"], ["ger", "de"], ["ita", "it"],
    ["por", "pt"], ["nld", "nl"], ["dut", "nl"], ["eng", "en"],
  ];
  for (const [code, tag] of mapped) assert.equal(frontMatterLanguage(`---\nlang: ${code}\n---\n`), tag, code);
  // A region after a three-letter code is dropped with the rest of the subtags.
  assert.equal(frontMatterLanguage("---\nlang: fra-CA\n---\n"), "fr");
  // Three letters with no mapping, and any word that is not a code, give null.
  assert.equal(frontMatterLanguage("---\nlang: abc\n---\n"), null);
  assert.equal(frontMatterLanguage("---\nlang: french\n---\n"), null);
});

test("combining marks stay inside a word, so decomposed text detects the same", () => {
  // NFD splits each accented letter into a base letter and a combining mark. Without the
  // mark in the token class, "été" becomes "e" and "t" and the function-word count drops.
  const nfd = FR.normalize("NFD");
  assert.notEqual(nfd, FR, "the fixture must actually be decomposed");
  assert.equal(detectLanguage(nfd).tag, "fr");
  assert.equal(detectLanguage(nfd).words, detectLanguage(FR).words);
});

test("prepare does not blank the body after empty front matter", () => {
  // The old prepare() regex took everything up to the next fence as front matter, so the body
  // of a file with an empty block was hidden from every rule.
  const doc = prepare("note.md", "---\n---\nThe body is visible — to every rule.\n");
  assert.ok(doc.masked.includes("The body is visible"), JSON.stringify(doc.masked));
  assert.equal(findFrontMatter("---\n---\nThe body is visible\n")?.body, "");
});

test("a byte order mark before the front matter is handled in both the detector and prepare", () => {
  const text = "\uFEFF---\nlang: fr\n---\nThe body is visible in the note.\n";
  const block = findFrontMatter(text);
  assert.ok(block, "the shared detector must see the block after the BOM");
  assert.equal(block.start, 1);
  assert.equal(block.body, "lang: fr");
  assert.equal(frontMatterLanguage(text), "fr");
  const doc = prepare("note.md", text);
  assert.ok(!doc.masked.includes("lang: fr"), "the front matter must be blanked");
  assert.ok(doc.masked.includes("The body is visible"), "the body must stay visible");
  assert.equal(doc.masked.length, text.length, "masking keeps offsets");
});

test("the shared detector reads YAML and TOML fences and nothing else", () => {
  assert.equal(findFrontMatter("---\nlang: de\n---\nBody")?.fence, "---");
  assert.equal(findFrontMatter("+++\ntitle = 1\n+++\nBody")?.fence, "+++");
  assert.equal(findFrontMatter("Intro\n---\nlang: fr\n---\n"), null);
  assert.equal(findFrontMatter("---\nno closing fence"), null);
});
