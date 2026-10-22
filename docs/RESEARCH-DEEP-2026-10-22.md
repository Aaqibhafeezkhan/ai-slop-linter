# Deep research, 2026-10-22

Owner request of 2026-10-22: read the competitors' source in full, survey open-source and model/dataset technology, and use both to design changes before measuring. This file records what the research found. It was produced by three Sonnet research runs (Part A, Part B, Part C below). No competitor code was executed; clones live under `/tmp/ai-slop-deep/`. Claims marked "unverified" were not checked by the research runs. The design that follows from this file is frozen in `docs/HEAD-TO-HEAD.md`, section "Round deep design (frozen before code)".

## Summary

Top techniques, in order of expected effect on the round-3 Rule A and Rule B failures:

1. A deterministic gate that must exit 0 before a rewrite is reported (everwrite `skills/everwrite/SKILL.md:83-87`, `scripts/tells.py:15-16`; MIT). Ours: `--verify` (commit `ddf2de6`), unmeasured until the next round.
2. Catalog entries written as families, not as single phrases, with a protected-use rule (unslop `skills/unslop/SKILL.md:89`, `references/word-lists.md:76`; everwrite `scripts/tells.py:62`; MIT). Over-fitting risk is the main cost, so entries need an unseen-sentence test.
3. Preservation validator that blocks on changed front matter, fenced code and tables, with a blocking/warning split (avoid-ai-writing `detector/validate.js:345-437`; MIT). Ours checks facts, quotes and code spans in `--compare`; structure checks are the gap.
4. A short "never inject" list and a candidate, finding, edit contract in the skill text (avoid-ai-writing `skills/avoid-ai-writing/SKILL.md:34,301`; MIT, adapted in our own words).
5. A deterministic added-first-person and added-claim check: no competitor has one (ours: `src/compare.ts:201-242`). Kept as the differentiator.

Rejected after reading: detector-score objectives and Hugging Face AI-text detectors (English-centred, false positives on formal and non-native text, not the benchmark metric), embedding-similarity gates (do not reliably catch a changed number or negation), model-backed rewriting inside the tool, hedge-word lint rules (technical prose uses them legitimately), stop-slop's "no adverbs, no passive" rules (change meaning).

Licences: avoid-ai-writing, slopless, slop-cop, blader/humanizer, everwrite, unslop are MIT per the research runs (verify each LICENSE before copying code; attribution goes to `THIRD-PARTY-NOTICES.md`). Wikipedia "Signs of AI writing" is CC BY-SA 4.0: categories and ideas may be reused, literal text needs attribution and share-alike analysis.


---

## Task A output: loss analysis and competitor reading (ai-slop-linter, branch plugin-leadership)

Written 2026-10-22. Sources: `docs/HEAD-TO-HEAD.md` (Results round 1/2/3, lines 604-800), `bench/head-to-head/results/round-{1,2,3}/summary.md`, `bench/head-to-head/tasks.json`, `bench/head-to-head/home/h{9,17,18}.json`, `bench/head-to-head/checker-data/h14.json`, round-1 run outputs in `bench/head-to-head/results/round-1/runs/`, round-3 run outputs and `scores.json` in `/Users/efe/claude-kredi-runs/2026-10-22/h2h-r3/`, and the report `/Users/efe/claude-kredi-runs/2026-10-22/ai-slop-linter-report.md`.

Method for the output scans in section 1: I applied the tell patterns of `home/h9.json`, `home/h17.json`, `home/h18.json` (tells list) and the patterns of `checker-data/h14.json` to the saved output files with a short Python read-only script (our own data; no competitor code was run). I applied the French phrase list from the h1 C3 criterion text and a first-person regex to h1/h2 outputs. I did not run `check.mjs`. Where a score cell is quoted, it comes from `results/round-N/summary.md` or `h2h-r3/scores.json`.

Evidence limits, stated first:
- Round 2 raw outputs are gone (docs/HEAD-TO-HEAD.md "Results, round 2": "Transcripts, scores and grader files stay out of the repository ... in `/root/h2h-round-2` on that machine"). Round-2 rows use the summary text only.
- Round 4 has no measured run. `/Users/efe/claude-kredi-runs/2026-10-22/ai-slop-linter-r4-cost.tsv` holds a billing check (0.0015 USD) and three invocation probes (0.0211 USD); `ai-slop-linter-r4.err` holds `exit=143` and `exit=137`. I did not read the 1.4 MB `ai-slop-linter-r4.jsonl`. So no round-4 loss rows exist.
- Round 3 rival outputs were not re-run (r2 reused), so "what the winning arm did" for round 2 and round 3 uses round-1 outputs of the same arm on the same task as the only available sample. This is a stand-in, marked per row.
- Round-1 and round-3 winning-arm answers: I scanned them with the task patterns. I did not read them in full and I do not quote lines from them, except where stated.
- Task C-checks are from `tasks.json`. Criteria are all `script` kind except h1-h3 C5 (blind). Score per run = number of passed criteria out of 5.

### 1. Loss table

Totals (of 60): round 1 ours 54.33 (lost 5.67; best other blader-inv 56.33); round 2 ours 56.67 (lost 3.33); round 3 ours 55.67 (lost 4.33; blader-inv 56.00). Round 1 losses per task: h1 .67, h2 1.33, h9 1.00 (vs base 4.67), h10 .33, h17 1.00, h18 1.33 = 5.67. Round 2: h9 1.00, h14 .33, h17 1.00, h18 1.00 = 3.33. Round 3: h1 .33, h2 .67, h9 1.00, h14 .33, h17 1.00, h18 1.00 = 4.33.

"General" below means the cause also hits unseen tasks. "Task-specific" means it only matters for the phrase or fixture in the task.

#### Round 1 (ours 54.33; per-run scores from `results/round-1/summary.md`)

| Task | Round | Winner (score) vs ours | What the winner did | What ours did | Cost check | Root cause | Scope |
|---|---|---|---|---|---|---|---|
| h1 French note | 1 | blader-inv 5.00 and everwrite 5.00 vs ours 4.33 (runs 4,5,4) | Scan of their 3 outputs each: none of the 8 stock phrases remain (`robuste` absent). Neither skill ships French rules (everwrite `skills/everwrite/scripts/tells.py` is English regex; humanizer `SKILL.md` has no French list), so the removal came from full rewriting, not from a catalog. Not read line by line: unverified. | `robuste` kept in h1-ours-1 and h1-ours-3 (scan of `results/round-1/runs/h1-ours-*/note.md`). Run 2 clean. | C3 (stock phrases) failed 2 of 3 runs | Non-English stock phrase left; the linter and references had almost no French rules (`docs/HEAD-TO-HEAD.md` round-1 finding 2). | General (any language the linter does not cover) |
| h2 README | 1 | blader, blader-inv, unslop, unslop-inv, everwrite, everwrite-inv all 5.00 vs ours 3.67 (5,3,3) | All rival cells fail C4 0 of 3 (round-1 finding 3). Their skills carry a no-added-fact rule in prose: humanizer `SKILL.md:35-36`, everwrite `SKILL.md:29`, unslop `SKILL.md:47`. | h2-ours-2 and h2-ours-3 wrote "In our benchmarks" (quoted in round-1 finding 3); the fixture says "In benchmarks, Fastq 2.3 ...". Both runs made one Read and one Edit, no skill call, no check. | C4 (added claim: "our/we/us/my appear only if the fixture has them") failed 2 of 3 | The agent did not load or apply the skill; no deterministic check covered first-person words. | General (added first-person word on any marketing rewrite) |
| h9 blog (unslop home) | 1 | base 4.67 (4,5,5); unslop 4.33 vs ours 4.00 (4,4,4) | Base kept zero tells in 2 of 3 runs (scan: base-2, base-3 no hits). Unslop: `streamlin` or other hits in 2 of 3. No arm is clean. | Scan of h9-ours-1..3 (round 1): hits on pattern 7 (`underpins`, `backbone of`, `pays off`) and pattern 8 (`streamlin`) in all 3. | C2 (tells removed) failed 3 of 3 | Load-bearing metaphors and `streamline` left; the round-1 skill had no metaphor entries (`d0d8cf3` added them later). | General for metaphors; the `streamline` word is a stock-word gap |
| h10 German story (unslop home) | 1 | unslop, unslop-inv, blader-inv 5.00 vs ours 4.67 (4,5,5) | Not examined (raw output exists in `results/round-1/runs/h10-*`; I did not read it): unverified. | One run lost one of the 8 or so listed facts. Which fact: not examined, unverified. | C1 (facts kept) failed 1 of 3 (round-1 finding 5) | Fact loss while removing a German tell. | Unverified; probably general |
| h17 German collection (unslop home) | 1 | unslop-inv 4.33 (5,4,4) vs ours 4.00 (4,4,4) | Scan: h17-unslop-inv-1 has zero tell hits; unslop-inv-2/3 hit pattern 14 or 11. unslop catalog lists the phrase as false agency: `unslop_ai/skills/unslop/references/word-lists.md:76` ("Das Tool entscheidet selbst") and `unslop_ai/skills/unslop/SKILL.md:89`. | All 3 kept pattern 9: `Unser Tool entscheidet selbst, welche Dokumente relevant sind.` (scan of h17-ours-*; line quoted from the round-3 output, round 1 hit the same pattern). | C2 failed 3 of 3 | German false-agency pattern not in `references/de.md` or the linter; 7 of 8 arms fail the same pattern (round-1 finding 6). | The phrase is task-specific; the class "tool/system with its own will" is general |
| h18 everwrite list (everwrite home) | 1 | blader-inv 4.67 and everwrite-inv 4.67 vs ours 3.67 (3,4,4) | everwrite arms: scan shows 0 hits in 6 of 6 cells except everwrite-3 (pattern 6). Reason: everwrite `tells.py:62` has `not (widely\|publicly\|readily) (available\|documented\|disclosed)` as a strong rule and `SKILL.md:83-85` says run it and fix until exit 0. blader-inv: 2 of 3 clean; humanizer `SKILL.md:328` lists "not publicly available". | All 3 kept `Details of her early life are not publicly available` (pattern 11). | C2 failed 3 of 3; C3 (nothing added) failed 1 of 3 (round-1 finding 6; which added item: not examined, unverified) | The rewrite kept a residue sentence; no deterministic gate. | The phrase is task-specific; the class "chatbot hedge about missing source information" is general |

Ties at the best score in round 1 with no points lost by ours: h3 (5.00; blader, blader-inv, everwrite, everwrite-inv also 5.00), h11, h13 (ours alone best, 5.00 vs 4.67), h14 (everwrite also 5.00), h15, h16. Cause of a tie: ceiling. These rows carry no loss and no technique.

#### Round 2 (ours 56.67; raw outputs gone; reasons from the docs)

| Task | Winner (score) vs ours | What the winner did | What ours did | Cost check | Root cause | Scope |
|---|---|---|---|---|---|---|
| h9 | everwrite 4.33 vs ours 4.00 | One everwrite run fully clean. Round-1 scan: everwrite arms hit nothing in 4 of 6 cells, and everwrite `tells.py:38` lists `streamlin(?:e\|es\|ed\|ing)` as a stock word. | C2 failed 3 of 3 (docs round 2). Sample: round-3 outputs show `streamlines` kept (see round 3). | C2 | `streamline` absent from the linter and references (round-3 report line "h9 `streamlines`"). | Stock-word gap, general class |
| h14 | blader, everwrite, everwrite-inv 5.00 vs ours 4.67 | Round-1 scan of everwrite and everwrite-inv h14 outputs: no hit of the 26 English patterns in any of the 6 cells. | One ours run failed C4 (docs round 2); the pattern is not recorded. Round-3 equivalent is `let us know` (see round 3), probably the same. Unverified for round 2. | C4 | English tell left outside the foreign blocks. | General |
| h17 | unslop 4.33 vs ours 4.00 | As round 1: unslop catalog entry `word-lists.md:76`. | C2 failed 3 of 3 | C2 | As round 1 | As round 1 |
| h18 | blader-inv 4.67 vs ours 4.00 | As round 1: `tells.py:62` / `SKILL.md:328`. | C2 failed 3 of 3 | C2 | As round 1. `references/en.md:55` listed the sentence in round 2 (round-3 report: "en.md'de listeli, ajan yine de bırakıyor 3/3"), so the catalog existed and the agent did not apply it. | General: catalog present, not enforced |

#### Round 3 (ours 55.67; raw outputs on disk in `/Users/efe/claude-kredi-runs/2026-10-22/h2h-r3/hN-ours-K/`; per-run criteria in `h2h-r3/scores.json`)

| Task | Winner (score) vs ours | What the winner did | What ours did (verified in the saved output) | Cost check | Root cause | Scope |
|---|---|---|---|---|---|---|
| h1 | blader-inv 5.00, everwrite 5.00 vs ours 4.67 (5,4,5) | Round-1 scan: no stock phrase in their 6 cells. | h1-ours-2 keeps `robuste` (scan of `h1-ours-2/note.md`); runs 1 and 3 clean. | C3 (run 2) | One-run lapse on a non-English stock word; the French file is small. | General (language coverage) but a one-run spread |
| h2 | blader-inv, unslop, unslop-inv 5.00 vs ours 4.33 (5,3,5) | Round-1: 0 of 3 failing C4 for all rivals. | h2-ours-2 line: `Fastq is a job queue for Node.js. In our benchmarks, version 2.3 processed 12,000 jobs per second on a single 4-core machine ...` The fixture has "In benchmarks". | C4 (run 2) | Added "our"; this repeats the round-1 cause. `--compare` first-person check (round-1 "What round 2 would change" item 1) is not recorded as shipped in the docs I read: unverified. | General |
| h9 | everwrite 4.33 vs ours 4.00 (4,4,4) | everwrite `tells.py:38` lists `streamlin(...)`. | h9-ours-1 and h9-ours-3: `It streamlines operations across all regional clusters.` Run 2 passed C2 but failed C3 (nothing added); the added item was not identified: unverified. | C2 (runs 1, 3), C3 (run 2) | `streamlines` missing from the references at the time. HEAD now lists it (`skills/ai-slop-linter/references/en.tells.txt:7`, added in `ddf2de6`, after round 3). | Stock-word gap (general class); C3 lapse unverified |
| h14 | blader 5.00, everwrite 5.00, everwrite-inv 5.00 vs ours 4.67 (5,4,5) | Round-1 scan: everwrite cells have no hit. | Scan of `h14-ours-2/guide.md`: pattern index 9 matches `let us know` outside the foreign lines. Runs 1 and 3 clean. Note blader-inv, blader and unslop also kept `Let us know` in round 1. | C4 (run 2) | Chat residue "let us know" left. everwrite `tells.py:49` covers only `let me know if`, so even everwrite's file does not match `let us know`; its arm won because its rewrite did not produce the phrase. | General (chat residue) |
| h17 | unslop 4.33 vs ours 4.00 (4,4,4) | unslop-inv scan: pattern 9 clean in round-1 cell 1. | All 3 runs: `Unser Tool entscheidet selbst, welche Dokumente relevant sind. Die Suche ist vielversprechend, aber die Datenqualität bleibt ein Problem.` | C2 | `references/de.md` did not list it. HEAD has it (`skills/ai-slop-linter/references/de.md:41`, `de.tells.txt:42-43`, `ddf2de6`). | Phrase task-specific, class general |
| h18 | blader-inv 4.67 vs ours 4.00 (4,4,4) | `tells.py:62` plus run-until-exit-0 (`SKILL.md:83-85`). | Run 1: `Details of her early life are not publicly available. She likely grew up in a middle-class household.` Same sentence pattern in runs 2 and 3 (pattern 11 hit in all). | C2 | Catalog line `references/en.md:55` existed; the agent did not apply it 3 of 3. HEAD: `en.tells.txt:6` and `--verify` (`ddf2de6`) are meant to block this. | General: enforcement gap |

