# Best-rival analysis, round 7 (2026-10-23)

Method: `BEST-RIVAL-SPEC.md` (owner standard, 2026-10-22), steps 1 to 5. Written before any round 7 code change. This round builds on `docs/BEST-RIVAL-r6.md`, which read blader (Humanizer 3.1.0, pinned `8c307f3`, MIT, 397 lines) and unslop (pinned `d65241e`, MIT) end to end with file and line references. That reading is not repeated; the rule numbers below (§N, `:line`) are the ones recorded there. New in round 7: the round 6 development-gate cells, which show what is still lost after the round 6 changes. Rival code was read, never run outside the benchmark harness. Criteria, checks, tasks and the win rule are unchanged.

## 1. Best rival, task by task

Unchanged from `BEST-RIVAL-r6.md` section 1 for the public set (round 3) and held-out round 5. Primary rival: **blader-inv**. Second: **unslop / unslop-inv**. The round 6 gate did not re-run any rival; the rival numbers for ho1 to ho5 are the round 5 means (blader-inv 5.00, 5.00, 5.00, 4.33, 5.00).

Our round 6 gate scores (three iterations, three runs each) against those means:

| Task | blader-inv (r5) | iter 1 | iter 2 | iter 3 | lost criteria in our runs |
|---|---|---|---|---|---|
| ho1 | 5.00 | 5.00 | 5.00 | 5.00 | none |
| ho2 | 5.00 | 5.00 | 5.00 | 4.67 | iter 3 run 3: tell `podría reducir` left |
| ho3 | 5.00 | 4.67 | 4.33 | 5.00 | iter 1 run 1: fact `limite de 80` changed to `cujo limite é 80`; iter 2 run 2: tell `em um cenário de` left; iter 2 run 3: word `fizemos` added |
| ho4 | 4.33 | 5.00 | 5.00 | 4.67 | iter 3 run 2: protected sentence changed (two sentences merged) |
| ho5 | 5.00 | 5.00 | 5.00 | 5.00 | none |

The five lost points are five different causes on four different cells. No cell lost the same criterion twice. Rival cells with lost points on the same tasks (round 5): ho2 blader 4.00 (two runs left `podría reducir`), unslop and unslop-inv 4.00 (all runs left it); ho4 blader lost 2 points in each of 3 runs (changed protected sentence plus an added `we`), blader-inv in 1 of 3 runs (same two criteria), unslop and unslop-inv lost one protected sentence in most runs.

## 2. What the traces of the lost cells show (new)

Facts read from `bench/head-to-head/results/round6-dev-gate-2026-10-23/dev-gate/iter*/runs/*/ours/*/trace.json` and `final.txt`:

1. **ho2 iter 3 run 3**: the agent never called the Skill tool and never ran the linter (its own final message: "No ejecuté `ai-slop-linter` sobre el resultado"). It read `notas.md`, read an unrelated user skill, and wrote the file. Every other lost ours cell in the gate ran the skill and the CLI. So this loss is a no-skill run: neither the hedge check in `--verify` nor the rewrite rules were in play.
2. **ho4 iter 3 run 2**: clean text. The agent invoked the skill, the lint found 0 problems, and it still merged two sentences ("..., de drie overige vestigingen volgen...") for rhythm. Its own message says it first added `We hebben` and reverted that. Our rule for clean text says no edit is expected, but nothing in the skill says that a sentence join is an edit. The same merge was the blader loss in round 5 (3 of 3 runs) and blader-inv's (1 of 3 runs), so this is a failure class that the rival shares and we reduce but do not remove.
3. **ho3 iter 1 run 1 and iter 2 run 3**: a label or person change during a sentence rebuild (`limite de 80` to `cujo limite é 80`, `fizemos`). Round 6 added a label and person rule and a `--compare` Portuguese person check; the cells after it lost a different criterion.
4. **ho3 iter 2 run 2**: after rebuilding, `em um cenário de` stayed in the new sentence. The rewrite was split correctly, the stock phrase that opened the relative clause survived. A read-back of the rebuilt sentence against the recall list is the blader step 4 idea (`:38`); our skill has the list but does not require a read-back of the sentence it just wrote.

Measured on these five cells: 1 of 5 is "skill not used", 1 of 5 is "clean text edited", 3 of 5 are "rewritten sentence still carries a tell, a changed label or an added person".

## 3. Side by side (cells we lose)

### ho3, blader-inv 5.00 vs ours (iter 1 to 3)

The fixture sentence is one long sentence: a vague-link hedge (`parece estar relacionada a`), a stacked relative clause, a stock scenario opener and a parenthetical limit (`(limite de 80)`).

