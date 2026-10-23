# Rival research for the 6-language held-out round (2026-10-23)

Scope: blader/humanizer delta, other tools, fact-preservation methods, Wikipedia delta. Nothing was run from any rival repo; all files were downloaded as text into scratchpad dirs and read only. No sealed set and no credentials were read. `gh api` (read-only GET) was used after the unauthenticated GitHub quota (60/h) ran out.

Working files (all under /private/tmp/claude-501/-Users-efe-Desktop-portfolio/5c2ddf61-3163-4e0d-a0c8-8a4e65203570/scratchpad/):
- work/blader/ (current main SKILL.md, CHANGELOG.md, README.md), work/pr308.diff, work/pr309.diff
- work/signs.wiki (en Signs of AI writing, revid 1381428541, 2026-10-22), work/signs_jun.wiki (revid 1357064563, 2026-05-31)
- repos/ (README + file tree + meta per repo), repos/vh_check_facts.py, repos/ko_fidelity.py, repos/pl_audyt.md, repos/dl/ (other raw files)

---

## 1. blader/humanizer upstream delta

Result: **there is no delta on main.** Pinned commit 8c307f367c91bd974002f10f2be2965d642c13df is the current head of `main`.

- Evidence: `GET /repos/blader/humanizer/compare/8c307f3...main` returned `status=identical, ahead_by=0`. The commit list's first entry is 8c307f3 (2026-10-16). Raw `SKILL.md`, `CHANGELOG.md`, `README.md` from `https://raw.githubusercontent.com/blader/humanizer/main/<file>` are byte-identical (`diff -q`) to the pinned copies in `bench/head-to-head/competitors/blader/`. SKILL.md is 32,348 bytes.
- Latest release/tag: v3.1.0 (tag commit 225a6f39ac85f76ee48dbad772ea4abe4ed6c9d8, 2026-09-28). `https://github.com/blader/humanizer/releases/tag/v3.1.0`. Repo: 59,725 stars, MIT, last push 2026-10-16.
- The four commits after v3.1.0 (1fde9fa, 6be1fa4, 4f40355, 8c307f3) only change README sponsorship/badges text.

What is **not merged but open** (these are the only "new" blader-side ideas; read from the PR diffs, `https://github.com/blader/humanizer/pull/<n>.diff`, treat as unreleased and untrusted):

| PR | Date | What it adds | Use for us |
|---|---|---|---|
| #308 "Fold four tells into patterns 2, 4 and 26" (SKILL.md 3.1.1) | 2026-10-02 | No new pattern. Adds to §2 a closing line that echoes the opening line; to §4 "In today's fast-paced world", "As we all know", "I know this is hard" (performed sympathy), and a question the next sentence answers ("Why? Because..."); to §26 a reply that opens by restating what the other person just said ("You mentioned that...", "As you said"). | Cheap EN tells. Rhetorical-question-then-answer is language-independent and checkable (`? <Capital>` within one paragraph start). |
| #309 "Add Russian language support" | 2026-10-14 | New `ru.md` (128 lines) read when the text is Russian. It **replaces** blader's dash rule (§8), quote rule (§21) and hyphen rule (§10) for Russian because Russian dashes are grammatical, guillemets are standard, hyphens are orthographic. Adds sections: not X but Y in Russian, run-ups, kantselyarit (bureaucratic nouns), marker words, significance/ad language, English calques, closing summaries, chatbot wrappers, voice, one full example. Rule: "Always answer in the language of the text." | Confirms the design we already have (per-language overrides, `dash` not applied to correct typography). Pattern to copy: a per-language file that overrides specific global rules by section number. |
| #312, #315, #307, #304 | Oct | Gemini/Antigravity install, pi package manifest, plugin manifest schema, validator. | Nothing for rules. |

Rules in the **pinned** SKILL.md that bear on your four questions (so you do not re-read; line numbers are in `/Users/efe/Desktop/Open-Source/projelerim/ai-slop-linter/bench/head-to-head/competitors/blader/SKILL.md`, same as current main):

- Numbers/names/quotes kept unchanged: step 2, line 37: "Do not add a fact, name, number, date, quote, or citation unless it comes from the source or the user. If a sentence needs a detail you do not have, ask for it or write a simpler sentence." Step 3 (line 38): the self-check asks whether the rewrite "added or dropped any fact, name, number, date, quote, citation, ranking, or claim that things happen at once"; "an unsupported addition is an error". File mode (line 51): keep code blocks, inline code, commands, paths, YAML, data, link targets unchanged. The same rule is in README. No script enforces any of it.
- When to leave text alone: line 385: leave a watched phrase alone inside a quotation, a title, a proper name, or a passage that discusses the phrase; salutations/sign-offs predate chatbots; text written before 2022-11-30 is not AI-written; "People who judge by feel do little better than chance"; keep unusual specific details, mixed feelings, dated references, first-person choices, genuine asides.
- Other languages: line 61 says the not-X-but-Y formula "appears in every language"; no per-language rules in main. Language handling exists only in the open Russian PR.
- Self-checks: step 3 "read it aloud; what still sounds AI-generated; did it add/drop a fact", then re-scan. All prompt-level, no deterministic check.

Where blader wins in our measured rounds (already in BEST-RIVAL-r6/r7, not repeated): process text (mark tells, draft, check, re-scan) and refusing to touch clean text. Nothing in upstream changed since.

---

## 2. Other tools

Stars/licence/last push are from the GitHub API on 2026-10-23 (search listing or `gh api repos/...`). "Facts check" = does it check that numbers/names/dates survive a rewrite, and how.

### 2a. Humanizer forks and language variants (by language of interest)

