#!/usr/bin/env bash
# usage: H2H_OUT=<dir> H2H_DIR_<ARM>=<plugin dir> run-one.sh <taskId> <arm> <iteration>
#   arm: ours | blader | blader-inv | unslop | unslop-inv | everwrite | everwrite-inv | base
# Copies the task fixture (dotfiles included) into $H2H_OUT/<taskId>-<arm>-<iteration>/, runs claude
# there with the arm's plugin directory, and writes the stream-json transcript to <that dir>.jsonl.
# An -inv arm uses the same plugin directory as its natural arm; its prompt is the invocation from
# invocations.json, a space, then the exact task prompt.
# The arm "ours" runs the code under test from the immutable git-archive copy named by H2H_CODE_DIR (made by
# prepare-code.sh), never from the working tree: it gets the copy's bin-ours/ first on PATH, so
# `npx ai-slop-linter` runs the copy's build and `npm install ai-slop-linter` installs the tarball packed
# from the copy (H2H_OURS_TARBALL, or the one in $H2H_OUT/ours-tarball/). H2H_CODE_DIR is required for ours
# (exit 2 without it, or when it is the working repository or inside it) and is not passed to other arms.
# The plugin directory handed to claude is an export in $H2H_OUT/plugin-<arm>/. A valid transcript is
# followed by <cell>.meta.json (commit, tree, arm, task, fixture, prompt and plugin hashes, model, date).
#
# Isolation: claude cannot log in under a fresh HOME, so it runs with the real HOME but with
# --setting-sources project (no user-level skills, hooks or settings load), wrapped in
# the write sandbox of sandbox.sh (macOS: `sandbox-exec -f $H2H_OUT/sandbox-<run>.sb`, rendered from
# sandbox.sb.tmpl; Linux: bwrap with the same policy, $H2H_OUT/sandbox-<run>.bwrap; both deny writes to the
# config locations and the repository), with the environment scrubbed to what PATH, the login and the network
# need (scrub_env in sandbox.sh). Without the sandbox tool the script exits 3 unless
# H2H_ALLOW_UNSANDBOXED=1. run-all.sh adds the config guard around every cell. Hooks reach claude only
# through the arm's plugin (its hooks/hooks.json, loaded by --plugin-dir, such as ours' UserPromptSubmit
# hook) and through --settings <json file>: set H2H_SETTINGS_<ARM> (arm name upper-cased, "-" as "_") to
# such a file. Nothing here runs a competitor's installer or init command.
# The model is H2H_MODEL (default claude-sonnet-5-5).
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
BENCH="$(cd "$HERE/.." && pwd)"
TASKS="$BENCH/tasks.json"

if [ $# -ne 3 ]; then
  echo "usage: run-one.sh <taskId> <arm> <iteration>" >&2
  exit 2
fi
TASK="$1"
ARM="$2"
ITER="$3"
: "${H2H_OUT:?H2H_OUT must name the output directory}"
MODEL="${H2H_MODEL:-claude-sonnet-5-5}"

NATURAL="${ARM%-inv}"
case "$NATURAL" in
  ours) ARM_DIR="${H2H_CODE_DIR:-}" ;;
  blader) ARM_DIR="${H2H_DIR_BLADER:-}" ;;
  unslop) ARM_DIR="${H2H_DIR_UNSLOP:-}" ;;
  everwrite) ARM_DIR="${H2H_DIR_EVERWRITE:-}" ;;
  base) ARM_DIR="${H2H_DIR_BASE:-}" ;;
  *) echo "unknown arm: $ARM" >&2; exit 2 ;;
esac
if [ "$NATURAL" != "$ARM" ] && { [ "$NATURAL" = "ours" ] || [ "$NATURAL" = "base" ]; }; then
  echo "unknown arm: $ARM" >&2
  exit 2
fi
if [ -z "$ARM_DIR" ]; then
  if [ "$NATURAL" = "ours" ]; then
    echo "H2H_CODE_DIR is not set: the ours arm runs from the git-archive copy made by prepare-code.sh, never from the working tree" >&2
  else
    echo "H2H_DIR_$(echo "$NATURAL" | tr '[:lower:]' '[:upper:]') is not set" >&2
  fi
  exit 2
