#!/bin/sh
# Checks README.md and docs/ for machine-written prose with scripts/tells.py
# (copied from the everwrite skill). The rules are English, so the
# translated trees listed in SKIP are left out.
# Put quoted examples between lines holding only <!-- tells: off --> and <!-- tells: on -->.
set -eu
cd "$(dirname "$0")/.."

SKIP="docs/de docs/fr"

PY=python3
command -v python3 >/dev/null 2>&1 || PY=python

find docs -name '*.md' | sort > /tmp/lint-prose.$$
trap 'rm -f /tmp/lint-prose.$$' EXIT
for s in $SKIP; do
  grep -v "^$s/" /tmp/lint-prose.$$ > /tmp/lint-prose.$$.n || true
  mv /tmp/lint-prose.$$.n /tmp/lint-prose.$$
done

# shellcheck disable=SC2046
"$PY" scripts/tells.py README.md $(cat /tmp/lint-prose.$$)
