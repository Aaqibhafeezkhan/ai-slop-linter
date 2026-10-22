#!/usr/bin/env bash
# usage: verify-code.sh <commit sha> <code copy> <probe file>
# Checks, inside the git-archive copy of <commit>, that it is the build under test. Every check is printed as
# "PASS <name>: <detail>" or "FAIL <name>: <detail>" into <probe file>, which is rewritten each time. Exit 0
# when all checks pass, 4 when any fails (the copy is not what was asked for).
#   version   cli.js --version equals "version" of package.json at <commit>
#   compare   --help mentions --compare
#   language  a French sample with --language auto is detected as fr and gets no dash finding
#   dash      an English line with an em dash gets a dash finding
#   skill     skills/ai-slop-linter/SKILL.md is byte-identical to the one at <commit>
# The repository is read with git only (git show); the working tree is never read. H2H_REPO overrides the
# repository (default: the one this script is in).
set -u
HERE="$(cd "$(dirname "$0")" && pwd)"
REPO="${H2H_REPO:-$(cd "$HERE/../../.." && pwd)}"
[ $# -eq 3 ] || { echo "usage: verify-code.sh <commit sha> <code copy> <probe file>" >&2; exit 2; }
SHA="$1"; CODE="$2"; PROBE="$3"
CLI="$CODE/dist/src/cli.js"
: > "$PROBE"
FAILED=0
record() { # record <PASS|FAIL> <name> <detail>
  printf '%s %s: %s\n' "$1" "$2" "$3" >> "$PROBE"
  [ "$1" = "FAIL" ] && FAILED=1
  return 0
}
SCRATCH="$(mktemp -d "${TMPDIR:-/tmp}/h2h-probe-XXXXXX")"
trap 'rm -rf "$SCRATCH"' EXIT
cd "$SCRATCH" || exit 2   # outside both repositories: no .slop.json applies

WANT="$(git -C "$REPO" show "$SHA:package.json" 2>/dev/null | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{process.stdout.write(String(JSON.parse(s).version))}catch{}})')"
GOT="$(node "$CLI" --version 2>/dev/null | tr -d '\r\n')"
if [ -n "$WANT" ] && [ "$GOT" = "$WANT" ]; then record PASS version "cli --version $GOT equals package.json at $SHA"
else record FAIL version "cli --version '${GOT}' but package.json at $SHA says '${WANT}'"; fi

if node "$CLI" --help 2>/dev/null | grep -q -- '--compare'; then record PASS compare "--help mentions --compare"
else record FAIL compare "--help does not mention --compare"; fi

FR='Voici la note de lancement pour toute léquipe. Nous avons terminé la migration de la base de données hier soir, et tout fonctionne comme prévu. Marc — qui dirige le projet depuis le début — confirme que les tests passent. Les clients pourront utiliser la nouvelle version dès lundi matin, sans aucune interruption du service.'
FR_OUT="$(printf '%s\n' "$FR" | node "$CLI" --language auto --format json - 2>/dev/null)"
FR_RES="$(printf '%s' "$FR_OUT" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const r=JSON.parse(s)[0];const dash=r.findings.filter(f=>f.rule==="dash").length;process.stdout.write(`${r.language} ${dash}`)}catch{process.stdout.write("unreadable")}})')"
if [ "$FR_RES" = "fr 0" ]; then record PASS language "French sample with --language auto: language fr, 0 dash findings"
else record FAIL language "French sample with --language auto gave '$FR_RES' (want 'fr 0')"; fi

EN_OUT="$(printf 'This is a plain note — and it has an em dash in it, which is a tell.\n' | node "$CLI" --format json - 2>/dev/null)"
EN_RES="$(printf '%s' "$EN_OUT" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>{try{const r=JSON.parse(s)[0];process.stdout.write(String(r.findings.filter(f=>f.rule==="dash").length))}catch{process.stdout.write("unreadable")}})')"
if [ "$EN_RES" != "unreadable" ] && [ "$EN_RES" -ge 1 ] 2>/dev/null; then record PASS dash "English line with an em dash: $EN_RES dash finding(s)"
else record FAIL dash "English line with an em dash gave '$EN_RES' (want at least 1)"; fi

if git -C "$REPO" show "$SHA:skills/ai-slop-linter/SKILL.md" 2>/dev/null | cmp -s - "$CODE/skills/ai-slop-linter/SKILL.md"; then
  record PASS skill "skills/ai-slop-linter/SKILL.md is byte-identical to the one at $SHA"
else record FAIL skill "skills/ai-slop-linter/SKILL.md differs from the one at $SHA (or is missing)"; fi

if [ "$FAILED" -ne 0 ]; then
  echo "verify-code: the copy $CODE is not the build under test:" >&2
  grep '^FAIL' "$PROBE" >&2
  exit 4
fi
exit 0
