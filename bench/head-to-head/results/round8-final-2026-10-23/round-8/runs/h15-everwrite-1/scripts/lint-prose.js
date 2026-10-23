// Runs scripts/tells.py over README.md and every Markdown file under docs/.
// The checker's rules are English. Folders named after another language
// (docs/de, docs/fr) are skipped because dashes and „…“ quotes are normal there.
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const skip = new Set(["de", "fr"]);

function collect(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (dir === path.join(root, "docs") && skip.has(entry.name)) continue;
      collect(full, out);
    } else if (entry.name.endsWith(".md")) {
      out.push(full);
    }
  }
  return out;
}

const files = [path.join(root, "README.md"), ...collect(path.join(root, "docs"), [])];
const script = path.join(__dirname, "tells.py");

for (const py of ["python3", "python"]) {
  const r = spawnSync(py, [script, ...files], { stdio: "inherit", cwd: root });
  if (r.error && r.error.code === "ENOENT") continue;
  process.exit(r.status ?? 2);
}
console.error("lint:prose needs Python 3.9 or later (python3 or python on PATH).");
process.exit(2);