| Tool (URL) | Licence | Stars | Last push | Languages | Facts check | Does that we do not |
|---|---|---|---|---|---|---|
| Vladimir-Human/humanizer-ru https://github.com/Vladimir-Human/humanizer-ru | MIT | 129 | 2026-10-21 | ru | **Yes, script** `skills/humanizer-ru/scripts/check_facts.py` (673 lines, stdlib): numbers with unit, scale words (тыс/млн), spelled-out numbers (compound "двадцать пять"), dates with month names + `dd.mm.yyyy`, times, URLs (strips utm), emails, names (first-name list, capital-elsewhere heuristic), quotes, negations, hedge words, modality words (может, обычно, иногда, всегда, некоторые, один из, только, если, по данным), "who got which number" bindings, intensifier increase. Splits output into `errors` (exit 1) and `checks` (human look). Header says an empty report does not prove meaning is intact. | Modality, negation and hedge-word delta; number-to-entity binding; unit synonym canonicalisation; stem matching for case endings; spelled-out numbers; error/check split. |
| comol/Humanizer_RU https://github.com/comol/Humanizer_RU | MIT | 16 | 2026-08-31 | ru | Not read (linter + metrics modules `linter.py`, `metrics.py`, `selftest.py`). Not verified. | Readability linter for ru. |
| ilyautov/humanizer-ru https://github.com/ilyautov/humanizer-ru | MIT | 484 | 2026-10-19 | ru | Prompt-level "fact-lock"; has `docs/facts.js` and `eval/` calibration docs (LLMTrace, AINL). Not read in depth. | Calibration against corpora. |
| ilyautov/humanizer-it https://github.com/ilyautov/humanizer-it | MIT | 5 | 2026-10-22 | it | Prompt-level "Fact-lock (overrides any pattern)": numbers, dates, names, titles, percentages, units carry over; adding facts forbidden (SKILL.md in `skills/humanizer-it/`). Python scanner `scripts/scan.py` counts hard bans/markers/rhythm and prints `CLEANLINESS: N/100`; has `eval/calibrate.py` + corpus. Its own README "after" example invents "tre progetti... Due sono andati il doppio più veloci" (an example that breaks its own fact-lock). | 52 Italian patterns (IA-taliano: English-syntax calques, nominal burocratese, missing intercalari and ci/ne clitics, flattened antifrasi), a 0-100 score, calibration scripts. Cites Treccani 2023 catalogue and De Cesare. Only Italian source of that kind found. |
| hypnosdesign/claude-skill-scrittura-italiana https://github.com/hypnosdesign/claude-skill-scrittura-italiana | **CC BY-SA 4.0** (idea-only) | 21 | 2026-10-12 | it | Prompt-level "guardia sui fatti"; evals with false-positive cases (`evals/03-falsi-positivi.md`) and activation tests. | False-positive test cases as a first-class eval. |
| empios/humanizer-polish https://github.com/empios/humanizer-polish | MIT | 0 (created 2026-10-14) | 2026-10-20 | pl | **Yes, script** `scripts/porownaj_wersje.py` (read in full): before/after compare of numbers (`0,53`=`0.53`, `1 804`=`1804`, `8`=`osiem` for 2-20 with inflected forms), legal provisions (art., ust., pkt, §, Dz.U.), case signatures, citations `[3-5]`/DOIs/URLs, quotes `„..."`, placeholders `{{x}}`, and **counted** modality (musieć, powinien, może, można, należy, trzeba, wolno, obowiązek, zakaz, uprawnienie), negations (nie, nigdy, żaden, nikt, nic, ani), and contract-party roles (najemca, wynajmujący, powód, pozwany...). Exit 1 on any difference. | Polish spelled-out numbers with inflection; counted modality/negation/party delta; legal references. |
| PawelASzczesny/humanizer-pl https://github.com/PawelASzczesny/humanizer-pl | MIT | 0 | 2026-07-26 | pl | Prompt-level **semantic audit** `references/audyt-semantyczny.md` (92 lines, read in full): list claims in eight classes (definition, claim, number, proper name/norm number/quote, quantifier, modality, condition/exception, cause), table original vs edit with status zgodne/ryzyko/rozbieżność, verdict line; "eight traps" (synonym shifts a defined term, simplification swallows a condition, dropped exception, swapped quantifier, shifted modality, glued claims, split claims, shifted scope e.g. "od 2025" vs "w 2025"). `scripts/validate.py` (15 KB), `evals/run_evals.py`. 41 patterns, PWN norm, `references/typografia.md`, `gatunki.md` (genres). | The audit protocol and the trap list; genre exceptions; Polish typography file. |
| clone147/humanizer-pl https://github.com/clone147/humanizer-pl | MIT | 3 | 2026-10-06 | pl | Prompt rule: never add facts, numbers, dates, names, opinions; marks gaps with a placeholder. README states its own lesson: patterns 30, 31, 37 told the model to invent concrete numbers, company names and deliberate imperfections and were removed. | Evidence that "be concrete / add imperfection" rules cause fabrication. |
| mkh63d/polish-humanizer https://github.com/mkh63d/polish-humanizer | MIT | 0 | 2026-09-10 | pl | `scripts/skan.py` (zero dependency) with `--porownaj` before/after counts; keeps facts, meaning, register, voice. `references/detektory.md` on what detectors measure. | Before/after counters. |
| pielas-activy/humanizer-pl https://github.com/pielas-activy/humanizer-pl | NOASSERTION (idea-only) | 9 | 2026-06-15 | pl+en | Fork of blader + Polish layer; Bielik (Polish LLM) advisor tools; evals. | Local Polish-LLM review. |
| waylooking-hub/polish-humanizer | MIT | 8 | 2026-04-27 | pl | Prompt only, 44 tells. Not read. | |
| omelyanchuk2593/humanizer-es https://github.com/omelyanchuk2593/humanizer-es | NOASSERTION (idea-only) | 0 | 2026-08-26 | es | `scripts/lint.py` (58 KB) CI-gating linter; `references/patterns.md` (108 KB, 69 patterns); evals + fixtures. SKILL.md section "Cifras, fechas y billón": **billón (1e12) vs billion (1e9) is a fact corruption, not a style tic**; also month-day-year order, apostrophe thousands, currency before number, mixed `.`/`,` separators; decimal separator is a variety parameter (comma in Spain/Southern Cone, point in Mexico/Central America/Caribbean), so not an error. Rule "never invents a fact"; genre exceptions (verse, clinical note, law). | The billón rule and per-variety decimal separator rule. |
| madebydiego/humanizador https://github.com/madebydiego/humanizador | MIT | 0 | 2026-08-03 | es | Prompt: real data stays intact, "zone not in the original is marked instead of invented"; country packs. Not read in depth. | Country packs (es-MX, es-AR...). |
| ervin-mo/humanizar-es https://github.com/ervin-mo/humanizar-es | NOASSERTION | 6 | 2026-10-08 | es+en | Pipeline `rewrite → fidelity → rhythm → selection`; `scripts/check.py`, `rewrite.py`; local model, "controlled experiments". Fidelity stage not read. | A fidelity stage before selecting a candidate. |
| mattc95/Humanizer-es, alvaromieres9/humanizer-es, Milevan/humanizer-es, dorelysm/naturalizacion-texto-es | MIT | 0 to 5 | 2026-04..09 | es | Prompt-only skills (12 calques; 11 techniques). Not read in depth. | |
| mackswendhell/humanizer-pt-br https://github.com/mackswendhell/humanizer-pt-br | MIT | 54 | 2026-05-10 | pt-BR | Prompt-only (SKILL.md 25 KB). | |
| Blackspirits/humanizer-pt-pt https://github.com/Blackspirits/humanizer-pt-pt | MIT | 1 | 2026-09-13 | pt-PT (AO90) | JSON schema contracts `contracts/audit-response.schema.json`, `rewrite-response.schema.json`, `eval-corpus.schema.json`. | Structured audit/rewrite response schemas. |
| brunoflma/jusmanizer https://github.com/brunoflma/jusmanizer | MIT | 11 | 2026-09-29 | pt (legal) | Central rule: preserve facts, names, values, dates, requests, sources, transcriptions; `scripts/jusmanizer.py` + tests. Not read in depth. | Legal-text profile. |
| natagomes01/humanizador-br | CC BY-SA 4.0 (idea-only) | 0 | 2026-07-27 | pt-BR | `scripts/scan_ptbr.py`; "translationese" stage. | |
| Henzen3d/Deslop-ptBR, msigor/humanizer-br, saofraga/humanizador-pt | MIT | 1-3 | 2026 | pt | Not read. | |
| onesoira/humanizer-bahasa-indonesia https://github.com/onesoira/humanizer-bahasa-indonesia | MIT | 16 | 2026-10-21 | id | Prompt: "Setia pada isi: makna dan fakta dipertahankan, tidak ada detail yang ditambahkan". | |
| adeabramihza/humanizer-id | MIT | 0 | 2026-07-30 | id | Formal/EYD; targets "dalam rangka", "guna menunjang", "merupakan" overuse, "tidak hanya X tetapi juga Y". | Indonesian-specific bureaucratic phrases. |
| ardha27/humanizer-id https://github.com/ardha27/humanizer-id | MIT | 0 | 2026-08-21 | id | Slang lexicon (82 KB jsonl, HuggingFace-derived), "gaul to baku" mapping, TTS-style number rule. | Colloquial register data. |
| williamkho77/claude-humanizer-id, dipras/humanizer-id (GPL-2.0), others | none / GPL-2.0 | 0-5 | 2026 | id | Not read. | |
| bushrabeg/turkce-humanizer https://github.com/bushrabeg/turkce-humanizer | MIT | 87 | 2026-08-23 | tr | Prompt-only. | |
| inanc76/turkish-native-humanizer https://github.com/inanc76/turkish-native-humanizer | NOASSERTION (idea-only) | 0 | 2026-10-19 | tr | `scripts/olc.mjs` (531 lines, node, zero imports beyond node:*) with `olc --karsilastir --once old --sonra new`: "olgu koruma" catches dropped or invented numbers, dates, URLs, currency (header says K63). 87 Turkish patterns, register diagnosis, Ateşman readability using vowel count = syllable count, counters with thresholds per paragraph (e.g. -mektedir/-maktadır >= 4 per paragraph). Says "Bu script ADAY üretir, HÜKÜM VERMEZ" (candidates, not verdicts). | Per-paragraph density thresholds, Turkish readability. |
| batuhan-bas/trilingua (MIT, 3), durmazoguzhan/turkish-humanify (MIT, 5), RizgarOzan/turkce-humanizer (MIT, 3) | MIT | 3-5 | 2026-09 | tr (+en, ar) | Prompt-only. Not read. | |
| **Dutch (nl)** | | | | | Searched "humanizer nl/nederlands", "nederlandse tekst AI schrijfpatronen", "claude skill nederlands": **no Dutch AI-writing humanizer or linter found.** Only unrelated Dutch skill collections (GianlucaNaarden/claude-skills-nederlands 143 skills, MIT, 1 star). | We would be first; also no external source to calibrate against. |
| kekmodel/humanizer-ko https://github.com/kekmodel/humanizer-ko | NOASSERTION (idea-only) | 0 | 2026-09-19 | ko | **Yes, script** `scripts/fidelity_check.py` (227 lines): exits 0/1/2/3 (clean / warn / reject the rewrite / bad input). Checks: char change rate and length ratio (notes that difflib counts deletion as half, so 30% deleted reads as 17.6%), numbers+units+dates must neither vanish nor appear, Latin tokens/acronyms, quoted spans, Korean quantity/negation/modal cues, footnote markers `[^n]`/`[n]` must be the same set, register shift (formal ending count), comma-after-connective growth (rewrite injecting a new tell), share of sentences fully rewritten (touching sentences that had no tell). Header: exit 0 "is not a guarantee of meaning". | Exit-code tiers; over-editing check (rewriting sentences that had no tell); "rewrite injected a new tell" check; footnote markers. |
| epoko77-ai/im-not-ai https://github.com/epoko77-ai/im-not-ai | MIT | 6,184 | 2026-10-12 | ko | Multi-agent pipeline (diagnostician, finalizer, taxonomist, translation scholar, post-editese metric engineer). Prompt-level. Not read in depth. | Largest Korean tool. |
| op7418/Humanizer-zh https://github.com/op7418/Humanizer-zh | MIT | 20,471 | 2026-09-23 | zh | Translation of blader v2.x. | Zh variants (several, not relevant to the 6 languages). |
| textlint-ja/textlint-rule-preset-ai-writing https://github.com/textlint-ja/textlint-rule-preset-ai-writing | MIT | 1,154 | 2026-06-16 | ja | Pure linter, no rewrite. Rules in `src/rules/`: ai-tech-writing-guideline, no-ai-colon-continuation, no-ai-emphasis-patterns, no-ai-hype-expressions, no-ai-list-formatting (+ more not listed). | Ships as a textlint preset with per-rule toggles. Our repo already has `textlint-rule-ai-slop/`. |
| devswha/patina https://github.com/devswha/patina | MIT | 378 | 2026-09-29 | ko/en/zh/ja | Multi-language humanizer with issue templates (false_positive, calibration_concern, pattern_proposal, benchmark_corpus). Not read in depth. | Issue templates that collect false positives and calibration concerns. |

