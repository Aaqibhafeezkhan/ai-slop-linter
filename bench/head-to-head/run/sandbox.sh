# Sourced by run-one.sh and grade-run.sh. Defines render_sandbox <out dir> <name> and sets SANDBOX_CMD, and
# scrub_env, which sets ENV_CMD.
# Isolation is: claude runs with the real HOME (a fresh HOME cannot log in), --setting-sources project
# (no user-level skills, hooks or settings are loaded), a scrubbed environment (scrub_env), a write sandbox
# that denies writes to the config locations, the repository and the git-archive copy of the code under test
# (and reads of bench, .superpowers and test of both), and the config guard around every cell.
# Backends: macOS sandbox-exec with the profile rendered from sandbox.sb.tmpl, or on Linux bubblewrap (bwrap)
# with the same policy as bind mounts (see bwrapArgs below). H2H_SANDBOX_BACKEND=sandbox-exec|bwrap overrides
# the choice by platform (tests use it). The .sb profile is rendered on both platforms as the record of the
# policy; the bwrap argument list is written next to it as sandbox-<name>.bwrap (NUL separated).
# Without the backend's tool the caller refuses to run (exit 3) unless H2H_ALLOW_UNSANDBOXED=1.
render_sandbox() {
  # render_sandbox <out dir> <name> [run dir]: the run dir is the only place under <out dir> where the
  # sandboxed process may write (default: the whole out dir).
  local out="$1" name="$2" run="${3:-$1}" here repo tmpl backend
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  repo="$(cd "$here/../../.." && pwd -P)"
  tmpl="$here/sandbox.sb.tmpl"
  SANDBOX_CMD=()
  case "${H2H_SANDBOX_BACKEND:-}" in
    "") case "${OSTYPE:-}" in darwin*) backend=sandbox-exec ;; *) backend=bwrap ;; esac ;;
    sandbox-exec|bwrap) backend="$H2H_SANDBOX_BACKEND" ;;
    *) echo "H2H_SANDBOX_BACKEND must be sandbox-exec or bwrap, not: $H2H_SANDBOX_BACKEND" >&2; exit 3 ;;
  esac
  if ! command -v "$backend" >/dev/null 2>&1; then
    if [ "${H2H_ALLOW_UNSANDBOXED:-0}" = "1" ]; then
      echo "WARNING: $backend not found, running UNSANDBOXED (H2H_ALLOW_UNSANDBOXED=1)" >&2
      return 0
    fi
    echo "$backend not found: refusing to run. Set H2H_ALLOW_UNSANDBOXED=1 to run without the write sandbox." >&2
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
const [tmpl, dest, home, repo, out, run, extra, code, backend, bwrapDest] = process.argv.slice(1);
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
if (backend !== "bwrap") process.exit(0);

// The same policy for bubblewrap. bwrap applies mounts in order and a later mount over the same place wins,
// so the list goes from wide to narrow:
//   1. the whole file system read-only, a fresh /dev and /proc; the network is not unshared;
//   2. writable: /tmp, /var/tmp and TMPDIR (temporary files, as sandbox-exec allows them), and the cgroup
//      directories the process runs in;
//   3. HOME read-only again (it may live under a writable place), then writable only where claude keeps its
//      own state: ~/.claude/{projects,sessions,shell-snapshots,todos,statsig} (made when missing) and
//      ~/.claude/{session-env,debug,file-history,plans,backups,telemetry} when present, ~/.claude.json and
//      the caches ~/.npm and ~/.cache;
//   4. read-only: the config locations of the template, H2H_SANDBOX_EXTRA_DENY, the repository, the code
//      copy and the output directory (so other runs, plugin-* and ours-tarball);
//   5. writable: the run directory; then plugin-* and ours-tarball read-only again (the run directory may be
//      the output directory itself);
//   6. hidden: bench, .superpowers, test and .git of the repository and of the code copy and the git
//      directories of a linked worktree (an empty tmpfs over a directory, /dev/null over a file);
//   7. bench/head-to-head/run/bin-ours of the repository and of the code copy read-only again.
// A path that does not exist is skipped: nothing can create it, because its parent is read-only, except
// under the writable places of steps 2, 3 and 5, which the template leaves writable too.
const exists = (p) => { try { fs.lstatSync(p); return true; } catch { return false; } };
const isDir = (p) => { try { return fs.statSync(p).isDirectory(); } catch { return false; } };
const args = ["--die-with-parent", "--ro-bind", "/", "/", "--dev", "/dev", "--proc", "/proc"];
let last = "";
const bind = (flag, p) => {
  if (!exists(p) || last === `${flag} ${p}`) return;
  last = `${flag} ${p}`;
  args.push(flag, p, p);
};
const tmpDirs = ["/tmp", "/var/tmp"];
if (process.env.TMPDIR && process.env.TMPDIR.startsWith("/")) tmpDirs.push(process.env.TMPDIR);
for (const p of new Set(tmpDirs.map(real))) bind("--bind", p);
// The cgroup directories this process already runs in stay writable: claude starts its Bash tool with
// clone3(CLONE_INTO_CGROUP) into its own cgroup, which fails with EROFS on a read-only /sys (a cloud container
// runs every command in a memory cgroup). Nothing else under /sys is writable.
try {
  for (const line of fs.readFileSync("/proc/self/cgroup", "utf8").split("\n")) {
    const m = /^\d+:([^:]*):(\/.+)$/.exec(line);
    if (!m) continue;
    const controllers = m[1] === "" ? ["", "unified"] : [m[1].replace(/^name=/, "")];
    for (const c of controllers) bind("--bind", path.join("/sys/fs/cgroup", c, m[2]));
  }
} catch {}
bind("--ro-bind", home);
// The state directories are created (empty) when missing, as claude would create them on its first run.
const state = ["projects", "sessions", "shell-snapshots", "todos", "statsig"];
for (const s of state) {
  const p = path.join(home, ".claude", s);
  if (!exists(p) && isDir(path.join(home, ".claude"))) { try { fs.mkdirSync(p); } catch {} }
  bind("--bind", p);
}
for (const s of ["session-env", "debug", "file-history", "plans", "backups", "telemetry"]) bind("--bind", path.join(home, ".claude", s));
for (const p of [".claude.json", ".npm", ".cache"]) bind("--bind", path.join(home, p));
const config = ["plugins", "skills", "commands", "agents", "hooks", "scripts", "settings.json", "settings.local.json", "CLAUDE.md"].map((s) => path.join(home, ".claude", s))
  .concat([".agents", ".config", ".npmrc"].map((s) => path.join(home, s)));
