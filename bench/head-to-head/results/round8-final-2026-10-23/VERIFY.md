# Verify round 8 (written for another LLM or a human with a shell)

1. Order of events: `git log --oneline` on `plugin-leadership`: the protocol `docs/FINAL-R8.md` (commit d767c07) comes before the first cell of this measurement; the tooling commits after it touch only `bench/` and documents. Check that the product did not move: `git diff a498189eb8ba HEAD --stat -- src skills hooks scripts` prints nothing (package.json differs only in its `test` script list).
2. Scores recompute: `node bench/head-to-head/run/score.mjs <run out>` reproduces `round-8/scores.json` (done: identical); `node bench/head-to-head/run/final-stats.mjs round-8 held-out-g/grades/cells.jsonl` reproduces `STATS.md` (diff is empty except a trailing blank line).
3. No reused cells: every cell has a `cell-meta/<cell>.meta.json` (commit, tree, prompt, plugin hash, model, date) of 2026-10-23; failed attempts (usage limit) were never scored.
4. Grader reliability: `round-8/grading/votes.json` (99 blind cells, five votes each, 0 err cells, 0 invalid votes, 92 unanimous); the grader prompt is `round-8/grading/*.txt` (reason first, verdict second).
5. Isolation: `ISOLATION-AND-COST.md` (no call below /Users/efe).
6. Redaction: `grep -r '/Users/' .` finds nothing except that file's own sentence; no e-mail address except invented `example.com` fixtures; no key.
7. Held-out writer: a Sonnet agent that saw no code of this repository; the controller never read a task of set g before this measurement (`held-out-g/tasks/` is published now).