### 2b. Other open-source tools for the same job

| Tool | Licence | Stars | Last push | Languages | Facts check | Notes |
|---|---|---|---|---|---|---|
| Aboudjem/humanizer-skill https://github.com/Aboudjem/humanizer-skill | MIT | 287 | 2026-09-06 | en (READMEs in zh, ja, es, fr) | **Yes, Node, zero dependency** `cli/lib/facts.js` (208 lines, read in lines 1-140): urls, dates, percentages, versions, numbers, acronyms; sorted unique normalised sets; ordering of passes blanks consumed spans; `SIBLINGS` so a number found as version counts as present. Month table and number format are **English only** (`12,500.5`), dates only `YYYY-MM-DD`, `Month d, yyyy`, `d Month yyyy`. Has `cli/test/facts.test.js`. | Closest in design to our `--compare` (same language, same dependency policy). Shows what a rival ships: 55 patterns, 5 voices, 0-100 score. Its limits are exactly our multilingual gap. |
| theserverlessdev/wsc https://github.com/theserverlessdev/wsc | MIT | 9 | 2026-10-14 | en | no | Prose linter + AI-tell detector: 8 detectors (weasel, passive, duplicates, long sentences, nominalisation, hedging, filler adverbs); web editor, HTTP API, MCP server (npm `wsc-mcp`), CLI, GitHub Action; each flag cites a corpus study. |
| ahmedak/defluff https://github.com/ahmedak/defluff | MIT | 2 | 2026-07-25 | en only ("English only in v0") | no | Deterministic, with `eval/validation.jsonl` and `eval/score.py`. |
| JeanStory/deslop | MIT | 0 | 2026-07-06 | en | no | Zero-dependency detector. |
| eugeniughelbur/clearmode https://github.com/eugeniughelbur/clearmode | MIT | 2 | 2026-08-29 | en | no | Score 0-100 against rules (`rules/clear-100.json`), hooks `check_outgoing.py`, `check_reply.py`, Vale style, based on ASD-STE100. |
| mat10tng/easy-read | Apache-2.0 | 1 | 2026-10-19 | en | no | Plain-language rules + Vale style. |
| tbhb/vale-ai-tells; Krishna Sunkam vale-ai-tells; JMill/deslop (Vale) | MIT (per listing) | ? | 2026 | en | no | **Seen only in a search snippet / aggregator** (tomevault.io, everydev.ai). tbhb's is already vendored in our `_upstream/vale-ai-tells/`. Not re-verified. |
| petergyang/no-ai-slop https://github.com/petergyang/no-ai-slop | MIT | 12,709 | 2026-09-02 | en | no | 20+ patterns, 10.8 KB SKILL.md, `eval.md`. |
| hardikpandya/stop-slop, conorbronsdon/avoid-ai-writing (5,191), berelevant-ai/slopless, yasyf/slop-cop, jlwin/unslop, m4bwav/everwrite | MIT | | | | | Already read in RESEARCH-DEEP-2026-10-22.md. Not repeated. |
| notnotype/llmlint | **AGPL-3.0** (idea-only) | 11 | 2026-08-15 | zh | | Rules + judgement fix. |
| ilien-dev/quiron | **AGPL-3.0** (idea-only) | 60 | 2026-09-25 | multi | | Humanizer skill. Not read. |
| marmbiz/humanizer-de | NOASSERTION (idea-only) | 183 | 2026-10-03 | de | content-audit CI workflow, CHANGELOG 29 KB. Not read in depth. | German; we already have de. |
| DadaNanjesha, rudra496/StealthHumanizer, Turnitout-Humanizer, kurelas/text-humanizer | various | | | | | **Detector-evasion tools**, different goal; ignored. |

