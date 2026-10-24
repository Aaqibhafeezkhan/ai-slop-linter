// @ts-check
// hooks/rewrite-prompt.sh is the plugin's UserPromptSubmit hook. It adds one line of context on prompts
// that ask to rewrite or edit prose, so the agent loads the skill, and prints nothing on any other prompt.
// test/fixtures/prompt-hook.json holds the prompts; its _note gives the rate on unseen batches, which is
// lower than the in-sample rate asserted here.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";

const root = join(import.meta.dirname, "..");
const script = join(root, "hooks", "rewrite-prompt.sh");
const fixture = JSON.parse(readFileSync(join(root, "test", "fixtures", "prompt-hook.json"), "utf8"));

/** @param {string} input */
const runRaw = (input) => spawnSync("sh", [script], { input, encoding: "utf8", env: { PATH: process.env.PATH ?? "/usr/bin:/bin" } });
// The fields Claude Code sends; cwd and transcript_path carry trigger words on purpose, only "prompt" counts.
/** @param {string} prompt */
const run = (prompt) =>
  runRaw(JSON.stringify({ session_id: "s", transcript_path: "/tmp/polish/rewrite.jsonl", cwd: "/home/u/proofread-docs", permission_mode: "default", hook_event_name: "UserPromptSubmit", prompt }));

const rate = (/** @type {string[]} */ prompts) => prompts.filter((p) => run(p).stdout !== "").length;

test("fixture: at least 25 related and 25 unrelated prompts", () => {
  assert.ok(fixture.related.length >= 25 && fixture.unrelated.length >= 25);
});

test("related prompts trigger (at least 90 percent, every miss listed in known_miss)", () => {
  const missed = fixture.related.filter((/** @type {string} */ p) => run(p).stdout === "");
  assert.deepEqual(missed, [], `missed: ${missed.join(" | ")}`);
  const hits = rate(fixture.related);
  console.log(`# true triggers ${hits}/${fixture.related.length}; known misses ${rate(fixture.known_miss)}/${fixture.known_miss.length} caught`);
  assert.ok(hits / (fixture.related.length + fixture.known_miss.length) >= 0.9);
});

test("known misses stay misses (update the fixture when one starts to trigger)", () => {
  for (const p of fixture.known_miss) assert.equal(run(p).stdout, "", p);
});

test("unrelated prompts print nothing (0 false triggers)", () => {
  const flagged = fixture.unrelated.filter((/** @type {string} */ p) => run(p).stdout !== "");
  console.log(`# false triggers ${flagged.length}/${fixture.unrelated.length}`);
  assert.deepEqual(flagged, []);
});

test("a trigger prints exactly one line of UserPromptSubmit JSON that names the skill and the blocking compare", () => {
  const r = run(fixture.related[0]);
  assert.equal(r.status, 0);
  assert.equal(r.stderr, "");
  const lines = r.stdout.split("\n").filter(Boolean);
  assert.equal(lines.length, 1);
  const out = JSON.parse(lines[0]);
  assert.equal(out.hookSpecificOutput.hookEventName, "UserPromptSubmit");
  const ctx = out.hookSpecificOutput.additionalContext;
  assert.match(ctx, /ai-slop-linter skill/);
  assert.match(ctx, /--compare/);
  assert.match(ctx, /blocking/);
  assert.equal(out.decision, undefined, "never blocks");
});

// Round 3 plan item 1: in round 1 both failing h2 runs never loaded the skill, so the guardrails ride in
// the hook line itself. It stays one line of JSON and passes the linter it points to.
test("the context line carries the guardrails: no added person or claim, numbers and qualifiers kept, fr/de/es reference, compare until exit 0", () => {
  const ctx = JSON.parse(run(fixture.related[0]).stdout).hookSpecificOutput.additionalContext;
  assert.doesNotMatch(ctx, /\n/, "one line");
  assert.ok(ctx.length < 800, `${ctx.length} characters`);
  assert.match(ctx, /Add no we, our or I/);
  assert.match(ctx, /no claim or fact the source lacks/);
  assert.match(ctx, /keep every number with its qualifier/);
  assert.match(ctx, /references\/<lang>\.md/);
  for (const lang of ["French", "German", "Spanish"]) assert.ok(ctx.includes(lang), lang);
  assert.match(ctx, /until it exits 0/);
  const lint = spawnSync(process.execPath, [join(root, "dist", "src", "cli.js"), "--warn", "-"], { input: ctx, encoding: "utf8" });
  assert.match(lint.stdout, /0 findings/, lint.stdout + lint.stderr);
});

