import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { handleMessage } from "../src/mcp.js";

// Pack rules (fr/closer) are real rules: they fire, so every place that lists rules has to list
// them. Before this, SARIF named a result's rule but its `ruleIndex` was undefined and the rule
// was missing from the driver, `--rules` stopped at the English and commit rules, and MCP
// `explain_rule` said the rule did not exist.
const cli = join(process.cwd(), "dist", "src", "cli.js");
const FRENCH =
  "La directrice a déclaré que les résultats sont dans le rapport, et nous pensons que le service est très bon pour les clients de la région. Essayez Calbo dès aujourd'hui pour vos classes.\n";

const withFrench = <T>(use: (file: string) => T): T => {
  const dir = mkdtempSync(join(tmpdir(), "slop-pack-"));
  try {
    const file = join(dir, "note.md");
    writeFileSync(file, FRENCH);
    return use(file);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
};

test("SARIF lists a pack rule in the driver and points the result's ruleIndex at it", () => {
  const log = withFrench((file) => {
    const r = spawnSync("node", [cli, "--format", "sarif", "--warn", file], { encoding: "utf8" });
    assert.equal(r.status, 0, r.stderr);
    return JSON.parse(r.stdout);
  });
  const result = log.runs[0].results.find((x: { ruleId: string }) => x.ruleId === "fr/closer");
  assert.ok(result, "the French fixture must trigger fr/closer, or nothing here is tested");
  const driverRules = log.runs[0].tool.driver.rules as Array<{ id: string }>;
  assert.equal(typeof result.ruleIndex, "number");
  assert.equal(driverRules[result.ruleIndex]?.id, "fr/closer");
  assert.equal(driverRules.filter((r) => r.id === "fr/closer").length, 1);
});

test("--rules lists the pack rules with their source", () => {
  const r = spawnSync("node", [cli, "--rules"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  assert.match(r.stdout, /^fr\/closer\s+warning\s+/m);
  assert.match(r.stdout, /\(Provisional/);
});

test("MCP explain_rule explains a pack rule, and ignore/only accept its id", () => {
  const call = (name: string, args: unknown) =>
    (handleMessage(JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: { name, arguments: args } }), "9.9.9") as { result: any }).result;
  const explained = call("explain_rule", { rule: "fr/closer" });
  assert.equal(explained.isError, false);
  assert.equal(explained.structuredContent.id, "fr/closer");
  assert.ok(explained.structuredContent.example.before.length > 0);
  const checked = call("check_slop", { text: FRENCH, only: ["fr/closer"] });
  assert.equal(checked.isError, false);
  assert.deepEqual(checked.structuredContent.findings.map((f: { rule: string }) => f.rule), ["fr/closer"]);
});
