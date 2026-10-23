#!/usr/bin/env bash
# Fail if README.md or any Markdown file under docs/ reads like LLM output.
# Needs the slop-cop binary on PATH (brew install yasyf/tap/slop-cop).
set -u
cd "$(dirname "$0")/.."

if ! command -v slop-cop >/dev/null 2>&1; then
  echo "lint:prose: slop-cop not found on PATH (brew install yasyf/tap/slop-cop)" >&2
  exit 2
fi

status=0
while IFS= read -r file; do
  # --strict exits 1 on violations; any other non-zero code is a tool error.
  if ! report=$(slop-cop check "$file" --strict --no-llm --standard=slop --format=compact); then
    status=1
    echo "== $file" >&2
    echo "$report" >&2
  fi
done < <(find README.md docs -name '*.md' -type f | sort)

exit $status
