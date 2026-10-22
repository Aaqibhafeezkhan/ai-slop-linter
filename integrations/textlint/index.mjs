// textlint rule: runs the same rules as the CLI over a document and reports each finding at
// its position, with the safe fixes offered to `textlint --fix`. Node built-ins and this
// package only; textlint hands in everything else through `context`.
//
//   // .textlintrc.json (with the textlint-rule-ai-slop package installed)
//   { "rules": { "ai-slop": true } }
//
//   // options: { "ignore": ["filler"], "only": [], "language": "en" }
import { lintText } from "../../dist/src/index.js";

/** Offset of the first character of each line, counting "\n" so "\r\n" files keep their offsets. */
function lineStarts(text) {
  const starts = [0];
  for (let i = 0; i < text.length; i++) if (text[i] === "\n") starts.push(i + 1);
  return starts;
}

function reporter(context, options = {}) {
  const { Syntax, RuleError, report, getSource, fixer } = context;
  const { ignore = [], only = [], language } = options ?? {};
  return {
    [Syntax.Document](node) {
      const text = getSource(node);
      const lint = { ignore, only, ...(language ? { language } : {}) };
      const starts = lineStarts(text);
      for (const f of lintText("document", text, lint).findings) {
        const index = starts[f.line - 1] + f.column - 1;
        const message = `${f.message} (${f.rule})`;
        report(
          node,
          new RuleError(message, {
            index,
            ...(f.fix ? { fix: fixer.replaceTextRange([f.fix.start, f.fix.end], f.fix.replacement) } : {}),
          }),
        );
      }
    },
  };
}

// textlint only runs `--fix` for a rule that exports a `fixer`; a bare function is lint-only.
export default { linter: reporter, fixer: reporter };
