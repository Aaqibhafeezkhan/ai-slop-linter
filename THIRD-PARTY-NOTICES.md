# Third-party notices

This project adapts wording from, and uses test material taken from, the following MIT-licensed projects. The goldens in `bench/head-to-head/golden/` are hand-written; where a golden also reuses a competitor's published After text, that project is named below and the reuse is noted in `docs/HEAD-TO-HEAD.md`. Each notice below keeps the copyright line and the permission notice of its source.

## unslop

- Source: https://github.com/jlwin/unslop_ai
- What was adapted: the rewrite guardrails in `plugin/skills/ai-slop-linter/SKILL.md` ("Add no fact"): no invented specifics, no silent loss, keeping the strength of a claim, and the closing test. The sentences were rewritten for this skill; wording adapted and rephrased.
- What was adapted: the German reference list `plugin/skills/ai-slop-linter/references/de.md`, which the skill makes the agent read after the linter, from the German sections of `skills/unslop/references/word-lists.md` (Tiers 1 and 2 and the German stock phrases) and section 16 (German special cases) of `skills/unslop/references/pattern-catalog.md`, commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52. The entries were regrouped and rewritten; the German words and phrases are quoted as the tells they are, and the explanations and fix directions are in our own words. No linter rule is adapted from them.
- What was adapted (round 3): three steps of "How to work" in `plugin/skills/ai-slop-linter/SKILL.md`, from `skills/unslop/SKILL.md` at commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52: the minimal rewrite (the size of the edit follows the amount of slop, and every sentence without a finding is carried over word for word), the outline before editing a text over about 300 words, with structure fixed before sentences and words, and the second pass after the draft because a rewrite brings in new tells. The steps are written in our own words.
- What was adapted (round 3): the load-bearing metaphor family (`skills/unslop/SKILL.md`, level 2, "Load-bearing metaphors") in `references/en.md`, `de.md`, `fr.md` and `es.md`, and the German participle tail ("Participle tails") and parataxis entries in `references/de.md`, commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52. The German and English trigger words are quoted as the tells they are; the French and Spanish renderings, the explanations, the examples and the fix directions are our own.
- What was adapted (round 4): the English stock verb `streamline` (`skills/unslop/references/word-lists.md`, "elevate / supercharge / streamline your X") in `references/en.md`, and the German class of tools that decide or act on their own (`skills/unslop/SKILL.md`, "False agency", and `references/pattern-catalog.md` section 28) in `references/de.md`, commit d65241e66f2b0e0d0b305cb55dadbffac0f9ef52. The machine-readable `references/*.tells.txt` files list the first-tier phrases of the reference files for `--verify`; the German tool-agency patterns in `de.tells.txt` are regular expressions of our own written from those entries. The explanations and fix directions are our own words.
- Word lists used as measurement candidates, not copied into any rule: the German candidates in `bench/packs/CANDIDATES.md` were drawn from unslop's German word tiers (Tiers 1 to 3 of `word-lists.md`) and its German stock phrases; unslop has no French list, so the French candidates came from the h1 fixture of this repository's head-to-head benchmark. The Spanish candidates came from anti-ai-writing (below). The judgment hints in `plugin/skills/ai-slop-linter/SKILL.md` ("Judgment checks for other languages") draw on the h1 fixture and on the stock-phrase lists of unslop and anti-ai-writing. Every candidate is listed with its counts; none is a rule unless it passes the shipping limit.
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
- What was adapted: the working steps in `plugin/skills/ai-slop-linter/SKILL.md` ("How to work"): mark the tells, draft a rewrite that keeps every supported fact, check the draft for added or dropped facts, then write the final version. The sentences were rewritten for this skill; wording adapted and rephrased.
- What was adapted (round 3): the second pass in "How to work" (step 5) follows step 3 of Humanizer's `SKILL.md` (commit 8c307f367c91bd974002f10f2be2965d642c13df): after the draft, reread it, ask what still reads as generated, and search again for the families that most often survive a rewrite; the list of remaining tells in the reply follows its output format for pasted text. Written in our own words; no Before or After pair is copied.
- What was adapted (round 3): the two tiers of every reference file in `plugin/skills/ai-slop-linter/references/` ("Act on one sighting" and "Act only when several appear") follow the strength calibration in the introduction of Humanizer's `SKILL.md` (some patterns act on one sighting, others are weak alone), commit 8c307f367c91bd974002f10f2be2965d642c13df. Our wording; no Humanizer example is copied.
- Test material used verbatim, for measurement only: the Before block of the README example (line 11) and the first five paragraphs of the README Full example Before block (lines 175 to 183), commit 8c307f367c91bd974002f10f2be2965d642c13df, which are the before texts of the home-ground tasks h7 and h8 in `bench/head-to-head/fixtures/`. The check data in `bench/head-to-head/home/h7.json` and `h8.json` are regular expressions of our own, written from the SKILL.md pattern list.
- After texts used verbatim, as a fairness check only: `bench/head-to-head/after/h7/announcement.md` is the README After text at line 14, and `bench/head-to-head/after/h8/lisbon.md` joins the README After texts at lines 188, 190 and 192, commit 8c307f367c91bd974002f10f2be2965d642c13df. No arm sees them, and they are not goldens.
- Test material used verbatim, for measurement only, in the full-length task h16: all six paragraphs of the README Full example Before block (lines 175 to 185, commit 8c307f367c91bd974002f10f2be2965d642c13df), which are the before text of `bench/head-to-head/fixtures/h16/lisbon-trip.md`. The README After texts at lines 188, 190, 192 and 194 are used verbatim as a fairness check only in `bench/head-to-head/after/h16/lisbon-trip.md`; no arm sees them, and they are not goldens.
- Probe transcript, as run evidence only: `bench/head-to-head/probes/blader-inv.jsonl` records one real run with the Humanizer plugin loaded. It holds the model's answer in the format Humanizer's `SKILL.md` prescribes, and no copy of the skill file. Nothing in it is adapted into a rule.

