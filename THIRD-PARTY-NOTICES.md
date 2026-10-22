# Third-party notices

This project adapts wording from, and uses test material taken from, the following MIT-licensed projects. The goldens in `bench/head-to-head/golden/` are hand-written; where a golden also reuses a competitor's published After text, that project is named below and the reuse is noted in `docs/HEAD-TO-HEAD.md`. Each notice below keeps the copyright line and the permission notice of its source.

## unslop

- Source: https://github.com/jlwin/unslop_ai
- What was adapted: the rewrite guardrails in `skills/ai-slop-linter/SKILL.md` ("Add no fact"): no invented specifics, no silent loss, keeping the strength of a claim, and the closing test. The sentences were rewritten for this skill; wording adapted and rephrased.
- What was adapted: the German reference list `skills/ai-slop-linter/references/de.md`, which the skill makes the agent read after the linter, from the German sections of `skills/unslop/references/word-lists.md` (Tiers 1 and 2 and the German stock phrases) and section 16 (German special cases) of `skills/unslop/references/pattern-catalog.md`, commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52. The entries were regrouped and rewritten; the German words and phrases are quoted as the tells they are, and the explanations and fix directions are in our own words. No linter rule is adapted from them.
- What was adapted (round 3): three steps of "How to work" in `skills/ai-slop-linter/SKILL.md`, from `skills/unslop/SKILL.md` at commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52: the minimal rewrite (the size of the edit follows the amount of slop, and every sentence without a finding is carried over word for word), the outline before editing a text over about 300 words, with structure fixed before sentences and words, and the second pass after the draft because a rewrite brings in new tells. The steps are written in our own words.
- What was adapted (round 3): the load-bearing metaphor family (`skills/unslop/SKILL.md`, level 2, "Load-bearing metaphors") in `references/en.md`, `de.md`, `fr.md` and `es.md`, and the German participle tail ("Participle tails") and parataxis entries in `references/de.md`, commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52. The German and English trigger words are quoted as the tells they are; the French and Spanish renderings, the explanations, the examples and the fix directions are our own.
- Word lists used as measurement candidates, not copied into any rule: the German candidates in `bench/packs/CANDIDATES.md` were drawn from unslop's German word tiers (Tiers 1 to 3 of `word-lists.md`) and its German stock phrases; unslop has no French list, so the French candidates came from the h1 fixture of this repository's head-to-head benchmark. The Spanish candidates came from anti-ai-writing (below). The judgment hints in `skills/ai-slop-linter/SKILL.md` ("Judgment checks for other languages") draw on the h1 fixture and on the stock-phrase lists of unslop and anti-ai-writing. Every candidate is listed with its counts; none is a rule unless it passes the shipping limit.
- Test material used verbatim, for measurement only: the inputs of cases 2, 9 and 19 in `skills/unslop/evals/cases.md` (commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52), which are the before texts of the home-ground tasks h9 and h10 in `bench/head-to-head/fixtures/`. The unslop pattern catalog and word lists were read to write the check data in `bench/head-to-head/home/h9.json` and `h10.json` as regular expressions of our own.
- Test material used verbatim, for measurement only, in the full-length task h17: the inputs of cases 1, 5, 10, 11, 13, 17, 22, 23 and 24 in `skills/unslop/evals/cases.md` (lines 11, 69, 125, 140, 162 to 166, 203, 250, 262 and 272, commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52), joined in file order into `bench/head-to-head/fixtures/h17/sammlung.md`. The check data in `bench/head-to-head/home/h17.json` are regular expressions of our own, written from the EXPECTED findings of those cases.
- Probe transcript, verbatim, as run evidence only: `bench/head-to-head/probes/unslop-inv.jsonl` records one real run with the unslop skill loaded, so it embeds the text of unslop's `SKILL.md` and reference files as the agent read them (commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52). Nothing in it is adapted into a rule.

