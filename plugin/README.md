# ai-slop-linter, Claude Code plugin

This folder is the Claude Code plugin of [ai-slop-linter](https://github.com/Bubblegunn/ai-slop-linter). It holds one skill and one hook, nothing else. The linter itself is the npm package `ai-slop-linter`; the rest of the repository (source, tests, benchmark evidence) is not part of the plugin.

Install:

```
/plugin marketplace add Bubblegunn/ai-slop-linter
/plugin install ai-slop-linter@ai-slop-linter
```

## What the plugin contains

- `skills/ai-slop-linter/SKILL.md` and its `references/` files: instructions that tell the agent to check prose (commit messages, pull request descriptions, README and docs) for AI-sounding phrases and em dashes, rewrite it, and confirm the rewrite kept every fact. The skill tells the agent to run `npx ai-slop-linter` in your project. That command downloads the package from npm the first time and then lints text locally. It does not send your text anywhere.
- `hooks/hooks.json` and `hooks/rewrite-prompt.sh`: a `UserPromptSubmit` hook. It reads your prompt on standard input, and when the prompt asks to rewrite, polish, proofread or humanize prose, it prints one line of context that points the agent at the skill. It uses only `sh`, `sed`, `tr` and `grep`. It makes no network call, writes no file, never blocks a prompt and always exits 0.

The plugin changes no permission setting and installs no dependency.

## Licence

MIT, see `LICENSE`.
