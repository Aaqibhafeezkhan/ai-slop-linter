/**
 * The blocks `--verify` holds fixed: front matter, fenced code blocks, Markdown table rows and
 * heading lines. Each is compared with the original by position and byte for byte (line ends
 * normalised). The original's blocks must appear in the rewrite in the same order, so an edit, a
 * deletion and a reorder are all problems; a block the rewrite adds between them is not.
 */
export interface StructureProblem {
  line: number;
  message: string;
}

interface Item {
  line: number;
  text: string;
}

interface Parts {
  front: Item | null;
  code: Item[];
  tables: Item[];
  headings: Item[];
}

const FENCE = /^ {0,3}(`{3,}|~{3,})(.*)$/;

function parts(source: string): Parts {
  const lines = source.split(/\r?\n/);
  const out: Parts = { front: null, code: [], tables: [], headings: [] };
  let i = 0;
  if (lines[0] === "---") {
    const end = lines.indexOf("---", 1);
    // A body with no `key: value` line is a thematic break around prose, not front matter.
    const yaml = end > 0 && (end === 1 || lines.slice(1, end).some((l) => /^[\w.-]+[ \t]*:(\s|$)/.test(l)));
    if (yaml) {
      out.front = { line: 1, text: lines.slice(0, end + 1).join("\n") };
      i = end + 1;
    }
  }
  for (; i < lines.length; i++) {
    const line = lines[i]!;
    const open = FENCE.exec(line);
    if (open && !(open[1]![0] === "`" && open[2]!.includes("`"))) {
      const mark = open[1]!;
      let end = i + 1;
      while (end < lines.length) {
        const close = FENCE.exec(lines[end]!);
        if (close && close[1]![0] === mark[0] && close[1]!.length >= mark.length && close[2]!.trim() === "") break;
        end++;
      }
      const last = Math.min(end, lines.length - 1);
      out.code.push({ line: i + 1, text: lines.slice(i, last + 1).join("\n") });
      i = last;
      continue;
    }
    const trimmed = line.trim();
    if (/^ {0,3}#{1,6}(\s|$)/.test(line)) out.headings.push({ line: i + 1, text: line.trimEnd() });
    else if (trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.length > 1) out.tables.push({ line: i + 1, text: trimmed });
  }
  return out;
}

const excerpt = (s: string) => {
  const first = s.split("\n")[0]!;
  return first.length > 60 ? `${first.slice(0, 57)}...` : first;
};

function compareList(label: string, before: Item[], after: Item[], found: StructureProblem[]): void {
  // Longest common subsequence: the before items that stay in order are kept, the rest are problems.
  const rows = before.length + 1;
  const cols = after.length + 1;
  const len = Array.from({ length: rows }, () => new Array<number>(cols).fill(0));
  for (let i = before.length - 1; i >= 0; i--) {
    for (let j = after.length - 1; j >= 0; j--) {
      len[i]![j] = before[i]!.text === after[j]!.text ? len[i + 1]![j + 1]! + 1 : Math.max(len[i + 1]![j]!, len[i]![j + 1]!);
    }
  }
  const lost: Item[] = [];
  const extra: Item[] = [];
  let i = 0;
  let j = 0;
  while (i < before.length && j < after.length) {
    if (before[i]!.text === after[j]!.text) {
      i++;
      j++;
    } else if (len[i + 1]![j]! >= len[i]![j + 1]!) lost.push(before[i++]!);
    else extra.push(after[j++]!);
  }
  while (i < before.length) lost.push(before[i++]!);
  while (j < after.length) extra.push(after[j++]!);
  lost.forEach((b, k) => {
    const a = extra[k];
    const line = a ? a.line : (after[after.length - 1]?.line ?? 1);
    found.push({ line, message: `${label} ${a ? "changed" : "missing"}: ${excerpt(b.text)}` });
  });
}

/** Problems in the rewrite's structure against the original; empty when it keeps every block. */
export function structureProblems(before: string, after: string): StructureProblem[] {
  const b = parts(before);
  const a = parts(after);
  const found: StructureProblem[] = [];
  if (b.front && (!a.front || a.front.text !== b.front.text)) {
    found.push({ line: 1, message: `front matter ${a.front ? "changed" : "missing"}` });
  }
  compareList("code block", b.code, a.code, found);
  compareList("table row", b.tables, a.tables, found);
  compareList("heading", b.headings, a.headings, found);
  return found;
}