```
MIT License

Copyright (c) 2026 Jean-Luc Winkler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Humanizer (blader)

- Source: https://github.com/blader/humanizer
- What was adapted: the working steps in `skills/ai-slop-linter/SKILL.md` ("How to work"): mark the tells, draft a rewrite that keeps every supported fact, check the draft for added or dropped facts, then write the final version. The sentences were rewritten for this skill; wording adapted and rephrased.
- What was adapted (round 3): the second pass in "How to work" (step 5) follows step 3 of Humanizer's `SKILL.md` (commit 8c307f367c91bd974002f10f2be2965d642c13df): after the draft, reread it, ask what still reads as generated, and search again for the families that most often survive a rewrite; the list of remaining tells in the reply follows its output format for pasted text. Written in our own words; no Before or After pair is copied.
- What was adapted (round 3): the two tiers of every reference file in `skills/ai-slop-linter/references/` ("Act on one sighting" and "Act only when several appear") follow the strength calibration in the introduction of Humanizer's `SKILL.md` (some patterns act on one sighting, others are weak alone), commit 8c307f367c91bd974002f10f2be2965d642c13df. Our wording; no Humanizer example is copied.
- Test material used verbatim, for measurement only: the Before block of the README example (line 11) and the first five paragraphs of the README Full example Before block (lines 175 to 183), commit 8c307f367c91bd974002f10f2be2965d642c13df, which are the before texts of the home-ground tasks h7 and h8 in `bench/head-to-head/fixtures/`. The check data in `bench/head-to-head/home/h7.json` and `h8.json` are regular expressions of our own, written from the SKILL.md pattern list.
- After texts used verbatim, as a fairness check only: `bench/head-to-head/after/h7/announcement.md` is the README After text at line 14, and `bench/head-to-head/after/h8/lisbon.md` joins the README After texts at lines 188, 190 and 192, commit 8c307f367c91bd974002f10f2be2965d642c13df. No arm sees them, and they are not goldens.
- Test material used verbatim, for measurement only, in the full-length task h16: all six paragraphs of the README Full example Before block (lines 175 to 185, commit 8c307f367c91bd974002f10f2be2965d642c13df), which are the before text of `bench/head-to-head/fixtures/h16/lisbon-trip.md`. The README After texts at lines 188, 190, 192 and 194 are used verbatim as a fairness check only in `bench/head-to-head/after/h16/lisbon-trip.md`; no arm sees them, and they are not goldens.
- Probe transcript, as run evidence only: `bench/head-to-head/probes/blader-inv.jsonl` records one real run with the Humanizer plugin loaded. It holds the model's answer in the format Humanizer's `SKILL.md` prescribes, and no copy of the skill file. Nothing in it is adapted into a rule.

```
MIT License

Copyright (c) 2025 Siqi Chen

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## anti-ai-writing

- Source: https://github.com/avectats7/anti-ai-writing
- What was taken: the Spanish word list in `skills/anti-ai-writing/references/banned-list.md` ("Banned words in Spanish"). Its words were used as measurement candidates in `bench/packs/CANDIDATES.md`, where each was counted on the Spanish corpora and dropped, and as judgment hints in `skills/ai-slop-linter/SKILL.md` ("Judgment checks for other languages"). No word list is copied into a shipped rule, and no Spanish rule ships.

