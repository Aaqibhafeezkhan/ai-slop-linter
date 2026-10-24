import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { handleMessage, PROTOCOL_VERSIONS, TOOLS } from "../src/mcp.js";

interface Reply { jsonrpc: string; id: unknown; result?: any; error?: { code: number; message: string } }

const send = (message: unknown): Reply | null => handleMessage(JSON.stringify(message), "9.9.9") as Reply | null;
const request = (method: string, params?: unknown, id: number | string = 1): Reply => {
  const reply = send({ jsonrpc: "2.0", id, method, ...(params === undefined ? {} : { params }) });
  assert.ok(reply, `${method} got no reply`);
  return reply;
};
const callTool = (name: string, args: unknown): Reply => request("tools/call", { name, arguments: args });

test("initialize names the server, echoes a supported protocol version and offers tools", () => {
  const r = request("initialize", { protocolVersion: "2024-11-05", capabilities: {}, clientInfo: { name: "t", version: "0" } }, "init-1");
  assert.equal(r.id, "init-1");
  assert.equal(r.result.protocolVersion, "2024-11-05");
  assert.deepEqual(r.result.serverInfo, { name: "ai-slop-linter", version: "9.9.9" });
  assert.deepEqual(r.result.capabilities, { tools: {} });
});

test("an unknown protocol version is answered with the newest one this server speaks", () => {
  const r = request("initialize", { protocolVersion: "1999-01-01" });
  assert.equal(r.result.protocolVersion, PROTOCOL_VERSIONS[0]);
});

test("tools/list names the four tools with an input schema each", () => {
  const r = request("tools/list");
  assert.deepEqual(r.result.tools.map((t: { name: string }) => t.name), ["check_slop", "check_slop_file", "compare_facts", "explain_rule"]);
  assert.deepEqual(r.result.tools, TOOLS);
  for (const t of r.result.tools) assert.equal(t.inputSchema.type, "object");
});

test("check_slop returns structured findings with line, column, severity and a fix range", () => {
  const text = "Let's dive in — now.\n";
  const r = callTool("check_slop", { text });
  assert.equal(r.result.isError, false);
  const out = r.result.structuredContent;
  assert.deepEqual(out.findings.map((f: { rule: string }) => f.rule).sort(), ["announcing", "dash"]);
  assert.equal(JSON.stringify(out), r.result.content[0].text);
  const dash = out.findings.find((f: { rule: string }) => f.rule === "dash");
  assert.equal(dash.line, 1);
  assert.equal(dash.severity, "error");
  assert.equal(dash.fixable, true);
  const fixed = text.slice(0, dash.fix.start) + dash.fix.replacement + text.slice(dash.fix.end);
  assert.ok(!fixed.includes("—"), fixed);
  assert.equal(out.grade, null, "under 50 words is not graded");
});

test("empty text is a valid, clean result", () => {
  const r = callTool("check_slop", { text: "" });
  assert.equal(r.result.isError, false);
  assert.deepEqual(r.result.structuredContent.findings, []);
});

test("ignore and only narrow the rules, and an unknown rule id is an error rather than a clean result", () => {
  const text = "Let's dive in — now.\n";
  const ignored = callTool("check_slop", { text, ignore: ["dash"] }).result.structuredContent;
  assert.deepEqual(ignored.findings.map((f: { rule: string }) => f.rule), ["announcing"]);
  const only = callTool("check_slop", { text, only: ["dash"] }).result.structuredContent;
  assert.deepEqual(only.findings.map((f: { rule: string }) => f.rule), ["dash"]);
  const typo = callTool("check_slop", { text, ignore: ["dahs"] });
  assert.equal(typo.result.isError, true);
  assert.match(typo.result.content[0].text, /unknown rule "dahs"/);
});

test("a declared non-English language stands the English-only dash rule down", () => {
  const r = callTool("check_slop", { text: "Nous partons — il est tard.\n", language: "fr" }).result.structuredContent;
  assert.ok(!r.findings.some((f: { rule: string }) => f.rule === "dash"));
  assert.ok(r.stoodDown.includes("dash"));
});

