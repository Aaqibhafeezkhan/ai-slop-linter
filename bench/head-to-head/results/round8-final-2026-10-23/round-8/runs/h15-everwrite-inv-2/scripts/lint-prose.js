// Runs the everwrite checker (scripts/tells.py) over the English docs.
// docs/de and docs/fr are skipped: the checker's rules are English-only,
// and dashes and quote marks are normal punctuation in those languages.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const SKIP = new Set([path.join("docs", "de"), path.join("docs", "fr")]);

function markdown(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) return SKIP.has(p) ? [] : markdown(p);
    return e.name.endsWith(".md") ? [p] : [];
  });
}

const files = ["README.md", ...markdown("docs").sort()];
const script = path.join(__dirname, "tells.py");

for (const py of ["python3", "python"]) {
  const r = spawnSync(py, [script, ...files], { stdio: "inherit" });
  if (r.error && r.error.code === "ENOENT") continue;
  process.exit(r.status === null ? 1 : r.status);
}
console.error("lint:prose needs Python 3.9 or later (python3 or python on PATH).");
process.exit(1);