for (const p of config) bind("--ro-bind", p);
for (const p of extras) bind("--ro-bind", real(p));
for (const p of [repo, code, out]) bind("--ro-bind", p);
args.push("--bind", run, run);
for (const e of fs.readdirSync(out)) if (e.startsWith("plugin-") || e === "ours-tarball") bind("--ro-bind", path.join(out, e));
const hidden = [];
for (const root of [repo, code]) for (const d of ["bench", ".superpowers", "test", ".git"]) hidden.push(path.join(root, d));
hidden.push(...gitDirs);
const done = [];
for (const p of [...new Set(hidden)].sort()) {
  if (!exists(p) || done.some((d) => p.startsWith(d + "/"))) continue;
  done.push(p);
  if (isDir(p)) args.push("--tmpfs", p);
  else args.push("--ro-bind", "/dev/null", p);
}
for (const root of [repo, code]) bind("--ro-bind", path.join(root, "bench", "head-to-head", "run", "bin-ours"));
args.push("--");
fs.writeFileSync(bwrapDest, args.join("\0") + "\0");
' "$tmpl" "$out/sandbox-$name.sb" "$realhome" "$repo" "$realout" "$realrun" "${H2H_SANDBOX_EXTRA_DENY:-}" "$realcode" "$backend" "$out/sandbox-$name.bwrap" || exit 3
  if [ "$backend" = "bwrap" ]; then
    local a
    SANDBOX_CMD=(bwrap)
    while IFS= read -r -d '' a; do SANDBOX_CMD+=("$a"); done < "$out/sandbox-$name.bwrap"
  else
    SANDBOX_CMD=(sandbox-exec -f "$out/sandbox-$name.sb")
  fi
}

# scrub_env sets ENV_CMD to an `env -i NAME=value ...` prefix that passes claude only what it needs to find its
# tools, log in and reach the network. Everything else is dropped: in a cloud session the environment carries
# variables that change how claude behaves (CLAUDE_ADDITIONAL_DIRECTORIES with CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD
# load another directory and its CLAUDE.md, CLAUDE_CODE_REMOTE*, CLAUDE_CODE_SYNC_SKILLS, CLAUDE_EFFORT,
# MAX_THINKING_TOKENS, CLAUDECODE, CLAUDE_CODE_DEBUG and others) and tokens an arm has no use for
# (GH_TOKEN, cloud keys). Kept, when set:
#   basics   PATH HOME USER LOGNAME SHELL TERM LANG LC_ALL LC_CTYPE TZ TMPDIR __CF_USER_TEXT_ENCODING
#   login    ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN ANTHROPIC_BASE_URL CLAUDE_CODE_OAUTH_TOKEN
#            CLAUDE_SESSION_INGRESS_TOKEN_FILE IS_SANDBOX (claude refuses --dangerously-skip-permissions as
#            root unless IS_SANDBOX=1, which a cloud container sets; on a normal account it is unset and dropped)
#   network  HTTPS_PROXY https_proxy HTTP_PROXY http_proxy NO_PROXY no_proxy NODE_EXTRA_CA_CERTS SSL_CERT_FILE
#            SSL_CERT_DIR REQUESTS_CA_BUNDLE CURL_CA_BUNDLE PIP_CERT npm_config_https_proxy npm_config_proxy
#            npm_config_noproxy npm_config_cafile
#   harness  H2H_CODE_DIR H2H_OURS_TARBALL (run-one.sh unsets both for every arm but ours)
# H2H_ENV_KEEP: colon separated names of further variables to keep on a machine that needs them.
scrub_env() {
  local v keep
  keep="PATH HOME USER LOGNAME SHELL TERM LANG LC_ALL LC_CTYPE TZ TMPDIR __CF_USER_TEXT_ENCODING"
  keep="$keep ANTHROPIC_API_KEY ANTHROPIC_AUTH_TOKEN ANTHROPIC_BASE_URL CLAUDE_CODE_OAUTH_TOKEN CLAUDE_SESSION_INGRESS_TOKEN_FILE IS_SANDBOX"
  keep="$keep HTTPS_PROXY https_proxy HTTP_PROXY http_proxy NO_PROXY no_proxy NODE_EXTRA_CA_CERTS SSL_CERT_FILE SSL_CERT_DIR"
  keep="$keep REQUESTS_CA_BUNDLE CURL_CA_BUNDLE PIP_CERT npm_config_https_proxy npm_config_proxy npm_config_noproxy npm_config_cafile"
  keep="$keep H2H_CODE_DIR H2H_OURS_TARBALL $(printf '%s' "${H2H_ENV_KEEP:-}" | tr ':' ' ')"
  ENV_CMD=(env -i)
  for v in $keep; do
    case "$v" in *[!A-Za-z0-9_]*|[0-9]*) continue ;; esac
    [ -n "${!v+x}" ] && ENV_CMD+=("$v=${!v}")
  done
}
