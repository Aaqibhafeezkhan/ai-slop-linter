# Our own writing, run through the linter

[Back to the README](../README.md)

## One finding that was taken, and why

The linter runs on the five READMEs its author maintains. On one of them it reported
seven `bold-label` warnings and a grade of C, because that README listed its rules as
bold labels with a colon:

```
before   - **Name:** the rule, explained in a sentence.
after    - The rule, explained in a sentence.
```

That one was accepted because the seven bullets had become a form rather than prose, and
the rule pointed at the exact shape doing it. Three findings on other pages were left
alone in the same pass, because a sentence is worth more than a clean score. Both
outcomes, with the scores and the dates, are in
[Run on our own writing](#run-on-our-own-writing).

## Run on our own writing

The linter on the README of each of the author's five repositories, run on 2026-10-21 with ai-slop-linter 0.1.10 at commit 882fe3e (`node dist/src/cli.js <file> --warn`). Each README is the one on the repository's default branch on that date; the commit column is the head of that branch on 2026-10-21 (UTC), so the row can be checked against it. Word counts move as the documents grow, so the date and the version are part of the claim.

| text | commit | words | grade | findings |
|---|---|---:|---|---:|
| [proactive-gate](https://github.com/Bubblegunn/proactive-gate) README | 73508f8 | 6,648 | A (0.8) | 5 |
| [workproof](https://github.com/Bubblegunn/workproof) README | cd47e6e | 4,341 | A (0) | 0 |
| [surviving-lines](https://github.com/Bubblegunn/surviving-lines) README | 46bcd0d | 2,408 | A (0) | 0 |
| [product-engineer](https://github.com/Bubblegunn/product-engineer) README | 343ab3d | 1,993 | A (0) | 0 |
| this README | 882fe3e | 2,752 | A (0) | 0 |

Earlier results, from 5 September 2026 at version 0.1.4, kept as a record:

- The surviving-lines README: the first run found 2 bold labels in a list, fixed the same day.
- The product-engineer README: the first run scored C (8.7) for 7 bold labels in the rule list.
- Eight of eleven essays on the author's site: A (0), 854 to 1,849 words each. The other three: A (0.4 to 1.2), with `state-of-the-art` once, `elevated` once and `in order to` twice. The essays were not run again on 2026-10-21.

The C was real: the first product-engineer README listed its seven rules as
`**Name:** text` bullets, exactly the pattern the rule flags. Later the same day that
README was rewritten to show the tool before explaining it, and the rule list became
plain sentences on the way; it was not edited to please the linter, and the row keeps
the earlier score so the table stays a record of runs, not a scoreboard. The three essays
still carry their findings, because a sentence is worth more than a clean score. The linter
runs on this repository's own Markdown in CI with `maxScore` 3, and it has caught two of its
own rules that way: the curly quotes that flagged Jane Austen, and a `filler` match on
"applied in order to any file", which is not the padded infinitive the rule is looking for.
