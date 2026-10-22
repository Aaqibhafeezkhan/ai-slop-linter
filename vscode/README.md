# AI slop linter for VS Code

Shows the tells that make writing read as machine-made, while you type, in Markdown, plain text and
commit message editors. It runs the same rules as the `ai-slop-linter` command line tool, locally, with no
network access. It lists tells and does not guess who wrote the text.

Each finding is underlined with its rule id. Where a fix cannot change the meaning (a dash, a filler
phrase), the quick fix menu offers it.

## Settings

| setting | default | meaning |
|---|---|---|
| `aiSlopLinter.enable` | `true` | turn the underlines off without uninstalling |
| `aiSlopLinter.ignore` | `[]` | rule ids to skip, for example `["filler"]` |
| `aiSlopLinter.only` | `[]` | run only these rule ids |
| `aiSlopLinter.language` | empty | language of your prose; rules whose evidence is English stand down for any other |

## Install from a file

Until the extension is on the Marketplace, build the `.vsix` yourself: run `npm install` and then
`npm run package` inside `vscode/`. That writes `ai-slop-linter.vsix` into the same directory. Open the
Extensions view, choose the three-dot menu, then "Install from VSIX", and pick that file.

## Tasks

The extension also contributes the problem matcher `$ai-slop-linter` for a task that runs the command
line tool; the repository's `.vscode/tasks.json` shows one.
