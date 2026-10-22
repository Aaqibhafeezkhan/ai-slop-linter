import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, copyFileSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { lintText } from "../src/index.js";
import type { Finding } from "../src/index.js";
import { handleMessage } from "../src/mcp.js";

const root = join(import.meta.dirname, "..", "..");
const read = (...parts: string[]) => readFileSync(join(root, ...parts), "utf8");
const dashes = (findings: Finding[]) => findings.filter((f) => f.rule === "dash");
const cli = (args: string[], cwd = root) => spawnSync(process.execPath, [join(root, "dist", "src", "cli.js"), ...args], { cwd, encoding: "utf8" });

const H1 = read("bench", "head-to-head", "fixtures", "h1", "note.md");
const H5 = read("bench", "head-to-head", "fixtures", "h5", "guide.md");

const SPANISH =
  "Por la mañana tomamos el café en la cocina con los niños. Ella dijo que el tren todavía no ha llegado a la estación, y nadie sabe por qué. Los resultados están en el informe que se encuentra en la mesa del director.";

const ENGLISH =
  "The release went out on Tuesday with the new parser, and the team spent the week fixing the small problems that users reported. The notes below describe what changed and what the next steps are for the group.";

test("a French note with no options is detected as fr and gets no dash finding", () => {
  const r = lintText("note.md", H1);
  assert.equal(r.language, "fr");
  assert.equal(r.languageSource, "detected");
  assert.deepEqual(dashes(r.findings), []);
  assert.ok(r.stoodDown.includes("dash"));
});

test("a declared English tag keeps the dash rule on for French prose, but the note's dialogue and quotes stay exempt", () => {
  // The note's dashes are dialogue openers and dashes inside guillemets, which are typography and
  // exempt under any declared language. Plain French prose with a mid-sentence dash is not.
  const prose = "Le service — celui-ci — permet aux clients de voir leur commande.";
  // Under declared English the note's paragraph-first dialogue lines are exempt, but its
  // continuation dialogue lines ("— Environ quatorze minutes…") are not, and fire.
  const declaredNote = dashes(lintText("note.md", H1, { language: "en" }).findings);
  const noteLines = H1.split("\n");
  const onLine = (needle: string) => declaredNote.filter((f) => (noteLines[f.line - 1] ?? "").includes(needle)).length;
  assert.equal(onLine("Combien de temps"), 0, "a paragraph-first dialogue line is exempt");
  assert.ok(onLine("Environ quatorze minutes") >= 1, "a continuation dialogue line fires under declared English");
  const text = `${H1}\n\n${prose}\n`;
  const declared = lintText("note.md", text, { language: "en" });
  assert.equal(declared.languageSource, "declared");
  const proseLine = text.split("\n").findIndex((l) => l.includes("Le service")) + 1;
  assert.equal(dashes(declared.findings).filter((f) => f.line === proseLine).length, 2);
  assert.deepEqual(dashes(lintText("note.md", text).findings), [], "undeclared: the file is French and the rule stands down");
});

test("language auto means undeclared, so the same result as no options", () => {
  const auto = lintText("note.md", H1, { language: "auto" });
  const none = lintText("note.md", H1);
  assert.equal(auto.language, "fr");
  assert.equal(auto.languageSource, "detected");
  assert.deepEqual(auto.findings, none.findings);
});

test("in the mixed h5 guide, English dashes are found and the Spanish, German and French lines are not", () => {
  // Lines are found by their content, so the test survives edits to the fixture.
  const english = "The rollout finished early, and the support team noticed the change at once — nobody expected it.";
  const text = `${H5}\n${english}\n`;
  const r = lintText("guide.md", text);
  assert.equal(r.language, "en");
  assert.equal(r.languageSource, "detected");
  const lines = text.split("\n");
  const lineWith = (needle: string) => {
    const index = lines.findIndex((l) => l.includes(needle));
    assert.ok(index >= 0, `fixture line not found: ${needle}`);
    return index + 1;
  };
  const dashLines = new Set(dashes(r.findings).map((f) => f.line));
  for (const needle of ["¿Cuánto tarda el envío?", "Unos cuatro días", "Der Support schrieb", "La directrice a déclaré"]) {
    assert.ok(!dashLines.has(lineWith(needle)), `a dash finding fell on the line with "${needle}"`);
  }
  assert.ok(dashLines.has(lineWith(english)), "the English dash added to the copy is still found");
  assert.ok(dashLines.has(lineWith("This guide delves into the pivotal steps")), "the English dash in the guide's own intro is still found");
  assert.ok(r.findings.some((f) => f.rule !== "dash"), "the English prose tells are still reported");
});

