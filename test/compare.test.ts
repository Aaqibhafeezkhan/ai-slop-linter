import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { QUALIFIERS, compareFacts, countPersonWords, extractFacts, qualifiedNumbers, qualifierChanges } from "../src/compare.js";

const cli = join(process.cwd(), "dist", "src", "cli.js");
const bench = join(process.cwd(), "bench", "head-to-head");
const fixture = (name: string, file: string) => join(bench, "fixtures", name, file);
const golden = (name: string, file: string) => join(bench, "golden", name, file);

const run = (args: string[], opts: { cwd?: string; input?: string } = {}) => {
  const r = spawnSync("node", [cli, ...args], { cwd: opts.cwd ?? process.cwd(), input: opts.input, encoding: "utf8" });
  return { code: r.status, out: r.stdout, err: r.stderr };
};

const read = (path: string) => readFile(path, "utf8");

/** The fact sets of a text, as `kind value` strings, so a test can read them at a glance. */
const keys = (text: string) => extractFacts(text).map((f) => `${f.kind} ${f.value}`);

// --- extraction -------------------------------------------------------------------------

test("code spans and fenced blocks are facts; their contents are not read again as prose", () => {
  const text = "Run `npm test -- 3` now.\n\n```sh\nnpm install fastq@2.3\n```\n";
  const facts = extractFacts(text);
  assert.ok(facts.some((f) => f.kind === "code" && f.value === "npm test -- 3"));
  assert.ok(facts.some((f) => f.kind === "code" && f.value === "npm install fastq@2.3"));
  assert.ok(!facts.some((f) => f.kind === "version"), "2.3 inside the fence is code, not a version");
  assert.ok(!facts.some((f) => f.kind === "number" && f.value === "3"), "3 inside the code span is code");
});

test("urls lose trailing punctuation and are not read again for versions or references", () => {
  const facts = keys("See https://docs.example.com/v2/x#1042. Also https://a.example/fastq/2.3/notes, v3.1.0 here.");
  assert.ok(facts.includes("url https://docs.example.com/v2/x#1042"));
  assert.ok(facts.includes("url https://a.example/fastq/2.3/notes"));
  assert.ok(facts.includes("version v3.1.0"));
  assert.ok(!facts.includes("version 2.3"), "the 2.3 is inside a url");
});

test("issue numbers and ticket ids are references; ISO and month-name dates are dates", () => {
  const facts = keys("Fixed in #1042 and ABC-12, shipped on 2026-09-14, then 3 mars and 14 September.");
  assert.ok(facts.includes("reference #1042"));
  assert.ok(facts.includes("reference ABC-12"));
  assert.ok(facts.includes("date 2026-09-14"));
  assert.ok(facts.includes("date 3 mars"));
  assert.ok(facts.includes("date 14 September"));
});

test("thousands commas do not change a number's identity, and percentages keep their sign", () => {
  assert.deepEqual(keys("12,000 jobs and 40% faster"), ["number 12000", "number 40%"]);
  assert.deepEqual(compareFacts("12,000 jobs", "12000 jobs"), { lost: [], added: [], kept: 1 });
});

test("spelled-out numbers are read by value since round 8, and equal their digits", () => {
  assert.deepEqual(keys("forty percent faster"), ["number 40"]);
  assert.deepEqual(compareFacts("forty users", "40 users"), { lost: [], added: [], kept: 1 });
});

test("a capitalised run that does not start a sentence is a name; sentence-initial words are not", () => {
  const facts = keys("Maintainers at Acme Corp shipped it.\n\n# Fastq\n\nThe team at Acme Corp agreed. Then Globex reported.");
  assert.ok(facts.includes("name Acme Corp"));
  assert.ok(!facts.includes("name Maintainers"), "a word at sentence start is not a name");
  assert.ok(!facts.includes("name Fastq"), "a heading word starts a line");
  assert.ok(!facts.includes("name Globex"), "a run that starts a sentence is skipped whole");
});

test("quotes are normalised for quote style and whitespace before they are compared", () => {
  // The inner marks differ in style only: curly against straight, and an extra space.
  assert.deepEqual(compareFacts("« Il a dit “oui” ici »", "« Il a dit   \"oui\"   ici »"), { lost: [], added: [], kept: 1 });
});

test("a dotted number followed by a letter or a percent sign is a number, not a version", () => {
  assert.deepEqual(keys("a 3.2x speedup and a 40.5% cut"), ["number 3.2", "number 40.5%"]);
});

test("a stopword at the edge of a capitalised run is not part of the name", () => {
  assert.deepEqual(keys("Moved to The Acme team."), ["name Acme"]);
});

test("a quotation with fewer than three words is not a quote fact", () => {
  assert.deepEqual(keys("She said « oui »."), []);
});

// --- compareFacts ------------------------------------------------------------------------

test("h2 against its golden output: the same facts, nothing lost or added", async () => {
  const before = await read(fixture("h2", "README.md"));
  const after = await read(golden("h2", "README.md"));
  const r = compareFacts(before, after);
  assert.deepEqual(r.lost, []);
  assert.deepEqual(r.added, []);
  assert.ok(r.kept > 0, "the fixture carries facts, so equal sets are not empty sets");
});

test("h2 with In benchmarks changed to In our benchmarks: the added owner is an added person fact", async () => {
  const before = await read(fixture("h2", "README.md"));
  const after = before.replace("In benchmarks,", "In our benchmarks,");
  assert.notEqual(after, before, "the variant really changed the text");
  assert.deepEqual(compareFacts(before, after), { lost: [], added: [{ kind: "person", value: "our" }], kept: compareFacts(before, before).kept });
});

test("h2 with 40% changed to 45%: one fact lost and one added", async () => {
  const before = await read(fixture("h2", "README.md"));
  assert.equal(before.split("40%").length - 1, 1, "the fixture has one 40%");
  const r = compareFacts(before, before.replace("40%", "45%"));
  assert.deepEqual(r.lost, [{ kind: "number", value: "40%" }]);
  assert.deepEqual(r.added, [{ kind: "number", value: "45%" }]);
});

