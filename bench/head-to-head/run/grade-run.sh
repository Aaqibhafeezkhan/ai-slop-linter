#!/usr/bin/env bash
# usage: grade-run.sh <H2H_OUT>
# The blind-grader loop. Feeds every <H2H_OUT>/grading/<id>.txt through stdin to
#   claude -p --model $H2H_MODEL --setting-sources project --strict-mcp-config
# and writes the answer to <id>.out. An id that already has a non-empty .out is skipped, so the loop
# resumes. The grader gets nothing but the text of one file: the working directory is an empty
# directory, claude runs under the same write sandbox and scrubbed environment as the arms (see sandbox.sh),
# and the file names never reach the model.
# The model is H2H_MODEL (default claude-sonnet-5-5). The config guard runs before and after the loop.
#
# H2H_VOTES=N (integer 1 to 9, default 1) asks N independent votes per id. Vote k is written to <id>.out.k
# (with the default, the single answer is <id>.out, as before). Votes 1 to 3 go through the grading files in
# sorted name order, votes 4 and above in reverse order. An answer is valid when the last line that parses as
# JSON is an object with a boolean "pass". With N above 1 an invalid answer is asked again, at most 3 calls per
# vote; when all 3 are invalid the last answer stays in the file and the collector counts the vote as invalid.
# A call that exits non-zero leaves the answer file as it was.
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
[ $# -eq 1 ] || { echo "usage: grade-run.sh <H2H_OUT>" >&2; exit 2; }
OUT="$(cd "$1" && pwd)" || exit 2
MODEL="${H2H_MODEL:-claude-sonnet-5-5}"
VOTES="${H2H_VOTES:-1}"
case "$VOTES" in
  [1-9]) ;;
  *) echo "grade-run: H2H_VOTES must be an integer from 1 to 9, got '$VOTES'" >&2; exit 2 ;;
esac
GRADING="$OUT/grading"
[ -d "$GRADING" ] || { echo "no $GRADING: run grade-prep.mjs first" >&2; exit 2; }

GUARD_STATE="$OUT/config-guard-grader.json"
node "$HERE/config-guard.mjs" record "$GUARD_STATE" || exit 3
WORK="$OUT/grader-work"
mkdir -p "$WORK/cwd"
. "$HERE/sandbox.sh"
render_sandbox "$OUT" grader "$WORK/cwd"
scrub_env

# valid_answer <file>: status 0 when the last line of the file that parses as JSON is an object with a boolean pass.
# grade-collect.mjs applies the same rule.
valid_answer() {
  node -e '
    const lines = require("fs").readFileSync(process.argv[1], "utf8").split("\n").map((l) => l.trim()).filter(Boolean);
    for (let i = lines.length - 1; i >= 0; i--) {
      let v;
      try { v = JSON.parse(lines[i]); } catch { continue; }
      process.exit(v && typeof v === "object" && typeof v.pass === "boolean" ? 0 : 1);
    }
    process.exit(1);
  ' "$1"
}

FAILED=0
FILES=()
for f in "$GRADING"/*.txt; do
  [ -e "$f" ] && FILES+=("$f")
done

# grade <file> <answer> <max calls>: one grader call per attempt, written to a .part file and moved to <answer>
# when the call exits zero. An answer that is not valid is asked again while calls remain. The config guard runs
# after every call.
grade() {
  local f="$1" out="$2" max="$3" n=0 part="$2.part"
  while [ "$n" -lt "$max" ]; do
    n=$((n + 1))
    if (cd "$WORK/cwd" && "${ENV_CMD[@]}" "${SANDBOX_CMD[@]+"${SANDBOX_CMD[@]}"}" claude -p --model "$MODEL" --setting-sources project --strict-mcp-config < "$f" > "$part"); then
      mv "$part" "$out"
    else
      echo "grader failed: $(basename "$f")" >&2
      rm -f "$part"
      FAILED=1
    fi
    node "$HERE/config-guard.mjs" check "$GUARD_STATE" || { echo "grade-run: ABORTED by the config guard" >&2; exit 3; }
    if [ -s "$out" ] && valid_answer "$out"; then
      return 0
    fi
  done
  if [ "$max" -gt 1 ] && [ -s "$out" ]; then
    echo "grader answer still invalid after $n calls: $(basename "$out")" >&2
  fi
  return 0
}

if [ "$VOTES" -eq 1 ]; then
  for ((i = 0; i < ${#FILES[@]}; i++)); do
    f="${FILES[$i]}"
    out="${f%.txt}.out"
    [ -s "$out" ] || grade "$f" "$out" 1
  done
else
  # vote <file> <k>: vote k of one file, skipped when its answer file is already non-empty.
  vote() {
    local out="${1%.txt}.out.$2"
    [ -s "$out" ] || grade "$1" "$out" 3
  }
  for ((k = 1; k <= VOTES; k++)); do
    if [ "$k" -le 3 ]; then
      for ((i = 0; i < ${#FILES[@]}; i++)); do vote "${FILES[$i]}" "$k"; done
    else
      for ((i = ${#FILES[@]} - 1; i >= 0; i--)); do vote "${FILES[$i]}" "$k"; done
    fi
  done
fi
exit "$FAILED"