Summary of the cause classes across all rows:
1. Catalog gap (word or phrase missing): h9 `streamlin`, h17 `entscheidet selbst`, h1 `robuste`. 3 loss rows plus their repeats.
2. Catalog present, not applied (no gate): h18 `not publicly available`, h1 `robuste` in some runs.
3. Added first-person word: h2 (rounds 1 and 3).
4. Residue phrase left (`let us know`): h14.
5. Fact or shape: h10 C1 (round 1), h9 C3 (round 3, unverified).

HEAD already contains `ddf2de6` (`--verify`: lint, compare and reference-catalog scan as a gate). Round 3 was measured before it. No measurement of `--verify` exists, so whether it fixes causes 1, 2 and 4 is unmeasured.

### 2. Competitor reading

All four repositories were cloned with `git clone --depth 1` into `/tmp/ai-slop-deep/<name>`; the clones succeeded, which confirms each URL. I did not use a web browser on them. No competitor code was run.

| Repo | URL (clone succeeded) | HEAD sha | LICENSE first line |
|---|---|---|---|
| blader/humanizer | https://github.com/blader/humanizer | `8c307f367c91bd974002f10f2be2965d642c13df` | `MIT License` |
| m4bwav/everwrite | https://github.com/m4bwav/everwrite | `38912ce43453129c63eef958bf65faef4833c18e` | `MIT License` |
| jlwin/unslop_ai | https://github.com/jlwin/unslop_ai | `d65241e66f2b0e0d0b305cb55dadbffac0f9ef52` | `MIT License` |
| hardikpandya/stop-slop | https://github.com/hardikpandya/stop-slop | `8da1f030185bdfe8471220585162991eaeb970e9` | `MIT License` |

The shas for blader, everwrite and unslop match `bench/head-to-head/run/competitors.lock` (docs round 1 header). The blader-inv arm is the same repository as blader with a different invocation (`invocations.json`), so one reading covers both. The stop-slop repository was found by the clone URL given by the author name in the task; its `SKILL.md` metadata names "Hardik Pandya (https://hvpandya.com)". I did not open hvpandya.com. stop-slop is not one of the benchmark arms in rounds 1-3 (arms: blader, blader-inv, unslop, unslop-inv, everwrite, everwrite-inv, base).

#### 2.1 blader/humanizer (also the blader-inv arm)

- Structure (git ls-files): `SKILL.md` 397 lines, `README.md` 209, `CHANGELOG.md` 116, `scripts/validate-package.py` 146 lines, `AGENTS.md` 54, plugin manifests, GitHub workflow `validate.yml`. No rule data files. The only script, `scripts/validate-package.py`, validates package metadata (functions `read_package_file`, `require_match`, `validate-package.py:14,37`), not prose. So nothing deterministic touches the text.
- Catalog: patterns are prose sections in `SKILL.md`: A. staging (§1-5, lines 55-135), B. rhythm (§6-11, 136-194), C. inflation (§12-17+, 195-260), further sections up to chatbot artifacts (`SKILL.md:322-335`). About 25-30 numbered sections; exact count not verified (I read the heading list down to §17 only; the last 14 headings were cut from the output). Word list at `SKILL.md:199-207` ("Overused AI words": actually, additionally, align with, bolstered, crucial, deep dive, delve, enduring, enhance, ... pivotal, ...). Rule that a formal word alone is not a tell (`SKILL.md:204`-ish, "A formal word outside these lists is not a tell by itself").
- Tell removal mechanism: LLM judgment. Four steps, `SKILL.md:32-39`: mark the tells (strongest first, paragraph shape included), draft the rewrite, check the draft, write the final version.
- Fact preservation: step 2 (`SKILL.md:35`): "Keep every supported claim ... Do not add a fact, name, number, date, quote, or citation unless it comes from the source or the user." Step 3 (`SKILL.md:36`): checks whether the rewrite "added or dropped any fact, name, number, date, quote, citation, ranking, or claim", and calls an unsupported addition an error; it names the shape-edit patterns that drop facts most often (§6, §9, §19). File mode (`SKILL.md:47-51`): write only final text, keep code, inline code, commands, paths, YAML, data and link targets unchanged. Voice rule (`SKILL.md:41-46`): a writing sample overrides dashes rule §8.
- Lint, rewrite, re-lint loop: none deterministic. Step 3 is a self-reread ("Read it aloud. Ask what still sounds AI-generated.") by the same model. Round-1 process column: blader ran a check in 1 of 36 runs, blader-inv 0 of 36 (docs round 1).
- Multilingual: none. `SKILL.md` has no non-English list (grep for French/German/language returns only the description and the intro text).
- Deterministic parts: none for prose.
- Handling of loss rows:
  - h1 `robuste`: not handled by a list; blader and blader-inv: blader 3.67/3.00 versus blader-inv 5.00 across rounds, so the invocation form mattered more than the catalog (docs round 1 table). No file:line applies.
  - h2 added "our": `SKILL.md:35-36` (no-added-fact rule and post-draft check). Its arms still scored blader 5/5/5 in round 1 and 4.33 in round 2, so the rule did not guarantee it.
  - h9 `streamlin`, metaphors: not listed. `SKILL.md:199-207` lists neither `streamline` nor `underpin`/`backbone` in the part I read (list cut off; unverified for the tail). Blader scan hits 6, 7, 8 in round 1; so it does not handle it.
  - h10 German facts: no German support; fact rule `SKILL.md:35-36` only.
  - h14 `let us know`: `SKILL.md:322-335` chatbot-artifact section has the `Let me know` form (line 322 example); blader-inv, blader still kept `Let us know` in round 1 (scan). Does not handle.
  - h17 `Unser Tool entscheidet selbst`: does not handle (no German).
  - h18 `not publicly available`: handled in the list at `SKILL.md:328` ("not publicly available, not widely documented") with the before/after at `SKILL.md:335`. blader-inv left it in 1 of 3 runs, blader in 1 of 3 (scan), so the list works about 2 of 3 times.

#### 2.2 m4bwav/everwrite

- Structure: `skills/everwrite/SKILL.md` 105 lines, `scripts/tells.py` 546 lines, `scripts/test_tells.py` 253 lines (30 `def test` entries), `references/patterns.md` 117 lines, `evals/evals.json` 123 lines, `evals/fixtures/sloppy.md`, `RESEARCH.md` 230, `LEARNINGS.md` 107, `CHANGELOG.md` 99, `TESTS.md` 45, `evergreen.json` 107 (freshness state), `.github/workflows/tests.yml`, `ai-docs/` (notes and decisions). Python 3.9+, standard library only (`tells.py:3`, `SKILL.md:85`).
- Catalog size: `RULES` list from `tells.py:46`: about 56 regex rules with categories (dash, residue, markup, closer, setup, inflation, contrast ...), each with severity strong or weak and a hint. `STOCK_WORDS` (`tells.py:31`): about 48 regexes (my count with a script on the list literal; approximate). Plus structural checks: invisible characters and odd spaces (`tells.py:121-123`), emoji, arrows, curly quotes, bold-label bullets (`:124-127`), repeated headings and a host-title check (`:334-344`), sentence length over `max_words=30` (`check_text` at `:305`, sentence check around `:408-416`). `references/patterns.md` holds before/after examples including the h18 source lines (`patterns.md:94` "Details of her early life are not publicly available, suggesting she keeps a low profile").
- Tell removal: LLM rewrite by the prose rules in `SKILL.md:26-77` (5 hard rules, then patterns "strongest first" and "need company"), then a mechanical check.
- Deterministic part (the main difference from the other three): `tells.py` is run on the file. Output: one line per hit `file:line: severity category: match (hint)`; exit 1 while a strong hit remains, exit 0 when none, exit 2 on bad input (`tells.py:15-16`, `SKILL.md:85`). Co-occurrence rule: two or more distinct stock words in one paragraph is strong, one is weak (`tells.py:30`, `:383`). Per-rule flag `nocond` skips sentences that open a condition (`tells.py:43-44`, `CONDITIONAL` at `:136`), which lowers false positives on technical prose. Tell regions can be disabled with `<!-- tells: off/on -->` (`tells.py:17`, `SKILL.md:25,81`). `--allow-dashes` for author samples (`SKILL.md:28`). Hidden-character stripping `--fix-hidden` (`tells.py:7`).
- Lint, rewrite, re-lint loop: yes. `SKILL.md:19-20` (edit mode: "run the checker on the original, rewrite, run it again"), `SKILL.md:83-87` ("Fix every strong hit ... and run it again until it exits 0. Its last line (`tells: N strong, N weak, ...`) is the evidence the check ran"), then Step 4 (`SKILL.md:91`): reread once for what the script cannot see and for added or dropped facts. Round-1 process column: everwrite and everwrite-inv ran a check in 35 of 36 runs each.
- Fact preservation: prose only. Hard rule 2 `SKILL.md:29` (never invent facts; "A vague true sentence beats a specific invented one"), rule 5 `SKILL.md:32` (change prose only; code, frontmatter, link targets, quotations, titles and proper names stay), "Don't over-correct" section (keep every real claim; pull the fact out of an inflated sentence), Step 4 question "Did the rewrite add or drop any fact". No script compares facts or numbers before and after (grep of `tells.py` for number/fact/digit finds nothing relevant to a diff; unverified for `test_tells.py`).
- Multilingual: none. Every regex is English. Round-1 everwrite on h1 5.00 and h10 4.33 came from the model's own rewrite.
- Handling of loss rows:
  - h1 `robuste`: no French in `tells.py`. everwrite arms passed 6 of 6 by rewriting; not a catalog effect. Does not handle by rule.
  - h2 added "our": `SKILL.md:29` rule 2. everwrite arms: 5/5/5 in round 1, 4.33 in round 2 (reused value), so the rule is not a guarantee.
  - h9 `streamline`: `tells.py:38` `streamlin(?:e|es|ed|ing)` in `STOCK_WORDS`. A single word is weak (needs two in a paragraph for strong, `tells.py:383`), so the script alone would not force the fix; the loop only forces strong hits. everwrite arms passed 4 of 6 cells on h9 in round 1 scan.
  - h10: no German; fact rule only.
  - h14 `let us know`: `tells.py:49` strong rule matches `let me know if` only (`\blet me know if\b`); it would not flag `let us know`. Scan: everwrite cells clean on h14, so the rewrite avoided the phrase.
  - h17: no German. Does not handle.
  - h18 `not publicly available`: `tells.py:62` strong rule (`not (widely|publicly|readily) (available|documented|disclosed)`), run until exit 0. Handled: 5 of 6 cells clean in round 1.
- Tests: `test_tells.py` (30 test functions) unit-tests the checker; `evals/evals.json` and `TESTS.md` hold LLM trigger/behaviour evals with fixtures. Not read in detail beyond counts: unverified content.
- Other: `SKILL.md:80` discusses statistical watermarks; `LEARNINGS.md` L-011/L-012 record that description wording and the install slot change when the skill triggers (relevant to our h2 failure where the skill never loaded). I read L-011/L-012 only.

#### 2.3 jlwin/unslop_ai