### 2c. Open-source AI-text detectors (for calibration, not for adoption)

| Tool | Licence | Stars | Last push | Languages | Notes |
|---|---|---|---|---|---|
| ahans30/Binoculars https://github.com/ahans30/Binoculars | BSD-3-Clause | 430 | 2024-05-14 | README: "more proficient in detecting English language text compared to other languages" | Needs two causal LMs (torch); not offline/zero-dependency. |
| lynote-ai/ai-text-detector https://github.com/lynote-ai/ai-text-detector | MIT | 651 | 2026-10-13 | production model XLM-R / ModernBERT "optimized for en / zh / pt / es" | Also a "cautious, explainable" no-network CLI/skill for triage. |
| pablocaeg/sloptotal https://github.com/pablocaeg/sloptotal | MIT | 72 | 2026-10-21 | README: es, fr, de, it, pt, nl, pl, ru, ja supported (AUC 0.91 to 0.997); ar, ko experimental; **hi, tr, zh "not reliable yet, and the report says so"**; id not mentioned | 23 engines, one calibrated score. The honest per-language reliability statement is worth copying in wording. |
| apoapostolov/humanizer https://github.com/apoapostolov/humanizer | MIT | 9 | 2026-10-23 | en | `ai-writing-detector` skill with analyze.js, fixtures `validate-before/after`. Not read in depth. |
| yzhao062/pyod, YuchuanTian/AIGC_text_detector (Apache-2.0, 474) | | | | | Research detectors; GPU/model dependent. |

### 2d. Public skill directories (skills.sh, claude-plugins, awesome lists)

