import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanCatalog } from "../dist/src/catalog.js";
import { prepare } from "../dist/src/doc.js";

const hits = (text) => scanCatalog(prepare("a.md", text), "en").map((h) => h.phrase);
const verify = (before, after, ext = "md") => {
  const dir = mkdtempSync(join(tmpdir(), "slop-deep-"));
  try {
    writeFileSync(join(dir, `b.${ext}`), before);
    writeFileSync(join(dir, `a.${ext}`), after);
    const r = spawnSync(process.execPath, ["dist/src/cli.js", "--verify", join(dir, `b.${ext}`), join(dir, `a.${ext}`)], { encoding: "utf8" });
    return { status: r.status, out: r.stdout };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

// D1 and D6: hedge about missing information
test("catalog: a hedge about missing information is a hit", () => {
  for (const [text, phrase] of [
    ["Pricing for the ferry route is not publicly disclosed.", "not publicly disclosed"],
    ["The crew roster has not been readily accessible since 2019.", null],
    ["Soil samples from the northern field are not widely documented.", "not widely documented"],
    ["The vendor's contract terms remain undisclosed.", "remain undisclosed"],
    ["Please let me know about the delivery window.", "let me know"],
  ]) {
    const found = hits(text);
    if (phrase === null) assert.deepEqual(found, [], text);
    else assert.deepEqual(found.map((f) => f.toLowerCase()), [phrase], text);
  }
});

test("catalog: ordinary uses of those words are not hits", () => {
  for (const text of [
    "Documents that are publicly available stay online for ten years.",
    "The harbour is known for its cranes, and the permits are readily issued.",
    "Records are kept private until the court releases them.",
    "Nobody knows the exact figure, so the tally is recounted each spring.",
    'The statute says the files "are not publicly available" until 2030.',
    "This feature is not generally available yet.",
    "The format is not widely known.",
    "The cache is not freely shared between workers.",
  ]) assert.deepEqual(hits(text), [], text);
});

// D2 and D6: English false agency
test("catalog: a tool that decides for itself is a hit", () => {
  for (const [text, phrase] of [
    ["The scheduler is smart: the platform decides on its own which pump runs.", "platform decides on its own"],
    ["Our software chooses the best route by itself.", "software chooses the best route by itself"],
    ["The platform decides for itself when to scale.", "platform decides for itself"],
    ["The assistant understands what you need before you finish typing.", "assistant understands what you need"],
  ]) assert.deepEqual(hits(text).map((f) => f.toLowerCase()), [phrase], text);
});

test("catalog: ordinary technical verbs and human subjects are not hits", () => {
  for (const text of [
    "The parser reads the file and the system decides nothing.",
    "The scheduler chooses the next job from the queue.",
    "The committee decides for itself, without outside advice.",
    "The nurse knows what you need and brings it.",
    "The compiler understands the syntax of version 5.",
    "The operating system chooses an ephemeral port on its own.",
    "The cluster is self-healing; the system decides for itself which node leads.",
    "The app decides on its own whether to retry.",
    "The engine chooses the best plan by itself.",
    "The multi-tool decides the order by itself.",
  ]) assert.deepEqual(hits(text), [], text);
});

// D3: structure checks of --verify
const DOC = [
  "---",
  "title: Notes",
  "---",
  "",
  "# Ferry timetable",
  "",
  "| Route | Minutes |",
  "| --- | --- |",
  "| North | 40 |",
  "",
  "```js",
  "const a = 1; // keep",
  "```",
  "",
  "The boat leaves at 9.",
  "",
].join("\n");

test("verify structure: an identical structure passes, prose edits pass", () => {
  const r = verify(DOC, DOC.replace("The boat leaves at 9.", "The boat sails at 9."));
  assert.equal(r.status, 0, r.out);
});

test("verify structure: each changed block is a blocking problem", () => {
  for (const [name, after, pattern] of [
    ["front matter", DOC.replace("title: Notes", "title: Ferry"), /1:1 structure front matter changed/],
    ["heading", DOC.replace("# Ferry timetable", "# Ferry schedule"), /5:1 structure heading changed/],
    ["table row", DOC.replace("| North | 40 |", "| North | 41 |"), /9:1 structure table row changed/],
    ["code comment", DOC.replace("// keep", "// kept"), /11:1 structure code block changed/],
  ]) {
    const r = verify(DOC, after);
    assert.equal(r.status, 1, `${name}: ${r.out}`);
    assert.match(r.out, pattern, name);
    assert.match(r.out, /^verify: \d+ problem\(s\)$/m, name);
  }
});

test("verify structure: a deleted or reordered block is a problem", () => {
  const noTable = DOC.replace(/\| Route[\s\S]*?\| North \| 40 \|\n\n/, "");
  const r = verify(DOC, noTable);
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /structure table row (missing|changed)/);
  const two = "# One\n\n```\na\n```\n\n```\nb\n```\n";
  const swapped = "# One\n\n```\nb\n```\n\n```\na\n```\n";
  const s = verify(two, swapped);
  assert.equal(s.status, 1, s.out);
  assert.equal((s.out.match(/structure code block changed/g) ?? []).length, 1);
  const gone = verify(DOC, DOC.replace(/---\ntitle: Notes\n---\n\n/, ""));
  assert.match(gone.out, /structure front matter missing/);
});

test("verify structure: a block the original lacks is not checked", () => {
  const r = verify("A plain note about 4 boats.\n", "A plain note about 4 boats.\n\n# Heading\n");
  assert.equal(r.status, 0, r.out);
});

test("verify structure: a leading thematic break is not front matter", () => {
  const r = verify("---\nIntro paragraph.\n---\n\n# T\n", "---\nIntro text.\n---\n\n# T\n");
  assert.equal(r.status, 0, r.out);
});

test("verify structure: an added block does not shift later blocks", () => {
  for (const [name, before, after] of [
    ["heading", "# A\n\n# B\n", "# A\n\n# New\n\n# B\n"],
    ["code", "```\na\n```\n\n```\nb\n```\n", "```\na\n```\n\n```\nnew\n```\n\n```\nb\n```\n"],
    ["table", "| a | b |\n| 1 | 2 |\n", "| a | b |\n| new | row |\n| 1 | 2 |\n"],
  ]) {
    const r = verify(before, after);
    assert.doesNotMatch(r.out, /structure/, `${name}: ${r.out}`);
  }
  const missing = verify("# A\n\n# B\n", "# A\n\n# New\n");
  assert.equal(missing.status, 1, missing.out);
  assert.match(missing.out, /structure heading (missing|changed)/);
});

test("verify structure: line ends, fenced hashes, setext headings and table alignment", () => {
  assert.equal(verify(DOC.replace(/\n/g, "\r\n"), DOC).status, 0);
  const fenced = "```sh\n# not a heading\n```\n\nText.\n";
  assert.equal(verify(fenced, fenced.replace("Text.", "Words.")).status, 0);
  const aligned = "| a | b |\n|:---|---:|\n| 1 | 2 |\n\nText.\n";
  assert.equal(verify(aligned, aligned.replace("Text.", "Words.")).status, 0);
  const setext = "Title\n=====\n\nText.\n";
  assert.equal(verify(setext, "Name\n=====\n\nText.\n").status, 0);
});

test("verify structure: only Markdown input gets the structure check", () => {
  const r = verify("# Compute total\nx = 1\n", "# Sum the values\nx = 1\n", "py");
  assert.doesNotMatch(r.out, /structure/);
  const md = verify("# Compute total\nx = 1\n", "# Sum the values\nx = 1\n", "md");
  assert.match(md.out, /structure heading changed/);
});

// D5: quote masks and an inch mark
test("quotes: straight and curly double-quoted text is exempt from the tell scan and --verify", () => {
  assert.deepEqual(hits('He called it "a seamless fix" and she wrote "let me know" back.'), []);
  assert.deepEqual(hits("He called it “a seamless fix” and she wrote “let me know” back."), []);
  assert.deepEqual(hits("Outside the quotes, let me know."), ["let me know"]);
  // --verify end to end: the same quoted tells give no problem
  const quoted = 'She wrote "let me know" and he wrote “let us know” on the card.\n';
  assert.equal(verify(quoted, quoted).status, 0);
});

test("quotes: an inch mark does not open a quote span", () => {
  assert.deepEqual(hits('The pipe is 5" wide. Please let me know if it leaks.'), ["let me know"]);
  assert.deepEqual(hits('Use a 5" pipe, a 6" pipe and let me know if it leaks.'), ["let me know"]);
  assert.deepEqual(hits('Cut a 5" board, then let me know. Cut a 6" board too.'), ["let me know"]);
});
