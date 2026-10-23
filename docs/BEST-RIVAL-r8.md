# Best-rival analysis and plan, round 8 (2026-10-23)

Written before any round 8 code. Inputs: `docs/RESEARCH-R8-rivals.md` (blader upstream delta, ~60 other tools, fact-preservation methods, Wikipedia delta) and `docs/RESEARCH-R8-corpora.md` (labelled human-vs-machine corpora per language), plus `docs/BEST-RIVAL-r6.md` and `r7.md`. No benchmark call was made. Held-out sets stay sealed; only the language list of the new set (en, es, pl, id, pt, nl) is known.

## 1. Why the best rival wins where it does

- blader/humanizer has not changed since the pinned commit `8c307f3` (GitHub compare: identical, ahead 0). The 24.33 against 23.33 gap of round 5 is therefore process and clean-text behaviour, not new rules. Round 7 closed the ones we could name (read-back, clean text byte-identical, hedge class). Gate: 25.00 of 25.
- Its fact rules are prompt text only (`SKILL.md:37-38`, `:385`). Ours are scripted (`--compare`), so facts are where we should lead, provided the script works in the languages of the set.
- It does not matter that rivals are strong in English. The set measured next has pl, id, nl, es, pt. Our deterministic layers cover en, es, pt, de, fr, nl (hedge) and nothing for pl and id.

## 2. Measured gaps in our own tools (probes with fresh sentences, `dist/src/cli.js`, 2026-10-23)

| # | Probe | Result | Gap |
|---|---|---|---|
| G1 | `Rp1.500.000` rewritten as `Rp1.500` (id) | `--compare` says OK | A currency code glued to a number hides a lost magnitude (`compare.ts` number regex excludes a letter before the digits). |
| G2 | `1 000` (pl, fr, ru) | read as `1` and `000` | Space, NBSP and apostrophe thousands groups are not one number; the message is wrong and `1 000` to `1 000` is only safe by accident. |
| G3 | `€2.500.000` rewritten as `€2.500` (nl) | flagged as `version` | Dotted thousands read as versions (known limit in the header of `compare.ts`). |
| G4 | month names | only en and fr (`MONTHS`) | `3 de noviembre` to `3 de diciembre`, `3 listopada` to `3 grudnia`, `3 november` to `3 december` pass: the day number is the same and a lowercase month is not a name. |
| G5 | `tres sucursales` to `sucursales`, `dwunastu pracowników` to `pracowników`, `three branches` to `branches` | OK | Spelled-out numbers are not read (stated limit). |
| G6 | `4,8 detik`, `4,8 sekundy`, `4,8 seconden` losing the unit | not reported | `UNIT_WORDS` (`hedge.ts:146`) has no pl, id, it; `lost unit` only works for en, fr, de, es, pt, tr, nl partly. |
| G7 | first person added: nl `wij/onze/ik`, pt `nós/nosso/eu`, id `kami/kita/saya`, pl `my/nasz/zrobiliśmy`, it `noi/nostro` | no `person` fact | `PERSON_*` tables hold en, fr, es, de, tr; pt only verbs ending in `-amos/-emos`. Criterion C4 of the benchmark is exactly this. |
| G8 | qualifier next to a number: pt `cerca de`, nl `ongeveer`, pl `około`, id `sekitar` | no `qualifier` fact | `QUALIFIER_CANDIDATES` has en, fr, de, es only. |
| G9 | language of a pl or id text | not detected (`lang.ts` lists en fr es de it pt nl) | Person, claim, qualifier tables are chosen by language; an undetected text is read as English. |
| G10 | rewrite prompts in pl or id | hook silent (`hooks/rewrite-prompt.sh`) | The hint that loads the skill covers fr, es, pt, de, tr, it, nl but not `przepisz`, `popraw`, `tulis ulang`, `perbaiki`. |
| G11 | `--verify` on pl, id, tr, nl text | silent about having no catalog | A clean pass on a language without a catalog proves little; the user is not told. |

## 3. What rivals and wider sources give (see the two research files for evidence)

