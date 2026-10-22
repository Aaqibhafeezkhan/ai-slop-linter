# Partial round 1 (history)

These are the two partial runs that came before the saturation ruling of 2026-10-22 (see "Saturation ruling" in `docs/HEAD-TO-HEAD.md`). Neither one is a result of the current task set: tasks h4, h5, h6, h7 and h12 were retired because of them, and the scripted criteria of the kept tasks h8 and h11 were repaired afterwards (see "Criteria repairs"). The numbers are kept so that the ruling can be audited.

- `saturation-table.md`: the mean scripted points per task and arm, the spread and the number of runs, for both rounds, as the checks scored the runs at the time.
- `aborted/`: the aborted round, 223 scored runs of tasks h1 to h12 with two or three runs per cell. Only `scores.json` and `meta.json` are published. The run output of that round is not.
- `final/`: the final partial round, 112 valid runs. It holds `scores.json`, `process.json`, `leaks.json`, `meta.json`, `competitors-status.json`, the 112 valid transcripts (`<task>-<arm>-<iteration>.jsonl`) and the scored run directories (`runs/`). The 176 failed attempts of that round are not published. The files went through the scrubbing of `run/publish-files.mjs`: user names, the output directory, the scratchpad path and the temporary directory are replaced by placeholders, and transcripts lose their private fields. The blind criterion C5 of h1 to h4 was never graded in either round, so it is `null` in every score file.
- `rescored-kept-tasks/`: the runs of the kept tasks (h1, h2, h3, h8, h9, h10, h11) scored again from the files on disk after the criteria repairs, with `score.mjs` and no new claude call. Only h8 C3 and h11 C5 changed.

Not part of any win rule.
