#!/usr/bin/env bash
# usage: H2H_OUT=<dir> H2H_CODE_DIR=<git-archive copy> H2H_DIR_BLADER=... H2H_DIR_UNSLOP=... H2H_DIR_EVERWRITE=... H2H_DIR_BASE=...
#        run-all.sh [iterations] [--iterations N] [--tasks h1,h3] [--arms ours,base] [--out DIR] [--force] [--include-retired] [--new-code] [--parallel N]
# Runs the active tasks of tasks.json (status "active"; or --tasks, or every task with --include-retired) for the
# eight arms (or --arms), `iterations` times (default 3).
# One cell is one task in one iteration: its arms run in parallel and the script waits for them before
# the next cell. At most N arms run at once (--parallel N, or H2H_PARALLEL; default 8, so a cell of eight
# arms runs in one batch as before). N must be a positive integer, else exit 2. The account limit is shared,
# so use --parallel 2 when another job runs. A run with a valid transcript <task>-<arm>-<i>.jsonl is skipped unless --force, so an
# interrupted round resumes. --out DIR sets the output directory (for example
# /tmp/h2h-round-1, outside the repository) in place of H2H_OUT. Exits 1 if any run exited non-zero.
#
# Code under test: the ours arm runs from H2H_CODE_DIR, the immutable git-archive copy that prepare-code.sh
# made (exit 2 when it is missing, or is the working repository or inside it). Before the first run the copy is
# compared with <out>/code-manifest.txt (exit 4 on a difference). Resume safety: a finished ours cell whose
# meta.json names another commit than <out>/code-commit.txt (or has no meta.json) stops the script with exit 5;
# --new-code instead moves every such ours cell to <out>/invalidated-<old 12>/ and runs it again. A finished
# competitor or baseline cell is skipped only when its meta.json hashes (task fixture, prompt, plugin export,
# model) still match what would run now; otherwise it runs again. Without a meta.json it is kept (an earlier
# round), except with --new-code, where reuse cannot be proved and it runs again.
#
# Guard: the hashes of the `hooks` object of ~/.claude/settings.json and the `mcpServers` object of
# ~/.claude.json are recorded when the script starts and compared before and after every cell. If
# either changed, the script stops at once with a loud message and exit 3. A run counts as finished only when its transcript
# <task>-<arm>-<i>.jsonl is valid (claude exited 0 and the last event is a successful result); a failed run is
# kept as <task>-<arm>-<i>.failed.jsonl, listed at the end, and makes the exit status 1. The output directory
# must be outside the repository. Every run uses a
# write sandbox (sandbox-exec on macOS, bwrap on Linux), a scrubbed environment and --setting-sources project
# (see run-one.sh and sandbox.sh).
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
BENCH="$(cd "$HERE/.." && pwd)"
ITERATIONS=3
TASKS_ARG=""
ARMS_ARG=""
FORCE=0
OUT_ARG=""
INCLUDE_RETIRED=0
NEW_CODE=0
PARALLEL="${H2H_PARALLEL:-8}"
while [ $# -gt 0 ]; do
  case "$1" in
    --iterations) ITERATIONS="${2:?--iterations needs a number}"; shift 2 ;;
    --parallel) if [ $# -lt 2 ]; then echo "run-all: --parallel needs a number" >&2; exit 2; fi; PARALLEL="$2"; shift 2 ;;
    --tasks) TASKS_ARG="${2:?--tasks needs a list}"; shift 2 ;;
    --arms) ARMS_ARG="${2:?--arms needs a list}"; shift 2 ;;
    --out) OUT_ARG="${2:?--out needs a directory}"; shift 2 ;;
    --force) FORCE=1; shift ;;
    --include-retired) INCLUDE_RETIRED=1; shift ;;
    --new-code) NEW_CODE=1; shift ;;
    -*) echo "unknown option: $1" >&2; exit 2 ;;
    *) ITERATIONS="$1"; shift ;;
  esac
