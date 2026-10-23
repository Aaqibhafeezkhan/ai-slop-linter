import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { chmodSync, cpSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { delimiter, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// The code under test for the head-to-head: every arm that uses our code runs from an immutable `git archive`
// copy of one commit (run/prepare-code.sh), never from the working tree. These tests use a tiny git repository
// with a fake TypeScript compiler (H2H_TSC), a fake claude and temporary output directories. No test calls the
// real claude. The last test builds the real HEAD archive and runs the real probes.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const BENCH = join(ROOT, "bench", "head-to-head");
const RUN = join(BENCH, "run");
const FIXTURES = join(BENCH, "fixtures");

const tmp = (name) => realpathSync(mkdtempSync(join(tmpdir(), `h2h-code-${name}-`)));
const rmTree = (dir) => {
  spawnSync("chmod", ["-R", "u+w", dir]);
  rmSync(dir, { recursive: true, force: true });
};
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
// The write sandbox of the platform (sandbox.sh): sandbox-exec on macOS, bubblewrap on Linux. Where it is missing
// or cannot run, the scripts refuse to run, so these tests (none is about the sandbox but the last two) run with
// H2H_ALLOW_UNSANDBOXED=1 there; never on macOS, where sandbox-exec is always present.
const BACKEND = process.platform === "darwin" ? "sandbox-exec" : "bwrap";
const HAS_SANDBOX = BACKEND === "bwrap"
  ? spawnSync("bwrap", ["--ro-bind", "/", "/", "--dev", "/dev", "--proc", "/proc", "true"]).status === 0
  : spawnSync("which", ["sandbox-exec"]).status === 0;
const cleanEnv = () => {
  const env = { ...process.env };
  for (const k of Object.keys(env)) if (k.startsWith("GIT_") || k.startsWith("H2H_")) delete env[k];
  if (!HAS_SANDBOX) env.H2H_ALLOW_UNSANDBOXED = "1";
  return env;
};
const git = (cwd, ...args) => {
  const r = spawnSync("git", ["-c", "user.name=Test", "-c", "user.email=test@example.invalid", "-c", "commit.gpgsign=false", ...args], { cwd, encoding: "utf8", env: cleanEnv() });
  assert.equal(r.status, 0, `git ${args.join(" ")}: ${r.stderr}`);
  return r.stdout.trim();
};

// The fake CLI: CommonJS, behaviour chosen by the options baked into the committed source.
const cliSource = ({ version = "1.2.3", compare = true, french = true, dash = true } = {}) => `"use strict";
const fs = require("fs");
const args = process.argv.slice(2);
if (args.includes("--version")) { console.log(${JSON.stringify(version)}); process.exit(0); }
if (args.includes("--help")) { console.log("usage: slop [options]${compare ? "\\n  slop --compare <before> <after>" : ""}"); process.exit(0); }
const text = fs.readFileSync(0, "utf8");
const isFrench = /Voici/.test(text);
const findings = [];
if (/\\u2014/.test(text)) {
  if (isFrench) { if (!${french}) findings.push({ rule: "dash" }); }
  else if (${dash}) findings.push({ rule: "dash" });
}
const language = isFrench && ${french} && args.includes("auto") ? "fr" : "en";
console.log(JSON.stringify([{ path: "stdin", language, findings }]));
`;
const FAKE_TSC_SOURCE = `"use strict";
const fs = require("fs");
if (process.env.FAKE_TSC_FAIL) { console.error("fake tsc: error"); process.exit(1); }
fs.mkdirSync("dist/src", { recursive: true });
fs.copyFileSync("src/cli.js", "dist/src/cli.js");
if (process.env.FAKE_TSC_TAMPER) fs.writeFileSync("skills/ai-slop-linter/SKILL.md", "tampered by the build\\n");
`;

// A repository with one commit per call. files: path -> content; the previous commit's files carry over.
function makeRepo() {
  const dir = tmp("repo");
  const tsc = join(tmp("tsc"), "fake-tsc.cjs");
  writeFileSync(tsc, FAKE_TSC_SOURCE);
  git(dir, "init", "-q", "-b", "main");
  const files = {};
  const commit = (changes, message = "c") => {
    Object.assign(files, changes);
    for (const [p, c] of Object.entries(files)) {
      mkdirSync(dirname(join(dir, p)), { recursive: true });
      writeFileSync(join(dir, p), c);
    }
    git(dir, "add", ...Object.keys(files));
    git(dir, "commit", "-q", "-m", message);
    return git(dir, "rev-parse", "HEAD");
  };
  const base = {
    "package.json": JSON.stringify({ name: "ai-slop-linter", version: "1.2.3" }),
    "tsconfig.json": "{}\n",
    "src/cli.js": cliSource(),
    "skills/ai-slop-linter/SKILL.md": "the skill\n",
    ".claude-plugin/plugin.json": "{}\n",
    "hooks/hooks.json": "{}\n",
    "marker.txt": "A\n",
    "bench/head-to-head/tasks.json": '{"tasks":[]}\n',
    ".gitignore": "bench/head-to-head/competitors/\n",
  };
  return { dir, tsc, commit, base };
}
const prepare = (repo, args, extraEnv = {}) =>
  spawnSync("bash", [join(RUN, "prepare-code.sh"), ...args], { encoding: "utf8", env: { ...cleanEnv(), H2H_REPO: repo.dir, H2H_TSC: repo.tsc, ...extraEnv } });
const probeLines = (out) => readFileSync(join(out, "code-probe.txt"), "utf8").trim().split("\n");

test("prepare-code archives the requested commit, not a dirty or different working tree, and never touches the working tree", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base, "A");
  const b = repo.commit({ "marker.txt": "B\n" }, "B");
  writeFileSync(join(repo.dir, "marker.txt"), "DIRTY\n");
  writeFileSync(join(repo.dir, "junk.txt"), "untracked\n");
  const before = { head: git(repo.dir, "rev-parse", "HEAD"), status: git(repo.dir, "status", "--porcelain") };
  const out = tmp("out");

  const r = prepare(repo, [a, out]);
  assert.equal(r.status, 0, r.stderr);
  const copy = join(out, `code-${a.slice(0, 12)}`);
  assert.equal(r.stdout.trim(), copy);
  assert.equal(readFileSync(join(copy, "marker.txt"), "utf8"), "A\n", "the committed content of the requested commit");
  assert.equal(existsSync(join(copy, "junk.txt")), false, "no untracked file of the working tree");
  assert.equal(readFileSync(join(out, "code-commit.txt"), "utf8").trim(), a);
  assert.equal(readFileSync(join(out, "code-bench-tree.txt"), "utf8").trim(), git(repo.dir, "rev-parse", `${a}:bench/head-to-head`));
  assert.equal(readFileSync(join(out, "code-tree.txt"), "utf8").trim(), git(repo.dir, "rev-parse", `${a}^{tree}`));

  const head = prepare(repo, ["", out, "--new-code"]);
  assert.equal(head.status, 0, head.stderr);
  const copyB = join(out, `code-${b.slice(0, 12)}`);
  assert.equal(readFileSync(join(copyB, "marker.txt"), "utf8"), "B\n", "the default commit is HEAD, still the committed content");
  assert.equal(readFileSync(join(out, "code-commit.txt"), "utf8").trim(), b);

  assert.deepEqual({ head: git(repo.dir, "rev-parse", "HEAD"), status: git(repo.dir, "status", "--porcelain") }, before, "HEAD and status unchanged");
  assert.equal(readFileSync(join(repo.dir, "marker.txt"), "utf8"), "DIRTY\n", "the dirty working file is untouched");
  rmTree(out);
});

