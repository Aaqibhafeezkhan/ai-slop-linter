# Round 7 development gate (seen round 5 set ho1 to ho5), 2026-10-23

Development gate, not a benchmark result: ho1 to ho5 are seen, are never scored in a gate, and these numbers never enter a score table. Rule B without ties except at the ceiling, against the recorded round 5 blader-inv means (blader-inv is not re-run). Frozen in `docs/HEAD-TO-HEAD.md`, section "Round 7 design", subsection "Development gate for round 7". Scope: 5 tasks, 3 runs each, `claude-sonnet-5-5`, Agent SDK path, 2026-10-23.

| Task | blader-inv (round 5) | ours round 5 (code 7cba348) | ours iter 1 | ours iter 2 |
|---|---|---|---|---|
| ho1 | 5.00 | 5.00 | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) |
| ho2 | 5.00 | 4.00 | 4.67 (5, 5, 4) | 5.00 (5, 5, 5) |
| ho3 | 5.00 | 4.33 | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) |
| ho4 | 4.33 | 5.00 | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) |
| ho5 | 5.00 | 5.00 | 5.00 (5, 5, 5) | 5.00 (5, 5, 5) |
| total of 25 | 24.33 | 23.33 | 24.67 | 25.00 |

## Per task: mean, min, max, valid runs (ours, last iteration; blader-inv round 5)

| Task | ours mean | ours min | ours max | ours runs | blader-inv mean | blader-inv min | blader-inv max | blader-inv runs |
|---|---|---|---|---|---|---|---|---|
| ho1 | 5.00 | 5 | 5 | 3 | 5.00 | 5 | 5 | 3 |
| ho2 | 5.00 | 5 | 5 | 3 | 5.00 | 5 | 5 | 3 |
| ho3 | 5.00 | 5 | 5 | 3 | 5.00 | 5 | 5 | 3 |
| ho4 | 5.00 | 5 | 5 | 3 | 4.33 | 3 | 5 | 3 |
| ho5 | 5.00 | 5 | 5 | 3 | 5.00 | 5 | 5 | 3 |

No cell was dropped or re-run in either iteration (15 valid cells each).

## Gate per iteration (pass: on every task ours strictly above blader-inv, or both at 5.00)

- iter1 ho1: ours 5.00, blader-inv 5.00: PASS
- iter1 ho2: ours 4.67, blader-inv 5.00: FAIL
- iter1 ho3: ours 5.00, blader-inv 5.00: PASS
- iter1 ho4: ours 5.00, blader-inv 4.33: PASS
- iter1 ho5: ours 5.00, blader-inv 5.00: PASS
- iter1: **FAIL** (4 of 5 tasks)

- iter2 ho1: ours 5.00, blader-inv 5.00: PASS
- iter2 ho2: ours 5.00, blader-inv 5.00: PASS
- iter2 ho3: ours 5.00, blader-inv 5.00: PASS
- iter2 ho4: ours 5.00, blader-inv 4.33: PASS
- iter2 ho5: ours 5.00, blader-inv 5.00: PASS
- iter2: **PASS** (5 of 5 tasks)

## Cells with a lost point (scorer detail)

- iter1 ho2 run 3: 4; missing fact: 4,8 segundos

## Uncertainty (95% bootstrap interval, 10000 resamples over runs, seed 20261023)

- iter1: ours minus blader-inv, total of 25: mean +0.33, interval [-0.67, +1.67]; the interval includes zero
- iter2: ours minus blader-inv, total of 25: mean +0.67, interval [+0.00, +2.00]; the interval includes zero

The blader-inv side is the recorded round 5 run (3 runs per task), not a new measurement; the grader is a script, so there are no grader votes (no model grading in the gate).

## Cost (US dollars, `total_cost_usd` of every call in `runs/*/*/*/cost.json`)

- iter1: 15 cells, 1.26 total, 0.084 per cell
- iter2: 15 cells, 1.26 total, 0.084 per cell
- both iterations: 2.52
- Other round 7 spending is in the report (held-out writer, implementer, reviewer); the cell costs here are the only ones `score.py` can recompute.
- Paid by the organization API key of the shim (name only, no key); every call reports apiKeySource ANTHROPIC_API_KEY.