done
case "$PARALLEL" in
  ''|*[!0-9]*) echo "run-all: --parallel / H2H_PARALLEL must be a positive integer, got '$PARALLEL'" >&2; exit 2 ;;
esac
if [ "$PARALLEL" -lt 1 ]; then
  echo "run-all: --parallel / H2H_PARALLEL must be a positive integer, got '$PARALLEL'" >&2
  exit 2
fi
if [ -n "$OUT_ARG" ]; then
  export H2H_OUT="$OUT_ARG"
fi
: "${H2H_OUT:?H2H_OUT must name the output directory (or pass --out)}"
# Every path is made absolute here, because run-one.sh changes directory before it starts claude.
for v in H2H_DIR_BLADER H2H_DIR_UNSLOP H2H_DIR_EVERWRITE H2H_DIR_BASE; do
  if [ -z "${!v:-}" ]; then
    echo "$v is not set" >&2
    exit 2
  fi
  if [ ! -d "${!v}" ]; then
    echo "$v does not name an existing directory: ${!v}" >&2
    exit 2
  fi
  export "$v=$(cd "${!v}" && pwd)"
done
# Refuse an output directory inside the repository before creating anything (checked again after
# resolving symbolic links).
REPO_ROOT="$(cd "$BENCH/../.." && pwd -P)"
case "$H2H_OUT" in /*) OUT_ABS="$H2H_OUT" ;; *) OUT_ABS="$PWD/${H2H_OUT#./}" ;; esac
case "$OUT_ABS/" in
  "$REPO_ROOT"/*) echo "run-all: the output directory $OUT_ABS is inside the repository; use a directory outside it and publish.sh afterwards" >&2; exit 2 ;;
esac
mkdir -p "$H2H_OUT"
H2H_OUT="$(cd "$H2H_OUT" && pwd -P)"
export H2H_OUT
# The output directory must be outside the repository: inside it, the repository's .slop.json would
# apply to the "ours" arm only. Copy a finished round into bench/head-to-head/results/ with publish.sh.
case "$H2H_OUT/" in
  "$REPO_ROOT"/*) echo "run-all: the output directory $H2H_OUT is inside the repository; use a directory outside it and publish.sh afterwards" >&2; exit 2 ;;
esac

if [ -z "$TASKS_ARG" ]; then
  TASKS_ARG="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1], "utf8")).tasks.filter((t) => process.argv[2] === "1" || t.status !== "retired").map((t) => t.id).join(","))' "$BENCH/tasks.json" "$INCLUDE_RETIRED")"
fi
if [ -z "$ARMS_ARG" ]; then
  ARMS_ARG="ours,blader,blader-inv,unslop,unslop-inv,everwrite,everwrite-inv,base"
fi
IFS=',' read -r -a TASK_LIST <<< "$TASKS_ARG"
IFS=',' read -r -a ARM_LIST <<< "$ARMS_ARG"

HAS_OURS=0
for arm in "${ARM_LIST[@]}"; do [ "$arm" = "ours" ] && HAS_OURS=1; done
CODE_COMMIT="unknown"
if [ "$HAS_OURS" -eq 1 ]; then
  if [ -z "${H2H_CODE_DIR:-}" ] || [ ! -d "$H2H_CODE_DIR" ]; then
    echo "run-all: H2H_CODE_DIR must name the git-archive copy of the code under test (run prepare-code.sh); the ours arm never runs from the working tree" >&2
    exit 2
  fi
  H2H_CODE_DIR="$(cd "$H2H_CODE_DIR" && pwd -P)"
  case "$H2H_CODE_DIR/" in
    "$REPO_ROOT"/*) echo "run-all: H2H_CODE_DIR $H2H_CODE_DIR is the working repository or inside it; use the git-archive copy" >&2; exit 2 ;;
  esac
  export H2H_CODE_DIR
  export H2H_DIR_OURS="$H2H_CODE_DIR"
  # The copy must still be exactly what prepare-code.sh recorded.
  if [ -f "$H2H_OUT/code-manifest.txt" ] && [ "$(node "$HERE/code-manifest.mjs" "$H2H_CODE_DIR")" != "$(cat "$H2H_OUT/code-manifest.txt")" ]; then
    echo "run-all: $H2H_CODE_DIR no longer matches $H2H_OUT/code-manifest.txt; the copy changed after it was made" >&2
    exit 4
  fi
  [ -s "$H2H_OUT/code-commit.txt" ] && CODE_COMMIT="$(tr -d '\r\n' < "$H2H_OUT/code-commit.txt")"
  echo "run-all: code under test $CODE_COMMIT in $H2H_CODE_DIR"
fi

# Ours cells recorded for other code (or without a record): refuse, or with --new-code move them aside.
MISMATCH=()
for f in "$H2H_OUT"/*-ours-[0-9]*.jsonl; do
  [ -e "$f" ] || continue
  base="$(basename "$f" .jsonl)"
  case "$base" in [A-Za-z0-9]*-ours-[0-9]*) ;; *) continue ;; esac
  case "$base" in *.*|*-*-*-*) continue ;; esac   # a failed transcript, or not a cell name
  rec="$(node "$HERE/cell-meta.mjs" commit "$H2H_OUT" "${base%%-*}" ours "${base##*-}")"
  if [ "$rec" != "$CODE_COMMIT" ]; then MISMATCH+=("$base:$rec"); fi
done
if [ "${#MISMATCH[@]}" -gt 0 ]; then
  if [ "$NEW_CODE" -ne 1 ]; then
    echo "run-all: ${#MISMATCH[@]} finished ours cell(s) in $H2H_OUT were not made from code commit $CODE_COMMIT: ${MISMATCH[*]}" >&2
    echo "run-all: refusing to resume into them. Use --new-code to move them to invalidated-<sha>/ and run them again, or a new --out." >&2
    exit 5
  fi
  for entry in "${MISMATCH[@]}"; do
    base="${entry%%:*}"; rec="${entry#*:}"
    case "$rec" in none|unknown) tag="unknown" ;; *) tag="${rec:0:12}" ;; esac
    mkdir -p "$H2H_OUT/invalidated-$tag"
    for f in "$H2H_OUT/$base" "$H2H_OUT/$base".*; do
      [ -e "$f" ] && mv "$f" "$H2H_OUT/invalidated-$tag/"
    done
    echo "run-all: invalidated $base (made from $rec) -> invalidated-$tag/"
  done
fi

MODEL="${H2H_MODEL:-claude-sonnet-5-5}"
if [ ! -f "$H2H_OUT/meta.json" ]; then
  printf '{ "model": "%s", "date": "%s" }\n' "$MODEL" "$(date +%Y-%m-%d)" > "$H2H_OUT/meta.json"
fi

GUARD_STATE="$H2H_OUT/config-guard.json"
node "$HERE/config-guard.mjs" record "$GUARD_STATE" || exit 3
guard() {
  node "$HERE/config-guard.mjs" check "$GUARD_STATE" || { echo "run-all: ABORTED by the config guard ($1)" >&2; exit 3; }
}

# Plugin exports (R4): every arm gets a copy of its plugin in $H2H_OUT/plugin-<arm>/. The copy of ours holds
# .claude-plugin/, skills/ and hooks/ only; the copies of the competitors come from their
# clones; so the answer key (bench/head-to-head/golden, tasks.json, checker-data, home, checks) is not
# reachable from any plugin directory. run-one.sh then uses the copies (H2H_PLUGINS_EXPORTED=1).
# shellcheck source=export-plugins.sh
. "$HERE/export-plugins.sh"
for pair in ours:H2H_DIR_OURS blader:H2H_DIR_BLADER unslop:H2H_DIR_UNSLOP everwrite:H2H_DIR_EVERWRITE base:H2H_DIR_BASE; do
  src_var="${pair#*:}"
  [ "${pair%%:*}" = "ours" ] && [ "$HAS_OURS" -eq 0 ] && continue
  export_plugin "${pair%%:*}" "${!src_var}" > /dev/null || exit 3
done
export H2H_PLUGINS_EXPORTED=1
# The tarball for the bin-ours/npm shim: built once per round with `npm pack` of the repository, unless
# H2H_OURS_TARBALL already names a file. It is packed from the git-archive copy (H2H_CODE_DIR, which has the
# build in dist/), never from the working tree. The commit it was built from is recorded in
# ours-tarball/SOURCE_COMMIT; a resumed round with a different code commit rebuilds it. The directory is made
# read-only afterwards (and the sandbox denies writes to it).
for arm in "${ARM_LIST[@]}"; do
  if [ "$arm" = "ours" ] && { [ -z "${H2H_OURS_TARBALL:-}" ] || [ ! -f "$H2H_OURS_TARBALL" ]; }; then
    head_sha="$CODE_COMMIT"
    have_sha="$(cat "$H2H_OUT/ours-tarball/SOURCE_COMMIT" 2>/dev/null || true)"
    if [ -d "$H2H_OUT/ours-tarball" ] && { [ -z "$(ours_tarball)" ] || [ "$have_sha" != "$head_sha" ]; }; then
      chmod -R u+w "$H2H_OUT/ours-tarball" 2>/dev/null
      rm -rf "$H2H_OUT/ours-tarball"
    fi
    if [ -z "$(ours_tarball)" ]; then
      mkdir -p "$H2H_OUT/ours-tarball"
      ( cd "$H2H_CODE_DIR" && npm pack --silent --pack-destination "$H2H_OUT/ours-tarball" > /dev/null ) || { echo "run-all: npm pack of the code copy $H2H_CODE_DIR failed" >&2; exit 3; }
      printf '%s\n' "$head_sha" > "$H2H_OUT/ours-tarball/SOURCE_COMMIT"
      chmod -R a-w "$H2H_OUT/ours-tarball"
    fi
  fi
done

FAILED=0
FAILED_CELLS=()
# Waits for the arms of the current batch and records each failure. Runs in the main shell, so the
# failure list and status are kept.
reap() {
  for entry in "${pids[@]+"${pids[@]}"}"; do
    pid="${entry%%:*}"
    name="${entry#*:}"
    if ! wait "$pid"; then
      echo "run failed: $name" >&2
      FAILED=1
      FAILED_CELLS+=("$name")
    fi
  done
  pids=()
}
for i in $(seq 1 "$ITERATIONS"); do
  for task in "${TASK_LIST[@]}"; do
    pids=()
    guard "before $task iteration $i"
    for arm in "${ARM_LIST[@]}"; do
      if [ "$FORCE" -eq 0 ] && node "$HERE/valid-transcript.mjs" "$H2H_OUT/$task-$arm-$i.jsonl"; then
        st="$(node "$HERE/cell-meta.mjs" check "$H2H_OUT" "$task" "$arm" "$i")"
        case "$st" in
          ok) echo "skip (valid transcript exists): $task-$arm-$i"; continue ;;
          nometa)
            if [ "$NEW_CODE" -eq 1 ]; then
              echo "rerun (no meta.json, so reuse cannot be proved): $task-$arm-$i"
            else
              echo "skip (valid transcript exists): $task-$arm-$i"; continue
            fi ;;
          *) echo "rerun ($st): $task-$arm-$i" ;;
        esac
      fi
      # Batches: when PARALLEL arms are running, wait for them all before starting the next batch.
      if [ "${#pids[@]}" -ge "$PARALLEL" ]; then
        reap
      fi
      "$HERE/run-one.sh" "$task" "$arm" "$i" &
      pids+=("$!:$task-$arm-$i")
    done
    reap
    guard "after $task iteration $i"
  done
done
if [ "$FAILED" -ne 0 ]; then
  echo "run-all: ${#FAILED_CELLS[@]} run(s) failed and have no valid transcript: ${FAILED_CELLS[*]}" >&2
  echo "run-all: fix the cause and run again; finished cells are skipped, failed ones run again" >&2
fi
exit "$FAILED"