```
MIT License

Copyright (c) 2026 Tato Polanco

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## everwrite

- Source: https://github.com/m4bwav/everwrite
- What was used: test material, verbatim and for measurement only. The fixture `skills/everwrite/evals/fixtures/sloppy.md` and six Before sentences from `skills/everwrite/references/patterns.md` (lines 35, 37, 44, 48, 54 and 58), commit 38912ce43453129c63eef958bf65faef4833c18e, which are the before texts of the home-ground tasks h11 and h12 in `bench/head-to-head/fixtures/`. The check data in `bench/head-to-head/home/h11.json` and `h12.json` are regular expressions of our own, written from `scripts/tells.py` and `patterns.md`.
- After lines used verbatim, as a fairness check only: `bench/head-to-head/after/h12/town.md` joins the After lines of `skills/everwrite/references/patterns.md` at lines 36, 37 (the quoted sentence), 45 (the quoted sentence), 49, 55 and 59, commit 38912ce43453129c63eef958bf65faef4833c18e. No arm sees them, and they are not goldens.
- After lines used verbatim, as a fairness check only: `bench/head-to-head/after/h18/drafts.md` joins the quoted After text that follows each Before string used in h18, in `skills/everwrite/references/patterns.md` (the lines after 9, 11, 15, 17, 18, 19, 22, 26, 28, 29, 35, 37, 40, 44, 48, 54, 58, 62, 66, 70, 74, 80, 90, 94, 98 and 101), commit 38912ce43453129c63eef958bf65faef4833c18e. No arm sees them, and they are not goldens.
- Test material used verbatim, for measurement only, in the full-length task h18: every quoted Before string of `skills/everwrite/references/patterns.md` (lines 9, 11, 15, 17, 18, 19, 22, 26, 28, 29, 35, 37, 40, 44, 48, 54, 58, 62, 66, 70, 74, 80, 90, 94, 98 and 101, commit 38912ce43453129c63eef958bf65faef4833c18e), joined in file order into `bench/head-to-head/fixtures/h18/drafts.md`. The check data in `bench/head-to-head/home/h18.json` are regular expressions of our own, written from `scripts/tells.py`.
- What was adapted: the English reference catalog `skills/ai-slop-linter/references/en.md`, which the skill makes the agent read after the linter. Its families and entries (staging, endings, inflation, rhythm, formatting, chat and draft leftovers) follow `skills/everwrite/references/patterns.md`, the pattern list in `skills/everwrite/SKILL.md` and the rule list in `skills/everwrite/scripts/tells.py`, commit 38912ce43453129c63eef958bf65faef4833c18e. The entries were rewritten for this skill in our own words; no Before or After pair is copied. The French and Spanish reference files (`fr.md`, `es.md`) follow the same families but are written from general knowledge of those languages.
- What was adapted (round 3): in "How to work" of `skills/ai-slop-linter/SKILL.md`, the smallest edit that keeps the author's structure (everwrite's edit mode) and the audit question after the draft, whether the rewrite added or dropped a fact (everwrite's Step 4), from `skills/everwrite/SKILL.md` at commit 38912ce43453129c63eef958bf65faef4833c18e. Written in our own words.
- No linter rule of this tool is adapted from everwrite.
- Probe transcript, verbatim, as run evidence only: `bench/head-to-head/probes/everwrite-inv.jsonl` records one real run with the everwrite skill loaded, so it embeds the text of everwrite's `SKILL.md` as the agent read it (commit 38912ce43453129c63eef958bf65faef4833c18e). Nothing in it is adapted into a rule.

```
MIT License

Copyright (c) 2026 Mark Rogers

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## ai-34-languages (Juzek 2026)

- Source: https://github.com/tjuzek/ai-34-languages, commit 0cf18ff2458007fe51a14059a73d9e7468ed4da9; paper: Thomas Stephan Juzek, "AI-Associated Lexical Shifts Across 34 Languages: Cross-Lingual Convergence and Diachronic Uptake in News Writing", arXiv:2605.25358 (2026).
- Licence: code MIT-0, data CC0 1.0 Universal (`LICENSE-DATA`). No attribution is required; it is given as a courtesy.
- What was used: the second-tier word lists ("Act only when several appear") of `skills/ai-slop-linter/references/fr.md`, `skills/ai-slop-linter/references/de.md` and `skills/ai-slop-linter/references/es.md` add words from `lexa-index/csv_files/news/las-gpt4.1-mini/policy=quantile_trim=no_M=1_K=12_jitter=no/{fr,de,es}/las_word_{fr,de,es}.csv`, ranked by the ratio of model to human counts per lemma (adjectives, verbs, nouns and adverbs, at least 40 model occurrences) and picked by hand for generic praise, emphasis and process words; topic words of the news register were left out. The measurement is news text and one model family (GPT-4.1-mini), so the words sit only in the tier that needs several together, and none is a linter rule.

## Corpus texts

The human corpus texts under `bench/packs/human/` and `bench/typography/` keep their own licences; they are not covered by this repository's MIT licence. They are Project Gutenberg texts (public domain), Wikipedia articles (CC BY-SA 4.0), Python documentation (PSF License Version 2) and MDN content (CC BY-SA). The licence of each file is recorded in `bench/packs/MANIFEST.md` and `bench/typography/MANIFEST.md`.