fi
if [ "$NATURAL" = "ours" ]; then
  REPO_ROOT="$(cd "$BENCH/../.." && pwd -P)"
  CODE_REAL="$(cd "$H2H_CODE_DIR" 2>/dev/null && pwd -P)" || { echo "H2H_CODE_DIR does not name a directory: $H2H_CODE_DIR" >&2; exit 2; }
  case "$CODE_REAL/" in
    "$REPO_ROOT"/*) echo "H2H_CODE_DIR $CODE_REAL is the working repository or inside it; use the git-archive copy" >&2; exit 2 ;;
  esac
  ARM_DIR="$CODE_REAL"
  export H2H_CODE_DIR="$CODE_REAL"
fi

FIXTURE="$(node -e '
const fs = require("fs");
const t = JSON.parse(fs.readFileSync(process.argv[1], "utf8")).tasks.find((x) => x.id === process.argv[2]);
if (!t) process.exit(1);
process.stdout.write(t.fixture);
' "$TASKS" "$TASK")" || { echo "unknown task: $TASK" >&2; exit 2; }
PROMPT="$(node -e '
const fs = require("fs");
const t = JSON.parse(fs.readFileSync(process.argv[1], "utf8")).tasks.find((x) => x.id === process.argv[2]);
process.stdout.write(t.prompt);
' "$TASKS" "$TASK")"

if [ "$NATURAL" != "$ARM" ]; then
  INVOCATION="$(node -e '
const fs = require("fs");
const v = JSON.parse(fs.readFileSync(process.argv[1], "utf8"))[process.argv[2]];
if (typeof v !== "string" || v === "" || v === "PENDING") process.exit(1);
process.stdout.write(v);
' "$HERE/invocations.json" "$ARM")" || { echo "no invocation recorded for $ARM in invocations.json" >&2; exit 2; }
  PROMPT="$INVOCATION $PROMPT"
fi

mkdir -p "$H2H_OUT"
H2H_OUT="$(cd "$H2H_OUT" && pwd)"
# The arm starts with an export of its plugin, never the repository or a clone (see export-plugins.sh).
# run-all.sh exports every arm once and sets H2H_PLUGINS_EXPORTED=1.
# shellcheck source=export-plugins.sh
. "$HERE/export-plugins.sh"
if [ "${H2H_PLUGINS_EXPORTED:-0}" != "1" ]; then
  ARM_DIR="$(export_plugin "$NATURAL" "$ARM_DIR")"
else
  ARM_DIR="$H2H_OUT/plugin-$NATURAL"
fi
RUN_DIR="$H2H_OUT/$TASK-$ARM-$ITER"
rm -rf "$RUN_DIR" "$RUN_DIR.jsonl" "$RUN_DIR.jsonl.tmp" "$RUN_DIR.failed.jsonl" "$RUN_DIR.meta.json"
mkdir -p "$RUN_DIR"
cp -R "$BENCH/fixtures/$FIXTURE/." "$RUN_DIR/"

# shellcheck source=sandbox.sh
. "$HERE/sandbox.sh"
render_sandbox "$H2H_OUT" "$TASK-$ARM-$ITER" "$RUN_DIR"

if [ "$ARM" = "ours" ]; then
  export PATH="$H2H_CODE_DIR/bench/head-to-head/run/bin-ours:$PATH"
  # The bin-ours/npm shim installs this tarball (packed from the copy) for `npm install ai-slop-linter`.
  TARBALL="$(ours_tarball)"
  [ -n "$TARBALL" ] && export H2H_OURS_TARBALL="$TARBALL"
else
  # Only the ours arm may install the local build; no other arm sees the tarball or the copy.
  unset H2H_OURS_TARBALL H2H_CODE_DIR
fi

SETTINGS_VAR="H2H_SETTINGS_$(echo "$ARM" | tr '[:lower:]-' '[:upper:]_')"
SETTINGS_FILE="${!SETTINGS_VAR:-}"
EXTRA=()
if [ -n "$SETTINGS_FILE" ]; then
  EXTRA=(--settings "$SETTINGS_FILE")
fi

# The transcript is written to <cell>.jsonl.tmp and becomes <cell>.jsonl only when claude exits 0 and the
# last stream event is a result with is_error false. Anything else (a failure, a rate limit, a kill) is
# kept as <cell>.failed.jsonl, so a resumed round re-runs it. claude reads stdin from /dev/null.
scrub_env
(cd "$RUN_DIR" && "${ENV_CMD[@]}" "${SANDBOX_CMD[@]+"${SANDBOX_CMD[@]}"}" claude -p "$PROMPT" --setting-sources project --plugin-dir "$ARM_DIR" "${EXTRA[@]+"${EXTRA[@]}"}" --model "$MODEL" --dangerously-skip-permissions --strict-mcp-config --output-format stream-json --verbose < /dev/null > "$RUN_DIR.jsonl.tmp" 2>&1)
STATUS=$?
if [ "$STATUS" -eq 0 ] && node "$HERE/valid-transcript.mjs" "$RUN_DIR.jsonl.tmp"; then
  node "$HERE/cell-meta.mjs" write "$H2H_OUT" "$TASK" "$ARM" "$ITER" || { echo "run-one: cannot write the meta of $TASK-$ARM-$ITER" >&2; mv "$RUN_DIR.jsonl.tmp" "$RUN_DIR.failed.jsonl"; exit 1; }
  mv "$RUN_DIR.jsonl.tmp" "$RUN_DIR.jsonl"
  exit 0
fi
mv "$RUN_DIR.jsonl.tmp" "$RUN_DIR.failed.jsonl" 2>/dev/null
echo "run failed (claude exit $STATUS or no successful result event): $TASK-$ARM-$ITER, transcript kept as $RUN_DIR.failed.jsonl" >&2
exit 1
