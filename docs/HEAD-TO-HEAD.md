# Head-to-head benchmark

Status: tasks h1 to h12 were frozen on 2026-10-21, before any round-1 product change. Five of them were retired on 2026-10-22 because every arm scored at or near full marks on them, a sixth (h8) was retired the same day as a duplicate of h16, and six harder tasks (h13 to h18) were frozen on 2026-10-22, in one commit, before any run of them. See "Saturation ruling" below.
Frozen at commit: see git log for the commit that added this file, and for the commit titled "test(bench): replace the saturated tasks with harder variants, frozen before the new runs".

This page defines the public benchmark that compares ai-slop-linter with other tools that claim to fix AI-sounding prose. It states the tasks, the exact prompts, the fixtures, the scripted criteria, and the rule for a win. The results of each round are recorded here too.

## Why these tasks

Each task asks an agent to edit a real kind of file in place: a French launch note, a README intro, a pull request description, release notes, a mixed-language guide, and a repository set-up. A task scores only what the file contains afterwards, so a tool that talks about the problem without changing the file gains nothing. Each task also carries a fact or a form that a careless rewrite would break: numbers, names, code, links, and quoted non-English lines. Scripted criteria check those, so the cheap fix (delete the text, or rewrite it into something plausible but false) does not pass.

## Arms

Eight arms run on every task, three times each. The model for every arm is the full id `claude-sonnet-5-5` (parameter `H2H_MODEL`).

| Arm | What it is | Prompt |
| --- | --- | --- |
| ours | An export of this repository's plugin files (`.claude-plugin/`, `skills/` and `hooks/` only), with the local build on PATH | the task prompt |
| blader | Humanizer by blader, loaded as a plugin | the task prompt |
| blader-inv | the same plugin | `/humanizer:humanizer`, a space, then the task prompt |
| unslop | the unslop tool, loaded as a plugin | the task prompt |
| unslop-inv | the same plugin | `Use the unslop skill.`, a space, then the task prompt |
| everwrite | the everwrite tool, loaded as a plugin | the task prompt |
| everwrite-inv | the same plugin | `Use the everwrite skill.`, a space, then the task prompt |
| base | the same model with no plugin or skill | the task prompt |

Where the invocations come from (`bench/head-to-head/run/invocations.json` holds them):

- Humanizer: its README says the skill answers to `/humanizer` and, installed as a Claude Code plugin, to `/humanizer:humanizer`. A `claude -p` start with `--plugin-dir` lists `humanizer:humanizer` among its slash commands and skills, so the plugin form is the one used.
- unslop: its README Usage section shows no slash command, only plain requests such as "De-slop this blog draft", so the invoked form is the natural-language form `Use the unslop skill.`
- everwrite: its README gives no slash command, and `skills/everwrite/SKILL.md` names the skill `everwrite`, so the invoked form is `Use the everwrite skill.`

Verification (2026-10-21, one real `claude -p` call per form, model `claude-sonnet-5-5`, under the write sandbox, with the config guard before and after each call; transcripts in `bench/head-to-head/probes/`). The prompt was the invocation followed by `Rewrite: "We leverage a robust, seamless platform."`.

- `/humanizer:humanizer` worked. The transcript holds no `Skill` tool call, because a slash command expands the skill into the prompt before the model sees it. The evidence is the answer's shape: Draft, Remaining patterns, Final, which is the output format that line 49 of Humanizer's `SKILL.md` prescribes for pasted text. The init event also lists `humanizer:humanizer`. See `probes/blader-inv.jsonl`.
- `Use the unslop skill.` worked: the model called `Skill` with `unslop:unslop` and answered in unslop's findings format with P1 levels. See `probes/unslop-inv.jsonl`.
- `Use the everwrite skill.` worked: the model called `Skill` with `everwrite:everwrite`, then read the skill's files. See `probes/everwrite-inv.jsonl`.
- No form failed, so no fallback form was needed.
- The base arm's empty plugin directory works: `claude --plugin-dir <empty dir>` starts, lists no competitor skill in its init event, and answers. See `probes/base-empty-plugin.jsonl`.

## Scoring

Each task has five criteria. Every run is scored twice: FULL counts all criteria, and OUTCOME counts only the criteria labelled `outcome` (see Fairness rules). Each criterion scores 1 when it passes and 0 when it fails.

- Script criteria are checked by `bench/head-to-head/checks/check.mjs`. That script uses Node built-ins only, and it never calls ai-slop-linter or any other tool as the judge.
- Blind criteria are graded by a separate Sonnet call. The outputs of all arms are shuffled and anonymised before grading.

## Win rule

A round is won when both conditions hold, computed on OUTCOME scores only. The rivals are every other arm: all competitor arms, natural and invoked, and the no-plugin baseline. A competitor is compared through the better of its natural and invoked arms, which is the same as comparing with both. These are the rules as the owner restated them on 2026-10-22 (spec section 2; see "State on 2026-10-22" under Resume). They replace the rule A of round 1, which asked for a total at least 20 percent above the highest other total.

- Rule B, per task, with the ceiling rule: on every task, our mean score is strictly above the highest mean score that any rival arm reached on that task. When a rival reaches the task maximum, strictly above is impossible, so we pass that task only if we reach the maximum too: a tie at the maximum passes, anything below it fails.
- Rule A, lost points: our lost points (the maximum total minus our total) are at most 0.8 times the lost points of the best other arm. The best other arm is the rival arm with the highest total, the baseline included. If the best other arm lost 0 points, we must lose 0.