- Structure: `skills/unslop/SKILL.md` 259 lines (49.7 KB, long lines), `references/pattern-catalog.md` 383 lines (23 numbered sections, `pattern-catalog.md:40-294`), `references/word-lists.md` 172 lines (German `:11`, English `:82`, each with Tier 1 replace `:13`/`:84`, Tier 2 cluster `:44`/`:111`, Tier 3 pile-up `:48`/`:115`; stock phrases `:52`/`:119`; leak artifacts P0 `:153`; microformats `:159`), `evals/cases.md` 305 lines (regression cases), `CHANGELOG.md` 133. No script, no tests that execute. `cases.md:3`: "How to run: for each case, run the skill in check mode ... then compare the findings to EXPECTED" (manual comparison). Approximate catalog size: 23 pattern groups; word-list entries are tables of tens of items per tier per language (not counted).
- Tell removal: LLM judgment with severity labels P0 (leak artifacts, unsourced attribution), P1 (stock phrases, negative parallelism, false agency), P2 (copula avoidance etc.) (`cases.md:169`, `SKILL.md:82`). Three levels: word, sentence and rhythm, structure (`SKILL.md:24-30`); work order 3 to 2 to 1 (`SKILL.md:72`). The rules are written as constructions, not only phrases: `SKILL.md:89` false agency covers "tools handed a will of their own („Das Tool entscheidet, welches Modell antwortet“, ...)" with a protected-use list ("Ordinary technical verbs stay: „der Parser liest die Datei“").
- Fact preservation: rule 10 `SKILL.md:47` ("Never add facts, persona, or staccato the source did not have"), rule 1 `SKILL.md:38` (swap vague claims for checkable facts, "Flag missing evidence rather than inventing it"), Rewrite mode `SKILL.md:63` (size of the edit matches the amount of slop; "When in doubt, leave the sentence alone"; every unflagged sentence carried over), Edit-file mode `SKILL.md:64` ("Touch only flagged spans ... re-read afterwards"), quotations, code, tables flagged and never rewritten (`SKILL.md:66`). No script.
- Lint, rewrite, re-lint loop: only a manual "Second pass" (`SKILL.md:73`: "read your own new version against all three levels again. Rewrites like to smuggle in fresh tells") and a self-check at the end of the file. Round-1 process column: unslop 0 of 36 runs with a check, unslop-inv 1 of 36.
- Multilingual: German and English only (`SKILL.md:4`, `word-lists.md:11,82`); `pattern-catalog.md:156` has a "German special cases" section. Largest German coverage of the four repos.
- Deterministic parts: none.
- The h9, h10, h17 task criteria were written from this repository's catalog (`home/h9.json` tellSources cite `cases.md` cases 2, 19; `home/h17.json` cites cases 1, 10, 11, 13, 17, 22, 23). So h9, h10, h17 measure how well an arm reproduces this catalog.
- Handling of loss rows:
  - h1 French: no French list (`SKILL.md:4`). unslop 4.00/4.00/4.00 in the three rounds: kept `robuste` 3 of 3 in round 1 (scan: h1-unslop-1..3 all hit `robuste`; `sans faille` in 2 of 3). Does not handle; worse than ours.
  - h2: rule 10 `SKILL.md:47`; unslop 5.00 in rounds 1 and 2, so it held.
  - h9: `streamline` in `word-lists.md:98` (table row "elevate / supercharge / streamline your X") and the source passage in `cases.md:223-228` (case 19: "underpins ... backbone ... pays off by streamlining", P1 "Tier-1 stock-phrase hit (streamlining operations)"). Unslop arms still kept `streamlin` in round 1 (scan: unslop-1, -2, unslop-inv-1, -3 hit pattern 8), so the catalog is not applied reliably without a gate. Load-bearing metaphors: `SKILL.md` Level 2 section ("Load-bearing metaphors ... „das trägt“ ... "carries", "holds up", "pays off", "underpins", "backbone"").
  - h10: German coverage `word-lists.md:11-80`; unslop 5.00/5.00 in rounds 1 and 2. Handled best of all arms.
  - h14: no `let us know` entry found in the unslop files I grepped (`word-lists.md` grep for "let us know" and "let me know": no match). unslop kept `Let us know` in 2 of 3 round-1 cells (scan), and 8 other English tells in cells 1 and 2 of `unslop` and `unslop-inv` (scan: `Delves`, `pivotal`, `seamless`, ...). Does not handle on h14; the h14 task is an English guide with foreign blocks.
  - h17: `word-lists.md:76` and `SKILL.md:89` list the phrase. Handled in 1 of 3 inverted cells (`h17-unslop-inv-1` zero hits); others hit other patterns (11, 14).
  - h18: not handled; unslop arms hit patterns 6, 8, 9, 11, 12 (scan). The English catalog has no `not publicly available` entry in the part I grepped (grep for "not publicly" in `word-lists.md`: no match).

#### 2.4 hardikpandya/stop-slop

- Structure: `SKILL.md` 68 lines, `references/phrases.md` 128, `references/structures.md` 134, `references/examples.md` 59, `README.md` 62, `CHANGELOG.md` 24, `LICENSE` 21. No script, no tests, no data files.
- Mechanism: eight core rules in `SKILL.md` (cut filler and all adverbs; break formulaic structures; active voice with a human subject, "No passive constructions"; be specific; put the reader in the room; vary rhythm and no em dashes; trust readers; cut quotables), a 12-line quick-check list, and a self-scoring table (five dimensions, 1-10 each; "Below 35/50: revise").
- Fact preservation: none stated. The rules cut words ("Kill" adverbs, no passive voice), which removes qualifiers and can change meaning. There is no "keep every fact" instruction (I read the whole `SKILL.md`; grep of `references/*.md` for "fact" was not run; unverified for the references).
- Lint, rewrite, re-lint loop: the score table is a self-rating by the same model (not deterministic). No loop with a tool.
- Multilingual: English only (grep for French/German/language in references and README: no match).
- Deterministic parts: none.
- Relevance to rows: it was not in the benchmark, so no score exists. By text only: h2 (added claim) no handling; h9, h14, h17, h18 no catalog entries (grep for `streamlin`, `publicly`: no match; `references/structures.md:19` lists "not just X but also Y"); h1/h17 no language support. Its "no adverbs, no passive" rules would likely harm C1/C5 fact checks (qualifier loss such as "publicly", "likely", "about"); this is a judgment from the text, not measured.

### 3. Techniques to adopt or reject

Licence for all four sources is MIT. MIT permits copying data and text with the licence notice kept. The task rule allows code copy only for MIT, Apache, BSD, CC0, so all four qualify. Existing disclosure in the docs: our reference catalogs are already adapted from everwrite and unslop, the same sources the h9, h10, h11, h17, h18 checks were written from. Any further copy from these catalogs raises the circularity concern (the benchmark would reward a catalog it shares with the competitor). Adopt only entries that are true tells in ordinary text, and keep them out of the home-ground score claim.

Format per item: source file:line, licence, loss row fixed, cost, over-fitting risk, decision.

#### Adopt

A1. Gate the rewrite on a deterministic checker that exits non-zero until strong hits are gone (everwrite `skills/everwrite/SKILL.md:83-87`, `scripts/tells.py:15-16`). Licence MIT (idea; our `--verify` is already built, `ddf2de6`). Fixes: h18 (all rounds), h17 and h9 (any catalog entry that exists), h14 `let us know`, h1 `robuste` if the French list has it. Cost: no dependency (our own tool), a few hundred milliseconds, one extra tool call (small tokens). Risk: low for the loop; the catalog entries it enforces carry the over-fitting risk of A2. Status: already implemented, unmeasured; the next measurement should use it, and the skill text must make the agent run it (round-2 h2 transcripts show 0 checks when the skill was not loaded: docs round 1 finding 3).

A2. Add families, not single phrases, to the reference tells. Examples that already exist in HEAD: `de.tells.txt:42-43` ("<tool|software|system|ki|app|plattform|...> entscheidet ..."), `en.tells.txt:7` (`streamlin(e|es|ed|ing)`), `en.tells.txt:6`. Model for generalisation: unslop `SKILL.md:89` (construction plus a protected-use list) and everwrite `tells.py:62` (alternation `widely|publicly|readily` x `available|documented|disclosed`). Licence MIT. Fixes: h9 (round 1-3), h17, h18. Cost: none at run time (regex). Risk: medium. The exact phrases in h9, h17, h18 are the benchmark phrases; family forms reduce this but a held-out test is needed: build 5-10 unseen sentences per family (for example "<product> decides for itself", "details are not publicly shared", "streamlines the workflow") and measure hits and false positives on a clean corpus.

A3. Extend the chat-residue rule from `let me know if` to `let (me|us) know` (everwrite `tells.py:49`, one word changed). Licence MIT. Fixes: h14 round 3 (and the `Let us know` leftovers in blader, blader-inv and unslop round-1 outputs). Cost: none. Risk: low; the phrase is ordinary chat residue. Check the false positive on text that quotes it.

A4. Strong/weak severity with a co-occurrence rule: two or more distinct stock words in one paragraph is strong, one is weak (everwrite `tells.py:30`, `:383`), plus the `nocond` flag that skips sentences opening a condition (`tells.py:43-44`, `:136`). Licence MIT (code copy allowed, small). Fixes: none of the loss rows directly; it reduces false positives, which protects C1 and C3 when more catalog entries are added (A2). Cost: small code. Risk: low; generalises. Note the consequence on h9: one `streamline` alone is weak and would not block unless ours treats it as a blocking Tier 1 word (HEAD `en.tells.txt` is a list of blocking phrases; keep it that way for words with no technical use).

A5. An explicit after-draft question that names where facts are lost and added: humanizer `SKILL.md:36` (lists number, date, quote, citation, ranking and "claim that things happen at once", and the three shape-edit patterns that drop them) and everwrite `SKILL.md:91`. Licence MIT. Fixes: h2 C4 (rounds 1 and 3), h9 C3 (round 3, cause unverified), h18 C3 (round 1), h10 C1 (round 1). Cost: a few tokens in the skill; no runtime. Risk: low to medium; round 1 shows rivals with this rule still failing (blader 4.33 in round 2 on h2), so it helps only with a deterministic backstop. Pair it with the first-person check in `--compare` (round-1 follow-up item 1; whether it shipped is unverified in the docs I read: confirm in `src/`).

A6. Minimal-edit, leave clean sentences alone, re-read after editing (unslop `SKILL.md:63-64`, `:73`). Licence MIT. Fixes: h9 C3, h18 C3, h10 C1 (fewer rewritten sentences, fewer lost or added facts). Cost: none. Risk: low. Ours already contains a minimal-edit rule (`4e3b226` per docs round 3); no new text needed beyond checking wording.

A7. Protected-use lists inside each construction rule so legitimate technical text is not flagged: unslop `SKILL.md:89` ("Ordinary technical verbs stay: der Parser liest die Datei"), everwrite "Don't over-correct" and `nocond`. Licence MIT. Fixes: indirectly all rows by making A2 safe. Cost: none. Risk: low.

A8. Test the checker with unit tests per rule: everwrite `scripts/test_tells.py` (30 tests) as a pattern for ours. Licence MIT. Fixes: none directly; it protects the catalog while it grows. Cost: test time only. Risk: none.

#### Adopt as measurement practice (not a product change)

M1. Add held-out tasks with phrases that are in no competitor catalog and in no reference file, before any new claim. Reason: the remaining Rule B failures on h9, h17 and h18 are catalog matches, and `docs/HEAD-TO-HEAD.md` already states they measure each competitor's own catalog (round-1 finding on home-ground tasks). Cost: tokens for new tasks. Risk: none.

#### Reject

R1. stop-slop rules "kill all adverbs" and "no passive constructions" (`stop-slop/SKILL.md` core rules 1 and 3). Reason: removes qualifiers and changes meaning; conflicts with C1 and the fact rules; English only; no tests. Not measured.

R2. stop-slop self-scoring table (`SKILL.md` Scoring, "Below 35/50: revise"). Reason: the same model rates itself; not deterministic; our protocol requires measured correctness, not self-reported success.

R3. unslop's "swap vague claims for sourced facts" as a rewrite instruction (`unslop SKILL.md:38`, first half). Keep only the second half ("flag missing evidence rather than inventing it"). Reason: the first half invites added numbers and sources; it conflicts with h2 C4, h9 C3, h18 C3. Same position as humanizer `SKILL.md:35` and everwrite `SKILL.md:29`.

R4. Copying unslop's tier lists and `cases.md` expected-finding labels wholesale (`word-lists.md:84-119`, `cases.md`). Reason: these are the sources of the h9, h10, h17 criteria; copying more raises the circularity risk and the over-fitting risk to the home-ground tasks. Ours already has two tiers (`d0d8cf3`). Take individual entries only through A2 with a held-out test.

R5. Humanizer's self-reread ("Read it aloud", `SKILL.md:36`) as the only check. Reason: round-1 data: blader 1 of 36 and blader-inv 0 of 36 runs ran any check; it failed h18 `not publicly available` in 1 of 3 runs even though the phrase is listed (`SKILL.md:328`). Use as a prompt line only, behind the gate (A1).

R6. Everwrite's evergreen freshness step (`SKILL.md` Step 0, `evergreen.json`, web search at use time). Reason: adds a search and a state file for each use; no loss row depends on it; outside the benchmark scope.

#### Gaps no competitor fills (ours must solve by itself)

G1. h1 and any French, Spanish or German tell removal: no competitor ships French; unslop ships German and English only; everwrite, humanizer and stop-slop are English. The 4 rival arms that scored 5.00 on h1 (blader-inv, everwrite and everwrite-inv partly) did it by full rewriting. No file:line to copy. Our own `de.tells.txt`/`en.tells.txt` format is the only mechanism; a French equivalent is required (is there a `fr.tells.txt`? not checked: unverified).
G2. A deterministic check for first-person words added or lost (h2 C4). No competitor has one (everwrite `tells.py` has no diff step; unslop and humanizer rely on prose rules). It is our differentiator and the only deterministic fix for the most repeated non-catalog loss.
G3. A check that detects the agent not loading the skill at all (h2-ours-2 and -3 in round 1: one Read, one Edit). everwrite `LEARNINGS.md` L-011 (description wording and trigger rate) is the only competitor evidence on this; I read L-011 and L-012 only.

#### Order I suggest (by expected effect on the round-3 loss rows; this is a judgment, not a measurement)

1. A1 plus A2 plus A3 (already mostly in HEAD via `ddf2de6`): addresses h9, h14, h17, h18 together, 4 of the 6 failing rows and 3.33 of the 4.33 lost points in round 3.
2. G2 (first-person `--compare`): addresses h2, 0.67 of the lost points.
3. G1 (French list): addresses h1, 0.33.
4. A5 plus A6 as skill text: addresses the h9 C3 lapse.
5. M1 before any claim.

Rule A in round 3 needs ours to lose at most 3.20 and ours lost 4.33. Closing h9, h17 and h18 (3.00 points) alone would give a loss of 1.33.

### 4. Not verified

- Round-2 raw outputs and per-run criteria: not available.
- Round-1 h10 C1 failing fact and round-1/3 h18 C3 and h9 C3 added items: not identified.
- Whether a first-person check exists in `--compare` in `src/` at HEAD: not read.
- Full text of humanizer §18-§30, unslop `SKILL.md` Level 1 and 3 and `pattern-catalog.md` bodies, everwrite `RESEARCH.md`, `test_tells.py` bodies, `evals.json`, stop-slop `references/*.md`: not read. Counts for those files are from `wc -l` only.
- Whether a French reference list exists in our skill: not checked.
- `ai-slop-linter-r4.jsonl` and the round-4 work dirs: not read; no round-4 score exists.

---

## Task B: avoid-ai-writing, slopless, slop-cop (deep code reading, part 2)

