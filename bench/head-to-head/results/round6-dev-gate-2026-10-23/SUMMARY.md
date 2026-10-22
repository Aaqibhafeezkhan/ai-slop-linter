# Round 6 development gate (seen round 5 set ho1 to ho5), 2026-10-23

Development gate, not a benchmark result: ho1 to ho5 are seen, are never scored in a gate, and these numbers never enter a score table. Rule B without ties except at the ceiling, against the recorded round 5 blader-inv means (blader-inv is not re-run). Frozen in `docs/HEAD-TO-HEAD.md`, section "Development gate".

| Task | blader-inv (round 5) | ours round 5 (code 7cba348) | ours iter 1 | ours iter 2 | ours iter 3 |
|---|---|---|---|---|---|
| ho1 | 5.00 | 5.00 | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) |
| ho2 | 5.00 | 4.00 | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 4.67 (5, 5, 4) |
| ho3 | 5.00 | 4.33 | 4.67 (4, 5, 5) | 4.33 (5, 4, 4) | 5.00 (5, 5, 5) |
| ho4 | 4.33 | 5.00 | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 4.67 (5, 4, 5) |
| ho5 | 5.00 | 5.00 | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) |
| total of 25 | 24.33 | 23.33 | 24.67 | 24.33 | 24.33 |

## Gate per iteration (pass: on every task ours strictly above blader-inv, or both at 5.00)

- iter1 ho1: ours 5.00, blader-inv 5.00: PASS
- iter1 ho2: ours 5.00, blader-inv 5.00: PASS
- iter1 ho3: ours 4.67, blader-inv 5.00: FAIL
- iter1 ho4: ours 5.00, blader-inv 4.33: PASS
- iter1 ho5: ours 5.00, blader-inv 5.00: PASS
- iter1: **FAIL** (4 of 5 tasks)

- iter2 ho1: ours 5.00, blader-inv 5.00: PASS
- iter2 ho2: ours 5.00, blader-inv 5.00: PASS
- iter2 ho3: ours 4.33, blader-inv 5.00: FAIL
- iter2 ho4: ours 5.00, blader-inv 4.33: PASS
- iter2 ho5: ours 5.00, blader-inv 5.00: PASS
- iter2: **FAIL** (4 of 5 tasks)

- iter3 ho1: ours 5.00, blader-inv 5.00: PASS
- iter3 ho2: ours 4.67, blader-inv 5.00: FAIL
- iter3 ho3: ours 5.00, blader-inv 5.00: PASS
- iter3 ho4: ours 4.67, blader-inv 4.33: PASS
- iter3 ho5: ours 5.00, blader-inv 5.00: PASS
- iter3: **FAIL** (4 of 5 tasks)

## Cells with a lost point (scorer detail)

- iter1 ho3 run 1: 4; missing fact: limite de 80
- iter2 ho3 run 2: 4; tell left: em um cenário de
- iter2 ho3 run 3: 4; added word: fizemos
- iter3 ho2 run 3: 4; tell left: podría reducir
- iter3 ho4 run 2: 4; protected text changed: De klantendata van 12 van de 15 vestigin
