# Measured on a fixed corpus

[Back to the README](../README.md)

A linter that raises many false alarms gets uninstalled, so the cost of a false alarm is measured and
committed rather than asserted. `bench/corpus` holds ten texts: five written before any
language model existed, three of them literary and scientific prose from the 1840s to 1860s
and two Python Enhancement Proposals from 2001, and five pieces of unedited model output in
the shapes this tool is pointed at. `npm run bench` runs every rule over both and writes
[`bench/PRECISION.md`](../bench/PRECISION.md), which lists the rate per rule, per 1,000 words, in
each corpus. CI fails when the committed table no longer matches a fresh run.

| corpus | words | grades |
|---|---:|---|
| human, all pre-2021 | 5,924 | A, A, B, B, B |
| unedited model output | 1,045 | F, F, F, F, F |

The first run found a rule that was wrong. `curly-quotes` flagged 92 lines of *Pride and
Prejudice*, which is all of Austen's dialogue, and nothing at all in the model corpus. Curly
marks are typography. What carries information is a file that mixes them with straight ones,
which is what pasting out of a chat interface leaves behind. The rule now stays quiet unless a
file mixes both, and Austen grades A.

Eight findings remain on the human corpus and the table names every one. Six are real dashes
in Darwin and Douglass and `--` in a 2001 style guide. One is `not just X but Y`, written by
Frederick Douglass in 1845. One is `it's worth noting`, written by Guido van Rossum in PEP 8.
None of them is a bug. They are the listed tells appearing in writing nobody would call slop,
which is the standing cost of leaving those rules switched on, and it is the reason the output
is a line number and a reason rather than a verdict about a person.
