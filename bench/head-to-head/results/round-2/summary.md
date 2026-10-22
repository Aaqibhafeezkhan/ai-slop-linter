Scope: these 12 tasks, model claude-sonnet-5-5, 3 runs per cell, 2026-10-22; not a general ranking.
Code under test: commit 8cfeb5ccf4b3e30eaa57ae017fe7b17484b49970, tree 6bb282b0f163b64a3de4161142f7478dcf24d1d2, git archive copy; probes 5 of 5 passed.
  PASS version: cli --version 0.1.10 equals package.json at 8cfeb5ccf4b3e30eaa57ae017fe7b17484b49970
  PASS compare: --help mentions --compare
  PASS language: French sample with --language auto: language fr, 0 dash findings
  PASS dash: English line with an em dash: 1 dash finding(s)
  PASS skill: skills/ai-slop-linter/SKILL.md is byte-identical to the one at 8cfeb5ccf4b3e30eaa57ae017fe7b17484b49970

Retired tasks (not in the totals or the win rule):
- h4 (replaced by h13): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.
- h5 (replaced by h14): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.
- h6 (replaced by h15): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.
- h7 (replaced by h16): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.
- h8 (replaced by h16): Duplicated by h16: the h16 before text is the whole Humanizer Full example (six paragraphs), and the h8 before text is its first five paragraphs, so h8 counted one competitor example twice.
- h12 (replaced by h18): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.

