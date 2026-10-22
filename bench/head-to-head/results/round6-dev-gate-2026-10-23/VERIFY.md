# Verify (for another LLM)

1. `git log --format='%h %s' 7226881..HEAD`: the design and gate rule (`427fe21`) come before product code (`789d0cc`), and each later fix commit comes before the iteration it was measured in. Proves the rule was fixed before the runs.
2. `python3 score.py . | diff - SUMMARY.md` (inside this folder): prints nothing. Proves the table matches the cell scores.
3. `shasum -a 256 -c SHA256SUMS`: no failure. Proves the files are as committed.
4. `grep -rEl '/Users/|sk-ant|@[a-z0-9.-]+\.[a-z]{2,}' .` finds only `tasks/` fixture text with example addresses, if any; runs are redacted (home and temp paths, e-mail, key shapes replaced by placeholders).
5. `node ../../heldout/score.mjs tasks/ho3 dev-gate/iter3/runs/ho3/ours/1` re-scores one cell: the answer file is in the cell folder.
6. Scope check: `SUMMARY.md` makes no leadership claim; the gate failed; set f was not measured, so no held-out file of set f is here. The writer of set f was an agent that saw no code; the controller did not read the tasks (branch `heldout-2026-10-f`, local, not pushed).
