#!/usr/bin/env python3
"""Build the evidence folder of a held-out round from a run directory.
usage: make-evidence.py <run out dir> <heldout tasks dir> <evidence dir> <meta.json>
Copies tasks, redacts and compacts every cell, writes grades/cells.jsonl (kept from run-heldout.sh), score.py, SHA256SUMS.
Redaction: home and temp paths, e-mail addresses and key-shaped strings are replaced by placeholders."""
import glob, hashlib, json, os, re, shutil, sys

out, tasks, ev, meta = sys.argv[1:5]
ARMS = ["ours", "blader", "blader-inv", "everwrite", "everwrite-inv", "unslop", "unslop-inv",
        "avoid-ai-writing", "avoid-ai-writing-inv", "slopless", "slopless-inv", "slop-cop", "slop-cop-inv", "base"]
CELL = re.compile(r"^(ho\d+)-(" + "|".join(sorted(ARMS, key=len, reverse=True)) + r")-(\d+)$")
HOME = os.path.expanduser("~")
RED = [(re.compile(re.escape(HOME)), "<HOME>"), (re.compile(r"/private/tmp/[^\s\"'\\]*"), "<TMP>"),
       (re.compile(r"/tmp/[^\s\"'\\]*"), "<TMP>"), (re.compile(r"/Users/[A-Za-z0-9._-]+"), "<HOME>"),
       (re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}"), "<EMAIL>"),
       (re.compile(r"sk-ant-[A-Za-z0-9_-]+"), "<KEY>")]

def red(s):
    for r, t in RED:
        s = r.sub(t, s)
    return s

os.makedirs(ev, exist_ok=True)
shutil.rmtree(f"{ev}/tasks", ignore_errors=True)
shutil.copytree(tasks, f"{ev}/tasks", ignore=shutil.ignore_patterns("scratch"))
shutil.rmtree(f"{ev}/runs", ignore_errors=True)
for f in sorted(glob.glob(f"{out}/ho*-*-[0-9]*.jsonl")):
    name = os.path.basename(f)[:-6]
    m = CELL.match(name)
    if not m:
        continue
    t, arm, rep = m.groups()
    d = f"{ev}/runs/{t}/{arm}/{rep}"
    os.makedirs(d, exist_ok=True)
    cost, final, trace, ak, model = 0, "", [], None, None
    for line in open(f, errors="replace"):
        try:
            e = json.loads(line)
        except Exception:
            continue
        if e.get("type") == "system" and e.get("subtype") == "init":
            ak, model = e.get("apiKeySource"), e.get("model")
        if e.get("type") == "assistant":
            for b in e["message"]["content"]:
                if b.get("type") == "tool_use":
                    inp = json.dumps(b["input"], ensure_ascii=False)
                    trace.append({"tool": b["name"], "input": red(inp)[:400]})
        if e.get("type") == "result":
            cost, final = e.get("total_cost_usd", 0) or 0, e.get("result") or ""
    cd = f"{out}/{name}"
    for g in os.listdir(cd) if os.path.isdir(cd) else []:
        p = os.path.join(cd, g)
        if os.path.isfile(p) and g.endswith((".md", ".txt")):
            open(f"{d}/{g}", "w").write(red(open(p, errors="replace").read()))
    open(f"{d}/final.txt", "w").write(red(final))
    json.dump(trace, open(f"{d}/trace.json", "w"), indent=1, ensure_ascii=False)
    json.dump({"total_cost_usd": cost, "apiKeySource": ak, "model": model}, open(f"{d}/cost.json", "w"))
os.makedirs(f"{ev}/grades", exist_ok=True)
shutil.copy(f"{out}/cells.jsonl", f"{ev}/grades/cells.jsonl")
shutil.copy(meta, f"{ev}/meta.json")
sums = []
for p in sorted(glob.glob(f"{ev}/**/*", recursive=True)):
    if os.path.isfile(p) and os.path.basename(p) != "SHA256SUMS":
        sums.append(f"{hashlib.sha256(open(p, 'rb').read()).hexdigest()}  {os.path.relpath(p, ev)}")
open(f"{ev}/SHA256SUMS", "w").write("\n".join(sums) + "\n")
print(len(sums), "files")