- What was adapted (round 6): ideas from Humanizer 3.1.0's `SKILL.md` (commit 8c307f367c91bd974002f10f2be2965d642c13df): the statement that its structural patterns apply in every language (the cross-language paragraph in `plugin/skills/ai-slop-linter/SKILL.md`), the rule that a qualifier stays only where the source supports it (the hedge split in "Add no fact"), the permission to merge or split sentences when a finding sits in a chain of clauses ("How to work", step 4), and two second-tier entries in `references/en.md` (a heading restated by the first sentence under it, and text that describes the document instead of its subject). Written in our own words; no Before or After pair is copied.
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
- What was taken: the Spanish word list in `skills/anti-ai-writing/references/banned-list.md` ("Banned words in Spanish"). Its words were used as measurement candidates in `bench/packs/CANDIDATES.md`, where each was counted on the Spanish corpora and dropped, and as judgment hints in `plugin/skills/ai-slop-linter/SKILL.md` ("Judgment checks for other languages"). No word list is copied into a shipped rule, and no Spanish rule ships.

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
- What was adapted: the English reference catalog `plugin/skills/ai-slop-linter/references/en.md`, which the skill makes the agent read after the linter. Its families and entries (staging, endings, inflation, rhythm, formatting, chat and draft leftovers) follow `skills/everwrite/references/patterns.md`, the pattern list in `skills/everwrite/SKILL.md` and the rule list in `skills/everwrite/scripts/tells.py`, commit 38912ce43453129c63eef958bf65faef4833c18e. The entries were rewritten for this skill in our own words; no Before or After pair is copied. The French and Spanish reference files (`fr.md`, `es.md`) follow the same families but are written from general knowledge of those languages.
- What was adapted (round 3): in "How to work" of `plugin/skills/ai-slop-linter/SKILL.md`, the smallest edit that keeps the author's structure (everwrite's edit mode) and the audit question after the draft, whether the rewrite added or dropped a fact (everwrite's Step 4), from `skills/everwrite/SKILL.md` at commit 38912ce43453129c63eef958bf65faef4833c18e. Written in our own words.
- No linter rule of this tool is adapted from everwrite's code. The idea of the `invisible-character` rule (round 3) comes from the invisible-character pass of `skills/everwrite/scripts/tells.py` (commit 38912ce43453129c63eef958bf65faef4833c18e): zero-width characters, direction controls and tag characters. The rule's code, its character list and its exemptions (joined emoji, flags, other scripts, a leading byte order mark, right-to-left lines, the soft hyphen) are our own.
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

## avoid-ai-writing (conorbronsdon)

- Source: https://github.com/conorbronsdon/avoid-ai-writing
- What was adapted (round 6): the counted-list openers (`Key takeaways`, `Five things to know`, `Here are the top seven`) and the stacked modal hedge (`could potentially`), as English phrases in `plugin/skills/ai-slop-linter/references/en.tells.txt` and in the `hedge` check of `src/hedge.ts`. Written as regular expressions of our own; no text is copied.

```
MIT License

Copyright (c) 2026 Conor Bronsdon

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

## Wikipedia, "Signs of AI writing" and its language versions

- Sources, licence CC BY-SA 4.0: https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing, https://de.wikipedia.org/wiki/Wikipedia:Anzeichen_für_KI-generierte_Inhalte, https://fr.wikipedia.org/wiki/Aide:Identifier_l'usage_d'une_IA_générative, https://pt.wikipedia.org/wiki/Wikipédia:Sinais_de_texto_gerado_por_inteligência_artificial, and the Spanish editors' list at https://es.wikipedia.org/wiki/Wikipedia:Café/Portal/Archivo/Propuestas/2025/03.
- What was used (round 6): facts about patterns only (that a phrase or construction is a sign of generated text), as short phrases and regular expressions of our own in `plugin/skills/ai-slop-linter/references/{en,de,fr,es,pt}.tells.txt`, in `references/pt.md` and in the `hedge` check of `src/hedge.ts`. No sentence of these pages is copied, so no part of this project is a derivative work of their text. Attribution: Wikipedia contributors, under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
- What was used (round 8): the mid-2026 corrective-framing family of `plugin/skills/ai-slop-linter/references/en.md` (the phrases `should be treated as X rather than Y`, `does not establish`, `should not be confused with`, `is not merely X`). The phrases are facts about patterns, written in our own wording; no sentence of the page is copied. Attribution: Wikipedia contributors, under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).
- What was used (`commit-procedural-assurance`, 0.2.1): the pattern idea from the "Edit summaries" section of the English page, that a promise of what was preserved, retained or avoided ("while preserving the original meaning") is a sign of generated text. The rule is the regular expression `while (preserving|retaining|maintaining|ensuring)` and `without (changing|breaking|altering)` in `src/commits.ts`, with its description in our own wording; the rule cites the page's heading in its `source` field. No sentence of the page is copied. Written by @Nitjsefnie. Attribution: Wikipedia contributors, under CC BY-SA 4.0 (https://creativecommons.org/licenses/by-sa/4.0/).

## ai-34-languages (Juzek 2026)

- Source: https://github.com/tjuzek/ai-34-languages, commit 0cf18ff2458007fe51a14059a73d9e7468ed4da9; paper: Thomas Stephan Juzek, "AI-Associated Lexical Shifts Across 34 Languages: Cross-Lingual Convergence and Diachronic Uptake in News Writing", arXiv:2605.25358 (2026).
- Licence: code MIT-0, data CC0 1.0 Universal (`LICENSE-DATA`). No attribution is required; it is given as a courtesy.
- What was used: the second-tier word lists ("Act only when several appear") of `plugin/skills/ai-slop-linter/references/fr.md`, `plugin/skills/ai-slop-linter/references/de.md` and `plugin/skills/ai-slop-linter/references/es.md` add words from `lexa-index/csv_files/news/las-gpt4.1-mini/policy=quantile_trim=no_M=1_K=12_jitter=no/{fr,de,es}/las_word_{fr,de,es}.csv`, ranked by the ratio of model to human counts per lemma (adjectives, verbs, nouns and adverbs, at least 40 model occurrences) and picked by hand for generic praise, emphasis and process words; topic words of the news register were left out. The measurement is news text and one model family (GPT-4.1-mini), so the words sit only in the tier that needs several together, and none is a linter rule.
## empios/humanizer-polish

- Source: https://github.com/empios/humanizer-polish (Polish). Licence as stated in the repository metadata when it was read (2026-10-20): MIT. The LICENSE file was not copied into this repository because no code or text of the project is copied.
- What was adapted (ideas only, round 8): the fact-comparison ideas of `scripts/porownaj_wersje.py`, used to write the Polish number, month and unit handling of `src/compare.ts`: spelled-out numbers with their inflected forms read as the same value as the digits, month names of several languages in a table, and unit words as synonyms. The code in `src/compare.ts` is our own; no line, table or word list of the project is copied.

## Vladimir-Human/humanizer-ru

- Source: https://github.com/Vladimir-Human/humanizer-ru (Russian). Licence as stated in the repository metadata when it was read (2026-10-21): MIT. No code or text of the project is copied.
- What was adapted (ideas only, round 8): the fact-check ideas of `skills/humanizer-ru/scripts/check_facts.py`, the same ones as above, for the number, month and unit handling of `src/compare.ts`: spelled-out numbers read by value, month names in a table, and unit words as synonyms. The implementation is ours; no line or word list of the project is copied.

## Corpus frequency counts (id and tr reference files)

The phrases in `plugin/skills/ai-slop-linter/references/id.md` and `tr.md` were found by counting word and phrase frequencies in human and machine texts. The corpora were used only for those counts. No text of any corpus is included in this repository, and each phrase in the two files is a short connector or evaluative word of our own choosing; the Source line of each file says which entries follow the corpora and which are our additions. The licences below are the uploaders' metadata strings as read on 2026-10-23; the originals were not checked, and we have not assessed the share-alike and copyleft questions they may raise for an MIT project.

- tum-nlp/neural-news-benchmark (Turkish): https://huggingface.co/datasets/tum-nlp/neural-news-benchmark, licence `openrail++` (metadata). Counted: the Turkish human and GPT-4 news rows.
- aycabostancioglu/Arabic-English-Turkish-AI-Human-Text (Turkish): https://huggingface.co/datasets/aycabostancioglu/Arabic-English-Turkish-AI-Human-Text, licence `gpl-3.0` (metadata). Counted: the Turkish human and AI rows. Authorship and the origin of its human texts were not verified.
- PlatinaSB/ai-and-human-text-classification (Indonesian): https://huggingface.co/datasets/PlatinaSB/ai-and-human-text-classification, licence `cc-by-sa-4.0` (metadata). Counted: the Indonesian rows.
- shouwiku/detectai-indonesian (Indonesian): https://huggingface.co/datasets/shouwiku/detectai-indonesian, licence `mit` (metadata). Counted: the Indonesian rows.


## Corpus texts

The human corpus texts under `bench/packs/human/` and `bench/typography/` keep their own licences; they are not covered by this repository's MIT licence. They are Project Gutenberg texts (public domain), Wikipedia articles (CC BY-SA 4.0), Python documentation (PSF License Version 2) and MDN content (CC BY-SA). The licence of each file is recorded in `bench/packs/MANIFEST.md` and `bench/typography/MANIFEST.md`.
