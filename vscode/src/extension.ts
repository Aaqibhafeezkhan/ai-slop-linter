import * as vscode from "vscode";
import { toDiagnostics } from "./diagnostics.ts";
import type { Settings, SlopDiagnostic } from "./diagnostics.ts";

/** The languages the extension lints: the ones it activates for in package.json. */
const LANGUAGES = ["markdown", "plaintext", "git-commit"];
const SOURCE = "ai-slop-linter";
const DEBOUNCE_MS = 300;

const SEVERITY: Record<SlopDiagnostic["level"], vscode.DiagnosticSeverity> = {
  error: vscode.DiagnosticSeverity.Error,
  warning: vscode.DiagnosticSeverity.Warning,
  information: vscode.DiagnosticSeverity.Information,
};

const range = (a: SlopDiagnostic["start"], b: SlopDiagnostic["end"]) => new vscode.Range(a.line, a.character, b.line, b.character);

function settings(doc: vscode.TextDocument): Settings & { enable: boolean } {
  const c = vscode.workspace.getConfiguration("aiSlopLinter", doc.uri);
  return {
    enable: c.get<boolean>("enable", true),
    ignore: c.get<string[]>("ignore", []),
    only: c.get<string[]>("only", []),
    language: c.get<string>("language", "") || undefined,
  };
}

export function activate(context: vscode.ExtensionContext): void {
  const collection = vscode.languages.createDiagnosticCollection(SOURCE);
  /** What was last found per document, so a quick fix can look up its replacement. */
  const found = new Map<string, SlopDiagnostic[]>();
  const timers = new Map<string, NodeJS.Timeout>();

  const refresh = (doc: vscode.TextDocument): void => {
    if (!LANGUAGES.includes(doc.languageId)) return;
    const key = doc.uri.toString();
    const s = settings(doc);
    if (!s.enable) {
      collection.delete(doc.uri);
      found.delete(key);
      return;
    }
    const list = toDiagnostics(doc.getText(), s);
    found.set(key, list);
    collection.set(
      doc.uri,
      list.map((d) => {
        const diagnostic = new vscode.Diagnostic(range(d.start, d.end), d.message, SEVERITY[d.level]);
        diagnostic.source = SOURCE;
        diagnostic.code = d.rule;
        return diagnostic;
      }),
    );
  };

  const later = (doc: vscode.TextDocument): void => {
    const key = doc.uri.toString();
    clearTimeout(timers.get(key));
    timers.set(key, setTimeout(() => refresh(doc), DEBOUNCE_MS));
  };

  context.subscriptions.push(
    collection,
    vscode.workspace.onDidOpenTextDocument(refresh),
    vscode.workspace.onDidChangeTextDocument((e) => later(e.document)),
    vscode.workspace.onDidSaveTextDocument(refresh),
    vscode.workspace.onDidCloseTextDocument((doc) => {
      collection.delete(doc.uri);
      found.delete(doc.uri.toString());
      clearTimeout(timers.get(doc.uri.toString()));
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration("aiSlopLinter")) vscode.workspace.textDocuments.forEach(refresh);
    }),
    vscode.languages.registerCodeActionsProvider(
      LANGUAGES,
      {
        provideCodeActions(doc, _range, ctx) {
          const list = found.get(doc.uri.toString()) ?? [];
          const actions: vscode.CodeAction[] = [];
          for (const diagnostic of ctx.diagnostics) {
            if (diagnostic.source !== SOURCE) continue;
            const hit = list.find((d) => d.rule === diagnostic.code && d.fix && d.start.line === diagnostic.range.start.line && d.start.character === diagnostic.range.start.character);
            if (!hit?.fix) continue;
            const action = new vscode.CodeAction(`Apply the safe fix for ${hit.rule}`, vscode.CodeActionKind.QuickFix);
            action.diagnostics = [diagnostic];
            action.edit = new vscode.WorkspaceEdit();
            action.edit.replace(doc.uri, range(hit.fix.start, hit.fix.end), hit.fix.replacement);
            actions.push(action);
          }
          return actions;
        },
      },
      { providedCodeActionKinds: [vscode.CodeActionKind.QuickFix] },
    ),
  );

  vscode.workspace.textDocuments.forEach(refresh);
}

export function deactivate(): void {}