test("prepare-code records the manifest of dist js, skills, hooks and .claude-plugin, and the probe results", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  const out = tmp("out");
  const r = prepare(repo, [a, out]);
  assert.equal(r.status, 0, r.stderr);
  const copy = join(out, `code-${a.slice(0, 12)}`);
  const want = [".claude-plugin/plugin.json", "dist/src/cli.js", "hooks/hooks.json", "skills/ai-slop-linter/SKILL.md"]
    .map((p) => `${sha256(readFileSync(join(copy, p)))}  ${p}\n`).join("");
  assert.equal(readFileSync(join(out, "code-manifest.txt"), "utf8"), want);
  assert.equal(readFileSync(join(copy, "dist", "src", "cli.js"), "utf8"), cliSource(), "the copy was built");
  const probes = probeLines(out);
  assert.deepEqual(probes.map((l) => l.split(":")[0]), ["PASS version", "PASS compare", "PASS language", "PASS dash", "PASS skill"]);
  rmTree(out);
});

test("prepare-code refuses a commit that does not exist (exit 2) and creates no copy", () => {
  const repo = makeRepo();
  repo.commit(repo.base);
  const out = tmp("out");
  for (const bad of ["0".repeat(40), "no-such-branch"]) {
    const r = prepare(repo, [bad, out]);
    assert.equal(r.status, 2, r.stderr);
    assert.match(r.stderr, /no such commit/);
  }
  assert.deepEqual(readdirSync(out), []);
  rmTree(out);
});

test("a copy whose CLI version differs from package.json at the commit fails with exit 4 and is removed", () => {
  const repo = makeRepo();
  const a = repo.commit({ ...repo.base, "src/cli.js": cliSource({ version: "9.9.9" }) });
  const out = tmp("out");
  const r = prepare(repo, [a, out]);
  assert.equal(r.status, 4, r.stderr);
  assert.match(r.stderr, /not the build under test/);
  assert.match(readFileSync(join(out, "code-probe.txt"), "utf8"), /^FAIL version: .*9\.9\.9.*1\.2\.3/m);
  assert.equal(existsSync(join(out, `code-${a.slice(0, 12)}`)), false, "the failed copy is removed");
  assert.equal(existsSync(join(out, "code-commit.txt")), false, "no record of a failed copy");
  rmTree(out);
});

for (const [label, opts, env, failing] of [
  ["--compare missing from --help", { compare: false }, {}, "compare"],
  ["French not detected with --language auto", { french: false }, {}, "language"],
  ["no dash finding for an English em dash", { dash: false }, {}, "dash"],
  ["SKILL.md changed by the build", {}, { FAKE_TSC_TAMPER: "1" }, "skill"],
]) {
  test(`a failing probe stops with exit 4 and names it: ${label}`, () => {
    const repo = makeRepo();
    const a = repo.commit({ ...repo.base, "src/cli.js": cliSource(opts) });
    const out = tmp("out");
    const r = prepare(repo, [a, out], env);
    assert.equal(r.status, 4, r.stderr);
    const fails = probeLines(out).filter((l) => l.startsWith("FAIL"));
    assert.equal(fails.length, 1, probeLines(out).join("\n"));
    assert.match(fails[0], new RegExp(`^FAIL ${failing}:`));
    assert.equal(existsSync(join(out, `code-${a.slice(0, 12)}`)), false);
    rmTree(out);
  });
}

test("the harness in the working tree must equal the commit's bench/head-to-head: any difference is exit 4, ignored and results files are fine", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  const tasksFile = join(repo.dir, "bench", "head-to-head", "tasks.json");
  const attempt = (label) => {
    const out = tmp("out");
    const r = prepare(repo, [a, out]);
    return { r, out, label };
  };
  // clean: fine, and files outside bench, ignored files and results/ do not count
  writeFileSync(join(repo.dir, "marker.txt"), "dirty outside bench\n");
  mkdirSync(join(repo.dir, "bench", "head-to-head", "competitors"), { recursive: true });
  writeFileSync(join(repo.dir, "bench", "head-to-head", "competitors", "clone.txt"), "ignored\n");
  mkdirSync(join(repo.dir, "bench", "head-to-head", "results", "round-1"), { recursive: true });
  writeFileSync(join(repo.dir, "bench", "head-to-head", "results", "round-1", "x.txt"), "published output\n");
  const clean = attempt("clean");
  assert.equal(clean.r.status, 0, clean.r.stderr);
  rmTree(clean.out);

  const cases = {
    "unstaged change": () => writeFileSync(tasksFile, '{"tasks":["edited"]}\n'),
    "staged change with the file restored": () => {
      writeFileSync(tasksFile, '{"tasks":["staged"]}\n');
      git(repo.dir, "add", "bench/head-to-head/tasks.json");
      writeFileSync(tasksFile, '{"tasks":[]}\n');
    },
    "untracked file": () => writeFileSync(join(repo.dir, "bench", "head-to-head", "extra-fixture.md"), "new\n"),
  };
  for (const [label, dirty] of Object.entries(cases)) {
    dirty();
    const { r, out } = attempt(label);
    assert.equal(r.status, 4, `${label}: ${r.stderr}`);
    assert.match(r.stderr, /differs from commit/, label);
    assert.deepEqual(readdirSync(out), [], `${label}: nothing was created`);
    rmTree(out);
    // put the tree back (by hand, with plain file operations and an index reset of one path)
    writeFileSync(tasksFile, '{"tasks":[]}\n');
    git(repo.dir, "rm", "-q", "--cached", "--ignore-unmatch", "bench/head-to-head/extra-fixture.md");
    rmSync(join(repo.dir, "bench", "head-to-head", "extra-fixture.md"), { force: true });
    git(repo.dir, "add", "bench/head-to-head/tasks.json");
  }
  const again = attempt("clean again");
  assert.equal(again.r.status, 0, again.r.stderr);
  rmTree(again.out);

  // a harness that equals HEAD but not the requested older commit
  const b = repo.commit({ "bench/head-to-head/tasks.json": '{"tasks":["newer"]}\n' });
  const out = tmp("out");
  const old = prepare(repo, [a, out]);
  assert.equal(old.status, 4, old.stderr);
  const head = prepare(repo, [b, out]);
  assert.equal(head.status, 0, head.stderr);
  // index holds the requested commit's file, the working file holds HEAD's: only the working-tree comparison sees it
  writeFileSync(tasksFile, '{"tasks":[]}\n');
  git(repo.dir, "add", "bench/head-to-head/tasks.json");
  writeFileSync(tasksFile, '{"tasks":["newer"]}\n');
  const split = prepare(repo, [a, out, "--new-code"]);
  assert.equal(split.status, 4, split.stderr);
  rmTree(out);
});

