#!/usr/bin/env bash
# usage: bench/head-to-head/rerun.sh [--iterations 3] [--out DIR] [--tasks h1,h2] [--include-retired] [--commit REV] [--new-code] [--parallel N] [--dry-run]
# Runs the active tasks only (tasks.json status "active"); --include-retired adds the retired ones.
# One command for a full head-to-head round: set up the competitors, run all eight arms, score, and
# prepare the blind grading. It then prints the remaining steps (the grader loop, grade-collect and
# summarize). --out defaults to ${TMPDIR:-/tmp}/h2h-round-1 and must be outside
# the repository (the repository's .slop.json would otherwise apply to our arm only); copy the finished round into
# bench/head-to-head/results/round-N with run/publish.sh. --parallel N limits how many arms run at once (run-all.sh;
# default 8; the account limit is shared, so use --parallel 2 when another job runs). --dry-run prints every command
# and runs none of them (no claude, no clone).
# Code under test: --commit REV (default HEAD) is resolved to a full sha, `git archive`d by run/prepare-code.sh
# into <out>/code-<12 sha>/, built and probed there (exit 4 when a probe fails), and the ours arm runs from that
# immutable copy only. The commit is recorded in <out>/code-commit.txt. A round directory started with another
# commit is refused (exit 5) unless --new-code is given, which reruns the ours cells on the new commit and keeps
# the competitor and baseline cells whose recorded hashes still match. No git checkout, restore, stash or reset.
# The real claude is called by run-all.sh and by grade-run.sh only. Each run is wrapped in a
# write sandbox (sandbox-exec on macOS, bwrap on Linux) with a scrubbed environment and --setting-sources
# project. The config guard is compared here around
# the whole of run-all, and by run-all.sh before and after every cell; a change stops everything with exit 3.
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
RUN="$HERE/run"
REPO="$(cd "$HERE/../.." && pwd)"
ITERATIONS=3
OUT="${TMPDIR:-/tmp}/h2h-round-1"
TASKS_ARG=""
INCLUDE_RETIRED=0
COMMIT=HEAD
NEW_CODE=0
DRY=0
PARALLEL=""
while [ $# -gt 0 ]; do
  case "$1" in
    --iterations) ITERATIONS="${2:?--iterations needs a number}"; shift 2 ;;
    --out) OUT="${2:?--out needs a directory}"; shift 2 ;;
    --tasks) TASKS_ARG="${2:?--tasks needs a list}"; shift 2 ;;
    --include-retired) INCLUDE_RETIRED=1; shift ;;
    --commit) COMMIT="${2:?--commit needs a revision}"; shift 2 ;;
    --new-code) NEW_CODE=1; shift ;;
    --dry-run) DRY=1; shift ;;
    --parallel) if [ $# -lt 2 ]; then echo "rerun: --parallel needs a number" >&2; exit 2; fi; PARALLEL="$2"; shift 2 ;;
    *) echo "unknown option: $1" >&2; exit 2 ;;
  esac
done