- Fact scripts exist only in small single-language tools: `empios/humanizer-polish` `porownaj_wersje.py` (pl, MIT), `Vladimir-Human/humanizer-ru` `check_facts.py` (ru, MIT), Aboudjem `facts.js` (en, MIT). They add: spelled-out numbers and inflected forms, month tables, unit synonyms, scale-word false friends (`billón` 10^12 against `billion` 10^9), counted negation and modality words. None is multilingual. We adopt the ideas with our own code, attribution in `THIRD-PARTY-NOTICES.md`.
- Locale-aware number algorithm (last separator is the decimal mark; both kinds present resolves it; a lone `1.250` stays ambiguous) is our own design from the research file section 3c.
- Corpora: independent evidence exists for Turkish (neural-news GPT-4 under openrail++ and a second set under GPL-3.0) and Indonesian (PlatinaSB cc-by-sa-4.0, shouwiku MIT), partly for Italian and Spanish, none for Dutch, Polish and Portuguese (MULTITuDE and MultiSocial are request-only). Genre confounds are stated in the file. The phrases are ordinary connectors and evaluative words (`selain itu`, `namun`, `bu durum`, `önemli bir`), common in human text too.
- Wikipedia (CC BY-SA 4.0, facts only) added a "mid-2026" corrective-framing family (`should be treated as X rather than Y`, `does not establish`) and moved the dash into "historical indicators". No new language version exists for nl, pl, id, es, tr.
- Not adopted: NLI/QA faithfulness metrics and AI-text detectors (need a model, wrong goal); blader open PRs #308/#309 (unmerged, untrusted).

## 4. Ruling log

- R8-1 Compare is fixed first (G1 to G9). It is the only gap that touches all six languages and the claim "facts unchanged". Every new table is a closed class; each class and language gets at least two positive and two negative fresh sentences; none comes from a task.
- R8-2 No blocking catalog (`<lang>.tells.txt`) for nl, pl, id, tr, it. The corpus phrases are everyday words; a blocking hit would make a model rewrite a protected sentence (criterion C3). They enter as non-blocking reference guides, marked by evidence level.
- R8-3 Reference guides `id.md`, `tr.md` (corpus-backed, low confidence, wording marked), `nl.md`, `pl.md` (class translations, no measured evidence, said so in the file). Italian and Spanish additions wait for a second generator corpus.
- R8-4 Spelled-out numbers are read as number facts by value ("three" equals "3"), only for words that are not articles or pronouns (`one`, `un`, `een`, `satu`, `jeden`, `um` skipped), only for the declared or guessed language plus English.
- R8-5 `--verify` prints a `note:` line when the language has no catalog (exit code unchanged).
- R8-6 SKILL.md gains a short claims-audit step (eight classes: number, date, name, quote, negation, modality, quantifier, cause) and an en corrective-framing family in `en.md`; no new rule that asks the agent to add a concrete detail.
- R8-7 Over-editing check already exists (`unrequested edit`, `length`); no change.
- R8-8 Language guessing for compare only (`guessCompareLanguage`: pl, id, tr added); `detectLanguage` is untouched so the `dash` behaviour does not change.
- R8-9 Hook: add pl and id verbs and nouns; extend the fixture with related and unrelated prompts in both.

## 5. Plan (SDD: Haiku implementer, Sonnet reviewer, one task at a time, test + mutation check, commit, push)

Plan file: `docs/superpowers/plans/2026-10-23-ai-slop-linter-rival-gaps.md`.

| Task | Closes | Files | Tests |
|---|---|---|---|
| T1 numbers | G1 G2 G3 | `src/compare.ts` | `test/round8.test.mjs` numbers |
| T2 months | G4 | `src/compare.ts` | dates, 9 languages |
| T3 spelled numbers + language guess | G5 G9 | `src/compare.ts`, `src/lang.ts` | by value, article exclusions |
| T4 persons, claims, qualifiers, units | G6 G7 G8 | `src/compare.ts`, `src/hedge.ts` | per language |
| T5 hook | G10 | `hooks/rewrite-prompt.sh`, `test/fixtures/prompt-hook.json` | related and unrelated prompts |
| T6 references, SKILL.md, verify note | G11, R8-3, R8-6 | `skills/.../references/{id,tr,nl,pl}.md`, `en.md`, `SKILL.md`, `src/cli.ts`, `THIRD-PARTY-NOTICES.md`, `CHANGELOG.md` | skill tests, verify note |
