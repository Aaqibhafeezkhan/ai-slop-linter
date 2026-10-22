# Languages

[Back to the README](../README.md)

The vocabulary rules are English word lists, so on other languages they find nothing. The structural rules (quotes, bold labels, emoji, headings) work in any language. `dash` is the one rule that flags punctuation a writer in another language may type correctly, and it has the highest severity this tool has. This page says what the tool does about that, what was measured, and what it does not claim.

## What it does now

The tool works out the language of each file in this order, and the first answer wins:

1. Declared: `"language": "fr"` in `.slop.json`, or `--language fr` for one run. `auto` or an empty value is not a declaration.
2. Front matter: A `lang:` or `language:` key at the top of the file. A two-letter tag is used as written. The three-letter codes `fra`, `fre`, `spa`, `deu`, `ger`, `ita`, `por`, `nld`, `dut` and `eng` are mapped to their two-letter tags.
3. Detection: The prose, with code and front matter masked, is scored on function words for English, French, Spanish, German, Italian, Portuguese and Dutch. The file needs at least 25 tokens, the top language must account for at least 12 percent of the function words, and it must have at least 1.5 times the count of the next language. Otherwise the file is English.

`--language auto` is the default, so steps 2 and 3 run for each file. When the language came from detection, the output says so: `dash, title-case-heading did not run for notes.md: language fr (detected)`. Languages outside that list are not detected; declare them with `--language`.

Whatever the language, `--compare` works the same way. It reads numbers, versions, dates, links, quotations, code spans and names, not wording. Names are found by capitalisation, and spelled-out numbers are not read.

### Paragraphs

- In an English file, a paragraph of at least 12 tokens that is confidently written in another language has its English-only findings dropped. Only `dash` is English-only today.
- In any file, a paragraph whose first line starts with an em dash or an en dash followed by a space, a letter, `¿` or `¡` is dialogue. That whole line is exempt from `dash`, including the dashes that set off a speaker tag. A continuation line of a hard-wrapped paragraph is not dialogue, and keeps its finding.
- A dash inside a quotation in `« »`, `‹ ›` or `„ “` (or `„ ”`) is exempt when the quotation sits in one paragraph. English curly and straight quotes are not exempt.

### The limit

A short quoted line inside an English paragraph is not exempt when the paragraph has fewer than 12 tokens. The tool cannot tell that line from English prose. To clear it, lengthen the paragraph with its own text, or put `<!-- slop-ignore-next-line RULE -->` above the line, with `dash` in place of RULE, and say why in your answer.

## Packs

A language pack is a set of rules that runs only on text in its language. A pack rule ships only when it has zero findings on every human file of its language and at least one finding on the machine corpus, and both corpora are large enough to measure. [`bench/PACKS.md`](../bench/PACKS.md) is generated from the corpora, and `test/packs.test.mjs` enforces the limit.

| language | human files | human words | machine files | machine words | rules shipped |
|---|---:|---:|---:|---:|---|
| German (`de`) | 8 | 20,748 | 30 | 5,343 | none |
| Spanish (`es`) | 8 | 19,198 | 26 | 5,152 | none |
| French (`fr`) | 14 | 40,160 | 22 | 4,373 | one: `fr/closer` |

French, one rule, provisional. `fr/closer` flags a call to act followed by `dès aujourd'hui`, such as "Installez ... dès aujourd'hui" with up to two words between. Over the 40,160 human words it has no hit, 0 per 1,000 words. On the machine corpus it has four hits in four files, 0.9 per 1,000 words. The four files come from three invented products, and the pattern was chosen after seeing those hits, so the rule is provisional. It has not been tested on new machine text.

Spanish and German, no rule. No candidate passed the shipping limit. Nothing in this pack says that Spanish or German text is written by a model, and the tool does not claim to detect it in either language. The candidates that were measured, and why each was dropped, are in [`bench/packs/CANDIDATES.md`](../bench/packs/CANDIDATES.md). That file also says how to measure a new pattern.

## Typography

The `dash` rule was penalising correct French, Polish and Russian punctuation. The rates below are findings per 1,000 words on correct, published prose in each language, measured by [`bench/typography.mjs`](../bench/typography.mjs) and written to [`bench/TYPOGRAPHY.md`](../bench/TYPOGRAPHY.md). Each excerpt was set by a publisher or translator who followed that language's own conventions.

| language | `dash` /1k, as the files stand |
|---|---:|
| Polish | 73.5 |
| Hungarian | 1.9 |
| Russian | 6.5 |
| English (baseline) | 1.0 |
| German, Spanish, French, Italian, Portuguese, Dutch | 0 |

Some files reach us with the em dash typed as two hyphens, `--`, which the rule does not match. `bench/TYPOGRAPHY.md` measures those files twice, once as they are and once with each `--` restored to the em dash. Polish has 77 double hyphens, and restoring them moves its rate from 73.5 to 1. French has 25, and its rate stays at 0. Read the restored column as what a writer meets today, since nobody types a dash as two hyphens in a README.

These are the rates as the committed excerpts measure now, after the dialogue and quotation exemptions described above. They replace earlier figures that were taken before those exemptions.

## What stays unclaimed

- Outside English, the vocabulary rules are inert. A French README written entirely by a model passes them, because `in order to` is not a French phrase.
- No Spanish or German tell detection. Spanish and German have no rules in their packs.
- No threshold separates a writer from a model in any language. A rate is a rate, and a rule with a human hit is not shipped however often the model uses the phrase.
- A paragraph, or a quoted span of an English paragraph, of 8 or more words with no function word of any listed language (English included) and at least one letter outside ASCII is read as a language that has no word list, such as Turkish, and the `dash` rule skips it and `--fix` leaves it. A dash inside straight quotes is not exempt in general.
- A short non-English heading inside an English file is still judged by `title-case-heading`. The paragraph guess needs 12 word tokens, and a heading rarely has that many, so only a file whose own language is non-English (declared, in the front matter or detected) stands the rule down.
- Languages outside the seven that are detected get no packs and no automatic detection. Declare them and the `dash` and `title-case-heading` rules stand down; no other rule changes.