test("a Spanish dialogue file with raya dashes is detected as es", () => {
  const dialogue = Array.from({ length: 4 }, () => `— Hola —dijo Ana—. ${SPANISH}`).join("\n\n");
  const r = lintText("dialogue.md", dialogue);
  assert.equal(r.language, "es");
  assert.equal(r.languageSource, "detected");
  assert.deepEqual(dashes(r.findings), []);
});

test("front matter lang wins over a text that would detect as English", () => {
  const text = `---\nlang: de\n---\n\n${ENGLISH}\n`;
  const r = lintText("note.md", text);
  assert.equal(r.language, "de");
  assert.equal(r.languageSource, "front-matter");
  assert.ok(r.stoodDown.includes("dash"));
});

test("an English README with one em dash still fails (regression)", () => {
  const readme = `# Project\n\n${ENGLISH.replace("the new parser,", "the new parser —")}\n`;
  const r = lintText("README.md", readme);
  assert.equal(r.language, "en");
  assert.deepEqual(r.stoodDown, []);
  assert.equal(dashes(r.findings).length, 1);
});

test("inside an English file, a long Spanish paragraph is exempt and an English dash beside it is not", () => {
  const text = `${ENGLISH} The plan is simple — ship it.\n\n${SPANISH} Hay una raya — y nada más.\n`;
  const r = lintText("mixed.md", text);
  assert.equal(r.language, "en");
  const found = dashes(r.findings);
  assert.equal(found.length, 1, JSON.stringify(found));
  assert.match(text.split("\n")[found[0]!.line - 1] ?? "", /ship it/);
});

test("a declared English tag does not apply the per-paragraph guess, so the Spanish paragraph's dash is flagged", () => {
  const text = `${ENGLISH}\n\n${SPANISH} Hay una raya — y nada más.\n`;
  assert.deepEqual(dashes(lintText("mixed.md", text).findings), [], "undeclared: the paragraph is Spanish and exempt");
  const declared = lintText("mixed.md", text, { language: "en" });
  assert.equal(declared.languageSource, "declared");
  assert.equal(dashes(declared.findings).length, 1, "declared English keeps the paragraph guess off");
});

test("the typeset typography files of fr, es, de, it, pt and nl get no dash finding with no options", () => {
  // bench/typography.mjs measures the typeset column by restoring each `--` to an em dash. This
  // runs the same transformation, so the files exercise the exemption rather than a clean
  // transcription.
  const files = readdirSync(join(root, "bench", "typography")).filter((n) => /^(fr|es|de|it|pt|nl)-.*\.md$/.test(n));
  assert.equal(files.length, 6);
  for (const name of files) {
    const typeset = read("bench", "typography", name).replace(/--/g, "—");
    // The Italian text has no dash once typeset, only guillemets, so it cannot exercise the dash
    // exemption under any setting. It is still required to lint clean.
    if (name.startsWith("it-")) assert.equal(typeset.includes("—"), false, name);
    else assert.ok(typeset.includes("—"), `${name} has no em dash to exercise`);
    const r = lintText(name, typeset);
    assert.equal(r.language, name.slice(0, 2), name);
    assert.deepEqual(dashes(r.findings), [], name);
  }
});

test("a German heading of capitalised nouns is not a Title Case finding, and the footer says the rule stood down", () => {
  const german =
    "# Sammlung\n\n## Ein Login. Alle Quellen.\n\nDie Zahlen sprechen für sich. Unser Tool entscheidet selbst, welche Dokumente relevant sind und welche nicht. Obwohl die Suche vielversprechend ist, bleibt die Datenqualität eine Herausforderung für das Team. Der Druck ist real, und wir arbeiten jeden Tag daran, die Ergebnisse zu verbessern.\n";
  const r = lintText("sammlung.md", german);
  assert.equal(r.language, "de");
  assert.deepEqual(r.findings.filter((f) => f.rule === "title-case-heading"), []);
  assert.ok(r.stoodDown.includes("title-case-heading"));
  // The same heading in an English file is still reported.
  const english = lintText("a.md", "## Getting Started With The Parser\n\n" + ENGLISH + "\n");
  assert.equal(english.findings.filter((f) => f.rule === "title-case-heading").length, 1);
});

test("a declared non-English language prints the one-line footer naming both rules that stood down", () => {
  const run = cli(["--warn", "--language", "fr", "bench/head-to-head/fixtures/h1/note.md"]);
  assert.equal(run.status, 0, run.stderr);
  assert.ok(run.stdout.split("\n").includes("dash, title-case-heading did not run: the declared language is not English."), run.stdout);
});

test("the CLI reports the detected language in its footer on the French note", () => {
  // --warn: the French pack now flags this fixture, so exit 1 is correct without it. This test is about the footer.
  const run = cli(["--warn", "bench/head-to-head/fixtures/h1/note.md"]);
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /dash, title-case-heading did not run for bench\/head-to-head\/fixtures\/h1\/note\.md: language fr \(detected\)/);
});

