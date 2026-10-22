# Round 5 held-out result, 2026-10-22

Scope: 5 held-out tasks (ho1 English PR description, ho2 Spanish release notes, ho3 Brazilian Portuguese incident note, ho4 Dutch status update (clean source), ho5 English README intro), 11 arms, 3 runs each (165 cells), model claude-sonnet-5-5, Claude Agent SDK path (CLI 2.1.308, no Artifact tool), 2026-10-22, macOS sandbox-exec write sandbox with scrubbed environment, parallelism 3, scored by the script heldout/score.mjs (5 points per run). Code under test: commit 5eb1a61 (product code of 7cba348). No cell is reused from an earlier round. The public tasks h1 to h18, Haiku and Opus (F9) and the independent re-grade (F6) were not run.

## Per-task mean score (maximum 5; run scores in brackets)

| Task | ours | blader | blader-inv | everwrite | everwrite-inv | unslop | unslop-inv | avoid-ai-writing | slopless | slop-cop | base |
|---|---|---|---|---|---|---|---|---|---|---|---|
| ho1 (en PR) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 4.33 (4, 5, 4) | 4.67 (4, 5, 5) | 5.00 (5, 5, 5) | 4.67 (5, 4, 5) | 5.00 (5, 5, 5) | 4.33 (4, 4, 5) | 4.00 (4, 4, 4) | 5.00 (5, 5, 5) |
| ho2 (es release notes) | 4.00 (4, 4, 4) | 4.00 (4, 4, 4) | 5.00 (5, 5, 5) | 3.00 (3, 3, 3) | 3.33 (3, 3, 4) | 4.00 (4, 4, 4) | 4.00 (4, 4, 4) | 4.00 (4, 4, 4) | 4.33 (4, 4, 5) | 4.00 (4, 4, 4) | 5.00 (5, 5, 5) |
| ho3 (pt-BR incident) | 4.33 (4, 5, 4) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 4.67 (5, 4, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 4.67 (5, 4, 5) | 4.67 (4, 5, 5) | 5.00 (5, 5, 5) | 4.67 (4, 5, 5) |
| ho4 (nl status, clean) | 5.00 (5, 5, 5) | 3.00 (3, 3, 3) | 4.33 (3, 5, 5) | 3.00 (3, 3, 3) | 2.33 (2, 3, 2) | 4.00 (4, 4, 4) | 4.33 (4, 5, 4) | 3.00 (3, 3, 3) | 2.33 (3, 1, 3) | 2.00 (1, 2, 3) | 2.00 (1, 2, 3) |
| ho5 (en README) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 4.00 (4, 4, 4) | 5.00 (5, 5, 5) |
| total of 25 | 23.33 | 22.00 | 24.33 | 20.00 | 20.33 | 23.00 | 23.00 | 21.67 | 20.67 | 19.00 | 21.67 |
| runs | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 | 15 |

## Rule B (per task, strictly above every rival; a rival at the maximum needs ours at the maximum)

- ho1: ours 5.00, best rival blader 5.00: PASS
- ho2: ours 4.00, best rival blader-inv 5.00: FAIL
- ho3: ours 4.33, best rival blader 5.00: FAIL
- ho4: ours 5.00, best rival blader-inv 4.33: PASS
- ho5: ours 5.00, best rival blader 5.00: PASS

Rule B: FAIL (3 of 5 tasks)

## Rule A (lost points of ours at most 0.8 times the lost points of the best rival)

Maximum 25. Ours lost 1.67. Best rival blader-inv lost 0.67. Limit 0.8 x 0.67 = 0.53.

Rule A: FAIL

## Verdict

Gate (held-out part): FAIL.

Scoped result sentence: on 5 held-out tasks written by an agent that saw no code, in 11 arms with 3 runs each on claude-sonnet-5-5 through the Agent SDK on 2026-10-22, the ours arm is NOT first on both rules (see the Rule A and Rule B lines above); no leadership claim follows from this round, and the public-task, F9 and F6 parts of the gate were not run.

## Cells with a lost point (scorer detail)

- ho1 everwrite run 1: 4; missing fact: exponential backoff
- ho1 everwrite run 3: 4; heading changed: ## Summary
- ho1 everwrite-inv run 1: 4; heading changed: ## Summary
- ho1 unslop-inv run 2: 4; tell left: —|–
- ho1 slopless run 1: 4; added word: we
- ho1 slopless run 2: 4; tell left: —|–
- ho1 slop-cop run 1: 4; missing fact: up to 5 times
- ho1 slop-cop run 2: 4; missing fact: up to 5 times
- ho1 slop-cop run 3: 4; missing fact: up to 5 times
- ho2 ours run 1: 4; tell left: podría reducir
- ho2 ours run 2: 4; tell left: podría reducir
- ho2 ours run 3: 4; tell left: podría reducir
- ho2 blader run 1: 4; tell left: podría reducir
- ho2 blader run 2: 4; missing fact: 4,8 segundos
- ho2 blader run 3: 4; tell left: podría reducir
- ho2 everwrite run 1: 3; missing fact: 4,8 segundos; tell left: podría reducir
- ho2 everwrite run 2: 3; missing fact: 4,8 segundos; tell left: podría reducir
- ho2 everwrite run 3: 3; missing fact: 4,8 segundos; tell left: podría reducir
- ho2 everwrite-inv run 1: 3; missing fact: 4,8 segundos; tell left: podría reducir
- ho2 everwrite-inv run 2: 3; missing fact: 4,8 segundos; tell left: podría reducir
- ho2 everwrite-inv run 3: 4; missing fact: 4,8 segundos
- ho2 unslop run 1: 4; tell left: podría reducir
- ho2 unslop run 2: 4; tell left: podría reducir
- ho2 unslop run 3: 4; tell left: podría reducir
- ho2 unslop-inv run 1: 4; tell left: podría reducir
- ho2 unslop-inv run 2: 4; tell left: podría reducir
- ho2 unslop-inv run 3: 4; tell left: podría reducir
- ho2 avoid-ai-writing run 1: 4; tell left: podría reducir
- ho2 avoid-ai-writing run 2: 4; tell left: podría reducir
- ho2 avoid-ai-writing run 3: 4; tell left: podría reducir
- ho2 slopless run 1: 4; missing fact: 4,8 segundos
- ho2 slopless run 2: 4; tell left: podría reducir
- ho2 slop-cop run 1: 4; tell left: podría reducir
- ho2 slop-cop run 2: 4; missing fact: 4,8 segundos
- ho2 slop-cop run 3: 4; tell left: podría reducir
- ho3 ours run 1: 4; tell left: parece estar relacionada
- ho3 ours run 3: 4; tell left: parece estar relacionada
- ho3 everwrite run 2: 4; added word: fizemos
- ho3 avoid-ai-writing run 2: 4; tell left: parece estar relacionada
- ho3 slopless run 1: 4; added word: fizemos
- ho3 base run 1: 4; added word: fizemos
- ho4 blader run 1: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 blader run 2: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 blader run 3: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 blader-inv run 1: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 everwrite run 1: 3; protected text changed: De migratie van de planningsapp naar Pos; added word: we
- ho4 everwrite run 2: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 everwrite run 3: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 everwrite-inv run 1: 2; protected text changed: De migratie van de planningsapp naar Pos; tell left: laten we; added word: we
- ho4 everwrite-inv run 2: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 everwrite-inv run 3: 2; missing fact: 37 dubbele klantrecords; protected text changed: De migratie van de planningsapp naar Pos; added word: we
- ho4 unslop run 1: 4; protected text changed: De migratie van de planningsapp naar Pos
- ho4 unslop run 2: 4; protected text changed: Daarmee zijn 37 dubbele klantrecords sam
- ho4 unslop run 3: 4; protected text changed: Jasper de Wit heeft de back-ups op de ni
- ho4 unslop-inv run 1: 4; protected text changed: Daarmee zijn 37 dubbele klantrecords sam
- ho4 unslop-inv run 3: 4; protected text changed: Daarmee zijn 37 dubbele klantrecords sam
- ho4 avoid-ai-writing run 1: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 avoid-ai-writing run 2: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 avoid-ai-writing run 3: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we
- ho4 slopless run 1: 3; protected text changed: De migratie van de planningsapp naar Pos; added word: we
- ho4 slopless run 2: 1; missing fact: 37 dubbele klantrecords; protected text changed: De migratie van de planningsapp naar Pos; tell left: laten we; added word: we
- ho4 slopless run 3: 3; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we; added word: ons
- ho4 slop-cop run 1: 1; protected text changed: De migratie van de planningsapp naar Pos; tell left: laten we; added word: we; added word: ons; heading changed: ## Wat is gedaan
- ho4 slop-cop run 2: 2; protected text changed: De klantendata van 12 van de 15 vestigin; added word: we; heading changed: ## Stand van zaken
- ho4 slop-cop run 3: 3; protected text changed: De migratie van de planningsapp naar Pos; added word: we
- ho4 base run 1: 1; missing fact: 37 dubbele klantrecords; protected text changed: De klantendata van 12 van de 15 vestigin; tell left: laten we; added word: we; added word: ons
- ho4 base run 2: 2; protected text changed: De migratie van de planningsapp naar Pos; added word: we; added word: ons; heading changed: ## Wat niet goed ging
- ho4 base run 3: 3; protected text changed: De migratie van de planningsapp naar Pos; added word: we
- ho5 slop-cop run 1: 4; url: https://tidyfeed.example.com/docs
- ho5 slop-cop run 2: 4; url: https://tidyfeed.example.com/docs
- ho5 slop-cop run 3: 4; url: https://tidyfeed.example.com/docs

## Departures from the frozen protocol

- Amendment A of the protocol (committed before any run beyond the first 15 cells) restored all 11 arms and 3 runs after the first 15 cells had run under the reduced plan; the first 15 cells stay in the set.
- One cell (ho4-unslop-inv-2) was killed by SIGTERM (not a rate limit), had no valid transcript, was re-run by the same command and only the valid run is scored.
- The three scan arms run as natural arms only (avoid-ai-writing, slopless, slop-cop), not as -inv arms, as stated in amendment A.
- Held-out has no blind grading, so the three-vote shuffled grading of the owner's plan was not used; every criterion is a script.

## Not run

- Public tasks h1 to h18 with ours and the new arms (Rule A and Rule B on the held-out set decide whether this phase starts; session budget also bound it).
- F9 (Haiku and Opus, 1 run per task) and F6 (independent 10 percent re-grade).