Date: 2026-10-22. Author: research agent (Task B). No competitor code was executed. Nothing was installed. No competitor was contacted. "Vaara" was not touched.

### 0. Method, pins, limits

| Repo | Pin (verified with `git rev-parse HEAD`) | LICENSE first line |
|---|---|---|
| /tmp/ai-slop-deep/avoid-ai-writing | 209815cdeb4af942616daec89a5e0a706c804e3a | `MIT License` (LICENSE:1) |
| /tmp/ai-slop-deep/slopless | 628d89bd63f60e3718bfba0012b90b9629c8842d | `MIT License` (LICENSE:1) |
| /tmp/ai-slop-deep/slop-cop | c9fc5a6796ef01978f8a1c1bff47361ead13bd7a | `MIT License` (LICENSE:1) |

Limits of this report (budget limit, stated plainly):
- I read in full: avoid-ai-writing `SKILL.md` (the editing contract, modes, severity tiers, output format, "Never inject" section), the `detector/validate.js` error/warning code list and its entry block, the masking and em-dash sections of `detector/patterns.js`, `PROOF.md` (first 60 lines), and the header of `scripts/normalize-quotes.js`. I read in part: `references/patterns.md` (only the hedging lines and the profile table row), `detector/patterns.js` (about 15 percent, by grep and targeted ranges).
- I read slopless `skills/slopless/SKILL.md` in full, `src/rules/orthography/em-dashes.ts` in full, and grep results from `src/`. I did not read its other rule files, `datasets/`, or `behavior/` golden files. Statements about those are marked unverified.
- I read slop-cop `internal/lang/lang.go` in full, the head of `internal/markdown/mask.go`, the head of `internal/rules/rules.go`, and grep results from `internal/detectors/`, `internal/llm/`, and `skills/slop-cop-prose/SKILL.md`. I did not read the 169 Google-layer rules, `cmd/slop-cop/*`, or any test body. Statements about those are marked unverified.
- I did not read the previous scan's claims line by line. I checked these claims against code: licence MIT (yes, all three), avoid-ai-writing English-only (yes, `SKILL.md` "What this skill is and isn't" and `README.md:22`), slopless English-only (yes, `README.md:71`), slop-cop `counts_by_rule` and exit-code contract (yes, `skills/slop-cop-prose/SKILL.md:117,131`), avoid-ai-writing `validate.js` compares original and rewrite (yes, `detector/validate.js:319-437`). The scan said slop-cop has "226 rules, 178 client-side"; I did not count them (unverified).
- Where I say a competitor "handles" a benchmark situation, I describe the mechanism in its code or skill text. I did not run any of them on the h-fixtures, so I make no claim about their score.

### 1. Per competitor

#### 1.1 conorbronsdon/avoid-ai-writing (MIT, version 3.38.0 per `SKILL.md` front matter)

Structure (`ls` at the pin):
- `SKILL.md` (32 KB, canonical, loads `references/patterns.md` in full per the "reference-loading" block), `SKILL.full.md` (149 KB flattened copy), `references/patterns.md` (117 KB catalog), `detector/` (`patterns.js` 3,595 lines, `validate.js` 534 lines, `CATEGORIES.md`, plus tests: `patterns.test.js` 4,336 lines, `validate.test.js` 629 lines), `scripts/` (about 24,000 lines of Node and Python in total: `self-scan.js`, `normalize-quotes.js`, `fp-measure.js`, `fp-compare.js`, `fp-preprocess.js`, dataset loaders for HC3 and RAID, `rewrite-eval*.js`), `skills/` (seven sub-skills: `ai-writing-detector`, `avoid-ai-writing`, `avoid-ai-writing-router`, `false-positive-reviewer`, `file-edit-in-place`, `preservation-verifier`, `voice-preserving-rewriter`), `evals/rewrite/` (rewrite evaluation with blind review reports), `corpus/`, `cursor-rules/`, `action.yml`, `.pre-commit-hooks.yaml`.

Rule catalog format and severity tiers:
- The catalog is Markdown prose in `references/patterns.md` (word tiers, pattern entries with pass conditions, profile table at about line 775) plus JavaScript regex and list implementations in `detector/patterns.js`.
- Three tiers are defined in `SKILL.md` ("Severity tiers"): P0 credibility killers (cutoff disclaimers, chatbot artifacts, vague attribution, significance inflation), P1 obvious AI smell (word list, template phrases, hedge-stacked predictions, phrase clustering), P2 polish (em-dash frequency, transitions, uniform paragraphs, unnecessary hyphenation). "Use P0+P1 for quick passes."
- The detector scores with non-flat weights: `detector/patterns.js:558-585` states "critical rules like cutoff disclaimers (×10)"; `'cutoff-disclaimer': 10` (line 585), `'hedge-stack': 6` (line 604), `'parenthetical-hedge': 3` (line 638), `'em-dash': 0` (line 592). The em-dash weight is 0 in the score; em-dash frequency is reported but not scored as an authorship signal (`SKILL.md` P2: "do not score or invert it as an authorship signal").
- The score runs 0 to 100, where 0 is clean (`PROOF.md`).

Mechanism that removes tells:
- The skill is a model procedure. The model reads the catalog, audits, and rewrites. The detector is optional ("No external tools or APIs required", front matter `compatibility`).
- `SKILL.md:34` ("Editing contract") is the core: a match is a "candidate"; it becomes a "finding" only after the rule's pass conditions, context exceptions and surrounding meaning are read; a finding becomes an edit only if the user's mode and scope authorize it. "Detection alone never authorizes rewriting."
- `SKILL.md:301` ("Never inject these") lists seven rewrite failures that count as failures even when the result scores clean: fabricated speaker perspective, manufactured stakes, forced contrarianism, performed candor, em-dash theatrics, staccato conversion, invented specifics. This is the direct counterpart of our "Add no fact" section.
- `SKILL.md:62` ("Source fidelity"): "Do not invent facts, speaker experience, stance, causality, or confidence". `SKILL.md:71` ("Protected content"): quotations, code, tables, URLs, paths, identifiers and front matter are not rewritten; an applicable finding inside a protected region is reported, not fixed.
- Rewrite mode returns the full text once under "Final rewrite" with a "Verification" block listing editing passes, checks, residuals and stop reason. If no justified edit remains, the text is returned unchanged and the skill says it is clean ("zero editing passes").

Preservation and validation (`detector/validate.js`):
- Entry: `validate(original, rewritten, {residualPolicy})`, lines 319-440. CRLF is normalized first (line 330-ish comment block).
- Blocking errors (`err(...)`): `code-block-count` (345), `code-block-modified` (348), `frontmatter-modified` (355), `blockquote-modified` (366), `table-modified` (374), `inline-code-missing` (380), `url-missing` (394), `path-missing` (400), `heading-count` (409), `heading-level` (413).
- Warnings (`warn(...)`): `heading-text` (417), `number-missing` (424), `number-added` (429), `large-shrink` (437). Residual pattern growth is a quality finding `residual-grew` (467) and is an error under the default policy or a warning with `--residual-policy warn` (the policy the skill recommends, `SKILL.md` Edit-mode text).
- What the validator does not check (grep for first-person, pronoun and invent returned no hit in `validate.js`): added first-person words, added names, added claims, and lost or added words other than numbers. Number addition is a warning only. This means a rewrite that adds "we" or an invented owner passes the script; the skill text (`SKILL.md:62`, `:301`) forbids it by instruction only.
- Quote handling in the validator is exact: any change to a blockquote is an error. Inline quoted spans in the middle of prose (`"..."` or curly) are not preservation-checked by the validator (not found in the code list above); they are only masked in the detector.

Iterate loop:
- `SKILL.md:125`: a normal rewrite may use up to two editing passes (initial plus one corrective pass), and `--iterate 1|2` never raises that ceiling. "Keep going until it's clean" is mapped to the same two-pass ceiling. There is no lint-until-zero loop. The stop rule is "no further justified in-scope edit."
- So the loop is bounded by design, and residual findings that are protected, intentional or source-blocked are reported instead of fixed.

Multilingual coverage:
- None. `SKILL.md` ("What this skill is and isn't"): "calibrated for English; applying them to another language requires language-specific rules and evidence." `README.md:22` points to community adaptations. The detector has no language detection (grep for german, french, deutsch returned no code hit; only English words matched).
- Consequence: the detector would apply English regexes to French or German text, mostly producing no hits (not harmful) but also no removal. Foreign blocks inside an English document are not recognised as foreign; they are protected only if they sit in quotes, blockquotes or code.

Legitimate uses:
- Code: `maskCode()` blanks fences and inline code with index-preserving spaces (`detector/patterns.js:1352-1364`). Indented code blocks are deliberately not masked (comment at 1361).
- Front matter: masked (`initialFrontmatterRange` at 1370, used at 1540); HTML comments masked outside code (1403-1530).
- Quoted spans: `maskQuotedSpans` (1736-1747) blanks the content of double-quoted spans, keeps the marks, treats a straight quote touching a letter or digit as an inch mark, and refuses to cross a backtick. Single quotes are not treated as spans because of apostrophes.
- Illustrative text: a marker mechanism for "specimen of AI prose quoted on purpose" (comment at 1552).
- Dashes: the em-dash frequency check (`3013-3021`) excludes "separator-position" dashes (`SEPARATOR_DASH_RE`, 2641-2698): list-item separators like `- **Term** — text` and version headings `## [3.21.0] — date` (`PROOF.md` finding, per the earlier scan; I saw the `SEPARATOR_DASH_RE` code, not the PROOF finding text). The en dash and the hyphen are not counted. The rate ceiling is 1 per 1,000 words, P2, not scored.
- Hedges: `references/patterns.md:449` describes "hedged speculation dressed up as background" ("maintains a relatively low public profile", "is believed to have") as a pattern distinct from cutoff disclaimers; `patterns.md:775` profile table sets hedging to "relaxed" for technical contexts. The detector's own regex set has `HEDGE_STACK` (949-957), not "not publicly available".
- Word list: `streamline` is in the word list (`patterns.js:245`) with replacement "simplify, speed up" (`:459`).

Tests (what they show):
- `patterns.test.js` has 273 `it/test/describe` entries (count by grep; unverified that this equals test cases). `validate.test.js` has CRLF must-fire cases (named in the code comment at `validate.js:~325`). `scripts/self-scan.js` runs the detector on the repo's own documents with an exemption pass; `PROOF.md` publishes "raw" and "exempt" scores (for example README raw 58, exempt 1, budget 30) and states the budgets gate CI.
- `evals/rewrite/` holds blind A/B reviews of rewrites with frozen methods (`method-frozen.json`) and a "preservation-policy-cases.json" (58 lines). I did not read the results (unverified).
- Take-away: the evidence base is large, but the preservation tests check structure (code, front matter, quotes, URLs, headings, numbers). They do not check language or added claims.

#### 1.2 berelevant-ai/slopless (MIT, package version 0.2.41)

Structure:
- TypeScript, `type: module`, Node >= 22.13, textlint-based. `src/rules/<family>/...` with families `phrases`, `words`, `syntactic-patterns`, `academic-slop`, `semantic-thinness`, `metrics`, `markdown-layout`, `orthography`, `term-policy`, `narrative-slop`; `src/registries/*.ts` (one per family), `src/presets/standard.ts` and `everything.ts`, `src/reporting/{density,reports,sequence}.ts`, `src/cli.ts` (10 KB). `datasets/` (labelled corpora), `behavior/` (golden approved JSON per fixture corpus, `*.preserve.json` fixtures), `skills/slopless/SKILL.md` (64 lines).
- Roughly the repository carries heavy tooling (guardrail, cspell, pnpm workspace), which is irrelevant to us.

Rule catalog format and scoring:
- Rules are code. Example: `src/rules/orthography/em-dashes.ts` builds a rule with `oneToOneRule({detect, family, formatMessage, ruleId: "orthography:em-dashes", unitKind: "paragraph"})`. Word and phrase lists are JSON (`src/rules/phrases/data/corporate-speak.json:97` has `"streamline processes"`; `src/rules/syntactic-patterns/repetition/triple-word-repeat.ts:56` lists `"streamlined"` in a repetition context).
- Scoring is density based: `reporting/reports.ts` has `densityReports` and `densityRateReports`, with `rateVerdict` and `severity` (reports.ts:135-204). I did not read the thresholds (unverified).
- Output is JSON only, one family per rule namespace.

Mechanism that removes tells:
- None. `skills/slopless/SKILL.md` says: "Slopless reports findings. It does not rewrite prose." The skill workflow is: run `npx slopless`, save raw JSON under `.slopless/findings/`, summarize on request. There is no rewrite step, no preservation step and no iterate loop in the skill text.

Preservation and validation:
- Not applicable to rewrites. The `*.preserve.json` fixtures (for example `behavior/fixtures/textlint-rules/corpus/editorial-style.preserve.json`) list exact text spans (with family, bucket, source, line) that a corpus run must not flag, that is, no-false-positive anchors for the detector, not rewrite validation. I read the first 500 bytes only.

Multilingual coverage:
- None. `README.md:71`: "Slopless is English-only." The narrative family uses Compromise and WordNet (`README.md:171-173`).

Legitimate uses:
- Em dash rule flags only the closed em dash (no whitespace on either side), `em-dashes.ts` `isClosedEmDash`. Spaced em dashes, en dashes and `--` are not flagged by this rule. The message says "Replace it with a comma, colon, parenthesis, or spaced dash." This is a narrow, low-false-positive dash rule.
- The narrative family is off by default (`SKILL.md`: "Add `--narrative` only for fiction or memoir") because it "flags named feelings and scene beats that ordinary reporting uses".
- Code, quotes and front matter: textlint's Markdown parser decides which nodes become paragraphs (`unitKind: "paragraph"`). I did not verify how blockquote paragraphs, front matter or fenced code are handled (unverified).

Tests:
- Golden snapshots (`behavior/golden/<case>/approved.normalized.json` plus `.meta.json`) over fixtures such as `engineering-review`, `metrics-and-markdown`, `narrative-scenes`, `no-signal`. `behavior/probes/widened-rule-false-positive-edge-cases.md` documents false-positive probing before widening a rule. `behavior/analysis/*-reviewed.json` hold human-reviewed AI/human labels for single-word rules ("quietly", "silently"). These show a process of measuring each rule against labelled human and AI text before shipping. I did not read the contents (unverified).

