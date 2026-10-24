# Privacy

Last reviewed: 2026-10-24, for ai-slop-linter 0.2.0.

ai-slop-linter does not collect, store or send your data to its author or to any third party. It has no account, no telemetry and no analytics.

## The Claude Code plugin

- The plugin has one hook (`UserPromptSubmit`). It is a POSIX shell script that reads your prompt on standard input, matches it against word lists on your machine, and prints one line of instructions or nothing. It makes no network call, writes no file and never blocks a prompt.
- The plugin has one skill, which is text. It tells the agent to run `npx ai-slop-linter` on prose before and after a rewrite. The plugin itself runs nothing else.

## The command line tool

- It reads the files, standard input, git commit messages (through `git`) or pull request descriptions (through the `gh` CLI, only with `--pr`) that you point it at, and checks them locally.
- It writes files only when you ask: `--fix` edits the file you named, and `--baseline` writes the baseline file you named.
- It sends no text anywhere. Linting happens in the local process.
- On the first clean interactive run it prints a one-time star hint and writes an empty marker file at `~/.config/ai-slop-linter/star-hint-shown` (or under `$XDG_CONFIG_HOME`). The file holds no data. Set `AI_SLOP_LINTER_NO_STAR_HINT=1` to turn the hint off.

## What does touch the network

- `npx ai-slop-linter` downloads the package from the npm registry the first time, under npm's own privacy terms. After that the linter runs offline.
- `gh pr view`, when you use `--pr`, talks to GitHub with your own `gh` login.

## Contact

Questions: https://github.com/Bubblegunn/ai-slop-linter/issues
