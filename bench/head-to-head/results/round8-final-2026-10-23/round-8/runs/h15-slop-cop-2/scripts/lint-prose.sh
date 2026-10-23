#!/usr/bin/env bash
# Fail when README.md or any page under docs/ reads like LLM-written text.
# Rules live in .slopcop.toml. Needs the slop-cop CLI on PATH.
set -euo pipefail
cd "$(dirname "$0")/.."

if ! command -v slop-cop >/dev/null 2>&1; then
  echo "lint:prose: slop-cop not found on PATH (brew install yasyf/tap/slop-cop)" >&2
  exit 2
fi

status=0
while IFS= read -r file; do
  if ! out=$(slop-cop check "$file" --standard=slop --no-llm --strict --format=compact); then
    echo "== $file"
    echo "$out"
    status=1
  fi
done < <(find README.md docs -name '*.md' | sort)

[ "$status" -eq 0 ] && echo "lint:prose ok"
exit "$status"