test("the footer caps the per-file lines at five and says how many more", () => {
  const dir = mkdtempSync(join(tmpdir(), "slop-cap-"));
  const names = Array.from({ length: 6 }, (_, i) => join(dir, `note${i + 1}.md`));
  for (const name of names) copyFileSync(join(root, "bench", "head-to-head", "fixtures", "h1", "note.md"), name);
  const run = cli(["--warn", ...names]);
  const lines = run.stdout.split("\n").filter((l) => l.includes(" did not run for "));
  assert.equal(lines.length, 5, run.stdout);
  assert.match(run.stdout, /^and 1 more$/m);
});

test("--language auto through the CLI is undeclared: the footer names the detected language", () => {
  const run = cli(["--warn", "--language", "auto", "bench/head-to-head/fixtures/h1/note.md"]);
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /dash, title-case-heading did not run for .*note\.md: language fr \(detected\)/);
});

test(".slop.json with language auto is undeclared through the CLI", () => {
  const dir = mkdtempSync(join(tmpdir(), "slop-config-"));
  writeFileSync(join(dir, ".slop.json"), JSON.stringify({ language: "auto" }));
  copyFileSync(join(root, "bench", "head-to-head", "fixtures", "h1", "note.md"), join(dir, "note.md"));
  const run = cli(["--cwd", dir, "note.md"]);
  assert.match(run.stdout, /dash, title-case-heading did not run for note\.md: language fr \(detected\)/);
});

test("the JSON output carries language and languageSource for the French note", () => {
  const run = cli(["--format", "json", "bench/head-to-head/fixtures/h1/note.md"]);
  const [file] = JSON.parse(run.stdout) as Array<{ language: string; languageSource: string }>;
  assert.equal(file?.language, "fr");
  assert.equal(file?.languageSource, "detected");
});

test("the MCP check_slop result carries language and languageSource", () => {
  const reply = handleMessage(
    JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "check_slop", arguments: { text: H1 } } }),
    "test",
  );
  const payload = (reply?.result as { structuredContent: { language: string; languageSource: string } }).structuredContent;
  assert.equal(payload.language, "fr");
  assert.equal(payload.languageSource, "detected");
});

test("the dash rule: dialogue lines, guillemets and German low quotes are exempt; English quotes and mid-line dashes are not", () => {
  const exempt = [
    "— Hola —dijo Ana—, pero el tren ya llegó a la estación hoy.",
    "– Pues vamos, que la cola ya es larga y no hay sitio.",
    "She wrote « Je viens — demain — présenter » in her notes today.",
    "Der Support schrieb: „Wir melden uns — versprochen“ heute.",
    "Der Support schrieb: „Wir melden uns — versprochen” heute.",
  ];
  for (const line of exempt) assert.equal(dashes(lintText("x.md", line).findings).length, 0, line);
  // Negatives: an English sentence with a mid-line dash, an English quotation with a dash, and
  // a list item whose marker is a hyphen all keep their findings.
  assert.equal(dashes(lintText("x.md", "The team shipped the release — and nobody expected it.").findings).length, 1);
  assert.equal(dashes(lintText("x.md", 'She wrote "the team shipped it — finally" in her notes.').findings).length, 1);
  assert.equal(dashes(lintText("x.md", "She wrote “the team shipped it — finally” in her notes.").findings).length, 1);
  const list = lintText("x.md", "- The team shipped the release — and nobody expected it.");
  assert.equal(dashes(list.findings).length, 1);
  assert.equal(list.findings.filter((f) => f.message === "spaced hyphen used as a dash").length, 0);
});

test("the dash rule: a dialogue dash opens a paragraph, a hard-wrapped continuation line does not, and a dash before a digit is not dialogue", () => {
  // The first line of a paragraph is dialogue and exempt, including the inner rayas.
  assert.deepEqual(dashes(lintText("x.md", "— Hola —dijo Ana.").findings), []);
  // A hard-wrapped continuation line that starts with a dash is prose: both dashes fire.
  const wrapped = lintText("x.md", "The release went out when the team was\n— as always — surprised by the result.");
  assert.equal(dashes(wrapped.findings).length, 2, JSON.stringify(dashes(wrapped.findings)));
  // A dash before a digit is not dialogue. An en dash before a digit is never a finding (the rule
  // reads it as a minus or a range), so an en dash before a digit gives none; an em dash before a digit is one.
  assert.equal(dashes(lintText("x.md", "The forecast was clear.\n\n–5 degrees at dawn, so the team wore coats.").findings).length, 0);
  assert.equal(dashes(lintText("x.md", "The forecast was clear.\n\n—5 degrees at dawn, so the team wore coats.").findings).length, 1);
});