test("rerun.sh stops with exit 4 on a dirty harness before any competitor is touched", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  writeFileSync(join(repo.dir, "bench", "head-to-head", "tasks.json"), '{"tasks":["edited"]}\n');
  const work = tmp("rerun-dirty");
  const r = rerun(repo, work, ["--commit", a, "--out", join(work, "out"), "--iterations", "1"]);
  assert.equal(r.status, 4, r.stdout + r.stderr);
  assert.doesNotMatch(r.stdout, /setup-competitors/);
  assert.equal(existsSync(join(work, "competitors")), false);
});

test("a failed build stops with exit 2 and leaves no copy", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  const out = tmp("out");
  const r = prepare(repo, [a, out], { FAKE_TSC_FAIL: "1" });
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /build of the copy failed/);
  assert.equal(readdirSync(out).some((n) => n.startsWith("code-")), false);
  rmTree(out);
});

test("the copy is read-only: no file or directory has a write bit, and writes fail", { skip: process.getuid?.() === 0 }, () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  const out = tmp("out");
  assert.equal(prepare(repo, [a, out]).status, 0);
  const copy = join(out, `code-${a.slice(0, 12)}`);
  const walk = (d) => readdirSync(d).flatMap((n) => {
    const p = join(d, n);
    return lstatSync(p).isDirectory() ? [p, ...walk(p)] : [p];
  });
  const all = [copy, ...walk(copy)];
  assert.ok(all.length > 8);
  for (const p of all) assert.equal(statSync(p).mode & 0o222, 0, `${p} is read-only`);
  assert.throws(() => writeFileSync(join(copy, "dist", "src", "cli.js"), "changed"), /EACCES/);
  assert.throws(() => writeFileSync(join(copy, "new-file.txt"), "x"), /EACCES/);
  rmTree(out);
});

test("the same commit again reuses a verified copy and rebuilds a tampered one", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  const out = tmp("out");
  assert.equal(prepare(repo, [a, out]).status, 0);
  const cli = join(out, `code-${a.slice(0, 12)}`, "dist", "src", "cli.js");
  const inode = statSync(cli).ino;
  const again = prepare(repo, [a, out]);
  assert.equal(again.status, 0, again.stderr);
  assert.match(again.stderr, /reusing the verified copy/);
  assert.equal(statSync(cli).ino, inode, "the copy was kept");
  spawnSync("chmod", ["-R", "u+w", join(out, `code-${a.slice(0, 12)}`)]);
  writeFileSync(cli, `${cliSource()}// edited after the build\n`);   // the probes still pass; only the manifest differs
  chmodSync(cli, 0o444);
  const rebuilt = prepare(repo, [a, out]);
  assert.equal(rebuilt.status, 0, rebuilt.stderr);
  assert.doesNotMatch(rebuilt.stderr, /reusing/);
  assert.equal(readFileSync(cli, "utf8"), cliSource(), "rebuilt from the commit");
  rmTree(out);
});

test("an output directory started with another commit is refused (exit 5) unless --new-code, which keeps the old record", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  const b = repo.commit({ "marker.txt": "B\n" });
  const out = tmp("out");
  assert.equal(prepare(repo, [a, out]).status, 0);
  const refused = prepare(repo, [b, out]);
  assert.equal(refused.status, 5, refused.stderr);
  assert.match(refused.stderr, /refusing to resume/);
  assert.equal(readFileSync(join(out, "code-commit.txt"), "utf8").trim(), a, "the record is unchanged");
  assert.equal(existsSync(join(out, `code-${b.slice(0, 12)}`)), false, "no new copy");
  const allowed = prepare(repo, [b, out, "--new-code"]);
  assert.equal(allowed.status, 0, allowed.stderr);
  assert.equal(readFileSync(join(out, "code-commit.txt"), "utf8").trim(), b);
  assert.equal(readFileSync(join(out, `invalidated-${a.slice(0, 12)}`, "code-commit.txt"), "utf8").trim(), a);
  rmTree(out);
});

// rerun.sh: the commit under test is passed explicitly and recorded; resuming with another commit is refused.
const guardFiles = (work) => {
  const settings = join(work, "settings.json");
  const claudeJson = join(work, "claude.json");
  writeFileSync(settings, JSON.stringify({ hooks: { a: 1 } }));
  writeFileSync(claudeJson, JSON.stringify({ mcpServers: { s: 1 } }));
  return { H2H_GUARD_SETTINGS: settings, H2H_GUARD_CLAUDE_JSON: claudeJson, H2H_GUARD_LAUNCHER_SETTINGS: join(work, "launcher-settings.json") };
};
const rerun = (repo, work, args) =>
  spawnSync("bash", [join(BENCH, "rerun.sh"), ...args], { encoding: "utf8", env: { ...cleanEnv(), H2H_REPO: repo.dir, H2H_TSC: repo.tsc, H2H_COMPETITORS: join(work, "competitors"), ...guardFiles(work) } });

test("rerun.sh --commit resolves the commit, prepares the copy before anything runs, and passes --new-code on", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  repo.commit({ "marker.txt": "B\n" });
  const work = tmp("rerun");
  const out = join(work, "out");
  const r = rerun(repo, work, ["--dry-run", "--commit", a.slice(0, 10), "--out", out, "--iterations", "1", "--new-code"]);
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, new RegExp(`code commit: ${a}`));
  const lines = r.stdout.split("\n");
  const prep = lines.findIndex((l) => /\+ bash \S*prepare-code\.sh/.test(l));
  const setup = lines.findIndex((l) => /\+ bash \S*setup-competitors\.sh/.test(l));
  assert.ok(prep >= 0 && setup > prep, "prepare-code runs before the competitors are set up");
  assert.match(lines[prep], new RegExp(`prepare-code\\.sh ${a} ${out} --new-code`));
  assert.match(r.stdout, /run-all\.sh .*--new-code/);
  assert.equal(existsSync(out), false, "a dry run creates nothing");
  const bad = rerun(repo, work, ["--dry-run", "--commit", "no-such-rev", "--out", out]);
  assert.equal(bad.status, 2);
  assert.match(bad.stderr, /no such commit/);
});

