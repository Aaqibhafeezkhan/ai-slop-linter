# Protocol

The frozen protocol is the section "Round 5 measurement protocol (frozen 2026-10-22, owner decision)" and its "amendment A" in `docs/HEAD-TO-HEAD.md`, with the design in "Round 5 diagnosis and design (frozen before code, 2026-10-22, owner decision)".

Commit order on branch `plugin-leadership` (check with `git log --format='%h %s'`):

1. `b25fe31` design frozen, before code.
2. `7cba348` product code (R1 to R5).
3. `5eb1a61` measurement protocol and runner frozen, before any measurement run.
4. the commit titled "amend the round 5 protocol to restore all 11 arms and 3 runs", before cells beyond the first 15.
5. the commit that adds this folder.

Held-out set. Written by a fresh Sonnet agent (`claude -p`, alias `sonnet`, budget cap 0.8 USD) in an empty working directory, given only `tasks/WRITER-BRIEF.md` (the one-line user problem from the README, the task template, the scorer format) and `score.mjs`. It read no repository file and saw no code, no research report and no earlier held-out set; it was not told any loss class. It reported id, language, type and word count only. The controller did not read the task text before the runs. The tasks were on the local branch `heldout-2026-10-e` (commit `3904e45`, never pushed) and are published here, in `tasks/`, because they are no longer held-out.
