// Runs the prose checker (scripts/tells.py) over README.md and the English docs.
// Two-letter folders under docs/ (de, fr, ...) are skipped: the checker only
// knows English, and its dash rule would flag normal German and French typography.
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function collect(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!/^[a-z]{2}$/.test(entry.name)) out.push(...collect(full));
    } else if (entry.name.endsWith('.md')) {
      out.push(full);
    }
  }
  return out;
}

const files = ['README.md', ...collect('docs').sort()];
const script = path.join(__dirname, 'tells.py');
for (const py of ['python3', 'python']) {
  const r = spawnSync(py, [script, ...files], { stdio: 'inherit' });
  if (r.error && r.error.code === 'ENOENT') continue;
  process.exit(r.status ?? 1);
}
console.error('lint:prose needs Python 3.9 or later on the PATH');
process.exit(1);