test("rerun.sh refuses to resume into an output directory started with another commit, before any competitor is touched", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  const b = repo.commit({ "marker.txt": "B\n" });
  const work = tmp("rerun-refuse");
  const out = join(work, "out");
  mkdirSync(out);
  writeFileSync(join(out, "code-commit.txt"), `${a}\n`);
  const r = rerun(repo, work, ["--commit", b, "--out", out, "--iterations", "1"]);
  assert.equal(r.status, 5, r.stdout + r.stderr);
  assert.match(r.stderr, /refusing to resume/);
  assert.doesNotMatch(r.stdout, /setup-competitors/);
  assert.equal(existsSync(join(work, "competitors")), false);
  assert.equal(readFileSync(join(out, "code-commit.txt"), "utf8").trim(), a);
});

// run-all.sh / run-one.sh with a fake claude and a fake code copy.
function fakeCode(parent, label) {
  const dir = join(parent, label);
  mkdirSync(join(dir, "dist", "src"), { recursive: true });
  mkdirSync(join(dir, ".claude-plugin"));
  mkdirSync(join(dir, "skills", "ai-slop-linter"), { recursive: true });
  mkdirSync(join(dir, "bench", "head-to-head", "run"), { recursive: true });
  mkdirSync(join(dir, "test"));
  cpSync(join(RUN, "bin-ours"), join(dir, "bench", "head-to-head", "run", "bin-ours"), { recursive: true });
  writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "ai-slop-linter", version: "0.0.0", files: ["dist", "skills", ".claude-plugin"] }));
  writeFileSync(join(dir, ".claude-plugin", "plugin.json"), "{}\n");
  writeFileSync(join(dir, "skills", "ai-slop-linter", "SKILL.md"), `skill ${label}\n`);
  writeFileSync(join(dir, "bench", "head-to-head", "tasks.json"), "answer key\n");
  writeFileSync(join(dir, "test", "t.txt"), "answer key\n");
  writeFileSync(join(dir, "dist", "src", "cli.js"), `console.log("FAKE-CLI ${label} " + process.argv.slice(2).join(" "));\n`);
  return dir;
}

function round(label = "round") {
  const work = tmp(label);
  const codeParent = tmp(`${label}-code`);
  const counter = join(work, "counter.txt");
  const bin = join(work, "fakebin");
  mkdirSync(bin);
  // The fake claude records where it ran, and what the PATH-resolved shims print.
  writeFileSync(join(bin, "claude"), [
    "#!/usr/bin/env bash",
    `echo "$PWD" >> "${counter}"`,
    'echo "CODE_DIR=${H2H_CODE_DIR:-unset}"',
    'echo "SHIM_BIN=$(ai-slop-linter probe 2>&1)"',
    'echo "SHIM_NPX=$(npx ai-slop-linter probe 2>&1)"',
    'echo "SHIM_SLOP=$(slop probe 2>&1)"',
    'printf \'{"type":"result","is_error":false}\\n\'',
    "",
  ].join("\n"));
  chmodSync(join(bin, "claude"), 0o755);
  const plugin = join(work, "plugin");
  mkdirSync(plugin);
  writeFileSync(join(plugin, "p.txt"), "a competitor plugin\n");
  const env = (codeDir, extra = {}) => ({
    ...cleanEnv(),
    PATH: `${bin}${delimiter}${process.env.PATH}`,
    H2H_OUT: join(work, "out"),
    H2H_CODE_DIR: codeDir,
    H2H_DIR_BLADER: plugin,
    H2H_DIR_UNSLOP: plugin,
    H2H_DIR_EVERWRITE: plugin,
    H2H_DIR_BASE: plugin,
    ...guardFiles(work),
    ...extra,
  });
  const runAllWith = (codeDir, extraEnv, ...args) =>
    spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "ours,base", ...args], { encoding: "utf8", env: env(codeDir, extraEnv), timeout: 280000 });
  const runAll = (codeDir, ...args) => runAllWith(codeDir, {}, ...args);
  const count = () => (existsSync(counter) ? readFileSync(counter, "utf8").trim().split("\n").filter(Boolean) : []);
  const writeRecord = (sha, tree = "t".repeat(40)) => {
    mkdirSync(join(work, "out"), { recursive: true });
    writeFileSync(join(work, "out", "code-commit.txt"), `${sha}\n`);
    writeFileSync(join(work, "out", "code-tree.txt"), `${tree}\n`);
    writeFileSync(join(work, "out", "code-bench-tree.txt"), `${"e".repeat(40)}\n`);
  };
  return { work, out: join(work, "out"), codeParent, env, runAll, runAllWith, count, writeRecord, plugin };
}
const SHA_A = "a".repeat(40);
const SHA_B = "b".repeat(40);

test("shims resolve the CLI from the code copy: ai-slop-linter, npx ai-slop-linter and slop all print the copy's label", () => {
  const t = round("shims");
  const codeA = fakeCode(t.codeParent, "copyA");
  const codeB = fakeCode(t.codeParent, "copyB");
  t.writeRecord(SHA_A);
  assert.equal(t.runAll(codeA).status, 0);
  const text = readFileSync(join(t.out, "h1-ours-1.jsonl"), "utf8");
  assert.match(text, /^SHIM_BIN=FAKE-CLI copyA probe$/m);
  assert.match(text, /^SHIM_NPX=FAKE-CLI copyA probe$/m);
  assert.match(text, /^SHIM_SLOP=FAKE-CLI copyA probe$/m);
  assert.match(text, new RegExp(`^CODE_DIR=${codeA}$`, "m"));
  assert.doesNotMatch(text, /copyB/);
  // a second round on the other copy
  const u = round("shims2");
  u.writeRecord(SHA_B);
  assert.equal(u.runAll(codeB).status, 0);
  const second = readFileSync(join(u.out, "h1-ours-1.jsonl"), "utf8");
  assert.match(second, /^SHIM_NPX=FAKE-CLI copyB probe$/m);
  assert.doesNotMatch(second, /copyA/);
  // the other arm sees neither the copy nor the shims
  const base = readFileSync(join(t.out, "h1-base-1.jsonl"), "utf8");
  assert.match(base, /^CODE_DIR=unset$/m);
  assert.doesNotMatch(base, /FAKE-CLI/);
});

