import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { AGENT_ENV_VARS, HOOK_ENV_VARS, STAR_HINT_LINE, maybeStarHint, realFs, type StarHintArgs } from "../src/star-hint.js";
import { parse, starHintArgs } from "../src/cli.js";
import { lintText } from "../src/index.js";
import { applyBaseline, createBaseline } from "../src/baseline.js";

const cli = join(process.cwd(), "dist", "src", "cli.js");
const clean: StarHintArgs = { format: "text", quiet: false, fix: false, commit: false, pr: false, explain: false, history: false, stdin: false, exitCode: 0, findings: 0 };
const marker = (dir: string) => join(dir, "ai-slop-linter", "star-hint-shown");

/** A throwaway config directory, so no test ever reads or writes the real home. */
function withDir<T>(fn: (dir: string) => T): T {
  const dir = mkdtempSync(join(tmpdir(), "slop-star-"));
  try {
    return fn(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** One call with an explicit environment (never process.env), so the test is hermetic. */
function attempt(opts: { env?: Record<string, string>; args?: Partial<StarHintArgs>; tty?: boolean } = {}) {
  return withDir((dir) => {
    const chunks: string[] = [];
    const stdout = { isTTY: opts.tty ?? true, write: (s: string) => { chunks.push(s); return true; } };
    const printed = maybeStarHint({ AI_SLOP_LINTER_CONFIG_DIR: dir, ...opts.env }, stdout, { ...clean, ...opts.args }, realFs);
    return { printed, chunks };
  });
}

function assertSuppressed(result: { printed: boolean; chunks: string[] }) {
  assert.equal(result.printed, false);
  assert.deepEqual(result.chunks, []);
}

test("the hint prints in a clean interactive run, once per line", () => {
  const { printed, chunks } = attempt();
  assert.equal(printed, true);
  assert.deepEqual(chunks, [`${STAR_HINT_LINE}\n`]);
});

test("the hint line carries no em dash or en dash", () => {
  assert.doesNotMatch(STAR_HINT_LINE, /[\u2013\u2014]/);
});

test("suppressed when stdout is not a TTY", () => {
  assertSuppressed(attempt({ tty: false }));
});

test("suppressed when CI is 1", () => {
  assertSuppressed(attempt({ env: { CI: "1" } }));
});

test("suppressed when CI is true", () => {
  assertSuppressed(attempt({ env: { CI: "true" } }));
});

test("CI set to 0 or false does not suppress the hint", () => {
  assert.equal(attempt({ env: { CI: "0" } }).printed, true);
  assert.equal(attempt({ env: { CI: "false" } }).printed, true);
});

for (const name of AGENT_ENV_VARS) {
  test(`suppressed when the agent variable ${name} is set`, () => {
    assertSuppressed(attempt({ env: { [name]: "1" } }));
  });
}

test("the agent list is the documented ten variables", () => {
  assert.deepEqual([...AGENT_ENV_VARS], [
    "CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT", "CODEX_SANDBOX", "CODEX_HOME", "CURSOR_AGENT",
    "GEMINI_CLI", "AGENT", "AI_AGENT", "OPENCODE", "AIDER_MODEL",
  ]);
});

test("suppressed by --quiet", () => {
  assertSuppressed(attempt({ args: { quiet: true } }));
});

test("suppressed when AI_SLOP_LINTER_NO_STAR_HINT is 1", () => {
  assertSuppressed(attempt({ env: { AI_SLOP_LINTER_NO_STAR_HINT: "1" } }));
});

test("AI_SLOP_LINTER_NO_STAR_HINT set to anything but 1 does not suppress", () => {
  assert.equal(attempt({ env: { AI_SLOP_LINTER_NO_STAR_HINT: "0" } }).printed, true);
});

test("suppressed when the marker file already exists", () => {
  withDir((dir) => {
    mkdirSync(join(dir, "ai-slop-linter"), { recursive: true });
    writeFileSync(marker(dir), "");
    const chunks: string[] = [];
    const printed = maybeStarHint({ AI_SLOP_LINTER_CONFIG_DIR: dir }, { isTTY: true, write: (s: string) => { chunks.push(s); return true; } }, clean, realFs);
    assert.equal(printed, false);
    assert.deepEqual(chunks, []);
  });
});

test("suppressed when the exit code is non-zero", () => {
  assertSuppressed(attempt({ args: { exitCode: 1 } }));
});

test("suppressed when any finding was reported, even with exit code 0 (--warn)", () => {
  assertSuppressed(attempt({ args: { findings: 3, exitCode: 0 } }));
});

for (const format of ["json", "sarif", "github", "markdown"] as const) {
  test(`suppressed for --format ${format}`, () => {
    assertSuppressed(attempt({ args: { format } }));
  });
}

test("suppressed when the input is stdin (-)", () => {
  assertSuppressed(attempt({ args: { stdin: true } }));
});

test("suppressed for --commit and --commit-msg", () => {
  assertSuppressed(attempt({ args: { commit: true } }));
});

test("suppressed for --pr", () => {
  assertSuppressed(attempt({ args: { pr: true } }));
});

test("suppressed for --history", () => {
  assertSuppressed(attempt({ args: { history: true } }));
});

test("suppressed for --explain", () => {
  assertSuppressed(attempt({ args: { explain: true } }));
});

test("suppressed for --fix runs", () => {
  assertSuppressed(attempt({ args: { fix: true } }));
});

test("prints exactly once: the first call prints and writes the marker, the second prints nothing", () => {
  withDir((dir) => {
    const chunks: string[] = [];
    const stdout = { isTTY: true, write: (s: string) => { chunks.push(s); return true; } };
    const env = { AI_SLOP_LINTER_CONFIG_DIR: dir };
    assert.equal(maybeStarHint(env, stdout, clean, realFs), true);
    assert.equal(existsSync(marker(dir)), true);
    assert.equal(maybeStarHint(env, stdout, clean, realFs), false);
    assert.deepEqual(chunks, [`${STAR_HINT_LINE}\n`]);
  });
});

test("a filesystem error is swallowed: an unwritable config dir still prints once and does not throw", () => {
  withDir((dir) => {
    // A regular file where the config directory should be: mkdir fails with ENOTDIR.
    const blocker = join(dir, "not-a-dir");
    writeFileSync(blocker, "");
    const chunks: string[] = [];
    const stdout = { isTTY: true, write: (s: string) => { chunks.push(s); return true; } };
    let printed = false;
    assert.doesNotThrow(() => {
      printed = maybeStarHint({ AI_SLOP_LINTER_CONFIG_DIR: blocker }, stdout, clean, realFs);
    });
    assert.equal(printed, true);
    assert.deepEqual(chunks, [`${STAR_HINT_LINE}\n`]);
  });
});

test("end to end: piped stdout never contains the hint, and no marker is written", () => {
  withDir((dir) => {
    const r = spawnSync("node", [cli, join(process.cwd(), "test", "fixtures", "clean.md")], {
      env: { ...process.env, AI_SLOP_LINTER_CONFIG_DIR: dir },
      encoding: "utf8",
    });
    assert.equal(r.status, 0);
    assert.equal(r.stdout.includes(STAR_HINT_LINE), false);
    assert.equal(existsSync(marker(dir)), false);
  });
});

test("suppressed when the empty-string agent variable AGENT is set", () => {
  assertSuppressed(attempt({ env: { AGENT: "" } }));
});

for (const name of HOOK_ENV_VARS) {
  test(`suppressed when the hook variable ${name} is set`, () => {
    assertSuppressed(attempt({ env: { [name]: "1" } }));
  });
}

test("the hook list is PRE_COMMIT, GIT_INDEX_FILE, HUSKY, LEFTHOOK and LINT_STAGED", () => {
  assert.deepEqual([...HOOK_ENV_VARS], ["PRE_COMMIT", "GIT_INDEX_FILE", "HUSKY", "LEFTHOOK", "LINT_STAGED"]);
});

test("every pre-commit hook that lints files passes --quiet, or is the commit-msg hook", () => {
  const text = readFileSync(join(process.cwd(), ".pre-commit-hooks.yaml"), "utf8");
  const blocks = text.split(/^- id:/m).slice(1);
  assert.ok(blocks.length >= 2, "expected at least the Markdown and commit-msg hooks");
  for (const block of blocks) {
    const id = block.split("\n")[0]?.trim();
    const args = /^\s*args:\s*\[(.*)\]/m.exec(block)?.[1]?.split(",").map((a) => a.trim()) ?? [];
    const ok = args.includes("--quiet") || args.includes("--commit-msg");
    assert.ok(ok, `pre-commit hook ${id} lints files without --quiet`);
  }
});

test("the Markdown pre-commit hook is the one that passes --quiet", () => {
  const text = readFileSync(join(process.cwd(), ".pre-commit-hooks.yaml"), "utf8");
  const block = text.split(/^- id:/m).find((b) => b.startsWith(" ai-slop-markdown"));
  assert.ok(block, "ai-slop-markdown hook is missing");
  assert.match(block, /^\s*args:\s*\[--quiet\]/m);
});

test("the options-to-hint mapping: --commit sets commit, and a plain run does not", () => {
  assert.equal(starHintArgs(parse(["--commit"]), [], 0).commit, true);
  assert.equal(starHintArgs(parse(["x.md"]), [], 0).commit, false);
});

test("the options-to-hint mapping: --commit-msg sets commit", () => {
  assert.equal(starHintArgs(parse(["--commit-msg", "COMMIT_EDITMSG"]), [], 0).commit, true);
});

test("the options-to-hint mapping: --pr, --fix, --explain, --history set their flags", () => {
  assert.equal(starHintArgs(parse(["--pr", "12"]), [], 0).pr, true);
  assert.equal(starHintArgs(parse(["x.md"]), [], 0).pr, false);
  assert.equal(starHintArgs(parse(["--fix", "x.md"]), [], 0).fix, true);
  assert.equal(starHintArgs(parse(["x.md"]), [], 0).fix, false);
  assert.equal(starHintArgs(parse(["--explain", "dash"]), [], 0).explain, true);
  assert.equal(starHintArgs(parse(["--history"]), [], 0).history, true);
});

test("the options-to-hint mapping: --format and stdin (-) map through", () => {
  assert.equal(starHintArgs(parse(["x.md", "--format", "json"]), [], 0).format, "json");
  assert.equal(starHintArgs(parse(["x.md"]), [], 0).format, "text");
  assert.equal(starHintArgs(parse(["-"]), [], 0).stdin, true);
  assert.equal(starHintArgs(parse(["x.md"]), [], 0).stdin, false);
});

test("the options-to-hint mapping: --quiet and -q map through", () => {
  assert.equal(starHintArgs(parse(["--quiet"]), [], 0).quiet, true);
  assert.equal(starHintArgs(parse(["-q"]), [], 0).quiet, true);
  assert.equal(starHintArgs(parse(["x.md"]), [], 0).quiet, false);
});

test("the options-to-hint mapping: exit code and findings come from the run", () => {
  const bad = lintText("bad.md", "Let's dive in \u2014 now.\n");
  const mapped = starHintArgs(parse(["bad.md"]), [bad], 1);
  assert.equal(mapped.exitCode, 1);
  assert.equal(mapped.findings, bad.findings.length);
  assert.ok(mapped.findings > 0);
});

test("a run whose findings are all baselined is clean, so the hint is allowed (pinned)", () => {
  withDir((dir) => {
    const bad = lintText("bad.md", "Let's dive in \u2014 now.\n");
    const baselined = applyBaseline([bad], createBaseline([bad])).results;
    assert.equal(baselined[0]?.findings.length, 0, "precondition: every finding is baselined");
    const chunks: string[] = [];
    const stdout = { isTTY: true, write: (s: string) => { chunks.push(s); return true; } };
    const args = starHintArgs(parse(["bad.md"]), baselined, 0);
    assert.equal(maybeStarHint({ AI_SLOP_LINTER_CONFIG_DIR: dir }, stdout, args, realFs), true);
    assert.deepEqual(chunks, [`${STAR_HINT_LINE}\n`]);
  });
});

/** Python allocates the pseudo-terminal: spawning `script` from node fails because stdin is not a terminal. */
const PTY_RUNNER = `
import os, pty, subprocess, sys, json
argv, env = json.loads(sys.argv[1]), json.loads(sys.argv[2])
master, slave = pty.openpty()
proc = subprocess.Popen(argv, stdin=slave, stdout=slave, stderr=slave, env=env, close_fds=True)
os.close(slave)
out = b""
while True:
    try:
        data = os.read(master, 4096)
    except OSError:
        break
    if not data:
        break
    out += data
proc.wait()
sys.stdout.buffer.write(out)
`;
const hasPython = spawnSync("python3", ["-c", "import pty"], { encoding: "utf8" }).status === 0;

/** Runs the CLI with stdout on a pseudo-terminal, as an interactive user's would be. */
function runInTerminal(args: string[], configDir: string): string {
  // This process may itself run under an agent or a hook; the terminal run must look like a person's.
  const env: Record<string, string | undefined> = { ...process.env, AI_SLOP_LINTER_CONFIG_DIR: configDir };
  for (const name of [...AGENT_ENV_VARS, ...HOOK_ENV_VARS, "CI"]) delete env[name];
  const argv = [process.execPath, cli, join(process.cwd(), "test", "fixtures", "clean.md"), ...args];
  const r = spawnSync("python3", ["-c", PTY_RUNNER, JSON.stringify(argv), JSON.stringify(env)], { encoding: "utf8" });
  return r.stdout;
}

test("end to end: the terminal control run prints the hint and writes the marker", { skip: !hasPython }, () => {
  withDir((dir) => {
    assert.ok(runInTerminal([], dir).includes(STAR_HINT_LINE));
    assert.equal(existsSync(marker(dir)), true);
  });
});

test("end to end: --quiet in a terminal prints nothing and writes no marker", { skip: !hasPython }, () => {
  withDir((dir) => {
    const out = runInTerminal(["--quiet"], dir);
    assert.equal(out.includes(STAR_HINT_LINE), false);
    assert.equal(existsSync(marker(dir)), false);
  });
});
