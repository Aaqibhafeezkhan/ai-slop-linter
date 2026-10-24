# Set up a prose check in CI

Read this when asked to check prose or docs in CI. `SKILL.md` points here; the rewrite steps are there.

Lint a glob that covers the whole repository, never a list of files: a list misses the page someone adds next month. After `npm install --save-dev ai-slop-linter@latest`, put the command in the `lint:prose` script (`--compare`, per-file language detection and the French rule need ai-slop-linter 0.2.0 or later):

```json
"scripts": { "lint:prose": "ai-slop-linter \"**/*.md\"" }
```

The quotes stop the shell from expanding the glob, so the CLI expands it, subdirectories included, and skips CHANGELOG files and dependency folders. `**/*.md` reaches the README, the other top-level files and any folder added later. A narrower glob such as `"docs/**/*.md"` leaves the README and every folder outside `docs/` unchecked, and a bad sentence there passes with exit 0. A directory works too (`ai-slop-linter docs/`) but has the same blind spot for everything outside it. In `.slop.json`, `maxScore` sets the limit a file's score may not exceed, and `overrides` change rules for matching paths. There is no exclude option, so narrow the glob instead.

Two files need a decision, because a legitimate sentence in them fails the check:

- A CHANGELOG is skipped unless you name it (`ai-slop-linter "**/*.md" CHANGELOG.md`). Its entries quote commit titles that may hold a dash, and en dashes in version ranges are fine. If you name it, mark each quoted line with `<!-- slop-ignore-next-line dash -->`.
- A README or guide that quotes a stock phrase on purpose (a blockquote showing what to delete) fails with that rule's id. If the file must not change, silence only that rule for that path in `.slop.json`; every other rule still runs on the file, and a new dash or tell in it still exits 1. An override's `ignore` replaces the top-level `ignore` for that path, it does not add to it, so copy the repository's top-level ignores into the list. Take the rule id from the output:

```json
{ "overrides": [{ "files": ["README.md"], "ignore": ["chatbot"] }] }
```

Do not pass `--language` unless every file in the repository is written in one language. The CLI works out the language of each file.

Exit 0 means clean, 1 means an error-severity finding or a score above the limit, 2 means a usage error, including a glob that matches no file.

For pull requests, the Action annotates the changed lines (`comment: "false"` turns off the comment):

```yaml
- uses: Bubblegunn/ai-slop-linter@v0
  with:
    files: "docs/**/*.md"
```

To test the setup, add a file with an em dash (U+2014) and run `npm run lint:prose`: expect exit 1. Delete the file and run it again: expect exit 0.