test("the shims fail loudly without H2H_CODE_DIR instead of falling back to the working tree", () => {
  const env = { ...cleanEnv() };
  for (const shim of ["ai-slop-linter", "slop"]) {
    const r = spawnSync(join(RUN, "bin-ours", shim), ["--version"], { encoding: "utf8", env });
    assert.equal(r.status, 2, `${shim}: ${r.stdout}${r.stderr}`);
    assert.match(r.stderr, /H2H_CODE_DIR is not set/);
    assert.equal(r.stdout, "");
  }
  const r = spawnSync(join(RUN, "bin-ours", "npx"), ["ai-slop-linter", "--version"], { encoding: "utf8", env });
  assert.equal(r.status, 2, r.stderr);
  assert.match(r.stderr, /H2H_CODE_DIR is not set/);
});

test("the npm shim installs the tarball packed from the code copy, found beside the copy when only H2H_CODE_DIR is set", () => {
  const work = tmp("npm-shim");
  const out = join(work, "out");
  mkdirSync(join(out, "code-x"), { recursive: true });
  mkdirSync(join(out, "ours-tarball"));
  writeFileSync(join(out, "ours-tarball", "ai-slop-linter-1.0.0.tgz"), "x");
  const realDir = join(work, "real");
  mkdirSync(realDir);
  writeFileSync(join(realDir, "npm"), '#!/usr/bin/env bash\necho "REAL_NPM|$*"\n');
  chmodSync(join(realDir, "npm"), 0o755);
  const env = { ...cleanEnv(), H2H_CODE_DIR: join(out, "code-x"), PATH: `${join(RUN, "bin-ours")}${delimiter}${realDir}${delimiter}${process.env.PATH}` };
  const r = spawnSync(join(RUN, "bin-ours", "npm"), ["install", "ai-slop-linter"], { encoding: "utf8", env });
  assert.equal(r.stdout.trim(), `REAL_NPM|install ${join(out, "ours-tarball", "ai-slop-linter-1.0.0.tgz")}`);
});

test("run-all packs the tarball from the code copy, and the ours arm never starts without a copy", () => {
  const t = round("pack");
  const code = fakeCode(t.codeParent, "copyP");
  t.writeRecord(SHA_A);
  assert.equal(t.runAll(code).status, 0);
  const tarDir = join(t.out, "ours-tarball");
  const tgz = join(tarDir, readdirSync(tarDir).find((f) => f.endsWith(".tgz")));
  const x = spawnSync("tar", ["-xzOf", tgz, "package/dist/src/cli.js"], { encoding: "utf8" });
  assert.match(x.stdout, /FAKE-CLI copyP/, "the tarball holds the copy's build");
  assert.equal(readFileSync(join(tarDir, "SOURCE_COMMIT"), "utf8").trim(), SHA_A);
  // no copy, or the working repository itself
  for (const bad of [undefined, "", "/nonexistent/h2h-code", ROOT, join(ROOT, "dist")]) {
    const u = round("nocopy");
    const r = u.runAll(bad);
    assert.equal(r.status, 2, r.stdout + r.stderr);
    assert.match(r.stderr, /H2H_CODE_DIR/);
    assert.deepEqual(existsSync(u.out) ? readdirSync(u.out).filter((f) => f.endsWith(".jsonl")) : [], []);
    const one = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "ours", "1"], { encoding: "utf8", env: u.env(bad) });
    assert.equal(one.status, 2, one.stderr);
    assert.match(one.stderr, /H2H_CODE_DIR/);
  }
  assert.equal(t.count().length, 2, "no refused attempt started a run");
});

test("run-all stops with exit 4 when the copy no longer matches the recorded manifest", () => {
  const t = round("manifest");
  const code = fakeCode(t.codeParent, "copyM");
  t.writeRecord(SHA_A);
  const m = spawnSync(process.execPath, [join(RUN, "code-manifest.mjs"), code], { encoding: "utf8" });
  writeFileSync(join(t.out, "code-manifest.txt"), m.stdout);
  assert.equal(t.runAll(code).status, 0, "an untouched copy passes");
  writeFileSync(join(code, "dist", "src", "cli.js"), 'console.log("changed after the manifest");\n');
  const r = t.runAll(code, "--force");
  assert.equal(r.status, 4, r.stdout + r.stderr);
  assert.match(r.stderr, /no longer matches/);
  assert.equal(t.count().length, 2, "no run started");
});

// Independent implementation of the manifest hash, to check what run-one records.
function manifestHash(dir) {
  const list = (d, rel = "") => readdirSync(join(d, rel)).sort().flatMap((n) => {
    const r = rel ? `${rel}/${n}` : n;
    const st = lstatSync(join(d, r));
    return st.isDirectory() ? list(d, r) : st.isFile() ? [r] : [];
  });
  return sha256(list(dir).map((r) => `${sha256(readFileSync(join(dir, r)))}  ${r}\n`).join(""));
}
const h1 = JSON.parse(readFileSync(join(BENCH, "tasks.json"), "utf8")).tasks.find((x) => x.id === "h1");

test("every finished cell records commit, tree, arm, task, fixture, prompt and plugin hashes, model and date", () => {
  const t = round("meta");
  const code = fakeCode(t.codeParent, "copyH");
  t.writeRecord(SHA_A, "c".repeat(40));
  assert.equal(t.runAll(code).status, 0);
  const ours = JSON.parse(readFileSync(join(t.out, "h1-ours-1.meta.json"), "utf8"));
  const base = JSON.parse(readFileSync(join(t.out, "h1-base-1.meta.json"), "utf8"));
  assert.equal(ours.commit, SHA_A);
  assert.equal(ours.tree, "c".repeat(40));
  assert.equal(ours.benchTree, "e".repeat(40));
  assert.equal(base.benchTree, "e".repeat(40));
  assert.equal(ours.arm, "ours");
  assert.equal(base.arm, "base");
  assert.equal(ours.task, "h1");
  assert.equal(ours.iteration, 1);
  assert.equal(ours.fixtureSha256, manifestHash(join(FIXTURES, h1.fixture)));
  assert.equal(ours.promptSha256, sha256(h1.prompt));
  assert.equal(ours.pluginManifestSha256, manifestHash(join(t.out, "plugin-ours")));
  assert.equal(base.pluginManifestSha256, manifestHash(join(t.out, "plugin-base")));
  assert.notEqual(ours.pluginManifestSha256, base.pluginManifestSha256);
  assert.equal(ours.model, "claude-sonnet-5-5");
  assert.match(ours.date, /^\d{4}-\d{2}-\d{2}$/);
  // the plugin export of ours comes from the copy
  assert.equal(readFileSync(join(t.out, "plugin-ours", "skills", "ai-slop-linter", "SKILL.md"), "utf8"), "skill copyH\n");
});