- blader-inv (all 3 runs, round 5): the sentence is split into two; the hedge verb stays at its degree (`parece ser`), the vague link and the scenario opener are gone, the number stays next to its label (`que tem limite de 80`). Rule that produced it: blader step 3 may split and restructure (`:37`), step 4 read-back (`:38`), §14 (`:226-232`) and §1 line 61 (patterns hold in every language).
- ours iter 2 run 2: `A causa raiz parece ser uma migração ..., que, em um cenário de alto tráfego, sobrecarregou o pool de conexões (limite de 80).` The vague link is gone and the hedge degree is kept (round 6 D2, D3 worked), but `em um cenário de` remained. blader-inv removed it because its step 4 asks "what still sounds AI-generated" about the finished text; our skill asks that only about the original text (`SKILL.md` step order: lint, rewrite, `--verify`; `--verify` has no Portuguese scenario-opener entry).
- ours iter 1 run 1: label changed. blader-inv kept the label because its step 4 asks whether any fact or number was added or dropped (`:38`); our `--compare` reports number loss but the label is not a number.

### ho2, blader-inv 5.00 vs ours iter 3 4.67

In 2 of 3 round 5 blader runs and all unslop runs the modal hedge stayed; blader-inv (invoked) changed it in 3 of 3. Our iter 1 to 3 changed it in 8 of 9 runs; the ninth is the no-skill run above. No rule gap remains on this cell; the gap is skill use.

### ho4 (clean text), blader-inv 4.33 vs ours iter 3 4.67

blader-inv lost points in 1 of 3 runs (merge plus added `we`). Ours lost in 1 of 3 (merge). Ours round 5 and iterations 1 and 2 were 5.00. The loss is a joined sentence. Rule that would have prevented it: none in the rivals (blader `:383-393` "when not to act" covers quotations and dated text, not clean text); in ours the clean-text path says "no edit is expected" without defining an edit as any byte change outside a finding.

## 4. Technique map (changes to the round 6 map)

| Rival technique | In ours now | General or task-specific | Licence | Decision |
|---|---|---|---|---|
| blader step 4 read-back of the finished text for tells, added or dropped facts, numbers (`:38`) | partial: round 6 D4 recall list applies to the draft before the rewrite; `--verify` after | general | MIT (idea) | adopt: a required read-back of every rebuilt sentence against the recall list and against the original's labels, after `--verify` is clean, before the final message |
| blader step 3 permission to split, merge and restructure (`:37`) | yes, D3 (round 6), only for sentences that hold a finding | general | MIT (idea) | keep as is; add the opposite limit for clean text (below) |
| blader §9 qualifier kept only when the source supports it (`:169-177`); unslop rule 19 keeps load-bearing hedges (`:234`) | D2 split scope hedge / effect hedge, English wording | general | MIT | adapt: state the support test as an explicit rule (source names a concrete reason for the uncertainty: keep; no reason named: remove or soften to the plain form); the test is the same in every language |
| blader §1 line 61 structural patterns hold in every language | D1 | general | MIT | keep; extend the deterministic checks from lexicon-by-language to grammatical classes (conditional or modal marker, appearance verb, vague-link participle) with morphological cues |
| unslop context profile table | partial | general | MIT | keep |
| blader "When not to act" (`:383-393`) | clean-text path in `--verify` and SKILL.md | general | MIT | adapt: define "edit" for clean text as any byte changed outside a finding, and forbid joins, splits and reorders there |
| (none: no rival checks sentence length or clause count) | no | general | n/a | build: language-independent chained-sentence detector (length, comma and conjunction count) as a `--verify` hint, so the D3 split permission has a trigger |
| (none: rivals have no way to make sure the skill runs) | description text; hook line | structural | n/a | build: shorten the skill description's trigger and put the first instruction (run the CLI, invoke the checks) in the first lines; no claim that this prevents no-skill runs |

Rejected as before: passive-voice detection, embedded-mode output rules, literal phrases from ho1 to ho5 as catalog entries or fixtures.

## 5. Second-best arm (unslop and unslop-inv)

Round 6 steps 2 and 4 still apply. unslop ties us on ho2 (4.00 all runs in round 5, where ours now passes) and beats ours on ho3 only in the round 5 data (5.00 against 4.33; round 6 ours reaches 5.00 in iteration 3). No new unslop-specific gap found. The read-back and clean-text-edit decisions above do not conflict with unslop rule 19 (they keep or soften hedges, they do not delete scope or safety hedges).

## Decisions carried into the round 7 frozen design

E1 explicit hedge-support test in SKILL.md (same in every language); E2 grammatical-class detection of modal or conditional hedges next to an effect predicate, appearance-verb hedges and vague-link predicates in en, es, pt, de, fr, nl, tr, with morphological cues, in `--verify`; E3 language-independent chained-sentence hint; E4 required read-back after `--verify` (rebuilt sentences: tells, labels, numbers, persons); E5 clean-text rule: no joins, splits or reorders, every byte outside a finding stays; E6 the skill's first lines tell the agent to run the CLI before anything else. The frozen text is in `docs/HEAD-TO-HEAD.md`, section "Round 7 design (frozen before code)".
