# External prose linter comparison: study design

## Question

On the repository's existing fixed corpus, how often do vale-ai-tells, slop-guard and SlopMonster report findings on the human and model-written sets, alongside ai-slop-linter?

This is a descriptive comparison of four rule-based tools on this corpus. It is not a test of authorship detection, and it will not produce an accuracy score or a winner.

## Hypotheses and interpretation

The tools will report different rates because their rule catalogues, preprocessing and output units differ. The human set will produce some findings, and a result of zero findings on either set is possible and will be reported unchanged. A higher rate on the model set would mean only that a tool reports more findings on these particular samples. It would not establish that the findings are correct or that the tool can identify machine-written text in the wild.

A higher human-set rate is a practical warning about review noise on this corpus, not proof that every finding is a false positive. A lower model-set rate is not proof that the tool failed to detect machine writing. Do not change tool settings or corpus text to improve the result.

## Fixed inputs

Use the corpus from the exact commit being studied. Record the full commit SHA before running anything.

- Human set: all five files under `bench/corpus/human/`.
- Model set: all five files under `bench/corpus/machine/`.
- Exclude `bench/corpus/MANIFEST.md`, `bench/scripts/`, this design document, and all other repository files.
- Do not edit, normalize, combine, or otherwise rewrite corpus files before scoring.
- Run each tool on each file separately, then aggregate within each set. This preserves per-file results and avoids hiding variation between samples.

The corpus manifest documents provenance and important limitations: the human set contains five sources, including old literary and scientific prose; the model set contains output from one model in one sitting. The samples are small and are not representative of contemporary writing generally.

## Tools and configuration

Run the following tools with their default published rules and no custom rule configuration:

1. **ai-slop-linter**, the in-repository baseline, using the same source revision as the corpus.
2. **vale-ai-tells**, using the published `ai-tells` package.
3. **slop-guard**, using its `sg` command.
4. **SlopMonster**, using `tools/deslop.py`.

For every tool, record the exact version or immutable source commit, runtime version, full command, exit status and any configuration used. For Vale, record both the Vale binary version and the style-package release. For SlopMonster, record the Git commit because a moving default branch is not a reproducible version. If a tool cannot be installed or run, report it as unavailable with the error; do not substitute a different tool with a similar name.

Do not run SlopMonster's optional model-based rewrite. Only run its deterministic checker. Do not use network-based model judges or send corpus text to an API.

## Measurements

Use the word counts from the repository's existing `node bench/precision.mjs` implementation for the common denominator. At the time this design is written, `bench/PRECISION.md` reports 5,924 words in the human set and 1,045 in the model set. Regenerate and record those totals at the study commit; if they differ, explain why before calculating rates.

For each tool and each corpus set, publish:

- Total words used as the denominator.
- Total native-reported findings or alerts, and findings per 1,000 words: `findings / words * 1000`.
- Per-file word count, native-reported finding count, and the tool's own score or severity summary, if it provides one.
- The native score separately where available: Slop Guard's score and SlopMonster's score are not interchangeable with Vale alert counts or ai-slop-linter's weighted grade.
- A short note describing what one counted finding means for that tool. If a tool reports only category-level matches or otherwise collapses repeated matches, say so. Do not present these counts as equivalent units across tools.
- Raw output or machine-readable output for every run, plus a summary table generated from those outputs.

Do not infer missing line-level findings from scores. If output parsing cannot reliably count findings, publish the native score and mark the finding rate unavailable for that tool instead of guessing. Record zero as zero; never replace a null result with a more favourable setting or a different corpus.

## Execution and reproducibility

1. Record the corpus commit SHA and all tool/runtime versions.
2. Run the in-repository baseline with `npm ci` and `npm run bench`; retain the existing test suite result separately from benchmark findings.
3. Run each external tool against all ten corpus files using default settings.
4. Save raw output with a stable filename containing tool, set and sample name. Keep generated results separate from corpus source files.
5. Generate the report from the saved output, not by hand. Include the exact commands needed to repeat the run.
6. Repeat the complete run once from a clean environment. Investigate any mismatch; report nondeterminism or environment-sensitive behaviour rather than selecting one run.
7. Publish all per-file rows and aggregate rates, including zero and inconvenient results. Do not tune the rules after seeing these measurements.

If a tool's license or installation method prevents a reproducible run, document that limitation and leave its result unavailable. Do not invent, estimate or manually fill a score.

## Planned report

The results report will contain:

- Corpus commit and tool/runtime versions.
- Per-tool, per-file results for all ten samples.
- Aggregate human and model-set rates per 1,000 words.
- Native scores in separate columns, not combined into a shared score.
- Commands, raw outputs and a reproduction procedure.
- Deviations, failed runs and any differences between repeated runs.

## Limits

This experiment measures reported findings on one small, fixed corpus. The two sets differ in source, age, genre and length as well as provenance. There is no post-hoc human adjudication of each finding, and the labels describe source provenance rather than whether a particular sentence sounds machine-written. The study cannot estimate precision, recall, false-positive rate, or real-world detection accuracy. It cannot justify a leaderboard or a claim that one tool is best.

The result is useful even if the tools report similar rates, if a tool produces no findings, or if the model set has fewer findings than the human set. Publish the result as observed.