test("an invoked arm's prompt hash covers the invocation prefix", () => {
  const t = round("inv");
  const code = fakeCode(t.codeParent, "copyI");
  t.writeRecord(SHA_A);
  const r = spawnSync("bash", [join(RUN, "run-all.sh"), "--tasks", "h1", "--iterations", "1", "--arms", "blader-inv"], { encoding: "utf8", env: t.env(code) });
  assert.equal(r.status, 0, r.stderr);
  const meta = JSON.parse(readFileSync(join(t.out, "h1-blader-inv-1.meta.json"), "utf8"));
  const inv = JSON.parse(readFileSync(join(RUN, "invocations.json"), "utf8"))["blader-inv"];
  assert.equal(meta.promptSha256, sha256(`${inv} ${h1.prompt}`));
  assert.notEqual(meta.promptSha256, sha256(h1.prompt));
});

test("resume: matching cells are skipped; other code is refused; --new-code invalidates ours and keeps matching competitor and baseline cells", () => {
  const t = round("resume");
  const codeA = fakeCode(t.codeParent, "copyA");
  const codeB = fakeCode(t.codeParent, "copyB");
  const lastCell = () => t.count().at(-1).split("/").at(-1);
  t.writeRecord(SHA_A);
  assert.equal(t.runAll(codeA).status, 0);
  assert.equal(t.count().length, 2);

  const same = t.runAll(codeA);
  assert.equal(same.status, 0, same.stderr);
  assert.equal(t.count().length, 2, "nothing ran again");
  assert.match(same.stdout, /skip \(valid transcript exists\): h1-ours-1/);
  assert.match(same.stdout, /skip \(valid transcript exists\): h1-base-1/);

  // other code, no --new-code
  t.writeRecord(SHA_B);
  const refused = t.runAll(codeB);
  assert.equal(refused.status, 5, refused.stdout + refused.stderr);
  assert.match(refused.stderr, /h1-ours-1/);
  assert.match(refused.stderr, /--new-code/);
  assert.equal(t.count().length, 2);
  assert.ok(existsSync(join(t.out, "h1-ours-1.jsonl")), "nothing was moved");
  assert.equal(JSON.parse(readFileSync(join(t.out, "h1-ours-1.meta.json"), "utf8")).commit, SHA_A);

  // --new-code
  const baseInode = statSync(join(t.out, "h1-base-1.jsonl")).ino;
  const baseMeta = readFileSync(join(t.out, "h1-base-1.meta.json"), "utf8");
  const fresh = t.runAll(codeB, "--new-code");
  assert.equal(fresh.status, 0, fresh.stdout + fresh.stderr);
  const inv = join(t.out, `invalidated-${SHA_A.slice(0, 12)}`);
  assert.deepEqual(readdirSync(inv).filter((n) => n.startsWith("h1-ours-1")).sort(), ["h1-ours-1", "h1-ours-1.jsonl", "h1-ours-1.meta.json"]);
  assert.equal(JSON.parse(readFileSync(join(inv, "h1-ours-1.meta.json"), "utf8")).commit, SHA_A);
  assert.equal(JSON.parse(readFileSync(join(t.out, "h1-ours-1.meta.json"), "utf8")).commit, SHA_B, "ours ran again on the new code");
  assert.match(readFileSync(join(t.out, "h1-ours-1.jsonl"), "utf8"), /FAKE-CLI copyB/);
  assert.equal(t.count().length, 3);
  assert.equal(lastCell(), "h1-ours-1");
  assert.equal(statSync(join(t.out, "h1-base-1.jsonl")).ino, baseInode, "the baseline transcript is kept");
  assert.equal(readFileSync(join(t.out, "h1-base-1.meta.json"), "utf8"), baseMeta);

  // a competitor/baseline cell whose plugin export changed is run again, ours is not
  writeFileSync(join(t.plugin, "p.txt"), "the plugin changed\n");
  const pluginChanged = t.runAll(codeB);
  assert.equal(pluginChanged.status, 0, pluginChanged.stderr);
  assert.match(pluginChanged.stdout, /rerun \(stale: pluginManifestSha256\): h1-base-1/);
  assert.equal(t.count().length, 4);
  assert.equal(lastCell(), "h1-base-1");

  // recorded prompt or fixture hash differs
  for (const [field, expectCount] of [["promptSha256", 5], ["fixtureSha256", 6]]) {
    const p = join(t.out, "h1-base-1.meta.json");
    const meta = JSON.parse(readFileSync(p, "utf8"));
    meta[field] = "0".repeat(64);
    writeFileSync(p, JSON.stringify(meta));
    const r = t.runAll(codeB);
    assert.equal(r.status, 0, r.stderr);
    assert.match(r.stdout, new RegExp(`rerun \\(stale: ${field}\\): h1-base-1`));
    assert.equal(t.count().length, expectCount, field);
    assert.equal(lastCell(), "h1-base-1");
  }

  // a different model id is a different measurement
  const otherModel = t.runAllWith(codeB, { H2H_MODEL: "claude-other" });
  assert.equal(otherModel.status, 0, otherModel.stderr);
  assert.match(otherModel.stdout, /rerun \(stale: model\): h1-base-1/);
  assert.match(otherModel.stdout, /rerun \(stale: model\): h1-ours-1/);
  assert.equal(t.count().length, 8);
  assert.equal(JSON.parse(readFileSync(join(t.out, "h1-base-1.meta.json"), "utf8")).model, "claude-other");
  const backToDefault = t.runAll(codeB);
  assert.equal(backToDefault.status, 0, backToDefault.stderr);
  assert.equal(t.count().length, 10);

  // no meta: kept without --new-code, unprovable (run again) with it; ours of the same code stays
  rmSync(join(t.out, "h1-base-1.meta.json"));
  const kept = t.runAll(codeB);
  assert.equal(kept.status, 0, kept.stderr);
  assert.equal(t.count().length, 10, "an old cell without a record is kept");
  const unproven = t.runAll(codeB, "--new-code");
  assert.equal(unproven.status, 0, unproven.stderr);
  assert.match(unproven.stdout, /rerun \(no meta\.json, so reuse cannot be proved\): h1-base-1/);
  assert.equal(t.count().length, 11);
  assert.equal(lastCell(), "h1-base-1");
  assert.ok(existsSync(join(t.out, "h1-base-1.meta.json")));
});

test("an ours cell without a record cannot be tied to the code and is refused like one from another commit", () => {
  const t = round("nometa-ours");
  const code = fakeCode(t.codeParent, "copyN");
  t.writeRecord(SHA_A);
  assert.equal(t.runAll(code).status, 0);
  rmSync(join(t.out, "h1-ours-1.meta.json"));
  const r = t.runAll(code);
  assert.equal(r.status, 5, r.stdout + r.stderr);
  assert.match(r.stderr, /h1-ours-1:none/);
  const fresh = t.runAll(code, "--new-code");
  assert.equal(fresh.status, 0, fresh.stderr);
  assert.ok(existsSync(join(t.out, "invalidated-unknown", "h1-ours-1.jsonl")));
  assert.ok(existsSync(join(t.out, "h1-ours-1.meta.json")));
});

