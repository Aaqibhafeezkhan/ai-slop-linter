// Fails when README.md or a Markdown file under docs/ contains a known AI-writing tell in prose.
// Fenced code blocks and blockquotes (quoted examples) are skipped. Plain Node, no network, no dependencies.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const TELLS = [
  "testament to",
  "delves",
  "seamless",
  "robust",
  "game-changer",
  "let me know",
  "fast-paced",
  "pivotal",
  "leverage",
  "not just",
  "commitment to",
  "future of",
  "i hope this helps",
  "in today's",
];

function markdownFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return markdownFiles(path);
    return name.endsWith(".md") ? [path] : [];
  });
}

const files = [...(existsSync("README.md") ? ["README.md"] : []), ...(existsSync("docs") ? markdownFiles("docs") : [])];
let found = 0;
for (const file of files) {
  let inFence = false;
  readFileSync(file, "utf8").split("\n").forEach((line, i) => {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      return;
    }
    if (inFence || /^\s*>/.test(line)) return;
    const lower = line.toLowerCase();
    for (const tell of TELLS) {
      if (lower.includes(tell)) {
        console.error(`${file}:${i + 1}: "${tell}"`);
        found += 1;
      }
    }
  });
}

if (found > 0) {
  console.error(`${found} AI-writing tell(s) found`);
  process.exit(1);
}