test("h4 against its golden output: equal fact sets, and the facts it carries are real", async () => {
  const before = await read(fixture("h4", "RELEASE-NOTES.md"));
  const after = await read(golden("h4", "RELEASE-NOTES.md"));
  const r = compareFacts(before, after);
  assert.deepEqual(r.lost, []);
  assert.deepEqual(r.added, []);
  const facts = keys(before);
  assert.ok(facts.includes("version 3.1.0"));
  assert.ok(facts.includes("date 2026-09-14"));
  assert.ok(facts.includes("reference #1042"));
  assert.ok(facts.includes("url https://docs.harbor.example/v2/pause"));
  assert.ok(facts.includes("code --max-old-space-size=4096"));
  assert.ok(facts.includes("number 1248"));
});

test("h1: a quotation whose inner dashes became commas is one quote lost and one added", async () => {
  const before = await read(fixture("h1", "note.md"));
  const quoted = "Je viens — enfin presque — demain";
  assert.equal(before.split(quoted).length - 1, 1, "the fixture has the quotation once");
  const after = before.replace(quoted, "Je viens, enfin presque, demain");
  const r = compareFacts(before, after);
  assert.equal(r.lost.length, 1, JSON.stringify(r));
  assert.equal(r.added.length, 1, JSON.stringify(r));
  assert.equal(r.lost[0]?.kind, "quote");
  assert.equal(r.added[0]?.kind, "quote");
});

test("h1: a dropped number is lost", async () => {
  const before = await read(fixture("h1", "note.md"));
  const after = before.replace("29 euros par mois, sans engagement.", "sans engagement.");
  assert.notEqual(after, before);
  assert.deepEqual(compareFacts(before, after).lost, [{ kind: "number", value: "29" }]);
  assert.deepEqual(compareFacts(before, after).added, []);
});

test("h1: an added url is added", async () => {
  const before = await read(fixture("h1", "note.md"));
  const after = `${before.trimEnd()} Docs : https://atelier.example/doc.\n`;
  const r = compareFacts(before, after);
  assert.deepEqual(r.added, [{ kind: "url", value: "https://atelier.example/doc" }]);
  assert.deepEqual(r.lost, []);
});

test("h4: an edited code span is one code fact lost and one added", async () => {
  const before = await read(fixture("h4", "RELEASE-NOTES.md"));
  const old = "`harbor migrate --to 31`";
  assert.equal(before.split(old).length - 1, 1, "the fixture has the command once");
  const r = compareFacts(before, before.replace(old, "`harbor migrate --to 32`"));
  assert.deepEqual(r.lost, [{ kind: "code", value: "harbor migrate --to 31" }]);
  assert.deepEqual(r.added, [{ kind: "code", value: "harbor migrate --to 32" }]);
});

test("the same text on both sides has no differences and kept counts every distinct fact once", () => {
  const text = "Fastq 2.3 has 12,000 jobs, 40% faster and 40% cheaper, #1042, 2026-09-14 and `npm test`.";
  const distinct = new Set(keys(text)).size;
  assert.deepEqual(compareFacts(text, text), { lost: [], added: [], kept: distinct });
});

test("kept counts only the facts both texts share", () => {
  assert.equal(compareFacts("Fastq 2.3 is 40% faster.", "Fastq 2.3 is 45% faster.").kept, 1);
  assert.equal(compareFacts("Fastq 2.3 is 40% faster.", "Fastq 2.4 is 45% faster.").kept, 0);
});

test("lost and added are sorted by kind, then by value", () => {
  // Position order would be 9, 10, 2; sorted by value they read 10, 2, 9.
  const r = compareFacts("Keep 9, 10 and 2.", "Keep 1.");
  assert.deepEqual(r.lost.map((f) => f.value), ["10", "2", "9"]);
  const mixed = compareFacts("Keep 9 and 2.", "Keep 9 and 2. Docs https://b.example/x and https://a.example/x.");
  assert.deepEqual(mixed.added.map((f) => f.kind), ["url", "url"]);
  assert.deepEqual(mixed.added.map((f) => f.value), ["https://a.example/x", "https://b.example/x"]);
});

test("the package exports compareFacts from its index, as public API", async () => {
  const api = await import("../src/index.js");
  const before = "Fastq 2.3 is 40% faster.";
  assert.deepEqual(api.compareFacts(before, "Fastq 2.3 is 45% faster."), compareFacts(before, "Fastq 2.3 is 45% faster."));
});

// --- CLI ----------------------------------------------------------------------------------

test("slop --compare: identical files exit 0 and say so on the last line", () => {
  const h2 = fixture("h2", "README.md");
  const r = run(["--compare", h2, golden("h2", "README.md")]);
  assert.equal(r.code, 0, r.err);
  assert.match(r.out, /^facts: \d+ kept, 0 lost, 0 added$/m);
  assert.equal(r.out.trimEnd().split("\n").at(-1), "OK: no fact lost or added");
});

test("slop diff is the same command as slop --compare", () => {
  const h2 = fixture("h2", "README.md");
  const a = run(["diff", h2, golden("h2", "README.md")]);
  const b = run(["--compare", h2, golden("h2", "README.md")]);
  assert.equal(a.code, 0);
  assert.equal(a.out, b.out);
});

