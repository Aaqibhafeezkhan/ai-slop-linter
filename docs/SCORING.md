# How the score, the grade and the word count work

[Back to the README](../README.md)

Scoring by density rather than by severity is the one design choice here with empirical
support behind it, and it is worth saying where that support stops. Charoenwet,
Thongtanunam, Pham and Treude compared ways of ordering static-analysis warnings
([ISSTA 2024](https://arxiv.org/html/2407.12241v1)) and found warning density, warnings per
line of code, gave the largest improvement, up to 5.6% on recall and about 13% fewer initial false
alarms, while warning severity, the ordering developers reach for first, gave the lowest
improvement on every metric they measured. That study ranks warnings in changed functions
during security code review; this tool ranks findings per thousand words of prose. The shape
of the choice is the same and the evidence is from a different domain, so treat it as
support for the shape and not as proof about this tool.

The rest of the arithmetic has nothing behind it and should be read that way. The weights of
three, one and three tenths are a convention. So are the grade boundaries. The fifty-word
floor below which nothing is graded is arithmetic rather than a finding, and the reason for
it is in the next section.

### How words are counted

Scripts that put spaces between words are tokenised: a word keeps its accents, so
`değişiklik` and `naïve` are one word each rather than three and two.

Chinese, Japanese, Thai, Khmer, Lao, Burmese and Tibetan do not separate words with
spaces, so a run of them is handed to the platform's Unicode word segmenter, the same
`Intl.Segmenter` the browser and Node ship, which applies UAX #29 with ICU's dictionaries.
The alternative was a characters-per-word constant, and there is no number to put there
that anybody measured. Counts in those scripts therefore come from ICU and can move a
little between Node versions; the table in `bench/PRECISION.md` is regenerated in CI, so
a shift shows up as a failure rather than as a quietly different number. Where a build
has no `Intl.Segmenter`, two characters count as one word and the count is an estimate,
which counts fewer words and so grades a little harder, never easier.

A document under 50 words is not graded at all. Below that the denominator is small
enough that a single finding decides the letter, so the grade says more about the length
than about the writing: a twelve-word fragment with one em dash used to print an F. The
findings still stand, and an error-severity finding still fails the run; only the letter
is withheld. Commit messages and pull request descriptions are short by nature, so those
paths keep their score, because there the question is whether the text carries a tell and
not how dense the tells are.

Where the platform has `Intl.Segmenter` but ICU carries no word dictionary for the script,
which is what a build with small ICU gives you, the segmenter returns the whole run as one
segment. That is the same bug as before with no symptom, so the result is checked per run
rather than trusted: a run of twelve characters or more that comes back as a single word
falls to the estimate instead. The check is per run, so a build that has the dictionary for
one of these scripts and not another gets the right treatment for each.

One thing this measure cannot do is compare languages against each other. Turkish builds
long words out of suffixes, so the same text carries fewer of them than English does, and
one tell in a Turkish document scores higher than the same tell in its English
translation. The score is a comparison against other documents in the same language, not
across them.

### Where a finding points

Every finding carries a line and a column, and the column is a 1-based offset in UTF-16 code
units, counted from the start of the line in logical order. That is the same number your
editor's status bar shows, the same one GitHub uses for a workflow annotation, and the same
one a language server would report, so a tool that consumes the JSON can jump to the finding
without knowing anything about the script.

For a reader of Arabic or Hebrew this is worth saying plainly, because logical order is not
what the eye sees: the character at column 12 of a right-to-left line is the twelfth character
from the start of the text, which is drawn near the right edge, not the twelfth position from
the left of the screen. Counting columns the way the text is drawn would break every editor
that consumes them and would still be ambiguous in a line that mixes scripts. So the column
stays logical, and the finding carries an `excerpt` of the text it matched: for reading, the
excerpt is the reliable part, and the column is for the tool that jumps to it.
