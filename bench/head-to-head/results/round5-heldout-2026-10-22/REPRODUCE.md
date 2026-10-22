# Reproduce

Needs: this repository at the commit named in `SUMMARY.md`, Node 20 or newer, Python 3, the Claude Code CLI 2.1.308 and an Anthropic API key with `claude-sonnet-5-5` access. Expected cost of all 165 cells: about 11.3 USD (`runs/*/*/*/cost.json` has every cell's `total_cost_usd`); time about 60 to 90 minutes at parallelism 3.

1. Recompute the tables only (no network, no model): `python3 score.py .` run inside this folder prints `SUMMARY.md`; compare with `python3 score.py . | diff - SUMMARY.md`.
2. Rebuild the competitor directories: `bash bench/head-to-head/run/setup-competitors.sh` then `bash bench/head-to-head/run/setup-round4.sh` (pinned commits in `bench/head-to-head/run/competitors.lock`; needs the network once).
3. Rerun the cells: put an `claude` on PATH that works with your key, copy `tasks/` to a directory, then
   `bash bench/head-to-head/heldout/run-heldout.sh <tasks dir> <empty out dir outside the repo> <commit> ours,blader,blader-inv,everwrite,everwrite-inv,unslop,unslop-inv,avoid-ai-writing,slopless,slop-cop,base 3 3`
   This builds the harness, runs the cells in the write sandbox and writes `<out>/cells.jsonl` (the scorer output per cell).
4. Rebuild this folder from the run: `python3 bench/head-to-head/heldout/make-evidence.py <out> <tasks dir> <evidence dir> meta.json`, then `python3 score.py <evidence dir>`.

What will differ on a rerun: model variance. No F6 (independent re-run) was done for this round, so the size of the variance is not measured here. In the deep round, the same arms on seen tasks differed by up to 1 point per task between two runs of one arm (ho3 base 4 and 5), so single-cell differences of one point are within the noise seen.
