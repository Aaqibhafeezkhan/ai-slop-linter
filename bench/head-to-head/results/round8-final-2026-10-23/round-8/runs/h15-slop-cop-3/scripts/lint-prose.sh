#!/usr/bin/env bash
# Fails when README.md or any Markdown file under docs/ carries slop-cop violations.
# Rule selection lives in .slopcop.toml.
set -u
cd "$(dirname "$0")/.."

if ! command -v slop-cop >/dev/null 2>&1; then
  echo "lint:prose needs slop-cop on PATH (brew install yasyf/tap/slop-cop)" >&2
  exit 2
fi

status=0
while IFS= read -r file; do
  # One run per file so .slopcop.toml overrides resolve per path.
  if ! slop-cop check "$file" --strict --standard=slop --no-llm --format=compact; then
    echo "^ $file" >&2
    status=1
  fi
done < <({ echo README.md; find docs -type f -name '*.md'; } | sort)

exit $status
