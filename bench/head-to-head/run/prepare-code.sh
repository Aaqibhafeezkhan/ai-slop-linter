#!/usr/bin/env bash
# usage: prepare-code.sh <commit|HEAD|""> <out dir> [--new-code]
# Makes the immutable copy of the code under test: `git archive <commit>` of the repository, extracted to
# <out>/code-<12 character sha>/, built there, verified, and made read-only. The working tree is never read
# or changed (no checkout, restore, stash or reset): git archive reads the commit object only.
#   build   node <repo>/node_modules/typescript/bin/tsc -p <copy>/tsconfig.json, with the copy's node_modules a
#           symlink to the repository's node_modules during the build only (read by tsc, never written, removed
#           afterwards). Offline and deterministic: no install, no network. H2H_TSC overrides the compiler
#           script (tests use a fake one).
#   bench   exit 4 unless bench/head-to-head of the working tree is identical to the commit's (see below);
#           code-bench-tree.txt records `git rev-parse <commit>:bench/head-to-head`.
#   record  <out>/code-commit.txt (full sha), code-tree.txt (tree sha), code-manifest.txt (SHA-256 of
#           dist/**/*.js, skills/**, hooks/** and .claude-plugin/**), code-probe.txt (verify-code.sh results).
#   verify  verify-code.sh: version, --compare, French auto language, dash, SKILL.md. Exit 4 when any fails; the
#           failed copy is removed and code-probe.txt keeps the reasons.
#   lock    chmod -R a-w on the copy (restored before any cleanup).
# A commit that does not exist stops with exit 2. If <out>/code-commit.txt names another commit, the script
# refuses (exit 5) unless --new-code is given; with --new-code the old record is kept in
# <out>/invalidated-<old 12>/. The same commit again reuses the copy when its manifest still matches.
# H2H_REPO overrides the repository (default: the one this script is in). Prints the copy's path.
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="${H2H_REPO:-$(cd "$HERE/../../.." && pwd)}"
NEW_CODE=0
POS=()
for a in "$@"; do
  case "$a" in
    --new-code) NEW_CODE=1 ;;
    -*) echo "prepare-code: unknown option: $a" >&2; exit 2 ;;
    *) POS+=("$a") ;;
  esac
done
[ "${#POS[@]}" -eq 2 ] || { echo "usage: prepare-code.sh <commit|HEAD|\"\"> <out dir> [--new-code]" >&2; exit 2; }
COMMIT="${POS[0]:-HEAD}"
OUT="${POS[1]}"

