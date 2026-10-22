import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// npm test runs from vscode/, so the manifest is in the working directory and the repository is one level up.
const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
const tasks = JSON.parse(readFileSync(join(process.cwd(), "..", ".vscode", "tasks.json"), "utf8"));

test("the problem matcher the extension contributes is the one the repository's task uses", () => {
  const task = tasks.tasks[0].problemMatcher;
  const mine = pkg.contributes.problemMatchers[0];
  assert.equal(mine.name, "ai-slop-linter");
  assert.deepEqual(mine.pattern, task.pattern);
  assert.deepEqual(mine.fileLocation, task.fileLocation);
  assert.equal(mine.owner, task.owner);
  assert.equal(mine.source, task.source);
});

test("the extension wakes for exactly the languages it lints", () => {
  assert.deepEqual(pkg.activationEvents, ["onLanguage:markdown", "onLanguage:plaintext", "onLanguage:git-commit"]);
});

test("every setting the code reads is declared", () => {
  const declared = Object.keys(pkg.contributes.configuration.properties).sort();
  assert.deepEqual(declared, ["aiSlopLinter.enable", "aiSlopLinter.ignore", "aiSlopLinter.language", "aiSlopLinter.only"]);
});

test("the runtime has no dependency: the library is bundled at build time", () => {
  assert.equal(pkg.dependencies, undefined);
});
