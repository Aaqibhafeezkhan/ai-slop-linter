#!/usr/bin/env bash
# usage: grade-run.sh <H2H_OUT>
# The blind-grader loop. Feeds every <H2H_OUT>/grading/<id>.txt through stdin to
#   claude -p --model $H2H_MODEL --setting-sources project --strict-mcp-config
# and writes the answer to <id>.out. An id that already has a non-empty .out is skipped, so the loop
# resumes. The grader gets nothing but the text of one file: the working directory is an empty
# directory, claude runs under the same sandbox-exec write profile as the arms (see sandbox.sh), and the
# file names never reach the model.
# The model is H2H_MODEL (default claude-sonnet-5-5). The config guard runs before and after the loop.
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
[ $# -eq 1 ] || { echo "usage: grade-run.sh <H2H_OUT>" >&2; exit 2; }
OUT="$(cd "$1" && pwd)" || exit 2
MODEL="${H2H_MODEL:-claude-sonnet-5-5}"
GRADING="$OUT/grading"
[ -d "$GRADING" ] || { echo "no $GRADING: run grade-prep.mjs first" >&2; exit 2; }

GUARD_STATE="$OUT/config-guard-grader.json"
node "$HERE/config-guard.mjs" record "$GUARD_STATE" || exit 3
WORK="$OUT/grader-work"
mkdir -p "$WORK/cwd"
. "$HERE/sandbox.sh"
render_sandbox "$OUT" grader "$WORK/cwd"

FAILED=0
for f in "$GRADING"/*.txt; do
  [ -e "$f" ] || continue
  out="${f%.txt}.out"
  if [ -s "$out" ]; then
    continue
  fi
  if ! (cd "$WORK/cwd" && "${SANDBOX_CMD[@]+"${SANDBOX_CMD[@]}"}" claude -p --model "$MODEL" --setting-sources project --strict-mcp-config < "$f" > "$out"); then
    echo "grader failed: $(basename "$f")" >&2
    rm -f "$out"
    FAILED=1
  fi
  node "$HERE/config-guard.mjs" check "$GUARD_STATE" || { echo "grade-run: ABORTED by the config guard" >&2; exit 3; }
done
exit "$FAILED"
