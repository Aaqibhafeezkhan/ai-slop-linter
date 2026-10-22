import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, existsSync, mkdirSync, mkdtempSync, symlinkSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// The frozen head-to-head tasks: their prompts, the scripted checks, and the golden outputs
// that must pass those checks. Nothing here calls the linter; the checks are plain Node.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BENCH = join(ROOT, "bench", "head-to-head");
const CHECK = join(BENCH, "checks", "check.mjs");
const IDS = ["h1", "h2", "h3", "h4", "h5", "h6", "h7", "h8", "h9", "h10", "h11", "h12", "h13", "h14", "h15", "h16", "h17", "h18"];
const RETIRED = ["h4", "h5", "h6", "h7", "h8", "h12"];
const ACTIVE = IDS.filter((id) => !RETIRED.includes(id));
const NEW = ["h13", "h14", "h15", "h16", "h17", "h18"];
const HOME_OLD = ["h7", "h8", "h9", "h10", "h11", "h12"];
const HOME_NEW = ["h16", "h17", "h18"];
const HOME = [...HOME_OLD, ...HOME_NEW];
const CRITERIA = ["C1", "C2", "C3", "C4", "C5"];

const load = () => JSON.parse(readFileSync(join(BENCH, "tasks.json"), "utf8"));

function runCheck(id, dir) {
  const r = spawnSync(process.execPath, [CHECK, id, dir], { encoding: "utf8", timeout: 300000 });
  assert.equal(r.status, 0, `check.mjs ${id} ${dir} exited ${r.status}: ${r.stderr}`);
  return JSON.parse(r.stdout.trim().split("\n").pop());
}

function listFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}

test("tasks.json holds eighteen tasks, each with five criteria of a known kind and a status", () => {
  const t = load();
  assert.equal(t.version, 1);
  assert.equal(t.frozen, "2026-10-21");
  assert.deepEqual(t.tasks.map((x) => x.id), IDS);
  for (const task of t.tasks) {
    assert.ok(task.title && task.fixture && task.prompt, `${task.id} has title, fixture and prompt`);
    assert.ok(["active", "retired"].includes(task.status), `${task.id} status`);
    assert.deepEqual(task.criteria.map((c) => c.id), CRITERIA, `${task.id} criteria ids`);
    for (const c of task.criteria) {
      assert.ok(c.text, `${task.id} ${c.id} has text`);
      assert.ok(["script", "blind"].includes(c.kind), `${task.id} ${c.id} kind`);
    }
  }
});

test("prompts of the active tasks are unique, and no prompt names a tool, except that h6 and h15 name their own lint:prose command", () => {
  const t = load();
  const active = t.tasks.filter((x) => x.status === "active");
  assert.equal(new Set(active.map((x) => x.prompt)).size, active.length);
  for (const task of t.tasks) {
    const bare = task.prompt.replaceAll("npm run lint:prose", "");
    for (const banned of ["ai-slop-linter", "slop", "linter", "lint"]) {
      assert.ok(!bare.toLowerCase().includes(banned), `${task.id} prompt mentions "${banned}"`);
    }
  }
});

test("every prompt appears verbatim in docs/HEAD-TO-HEAD.md", () => {
  const doc = readFileSync(join(ROOT, "docs", "HEAD-TO-HEAD.md"), "utf8");
  for (const task of load().tasks) {
    assert.ok(doc.includes(task.prompt), `${task.id} prompt is not in the document`);
  }
});

test("golden outputs pass every script criterion and leave blind criteria to a grader", () => {
  for (const task of load().tasks) {
    const res = runCheck(task.id, join(BENCH, "golden", task.id));
    for (const c of task.criteria) {
      const want = c.kind === "blind" ? null : true;
      assert.equal(res[c.id], want, `golden ${task.id} ${c.id}: ${JSON.stringify(res)}`);
    }
  }
});

test("each unmodified fixture fails at least one script criterion", () => {
  for (const task of load().tasks) {
    const res = runCheck(task.id, join(BENCH, "bad", task.id));
    const failed = task.criteria.filter((c) => c.kind === "script" && res[c.id] === false);
    assert.ok(failed.length > 0, `bad ${task.id} passes everything: ${JSON.stringify(res)}`);
  }
});

test("bad/ holds byte-identical copies of the fixtures", () => {
  for (const id of IDS) {
    for (const file of listFiles(join(BENCH, "fixtures", id))) {
      const rel = relative(join(BENCH, "fixtures", id), file);
      const copy = join(BENCH, "bad", id, rel);
      assert.ok(existsSync(copy), `bad/${id}/${rel} is missing`);
      assert.ok(readFileSync(copy).equals(readFileSync(file)), `bad/${id}/${rel} differs from the fixture`);
    }
  }
});

