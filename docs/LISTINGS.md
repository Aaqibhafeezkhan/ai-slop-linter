# Listing text for each place this project is published

[Back to the README](../README.md)

The text to use in each store's own fields. `test/listings.test.mjs` checks that the metadata files in this repository carry the same strings. Submitting a listing is a separate step that the owner takes.

Every value on a line that starts with a label is written between backticks. Edit the value and the metadata file together, or the test fails.

## npm: ai-slop-linter

- Title: `ai-slop-linter`
- Short description: `ai-slop-linter is a linter that flags AI-sounding phrases and em dashes in commit messages, pull request descriptions and Markdown docs, and runs in CI.`
- Keywords: `ai-slop, ai-writing, ai-generated-text, linter, prose-linter, humanizer, em-dash, commit-messages, pull-requests, markdown, docs, github-action, pre-commit, commit-msg-hook, claude-code, agent-skills, cli, writing, style-guide, wikipedia-signs-of-ai-writing, commitlint, commitlintplugin, ai-slop-linter, lint-ai-writing, detect-ai-writing, em-dash-linter, ai-pr-description, stop-ai-slop, mcp, mcp-server`

## npm: textlint-rule-ai-slop

- Title: `textlint-rule-ai-slop`
- Short description: `textlint rule that flags AI-sounding phrases and em dashes in Markdown and text, with line numbers and safe fixes. Runs the ai-slop-linter rules.`
- Keywords: `textlint, textlintrule, ai-slop, ai-writing, lint-ai-writing, detect-ai-writing, em-dash, markdown, prose-linter, linter`

## GitHub Marketplace listing for the Action

- Name: `ai-slop-linter`
- Short description: `Flags AI-sounding phrases and em dashes in pull request text and changed Markdown, with line annotations and one comment.`
- Suggested primary category: Code quality. The category list is chosen in the publish form, so check it there.

The short description is at most 125 characters, which is the Marketplace limit for an Action.

## VS Code Marketplace listing

- Display name: `AI Slop Linter`
- Short description: `Flags AI-sounding phrases and em dashes in Markdown, plain text and commit messages while you type, with safe quick fixes.`
- Category: `Linters`
- Keywords: `ai-slop, ai-writing, em-dash, linter, markdown, prose, commit-messages`
- Publisher id in `vscode/package.json`: `bubblegunn`. This is a guess until the owner creates the publisher account.

## skills.sh

- Name: `ai-slop-linter`
- Description: `` Use whenever you write, edit, rewrite, clean up, polish, proofread or "make ready to ship" any prose a person will read, in any language (commit message, PR description, README, docs, release notes, launch notes, article). Also use for requests in another language such as réécris, reescribe, schreib um or yeniden yaz. Run `npx ai-slop-linter` on it and fix every finding. Also use when asked whether text "sounds like AI", to humanize it, to make it sound natural or more human, to remove em dashes, or to set up a CI check on prose or docs. ``
- Install line: `npx skills add Bubblegunn/ai-slop-linter`

The description is the `description` field of `skills/ai-slop-linter/SKILL.md`, unchanged.

## Claude Code plugin directory

- Name: `ai-slop-linter`
- Short description: `Lints prose for AI-sounding phrases and em dashes. Makes the agent check its commit messages, pull request descriptions and docs before it ships them.`
- Category: `writing`
- Keywords: `ai-slop, humanizer, writing, linter, skills, em-dash, commit-messages`

## MCP registries

- Name: `ai-slop-linter`
- Short description: `MCP server that lints text for AI-sounding phrases and em dashes and returns findings as JSON with line, column and the range of each safe fix.`
- Tools: `check_slop`, `check_slop_file`, `explain_rule`
- Run command: `npx --yes ai-slop-linter --mcp`
- Keywords: `mcp, mcp-server, linter, ai-writing, em-dash, commit-messages, markdown`

The MCP server is in the unreleased 0.2.0, so no registry entry can be made before that release is on npm. The owner reads each registry's current submission rules on the day of submission, because the required fields differ and change.

## Codex and Cursor plugin directories

Not applicable. This repository has no Codex or Cursor plugin manifest.
