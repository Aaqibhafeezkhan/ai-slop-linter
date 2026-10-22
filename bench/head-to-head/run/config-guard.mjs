#!/usr/bin/env node
// usage: node config-guard.mjs [print | record <file> | check <file>]
// Hashes only the `hooks` object of the Claude settings file and the `mcpServers` object of the
// Claude JSON file and prints the two short hashes. It never prints any content of either file.
//   print          print "hooks=<hash> mcpServers=<hash>"
//   record <file>  write the current hashes to <file> as the start state
//   check <file>   compare the current hashes with the start state in <file>; exit 3 with a loud
//                  message on stderr when either changed (exit 2 when <file> is missing)
// Paths: ~/.claude/settings.json and ~/.claude.json, overridable with H2H_GUARD_SETTINGS and
// H2H_GUARD_CLAUDE_JSON (tests use temp files). A missing file hashes as "absent".
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const hash = (value) => createHash("sha256").update(JSON.stringify(value ?? null)).digest("hex").slice(0, 16);

// A guarded file that cannot be read or parsed means the guard cannot verify anything: stop with a fixed
// message (never the parser's message, which could quote file content) and exit 3.
function readHash(path, key) {
  if (!existsSync(path)) return "absent";
  try {
    return hash(JSON.parse(readFileSync(path, "utf8"))[key]);
  } catch {
    console.error("config guard: a guarded file could not be read as JSON, so it cannot be verified. Aborting.");
    process.exit(3);
  }
}

export function currentState() {
  const settings = process.env.H2H_GUARD_SETTINGS || join(homedir(), ".claude", "settings.json");
  const claudeJson = process.env.H2H_GUARD_CLAUDE_JSON || join(homedir(), ".claude.json");
  return { hooks: readHash(settings, "hooks"), mcpServers: readHash(claudeJson, "mcpServers") };
}

const [mode = "print", file] = process.argv.slice(2);
const now = currentState();
if (mode === "print") {
  console.log(`hooks=${now.hooks} mcpServers=${now.mcpServers}`);
} else if (mode === "record" && file) {
  writeFileSync(file, JSON.stringify(now) + "\n");
  console.log(`config guard recorded: hooks=${now.hooks} mcpServers=${now.mcpServers}`);
} else if (mode === "check" && file) {
  if (!existsSync(file)) {
    console.error(`config guard: no start state at ${file}`);
    process.exit(2);
  }
  let start;
  try {
    start = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    console.error("config guard: the recorded start state could not be read. Aborting.");
    process.exit(3);
  }
  const changed = ["hooks", "mcpServers"].filter((k) => start[k] !== now[k]);
  if (changed.length) {
    console.error("!!! CONFIG GUARD TRIPPED !!!");
    console.error(`!!! ${changed.join(" and ")} in the real Claude config changed during the run.`);
    console.error(`!!! start: hooks=${start.hooks} mcpServers=${start.mcpServers}`);
    console.error(`!!! now:   hooks=${now.hooks} mcpServers=${now.mcpServers}`);
    console.error("!!! Aborting. Find out what touched the config before running anything else.");
    process.exit(3);
  }
} else {
  console.error("usage: config-guard.mjs [print | record <file> | check <file>]");
  process.exit(2);
}
