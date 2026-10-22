#!/usr/bin/env python3
"""Recompute SUMMARY.md from grades/cells.jsonl and meta.json. No network, no model calls.
usage: score.py <evidence dir>   (prints the full SUMMARY.md; the committed file equals this output byte for byte)"""
import json, os, re, sys

ev = sys.argv[1]
meta = json.load(open(f"{ev}/meta.json"))
ARMS = ["ours", "blader", "blader-inv", "everwrite", "everwrite-inv", "unslop", "unslop-inv",
        "avoid-ai-writing", "slopless", "slop-cop", "base"]
CELL = re.compile(r"^(ho\d+)-(" + "|".join(sorted(ARMS, key=len, reverse=True)) + r")-(\d+)$")
cells = {}
for line in open(f"{ev}/grades/cells.jsonl"):
    r = json.loads(line)
    m = CELL.match(r["cell"])
    if m:
        t, a, i = m.groups()
        cells.setdefault(t, {}).setdefault(a, []).append((int(i), r["score"], r["detail"]))
tasks = sorted(cells)
arms = [a for a in ARMS if any(a in cells[t] for t in tasks)]
mean = lambda xs: sum(xs) / len(xs)
M = {t: {a: mean([s for _, s, _ in sorted(cells[t][a])]) for a in cells[t]} for t in tasks}
n = {a: sum(len(cells[t].get(a, [])) for t in tasks) for a in arms}
tot = {a: sum(M[t].get(a, 0) for t in tasks) for a in arms}
mx = 5.0 * len(tasks)
o = []
w = o.append
w("# Round 5 held-out result, " + meta["date"] + "\n")
w(meta["scope"] + "\n")
w("## Per-task mean score (maximum 5; run scores in brackets)\n")
w("| Task | " + " | ".join(arms) + " |")
w("|---|" + "---|" * len(arms))
for t in tasks:
    row = []
    for a in arms:
        if a in cells[t]:
            runs = ", ".join(str(s) for _, s, _ in sorted(cells[t][a]))
            row.append(f"{M[t][a]:.2f} ({runs})")
        else:
            row.append("n/a")
    w(f"| {t} ({meta['tasks'].get(t, '')}) | " + " | ".join(row) + " |")
w(f"| total of {mx:g} | " + " | ".join(f"{tot[a]:.2f}" for a in arms) + " |")
w("| runs | " + " | ".join(str(n[a]) for a in arms) + " |\n")
rivals = [a for a in arms if a != "ours"]
w("## Rule B (per task, strictly above every rival; a rival at the maximum needs ours at the maximum)\n")
passed = 0
for t in tasks:
    best = max(rivals, key=lambda a: M[t].get(a, -1))
    bm = M[t][best]
    ok = (M[t]["ours"] >= 5.0) if bm >= 5.0 else (M[t]["ours"] > bm)
    passed += ok
    w(f"- {t}: ours {M[t]['ours']:.2f}, best rival {best} {bm:.2f}: {'PASS' if ok else 'FAIL'}")
w(f"\nRule B: {'PASS' if passed == len(tasks) else 'FAIL'} ({passed} of {len(tasks)} tasks)\n")
w("## Rule A (lost points of ours at most 0.8 times the lost points of the best rival)\n")
bestr = max(rivals, key=lambda a: tot[a])
lo, lr = mx - tot["ours"], mx - tot[bestr]
lim = 0.8 * lr
okA = lo <= lim + 1e-9 if lr > 0 else lo == 0
w(f"Maximum {mx:g}. Ours lost {lo:.2f}. Best rival {bestr} lost {lr:.2f}. Limit 0.8 x {lr:.2f} = {lim:.2f}.")
w(f"\nRule A: {'PASS' if okA else 'FAIL'}\n")
w("## Verdict\n")
full = n["ours"] == 3 * len(tasks) and all(n[a] == 3 * len(tasks) for a in arms) and len(arms) == 11
w(f"Gate (held-out part): {'PASS' if (okA and passed == len(tasks) and full) else 'FAIL'}"
  + ("" if full else " (partial: not every arm has 3 runs on every task, or fewer than 11 arms ran)") + ".")
w("\n" + meta["claim"] + "\n")
w("## Cells with a lost point (scorer detail)\n")
for t in tasks:
    for a in arms:
        for i, s, d in sorted(cells[t].get(a, [])):
            if s < 5:
                w(f"- {t} {a} run {i}: {s}; " + "; ".join(d))
w("\n## Departures from the frozen protocol\n")
for x in meta["departures"]:
    w(f"- {x}")
w("\n## Not run\n")
for x in meta["not_run"]:
    w(f"- {x}")
sys.stdout.write("\n".join(o) + "\n")