`summarize.mjs` prints both verdicts with their numbers (the maximum total, our lost points, the best other arm's lost points, printed as "strongest other arm", and the limit), the win rule, and every failing task with its reason: below or not above a named rival, or a rival at the maximum where we are not.

Round 1 under these rules, from the published per-run scores below: the maximum is 60, ours lost 5.67 (60 minus 54.33), the best other arm, blader-inv, lost 3.67 (60 minus 56.33), and the limit is 0.8 times 3.67, which is 2.93. Rule A fails. Rule B passes 6 of 12 tasks: h13 strictly above every rival, and h3, h11, h14, h15 and h16 tied at the maximum. It fails h1, h2 and h10 (a rival at the maximum, ours not) and h9, h17 and h18 (below base, unslop-inv, and blader-inv and everwrite-inv). Verdict: FAIL.

Only active tasks count. A retired task (see "Saturation ruling") is not run, scored or summarised by default. A script called with `--include-retired` lists the retired tasks too, but they stay out of the totals and out of the win rule. `tasks.json` marks every task with `status`, either `active` or `retired`; a retired task keeps its reason and its evidence there.

There is no "better arm" selection and no separate strict view: the per-task maximum over all rivals is the rule itself. The summary still prints the better arm of each competitor (the one with the higher OUTCOME total), for information only. A run flagged for a leak (see the isolation notes in the fairness section) makes the verdict `INCOMPLETE` until the flagged run is reviewed.

## Tasks

Each task lists its fixture, its exact prompt, and its five criteria. The file path is relative to `bench/head-to-head/`.

### h1: French launch note

Fixture: `fixtures/h1/note.md`

Prompt:

```text
Cette note de lancement dans note.md sonne trop automatique. Réécris-la en français plus naturel, directement dans le fichier, sans changer le sens.
```

Criteria:

1. Script: at least four dialogue lines start with a dash and a space, and the quoted director line is kept exactly.
2. Script: the date, the product name, the price, and both durations (fourteen or 14 minutes, forty or 40 minutes) are kept.
3. Script: none of the stock phrases of the fixture remain (for example "pas seulement", "révolution", "robuste", "en conclusion").
4. Script: the text is still French and has no English words the, and, or we.
5. Blind: the meaning is kept, no claim is added, and the text reads as natural French.

### h2: README intro that reads like marketing

Fixture: `fixtures/h2/README.md`

Prompt:

```text
The intro paragraph in README.md reads like marketing copy. Rewrite it so a developer would trust it, and edit the file in place. Keep the rest of the file as it is.
```

Criteria:

1. Script: every fact in the fixture survives (versions, benchmark figures, the company name, the Node requirement, the license).
2. Script: no em dash, no en dash, and none of the stock marketing words and phrases that the checker lists for this task.
3. Script: the heading line, the install code block, and the changelog line are byte-identical to the fixture.
4. Script: added-claim check. Every number appears in the fixture, the first person words appear only if the fixture uses them, and no new capitalised name appears except at a sentence start.
5. Blind: nothing is fabricated, and the text reads like a person wrote it.

### h3: pull request description

Fixture: `fixtures/h3/pr.md`

Prompt:

```text
Edit pr.md in place so it's ready to open as a pull request. It reads too much like a chatbot wrote it. Keep what it says.
```

Criteria:

1. Script: the issue number, the flag name, the three counts, and the migrate command line are kept.
2. Script: the fenced shell block is byte-identical to the fixture.
3. Script: no emoji, no bullet line that starts with a bold label, no em or en dash, and no "let me know".
4. Script: no number appears that is absent from the fixture, except 1 and 2.
5. Blind: the meaning is kept.

### h4: release notes where every fact must survive

Status: retired on 2026-10-22 as saturated; replaced by h13. See the Saturation ruling.

Fixture: `fixtures/h4/RELEASE-NOTES.md`

Prompt:

```text
RELEASE-NOTES.md is going to be published. It reads like an AI wrote it. Rewrite it in place so it reads like a person on the team wrote it. Every number, version, date, name, link and command in it has to stay exactly as it is.
```

Criteria:

1. Script: every fact token is present verbatim (versions, dates, counts, percentages, issue numbers, the code commands and the endpoint, the URL, the two names, and the quoted sentence). The check reports any token that is missing.
2. Script: nothing is added. Every number, date and percentage, every URL, and every code span exists in the fixture, and every capitalised word that does not start a sentence appears in the fixture.
3. Script: none of the stock phrases that the checker lists for this task, and no em or en dash.
4. Script: the title line and the headings Highlights, Credits and Upgrade are still there.
5. Blind: no claim is added (no new cause, comparison, superlative or promise).

### h5: mixed-language guide

Status: retired on 2026-10-22 as saturated; replaced by h14. See the Saturation ruling.

Fixture: `fixtures/h5/guide.md`

Prompt:

```text
guide.md is about to go on our docs site and it reads like a chatbot wrote it. Fix that, directly in the file.
```

Criteria:

1. Script: the two Spanish dialogue lines are byte-identical to the fixture.
2. Script: the German quoted line is byte-identical to the fixture.
3. Script: the French quoted line is byte-identical to the fixture.
4. Script: none of the English stock phrases of the fixture remain, and no em dash appears in an English line apart from the quoted non-English lines.
5. Script: the digits of the facts stay: 6, 22%, 30 and 3 are present as number tokens.

### h6: prose check in CI

Status: retired on 2026-10-22 as saturated; replaced by h15. See the Saturation ruling.

Fixture: `fixtures/h6/` (the whole small repository)

Prompt:

```text
Our docs keep getting text that reads like an AI wrote it. Set this repo up so a pull request fails when the docs contain such text, and make "npm run lint:prose" the command that does the check locally. Keep the existing test job working.
```

Criteria:

1. Script: `npm run lint:prose` exits non-zero on the fixture guide. The check restores the original guide in a temporary copy first.
2. Script: with a clean guide in a temporary copy, `npm run lint:prose` exits zero while `docs/fr/notes.md` (legitimate French dialogue dashes) is still present.
3. Script: with a docs file that contains a tell in a temporary copy, `npm run lint:prose` exits non-zero.
4. Script: a workflow under `.github/workflows/` runs on pull_request and runs the prose check, `package.json` keeps its original test script, and the `ci.yml` job named test still runs `npm test`.
5. Script: each `npm run lint:prose` finishes within 120 seconds, and the temporary copy's `package.json` is valid JSON.

## Home ground (F8)

Tasks h1 to h6 test what a user would ask for. Tasks h7 to h12 test what each competitor says it does best: they are built from the before texts that Humanizer (blader), unslop and everwrite publish in their own README, skill files and evals. A tool that wins only on its own examples would be a weak claim, and a tool that loses on a competitor's examples should say so. Our tool is never the judge: the scripted checks are plain Node, they read a list of facts, tells and preserved strings from `bench/head-to-head/home/hN.json`, and they never call ai-slop-linter or any other tool.

These six tasks were frozen in a commit before any run. The fixtures, goldens, check data, prompts and tests for h7 to h12 were committed together, and no run of any arm on these tasks existed when that commit was made. The same win rule and the same scoring apply to them as to h1 to h6.

How each task was built:

- Source text: the exact before text of a competitor example, copied from a clone pinned to the commit named below, with no comment or marker added to the fixture. Source file, line range and commit are recorded here and in the `source` field of each task in `tasks.json`.
- Tells: the lists in `home/hN.json` come from that competitor's own published catalog (Humanizer SKILL.md pattern list; unslop `references/pattern-catalog.md` and `references/word-lists.md`; everwrite `references/patterns.md` and the rule list in `scripts/tells.py`). Each entry has a parallel entry in `tellSources` that names the catalog item it comes from. None of them comes from this repository's rules. Where a pattern is a reading of a catalog family rather than a literal catalog phrase, `tellSources` says so.
- Goldens: hand-written rewrites in `golden/hN/` that satisfy every criterion. The unmodified fixture in `bad/hN/` fails C2 (the tells are still there), and each criterion has at least one negative test in `test/head-to-head.test.mjs`.
- Licence: all three sources are MIT licensed. The fixtures are verbatim excerpts used for measurement, and the copyright lines are kept in `THIRD-PARTY-NOTICES.md`.

Criteria for every home-ground task, in plain words (the data differs per task):

1. Script: every fact in the task's `facts` list (at least 3 entries: numbers, names, versions, dates, units) is present. Facts are compared case-insensitively, and an entry may be a regular expression with alternatives (`five|5`, `unterschrieb(?:en)?`), so that a correct rewrite is not failed for its spelling.
2. Script: none of the task's `tells` matches the output. Each tell is a case-insensitive regular expression written from a strong entry of the competitor's own catalog (unslop P0 and P1 findings and Tier 1 words, everwrite strong rules in `tells.py`, Humanizer's named patterns that are not marked weak alone), at least 4 per task. Weaker tells (everwrite weak rules, unslop P2 findings, Humanizer patterns marked weak alone) are listed in the `notes` array of the same file and are never scored. Dashes are scored once, in C4. A phrase that comes only from the Before text or an eval expectation, not from the catalog itself, is marked as such in `tellSources`.
3. Script: nothing added. Every number in the output appears in the before text (a digit is fine when the before text spells the number out, and Markdown list numbers do not count), no capitalised word that does not start a sentence is new (a possessive or a contraction counts as its base word, so Alfama's is Alfama and I'd is I), and the first-person words our, we, I and my (German: wir, unser, ich) appear only if the before text has them. In h11, release notes, we is always allowed. The capitalised-word check is not applied to the German task, because German capitalises every noun.
4. Script: no em dash and no en dash, except in lines that the `preserve` list contains (no home-ground task has such a line).
5. Script: every string in `preserve` is present verbatim (only h11 has one, a code span), the output has between 40 percent and 130 percent of the before text's word count (h11 only: between 20 and 130 percent, see the criteria repairs), and it keeps at least 30 percent of the before text's content words. Content words are the words of five or more letters in the before text, matched on their first five letters, leaving out a short stopword list and any word inside a scored tell. The 30 percent floor was set so that the competitors' own published After texts pass it (they keep 35 to 50 percent), while a list of the facts alone does not.

Competitor After texts as a fairness check: `after/` holds the After texts that the competitors publish for the same examples (Humanizer README line 14 for h7, lines 188, 190 and 192 for h8, MIT, commit `8c307f367c91bd974002f10f2be2965d642c13df`; for h12 the After lines of everwrite `patterns.md`, joined, commit `38912ce43453129c63eef958bf65faef4833c18e`). They are not goldens and no arm sees them. A published After that fails a criterion points at a defect of the criterion, unless the After really keeps a tell. Result: the Humanizer Afters for h7 and h8 pass all five criteria. The everwrite After lines for h12 pass C1, C2, C4 and C5 and fail C3, because those lines add things that the Before text does not have (a "new API", a "migration plan", "water shortages", taken from other examples in the same file), so that failure is correct. The hand-written goldens for h7 and h8 reuse a few phrases of the Humanizer After texts; unslop publishes no complete After for h9 or h10 (only fragments), and everwrite publishes none for h11.

### h7: Humanizer home ground 1: product announcement with a hype opener and an emoji

Status: retired on 2026-10-22 as saturated; replaced by h16. See the Saturation ruling.

Fixture: `fixtures/h7/announcement.md`. Check data: `home/h7.json`.

Source: Humanizer (blader), `README.md`, lines 11, commit `8c307f367c91bd974002f10f2be2965d642c13df`, repository https://github.com/blader/humanizer.

The README's own Before block for its blind-test example, used whole.

Tells (Humanizer SKILL.md patterns 1, 2, 4 and 20): a not-just contrast, the closer "Let that sink in", the staged question "the best part?" (phrase taken from the Before text) and an emoji. Humanizer marks dashes (pattern 8) weak alone, so they are scored only by C4. This task has four scored tells, not five. Facts: the file name, "two people", "same doc", "every plan" and "free".

Prompt:

```text
announcement.md reads like an AI wrote it. Rewrite it in place so it sounds like a person wrote it. Keep what it says.
```

### h8: Humanizer home ground 2: travel blog post with dashes and sales language

Status: retired on 2026-10-22 as a duplicate of h16, which contains it in full. See the Saturation ruling.

Fixture: `fixtures/h8/lisbon.md`. Check data: `home/h8.json`.

Source: Humanizer (blader), `README.md`, lines 175,177,179,181,183, commit `8c307f367c91bd974002f10f2be2965d642c13df`, repository https://github.com/blader/humanizer.

The first five paragraphs of the README's Full example Before block (218 words). The sixth paragraph (line 185) is left out so the text stays within 250 words.

Tells (Humanizer patterns 1, 3, 4 and 16): an isn't-just contrast, "what truly makes", staged run-ups and sales language such as "breathtaking" and "must-see". Phrases that come only from the Before text are marked in `tellSources`. Facts: five days, Lisbon, October, Alfama, Tram 28, forty minutes, the pastry shop and the castle.

Prompt:

```text
lisbon.md reads like an AI wrote it. Rewrite it in place so it sounds like a person wrote it. Keep what it says.
```

### h9: unslop home ground 1: English blog passages with stock phrases and load-bearing metaphors

Fixture: `fixtures/h9/blog.md`. Check data: `home/h9.json`.

Source: unslop, `skills/unslop/evals/cases.md`, lines 25,223, commit `d65241e66f2b0e0d0b305cb55dadbffac0f9ef52`, repository https://github.com/jlwin/unslop_ai.

Case 2 (line 25) and case 19 (line 223) as two paragraphs. No single English case in the repository reaches 60 words, so the two English blog-profile inputs are joined, each verbatim. The combined text is 66 words and carries almost no numeric facts.

Tells (unslop English word list Tier 1, transitions and catalog sections 2 and 5): delve, evolving landscape, testament, seamless, empower and unlock, not just, studies show, load-bearing metaphors (underpins, backbone of, pays off) and streamline. The copula "serves as" is a P2 finding in unslop and is a note, not scored. Facts are few, because unslop's English cases carry almost no figures: "workplace learning", "data pipeline" and "regional clusters". The claim "companies investing in learning outperform their peers" is exempt from the facts list on purpose: it is an unsupported attribution that unslop's own rewrite rules drop, so requiring it would punish the competitor's correct behaviour. The text is 66 words, so it sits just above the 60 word floor.

Prompt:

```text
blog.md reads like an AI wrote it. Rewrite it in place so it sounds like a person wrote it. Keep what it says.
```

### h10: unslop home ground 2: German story post with a front-loaded backstory and a realization coda

Fixture: `fixtures/h10/post.md`. Check data: `home/h10.json`.

Source: unslop, `skills/unslop/evals/cases.md`, lines 112, commit `d65241e66f2b0e0d0b305cb55dadbffac0f9ef52`, repository https://github.com/jlwin/unslop_ai.

Case 9 (LinkedIn story post, profile social, narrative), used whole.

The only German task. Tells (unslop pattern catalog 2 and 21, and case 9): "Zur Einordnung", "Und da wurde mir klar", "Am Ende zählt nicht", and a nicht-sondern contrast, all P1 in unslop. The description block for Herr Krause and the fully resolved ending are P2 and are notes. This task has four scored tells. Facts: 2023, 40 Mittelständler, IT-Ressourcen, Herr Krause, 20 Jahren, Familienbetriebs and "unterschrieb".

Prompt:

```text
post.md klingt, als hätte eine KI es geschrieben. Schreib es direkt in der Datei so um, dass es von einem Menschen stammt. Der Inhalt bleibt gleich.
```

### h11: everwrite home ground 1: release notes with residue, bold labels and an emoji

Fixture: `fixtures/h11/release.md`. Check data: `home/h11.json`.

Source: everwrite, `skills/everwrite/evals/fixtures/sloppy.md`, lines 1-15, commit `38912ce43453129c63eef958bf65faef4833c18e`, repository https://github.com/m4bwav/everwrite.

The evals fixture used by action-1 and outcome-1, used whole and renamed release.md. The same seven facts that outcome-1 lists are required here.

Tells (strong rules of everwrite `tells.py` and `patterns.md`): a praise opener, an overview opener, "isn't just ... it's", stock words (testament, seamless, robust, pivotal), -ing riders, bold labels, an emoji, "It's important to note", "No setup. No config. Just results.", a closing summary phrase, and the two chat sign-offs of the same family. Facts: the seven facts that everwrite's own `outcome-1` eval requires (Harbor 2.4, 3 March 2026, 41 seconds, 95, Redis, Windows ARM64, the `harbor push --legacy` flag), and that code span is the only preserved string.

Prompt:

```text
release.md reads like an AI wrote it. Rewrite it in place so it sounds like a person wrote it. Keep what it says.
```

### h12: everwrite home ground 2: town and venue page built from the pattern file's own Before lines

Status: retired on 2026-10-22 as saturated; replaced by h18. See the Saturation ruling.

Fixture: `fixtures/h12/town.md`. Check data: `home/h12.json`.

Source: everwrite, `skills/everwrite/references/patterns.md`, lines 48,35,37,44,54,58, commit `38912ce43453129c63eef958bf65faef4833c18e`, repository https://github.com/m4bwav/everwrite.

Six Before sentences copied verbatim from the pattern file (sales language, inflated significance, stock section, borrowed authority, forced triad, avoiding is and has) and joined in that order into one paragraph. everwrite publishes no longer concrete passage besides the Harbor fixture used for h11, so this text is a composite and its sentences were not written to belong together.

Tells (strong rules of everwrite `tells.py`, and `patterns.md`): "Nestled in the heart of", "natural beauty", "marking a pivotal moment", "Despite these challenges", the triad "innovation, inspiration, and insights", and two stock words (vibrant, pivotal, crucial) in one paragraph. "Experts believe" and "serves as" are weak rules in `tells.py` and are notes. Facts: the valley, 1989, the institute, the river, Gallery 825 and four rooms. This text is a composite: everwrite publishes its examples as separate Before lines, and the only longer concrete passage it has is the Harbor fixture used for h11, so six Before sentences are joined in the order they appear in the file. Its sentences were not written to belong together.

Prompt:

```text
town.md reads like an AI wrote it. Rewrite it in place so it sounds like a person wrote it. Keep what it says.
```

### Published competitor benchmarks

Each competitor publishes some evidence of its own. None of it is rerun here as it was published, for the reasons below. The tasks above reuse the texts, and score them with scripted checks of our own.

- Humanizer README blind test (judges preferred Humanizer's rewrite 16 times out of 16, issue https://github.com/blader/humanizer/issues/229): not reproducible here. The README states only the result and shows one before and after pair, which is the source of h7. The judges, their instructions, the other texts and the raw votes are not in the repository, so the 16 trials cannot be repeated or audited. Whether the blind test is judged by people or by a model is not stated in the README.
- unslop `skills/unslop/evals/cases.md` (25 regression cases, plus trigger checks): not reproducible here as published. Its pass rule is a comparison of the skill's findings in check mode against hand-written expected findings with severities P0, P1 and P2, and a set of cases that must come back clean. That measures flagging and over-flagging, not whether a rewrite is better, and it needs a person or a judge model to read the findings. Reproducible here: the inputs. Cases 2, 19 and 9 are the sources of h9 and h10.
- everwrite `skills/everwrite/evals/evals.json` and `skills/everwrite/TESTS.md` (8 cases: triggers, decoys, action and outcome; run log with pass counts): partly reproducible here. The fixture `evals/fixtures/sloppy.md` and the seven required facts are in the repository, and they are the source of h11. The recorded runs, however, come from its own headless runner (`claude -p`, stream-json, fresh folder per run, a trace check that its `tells.py` ran), several of its expectations are model-judged, and the trigger and decoy cases measure whether the skill loads, not rewrite quality. The case `hidden.md` (invisible characters, words unchanged) is a cleanup task rather than a rewrite and is not used. So the published results are not reproducible here, and only the texts and the fact list are reused.

## Saturation ruling

Date: 2026-10-22, decided before any run of the replacement tasks.

Evidence. Two partial rounds were run and then stopped because the account limit was spent. The aborted round holds 223 scored runs (tasks h1 to h12, two or three runs per cell). The final partial round holds 112 valid runs of the eight arms. Both are scored with the scripted criteria only: the blind criterion C5 of h1 to h4 has no grader verdict in either round, so those four tasks have a maximum of 4 points and every other task a maximum of 5. The table gives the mean scripted points per arm and task, the spread (the highest arm mean minus the lowest) and the number of runs, as the checks scored them at the time of each round (before the criteria repairs below).

| Task | Status | Round | Runs | Max | ours | blader | blader-inv | unslop | unslop-inv | everwrite | everwrite-inv | base | Spread |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| h1 | active | aborted | 24 | 4 | 4.00 | 3.00 | 3.67 | 3.00 | 3.00 | 4.00 | 2.33 | 2.67 | 1.67 |
| h1 | active | final | 16 | 4 | 4.00 | 3.00 | 4.00 | 3.00 | 3.00 | 3.50 | 2.50 | 2.50 | 1.50 |
| h2 | active | aborted | 24 | 4 | 3.33 | 3.67 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 0.67 |
| h2 | active | final | 16 | 4 | 3.00 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 3.50 | 3.50 | 1.00 |
| h3 | active | aborted | 24 | 4 | 4.00 | 4.00 | 4.00 | 3.00 | 3.00 | 4.00 | 4.00 | 3.00 | 1.00 |
| h3 | active | final | 8 | 4 | 4.00 | 4.00 | 4.00 | 3.00 | 3.00 | 4.00 | 4.00 | 3.00 | 1.00 |
| h4 | retired | aborted | 24 | 4 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 0.00 |
| h4 | retired | final | 8 | 4 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 3.00 | 1.00 |
| h5 | retired | aborted | 16 | 5 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 4.50 | 5.00 | 5.00 | 0.50 |
| h5 | retired | final | 8 | 5 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 4.00 | 5.00 | 5.00 | 1.00 |
| h6 | retired | aborted | 15 | 5 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 4.50 | 5.00 | 0.50 |
| h6 | retired | final | 8 | 5 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 0.00 |
| h7 | retired | aborted | 16 | 5 | 5.00 | 5.00 | 4.50 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 0.50 |
| h7 | retired | final | 8 | 5 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 0.00 |
| h8 | retired | aborted | 16 | 5 | 4.50 | 4.50 | 4.50 | 4.00 | 5.00 | 4.50 | 4.50 | 5.00 | 1.00 |
| h8 | retired | final | 8 | 5 | 4.00 | 5.00 | 4.00 | 5.00 | 4.00 | 5.00 | 5.00 | 4.00 | 1.00 |
| h9 | active | aborted | 16 | 5 | 4.00 | 3.50 | 4.00 | 4.50 | 4.00 | 3.50 | 4.00 | 3.50 | 1.00 |
| h9 | active | final | 8 | 5 | 4.00 | 4.00 | 4.00 | 4.00 | 3.00 | 4.00 | 3.00 | 4.00 | 1.00 |
| h10 | active | aborted | 16 | 5 | 5.00 | 4.50 | 5.00 | 5.00 | 5.00 | 4.50 | 4.50 | 4.00 | 1.00 |
| h10 | active | final | 8 | 5 | 5.00 | 5.00 | 4.00 | 5.00 | 5.00 | 5.00 | 4.00 | 4.00 | 1.00 |
| h11 | active | aborted | 16 | 5 | 4.50 | 4.50 | 4.00 | 3.00 | 3.00 | 4.00 | 4.00 | 3.50 | 1.50 |
| h11 | active | final | 8 | 5 | 4.00 | 4.00 | 4.00 | 3.00 | 3.00 | 4.00 | 4.00 | 4.00 | 1.00 |
| h12 | retired | aborted | 16 | 5 | 4.50 | 4.50 | 5.00 | 4.50 | 4.50 | 5.00 | 5.00 | 5.00 | 0.50 |
| h12 | retired | final | 8 | 5 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 0.00 |

Ruling. A task is saturated when the no-plugin baseline is at or near full marks and so is nearly every other arm, because then the task cannot tell the arms apart. Tasks h4, h5, h6, h7 and h12 meet that test: in both partial rounds the baseline scored between 3.00 and 5.00 on them (5.00 on h5, h6, h7 and h12 in both rounds, 4.00 and 3.00 on h4), at least four of the eight arms were at full marks in each round, and the spread was at most 1.00 point, which is one run of one arm. They are retired. Their `tasks.json` entries stay, with `"status": "retired"`, the reason and the evidence. Their fixtures, goldens, `bad/` copies, check code and tests also stay in the repository. The partial results of the retired tasks stay in history: `bench/head-to-head/results/history/partial-round-1/` holds the scores of both partial rounds, this table, and the full transcripts of the 112-run round.

Retired tasks and their replacements:

| Retired | Replaced by | What the replacement changes |
|---|---|---|
| h4 release notes | h13 | 62 facts instead of 22, tells inside bullets and a table, and two new criteria on structure and on tells left in cells |
| h5 mixed-language guide | h14 | three foreign blocks plus a Turkish quotation, a code block with em dashes, front matter, and tells inside a list and a table |
| h6 prose check in CI | h15 | legitimate dashes and quotes in the README, the changelog, French and German files; the README must be checked; exact exit codes; a file name that the checker invents |
| h7 Humanizer home ground 1 | h16 | the whole six-paragraph Humanizer example, 251 words, instead of a 96-word announcement |
| h8 Humanizer home ground 2 | h16 | retired as a duplicate, not as saturated: its five paragraphs are the first five of the six in h16 |
| h12 everwrite home ground 2 | h18 | all 26 Before strings of the everwrite pattern file, 329 words, instead of six sentences |

Retirement of h8. On 2026-10-22 the controller retired h8 because h16 contains it in full: the h8 before text (218 words) is paragraphs 1 to 5 of the h16 before text (251 words), word for word, so one Humanizer example counted twice. This is a different ground from saturation: h8 was not at the ceiling in the partial rounds (its row in the table above shows spreads of 0.50 and 1.00), so its `tasks.json` entry carries `"ground": "duplicate"` and the evidence is the paragraph overlap, which a test checks. The retirement was committed on its own, before the readiness check below.

New task without a retired predecessor: h17, the first full-length unslop task (331 words of German from nine of unslop's own regression inputs, with the German prompt).

The active set after this ruling is h1, h2, h3, h8, h9, h10, h11 (kept) and h13 to h18 (new): 13 tasks. On 2026-10-22, after the labels were written, h8 was retired as a duplicate (see "Retirement of h8" below), which leaves h1, h2, h3, h9, h10, h11 and h13 to h18: 12 tasks. The kept tasks are not saturated in the data above (their arm means differ by 1.00 point or more in at least one round), and the criteria repairs below were applied to them before any new run.

Readiness check (2026-10-22). Before the new round, the built CLI (`node dist/src/cli.js`) was run on the fixtures and goldens of the active tasks, with no model call and no transcript. Probed: tells in prose, list items and table cells (h13); `--compare` of each golden against its fixture and of a golden with one number, one name, one URL and one code span changed (h13: all four reported); foreign blocks, front matter `lang: en`, code comments, dialogue and guillemets (h14); the "Set up a prose check in CI" recipe of the skill applied literally to a copy of the h15 files (clean files exit 0, a new bad file exit 1, a bad README exit 1, a glob that matches nothing exit 2); grades of the h16 to h18 goldens (all A) and the tells our rules flag in their fixtures (information only, no rule was added to match any competitor catalog); the kept tasks h1, h2, h3, h9, h10, h11. Fixed, each in its own commit: table-cell openers read as names; German nouns read as names in `--compare`; the closing mark of a German low quotation flagged and straightened by `--fix`; `title-case-heading` on German headings; the skill's CI recipe leaving the README unchecked and silent about the CHANGELOG and a README that quotes a stock phrase. Left as designed and reported: the h14 golden grades C because a Turkish en dash inside straight quotes is flagged in a file that declares `lang: en` (a declared language is never overridden by a per-paragraph guess); the skill tells the agent to leave such a line and mark it with a directive. The h17 fixture draws no finding at all (it grades A) because our rules carry no German word lists; the h15 README and CHANGELOG goldens grade F when linted alone for the reasons the skill now documents.

The six new tasks were frozen in one commit before any run of them. Their labels (`outcome` or `process`, see F1) are written afterwards by a fresh auditor who has not read this tool's code; until then `summarize.mjs` refuses to run on the new tasks, which is the intended behaviour.

## Replacement tasks (frozen 2026-10-22)

These six tasks replace the retired ones. They use the same rules as the others: the prompt names no tool, scripted criteria only, a golden that passes every criterion, a `bad/` copy of the fixture that fails at least one, and a negative test for every criterion in `test/head-to-head.test.mjs`. Word counts below count whitespace-separated words.

### h13: Long release notes: 62 facts survive, tells removed inside bullets and a table

Fixture: `fixtures/h13/RELEASE-NOTES.md`. Check data: `checker-data/h13.json`.

Built for this benchmark. The notes are 455 words with 62 listed facts (versions, ISO dates, counts with thousands separators, percentages, durations, units, issue and pull request numbers, three names with accents, two URLs, six code spans and one quoted sentence). The tells sit in the intro and the closer, in every bullet, and in the Notes column of a table with five rows and four columns. The golden keeps every fact and every heading, the table shape and the number of bullets.

Prompt:

```text
RELEASE-NOTES.md is going to be published. It reads like an AI wrote it. Rewrite it in place so it reads like a person on the team wrote it. Every number, version, date, name, link and command in it has to stay exactly as it is.
```

Criteria:

1. Script: every one of the 62 listed facts is present verbatim: versions, ISO dates, counts with thousands separators, percentages, durations, units, issue and pull request numbers, three names with accents, two URLs, six code spans and the quoted sentence (the list is in checker-data/h13.json). The check reports any that are missing.
2. Script: nothing is added: every number, version, date and percentage in the output exists in the fixture, every URL exists in the fixture, every code span is one of the fixture's code spans, and every capitalised word that does not start a sentence or a table cell appears in the fixture.
3. Script: none of the 24 case-insensitive tell patterns in checker-data/h13.json (stock words, stock phrases, chatbot closers and the dash characters) matches anywhere in the text.
4. Script: structure kept: every heading line of the fixture is still there unchanged, the table has the same number of rows and the same number of columns in every row, and the number of list items is within 2 of the fixture's.
5. Script: no tell is left inside a table row or a list item: none of the 6 patterns of the second list in checker-data/h13.json (a bold label that opens a bullet, a wider word list, an -ing rider, not just, emoji, dashes) matches any table row or list item line.

### h14: Mixed-language guide with three foreign blocks, a code block and front matter

Fixture: `fixtures/h14/guide.md`. Check data: `checker-data/h14.json`.

Built for this benchmark. The guide is 501 words with YAML front matter (`lang: en`). The English prose carries tells in its paragraphs, in the bullet list, in the table and in the closer. Three foreign blocks must stay byte-identical: Spanish dialogue with rayas plus a Turkish sentence with an en dash quotation, a German quotation with low-9 quotation marks and a spaced en dash, and a French guillemet citation with em dashes. A fenced code block has em dashes in its comments.

Prompt:

```text
guide.md is about to go on our docs site and it reads like a chatbot wrote it. Fix that, directly in the file.
```

Criteria:

1. Script: the two Spanish dialogue lines and the Turkish sentence with its en dash quotation are byte-identical to the fixture.
2. Script: the German quotation line, with its low-9 quotation marks and spaced en dash, is byte-identical to the fixture.
3. Script: the French guillemet line with its em dashes and the whole fenced code block, comments included, are byte-identical to the fixture.
4. Script: none of the 26 case-insensitive English tell patterns in checker-data/h14.json matches any line outside the foreign lines and the code block (list items and table cells included), and no English prose line has an em dash.
5. Script: the 14 listed numbers and facts are present as written (checker-data/h14.json), and the YAML front matter (title, lang: en, updated) is unchanged.

### h15: Prose check wired into CI on a repository with legitimate dashes, quotes and other languages

Fixture: `fixtures/h15/`. Check data: `checker-data/h15-clean-guide.md`.

Built for this benchmark, following the approach of h6. The repository holds `package.json` with a `test` script, `.github/workflows/ci.yml` with a test job, `README.md` (a fenced code block with em dashes and a blockquote that quotes a tell phrase), `docs/guide.md` (English, with tells), `docs/guides/setup.md` (English, clean), `docs/fr/notes.md` (French dialogue with rayas), `docs/de/anleitung.md` (German quotations with spaced en dashes) and `CHANGELOG.md` (version ranges with an en dash and a quoted commit title with an em dash). The check restores the five protected files to the fixture's text in every temporary copy, replaces `docs/guide.md` with a clean guide, and runs `npm run lint:prose` four times: clean, a new `docs/guides/new.md`, a new paragraph appended to `README.md`, and a file under a directory and with a name that the checker invents on every call. An exit status of 1 is required where the command must fail.

Prompt:

```text
Our docs keep getting text that reads like an AI wrote it. Set this repo up so a pull request fails when the docs or the README contain such text, and make "npm run lint:prose" the command that does the check locally. It must pass on the files that are fine today and fail on a new bad one. Keep the existing test job working.
```

Criteria:

1. Script: with the protected files restored in a temporary copy (README.md, CHANGELOG.md, docs/fr/notes.md, docs/de/anleitung.md, docs/guides/setup.md) and docs/guide.md replaced by a clean guide, npm run lint:prose exits 0.
2. Script: with a new docs/guides/new.md that holds a short English text with an em dash and three stock tells in that temporary copy, npm run lint:prose exits 1 exactly (not 2, not a crash signal).
3. Script: with the same sentence appended to the restored README.md as a new paragraph, npm run lint:prose exits 1 exactly.
4. Script: a workflow under .github/workflows triggers on pull_request and runs the prose check, package.json keeps its original test script, and the ci.yml job named test still runs npm test.
5. Script: each npm run lint:prose finishes within 120 seconds, the temporary copy's package.json is valid JSON, and the command also exits 1 exactly on a file under a directory and with a name that the checker invents for each check, so a hard-coded fixture file name gains nothing.

Full-length home ground (h16 to h18). The task brief asked for the longest single before and after example of each competitor, with at least 250 words of before text. Only the Humanizer example reaches 250 words (251, and 247 letter-and-digit words). The longest single example of unslop has 77 words and the longest of everwrite 179, so h17 and h18 are composites of that tool's own before texts, each verbatim and in the order of the source file, described in each `source` note. They are not single examples, and nothing in them was written for this benchmark. The criteria are the home-ground criteria of h7 to h12 (see above) with the repairs of 2026-10-22; the tells come only from the competitor's own catalog. Humanizer's own After text for h16 is in `after/h16/lisbon-trip.md`.

### h16: Humanizer home ground, full length: the whole six-paragraph Lisbon travel post

Fixture: `fixtures/h16/lisbon-trip.md`. Check data: `home/h16.json`.

Source: Humanizer (blader), `README.md`, lines 175,177,179,181,183,185, commit `8c307f367c91bd974002f10f2be2965d642c13df`, repository https://github.com/blader/humanizer.

The README's Full example Before block, all six paragraphs (251 words counted by whitespace). Task h8 uses the first five of these paragraphs. Humanizer's own After text for this example is in after/h16/.

The first five paragraphs of this text are the before text of h8. The overlap is deliberate (the brief asks for the full example) and it counts one competitor's example twice; the controller can retire h8 if that matters.

Prompt:

```text
lisbon-trip.md reads like an AI wrote it. Rewrite it in place so it sounds like a person wrote it. Keep what it says.
```

Criteria:

1. Script: facts kept: each of "five|5", "Lisbon", "October", "Alfama", "Tram 28", "forty|40", "Pastéis de Belém", "Graça", "São Jorge Castle", "spring" is present, compared case-insensitively (10 entries in home/h16.json; an entry may be a regular expression with alternatives, such as five or 5).
2. Script: tells removed: none of the 5 case-insensitive patterns in home/h16.json matches the output. They are written from the strong (P0, P1, tier 1 or named-pattern) entries of Humanizer (blader)'s own published catalog, never from this repository's rules. Weaker tells are listed under notes in the same file and are not scored.
3. Script: nothing added: every number in the output appears in the before text (a digit is fine when the before text spells the number out, and list numbers do not count), no capitalised word that does not start a sentence is new (a possessive or a contraction counts as its base word), and the first-person words our, we, I and my appear only if the before text has them.
4. Script: no dash as style: no em dash and no en dash in the output (the preserve list holds no line with a dash).
5. Script: shape kept: the output has between 40 percent and 130 percent of the before text's word count, and it keeps at least 30 percent of the before text's content words (words of five or more letters, matched on their first five letters, leaving out stopwords and the words inside the tells).

### h17: unslop home ground, full length: nine German inputs from its own regression cases, joined

Fixture: `fixtures/h17/sammlung.md`. Check data: `home/h17.json`.

Source: unslop, `skills/unslop/evals/cases.md`, lines 11,69,125,140,162-166,203,250,262,272, commit `d65241e66f2b0e0d0b305cb55dadbffac0f9ef52`, repository https://github.com/jlwin/unslop_ai.

No single unslop example reaches 250 words (the longest, case 9, has 77), so this is a composite: the INPUT blocks of cases 1, 5, 10, 11, 13, 17, 22, 23 and 24, which are the German cases that are expected to be flagged, in file order, each verbatim, joined by blank lines (331 words). Case 9 is left out because h10 uses it; cases 8 (mixed languages) and the must-stay-clean cases are left out.

Tells (unslop `cases.md`, the P0 and P1 findings that the EXPECTED lists give for these inputs): the formulaic opener, Tier-1 words, the stacked negation, the faux-insight setup, the colon reveal, the aphoristic kicker, the phantom objection, the staged emphasis, the false agency, the significance inflation, the unsourced vague attribution, the salutation calque and the over-polite mail formula. The phrases are taken from the inputs, as `tellSources` says. Known limit: unslop's case 1 says that the correctly spaced German en dash must not be flagged, while C4 scores any dash, as in h10.

Prompt:

```text
sammlung.md klingt, als hätte eine KI es geschrieben. Schreib es direkt in der Datei so um, dass es von einem Menschen stammt. Der Inhalt bleibt gleich.
```

Criteria:

1. Script: facts kept: each of "Petra", "Lars", "Variante B", "Frau Kehl", "KW 42", "11:00 bis 11:30", "Tabelle 2", "Freitag", "Juli", "drei Varianten|3 Varianten", "halbier\\p{L}*", "Pausenstaffel", "Prüfbericht", "Wartung" is present, compared case-insensitively (14 entries in home/h17.json; an entry may be a regular expression with alternatives, such as five or 5).
2. Script: tells removed: none of the 15 case-insensitive patterns in home/h17.json matches the output. They are written from the strong (P0, P1, tier 1 or named-pattern) entries of unslop's own published catalog, never from this repository's rules. Weaker tells are listed under notes in the same file and are not scored.
3. Script: nothing added: every number in the output appears in the before text (a digit is fine when the before text spells the number out, and list numbers do not count), and the first-person words wir, unser and ich appear only if the before text has them. The capitalised-word check is not applied to German, which capitalises every noun.
4. Script: no dash as style: no em dash and no en dash in the output (the preserve list holds no line with a dash).
5. Script: shape kept: the output has between 40 percent and 130 percent of the before text's word count, and it keeps at least 30 percent of the before text's content words (words of five or more letters, matched on their first five letters, leaving out stopwords and the words inside the tells).

### h18: everwrite home ground, full length: every Before line of its pattern file, joined

Fixture: `fixtures/h18/drafts.md`. Check data: `home/h18.json`.

Source: everwrite, `skills/everwrite/references/patterns.md`, lines 9,11,15,17,18,19,22,26,28,29,35,37,40,44,48,54,58,62,66,70,74,80,90,94,98,101, commit `38912ce43453129c63eef958bf65faef4833c18e`, repository https://github.com/m4bwav/everwrite.

No single everwrite example reaches 250 words (the longest, the evals fixture used by h11, has 179), so this is a composite: every quoted Before string of the pattern file, in file order, each verbatim (the two \n escapes become line breaks), grouped into paragraphs by section (329 words). Its sentences were not written to belong together.

Tells (strong rules of everwrite `tells.py` and the pattern file): a not-X-but-Y contrast, the split form, the colon reveal, the tempting-approach setup, the negative listing, an inflated moment, the stock section, an -ing rider, sales language, chatbot residue, a knowledge-limit phrase, a bold label on a bullet, and two stock words in one paragraph.

Prompt:

```text
drafts.md reads like an AI wrote it. Rewrite it in place so it sounds like a person wrote it. Keep what it says.
```

Criteria:

1. Script: facts kept: each of "Harbor", "1989", "Gallery 825", "four rooms|4 rooms", "41 seconds", "Redis", "1789", "institute", "river", "valley", "sessions" is present, compared case-insensitively (11 entries in home/h18.json; an entry may be a regular expression with alternatives, such as five or 5).
2. Script: tells removed: none of the 14 case-insensitive patterns in home/h18.json matches the output. They are written from the strong (P0, P1, tier 1 or named-pattern) entries of everwrite's own published catalog, never from this repository's rules. Weaker tells are listed under notes in the same file and are not scored.
3. Script: nothing added: every number in the output appears in the before text (a digit is fine when the before text spells the number out, and list numbers do not count), no capitalised word that does not start a sentence is new (a possessive or a contraction counts as its base word), and the first-person words our, we, I and my appear only if the before text has them.
4. Script: no dash as style: no em dash and no en dash in the output (the preserve list holds no line with a dash).
5. Script: shape kept: the output has between 40 percent and 130 percent of the before text's word count, and it keeps at least 30 percent of the before text's content words (words of five or more letters, matched on their first five letters, leaving out stopwords and the words inside the tells).

Fairness checks on the new text. For h16 the Humanizer After text in `after/h16/` (README lines 188, 190, 192 and 194) passes all five criteria. For h18 everwrite publishes an After for every Before string; `after/h18/drafts.md` joins the quoted ones in the paragraph order of the fixture (lines 9 to 101 of `patterns.md`, with the quoted sentence where the After is prose). It passes C1, C2, C4 and C5 and fails C3, correctly, because those After lines add figures that the Before text lacks ("2 seconds instead of 9") and a problem the Before text does not state. While the check data were being written, that After text failed C1 on the fact "nightly" (the After drops the sentence about restarting the service nightly, as the pattern file recommends), so the fact was removed before the freeze. For h13, h14, h15 and h17 the competitors publish no After text for these inputs, so the golden and the unmodified fixture are the only reference outputs. The goldens are hand-written; the three composite sources are MIT licensed and their copyright lines are in `THIRD-PARTY-NOTICES.md`.

## Round 0

Round 0 ran on 2026-10-21 with five tasks, one run per task per arm. Its scores are not repeated here: the tasks have since been replaced, so the numbers do not describe the current task set. It found that tasks T1 and T5 were saturated, because every arm got full marks on them. T1 is replaced by h4, and T5 is replaced by h5 and h6. T2, T3 and T4 were kept or tightened as h2, h3 and h1.

## Not covered

- Hooks: whether the arms' hooks fire is not measured here.
- Voice matching: whether the output sounds like a given author is not measured.
- Held-out set: a separate held-out set exists and runs only at the final gate, so no round tunes against it.

## Known limits and disclosures

- The skill description and the CI recipe were changed after a smoke run on h1 and h6. The verbs added to the description, "réécris" and "schreib um", are the verbs of the h1 and h10 prompts. The held-out tasks test whether the change generalises beyond them.
- All 60 criteria are labelled `outcome` in the labels file as it stands (tasks h1 to h12), so the split between outcome and process has no effect on those tasks. The 30 criteria of h13 to h18 get their labels from a fresh auditor after the freeze of 2026-10-22; until they do, the summary refuses to run, and the OUTCOME score equals the FULL score once they are labelled `outcome`.
- h17 and h18 are composites, not single examples, and h16 shares five paragraphs with h8 (see "Replacement tasks").
- The blind criteria are graded by a call to Sonnet. A `slop-ignore` comment left in an output could identify our arm to the grader.
- The h10 criterion C4 bans spaced en dashes, although correct German uses them in quotations. This is a limit of the criterion. It can only cost an arm points that correct German text would lose too.

### Criteria repairs

A criterion repaired after the freeze is listed here with the date, the task, the criterion and the reason. A repair changes the check, not the task, and the goldens are re-run after it.

| Date | Task | Criterion | Evidence | Reason |
|---|---|---|---|---|
| 2026-10-21 | h6 | C1 to C3 | Found in review before any scored round. | At check time the temporary copy also loses `node_modules/.bin/ai-slop-linter`, `node_modules/.bin/slop` and any bin link into ai-slop-linter, so every arm resolves the tool through the same shim PATH; an installed copy that always exits 0 gains nothing. |
| 2026-10-21 | h6 | C1 to C3 | Found in review before any scored round. | The check now restores the fixture's original `docs/fr/notes.md` (and `docs/guide.md`, as before) in its temporary copy before it runs `npm run lint:prose`. Before, an arm could edit or silence the French note (for example with a `slop-ignore` comment) and pass C2 on the changed file. Criterion-level negative tests cover it. |
| 2026-10-22 | h8 | C3 | 11 of 24 scored runs (7 of 16 in the aborted round, 4 of 8 in the final round) failed only the new-capitals check, because of the contraction I'd (a capitalised token that the before text does not contain). Passes: 9 of 16 and 4 of 8 before, 16 of 16 and 8 of 8 after. | A contraction of a word that the before text has now counts as that word, as a possessive already did. I'd is I. A first-person contraction is not a new name. |
| 2026-10-22 | h11 | C5 | 20 of 24 scored runs failed only the length floor (3 of 16 and 1 of 8 passed). Every run kept the preserved flag and 32 to 48 percent of the content words. The shortest were 26 percent of the before text, and all six runs with the everwrite skill loaded were under 35 percent. Passes: 3 of 16 and 1 of 8 before, 16 of 16 and 8 of 8 after. | The before text is 179 words of mostly residue. A minimal faithful rewrite (the title, the four facts and the removed flag, 47 words) is 26 percent of it, so a 40 percent floor rejected correct rewrites. The floor for h11 is now 20 percent (`minRatio` in `home/h11.json`). The content-word floor of 30 percent is unchanged and still rejects a list of the facts alone. |

Criteria inspected on 2026-10-22 and left unchanged, with the counts that decided it (both partial rounds, scripted scores read from disk):

- h9 C2 (1 of 16 passed in the aborted round, 1 of 8 in the final round). Three tells decide it: `underpins` or `backbone of` or `pays off` in 13 of 24 runs, `streamlin` in 13 of 24, and `studies show` in 9 of 24 (`not just` in 1). Every one comes from unslop's own regression case 19 or case 2 (load-bearing metaphors as P1, the stock phrase "streamlining operations" as P1, vague attribution as P0). Two runs pass, and they are runs with a competitor skill loaded (unslop in the aborted round, everwrite in the final round), so a competitor's own recommended output passes. The arms mostly kept the second paragraph because the prompt says to keep what it says. The golden passes. Not a defect. Only the source string in `home/h9.json` was corrected (the word is in unslop's case 19 expectation and its German list, not in its English Tier 1 list); no pattern changed.
- h9 C2 again, on round 1 (round 2 plan item 4, inspected 2026-10-22 from the 24 committed run directories `results/round-1/runs/h9-*`, rescored with `checks/check.mjs`; the rescore reproduces the published h9 scores of every run). 7 of 24 passed: base 2 of 3, everwrite 2, everwrite-inv 2, unslop 1, and ours, blader, blader-inv and unslop-inv 0. The failing runs keep a source phrase word for word: `streamlin` in 12 runs (for example "It streamlines operations across all regional clusters", the only hit in four unslop runs), `underpins`, `backbone of` or `pays off` in 10 ("This architecture underpins our platform and is the backbone of the entire data pipeline", all three ours runs), and `studies show` in 6. No hit is a false match: every one is the fixture's own phrase, and none of the nine patterns overlaps a fact of C1 or a word that C5 counts. Each tell can be removed without losing what the text says, as the passing runs show: "It also simplifies operations across all of our regional clusters" and "the whole data pipeline depends on it" (h9-base-2), "Companies that invest in learning outperform their peers" (the golden). Not objectively wrong, only hard; it separates the arms (ours 0 of 3, base 2 of 3), so it stays.
- h1 C3 (10 of 24 and 6 of 16 passed). The failing phrases are `robuste` (19 of 40 runs), `sans faille` (14), `n'hésitez pas` (6) and `l'avenir s'annonce` (1). They are French forms of two English stock words, and a natural rewrite can use another word. Our arm and the golden pass; no competitor catalog lists French words, so no competitor output is judged wrongly. Left unchanged.
- h3 C3 (15 of 24 and 5 of 8 passed). 12 of 32 runs kept a bullet that opens with a bold label (all of them unslop arms and base) and one run added an emoji. Humanizer and everwrite both list bold labels as a pattern, and their arms pass. Left unchanged.
- h10 C1 (11 of 16 and 5 of 8 passed). The only missing fact is `IT-Ressourcen`, in 8 of 24 runs, where the rewrite says IT-Personal (staff instead of resources). That changes the meaning, every unslop run keeps the term, and the golden keeps it. Left unchanged.

After the repairs the kept-task transcripts were scored again from disk, without a new claude call (`score.mjs` on the existing run directories, writing to a separate directory). Only h8 C3 and h11 C5 changed, 11 and 20 runs of them respectively; every other criterion of every kept task scored the same. The re-scored scores are in `bench/head-to-head/results/history/partial-round-1/rescored-kept-tasks/`.

## Fairness rules

Five rules bind every round. They were set before any round-1 run, and the harness enforces them.

- F1, outcome and process labels. Each of the 60 criteria of h1 to h12 is labelled `outcome` or `process` in `bench/head-to-head/labels.json`; the 30 criteria of h13 to h18 are labelled by a fresh auditor after the freeze of 2026-10-22. An outcome criterion is decided by the final state of the file or repository, whatever route led there. A process criterion would reward how a tool works (for example, running a checker) rather than what it delivered. The labels were written on 2026-10-21 by an independent auditor, a fresh Sonnet agent that had not read this tool's code, and committed in `7237152fce7f3411dd660637ab621f2d0929f9ad` before the harness change that reads them. They are not edited after that commit. The summary scores every run twice: FULL (all criteria) and OUTCOME (outcome criteria only). The win rule uses OUTCOME only. A process column (the transcript signal "ran a deterministic check", plus any criterion labelled process) is printed separately and never gates anything. The summary refuses to run when `labels.json` is missing or any criterion of an active task lacks a label.
- F2, invoked arms. A skill may not load on its own, so each competitor runs twice: once with the plain task prompt (natural) and once with the invocation its README prescribes in front of the prompt (invoked). Both arms count as rivals: on each task ours must beat the highest mean over every competitor arm and the no-plugin baseline, or tie it at the maximum (rule B), and its lost points must be at most 0.8 times the lost points of the other arm with the highest total (rule A).
- F3, pinned competitors. `bench/head-to-head/run/setup-competitors.sh` clones each competitor at the commit in `run/competitors.lock` and checks its prerequisites (everwrite needs Python 3.9 or later). A competitor that cannot run is printed as `not run, <reason>` and is never counted.
- F4, one command and published evidence. `bench/head-to-head/rerun.sh` repeats the whole round. A round runs with its output directory outside the repository (the repository's `.slop.json` would otherwise apply to our arm only, and the scripts refuse an output directory inside the repository). `run/publish.sh <out> round-<N>` then copies the transcripts, the failed transcripts (in `failed/`), the scored run directories (in `runs/`, without `node_modules`, files over 1 MB and binary files), grader prompts, grader answers, label map, blind verdicts, scores, leak records and `summary.md` into `bench/head-to-head/results/round-<N>/`, where they are committed (see `results/README.md`). Every published text file is scrubbed first: `/Users/<name>` and the dashed form `-Users-<name>-...`, the output directory (whole path segments only, so `round-1` does not match inside `round-10`), the Claude scratchpad path and the temporary directory are replaced by placeholders. Published transcripts also lose their private fields, as in `probes/README.md`: lines that are not JSON and `rate_limit_event` lines are dropped, `rate_limit_info`, `session_id`, `uuid`, `request_id` and `memory_paths` are removed, and UUIDs inside strings become the all-zero UUID. Symbolic links are never followed or copied.
- F5, honest reporting. The summary prints each run's score, the mean, the minimum and maximum, and the number of runs for every task and arm. Totals are means per arm with n. It always prints the scope: the number of tasks, the model, the runs per cell and the date, with the sentence that this is not a general ranking. The model is a parameter, `H2H_MODEL`, and the default is the full model id `claude-sonnet-5-5`.

Isolation for the runs, stated plainly. A fresh temporary `HOME` was tried first and does not work: `claude` there answers "Not logged in" (`probes/blader-inv-auth-failure.jsonl`). So every arm runs with the real `HOME`, and four measures, nothing more, keep the arms apart and the real config untouched:

- `--setting-sources project`: the init event then lists no user-level skills such as humanizer, so nothing from the real config leaks into an arm.
- A macOS `sandbox-exec` profile (`run/sandbox.sb.tmpl`, rendered per run by `run-one.sh` and `grade-run.sh`) that denies file writes to `~/.claude/{plugins,skills,commands,agents,hooks,scripts}`, `~/.claude/{settings.json,settings.local.json,CLAUDE.md}`, `~/.agents`, `~/.config`, `~/.npmrc` and the repository, and allows the output directory. The template names no machine-specific file. Extra write denies for a machine come from the environment variable `H2H_SANDBOX_EXTRA_DENY`, a colon-separated list of absolute paths (for example a private tool directory under the home). The profile also denies reads of the repository's `bench/`, `.superpowers/`, `test/` and `.git` (and the git directories of a linked worktree), so the answer key (goldens, checks, `tasks.json`, `labels.json`, checker data, home-ground lists) cannot be read from the files or from `git show HEAD:bench/...` inside a run. Writes are limited as well: under the output directory a run may write only its own run directory (the profile placeholder `@RUN@`), never the plugin exports (`plugin-*`), `ours-tarball/` or another run's directory. Reads of sibling run directories stay allowed, so a run could read another arm's output; the transcript scan below is the control for that. The same denies apply to the git-archive copy of the code under test (placeholder `@CODE@`, see "Code under test" below), whose `bench/`, `.superpowers/`, `test/` and `.git` are unreadable and which cannot be written. `dist/` of the copy, its other files and its `run/bin-ours/` shims stay readable, because the CLI runs from the copy's `dist/`. The scripts refuse to run (exit 3) without the sandbox tool of the platform unless `H2H_ALLOW_UNSANDBOXED=1`. Reads outside those three directories are not restricted, and `claude` still keeps its own login and state in the real home.
- On Linux the same policy is enforced with bubblewrap (`bwrap`, see `run/sandbox.sh`; `H2H_SANDBOX_BACKEND` overrides the choice by platform). The `.sb` profile is still rendered as the record of the policy, and the bwrap argument list is kept beside it as `sandbox-<run>.bwrap`. bwrap is stricter than the macOS profile in one way: everything is read-only except `/tmp`, `/var/tmp`, `TMPDIR`, the run directory, the cgroup the process already runs in (claude starts its Bash tool inside it) and the places where claude keeps its own state (`~/.claude/{projects,sessions,shell-snapshots,todos,statsig}`, `~/.claude/{session-env,debug,file-history,plans,backups,telemetry}` when present, `~/.claude.json`, `~/.npm`, `~/.cache`). The home directory, the config locations, the repository, the code copy and the output directory are mounted read-only again after the temporary directories, so a home or output directory under `/tmp` is covered too. `bench/`, `.superpowers/`, `test/` and `.git` of the repository and of the code copy (and the git directories of a linked worktree) are covered by an empty tmpfs (`/dev/null` for a `.git` file), and `bench/head-to-head/run/bin-ours` of both is mounted read-only on top, so inside a run `bench/` shows only the path down to the shims. The network is not unshared. A config path that does not exist is not mounted; nothing can create it, because its parent is read-only.
- A scrubbed environment (`scrub_env` in `run/sandbox.sh`). claude gets `env -i` with only `PATH`, `HOME`, the user, shell, terminal, locale and `TMPDIR`, the login variables (`ANTHROPIC_API_KEY`, `ANTHROPIC_AUTH_TOKEN`, `ANTHROPIC_BASE_URL`, `CLAUDE_CODE_OAUTH_TOKEN`, `CLAUDE_SESSION_INGRESS_TOKEN_FILE`), `IS_SANDBOX` (claude refuses `--dangerously-skip-permissions` as root without it, and a cloud container runs as root), the proxy and CA variables, and `H2H_CODE_DIR` and `H2H_OURS_TARBALL` for the ours arm; `H2H_ENV_KEEP` names more. A Claude Code cloud session carries variables that change an arm: with them, the init event listed two more skills, one more agent, 39 tools instead of 25 and extra session events, and `CLAUDE_ADDITIONAL_DIRECTORIES` with `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1` would load another directory and its `CLAUDE.md`. `CLAUDE_EFFORT`, `MAX_THINKING_TOKENS`, `CLAUDECODE`, `CLAUDE_CODE_*` and tokens such as `GH_TOKEN` are dropped as well.
- Plugin exports. Before a round, `run-all.sh` (and `run-one.sh` for a single run) copies each plugin into `$H2H_OUT/plugin-<arm>/` and starts claude with the copy. Ours is exported from the code copy (not from the working tree) as `.claude-plugin/`, `skills/` and `hooks/` only (`THIRD-PARTY-NOTICES.md` maps the answer key, so it is not exported; it ships in the npm package anyway); each competitor and the baseline are copied from their directories without `.git`. The exports and the tarball are made read-only (`chmod -R a-w`) after they are made, and write permission is restored before a later round replaces them; the sandbox also denies writes to them. No arm can reach the answer key through its plugin directory.
- Code under test. The commit being measured is fixed before the first run, and every arm that uses our code runs from an immutable copy of exactly that commit, never from the working tree. This rule exists because of an incident in another repository, where a working tree was overwritten with older code before a benchmark. `run/prepare-code.sh <commit> <out>` (called by `rerun.sh --commit REV`, default `HEAD`) does this:
  - It resolves the commit (exit 2 if it does not exist) and extracts `git archive <commit>` into `<out>/code-<12 character sha>/`. `git archive` reads the commit object, so a dirty working tree, untracked files or a different checked-out commit have no effect, and nothing runs `git checkout`, `git restore`, `git stash` or `git reset` on any tree.
  - It builds the copy with the repository's own TypeScript compiler (`node <repo>/node_modules/typescript/bin/tsc -p <copy>/tsconfig.json`; the copy's `node_modules` is a symlink to the repository's during the build only and is removed afterwards). That is offline and deterministic: no install, no network.
  - The fixtures, `tasks.json` prompts and checks are read from the working tree's `bench/head-to-head`, not from the archive, so it first requires them to be identical to the commit: `git diff` and `git diff --cached` against the commit must be empty there and there must be no untracked file (ignored files such as `competitors/` do not count, and `results/` holds published output, not harness input, so it is left out). Otherwise it stops with exit 4 and touches nothing. `code-bench-tree.txt` records `git rev-parse <commit>:bench/head-to-head`, and every cell's `meta.json` repeats it as `benchTree`.
  - It records `code-commit.txt` (full sha), `code-tree.txt` (tree sha) and `code-manifest.txt` (SHA-256 of `dist/**/*.js`, `skills/**`, `hooks/**` and `.claude-plugin/**`), then makes the copy read-only (`chmod -R a-w`).
  - It verifies the copy and writes the results to `code-probe.txt`; any failed check stops the round with exit 4 and removes the copy. The checks: `node <copy>/dist/src/cli.js --version` equals `version` in `package.json` at the commit; `--help` mentions `--compare`; a French sample with `--language auto` is detected as French and gets no dash finding; an English line with an em dash gets a dash finding; `skills/ai-slop-linter/SKILL.md` in the copy is byte-identical to `git show <commit>:skills/ai-slop-linter/SKILL.md`.
  - `run-all.sh` compares the copy with `code-manifest.txt` before the first run (exit 4 if it changed). The `bin-ours` shims (`npx`, `ai-slop-linter`, `slop`, `npm`) resolve the CLI and the tarball from the copy through `H2H_CODE_DIR`, and fail with exit 2 when it is not set. The `ours` plugin export and the `npm pack` tarball are made from the copy. `run-one.sh` and `run-all.sh` refuse a copy that is the working repository or inside it (exit 2). The other arms do not receive `H2H_CODE_DIR`.
  - Each finished cell gets `<cell>.meta.json` with the code commit and tree, arm, task, iteration, SHA-256 of the task fixture (every file), of the exact prompt text (with the invocation prefix for the invoked arms) and of the plugin export (a manifest of every file), the model id and the date. `summarize.mjs` prints the commit, tree, probe results and model id in its header, and `publish.sh` copies `code-commit.txt`, `code-tree.txt`, `code-manifest.txt`, `code-probe.txt` and the cell records (in `cell-meta/`).
- Leak scan. `score.mjs` searches every tool call in every transcript (Bash, Read, Grep, Glob and the rest) for `bench/head-to-head`, `golden/h<N>`, `after/h<N>`, `checker-data`, `tasks.json`, `home/h<N>`, `labels.json`, `scores.json`, `blind.json`, `labelmap`, `probes/` or `.superpowers`. A flagged run gets `leak: true` in `scores.json` and its calls are listed in `leaks.json`. `summarize.mjs` prints a `LEAK:` line per flagged run and counts them in the verdict line. The round is INCOMPLETE until each flagged run is reviewed. A review is recorded in `leak-review.json` in the output directory as `{ "<run>": { "verdict": "benign" | "confirmed", "reason": "<non-empty text>" } }`. Any other shape (a non-object file, a boolean or string entry, an empty reason, an unknown verdict, a run that was not flagged) stops `summarize.mjs` with exit 2 and a message. A `benign` review prints `LEAK (reviewed, benign)` and lets the verdict through; a `confirmed` one prints `LEAK (CONFIRMED)`, the verdict line says `CONFIRMED LEAK in run <run>`, and no PASS or FAIL is printed.

Same PATH at check time. The h6 command checks (`npm run lint:prose` in a copy of the delivered repository) run for every arm with the same PATH: the `run/bin-ours/` shim directory first, then the normal PATH. So `npx ai-slop-linter`, `ai-slop-linter` and `npm install|exec ai-slop-linter` resolve to the local build for every arm, as they would for anyone after a release. In the temporary copy the check also deletes `node_modules/.bin/ai-slop-linter`, `node_modules/.bin/slop` and any `.bin` link that points at ai-slop-linter before it runs, so an arm's own installed copy of the tool does not matter at check time: every arm resolves the tool through the same shim PATH. The `bin-ours/npm` shim rewrites `npm install|i|add|exec|x ... ai-slop-linter[@spec]` (and `--package=ai-slop-linter[@spec]`) to install the local tarball (`H2H_OURS_TARBALL`, or the tarball that `run-all.sh` builds once per round with `npm pack` of the code copy into `$H2H_OUT/ours-tarball/`; `SOURCE_COMMIT` there records the code commit it was packed from, and a resumed round with a different code commit rebuilds it). Every other npm command goes to the real npm found later on PATH. The shim is on PATH during the `ours` arm run and during the check; other arms' runs never see the tarball.

Finding about the first full attempt (recorded 2026-10-22). The 112 valid transcripts of that attempt (`results/history/partial-round-1/final/`) ran from the working tree of the repository, not from an archive of a commit. The working tree was at tree `caa602e175cf` (the tree of commit `7f02063`) and, by the coordinator's record, was not edited during that run. Their `ours` cells therefore come from older product code than the final commit and are not reusable for it; they stay in history only. Their competitor and baseline cells were made before cell records existed, so no recorded hashes exist. What git history shows: for h1, h2, h3, h9, h10 and h11, the `prompt` in `tasks.json` and the fixture directory (git tree object) at `7f02063` are identical to the ones now, and `competitors.lock` and `invocations.json` have not changed since, so the prompts, fixtures and pinned competitor commits those cells ran with equal what a new round would use. The other tasks (h4, h5, h6, h7, h8, h12) are retired and never rerun. This is a derivation from history, not a recorded hash: nothing in those cells proves which plugin export or fixture copy a given run saw, and `run-all.sh --new-code` treats them as unprovable and runs them again. Unless someone decides to back-fill `meta.json` records for them on purpose, do not reuse them; the final round should run every counted cell again under the recorded hashes.

Blind-grade anonymity. `grade-prep.mjs` removes only the marker from the text shown to the grader, never a whole paragraph: `slop-ignore` HTML comments are removed; a fenced block whose every line is a tool invocation, and a line that is only an invocation (`$ ...`, `npx ai-slop-linter <args>`, `slop --<flag>`) or only an inline command, are removed; in every other line an inline command that names the tool, or a bare mention, becomes the words `the linter`, so the facts around it stay. The grading file header says that this was done, in the same words for every file.
- `run/config-guard.mjs` hashes the `hooks` object of the real `~/.claude/settings.json`, the `mcpServers` object of the real `~/.claude.json` and the `hooks` object of `~/.claude/launcher-settings.json` (it prints the hashes, never the content). The last file is where a Claude Code cloud container keeps the user-level hooks of its sessions; on a desktop it is absent and hashes as `absent`, like any missing file. `run-all.sh` compares them with the start state before and after every cell, and `rerun.sh` compares them once more around the whole of `run-all.sh`; either stops with exit 3 if the hashes changed. A guarded file that cannot be parsed also stops the round (exit 3), with a fixed message that quotes nothing from the file.

Hooks reach `claude -p` only through `--settings <file>`, and no competitor installer or init command is run. This is a check that the real config did not change, not a proof that nothing else in the home did.

Labels, copied from `labels.json` (the reason for each label is in that file):

| Task | C1 | C2 | C3 | C4 | C5 |
|---|---|---|---|---|---|
| h1 | outcome | outcome | outcome | outcome | outcome |
| h2 | outcome | outcome | outcome | outcome | outcome |
| h3 | outcome | outcome | outcome | outcome | outcome |
| h4 | outcome | outcome | outcome | outcome | outcome |
| h5 | outcome | outcome | outcome | outcome | outcome |
| h6 | outcome | outcome | outcome | outcome | outcome |
| h7 | outcome | outcome | outcome | outcome | outcome |
| h8 | outcome | outcome | outcome | outcome | outcome |
| h9 | outcome | outcome | outcome | outcome | outcome |
| h10 | outcome | outcome | outcome | outcome | outcome |
| h11 | outcome | outcome | outcome | outcome | outcome |
| h12 | outcome | outcome | outcome | outcome | outcome |

All 60 criteria are labelled `outcome`: each one is decided by reading the delivered file, or by running the delivered repository. So FULL and OUTCOME agree for this task set, and the process column holds only the transcript signal.

## Results, round 1

Scope: these 12 tasks, model `claude-sonnet-5-5`, 3 runs per cell, 2026-10-22. This is not a general ranking. The full record is `bench/head-to-head/results/round-1/` (`summary.md`, `scores.json`, `blind.json`, the transcripts and the per-run records).

### Header facts

- Date: 2026-10-22. Model: `claude-sonnet-5-5`.
- Tasks: 12 active tasks (h1, h2, h3, h9, h10, h11, h13, h14, h15, h16, h17, h18), 8 arms, 3 runs per cell (n=3), 288 runs.
- Code under test: commit `196817d69d5cdefa7dff13348fc08d185bbb32d8`, tree `0f3ff9831aeb316e74ec88d87363dba2425167ea`, run from a `git archive` copy. 5 of 5 probes passed (version, `--compare`, language, dash, skill file byte-identical).
- The coordinator pinned commit `3152212`. Commit `196817d` only adds a concurrency limit to the harness, so the product code (everything outside `bench/`, `test/` and `docs/`) is identical to `3152212`. `git diff 3152212 196817d` outside those three directories is empty.
- Competitor commits (`bench/head-to-head/run/competitors.lock`): blader `8c307f367c91bd974002f10f2be2965d642c13df`, unslop `d65241e66f2b0e0d0b305cb55dadbffac0f9ef52`, everwrite `38912ce43453129c63eef958bf65faef4833c18e`.
- Blind grading: one Sonnet call per output, with anonymised ids, for criterion C5 of h1 to h3 (72 verdicts, `blind.json`).
- Isolation, as documented in the fairness section: the real HOME, a `sandbox-exec` write profile, `--setting-sources project`, and a config guard whose hashes were unchanged.
- Leak scan: 0 flagged runs.

### Scores

All 60 criteria are labelled `outcome`, so the OUTCOME and FULL tables are identical. One table follows (mean points per task, of 5; the last rows are of 60).

| Task | ours | blader | blader-inv | unslop | unslop-inv | everwrite | everwrite-inv | base |
|---|---|---|---|---|---|---|---|---|
| h1 | 4.33 (87%) | 3.67 (73%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 3.67 (73%) | 3.67 (73%) |
| h2 | 3.67 (73%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) |
| h3 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 3.67 (73%) | 3.67 (73%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) |
| h9 | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 4.33 (87%) | 4.00 (80%) | 3.67 (73%) | 4.33 (87%) | 4.67 (93%) |
| h10 | 4.67 (93%) | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) | 4.33 (87%) | 3.33 (67%) |
| h11 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) |
| h13 | 5.00 (100%) | 4.67 (93%) | 4.67 (93%) | 3.67 (73%) | 3.67 (73%) | 4.33 (87%) | 4.00 (80%) | 3.00 (60%) |
| h14 | 5.00 (100%) | 4.67 (93%) | 4.33 (87%) | 4.00 (80%) | 3.67 (73%) | 5.00 (100%) | 4.33 (87%) | 4.67 (93%) |
| h15 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) |
| h16 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) |
| h17 | 4.00 (80%) | 4.00 (80%) | 3.67 (73%) | 4.00 (80%) | 4.33 (87%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) |
| h18 | 3.67 (73%) | 4.33 (87%) | 4.67 (93%) | 4.00 (80%) | 4.00 (80%) | 4.33 (87%) | 4.67 (93%) | 3.33 (67%) |
| **Mean total (of 60)** | 54.33 | 55.00 | 56.33 | 51.33 | 51.33 | 54.67 | 53.33 | 49.00 |
| **Percent** | 90.6% | 91.7% | 93.9% | 85.6% | 85.6% | 91.1% | 88.9% | 81.7% |
| **n per cell** | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 |

Per run (the three scores of each cell, in iteration order). `summary.md` also lists mean, min-max and n for every cell.

| Task | ours | blader | blader-inv | unslop | unslop-inv | everwrite | everwrite-inv | base |
|---|---|---|---|---|---|---|---|---|
| h1 | 4,5,4 | 3,4,4 | 5,5,5 | 4,4,4 | 4,4,4 | 5,5,5 | 3,5,3 | 4,4,3 |
| h2 | 5,3,3 | 5,5,5 | 5,5,5 | 5,5,5 | 5,5,5 | 5,5,5 | 5,5,5 | 5,5,3 |
| h3 | 5,5,5 | 5,5,5 | 5,5,5 | 3,4,4 | 4,4,3 | 5,5,5 | 5,5,5 | 4,4,4 |
| h9 | 4,4,4 | 4,4,4 | 4,4,4 | 4,4,5 | 4,4,4 | 4,3,4 | 5,5,3 | 4,5,5 |
| h10 | 4,5,5 | 5,5,4 | 5,5,5 | 5,5,5 | 5,5,5 | 4,4,5 | 5,4,4 | 4,2,4 |
| h11 | 5,5,5 | 5,5,5 | 5,5,5 | 4,4,4 | 4,4,4 | 5,5,5 | 5,5,5 | 4,4,4 |
| h13 | 5,5,5 | 4,5,5 | 4,5,5 | 4,4,3 | 4,3,4 | 4,4,5 | 4,4,4 | 3,3,3 |
| h14 | 5,5,5 | 5,5,4 | 4,5,4 | 4,4,4 | 4,3,4 | 5,5,5 | 5,4,4 | 5,5,4 |
| h15 | 5,5,5 | 5,5,5 | 5,5,5 | 5,5,5 | 5,5,5 | 4,4,4 | 4,4,4 | 5,5,5 |
| h16 | 5,5,5 | 5,5,5 | 5,5,5 | 5,4,5 | 5,5,5 | 5,5,5 | 5,5,5 | 5,5,5 |
| h17 | 4,4,4 | 4,4,4 | 4,3,4 | 4,4,4 | 5,4,4 | 4,4,4 | 4,4,4 | 4,4,4 |
| h18 | 3,4,4 | 4,4,5 | 4,5,5 | 4,4,4 | 4,4,4 | 4,5,4 | 5,5,4 | 3,3,4 |

Process column, not part of the gate. It counts the runs whose transcript executed a deterministic check (a linter or compare command). No criterion is labelled `process`, so it carries no score.

| Arm | Runs with a check | Runs | Process criteria mean |
|---|---|---|---|
| ours | 33 | 36 | none labelled |
| blader | 1 | 36 | none labelled |
| blader-inv | 0 | 36 | none labelled |
| unslop | 0 | 36 | none labelled |
| unslop-inv | 1 | 36 | none labelled |
| everwrite | 35 | 36 | none labelled |
| everwrite-inv | 35 | 36 | none labelled |
| base | 0 | 36 | none labelled |

### Gate verdict

Verbatim from `summarize` as it was when round 1 ran, with the rule A of that time (a ratio of totals). The rules restated on 2026-10-22 give the same verdict; the numbers are under "Win rule" above.

```text
Leak-flagged runs: 0 (0 not reviewed, 0 confirmed)
Total (OUTCOME): ours 54.33 vs strongest other arm 56.33 (ratio 0.964, needs 1.20)
Win rule: FAIL
Failing tasks: h1, h2, h3, h9, h10, h11, h14, h15, h16, h17, h18
```

- Rule A (total, needs ratio 1.20): ours 54.33 against the strongest other arm, blader-inv, at 56.33. The ratio is 0.964. Ours is below the strongest other arm on the total, and below blader (55.00) and everwrite (54.67) as well.
- Rule B (per task, strictly above every rival): ours is strictly above every other arm on 1 of 12 tasks, h13. It fails on h1, h2, h3, h9, h10, h11, h14, h15, h16, h17 and h18.
- Verdict: FAIL. The win rule was not met.

On these 12 tasks, on this model, on this date, the ai-slop-linter skill did not reach the win rule: its total is 54.33 of 60 (90.6%) against 56.33 (93.9%) for the strongest other arm. This is not a general ranking.

### Findings

Counts come from `scores.json`.

1. Ceiling. Ours scores 5.00 on h3, h11, h13, h14, h15 and h16. Other arms reach 5.00 on the same tasks, except on h13: on h3, 4 of the other 7 arms; h11, 4; h14, 1 (everwrite); h15, 5; h16, 6. Strict superiority is unattainable where a rival is also at 5.00. Only h13 has no rival at ours-level (best other arm 4.67).
2. h1 C3 (stock French phrases left in the note). Ours fails in 2 of 3 runs. Blader (both forms) and everwrite (both forms) fail 0 of 3; unslop (both forms) fails 3 of 3; base fails 2 of 3. The phrases are `robuste`, `sans faille` and similar French forms of English tells.
3. h2 C4 (added claim). Ours fails in 2 of 3 runs (h2-ours-2 and h2-ours-3). Every competitor arm fails 0 of 3, base fails 1 of 3. Both failing ours runs added the word "our" that the source lacks. h2-ours-2 wrote: "In our benchmarks, version 2.3 processes 12,000 jobs per second on a single 4-core machine, 40% faster than version 2.2." h2-ours-3 wrote: "Version 2.3 processes 12,000 jobs per second on a single 4-core machine in our benchmarks, 40% faster than version 2.2." The skill's "Add no fact" section forbids adding "we", "our" or "I" that the source does not use. In both transcripts the agent made one Read and one Edit: no skill call, no linter run, no compare. So the skill's rule was either not loaded or not followed in these runs; the transcripts do not show which. The added word is an owner claim ("our benchmarks") on a measured figure, which is the failure the criterion exists to catch.
4. h9 C2 (tells removed, unslop catalog). 17 of 24 scored runs across all arms fail it (ours 3 of 3, blader 3, blader-inv 3, unslop 2, unslop-inv 3, everwrite 1, everwrite-inv 1, base 1). The criterion is hard for every arm, including the arm whose catalog it was written from.
5. h10 C1 (facts kept, German). Ours fails 1 of 3 (unslop arms 0 of 3, everwrite arms 2 of 3 each, base 3 of 3).
6. h17 C2 (German tells from unslop's catalog) and h18 C2 (tells from everwrite's list): ours fails 3 of 3 on each. On h17 C2 seven of eight arms fail 3 of 3 (unslop-inv fails 2 of 3). On h18 C2 the failures are ours 3, unslop 3, unslop-inv 3, base 3, and 1, 1, 1, 0 for blader, blader-inv, everwrite, everwrite-inv. h18 C3 (nothing added): ours fails 1 of 3, as do everwrite and everwrite-inv; base fails 2 of 3.

These home-ground tasks measure each competitor's own catalog (h9, h10, h17 for unslop; h11, h18 for everwrite; h16 for Humanizer). The linter's rule set does not flag the German and the everwrite-list tells that h17 C2 and h18 C2 look for, and its French, Spanish and German packs are almost empty by measurement (see `docs/LANGUAGES.md`). A score on those tasks says how well an arm matches a competitor's catalog. It is not evidence about the quality of the rewrite.

Process signal, outside the gate: ours ran a deterministic check in 33 of 36 runs, everwrite in 35 of 36 (and everwrite-inv in 35 of 36), the other arms in 0 or 1 of 36. The two failing h2 runs ran no check at all (one Read, one Edit each), and `--compare` does not flag first-person words, so even a run of it would not have caught them.

### Disclosures

- The skill description and the CI recipe were changed after a smoke run on h1 and h6. The verbs added to the description, "réécris" and "schreib um", are the verbs of the h1 and h10 prompts.
- Criteria repairs after the freeze are in the "Criteria repairs" table above. Criteria inspected and left unchanged are listed under it too.
- The first full attempt (112 valid transcripts, tree `caa602e175cf`) was cut off by the session limit. Its `ours` cells were not reused, because the product code changed after it.
- Retired tasks, and why: h4, h5, h6, h7 and h12 were saturated (every arm, the baseline included, reached full or near full marks), and h8 duplicated h16. Their replacements are h13 to h18. Retired tasks are not in the totals or the win rule.
- Competitors were run as installed plugin directories, as their READMEs describe, with the invocation forms listed in the Arms section.
- Not done yet: F6 (an independent 10 percent re-grade), F9 (runs on Haiku and Opus) and the held-out set. Do not quote these results as final until they are done.

### What round 2 would change

No claim of leadership is supported by round 1.

1. `slop --compare` should also flag first-person words added or removed ("our", "we", "I", "my", and the French, Spanish and German equivalents). The skill's add-no-fact rule then becomes a deterministic check. It would have caught both h2 failures.
2. The skill must make the agent act on a failing compare (treat it as blocking). For non-English rewrites it must list the language's stock tells to remove by judgement, because the linter ships almost no non-English rules (h1 C3, h10, h17).
3. Replace or harden the tasks where 5 or more arms sit at the ceiling (h3, h11, h15, h16): "strictly above every arm" cannot be met there. The win rule as written (strictly higher on every task, 8 arms, n=3) is very hard to satisfy even for a clearly better tool. The coordinator should decide whether to keep it.
4. Add a model-robustness run (Haiku and Opus), the independent 10 percent audit and the held-out tasks before any launch claim.
5. Fix h9 C2: the criterion fails for every arm (17 of 24 runs), so it does not separate them. Decided on 2026-10-22: left unchanged. Every failure keeps a source phrase that the passing runs show can be reworded without losing a fact, and it does separate the arms (base 2 of 3, ours 0 of 3); see "Criteria inspected" under "Criteria repairs".

## Results, round 2

Scope: the same 12 tasks, model `claude-sonnet-5-5`, 3 runs per cell, 2026-10-22, run on a Linux cloud machine with the bubblewrap sandbox and a scrubbed environment. This is not a general ranking. The summary is `bench/head-to-head/results/round-2/summary.md`. Transcripts, scores and grader files stay out of the repository on purpose (budget and privacy rule of the cloud session); they were in `/root/h2h-round-2` on that machine.

- Code under test: commit `8cfeb5ccf4b3e30eaa57ae017fe7b17484b49970` (the compare review, the prompt hook, the reference catalogs with the blocking compare, the restated summarize). 5 of 5 probes passed. 288 runs, 0 failed cells, 72 blind verdicts, 0 leak-flagged runs, config guard unchanged.
- Totals (of 60): ours 56.67, blader-inv 56.00, everwrite 54.33, everwrite-inv 53.33, blader 52.33, unslop 52.33, unslop-inv 51.67, base 44.00. Ours has the highest total for the first time (round 1: 54.33 against 56.33).
- Rule A: FAIL, narrowly. Ours lost 3.33 points, the strongest other arm (blader-inv) lost 4.00, the limit is 0.8 times 4.00 = 3.20.
- Rule B: FAIL, 8 of 12 tasks pass (h1, h2, h3, h10, h11, h13, h15, h16). Failing:
  - h9: ours 4.00 against everwrite 4.33. Ours fails C2 (tells from the unslop catalog) in 3 of 3 runs; every other arm fails it too except one everwrite run.
  - h14: ours 4.67 while blader, everwrite and everwrite-inv reach 5.00. One ours run failed C4.
  - h17: ours 4.00 against unslop 4.33. Ours fails C2 (German tells) in 3 of 3 runs; unslop in 2 of 3.
  - h18: ours 4.00 against blader-inv 4.67. Ours fails C2 (everwrite list tells) in 3 of 3 runs; blader-inv in 1 of 3.
- Cost: the 288 runs reported about 27.8 US dollars at API prices (ours 3.60, base 1.73, competitor arms 2.96 to 4.92 each), about 0.10 per run.
- Disclosure: the reference catalogs read by ours are adapted from everwrite's and unslop's public catalogs, the same sources the h9, h10, h11, h17 and h18 checks were written from. A win on those home-ground tasks must be read with that in mind.
- Verdict: the win rule is not met. F6, F9 and the held-out tasks are still not done; nothing here may be quoted as a leadership claim.

## Round 3 measurement protocol (frozen 2026-10-22, owner decision)

Written and committed before any round-3 run, and before any round-3 result was seen. It is not changed after results exist.

Rule. On a task that did not change, the scores of the rival arms and of the baseline come unchanged from the last published round (round 2, `results/round-2/summary.md`, the "OUTCOME per run" table); only the ours arm is run again, 3 times, and graded with the same grader. On a changed or new task, every arm is run 3 times. The final gate (held-out tasks, F9, F6) is exempt: there every arm runs in full.

Which tasks count as unchanged. Source round: round 2, code under test `8cfeb5ccf4b3e30eaa57ae017fe7b17484b49970`. `git diff 8cfeb5c HEAD -- bench/head-to-head` shows one added file, `results/round-2/summary.md`; so `tasks.json` (prompts), fixtures, goldens, `checks/`, `labels.json`, the blind-grader prompts and loop (`grade-prep.mjs`, `grade-run.sh`), `score.mjs`, `competitors.lock` (blader `8c307f3`, unslop `d65241e`, everwrite `38912ce`), `invocations.json` and the model (`claude-sonnet-5-5`) are byte-identical to round 2. All 12 active tasks (h1, h2, h3, h9, h10, h11, h13, h14, h15, h16, h17, h18) are therefore unchanged. No task is new and no variant is added. Product code under test is the only thing that differs (round-3 commits after `8cfeb5c`, listed in "Resume").

Reused values (mean OUTCOME points over 3 runs, from round 2; the per-run values are in the round-2 summary):

| Task | blader | blader-inv | unslop | unslop-inv | everwrite | everwrite-inv | base |
|---|---|---|---|---|---|---|---|
| h1 | 3.00 | 5.00 | 4.00 | 4.00 | 5.00 | 3.33 | 3.00 |
| h2 | 4.33 | 5.00 | 5.00 | 5.00 | 4.33 | 4.33 | 3.00 |
| h3 | 5.00 | 5.00 | 4.00 | 4.00 | 5.00 | 5.00 | 3.67 |
| h9 | 4.00 | 4.00 | 4.00 | 4.00 | 4.33 | 4.00 | 4.00 |
| h10 | 4.00 | 4.67 | 5.00 | 5.00 | 4.00 | 4.67 | 2.33 |
| h11 | 5.00 | 5.00 | 4.00 | 4.00 | 5.00 | 5.00 | 4.00 |
| h13 | 4.33 | 4.33 | 3.33 | 4.00 | 4.33 | 4.67 | 3.00 |
| h14 | 5.00 | 4.33 | 4.67 | 4.00 | 5.00 | 5.00 | 4.33 |
| h15 | 5.00 | 5.00 | 5.00 | 5.00 | 4.00 | 4.00 | 5.00 |
| h16 | 5.00 | 5.00 | 5.00 | 4.67 | 5.00 | 5.00 | 5.00 |
| h17 | 3.67 | 4.00 | 4.33 | 4.00 | 4.00 | 4.00 | 3.67 |
| h18 | 4.00 | 4.67 | 4.00 | 4.00 | 4.33 | 4.33 | 3.00 |

Totals of the reused arms (of 60): blader 52.33, blader-inv 56.00, unslop 52.33, unslop-inv 51.67, everwrite 54.33, everwrite-inv 53.33, base 44.00. Strongest other arm: blader-inv, lost 4.00, so the rule A limit stays 0.8 x 4.00 = 3.20 (ours may lose at most 3.20 of 60). Rule B and the ceiling rule use the same reused per-task means. This repository has no cost rule. Reused cells are marked "r2 reused" in the round-3 result table. If a reused value cannot be found in the round-2 summary, that task runs for all arms instead.

Ours cells: 12 tasks x 3 runs = 36 runs, from a `git archive` copy of the commit under test, parallelism 2, a failed cell (rate limit) is re-run and never graded, the config guard runs around every cell, then the blind grader on the ours cells only.

## Results, round 3

Scope: protocol "Round 3 measurement protocol" above (frozen in commit `d844833` before any run): only the ours arm ran, 12 tasks x 3 runs, model `claude-sonnet-5-5`, 2026-10-22, macOS with the `sandbox-exec` write sandbox and a scrubbed environment (the scrubbed environment passes `ANTHROPIC_API_KEY`; a Haiku probe through it reported `apiKeySource` `ANTHROPIC_API_KEY`). Rival and baseline values are the round-2 means, marked "r2 reused" in `bench/head-to-head/results/round-3/summary.md`. Code under test: `d8448330248a4639fb2a6fe85b64b9b6a48403c2` (product code identical to `995a5c7`, the last round-3 change). 36 runs, 0 failed cells, 9 blind verdicts, config guard unchanged. Cost of the 36 runs: 3.14 US dollars; the 9 grader calls about 0.30 (estimate).

- Total (of 60): ours 55.67, blader-inv 56.00 (r2 reused), everwrite 54.33, everwrite-inv 53.33, blader 52.33, unslop 52.33, unslop-inv 51.67, base 44.00. Ours is 1.00 lower than in round 2 (56.67) and now second.
- Rule A: FAIL. Ours lost 4.33, the strongest other arm lost 4.00, the limit is 3.20.
- Rule B: FAIL, 6 of 12 tasks pass (h3, h10, h11, h13, h15, h16). Failing: h1 (4.67 against 5.00; one run kept a stock phrase, C3), h2 (4.33 against 5.00; one run failed C4, an added word), h9 (4.00 against 4.33; `streamlines` kept in 2 runs, not in the linter or the references), h14 (4.67 against 5.00; one run failed C4), h17 (4.00 against 4.33; 3 of 3 runs kept `Unser Tool entscheidet selbst`, a false-agency pattern from the unslop catalog that `references/de.md` does not list), h18 (4.00 against 4.67; 3 of 3 runs kept `not publicly available`, which `references/en.md` lists and the agent still left).
- Reading: the round-3 product changes (`f417fa7`, `4e3b226`, `d0d8cf3`, `3cd64d9`, `995a5c7`) did not raise the total; the h9, h17 and h18 C2 losses are unchanged in size. h1 and h2 moved down by one run each, which is within the spread seen between rounds. Win rule: FAIL; nothing here may be quoted as a leadership claim.
- Not done: no product change was made in this session, because passing rule B on all 12 tasks needs every run of h1, h2, h14 to be perfect and the three C2 tasks to be clean, and a further round was judged unlikely to flip the gate for its cost. F6, F9 and the held-out tasks are not started.

## Round 4 measurement protocol (frozen 2026-10-22, owner decision)

Written and committed before any round-4 run, and before any round-4 result was seen. It is not changed after results exist. Owner request of 2026-10-22: at launch we must be able to show that we are objectively first against the strongest alternatives on this benchmark.

Code under test. The product changed after round 3 (`--verify`, the `*.tells.txt` catalogs, the new first-tier entries `streamline` in `references/en.md` and the false-agency class for tools that "decide on their own" in `references/de.md`, the skill gate that requires `--verify` to exit 0). The commit is recorded in `code-commit.txt` of the round directory. The ours arm therefore runs on all 12 tasks, 3 runs each.

New arms (competitors added from the 2026-10-22 scan, each with a natural arm and an invoked arm, all 12 tasks, 3 runs each, same model `claude-sonnet-5-5`, same sandbox, scrubbed environment and config guard as every other arm):

| Arm | Pinned source | Set up as |
|---|---|---|
| avoid-ai-writing, avoid-ai-writing-inv | conorbronsdon/avoid-ai-writing `209815cdeb4af942616daec89a5e0a706c804e3a` (3.38.0, MIT) | `plugins/avoid-ai-writing` of the pinned clone as the plugin directory; the detector and validator sit inside its skill folder; invoked form `/avoid-ai-writing:avoid-ai-writing` |
| slopless, slopless-inv | berelevant-ai/slopless `628d89bd63f60e3718bfba0012b90b9629c8842d`, npm 0.2.41 (MIT), tarball sha256 `86d81cd90f132c1dc5f6291dbdfad51b50b374571470cffa8ff79f637b638e4a` | skill file of the npm package in a plugin directory; the CLI installed from the tarball into the plugin export, `npx slopless` resolved to it by a shim (no network at run time); `install-skill` is not run; invoked form `Use the Slopless skill.` |
| slop-cop, slop-cop-inv | yasyf/slop-cop `c9fc5a6796ef01978f8a1c1bff47361ead13bd7a` (0.1.73, MIT) | plugin directory of the pinned clone; the binary is built from that source; `bin/slop-cop` is a wrapper that sets `SLOP_COP_LLM=off` and refuses `rewrite`, `plainify` and every `--llm*` flag, so only `check` runs and no model or network call is made (the binrun download is never run); invoked form `Use the slop-cop-prose skill.` |

`bench/head-to-head/run/setup-round4.sh` builds these directories. Licence: all three are MIT; no code of them is copied into this repository. Vaara is never run. Each invoked form was probed once with Haiku and reached the skill.

Reused arms. On the 12 unchanged tasks, the means of blader, blader-inv, unslop, unslop-inv, everwrite, everwrite-inv and base come unchanged from round 2 (the table in "Round 3 measurement protocol"). Their raw answers are not in this repository, so they cannot be put in the same blind grading round; the blind grader (C5, tasks h1 to h3) sees the answers of ours and of the new arms together, in one shuffled order, with anonymous ids. The C5 values of the reused arms come from the round-2 grading. This is a disclosed difference in grading round.

Budget and order. Owner limit 15 US dollars, no new run starts above 12.0. The estimate for one arm of 36 runs is 3 to 5 dollars, so six new arms plus ours do not fit. Order (fixed now): ours, avoid-ai-writing, avoid-ai-writing-inv, slop-cop, slopless, slop-cop-inv, slopless-inv. Each arm runs all 12 tasks x 3 runs before the next arm starts. A new arm starts only if the running total plus 3.6 dollars stays at or below 9.8, which leaves about 2.2 dollars for the blind grading. An arm that does not start is reported as not run (budget); an arm that is cut off is reported as partial and is not counted. A rule A/B verdict is computed against the arms that finished, and is called a full verdict only when all six new arms finished; otherwise it is called partial, and no leadership claim is made from it.

Rules. Rule A, rule B and the ceiling rule are those of "Win rule", with the strongest other arm taken over the reused arms and the finished new arms (the better of natural and invoked per competitor). Only outcome criteria count. A failed cell (rate limit) is re-run and never graded. Criteria, check scripts, tasks and labels are not changed after results exist. Final gate (held-out tasks, F9, F6) only if the full verdict passes and the budget allows; otherwise it goes to the report.

Home-ground disclosure. The new catalog entries (`streamline`, the German false-agency class) were taken from the unslop catalog, the same source the h9 and h17 checks were written from, after round 3 showed that those tells were the cause of the C2 losses. A win on h9, h17 and h18 is home-ground and must be read that way. The `--verify` catalog scan also lists `let us know` and French stock phrases that the h14 and h1 checks penalise; they come from the existing reference lists and chatbot-residue lists, not from the check files.

## How to re-run

One command repeats a round: it pins and clones the competitors, runs all eight arms on every task, scores the runs, and prepares the blind grading.

```sh
bench/head-to-head/rerun.sh --iterations 3 --out /tmp/h2h-round-1 --commit <sha>
```

The output directory must be outside the repository. Every path is made absolute, so a relative `--out` works. `--parallel N` (default 8) caps how many arms run at once; the account limit is shared, so use `--parallel 2` when another job runs. `--commit REV` names the commit under test (default `HEAD`); `rerun.sh` resolves it, makes the immutable git-archive copy first (`run/prepare-code.sh`, exit 4 if a probe fails) and runs the ours arm from that copy only (see "Code under test" in the isolation notes). Commit your work before the round: an uncommitted change is not in the archive and is not measured.

Resuming. `rerun.sh` and `run-all.sh` refuse (exit 5) to resume into an output directory whose `code-commit.txt` differs from the commit now requested, or that holds a finished `ours` cell recorded for other code or with no record. `--new-code` lifts the refusal on purpose: every such `ours` cell is moved to `<out>/invalidated-<old 12>/` (the old `code-*.txt` records go there too) and runs again on the new commit. A finished competitor or baseline cell is kept only when its `meta.json` shows the same task fixture, prompt, plugin export and model as would run now; if any hash differs, it runs again. A cell with no `meta.json` (a round made before the records existed) is kept by a plain resume, and with `--new-code` it runs again, because reuse cannot be proved. A finished `ours` cell recorded for the same commit is kept.

`--dry-run` prints every command and runs none. `--tasks h1,h3` runs a subset. By default only the active tasks run; `--include-retired` adds the retired ones (here and in `run-all.sh`, `score.mjs`, `grade-prep.mjs` and `summarize.mjs`), and they stay out of the totals and the win rule. A run counts as finished only when claude exited 0 and the last stream event is a successful result (not an error such as a rate limit). That transcript is `<cell>.jsonl`; anything else is kept as `<cell>.failed.jsonl`, listed at the end of `run-all.sh`, and makes it exit 1. A finished run is skipped, so an interrupted or failed round resumes by running the same command again (`run-all.sh --force` re-runs everything). A run directory without `<cell>.jsonl` is "no run": `score.mjs` skips it instead of scoring it as zero. The command then prints the remaining steps:

```sh
bash bench/head-to-head/run/grade-run.sh <out>        # the blind grader loop: each grading/<id>.txt goes to claude -p on stdin
node bench/head-to-head/run/grade-collect.mjs <out>   # writes blind.json
node bench/head-to-head/run/summarize.mjs <out>       # OUTCOME and FULL tables, win rule
bash bench/head-to-head/run/publish.sh <out> round-1  # copy the evidence into results/round-1 for committing
```

The n rule: the win rule prints a verdict only when ours and every counted rival arm (natural, invoked and the baseline) have at least one run in every task. Otherwise it prints `INCOMPLETE` and names what is missing, for example `arm blader-inv has no runs`. A subset round (`--tasks h1,h3`) is therefore always incomplete. A cell with fewer runs than the others is not blocked, but the summary prints `Missing runs`, a warning that lists the short cells, and the n row of each table, and the scope sentence gives the largest n.

The scripted criteria can also be run directly on one output directory:

```sh
node bench/head-to-head/checks/check.mjs h1 <dir-with-note.md>
```

For h6, pass the repository directory and, optionally, `--path <PATH>` to choose the PATH that `npm` runs with.

## Resume

This section is a handoff note for whoever continues the work, on any machine (it was written on macOS and the next session is expected on a Linux cloud machine). Facts here are state, not results.

### State on 2026-10-22 (end of the cloud session)

- Round 2 is done on commit `8cfeb5c` (see "Results, round 2"): ours 56.67 of 60, highest total, but rule A fails narrowly (lost 3.33, limit 3.20) and rule B fails on h9, h14, h17 and h18. Every C2 failure on h9, h17 and h18 is a tell from a competitor catalog that our rewrite kept.
- Round 3 product changes are already committed after `8cfeb5c` and NOT measured: research report `docs/ROUND3-RESEARCH.md` (commit `0f742c6`), then `f417fa7` (guardrails in the hook line), `4e3b226` (minimal edits, outline, second pass), `d0d8cf3` (two-tier references, load-bearing metaphors, trailing clauses, CC0 word lists), `3cd64d9` (`--compare` qualifiers next to numbers), `995a5c7` (`invisible-character` rule). Full `npm test`: 940 tests, 934 pass, 0 fail, 6 skipped.
- Next step: round 3 = re-run only the ours cells on the new commit. `rerun.sh --new-code --commit <new sha> --out <the round-2 directory>` keeps every competitor and baseline cell whose recorded hashes still match and re-runs the 36 ours cells (about 3.6 US dollars plus about 9 grader calls). That needs the round-2 output directory; a fresh machine has to run the full round (about 28 US dollars plus 72 grader calls). Before running, target the C2 failures of h9, h17 and h18 (read the failing ours outputs against the criterion text) and the h14 C4 miss.
- Budget (owner, 2026-10-22): the session quota is low, so no new round was started after round 2. The owner has a 200 US dollar promotional API credit (Talent Visa Journey organisation, expires 2026-10-29) that applies to the API and the Agent SDK. Use it only through an `ANTHROPIC_API_KEY` added as an environment secret of a new session (the harness keeps that variable). First make one cheap Haiku call and confirm in the Console that the cost was taken from the promotional credit; do not add a payment method.
- Final gate after a passing round: the held-out tasks (branch `heldout-2026-10`, read only at that step), Haiku and Opus runs (1 per task), then the independent 10 percent re-grade.

### State before round 2 (kept for the record)

- Branch `plugin-leadership`, unpushed when this was written. Round 1 is published in `bench/head-to-head/results/round-1/`, run on commit `196817d69d5cdefa7dff13348fc08d185bbb32d8` (product code identical to `3152212`).
- Rule A was restated by the owner on 2026-10-22 (spec section 2): our lost points (maximum minus our total) must be at most 80 percent of the best other arm's lost points. The ceiling rule applies: when another arm reaches the maximum on a task, we pass that task only if we also reach the maximum. Only tasks on which every arm scores full marks are replaced; several arms at the ceiling is not a reason to replace a task.
- Round 1 under the restated rule A: ours lost 5.67 points (60 minus 54.33), the strongest other arm (blader-inv) lost 3.67 (60 minus 56.33). The limit is 0.8 times 3.67, which is 2.93. Rule A fails. Under the ceiling rule ours reaches the maximum on h3, h11, h13, h14, h15 and h16 and misses it on h1, h2, h9, h10, h17 and h18.
- Done on 2026-10-22 (plan item 5): `bench/head-to-head/run/summarize.mjs` prints the restated rule A (lost points against 0.8 times the best other arm's) and rule B with the ceiling rule, both verdicts with their numbers, and each failing task with its reason; `test/head-to-head-run.test.mjs` covers the cases, including round 1 recomputed from the per-run table (lost 5.67, limit 2.93, FAIL; failing h1, h2, h9, h10, h17, h18). The "Win rule" section states the restated rules.
- Done on 2026-10-22 (plan item 4): h9 C2 is left unchanged, with the evidence under "Criteria inspected".
- The cloud copy of this branch lacks the raw evidence that the squash left out (see `bench/head-to-head/results/README.md`). Tests that read it are skipped there with the file named, and `node bench/compare-words.mjs --check` runs a partial check; both run in full where the files exist.
- F6 (independent 10 percent re-grade), F9 (Haiku and Opus runs) and the held-out tasks are not done. Round 1 numbers are not final and must not be quoted as a leadership claim.

### Round 2 plan (done: implemented, reviewed and run on 2026-10-22)

1. `slop --compare` flags added or removed first-person words (our, we, I, my and the French, Spanish and German equivalents) and new claims. STATE: implemented and committed (`wip(compare)` followed by `feat(compare): flag added or lost first-person words and added claim words`), NOT reviewed. The h2 check works: `results/round-1/runs/h2-ours-2` and `h2-ours-3` print `added person our` and exit 1, and the honest `h2-blader-1` is clean. The word table is `bench/COMPARE-WORDS.md` (generated by `node bench/compare-words.mjs`, `--check` is wired into CI; 24 golden pairs and 207 honest rewrites). Added person words kept: all but `i`, `i'd` and German `uns` (dropped for flagging more than 5 percent of honest rewrites); lost person words: almost all dropped because goldens legitimately remove them, so only `i'd`, `us`, `notre` and `uns` flag when lost; claim words: `best`, `only`, `everyone`, `nobody` dropped because each flags a golden. Evidence for French and German is thin (8 and 29 honest rewrites), Spanish and Turkish have none. Last full `npm test`: 879 tests, 878 passed; the one failure was in `test/head-to-head-run.test.mjs` (the `rerun.sh` and `run-all.sh` fake-claude tests), a different one each run, looks load dependent and needs a check on a quiet machine. Next: review the diff (precision per word, quoted and code text excluded, the skill text, docs), re-run the suite, mutation-check. Review of item 1 (done, `fix(compare)` commit): the h2 check still holds; fixed person words read inside names and link targets (`us-east-1`, `my-app`, `my_var`, `docs/our-guide.md`, `[x](#us)`, e-mail addresses; a French hyphen still counts, `contactez-nous`), an unclosed fence read as prose, the dropped `leading` claim word (`the leading slash`), a missing `language` on MCP `compare_facts`, and a code comment that said unlisted languages use the English list; per-file counts over all 432 corpus pairs are unchanged, so `COMPARE-WORDS.md` only lost the `leading` row. 7 tests added; all 23 non-equivalent mutations tried are now killed (7 of the 17 on the original code survived). Still open: single quotes, block quotes and indented code are read; imperative `Always`/`Never` and `every` for `each` are honest additions that flag; short or Turkish texts need `--language`.
2. Firing on rewrite requests. STATE: implemented (`hooks/hooks.json`, `hooks/rewrite-prompt.sh`, `test/prompt-hook.test.mjs`), NOT reviewed; the `ours` export and the code manifest include `hooks/`. Fixture: 78 of 78 related prompts trigger, 0 of 79 unrelated, but that is in-sample; three later batches measured before tuning caught 23 of 47 related prompts and flagged 4 of 47 unrelated ones (see the fixture's `_note`). One real Haiku call confirmed that Claude Code runs the hook from `--plugin-dir` and that the agent then called the skill. Plan as written: a `UserPromptSubmit` hook (`hooks/hooks.json` plus a POSIX shell script, no launcher, no network, no writes, path through `${CLAUDE_PLUGIN_ROOT}`) that adds one context line on rewrite, clean-up, polish, humanize and proofread prompts (English plus the verbs used in other languages such as reecris, reescribe, schreib um, yeniden yaz). Measure true triggers on at least 20 related prompts and false triggers on 20 unrelated prompts. The benchmark's `ours` plugin export (see `bench/head-to-head/run/`) must include `hooks/`. Evidence: in two of three h2 runs and in some h1 runs the skill never loaded.
3. Hybrid coverage for h17, h18 and h1. STATE: done (`feat(skill): add reference catalogs and make a failing compare blocking`; `references/en.md`, `de.md`, `fr.md`, `es.md`), NOT reviewed. Plan as written: keep the deterministic linter (it ships only rules that pass the precision gate) and add a reference catalog in `skills/ai-slop-linter/references/` that the skill makes the agent read after the linter, for tells a regular expression cannot catch (adapted from unslop's German list and everwrite's catalog, MIT, attribution kept in `THIRD-PARTY-NOTICES.md`, plus the French tells), with the rule "add no fact, change no number".
4. h9 C2 is repaired only if it is objectively wrong (evidence from the failing outputs of all arms); otherwise it stays and the finding is documented. STATE: done, it stays (see "Criteria inspected").
5. Then: update `summarize.mjs` to the restated rule A and the ceiling rule, review everything, and wait for the owner's go. Round 2 is not run until then. STATE: `summarize.mjs` and its tests updated, NOT reviewed.

### Rules for anyone continuing

- Before any push, rewrite the Co-Authored-By trailers of the commits since `12c2ac9` that name Sonnet or Haiku so they all name Opus 5.5 (a message filter, tree unchanged); the last two feature commits still carry the Sonnet line.
- Never run `git checkout`, `git restore`, `git stash`, `git reset` or `git clean` on the working tree. Benchmark arms run from a `git archive` copy of the commit under test (`bench/head-to-head/run/prepare-code.sh` does it and refuses a dirty `bench/head-to-head`). No competitor installer or init against a real home. Vaara and similar governance hooks are banned from all benchmarks. Run the config guard (`bench/head-to-head/run/config-guard.mjs`) around every run; parallelism 2 while another repository runs.
- Subagent method used so far: a plan with numbered tasks, one implementer per task (Haiku or Sonnet), a Sonnet review per task with fix rounds, a final review on Opus. Briefs and reports were kept outside the repository and are not available on another machine; this section and the git history are the record.

### Moving to a Linux cloud machine

- The write sandbox has a Linux backend: bubblewrap (`bwrap`) with the policy of `sandbox.sb.tmpl` as bind mounts (see "Isolation for the runs"). It was checked on a Claude Code cloud container (bubblewrap 0.9.0, running as root): a real `bwrap` test in `test/head-to-head-run.test.mjs` shows that a write to a denied config path, the repository, the code copy or another run fails, a write to the run directory and to claude's state succeeds, `bench/` and `test/` cannot be read and `bin-ours` can. The tests that need the sandbox are skipped when `bwrap` is missing or cannot make namespaces; the other tests then run with `H2H_ALLOW_UNSANDBOXED=1`.
- Real calls on that machine (Haiku, run-one.sh's argv): claude logs in inside the sandbox with the scrubbed environment, and the init event lists only the built-in skills and plugins, no skill from `~/.claude/skills`, no MCP server and no additional directory; with `--include-hook-events` no hook ran, so the Stop hooks of `~/.claude/launcher-settings.json` do not reach an arm. One cell of h12 through `run-one.sh` finished with a valid transcript and its Bash, Read and Write calls worked.
- As root, `chmod -R a-w` does not stop writes to the code copy, the exports or the tarball; on Linux the read-only mounts of bwrap do.
- The config guard there reads `~/.claude/settings.json` (absent on that machine), `~/.claude.json` (no `mcpServers` key) and `~/.claude/launcher-settings.json` (the session hooks).
- Authentication: the arms run with the real home and the machine's own Claude login (a temporary home cannot log in). Do not copy credential files between machines.
- Competitor plugins are cloned by `bench/head-to-head/run/setup-competitors.sh` at the commits in `run/competitors.lock`; `everwrite` needs Python 3.9 or later.
- `publish.sh` scrubs `/Users/<name>`, the output directory and the scratchpad (`/tmp/claude-<uid>/...`); a home under `/root` or `/home/<name>` is not replaced yet, so check published files from a Linux round for it.

### Resume commands

```
git status --short          # must be clean before a run
bash bench/head-to-head/rerun.sh --iterations 3 --parallel 2 --commit <full sha of the commit under test> --out <directory outside the repository>
# a cut-off run resumes with the same command; valid cells are skipped, failed cells (kept as .failed.jsonl, never graded) run again
bash bench/head-to-head/run/grade-run.sh <out> && node bench/head-to-head/run/grade-collect.mjs <out> && node bench/head-to-head/run/summarize.mjs <out>
bash bench/head-to-head/run/publish.sh <out> round-2
```

A full round is 12 tasks times 8 arms times 3 runs, 288 runs, plus 72 blind-grader calls; round 1 needed about two sessions at parallelism 2.