**Not verified.** I did not crawl skills.sh or claude-plugins listings; GitHub search was used instead (it surfaces the same repos). Treat the tables above as a GitHub-search sample, not a census.

---

## 3. Fact-preservation methods

### 3a. What exists (read)

1. Rewrite-side scripts above, all heuristic and offline: Vladimir-Human `check_facts.py` (ru), empios `porownaj_wersje.py` (pl), kekmodel `fidelity_check.py` (ko), inanc76 `olc.mjs` (tr), Aboudjem `facts.js` (en). Common design: extract typed tokens from both texts, normalise, compare as multisets, report `errors` vs `checks`, state that a clean report is not proof.
2. Our own `src/compare.ts` already extracts number, unit, version, date, url, reference, quote, code, name, person, claim, qualifier. Documented limits in its header (`src/compare.ts` lines 7-9 and 33-36): spelled-out numbers not extracted (`forty percent`); dotted thousands read as versions (`1.000.000` is a version fact); a qualifier placed after its number (`40 % environ`) not read; negation and modality not read as facts.

### 3b. Papers and metrics (mostly from search snippets, not opened in full)

- Evaluating Factuality in Text Simplification (ACL 2022), https://ar5iv.labs.arxiv.org/html/2204.07562 : taxonomy of errors by precision, recall and accuracy of information; a wrong number is an accuracy error, a dropped number a recall error. *Snippet only.*
- Evaluating Document Simplification: separately assessing simplicity and meaning preservation, https://arxiv.org/abs/2404.03278 ; MeaningBERT "unable to pass two trivial content preservation tests". *Snippet only.*
- CLEF 2025 SimpleText Task 2 "Identify and Avoid Hallucination", https://www.dare.uva.nl/id/712bfb4d-eed0-4143-b479-fe795f04630c : overgeneration and distortion can be detected with high accuracy; fine classification still needs humans. *Snippet only.*
- Entity-based semantic adequacy (precision/recall/F1 over named entities of input vs simplified output). *Snippet only, paper title not captured.*
- SummaC, QAFactEval (reference-less faithfulness; authors warn they favour shorter outputs). *Snippet only.*
- Steganography/LLM-monitoring paper arXiv 2602.23163 uses an LLM judge with a prompt that asks whether "all dollar amounts, percentages, ratios and numeric figures are preserved exactly" and returns PRESERVED/DEGRADED. *Snippet only.*
- From memory, not fetched: FActScore (atomic-fact precision against a knowledge source), FactCC, AlignScore, DAE/NLI-based entailment, SARI/BLEU (surface only).
- The search tool found **no published numeric-consistency metric for rewrites**; the practical state of the art is the script family in 3a.

None of the NLI/QA/embedding metrics can run offline in a zero-dependency Node CLI: they need a model. They are not options.

### 3c. What can be deterministic, offline, zero-dependency in Node

Everything below is string work on two texts, in the style of `--compare`. All of it is derived from the scripts in 3a plus the language tables I reasoned out; the number-format algorithm is my own design (not copied).

**Number tokens across formats (`1.250,50` / `1 250,50` / `1,250.50`):**
1. Find candidates with one regex allowing group separators `.`, `,`, space, NBSP (U+00A0), narrow NBSP (U+202F), thin space, apostrophe (Swiss `1'250`).
2. If both `.` and `,` occur, the **last** one is the decimal mark and the other is the group mark. `1.250,50` and `1,250.50` both become `1250.50`.
3. If one kind occurs more than once (`1.250.000`, `1,250,000`) it is a group mark.
4. If one kind occurs once: followed by exactly three digits with 1-3 leading digits (`1.250`, `1,250`) it is **ambiguous**: keep two candidates `{1250, 1.25}`. Otherwise (`0,53`, `3.5`, `12,5`) it is a decimal.
5. A space or NBSP group (`1 250,50`) is a group mark only when every group after the first has exactly three digits.
6. Use the declared language to resolve ambiguity when the file has `--language` (de, es-ES, pt, nl, id, pl, it, tr: comma decimal; en, es-MX: point decimal), and **never resolve it silently**: two texts match if their candidate sets intersect. Comparing in the same text first (a text that contains `1.250,50` proves `.` is a group mark in that document) resolves most ambiguous tokens.
7. Hold values as strings of digits plus a decimal position, never floats (`0.1+0.2`). Compare as multisets so a number that appears twice and once is a loss.
8. Percent and currency: strip spacing (`40 %`, `40%`, `%40` for tr), accept symbol before or after (`€50`, `50 €`, `50 euro`, `EUR 50`), map word forms per language in a small table. Report as `unit` fact attached to the number.
9. Dotted thousands vs versions: `1.250.000` with three groups of three digits is a number; `3.2.1` is a version. (This is the documented gap in `src/compare.ts` line 8.)

**Month names:** one table per language, matched as lower-case stems with the first three letters plus an explicit list for collisions: es enero..diciembre, pt janeiro..dezembro, nl januari..december (maart, mei), pl styczeń/stycznia ... grudzień/grudnia (genitive forms are what appear in dates), id Januari..Desember (Mei, Agustus), it gennaio..dicembre, tr Ocak..Aralık. Vladimir-Human's `MONTH_STEM` (first three letters) is the pattern. Numeric dates `d/m/y` vs `m/d/y`: when both parts are at most 12, compare as an unordered pair plus year rather than guess.

**Spelled-out numbers:** safe subset only. Table of 0-20, tens, 100, 1000, million for each language with inflected forms where needed (empios `LICZEBNIKI` for Polish 2-20; Vladimir-Human `WORD_NUM` for Russian), skipping ambiguous words that are also articles/pronouns (es `un/uno`, pt `um`, nl `een`, id `satu`, pl `jeden`, it `uno`; both rewrites above skip "one" for this reason). Compounds: es `veintiuno`, pt `vinte e um`, it `ventuno`, nl `eenentwintig` (units first), id `dua puluh lima`, pl `dwadzieścia pięć`. Report spelled-out versus digit changes as `check`, not `error`, because rewriting `8` to `osiem` is legitimate.

