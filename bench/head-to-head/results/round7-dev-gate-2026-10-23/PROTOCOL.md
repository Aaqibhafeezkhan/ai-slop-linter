# Protocol

Frozen in `docs/HEAD-TO-HEAD.md`: "Round 7 design (frozen before code, 2026-10-23, owner decision)" and its subsection "Development gate for round 7", commit `0f24783`, before any round 7 product code (`ed304c0`) and before any gate run. The best-rival analysis `docs/BEST-RIVAL-r7.md` (commit `f06fe3b`) comes before the design.

Commit order (check with `git log --format='%h %s' 834a1dd..HEAD`): `f06fe3b` best-rival analysis, `0f24783` design and gate rule, `ed304c0` product code E1 to E6 (iteration 1 ran on it), `0668fb4` fix for the unit loss found in iteration 1 (iteration 2 ran on it).

Gate: `ours` x 3 runs on the seen round 5 set ho1 to ho5, frozen scorer `score.mjs`, same sandbox and Agent SDK path as round 5 and round 6, compared with the recorded round 5 blader-inv means. Pass: strictly above blader-inv on every task, or both at 5.00. At most 3 iterations. Result: iteration 1 failed (ho2 run 3 lost the unit of a number), iteration 2 passed (15 of 15 cells at 5).

This folder is a development gate, not a benchmark. The held-out set g (local branch `heldout-2026-10-g`, never pushed) was not measured: see the round 7 report and `docs/HEAD-TO-HEAD.md`, "Results, round 7 development gate".
