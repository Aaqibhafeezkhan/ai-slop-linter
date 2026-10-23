// Runs the everwrite checker (scripts/tells.py) on the README and the docs.
// The checker's rules are English, so folders of other languages are skipped.
const { readdirSync, statSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');

const SKIP = new Set(['docs/de', 'docs/fr']);

function collect(dir, out) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (SKIP.has(p)) continue;
    if (statSync(p).isDirectory()) collect(p, out);
    else if (p.endsWith('.md')) out.push(p);
  }
  return out;
}

const files = ['README.md', 'CHANGELOG.md', ...collect('docs', [])];
for (const py of ['python3', 'python']) {
  const r = spawnSync(py, [join(__dirname, 'tells.py'), ...files], { stdio: 'inherit' });
  if (!r.error) process.exit(r.status === null ? 1 : r.status);
}
console.error('lint:prose needs Python 3.9 or later');
process.exit(1);
