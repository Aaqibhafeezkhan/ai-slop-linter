# Sourced by run-one.sh and grade-run.sh. Defines render_sandbox <out dir> <name> and sets SANDBOX_CMD.
# Isolation is: claude runs with the real HOME (a fresh HOME cannot log in), --setting-sources project
# (no user-level skills, hooks or settings are loaded), a macOS sandbox-exec profile that denies writes to
# the config locations, the repository and the git-archive copy of the code under test (and reads of
# bench, .superpowers and test of both), and the config guard around every cell.
# Without sandbox-exec the caller refuses to run (exit 3) unless H2H_ALLOW_UNSANDBOXED=1.
render_sandbox() {
  # render_sandbox <out dir> <name> [run dir]: the run dir is the only place under <out dir> where the
  # sandboxed process may write (default: the whole out dir).
  local out="$1" name="$2" run="${3:-$1}" here repo tmpl
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  repo="$(cd "$here/../../.." && pwd -P)"
  tmpl="$here/sandbox.sb.tmpl"
  SANDBOX_CMD=()
  if ! command -v sandbox-exec >/dev/null 2>&1; then
    if [ "${H2H_ALLOW_UNSANDBOXED:-0}" = "1" ]; then
      echo "WARNING: sandbox-exec not found, running UNSANDBOXED (H2H_ALLOW_UNSANDBOXED=1)" >&2
      return 0
    fi
    echo "sandbox-exec not found: refusing to run. Set H2H_ALLOW_UNSANDBOXED=1 to run without the write sandbox." >&2
    exit 3
  fi
  local realhome realout realrun realcode
  realhome="$(cd "$HOME" && pwd -P)"
  realout="$(cd "$out" && pwd -P)"
  realrun="$(cd "$run" && pwd -P)"
  # The git-archive copy of the code under test (H2H_CODE_DIR); the repository itself when there is none.
  realcode="$repo"
  [ -n "${H2H_CODE_DIR:-}" ] && [ -d "$H2H_CODE_DIR" ] && realcode="$(cd "$H2H_CODE_DIR" && pwd -P)"
  # H2H_SANDBOX_EXTRA_DENY: colon separated absolute paths whose writes are also denied (machine-specific
  # files stay out of the template); each is resolved with realpath when it exists. A relative path or one
  # with a quote, backslash or newline is refused. The git directories of the repository (.git, or the
  # gitdir and common dir of a linked worktree) are added to the read deny list.
  node -e '
const fs = require("fs");
const cp = require("child_process");
const path = require("path");
const [tmpl, dest, home, repo, out, run, extra, code] = process.argv.slice(1);
const bad = (p) => !p.startsWith("/") || /["\\\n\r]/.test(p);
const real = (p) => { try { return fs.realpathSync(p); } catch { return p; } };
const extras = extra.split(":").filter((p) => p !== "");
for (const p of extras) {
  if (bad(p)) {
    console.error(`H2H_SANDBOX_EXTRA_DENY: not an absolute path without quotes or backslashes: ${p}`);
    process.exit(1);
  }
}
const lines = extras.map((p) => `\n  (subpath "${real(p)}")`).join("");
const git = cp.spawnSync("git", ["-C", repo, "rev-parse", "--absolute-git-dir", "--git-common-dir"], { encoding: "utf8" });
const gitDirs = new Set();
if (git.status === 0) for (const l of git.stdout.split("\n").filter(Boolean)) gitDirs.add(real(path.resolve(repo, l)));
gitDirs.delete(path.join(repo, ".git"));
const gitLines = [...gitDirs].filter((p) => !bad(p)).map((p) => `\n  (subpath "${p}")`).join("");
const reEsc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const text = fs.readFileSync(tmpl, "utf8")
  .split("@HOME@").join(home).split("@REPO@").join(repo).split("@CODE@").join(code)
  .split("@OUT_RE@").join(reEsc(out)).split("@OUT@").join(out).split("@RUN@").join(run)
  .split("@EXTRA_DENY@").join(lines).split("@GIT_DENY@").join(gitLines);
fs.writeFileSync(dest, text);
' "$tmpl" "$out/sandbox-$name.sb" "$realhome" "$repo" "$realout" "$realrun" "${H2H_SANDBOX_EXTRA_DENY:-}" "$realcode" || exit 3
  SANDBOX_CMD=(sandbox-exec -f "$out/sandbox-$name.sb")
}