test("check_slop_file reads a file, and a missing file or a directory is a tool error", () => {
  const dir = mkdtempSync(join(tmpdir(), "slop-mcp-"));
  try {
    const file = join(dir, "doc.md");
    writeFileSync(file, "Let's dive in — now.\n");
    const r = callTool("check_slop_file", { file_path: file });
    assert.equal(r.result.isError, false);
    assert.equal(r.result.structuredContent.path, file);
    assert.ok(r.result.structuredContent.findings.length >= 2);
    const missing = callTool("check_slop_file", { file_path: join(dir, "nope.md") });
    assert.equal(missing.result.isError, true);
    assert.match(missing.result.content[0].text, /cannot read .*nope\.md: ENOENT/);
    const folder = callTool("check_slop_file", { file_path: dir });
    assert.equal(folder.result.isError, true);
    assert.match(folder.result.content[0].text, /directory/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("check_slop_file refuses a device that is not a regular file instead of reading it", { skip: process.platform === "win32" ? "/dev/null is POSIX" : false }, () => {
  const r = callTool("check_slop_file", { file_path: "/dev/null" }).result;
  assert.equal(r.isError, true);
  assert.match(r.content[0].text, /path is not a regular file: \/dev\/null/);
});

test("check_slop_file reports a file it cannot read as a tool error", (t) => {
  if (process.platform === "win32") {
    t.skip("chmod 000 does not make a file unreadable on Windows");
    return;
  }
  if (process.getuid?.() === 0) {
    t.skip("root can read a chmod 000 file");
    return;
  }
  const dir = mkdtempSync(join(tmpdir(), "slop-mcp-"));
  const file = join(dir, "locked.md");
  try {
    writeFileSync(file, "Let's dive in — now.\n");
    chmodSync(file, 0o000);
    const r = callTool("check_slop_file", { file_path: file }).result;
    assert.equal(r.isError, true);
    assert.match(r.content[0].text, /cannot read .*: EACCES/);
  } finally {
    chmodSync(file, 0o644);
    rmSync(dir, { recursive: true, force: true });
  }
});

test("explain_rule returns the why, the example and when to ignore", () => {
  const r = callTool("explain_rule", { rule: "dash" }).result;
  assert.equal(r.isError, false);
  assert.equal(r.structuredContent.id, "dash");
  assert.ok(r.structuredContent.why.length > 40);
  assert.ok(r.structuredContent.example.before && r.structuredContent.example.after);
  assert.equal(callTool("explain_rule", { rule: "nope" }).result.isError, true);
});

test("notifications and replies from the client get no answer", () => {
  assert.equal(send({ jsonrpc: "2.0", method: "notifications/initialized" }), null);
  assert.equal(send({ jsonrpc: "2.0", method: "notifications/whatever", params: {} }), null);
  assert.equal(send({ jsonrpc: "2.0", id: 7, result: {} }), null);
});

test("malformed input is answered with a JSON-RPC error and never throws", () => {
  assert.equal((handleMessage("{not json", "1") as Reply).error?.code, -32700);
  assert.equal((handleMessage("[1,2]", "1") as Reply).error?.code, -32600);
  assert.equal((handleMessage("42", "1") as Reply).error?.code, -32600);
  assert.equal(request("resources/list").error?.code, -32601);
  assert.equal(request("tools/call", { name: "nope", arguments: {} }).error?.code, -32602);
  assert.equal(request("tools/call", { name: "check_slop", arguments: [] }).error?.code, -32602);
  assert.equal(callTool("check_slop", { text: 5 }).result.isError, true);
  assert.deepEqual(request("ping").result, {});
});

const cli = join(process.cwd(), "dist", "src", "cli.js");

test("slop --mcp answers over stdio, survives a bad line, and prints nothing but JSON-RPC", () => {
  const input =
    [
      { jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-06-18", capabilities: {}, clientInfo: { name: "t", version: "0" } } },
      { jsonrpc: "2.0", method: "notifications/initialized" },
      { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "check_slop", arguments: { text: "Let's dive in — now.\n" } } },
    ]
      .map((m) => JSON.stringify(m))
      .join("\n") + "\nnot json\n";
  const r = spawnSync("node", [cli, "--mcp"], { input, encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const replies = r.stdout.trim().split("\n").map((l) => JSON.parse(l) as Reply);
  assert.deepEqual(replies.map((x) => x.id), [1, 2, null]);
  assert.equal(replies[0]!.result.serverInfo.name, "ai-slop-linter");
  assert.equal(replies[1]!.result.structuredContent.findings.length, 2);
  assert.equal(replies[2]!.error?.code, -32700);
  assert.equal(r.stderr, "");
});

test("the MCP server adds no dependency to the package", () => {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8")) as { dependencies?: unknown };
  assert.equal(pkg.dependencies, undefined);
});

test("compare_facts reports an added first-person word and an added claim word", () => {
  const r = callTool("compare_facts", { before: "In benchmarks, the parser is fast.", after: "In our benchmarks, the parser is always fast." });
  assert.deepEqual(r.result.structuredContent.added, [{ kind: "claim", value: "always" }, { kind: "person", value: "our" }]);
  const same = callTool("compare_facts", { before: "The parser is always fast.", after: "The parser is fast." });
  assert.deepEqual(same.result.structuredContent.added, []);
  assert.deepEqual(same.result.structuredContent.lost, []);
});

test("compare_facts takes the language, which picks the word lists of a text too short to detect", () => {
  const args = { before: "Ölçümler iki hata gösteriyor.", after: "Bizim ölçümler iki hata gösteriyor." };
  assert.deepEqual(callTool("compare_facts", args).result.structuredContent.added, []);
  assert.deepEqual(callTool("compare_facts", { ...args, language: "tr" }).result.structuredContent.added, [{ kind: "person", value: "bizim" }]);
  const bad = callTool("compare_facts", { ...args, language: 3 });
  assert.equal(bad.result.isError, true);
  assert.match(bad.result.content[0].text, /language must be a string/);
});

test("compare_facts reports the facts a rewrite lost and added, and refuses a missing side", () => {
  const r = callTool("compare_facts", { before: "Fastq 2.3 is 40% faster.", after: "Fastq 2.3 is 45% faster." });
  assert.equal(r.result.isError, false);
  const out = r.result.structuredContent;
  assert.deepEqual(out.lost, [{ kind: "number", value: "40%" }]);
  assert.deepEqual(out.added, [{ kind: "number", value: "45%" }]);
  assert.equal(out.kept, 1, "the version 2.3 is kept");
  const bad = callTool("compare_facts", { before: "x" });
  assert.equal(bad.result.isError, true);
  assert.match(bad.result.content[0].text, /before and after must be strings/);
});
