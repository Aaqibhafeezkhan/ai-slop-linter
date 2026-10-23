# Final measurement, round 8: frozen protocol (2026-10-23, before the first cell)

Written and pushed before any cell of this measurement runs. Not changed after a result exists. Decision basis: the development gate of `docs/DEV-GATE-r8.md` showed a clear lead by its frozen rule (ours 29.00 of 30, blader-inv 26.00, interval of the difference [2.33, 3.67]). Spec section 2b (owner decisions of 2026-10-23) applies; this document is how.

## Claim

Claim I1, Sonnet only: in each set (public, held-out g), the 95% bootstrap interval of (total of ours minus total of the best other arm) lies entirely above zero. "Best other arm" is the other arm with the highest observed total in that set (natural and invoked arms count separately). Haiku and Opus (F9) are reported as totals and are not part of the claim. The per-task table with Rules A, B and B-prime is published in full, losses included, and does not decide the claim. A set that fails I1 is published the same way and the claim is not made for it.

## What runs

- Product: the code of commit `a498189eb8ba` (`src`, `skills`, `hooks`, `scripts`, `package.json`). Commits made after the first cell touch only `bench/` tooling for grading, F6 and evidence, and documents; this is checked at the end with `git diff a498189eb8ba HEAD --stat -- src skills hooks scripts package.json`, which must print nothing.
- Sets. Public: the 12 active tasks of `bench/head-to-head/tasks.json` (h1, h2, h3, h9, h10, h11, h13 to h18), unchanged. Held-out g: 6 tasks (en, es, pl, id, pt clean, nl) written by an agent that saw no code of this repository, on branch `heldout-2026-10-g`; the controller extracts the branch with `git archive` and runs it by script and never reads a task, a fixture or a check file. It is held out until this measurement and public afterwards.
- Arms (11, as in round 5): ours, blader, blader-inv, unslop, unslop-inv, everwrite, everwrite-inv, avoid-ai-writing, slopless, slop-cop, base. Pinned sources in `bench/head-to-head/run/competitors.lock`; rival code runs only from the `git archive` copies in `bench/head-to-head/competitors`; Vaara is never run; a rival that cannot run is listed as not run, with the reason.
- Runs: 3 per cell. Public 12 tasks x 11 arms x 3 = 396 cells. Held-out g 6 x 11 x 3 = 198 cells. Every cell is run again on the path below: no cell of an earlier round, and none of the development gate, is reused.
- Model `claude-sonnet-5-5`. Path: Claude Code CLI on the owner's subscription login through `~/claude-kredi-runs/sub-shim/claude` first on PATH (isolated HOME, API keys unset; init event `apiKeySource: none`), the write sandbox and scrubbed environment of `run/sandbox.sh`, `--setting-sources project`, the config guard around every task. Parallelism 3. A usage limit, session limit or authentication error stops the round and is reported; a failed cell is never graded; it is re-run by the same command.
- Commands: public `bash bench/head-to-head/run/run-all.sh --iterations 3 --out <out> --arms <11 arms> --parallel 3` with the environment of `heldout/run-heldout.sh` (competitor directories, `H2H_CODE_DIR` from `prepare-code.sh`), then `run/score.mjs` and `run/grade-prep.mjs`; held-out g `bash bench/head-to-head/heldout/run-heldout.sh <extracted g dir> <out> <commit> <11 arms> 3 3`.

## Scoring

- Script criteria: `run/score.mjs` and `checks/check.mjs` for the public set; `heldout/score.mjs` for set g. Scripts stay the judge wherever a criterion is script-checked. Only outcome criteria count (labels in `labels.json`).
- Blind criterion C5 of h1, h2, h3 (99 cells): graded by fresh Sonnet sessions that see only the task prompt, the original text, the scrubbed text to grade and the criterion, with anonymous shuffled ids (seed 20261021). Five grader calls per cell. Each grader writes its reason first and its verdict second: the last line is `{"reason": "...", "pass": true|false}`. The verdict of a cell is the majority of the valid votes. A vote is valid when its last JSON line has a boolean `pass`; an invalid vote is asked again up to 2 times. Fewer than three valid votes: the cell is `err`, is listed, is re-graded once with a new shuffle, and if it is still `err` its C5 counts as not passed for that cell (the same rule for every arm). Votes 1 to 3 are taken in the seeded order, votes 4 and 5 in the reverse order. Grader reliability (share of cells where all five agree, invalid votes, re-asks, err cells) is reported.
- Totals: per arm, per set, the sum over tasks of the mean over the 3 runs. Public maximum 60, held-out maximum 30.
- Statistics: for each set the 95% bootstrap interval (10,000 replicates, seed 20261023, runs of each (task, arm) cell resampled independently) of each arm's total and of ours minus the best other arm; Rule A (ours lost points at most 80 percent of the best other arm's lost points), Rule B (every task: ours strictly above every other arm, or at the ceiling together with the best arm) and Rule B-prime (the same except on at most one task where our deficit to the best other arm is at most 0.34), side by side; mean, min, max and every run per cell; cost from `total_cost_usd` per cell, arm, round.

## F6 (two parts, owner decision of 2026-10-23)

Sample: 10 percent of the cells of each set, chosen with seed 20261023, stratified so that every arm and every task appears at least once where the number allows.
- F6-grader: the original answers of the sampled cells are graded again by fresh grader sessions, all arms of a task and run graded together as the first time. Script-scored criteria are recomputed by their script. Pass if no cell differs by more than 1 point and criterion agreement is at least 90 percent.
- F6-runs: the sampled cells are run once more on a fresh fixture and scored; reported descriptively as the number of re-runs whose score lies within the min-max of the cell's three original runs. Not pass or fail.

## F9 (descriptive)

Haiku (`claude-haiku-5-5`) and Opus (`claude-opus-5-5`), one run per task, arms ours, the best other arm of that set by the Sonnet totals, and base, on both sets: 18 tasks x 3 arms x 2 models = 108 cells. Totals are reported next to the Sonnet totals; they gate nothing.

## Calls (estimate)

Run cells 594, blind grading 99 cells x 5 votes = 495 plus re-asks, F6 about 60 re-runs plus about 50 re-grading calls, F9 108: about 1,310 `claude -p` calls on the subscription.

## Evidence

`bench/head-to-head/results/round8-final-2026-10-23/` with the 11 items of `EVIDENCE-SPEC.md` and its statistics and cost section (redacted transcripts, grader prompts, every vote, `score` scripts that recompute `SUMMARY.md` byte for byte, `REPRODUCE.md`, `VERIFY.md`, `SHA256SUMS`). The development gate is a separate section. Held-out g is published with its results after the measurement.

## Known differences and disclosures

The SDK path of earlier rounds and this CLI path are not identical (user skills of the machine are not visible in either; the desktop Artifact tool is absent); numbers are comparable only inside this measurement. The development set and gate were run on the same path before this measurement and are not part of any table here. Round 5 and round 7 numbers are not re-scored under any rule of this document.
