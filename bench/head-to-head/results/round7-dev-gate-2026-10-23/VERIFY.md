# Verify (for another LLM)

1. `git log --format='%h %s' 834a1dd..HEAD`: the best-rival analysis (`f06fe3b`) and the design and gate rule (`0f24783`) come before product code (`ed304c0`); the iteration 2 fix (`0668fb4`) comes before iteration 2. Proves the rule was fixed before the runs.
2. `python3 score.py . | diff - SUMMARY.md` (inside this folder): prints nothing. Proves the tables match the cell scores and costs.
3. `shasum -a 256 -c SHA256SUMS`: no failure. Proves the files are as committed.
4. `grep -rEl '/Users/|sk-ant|@[a-z0-9.-]+\.[a-z]{2,}' .` finds only `tasks/` fixture text with example addresses, if any; runs are redacted (home and temp paths, e-mail, key shapes replaced by placeholders).
5. `node ../../heldout/score.mjs tasks/ho2 dev-gate/iter1/runs/ho2/ours/3` re-scores the one lost cell: the answer file is in the cell folder.
6. Scope check: `SUMMARY.md` makes no leadership claim. It is a development gate on a seen set (ho1 to ho5), measured against recorded round 5 numbers of one rival. The held-out set g is not here and was not measured; its writer was an agent that saw no code and the controller did not read its tasks.
