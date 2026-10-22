#!/usr/bin/env bash
# usage: [H2H_COMPETITORS=<dir>] setup-round4.sh
# Builds the plugin directories of the three round-4 competitors from their pinned clones (made by
# setup-competitors.sh from competitors.lock) into $H2H_COMPETITORS/assembled/<name>/:
#   avoid-ai-writing  plugins/avoid-ai-writing of the clone (the plugin its marketplace file names; the detector
#                     and validator sit inside its skill folder).
#   slopless          a plugin that holds the skill file of the npm package (what `slopless install-skill claude`
#                     copies) plus h2h-bin/{slopless,npx} and h2h-tools/node_modules (npm install of the
#                     published tarball slopless-0.2.41.tgz, sha256 checked). `npx slopless` runs the local copy,
#                     no network at run time. install-skill is not run.
#   slop-cop          the clone without .git, with bin/slop-cop replaced by a wrapper around a binary built from
#                     the pinned source (go build, version 0.1.73): the wrapper sets SLOP_COP_LLM=off and refuses
#                     rewrite, plainify and every --llm flag, so the arm is the checker only and makes no model
#                     or network call (binrun, which would download a binary, is never run).
# Setup needs the network once (npm install, go modules); the runs do not. No competitor installer or init
# command is run. Prints the three H2H_DIR_* lines to export.
set -eu

HERE="$(cd "$(dirname "$0")" && pwd)"
BENCH="$(cd "$HERE/.." && pwd)"
DEST="${H2H_COMPETITORS:-$BENCH/competitors}"
A="$DEST/assembled"
SLOPLESS_VERSION="0.2.41"
SLOPLESS_SHA256="86d81cd90f132c1dc5f6291dbdfad51b50b374571470cffa8ff79f637b638e4a"
chmod -R u+w "$A" 2>/dev/null || true
rm -rf "$A"
mkdir -p "$A"

# 1. avoid-ai-writing
cp -R "$DEST/avoid-ai-writing/plugins/avoid-ai-writing" "$A/avoid-ai-writing"

# 2. slopless
S="$A/slopless"
mkdir -p "$S/.claude-plugin" "$S/skills/slopless" "$S/h2h-bin" "$S/h2h-tools"
cat > "$S/.claude-plugin/plugin.json" <<E
{ "name": "slopless", "version": "$SLOPLESS_VERSION", "description": "Slopless prose linter skill (benchmark assembly)", "license": "MIT" }
E
(cd "$S/h2h-tools" && npm pack "slopless@$SLOPLESS_VERSION" --silent >/dev/null)
got="$(shasum -a 256 "$S/h2h-tools/slopless-$SLOPLESS_VERSION.tgz" | cut -d' ' -f1)"
[ "$got" = "$SLOPLESS_SHA256" ] || { echo "setup-round4: slopless tarball hash differs: $got" >&2; exit 1; }
(cd "$S/h2h-tools" && npm init -y >/dev/null && npm install "./slopless-$SLOPLESS_VERSION.tgz" --silent --no-audit --no-fund >/dev/null)
cp "$S/h2h-tools/node_modules/slopless/skills/slopless/SKILL.md" "$S/skills/slopless/SKILL.md"
cat > "$S/h2h-bin/slopless" <<'E'
#!/usr/bin/env bash
exec node "$(cd "$(dirname "$0")/../h2h-tools/node_modules/slopless/dist" && pwd)/cli.js" "$@"
E
cat > "$S/h2h-bin/npx" <<'E'
#!/usr/bin/env bash
# "npx [flags] slopless ..." runs the local copy; anything else goes to the real npx.
HERE="$(cd "$(dirname "$0")" && pwd)"
ARGS=("$@"); i=0
while [ "$i" -lt "${#ARGS[@]}" ]; do case "${ARGS[$i]}" in -y|--yes|--no-install) i=$((i + 1)) ;; -*) break ;; *) break ;; esac; done
if [ "${ARGS[$i]:-}" = "slopless" ] || [[ "${ARGS[$i]:-}" == slopless@* ]]; then
  exec "$HERE/slopless" "${ARGS[@]:$((i + 1))}"
fi
IFS=: read -r -a dirs <<< "$PATH"
for d in "${dirs[@]}"; do [ -n "$d" ] && ! [ "$d" -ef "$HERE" ] && [ -x "$d/npx" ] && exec "$d/npx" "$@"; done
echo "npx: no real npx found" >&2; exit 127
E
chmod +x "$S/h2h-bin/slopless" "$S/h2h-bin/npx"

# 3. slop-cop
C="$A/slop-cop"
mkdir -p "$C"
(cd "$DEST/slop-cop" && tar --exclude=.git -cf - .) | (cd "$C" && tar -xf -)
rm -f "$C/bin/slop-cop"
(cd "$DEST/slop-cop" && CGO_ENABLED=1 go build -ldflags "-X main.version=0.1.73" -o "$C/bin/slop-cop-real" ./cmd/slop-cop)
cat > "$C/bin/slop-cop" <<'E'
#!/usr/bin/env bash
# Benchmark wrapper: checker only. No model call, no network.
for a in "$@"; do
  case "$a" in
    rewrite|plainify) echo "slop-cop: $a is disabled in the benchmark (it calls the claude CLI); use check" >&2; exit 4 ;;
    --llm|--llm-deep|--llm-effort|--llm-effort=*) echo "slop-cop: model passes are disabled in the benchmark; use --no-llm" >&2; exit 4 ;;
  esac
done
export SLOP_COP_LLM=off
exec "$(cd "$(dirname "$0")" && pwd)/slop-cop-real" "$@"
E
chmod +x "$C/bin/slop-cop" "$C/bin/slop-cop-real"

echo "export H2H_DIR_AVOID_AI_WRITING=$A/avoid-ai-writing"
echo "export H2H_DIR_SLOPLESS=$A/slopless"
echo "export H2H_DIR_SLOP_COP=$A/slop-cop"
