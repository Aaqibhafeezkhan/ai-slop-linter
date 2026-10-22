// Fails when a Markdown file under docs/ contains a known AI-writing tell.
// Plain Node, no network, no dependencies.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const TELLS = [
  "testament",
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

let found = 0;
for (const file of markdownFiles("docs")) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
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