#### 1.3 yasyf/slop-cop (MIT; Go port of awnist/slop-cop per `README.md:169`)

Structure:
- Go 1.x module, `cmd/slop-cop/` (CLI: `check`, `plainify`, `rewrite`, config, io), `internal/rules/` (`base.go`, `google.go`, `rules.go`), `internal/detectors/` (about 40 Go files; `word_patterns.go`, `base.go`, `base_words.go`, `google_*.go`), `internal/lang/` (analyzer registry), `internal/markdown/` (mask and suppress), `internal/htmllang/`, `internal/jslang/`, `internal/llm/` (model-backed detectors and rewrite), `skills/slop-cop-prose/SKILL.md` (363 lines), `commands/`, plugin manifests, `bin/slop-cop.binrun`.

Rule catalog format and severity tiers:
- Go structs: `types.ViolationRule{ID, Name, Category, Description, Tip, CanRemove, Color, BgColor, RequiresLLM, RewriteHint, LLMDirective, LLMDetectionHint}` (`internal/rules/rules.go:1-25`, `internal/rules/base.go:12,113`). Each rule has a per-rule `Tip` and `RewriteHint`. There are no severity tiers; rules carry a category (for example `CategoryWordChoice`) and `RequiresLLM` marks the model-backed tier. Slop-layer rules are ported 1:1 from awnist's `rules.ts` (`rules.go:1-2`).
- The report puts fix guidance once per fired rule (`skills/slop-cop-prose/SKILL.md:118`: `rules` with `name`, `category`, `tip`, `rewriteHint`) and `counts_by_rule` (SKILL.md:117) which "is empty when the draft is clean".
- Example detectors: `word_patterns.go:18` has `"streamline"` in the intensifier/elevated-word list; `:85-100` `hedgeWords` (perhaps, arguably, seemingly, apparently, "it seems", "sort of", ...) and `commaQualifiers`; `:130` `almost-hedge`; `:248` `em-dash-pivot`; `:281` a negation-then-dash pattern; `:394-397` `DetectHedgeStack`. `base.go:42-54` counts a quoted span as one word for the 40-word sentence rule.

Mechanism that removes tells:
- Detection is deterministic client-side; the skill tells the agent to rewrite and re-run. The CLI also has `rewrite` and `plainify`, which call the `claude` CLI (`internal/llm/rewrite.go`; the prompt includes "Preserve the paragraph's factual content and core meaning exactly.", line 38). I did not run or read the full prompt. Our benchmark arms do not run `claude` inside the competitor, so this path is outside the harness.

Preservation and validation:
- No original-versus-rewrite validator found in the files I grepped. `plainify` tells the model to keep facts, names, numbers and paths and to leave code alone (`SKILL.md:356-357`), and the user can pass `--forbid <regex>` to catch an identifier (`SKILL.md:359`). There is no deterministic fact-diff (unverified beyond grep).

Iterate loop:
- `skills/slop-cop-prose/SKILL.md:162`: "Check, client-side only. Iterate with `--no-llm`". The stop condition is `counts_by_rule` empty (SKILL.md:117). Exit codes (SKILL.md:131-132): 0 always unless `--strict`, then 1 with violations. This is the closest to the lint, rewrite, re-lint-until-zero loop of the three, and it has no rewrite-preservation check inside the loop.

Multilingual coverage:
- The `internal/lang` package is about input file kinds (Markdown, HTML, JS/TS), not human languages (`lang.go:1-9`). The rule texts and word lists are English. No statement of language limits found in README or AGENTS (grep for "english" matched only `plainify` text); treat as English-only (unverified in the word-list files).

Legitimate uses:
- Mask-and-suppress contract (`internal/lang/lang.go`): `Analyze(src)` returns a masked copy of the same byte length where non-prose regions are overwritten with spaces (newlines preserved), plus structural suppress ranges tagged by kind (heading, list-item, table-cell, code-block, comment, jsdoc, string-literal, jsx-text, masked); rules carry per-kind exclusions as data (`SuppressedByKind`, `internal/lang/suppress_data.go`). `internal/markdown/mask.go:55-64` states the invariants. Front-matter range is returned separately.
- I found no quote or dialogue masking for prose in `mask.go` (the `quote` hits at 581-595 are for link-destination parsing). Quoted dialogue is therefore not protected by the markdown analyzer (unverified for the whole code base).
- The "kill rule" tool: `.slopcop.toml` `disable` and `enable_only` (per the earlier scan; I did not open `config.go`).

Tests:
- Go tests next to each file (`*_test.go`), golden JSON for `readme.md`, `skill.md` (`cmd/slop-cop/testdata/*.golden.json`) and a masking fixture (`internal/markdown/testdata/fixture.md.golden`). `cmd/slop-cop/check_lang_test.go` exists. I did not read bodies. `testdata/mixed.md` is English release-note prose with stock phrases, not a foreign-language test.

### 2. Situation-by-situation comparison

For each situation: what the task asks (from `bench/head-to-head/tasks.json`), what each competitor's mechanism does, what ours does.

#### h1 French launch note (dash dialogue, quoted director line, French stock phrases, no English words)
- Task (criteria C1-C5): at least four dash-and-space dialogue lines and the quoted director line kept exactly; date, product name, price, durations kept; the French stock phrases `pas seulement`, `révolution`, `plongeons`, `robuste`, `n'hésitez pas`, `sans faille`, `en conclusion`, `l'avenir s'annonce` removed; still French (none of `the`, `and`, `we`).
- avoid-ai-writing: no French catalog. `SKILL.md` "What this skill is and isn't" tells the model the rules are English-calibrated; whether the model rewrites French anyway depends on the model. The editing contract (`SKILL.md:34`) would permit "return unchanged" when no catalog finding applies. Mechanically the French stock phrases are never detected, so C3 depends on the model's own judgment. Dialogue lines: the validator does not check them (only blockquote, table, code). Estimated risk: unverified, no run.
- slopless: reports nothing useful on French (English-only, `README.md:71`); no rewrite.
- slop-cop: English word lists; no rewrite preservation; a French file would show few or no hits (unverified).
- Ours: language detection (`src/lang.ts:112` `looksForeign`, `:150` `detectLanguage`, `:216` `frontMatterLanguage`), French stock phrases in `skills/ai-slop-linter/references/fr.md` and `fr.tells.txt`, `src/rules/fr.ts` (2.3 KB); `dashes.ts:86` `dialogueLines` and `:142` `hasRaya` treat a dash-opening line as dialogue; `dashes.ts:157` `QUOTE` handles `«…»`; `SKILL.md:33` says never edit quoted words or dialogue; `--verify` scans `fr.tells.txt` (`SKILL.md:58`).
- Gap: the stock-phrase check for French is a word-list scan, so a rewrite can replace `plongeons` with a near synonym that C3 does not list. This is the benchmark's definition, not a real defect.

#### h2 README intro in marketing voice (added first-person words, invented claims)
- Task: facts `2.3, 12,000, 4-core, 40%, 2.2, 35%, p99, Acme Corp, Node 20, MIT` kept; no dashes; listed marketing words gone; heading, fenced install block and changelog line byte-identical; no `our/we/we've/us/my` unless in the fixture; no invented benchmark conditions, owners or causes.
- avoid-ai-writing: the strongest text-level guard. `SKILL.md:62` (source fidelity), `:301` (fabricated speaker perspective, invented specifics, performed candor), `:71` (protected content). `validate.js:429` warns on added numbers, `:424` on lost numbers, `:366/348/374` errors on changed blockquote, fenced code, table. No check for added `we/our` (grep found none). Its profile table (`patterns.md:775`) shows hedging relaxed for technical contexts, which matches README register. The em-dash rate ceiling is a frequency rule, so an instruction "no em dash at all" would not be enforced by the detector (`patterns.js:3021`).
- slopless: reports tells (marketing phrases in `phrases/data/corporate-speak.json` and similar); no rewrite and no added-claim check.
- slop-cop: `streamline`, intensifiers, `em-dash-pivot` detectors; model-backed `plainify` says "Preserve factual content" (`rewrite.go:38`). No deterministic added-claim check.
- Ours: `SKILL.md:66-71` "Add no fact" (no we/our/I, no anecdote); `compare.ts:201-242` `PERSON_CANDIDATES`, `PERSON_ADDED`, `PERSON_LOST` check added or lost first-person words per language; `CLAIM_WORDS` (`compare.ts:242`) check claim words; `extractFacts` (`compare.ts:94`) covers numbers, names, versions, links, quotes, code spans; `--verify` ties lint, compare and the tell scan into one exit code. Ours is ahead of all three on added-first-person detection; none of the three has an equivalent deterministic check.

#### h14 mixed-language guide (three foreign blocks, code block, front matter)
- Task: Spanish dialogue lines, a Turkish sentence with an en dash quotation, a German quotation with low-9 marks and a spaced en dash, a French guillemet line with em dashes, and the fenced code block (comments included) byte-identical; 26 English tell patterns absent outside those; 14 facts kept; front matter (`lang: en`) unchanged.
- avoid-ai-writing: front matter masked and protected (`patterns.js:1540`, `validate.js:355` error `frontmatter-modified`); fenced code masked (`patterns.js:1358`) and exact-compared (`validate.js:345-348`); double-quoted spans masked (`patterns.js:1736`). It does not recognise foreign-language lines: Spanish raya dialogue (`—Hola`), the Turkish line and the French guillemets are not in the validator's protected set, so a rewrite that edits them passes the validator. German low-9 quotes (`„…“`) are not matched by `QUOTED_SPAN_RE` (the regex shown covers `"` and `“…”`; the full regex was cut at 170 characters, so unverified for `„`). Net: protects code and front matter well; foreign blocks only by model judgment.
- slopless: English-only; no protected-set concept for rewrite.
- slop-cop: masks code, HTML and JS regions and front matter (`mask.go:55-64`); no foreign-language handling (unverified); no rewrite check.
- Ours: `dashes.ts:120` `notEnglishProse`, `:174` `foreignOffsets`, `lang.ts:143` `PARAGRAPH_DETECT` (a short paragraph is foreign only on three distinct function words), `dashes.ts:157` `QUOTE` including `„…“`, `dashes.ts:142` `hasRaya`; `doc.ts` closes fences including inside blockquotes (`doc.ts:100-114`); `frontmatter.ts` (46 lines); `compare.ts` compares quotes and code spans. Ours is the only one that recognises foreign blocks as a class.

#### h15 CI prose check on a repo with legitimate dashes, quotes and other languages
- Task: write a `lint:prose` script and workflow; must pass on protected files (README.md, CHANGELOG.md, docs/fr/notes.md, docs/de/anleitung.md, docs/guides/setup.md) and fail (exit 1 exactly) on a new file with an em dash and three stock tells and on a stock-tell paragraph appended to README.md; within 120 seconds.
- avoid-ai-writing: ships `action.yml` and `.pre-commit-hooks.yaml`, and a per-document score budget in CI via `scripts/self-scan.js` (`PROOF.md`: README budget 30, exempt score 1). `applyExemptions()` blanks fenced code, inline code, tables, blockquotes and quoted spans before scoring (PROOF.md text). This is the closest design to h15: a ceiling per document on an exempt score, with separator dashes and list-item dashes excluded (`patterns.js:2641-2698`). Weakness for h15: English-only, so `docs/fr` and `docs/de` would produce no hits (neutral) but never fail on a new foreign-language tell.
- slopless: `npx slopless "docs/**/*.md"` outputs JSON and (per the earlier scan) has an exit code; I did not verify the exit-code rules (unverified). English-only.
- slop-cop: `check` exits 0 unless `--strict`, which exits 1 on any violation (`SKILL.md:131-132`); `.slopcop.toml` can disable rules per repo; `.pre-commit-config.yaml` exists. With `--strict` any legitimate em dash would fail unless the rule is disabled. Its dash detector is a pivot pattern (`word_patterns.go:248`, `:281`), not any dash.
- Ours: `skills/ai-slop-linter/references/ci.md` and `SKILL.md:124-126` give a `lint:prose` script with a glob, `.slop.json`, `<!-- slop-ignore -->` directives (`SKILL.md:33`), `--max-score`, exit codes, and per-language detection. Per-file and per-language handling is ours alone.