test("every prompt exits 0, and malformed input prints nothing and exits 0", { skip: process.platform === "win32" ? "the hook is a POSIX sh script; Windows bash warns about the null byte" : false }, () => {
  for (const p of [...fixture.related, ...fixture.unrelated]) assert.equal(run(p).status, 0, p);
  for (const input of ["", "not json", "{", '{"prompt":', '{"prompt":"polish this paragraph', '{"prompt":42}', "\u0000\u0001", '{"cwd":"/rewrite/this/paragraph"}']) {
    const r = runRaw(input);
    assert.equal(r.status, 0, JSON.stringify(input));
    assert.equal(r.stderr, "", JSON.stringify(input));
  }
  assert.equal(runRaw('{"cwd":"/rewrite/this/paragraph","prompt":"what time is it"}').stdout, "", "only the prompt field is read");
});

test("escaped quotes and newlines inside the prompt are handled", () => {
  assert.notEqual(run('He said "hi".\nNow proofread the line above').stdout, "");
  assert.equal(run('Explain the "prompt": key\nin the hook input').stdout, "");
});

test("the grep patterns hold no backslash escape: an escape such as \\t is undefined in a POSIX ERE", () => {
  // Inside the double-quoted pattern assignments a backslash may only end a line (a line continuation).
  const text = readFileSync(script, "utf8");
  const start = text.indexOf("\nstrong=");
  const end = text.indexOf("\nhit=no");
  assert.ok(start > 0 && end > start, "pattern block not found");
  const stray = text.slice(start, end).split("\n").filter((l) => !l.trimStart().startsWith("#")).filter((l) => /\\./.test(l.replace(/\\$/, "")));
  assert.deepEqual(stray, []);
});

test("hooks.json registers the script through CLAUDE_PLUGIN_ROOT for UserPromptSubmit", () => {
  const cfg = JSON.parse(readFileSync(join(root, "hooks", "hooks.json"), "utf8"));
  const entries = cfg.hooks.UserPromptSubmit;
  assert.equal(entries.length, 1);
  const [h] = entries[0].hooks;
  assert.equal(h.type, "command");
  assert.equal(h.command, 'sh "${CLAUDE_PLUGIN_ROOT}/hooks/rewrite-prompt.sh"');
  assert.deepEqual(Object.keys(cfg.hooks), ["UserPromptSubmit"]);
});

test("the script uses POSIX tools only: no network, no writes, no jq or node", () => {
  const text = readFileSync(script, "utf8");
  assert.match(text, /^#!\/bin\/sh\n/);
  // Code only: comment lines dropped, single-quoted strings (the output line, sed and tr programs) emptied.
  const src = text.split("\n").filter((l) => !l.trimStart().startsWith("#")).join("\n").replace(/'[^'\n]*'/g, "''");
  for (const bad of [/\bcurl\b/, /\bwget\b/, /\bjq\b/, /\bnode\b/, /\bpython/, /\bnc\b/, /\btee\b/, /\bmktemp\b/, /\bsed -i\b/, /\bcp\b/, /\bmv\b/]) assert.doesNotMatch(src, bad, String(bad));
  const redirects = src.match(/\d*>+\s*[^\s)]+/g) ?? [];
  assert.deepEqual(redirects.filter((r) => !/^2>\/dev\/null$/.test(r)), [], "the only redirect is 2>/dev/null");
  if (process.platform !== "win32") assert.ok(statSync(script).mode & 0o111, "executable");
  assert.deepEqual(readdirSync(join(root, "hooks")).sort(), ["hooks.json", "rewrite-prompt.sh"]);
});
