#!/usr/bin/env bash
# usage: [H2H_COMPETITORS=<dir>] [H2H_LOCK=<lock file>] setup-competitors.sh
# Clones each competitor listed in competitors.lock (plain `name url hash` lines) into
# $H2H_COMPETITORS/<name> (default bench/head-to-head/competitors/, git-ignored) at the recorded
# commit, checks its prerequisites, and writes $H2H_COMPETITORS/competitors-status.json:
#   [ { "name": "...", "runnable": true|false, "reason": "..." }, ... ]
# A competitor that is not runnable is listed in the summary as `not run, <reason>` and never counted.
# Prerequisites: everwrite needs Python 3.9 or later (its tells.py checker); the others need nothing.
# Hooks that use CLAUDE_PLUGIN_ROOT are noted in the reason, because they only work through
# --plugin-dir. This script never runs an installer or init command of a competitor.
# Exits 0 even when a competitor is not runnable; exits 1 only when the lock file cannot be read.
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
BENCH="$(cd "$HERE/.." && pwd)"
LOCK="${H2H_LOCK:-$HERE/competitors.lock}"
DEST="${H2H_COMPETITORS:-$BENCH/competitors}"
[ -f "$LOCK" ] || { echo "lock file missing: $LOCK" >&2; exit 1; }
mkdir -p "$DEST"

ENTRIES=()
while read -r name url hash rest; do
  case "$name" in ''|'#'*) continue ;; esac
  if [ -z "$url" ] || [ -z "$hash" ]; then
    echo "bad lock line for $name (need: name url hash)" >&2
    exit 1
  fi
  dir="$DEST/$name"
  reason=""
  runnable=true
  if [ ! -d "$dir/.git" ]; then
    rm -rf "$dir"
    if ! git clone --quiet "$url" "$dir" 2>/dev/null; then
      runnable=false
      reason="clone failed: $url"
    fi
  fi
  if [ "$runnable" = true ]; then
    if [ "$(git -C "$dir" rev-parse HEAD 2>/dev/null)" != "$hash" ]; then
      git -C "$dir" fetch --quiet origin 2>/dev/null || true
      # `switch` in the competitor's own fresh clone ($dir, never this repository's working tree).
      if ! git -C "$dir" switch --quiet --detach "$hash" 2>/dev/null; then
        runnable=false
        reason="commit $hash not found in $url"
      fi
    fi
  fi
  if [ "$runnable" = true ] && [ "$name" = "everwrite" ]; then
    if ! python3 -c 'import sys; sys.exit(0 if sys.version_info >= (3, 9) else 1)' 2>/dev/null; then
      runnable=false
      reason="everwrite needs Python 3.9 or later for tells.py; found $(python3 --version 2>&1 || echo none)"
    fi
  fi
  if [ "$runnable" = true ]; then
    reason="ok at ${hash:0:12}"
    if grep -rqs CLAUDE_PLUGIN_ROOT "$dir" --include='hooks.json' --include='plugin.json' --exclude-dir=.git; then
      reason="$reason; hooks use CLAUDE_PLUGIN_ROOT, which --plugin-dir provides"
    fi
  fi
  ENTRIES+=("$name"$'\t'"$runnable"$'\t'"$reason")
done < "$LOCK"

printf '%s\n' "${ENTRIES[@]+"${ENTRIES[@]}"}" | node -e '
const lines = require("fs").readFileSync(0, "utf8").split("\n").filter(Boolean);
const out = lines.map((l) => { const [name, runnable, ...r] = l.split("\t"); return { name, runnable: runnable === "true", reason: r.join("\t") }; });
require("fs").writeFileSync(process.argv[1], JSON.stringify(out, null, 2) + "\n");
' "$DEST/competitors-status.json"
cat "$DEST/competitors-status.json"