#### h17 German tells (nine German inputs from unslop's regression cases, joined)
- Task: facts kept (Petra, Lars, Variante B, Frau Kehl, KW 42, 11:00 bis 11:30, Tabelle 2, ...); none of 15 German tell patterns; no added numbers; no dash as style; 40-130 percent of word count.
- avoid-ai-writing, slopless, slop-cop: no German catalog. Same as h1: nothing removes German tells mechanically. No dash enforcement beyond the English rate rule (`patterns.js:3021`); the "no dash as style" criterion (C4) would depend on the model.
- Ours: `references/de.md` (adapted from unslop's German lists, `SKILL.md:122`) and `de.tells.txt`; `SKILL.md:114-118` lists the commonest German tells (`tauchen wir ein`, `nicht nur ... sondern auch`, `zögern Sie nicht`). The CLI "does not enforce" these by rule (`SKILL.md:114`), except through `--verify`'s tells scan (`SKILL.md:58`). `dashes.ts` flags dashes in German prose unless quoted. Round 3 shows Rule B failed on h17 (4.00 versus 4.33); a likely cause is that German tells are in a word list scanned only at the end, not caught by a rule during linting (hypothesis, not tested).

#### h18 hedge / "not publicly available" style residue (every Before line of everwrite's pattern file, joined)
- Task: facts kept; none of 14 patterns; no added numbers; no dash as style; shape kept.
- avoid-ai-writing: the closest pattern entry is `references/patterns.md:449` ("hedged speculation dressed up as background ... 'is believed to have', 'appears to have studied'") with detector type `hedge-stack` (partial, `patterns.md:297`); cutoff disclaimers (`patterns.js:832`) are a different list. I did not find the literal phrase "not publicly available" in the detector (grep found no hit). The skill text tells the model to "Preserve ... necessary hedges" (`SKILL.md` Context and intent), which pushes against aggressive removal; for h18 the criterion is removal of listed patterns, so this guard can cost points.
- slopless: `phrases` and `semantic-thinness` families may cover; unverified, I did not read them.
- slop-cop: `hedgeWords` (`word_patterns.go:85-100`), `commaQualifiers`, `DetectHedgeStack` (`:397`) cover "perhaps, apparently, it seems"; no "not publicly available" (grep in `internal/detectors/` for `publicly` found nothing).
- Ours: `references/en.md:55` ("Guesses that fill a gap: `details are not publicly available, suggesting she keeps a low profile`") and `en.tells.txt:6` (`not publicly available`) already cover the exact phrase; the scan runs in `--verify`. Round 3 Rule B failed on h18 (4.00 versus 4.67); the gap is not the missing phrase. It is likely in how the rewrite handles the other 13 patterns or the shape criterion (hypothesis, not tested).

#### h9 English stock phrases ("streamline", load-bearing metaphors, unslop's English blog passages)
- Task: rewrite `blog.md` to sound human, keep content (criteria not printed here; see `tasks.json` h9 and unslop source).
- avoid-ai-writing: word list entry `streamline` -> "simplify, speed up" (`patterns.js:245,459`), P1 word-list violation; `SKILL.md:301` forbids adding replacement metaphors or specifics; `SKILL.md` tone section says keep "load-bearing" words ("If a flagged word is clearly the right choice in context, preserve it"). The context rule helps with load-bearing metaphors.
- slopless: `streamline processes` in `corporate-speak.json:97`, `streamlined` in a repetition rule (`triple-word-repeat.ts:56`); reports only.
- slop-cop: `streamline` in the elevated-word list (`word_patterns.go:18`) with rule `RewriteHint` per rule; the skill re-runs until `counts_by_rule` is empty (a loop that would keep removing every flagged word, including a load-bearing one).
- Ours: `src/rules/vocabulary.ts` (4.3 KB) and `references/en.md`; `SKILL.md` "Fix the real tells" tells the agent to judge real tells; round 3 Rule B failed on h9 by 0.33 (4.00 versus 4.33), a small gap.

Summary across the seven situations: none of the three competitors has a deterministic mechanism for French, German, foreign blocks, added first-person words, or dialogue lines. Their advantages that matter for our failures are procedural: avoid-ai-writing's bounded two-pass loop with a "stop when no justified edit remains" rule and its explicit protected-region reporting; slop-cop's `counts_by_rule` stop condition and per-rule `RewriteHint`; and slopless's evidence process for each rule (labelled corpora, false-positive probes).

### 3. Techniques to adopt or reject

All three licences are MIT, so code copy is allowed with attribution (MIT notice). Most items below are ideas to implement independently; copying is not needed.

| # | Technique | Source (file:line) | Licence | Situation it addresses | Cost | Over-fitting risk | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Candidate -> finding -> edit contract: a match is checked against pass conditions, context exceptions and surrounding meaning before it is edited; "detection alone never authorizes rewriting" | avoid-ai-writing `SKILL.md:34` | MIT (text, adapt wording; do not copy) | h14, h15, h9 (fewer edits of legitimate uses) | About 150 tokens added to `SKILL.md`; no dependency | Low. Not tied to a fixture | Adopt as a short paragraph in our own words |
| 2 | "Never inject" list: fabricated perspective, manufactured stakes, forced contrarianism, performed candor, em-dash theatrics, staccato conversion, invented specifics | avoid-ai-writing `SKILL.md:301` | MIT | h2, h18, h9 (added claims, added first person) | About 200 tokens; no code | Low. It names failures we already forbid in "Add no fact" (`SKILL.md:66-71`); only the three new items (staccato conversion, em-dash theatrics, forced contrarianism) are new | Adopt the three new items only |
| 3 | Bounded loop with an explicit stop reason ("no further justified in-scope edit") and a final report of residuals | avoid-ai-writing `SKILL.md:125` and Output format section | MIT | h1, h17, h18 (avoids a loop that keeps rewriting past the point of benefit and shrinking the text) | No code; saves tokens (caps at two passes) | Medium. Our `--verify` is already a stop condition; a hard two-pass cap could stop before the tells are gone | Adopt the "residuals" report line; reject the two-pass cap |
| 4 | `counts_by_rule` stop condition: loop until the per-rule counts object is empty; exit 0 by default and 1 under `--strict` | slop-cop `skills/slop-cop-prose/SKILL.md:117,131-132` | MIT | h15 (CI exit code contract), h9 | Small JSON field in `src/cli.ts` | Low | Adopt the JSON field only if we do not already print per-rule counts (not checked); reject exit-0-by-default (h15 requires exit 1) |
| 5 | Preservation validator codes with severity split (blocking error versus warning) and `--residual-policy warn` | avoid-ai-writing `detector/validate.js:345-437,467` | MIT | h14 (code block, front matter, quotes exact) | Our `--compare` already covers quotes and code spans (`compare.ts:94`); only the error/warning split and a table check are missing | Low | Adopt: add a "table changed" and "front matter changed" blocking check to `--verify` if absent (not verified in our code); keep our fact-level diff, which is stronger |
| 6 | Validator gap: no added first-person or added-claim check | avoid-ai-writing `validate.js` (grep found none) | n/a | h2 | Already solved by our `compare.ts:201-242` | n/a | Reject copying; keep our approach. This is where we lead |
| 7 | Exempt-score table (raw versus exempt) published for the project's own docs and a CI budget that only goes down | avoid-ai-writing `PROOF.md`, `scripts/self-scan.js` `applyExemptions()` | MIT | h15, launch credibility | One script plus a page; Node only | Low | Adopt (scan item 2). Not a benchmark fix |
| 8 | Separator-position dash exemption (list-item separator, version heading) | avoid-ai-writing `detector/patterns.js:2641-2698` | MIT | h15 (legitimate dashes in CHANGELOG-style files) | Small regex; our `dashes.ts` already has `isListMarker` (`:186`) and `isRange` (`:196`) | Low | Check our CHANGELOG-style handling; adopt only if our `dash` rule flags `- **Term** — text` or `## [x.y.z] — date` (not tested) |
| 9 | Closed-em-dash-only rule (flag `a—b`, not `a — b`) | slopless `src/rules/orthography/em-dashes.ts` (`isClosedEmDash`) | MIT | h15 (spaced dashes in legitimate prose) | Trivial | High. Spaced em dashes are the common AI form; h2, h17, h18 require no dash at all | Reject |
| 10 | Mask-and-suppress contract: masked copy of identical byte length, structural ranges tagged by kind, per-rule exclusions kept as data | slop-cop `internal/lang/lang.go`, `internal/lang/suppress_data.go`, `internal/markdown/mask.go:55-64` | MIT | h14, h15 (headings, list items, table cells, code do not trigger rules like fragments) | Moderate refactor if our rules do not already declare per-kind exclusions (we have `masked` in `doc.ts`, per `formatting.ts:105` use) | Low | Adopt the per-rule exclusion table only for rules that show a measured false positive; do not port the Go code |
| 11 | `maskQuotedSpans` with inch-mark and backtick guards | avoid-ai-writing `detector/patterns.js:1736-1747` | MIT | h14, h15 (quoted text inside English prose) | Small; ours has `QUOTE` for guillemets and low-9 (`dashes.ts:157`) but I did not see an English straight/curly double-quote span mask | Low | Check, then adopt the edge guards (inch mark, no crossing a backtick) if our English quote mask lacks them |
| 12 | Hedge word lists and `almost-hedge`, `DetectHedgeStack` | slop-cop `internal/detectors/word_patterns.go:85-100,130,394-397` | MIT | h18 | Adds a rule family; false positives on technical text | High. Technical prose uses `may` and `could` legitimately (`patterns.md:775` marks hedging "relaxed" for technical profiles) | Reject as a lint rule; keep hedge residue in the tells scan |
| 13 | Profile table that relaxes or skips a rule per document type (for example hedging relaxed in technical docs, skipped in commit messages) | avoid-ai-writing `references/patterns.md:775` | MIT | h15, h2 | A table plus the `.slop.json` key per profile | Medium. Our categories already differ by context (commit, PR, Markdown) | Reject for now; revisit only with a measured false positive |
| 14 | Human-labelled single-rule review files and false-positive probe notes before widening a rule | slopless `behavior/analysis/*-reviewed.json`, `behavior/probes/widened-rule-false-positive-edge-cases.md` | MIT (data licence per source folder not checked: unverified) | all (precision) | Process cost; no runtime cost | None | Adopt as a practice, not as data. Do not copy datasets without checking each `LICENSE.md` |
| 15 | `plainify`/`rewrite` through a model call with `--forbid <regex>` as a post-check | slop-cop `internal/llm/rewrite.go:38`, `SKILL.md:359` | MIT | h2 (identifier kept) | Calls `claude` CLI; adds a network and cost dependency | High. Conflicts with our deterministic, offline claim | Reject |
| 16 | False-positive-reviewer sub-skill: a second look at each finding before it is fixed | avoid-ai-writing `skills/false-positive-reviewer/SKILL.md` (existence seen; body not read) | MIT | h14, h15 | Adds tokens per run; a second agent pass | Medium | Reject for the benchmark (token cost, Rule A budget); revisit after reading it |
| 17 | German/French catalogs and language detection | none of the three has them | n/a | h1, h17 | n/a | n/a | Nothing to adopt. Keep ours; this is the differentiator |

Recommended minimal set for the Rule B failures (h1, h2, h9, h14, h17, h18): adopt #2 (three new "never inject" items), #3 (residuals line only), #5 (table/front-matter blocking checks in `--verify`, after confirming they are missing), #11 (quote-span edge guards, after checking), and #7/#8 for h15 and launch evidence. None of these needs a new dependency. Reject #9, #12, #13, #15, #16.

Unverified, to check before acting: (a) whether our `--verify` already blocks changed tables and front matter; (b) whether our English quote mask handles inch marks; (c) whether `QUOTED_SPAN_RE` in avoid-ai-writing covers `„…“`; (d) slopless exit codes and textlint treatment of blockquotes; (e) slop-cop's `config.go` rule-disable semantics and rule count; (f) the contents of avoid-ai-writing `evals/rewrite/reports/*`.

---

## Task C: general open-source and technology survey

Date of research: 2026-10-22. Problem: remove AI-writing tells from a text without changing its facts, in English, German, Turkish, French and other languages, with a deterministic gate.

### 0. Scope, method and limits

- Every URL listed under "Fetched" below was opened with WebFetch in this run. The WebFetch tool answers through a small model that summarises the page, so numbers are as that summary reported them. Items marked "unverified" were not confirmed on a page I opened.
- WebSearch results were used only to find candidates. A search-result snippet is not treated as verified. Where I cite a result that I found only through search, I mark it "search-only, unverified".
- I did not clone or run any code. I did not read docs/HEAD-TO-HEAD.md body text in this run (only its heading list), so I have no new claim about the benchmark's internals. The mapping from technique to loss class uses the six loss classes named in the task brief: (A) stock phrases kept after rewrite; (B) added words or claims; (C) broken foreign blocks or quotes; (D) legitimate dashes flagged in CI; (E) fact or number loss; (F) German and Turkish coverage.
- Important framing: AI-detector scores are NOT the benchmark metric. The benchmark scores remaining tells and fact survival. A detector probability tells nothing about whether a specific rewrite kept the number "62" or the name "Zürich". Detector material below is research input or an optional advisory check, never a pass/fail criterion for the benchmark.

Fetched URLs (all opened in this run):
- https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing (first 100,000 of 254,134 characters read)
- https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup (first 100,000 of 167,172 characters read)
- https://en.wikipedia.org/wiki/Wikipedia:Copyrights
- https://huggingface.co/openai-community/roberta-base-openai-detector
- https://huggingface.co/Hello-SimpleAI/chatgpt-detector-roberta
- https://huggingface.co/desklib/ai-text-detector-v1.01
- https://huggingface.co/ads2009/turkish-ai-text-detector-convbert
- https://huggingface.co/datasets/Hello-SimpleAI/HC3
- https://huggingface.co/datasets/liamdugan/raid
- https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- https://huggingface.co/sentence-transformers/LaBSE
- https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7
- https://huggingface.co/intfloat/multilingual-e5-small (fetch returned navigation only; no data)
- https://github.com/errata-ai/vale and https://docs.vale.sh/topics/cli
- https://github.com/textlint/textlint
- https://github.com/languagetool-org/languagetool
- https://github.com/amperser/proselint
- https://github.com/btford/write-good
- https://github.com/get-alex/alex
- https://github.com/ahans30/Binoculars
- https://github.com/sam-paech/antislop-sampler
- https://clawhub.ai/tikitackr/humanizer-de
- arXiv abstracts: 2410.04265, 2406.07016, 2510.15061, 2304.02819, 2305.14902, 2305.13242, 2405.07940, 2401.12070, 2506.07001, 2602.08934, 2605.19516, 2602.13504

Licence record limits: for GitHub repositories the licence statement comes from the repository front page text as summarised by the tool. I did not read the LICENSE file's first line for these (no clone was made in this task). Licence field values on Hugging Face come from the model card or dataset card header as summarised.

### 1. Catalogs

#### 1.1 Wikipedia "Signs of AI writing" (WP:AISIGNS)

- URL: https://en.wikipedia.org/wiki/Wikipedia:Signs_of_AI_writing (fetched; I read only the first 100,000 characters of 254,134).
- Status stated on the page: an advice page from WikiProject AI Cleanup, not policy and not reviewed by the community. The page calls itself descriptive, not prescriptive, and says signs are not proof (same fetch).
- Structure (from the fetch): Caveats; Content (inflated significance, promotional tone, vague connections, vague attributions, formulaic "challenges" sections); Language and grammar (overused vocabulary, avoidance of "is/are" constructions, negative parallelisms, rule-of-three); Style (title case, overused boldface, inline-header lists, heading errors, emoji, tables, curly quotes); Markup (Markdown misuse, broken wikitext, chatbot citation artifacts); Citations (broken links, DOIs, ISBNs); chatbot-directed communication; edit summaries; signs of human writing; ineffective indicators; historical indicators.
- Word examples reported by the fetch from the page's lists: delve, crucial, pivotal, underscore, tapestry, testament, vibrant, showcasing, enduring, intricate, landscape, boasts, bolstered, garner, fostering, interplay, meticulous, robust, "align with", "serves as", "stands as", "Despite these challenges".
- Licence: the Signs page text I received contained no licence footer (the summary said so, and the text was truncated). The general Wikipedia policy page (https://en.wikipedia.org/wiki/Wikipedia:Copyrights, fetched) says text contributions are CC BY-SA 4.0, and also GFDL unless a page has only CC BY-SA-compatible text. Reusers must credit the page (link or list of authors), indicate changes, and release modifications under CC BY-SA 4.0 or later.
- What may be reused (my reading; not legal advice, unverified by a lawyer):
  - Individual words and short phrases as facts about language are not copyrightable expression in most jurisdictions. A word list that we compile ourselves from our own corpus and test cases is safe.
  - Copying the page's prose, its category descriptions, or its curated list wholesale into a shipped file would make that file a derivative work under CC BY-SA 4.0 (share-alike plus attribution). That obligation could attach to the whole catalog file but would not necessarily attach to the linter code. Unverified.
  - Safe pattern: use the page as a checklist of categories to test against, write our own rules and examples, and cite the page in docs as an inspiration with a link. If a literal list is copied, keep it in a separate data file with CC BY-SA 4.0 attribution.
- Loss class addressed: (A) stock phrases kept; (B) added promotional words and claims; (D) partly, because the page lists ineffective indicators (see below).
- The page includes sections named "signs of human writing" and "ineffective indicators" (section names from the fetch; contents not read in this run). These are directly relevant to false-positive control (legit dashes, curly quotes). Unverified content: I did not read what it says about dashes. The German Wikipedia equivalents listed in the WikiProject sidebar are "WikiProjekt KI" (German), "Projet:Observatoire des IA" (French), "Tekoälyvalvomo" (Finnish) (names from the fetch of the WikiProject page). I did not open them, so I do not know if they contain German or French tell lists.
- Cost: none (documentation). Generalisation risk: the list is English-oriented and compiled from Wikipedia edits, a formal encyclopedic register. Words such as "robust" and "crucial" are legitimate in technical READMEs, so a word-only match will over-flag on engineering text.
- Recommendation: adopt as a category checklist and test-case source (not as a copied list). Mark: adopt (categories), optional (copied word list with CC BY-SA attribution).

#### 1.2 WikiProject AI Cleanup

- URL: https://en.wikipedia.org/wiki/Wikipedia:WikiProject_AI_Cleanup (fetched; first 100,000 of 167,172 characters).
- Contents reported: goals; WP:LLM guideline restricting LLM use to translation and basic copyediting; links to Signs of AI writing, LLM dungeon (list of LLM-made articles with bogus sources), LLM demonstration pages, Cite Unseen (user script flagging citations to AI-generated sites or URLs with LLM tracking parameters), perennial sources, academic sources regarding synthetic content.
- No separate phrase list was found on this page (fetch said so).
- Relevance: "Cite Unseen" suggests a deterministic check that URLs contain LLM tracking parameters (for example `utm_source=chatgpt.com`). I did not open Cite Unseen; the existence of that URL-parameter check is as reported by the summary. Unverified whether exact parameters are documented.
- Loss class: (A) chatbot artifacts in citations and URLs. Recommendation: research-only.

#### 1.3 Other published tell lists found

- Antislop slop lists (repo: https://github.com/sam-paech/antislop-sampler, fetched). Files named in the fetch: `slop_phrase_prob_adjustments.json`, `slop_phrase_prob_adjustments_full_list.json`, `slop_phrases_2025-04-07.json`, `slop_words_2025-04-07.json`, `slop_regexes.txt`. Licence reported: Apache-2.0. The author says the default list is "mostly auto-generated" and "not well optimised or curated", and recommends building your own. The fetch did not state the language of the lists; they were built for English creative-writing output (inference from the project's goal; unverified). Use: data to cross-check coverage of our English catalog. Apache-2.0 allows reuse with notice. Risk: tuned to specific models' fiction output, not to commit messages or READMEs. Recommendation: research-only; optional as a coverage cross-check.
- Kobak et al. excess vocabulary (https://arxiv.org/abs/2406.07016, fetched): analysed over 15 million PubMed abstracts 2010 to 2024; style words rose after LLMs appeared; lower bound of 13.5% of 2024 abstracts processed with LLMs; Science Advances Vol. 11, No. 27 (July 2025). The paper provides a method (frequency ratio before and after 2022) and an English word list in its supplement (supplement not opened; unverified). Licence: not read from the abstract page. Recommendation: research-only for English; the method is reusable to derive our own German, Turkish and French lists from a dated corpus.
- Search-only, unverified: a Korean excess-vocabulary study (https://arxiv.org/pdf/2609.07447) that cites a 34-language analysis by Juzek reporting shared overused concepts across languages (24 languages shared an "emphasize"-type verb). I did not open this paper or the Juzek paper; I only saw a search summary. Marked unverified. It is the most relevant lead for de/tr/fr and should be opened in a later pass.
- Search-only, unverified: a Graphite analysis reported by hyper.ai claiming 13,000+ phrases and that em-dash frequency is decreasing in newer models. Not opened. Do not rely on it.
- German press (t3n, Mindverse), search-only, unverified: they state that there is no accurate published list of German ChatGPT words, and name the dash and "nicht nur ... sondern auch" as candidates. I did not open these articles.

### 2. Detection models and datasets

General warning, supported by opened sources: detectors are unreliable on non-native and formal text (Liang et al., https://arxiv.org/abs/2304.02819, fetched: detectors often labelled non-native English samples as AI-generated; basic prompt changes reduced the bias and also got past the detectors; the abstract page gave no numeric rates), and they generalise poorly to unseen domains or generators (M4, https://arxiv.org/abs/2305.14902, fetched; MAGE, https://arxiv.org/abs/2305.13242, fetched; RAID, https://arxiv.org/abs/2405.07940, fetched: detectors "easily fooled by adversarial attacks").

| Item | URL (fetched) | Licence | Size | Languages | Claim |
|---|---|---|---|---|---|
| openai-community/roberta-base-openai-detector | https://huggingface.co/openai-community/roberta-base-openai-detector | MIT | about 0.1B (RoBERTa base, about 125M) | English | about 95% accuracy on GPT-2 1.5B text, 510-token examples; card says not high enough for standalone detection and not to use as a ChatGPT detector for misconduct claims |
| Hello-SimpleAI/chatgpt-detector-roberta | https://huggingface.co/Hello-SimpleAI/chatgpt-detector-roberta | not stated on card | not stated (fine-tuned from roberta-base) | English | no metrics on card; trained on all HC3 without held-out |
| desklib/ai-text-detector-v1.01 | https://huggingface.co/desklib/ai-text-detector-v1.01 | MIT | about 0.4B (deberta-v3-large) | English | leads RAID "at the time of submission"; no numeric figures; example truncates at 768 tokens |
| ads2009/turkish-ai-text-detector-convbert | https://huggingface.co/ads2009/turkish-ai-text-detector-convbert | "More Information Needed" (no licence) | about 0.1B | Turkish | no training data, metrics or limitations on card |
| Binoculars (code) | https://github.com/ahans30/Binoculars | BSD-3-Clause | default scoring models Falcon-7B and Falcon-7B-Instruct | stronger on English; weaker elsewhere | paper reports over 90% of ChatGPT samples at 0.01% false positive rate (https://arxiv.org/abs/2401.12070, fetched); repo says academic use only and human oversight advised |

Datasets:
- HC3 (https://huggingface.co/datasets/Hello-SimpleAI/HC3, fetched): CC-BY-SA-4.0 with a note that stricter source licences override; English and Chinese; about 147 MB; question and answer pairs, mostly reddit_eli5; ChatGPT answers from an early period.
- RAID (https://huggingface.co/datasets/liamdugan/raid, fetched): MIT; domains include German and Czech (the `extra` split covers code, Czech and German); 11 LLMs; about 16.7 GB; test split unlabelled; the page has internal count mismatches. Paper: over 6 million generations, 11 models, 8 domains, 11 attacks.
- M4 (arXiv abstract only): multilingual, CC BY 4.0 for the paper; the abstract does not name languages; dataset on GitHub (not opened). Whether it contains German or Turkish: unverified.
- MAGE (arXiv abstract only): best detector reached 86.54% on out-of-domain text from a new LLM; resources on GitHub (not opened).
- Turkish: arXiv 2602.13504 (https://arxiv.org/abs/2602.13504, fetched): fine-tuned dbmdz/bert-base-turkish-cased on 3,600 labelled Turkish news articles; F1 0.9708 on held-out test; an estimated 2.5% of examined news rewritten by LLMs. Model and dataset availability and licence: unverified. A Mendeley Turkish scholarly-abstract benchmark (1,678 records) appeared in search only; unverified.
- German: RAID's German domain is the only German detection data I verified.

Feasibility inside an npm CLI or an agent skill:
- Transformer detectors (0.1B to 0.4B parameters) need roughly 0.5 GB to 1.6 GB of float32 weights (my arithmetic from parameter counts, not a number from the cards). They need ONNX or Python runtime. That adds a dependency far larger than a zero-dependency linter. CPU latency per document is unverified; I did not measure it.
- Binoculars needs two 7B models; not feasible for a CLI.
- All verified English detectors are English-only, so they do not help German or Turkish. The only Turkish model has no licence and no documentation.

Decision:
- Detector scores must not enter the gate. Reasons: (1) not the benchmark metric; (2) documented false positives on non-native and formal text; (3) evasion papers show scores can be driven down without improving fact preservation, and also that paraphrase alone can raise detection (Cheng et al. https://arxiv.org/abs/2506.07001, fetched: simple paraphrasing raised T@1%F by 8.57% on RADAR and 15.03% on Fast-DetectGPT); (4) a gate that optimises a detector rewards detector-targeted rewriting that may drop or alter facts.
- Recommendation: research-only. HC3, RAID (German domain) and the Turkish news paper are research inputs for building held-out test texts and for deriving word frequencies. Optional offline advisory check: not recommended at this stage; if built later, make it a separate non-gating command with a dependency that is optional.

### 3. Meaning preservation

#### 3.1 Learned checks (NLI, embeddings)

- mDeBERTa NLI: https://huggingface.co/MoritzLaurer/mDeBERTa-v3-base-xnli-multilingual-nli-2mil7 (fetched). MIT; about 0.3B parameters; fine-tuned on 27 languages including German, French, Turkish; XNLI test accuracy German 0.824, French 0.823, Turkish 0.792, English 0.871 (card figures). Use: check that rewrite entails original and original entails rewrite. Weakness: NLI accuracy of about 80% means about 1 in 5 sentence pairs misjudged; it is weak on numbers and named entities (my judgement; unverified experimentally). Cost: about 1.2 GB float32 estimated (arithmetic), Python or ONNX runtime. Loss classes: (B) added claims, partly (E). Recommendation: optional, research-only; not for the gate.
- paraphrase-multilingual-MiniLM-L12-v2: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 (fetched). Apache-2.0; about 0.1B parameters; tagged 50 languages (list not shown, so German, Turkish, French inclusion is unverified from the card); 384-dim; max sequence length 128 tokens. Embedding cosine similarity does not detect a changed number or a negation reliably (my judgement, unverified experimentally). Recommendation: optional offline advisory only.
- LaBSE: https://huggingface.co/sentence-transformers/LaBSE (fetched). Apache-2.0; about 0.5B parameters; 109 or 110 languages; 256-token truncation; 768-dim. Designed for translation-pair retrieval, so it is less suited to same-language paraphrase checks (my judgement). Recommendation: reject for this use.
- multilingual-e5-small: fetch returned navigation only; no data. Unverified; not recommended.
- Adversarial papers show that semantic-preservation scores are themselves judge-dependent: StealthRL (https://arxiv.org/abs/2602.08934, fetched) used LLM-based Likert scoring for quality; HIP (https://arxiv.org/abs/2605.19516, fetched) used a judge model per the search summary (the judge-model detail is search-only, unverified). Lesson: a learned similarity score is a soft signal; it does not prove that "62 facts survive".

#### 3.2 Deterministic fact guards (no dependency)

I did not find an opened source that evaluates a deterministic "facts preserved" extractor. The list below is my engineering judgement, not literature. Marked "unverified against literature".

- Extract from original and rewrite, compare as multisets: digits with units and separators (normalised across `1,000`, `1.000`, `1 000` and Turkish decimal comma), dates and versions (`v2.3.1`, ISO dates), URLs, emails, file paths, code spans and fenced blocks (must be byte-identical), identifiers in backticks, capitalised names and acronyms (must not disappear; may appear only if present in original), quoted strings (must be identical), negation words per language (not, no, never; nicht, kein, nie; ne ... pas, jamais; değil, hayır, yok), quantifiers and qualifiers (only, at least, up to; nur, mindestens, bis zu; seulement, au moins; en az, yalnızca), modal verbs.
- Added-content guard: every number, proper noun, URL, or code identifier in the rewrite must exist in the original. This directly addresses (B) added claims and (E) fact loss, and is language-independent for digits, URLs, code.
- Foreign-block guard: segment by language or by block (fenced code, blockquote, lines in another script or detected foreign run) and require foreign blocks to appear unchanged in the rewrite. Addresses (C).
- Edit-distance guard: a ceiling on changed characters per paragraph, or token-level diff size, and a ceiling on net length growth. Addresses (B) partly. Risk: a high ceiling does nothing; a low ceiling blocks legitimate restructuring (for example, deleting a hype opener).
- Limits: a deterministic guard cannot detect a swapped subject, a reversed causal claim, or a changed tense that changes meaning. Negation and qualifier multisets catch many but not all cases.
- Verdict: for the benchmark's fact-survival criterion, a no-dependency deterministic version covering numbers, names, URLs, code, quotes, negations and qualifiers is sufficient as the gate. Learned checks are an advisory second layer. Recommendation: adopt (deterministic guard); optional (NLI as advisory); reject (embedding similarity as a gate).

#### 3.3 Minimal-edit literature

- I did not open a minimal-edit rewriting paper in this run, so I cite none. Grammar-correction systems that predict edits instead of regenerating the full text are the closest family (my recall, unverified). The practical implication stands without citation: a rewrite that proposes edits (delete span, replace span, from a fixed rule set) cannot add new facts, whereas a free regeneration can. Recommendation: research-only until a source is opened.

### 4. Lint, rewrite, re-lint loops

Tools opened:

| Tool | Licence | Exit codes (verified?) | Report formats | False-positive handling |
|---|---|---|---|---|
| Vale (https://docs.vale.sh/topics/cli) | MIT (repo page) | 0 no error-level alerts; 1 at least one error; 2 could not run (bad config, rule load failure, unreadable document); `--no-exit` makes 1 into 0 but not 2 (verified) | `CLI`, `line` (`file:line:column:check:message`), `JSON` (keyed by file; rule, level, matched text, line, span, message, action), Go template (verified) | skips code spans, URLs and fenced blocks before rules run (repo page); inline disable syntax not on the CLI page (unverified); vocabulary accept/reject not read |
| textlint (https://github.com/textlint/textlint) | MIT | not documented on page (unverified) | stylish, compact, checkstyle, github, jslint-xml, junit, tap, table, pretty-error, json, unix | rule on/off in `.textlintrc`; comment suppression via a filter rule (`<!-- textlint-disable -->`); `.textlintignore`; `--fix` with `--dry-run` |
| proselint (https://github.com/amperser/proselint) | BSD-3-Clause | not documented (unverified) | plain text; `--output-format json` with `check_path`, `message`, `pos`, `span`, `replacements` | `proselint.json` check on/off; `per_file_checks` globs |
| write-good (https://github.com/btford/write-good) | MIT | `--parse` gives conventional Unix exit code (page); values unverified | grouped text with carets; `--parse` output; API array of `reason`, `index`, `offset` | `--no-<check>` flags; `whitelist` API option; custom checks, for example schreib-gut for German via `--checks` |
| alex (https://github.com/get-alex/alex) | MIT | not documented (unverified) | not read | `<!--alex ignore rule-->`, `disable`/`enable` comments; `.alexrc` `allow` array; `.alexignore` for files |
| LanguageTool (https://github.com/languagetool-org/languagetool) | LGPL 2.1 or later | not read | HTTP API, Java API; formats not on page | not on page; Java 17 needed to build; German and French confirmed, Turkish not mentioned on the README |

Patterns for an "iterate until the gate passes" loop (the engineering design is my recommendation; the tool facts are verified above):
- Exit code contract: copy Vale's three-way split. 0 = clean at the chosen severity; 1 = tells found; 2 = the tool could not run or could not parse the input. A rewrite agent must treat 2 as "stop and report", not as "retry". A `--no-exit` style flag is useful for CI jobs that only report. This addresses (D): CI can run with warnings reported and only error-level findings failing.
- Severity levels: Vale's suggestion, warning and error with `--minAlertLevel` lets legitimate dashes stay as "suggestion" while structural tells fail. Addresses (D).
- Machine-readable report: use `file:line:column:rule:message` (Vale `line`) plus JSON with offsets (`span` in Vale, proselint) so an agent can patch precisely and re-run. Offsets and rule ids are what make a loop converge instead of re-flagging the same text.
- Loop termination: the loop needs a maximum iteration count (suggest 3) and a fact-guard check on every iteration (section 3.2). Without the guard, repeated rewriting can erode facts: HIP (https://arxiv.org/abs/2605.19516, fetched) uses iterative paraphrasing as an attack, which indicates repeated rewrite passes drift from the original; the abstract claims meaning is preserved better than baselines but the reliability of that claim is unverified.
- False positives: three mechanisms exist in the opened tools. (1) Skip structural regions (code, URLs, fences) before matching: Vale. (2) Inline comment suppression with named rule ids: alex, textlint (via filter), so a reviewer can mark a legitimate em dash. (3) Config allow lists per rule or per file glob: proselint `per_file_checks`, alex `allow`. All three address (D) and (C).
- `--fix` semantics: textlint distinguishes `--fix` from `--dry-run`. Only rules with unambiguous, fact-neutral fixes (for example deleting a sign-off line) should auto-fix; rewriting should stay with the agent and be verified by the gate.
- Recommendation: adopt exit-code split, severity levels, JSON with spans, inline suppression comments and per-glob allow lists. Reject LanguageTool as a dependency (Java, LGPL, Turkish unconfirmed).

### 5. Multilingual lists

Verified findings are thin. I found no opened repository that publishes a maintained German, Turkish, French or Spanish AI-tell word list with a clear licence.

- Humanizer-DE (https://clawhub.ai/tikitackr/humanizer-de, fetched): an OpenClaw skill for German. Reports 24 AI patterns rated HIGH, MEDIUM, LOW; vocabulary tiers (Tier 1 forbidden, Tier 2 sparing, Tier 3 watch); 48 forbidden phrases; 16 chatbot artifacts; five co-occurrence sets; statistical signals (burstiness, type-token ratio, sentence-length variation, trigram repetition, Flesch-DE). Licence conflict on the page: description says MIT, sidebar says MIT-0 (unresolved; treat as permissive but re-check the actual LICENSE before copying). The vocabulary files were not visible, so I could not read any phrase. Use: study its category design for German. Reuse: only after reading the real files and licence. Recommendation: research-only; candidate for deeper reading. Overfitting risk: a score-based detector design (0 to 100 AI likelihood) is the opposite of a fact-preserving rewrite gate.
- write-good with schreib-gut (page mentions a German extension named schreib-gut; I did not open it; licence unverified). Recommendation: research-only.
- German press (search-only, unverified): candidate German tells are the dash and "nicht nur ... sondern auch", plus "man kann sagen, dass". Not opened; use as hypotheses to test against real German LLM output.
- Turkish: no tell-list repository found. Search surfaced only detection work (section 2).
- French and Spanish: no list found in this run. Wikipedia's French project name "Projet:Observatoire des IA" was reported in the sidebar of the WikiProject page (not opened).
- Cross-lingual: the Juzek 34-language lead (search-only, unverified) suggests shared concept-level overuse across languages. If confirmed, a concept-level list translated by native review is the feasible route.
- Recommended method for de/tr/fr/es (my judgement, not from a source): derive candidate lists with the excess-vocabulary approach of Kobak et al. (https://arxiv.org/abs/2406.07016, fetched) on pre-2022 versus 2024 or later text in each language, then add structural patterns that are language-independent (inflated-significance openers, negative parallelism, rule-of-three, bold-label lists, sign-offs, hedging closers) translated with native-speaker review. Structural patterns generalise across languages better than single words, and they carry less risk of breaking quoted foreign blocks if quotes are excluded first.
- Loss class: (F) German and Turkish coverage; (A) stock phrases; (C) must exclude foreign blocks and quotes before matching.
- Over-fitting risk: lists derived from the benchmark's own tasks (h1 to h18) would overfit. Any new list must be built from sources outside the tasks and frozen before measurement, consistent with the repository's frozen-protocol practice (the practice is visible in commit names such as "freeze the round 4 measurement protocol before any run"; I did not read the protocol text).

### 6. Papers (all opened as arXiv abstract pages)

| arXiv | Title | Finding relevant to this problem | Licence of work |
|---|---|---|---|
| https://arxiv.org/abs/2406.07016 | Delving into LLM-assisted writing in biomedical publications through excess vocabulary (Kobak et al.) | Method to find excess style words by frequency change; 13.5% lower bound of 2024 abstracts LLM-processed; up to about 40% in some subcorpora | not read |
| https://arxiv.org/abs/2510.15061 | Antislop (Paech et al.) | Slop patterns appear 1,000+ times as often as in human text for some patterns; token banning breaks down near 2,000 patterns; backtracking sampler handles 8,000+; FTPO fine-tuning reports about 90% reduction; code MIT per abstract page (repo page said Apache-2.0: discrepancy, unresolved) | MIT (abstract) / Apache-2.0 (repo page) |
| https://arxiv.org/abs/2410.04265 | AI as Humanity's Salieri (Lu et al.) | Creativity index from web-snippet overlap; alignment lowers LLM index about 30.1%; does not discuss slop lists directly | not read |
| https://arxiv.org/abs/2304.02819 | GPT detectors are biased against non-native English writers (Liang et al.) | False positives on non-native writing; prompt tweaks evade | not read |
| https://arxiv.org/abs/2305.14902 | M4 | Detectors fail on unseen domains and generators; tend to label machine text as human | CC BY 4.0 |
| https://arxiv.org/abs/2305.13242 | MAGE | Out-of-distribution detection is hard; best 86.54% on out-of-domain new-LLM text | not read |
| https://arxiv.org/abs/2405.07940 | RAID | Detectors easily fooled by adversarial attacks; commercial claims of 99%+; FPR not in abstract | not read |
| https://arxiv.org/abs/2401.12070 | Binoculars | Zero-shot detection with two related models; over 90% at 0.01% FPR | code BSD-3 (repo) |
| https://arxiv.org/abs/2506.07001 | Adversarial Paraphrasing (Cheng et al.) | Plain paraphrase can raise detection; detector-guided paraphrase cuts T@1%F by 87.88% on average (RoBERTa guidance) with slight quality loss | not read |
| https://arxiv.org/abs/2602.08934 | StealthRL | RL paraphrase policy (GRPO, LoRA on Qwen3-4B); reward balances evasion and semantic preservation; mean TPR@1%FPR 0.024 | not read |
| https://arxiv.org/abs/2605.19516 | Base Models Look Human To AI Detectors | Detectors appear to key on instruction-tuning artifacts; HIP iterative paraphrasing | not read |
| https://arxiv.org/abs/2602.13504 | Turkish news AI detection (Ozdemir) | BERT-Turkish classifier, F1 0.9708; 2.5% of examined news LLM-rewritten | not read |

Reading for this project:
- The evasion papers optimise detector scores with semantic preservation as a secondary reward. They confirm that the detector-score objective and the fact-survival objective are separate, and that quality and meaning are judged with LLM judges whose reliability is itself unverified. None of them is a method for removing tells under a fact-survival criterion. They are research-only. Do not adopt detector-guided rewriting; the benchmark does not score it and the first paper reports that plain paraphrase can increase detectability.
- Antislop supplies two usable ideas: (1) slop lists should be built per model and per register by comparison against a human baseline; (2) very long ban lists have cost. For a deterministic linter, 2,000+ patterns is a maintenance and false-positive risk; a lint run is cheap, but each pattern needs a test.

### 7. Ranked shortlist

Ranking is by expected effect on the benchmark's Rule A and Rule B failures (tells removed and fact survival), then by cost. Rule A and Rule B figures are taken from the task brief. I did not verify which tasks lose points for which reason in this run, so the "loss class" mapping is a hypothesis.

1. Deterministic fact guard, no dependency (section 3.2). Class: (E), (B), (C). Cost: none beyond code; milliseconds. Risk: false alarms on legitimately removed numbers (for example a number inside a deleted hype sentence); mitigate by reporting "removed" separately from "added". Recommendation: adopt. Reason: the benchmark scores fact survival, and h1, h2, h14 (foreign blocks, mixed languages) and h18 are among the tasks where ours trails, so the guard directly targets lost facts and mangled foreign blocks (hypothesis; per-task causes unverified).
2. Exit-code and severity contract copied from Vale (section 4): 0, 1, 2; severity with minimum level; `file:line:column:rule:message` plus JSON with spans. Class: (D). Cost: none. Recommendation: adopt. Verified at https://docs.vale.sh/topics/cli.
3. Inline suppression comments and per-glob allow lists (alex, textlint, proselint; section 4). Class: (D), (C). Cost: low. Recommendation: adopt. Skip structural regions (code, URLs, fences, quotes) before matching, as Vale does.
4. Iteration cap and guard on every pass in the lint, rewrite, re-lint loop (section 4). Class: (E), (B). Cost: none. Recommendation: adopt (cap of about 3 passes is my suggestion).
5. Category checklist from Wikipedia Signs of AI writing, implemented as our own rules and tests (section 1.1). Class: (A), (B). Cost: authoring effort. Licence: do not copy the page text into shipped data without CC BY-SA 4.0 attribution and share-alike analysis. Recommendation: adopt categories; optional for a separately licensed literal list.
6. Language-independent structural patterns plus per-language lists derived by excess-vocabulary method on dated corpora, with native review (section 5). Class: (F), (A). Cost: corpus collection and reviewer time. Over-fitting risk: high if derived from benchmark tasks; must be built outside h1 to h18 and frozen. Recommendation: optional now, adopt after a source corpus and a reviewer exist.
7. Humanizer-DE category design (section 5). Class: (F). Recommendation: research-only until its real files and licence are read.
8. mDeBERTa XNLI as an advisory check (section 3.1). Class: (B). Cost: about 0.3B parameters and a Python or ONNX runtime. Accuracy 0.79 to 0.87 on XNLI. Recommendation: optional, off by default, never in the gate.
9. Antislop word lists as an English coverage cross-check (section 1.3). Class: (A). Apache-2.0. Recommendation: research-only.
10. Hugging Face detectors and detection datasets (section 2). Recommendation: research-only. Reasons: English-only, not the benchmark metric, documented false positives on non-native and formal text, large dependency. Use RAID German data and the Turkish news paper only as sources of texts for building test material.
11. Embedding similarity (MiniLM, LaBSE) as a gate. Recommendation: reject. It does not reliably catch a changed number or a negation (judgement), and adds a model download.
12. LanguageTool as a dependency. Recommendation: reject (Java 17, LGPL 2.1+, Turkish not confirmed on its README).
13. Detector-guided or RL paraphrasing (Adversarial Paraphrasing, StealthRL, HIP). Recommendation: reject for the product; research-only for understanding why detector scores are not a safe objective.

### 8. Open items for a later pass (not done in this run)

- Open the Juzek 34-language paper and the Korean excess-vocabulary study (https://arxiv.org/pdf/2609.07447) to check whether German, French, Turkish and Spanish lists exist.
- Read the full "ineffective indicators" and "signs of human writing" sections of WP:AISIGNS (beyond the first 100,000 characters) for dash and quote guidance relevant to class (D).
- Open German and French Wikipedia AI-cleanup pages for local tell lists.
- Clone and read, without running, the Humanizer-DE files to resolve the MIT versus MIT-0 conflict and read its vocabulary lists.
- Read the real LICENSE first line for each repository cited if any of them is later used as a data source.
- Find a minimal-edit rewriting paper and open it before citing.
- Measure nothing: no latency, size or accuracy numbers in this document were measured by me. All are card or abstract figures, or marked as my arithmetic.
