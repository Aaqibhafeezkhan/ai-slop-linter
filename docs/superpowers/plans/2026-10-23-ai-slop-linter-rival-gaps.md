# Round 8 plan: close the compare and coverage gaps (2026-10-23)

Spec and ruling log: `docs/BEST-RIVAL-r8.md`. Method: one Haiku implementer per task, one Sonnet reviewer, tests first, a mutation check per new test (break the code, see the test fail, restore by editing back, never `git checkout`), `npm run lint`, `npm run build`, targeted tests, commit, push to `origin plugin-leadership`.

Rules for every task: every test sentence is written fresh for this file (no benchmark task text); each new closed class gets at least two positive and two negative sentences per language; the new code never lowers a result of the existing tests; no change to `heldout/`, `tasks.json`, criteria or scorers.

## T1 numbers (G1 G2 G3) in `src/compare.ts`
- A number may be written with group marks: space, NBSP (U+00A0), narrow NBSP (U+202F), thin space (U+2009), apostrophe `'` or `’`, `.`, `,`. Groups after the first have exactly three digits and the first has one to three.
- A currency code or sign may touch the number: `Rp`, `USD`, `EUR`, `CHF`, `PLN`, `IDR`, `TL`, `TRY`, `SEK`, `NOK`, `DKK`, `R$`, `US$`, `$`, `€`, `£`. It is not part of the value; the digits are the fact.
- Canonical value: if `.` and `,` both occur, the last one is the decimal mark; a mark that occurs more than once is a group mark; a space, NBSP, narrow NBSP or apostrophe group is a group mark. Two or more groups of exactly three digits with `.` (`1.250.000`) is a number, not a version. A lone `1.250` or `1,250` keeps today's behaviour (the literal text) because it is ambiguous. `3.2.1` stays a version.
- Tests: `Rp1.500.000` to `Rp1.500` lost; `1 250,5` equals `1 250,5`; `1 000` to `1 500` reports one lost and one added number (`1000`, `1500`); `1.250,50` and `1,250.50` are the same number; `€2.500.000` to `€2.500` is reported as number; `3.2.1` still a version; percent and ordered-list markers unchanged.

## T2 months (G4) in `src/compare.ts`
- Extend the date extractor with month names for es, pt, de, nl, it, pl (genitive), id, tr, ru, written as full words. Accept an optional `de`, `del`, `of` between day and month and between month and year. Dates compare case-insensitively.
- Tests: `3 de noviembre de 2026` to `3 de diciembre de 2026` lost and added; `3 listopada` to `3 grudnia`; `3 oktober` to `3 oktober` kept; `3 November 2026` and `3 november 2026` equal; no hit on `3 mars` style false friends other than the real months; en and fr unchanged.

## T3 spelled-out numbers and language guess (G5 G9) in `src/compare.ts`, `src/lang.ts`
- `guessCompareLanguage(text)` in `lang.ts`: function-word lists for pl, id, tr (and the existing seven through `detectLanguage`); used by compare only when `detectLanguage` gives null. `detectLanguage` is unchanged.
- Number words 2 to 20 and the tens, per language (en, es, pt, de, fr, nl, it, pl, id, tr), mapped to their value and compared as `number` facts with the digit form (`three` equals `3`). Excluded as ambiguous: every word for one, `once` (es), `sei` (it), `neuf` (fr), `on` (tr), `altı` and `yedi` (tr), `dos` outside es. A language is read when it is declared or guessed; English is always read.
- Tests: `three branches` to `branches` lost 3; `drie` to `3` equal; `dwunastu` to `pracowników` lost 12; `dua belas` is read as 2 (documented limit); article words never read.

## T4 persons, claims, qualifiers, units (G6 G7 G8) in `src/compare.ts`, `src/hedge.ts`
- Person words added or lost by count, for nl (`wij`, `we`, `ons`, `onze`, `ik`, `mijn`), pt (`nós`, `nosso`, `nossa`, `nossos`, `nossas`, `eu`, `meu`, `minha`, `meus`, `minhas`), it (`noi`, `nostro`, `nostra`, `nostri`, `nostre`, `io`, `mio`, `mia`), pl (`my`, `nasz`, `nasza`, `nasze`, `naszych`, `ja`, `mój`, `moja`, `moje`, plus past-tense `-liśmy` and `-łyśmy` verbs by closed form), id (`kami`, `kita`, `saya`, `aku`), tr (existing list kept). Only an increase is reported, as for the existing languages.
- Claim words: pt `sempre`, `nunca`, `garante`; nl `altijd`, `nooit`, `garandeert`; it `sempre`, `mai`, `garantisce`; pl `zawsze`, `nigdy`, `gwarantuje`; id `selalu`, `tidak pernah`, `menjamin`; tr `her zaman`, `asla`. Causal connectors are not added (no honest-rewrite corpus to measure them).
- Qualifiers before a number: pt, nl, it, pl, id, tr as listed in `docs/BEST-RIVAL-r8.md`; ambiguous bounds (`do`, `sampai`, `hasta`-like with a year) follow the existing year rule.
- `UNIT_WORDS`: add pl (`sekund`, `sekundy`, `minut`, `godzin`, `dni`, `procent`), id (`detik`, `menit`, `jam`, `hari`, `persen`), it (`secondi`, `minuti`, `ore`, `giorni`, `percento`), nl (`seconden`, `minuten`, `dagen`).
- Tests per language per class; `lost unit` for `4,8 detik` to `4,8`.

## T5 hook (G10) in `hooks/rewrite-prompt.sh`, `test/fixtures/prompt-hook.json`
- Add pl and id verbs (`przepisz`, `popraw`, `wygładź`, `tulis ulang`, `perbaiki`, `rapikan`) to the generic list and nouns (`tekst`, `akapit`, `artykuł`, `teks`, `paragraf`, `artikel`, `kalimat`) with the same two-tier rule.
- Fixture: at least 6 related and 6 unrelated prompts in each language; the measured precision rule of the test stays.

## T6 references, SKILL.md, verify note (G11, R8-3, R8-6)
- New `references/id.md`, `tr.md` (corpus-backed; mark each phrase with evidence level and say they are everyday words, judge the sentence), `nl.md`, `pl.md` (class translations, say there is no measured evidence). Same two-tier format as `pt.md`. No `.tells.txt` for these four.
- `en.md`: add the mid-2026 corrective-framing family (own wording, facts from the Wikipedia page, CC BY-SA 4.0 noted).
- `SKILL.md`: reference list names the new files; a claims-audit step (number, date, name, quote, negation, modality, quantifier, cause: list the claims of the source, check each against the rewrite); an honest line that outside en, es, pt, de, fr a clean `--verify` proves less.
- `src/cli.ts`: `--verify` prints `note: no tell catalog for <lang>; the read-back by class is the check` when `loadCatalog` is empty; exit code unchanged.
- `THIRD-PARTY-NOTICES.md`: ideas adapted from empios/humanizer-polish and Vladimir-Human/humanizer-ru (MIT). `CHANGELOG.md` entry. Update `test/skill.test.mjs` REFERENCES list.