**Scale words (fact corruption by false friend):** map to a power of ten before comparing. en billion 1e9; es `mil millones` 1e9, `billón` 1e12; pt-BR `bilhão` 1e9, `trilhão` 1e12 (pt-PT `bilião` 1e12); nl `miljard` 1e9, `biljoen` 1e12; pl `miliard` 1e9, `bilion` 1e12; id `miliar` 1e9, `triliun` 1e12; it `miliardo` 1e9, `bilione` 1e12; tr `milyar` 1e9, `trilyon` 1e12. Source: omelyanchuk2593/humanizer-es SKILL.md section "Cifras, fechas y billón" (es only; the other languages are my table from general knowledge and must be verified before shipping).

**Units:** canonical map per language and symbol (km/kilómetro/kilometer, kg, °C, h/uur/jam/godz., min). Compare `(value, canonicalUnit)` pairs; a changed unit with the same value is an error.

**Names:** capitalised tokens not at sentence start, plus a first-name list per language only when the language does not capitalise common nouns (do **not** use for de). Stem comparison for case endings in pl and tr (Vladimir-Human `stem_match`: share all but last two letters, at least 3). Our `name` kind already exists; the multilingual part is the stem match and Polish/Turkish suffix handling (`Ankara'da`, `Warszawie`).

**Quotes:** normalise `„ ” « » “ ” ‘ ’ ' " 「 」` and compare quoted content with whitespace collapsed (empios `_CYTAT`, kekmodel `QUOTE_RE`).

**Modality, negation, quantifier and hedge words (the part we lack):** counted lists per language, report increases and decreases per word class as `check`. Seeds are in empios `MODALNE`/`PRZECZENIA` (pl) and Vladimir-Human `MODALITY`/`NEG_WORDS`/`INTENSIFIERS` (ru). For es/pt/nl/id/it/tr we would need our own lists (e.g. es puede/debe/podría/siempre/nunca/algunos/solo si; nl kan/moet/zou/altijd/nooit/sommige/alleen als; id dapat/harus/mungkin/selalu/tidak pernah/beberapa/hanya jika). The false-positive risk is real (hedge removal is also a legitimate fix, because cutting hedge stacking is our own rule), so report only a *drop* of a word that sits next to a number or a named entity, and keep everything else as an informational count.

**Over-editing and new-tell injection (kekmodel):** share of sentences changed that contained no tell in the original; `after` having more tells than `before` of any rule. We have `--verify` with length bound and missing sentences (`src/rewrite-guard.ts`); these two checks are additions.

**Limits to state in the tool output:** none of this proves meaning is intact (every script above says so); a rewrite that changes a negation without changing a count of negation words passes; binding "which number belongs to which entity" needs the span-window check from Vladimir-Human (`compare`, lines 446-615, not read in detail).

---

## 4. Wikipedia delta

Method: raw wikitext via `https://en.wikipedia.org/w/index.php?title=Wikipedia:Signs_of_AI_writing&action=raw`. Current revision 1381428541 (2026-10-22T12:18:08Z), 229,263 bytes, 2,023 lines. Comparison revision 1357064563 (the last revision before 2026-06-02), 210,439 bytes. Heading names changed a lot, so the "added" heading list from the diff is noisy; the items below were each read in the current wikitext (lines in `work/signs.wiki`).

New or substantially changed content since the June 2026 revision that is **not** in our `skills/ai-slop-linter/references/*.md`, `src/` or `docs/RESEARCH-R6.md` (I grepped for the key phrases; no hits):

1. **"Mid-2026-present" corrective framings** (lines 986-1005, shortcut WP:AIDISCLAIMER). Three patterns, said to be near-absent before mid-2026 (roughly the July release of GPT-5.6): (a) negative parallelism with "rather than" warning that a source or claim should be treated as speculative/subjective/symbolic **rather than** definitive/verified ("should be treated as religious tradition rather than as an archaeological explanation"); (b) cautioning that the information "does not establish" a firm conclusion ("It does not establish that X has a particular contamination problem"); (c) "should not be confused with" another topic (the page marks this one less reliable). Cites Graphite "AI Tells" (2026-09-16). Phrase hits: `should be treated as`, `rather than as`, `does not establish`, `should not be confused with` — none are in our en tells.
2. **Em dash moved to "Historical indicators"** (heading "Overuse of em dashes (2022–September 2026)", line 1930). Text: newer models (September 2026 onward) are hard-coded not to use em dashes; the side effect is lower punctuation variety, commas and periods now more frequent than in human text (tagged `{{cn}}`, citation needed, October 2026), "and now that has become its own sign". Also: a July 2026 study found that of contemporary models only Claude used em dashes more than professional writers (sentence truncated in my 900-character cut; read the line directly before quoting). Effect for you: a held-out text with zero dashes is no longer evidence of human writing.
3. **"Signs of human writing" > Syntax** (lines 1853-1862, new): human Wikipedia text uses more of: simple *is/has* (`there is a`, `it has a`); plain verbs instead of stiff synonyms (`wrote` vs `authored`, `moved` vs `relocated`, `used` vs `utilized`, `tried` vs `attempted`, `died` vs `passed away`); superlatives and definitive statements (`one of the best`, `is the only`, `was the first`); qualifiers/intensifiers (`very`, `perhaps`, `tends to`); isolated wordy constructions (`as a result of`, `in order to`, `all of the`, `the fact that`). This is evidence for what **not** to remove and what a rewrite should land on. Source: Reinhart et al. PNAS, cited on the page.
4. **"Ineffective indicators"** (line 1864): perfect grammar, mixed casual+formal register, "bland/robotic" prose, "fancy/academic" prose are not reliable indicators. Supports leaving such text alone.
5. **"Differences between LLMs"** (line 1827) and **"Pro-authoritarian bias"** (line 1838, new): model idiolects differ (ChatGPT/Grok focus on broader context more than Gemini/Claude; Gemini/Claude shorter). Not usable as a rule.
6. **Lexical diversity / elegant variation** (line 1977, WP:AIELEVAR) has a new note: non-native editors may avoid repeated words too, and Italian schools teach avoiding repetition (Il Libraio and Cortelazzo cited). Relevant for the `it` held-out cell: do not flag synonym rotation in Italian as strongly.
7. Present in the current page and absent from the June heading list, but I did not check whether they were already in our references: **Emoji as formatting** (line 713), **Unusual use of tables** (784), **Heading errors / title heading / skipping heading levels / headings only containing other headings** (656-712), **"Awards and recognition" section** (348), **Vague expression of connection or association** (228, WP:AICONNECT), **Inline-header vertical lists** (566), **Phrasal templates and placeholder text** (1006, WP:AIPLACEHOLDER), **Markdown misuse: asterisks, number signs, link formatting, thematic breaks** (1102-1180), **chatbot markup leaks: oaicite, contentReference, turn0search, [cite: 1], [span_1](start_span), grok_card, lenticular brackets, ppl-ai-file-upload, :::writing** (1262-1420). The leak-token list is language-independent and cheap to lint; check it against `src/rules/`.

