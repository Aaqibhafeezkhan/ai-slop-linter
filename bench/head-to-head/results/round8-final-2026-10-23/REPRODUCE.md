# Reproduce round 8

Needs: Claude Code 2.1.308 logged in (subscription or API key; the wrapper below is only the owner's), Node 24, macOS (`sandbox-exec`) or Linux (`bwrap`), this repository at `plugin-leadership`.

1. Public set: `bash bench/head-to-head/run/prepare-code.sh <commit> <out>`, then with `H2H_OUT`, `H2H_CODE_DIR`, `H2H_COMPETITORS` and the `H2H_DIR_*` variables as in `bench/head-to-head/heldout/run-heldout.sh`: `bash bench/head-to-head/run/run-all.sh --iterations 3 --out <out> --arms ours,blader,blader-inv,unslop,unslop-inv,everwrite,everwrite-inv,avoid-ai-writing,slopless,slop-cop,base --parallel 3`; then `node bench/head-to-head/run/score.mjs <out>`, `node bench/head-to-head/run/grade-prep.mjs <out>`, `H2H_VOTES=5 bash bench/head-to-head/run/grade-run.sh <out>`, `node bench/head-to-head/run/grade-collect.mjs <out>`, `node bench/head-to-head/run/summarize.mjs <out>`.
2. Held-out g: `git archive heldout-2026-10-g bench/head-to-head/heldout-g | tar -x -C <dir>`, then `bash bench/head-to-head/heldout/run-heldout.sh <dir>/bench/head-to-head/heldout-g <out> <commit> <the 11 arms> 3 2`.
3. Statistics: `node bench/head-to-head/run/final-stats.mjs <public out> <held-out out>/cells.jsonl`. The committed `STATS.md` is this output.
4. F6: `node bench/head-to-head/run/f6.mjs sample <cells.json>`; re-run each sampled (task, arm) once; compare with `f6.mjs runs` and `f6.mjs grader`. Files in `f6/`.
5. F9: the same commands with `H2H_MODEL=claude-haiku-5-5` or `claude-opus-5-5`, `--iterations 1`, arms ours, the best other arm of the set (public blader-inv, held-out g unslop) and base. Files in `f9/`.

Expected cost: about 91 US dollars at list price for everything in `ISOLATION-AND-COST.md` (subscription-charged), about 9 hours of wall time with the parallelism above, 1,946 wrapper calls plus about 1,100 grader calls that print no cost. A re-run differs by model variance: F6-runs found 38 of 40 public and 19 of 20 held-out re-runs inside the min-max of the three original runs.
