Scope: these 12 tasks, model claude-sonnet-5-5, 3 runs per cell, 2026-10-23; not a general ranking.
Code under test: commit d767c0710ca14ff36db634d3bdc43dd9ccfe60ba, tree c715344f895982d81243d156f01ed53c3175e1c4, git archive copy; probes 5 of 5 passed.
  PASS version: cli --version 0.1.10 equals package.json at d767c0710ca14ff36db634d3bdc43dd9ccfe60ba
  PASS compare: --help mentions --compare
  PASS language: French sample with --language auto: language fr, 0 dash findings
  PASS dash: English line with an em dash: 1 dash finding(s)
  PASS skill: skills/ai-slop-linter/SKILL.md is byte-identical to the one at d767c0710ca14ff36db634d3bdc43dd9ccfe60ba

Retired tasks (not in the totals or the win rule):
- h4 (replaced by h13): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.
- h5 (replaced by h14): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.
- h6 (replaced by h15): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.
- h7 (replaced by h16): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.
- h8 (replaced by h16): Duplicated by h16: the h16 before text is the whole Humanizer Full example (six paragraphs), and the h8 before text is its first five paragraphs, so h8 counted one competitor example twice.
- h12 (replaced by h18): Saturated: every arm, the no-plugin baseline included, reached full or near full marks on the scripted criteria.