Licence: Wikipedia text is CC BY-SA 4.0. Use facts about patterns only, never copy prose or examples.

**Language editions.** Langlinks of the English page (API `prop=langlinks`) give exactly: de, fi, fr, he, pt, ru, th, zh. This equals the set already recorded in RESEARCH-R6.md. Titles: de "Wikipedia:Anzeichen für KI-generierte Inhalte", fi "Wikipedia:Merkkejä tekoälyn kirjoittamasta tekstistä", fr "Aide:Identifier l'usage d'une IA générative", he "ויקיפדיה:סימנים לכתיבה מבוססת בינה מלאכותית", pt "Wikipédia:Sinais de texto gerado por inteligência artificial", ru "Википедия:Признаки сгенерированности текста", th "วิกิพีเดีย:สัญญาณของการเขียนด้วยปัญญาประดิษฐ์", zh "Wikipedia:AI生成文的特徵". Per-edition project-namespace searches (API `list=search`, srnamespace 4) for es, nl, it, pl, id, tr returned **no dedicated "signs" page**:
- es, nl, pl, tr: only café/kroeg/kawiarenka/köy çeşmesi discussion archives and unrelated pages.
- it: discussion pages only ("Wikipedia:Bar/Discussioni/Una nuova policy sull'Intelligenza Artificiale?", "ChatGPT e Wikipedia", "ChatGPT e Wikipedia 2").
- id: policy pages `Wikipedia:Kecerdasan buatan` (read the first lines via action=raw: it is the WP:AI **policy**, not a list of signs), `Wikipedia:Permohonan pendapat/Kebijakan mengenai kecerdasan buatan`, `Wikipedia:Penyalahgunaan jangka panjang/Artikel AI`.
- ja: policy and draft `Wikipedia:大規模言語モデルの利用`, `.../改訂案` (title seen in search results only, content not read).
- ar: `ويكيبيديا:الذكاء الاصطناعي التوليدي` (title seen in search results only, content not read).
- ko: search returned only unrelated pages.
The Wikipedia API then returned HTTP 429 for several calls and the Wikidata sitelinks call failed (429), so the sitelinks cross-check is missing.

---

## 5. Not verified

- skills.sh, claude-plugins, awesome-list crawl: not done (see 2d).
- Contents of many small prompt-only repos (listed "Not read"): pt `mackswendhell`, `Blackspirits` beyond file names, es `mattc95`, `dorelysm`, `Milevan`, `alvaromieres9`, id `adeabramihza`, `onesoira` beyond README, tr `bushrabeg`; `ervin-mo/humanizar-es` fidelity stage; `omelyanchuk2593/humanizer-es` `scripts/lint.py`; `ilyautov/humanizer-it` `scan.py` and `eval/`; `comol/Humanizer_RU`; `epoko77-ai/im-not-ai`; `marmbiz/humanizer-de`; `devswha/patina`.
- Vladimir-Human `compare()` (lines 446-615): I read `extract()` and the lexicon, not the comparison/binding logic. The error vs check split is from its header only.
- Paper claims in 3b are from search snippets; none of the arXiv papers was opened. FActScore/FactCC/AlignScore are from memory.
- vale-ai-tells (Krishna Sunkam, tbhb) and JMill/deslop: from aggregator snippets only.
- Per-language month/number/scale tables in 3c other than the Spanish `billón` rule are mine, from general knowledge; verify with a native source before shipping, especially pt-PT vs pt-BR `bilião`, Polish genitive months, and Indonesian `bilion`.
- ja and ar Wikipedia pages: titles only.
- Star counts can change daily; the `Stars` column is from 2026-10-23 API calls. Where a search listing and `gh api repos/...` could differ, I used the listing.
- Whether our `references/` already hold items 6 and 7 of section 4 beyond the phrase grep above: grep checked only "should not be confused", "does not establish", "should be treated as", "elegant variation", "Awards and recognition", "is/has", "emoji", "pro-authoritarian". Emoji hits exist in `skills/ai-slop-linter/references/en.md` and `src/`.

---

## 6. Ranked gaps worth adopting

Ranking is by expected effect on a 6-language held-out round where the judge rewards fewer tells **and** unchanged facts, then by cost.

