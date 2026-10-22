// Installs the packed .vsix into a throwaway VS Code and runs test/host/suite.cjs inside it, so
// what is tested is the file a user would install, not the source tree.
//
//   node test/host/run.mjs ai-slop-linter.vsix
//
// Downloads VS Code the first time (cached in .vscode-test/). On Linux without a display run it
// under `xvfb-run -a`.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import assert from "node:assert/strict";
import { downloadAndUnzipVSCode, resolveCliArgsFromVSCodeExecutablePath, runTests } from "@vscode/test-electron";

const VSCODE_VERSION = "1.90.0";
const vsix = resolve(process.argv[2] ?? "ai-slop-linter.vsix");
const here = import.meta.dirname;

// What ships: the bundle, the manifest, the readme and the licence, and nothing else.
const listed = spawnSync("unzip", ["-Z1", vsix], { encoding: "utf8" });
assert.equal(listed.status, 0, listed.stderr);
assert.deepEqual(
  listed.stdout.trim().split("\n").sort(),
  ["[Content_Types].xml", "extension.vsixmanifest", "extension/LICENSE.txt", "extension/dist/extension.js", "extension/package.json", "extension/readme.md"],
);

const executable = await downloadAndUnzipVSCode(VSCODE_VERSION);
const [cli, ...cliArgs] = resolveCliArgsFromVSCodeExecutablePath(executable);
const extensions = mkdtempSync(join(tmpdir(), "slop-ext-"));
const userData = mkdtempSync(join(tmpdir(), "slop-user-"));
const dirs = ["--extensions-dir", extensions, "--user-data-dir", userData];
const code = (...args) => spawnSync(cli, [...cliArgs, ...dirs, ...args], { encoding: "utf8", shell: process.platform === "win32" });

try {
  const install = code("--install-extension", vsix);
  assert.equal(install.status, 0, `${install.stdout}\n${install.stderr}`);
  assert.match(code("--list-extensions").stdout, /bubblegunn\.ai-slop-linter-vscode/);
  // No extensionDevelopmentPath: the extension under test is the installed one.
  await runTests({
    vscodeExecutablePath: executable,
    extensionTestsPath: join(here, "suite.cjs"),
    launchArgs: [...dirs, "--disable-workspace-trust", "--disable-gpu"],
  });
  console.log(`host test: ok on VS Code ${VSCODE_VERSION}`);
} finally {
  rmSync(extensions, { recursive: true, force: true });
  rmSync(userData, { recursive: true, force: true });
}
