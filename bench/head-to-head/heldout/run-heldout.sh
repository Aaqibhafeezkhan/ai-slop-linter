#!/usr/bin/env bash
# usage: run-heldout.sh <heldout-tasks dir> <out dir (outside the repo)> <commit> <arms> <iterations> <parallel>
# Runs a held-out set (dirs hoN with prompt.txt, check.json and the fixture) through run/run-all.sh, in a harness
# directory built under <out>/hb-root, and scores each cell with heldout/score.mjs into <out>/cells.jsonl.
# Arm directories come from H2H_DIR_* (see setup-competitors.sh and setup-round4.sh). Put the Agent SDK shim
# first on PATH when the run must go through the SDK.
set -eu
TASKS="$(cd "$1" && pwd)"; OUT="$2"; COMMIT="$3"; ARMS="$4"; ITER="$5"; PAR="$6"
HERE="$(cd "$(dirname "$0")" && pwd)"; R="$(cd "$HERE/../../.." && pwd)"; BH="$R/bench/head-to-head"
mkdir -p "$OUT"; OUT="$(cd "$OUT" && pwd)"
HB="$OUT/hb-root/repo/bench/head-to-head"
if [ ! -d "$HB/run" ]; then
  mkdir -p "$HB/fixtures" "$HB/checks" "$HB/checker-data" "$HB/home"
  cp -R "$BH/run" "$HB/run"; cp "$BH/checks/check.mjs" "$HB/checks/"; ln -s "$BH/competitors" "$HB/competitors"
  (cd "$OUT/hb-root/repo" && git init -q)
  python3 - "$TASKS" "$HB" "$BH/tasks.json" <<'P'
import json,os,glob,shutil,sys
tasks_dir,hb,t0=sys.argv[1:4]
tasks=[]
for d in sorted(glob.glob(os.path.join(tasks_dir,"ho*"))):
    n=os.path.basename(d); ck=json.load(open(f"{d}/check.json"))
    os.makedirs(f"{hb}/fixtures/{n}",exist_ok=True); shutil.copy(f"{d}/{ck['output']}",f"{hb}/fixtures/{n}/")
    tasks.append({"id":n,"status":"active","added":"2026-10-22","title":n,"fixture":n,"prompt":open(f"{d}/prompt.txt").read().strip(),
      "criteria":[{"id":f"C{i}","kind":"script","text":"scripted by heldout/score.mjs"} for i in range(1,6)]})
j=json.load(open(t0)); j["tasks"]=tasks; json.dump(j,open(f"{hb}/tasks.json","w"),indent=1)
P
fi
[ -d "$OUT/code-$(git -C "$R" rev-parse --short=12 "$COMMIT")" ] || bash "$BH/run/prepare-code.sh" "$COMMIT" "$OUT" >/dev/null
C="$BH/competitors"
export H2H_OUT="$OUT" H2H_CODE_DIR="$OUT/code-$(git -C "$R" rev-parse --short=12 "$COMMIT")" H2H_COMPETITORS="$C" \
  H2H_DIR_BLADER="$C/blader" H2H_DIR_UNSLOP="$C/unslop" H2H_DIR_EVERWRITE="$C/everwrite" H2H_DIR_BASE="$OUT/empty-plugin" \
  H2H_DIR_AVOID_AI_WRITING="$C/assembled/avoid-ai-writing" H2H_DIR_SLOPLESS="$C/assembled/slopless" H2H_DIR_SLOP_COP="$C/assembled/slop-cop"
mkdir -p "$H2H_DIR_BASE"
cd "$R"
bash "$HB/run/run-all.sh" --iterations "$ITER" --out "$OUT" --arms "$ARMS" --parallel "$PAR" || true
: > "$OUT/cells.jsonl"
for d in "$OUT"/ho*-*-[0-9]*/; do
  c="$(basename "$d")"; [ -f "$OUT/$c.jsonl" ] || continue
  t="${c%%-*}"
  node "$HERE/score.mjs" "$TASKS/$t" "$d" | python3 -c 'import sys,json; r=json.loads(sys.stdin.read()); r["cell"]=sys.argv[1]; print(json.dumps(r,ensure_ascii=False))' "$c" >> "$OUT/cells.jsonl"
done
wc -l "$OUT/cells.jsonl"
