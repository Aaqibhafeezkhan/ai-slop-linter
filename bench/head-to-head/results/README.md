# Head-to-head results

Each round has its own directory, `results/round-<N>/`. A round is run with its output directory outside the repository (`rerun.sh --out /tmp/h2h-round-1`), because inside the repository the `.slop.json` of this repository would apply to our arm only. When the round is finished, `bench/head-to-head/run/publish.sh <out> round-<N>` copies the evidence here.

Committed for each round, so that anyone can audit the numbers without re-running claude:

- the valid transcripts, `<task>-<arm>-<iteration>.jsonl`, and the failed ones, `failed/*.failed.jsonl`
- the scored run directories, `runs/<task>-<arm>-<iteration>/` (no `node_modules`, no file over 1 MB, no binary file)
- the grader prompts, `grading/<id>.txt`, and the grader answers, `grading/<id>.out`
- `grading/labelmap.json`, which maps each anonymous grader id to a run
- `blind.json` (the blind verdicts), `scores.json`, `process.json`, `leaks.json` and `leak-review.json` (tool calls that mention the answer key, and their review with a verdict and a reason), `meta.json`, `competitors-status.json`
- `summary.md`, the output of `summarize.mjs`

Transcripts lose their private fields (session ids, uuids, memory paths, rate-limit numbers). Every text file is scrubbed of `/Users/<name>`, `-Users-<name>-`, the output directory, the scratchpad path and the temporary directory. Not copied: the plugin exports, the tarball, the rendered sandbox profiles and the config guard state. They stay in the output directory.

`history/` holds results that are not rounds of the current task set. `history/partial-round-1/` holds the two partial runs behind the saturation ruling of 2026-10-22: the scores of both, the saturation table, the full transcripts of the 112-run partial round, and the kept-task scores after the criteria repairs (see its `README.md`).
