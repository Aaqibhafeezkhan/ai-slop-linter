# textlint-rule-ai-slop

A [textlint](https://textlint.github.io/) rule that flags the tells that make writing read as machine-made: em dashes, stock vocabulary, stock contrasts and chatbot residue. It runs the rules of [ai-slop-linter](https://github.com/Bubblegunn/ai-slop-linter) and reports each finding at its position. Where a fix cannot change the meaning, `textlint --fix` applies it.

```
npm install --save-dev textlint textlint-rule-ai-slop
```

`.textlintrc.json`:

```json
{
  "rules": {
    "ai-slop": true
  }
}
```

Options go in place of `true`:

```json
{
  "rules": {
    "ai-slop": { "ignore": ["filler"], "language": "en" }
  }
}
```

| option | meaning |
|---|---|
| `ignore` | rule ids to skip |
| `only` | run only these rule ids |
| `language` | the language your prose is written in; rules whose evidence is English stand down for any other |

The rule lists tells and does not say who wrote the text. `npx ai-slop-linter --explain <rule>` explains one.
