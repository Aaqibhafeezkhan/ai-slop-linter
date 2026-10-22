// Runs inside VS Code. Exports run(), which test-electron calls; a rejected promise fails the run.
const assert = require("node:assert/strict");
const vscode = require("vscode");

/** Poll until `read` returns something truthy, or fail after the timeout. */
async function until(read, what, timeoutMs = 20000) {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const value = await read();
    if (value) return value;
    if (Date.now() > deadline) throw new Error(`timed out waiting for ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

async function run() {
  const doc = await vscode.workspace.openTextDocument({ language: "markdown", content: "Let's dive in — now.\n" });
  await vscode.window.showTextDocument(doc);

  const found = await until(() => {
    const list = vscode.languages.getDiagnostics(doc.uri).filter((d) => d.source === "ai-slop-linter");
    return list.length >= 2 ? list : null;
  }, "diagnostics from the installed extension");
  assert.deepEqual(found.map((d) => d.code).sort(), ["announcing", "dash"]);
  const dash = found.find((d) => d.code === "dash");
  assert.equal(dash.severity, vscode.DiagnosticSeverity.Error);
  assert.ok(doc.getText(dash.range).includes("—"));

  // Ask until the fix is offered: the diagnostic reaches the editor a moment after the collection has it.
  let titles = [];
  const fix = await until(async () => {
    const actions = await vscode.commands.executeCommand("vscode.executeCodeActionProvider", doc.uri, dash.range);
    titles = actions.map((a) => a.title);
    return actions.find((a) => a.kind && a.kind.value === "quickfix" && /dash/.test(a.title));
  }, "the dash quick fix to be offered");
  assert.ok(fix, `no quick fix offered: ${JSON.stringify(titles)}`);
  assert.ok(await vscode.workspace.applyEdit(fix.edit));
  assert.ok(!doc.getText().includes("—"), doc.getText());

  await until(() => !vscode.languages.getDiagnostics(doc.uri).some((d) => d.code === "dash"), "the dash diagnostic to clear after the fix");

  const plain = await vscode.workspace.openTextDocument({ language: "markdown", content: "Retry the request twice.\n" });
  await vscode.window.showTextDocument(plain);
  await new Promise((resolve) => setTimeout(resolve, 1500));
  assert.deepEqual(vscode.languages.getDiagnostics(plain.uri), []);

  // The language setting must reach the engine: French prose is not held to the English dash rule.
  const french = await vscode.workspace.openTextDocument({ language: "markdown", content: "Nous partons — il est tard.\n" });
  await vscode.window.showTextDocument(french);
  const config = vscode.workspace.getConfiguration("aiSlopLinter");
  try {
    await until(() => vscode.languages.getDiagnostics(french.uri).some((d) => d.code === "dash"), "the dash diagnostic under the default language");
    await config.update("language", "fr", vscode.ConfigurationTarget.Global);
    await until(() => !vscode.languages.getDiagnostics(french.uri).some((d) => d.code === "dash"), "the dash diagnostic to clear once the language is fr");
  } finally {
    await config.update("language", undefined, vscode.ConfigurationTarget.Global);
  }
}

module.exports = { run };