// The sandbox profile covers the working repository and the code copy.
// With `profileText` the macOS sandbox-exec profile is rendered on any platform (a stand-in `sandbox-exec` is put on
// PATH and the backend is forced): the tests that read the profile text do not need the real tool. The tests that
// run a command inside the real sandbox render with the platform's own backend.
function render(codeDir, profileText = false) {
  const work = tmp("sb");
  const out = join(work, "out");
  mkdirSync(join(out, "run-a"), { recursive: true });
  const env = { ...cleanEnv(), HOME: join(work, "home") };
  if (profileText) {
    const bin = join(work, "sbbin");
    mkdirSync(bin);
    writeFileSync(join(bin, "sandbox-exec"), "#!/bin/sh\nexit 0\n");
    chmodSync(join(bin, "sandbox-exec"), 0o755);
    env.PATH = `${bin}${delimiter}${env.PATH ?? process.env.PATH}`;
    env.H2H_SANDBOX_BACKEND = "sandbox-exec";
  }
  if (codeDir) env.H2H_CODE_DIR = codeDir;
  mkdirSync(env.HOME);
  const r = spawnSync("bash", ["-c", `. "${RUN}/sandbox.sh"; render_sandbox "${out}" probe "${out}/run-a"`], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stderr);
  return join(out, "sandbox-probe.sb");
}

test("the sandbox profile denies writes to, and reads of the answer key in, the code copy as well as the repository", () => {
  const parent = tmp("sb-code");
  const code = fakeCode(parent, "copyS");
  const text = readFileSync(render(code, true), "utf8");
  const repo = realpathSync(ROOT);
  for (const root of [repo, code]) {
    assert.ok(text.includes(`(subpath "${root}")`), `write deny covers ${root}`);
    for (const sub of ["bench", ".superpowers", "test", ".git"]) assert.ok(text.includes(`(subpath "${root}/${sub}")`), `read deny ${root}/${sub}`);
    assert.ok(text.includes(`(allow file-read* (subpath "${root}/bench/head-to-head/run/bin-ours"))`), `shims of ${root} stay readable`);
  }
  assert.doesNotMatch(text, /@CODE@/);
  const without = readFileSync(render("", true), "utf8");
  assert.doesNotMatch(without, /@CODE@/, "without a copy the placeholder falls back to the repository");
});

test("the real sandbox (sandbox-exec or bwrap) keeps the copy's dist and shims readable, hides its bench and test, and makes it unwritable", { skip: !HAS_SANDBOX }, () => {
  const parent = tmp("sb-real");
  const code = fakeCode(parent, "copyR");
  const profile = render(code);
  const sb = (script) => (BACKEND === "bwrap"
    ? spawnSync("bwrap", [...readFileSync(profile.replace(/\.sb$/, ".bwrap"), "utf8").split("\0").slice(0, -1), "sh", "-c", script], { encoding: "utf8", timeout: 30000 })
    : spawnSync("sandbox-exec", ["-f", profile, "sh", "-c", script], { encoding: "utf8", timeout: 30000 }));
  assert.equal(sb(`cat "${code}/dist/src/cli.js" > /dev/null`).status, 0, "dist readable");
  assert.equal(sb(`cat "${code}/package.json" > /dev/null`).status, 0, "package.json readable");
  assert.equal(sb(`cat "${code}/bench/head-to-head/run/bin-ours/npx" > /dev/null`).status, 0, "shims readable");
  assert.notEqual(sb(`cat "${code}/bench/head-to-head/tasks.json" > /dev/null`).status, 0, "answer key hidden");
  assert.notEqual(sb(`cat "${code}/test/t.txt" > /dev/null`).status, 0, "tests hidden");
  assert.notEqual(sb(`touch "${code}/dist/new.txt"`).status, 0, "copy not writable");
  const shim = sb(`H2H_CODE_DIR="${code}" PATH="${code}/bench/head-to-head/run/bin-ours:$PATH" ai-slop-linter hello`);
  assert.equal(shim.stdout.trim(), "FAKE-CLI copyR hello", shim.stderr);
});

// Output meta: summarize and publish carry the code under test.
function scoredOut(name) {
  const out = tmp(name);
  writeFileSync(join(out, "scores.json"), "{}\n");
  writeFileSync(join(out, "meta.json"), JSON.stringify({ model: "claude-sonnet-5-5", date: "2026-10-22" }));
  return out;
}

test("summarize prints the commit, tree, probe results and model id in its header, and says when none is recorded", () => {
  const withCode = scoredOut("sum");
  writeFileSync(join(withCode, "code-commit.txt"), `${SHA_A}\n`);
  writeFileSync(join(withCode, "code-tree.txt"), `${"d".repeat(40)}\n`);
  writeFileSync(join(withCode, "code-probe.txt"), "PASS version: ok\nPASS compare: ok\nFAIL dash: no finding\n");
  const env = { ...cleanEnv(), H2H_LABELS: join(BENCH, "labels.json") };
  const r = spawnSync(process.execPath, [join(RUN, "summarize.mjs"), withCode], { encoding: "utf8", env });
  assert.match(r.stdout, /model claude-sonnet-5-5/);
  assert.match(r.stdout, new RegExp(`Code under test: commit ${SHA_A}, tree ${"d".repeat(40)}, git archive copy; probes 2 of 3 passed\\.`));
  assert.match(r.stdout, /^  FAIL dash: no finding$/m);
  const none = spawnSync(process.execPath, [join(RUN, "summarize.mjs"), scoredOut("sum2")], { encoding: "utf8", env });
  assert.match(none.stdout, /Code under test: not recorded/);
});

test("publish.sh copies code-commit, code-tree, code-manifest, code-probe and the per-cell records", () => {
  const out = scoredOut("pub");
  for (const f of ["code-commit.txt", "code-tree.txt", "code-bench-tree.txt", "code-manifest.txt", "code-probe.txt"]) writeFileSync(join(out, f), `${f} content\n`);
  writeFileSync(join(out, "h1-ours-1.meta.json"), '{"commit":"x"}\n');
  writeFileSync(join(out, "code-secret.txt"), "not published\n");
  const dest = tmp("pub-dest");
  const env = { ...cleanEnv(), H2H_RESULTS: dest, H2H_LABELS: join(BENCH, "labels.json") };
  const r = spawnSync("bash", [join(RUN, "publish.sh"), out, "round-7"], { encoding: "utf8", env });
  assert.equal(r.status, 0, r.stdout + r.stderr);
  for (const f of ["code-commit.txt", "code-tree.txt", "code-bench-tree.txt", "code-manifest.txt", "code-probe.txt"]) assert.equal(readFileSync(join(dest, "round-7", f), "utf8"), `${f} content\n`);
  assert.equal(readFileSync(join(dest, "round-7", "cell-meta", "h1-ours-1.meta.json"), "utf8"), '{"commit":"x"}\n');
  assert.equal(existsSync(join(dest, "round-7", "code-secret.txt")), false);
});