# Every path is made absolute (a dry run resolves without creating anything).
abspath() {
  case "$1" in
    /*) printf '%s' "$1" ;;
    *) printf '%s/%s' "$PWD" "${1#./}" ;;
  esac
}
OUT="$(abspath "$OUT")"
COMPETITORS="$(abspath "${H2H_COMPETITORS:-$HERE/competitors}")"
export H2H_COMPETITORS="$COMPETITORS"
export H2H_OUT="$OUT"
export H2H_DIR_BLADER="$COMPETITORS/blader"
export H2H_DIR_UNSLOP="$COMPETITORS/unslop"
export H2H_DIR_EVERWRITE="$COMPETITORS/everwrite"
export H2H_DIR_BASE="$OUT/empty-plugin"

REPO_REAL="$(cd "$REPO" && pwd -P)"
case "$OUT/" in
  "$REPO_REAL"/*|"$REPO"/*) echo "rerun: --out $OUT is inside the repository; use a directory outside it and run/publish.sh afterwards" >&2; exit 2 ;;
esac

CODE_REPO="${H2H_REPO:-$REPO}"   # tests point this at a small repository
SHA="$(git -C "$CODE_REPO" rev-parse --verify --quiet "$COMMIT^{commit}")" || { echo "rerun: no such commit: $COMMIT" >&2; exit 2; }
NEW_FLAG=()
[ "$NEW_CODE" -eq 1 ] && NEW_FLAG=(--new-code)

TASK_FLAG=()
[ -n "$TASKS_ARG" ] && TASK_FLAG=(--tasks "$TASKS_ARG")
RETIRED_FLAG=()
[ "$INCLUDE_RETIRED" -eq 1 ] && RETIRED_FLAG=(--include-retired)
PARALLEL_FLAG=()
if [ -n "$PARALLEL" ]; then
  case "$PARALLEL" in
    ''|*[!0-9]*) echo "rerun: --parallel must be a positive integer, got '$PARALLEL'" >&2; exit 2 ;;
  esac
  if [ "$PARALLEL" -lt 1 ]; then echo "rerun: --parallel must be a positive integer, got '$PARALLEL'" >&2; exit 2; fi
  PARALLEL_FLAG=(--parallel "$PARALLEL")
fi

# Runs a step and, when it fails, stops with that step's own exit status (a guard trip stays 3).
step() {
  echo "+ $*"
  if [ "$DRY" -eq 0 ]; then
    "$@"
    local rc=$?
    if [ "$rc" -ne 0 ]; then
      echo "rerun: step failed with exit $rc: $*" >&2
      exit "$rc"
    fi
  fi
}

echo "model: ${H2H_MODEL:-claude-sonnet-5-5}   out: $OUT   iterations: $ITERATIONS   code commit: $SHA"
if [ "$DRY" -eq 0 ]; then
  mkdir -p "$OUT" "$H2H_DIR_BASE"
  OUT="$(cd "$OUT" && pwd -P)"
  export H2H_OUT="$OUT"
  export H2H_DIR_BASE="$OUT/empty-plugin"
  node "$RUN/config-guard.mjs" record "$OUT/config-guard-rerun.json" || exit 3
else
  echo "+ node $RUN/config-guard.mjs record $OUT/config-guard-rerun.json"
fi

step bash "$RUN/prepare-code.sh" "$SHA" "$OUT" "${NEW_FLAG[@]+"${NEW_FLAG[@]}"}"
export H2H_CODE_DIR="$OUT/code-${SHA:0:12}"
step bash "$RUN/setup-competitors.sh"
if [ "$DRY" -eq 0 ]; then
  cp "$COMPETITORS/competitors-status.json" "$OUT/competitors-status.json"
  ARMS="$(node -e '
const status = JSON.parse(require("fs").readFileSync(process.argv[1], "utf8"));
const skip = new Set(status.filter((s) => !s.runnable).map((s) => s.name));
const arms = ["ours","blader","blader-inv","unslop","unslop-inv","everwrite","everwrite-inv","base"];
console.log(arms.filter((a) => !skip.has(a.replace(/-inv$/, ""))).join(","));
' "$OUT/competitors-status.json")"
else
  echo "+ cp $COMPETITORS/competitors-status.json $OUT/competitors-status.json"
  ARMS="ours,blader,blader-inv,unslop,unslop-inv,everwrite,everwrite-inv,base"
fi
step bash "$RUN/run-all.sh" --iterations "$ITERATIONS" --out "$OUT" --arms "$ARMS" "${TASK_FLAG[@]+"${TASK_FLAG[@]}"}" "${RETIRED_FLAG[@]+"${RETIRED_FLAG[@]}"}" "${NEW_FLAG[@]+"${NEW_FLAG[@]}"}" "${PARALLEL_FLAG[@]+"${PARALLEL_FLAG[@]}"}"
if [ "$DRY" -eq 0 ]; then
  node "$RUN/config-guard.mjs" check "$OUT/config-guard-rerun.json" || { echo "rerun: ABORTED by the config guard" >&2; exit 3; }
else
  echo "+ node $RUN/config-guard.mjs check $OUT/config-guard-rerun.json"
fi
step node "$RUN/score.mjs" "$OUT" "${RETIRED_FLAG[@]+"${RETIRED_FLAG[@]}"}"
step node "$RUN/grade-prep.mjs" "$OUT" "${RETIRED_FLAG[@]+"${RETIRED_FLAG[@]}"}"

cat <<EOF

Next steps (the blind grader and the summary):
  bash $RUN/grade-run.sh $OUT          # feeds every grading/<id>.txt to claude -p, writes <id>.out
  node $RUN/grade-collect.mjs $OUT     # maps the answers to runs, writes blind.json
  node $RUN/summarize.mjs $OUT         # OUTCOME and FULL tables, win rule
Commit the transcripts (*.jsonl), grading/*.txt and *.out, labelmap.json, blind.json and scores.json.
EOF
