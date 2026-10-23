# Cost per arm (total_cost_usd of the final result event of each cell, list-price estimate; the subscription is what is charged)

| set | arm | cells | cost | mean cost per cell | input tokens | output tokens | turns | wall time (min) |
|---|---|---|---|---|---|---|---|---|
| g | avoid-ai-writing | 18 | 5.12 | 0.284 | 216 | 59444 | 167 | 9.9 |
| g | base | 18 | 0.82 | 0.046 | 108 | 20207 | 56 | 3.6 |
| g | blader | 18 | 1.71 | 0.095 | 144 | 25796 | 90 | 4.7 |
| g | blader-inv | 18 | 1.71 | 0.095 | 112 | 21731 | 58 | 4.3 |
| g | everwrite | 18 | 1.51 | 0.084 | 178 | 31215 | 129 | 5.6 |
| g | everwrite-inv | 18 | 1.59 | 0.088 | 188 | 33031 | 143 | 5.7 |
| g | ours | 18 | 2.01 | 0.111 | 184 | 37763 | 121 | 7.3 |
| g | slop-cop | 18 | 1.52 | 0.085 | 158 | 33651 | 103 | 6.3 |
| g | slopless | 18 | 0.92 | 0.051 | 128 | 24557 | 74 | 4.1 |
| g | unslop | 18 | 2.39 | 0.133 | 142 | 39860 | 116 | 5.8 |
| g | unslop-inv | 18 | 2.42 | 0.135 | 142 | 42035 | 118 | 6.1 |
| public | avoid-ai-writing | 36 | 9.62 | 0.267 | 426 | 137658 | 294 | 24.5 |
| public | base | 36 | 1.85 | 0.051 | 242 | 49147 | 122 | 10.3 |
| public | blader | 36 | 3.30 | 0.092 | 300 | 64100 | 181 | 12.1 |
| public | blader-inv | 36 | 3.67 | 0.102 | 242 | 63544 | 127 | 10.8 |
| public | everwrite | 36 | 3.41 | 0.095 | 382 | 83315 | 272 | 14.1 |
| public | everwrite-inv | 36 | 3.45 | 0.096 | 394 | 79001 | 282 | 14.4 |
| public | ours | 36 | 4.50 | 0.125 | 430 | 99529 | 288 | 18.0 |
| public | slop-cop | 36 | 3.53 | 0.098 | 382 | 83443 | 246 | 14.7 |
| public | slopless | 36 | 1.98 | 0.055 | 292 | 53819 | 165 | 12.9 |
| public | unslop | 36 | 4.84 | 0.135 | 300 | 89118 | 198 | 14.5 |
| public | unslop-inv | 36 | 5.14 | 0.143 | 312 | 94284 | 210 | 14.4 |

ours/base cost ratio: public 2.43; g 2.43