test("verify-code.sh exits 0 for the build under test and 4 for any other, and reads the commit with git only", () => {
  const repo = makeRepo();
  const a = repo.commit(repo.base);
  const out = tmp("out");
  assert.equal(prepare(repo, [a, out]).status, 0);
  const copy = join(out, `code-${a.slice(0, 12)}`);
  const verify = (probe) => spawnSync("bash", [join(RUN, "verify-code.sh"), a, copy, probe], { encoding: "utf8", env: { ...cleanEnv(), H2H_REPO: repo.dir } });
  const good = verify(join(out, "again.txt"));
  assert.equal(good.status, 0, good.stderr);
  assert.equal(readFileSync(join(out, "again.txt"), "utf8").split("\n").filter((l) => l.startsWith("PASS")).length, 5);
  const b = repo.commit({ "package.json": JSON.stringify({ name: "ai-slop-linter", version: "2.0.0" }) });
  const bad = spawnSync("bash", [join(RUN, "verify-code.sh"), b, copy, join(out, "bad.txt")], { encoding: "utf8", env: { ...cleanEnv(), H2H_REPO: repo.dir } });
  assert.equal(bad.status, 4, bad.stderr);
  assert.match(readFileSync(join(out, "bad.txt"), "utf8"), /^FAIL version:/m);
  rmTree(out);
});

test("the working tree's own shims still run the copy named by H2H_CODE_DIR, never the repository's build", () => {
  const parent = tmp("tree-shims");
  const code = fakeCode(parent, "copyT");
  const env = { ...cleanEnv(), H2H_CODE_DIR: code };
  for (const [shim, args] of [["ai-slop-linter", ["hello"]], ["slop", ["hello"]], ["npx", ["ai-slop-linter", "hello"]]]) {
    const r = spawnSync(join(RUN, "bin-ours", shim), args, { encoding: "utf8", env });
    assert.equal(r.stdout.trim(), "FAKE-CLI copyT hello", `${shim}: ${r.stdout}${r.stderr}`);
  }
});

test("a failed run leaves no meta.json, and a stale one from an earlier run is removed", () => {
  const t = round("failedmeta");
  const code = fakeCode(t.codeParent, "copyF");
  t.writeRecord(SHA_A);
  writeFileSync(join(t.out, "h1-base-1.meta.json"), '{"stale":true}\n');
  const failing = join(t.work, "failbin");
  mkdirSync(failing);
  writeFileSync(join(failing, "claude"), "#!/usr/bin/env bash\nexit 1\n");
  chmodSync(join(failing, "claude"), 0o755);
  const env = t.env(code);
  env.PATH = `${failing}${delimiter}${env.PATH}`;
  const r = spawnSync("bash", [join(RUN, "run-one.sh"), "h1", "base", "1"], { encoding: "utf8", env });
  assert.equal(r.status, 1, r.stderr);
  assert.equal(existsSync(join(t.out, "h1-base-1.meta.json")), false);
  assert.equal(existsSync(join(t.out, "h1-base-1.jsonl")), false);
});

test("score.mjs finds the code copy from code-commit.txt and puts the copy's shims on the check PATH", () => {
  const t = round("score");
  const code = fakeCode(t.out, `code-${SHA_A.slice(0, 12)}`);
  t.writeRecord(SHA_A);
  const dir = join(t.out, "h15-ours-1");
  cpSync(join(BENCH, "golden", "h15"), dir, { recursive: true });
  const log = join(t.work, "pathlog.txt");
  const pkgPath = join(dir, "package.json");
  const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
  pkg.scripts["lint:prose"] = `node -e "require('fs').writeFileSync(process.env.PATHLOG, process.env.PATH + '\\n' + (process.env.H2H_CODE_DIR || ''))"`;
  writeFileSync(pkgPath, JSON.stringify(pkg));
  writeFileSync(`${dir}.jsonl`, '{"type":"result","is_error":false}\n');
  const env = { ...cleanEnv(), PATHLOG: log };
  const r = spawnSync(process.execPath, [join(RUN, "score.mjs"), t.out], { encoding: "utf8", env, timeout: 280000 });
  assert.equal(r.status, 0, r.stderr);
  const [path, seen] = readFileSync(log, "utf8").split("\n");
  assert.equal(seen, code);
  // npm puts node_modules/.bin directories in front; after them comes the copy's shim directory, then the normal PATH
  assert.ok(path.endsWith(`${join(code, "bench", "head-to-head", "run", "bin-ours")}${delimiter}${process.env.PATH}`), path);
});

test("no script in the benchmark run directory runs git checkout, restore, stash or reset", () => {
  const files = [join(BENCH, "rerun.sh"), ...readdirSync(RUN).filter((n) => /\.(sh|mjs)$/.test(n)).map((n) => join(RUN, n)), ...readdirSync(join(RUN, "bin-ours")).map((n) => join(RUN, "bin-ours", n))];
  const banned = /\bgit\b[^\n|;&]*\b(checkout|restore|stash|reset|clean)\b/;
  const code = files.filter((f) => readFileSync(f, "utf8").split("\n").some((l) => !l.trim().startsWith("#") && banned.test(l)));
  assert.deepEqual(code, []);
  assert.ok(files.length > 15);
});

test("real: the HEAD archive builds with the repository's own compiler and passes the real probes", { skip: !existsSync(join(ROOT, "node_modules", "typescript", "bin", "tsc")), timeout: 280000 }, () => {
  const out = tmp("real");
  const head = git(ROOT, "rev-parse", "HEAD");
  const r = spawnSync("bash", [join(RUN, "prepare-code.sh"), "HEAD", out], { encoding: "utf8", env: cleanEnv(), timeout: 270000 });
  assert.equal(r.status, 0, r.stderr);
  const copy = join(out, `code-${head.slice(0, 12)}`);
  assert.equal(readFileSync(join(out, "code-commit.txt"), "utf8").trim(), head);
  assert.equal(readFileSync(join(out, "code-tree.txt"), "utf8").trim(), git(ROOT, "rev-parse", "HEAD^{tree}"));
  const probes = probeLines(out);
  assert.equal(probes.length, 5);
  for (const l of probes) assert.match(l, /^PASS /);
  const version = JSON.parse(git(ROOT, "show", "HEAD:package.json")).version;
  const cli = spawnSync(process.execPath, [join(copy, "dist", "src", "cli.js"), "--version"], { encoding: "utf8" });
  assert.equal(cli.stdout.trim(), version);
  assert.equal(existsSync(join(copy, "node_modules")), false, "the repository's modules are not linked into the finished copy");
  rmTree(out);
});