| # | Gap | Evidence | What users get | Licence | Adopt? |
|---|---|---|---|---|---|
| 1 | **Locale-aware number, date, unit and scale normalisation in `--compare`/`--verify`** (3c: group/decimal marks incl. NBSP/apostrophe, ambiguous `1.250` as a candidate set, month-name tables for es/pt/nl/pl/id/it/tr, scale-word table, unit and currency spellings) | `src/compare.ts` lines 7-9 and 33-36 (dotted thousands read as version, no spelled-out numbers); Aboudjem `cli/lib/facts.js` shows a rival is English-only; empios `porownaj_wersje.py` lines 14-60 and omelyanchuk2593 SKILL.md "Cifras, fechas y billón" show what multilingual needs | A rewrite of a Spanish, Polish or Dutch text that turns `1.250,50` into `1,250.50` or `billón` into `billion` is caught instead of passing or raising false alarms | Own code; ideas from MIT (empios, Vladimir-Human) with attribution; omelyanchuk2593 is NOASSERTION so idea-only | **Yes**: the only gap that touches all six held-out languages and our headline claim (facts unchanged). |
| 2 | **Spelled-out numbers (safe subset) as `check` facts** | `src/compare.ts` line 7; Vladimir-Human `WORD_NUM`/compound logic (`extract`, lines 60-100 and 330-365); empios `LICZEBNIKI` | Catches `three` becoming `four`, `drie` becoming `vier`, `dua belas` becoming `dua puluh` | MIT (both), adapt with attribution | **Yes**, as `check` not `error`; skip ambiguous articles (`un`, `een`, `satu`, `jeden`, `um`). |
| 3 | **Negation / modality / quantifier delta** (counted per class, report drops adjacent to a number or entity) | empios `MODALNE`/`PRZECZENIA`/`STRONY`; Vladimir-Human `MODALITY`, `NEG_WORDS`, `INTENSIFIERS`; Pawel `audyt-semantyczny.md` traps 2-5 and 8 ("od 2025" vs "w 2025") | Catches "may" to "will", "some" to "all", dropped "unless" — the facts a number check cannot see | MIT (empios, Vladimir-Human, Pawel) | **Maybe**: high value, but we need our own word lists for es/pt/nl/id/it/tr and hedge removal is also a valid fix, so report as informational count unless next to a number/name. |
| 4 | **Semantic-audit step in the skill text** (list claims in eight classes, table original vs rewrite, verdict line, "eight traps") plus "leave alone inside quotation/title/proper name" | Pawel `references/audyt-semantyczny.md` (92 lines); blader SKILL.md line 37-38 and 385 | The agent re-reads against the original with a checklist before returning; fewer silent scope shifts | MIT (Pawel, blader), adapt with attribution | **Yes**: cheap, prompt-only, matches what blader's process step already earns. |
| 5 | **Tiered exit codes plus "rewrite injected a new tell" and "touched sentences that had no tell" checks** | kekmodel `fidelity_check.py` header (exit 0/1/2/3, change rate vs length ratio, new-tell check, whole-sentence rewrite ratio) | `--verify` can say "do not accept this rewrite" (2) vs "report these items" (1); catches over-editing of clean text, which is where we lose to blader on ho4 | kekmodel is NOASSERTION: idea-only, write our own | **Yes** for the two new checks; tiers **maybe** (we already have `--verify` pass/fail). |
| 6 | **Mid-2026 corrective-framing tells in en** (`should be treated as X rather than Y`, `does not establish`, `should not be confused with`) | Wikipedia current wikitext lines 986-1005 | Catches the newest model disclaimers a 2025-era list misses | CC BY-SA 4.0: facts only, own wording | **Yes** for en, with the Wikipedia caveat that the third is less reliable; **no** translations until a native source exists. |
| 7 | **Do not treat dash absence as human; use human-syntax evidence as a "do not rewrite" signal** (simple is/has, plain verbs, superlatives, qualifiers, `in order to`) | Wikipedia lines 1853-1862 and 1930-1966; blader line 385 | Clean human texts (the ho4 loss) are left alone more often | CC BY-SA 4.0: idea only | **Maybe**: needs a per-language list; en only is safe. |
| 8 | **Chatbot markup leak tokens** (`oaicite`, `contentReference`, `turn0search`, `[cite: 1]`, `grok_card`, `ppl-ai-file-upload`, `:::writing`) | Wikipedia lines 1262-1420 | Language-independent hits in pasted chatbot output | CC BY-SA 4.0: token list is factual | **Maybe**: check `src/rules/` first; likely partly there. |
| 9 | **Per-language override of global rules by section** (dash, quotes, hyphen) and a declared-language fallback | blader PR #309 `ru.md`; `memory: ai-slop-linter-english-calibration` shows the fix shipped for fr/pl/ru | Correct typography is not penalised | Idea | **No new work**: already shipped; extend the same override to nl, id, it, tr if a held-out text shows a hit. |
| 10 | **Italian: calques and burocratese list; do not over-flag synonym rotation** | ilyautov/humanizer-it SKILL.md (52 patterns, Treccani "IA-taliano"); Wikipedia line 1987 note on Italian schools | `it` cell: fewer false hits on correct Italian style | MIT (ilyautov); CC BY-SA for Wikipedia (idea) | **Maybe**: only if `it` is among the 6 languages measured; the question lists en, es, pl, id, pt, nl, so **no** for it/tr now. |
| 11 | **Honest per-language reliability statement** in output/README (what is calibrated, what is not) | sloptotal README ("hi, tr, zh not reliable yet, and the report says so") | Users are not told a Dutch or Indonesian pass means as much as an English one | Wording idea | **Yes**: nl and id have no external calibration source found in this research (Dutch: no tool at all; Indonesian: only prompt-only skills). |
| 12 | **Issue templates for false positives and calibration concerns** | devswha/patina `.github/ISSUE_TEMPLATE/false_positive.yml`, `calibration_concern.yml` | Contributors in the new languages can report wrong flags in a structured way | MIT | **Maybe**: only if community contribution is a goal. |
| 13 | LLM/NLI/QA faithfulness metrics (SummaC, QAFactEval, MeaningBERT, FActScore) | 3b | none offline | various | **No**: need a model; cannot be zero-dependency. |
| 14 | Detector scores (Binoculars, XLM-R detectors, sloptotal) | 2c | a probability of AI | BSD-3 / MIT | **No**: wrong goal, model-dependent, and Binoculars states it is weaker outside English. |
| 15 | Rules that tell the model to add concrete numbers, names, or "imperfections" | clone147/humanizer-pl README (patterns 30, 31, 37 removed after causing invented numbers/company names) | A guard against our own skill text causing fabrication | MIT | **Yes as an audit**: re-read our skill rules for any "be concrete"/"add a detail" wording; `--compare` already flags added numbers, but names and claims are weaker. |

Net for the round: blader has not moved since the pin, so the measured 24.33 vs 23.33 gap is process and clean-text behaviour, not new rules. The new material that helps in six languages is items 1, 2, 4, 5, 6 and 11. Item 3 is the largest unrealised fact check but needs per-language word lists.
