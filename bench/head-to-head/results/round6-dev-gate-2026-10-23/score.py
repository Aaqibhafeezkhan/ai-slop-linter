#!/usr/bin/env python3
"""Recompute SUMMARY.md from dev-gate/iter*/grades/cells.jsonl and reference/. No network, no model calls.
usage: score.py <evidence dir>   (prints the full SUMMARY.md; the committed file equals this output byte for byte)"""
import json, os, re, sys, glob
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
o = []; w = o.append
w("# Round 6 development gate (seen round 5 set ho1 to ho5), 2026-10-23\n")
w("Development gate, not a benchmark result: ho1 to ho5 are seen, are never scored in a gate, and these numbers never enter a score table. Rule B without ties except at the ceiling, against the recorded round 5 blader-inv means (blader-inv is not re-run). Frozen in `docs/HEAD-TO-HEAD.md`, section \"Development gate\".\n")
w("| Task | blader-inv (round 5) | ours round 5 (code 7cba348) | " + " | ".join(f"ours iter {os.path.basename(d)[4:]}" for d in sorted(glob.glob(f"{ev}/dev-gate/iter*"))) + " |")
w("|---|---|---|" + "---|" * len(glob.glob(f"{ev}/dev-gate/iter*")))
its = {}
for d in sorted(glob.glob(f"{ev}/dev-gate/iter*")):
    c = load(f"{d}/grades/cells.jsonl"); its[os.path.basename(d)] = {t: sorted(c[t]["ours"]) for t in tasks}
for t in tasks:
    w(f"| {t} | {bl[t]:.2f} | {r5[t]:.2f} | " + " | ".join(f"{mean([s for _, s, _ in its[k][t]]):.2f} ({', '.join(str(s) for _, s, _ in its[k][t])})" for k in its) + " |")
w("| total of 25 | " + f"{sum(bl.values()):.2f} | {sum(r5.values()):.2f} | " + " | ".join(f"{sum(mean([s for _, s, _ in its[k][t]]) for t in tasks):.2f}" for k in its) + " |\n")
w("## Gate per iteration (pass: on every task ours strictly above blader-inv, or both at 5.00)\n")
for k in its:
    ok = []
    for t in tasks:
        m = mean([s for _, s, _ in its[k][t]]); good = m > bl[t] + 1e-9 or (m == 5.0 and bl[t] == 5.0); ok.append(good)
        w(f"- {k} {t}: ours {m:.2f}, blader-inv {bl[t]:.2f}: {'PASS' if good else 'FAIL'}")
    w(f"- {k}: **{'PASS' if all(ok) else 'FAIL'}** ({sum(ok)} of {len(tasks)} tasks)\n")
w("## Cells with a lost point (scorer detail)\n")
for k in its:
    for t in tasks:
        for i, s, dt in its[k][t]:
            if s != 5: w(f"- {k} {t} run {i}: {s}; {'; '.join(dt)}")
print("\n".join(o))