test("slop --compare: a changed fact exits 1 and prints lost and added lines, sorted", async () => {
  const dir = await mkdtemp(join(tmpdir(), "slop-compare-"));
  try {
    const before = await read(fixture("h2", "README.md"));
    await writeFile(join(dir, "before.md"), before);
    await writeFile(join(dir, "after.md"), before.replace("40%", "45%").replace("Node 20", "Node 22"));
    const r = run(["diff", "before.md", "after.md"], { cwd: dir });
    assert.equal(r.code, 1, r.err);
    assert.match(r.out, /^facts: \d+ kept, 2 lost, 2 added$/m);
    assert.match(r.out, /^lost   number   20$/m);
    assert.match(r.out, /^lost   number   40%$/m);
    assert.match(r.out, /^added  number   22$/m);
    assert.match(r.out, /^added  number   45%$/m);
    assert.ok(!r.out.includes("OK:"));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("slop --compare: stdin stands in for one side", async () => {
  const before = await read(fixture("h2", "README.md"));
  const r = run(["--compare", "-", golden("h2", "README.md")], { input: before });
  assert.equal(r.code, 0, r.err);
  const changed = run(["--compare", fixture("h2", "README.md"), "-"], { input: before.replace("40%", "45%") });
  assert.equal(changed.code, 1);
  assert.match(changed.out, /^lost   number   40%$/m);
});

test("slop --compare: stdin cannot stand in for both sides", () => {
  const r = run(["--compare", "-", "-"], { input: "x" });
  assert.equal(r.code, 2);
  assert.match(r.err, /only one side/);
});

test("slop --compare: a usage error exits 2", () => {
  assert.equal(run(["--compare"]).code, 2);
  assert.equal(run(["--compare", fixture("h2", "README.md")]).code, 2);
  assert.equal(run(["--compare", "a.md", "b.md", "c.md"]).code, 2);
  assert.equal(run(["diff"]).code, 2);
  assert.equal(run(["--compare", "no-such-file.md", fixture("h2", "README.md")]).code, 2);
  assert.equal(run(["--json", fixture("h2", "README.md")]).code, 2, "--json only applies to a comparison");
});

test("slop --compare --json prints lost, added and kept, and nothing else", () => {
  const h2 = fixture("h2", "README.md");
  const r = run(["--compare", h2, golden("h2", "README.md"), "--json"]);
  assert.equal(r.code, 0, r.err);
  assert.deepEqual(Object.keys(JSON.parse(r.out)).sort(), ["added", "kept", "lost"]);
  assert.deepEqual(JSON.parse(r.out).lost, []);
  assert.equal(typeof JSON.parse(r.out).kept, "number");
});

// --- review round 1 ----------------------------------------------------------------------

test("--help names --compare and diff", () => {
  const help = run(["--help"]);
  assert.equal(help.code, 0);
  assert.match(help.out, /--compare <before> <after>/);
  assert.match(help.out, /slop diff/);
  assert.match(help.out, /--json/);
});

test("a name that only moved to the start of a sentence is not lost: h6 golden keeps Acme", async () => {
  // In the fixture Acme is mid-sentence; in the golden it opens a sentence, where extraction
  // does not read it as a name. The name is still in the text as a whole word, so it is kept.
  const before = await read(fixture("h6", join("docs", "guide.md")));
  const after = await read(golden("h6", join("docs", "guide.md")));
  assert.ok(before.includes("Acme"), "the fixture names Acme");
  assert.ok(after.includes("Acme lets"), "the golden opens a sentence with Acme");
  const r = compareFacts(before, after);
  assert.ok(!r.lost.some((f) => f.kind === "name" && f.value === "Acme"), JSON.stringify(r.lost));
  assert.ok(!r.added.some((f) => f.kind === "name" && f.value === "Acme"), JSON.stringify(r.added));
});

test("a name removed everywhere is still lost, and a name invented from nothing is still added", () => {
  const dropped = compareFacts("Maintainers at Acme Corp shipped it. Globex agreed.", "Maintainers shipped it. Globex agreed.");
  assert.deepEqual(dropped.lost, [{ kind: "name", value: "Acme Corp" }]);
  assert.deepEqual(dropped.added, []);
  const invented = compareFacts("The team agreed.", "The team agreed with Initech.");
  assert.deepEqual(invented.added, [{ kind: "name", value: "Initech" }]);
  assert.deepEqual(invented.lost, []);
});

test("a trailing year is part of the date: one fact, no separate number", () => {
  const facts = keys("Released 14 September, 2024, then 3 mars 2025 and 14 September 2024.");
  assert.ok(facts.includes("date 14 September 2024"));
  assert.ok(facts.includes("date 3 mars 2025"));
  assert.ok(!facts.some((f) => f === "number 2024" || f === "number 2025"), facts.join(", "));
  assert.deepEqual(compareFacts("on 14 September, 2024.", "on 14 September 2024."), { lost: [], added: [], kept: 1 });
});

test("--compare and diff cannot be combined with another mode: exit 2 and the flag named", () => {
  const h2 = fixture("h2", "README.md");
  const golden2 = golden("h2", "README.md");
  const combos: string[][] = [["--fix"], ["--commit"], ["--init"], ["--history"], ["--explain", "dash"], ["--commit-msg", h2], ["--pr", "1"], ["--mcp"], ["--rules"]];
  for (const [flag, value] of combos as [string, string?][]) {
    for (const head of [["--compare"], ["diff"]]) {
      const args = [...head, h2, golden2, flag, ...(value === undefined ? [] : [value])];
      const r = run(args);
      assert.equal(r.code, 2, `${args.join(" ")}: ${r.err}`);
      assert.match(r.err, new RegExp(`cannot be combined with ${flag}`), r.err);
    }
  }
});

test("a name that only appears at a sentence start in the original is not added when it moves mid-sentence", () => {
  const r = compareFacts("Acme is here. We left.", "We met Acme today.");
  assert.deepEqual(r.added, []);
  assert.deepEqual(r.lost, []);
});

test("a capitalised word that starts a table cell is a sentence start, not a name", () => {
  const before = ["| Component | Notes |", "| --- | --- |", "| Cache | Delves into typing |", "| Agent | Pivotal change, ensuring speed |"].join("\n");
  const after = ["| Component | Notes |", "| --- | --- |", "| Cache | Type hints work |", "| Agent | A faster path |"].join("\n");
  const names = extractFacts(before).filter((f) => f.kind === "name");
  assert.deepEqual(names, [], "no cell-initial word is a name");
  assert.deepEqual(compareFacts(before, after), { lost: [], added: [], kept: 0 });
  // A name in the middle of a cell is still a name, and dropping it is still reported.
  const kept = "| Fix | Thanks to Zoë Hartmann for the report |";
  assert.deepEqual(extractFacts(kept).filter((f) => f.kind === "name").map((f) => f.value), ["Zoë Hartmann"]);
  const lost = compareFacts(kept, "| Fix | Thanks for the report |").lost;
  assert.deepEqual(lost, [{ kind: "name", value: "Zoë Hartmann" }]);
});

test("slop --compare: the h13 fixture and its golden lose no name only because a tell opened a table cell", () => {
  const r = run(["--compare", fixture("h13", "RELEASE-NOTES.md"), golden("h13", "RELEASE-NOTES.md")]);
  assert.doesNotMatch(r.out, /^(lost|added)\s+name\s/m);
});

const GERMAN_BEFORE =
  "Unser Team betreut seit 2023 rund 40 Mittelständler, und wir wissen, dass die Technik allein nicht reicht. Gestern war Herr Krause zunächst skeptisch, aber die Zahlen sprechen für sich, und am Ende zählt das Vertrauen der Kunden in die Arbeit des Teams. Die Verbesserung der Prozesse hat viel Zeit gekostet. Mehr steht unter https://example.org/bericht und im Befehl `make bericht`, und Frau Meier sagte: \"Das Vertrauen kommt zuerst, die Technik danach\".";
const GERMAN_AFTER =
  "Unser Team betreut seit 2023 rund 40 Mittelständler. Gestern war Herr Krause zunächst skeptisch, aber die Zahlen sprechen für sich, und am Ende zählt das Vertrauen der Kunden in die Arbeit des Teams. Das hat viel gekostet. Mehr steht unter https://example.org/bericht und im Befehl `make bericht`, und Frau Meier sagte: \"Das Vertrauen kommt zuerst, die Technik danach\".";

test("a run of several capitalised words opening a table cell is a name, and dropping that row is reported", () => {
  const table = ["| Person | Role |", "| --- | --- |", "| Mateusz Wójcik | Maintainer |", "| Zoë Hartmann | Author |"].join("\n");
  assert.deepEqual(extractFacts(table).filter((f) => f.kind === "name").map((f) => f.value), ["Mateusz Wójcik", "Zoë Hartmann"]);
  const dropped = table.replace("| Mateusz Wójcik | Maintainer |\n", "");
  assert.deepEqual(compareFacts(table, dropped).lost, [{ kind: "name", value: "Mateusz Wójcik" }]);
  // Single-word cell openers stay out of it, so the h13 golden still compares clean.
  const r = run(["--compare", fixture("h13", "RELEASE-NOTES.md"), golden("h13", "RELEASE-NOTES.md")]);
  assert.equal(r.code, 0, r.out);
});

test("German: single capitalised nouns are no names, multi-word names are, and every other fact is still compared", () => {
  assert.deepEqual(compareFacts(GERMAN_BEFORE, GERMAN_AFTER), { lost: [], added: [], kept: compareFacts(GERMAN_BEFORE, GERMAN_BEFORE).kept });
  assert.ok(compareFacts(GERMAN_BEFORE, GERMAN_AFTER).kept >= 6, "numbers, url, code, quote and names are extracted");
  // A multi-word name is compared: dropping "Frau Meier" or "Herr Krause" is reported.
  const noMeier = GERMAN_AFTER.replace("Frau Meier sagte", "jemand sagte");
  assert.deepEqual(compareFacts(GERMAN_BEFORE, noMeier).lost, [{ kind: "name", value: "Frau Meier" }]);
  const noKrause = GERMAN_AFTER.replace("Herr Krause", "der Chef");
  assert.deepEqual(compareFacts(GERMAN_BEFORE, noKrause).lost, [{ kind: "name", value: "Herr Krause" }]);
  // Numbers, urls, code and quotations are still compared in German.
  assert.deepEqual(compareFacts(GERMAN_BEFORE, GERMAN_AFTER.replace("2023", "2024")).lost, [{ kind: "number", value: "2023" }]);
  assert.deepEqual(compareFacts(GERMAN_BEFORE, GERMAN_AFTER.replace("example.org/bericht", "example.org/berichte")).lost, [{ kind: "url", value: "https://example.org/bericht" }]);
  assert.deepEqual(compareFacts(GERMAN_BEFORE, GERMAN_AFTER.replace("make bericht", "make berichte")).lost, [{ kind: "code", value: "make bericht" }]);
  assert.deepEqual(compareFacts(GERMAN_BEFORE, GERMAN_AFTER.replace("die Technik danach", "die Technik später")).lost, [
    { kind: "quote", value: "Das Vertrauen kommt zuerst, die Technik danach" },
  ]);
  // The same shape in English still reports a dropped single name.
  const en = compareFacts("We thank Zoe Hartmann for the fix and Mateusz for the report on the cache.", "We thank the team for the fix and the report on the cache.");
  assert.deepEqual(en.lost, [{ kind: "name", value: "Mateusz" }, { kind: "name", value: "Zoe Hartmann" }]);
});

test("the language of the comparison can be declared: --language de turns the German rule on, --language en turns it off", () => {
  const short = "Wir danken Krause und der Technik für die Hilfe.";
  const shortAfter = "Wir danken für die Hilfe.";
  assert.equal(compareFacts(short, shortAfter).lost.length > 0, true, "too short to detect: single names are compared");
  assert.deepEqual(compareFacts(short, shortAfter, { language: "de" }).lost, []);
  assert.equal(compareFacts(GERMAN_BEFORE, GERMAN_AFTER.replace("Herr Krause", "Krause").replace("Mittelständler", "Firmen"), { language: "en" }).lost.length > 0, true);
});

test("slop --compare on the h17 pair reports no lost noun, and it still reports a changed fact", () => {
  const r = run(["--compare", fixture("h17", "sammlung.md"), golden("h17", "sammlung.md")]);
  assert.doesNotMatch(r.out, /^(lost|added)\s+name\s/m);
  const kept = /facts: (\d+) kept/.exec(r.out);
  assert.ok(kept && Number(kept[1]) >= 5, `extraction found ${kept?.[1]} facts`);
  assert.equal(r.code, 0);
  const text = readFileSync(golden("h17", "sammlung.md"), "utf8");
  const digit = /\d+/.exec(text)![0];
  const changed = run(["--compare", golden("h17", "sammlung.md"), "-"], { input: text.replace(digit, String(Number(digit) + 1)) });
  assert.equal(changed.code, 1);
  assert.match(changed.out, new RegExp(`^lost\\s+number\\s+${digit}$`, "m"));
  const d = run(["--language", "de", "--compare", fixture("h10", "post.md"), golden("h10", "post.md")]);
  assert.doesNotMatch(d.out, /^(lost|added)\s+name\s/m);
});

// --- first-person words and claim words ---------------------------------------------------

const kinds = (before: string, after: string, language = "en") => {
  const r = compareFacts(before, after, { language });
  return { added: r.added.filter((f) => f.kind === "person" || f.kind === "claim").map((f) => `${f.kind} ${f.value}`), lost: r.lost.filter((f) => f.kind === "person" || f.kind === "claim").map((f) => `${f.kind} ${f.value}`) };
};

test("an owner the source never named is an added person fact: In benchmarks becomes In our benchmarks", () => {
  const r = kinds("In benchmarks, the parser is faster.", "In our benchmarks, the parser is faster.");
  assert.deepEqual(r.added, ["person our"]);
  assert.deepEqual(r.lost, []);
});

test("person facts compare counts: one we before and two after is an added we", () => {
  assert.deepEqual(kinds("We shipped it.", "We shipped it. We tested it.").added, ["person we"]);
  assert.deepEqual(kinds("We shipped it. We tested it.", "We shipped it. We tested it.").added, []);
});

test("a first-person word inside quotation marks, a code span, a fence or a url is not read", () => {
  const quoted = 'The maintainer said "we will fix our parser soon" on the issue.';
  assert.deepEqual(kinds("The maintainer replied.", quoted).added, []);
  assert.deepEqual(kinds("A reply.", "A reply: “we will fix our parser soon”.").added, []);
  assert.deepEqual(kinds("A reply.", "A reply: «nous allons corriger notre code».").added, []);
  assert.deepEqual(kinds("A reply.", "A reply: „wir beheben unseren Fehler“.").added, []);
  assert.deepEqual(kinds("Run it.", "Run it with `our --we flag`.").added, []);
  assert.deepEqual(kinds("Run it.", "Run it:\n\n```sh\necho our we\n```\n").added, []);
  assert.deepEqual(kinds("See the page.", "See https://example.org/our/we/page for the page.").added, []);
  // Outside the quotation the word counts again.
  assert.deepEqual(kinds("A reply.", 'A reply: "we agree". Our team agrees.').added, ["person our"]);
});

test("German, French, Spanish and Turkish first-person words are added facts in their language", () => {
  assert.deepEqual(kinds("Die Messung zeigt zwei Fehler im Parser.", "Unsere Messung zeigt zwei Fehler im Parser.", "de").added, ["person unsere"]);
  assert.deepEqual(kinds("Wir danken für die Hilfe.", "Wir danken für die Hilfe. Wir bleiben dran.", "de").added, ["person wir"]);
  assert.deepEqual(kinds("Les mesures montrent deux erreurs.", "Nous voyons dans les mesures deux erreurs.", "fr").added, ["person nous"]);
  assert.deepEqual(kinds("Las pruebas muestran dos errores.", "Nuestras pruebas muestran dos errores.", "es").added, ["person nuestras"]);
  assert.deepEqual(kinds("Ölçümler iki hata gösteriyor.", "Bizim ölçümler iki hata gösteriyor.", "tr").added, ["person bizim"]);
  // A word of another language's list is not read: English "we" in German text is no person fact.
  assert.deepEqual(kinds("Die Messung zeigt zwei Fehler.", "Die Messung zeigt we zwei Fehler.", "de").added, []);
  assert.equal(countPersonWords("Die Messung zeigt we zwei Fehler.", "de").size, 0);
  assert.equal(countPersonWords("Ben bizim, ich wir.", "tr").has("ich"), false);
});

test("a dropped first-person word is a lost person fact for the words that passed the measurement", () => {
  assert.deepEqual(kinds("Notre équipe a mesuré deux erreurs.", "L'équipe a mesuré deux erreurs.", "fr").lost, ["person notre"]);
  // "we" flagged golden rewrites when dropped, so dropping it is not reported.
  assert.deepEqual(kinds("We measured two errors.", "Two errors were measured.").lost, []);
});

test("a capital I that is a Roman numeral, a list marker, I/O or an abbreviation is not the pronoun", () => {
  const count = (text: string) => countPersonWords(text, "en").get("i") ?? 0;
  assert.equal(count("I think it works."), 1);
  assert.equal(count("Part I covers the setup."), 0);
  assert.equal(count("A Type I error is a false alarm."), 0);
  assert.equal(count("I. Setup\n\nII. Usage"), 0);
  assert.equal(count("- I. First item"), 0);
  assert.equal(count("Disk I/O is slow."), 0);
  assert.equal(count("The I.T. team."), 0);
  assert.equal(count("Henry I ruled."), 0);
  assert.equal(countPersonWords("I'm sure I've seen it.", "en").get("i'm"), 1);
});

test("US the country is not the pronoun us, and an all-capitals token is never read", () => {
  assert.equal(countPersonWords("The US market grew; the U.S. Senate agreed.", "en").get("us") ?? 0, 0);
  assert.equal(countPersonWords("Send us a note.", "en").get("us"), 1);
  assert.equal(countPersonWords("Contact ME for MA and MI.", "en").size, 0);
});

test("a word joined by a hyphen, underscore, slash, dot or @ is part of a name; link targets and addresses are not read", () => {
  assert.deepEqual(kinds("Deploy it to the default region.", "Deploy it to us-east-1, the default region.").added, []);
  assert.deepEqual(kinds("The bucket lives in us-east-1 and serves the API.", "The bucket serves the API.").lost, []);
  assert.deepEqual(kinds("See the guide.", "See the guide at my-org/my-app, or set my_var.").added, []);
  assert.deepEqual(kinds("Read the [guide](docs/guide.md).", "Read the [guide](docs/our-guide.md).").added, []);
  assert.deepEqual(kinds("Write to [the team](#team).", "Write to [the team](#us).").added, []);
  assert.deepEqual(kinds("Visit the site.", "Visit www.our-site.com or write to our@example.org or <mailto:us@example.org>.").added, []);
  // The link text is still read, and a spaced dash does not join.
  assert.deepEqual(kinds("Read the [guide](docs/guide.md).", "Read [our guide](docs/guide.md).").added, ["person our"]);
  assert.deepEqual(kinds("It works.", "It works -- we tested it.").added, ["person we"]);
  // In French a hyphen joins real pronouns.
  assert.deepEqual(kinds("Écrivez à l'équipe.", "Contactez-nous.", "fr").added, ["person nous"]);
  assert.equal(countPersonWords("Nous-mêmes l'avons mesuré.", "fr").get("nous"), 1);
});

test("a fence that is never closed hides the rest of the text, as in CommonMark", () => {
  assert.deepEqual(kinds("Run it.", "Run it.\n\n```sh\necho our we\n").added, []);
});

test("curly apostrophes and French elision are read; a lowercase i is never read", () => {
  assert.equal(countPersonWords("We’re ready and I’m sure.", "en").get("we're"), 1);
  assert.equal(countPersonWords("We’re ready and I’m sure.", "en").get("i'm"), 1);
  assert.equal(countPersonWords("J’ai mesuré, puis j'ai corrigé.", "fr").get("j'"), 2);
  assert.equal(countPersonWords("i'm sure i is the loop index.", "en").size, 0);
});

test("person words that failed the measurement are counted but never flagged when added", () => {
  // `i`, `i'd` and German `uns` flagged too many honest rewrites when added.
  assert.deepEqual(kinds("It helps.", "I think it helps, and I'd keep it.").added, []);
  assert.equal(countPersonWords("I think it helps, and I'd keep it.", "en").get("i"), 1);
  assert.deepEqual(kinds("Das hilft.", "Das hilft uns.", "de").added, []);
});

test("the person lists follow the language: none for a language without a list, front matter turns one on", () => {
  assert.deepEqual(kinds("Il parser è veloce.", "Il nostro parser è veloce, we said.", "sv").added, []);
  assert.equal(countPersonWords("Il nostro parser è veloce, we said.", "sv").size, 0);
  const de = (body: string) => `---\nlang: de\n---\n\n${body}`;
  assert.deepEqual(kinds(de("Die Messung zeigt zwei Fehler."), de("Unsere Messung zeigt zwei Fehler."), "auto").added, ["person unsere"]);
  // Without the front matter, a short German text is not detected and is read as English.
  assert.deepEqual(kinds("Die Messung zeigt zwei Fehler.", "Unsere Messung zeigt zwei Fehler.", "auto").added, []);
});

test("a claim word inside a hyphenated word is not that claim word, and leading alone is no claim", () => {
  assert.deepEqual(kinds("A task.", "A never-ending, always-on task.").added, []);
  assert.deepEqual(kinds("Strip the slash from the path.", "Strip the leading slash from the path.").added, []);
  assert.deepEqual(kinds("A tool.", "An industry-leading tool.").added, ["claim industry-leading"]);
});

test("a claim word added is flagged; removing one is not", () => {
  assert.deepEqual(kinds("The parser is fast.", "The parser is always fast.").added, ["claim always"]);
  assert.deepEqual(kinds("The parser is always fast, guaranteed.", "The parser is fast.").added, []);
  assert.deepEqual(kinds("The parser is always fast, guaranteed.", "The parser is fast.").lost, []);
  // More of the same word counts as added; the same count does not.
  assert.deepEqual(kinds("It never fails.", "It never fails and never leaks.").added, ["claim never"]);
  assert.deepEqual(kinds("It never fails.", "It never fails.").added, []);
  // A multi-word phrase and a quoted claim.
  assert.deepEqual(kinds("The cache was rebuilt.", "The cache was rebuilt, so that  startup is quick.").added, ["claim so that"]);
  assert.deepEqual(kinds("The cache was rebuilt.", 'The cache was rebuilt ("always fresh").').added, []);
  // French and German claim words are read in their language only.
  assert.deepEqual(kinds("Le cache est reconstruit.", "Le cache est toujours reconstruit.", "fr").added, ["claim toujours"]);
  assert.deepEqual(kinds("Der Cache wird gebaut.", "Der Cache wird immer gebaut.", "de").added, ["claim immer"]);
  assert.deepEqual(kinds("The car is red.", "The car is red.", "en").added, []);
});

test("words that flagged a golden rewrite or too many honest rewrites are not claim words", () => {
  // `only`, `everyone`, `best` and `nobody` each flagged a golden rewrite in the measurement.
  assert.deepEqual(kinds("It is a plan.", "It is the only plan for everyone, the best for nobody.").added, []);
});

const walk = (dir: string, base = ""): string[] =>
  readdirSync(dir).flatMap((f) => {
    const rel = base ? `${base}/${f}` : f;
    return statSync(join(dir, f)).isDirectory() ? walk(join(dir, f), rel) : [rel];
  });

test("no golden rewrite of any head-to-head task has an added or lost person or claim fact", () => {
  let pairs = 0;
  for (const task of readdirSync(join(bench, "fixtures"))) {
    for (const file of walk(join(bench, "fixtures", task))) {
      if (!file.endsWith(".md") || !existsSync(golden(task, file))) continue;
      pairs++;
      const r = compareFacts(readFileSync(fixture(task, file), "utf8"), readFileSync(golden(task, file), "utf8"));
      const bad = [...r.added, ...r.lost].filter((f) => f.kind === "person" || f.kind === "claim");
      assert.deepEqual(bad, [], `${task}/${file}`);
    }
  }
  assert.ok(pairs >= 20, `only ${pairs} golden pairs were read`);
});

test("the round 1 failures are caught: h2-ours-2 and h2-ours-3 add our, the honest h2-blader-1 does not", () => {
  const run = (name: string) => join(bench, "results", "round-1", "runs", name, "README.md");
  const source = readFileSync(fixture("h2", "README.md"), "utf8");
  for (const name of ["h2-ours-2", "h2-ours-3"]) {
    const r = compareFacts(source, readFileSync(run(name), "utf8"));
    assert.deepEqual(r.added.filter((f) => f.kind === "person"), [{ kind: "person", value: "our" }], name);
  }
  const honest = compareFacts(source, readFileSync(run("h2-blader-1"), "utf8"));
  assert.deepEqual([...honest.added, ...honest.lost], []);
});

test("slop --compare prints a person line and exits 1; a removed claim exits 0; --json carries the kind", async () => {
  const ours2 = join(bench, "results", "round-1", "runs", "h2-ours-2", "README.md");
  const added = run(["--compare", fixture("h2", "README.md"), ours2]);
  assert.equal(added.code, 1);
  assert.match(added.out, /^added\s+person\s+our$/m);
  const json = JSON.parse(run(["--json", "--compare", fixture("h2", "README.md"), ours2]).out) as { added: { kind: string; value: string }[] };
  assert.deepEqual(json.added, [{ kind: "person", value: "our" }]);
  const dir = await mkdtemp(join(tmpdir(), "slop-claims-"));
  try {
    await writeFile(join(dir, "before.md"), "The parser is always fast, guaranteed.\n");
    await writeFile(join(dir, "after.md"), "The parser is fast.\n");
    const removed = run(["--language", "en", "--compare", "before.md", "after.md"], { cwd: dir });
    assert.equal(removed.code, 0, removed.out);
    const readded = run(["--language", "en", "--compare", "after.md", "before.md"], { cwd: dir });
    assert.equal(readded.code, 1);
    assert.match(readded.out, /^added\s+claim\s+always$/m);
    assert.match(readded.out, /^added\s+claim\s+guaranteed$/m);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  assert.match(run(["--help"]).out, /first-person words, claim words and number qualifiers/);
});

test("the shipped word lists match what bench/compare-words.mjs keeps, and the table is current", () => {
  const r = spawnSync("node", [join(process.cwd(), "bench", "compare-words.mjs"), "--check"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  // Where the round 1 scores were left out (the cloud squash), only the partial check can run, and it says so.
  const evidence = existsSync(join(bench, "results", "round-1", "scores.json"));
  assert.match(r.stdout, evidence ? /^compare words up to date/ : /partial check passed.*evidence left out of the cloud squash/);
});

// --- qualifiers (round 3 plan item 9) ---------------------------------------------------------
// A qualifier next to a number is part of the fact: "about 40%" is not "40%". The kept list is measured
// by bench/compare-qualifiers.mjs on the goldens, the round 1 rewrites and test/fixtures/compare-qualifiers.json.

const q = (before: string, after: string, language = "en") => {
  const r = compareFacts(before, after, { language });
  return { lost: r.lost.filter((f) => f.kind === "qualifier").map((f) => f.value), added: r.added.filter((f) => f.kind === "qualifier").map((f) => f.value) };
};

test("qualifier: a dropped bound is lost, an added one is added, and the number itself is kept", () => {
  assert.deepEqual(compareFacts("It handles up to 3 retries.", "It handles 3 retries.", { language: "en" }), { lost: [{ kind: "qualifier", value: "up to 3" }], added: [], kept: 1 });
  assert.deepEqual(q("The project has 300 contributors.", "The project has more than 300 contributors."), { lost: [], added: ["more than 300"] });
  assert.deepEqual(q("Startup takes roughly 2 seconds.", "Startup takes at most 2 seconds."), { lost: ["roughly 2"], added: ["at most 2"] });
});

test("qualifier: a swap within a group is silent, a move between groups is not", () => {
  assert.deepEqual(q("Startup takes roughly 2 seconds.", "Startup takes around 2 seconds."), { lost: [], added: [] });
  assert.deepEqual(q("With over 300 contributors.", "It has more than 300 contributors."), { lost: [], added: [] });
  assert.deepEqual(q("It runs in under 5 minutes.", "It runs in less than 5 minutes."), { lost: [], added: [] });
  assert.deepEqual(q("Nearly 12 teams.", "At least 12 teams."), { lost: ["nearly 12"], added: ["at least 12"] });
});

test("qualifier: a changed number is a number fact only, not a qualifier fact too", () => {
  const r = compareFacts("It handles up to 3 retries.", "It handles 4 retries.", { language: "en" });
  assert.deepEqual(r.lost, [{ kind: "number", value: "3" }]);
  assert.deepEqual(r.added, [{ kind: "number", value: "4" }]);
});

test("qualifier: counts matter when a number occurs twice", () => {
  assert.deepEqual(q("Up to 3 workers, and up to 3 queues.", "Up to 3 workers, and 3 queues."), { lost: ["up to 3"], added: [] });
  assert.deepEqual(q("Up to 3 workers, and 3 queues.", "3 workers, and up to 3 queues."), { lost: [], added: [] });
});

test("qualifier: French, German and Spanish forms, with the decimal comma, thousands and an apostrophe of either kind", () => {
  assert.deepEqual(q("Le build est environ 40 % plus rapide.", "Le build est 40 % plus rapide.", "fr"), { lost: ["environ 40"], added: [] });
  assert.deepEqual(q("L'offre couvre jusqu’à 30 requêtes.", "L'offre couvre jusqu'à 30 requêtes.", "fr"), { lost: [], added: [] });
  assert.deepEqual(q("Der Tarif umfasst bis zu 1.000 Anfragen.", "Der Tarif umfasst 1.000 Anfragen.", "de"), { lost: ["bis zu 1.000"], added: [] });
  assert.deepEqual(q("Der Build ist etwa 2,5 Sekunden schneller.", "Der Build ist rund 2,5 Sekunden schneller.", "de"), { lost: [], added: [] });
  assert.deepEqual(q("Ca. 30 % weniger.", "30 % weniger.", "de"), { lost: ["ca 30"], added: [] });
  assert.deepEqual(q("300 personas contribuyen.", "Más de 300 personas contribuyen.", "es"), { lost: [], added: ["más de 300"] });
  assert.deepEqual(q("Up to $3,000 a month.", "$3000 a month."), { lost: ["up to 3000"], added: [] });
});

test("qualifier: other senses of a qualifier word are not read", () => {
  assert.deepEqual(qualifiedNumbers("We talked about 3 options.", "en", ["about"]), []);
  assert.deepEqual(qualifiedNumbers("Builds are about 3 times faster.", "en", ["about"]).length, 1, "about as an approximator is read when asked for");
  assert.deepEqual(q("The rollout ran over 2 weeks.", "The rollout ran across 2 weeks."), { lost: [], added: [] });
  assert.deepEqual(q("It has over 2 maintainers.", "It has 2 maintainers."), { lost: ["over 2"], added: [] });
  assert.deepEqual(q("Die Umstellung lief über 2 Wochen.", "Die Umstellung lief in 2 Wochen.", "de"), { lost: [], added: [] });
  assert.deepEqual(q("El soporte sigue hasta 2025.", "El soporte sigue hasta el año 2025.", "es"), { lost: [], added: [] });
  assert.deepEqual(q("Cubre hasta 1000 solicitudes.", "Cubre 1000 solicitudes.", "es"), { lost: ["hasta 1000"], added: [] });
  assert.deepEqual(qualifiedNumbers("takeover 3 and over40", "en", ["over"]), [], "inside a word or glued to the digits");
});

test("qualifier: code, urls and quotations are not read, and a language with no list has none", () => {
  assert.deepEqual(q("Run `up to 3` now.", "Run `up to 3` now. Then 3."), { lost: [], added: [] });
  assert.deepEqual(q('She said "up to 3 people came".', "She said 3."), { lost: [], added: [] });
  assert.deepEqual(qualifiedNumbers("fino a 3 persone, up to 3", "sv"), []);
  assert.deepEqual(qualifierChanges("up to 3", "3", "tr"), { lost: [], added: [] });
});

test("qualifier: English about and approximately are measured but not shipped", () => {
  assert.ok(!QUALIFIERS.en!.includes("about") && !QUALIFIERS.en!.includes("approximately"));
  assert.deepEqual(q("Builds are about 40% faster.", "Builds are 40% faster."), { lost: [], added: [] });
});

test("qualifier: every hand-written honest pair is clean and every dishonest pair reports exactly its lines", () => {
  const pairs = JSON.parse(readFileSync(join(process.cwd(), "test", "fixtures", "compare-qualifiers.json"), "utf8")) as {
    honest: { lang: string; before: string; after: string }[];
    dishonest: { lang: string; before: string; after: string; lost: string[]; added: string[] }[];
  };
  for (const p of pairs.honest) assert.deepEqual(q(p.before, p.after, p.lang), { lost: [], added: [] }, p.before);
  // The one dishonest pair the shipped list misses is the dropped English `about`.
  const missed = pairs.dishonest.filter((p) => JSON.stringify(q(p.before, p.after, p.lang)) !== JSON.stringify({ lost: p.lost, added: p.added }));
  assert.deepEqual(missed.map((p) => p.before), ["Builds are about 40% faster."]);
});

test("slop --compare prints a qualifier line and exits 1; --help and --json name the kind", async () => {
  const dir = await mkdtemp(join(tmpdir(), "slop-qualifier-"));
  try {
    await writeFile(join(dir, "before.md"), "The free tier covers up to 1000 requests a day.\n");
    await writeFile(join(dir, "after.md"), "The free tier covers 1000 requests a day.\n");
    const r = run(["--language", "en", "--compare", "before.md", "after.md"], { cwd: dir });
    assert.equal(r.code, 1, r.out);
    assert.match(r.out, /^lost\s+qualifier\s+up to 1000$/m);
    const json = JSON.parse(run(["--language", "en", "--json", "--compare", "before.md", "after.md"], { cwd: dir }).out) as { lost: { kind: string; value: string }[] };
    assert.deepEqual(json.lost, [{ kind: "qualifier", value: "up to 1000" }]);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  assert.match(run(["--help"]).out, /qualifier/);
});

test("the shipped qualifiers match what bench/compare-qualifiers.mjs keeps, and the table is current", () => {
  const r = spawnSync("node", [join(process.cwd(), "bench", "compare-qualifiers.mjs"), "--check"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, existsSync(join(bench, "results", "round-1", "runs")) ? /^compare qualifiers up to date/ : /partial check passed/);
});