OUTCOME table (mean points per task, only criteria labelled outcome; of 60)
| Task | ours | blader | blader-inv | unslop | unslop-inv | everwrite | everwrite-inv | base |
|---|---|---|---|---|---|---|---|---|
| h1 | 5.00 (100%) | 3.00 (60%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 3.33 (67%) | 3.00 (60%) |
| h2 | 5.00 (100%) | 4.33 (87%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) | 4.33 (87%) | 3.00 (60%) |
| h3 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 3.67 (73%) |
| h9 | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 4.33 (87%) | 4.00 (80%) | 4.00 (80%) |
| h10 | 5.00 (100%) | 4.00 (80%) | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.67 (93%) | 2.33 (47%) |
| h11 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) |
| h13 | 5.00 (100%) | 4.33 (87%) | 4.33 (87%) | 3.33 (67%) | 4.00 (80%) | 4.33 (87%) | 4.67 (93%) | 3.00 (60%) |
| h14 | 4.67 (93%) | 5.00 (100%) | 4.33 (87%) | 4.67 (93%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) |
| h15 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) |
| h16 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) |
| h17 | 4.00 (80%) | 3.67 (73%) | 4.00 (80%) | 4.33 (87%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 3.67 (73%) |
| h18 | 4.00 (80%) | 4.00 (80%) | 4.67 (93%) | 4.00 (80%) | 4.00 (80%) | 4.33 (87%) | 4.33 (87%) | 3.00 (60%) |
| **Mean total (of 60)** | 56.67 | 52.33 | 56.00 | 52.33 | 51.67 | 54.33 | 53.33 | 44.00 |
| **Percent** | 94.4% | 87.2% | 93.3% | 87.2% | 86.1% | 90.6% | 88.9% | 73.3% |
| **n per cell** | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 |

OUTCOME per run (runs in iteration order, mean, min-max, n)
| Task | Arm | Runs | Mean | Min-max | n |
|---|---|---|---|---|---|
| h1 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h1 | blader | 2,2,5 | 3.00 | 2-5 | 3 |
| h1 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h1 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h1 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h1 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h1 | everwrite-inv | 3,3,4 | 3.33 | 3-4 | 3 |
| h1 | base | 4,3,2 | 3.00 | 2-4 | 3 |
| h2 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | blader | 3,5,5 | 4.33 | 3-5 | 3 |
| h2 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | everwrite | 5,5,3 | 4.33 | 3-5 | 3 |
| h2 | everwrite-inv | 3,5,5 | 4.33 | 3-5 | 3 |
| h2 | base | 3,3,3 | 3.00 | 3-3 | 3 |
| h3 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h3 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h3 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | base | 4,4,3 | 3.67 | 3-4 | 3 |
| h9 | ours | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | blader | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | blader-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | everwrite | 5,4,4 | 4.33 | 4-5 | 3 |
| h9 | everwrite-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | base | 4,4,4 | 4.00 | 4-4 | 3 |
| h10 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | blader | 4,4,4 | 4.00 | 4-4 | 3 |
| h10 | blader-inv | 4,5,5 | 4.67 | 4-5 | 3 |
| h10 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | everwrite | 4,4,4 | 4.00 | 4-4 | 3 |
| h10 | everwrite-inv | 5,5,4 | 4.67 | 4-5 | 3 |
| h10 | base | 3,3,1 | 2.33 | 1-3 | 3 |
| h11 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h11 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h11 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | base | 4,4,4 | 4.00 | 4-4 | 3 |
| h13 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h13 | blader | 4,5,4 | 4.33 | 4-5 | 3 |
| h13 | blader-inv | 5,4,4 | 4.33 | 4-5 | 3 |
| h13 | unslop | 4,3,3 | 3.33 | 3-4 | 3 |
| h13 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h13 | everwrite | 4,5,4 | 4.33 | 4-5 | 3 |
| h13 | everwrite-inv | 5,5,4 | 4.67 | 4-5 | 3 |
| h13 | base | 3,3,3 | 3.00 | 3-3 | 3 |
| h14 | ours | 4,5,5 | 4.67 | 4-5 | 3 |
| h14 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h14 | blader-inv | 4,5,4 | 4.33 | 4-5 | 3 |
| h14 | unslop | 4,5,5 | 4.67 | 4-5 | 3 |
| h14 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h14 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h14 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h14 | base | 4,5,4 | 4.33 | 4-5 | 3 |
| h15 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | everwrite | 4,4,4 | 4.00 | 4-4 | 3 |
| h15 | everwrite-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h15 | base | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | unslop-inv | 5,5,4 | 4.67 | 4-5 | 3 |
| h16 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | base | 5,5,5 | 5.00 | 5-5 | 3 |
| h17 | ours | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | blader | 4,4,3 | 3.67 | 3-4 | 3 |
| h17 | blader-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | unslop | 4,5,4 | 4.33 | 4-5 | 3 |
| h17 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | everwrite | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | everwrite-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | base | 4,3,4 | 3.67 | 3-4 | 3 |
| h18 | ours | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | blader | 5,3,4 | 4.00 | 3-5 | 3 |
| h18 | blader-inv | 4,5,5 | 4.67 | 4-5 | 3 |
| h18 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | everwrite | 4,4,5 | 4.33 | 4-5 | 3 |
| h18 | everwrite-inv | 4,4,5 | 4.33 | 4-5 | 3 |
| h18 | base | 3,3,3 | 3.00 | 3-3 | 3 |

FULL table (mean points per task, all criteria; of 60)
| Task | ours | blader | blader-inv | unslop | unslop-inv | everwrite | everwrite-inv | base |
|---|---|---|---|---|---|---|---|---|
| h1 | 5.00 (100%) | 3.00 (60%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 3.33 (67%) | 3.00 (60%) |
| h2 | 5.00 (100%) | 4.33 (87%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) | 4.33 (87%) | 3.00 (60%) |
| h3 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 3.67 (73%) |
| h9 | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 4.33 (87%) | 4.00 (80%) | 4.00 (80%) |
| h10 | 5.00 (100%) | 4.00 (80%) | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.67 (93%) | 2.33 (47%) |
| h11 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) |
| h13 | 5.00 (100%) | 4.33 (87%) | 4.33 (87%) | 3.33 (67%) | 4.00 (80%) | 4.33 (87%) | 4.67 (93%) | 3.00 (60%) |
| h14 | 4.67 (93%) | 5.00 (100%) | 4.33 (87%) | 4.67 (93%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) |
| h15 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) |
| h16 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) |
| h17 | 4.00 (80%) | 3.67 (73%) | 4.00 (80%) | 4.33 (87%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 3.67 (73%) |
| h18 | 4.00 (80%) | 4.00 (80%) | 4.67 (93%) | 4.00 (80%) | 4.00 (80%) | 4.33 (87%) | 4.33 (87%) | 3.00 (60%) |
| **Mean total (of 60)** | 56.67 | 52.33 | 56.00 | 52.33 | 51.67 | 54.33 | 53.33 | 44.00 |
| **Percent** | 94.4% | 87.2% | 93.3% | 87.2% | 86.1% | 90.6% | 88.9% | 73.3% |
| **n per cell** | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 |

Better arm per competitor (informational, higher OUTCOME total): blader=blader-inv, unslop=unslop, everwrite=everwrite
Leak-flagged runs: 0 (0 not reviewed, 0 confirmed)
Total (OUTCOME, of 60): ours 56.67 vs strongest other arm blader-inv 56.00
Lost points: ours 3.33, strongest other arm 4.00; limit 0.8 x 4.00 = 3.20
Rule A (lost points at most 0.8 x the strongest other arm's): FAIL (ours lost 3.33, limit 3.20)
Rule B (every task strictly above every other arm; a rival at the maximum needs ours at the maximum): FAIL (8 of 12 tasks pass)
Win rule: FAIL
Failing tasks: h9, h14, h17, h18
- h9: below rival everwrite (ours 4.00 vs 4.33, maximum 5.00)
- h14: rival at max, we are not: blader, everwrite, everwrite-inv at the maximum 5.00, ours 4.67
- h17: below rival unslop (ours 4.00 vs 4.33, maximum 5.00)
- h18: below rival blader-inv (ours 4.00 vs 4.67, maximum 5.00)

PROCESS column (not in the win rule): runs whose transcript ran a deterministic check, and criteria labelled process
| Arm | Runs with a check | Runs | Process criteria mean |
|---|---|---|---|
| ours | 36 | 36 | none labelled |
| blader | 1 | 36 | none labelled |
| blader-inv | 1 | 36 | none labelled |
| unslop | 0 | 36 | none labelled |
| unslop-inv | 1 | 36 | none labelled |
| everwrite | 35 | 36 | none labelled |
| everwrite-inv | 36 | 36 | none labelled |
| base | 0 | 36 | none labelled |
