#!/usr/bin/env bash
# usage: publish.sh <out dir> <round-N>
# Copies the auditable evidence of a finished round from the output directory (which lives outside the
# repository) into bench/head-to-head/results/<round-N>/ (override the parent with H2H_RESULTS):
#   the valid transcripts <task>-<arm>-<i>.jsonl, the failed ones (*.failed.jsonl) in failed/,
#   the scored run directories in runs/<task>-<arm>-<i>/ (no node_modules or .git, no file over 1 MB, no
#   binary file), grading/*.txt, grading/*.out and grading/labelmap.json, blind.json, scores.json,
#   process.json, leaks.json, leak-review.json, meta.json, competitors-status.json, and summary.md (the
#   output of summarize.mjs, written here), plus the code under test: code-commit.txt, code-tree.txt,
#   code-manifest.txt and code-probe.txt, and the per-cell records <cell>.meta.json in cell-meta/.
# Every published text file is scrubbed: /Users/<name>, the output directory, the Claude scratchpad path and
# the temporary directory are replaced by placeholders (see publish-files.mjs).
# It refuses to overwrite an existing non-empty round directory. Nothing else is copied: home-like scratch
# files, sandbox profiles and guard state stay behind.
set -u

HERE="$(cd "$(dirname "$0")" && pwd)"
[ $# -eq 2 ] || { echo "usage: publish.sh <out dir> <round-N>" >&2; exit 2; }
OUT="$(cd "$1" 2>/dev/null && pwd)" || { echo "publish: no such directory: $1" >&2; exit 2; }
ROUND="$2"
case "$ROUND" in
  round-[0-9]*) ;;
  *) echo "publish: the round name must look like round-1, got: $ROUND" >&2; exit 2 ;;
esac
DEST_PARENT="${H2H_RESULTS:-$HERE/../results}"
mkdir -p "$DEST_PARENT"
DEST="$(cd "$DEST_PARENT" && pwd)/$ROUND"
if [ -d "$DEST" ] && [ -n "$(ls -A "$DEST")" ]; then
  echo "publish: $DEST already exists and is not empty; refusing to overwrite" >&2
  exit 1
fi
[ -f "$OUT/scores.json" ] || { echo "publish: $OUT/scores.json is missing; run score.mjs first" >&2; exit 1; }

node "$HERE/summarize.mjs" "$OUT" > "$OUT/summary.md" || { echo "publish: summarize failed (see above); nothing copied" >&2; exit 1; }

mkdir -p "$DEST/grading"
for f in "$OUT"/*.jsonl; do
  [ -e "$f" ] || continue
  case "$f" in
    *.failed.jsonl) mkdir -p "$DEST/failed"; cp "$f" "$DEST/failed/" ;;
    *) cp "$f" "$DEST/" ;;
  esac
done
for f in blind.json scores.json process.json leaks.json leak-review.json meta.json competitors-status.json summary.md code-commit.txt code-tree.txt code-bench-tree.txt code-manifest.txt code-probe.txt; do
  [ -f "$OUT/$f" ] && cp "$OUT/$f" "$DEST/"
done
for f in "$OUT"/*.meta.json; do
  [ -e "$f" ] || continue
  mkdir -p "$DEST/cell-meta"; cp "$f" "$DEST/cell-meta/"
done
for f in "$OUT"/grading/*.txt "$OUT"/grading/*.out "$OUT"/grading/labelmap.json; do
  [ -e "$f" ] && cp "$f" "$DEST/grading/"
done
rmdir "$DEST/grading" 2>/dev/null
node "$HERE/publish-files.mjs" "$OUT" "$DEST" || { echo "publish: copying the run directories or scrubbing failed" >&2; exit 1; }
echo "published $OUT to $DEST"
exit 0
