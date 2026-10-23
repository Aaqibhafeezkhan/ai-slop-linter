# Development gate, round 8 (frozen before any run, 2026-10-23)

Purpose: decide whether the round 8 product is ahead enough of the best rival to justify one final measurement. This is a development decision. It is not a benchmark result, enters no score table and supports no claim.

## What is run

- Product: the code of commit `a498189eb8ba` (src, skills, hooks, scripts; all later commits touch only bench files and this document). The run uses the commit that carries this file, because `prepare-code.sh` refuses a working tree that differs from the commit in `bench/head-to-head`.
- Development set: `bench/head-to-head/devsets/r8/` (hoR1 to hoR6: Polish, Indonesian, Dutch, Turkish and Spanish texts with tells, one clean Portuguese text). Written before this protocol by an author that read no code of this repository, the scorer format given as text. Not the public `tasks.json` set and not any held-out set. Its fixtures were not read by the controller before the runs.
- Arms (4): `ours`, `blader`, `blader-inv`, `base` (no plugin). blader is the best other arm of rounds 5 and 7 (blader-inv 24.33 of 25 against ours 23.33); `blader-inv` is its documented invocation (`invocations.json`).
- Runs: 3 per cell, 6 tasks, so 72 cells. Model `claude-sonnet-5-5`.
- Path: Claude Code CLI on the owner's subscription login through `~/claude-kredi-runs/sub-shim/claude` first on PATH (the wrapper sets its own isolated HOME and unsets API keys); the Agent SDK shim is not on PATH. Each cell runs in the repository's write sandbox with `--setting-sources project` and the config guard of `run-all.sh` around every task. Parallelism 3. Rival code runs only from the `git archive` copies in `bench/head-to-head/competitors`; Vaara is never run.
- Command: `bash bench/head-to-head/heldout/run-heldout.sh bench/head-to-head/devsets/r8 <out dir outside the repo> <commit> ours,blader,blader-inv,base 3 3`.
- A cell that fails (usage limit, session limit, authentication, kill) is never scored: the round stops and is reported, or the cell is re-run by the same command (`run-all.sh` re-runs failed transcripts). A probe cell (one `base` cell on hoR6, run first in its own output directory) checks that the wrapper, the sandbox and the scorer work; it is not counted.

## Scoring

`heldout/score.mjs` as it stands (C1 facts kept, C2 tells absent, C3 protected text byte-identical, C4 nothing added, C5 structure; 5 points per cell). No change to the scorer, the criteria or the task files after the first cell.

## Decision rule (frozen)

Total of an arm = sum over the 6 tasks of the mean over its 3 runs (maximum 30). The best rival is the one of `blader`, `blader-inv` with the higher observed total. D = total(ours) minus total(best rival). Bootstrap: 10,000 replicates, seed 20261023, runs of each (task, arm) cell resampled with replacement independently; the interval is the 2.5th to 97.5th percentile of D (`bench/head-to-head/run/devgate-judge.mjs`, tested in `test/devgate-judge.test.mjs`).

Clear lead = lower bound of the interval above 0, and D at least 1.0, and no task where ours trails the best rival's task mean by more than 0.34, except at most one task where the deficit is at most 0.67. Anything else is no clear lead: no final measurement; the result goes back into research and development, and the failing criteria are read for general causes only. At most 2 further iterations of the product, each with its commit and numbers recorded below; the set stays the same, so a pass after changes is weaker evidence and is reported as such.

## Calls

72 `claude -p` calls for the gate (plus 1 probe). A rival-arm cell that has to be re-run adds 1 each. No grading calls: the scorer is a script.

## If the lead is clear: final measurement (outline, to be frozen as its own document before its first cell)

Spec section 2b. Public set (12 tasks) plus the unread held-out set g (6 tasks, run by script, content never read by the controller), every arm re-run on the subscription path with no reused cell (11 arms, 3 runs: 396 plus 198 calls), claim I1 by the 95% bootstrap interval of ours minus the best other arm's total in each set, Rules A, B and B-prime reported side by side. F6 in two parts: F6-grader (the sampled cells' original answers re-graded by fresh grader sessions, all arms of that task and run graded together as originally; pass if no cell differs by more than 1 point and criterion agreement is at least 90 percent) and F6-runs (the sampled cells re-run once on fresh fixtures, reported descriptively as the count whose score lies within the min-max of the cell's three runs; not pass or fail). F9: Haiku and Opus, 1 run per task, for ours, the best rival of the task and base. Evidence folder per `EVIDENCE-SPEC.md`.

## Results

Run 2026-10-23 on commit `a6418de5f15f` (protocol commit; product code `a498189eb8ba`), 72 cells, 0 failed, 0 re-runs, subscription login (init `apiKeySource: none`), parallelism 3. Evidence: `bench/head-to-head/results/round8-dev-gate-2026-10-23/` (`cells.jsonl` from the scorer, `judge.json`, `SUMMARY.md`).

| arm | hoR1 | hoR2 | hoR3 | hoR4 | hoR5 | hoR6 | total of 30 |
|---|---|---|---|---|---|---|---|
| ours | 4/4/4 | 5/5/5 | 5/5/5 | 5/5/5 | 5/5/5 | 5/5/5 | 29.00 |
| blader | 3/3/4 | 4/4/4 | 3/2/2 | 4/5/4 | 5/5/5 | 5/5/5 | 24.00 |
| blader-inv | 4/4/4 | 4/4/5 | 3/2/3 | 5/5/5 | 5/5/5 | 5/5/5 | 26.00 |
| base | 3/3/3 | 5/4/5 | 4/4/4 | 5/5/5 | 4/4/4 | 5/5/5 | 25.67 |

Best rival blader-inv. D = 3.00, 95% bootstrap interval [2.33, 3.67], no task where ours trails the best rival (hoR1 ties at 4.00). By the frozen rule this is a clear lead. What it does not show: the set is small (6 tasks, 3 runs), written by one author, shared with no other set, and the product was developed knowing only the languages of the new held-out set, not the dev tasks. It decides only that the final measurement may run.
