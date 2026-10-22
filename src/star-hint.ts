import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const STAR_HINT_LINE = "If this saved you a review comment, a star helps others find it: https://github.com/Bubblegunn/ai-slop-linter";

/** Variables that mean an AI agent is running the command, so nobody is there to read a hint. */
export const AGENT_ENV_VARS = [
  "CLAUDECODE", "CLAUDE_CODE_ENTRYPOINT", "CODEX_SANDBOX", "CODEX_HOME", "CURSOR_AGENT",
  "GEMINI_CLI", "AGENT", "AI_AGENT", "OPENCODE", "AIDER_MODEL",
] as const;

/** Variables a git hook framework sets while it runs the linter; the hint would reach a terminal there. */
export const HOOK_ENV_VARS = ["PRE_COMMIT", "GIT_INDEX_FILE", "HUSKY", "LEFTHOOK", "LINT_STAGED"] as const;

/** What the run looked like, as the CLI knows it when it finishes. */
export interface StarHintArgs {
  format: "text" | "json" | "github" | "markdown" | "sarif";
  quiet: boolean;
  fix: boolean;
  commit: boolean;
  pr: boolean;
  explain: boolean;
  history: boolean;
  stdin: boolean;
  exitCode: number;
  findings: number;
}

export interface StarHintStdout {
  isTTY?: boolean;
  write: (chunk: string) => unknown;
}

export interface StarHintFs {
  existsSync: (path: string) => boolean;
  mkdirSync: (path: string) => void;
  writeFileSync: (path: string, data: string) => void;
}

export const realFs: StarHintFs = {
  existsSync: (path) => existsSync(path),
  mkdirSync: (path) => {
    mkdirSync(path, { recursive: true });
  },
  writeFileSync: (path, data) => {
    writeFileSync(path, data);
  },
};

/**
 * The marker's directory is `<config dir>/ai-slop-linter`. The config dir is $XDG_CONFIG_HOME,
 * else %APPDATA% on Windows, else ~/.config. AI_SLOP_LINTER_CONFIG_DIR replaces the config dir
 * (the tests use it so they never touch the real home).
 */
function markerPath(env: Record<string, string | undefined>): string {
  const base =
    env.AI_SLOP_LINTER_CONFIG_DIR ||
    env.XDG_CONFIG_HOME ||
    (process.platform === "win32" && env.APPDATA) ||
    join(env.HOME || homedir(), ".config");
  return join(base, "ai-slop-linter", "star-hint-shown");
}

const ciIsSet = (value: string | undefined) => value !== undefined && value !== "" && value !== "0" && value !== "false";

/**
 * Prints the one-time star hint after a clean interactive text run, and writes the marker so it
 * never prints again on this machine. Every condition that suppresses it returns false without
 * output. Filesystem errors are swallowed; the hint still counts as shown for that run.
 */
export function maybeStarHint(
  env: Record<string, string | undefined>,
  stdout: StarHintStdout,
  args: StarHintArgs,
  fs: StarHintFs,
): boolean {
  if (!stdout.isTTY) return false;
  if (ciIsSet(env.CI)) return false;
  if (AGENT_ENV_VARS.some((name) => env[name] !== undefined)) return false;
  if (HOOK_ENV_VARS.some((name) => env[name] !== undefined)) return false;
  if (args.quiet) return false;
  if (env.AI_SLOP_LINTER_NO_STAR_HINT === "1") return false;
  if (args.format !== "text" || args.fix || args.commit || args.pr || args.explain || args.history || args.stdin) return false;
  if (args.exitCode !== 0 || args.findings !== 0) return false;

  const file = markerPath(env);
  try {
    if (fs.existsSync(file)) return false;
  } catch {
    // An unreadable marker location: fall through and show the hint for this run.
  }
  stdout.write(`${STAR_HINT_LINE}\n`);
  try {
    fs.mkdirSync(join(file, ".."));
    fs.writeFileSync(file, "");
  } catch {
    // Silently ignored: the hint was shown, the next run may show it again.
  }
  return true;
}
