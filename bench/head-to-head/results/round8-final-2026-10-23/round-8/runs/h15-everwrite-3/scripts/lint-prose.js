// Fails when README.md or a page under docs/ contains text that reads as AI-written.
// Runs the vendored everwrite checker (scripts/vendor/tells.py, MIT, needs Python 3.9+).
const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const checker = path.join(__dirname, 'vendor', 'tells.py');

// The checker's rules are English. Dashes are normal punctuation in these
// translations (German quotations, French dialogue), so they skip that rule.
const dashesAllowed = ['docs/de', 'docs/fr'];

function markdownIn(dir) {
  return fs.readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && e.name.endsWith('.md'))
    .map((e) => path.relative(root, path.join(e.parentPath, e.name)).split(path.sep).join('/'))
    .sort();
}

const files = ['README.md', ...markdownIn(path.join(root, 'docs'))];
const isTranslation = (f) => dashesAllowed.some((d) => f.startsWith(d + '/'));
const groups = [
  { args: [], files: files.filter((f) => !isTranslation(f)) },
  { args: ['--allow-dashes'], files: files.filter(isTranslation) },
];

let python = null;
for (const name of ['python3', 'python']) {
  if (spawnSync(name, ['--version']).status === 0) { python = name; break; }
}
if (!python) {
  console.error('lint:prose needs Python 3.9 or later (python3 or python on PATH).');
  process.exit(2);
}

let failed = false;
for (const g of groups) {
  if (!g.files.length) continue;
  const r = spawnSync(python, ['-I', checker, ...g.args, ...g.files], { cwd: root, stdio: 'inherit' });
  if (r.status !== 0) failed = true;
}
process.exit(failed ? 1 : 0);
