import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadCatalog, scanCatalog } from "../dist/src/catalog.js";
import { prepare } from "../dist/src/doc.js";

const CLI = "dist/src/cli.js";

/** Runs `--verify` on a before and an after text; returns status and stdout. */
function verify(before, after, ...flags) {
  const dir = mkdtempSync(join(tmpdir(), "slop-verify-"));
  try {
    writeFileSync(join(dir, "before.md"), before);
    writeFileSync(join(dir, "after.md"), after);
    const r = spawnSync(process.execPath, [CLI, "--verify", ...flags, join(dir, "before.md"), join(dir, "after.md")], { encoding: "utf8" });
    return { status: r.status, out: r.stdout, err: r.stderr };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

const CLEAN = "The cache serves 80% of reads. The build takes 4 minutes.\n";

test("verify: a clean rewrite exits 0 and says ok", () => {
  const r = verify(CLEAN, CLEAN);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^verify: ok \(unchanged\)$/m);
});

test("verify: English catalog phrases are hits", () => {
  for (const [text, phrase] of [
    ["The cache serves 80% of reads. Let us know what you think.\n", "Let us know"],
    ["The cache serves 80% of reads. The tool streamlines the build.\n", "streamlines"],
  ]) {
    const r = verify(CLEAN, text);
    assert.equal(r.status, 1, r.out);
    assert.match(r.out, new RegExp(`^\\d+:\\d+ catalog ${phrase}$`, "m"));
    assert.match(r.out, /^verify: \d+ problem\(s\)$/m);
  }
});

test("verify: a German tool-agency sentence is a hit with the language set", () => {
  const text = "Die Stufe wird automatisch gewählt. Unser Tool entscheidet selbst, welche Stufe gilt.\n";
  const r = verify(text.replace("Unser Tool entscheidet selbst", "Man wählt"), text, "--language", "de");
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /catalog Tool entscheidet selbst/);
});

test("verify: a French stock word is a hit with the language set", () => {
  const text = "Le moteur robuste lit 12 fichiers.\n";
  const r = verify("Le moteur lit 12 fichiers.\n", text, "--language", "fr");
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /catalog robuste/);
});

test("verify: a phrase in a quoted span, a dialogue line or code is not a hit", () => {
  const text = [
    'She wrote "let us know" on the card and "the tool streamlines it".',
    "",
    "Run `streamlined` to see it.",
    "",
    "```",
    "let me know",
    "```",
  ].join("\n");
  const r = verify(text, text);
  assert.equal(r.status, 0, r.out);
  assert.match(r.out, /^verify: ok \(unchanged\)$/m);
});

test("catalog scan skips a dialogue line that opens with a dash", () => {
  assert.deepEqual(scanCatalog(prepare("a.md", "— let me know, he said.\n"), "en"), []);
  assert.equal(scanCatalog(prepare("a.md", "He said let me know.\n"), "en").length, 1);
});

test("verify: an added first-person word fails through the compare", () => {
  const r = verify("The build takes 4 minutes.\n", "Our build takes 4 minutes.\n");
  assert.equal(r.status, 1, r.out);
  assert.match(r.out, /added +person +our/);
});

test("verify: a lint error on the rewrite fails", () => {
  const r = verify("The build takes 4 minutes.\n", "The build takes 4 minutes — on CI.\n");
  assert.equal(r.status, 1, r.out);
});

test("verify: a language with no tells file gives no hits and does not crash", () => {
  const text = "Bu derleme 4 dakika sürer.\n";
  const r = verify(text, text, "--language", "tr");
  assert.equal(r.status, 0, r.out + r.err);
  assert.deepEqual(loadCatalog("tr"), []);
  assert.deepEqual(loadCatalog("xx", "/nonexistent-dir"), []);
  assert.deepEqual(loadCatalog("../etc"), []);
  assert.deepEqual(scanCatalog(prepare("a.md", "let us know"), "tr"), []);
});

test("verify: takes two files and does not combine with --compare or --json", () => {
  const one = spawnSync(process.execPath, [CLI, "--verify", "README.md"], { encoding: "utf8" });
  assert.equal(one.status, 2);
  const both = spawnSync(process.execPath, [CLI, "--verify", "--compare", "README.md", "README.md"], { encoding: "utf8" });
  assert.equal(both.status, 2);
});

test("the tells files exist for en, de, fr and es, parse, and ship in the package", async () => {
  const pkg = JSON.parse((await import("node:fs")).readFileSync("package.json", "utf8"));
  assert.ok(pkg.files.includes("skills"));
  for (const lang of ["en", "de", "fr", "es"]) assert.ok(loadCatalog(lang).length > 10, lang);
  // every regex entry compiles (loadCatalog skips a broken one silently, so count the lines)
  const { readFileSync } = await import("node:fs");
  for (const lang of ["en", "de", "fr", "es"]) {
    const lines = readFileSync(`skills/ai-slop-linter/references/${lang}.tells.txt`, "utf8").split("\n").filter((l) => l.trim() && !l.startsWith("#"));
    assert.equal(loadCatalog(lang).length, lines.length, `${lang}: an entry did not compile`);
  }
});

test("the chatbot-residue forms named in SKILL.md are in the catalogs", () => {
  const hit = (lang, text) => scanCatalog(prepare("a.md", text), lang).length > 0;
  assert.ok(hit("en", "let me know"), "en let me know");
  assert.ok(hit("en", "details are not publicly available"));
  assert.ok(hit("fr", "N'hésitez pas à écrire. Plongeons. En conclusion. L'avenir s'annonce radieux. Sans faille. Pas seulement. Une révolution."));
  assert.ok(hit("de", "Zögern Sie nicht. Tauchen wir ein."));
  assert.ok(hit("es", "No dudes en escribir. Sumérgete en el tema."));
  assert.ok(!hit("fr", "La Révolution française date de 1789."));
});
