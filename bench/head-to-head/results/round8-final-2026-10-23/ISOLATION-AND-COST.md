# Isolation check and cost per phase (from the wrapper ledger)

Source: the subscription wrapper's ledger (~/claude-kredi-runs/sub-shim/ledger.tsv) records the working directory and the CLI's list-price cost of every call. A session loads project memory (CLAUDE.md) from its working directory and the parents of it, so a cell below /Users/efe would have loaded the owner's memory file. The scratchpad directory is shared with other controllers of the same owner session; only the directory prefixes of this repository's phases are counted here.

Calls of this repository's phases: 1946. Of those, calls whose working directory is below /Users/efe: 0. Calls anywhere in the ledger with a working directory below /Users/efe that names this repository: 0. Every run cell ran in <scratchpad>/final-public/<cell>, <scratchpad>/final-g/<cell>, <scratchpad>/gate-out/<cell> or <scratchpad>/r8s-f9-*/<cell>, every grader call in <scratchpad>/gr-part-N/grader-work/cwd or <scratchpad>/f6/grader/grader-work/cwd, all under /private/tmp/claude-501/. No CLAUDE.md exists on that path. The session directories of the wrapper's isolated HOME (~/claude-kredi-runs/sub-shim/home/.claude/projects) are named after the same working directories and list no entry below /Users/efe for these phases.

| phase | calls | list-price cost, US dollars |
|---|---|---|
| probe (one base cell) | 1 | 0.03 |
| development gate (72 cells) | 72 | 5.94 |
| final measurement, public set: run cells (incl. 236 attempts stopped by the session limit) | 632 | 45.28 |
| final measurement, held-out g: run cells (incl. 160 attempts stopped by the session limit) | 358 | 21.81 |
| blind grading, 5 votes per cell | 495 | 0.00 |
| F6-runs re-runs | 60 | 6.56 |
| F6-grader re-grading | 220 | 0.00 |
| F9 Haiku public | 36 | 0.28 |
| F9 Opus public | 36 | 7.54 |
| F9 Haiku g | 18 | 0.15 |
| F9 Opus g | 18 | 3.65 |
| **total** | 1946 | 91.25 |

The subscription is what is charged; the dollar figures are the CLI's list-price estimates (grader calls print plain text, so their cost is not recorded: 0.00). Agent-tool subagents (research, implementers, reviewers, the development-task author) and the controller session itself are not in this ledger. Failed attempts (usage limit, 429) cost nothing and are kept as .failed.jsonl in the run directories until their re-run; they were never scored or graded.
