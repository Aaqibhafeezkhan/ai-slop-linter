# Verify (checklist for another LLM or a person)

1. Protocol frozen before the runs: run `git log --format='%h %ad %s' --date=iso` and see that the design commit `b25fe31` and the protocol commit `5eb1a61` precede this folder's commit; `git diff --quiet 7cba348..5eb1a61 -- src skills hooks .claude-plugin package.json` must exit 0 (product code did not change between code and measurement).
2. Scores recompute: `python3 score.py . | diff - SUMMARY.md` prints nothing. `grades/cells.jsonl` has 165 lines; each line has the five script criteria and the detail strings from `score.mjs`.
3. Scorer check: open `score.mjs` (frozen in the deep round, commit `6a1d671`, unchanged) and `tasks/hoN/check.json`; run `node score.mjs tasks/ho4 runs/ho4/ours/1` to see one cell's score first-hand (the output file name is in `check.json`).
4. No reused cell: the protocol and amendment say no cell comes from an earlier round; `runs/*/*/*/cost.json` shows `apiKeySource` ANTHROPIC_API_KEY and a model id for every cell, all from 2026-10-22.
5. Redaction: `grep -rE '/Users/|@[A-Za-z0-9-]+\.[a-z]{2,}|sk-ant' .` finds nothing; paths appear as `<HOME>` and `<TMP>`.
6. Held-out writer did not see the code: `PROTOCOL.md` and `tasks/WRITER-BRIEF.md` give its entire input.
7. Checksums: `shasum -a 256 -c SHA256SUMS` (run inside this folder).
8. The claim: `SUMMARY.md` says the gate part FAILS (Rule A and Rule B); nothing in it claims first place.
