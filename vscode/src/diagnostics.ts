import { lintText } from "ai-slop-linter";

/** A zero-based position, the way VS Code counts: lines from 0, characters in UTF-16 code units. */
export interface Pos {
  line: number;
  character: number;
}

export type Level = "error" | "warning" | "information";

export interface SlopDiagnostic {
  start: Pos;
  end: Pos;
  level: Level;
  rule: string;
  message: string;
  /** Present only for a fix that cannot change meaning. */
  fix?: { start: Pos; end: Pos; replacement: string };
}

export interface Settings {
  ignore: string[];
  only: string[];
  language: string | undefined;
}

const LEVELS = { error: "error", warning: "warning", info: "information" } as const;

/** Offset-to-position lookups for one text, built once so a document with many findings stays linear. */
function locator(text: string) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  return {
    offsetOf: (line: number, column: number) => starts[line - 1]! + column - 1,
    posOf(offset: number): Pos {
      let lo = 0;
      let hi = starts.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (starts[mid]! <= offset) lo = mid;
        else hi = mid - 1;
      }
      return { line: lo, character: offset - starts[lo]! };
    },
  };
}

/** Where to end the squiggle for a finding that has no fix range: the end of the word it starts at, else one character. */
export function wordEnd(text: string, offset: number): number {
  const m = /^[\p{L}\p{N}'’-]+/u.exec(text.slice(offset, offset + 80));
  if (m) return offset + m[0].length;
  const codePoint = text.codePointAt(offset) ?? 0;
  return offset + (codePoint > 0xffff ? 2 : 1);
}

/** Lint one document and describe each finding in editor terms. Pure: nothing here imports "vscode". */
export function toDiagnostics(text: string, settings: Settings): SlopDiagnostic[] {
  const where = locator(text);
  const options = { ignore: settings.ignore, only: settings.only, ...(settings.language ? { language: settings.language } : {}) };
  return lintText("document", text, options).findings.map((f) => {
    const offset = where.offsetOf(f.line, f.column);
    const end = f.fix ? f.fix.end : wordEnd(text, offset);
    return {
      start: where.posOf(offset),
      end: where.posOf(Math.max(end, offset + 1)),
      level: LEVELS[f.severity],
      rule: f.rule,
      message: f.message,
      ...(f.fix ? { fix: { start: where.posOf(f.fix.start), end: where.posOf(f.fix.end), replacement: f.fix.replacement } } : {}),
    };
  });
}
