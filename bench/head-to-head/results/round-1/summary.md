Scope: these 12 tasks, model claude-sonnet-5-5, 3 runs per cell, 2026-10-22; not a general ranking.
Code under test: commit 196817d69d5cdefa7dff13348fc08d185bbb32d8, tree 0f3ff9831aeb316e74ec88d87363dba2425167ea, git archive copy; probes 5 of 5 passed.
  PASS version: cli --version 0.1.10 equals package.json at 196817d69d5cdefa7dff13348fc08d185bbb32d8
  PASS compare: --help mentions --compare
  PASS language: French sample with --language auto: language fr, 0 dash findings
  PASS dash: English line with an em dash: 1 dash finding(s)
  PASS skill: skills/ai-slop-linter/SKILL.md is byte-identical to the one at 196817d69d5cdefa7dff13348fc08d185bbb32d8

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

OUTCOME per run (runs in iteration order, mean, min-max, n)
| Task | Arm | Runs | Mean | Min-max | n |
|---|---|---|---|---|---|
| h1 | ours | 4,5,4 | 4.33 | 4-5 | 3 |
| h1 | blader | 3,4,4 | 3.67 | 3-4 | 3 |
| h1 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h1 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h1 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h1 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h1 | everwrite-inv | 3,5,3 | 3.67 | 3-5 | 3 |
| h1 | base | 4,4,3 | 3.67 | 3-4 | 3 |
| h2 | ours | 5,3,3 | 3.67 | 3-5 | 3 |
| h2 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | base | 5,5,3 | 4.33 | 3-5 | 3 |
| h3 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | unslop | 3,4,4 | 3.67 | 3-4 | 3 |
| h3 | unslop-inv | 4,4,3 | 3.67 | 3-4 | 3 |
| h3 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | base | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | ours | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | blader | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | blader-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | unslop | 4,4,5 | 4.33 | 4-5 | 3 |
| h9 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | everwrite | 4,3,4 | 3.67 | 3-4 | 3 |
| h9 | everwrite-inv | 5,5,3 | 4.33 | 3-5 | 3 |
| h9 | base | 4,5,5 | 4.67 | 4-5 | 3 |
| h10 | ours | 4,5,5 | 4.67 | 4-5 | 3 |
| h10 | blader | 5,5,4 | 4.67 | 4-5 | 3 |
| h10 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | everwrite | 4,4,5 | 4.33 | 4-5 | 3 |
| h10 | everwrite-inv | 5,4,4 | 4.33 | 4-5 | 3 |
| h10 | base | 4,2,4 | 3.33 | 2-4 | 3 |
| h11 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h11 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h11 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | base | 4,4,4 | 4.00 | 4-4 | 3 |
| h13 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h13 | blader | 4,5,5 | 4.67 | 4-5 | 3 |
| h13 | blader-inv | 4,5,5 | 4.67 | 4-5 | 3 |
| h13 | unslop | 4,4,3 | 3.67 | 3-4 | 3 |
| h13 | unslop-inv | 4,3,4 | 3.67 | 3-4 | 3 |
| h13 | everwrite | 4,4,5 | 4.33 | 4-5 | 3 |
| h13 | everwrite-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h13 | base | 3,3,3 | 3.00 | 3-3 | 3 |
| h14 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h14 | blader | 5,5,4 | 4.67 | 4-5 | 3 |
| h14 | blader-inv | 4,5,4 | 4.33 | 4-5 | 3 |
| h14 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h14 | unslop-inv | 4,3,4 | 3.67 | 3-4 | 3 |
| h14 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h14 | everwrite-inv | 5,4,4 | 4.33 | 4-5 | 3 |
| h14 | base | 5,5,4 | 4.67 | 4-5 | 3 |
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
| h16 | unslop | 5,4,5 | 4.67 | 4-5 | 3 |
| h16 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | base | 5,5,5 | 5.00 | 5-5 | 3 |
| h17 | ours | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | blader | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | blader-inv | 4,3,4 | 3.67 | 3-4 | 3 |
| h17 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | unslop-inv | 5,4,4 | 4.33 | 4-5 | 3 |
| h17 | everwrite | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | everwrite-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | base | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | ours | 3,4,4 | 3.67 | 3-4 | 3 |
| h18 | blader | 4,4,5 | 4.33 | 4-5 | 3 |
| h18 | blader-inv | 4,5,5 | 4.67 | 4-5 | 3 |
| h18 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | everwrite | 4,5,4 | 4.33 | 4-5 | 3 |
| h18 | everwrite-inv | 5,5,4 | 4.67 | 4-5 | 3 |
| h18 | base | 3,3,4 | 3.33 | 3-4 | 3 |

FULL table (mean points per task, all criteria; of 60)
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

Better arm per competitor (informational, higher OUTCOME total): blader=blader-inv, unslop=unslop, everwrite=everwrite
Leak-flagged runs: 0 (0 not reviewed, 0 confirmed)
Total (OUTCOME): ours 54.33 vs strongest other arm 56.33 (ratio 0.964, needs 1.20)
Win rule: FAIL
Failing tasks: h1, h2, h3, h9, h10, h11, h14, h15, h16, h17, h18

PROCESS column (not in the win rule): runs whose transcript ran a deterministic check, and criteria labelled process
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