test("no file under checks/, checker-data/ or home/ imports, spawns, reads or names the linter or its build", () => {
  for (const dir of ["checks", "checker-data", "home"]) {
    for (const file of listFiles(join(BENCH, dir))) {
      const text = readFileSync(file, "utf8");
      assert.ok(!/ai-slop-linter|dist\//.test(text), `${relative(ROOT, file)} refers to the linter or its build`);
    }
  }
});

// ---- per-criterion cases ----------------------------------------------------------------------
// Each case edits one copy of a golden output and says which criterion must change. `expect` is
// the value that criterion must take afterwards. Every edit must match exactly once, so a case
// cannot pass vacuously because its text was not there.
const CASES = [
  // h1
  { id: "h1", crit: "C1", expect: false, what: "the quoted director line is cut down", file: "note.md",
    from: "« Je viens — enfin presque — demain présenter la version finale »", to: "« Je viens demain »" },
  { id: "h1", crit: "C1", expect: false, what: "one dialogue line loses its dash", file: "note.md",
    from: "— Et le prix ?", to: "Et le prix ?" },
  { id: "h1", crit: "C2", expect: false, what: "the price changes", file: "note.md",
    from: "29 euros", to: "30 euros" },
  { id: "h1", crit: "C3", expect: false, what: "a stock word is put back", file: "note.md",
    from: "Le temps de chargement passe", to: "Une révolution : le temps de chargement passe" },
  { id: "h1", crit: "C4", expect: false, what: "an English word is added", file: "note.md",
    from: "Contactez-nous si vous avez des questions.", to: "Contactez-nous si vous avez des questions, the team." },

  // h2
  { id: "h2", crit: "C1", expect: false, what: "drops Node 20", file: "README.md",
    from: "It requires Node 20 or later", to: "It requires a recent Node or later" },
  { id: "h2", crit: "C1", expect: false, what: "rewrites 2.3 as 1.2.3 everywhere (1.2.3 must not count as 2.3)", file: "README.md",
    from: "2.3", to: "1.2.3", all: true },
  { id: "h2", crit: "C2", expect: false, what: "gains an em dash", file: "README.md",
    from: "Fastq 2.3 is a queue for job processing.", to: "Fastq 2.3 is a queue — for job processing." },
  { id: "h2", crit: "C2", expect: false, what: "gains a stock word", file: "README.md",
    from: "is a queue for job processing.", to: "is a robust queue for job processing." },
  { id: "h2", crit: "C3", expect: false, what: "changes the install code block", file: "README.md",
    from: "npm install fastq@2.3", to: "npm install fastq@2.2" },
  { id: "h2", crit: "C3", expect: false, what: "changes the heading", file: "README.md",
    from: "# Fastq\n", to: "# FastQ\n" },
  { id: "h2", crit: "C3", expect: false, what: "changes the changelog line", file: "README.md",
    from: "See the [changelog](CHANGELOG.md) for details.", to: "See the changelog for details." },
  { id: "h2", crit: "C4", expect: false, what: "names an invented tool", file: "README.md",
    from: "is a queue for job processing.", to: "is a queue for job processing with Redis." },
  { id: "h2", crit: "C4", expect: false, what: "adds the first person word our", file: "README.md",
    from: "It requires Node 20 or later", to: "Our tests need Node 20 or later" },
  { id: "h2", crit: "C4", expect: false, what: "adds a number that the fixture does not have", file: "README.md",
    from: "on a single 4-core machine", to: "on a single 4-core machine with 8 GB" },

  // h3
  { id: "h3", crit: "C1", expect: false, what: "drops the issue number", file: "pr.md",
    from: "closes #311.", to: "closes the issue." },
  { id: "h3", crit: "C2", expect: false, what: "changes the fence language, so the block is not byte-identical", file: "pr.md",
    from: "```sh", to: "```bash" },
  { id: "h3", crit: "C3", expect: false, what: "adds an emoji to a heading", file: "pr.md",
    from: "## Overview", to: "## Overview ✨" },
  { id: "h3", crit: "C3", expect: false, what: "turns a bullet into a bold label", file: "pr.md",
    from: "- Auth: removes", to: "- **Auth:** removes" },
  { id: "h3", crit: "C3", expect: false, what: "adds an em dash", file: "pr.md",
    from: "Questions are welcome", to: "Questions — are welcome" },
  { id: "h3", crit: "C3", expect: false, what: "adds let me know", file: "pr.md",
    from: "Questions are welcome in the review comments.", to: "Questions are welcome in the review comments. Let me know." },
  { id: "h3", crit: "C4", expect: false, what: "adds a number that the fixture does not have", file: "pr.md",
    from: "Questions are welcome in the review comments.", to: "Questions are welcome in the review comments within 3 days." },

  // h4
  { id: "h4", crit: "C1", expect: false, what: "shortens a listed duration", file: "RELEASE-NOTES.md",
    from: "9 minutes 40 seconds", to: "9 minutes" },
  { id: "h4", crit: "C2", expect: false, what: "adds a number that the fixture does not have", file: "RELEASE-NOTES.md",
    from: "Version 2.9 agents keep working until 2026-12-01.", to: "Version 2.9 agents keep working until 2026-12-01. The rollout took 3 hours." },
  { id: "h4", crit: "C2", expect: false, what: "adds an invented URL", file: "RELEASE-NOTES.md",
    from: "Version 2.9 agents keep working until 2026-12-01.", to: "Version 2.9 agents keep working until 2026-12-01. Details: https://docs.harbor.example/v2/resume." },
  { id: "h4", crit: "C2", expect: false, what: "adds an invented name at a sentence start", file: "RELEASE-NOTES.md",
    from: "Priya Raman fixed the retry race", to: "Dana Whitfield and Priya Raman fixed the retry race" },
  { id: "h4", crit: "C2", expect: false, what: "adds an invented name mid-sentence", file: "RELEASE-NOTES.md",
    from: "As Priya put it", to: "As Priya and Dana Whitfield put it" },
  { id: "h4", crit: "C3", expect: false, what: "adds a stock word", file: "RELEASE-NOTES.md",
    from: "The scheduler retries", to: "The robust scheduler retries" },
  { id: "h4", crit: "C4", expect: false, what: "renames the Credits heading", file: "RELEASE-NOTES.md",
    from: "## Credits", to: "## Thanks" },
  // honest rewrites that must keep C2 true
  { id: "h4", crit: "C2", expect: true, what: "opens a sentence with a name (Thanks Priya Raman and Tomás Ibarra)", file: "RELEASE-NOTES.md",
    from: "Priya Raman fixed the retry race, and Tomás Ibarra wrote the pause endpoint.", to: "Thanks Priya Raman and Tomás Ibarra. Priya fixed the retry race and Tomás wrote the pause endpoint." },
  { id: "h4", crit: "C2", expect: true, what: "opens a sentence with a capitalised word (The Harbor 3.1.0 release)", file: "RELEASE-NOTES.md",
    from: "Harbor 3.1.0 shipped on 2026-09-14.", to: "The Harbor 3.1.0 release shipped on 2026-09-14." },
  { id: "h4", crit: "C2", expect: true, what: "ends a URL with a full stop", file: "RELEASE-NOTES.md",
    from: "Docs: https://docs.harbor.example/v2/pause", to: "See https://docs.harbor.example/v2/pause." },

  // h5
  { id: "h5", crit: "C1", expect: false, what: "edits a Spanish dialogue line", file: "guide.md",
    from: "pregunta Lucía.", to: "pregunta Lucia." },
  { id: "h5", crit: "C2", expect: false, what: "edits the German line", file: "guide.md",
    from: "innerhalb von 24 Stunden", to: "innerhalb von 24 Std" },
  { id: "h5", crit: "C3", expect: false, what: "edits the French line", file: "guide.md",
    from: "demain présenter", to: "aujourd'hui présenter" },
  { id: "h5", crit: "C4", expect: false, what: "adds the English tell pivotal", file: "guide.md",
    from: "Teams that ship 6 languages", to: "Pivotal teams that ship 6 languages" },
  { id: "h5", crit: "C4", expect: false, what: "adds an em dash to an English line", file: "guide.md",
    from: "in the first 30 days.", to: "in the first 30 days — really." },
  { id: "h5", crit: "C5", expect: false, what: "drops the 22 percent figure", file: "guide.md",
    from: "22% fewer", to: "a fifth fewer" },

  // h7 (Humanizer home ground: announcement)
  { id: "h7", crit: "C1", expect: false, what: "drops the file name", file: "announcement.md",
    from: "named final_v7.docx", to: "named an old file" },
  { id: "h7", crit: "C2", expect: false, what: "ends on the one-line closer", file: "announcement.md",
    from: "and it is free.", to: "and it is free. Let that sink in." },
  { id: "h7", crit: "C2", expect: false, what: "gains the staged question the best part?", file: "announcement.md",
    from: "Now two people", to: "And the best part? Now two people" },
  { id: "h7", crit: "C2", expect: true, what: "says the best part as a statement (the tell is the staged question)", file: "announcement.md",
    from: "Now two people", to: "The best part is that two people" },
  { id: "h7", crit: "C2", expect: true, what: "gains an em dash (Humanizer marks dashes weak alone, so C4 scores it and C2 does not)", file: "announcement.md",
    from: "Comments stay attached", to: "Comments \u2014 stay attached" },
  { id: "h7", crit: "C1", expect: true, what: "writes FINAL_V7.DOCX in capitals (facts compare case-insensitively)", file: "announcement.md",
    from: "final_v7.docx", to: "FINAL_V7.DOCX" },
  { id: "h7", crit: "C5", expect: false, what: "repeats only the facts (keyword salad) at a length that passes the word-count rule", file: "announcement.md",
    from: null, to: "drafts final_v7.docx two people same doc every plan free. ".repeat(8) },
  { id: "h7", crit: "C2", expect: false, what: "gains an emoji", file: "announcement.md",
    from: "Shared drafts are out today.", to: "Shared drafts are out today. 🚀" },
  { id: "h7", crit: "C2", expect: false, what: "gains a not-just contrast", file: "announcement.md",
    from: "Now two people", to: "It is not just a feature, it is a shift. Now two people" },
  { id: "h7", crit: "C3", expect: false, what: "adds a number", file: "announcement.md",
    from: "and it is free.", to: "and it is free for 30 days." },
  { id: "h7", crit: "C3", expect: false, what: "names a product that the source never mentions", file: "announcement.md",
    from: "at once, and each", to: "at once in Slack, and each" },
  { id: "h7", crit: "C4", expect: false, what: "gains an em dash", file: "announcement.md",
    from: "Comments stay attached", to: "Comments — stay attached" },
  { id: "h7", crit: "C4", expect: false, what: "gains an en dash", file: "announcement.md",
    from: "Comments stay attached", to: "Comments – stay attached" },
  { id: "h7", crit: "C5", expect: false, what: "loses its last two sentences", file: "announcement.md",
    from: " Now two people can edit the same doc at once, and each of them sees the other's changes live. Comments stay attached to the exact sentence they reference, even when the text around them changes. It is available on every plan, and it is free.", to: "" },
  { id: "h7", crit: "C5", expect: false, what: "grows past 130 percent of the original length", file: "announcement.md",
    from: "It is available on every plan, and it is free.", to: `It is available on every plan, and it is free. ${"The team says more about the launch here. ".repeat(8)}` },

  // h8 (Humanizer home ground: travel post)
  { id: "h8", crit: "C1", expect: false, what: "drops the tram line number", file: "lisbon.md",
    from: "Tram 28", to: "the tram" },
  { id: "h8", crit: "C1", expect: true, what: "writes 40 minutes for forty minutes (regex alternative in the facts)", file: "lisbon.md",
    from: "about forty minutes", to: "about 40 minutes" },
  { id: "h8", crit: "C3", expect: true, what: "writes 40 minutes for forty minutes (a digit is fine when the source spells the number)", file: "lisbon.md",
    from: "about forty minutes", to: "about 40 minutes" },
  { id: "h8", crit: "C1", expect: true, what: "writes 5 for five", file: "lisbon.md",
    from: "I spent five days", to: "I spent 5 days" },
  { id: "h8", crit: "C3", expect: true, what: "uses a possessive of a known name (Alfama's)", file: "lisbon.md",
    from: "up in the Alfama district", to: "up in Alfama's streets" },
  { id: "h8", crit: "C3", expect: true, what: "starts a line with a Markdown list number", file: "lisbon.md",
    from: "I spent five days in Lisbon last October.", to: "1. I spent five days in Lisbon last October." },
  { id: "h8", crit: "C1", expect: true, what: "writes the place name in lower case (facts compare case-insensitively)", file: "lisbon.md",
    from: "Tram 28", to: "tram 28" },
  { id: "h8", crit: "C2", expect: false, what: "gains sales language", file: "lisbon.md",
    from: "The views from the top were worth the climb.", to: "The views from the top were breathtaking." },
  { id: "h8", crit: "C2", expect: false, what: "gains an isn't-just contrast", file: "lisbon.md",
    from: "Everyone tells you", to: "It isn't just a ride. Everyone tells you" },
  { id: "h8", crit: "C2", expect: false, what: "gains a staged run-up", file: "lisbon.md",
    from: "I spent five days", to: "Let me tell you, I spent five days" },
  { id: "h8", crit: "C3", expect: false, what: "adds a number", file: "lisbon.md",
    from: "about forty minutes", to: "about forty minutes and 3 stops" },
  { id: "h8", crit: "C3", expect: false, what: "adds the first person plural we", file: "lisbon.md",
    from: "so I did", to: "so we did" },
  { id: "h8", crit: "C3", expect: false, what: "adds a place name", file: "lisbon.md",
    from: "other tourists taking", to: "other tourists from Spain taking" },
  { id: "h8", crit: "C4", expect: false, what: "gains an em dash", file: "lisbon.md",
    from: "and nobody is in a hurry", to: "and nobody is — in a hurry" },
  { id: "h8", crit: "C5", expect: false, what: "loses the third paragraph", file: "lisbon.md",
    from: "\n\nThe part of Lisbon I liked best starts a block or two above the main squares, where the streets go quiet and nobody is in a hurry. São Jorge Castle has good views over the rooftops and a long queue to get them. The queues can be long, but I thought the visit was worth it for the history.", to: "" },

  // h9 (unslop home ground: English blog)
  { id: "h9", crit: "C1", expect: false, what: "drops regional clusters", file: "blog.md",
    from: "regional clusters", to: "all clusters" },
  { id: "h9", crit: "C2", expect: false, what: "gains a load-bearing metaphor", file: "blog.md",
    from: "supports our platform", to: "underpins our platform" },
  { id: "h9", crit: "C2", expect: false, what: "gains the vague attribution", file: "blog.md",
    from: "Companies investing", to: "Studies show that companies investing" },
  { id: "h9", crit: "C2", expect: false, what: "gains delve", file: "blog.md",
    from: "Modern platforms help", to: "Let's delve into how modern platforms help" },
  { id: "h9", crit: "C1", expect: true, what: "drops the unsupported attribution claim (exempt from the facts on purpose)", file: "blog.md",
    from: " Companies investing in learning outperform their peers.", to: "" },
  { id: "h9", crit: "C2", expect: true, what: "gains a copula serves as (a weak tell, kept in notes and not scored)", file: "blog.md",
    from: "This architecture supports", to: "This architecture serves as the base of" },
  { id: "h9", crit: "C3", expect: false, what: "adds a number", file: "blog.md",
    from: "speeds up operations", to: "speeds up operations by 40%" },
  { id: "h9", crit: "C4", expect: false, what: "gains an em dash", file: "blog.md",
    from: "changing fast.", to: "changing—fast." },
  { id: "h9", crit: "C5", expect: false, what: "loses the second paragraph", file: "blog.md",
    from: "\n\nThis architecture supports our platform and the whole data pipeline. It speeds up operations across all regional clusters.", to: "" },

  // h10 (unslop home ground: German story post)
  { id: "h10", crit: "C1", expect: false, what: "drops the customer count", file: "post.md",
    from: "40 Mittelständler", to: "viele Mittelständler" },
  { id: "h10", crit: "C1", expect: true, what: "uses the plural form unterschrieben", file: "post.md",
    from: "und am Ende unterschrieb er", to: "und am Ende hat er unterschrieben" },
  { id: "h10", crit: "C1", expect: true, what: "uses the form Familienbetriebes", file: "post.md",
    from: "Familienbetriebs", to: "Familienbetriebes" },
  { id: "h10", crit: "C2", expect: true, what: "keeps the description block and the resolved ending (P2 notes, not scored)", file: "post.md",
    from: "Herr Krause, seit", to: "Herr Krause, ein erfahrener Kaufmann, seit" },
  { id: "h10", crit: "C2", expect: false, what: "gains the front-loaded opener", file: "post.md",
    from: "Unser Team betreut", to: "Zur Einordnung: Unser Team betreut" },
  { id: "h10", crit: "C2", expect: false, what: "gains the realization coda", file: "post.md",
    from: "Entscheidend war das Vertrauen.", to: "Und da wurde mir klar: Entscheidend war das Vertrauen." },
  { id: "h10", crit: "C2", expect: false, what: "gains a nicht-sondern contrast", file: "post.md",
    from: "Entscheidend war das Vertrauen.", to: "Entscheidend war nicht die Technik, sondern das Vertrauen." },
  { id: "h10", crit: "C3", expect: false, what: "changes a number", file: "post.md",
    from: "seit 20 Jahren", to: "seit 25 Jahren" },
  { id: "h10", crit: "C3", expect: false, what: "adds the first person ich", file: "post.md",
    from: "Wir zeigten ihm", to: "Ich zeigte ihm" },
  { id: "h10", crit: "C3", expect: true, what: "uses a new German noun (nouns are capitalised in German)", file: "post.md",
    from: "Wir zeigten ihm das System", to: "Unser Berater zeigte ihm das System" },
  { id: "h10", crit: "C4", expect: false, what: "gains a spaced en dash", file: "post.md",
    from: "er testete es,", to: "er testete es –" },
  { id: "h10", crit: "C5", expect: false, what: "loses five sentences", file: "post.md",
    from: "Letzten Monat rief ein Geschäftsführer an. Herr Krause, seit 20 Jahren Inhaber eines Familienbetriebs, war zunächst skeptisch. Wir zeigten ihm das System, er testete es, und am Ende unterschrieb er. Inzwischen läuft das System stabil, das Team ist zufrieden, und offene Fragen gibt es keine mehr. ", to: "" },

  // h11 (everwrite home ground: release notes)
  { id: "h11", crit: "C1", expect: false, what: "drops the build time", file: "release.md",
    from: "41 seconds instead of 95", to: "less time" },
  { id: "h11", crit: "C2", expect: false, what: "gains an -ing rider", file: "release.md",
    from: "to Redis, so teams share one cache.", to: "to Redis, ensuring teams stay aligned." },
  { id: "h11", crit: "C2", expect: false, what: "gains a bold label on a bullet", file: "release.md",
    from: "- Builds now", to: "- **Speed:** Builds now" },
  { id: "h11", crit: "C2", expect: false, what: "gains the opener great question", file: "release.md",
    from: "Harbor 2.4 came out", to: "Great question! Harbor 2.4 came out" },
  { id: "h11", crit: "C2", expect: false, what: "gains a quick overview opener with a curly apostrophe", file: "release.md",
    from: "Harbor 2.4 came out", to: "Here\u2019s a quick overview. Harbor 2.4 came out" },
  { id: "h11", crit: "C2", expect: false, what: "gains an emoji", file: "release.md",
    from: "for the first time.", to: "for the first time 🚀" },
  { id: "h11", crit: "C3", expect: true, what: "says we (always allowed in release notes)", file: "release.md",
    from: "Some people expect this change", to: "We expect this change" },
  { id: "h11", crit: "C2", expect: true, what: "gains one weak stock word alone (not a pair)", file: "release.md",
    from: "Harbor needs no setup", to: "Harbor is robust and needs no setup" },
  { id: "h11", crit: "C2", expect: false, what: "gains two stock words in one paragraph", file: "release.md",
    from: "Harbor needs no setup", to: "Harbor is robust and seamless and needs no setup" },
  { id: "h11", crit: "C5", expect: false, what: "repeats only the facts (keyword salad) at a length that passes the word-count rule", file: "release.md",
    from: null, to: "Harbor 2.4 3 March 2026 41 seconds 95 Redis Windows ARM64 `harbor push --legacy` ".repeat(8) },
  { id: "h11", crit: "C3", expect: false, what: "adds a number", file: "release.md",
    from: "for many teams", to: "for 300 teams" },
  { id: "h11", crit: "C3", expect: false, what: "adds a product name", file: "release.md",
    from: "Windows ARM64 is supported", to: "Windows ARM64 is supported on Kubernetes" },
  { id: "h11", crit: "C4", expect: false, what: "gains an em dash", file: "release.md",
    from: "came out on", to: "came out — on" },
  { id: "h11", crit: "C5", expect: false, what: "changes the preserved flag line", file: "release.md",
    from: "`harbor push --legacy`", to: "`harbor push`" },
  { id: "h11", crit: "C5", expect: true, what: "falls to 47 percent of the original length, above the 40 percent floor", file: "release.md",
    from: " Harbor needs no setup and no config.", to: "" },
  { id: "h11", crit: "C5", expect: false, what: "loses the three bullets: the length stays above the 20 percent floor but the content words fall under 30 percent", file: "release.md",
    from: "- Builds now finish in 41 seconds instead of 95.\n- The cache moved from disk to Redis, so teams share one cache.\n- Windows ARM64 is supported for the first time.\n\n", to: "" },

  // h12 (everwrite home ground: town page)
  { id: "h12", crit: "C1", expect: false, what: "drops the founding year", file: "town.md",
    from: "founded in 1989", to: "founded long ago" },
  { id: "h12", crit: "C2", expect: false, what: "gains two stock words in one paragraph", file: "town.md",
    from: "The river is important", to: "The river is crucial and vibrant" },
  { id: "h12", crit: "C2", expect: false, what: "gains the stock section", file: "town.md",
    from: "The river is important", to: "Despite these challenges, the town continues to thrive. The river is important" },
  { id: "h12", crit: "C2", expect: true, what: "gains a copula serves as (a weak tell, kept in notes and not scored)", file: "town.md",
    from: "Gallery 825 is the exhibition space.", to: "Gallery 825 serves as the exhibition space." },
  { id: "h12", crit: "C2", expect: false, what: "gains the forced triad", file: "town.md",
    from: "innovation and insights", to: "innovation, inspiration, and insights" },
  { id: "h12", crit: "C3", expect: false, what: "adds a number", file: "town.md",
    from: "It has four rooms.", to: "It has four rooms and 12 staff." },
  { id: "h12", crit: "C3", expect: false, what: "adds a name", file: "town.md",
    from: "It has four rooms.", to: "It has four rooms, as Moma does." },
  { id: "h12", crit: "C4", expect: false, what: "gains an em dash", file: "town.md",
    from: "The town is in the valley.", to: "The town — is in the valley." },
  { id: "h12", crit: "C5", expect: false, what: "loses its last four sentences", file: "town.md",
    from: " The river is important to the ecosystem. Attendees can expect innovation and insights. Gallery 825 is the exhibition space. It has four rooms.", to: "" },

  // h8 and h11, criteria repairs of 2026-10-22
  { id: "h8", crit: "C3", expect: true, what: "uses the contraction I'd in the middle of a sentence (a contraction counts as its base word)", file: "lisbon.md",
    from: "but I thought the visit was worth it", to: "but I'd say the visit was worth it" },
  { id: "h8", crit: "C3", expect: false, what: "adds the contraction We'd (a first-person plural the before text lacks)", file: "lisbon.md",
    from: "but I thought the visit was worth it", to: "but we'd say the visit was worth it" },
  { id: "h11", crit: "C5", expect: true, what: "is a minimal faithful rewrite of 26 percent of the length (above the 20 percent floor)", file: "release.md", from: null,
    to: "# Release Notes For Harbor 2.4\n\nHarbor 2.4 came out on 3 March 2026. Builds now finish in 41 seconds instead of 95. The cache moved from disk to Redis. Windows ARM64 is supported for the first time. The old `harbor push --legacy` flag was removed.\n" },
  { id: "h11", crit: "C5", expect: false, what: "keeps only the title and the flag (about 7 percent of the length)", file: "release.md", from: null,
    to: "# Release Notes For Harbor 2.4\n\nThe old `harbor push --legacy` flag was removed.\n" },

  { id: "h11", crit: "C5", expect: false, what: "is a dense list of the facts at 19 percent of the length (the content words pass, the 20 percent floor fails)", file: "release.md", from: null,
    to: "Harbor 2.4, 3 March 2026: builds finish in 41 seconds instead of 95. Cache moved disk to Redis, teams share. Windows ARM64 supported first time. `harbor push --legacy` flag removed.\n" },

  // h13 (long release notes: facts, tells in lists and a table)
  { id: "h13", crit: "C1", expect: false, what: "shortens a listed duration", file: "RELEASE-NOTES.md",
    from: "4 minutes 12 seconds", to: "4 minutes" },
  { id: "h13", crit: "C1", expect: false, what: "drops the accent of a name", file: "RELEASE-NOTES.md",
    from: "Inès Carvalho", to: "Ines Carvalho" },
  { id: "h13", crit: "C1", expect: false, what: "drops a URL", file: "RELEASE-NOTES.md",
    from: "https://kestrel.example/security/2026-014", to: "the security page" },
  { id: "h13", crit: "C1", expect: false, what: "drops a code span", file: "RELEASE-NOTES.md",
    from: "`--shard-count=16`", to: "the shard flag" },
  { id: "h13", crit: "C1", expect: false, what: "writes a thousands separator differently", file: "RELEASE-NOTES.md",
    from: "12,480", to: "12480" },
  { id: "h13", crit: "C1", expect: true, what: "rewords the sentence around the date", file: "RELEASE-NOTES.md",
    from: "Kestrel 5.4.0 came out on 2026-10-06.", to: "Kestrel 5.4.0 was released on 2026-10-06." },
  { id: "h13", crit: "C2", expect: false, what: "adds a number that the fixture does not have", file: "RELEASE-NOTES.md",
    from: "Version 4.9 agents keep working until 2027-01-31.", to: "Version 4.9 agents keep working until 2027-01-31. The rollout took 7 hours." },
  { id: "h13", crit: "C2", expect: false, what: "adds a URL", file: "RELEASE-NOTES.md",
    from: "Version 4.9 agents keep working until 2027-01-31.", to: "Version 4.9 agents keep working until 2027-01-31. More: https://kestrel.example/blog." },
  { id: "h13", crit: "C2", expect: false, what: "adds a code span", file: "RELEASE-NOTES.md",
    from: "Run `kestrel migrate --to 54`", to: "Run `kestrel migrate --to 54` and `kestrel doctor`" },
  { id: "h13", crit: "C2", expect: false, what: "adds a name in the middle of a sentence", file: "RELEASE-NOTES.md",
    from: "Inès Carvalho reported", to: "Inès Carvalho and Dana Whitfield reported" },
  { id: "h13", crit: "C2", expect: true, what: "opens a table cell with a capitalised word that the fixture lacks", file: "RELEASE-NOTES.md",
    from: "| Upgrade the runtime first |", to: "| Resolved: upgrade the runtime first |" },
  { id: "h13", crit: "C2", expect: true, what: "opens a sentence with a capitalised word that the fixture lacks", file: "RELEASE-NOTES.md",
    from: "Most of the work went", to: "Plenty of the work went" },
  { id: "h13", crit: "C3", expect: false, what: "gains the word seamless in the intro", file: "RELEASE-NOTES.md",
    from: "Most of the work went into the cache", to: "Most of the work went into a seamless cache" },
  { id: "h13", crit: "C3", expect: false, what: "gains an em dash", file: "RELEASE-NOTES.md",
    from: "Upgrade the runtime first", to: "Upgrade the runtime — first" },
  { id: "h13", crit: "C3", expect: false, what: "gains the closer in conclusion", file: "RELEASE-NOTES.md",
    from: "The security advisory is at", to: "In conclusion, the security advisory is at" },
  { id: "h13", crit: "C3", expect: false, what: "gains let me know if in the closer", file: "RELEASE-NOTES.md",
    from: "The security advisory is at https://kestrel.example/security/2026-014.", to: "The security advisory is at https://kestrel.example/security/2026-014. Let me know if you have questions." },
  { id: "h13", crit: "C3", expect: true, what: "uses a word that only the cell list knows (vibrant) in the intro", file: "RELEASE-NOTES.md",
    from: "Most of the work went into the cache", to: "Most of the work went into a vibrant cache" },
  { id: "h13", crit: "C4", expect: false, what: "loses a table row", file: "RELEASE-NOTES.md",
    from: "| Sentry plugin | 1.80 | 1.82 | Only a version bump |\n", to: "" },
  { id: "h13", crit: "C4", expect: false, what: "renames a heading", file: "RELEASE-NOTES.md",
    from: "## Credits", to: "## Thanks" },
  { id: "h13", crit: "C4", expect: false, what: "turns a table row into three columns", file: "RELEASE-NOTES.md",
    from: "| Cache protocol | v4 | v5 | Cache misses drop by 0.6% |", to: "| Cache protocol | v4 | v5 |" },
  { id: "h13", crit: "C4", expect: false, what: "adds three bullets (11 against 8)", file: "RELEASE-NOTES.md",
    from: "- Set `--shard-count=16`", to: "- Extra one.\n- Extra two.\n- Extra three.\n- Set `--shard-count=16`" },
  { id: "h13", crit: "C4", expect: true, what: "drops one bullet (7 against 8 stays within 2)", file: "RELEASE-NOTES.md",
    from: "- About 2.4% of runs on the `nightly` channel still print a stale warning.\n", to: "" },
  { id: "h13", crit: "C5", expect: false, what: "puts a bold label on a bullet", file: "RELEASE-NOTES.md",
    from: "- The remote cache hit rate", to: "- **Cache:** The remote cache hit rate" },
  { id: "h13", crit: "C5", expect: false, what: "puts the word vibrant in a table cell", file: "RELEASE-NOTES.md",
    from: "| Only a version bump |", to: "| A vibrant version bump |" },
  { id: "h13", crit: "C5", expect: false, what: "adds an -ing rider to a bullet", file: "RELEASE-NOTES.md",
    from: "from 61% to 93% (#2237).", to: "from 61% to 93%, showcasing a leap (#2237)." },
  { id: "h13", crit: "C5", expect: false, what: "puts not just in a bullet", file: "RELEASE-NOTES.md",
    from: "removes 48,000 stale entries in 90 seconds.", to: "removes 48,000 stale entries in 90 seconds, not just a few." },
  { id: "h13", crit: "C5", expect: true, what: "puts the wider word vibrant in a prose paragraph (the second list covers only lists and cells)", file: "RELEASE-NOTES.md",
    from: "Most of the work went into the cache", to: "Most of the work went into a vibrant, ever-evolving cache ecosystem" },

  // h14 (mixed-language guide with three foreign blocks, a code block and front matter)
  { id: "h14", crit: "C1", expect: false, what: "edits a Spanish dialogue line", file: "guide.md",
    from: "pregunta Lucía.", to: "pregunta Lucia." },
  { id: "h14", crit: "C1", expect: false, what: "replaces the en dash of the Turkish sentence with a hyphen", file: "guide.md",
    from: "yayına çıkmayız – söz", to: "yayına çıkmayız - söz" },
  { id: "h14", crit: "C2", expect: false, what: "replaces the spaced en dash of the German line with a comma", file: "guide.md",
    from: "24 Stunden – versprochen", to: "24 Stunden, versprochen" },
  { id: "h14", crit: "C3", expect: false, what: "edits the French line", file: "guide.md",
    from: "demain présenter", to: "demain à présenter" },
  { id: "h14", crit: "C3", expect: false, what: "edits a comment of the fenced code block", file: "guide.md",
    from: "# Export every string — one file per language", to: "# Export every string, one file per language" },
  { id: "h14", crit: "C4", expect: false, what: "adds the tell pivotal to a list item", file: "guide.md",
    from: "- Export all 1,200 strings", to: "- Pivotal: export all 1,200 strings" },
  { id: "h14", crit: "C4", expect: false, what: "adds the tell seamless to a table cell", file: "guide.md",
    from: "| Rolled out without problems |", to: "| A seamless rollout |" },
  { id: "h14", crit: "C4", expect: false, what: "adds an em dash to an English line", file: "guide.md",
    from: "Questions are welcome.", to: "Questions — are welcome." },
  { id: "h14", crit: "C4", expect: false, what: "adds I hope this helps to the closer", file: "guide.md",
    from: "Questions are welcome.", to: "Questions are welcome. I hope this helps!" },
  { id: "h14", crit: "C5", expect: false, what: "drops the 38 percent figure", file: "guide.md",
    from: "see 38% fewer support tickets", to: "see fewer support tickets" },
  { id: "h14", crit: "C5", expect: false, what: "changes the front matter language", file: "guide.md",
    from: "lang: en", to: "lang: es" },
  { id: "h14", crit: "C5", expect: false, what: "removes the front matter", file: "guide.md",
    from: "---\ntitle: Writing localized help text\nlang: en\nupdated: 2026-08-12\n---\n\n", to: "" },

  { id: "h14", crit: "C4", expect: true, what: "keeps the em dashes of the code block comments and of the French line (both are exempt from the English rule)", file: "guide.md",
    from: "Questions are welcome.", to: "Questions are welcome here." },
  { id: "h14", crit: "C4", expect: true, what: "puts a tell into a comment of the code block (C3 judges the block, C4 judges English prose)", file: "guide.md",
    from: "# Send the files to the translators", to: "# Send the seamless files to the translators" },
  // h15 (the edit is applied to a temporary copy of the golden repository)
  { id: "h15", crit: "C1", expect: false, what: "the check also reads blockquotes, so the quoted tell phrase in the README fails", file: "scripts/lint-prose.mjs",
    from: "if (inFence || /^\\s*>/.test(line)) return;", to: "if (inFence) return;" },
  { id: "h15", crit: "C1", expect: false, what: "the check flags every em dash, so the French notes fail", file: "scripts/lint-prose.mjs",
    from: `"in today's",`, to: `"in today's", "—",` },
  { id: "h15", crit: "C2", expect: false, what: "lint:prose exits 2 on a tell", file: "scripts/lint-prose.mjs",
    from: "process.exit(1);", to: "process.exit(2);" },
  { id: "h15", crit: "C2", expect: false, what: "the docs directory is not scanned", file: "scripts/lint-prose.mjs",
    from: `...(existsSync("docs") ? markdownFiles("docs") : [])`, to: "...[]" },
  { id: "h15", crit: "C3", expect: false, what: "the README is not scanned", file: "scripts/lint-prose.mjs",
    from: `...(existsSync("README.md") ? ["README.md"] : [])`, to: "...[]" },
  { id: "h15", crit: "C4", expect: false, what: "drops the pull_request trigger", file: ".github/workflows/prose.yml",
    from: "  pull_request:", to: "  push:" },
  { id: "h15", crit: "C4", expect: false, what: "the ci.yml test job runs a different command", file: ".github/workflows/ci.yml",
    from: "run: npm test", to: "run: npm run build" },
  { id: "h15", crit: "C4", expect: false, what: "the test script changes", file: "package.json",
    from: "console.log('tests ok')", to: "console.log('changed')" },
  { id: "h15", crit: "C5", expect: false, what: "the check names its dirty file: a file name that the checker invents passes", file: "scripts/lint-prose.mjs",
    from: `...(existsSync("docs") ? markdownFiles("docs") : [])`, to: `...["docs/guide.md", "docs/guides/setup.md", "docs/guides/new.md", "docs/fr/notes.md", "docs/de/anleitung.md"].filter((f) => existsSync(f))` },
  { id: "h15", crit: "C5", expect: false, what: "package.json is no longer valid JSON", file: "package.json",
    from: `"private": true,`, to: `"private": tru,` },
  { id: "h15", crit: "C2", expect: true, what: "the file that the checker names is scanned by name and by directory (C2 stays true even though C5 fails)", file: "scripts/lint-prose.mjs",
    from: `...(existsSync("docs") ? markdownFiles("docs") : [])`, to: `...["docs/guide.md", "docs/guides/setup.md", "docs/guides/new.md", "docs/fr/notes.md", "docs/de/anleitung.md"].filter((f) => existsSync(f))` },

  { id: "h15", crit: "C3", expect: false, what: "lint:prose exits 2 when the README is dirty (and 1 elsewhere)", file: "scripts/lint-prose.mjs",
    from: "process.exit(1);", to: `process.exit(readFileSync("README.md", "utf8").includes("game-changer") ? 2 : 1);` },
  { id: "h15", crit: "C5", expect: false, what: "lint:prose exits 2 on a file under a directory that the checker invented", file: "scripts/lint-prose.mjs",
    from: "process.exit(1);", to: `process.exit(files.some((f) => f.startsWith("docs/section-")) ? 2 : 1);` },
  // h16 (Humanizer home ground at full length: the whole Lisbon example)
  { id: "h16", crit: "C1", expect: false, what: "drops the district Graça", file: "lisbon-trip.md",
    from: "a small place in Graça", to: "a small place nearby" },
  { id: "h16", crit: "C1", expect: true, what: "writes 5 days for five days", file: "lisbon-trip.md",
    from: "I spent five days", to: "I spent 5 days" },
  { id: "h16", crit: "C1", expect: false, what: "drops the season of the return trip", file: "lisbon-trip.md",
    from: "in spring next time", to: "next time" },
  { id: "h16", crit: "C2", expect: false, what: "gains sales language", file: "lisbon-trip.md",
    from: "The views from the top were worth the climb.", to: "The views from the top were breathtaking." },
  { id: "h16", crit: "C2", expect: false, what: "gains an isn't-just contrast", file: "lisbon-trip.md",
    from: "I rode Tram 28", to: "It isn't just a ride. I rode Tram 28" },
  { id: "h16", crit: "C2", expect: false, what: "gains a staged run-up", file: "lisbon-trip.md",
    from: "I spent five days", to: "Let me tell you, I spent five days" },
  { id: "h16", crit: "C3", expect: false, what: "adds a number", file: "lisbon-trip.md",
    from: "about forty minutes", to: "about forty minutes and 3 stops" },
  { id: "h16", crit: "C3", expect: false, what: "adds the first person plural we", file: "lisbon-trip.md",
    from: "I rode Tram 28", to: "We rode Tram 28" },
  { id: "h16", crit: "C3", expect: false, what: "adds a place name", file: "lisbon-trip.md",
    from: "a small place in Graça", to: "a small place in Graça near Sintra" },
  { id: "h16", crit: "C3", expect: true, what: "uses I'd in the middle of a sentence", file: "lisbon-trip.md",
    from: "and with better shoes.", to: "and I'd bring better shoes." },
  { id: "h16", crit: "C4", expect: false, what: "gains an em dash", file: "lisbon-trip.md",
    from: "The streets go quiet there", to: "The streets go quiet \u2014 there" },
  { id: "h16", crit: "C5", expect: false, what: "keeps only the first paragraph", file: "lisbon-trip.md", from: null,
    to: "I spent five days in Lisbon last October. My hotel was in the Alfama district, up a lot of stairs from everything else, and my legs noticed. The views from the top were worth the climb.\n" },
  { id: "h16", crit: "C5", expect: false, what: "repeats only the facts (keyword salad) at a length that passes the word-count rule", file: "lisbon-trip.md", from: null,
    to: "five Lisbon October Alfama Tram 28 forty Pastéis de Belém Graça São Jorge Castle spring. ".repeat(10) },

  // h17 (unslop home ground at full length: nine German inputs)
  { id: "h17", crit: "C1", expect: false, what: "drops the recommended option", file: "sammlung.md",
    from: "Ich empfehle Variante B.", to: "Ich empfehle eine Variante." },
  { id: "h17", crit: "C1", expect: true, what: "writes 3 Varianten for drei Varianten", file: "sammlung.md",
    from: "über drei Varianten", to: "über 3 Varianten" },
  { id: "h17", crit: "C2", expect: false, what: "gains the phantom objection", file: "sammlung.md",
    from: "Hallo Petra, danke für deine Rückfrage zum Angebot.", to: "Hallo Petra, danke für deine Rückfrage zum Angebot. Versteh mich nicht falsch." },
  { id: "h17", crit: "C2", expect: false, what: "gains the word-list hit unterm Strich", file: "sammlung.md",
    from: "Ich empfehle Variante B.", to: "Unterm Strich empfehle ich Variante B." },
  { id: "h17", crit: "C2", expect: false, what: "gains the vague attribution studien zeigen", file: "sammlung.md",
    from: "Die Lösung halbiert", to: "Studien zeigen: Die Lösung halbiert" },
  { id: "h17", crit: "C2", expect: false, what: "gains the formulaic opener", file: "sammlung.md",
    from: "Weiterbildung funktioniert nur mit Menschen.", to: "In der heutigen schnelllebigen Arbeitswelt funktioniert Weiterbildung nur mit Menschen." },
  { id: "h17", crit: "C2", expect: false, what: "gains the realization kicker", file: "sammlung.md",
    from: "Der Export läuft jetzt auch nachts.", to: "Am Ende zählt eben nicht die Technik, sondern die Zeit. Der Export läuft jetzt auch nachts." },
  { id: "h17", crit: "C3", expect: false, what: "adds a number", file: "sammlung.md",
    from: "Die Pausenstaffel bleibt 11:00 bis 11:30 Uhr.", to: "Die Pausenstaffel bleibt 11:00 bis 11:30 Uhr und dauert 45 Minuten." },
  { id: "h17", crit: "C3", expect: true, what: "uses a new German noun in the middle of a sentence (German capitalises nouns)", file: "sammlung.md",
    from: "Ich empfehle Variante B.", to: "Ich empfehle Variante B als Lösung für das Unternehmen." },
  { id: "h17", crit: "C4", expect: false, what: "gains a spaced en dash", file: "sammlung.md",
    from: "Der Prüfbericht liegt seit Freitag vor.", to: "Der Prüfbericht liegt seit Freitag vor –" },
  { id: "h17", crit: "C5", expect: false, what: "keeps only the last paragraph", file: "sammlung.md", from: null,
    to: "Der Prüfbericht liegt seit Freitag vor. Die offenen Punkte stehen in Tabelle 2.\n" },

  // h18 (everwrite home ground at full length: every Before line of the pattern file)
  { id: "h18", crit: "C1", expect: false, what: "drops the gallery name", file: "drafts.md",
    from: "Gallery 825 is the exhibition space.", to: "The gallery is the exhibition space." },
  { id: "h18", crit: "C1", expect: true, what: "writes 4 rooms for four rooms", file: "drafts.md",
    from: "It has four rooms.", to: "It has 4 rooms." },
  { id: "h18", crit: "C2", expect: false, what: "gains the praise opener", file: "drafts.md",
    from: "The revolution began in 1789.", to: "Great question! The revolution began in 1789." },
  { id: "h18", crit: "C2", expect: false, what: "gains the stock section", file: "drafts.md",
    from: "The town is in the valley.", to: "Despite these challenges, the town continues to thrive. The town is in the valley." },
  { id: "h18", crit: "C2", expect: false, what: "gains a bold-label bullet", file: "drafts.md",
    from: "Builds finish in 41 seconds, and the cache moved to Redis.", to: "- **Speed:** Builds finish in 41 seconds, and the cache moved to Redis." },
  { id: "h18", crit: "C2", expect: false, what: "gains the negative listing", file: "drafts.md",
    from: "It runs with the defaults.", to: "No setup. No config. Just results." },
  { id: "h18", crit: "C2", expect: false, what: "gains the isn't-it's contrast", file: "drafts.md",
    from: "Harbor is a build tool and a new way to ship.", to: "Harbor isn't just a build tool, it's a new way to ship." },
  { id: "h18", crit: "C2", expect: true, what: "gains a copula serves as (a weak tell, kept in notes and not scored)", file: "drafts.md",
    from: "Gallery 825 is the exhibition space.", to: "Gallery 825 serves as the exhibition space." },
  { id: "h18", crit: "C3", expect: false, what: "adds a number", file: "drafts.md",
    from: "It has four rooms.", to: "It has four rooms and 12 staff." },
  { id: "h18", crit: "C3", expect: false, what: "adds a name", file: "drafts.md",
    from: "It has four rooms.", to: "It has four rooms, as Moma does." },
  { id: "h18", crit: "C4", expect: false, what: "gains an em dash", file: "drafts.md",
    from: "The town is in the valley.", to: "The town — is in the valley." },
  { id: "h18", crit: "C5", expect: false, what: "keeps only the first paragraph", file: "drafts.md", from: null,
    to: "Harbor is a build tool and a new way to ship. No system ranks the options, though they still differ. The cache is the bottleneck, and it learns from each run.\n" },

  // h6 (the edit is applied to a temporary copy of the golden repository)
  { id: "h6", crit: "C1", expect: false, what: "lint:prose exits 0 on every outcome", file: "scripts/lint-prose.mjs",
    from: "process.exit(1);", to: "process.exit(0);" },
  { id: "h6", crit: "C2", expect: false, what: "flags the French notes file", file: "scripts/lint-prose.mjs",
    from: `"in today's",`, to: `"in today's", "notes",` },
  { id: "h6", crit: "C3", expect: false, what: "no longer flags seamless", file: "scripts/lint-prose.mjs",
    from: `"seamless",`, to: `"seamlessly",` },
  { id: "h6", crit: "C4", expect: false, what: "drops the pull_request trigger", file: ".github/workflows/prose.yml",
    from: "  pull_request:", to: "  push:" },
  { id: "h6", crit: "C4", expect: false, what: "the ci.yml test job runs a different command", file: ".github/workflows/ci.yml",
    from: "run: npm test", to: "run: npm run build" },
  { id: "h6", crit: "C4", expect: true, what: "the ci.yml test job runs npm test with arguments", file: ".github/workflows/ci.yml",
    from: "run: npm test", to: "run: npm test -- --ci" },
  { id: "h6", crit: "C4", expect: false, what: "the test script changes", file: "package.json",
    from: "console.log('tests ok')", to: "console.log('changed')" },
  { id: "h6", crit: "C5", expect: false, what: "package.json is no longer valid JSON", file: "package.json",
    from: `"private": true,`, to: `"private": tru,` },
];


// Copy the golden output (or repository), apply one edit, and run the checker on the copy.
function runEdited(c) {
  const dir = mkdtempSync(join(tmpdir(), "h2h-case-"));
  try {
    cpSync(join(BENCH, "golden", c.id), dir, { recursive: true });
    const path = join(dir, c.file);
    const text = readFileSync(path, "utf8");
    if (c.from === null) {
      writeFileSync(path, c.to);
      return runCheck(c.id, dir);
    }
    const occurrences = text.split(c.from).length - 1;
    assert.ok(occurrences >= 1 && (c.all || occurrences === 1), `${c.id} ${c.file}: "${c.from}" occurs ${occurrences} times`);
    writeFileSync(path, c.all ? text.split(c.from).join(c.to) : text.replace(c.from, () => c.to));
    return runCheck(c.id, dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

for (const c of CASES) {
  const verb = c.expect ? "stays true" : "goes false";
  test(`${c.id} ${c.crit} ${verb} when the output ${c.what}`, () => {
    const res = runEdited(c);
    assert.equal(res[c.crit], c.expect, `${c.id} ${c.crit}: ${JSON.stringify(res)}`);
  });
}

// ---- h6 criteria repair (2026-10-21): the French note is restored before every lint:prose run ------
// A golden copy whose lint script is edited by `edit(scriptText)` and whose docs/fr/notes.md gets a
// silencing comment, as an arm that gamed the French file would leave it.
function h6Gamed(edit) {
  const dir = mkdtempSync(join(tmpdir(), "h2h-h6-restore-"));
  try {
    cpSync(join(BENCH, "golden", "h6"), dir, { recursive: true });
    const script = join(dir, "scripts", "lint-prose.mjs");
    writeFileSync(script, edit(readFileSync(script, "utf8")));
    const notes = join(dir, "docs", "fr", "notes.md");
    writeFileSync(notes, `<!-- slop-ignore dash -->\n${readFileSync(notes, "utf8")}`);
    return runCheck("h6", dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("h6 C2 judges the restored French note: a slop-ignore comment added to docs/fr/notes.md gains nothing", () => {
  // The script flags the em dash but skips any file that carries a slop-ignore comment.
  const res = h6Gamed((t) =>
    t.replace(`"in today's",`, `"in today's", "\u2014",`)
      .replace("const lines = readFileSync(file, \"utf8\").split(\"\\n\");",
        "const text = readFileSync(file, \"utf8\");\n  if (text.includes(\"slop-ignore\")) continue;\n  const lines = text.split(\"\\n\");"));
  assert.equal(res.C2, false, JSON.stringify(res));
});

test("h6 C1 and C3 also run on the restored French note, not on the arm's copy", () => {
  // The lint exits 1 only when docs/fr/notes.md carries the comment, so only an unrestored copy passes C1 and C3.
  const res = h6Gamed((t) => `import { readFileSync } from "node:fs";\nprocess.exit(readFileSync("docs/fr/notes.md", "utf8").includes("slop-ignore") ? 1 : 0);\n// ${t.length}\n`);
  assert.equal(res.C1, false, JSON.stringify(res));
  assert.equal(res.C3, false, JSON.stringify(res));
  assert.equal(res.C2, true, JSON.stringify(res));
});

// ---- h6 check-time symmetry: an installed copy of the linter in the arm's node_modules/.bin is deleted ----
for (const tool of ["ai-slop-linter", "slop"]) {
  test(`h6 ignores the arm's own node_modules/.bin/${tool}: an installed copy that always exits 0 gets no free pass`, () => {
    const dir = mkdtempSync(join(tmpdir(), "h2h-h6-bin-"));
    const fake = mkdtempSync(join(tmpdir(), "h2h-h6-shim-"));
    try {
      cpSync(join(BENCH, "golden", "h6"), dir, { recursive: true });
      const pkgPath = join(dir, "package.json");
      const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
      pkg.scripts["lint:prose"] = `${tool} docs`;
      writeFileSync(pkgPath, JSON.stringify(pkg));
      // The arm installed a copy that never fails; a second bin is a link that points at ai-slop-linter.
      const bin = join(dir, "node_modules", ".bin");
      mkdirSync(bin, { recursive: true });
      writeFileSync(join(bin, tool), "#!/bin/sh\nexit 0\n");
      chmodSync(join(bin, tool), 0o755);
      mkdirSync(join(dir, "node_modules", "ai-slop-linter"), { recursive: true });
      writeFileSync(join(dir, "node_modules", "ai-slop-linter", "cli.js"), "process.exit(0)\n");
      // The tool every arm must resolve through the shim PATH: it fails, as on dirty prose.
      writeFileSync(join(fake, tool), "#!/bin/sh\nexit 1\n");
      chmodSync(join(fake, tool), 0o755);
      const r = spawnSync(process.execPath, [CHECK, "h6", dir, "--path", `${fake}:${process.env.PATH}`], { encoding: "utf8", timeout: 300000 });
      assert.equal(r.status, 0, r.stderr);
      const res = JSON.parse(r.stdout.trim().split("\n").pop());
      assert.equal(res.C2, false, `the shim tool (exit 1) decides C2, not the installed copy: ${JSON.stringify(res)}`);
      assert.equal(res.C1, true, JSON.stringify(res));
      assert.equal(res.C3, true, JSON.stringify(res));
    } finally {
      rmSync(dir, { recursive: true, force: true });
      rmSync(fake, { recursive: true, force: true });
    }
  });
}

test("h6 also deletes a bin link that points at ai-slop-linter", () => {
  const dir = mkdtempSync(join(tmpdir(), "h2h-h6-link-"));
  const fake = mkdtempSync(join(tmpdir(), "h2h-h6-shim-"));
  try {
    cpSync(join(BENCH, "golden", "h6"), dir, { recursive: true });
    const pkgPath = join(dir, "package.json");
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    pkg.scripts["lint:prose"] = "prose-check docs";
    writeFileSync(pkgPath, JSON.stringify(pkg));
    mkdirSync(join(dir, "node_modules", "ai-slop-linter"), { recursive: true });
    writeFileSync(join(dir, "node_modules", "ai-slop-linter", "cli.js"), "#!/bin/sh\nexit 0\n");
    chmodSync(join(dir, "node_modules", "ai-slop-linter", "cli.js"), 0o755);
    mkdirSync(join(dir, "node_modules", ".bin"), { recursive: true });
    symlinkSync("../ai-slop-linter/cli.js", join(dir, "node_modules", ".bin", "prose-check"));
    writeFileSync(join(fake, "prose-check"), "#!/bin/sh\nexit 1\n");
    chmodSync(join(fake, "prose-check"), 0o755);
    const r = spawnSync(process.execPath, [CHECK, "h6", dir, "--path", `${fake}:${process.env.PATH}`], { encoding: "utf8", timeout: 300000 });
    assert.equal(JSON.parse(r.stdout.trim().split("\n").pop()).C2, false, "the link into ai-slop-linter was removed");
  } finally {
    rmSync(dir, { recursive: true, force: true });
    rmSync(fake, { recursive: true, force: true });
  }
});

test("every script criterion has at least one case that turns it false", () => {
  for (const task of load().tasks) {
    for (const crit of task.criteria.filter((c) => c.kind === "script")) {
      const covered = CASES.some((c) => c.id === task.id && c.crit === crit.id && c.expect === false);
      assert.ok(covered, `${task.id} ${crit.id} has no negative case`);
    }
  }
});

// ---- home-ground tasks (F8) -----------------------------------------------------------------
const sha = (x) => createHash("sha256").update(x).digest("hex");
const fixtureOf = (id) => {
  const dir = join(BENCH, "fixtures", id);
  const files = listFiles(dir);
  assert.equal(files.length, 1, `${id} has exactly one fixture file`);
  return { file: files[0], text: readFileSync(files[0], "utf8") };
};
const HEX40 = /^[0-9a-f]{40}$/;

// The status fields (status, retired, added) are bookkeeping; everything else of a task is frozen.
const frozenPart = (task) => {
  const { status, retired, added, ...rest } = task;
  return rest;
};

test("the frozen tasks h1 to h6 are unchanged: only the status fields were added", () => {
  assert.equal(sha(JSON.stringify(load().tasks.slice(0, 6).map(frozenPart))), "02fd78368b6fe53539cfc272823e9d9453293df2cb671aae1372cfb739a9a972");
});

test("h8 is retired as a duplicate: its before text is the first five paragraphs of the h16 before text", () => {
  const h8 = load().tasks.find((x) => x.id === "h8");
  assert.equal(h8.status, "retired");
  assert.equal(h8.retired.ground, "duplicate");
  assert.equal(h8.retired.replacedBy, "h16");
  const small = readFileSync(join(BENCH, "fixtures", "h8", "lisbon.md"), "utf8").trim().split(/\n\n+/);
  const big = readFileSync(join(BENCH, "fixtures", "h16", "lisbon-trip.md"), "utf8").trim().split(/\n\n+/);
  assert.equal(small.length, 5);
  assert.equal(big.length, 6);
  assert.deepEqual(big.slice(0, small.length), small);
  assert.equal(small.join(" ").split(/\s+/).length, 218);
  assert.equal(big.join(" ").split(/\s+/).length, 251);
});

test("the replacement tasks h13 to h18 are frozen: the prompt and the criteria hash to the values committed before any run", () => {
  const FROZEN = {
    h13: "9a848baee4246ea3be62722edb53946c98c62f477893f2cc2da3641c35f2cff4", h14: "afc43b070bee9c03758a17edd04a0cff6a8ec4e1139de03efd455e82c818eb76", h15: "5c7156e4440c92effaaade6ec818661f8c6941729993b478e52dd40927945e21", h16: "f224b08ce1a758033a34387b5b5095f55959e380015e86e223888380631fb42b", h17: "59191bf939c4dbe729c87c7acd4f05ad3eb0e0a1d8a904acb7b6b6158b65a086", h18: "6155cbce26839368e05adf71bd0263270d9bbc3b161a7cd73b0df6fc0f8b30a9",
  };
  for (const task of load().tasks.filter((x) => NEW.includes(x.id))) {
    const frozen = { id: task.id, fixture: task.fixture, kind: task.kind ?? null, prompt: task.prompt, criteria: task.criteria };
    assert.equal(sha(JSON.stringify(frozen)), FROZEN[task.id], `${task.id}: the frozen prompt or criteria changed`);
  }
});

test("status: 12 tasks are active, six are retired with a reason, evidence, date and replacement, and the new tasks are dated", () => {
  const tasks = load().tasks;
  assert.deepEqual(tasks.filter((x) => x.status === "active").map((x) => x.id), ACTIVE);
  assert.equal(ACTIVE.length, 12);
  assert.deepEqual(tasks.filter((x) => x.status === "retired").map((x) => x.id), RETIRED);
  for (const task of tasks) {
    if (task.status === "retired") {
      assert.ok(task.retired.reason && task.retired.evidence && task.retired.date && task.retired.replacedBy, `${task.id} retirement fields`);
      assert.ok(IDS.includes(task.retired.replacedBy) && !RETIRED.includes(task.retired.replacedBy), `${task.id} replacement is an active task`);
      if (task.retired.ground === "duplicate") assert.match(task.retired.evidence, /paragraphs 1 to 5 of fixtures\/h16\//, `${task.id} evidence names the containing task`);
      else assert.match(task.retired.evidence, /aborted round .*final partial round/, `${task.id} evidence cites both partial rounds`);
    } else {
      assert.equal(task.retired, undefined, `${task.id} is active and has no retirement record`);
    }
    if (NEW.includes(task.id)) assert.equal(task.added, "2026-10-22", `${task.id} added date`);
  }
  // A retired task keeps its fixture, golden, bad copy and check data in the tree.
  for (const id of RETIRED) {
    for (const dir of ["fixtures", "golden", "bad"]) assert.ok(existsSync(join(BENCH, dir, id)), `${dir}/${id} is kept`);
  }
});

test("home-ground tasks h7 to h12 and h16 to h18 are kind home, all script criteria, with a recorded source", () => {
  const tasks = load().tasks.filter((x) => HOME.includes(x.id));
  assert.deepEqual(tasks.map((x) => x.id), HOME);
  for (const t of tasks) {
    assert.equal(t.kind, "home", `${t.id} kind`);
    assert.ok(t.criteria.every((c) => c.kind === "script"), `${t.id} has only script criteria`);
    assert.ok(t.source.tool && t.source.repo && t.source.file && t.source.lines && t.source.note, `${t.id} source fields`);
    assert.match(t.source.commit, HEX40, `${t.id} source commit`);
    assert.equal(t.source.license, "MIT");
  }
  const byTool = (name) => tasks.filter((x) => x.source.tool.startsWith(name)).map((x) => x.id);
  assert.deepEqual(byTool("Humanizer"), ["h7", "h8", "h16"]);
  assert.deepEqual(byTool("unslop"), ["h9", "h10", "h17"]);
  assert.deepEqual(byTool("everwrite"), ["h11", "h12", "h18"]);
});

test("home-ground prompts use the agreed wording and the file name of the fixture", () => {
  for (const t of load().tasks.filter((x) => HOME.includes(x.id))) {
    const name = relative(join(BENCH, "fixtures", t.id), fixtureOf(t.id).file);
    const en = `${name} reads like an AI wrote it. Rewrite it in place so it sounds like a person wrote it. Keep what it says.`;
    const de = `${name} klingt, als hätte eine KI es geschrieben. Schreib es direkt in der Datei so um, dass es von einem Menschen stammt. Der Inhalt bleibt gleich.`;
    assert.equal(t.prompt, t.id === "h10" || t.id === "h17" ? de : en, `${t.id} prompt`);
  }
});

test("home data: at least 3 facts, at least 4 tells, notes unscored, facts and tells really occur in the before text", () => {
  for (const id of HOME) {
    const d = JSON.parse(readFileSync(join(BENCH, "home", `${id}.json`), "utf8"));
    const before = fixtureOf(id).text;
    assert.ok(d.facts.length >= 3, `${id} facts`);
    // Only strong catalog entries are scored, so a before text may carry as few as four of them.
    assert.ok(d.tells.length >= 4, `${id} tells`);
    assert.equal(d.tellSources.length, d.tells.length, `${id} names a catalog entry for every tell`);
    assert.equal(d.noteSources.length, d.notes.length, `${id} names a catalog entry for every note`);
    for (const f of d.facts) {
      const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${f})(?![\\p{L}\\p{N}])`, "iu");
      assert.ok(re.test(before), `${id}: fact ${f} is not in the before text`);
    }
    for (const p of d.tells) assert.ok(new RegExp(p, "imu").test(before), `${id}: tell ${p} does not match the before text`);
    for (const p of d.preserve) assert.ok(before.includes(p), `${id}: preserve "${p}" is not in the before text`);
  }
});

test("home fixtures hold 60 to 250 words and no comment", () => {
  for (const id of HOME_OLD) {
    const text = fixtureOf(id).text;
    const n = (text.match(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu) ?? []).length;
    assert.ok(n >= 60 && n <= 250, `${id} has ${n} words`);
    assert.ok(!text.includes("<!--"), `${id} fixture carries a comment`);
  }
});

test("the full-length home fixtures h16 to h18 hold at least 250 whitespace-separated words, and the source note says what they are", () => {
  for (const id of HOME_NEW) {
    const text = fixtureOf(id).text;
    const n = text.split(/\s+/).filter(Boolean).length;
    assert.ok(n >= 250 && n <= 400, `${id} has ${n} words`);
    assert.ok(!text.includes("<!--"), `${id} fixture carries a comment`);
  }
  const tasks = load().tasks;
  assert.match(tasks.find((x) => x.id === "h17").source.note, /composite/);
  assert.match(tasks.find((x) => x.id === "h18").source.note, /composite/);
});

test("the h16 fixture is the whole Humanizer example: its first five paragraphs are the h8 fixture, verbatim", () => {
  const h8 = fixtureOf("h8").text;
  const h16 = fixtureOf("h16").text;
  assert.ok(h16.startsWith(h8.trimEnd()), "h16 starts with the h8 text");
  assert.equal(h16.trim().split(/\n\n+/).length, 6);
});

test("home-ground goldens differ from the fixtures", () => {
  for (const id of HOME) {
    const fx = fixtureOf(id);
    const gold = join(BENCH, "golden", id, relative(join(BENCH, "fixtures", id), fx.file));
    assert.notEqual(readFileSync(gold, "utf8"), fx.text, `${id} golden equals the fixture`);
  }
});

test("the document has a Home ground (F8) section with sources, hashes, freeze statement and benchmark status", () => {
  const doc = readFileSync(join(ROOT, "docs", "HEAD-TO-HEAD.md"), "utf8");
  assert.ok(doc.includes("## Home ground (F8)"));
  assert.ok(/frozen in a commit before (any|the) run/i.test(doc), "freeze statement");
  for (const t of load().tasks.filter((x) => HOME.includes(x.id))) {
    assert.ok(doc.includes(`### ${t.id}`), `${t.id} heading`);
    assert.ok(doc.includes(t.source.commit), `${t.id} commit`);
    assert.ok(doc.includes(t.source.file), `${t.id} file`);
    assert.ok(doc.includes(t.source.lines), `${t.id} lines`);
  }
  for (const needle of ["issues/229", "evals/cases.md", "evals/evals.json", "TESTS.md", "not reproducible here", "reproducible here"]) {
    assert.ok(doc.includes(needle), `published benchmark status mentions ${needle}`);
  }
  const section = doc.slice(doc.indexOf("## Home ground (F8)"));
  const english = section.replace(/```[\s\S]*?```/g, "");
  assert.ok(!/[–—]/.test(english), "no em or en dash in the English prose of the section");
});

test("the competitors' own published After texts pass the criteria they should pass", () => {
  for (const id of ["h7", "h8"]) {
    const res = runCheck(id, join(BENCH, "after", id));
    for (const c of CRITERIA) assert.equal(res[c], true, `competitor After for ${id} ${c}: ${JSON.stringify(res)}`);
  }
  // The everwrite After lines for h12 add a new API and a migration plan from other examples, so only C3 fails.
  const h12 = runCheck("h12", join(BENCH, "after", "h12"));
  assert.deepEqual(CRITERIA.filter((c) => h12[c] === false), ["C3"], JSON.stringify(h12));
  // everwrite's After lines for h18 add figures and a problem that the Before text lacks, so only C3 fails.
  const h18 = runCheck("h18", join(BENCH, "after", "h18"));
  assert.deepEqual(CRITERIA.filter((c) => h18[c] === false), ["C3"], JSON.stringify(h18));
  // The Humanizer After text for the whole Lisbon example passes every criterion (it has I'd at a sentence start).
  const h16 = runCheck("h16", join(BENCH, "after", "h16"));
  for (const c of CRITERIA) assert.equal(h16[c], true, `competitor After for h16 ${c}: ${JSON.stringify(h16)}`);
});

// ---- replacement tasks h13 to h18 (2026-10-22): data, fixtures and checks ------------------------
const wsWords = (s) => s.split(/\s+/).filter(Boolean).length;
const checkerData = (id) => JSON.parse(readFileSync(join(BENCH, "checker-data", `${id}.json`), "utf8"));
const read = (...parts) => readFileSync(join(BENCH, ...parts), "utf8");
const LIST_LINE = /^\s*(?:[-*+]|\d+[.)])\s+/;
const TABLE_LINE = /^\s*\|/;

test("h13 data: 62 facts that occur in the fixture, 24 tells that match it, and a fixture of 400 to 550 words", () => {
  const d = checkerData("h13");
  const fx = read("fixtures", "h13", "RELEASE-NOTES.md");
  assert.ok(d.facts.length >= 60 && new Set(d.facts).size === d.facts.length, `${d.facts.length} distinct facts`);
  for (const f of d.facts) assert.ok(fx.includes(f), `fact ${f} is not in the fixture`);
  assert.ok(d.tells.length >= 12);
  for (const p of d.tells) assert.ok(new RegExp(p, "imu").test(fx), `tell ${p} does not match the fixture`);
  const tokens = (fx.match(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu) ?? []).length;
  for (const n of [wsWords(fx), tokens]) assert.ok(n >= 400 && n <= 550, `${n} words`);
  // The kinds of fact the brief names are all there.
  assert.ok(d.facts.some((f) => /^\d{4}-\d{2}-\d{2}$/.test(f)), "an ISO date");
  assert.ok(d.facts.some((f) => /^\d{1,3},\d{3}$/.test(f)), "a count with a thousands separator");
  assert.ok(d.facts.some((f) => /%$/.test(f)), "a percentage");
  assert.ok(d.facts.some((f) => /^#\d+$/.test(f)), "an issue reference");
  assert.ok(d.facts.some((f) => /^https:\/\//.test(f)), "a URL");
  assert.ok(d.facts.some((f) => /^`/.test(f)), "a code span");
  assert.ok(d.facts.some((f) => /[ëèó]/.test(f)), "a name with an accent");
  assert.ok(d.facts.some((f) => f.startsWith('"')), "a quoted sentence");
});

test("h13 fixture: tells sit in the intro, in the closer, in at least four bullets and in at least three table cells", () => {
  const d = checkerData("h13");
  const L = read("fixtures", "h13", "RELEASE-NOTES.md").split("\n");
  const cellHit = (l) => d.cellTells.some((p) => new RegExp(p, "iu").test(l));
  const tellHit = (l) => d.tells.some((p) => new RegExp(p, "imu").test(l));
  assert.ok(L.filter((l) => LIST_LINE.test(l) && cellHit(l)).length >= 4, "bullets with a tell");
  assert.ok(L.filter((l) => TABLE_LINE.test(l) && !/^\s*\|[\s|-]+$/.test(l) && cellHit(l)).length >= 3, "table rows with a tell");
  const paragraphs = L.filter((l) => l.trim() && !l.startsWith("#") && !LIST_LINE.test(l) && !TABLE_LINE.test(l));
  assert.ok(tellHit(paragraphs[0]), "the intro has a tell");
  assert.ok(tellHit(paragraphs[paragraphs.length - 1]), "the closer has a tell");
  const table = L.filter((l) => TABLE_LINE.test(l));
  assert.ok(table.length >= 6, "a table with a header and five rows");
  assert.ok(new Set(table.map((r) => r.trim().replace(/^\||\|$/g, "").split("|").length)).size === 1, "every row has the same number of columns");
  assert.match(table[0], /Notes/);
});

test("h13 golden keeps every heading, the table shape and the number of bullets of the fixture", () => {
  const fx = read("fixtures", "h13", "RELEASE-NOTES.md").split("\n");
  const gold = read("golden", "h13", "RELEASE-NOTES.md").split("\n");
  assert.deepEqual(gold.filter((l) => /^#{1,6}\s/.test(l)), fx.filter((l) => /^#{1,6}\s/.test(l)));
  assert.equal(gold.filter((l) => TABLE_LINE.test(l)).length, fx.filter((l) => TABLE_LINE.test(l)).length);
  assert.equal(gold.filter((l) => LIST_LINE.test(l)).length, fx.filter((l) => LIST_LINE.test(l)).length);
});

test("h14 data: front matter lang en, 450 to 600 words, three foreign blocks and a code block that occur in the fixture, tells in prose, a list and a table", () => {
  const d = checkerData("h14");
  const fx = read("fixtures", "h14", "guide.md");
  const L = fx.split("\n");
  assert.match(fx, /^---\ntitle: [^\n]+\nlang: en\n/);
  const tokens = (fx.match(/[\p{L}\p{N}]+(?:'[\p{L}\p{N}]+)*/gu) ?? []).length;
  for (const n of [wsWords(fx), tokens]) assert.ok(n >= 450 && n <= 600, `${n} words`);
  for (const l of [...d.spanish, ...d.turkish, ...d.german, ...d.french]) assert.ok(L.includes(l), `foreign line is not in the fixture: ${l}`);
  assert.equal(d.spanish.length, 2);
  assert.ok(d.spanish.every((l) => l.startsWith("— ")), "Spanish rayas");
  assert.match(d.german[0], /„[^“]*–[^“]*“/, "German low-9 quotes with a spaced en dash");
  assert.match(d.french[0], /« [^»]*—[^»]*»/, "French guillemets with em dashes");
  assert.match(d.turkish[0], /–/, "Turkish en dash");
  assert.ok(fx.includes(d.code) && /—/.test(d.code), "a fenced code block with em dashes in its comments");
  assert.ok(d.tells.length >= 14);
  const english = L.filter((l) => !d.spanish.includes(l) && !d.turkish.includes(l) && !d.german.includes(l) && !d.french.includes(l)).join("\n").replace(d.code, "");
  for (const p of d.tells) assert.ok(new RegExp(p, "imu").test(english), `tell ${p} does not match the English prose`);
  const hit = (l) => d.tells.some((p) => new RegExp(p, "imu").test(l));
  assert.ok(L.some((l) => LIST_LINE.test(l) && hit(l)), "a tell in a list item");
  assert.ok(L.some((l) => TABLE_LINE.test(l) && hit(l)), "a tell in a table cell");
  assert.ok(L.some((l) => /—/.test(l) && !d.french.includes(l) && !d.code.includes(l) && !l.startsWith("— ") && !d.spanish.includes(l)), "an em dash in English prose");
  assert.ok(d.facts.length >= 10);
  for (const f of d.facts) assert.ok(fx.includes(f), `fact ${f} is not in the fixture`);
});

test("h14 golden keeps the front matter, the foreign lines and the code block, and has no em dash in English prose", () => {
  const d = checkerData("h14");
  const gold = read("golden", "h14", "guide.md");
  const fx = read("fixtures", "h14", "guide.md");
  assert.equal(/^---\n([\s\S]*?)\n---\n/.exec(gold)[1], /^---\n([\s\S]*?)\n---\n/.exec(fx)[1]);
  assert.ok(gold.includes(d.code));
  const rest = gold.replace(d.code, "").split("\n").filter((l) => ![...d.spanish, ...d.turkish, ...d.german, ...d.french].includes(l));
  assert.ok(rest.every((l) => !l.includes("—")));
});

test("h15 fixture: a repository with the legitimate dashes, quotes and languages that the task names", () => {
  const dir = join(BENCH, "fixtures", "h15");
  const files = listFiles(dir).map((f) => relative(dir, f)).sort();
  assert.deepEqual(files, [".github/workflows/ci.yml", "CHANGELOG.md", "README.md", "docs/de/anleitung.md", "docs/fr/notes.md", "docs/guide.md", "docs/guides/setup.md", "package.json"]);
  const pkg = JSON.parse(read("fixtures", "h15", "package.json"));
  assert.ok(pkg.scripts.test && !pkg.scripts["lint:prose"]);
  assert.match(read("fixtures", "h15", ".github/workflows/ci.yml"), /^  test:/m);
  const readme = read("fixtures", "h15", "README.md");
  const fence = /^```[^\n]*\n([\s\S]*?)^```/m.exec(readme)[1];
  assert.match(fence, /—/, "the README code block has an em dash");
  assert.match(readme, /^>.*let me know/im, "the README has a blockquote that quotes a tell phrase");
  assert.match(read("fixtures", "h15", "docs/fr/notes.md"), /^— /m);
  assert.match(read("fixtures", "h15", "docs/de/anleitung.md"), /„[^“]* – [^“]*“/);
  const changelog = read("fixtures", "h15", "CHANGELOG.md");
  assert.match(changelog, /1\.0–1\.2/);
  assert.match(changelog, /"[^"]*—[^"]*"/, "an em dash in a quoted commit title");
  const tells = /testament|seamless|robust|game-changer|let me know|fast-paced|delves|in today's|future of/i;
  assert.match(read("fixtures", "h15", "docs/guide.md"), tells, "the fixture guide has tells");
  assert.doesNotMatch(read("fixtures", "h15", "docs/guides/setup.md"), tells, "the nested guide is clean");
  assert.doesNotMatch(read("checker-data", "h15-clean-guide.md"), tells, "the replacement guide is clean");
  assert.equal(listFiles(join(BENCH, "bad", "h15")).length, files.length);
});

// The golden repository with `edit` applied to its lint script and a log of the files that each run scanned.
function h15WithLog(edit, setup = () => {}) {
  const dir = mkdtempSync(join(tmpdir(), "h2h-h15-"));
  try {
    cpSync(join(BENCH, "golden", "h15"), dir, { recursive: true });
    const script = join(dir, "scripts", "lint-prose.mjs");
    const log = join(dir, "..", `${relative(tmpdir(), dir)}.log`);
    writeFileSync(script, `${edit(readFileSync(script, "utf8"))}\n`);
    setup(dir);
    const r = spawnSync(process.execPath, [CHECK, "h15", dir], { encoding: "utf8", timeout: 300000, env: { ...process.env, H2H_TEST_LOG: log } });
    assert.equal(r.status, 0, r.stderr);
    const res = JSON.parse(r.stdout.trim().split("\n").pop());
    const seen = existsSync(log) ? readFileSync(log, "utf8").split("\n").filter(Boolean) : [];
    rmSync(log, { force: true });
    return { res, seen };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
// Makes the lint script append every scanned file to the log named by H2H_TEST_LOG.
const withScanLog = (t) => t.replace('let found = 0;', 'import { appendFileSync } from "node:fs";\nlet found = 0;\nfor (const f of files) if (process.env.H2H_TEST_LOG) appendFileSync(process.env.H2H_TEST_LOG, `${f}\\n`);');

test("h15 invents a different directory and file name for the dirty case on every check", () => {
  const a = h15WithLog(withScanLog);
  const b = h15WithLog(withScanLog);
  const invented = (seen) => [...new Set(seen.filter((f) => /^docs\/section-[0-9a-f]{8}\/page-[0-9a-f]{8}\.md$/.test(f)))];
  assert.equal(invented(a.seen).length, 1, a.seen.join(","));
  assert.equal(invented(b.seen).length, 1);
  assert.notEqual(invented(a.seen)[0], invented(b.seen)[0]);
  assert.equal(a.res.C5, true);
  // The five protected files and the clean guide are scanned in every run.
  for (const f of ["README.md", "docs/guide.md", "docs/guides/setup.md", "docs/fr/notes.md", "docs/de/anleitung.md"]) assert.ok(a.seen.includes(f), `${f} was not scanned`);
});

test("h15 judges the restored protected files: an arm that deletes the blockquote from its README or edits the French note gains nothing", () => {
  // The script reads blockquotes, so the restored README fails it; the arm's own README no longer has the quote.
  const gamed = h15WithLog(
    (t) => t.replace("if (inFence || /^\\s*>/.test(line)) return;", "if (inFence) return;"),
    (dir) => {
      const readme = join(dir, "README.md");
      writeFileSync(readme, readFileSync(readme, "utf8").split("\n").filter((l) => !l.startsWith(">")).join("\n"));
    },
  );
  assert.equal(gamed.res.C1, false, JSON.stringify(gamed.res));
  // The script flags em dashes anywhere; the arm empties docs/fr/notes.md in its copy.
  const french = h15WithLog(
    (t) => t.replace(`"in today's",`, `"in today's", "—",`),
    (dir) => writeFileSync(join(dir, "docs", "fr", "notes.md"), "# Notes\n"),
  );
  assert.equal(french.res.C1, false, JSON.stringify(french.res));
});

test("h15 C1 judges the clean state only: the arm's own docs/guide.md is replaced by a clean guide", () => {
  const { res } = h15WithLog((t) => t, (dir) => writeFileSync(join(dir, "docs", "guide.md"), read("fixtures", "h15", "docs", "guide.md")));
  assert.equal(res.C1, true, JSON.stringify(res));
});

// ---- the saturation ruling and the history of the partial rounds (2026-10-22) ---------------------------------------
const HISTORY = join(BENCH, "results", "history", "partial-round-1");
const historyScores = (round) => JSON.parse(readFileSync(join(HISTORY, round, "scores.json"), "utf8"));
// The cloud copy of the branch was squashed without the raw evidence (see bench/head-to-head/results/README.md).
// A test that reads such a file is skipped, with the file named, only when the file is absent; where the
// evidence exists (the owner's machine) it runs in full.
const evidenceSkip = (...files) => {
  const gone = files.filter((f) => !existsSync(join(HISTORY, f)));
  return gone.length ? { skip: `evidence left out of the cloud squash: ${gone.map((f) => relative(ROOT, join(HISTORY, f))).join(", ")}` } : {};
};
const SCORES = ["aborted/scores.json", "final/scores.json"];
const RESCORED = ["rescored-kept-tasks/aborted-scores.json", "rescored-kept-tasks/final-scores.json"];
const ARM_ORDER = ["ours", "blader", "blader-inv", "unslop", "unslop-inv", "everwrite", "everwrite-inv", "base"];
const BLIND_IDS = ["h1", "h2", "h3", "h4"];
const scriptedCriteria = (task) => (BLIND_IDS.includes(task) ? ["C1", "C2", "C3", "C4"] : CRITERIA);
// Per task: { runs, max, means: {arm: mean scripted points}, spread } from a scores.json (null criteria are not points).
function saturation(scores, task) {
  const byArm = {};
  for (const [key, row] of Object.entries(scores)) {
    const m = /^(h\d+)-(.+)-(\d+)$/.exec(key);
    if (m[1] !== task) continue;
    (byArm[m[2]] ??= []).push(scriptedCriteria(task).filter((c) => row[c] === true).length);
  }
  const means = Object.fromEntries(Object.entries(byArm).map(([arm, l]) => [arm, l.reduce((a, b) => a + b, 0) / l.length]));
  const values = Object.values(means);
  return { runs: Object.values(byArm).reduce((n, l) => n + l.length, 0), max: scriptedCriteria(task).length, means, spread: Math.max(...values) - Math.min(...values) };
}
const docText = () => readFileSync(join(ROOT, "docs", "HEAD-TO-HEAD.md"), "utf8");

test("the saturation table in the document is the table computed from the two published score files", evidenceSkip(...SCORES), () => {
  const doc = docText();
  const section = doc.slice(doc.indexOf("## Saturation ruling"), doc.indexOf("## Replacement tasks"));
  const rows = section.split("\n").filter((l) => /^\| h\d+ \| (active|retired) \| (aborted|final) \|/.test(l));
  const rounds = { aborted: historyScores("aborted"), final: historyScores("final") };
  let expected = 0;
  for (const task of IDS.slice(0, 12)) {
    for (const [round, scores] of Object.entries(rounds)) {
      const s = saturation(scores, task);
      expected += 1;
      const cells = ARM_ORDER.map((a) => (a in s.means ? s.means[a].toFixed(2) : "-")).join(" | ");
      const want = `| ${task} | ${RETIRED.includes(task) ? "retired" : "active"} | ${round} | ${s.runs} | ${s.max} | ${cells} | ${s.spread.toFixed(2)} |`;
      assert.ok(rows.includes(want), `no row ${want}`);
    }
  }
  assert.equal(rows.length, expected);
  assert.equal(Object.keys(rounds.aborted).length, 223);
  assert.equal(Object.keys(rounds.final).length, 112);
  assert.equal(readFileSync(join(HISTORY, "saturation-table.md"), "utf8").trimEnd().split("\n").filter((l) => /^\| h\d+ \|/.test(l)).length, expected);
});

test("every retired task meets the saturation test in both partial rounds, and its stored evidence repeats the computed numbers", evidenceSkip(...SCORES), () => {
  for (const task of load().tasks.filter((x) => RETIRED.includes(x.id) && x.retired.ground !== "duplicate")) {
    for (const [round, label] of [["aborted", "aborted round"], ["final", "final partial round"]]) {
      const s = saturation(historyScores(round), task.id);
      const full = Object.values(s.means).filter((m) => Math.abs(m - s.max) < 1e-9).length;
      assert.ok(full >= 4, `${task.id} ${round}: ${full} arms at full marks`);
      assert.ok(s.spread <= 1 + 1e-9, `${task.id} ${round}: spread ${s.spread}`);
      assert.ok(s.means.base >= 3 - 1e-9, `${task.id} ${round}: the baseline scored ${s.means.base}`);
      const values = Object.values(s.means);
      const piece = `${label} (${s.runs} runs, mean scripted points of ${s.max} per arm): lowest ${Math.min(...values).toFixed(2)}, highest ${Math.max(...values).toFixed(2)}, spread ${s.spread.toFixed(2)}; ${full} of 8 arms at full marks`;
      assert.ok(task.retired.evidence.includes(piece), `${task.id}: evidence lacks "${piece}"`);
    }
  }
  // The kept tasks are not saturated: their arm means differ by at least 1.00 point in at least one round.
  for (const id of ACTIVE.filter((x) => IDS.indexOf(x) < 12)) {
    const spread = Math.max(...["aborted", "final"].map((r) => saturation(historyScores(r), id).spread));
    assert.ok(spread >= 0.66, `${id} spread ${spread}`);
  }
});

test("the history of the partial rounds: scores of both, transcripts of the 112-run round under 8 MB, scrubbed, rescored kept tasks", evidenceSkip(...SCORES, ...RESCORED), () => {
  const files = listFiles(HISTORY);
  const size = files.reduce((n, f) => n + statSync(f).size, 0);
  assert.ok(size < 8 * 1024 * 1024, `${size} bytes`);
  const finalScores = historyScores("final");
  const transcripts = readdirSync(join(HISTORY, "final")).filter((f) => f.endsWith(".jsonl"));
  assert.equal(transcripts.length, 112);
  assert.deepEqual(transcripts.map((f) => f.replace(/\.jsonl$/, "")).sort(), Object.keys(finalScores).sort());
  assert.ok(!transcripts.some((f) => f.includes(".failed.")), "failed attempts are not published");
  // The aborted round publishes its scores and nothing of its run output.
  assert.deepEqual(readdirSync(join(HISTORY, "aborted")).sort(), ["meta.json", "scores.json"]);
  for (const f of files) {
    const text = readFileSync(f, "utf8");
    assert.ok(!/\/Users\/(?!<user>)/.test(text), `${relative(ROOT, f)} holds a user path`);
    assert.ok(!/[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(text), `${relative(ROOT, f)} holds an email address`);
    assert.ok(!/claude-501/.test(text), `${relative(ROOT, f)} holds a scratchpad path`);
  }
  assert.match(readFileSync(join(HISTORY, "README.md"), "utf8"), /223 scored runs/);
  // The rescored kept-task scores differ from the original ones in h8 C3 and h11 C5 only.
  for (const round of ["aborted", "final"]) {
    const before = historyScores(round);
    const after = JSON.parse(readFileSync(join(HISTORY, "rescored-kept-tasks", `${round}-scores.json`), "utf8"));
    assert.ok(Object.keys(after).length > 50);
    for (const [key, row] of Object.entries(after)) {
      const task = key.split("-")[0];
      assert.ok(ACTIVE.includes(task) || task === "h8", `${key} is a kept task (h8 was kept when it was rescored)`);
      for (const c of CRITERIA) {
        if (row[c] !== before[key][c]) assert.ok((task === "h8" && c === "C3") || (task === "h11" && c === "C5"), `${key} ${c} changed`);
      }
    }
  }
});

test("the criteria repairs table logs h8 C3 and h11 C5 with counts that match the published scores, and the inspected criteria carry theirs", evidenceSkip(...SCORES, ...RESCORED), () => {
  const doc = docText();
  assert.ok(doc.includes("| Date | Task | Criterion | Evidence | Reason |\n|---|---|---|---|---|\n"));
  const count = (scores, task, crit) => {
    const rows = Object.entries(scores).filter(([k]) => k.startsWith(`${task}-`));
    return `${rows.filter(([, r]) => r[crit] === true).length} of ${rows.length}`;
  };
  const rescored = (round) => JSON.parse(readFileSync(join(HISTORY, "rescored-kept-tasks", `${round}-scores.json`), "utf8"));
  const row = (task, crit) => doc.split("\n").find((l) => l.startsWith(`| 2026-10-22 | ${task} | ${crit} |`));
  const h8 = row("h8", "C3");
  assert.ok(h8, "h8 C3 row");
  assert.ok(h8.includes(`${count(historyScores("aborted"), "h8", "C3")} and ${count(historyScores("final"), "h8", "C3")} before`), h8);
  assert.ok(h8.includes(`${count(rescored("aborted"), "h8", "C3")} and ${count(rescored("final"), "h8", "C3")} after`), h8);
  const h11 = row("h11", "C5");
  assert.ok(h11, "h11 C5 row");
  assert.ok(h11.includes(`${count(historyScores("aborted"), "h11", "C5")} and ${count(historyScores("final"), "h11", "C5")} before`), h11);
  assert.ok(h11.includes(`${count(rescored("aborted"), "h11", "C5")} and ${count(rescored("final"), "h11", "C5")} after`), h11);
  // Criteria that were inspected and left alone: the pass counts in the text are the real ones.
  const inspected = doc.slice(doc.indexOf("Criteria inspected on 2026-10-22"), doc.indexOf("## Fairness rules"));
  for (const [task, crit, a, f] of [["h9", "C2", 16, 8], ["h1", "C3", 24, 16], ["h3", "C3", 24, 8], ["h10", "C1", 16, 8]]) {
    const ca = count(historyScores("aborted"), task, crit);
    const cf = count(historyScores("final"), task, crit);
    assert.ok(ca.endsWith(` of ${a}`) && cf.endsWith(` of ${f}`), `${task} ${crit}: ${ca}, ${cf}`);
    assert.ok(inspected.includes(`(${ca.replace(" of ", " of ")} passed`) || inspected.includes(`${ca.split(" ")[0]} of ${a}`), `${task} ${crit} aborted count ${ca} is not in the text`);
    assert.ok(inspected.includes(`${cf.split(" ")[0]} of ${f}`), `${task} ${crit} final count ${cf} is not in the text`);
  }
});

test("the document names the retired and the new tasks, the history path and the active count", () => {
  const section = docText().slice(docText().indexOf("## Saturation ruling"), docText().indexOf("## Replacement tasks"));
  for (const id of RETIRED) assert.ok(new RegExp(`\\| ${id} [^|]*\\| h\\d+ \\|`).test(section), `${id} is listed with its replacement`);
  for (const needle of ["bench/head-to-head/results/history/partial-round-1/", "12 tasks", "frozen in one commit before any run", "h17", "223 scored runs", "112 valid runs"]) {
    assert.ok(section.includes(needle), `the ruling does not mention ${needle}`);
  }
});

test("h15 judges the appended README paragraph on the restored README: a skip marker in the arm's own README gains nothing", () => {
  const { res } = h15WithLog(
    (s) => s.replace(`...(existsSync("README.md") ? ["README.md"] : [])`, `...(existsSync("README.md") && !readFileSync("README.md", "utf8").includes("lint-skip") ? ["README.md"] : [])`),
    (dir) => writeFileSync(join(dir, "README.md"), `${readFileSync(join(dir, "README.md"), "utf8")}\n<!-- lint-skip -->\n`),
  );
  assert.equal(res.C1, true, JSON.stringify(res));
  assert.equal(res.C3, true, JSON.stringify(res));
});