OUTCOME table (mean points per task, only criteria labelled outcome; of 60)
| Task | ours | blader | blader-inv | unslop | unslop-inv | everwrite | everwrite-inv | avoid-ai-writing | avoid-ai-writing-inv | slopless | slopless-inv | slop-cop | slop-cop-inv | base |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| h1 | 5.00 (100%) | 4.33 (87%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 3.33 (67%) | 4.33 (87%) | - | 5.00 (100%) | - | 4.67 (93%) | - | 4.67 (93%) |
| h2 | 5.00 (100%) | 3.67 (73%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | - | 5.00 (100%) | - | 5.00 (100%) | - | 4.33 (87%) |
| h3 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | - | 4.00 (80%) | - | 5.00 (100%) | - | 4.00 (80%) |
| h9 | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 3.67 (73%) | 4.00 (80%) | 4.00 (80%) | - | 4.33 (87%) | - | 3.67 (73%) | - | 4.00 (80%) |
| h10 | 5.00 (100%) | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) | 4.33 (87%) | 4.67 (93%) | - | 4.00 (80%) | - | 4.33 (87%) | - | 3.67 (73%) |
| h11 | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | - | 4.00 (80%) | - | 5.00 (100%) | - | 4.00 (80%) |
| h13 | 5.00 (100%) | 4.67 (93%) | 4.00 (80%) | 3.33 (67%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 3.33 (67%) | - | 3.00 (60%) | - | 3.33 (67%) | - | 3.00 (60%) |
| h14 | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) | 3.67 (73%) | 4.00 (80%) | 4.67 (93%) | 5.00 (100%) | 3.67 (73%) | - | 4.00 (80%) | - | 4.00 (80%) | - | 4.00 (80%) |
| h15 | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | - | 4.67 (93%) | - | 1.00 (20%) | - | 5.00 (100%) |
| h16 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) | - | 5.00 (100%) | - | 5.00 (100%) | - | 5.00 (100%) |
| h17 | 4.67 (93%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 3.67 (73%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | - | 4.33 (87%) | - | 4.33 (87%) | - | 4.00 (80%) |
| h18 | 4.67 (93%) | 4.33 (87%) | 4.67 (93%) | 4.00 (80%) | 4.00 (80%) | 3.67 (73%) | 4.67 (93%) | 4.00 (80%) | - | 3.33 (67%) | - | 3.67 (73%) | - | 3.00 (60%) |
| **Mean total (of 60)** | 58.67 | 54.67 | 56.00 | 51.00 | 51.67 | 53.33 | 54.33 | 50.33 | - | 50.67 | - | 49.00 | - | 48.67 |
| **Percent** | 97.8% | 91.1% | 93.3% | 85.0% | 86.1% | 88.9% | 90.6% | 83.9% | - | 84.4% | - | 81.7% | - | 81.1% |
| **n per cell** | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 0 | 3 | 0 | 3 | 0 | 3 |

OUTCOME per run (runs in iteration order, mean, min-max, n)
| Task | Arm | Runs | Mean | Min-max | n |
|---|---|---|---|---|---|
| h1 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h1 | blader | 5,4,4 | 4.33 | 4-5 | 3 |
| h1 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h1 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h1 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h1 | everwrite | 4,4,4 | 4.00 | 4-4 | 3 |
| h1 | everwrite-inv | 2,3,5 | 3.33 | 2-5 | 3 |
| h1 | avoid-ai-writing | 4,4,5 | 4.33 | 4-5 | 3 |
| h1 | slopless | 5,5,5 | 5.00 | 5-5 | 3 |
| h1 | slop-cop | 5,5,4 | 4.67 | 4-5 | 3 |
| h1 | base | 5,4,5 | 4.67 | 4-5 | 3 |
| h2 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | blader | 5,3,3 | 3.67 | 3-5 | 3 |
| h2 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | avoid-ai-writing | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | slopless | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | slop-cop | 5,5,5 | 5.00 | 5-5 | 3 |
| h2 | base | 3,5,5 | 4.33 | 3-5 | 3 |
| h3 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h3 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h3 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | avoid-ai-writing | 4,4,4 | 4.00 | 4-4 | 3 |
| h3 | slopless | 4,4,4 | 4.00 | 4-4 | 3 |
| h3 | slop-cop | 5,5,5 | 5.00 | 5-5 | 3 |
| h3 | base | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h9 | blader | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | blader-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | everwrite | 4,4,3 | 3.67 | 3-4 | 3 |
| h9 | everwrite-inv | 3,4,5 | 4.00 | 3-5 | 3 |
| h9 | avoid-ai-writing | 4,4,4 | 4.00 | 4-4 | 3 |
| h9 | slopless | 5,3,5 | 4.33 | 3-5 | 3 |
| h9 | slop-cop | 3,4,4 | 3.67 | 3-4 | 3 |
| h9 | base | 4,4,4 | 4.00 | 4-4 | 3 |
| h10 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | blader | 4,5,5 | 4.67 | 4-5 | 3 |
| h10 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h10 | everwrite | 5,4,4 | 4.33 | 4-5 | 3 |
| h10 | everwrite-inv | 4,4,5 | 4.33 | 4-5 | 3 |
| h10 | avoid-ai-writing | 4,5,5 | 4.67 | 4-5 | 3 |
| h10 | slopless | 4,4,4 | 4.00 | 4-4 | 3 |
| h10 | slop-cop | 5,4,4 | 4.33 | 4-5 | 3 |
| h10 | base | 3,4,4 | 3.67 | 3-4 | 3 |
| h11 | ours | 5,5,4 | 4.67 | 4-5 | 3 |
| h11 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h11 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h11 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | avoid-ai-writing | 4,4,4 | 4.00 | 4-4 | 3 |
| h11 | slopless | 4,4,4 | 4.00 | 4-4 | 3 |
| h11 | slop-cop | 5,5,5 | 5.00 | 5-5 | 3 |
| h11 | base | 4,4,4 | 4.00 | 4-4 | 3 |
| h13 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h13 | blader | 5,5,4 | 4.67 | 4-5 | 3 |
| h13 | blader-inv | 3,4,5 | 4.00 | 3-5 | 3 |
| h13 | unslop | 4,3,3 | 3.33 | 3-4 | 3 |
| h13 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h13 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h13 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h13 | avoid-ai-writing | 3,3,4 | 3.33 | 3-4 | 3 |
| h13 | slopless | 3,3,3 | 3.00 | 3-3 | 3 |
| h13 | slop-cop | 4,3,3 | 3.33 | 3-4 | 3 |
| h13 | base | 3,3,3 | 3.00 | 3-3 | 3 |
| h14 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h14 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h14 | blader-inv | 4,4,5 | 4.33 | 4-5 | 3 |
| h14 | unslop | 4,4,3 | 3.67 | 3-4 | 3 |
| h14 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h14 | everwrite | 4,5,5 | 4.67 | 4-5 | 3 |
| h14 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h14 | avoid-ai-writing | 3,4,4 | 3.67 | 3-4 | 3 |
| h14 | slopless | 4,4,4 | 4.00 | 4-4 | 3 |
| h14 | slop-cop | 4,4,4 | 4.00 | 4-4 | 3 |
| h14 | base | 3,4,5 | 4.00 | 3-5 | 3 |
| h15 | ours | 4,5,5 | 4.67 | 4-5 | 3 |
| h15 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | everwrite | 4,4,4 | 4.00 | 4-4 | 3 |
| h15 | everwrite-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h15 | avoid-ai-writing | 5,5,5 | 5.00 | 5-5 | 3 |
| h15 | slopless | 5,5,4 | 4.67 | 4-5 | 3 |
| h15 | slop-cop | 1,1,1 | 1.00 | 1-1 | 3 |
| h15 | base | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | ours | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | blader | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | blader-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | unslop | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | unslop-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | everwrite | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | everwrite-inv | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | avoid-ai-writing | 4,4,5 | 4.33 | 4-5 | 3 |
| h16 | slopless | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | slop-cop | 5,5,5 | 5.00 | 5-5 | 3 |
| h16 | base | 5,5,5 | 5.00 | 5-5 | 3 |
| h17 | ours | 4,5,5 | 4.67 | 4-5 | 3 |
| h17 | blader | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | blader-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | unslop-inv | 3,5,3 | 3.67 | 3-5 | 3 |
| h17 | everwrite | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | everwrite-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | avoid-ai-writing | 4,4,4 | 4.00 | 4-4 | 3 |
| h17 | slopless | 4,5,4 | 4.33 | 4-5 | 3 |
| h17 | slop-cop | 4,5,4 | 4.33 | 4-5 | 3 |
| h17 | base | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | ours | 5,5,4 | 4.67 | 4-5 | 3 |
| h18 | blader | 4,4,5 | 4.33 | 4-5 | 3 |
| h18 | blader-inv | 4,5,5 | 4.67 | 4-5 | 3 |
| h18 | unslop | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | unslop-inv | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | everwrite | 5,3,3 | 3.67 | 3-5 | 3 |
| h18 | everwrite-inv | 4,5,5 | 4.67 | 4-5 | 3 |
| h18 | avoid-ai-writing | 4,4,4 | 4.00 | 4-4 | 3 |
| h18 | slopless | 4,3,3 | 3.33 | 3-4 | 3 |
| h18 | slop-cop | 3,4,4 | 3.67 | 3-4 | 3 |
| h18 | base | 3,3,3 | 3.00 | 3-3 | 3 |

FULL table (mean points per task, all criteria; of 60)
| Task | ours | blader | blader-inv | unslop | unslop-inv | everwrite | everwrite-inv | avoid-ai-writing | avoid-ai-writing-inv | slopless | slopless-inv | slop-cop | slop-cop-inv | base |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| h1 | 5.00 (100%) | 4.33 (87%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 3.33 (67%) | 4.33 (87%) | - | 5.00 (100%) | - | 4.67 (93%) | - | 4.67 (93%) |
| h2 | 5.00 (100%) | 3.67 (73%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | - | 5.00 (100%) | - | 5.00 (100%) | - | 4.33 (87%) |
| h3 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | - | 4.00 (80%) | - | 5.00 (100%) | - | 4.00 (80%) |
| h9 | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 3.67 (73%) | 4.00 (80%) | 4.00 (80%) | - | 4.33 (87%) | - | 3.67 (73%) | - | 4.00 (80%) |
| h10 | 5.00 (100%) | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) | 4.33 (87%) | 4.67 (93%) | - | 4.00 (80%) | - | 4.33 (87%) | - | 3.67 (73%) |
| h11 | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | - | 4.00 (80%) | - | 5.00 (100%) | - | 4.00 (80%) |
| h13 | 5.00 (100%) | 4.67 (93%) | 4.00 (80%) | 3.33 (67%) | 4.00 (80%) | 5.00 (100%) | 5.00 (100%) | 3.33 (67%) | - | 3.00 (60%) | - | 3.33 (67%) | - | 3.00 (60%) |
| h14 | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) | 3.67 (73%) | 4.00 (80%) | 4.67 (93%) | 5.00 (100%) | 3.67 (73%) | - | 4.00 (80%) | - | 4.00 (80%) | - | 4.00 (80%) |
| h15 | 4.67 (93%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.00 (80%) | 4.00 (80%) | 5.00 (100%) | - | 4.67 (93%) | - | 1.00 (20%) | - | 5.00 (100%) |
| h16 | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 5.00 (100%) | 4.33 (87%) | - | 5.00 (100%) | - | 5.00 (100%) | - | 5.00 (100%) |
| h17 | 4.67 (93%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | 3.67 (73%) | 4.00 (80%) | 4.00 (80%) | 4.00 (80%) | - | 4.33 (87%) | - | 4.33 (87%) | - | 4.00 (80%) |
| h18 | 4.67 (93%) | 4.33 (87%) | 4.67 (93%) | 4.00 (80%) | 4.00 (80%) | 3.67 (73%) | 4.67 (93%) | 4.00 (80%) | - | 3.33 (67%) | - | 3.67 (73%) | - | 3.00 (60%) |
| **Mean total (of 60)** | 58.67 | 54.67 | 56.00 | 51.00 | 51.67 | 53.33 | 54.33 | 50.33 | - | 50.67 | - | 49.00 | - | 48.67 |
| **Percent** | 97.8% | 91.1% | 93.3% | 85.0% | 86.1% | 88.9% | 90.6% | 83.9% | - | 84.4% | - | 81.7% | - | 81.1% |
| **n per cell** | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 3 | 0 | 3 | 0 | 3 | 0 | 3 |

Missing runs: 108 of 504 expected (n=3 per cell)
Better arm per competitor (informational, higher OUTCOME total): blader=blader-inv, unslop=unslop-inv, everwrite=everwrite-inv, avoid-ai-writing=avoid-ai-writing, slopless=slopless, slop-cop=slop-cop
Leak-flagged runs: 0 (0 not reviewed, 0 confirmed)
Total (OUTCOME, of 60): ours 58.67 vs strongest other arm blader-inv 56.00
Lost points: ours 1.33, strongest other arm 4.00; limit 0.8 x 4.00 = 3.20
Win rule: INCOMPLETE (arm avoid-ai-writing-inv has no runs; arm slopless-inv has no runs; arm slop-cop-inv has no runs)

PROCESS column (not in the win rule): runs whose transcript ran a deterministic check, and criteria labelled process
| Arm | Runs with a check | Runs | Process criteria mean |
|---|---|---|---|
| ours | 36 | 36 | none labelled |
| blader | 0 | 36 | none labelled |
| blader-inv | 1 | 36 | none labelled |
| unslop | 0 | 36 | none labelled |
| unslop-inv | 1 | 36 | none labelled |
| everwrite | 34 | 36 | none labelled |
| everwrite-inv | 35 | 36 | none labelled |
| avoid-ai-writing | 3 | 36 | none labelled |
| avoid-ai-writing-inv | 0 | 0 | none labelled |
| slopless | 0 | 36 | none labelled |
| slopless-inv | 0 | 0 | none labelled |
| slop-cop | 32 | 36 | none labelled |
| slop-cop-inv | 0 | 0 | none labelled |
| base | 1 | 36 | none labelled |