CODE_REPO_DIR="$REPO"
SHA="$(git -C "$REPO" rev-parse --verify --quiet "$COMMIT^{commit}")" || { echo "prepare-code: no such commit in $REPO: $COMMIT" >&2; exit 2; }
TREE="$(git -C "$REPO" rev-parse "$SHA^{tree}")" || exit 2
mkdir -p "$OUT" || exit 2
OUT="$(cd "$OUT" && pwd -P)"
case "$OUT/" in
  "$(cd "$REPO" && pwd -P)"/*) echo "prepare-code: <out> $OUT is inside the repository; use a directory outside it" >&2; exit 2 ;;
esac
# The harness (fixtures, tasks.json prompts, checks) is read from the working tree's bench/head-to-head, not
# from the archive, so it must be byte-identical to the commit under test: no unstaged or staged change and
# no untracked file there (ignored files, such as competitors/, do not count; results/ holds published output,
# not harness input, and is left out of the check). Exit 4 otherwise.
BENCH_PATH="bench/head-to-head"
BENCH_SPEC=("$BENCH_PATH" ":(exclude)$BENCH_PATH/results")
BENCH_DIRTY="$(
  { git -C "$CODE_REPO_DIR" diff --name-only "$SHA" -- "${BENCH_SPEC[@]}"
    git -C "$CODE_REPO_DIR" diff --cached --name-only "$SHA" -- "${BENCH_SPEC[@]}"
    git -C "$CODE_REPO_DIR" ls-files --others --exclude-standard -- "${BENCH_SPEC[@]}"
  } | sort -u
)"
if [ -n "$BENCH_DIRTY" ]; then
  echo "prepare-code: $BENCH_PATH in the working tree differs from commit $SHA, so the fixtures, prompts and checks in use would not be the ones of the commit under test:" >&2
  printf '  %s\n' $BENCH_DIRTY >&2
  echo "prepare-code: commit or discard those changes first (this script does not touch the working tree)." >&2
  exit 4
fi
BENCH_TREE="$(git -C "$CODE_REPO_DIR" rev-parse --verify --quiet "$SHA:$BENCH_PATH" || echo none)"
SHORT="${SHA:0:12}"
DEST="$OUT/code-$SHORT"

if [ -f "$OUT/code-commit.txt" ]; then
  OLD="$(tr -d '\r\n' < "$OUT/code-commit.txt")"
  if [ "$OLD" != "$SHA" ]; then
    if [ "$NEW_CODE" -ne 1 ]; then
      echo "prepare-code: $OUT was started with code commit $OLD, not $SHA; refusing to resume into it. Use --new-code to rerun the ours cells on the new commit, or a new --out." >&2
      exit 5
    fi
    INV="$OUT/invalidated-${OLD:0:12}"
    mkdir -p "$INV"
    for f in code-commit.txt code-tree.txt code-bench-tree.txt code-manifest.txt code-probe.txt; do
      [ -f "$OUT/$f" ] && mv "$OUT/$f" "$INV/$f"
    done
  fi
fi

# The same commit again: keep the copy when it is still exactly what was recorded.
if [ -d "$DEST" ] && [ -f "$OUT/code-manifest.txt" ] && [ "$(cat "$OUT/code-commit.txt" 2>/dev/null)" = "$SHA" ] \
   && [ "$(node "$HERE/code-manifest.mjs" "$DEST")" = "$(cat "$OUT/code-manifest.txt")" ] \
   && bash "$HERE/verify-code.sh" "$SHA" "$DEST" "$OUT/code-probe.txt" 2>/dev/null; then
  echo "prepare-code: reusing the verified copy $DEST" >&2
  printf '%s\n' "$DEST"
  exit 0
fi

unlock() { [ -e "$1" ] && chmod -R u+w "$1" 2>/dev/null; return 0; }
unlock "$DEST"
rm -rf "$DEST" || { echo "prepare-code: cannot remove the old copy $DEST" >&2; exit 2; }
mkdir -p "$DEST" || exit 2
git -C "$REPO" archive --format=tar "$SHA" | tar -x -C "$DEST" || { echo "prepare-code: git archive of $SHA failed" >&2; rm -rf "$DEST"; exit 2; }

TSC="${H2H_TSC:-$REPO/node_modules/typescript/bin/tsc}"
[ -f "$TSC" ] || { echo "prepare-code: no TypeScript compiler at $TSC (run npm ci in the repository, or set H2H_TSC)" >&2; rm -rf "$DEST"; exit 2; }
if [ -d "$REPO/node_modules" ]; then ln -s "$(cd "$REPO/node_modules" && pwd -P)" "$DEST/node_modules"; fi
if ! (cd "$DEST" && node "$TSC" -p "$DEST/tsconfig.json" >&2); then
  echo "prepare-code: the build of the copy failed" >&2
  rm -f "$DEST/node_modules"; rm -rf "$DEST"
  exit 2
fi
rm -f "$DEST/node_modules"   # a symlink, so this never touches the repository's modules

printf '%s\n' "$SHA" > "$OUT/code-commit.txt"
printf '%s\n' "$TREE" > "$OUT/code-tree.txt"
printf '%s\n' "$BENCH_TREE" > "$OUT/code-bench-tree.txt"
node "$HERE/code-manifest.mjs" "$DEST" > "$OUT/code-manifest.txt" || { rm -rf "$DEST"; exit 2; }
chmod -R a-w "$DEST"

if ! bash "$HERE/verify-code.sh" "$SHA" "$DEST" "$OUT/code-probe.txt"; then
  unlock "$DEST"; rm -rf "$DEST"
  rm -f "$OUT/code-commit.txt" "$OUT/code-tree.txt" "$OUT/code-bench-tree.txt" "$OUT/code-manifest.txt"
  exit 4
fi
printf '%s\n' "$DEST"
exit 0
