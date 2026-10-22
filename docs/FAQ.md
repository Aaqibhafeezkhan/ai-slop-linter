# Frequently asked questions

[Back to the README](../README.md)

The answers are short. The README and the pages it links to have the detail.

## How do I stop a coding agent from putting em dashes and stock phrases in commit messages and pull request descriptions?

Check the text before it ships, and make the check run without anyone remembering it. Four options, smallest first:

- Lint the last commit message with `npx ai-slop-linter --commit`.
- Install the `commit-msg` hook, which refuses a message that has an error-severity tell: `curl -fsSL https://raw.githubusercontent.com/Bubblegunn/ai-slop-linter/main/scripts/install-hook.sh | sh`.
- Add the GitHub Action. It lints the pull request title, its description and every changed Markdown file, and keeps one comment on the pull request. Setup is in [In a repository](../README.md#in-a-repository).
- Install the agent skill with `npx skills add Bubblegunn/ai-slop-linter`, or the MCP server with `npx --yes ai-slop-linter --mcp`, so the agent lints its own text before it hands it over. The MCP server is in the unreleased 0.2.0. <!-- release-status -->

## How do I lint commit messages and pull request descriptions for AI-sounding phrases?

`npx ai-slop-linter --commit` reads the last commit message. `npx ai-slop-linter --commit-msg <file>` reads the message being written, which is what a `commit-msg` hook receives. `npx ai-slop-linter --pr 42` reads the body of pull request 42 through the `gh` command. These three paths also run five rules that only a commit message or a pull request description gets, such as a hedge ("this should fix") or a frame that adds nothing ("as part of this change").

## Can I run it in CI?

Yes. It exits 1 when a file has an error-severity finding or a score above `--max-score` (default 10), and 0 otherwise. The Action is `uses: Bubblegunn/ai-slop-linter@v0`. `--format sarif` writes SARIF for GitHub code scanning; see [SARIF](SARIF.md).

## Does it detect AI-written text?

No. It lists phrases and characters that readers have learned to associate with machine writing, and it never prints a probability. A person who writes `delve` gets the same finding a model does. Statistical detectors have misclassified people who write English as a second language ([Liang et al., Patterns, 2023](https://doi.org/10.1016/j.patter.2023.100779)). A named phrase on a numbered line can be disagreed with, and a score cannot.

## Does it send my text anywhere or call a model?

Linting reads the files you name and calls no model. `--pr` runs the `gh` command to read a pull request body. The browser playground runs the same engine in your tab and makes no request after it loads; two tests read the page source for anything that could send text out.

## Humans use em dashes. Why does it flag them?

It flags a character, not an author. The `dash` rule has severity `error`, so one em dash fails a run. That is the current default, and whether it should stay has not been decided. [bench/DASH-DEFAULT.md](../bench/DASH-DEFAULT.md) measures the alternatives on the corpus and ends with "Decision: pending". Turn the rule off with `--ignore dash`, or for part of a file with an ignore comment, described under [Configuration](../README.md#configuration).

## How many false alarms does it raise?

The committed corpus answers that for the rules as they stand. [bench/PRECISION.md](../bench/PRECISION.md) gives the rate of each rule on five texts written before 2021 and on model output, and lists every finding on the human texts. The corpus is small. [Measurement](MEASUREMENT.md) explains the method and what it cannot show.

## Does it work for languages other than English?

Partly. The `dash` and `title-case-heading` rules stand down for a file whose language is not English, because the em dash is ordinary punctuation in several languages and German capitalises every noun. The language comes from `"language"` in `.slop.json` or `--language`, from a `lang:` key in the front matter, or from the prose, which is detected for French, Spanish, German, Italian, Portuguese and Dutch. The vocabulary rules are English word lists and find nothing in other languages. A French pack ships one provisional rule; Spanish and German ship none. [Languages](LANGUAGES.md) has the measured rates and the limits, and [the candidate patterns](../bench/packs/CANDIDATES.md) lists what was tried.

## Does it flag French dialogue?

No, when the dialogue is written the way French writes it. A line that starts a paragraph with a dash followed by a space or a letter is dialogue, and the whole line is exempt from `dash`, including the dashes that set off a speaker tag. Text inside guillemets (`« »`) is exempt too. Two cases still get a finding: a dash that opens a continuation line of a paragraph that was hard-wrapped, and a short quoted line inside an English paragraph of fewer than 12 tokens. [Languages](LANGUAGES.md#the-limit) explains the limit and how to clear it.

## How do I check a rewrite did not change facts?

Run `npx ai-slop-linter --compare before.md after.md`. It lists each number, version, date, link, quotation, code span and name that the rewrite lost or added, and exits 1 when there is one. It also reports first-person words (`our`, `we`, `ich`, `nous`) that the rewrite added or dropped and claim words (`always`, `guaranteed`, `because`) that it added, so an "In benchmarks" that becomes "In our benchmarks" is caught; the flagged words are those that passed a measurement, listed in `bench/COMPARE-WORDS.md`. Keep a copy of the original before you edit it. The comparison reads the facts, not the wording, so it cannot tell you whether the rewrite is good; it only shows what changed in the facts. The skill does this after every rewrite.

## Can an AI agent use it directly?

Two ways. The agent skill tells an agent to lint its own commit messages, pull request descriptions and docs before it finishes: `npx skills add Bubblegunn/ai-slop-linter`. The MCP server gives an agent three tools, `check_slop`, `check_slop_file` and `explain_rule`, that return findings as JSON with the line, the column and the exact range of each safe fix. [mcp.md](mcp.md) has setup commands for Claude Code and Codex, and says that they were not run against those clients. The MCP server is in the unreleased 0.2.0. <!-- release-status -->

## Does it work with textlint, VS Code, commitlint and pre-commit?

- commitlint: `extends: ["@commitlint/config-conventional", "ai-slop-linter/commitlint/config"]`.
- pre-commit: the hooks `ai-slop-markdown` and `ai-slop-commit-msg`. Pin the tag that ends in `-pre-commit`.
- textlint: the package `textlint-rule-ai-slop` is in this repository and is not yet on npm. <!-- release-status -->
- VS Code: an extension in `vscode/` that builds to a `.vsix`. It is not on the Marketplace yet. <!-- release-status -->

## How do I turn off one rule, one line or one file?

Use `--ignore <rule>` on the command line, or `"ignore": ["rule"]` in `.slop.json`, with `overrides` for particular paths. `<!-- slop-ignore-next-line rule -->` covers one line, and `<!-- slop-ignore rule -->` covers the rest of the file. `npx ai-slop-linter --explain <rule>` says when a rule should be switched off.

## Can it fix what it finds?

`--fix` applies the safe fixes only: dashes become commas or full stops, curly quotes become straight quotes, and filler phrases become their plain form. A finding that needs a rewritten sentence stays a finding.
