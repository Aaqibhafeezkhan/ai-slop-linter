# Reproduce

Needs: this repository at the commit of the iteration, Node 20+, Python 3, Claude Code CLI 2.1.308 and an Anthropic API key with `claude-sonnet-5-5` access. Cost of one iteration (15 cells): about 1.26 USD (`dev-gate/iter*/runs/*/ours/*/cost.json`).

1. Recompute the tables (no network, no model): `python3 score.py . | diff - SUMMARY.md` inside this folder.
2. Rerun an iteration: put a `claude` on PATH that works with your key, then `bash bench/head-to-head/heldout/run-heldout.sh <this folder>/tasks <empty out dir outside the repo> <commit> ours 3 3`; it writes `<out>/cells.jsonl`; rebuild with `python3 bench/head-to-head/heldout/make-evidence.py <out> <this folder>/tasks <iteration dir> <meta.json>`.
3. The blader-inv numbers come from `reference/round5-ours-and-blader-inv-cells.jsonl`, copied from `../round5-heldout-2026-10-22/grades/cells.jsonl`.

What will differ on a rerun: model variance. In round 6 the lost point moved between tasks in every iteration; in round 7 iteration 1 lost one point (ho2 run 3, a unit), iteration 2 lost none. Three runs per task cannot separate a 5.00 from a 4.67 reliably. No F6 re-grade exists; all scoring is by script.
