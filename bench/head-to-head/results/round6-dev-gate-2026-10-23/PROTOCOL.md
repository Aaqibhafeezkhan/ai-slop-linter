# Protocol

Frozen in `docs/HEAD-TO-HEAD.md`: "Round 6 design (frozen before code, 2026-10-22, owner decision)", its addendum, and the subsection "Development gate", all in commit `427fe21`, before any round 6 product code (`789d0cc`) and before any gate run.

Commit order (check with `git log --format='%h %s' 7226881..HEAD`): `791b93e` best-rival analysis, `427fe21` design, research and gate rule, `789d0cc` product code D1 to D7, `0614b17` iteration 1 fix, `26b16f4` iteration 2 fix. Iteration runs: iteration 1 on `789d0cc`, iteration 2 on `0614b17`, iteration 3 on `26b16f4`.

Gate: `ours` x 3 runs on the seen round 5 set ho1 to ho5, frozen scorer `score.mjs`, same sandbox and Agent SDK path as round 5, compared with the recorded round 5 blader-inv means. Pass: strictly above blader-inv on every task, or both at 5.00. At most 3 iterations; each is recorded here. Result: the gate did not pass in 3 iterations, so the new held-out set f was NOT measured and the public set was NOT run.

Rule B-prime (owner decision 2026-10-22) is written into the design addendum for the later measurement of set f and the public set; it was not applied because neither was measured. The development gate uses Rule B.
