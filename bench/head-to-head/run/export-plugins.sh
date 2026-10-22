# Sourced by run-all.sh and run-one.sh. Defines export_plugin <natural arm> <source dir>, which copies a
# plugin into $H2H_OUT/plugin-<arm>/ and prints that path. An arm is started with the copy, never with the
# repository or a clone, so no arm can walk from its plugin directory to bench/head-to-head/golden,
# tasks.json, checker-data, home/*.json or checks (the answer key).
#   ours: only .claude-plugin/ and skills/ of the repository (not THIRD-PARTY-NOTICES.md, which maps the
#   answer key; it ships in the npm package anyway).
#   others (competitors, base): the whole directory without .git.
# The export is made read-only (chmod -R a-w) so a run cannot change it; export_plugin restores write
# permission before it replaces an earlier export. The sandbox profile also denies writes to plugin-*.
# The local CLI shims (bin-ours) still run the build in $REPO/dist.
export_plugin() {
  local arm="$1" src="$2" dest="$H2H_OUT/plugin-$1"
  [ -e "$dest" ] && chmod -R u+w "$dest" 2>/dev/null
  rm -rf "$dest" || return 1
  mkdir -p "$dest" || return 1
  if [ "$arm" = "ours" ]; then
    local item
    for item in .claude-plugin skills; do
      if [ -e "$src/$item" ]; then cp -R "$src/$item" "$dest/$item" || return 1; fi
    done
  else
    (cd "$src" && tar --exclude=.git -cf - .) | (cd "$dest" && tar -xf -) || return 1
  fi
  chmod -R a-w "$dest"
  printf '%s' "$dest"
}

# The tarball of the local build, for the bin-ours/npm shim: H2H_OURS_TARBALL when set to a file, else the
# first *.tgz in $H2H_OUT/ours-tarball/. Prints nothing when there is none.
ours_tarball() {
  if [ -n "${H2H_OURS_TARBALL:-}" ] && [ -f "$H2H_OURS_TARBALL" ]; then
    printf '%s' "$H2H_OURS_TARBALL"
    return 0
  fi
  local f
  for f in "$H2H_OUT"/ours-tarball/*.tgz; do
    [ -f "$f" ] && { printf '%s' "$f"; return 0; }
  done
  return 0
}
