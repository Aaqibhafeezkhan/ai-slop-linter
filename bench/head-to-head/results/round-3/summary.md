Round 3, ours arm only (12 tasks x 3 runs, claude-sonnet-5-5, 2026-10-22), rival and baseline cells reused from round 2 under the protocol frozen in commit d844833. Not a general ranking.

| Task | ours (r3) | blader (r2 reused) | blader-inv (r2 reused) | unslop (r2 reused) | unslop-inv (r2 reused) | everwrite (r2 reused) | everwrite-inv (r2 reused) | base (r2 reused) | Rule B |
|---|---|---|---|---|---|---|---|---|---|
| h1 | 4.67 | 3.00 | 5.00 | 4.00 | 4.00 | 5.00 | 3.33 | 3.00 | FAIL |
| h2 | 4.33 | 4.33 | 5.00 | 5.00 | 5.00 | 4.33 | 4.33 | 3.00 | FAIL |
| h3 | 5.00 | 5.00 | 5.00 | 4.00 | 4.00 | 5.00 | 5.00 | 3.67 | pass |
| h9 | 4.00 | 4.00 | 4.00 | 4.00 | 4.00 | 4.33 | 4.00 | 4.00 | FAIL |
| h10 | 5.00 | 4.00 | 4.67 | 5.00 | 5.00 | 4.00 | 4.67 | 2.33 | pass |
| h11 | 5.00 | 5.00 | 5.00 | 4.00 | 4.00 | 5.00 | 5.00 | 4.00 | pass |
| h13 | 5.00 | 4.33 | 4.33 | 3.33 | 4.00 | 4.33 | 4.67 | 3.00 | pass |
| h14 | 4.67 | 5.00 | 4.33 | 4.67 | 4.00 | 5.00 | 5.00 | 4.33 | FAIL |
| h15 | 5.00 | 5.00 | 5.00 | 5.00 | 5.00 | 4.00 | 4.00 | 5.00 | pass |
| h16 | 5.00 | 5.00 | 5.00 | 5.00 | 4.67 | 5.00 | 5.00 | 5.00 | pass |
| h17 | 4.00 | 3.67 | 4.00 | 4.33 | 4.00 | 4.00 | 4.00 | 3.67 | FAIL |
| h18 | 4.00 | 4.00 | 4.67 | 4.00 | 4.00 | 4.33 | 4.33 | 3.00 | FAIL |

Totals of 60: ours 55.67; blader 52.33; blader-inv 56.00; unslop 52.33; unslop-inv 51.67; everwrite 54.32; everwrite-inv 53.33; base 44.00.
Rule A: ours lost 4.33, best other lost 4.00, limit 3.20: FAIL.
Rule B: 6 of 12 pass; failing: h1 (ours 4.67 vs best other 5.00); h2 (ours 4.33 vs best other 5.00); h9 (ours 4.00 vs best other 4.33); h14 (ours 4.67 vs best other 5.00); h17 (ours 4.00 vs best other 4.33); h18 (ours 4.00 vs best other 4.67).

Ours per run (OUTCOME points):
OUTCOME per run (runs in iteration order, mean, min-max, n)
| Task | Arm | Runs | Mean | Min-max | n |
|---|---|---|---|---|---|
| h1 | ours | 5,4,5 | 4.67 | 4-5 | 3 |
| h2 | ours | 5,3,5 | 4.33 | 3-5 | 3 |
| h3 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h9 | ours | 4,4,4 | 4.00 | 4-4 | 3 |
| h10 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h13 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h14 | ours | 5,4,5 | 4.67 | 4-5 | 3 |
| h15 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h17 | ours | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | ours | 4,4,4 | 4.00 | 4-4 | 3 |

