#!/usr/bin/env python3
"""Recompute SUMMARY.md from dev-gate/iter*/grades/cells.jsonl, dev-gate/iter*/runs/*/*/*/cost.json and reference/.
No network, no model calls. usage: score.py <evidence dir>  (prints the full SUMMARY.md; the committed file equals this output byte for byte)"""
import json, os, re, sys, glob, random
ev = sys.argv[1]
def load(p):
    c = {}
    for line in open(p):
        r = json.loads(line); m = re.match(r"^(ho\d+)-(.+)-(\d+)$", r["cell"])
        if m: c.setdefault(m.group(1), {}).setdefault(m.group(2), []).append((int(m.group(3)), r["score"], r["detail"]))
    return c
mean = lambda xs: sum(xs) / len(xs)
ref = load(f"{ev}/reference/round5-ours-and-blader-inv-cells.jsonl")
tasks = sorted(ref)
bl = {t: mean([s for _, s, _ in ref[t]["blader-inv"]]) for t in tasks}
r5 = {t: mean([s for _, s, _ in ref[t]["ours"]]) for t in tasks}
iters = sorted(glob.glob(f"{ev}/dev-gate/iter*"))
its = {}
for d in iters:
    c = load(f"{d}/grades/cells.jsonl"); its[os.path.basename(d)] = {t: sorted(c[t]["ours"]) for t in tasks}
o = []; w = o.append
w("# Round 7 development gate (seen round 5 set ho1 to ho5), 2026-10-23\n")
w("Development gate, not a benchmark result: ho1 to ho5 are seen, are never scored in a gate, and these numbers never enter a score table. Rule B without ties except at the ceiling, against the recorded round 5 blader-inv means (blader-inv is not re-run). Frozen in `docs/HEAD-TO-HEAD.md`, section \"Round 7 design\", subsection \"Development gate for round 7\". Scope: 5 tasks, 3 runs each, `claude-sonnet-5-5`, Agent SDK path, 2026-10-23.\n")
w("| Task | blader-inv (round 5) | ours round 5 (code 7cba348) | " + " | ".join(f"ours iter {k[4:]}" for k in its) + " |")
w("|---|---|---|" + "---|" * len(its))
for t in tasks:
    w(f"| {t} | {bl[t]:.2f} | {r5[t]:.2f} | " + " | ".join(f"{mean([s for _, s, _ in its[k][t]]):.2f} ({', '.join(str(s) for _, s, _ in its[k][t])})" for k in its) + " |")
w("| total of 25 | " + f"{sum(bl.values()):.2f} | {sum(r5.values()):.2f} | " + " | ".join(f"{sum(mean([s for _, s, _ in its[k][t]]) for t in tasks):.2f}" for k in its) + " |\n")
w("## Per task: mean, min, max, valid runs (ours, last iteration; blader-inv round 5)\n")
last = list(its)[-1]
w("| Task | ours mean | ours min | ours max | ours runs | blader-inv mean | blader-inv min | blader-inv max | blader-inv runs |")
w("|---|---|---|---|---|---|---|---|---|")
for t in tasks:
    a = [s for _, s, _ in its[last][t]]; b = [s for _, s, _ in ref[t]["blader-inv"]]
    w(f"| {t} | {mean(a):.2f} | {min(a)} | {max(a)} | {len(a)} | {mean(b):.2f} | {min(b)} | {max(b)} | {len(b)} |")
w("\nNo cell was dropped or re-run in either iteration (15 valid cells each).\n")
w("## Gate per iteration (pass: on every task ours strictly above blader-inv, or both at 5.00)\n")
for k in its:
    ok = []
    for t in tasks:
        m = mean([s for _, s, _ in its[k][t]]); good = m > bl[t] + 1e-9 or (m == 5.0 and bl[t] == 5.0); ok.append(good)
        w(f"- {k} {t}: ours {m:.2f}, blader-inv {bl[t]:.2f}: {'PASS' if good else 'FAIL'}")
    w(f"- {k}: **{'PASS' if all(ok) else 'FAIL'}** ({sum(ok)} of {len(tasks)} tasks)\n")
w("## Cells with a lost point (scorer detail)\n")
any_lost = False
for k in its:
    for t in tasks:
        for i, s, dt in its[k][t]:
            if s != 5: any_lost = True; w(f"- {k} {t} run {i}: {s}; {'; '.join(dt)}")
if not any_lost: w("- none")
w("\n## Uncertainty (95% bootstrap interval, 10000 resamples over runs, seed 20261023)\n")
rnd = random.Random(20261023)
def boot(a_runs, b_runs):
    ds = []
    for _ in range(10000):
        a = sum(mean([rnd.choice(a_runs[t]) for _ in a_runs[t]]) for t in tasks)
        b = sum(mean([rnd.choice(b_runs[t]) for _ in b_runs[t]]) for t in tasks)
        ds.append(a - b)
    ds.sort(); return ds[249], ds[9749]
b_runs = {t: [s for _, s, _ in ref[t]["blader-inv"]] for t in tasks}
for k in its:
    a_runs = {t: [s for _, s, _ in its[k][t]] for t in tasks}
    lo, hi = boot(a_runs, b_runs)
    w(f"- {k}: ours minus blader-inv, total of 25: mean {sum(mean(a_runs[t]) for t in tasks) - sum(mean(b_runs[t]) for t in tasks):+.2f}, interval [{lo:+.2f}, {hi:+.2f}]" + ("; the interval includes zero" if lo <= 0 <= hi else "; the interval excludes zero"))
w("\nThe blader-inv side is the recorded round 5 run (3 runs per task), not a new measurement; the grader is a script, so there are no grader votes (no model grading in the gate).\n")
w("## Cost (US dollars, `total_cost_usd` of every call in `runs/*/*/*/cost.json`)\n")
tot = 0
for d in iters:
    cs = {}
    for p in glob.glob(f"{d}/runs/*/ours/*/cost.json"):
        cs[p] = json.load(open(p))["total_cost_usd"]
    w(f"- {os.path.basename(d)}: {len(cs)} cells, {sum(cs.values()):.2f} total, {mean(list(cs.values())):.3f} per cell"); tot += sum(cs.values())
w(f"- both iterations: {tot:.2f}")
w("- Other round 7 spending is in the report (held-out writer, implementer, reviewer); the cell costs here are the only ones `score.py` can recompute.")
w("- Paid by the organization API key of the shim (name only, no key); every call reports apiKeySource ANTHROPIC_API_KEY.")
print("\n".join(o))
